import { NextRequest, NextResponse } from "next/server";
import { HttpError, handleRouteError } from "@/lib/api";
import { requireStaff } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireStaff(["ADMIN"]);
    const { id } = await context.params;
    const key = await prisma.licenseKey.findUnique({ where: { id }, select: { status: true } });
    if (!key) throw new HttpError(404, "Licencia no encontrada.", "NOT_FOUND");
    if (key.status !== "AVAILABLE") {
      throw new HttpError(409, "No se puede eliminar una licencia asignada o entregada.", "LICENSE_IN_USE");
    }
    await prisma.licenseKey.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
