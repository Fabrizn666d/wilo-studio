import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, HttpError } from "@/lib/api";
import { requireStaff } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ resource: string }> };
const commercialRoles = ["SUPER_ADMIN", "ADMIN", "COMMERCIAL"] as const;

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { resource } = await context.params;
    const query = request.nextUrl.searchParams.get("q")?.trim().slice(0, 100) || "";

    if (resource === "clients") {
      await requireStaff();
      const data = await prisma.client.findMany({
        where: { archivedAt: null, active: true, ...(query ? { name: { contains: query } } : {}) },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
        take: 200,
      });
      return NextResponse.json({ ok: true, data });
    }

    if (resource === "staff") {
      await requireStaff();
      const data = await prisma.user.findMany({
        where: { active: true, ...(query ? { OR: [{ name: { contains: query } }, { email: { contains: query } }] } : {}) },
        select: { id: true, name: true, email: true, role: true },
        orderBy: [{ name: "asc" }, { email: "asc" }],
        take: 200,
      });
      return NextResponse.json({ ok: true, data: data.map((user) => ({ ...user, name: user.name || user.email })) });
    }

    if (resource === "leads") {
      await requireStaff(commercialRoles);
      const data = await prisma.lead.findMany({
        where: { archivedAt: null, ...(query ? { OR: [{ name: { contains: query } }, { company: { contains: query } }] } : {}) },
        select: { id: true, name: true, company: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
      return NextResponse.json({ ok: true, data });
    }

    if (resource === "projects") {
      const user = await requireStaff(commercialRoles);
      const data = await prisma.project.findMany({
        where: {
          archivedAt: null,
          ...(user.role === "COMMERCIAL" ? { assignedToId: user.id } : {}),
          ...(query ? { title: { contains: query } } : {}),
        },
        select: { id: true, title: true },
        orderBy: { title: "asc" },
        take: 200,
      });
      return NextResponse.json({ ok: true, data });
    }

    if (resource === "productCategories") {
      await requireStaff(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
      const data = await prisma.productCategory.findMany({
        where: { active: true, ...(query ? { name: { contains: query } } : {}) },
        select: { id: true, name: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        take: 200,
      });
      return NextResponse.json({ ok: true, data });
    }

    throw new HttpError(404, "Opciones no encontradas.", "OPTIONS_NOT_FOUND");
  } catch (error) {
    return handleRouteError(error);
  }
}
