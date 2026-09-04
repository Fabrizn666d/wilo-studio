import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category")?.slice(0, 80);
    const plans = await prisma.plan.findMany({
      where: { published: true, ...(category ? { category } : {}) },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({
      ok: true,
      plans: plans.map((plan) => {
        let features: unknown[] = [];
        try {
          const parsed: unknown = JSON.parse(plan.features);
          if (Array.isArray(parsed)) features = parsed;
        } catch {}
        return { ...plan, features };
      }),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
