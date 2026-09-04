import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { requireStaff } from "@/lib/auth-guard";
import { deliverOrder } from "@/lib/order-delivery";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    await requireStaff(["ADMIN"]);
    const { id } = await context.params;
    const result = await deliverOrder(id, { confirmPhysical: true, resend: true });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return handleRouteError(error);
  }
}
