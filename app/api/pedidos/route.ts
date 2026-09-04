import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { HttpError, handleRouteError, rateLimitError, readJsonBody } from "@/lib/api";
import { hashPublicToken } from "@/lib/crypto";
import { sendOrderConfirmation } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { createMercadoPagoPreference } from "@/lib/payments";
import { nextReservationExpiration, releaseExpiredReservations, releaseOrderReservation, reserveOrderInventory } from "@/lib/order-payment";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { orderSchema } from "@/lib/validation";

export const runtime = "nodejs";

function orderNumber() {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `WS-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function normalizeBody(body: unknown) {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const rawItems = (input.items ?? input.productos ?? []) as unknown[];
  const rawDocumentType = String(input.documentType ?? input.tipo_comprobante ?? "").toUpperCase();
  const rawPaymentMethod = String(input.paymentMethod ?? input.metodo_pago ?? "").toUpperCase();
  const paymentMethod = ["YAPE", "PLIN", "TRANSFERENCIA", "TRANSFER", "BANK_TRANSFER"].includes(rawPaymentMethod)
    ? "MANUAL"
    : rawPaymentMethod;
  return {
    customerName: input.customerName ?? input.nombre,
    email: input.email ?? input.correo,
    phone: input.phone ?? input.telefono,
    documentType: rawDocumentType,
    documentNumber: input.documentNumber ?? input.numero_documento,
    companyName: input.companyName ?? input.razon_social,
    companyRuc: input.companyRuc ?? input.ruc,
    paymentMethod,
    notes: input.notes ?? input.notas,
    expectedTotalCents: input.expectedTotalCents ?? input.total_esperado_centavos,
    items: rawItems.map((item) => {
      const record = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      return { productId: record.productId ?? record.producto_id, quantity: record.quantity ?? record.cantidad };
    }),
    website: input.website ?? input.sitio_web ?? "",
  };
}

export async function POST(request: NextRequest) {
  try {
    await releaseExpiredReservations();
    const rate = consumeRateLimit(`orders:${getClientIp(request)}`, 5, 30 * 60_000);
    if (!rate.allowed) return rateLimitError(rate);
    const normalized = normalizeBody(await readJsonBody(request));
    if (normalized.website) return NextResponse.json({ ok: true }, { status: 202 });
    const input = orderSchema.parse(normalized);

    if (
      input.paymentMethod === "ONLINE" &&
      (!process.env.MP_ACCESS_TOKEN || !process.env.MP_WEBHOOK_SECRET || !(process.env.SITE_URL || process.env.NEXTAUTH_URL))
    ) {
      throw new HttpError(
        503,
        "El pago online aún no está configurado. Elige Yape, Plin, transferencia o WhatsApp.",
        "PAYMENT_PROVIDER_UNAVAILABLE",
      );
    }

    const quantities = new Map<string, number>();
    for (const item of input.items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
    const ids = [...quantities.keys()];
    const products = await prisma.product.findMany({ where: { id: { in: ids }, active: true, category: { active: true } } });
    if (products.length !== ids.length) {
      throw new HttpError(422, "Uno o más productos ya no están disponibles.", "PRODUCT_UNAVAILABLE");
    }

    const pricedItems = products.map((product) => {
      const quantity = quantities.get(product.id) || 0;
      if (product.stock !== null && product.stock < quantity) {
        throw new HttpError(409, `No hay stock suficiente para ${product.name}.`, "INSUFFICIENT_STOCK");
      }
      const unitTaxCents = product.includesTax
        ? Math.round(product.priceCents - product.priceCents / 1.18)
        : Math.round(product.priceCents * 0.18);
      const unitTotalCents = product.includesTax ? product.priceCents : product.priceCents + unitTaxCents;
      return { product, quantity, unitTaxCents, unitTotalCents };
    });
    const taxCents = pricedItems.reduce((sum, item) => sum + item.unitTaxCents * item.quantity, 0);
    const totalCents = pricedItems.reduce((sum, item) => sum + item.unitTotalCents * item.quantity, 0);
    const subtotalCents = totalCents - taxCents;
    if (input.expectedTotalCents !== totalCents) {
      throw new HttpError(
        409,
        "El precio cambió desde que agregaste el producto. Actualiza el carrito antes de continuar.",
        "PRICE_CHANGED",
      );
    }
    const token = randomBytes(32).toString("base64url");
    const number = orderNumber();

    const order = await prisma.order.create({
        data: {
          number,
          customerName: input.customerName,
          email: input.email,
          phone: input.phone,
          documentType: input.documentType,
          documentNumber: input.documentNumber,
          companyName: input.companyName,
          companyRuc: input.companyRuc,
          paymentMethod: input.paymentMethod,
          subtotalCents,
          taxCents,
          totalCents,
          notes: input.notes,
          publicTokenHash: hashPublicToken(token),
          items: {
            create: pricedItems.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              sku: item.product.sku,
              unitPriceCents: item.unitTotalCents,
              quantity: item.quantity,
              totalCents: item.unitTotalCents * item.quantity,
            })),
          },
        },
        select: {
          id: true,
          number: true,
          status: true,
          currency: true,
          subtotalCents: true,
          taxCents: true,
          totalCents: true,
          customerName: true,
          email: true,
          createdAt: true,
        },
    });

    let payment: { provider: "MERCADO_PAGO"; reference: string; checkoutUrl: string } | null = null;
    if (input.paymentMethod === "ONLINE") {
      const reservationExpiresAt = nextReservationExpiration();
      try {
        await reserveOrderInventory(order.id, reservationExpiresAt);
        payment = await createMercadoPagoPreference({
          orderNumber: order.number,
          customerName: order.customerName,
          email: order.email,
          expiresAt: reservationExpiresAt,
          items: pricedItems.map((item) => ({
            id: item.product.id,
            title: item.product.name,
            quantity: item.quantity,
            unitPriceCents: item.unitTotalCents,
            currency: item.product.currency,
          })),
        });
        await prisma.order.update({ where: { id: order.id }, data: { paymentReference: payment.reference } });
      } catch (error) {
        const released = await releaseOrderReservation(order.id);
        if (!released) await prisma.order.updateMany({ where: { id: order.id, status: "PENDING" }, data: { status: "CANCELLED" } });
        throw error;
      }
    }
    await sendOrderConfirmation(order);
    return NextResponse.json(
      {
        ok: true,
        order: {
          number: order.number,
          status: order.status,
          currency: order.currency,
          subtotalCents: order.subtotalCents,
          taxCents: order.taxCents,
          totalCents: order.totalCents,
          createdAt: order.createdAt,
        },
        voucherAccessToken: input.paymentMethod === "MANUAL" ? token : undefined,
        orderAccessToken: token,
        payment,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
