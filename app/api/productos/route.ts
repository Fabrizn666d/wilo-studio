import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { releaseExpiredReservations } from "@/lib/order-payment";

export const runtime = "nodejs";

function parseArray(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    await releaseExpiredReservations();
    const category = request.nextUrl.searchParams.get("category")?.slice(0, 120);
    const search = request.nextUrl.searchParams.get("q")?.trim().slice(0, 100);
    const products = await prisma.product.findMany({
      where: {
        active: true,
        category: { active: true, ...(category ? { slug: category } : {}) },
        ...(search ? { OR: [{ name: { contains: search } }, { description: { contains: search } }] } : {}),
      },
      include: { category: { select: { slug: true, name: true } } },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });
    return NextResponse.json({
      ok: true,
      products: products.map((product) => ({
        ...product,
        images: parseArray(product.images),
        specifications: parseArray(product.specifications),
      })),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
