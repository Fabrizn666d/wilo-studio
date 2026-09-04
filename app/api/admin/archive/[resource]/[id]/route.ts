import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, HttpError } from "@/lib/api";
import { requireStaff } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { recordActivity } from "@/lib/wilo-os/activity";
import { archiveQuote, restoreQuote } from "@/lib/wilo-os/quotes";
import { revalidatePublicContent } from "@/lib/revalidate-public-content";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ resource: string; id: string }> };
const managementRoles = ["SUPER_ADMIN", "ADMIN"] as const;

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireStaff(managementRoles);
    const { resource, id } = await context.params;
    const restore = request.nextUrl.searchParams.get("restore") === "true";

    if (resource === "quotes") {
      const record = restore
        ? await restoreQuote(id, { actorUserId: user.id })
        : await archiveQuote(id, { actorUserId: user.id });
      return NextResponse.json({ ok: true, data: record });
    }

    if (!["leads", "clients", "projects"].includes(resource)) {
      throw new HttpError(404, "Módulo archivable no encontrado.", "RESOURCE_NOT_FOUND");
    }

    const archivedAt = restore ? null : new Date();
    const result = await prisma.$transaction(async (transaction) => {
      const record = resource === "leads"
        ? await transaction.lead.update({ where: { id }, data: { archivedAt }, select: { id: true } })
        : resource === "clients"
          ? await transaction.client.update({ where: { id }, data: { archivedAt }, select: { id: true } })
          : await transaction.project.update({ where: { id }, data: { archivedAt }, select: { id: true, slug: true } });
      const entityType = resource.slice(0, -1).toUpperCase();
      await recordActivity(transaction, {
        actorUserId: user.id,
        entityType,
        entityId: record.id,
        action: restore ? `${entityType}_RESTORED` : `${entityType}_ARCHIVED`,
      });
      return record;
    });

    revalidatePublicContent(resource, ["slug" in result && typeof result.slug === "string" ? result.slug : null]);
    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    return handleRouteError(error);
  }
}
