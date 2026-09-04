import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, HttpError, readJsonBody } from "@/lib/api";
import { requireAdminResource } from "@/lib/auth-guard";
import { canReadAdminRecord } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { recordActivity } from "@/lib/wilo-os/activity";

export const runtime = "nodejs";

const entityTypeSchema = z.enum(["LEAD", "CLIENT", "PROJECT", "QUOTE"]);
const entityIdSchema = z.string().cuid();
const createNoteSchema = z.object({
  entityType: entityTypeSchema,
  entityId: entityIdSchema,
  body: z.string().trim().min(1).max(5_000),
}).strict();

async function assertEntityAccess(entityType: z.infer<typeof entityTypeSchema>, entityId: string, user: { id: string; role: "SUPER_ADMIN" | "ADMIN" | "COMMERCIAL" | "EDITOR" }) {
  const resource = entityType.toLowerCase() === "client" ? "clients" : `${entityType.toLowerCase()}s`;
  const record = entityType === "LEAD"
    ? await prisma.lead.findUnique({ where: { id: entityId }, select: { id: true } })
    : entityType === "CLIENT"
      ? await prisma.client.findUnique({ where: { id: entityId }, select: { id: true } })
      : entityType === "PROJECT"
        ? await prisma.project.findUnique({ where: { id: entityId }, select: { id: true, assignedToId: true } })
        : await prisma.quote.findUnique({ where: { id: entityId }, select: { id: true } });
  if (!record || !canReadAdminRecord(user.role, resource, user.id, record)) {
    throw new HttpError(404, "Registro no encontrado.", "NOT_FOUND");
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdminResource("notes", "read");
    const entityType = entityTypeSchema.parse(request.nextUrl.searchParams.get("entityType"));
    const entityId = entityIdSchema.parse(request.nextUrl.searchParams.get("entityId"));
    await assertEntityAccess(entityType, entityId, user);
    const [data, activity] = await Promise.all([
      prisma.note.findMany({
        where: { entityType, entityId },
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.activity.findMany({
        where: { entityType, entityId },
        include: { actor: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);
    return NextResponse.json({ ok: true, data, activity });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminResource("notes", "create");
    const input = createNoteSchema.parse(await readJsonBody(request, 10_000));
    await assertEntityAccess(input.entityType, input.entityId, user);
    const note = await prisma.$transaction(async (transaction) => {
      const created = await transaction.note.create({
        data: { ...input, authorId: user.id },
        include: { author: { select: { id: true, name: true, email: true } } },
      });
      await recordActivity(transaction, {
        actorUserId: user.id,
        entityType: input.entityType,
        entityId: input.entityId,
        action: "NOTE_CREATED",
        metadata: { noteId: created.id },
      });
      return created;
    });
    return NextResponse.json({ ok: true, data: note }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
