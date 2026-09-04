import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function parseJsonArray(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const now = new Date();
    const promotions = await prisma.promotion.findMany({
      where: {
        active: true,
        AND: [{ OR: [{ startAt: null }, { startAt: { lte: now } }] }, { OR: [{ endAt: null }, { endAt: { gte: now } }] }],
      },
      orderBy: [{ featured: "desc" }, { startAt: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(
      { ok: true, promotions: promotions.map((promotion) => ({ ...promotion, details: parseJsonArray(promotion.details) })) },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
