import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, readJsonBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { calculatePromotion } from "@/lib/store-promotions";

export const runtime = "nodejs";

const couponRequestSchema = z.object({
  code: z.string().trim().min(3).max(40),
  items: z.array(z.object({ productId: z.string().cuid(), quantity: z.number().int().min(1).max(20) })).min(1).max(30),
}).strict();

export async function POST(request: NextRequest) {
  try {
    const rate = consumeRateLimit(`coupon:${getClientIp(request)}`, 20, 10 * 60_000);
    if (!rate.allowed) return NextResponse.json({ ok: false, error: "Demasiados intentos. Inténtalo nuevamente en unos minutos." }, { status: 429 });
    const input = couponRequestSchema.parse(await readJsonBody(request));
    const quantities = new Map<string, number>();
    input.items.forEach((item) => quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity));
    const products = await prisma.product.findMany({
      where: { id: { in: [...quantities.keys()] }, active: true, category: { active: true } },
      include: { category: { select: { slug: true } } },
    });
    if (products.length !== quantities.size) return NextResponse.json({ ok: false, error: "Actualiza el carrito antes de aplicar el cupón." }, { status: 409 });
    const promotion = await calculatePromotion(input.code, products.map((product) => {
      const quantity = quantities.get(product.id) || 0;
      const tax = product.includesTax ? 0 : Math.round(product.priceCents * .18);
      return { productId: product.id, categorySlug: product.category.slug, totalCents: (product.priceCents + tax) * quantity };
    }));
    return NextResponse.json({ ok: true, promotion });
  } catch (error) {
    return handleRouteError(error);
  }
}
