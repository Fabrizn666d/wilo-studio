import { after, NextRequest, NextResponse } from "next/server";
import { HttpError, handleRouteError, readJsonBody } from "@/lib/api";
import { getMercadoPagoPayment, verifyMercadoPagoSignature } from "@/lib/payments";
import { deliverOrder } from "@/lib/order-delivery";
import { confirmOrderPayment, releaseOrderReservation } from "@/lib/order-payment";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await readJsonBody(request, 50_000)) as { type?: unknown; data?: { id?: unknown } };
    if (body.type !== "payment") return NextResponse.json({ ok: true, ignored: true });
    const dataId = String(request.nextUrl.searchParams.get("data.id") || body.data?.id || "");
    if (!dataId) throw new HttpError(400, "Notificación incompleta.", "INVALID_WEBHOOK");
    const valid = verifyMercadoPagoSignature({
      signature: request.headers.get("x-signature"),
      requestId: request.headers.get("x-request-id"),
      dataId,
    });
    if (!valid) throw new HttpError(401, "Firma de webhook inválida.", "INVALID_WEBHOOK_SIGNATURE");

    const payment = await getMercadoPagoPayment(dataId);
    if (!payment.external_reference) return NextResponse.json({ ok: true, ignored: true });
    const order = await prisma.order.findUnique({ where: { number: payment.external_reference }, include: { items: true } });
    if (!order) return NextResponse.json({ ok: true, ignored: true });
    const paidCents = Math.round(payment.transaction_amount * 100);
    if (paidCents !== order.totalCents || payment.currency_id !== order.currency) {
      throw new HttpError(409, "El importe del pago no coincide con el pedido.", "PAYMENT_AMOUNT_MISMATCH");
    }

    const status = payment.status;
    if (status === "approved") {
      if (["CANCELLED", "REFUNDED"].includes(order.status)) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentReference: String(payment.id),
            notes: `${order.notes ? `${order.notes}\n` : ""}[ALERTA] Mercado Pago confirmó un pago cuando el pedido ya estaba ${order.status}. Revisión manual requerida.`,
          },
        });
        return NextResponse.json({ ok: true, reviewRequired: true });
      }
      try {
        await confirmOrderPayment(order.id, {
          paidAt: order.paidAt || new Date(),
          paymentReference: String(payment.id),
        });
      } catch (confirmationError) {
        console.error("Paid order requires manual inventory review", { orderNumber: order.number, confirmationError });
        const current = await prisma.order.findUnique({ where: { id: order.id } });
        if (current) {
          await prisma.order.updateMany({
            where: { id: current.id, status: current.status },
            data: {
              ...(["PENDING", "VERIFYING"].includes(current.status) ? { status: "VERIFYING" } : {}),
              paymentReference: String(payment.id),
              notes: `${current.notes ? `${current.notes}\n` : ""}[ALERTA] Pago online confirmado, pero no se pudo asegurar el inventario. Revisión manual urgente; no entregar ni reembolsar sin conciliar el pago.`,
            },
          });
        }
        return NextResponse.json({ ok: true, reviewRequired: true });
      }
      after(async () => {
        try {
          await deliverOrder(order.id, { confirmPhysical: false, resend: false });
        } catch (deliveryError) {
          console.error("Automatic digital delivery pending", { orderNumber: order.number, deliveryError });
        }
      });
    } else if (["refunded", "charged_back"].includes(status)) {
      const current = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true } });
      if (!current) return NextResponse.json({ ok: true, ignored: true });
      if (current.status === "DELIVERING") {
        await prisma.order.updateMany({
          where: { id: current.id, status: "DELIVERING" },
          data: {
            paymentReference: String(payment.id),
            notes: `${current.notes ? `${current.notes}\n` : ""}[ALERTA] Se recibió un reembolso mientras la entrega estaba en curso. Revisión manual requerida.`,
          },
        });
        return NextResponse.json({ ok: true, reviewRequired: true });
      }
      if (current.stockReserved) {
        const released = await releaseOrderReservation(current.id, "REFUNDED");
        if (!released) throw new HttpError(409, "La reserva cambió durante el reembolso.", "REFUND_RACE");
        await prisma.order.update({ where: { id: current.id }, data: { paymentReference: String(payment.id) } });
      } else if (["CANCELLED", "REFUNDED"].includes(current.status)) {
        await prisma.order.update({ where: { id: current.id }, data: { paymentReference: String(payment.id) } });
      } else {
        await prisma.$transaction(async (transaction) => {
          const transition = await transaction.order.updateMany({
            where: { id: current.id, status: current.status, stockReserved: false },
            data: { status: "REFUNDED", paymentReference: String(payment.id) },
          });
          if (transition.count !== 1) throw new HttpError(409, "El pedido cambió durante el reembolso.", "REFUND_RACE");
          if (current.status === "PAID") {
            for (const item of current.items) {
              if (!item.productId) continue;
              await transaction.product.updateMany({
                where: { id: item.productId, stock: { not: null } },
                data: { stock: { increment: item.quantity } },
              });
            }
            await transaction.licenseKey.updateMany({
              where: { orderItem: { orderId: current.id }, status: "ASSIGNED" },
              data: { status: "AVAILABLE", orderItemId: null },
            });
          }
        });
      }
    } else if (["cancelled", "rejected"].includes(status)) {
      const current = await prisma.order.findUnique({ where: { id: order.id } });
      if (current?.stockReserved) {
        const released = await releaseOrderReservation(current.id, "CANCELLED");
        if (!released) throw new HttpError(409, "La reserva cambió durante la cancelación.", "CANCELLATION_RACE");
        await prisma.order.update({ where: { id: current.id }, data: { paymentReference: String(payment.id) } });
      } else if (current && ["PENDING", "VERIFYING"].includes(current.status)) {
        await prisma.order.updateMany({
          where: { id: current.id, status: current.status, stockReserved: false },
          data: { status: "CANCELLED", paymentReference: String(payment.id) },
        });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
