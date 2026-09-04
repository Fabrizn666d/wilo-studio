import { HttpError } from "@/lib/api";
import { decryptSecret } from "@/lib/crypto";
import { isSmtpConfigured, sendLicenseDelivery } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function deliverOrder(
  id: string,
  options: { confirmPhysical: boolean; resend: boolean },
) {
  const newlyAssigned: Array<{ ids: string[]; orderItemId: string }> = [];
  let emailAttempted = false;
  let orderClaimed = false;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, digital: true } },
            licenseKeys: true,
          },
        },
      },
    });
    if (!order) throw new HttpError(404, "Pedido no encontrado.", "NOT_FOUND");
    if (order.status === "DELIVERED" && !options.resend) {
      return { deliveredAt: order.deliveredAt, alreadyDelivered: true };
    }
    if (!["PAID", "DELIVERING", "DELIVERED"].includes(order.status)) {
      throw new HttpError(409, "Solo se entregan pedidos pagados.", "ORDER_NOT_PAID");
    }
    const hasPhysicalItems = order.items.some((item) => !item.product?.digital);
    if (hasPhysicalItems && !options.confirmPhysical) {
      return { deliveredAt: null, physicalFulfillmentRequired: true };
    }
    if (order.status === "PAID") {
      const claim = await prisma.order.updateMany({ where: { id, status: "PAID" }, data: { status: "DELIVERING" } });
      if (claim.count !== 1) {
        throw new HttpError(409, "Este pedido ya está siendo entregado.", "ORDER_DELIVERY_IN_PROGRESS");
      }
      orderClaimed = true;
    } else if (order.status === "DELIVERING") {
      const leaseExpired = Date.now() - order.updatedAt.getTime() > 10 * 60_000;
      if (!leaseExpired) {
        throw new HttpError(409, "Este pedido ya está siendo entregado. Reintenta en unos minutos si el proceso no termina.", "ORDER_DELIVERY_IN_PROGRESS");
      }
      const recovery = await prisma.order.updateMany({
        where: { id, status: "DELIVERING", updatedAt: order.updatedAt },
        data: { status: "DELIVERING" },
      });
      if (recovery.count !== 1) throw new HttpError(409, "Otro proceso reanudó esta entrega.", "ORDER_DELIVERY_IN_PROGRESS");
      orderClaimed = true;
    }
    const hasDigitalItems = order.items.some((item) => item.product?.digital);
    if (hasDigitalItems && !isSmtpConfigured()) {
      throw new HttpError(503, "Configura SMTP antes de entregar licencias.", "SMTP_NOT_CONFIGURED");
    }

    await prisma.$transaction(async (transaction) => {
      for (const item of order.items) {
        if (!item.product?.digital) continue;
        const missing = item.quantity - item.licenseKeys.length;
        if (missing <= 0) continue;
        const available = await transaction.licenseKey.findMany({
          where: { productId: item.product.id, status: "AVAILABLE", orderItemId: null },
          take: missing,
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });
        if (available.length !== missing) {
          throw new HttpError(409, `Faltan licencias disponibles para ${item.productName}.`, "INSUFFICIENT_LICENSE_KEYS");
        }
        const ids = available.map((key) => key.id);
        const assigned = await transaction.licenseKey.updateMany({
          where: { id: { in: ids }, status: "AVAILABLE", orderItemId: null },
          data: { status: "ASSIGNED", orderItemId: item.id },
        });
        if (assigned.count !== missing) {
          throw new HttpError(409, `Otra entrega tomó una licencia de ${item.productName}.`, "LICENSE_ASSIGNMENT_RACE");
        }
        newlyAssigned.push({ ids, orderItemId: item.id });
      }
    });

    const readyOrder = await prisma.order.findUniqueOrThrow({
      where: { id },
      include: { items: { include: { product: { select: { digital: true } }, licenseKeys: true } } },
    });
    if (readyOrder.items.some((item) => item.product?.digital && item.licenseKeys.length !== item.quantity)) {
      throw new HttpError(409, "El pedido tiene productos digitales sin licencia asignada.", "MISSING_LICENSE_KEYS");
    }
    const products = readyOrder.items
      .filter((item) => item.product?.digital)
      .map((item) => ({
        name: item.productName,
        keys: item.licenseKeys.map((key) => decryptSecret(key.encryptedValue, key.iv, key.authTag)),
      }));

    if (products.length) {
      emailAttempted = true;
      await sendLicenseDelivery({
        number: readyOrder.number,
        customerName: readyOrder.customerName,
        email: readyOrder.email,
        products,
      });
    }
    const deliveredAt = readyOrder.deliveredAt || new Date();
    await prisma.$transaction(async (transaction) => {
      await transaction.licenseKey.updateMany({
        where: { orderItem: { orderId: id } },
        data: { status: "DELIVERED", deliveredAt },
      });
      const orderUpdate = await transaction.order.updateMany({
        where: { id, status: orderClaimed ? "DELIVERING" : "DELIVERED" },
        data: { status: "DELIVERED", deliveredAt },
      });
      if (orderUpdate.count !== 1) {
        throw new HttpError(409, "El estado del pedido cambió durante la entrega.", "ORDER_STATUS_RACE");
      }
    });
    return { deliveredAt, alreadyDelivered: false };
  } catch (error) {
    if (!emailAttempted && newlyAssigned.length) {
      await prisma.$transaction(
        newlyAssigned.map((assignment) => prisma.licenseKey.updateMany({
          where: { id: { in: assignment.ids }, status: "ASSIGNED", orderItemId: assignment.orderItemId },
          data: { status: "AVAILABLE", orderItemId: null },
        })),
      ).catch((rollbackError) => console.error("Could not rollback license assignment", rollbackError));
    }
    if (orderClaimed) {
      await prisma.order
        .updateMany({ where: { id, status: "DELIVERING" }, data: { status: "PAID" } })
        .catch((rollbackError) => console.error("Could not release order delivery claim", rollbackError));
    }
    throw error;
  }
}
