import { NextRequest, NextResponse } from "next/server";
import { HttpError, handleRouteError, rateLimitError } from "@/lib/api";
import { publicTokenMatches } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ number: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const rate = consumeRateLimit(`order-status:${getClientIp(request)}`, 20, 15 * 60_000);
    if (!rate.allowed) return rateLimitError(rate);
    const { number } = await context.params;
    const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    const token = request.nextUrl.searchParams.get("token");
    if (!email || !token) throw new HttpError(400, "Faltan datos para consultar el pedido.", "INVALID_ORDER_ACCESS");
    const order = await prisma.order.findFirst({
      where: { number, email },
      select: {
        number: true,
        status: true,
        paymentMethod: true,
        currency: true,
        subtotalCents: true,
        taxCents: true,
        totalCents: true,
        publicTokenHash: true,
        createdAt: true,
        paidAt: true,
        deliveredAt: true,
        items: { select: { productName: true, sku: true, unitPriceCents: true, quantity: true, totalCents: true } },
      },
    });
    if (!order || !publicTokenMatches(token, order.publicTokenHash)) {
      throw new HttpError(404, "No encontramos el pedido.", "ORDER_NOT_FOUND");
    }
    const safeOrder = Object.fromEntries(Object.entries(order).filter(([key]) => key !== "publicTokenHash"));
    return NextResponse.json({ ok: true, order: safeOrder });
  } catch (error) {
    return handleRouteError(error);
  }
}
