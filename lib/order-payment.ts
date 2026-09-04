import { HttpError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const reservationDurationMs = 30 * 60_000;

export function nextReservationExpiration() {
  return new Date(Date.now() + reservationDurationMs);
}

export async function reserveOrderInventory(orderId: string, expiresAt: Date) {
  return prisma.$transaction(async (transaction) => {
    const order = await transaction.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true, licenseKeys: { select: { id: true } } } } },
    });
    if (!order || order.paymentMethod !== "ONLINE") throw new HttpError(404, "Pedido online no encontrado.", "ORDER_NOT_FOUND");
    const claim = await transaction.order.updateMany({
      where: { id: order.id, status: "PENDING", stockReserved: false },
      data: { status: "RESERVING" },
    });
    if (claim.count !== 1) throw new HttpError(409, "El pedido ya está reservando inventario.", "RESERVATION_RACE");
    for (const item of order.items) {
      const product = item.product;
      if (!product?.active) throw new HttpError(409, `${item.productName} ya no está disponible.`, "PRODUCT_UNAVAILABLE");
      if (product.stock !== null) {
        const stock = await transaction.product.updateMany({
          where: { id: product.id, active: true, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (stock.count !== 1) throw new HttpError(409, `No hay stock suficiente para ${item.productName}.`, "INSUFFICIENT_STOCK");
      }
      if (!product.digital || !product.licenseType) continue;
      const missing = item.quantity - item.licenseKeys.length;
      const available = await transaction.licenseKey.findMany({
        where: { productId: product.id, status: "AVAILABLE", orderItemId: null },
        orderBy: { createdAt: "asc" },
        take: missing,
        select: { id: true },
      });
      if (available.length !== missing) throw new HttpError(409, `Faltan licencias disponibles para ${item.productName}.`, "INSUFFICIENT_LICENSE_KEYS");
      const assignment = await transaction.licenseKey.updateMany({
        where: { id: { in: available.map((key) => key.id) }, status: "AVAILABLE", orderItemId: null },
        data: { status: "ASSIGNED", orderItemId: item.id },
      });
      if (assignment.count !== missing) throw new HttpError(409, `Otra compra tomó una licencia de ${item.productName}.`, "LICENSE_ASSIGNMENT_RACE");
    }
    return transaction.order.update({
      where: { id: order.id },
      data: { status: "PENDING", stockReserved: true, reservationExpiresAt: expiresAt },
    });
  });
}

export async function releaseOrderReservation(orderId: string, status = "CANCELLED") {
  return prisma.$transaction(async (transaction) => {
    const order = await transaction.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order?.stockReserved) return false;
    const release = await transaction.order.updateMany({
      where: { id: order.id, stockReserved: true, status: { in: ["PENDING", "VERIFYING"] } },
      data: { status, stockReserved: false, reservationExpiresAt: null },
    });
    if (release.count !== 1) return false;
    for (const item of order.items) {
      if (!item.productId) continue;
      await transaction.product.updateMany({
        where: { id: item.productId, stock: { not: null } },
        data: { stock: { increment: item.quantity } },
      });
    }
    await transaction.licenseKey.updateMany({
      where: { orderItem: { orderId: order.id }, status: "ASSIGNED" },
      data: { status: "AVAILABLE", orderItemId: null },
    });
    return true;
  });
}

export async function releaseExpiredReservations() {
  const expired = await prisma.order.findMany({
    where: { stockReserved: true, reservationExpiresAt: { lt: new Date() }, status: { in: ["PENDING", "VERIFYING"] } },
    select: { id: true },
    take: 50,
  });
  await Promise.all(expired.map((order) => releaseOrderReservation(order.id).catch(() => false)));
}

export async function confirmOrderPayment(
  orderId: string,
  input: { paymentReference?: string | null; paidAt?: Date; notes?: string | null } = {},
) {
  return prisma.$transaction(async (transaction) => {
    const order = await transaction.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, active: true, stock: true, digital: true, licenseType: true } },
            licenseKeys: { select: { id: true } },
          },
        },
      },
    });
    if (!order) throw new HttpError(404, "Pedido no encontrado.", "ORDER_NOT_FOUND");
    if (["CANCELLED", "REFUNDED"].includes(order.status)) {
      throw new HttpError(409, "El pedido ya está cancelado o reembolsado.", "ORDER_TERMINAL");
    }

    if (["PAID", "DELIVERING", "DELIVERED"].includes(order.status)) {
      return transaction.order.update({
        where: { id: order.id },
        data: {
          ...(input.paymentReference !== undefined ? { paymentReference: input.paymentReference } : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
          paidAt: order.paidAt || input.paidAt || new Date(),
        },
        include: { items: true },
      });
    }

    const claim = order.stockReserved
      ? await transaction.order.updateMany({
          where: {
            id: order.id,
            status: { in: ["PENDING", "VERIFYING"] },
            stockReserved: true,
          },
          data: { status: "PAYMENT_PROCESSING", stockReserved: false, reservationExpiresAt: null },
        })
      : await transaction.order.updateMany({
          where: { id: order.id, status: { in: ["PENDING", "VERIFYING"] }, stockReserved: false },
          data: { status: "PAYMENT_PROCESSING" },
        });
    if (claim.count !== 1) {
      throw new HttpError(409, "El estado del pedido cambió durante la confirmación.", "ORDER_PAYMENT_RACE");
    }

    for (const item of order.items) {
      const product = item.product;
      if (!product) throw new HttpError(409, `${item.productName} ya no está disponible.`, "PRODUCT_UNAVAILABLE");
      if (!order.stockReserved && product.stock !== null) {
        const stock = await transaction.product.updateMany({
          where: { id: product.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (stock.count !== 1) {
          throw new HttpError(409, `No hay stock suficiente para ${item.productName}.`, "INSUFFICIENT_STOCK");
        }
      }
      if (!product.digital || !product.licenseType) continue;
      const missing = item.quantity - item.licenseKeys.length;
      if (missing <= 0) continue;
      const available = await transaction.licenseKey.findMany({
        where: { productId: product.id, status: "AVAILABLE", orderItemId: null },
        orderBy: { createdAt: "asc" },
        take: missing,
        select: { id: true },
      });
      if (available.length !== missing) {
        throw new HttpError(409, `Faltan licencias disponibles para ${item.productName}.`, "INSUFFICIENT_LICENSE_KEYS");
      }
      const assignment = await transaction.licenseKey.updateMany({
        where: { id: { in: available.map((key) => key.id) }, status: "AVAILABLE", orderItemId: null },
        data: { status: "ASSIGNED", orderItemId: item.id },
      });
      if (assignment.count !== missing) {
        throw new HttpError(409, `Otra compra tomó una licencia de ${item.productName}.`, "LICENSE_ASSIGNMENT_RACE");
      }
    }

    return transaction.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt: input.paidAt || new Date(),
        ...(input.paymentReference !== undefined ? { paymentReference: input.paymentReference } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      },
      include: { items: true },
    });
  });
}
