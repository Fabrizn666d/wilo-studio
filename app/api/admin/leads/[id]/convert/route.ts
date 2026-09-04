import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, HttpError } from "@/lib/api";
import { requireAdminResource } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { recordActivity } from "@/lib/wilo-os/activity";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function slugBase(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) || "cliente";
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await requireAdminResource("leads", "update");
    await requireAdminResource("clients", "create");
    const { id } = await context.params;
    z.string().cuid().parse(id);

    const result = await prisma.$transaction(async (transaction) => {
      const lead = await transaction.lead.findUnique({ where: { id } });
      if (!lead || lead.archivedAt) throw new HttpError(404, "Lead no encontrado.", "LEAD_NOT_FOUND");
      if (lead.status !== "WON") throw new HttpError(409, "Solo un lead ganado puede convertirse en cliente.", "LEAD_NOT_WON");
      if (lead.clientId) throw new HttpError(409, "Este lead ya está vinculado a un cliente.", "LEAD_ALREADY_CONVERTED");

      const existing = await transaction.client.findFirst({
        where: {
          archivedAt: null,
          OR: [
            { email: lead.email },
            ...(lead.phone ? [{ phone: lead.phone }] : []),
          ],
        },
        orderBy: { createdAt: "asc" },
      });

      const client = existing ?? await transaction.client.create({
        data: {
          slug: `${slugBase(lead.company || lead.name)}-${randomUUID().slice(0, 8)}`,
          name: lead.company || lead.name,
          contactName: lead.name,
          email: lead.email,
          phone: lead.phone,
          whatsapp: lead.phone,
          source: ["STUDIO", "EVENTS", "EDUCATION", "EXPRESS", "MANUAL"].includes(lead.source) ? lead.source : "MANUAL",
        },
      });

      await transaction.lead.update({ where: { id: lead.id }, data: { clientId: client.id } });
      if (!existing) {
        await recordActivity(transaction, {
          actorUserId: user.id,
          entityType: "CLIENT",
          entityId: client.id,
          action: "CLIENT_CREATED_FROM_LEAD",
          metadata: { leadId: lead.id },
        });
      }
      await recordActivity(transaction, {
        actorUserId: user.id,
        entityType: "LEAD",
        entityId: lead.id,
        action: "LEAD_LINKED_TO_CLIENT",
        metadata: { clientId: client.id, reusedExistingClient: Boolean(existing) },
      });
      return { clientId: client.id, clientName: client.name, reusedExistingClient: Boolean(existing) };
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    return handleRouteError(error);
  }
}
