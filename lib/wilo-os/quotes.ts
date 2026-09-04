import type { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
import { HttpError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { recordActivity } from "@/lib/wilo-os/activity";

const MAX_DATABASE_INT = 2_147_483_647;
const MAX_QUOTE_ITEMS = 100;
const QUOTE_NUMBER_WIDTH = 4;

export const quoteStatuses = [
  "DRAFT",
  "SENT",
  "VIEWED",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
] as const;

export type QuoteStatus = (typeof quoteStatuses)[number];

const quoteTransitions: Record<QuoteStatus, readonly QuoteStatus[]> = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["VIEWED", "ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"],
  VIEWED: ["ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"],
  ACCEPTED: ["CANCELLED"],
  REJECTED: [],
  EXPIRED: [],
  CANCELLED: [],
};

const identifierSchema = z.string().trim().min(1).max(191);
const optionalRelationSchema = z
  .union([identifierSchema, z.literal(""), z.null()])
  .optional()
  .transform((value) => value || null);
const optionalDateSchema = z
  .union([z.date(), z.string().trim().min(1).pipe(z.coerce.date()), z.null()])
  .optional()
  .transform((value) => value ?? undefined);
const nullableDateSchema = z
  .union([z.date(), z.string().trim().min(1).pipe(z.coerce.date()), z.literal(""), z.null()])
  .optional()
  .transform((value) => value === "" ? null : value);
const optionalNotesSchema = z.union([z.string().trim().max(10_000), z.null()]).optional();

export const quoteLineItemSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    description: z.union([z.string().trim().max(2_000), z.null()]).optional(),
    quantity: z.number().int().min(1).max(100_000),
    unitPriceCents: z.number().int().nonnegative().max(MAX_DATABASE_INT),
  })
  .strict();

const quoteBaseSchema = z.object({
  clientId: identifierSchema,
  leadId: optionalRelationSchema,
  projectId: optionalRelationSchema,
  status: z.enum(quoteStatuses),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "Usa un código de moneda ISO de tres letras."),
  taxRateBps: z.number().int().min(0).max(10_000),
  issueDate: optionalDateSchema,
  expiresAt: nullableDateSchema,
  notes: optionalNotesSchema,
  items: z.array(quoteLineItemSchema).min(1).max(MAX_QUOTE_ITEMS),
});

function validateQuoteDates(
  input: { issueDate?: Date; expiresAt?: Date | null },
  context: z.RefinementCtx,
) {
  if (input.issueDate && input.expiresAt && input.expiresAt < input.issueDate) {
    context.addIssue({
      code: "custom",
      path: ["expiresAt"],
      message: "La fecha de vencimiento debe ser posterior a la fecha de emisión.",
    });
  }
}

export const createQuoteSchema = quoteBaseSchema
  .extend({
    status: z.literal("DRAFT").default("DRAFT"),
    currency: quoteBaseSchema.shape.currency.default("PEN"),
    taxRateBps: quoteBaseSchema.shape.taxRateBps.default(0),
  })
  .strict()
  .superRefine(validateQuoteDates);

export const updateQuoteSchema = quoteBaseSchema
  .partial()
  .strict()
  .superRefine((input, context) => {
    validateQuoteDates(input, context);
    if (Object.keys(input).length === 0) {
      context.addIssue({ code: "custom", message: "Incluye al menos un cambio para actualizar la cotización." });
    }
    if (input.items && input.taxRateBps === undefined) {
      context.addIssue({
        code: "custom",
        path: ["taxRateBps"],
        message: "Incluye la tasa de impuesto al reemplazar las partidas.",
      });
    }
  });

export type QuoteLineItemInput = z.infer<typeof quoteLineItemSchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;

export type CalculatedQuoteItem = QuoteLineItemInput & {
  description: string | null;
  subtotalCents: number;
  position: number;
};

export type QuoteTotals = {
  items: CalculatedQuoteItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
};

function assertDatabaseInt(value: number, field: string) {
  if (!Number.isSafeInteger(value) || value > MAX_DATABASE_INT) {
    throw new HttpError(422, `${field} supera el importe máximo permitido.`, "QUOTE_AMOUNT_TOO_LARGE");
  }
}

/** Pure, deterministic calculation used by every quote write path. */
export function calculateQuoteTotals(items: QuoteLineItemInput[], taxRateBps = 0): QuoteTotals {
  const parsedItems = z.array(quoteLineItemSchema).min(1).max(MAX_QUOTE_ITEMS).parse(items);
  const parsedTaxRate = z.number().int().min(0).max(10_000).parse(taxRateBps);
  let subtotalCents = 0;

  const calculatedItems = parsedItems.map((item, position) => {
    const subtotal = item.quantity * item.unitPriceCents;
    assertDatabaseInt(subtotal, `La partida ${position + 1}`);
    subtotalCents += subtotal;
    assertDatabaseInt(subtotalCents, "El subtotal");
    return {
      ...item,
      description: item.description?.trim() || null,
      subtotalCents: subtotal,
      position,
    };
  });

  const taxCents = Math.round((subtotalCents * parsedTaxRate) / 10_000);
  const totalCents = subtotalCents + taxCents;
  assertDatabaseInt(taxCents, "El impuesto");
  assertDatabaseInt(totalCents, "El total");

  return { items: calculatedItems, subtotalCents, taxCents, totalCents };
}

export function formatQuoteNumber(year: number, sequence: number) {
  if (!Number.isInteger(year) || year < 2_000 || year > 9_999) {
    throw new Error("El año de la cotización no es válido.");
  }
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error("La secuencia de la cotización no es válida.");
  }
  return `WILO-${year}-${String(sequence).padStart(QUOTE_NUMBER_WIDTH, "0")}`;
}

async function allocateQuoteNumber(transaction: Prisma.TransactionClient, year: number) {
  // A single database upsert both allocates and advances the sequence. The
  // returned value is already incremented for an existing counter.
  const counter = await transaction.quoteCounter.upsert({
    where: { year },
    create: { year, nextValue: 2 },
    update: { nextValue: { increment: 1 } },
    select: { nextValue: true },
  });
  return formatQuoteNumber(year, counter.nextValue - 1);
}

type QuoteRelations = {
  clientId: string;
  leadId: string | null;
  projectId: string | null;
};

async function assertQuoteRelations(transaction: Prisma.TransactionClient, relations: QuoteRelations) {
  const [client, lead, project] = await Promise.all([
    transaction.client.findUnique({
      where: { id: relations.clientId },
      select: { id: true, archivedAt: true },
    }),
    relations.leadId
      ? transaction.lead.findUnique({
          where: { id: relations.leadId },
          select: { id: true, clientId: true, archivedAt: true },
        })
      : null,
    relations.projectId
      ? transaction.project.findUnique({
          where: { id: relations.projectId },
          select: { id: true, clientId: true, archivedAt: true },
        })
      : null,
  ]);

  if (!client) throw new HttpError(404, "Cliente no encontrado.", "CLIENT_NOT_FOUND");
  if (client.archivedAt) throw new HttpError(409, "El cliente está archivado.", "CLIENT_ARCHIVED");
  if (relations.leadId && !lead) throw new HttpError(404, "Lead no encontrado.", "LEAD_NOT_FOUND");
  if (lead?.archivedAt) throw new HttpError(409, "El lead está archivado.", "LEAD_ARCHIVED");
  if (lead?.clientId && lead.clientId !== relations.clientId) {
    throw new HttpError(409, "El lead pertenece a otro cliente.", "QUOTE_CLIENT_MISMATCH");
  }
  if (relations.projectId && !project) throw new HttpError(404, "Proyecto no encontrado.", "PROJECT_NOT_FOUND");
  if (project?.archivedAt) throw new HttpError(409, "El proyecto está archivado.", "PROJECT_ARCHIVED");
  if (project?.clientId && project.clientId !== relations.clientId) {
    throw new HttpError(409, "El proyecto pertenece a otro cliente.", "QUOTE_CLIENT_MISMATCH");
  }
}

const quoteDetailsInclude = {
  items: { orderBy: { position: "asc" as const } },
  client: { select: { id: true, name: true, email: true } },
  lead: { select: { id: true, name: true, email: true } },
  project: { select: { id: true, title: true, slug: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.QuoteInclude;

type QuoteCommandOptions = {
  actorUserId: string;
  db?: PrismaClient;
  now?: Date;
  allowSentTransition?: boolean;
  expectedUpdatedAt?: Date;
};

function statusTimestamps(
  status: QuoteStatus,
  current: { sentAt: Date | null; acceptedAt: Date | null },
  now: Date,
) {
  return {
    sentAt: status === "SENT" || status === "VIEWED" || status === "ACCEPTED" ? current.sentAt ?? now : current.sentAt,
    acceptedAt: status === "ACCEPTED" ? current.acceptedAt ?? now : current.acceptedAt,
  };
}

export async function createQuote(rawInput: unknown, options: QuoteCommandOptions) {
  const input = createQuoteSchema.parse(rawInput);
  const database = options.db ?? prisma;
  const now = options.now ?? new Date();
  const issueDate = input.issueDate ?? now;
  if (input.expiresAt && input.expiresAt < issueDate) {
    throw new HttpError(422, "La fecha de vencimiento debe ser posterior a la fecha de emisión.", "INVALID_QUOTE_DATES");
  }
  const totals = calculateQuoteTotals(input.items, input.taxRateBps);

  return database.$transaction(async (transaction) => {
    await assertQuoteRelations(transaction, {
      clientId: input.clientId,
      leadId: input.leadId,
      projectId: input.projectId,
    });
    const number = await allocateQuoteNumber(transaction, issueDate.getUTCFullYear());
    const timestamps = statusTimestamps(input.status, { sentAt: null, acceptedAt: null }, now);
    const quote = await transaction.quote.create({
      data: {
        number,
        clientId: input.clientId,
        leadId: input.leadId,
        projectId: input.projectId,
        createdById: options.actorUserId,
        status: input.status,
        currency: input.currency,
        taxRateBps: input.taxRateBps,
        subtotalCents: totals.subtotalCents,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
        issueDate,
        expiresAt: input.expiresAt,
        notes: input.notes?.trim() || null,
        ...timestamps,
        items: {
          create: totals.items.map((item) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
            subtotalCents: item.subtotalCents,
            position: item.position,
          })),
        },
      },
      include: quoteDetailsInclude,
    });
    await recordActivity(transaction, {
      actorUserId: options.actorUserId,
      entityType: "QUOTE",
      entityId: quote.id,
      action: "QUOTE_CREATED",
      metadata: {
        number: quote.number,
        clientId: quote.clientId,
        status: quote.status,
        currency: quote.currency,
        totalCents: quote.totalCents,
      },
    });
    return quote;
  });
}

export async function updateQuote(id: string, rawInput: unknown, options: QuoteCommandOptions) {
  const quoteId = identifierSchema.parse(id);
  const input = updateQuoteSchema.parse(rawInput);
  const database = options.db ?? prisma;
  const now = options.now ?? new Date();

  return database.$transaction(async (transaction) => {
    const current = await transaction.quote.findUnique({
      where: { id: quoteId },
      include: { items: { orderBy: { position: "asc" } } },
    });
    if (!current) throw new HttpError(404, "Cotización no encontrada.", "QUOTE_NOT_FOUND");
    if (current.archivedAt) throw new HttpError(409, "La cotización está archivada.", "QUOTE_ARCHIVED");
    if (options.expectedUpdatedAt && current.updatedAt.getTime() !== options.expectedUpdatedAt.getTime()) {
      throw new HttpError(409, "Esta cotización cambió en otra sesión. Actualiza la vista antes de guardar.", "EDIT_CONFLICT");
    }

    const clientId = input.clientId ?? current.clientId;
    const leadId = input.leadId === undefined ? current.leadId : input.leadId;
    const projectId = input.projectId === undefined ? current.projectId : input.projectId;
    const issueDate = input.issueDate ?? current.issueDate;
    const expiresAt = input.expiresAt === undefined ? current.expiresAt : input.expiresAt;
    const status = input.status ?? current.status as QuoteStatus;
    const allowedTransitions = quoteTransitions[current.status as QuoteStatus] ?? [];
    if (status !== current.status && !allowedTransitions.includes(status)) {
      throw new HttpError(
        409,
        `No se puede cambiar una cotización de ${current.status} a ${status}.`,
        "INVALID_QUOTE_STATUS_TRANSITION",
      );
    }
    if (current.status === "DRAFT" && status === "SENT" && !options.allowSentTransition) {
      throw new HttpError(409, "Usa la acción Enviar por correo para marcar la cotización como enviada.", "QUOTE_DELIVERY_REQUIRED");
    }
    if (expiresAt && expiresAt < issueDate) {
      throw new HttpError(422, "La fecha de vencimiento debe ser posterior a la fecha de emisión.", "INVALID_QUOTE_DATES");
    }
    await assertQuoteRelations(transaction, { clientId, leadId, projectId });

    const shouldRecalculate = Boolean(input.items || input.taxRateBps !== undefined);
    const totals = shouldRecalculate
      ? calculateQuoteTotals(
          input.items ?? current.items.map((item) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
          })),
          input.taxRateBps ?? current.taxRateBps,
        )
      : {
          subtotalCents: current.subtotalCents,
          taxCents: current.taxCents,
          totalCents: current.totalCents,
          items: [],
        };
    const timestamps = statusTimestamps(status, current, now);
    const writeTime = now.getTime() > current.updatedAt.getTime()
      ? now
      : new Date(current.updatedAt.getTime() + 1);
    const transition = await transaction.quote.updateMany({
      where: { id: quoteId, updatedAt: current.updatedAt, archivedAt: null },
      data: {
        clientId,
        leadId,
        projectId,
        status,
        currency: input.currency ?? current.currency,
        taxRateBps: input.taxRateBps ?? current.taxRateBps,
        subtotalCents: totals.subtotalCents,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
        issueDate,
        expiresAt,
        notes: input.notes === undefined ? current.notes : input.notes?.trim() || null,
        ...timestamps,
        ...(options.allowSentTransition && status === "SENT" ? { deliveryStartedAt: null } : {}),
        updatedAt: writeTime,
      },
    });
    if (transition.count !== 1) {
      throw new HttpError(409, "Esta cotización cambió en otra sesión. Actualiza la vista antes de guardar.", "EDIT_CONFLICT");
    }
    if (input.items) {
      await transaction.quoteItem.deleteMany({ where: { quoteId } });
      await transaction.quoteItem.createMany({
        data: totals.items.map((item) => ({
          quoteId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          subtotalCents: item.subtotalCents,
          position: item.position,
        })),
      });
    }
    const quote = await transaction.quote.findUniqueOrThrow({
      where: { id: quoteId },
      include: quoteDetailsInclude,
    });
    const statusChanged = quote.status !== current.status;
    await recordActivity(transaction, {
      actorUserId: options.actorUserId,
      entityType: "QUOTE",
      entityId: quote.id,
      action: statusChanged ? "QUOTE_STATUS_CHANGED" : "QUOTE_UPDATED",
      metadata: {
        number: quote.number,
        changedFields: Object.keys(input).filter((key) => key !== "taxRateBps"),
        ...(statusChanged ? { from: current.status, to: quote.status } : {}),
        totalCents: quote.totalCents,
      },
    });
    return quote;
  });
}

export async function setQuoteStatus(
  id: string,
  status: QuoteStatus,
  options: QuoteCommandOptions,
) {
  return updateQuote(id, { status }, options);
}

/**
 * Claims the delivery attempt before SMTP is contacted. This prevents two
 * concurrent requests from sending the same draft to the client twice.
 */
export async function claimQuoteDelivery(
  id: string,
  expectedUpdatedAt: Date,
  database: PrismaClient = prisma,
) {
  const quoteId = identifierSchema.parse(id);
  const now = new Date();
  const staleBefore = new Date(now.getTime() - 10 * 60_000);
  const claimedAt = now.getTime() > expectedUpdatedAt.getTime()
    ? now
    : new Date(expectedUpdatedAt.getTime() + 1);
  const claim = await database.quote.updateMany({
    where: {
      id: quoteId,
      status: "DRAFT",
      archivedAt: null,
      updatedAt: expectedUpdatedAt,
      OR: [{ deliveryStartedAt: null }, { deliveryStartedAt: { lt: staleBefore } }],
    },
    data: { deliveryStartedAt: claimedAt, updatedAt: claimedAt },
  });
  if (claim.count !== 1) {
    throw new HttpError(409, "La cotización cambió o ya está siendo enviada.", "QUOTE_DELIVERY_CONFLICT");
  }
  return claimedAt;
}

export async function releaseQuoteDelivery(
  id: string,
  claimedAt: Date,
  database: PrismaClient = prisma,
) {
  const quoteId = identifierSchema.parse(id);
  await database.quote.updateMany({
    where: { id: quoteId, status: "DRAFT", deliveryStartedAt: claimedAt },
    data: { deliveryStartedAt: null },
  });
}

export async function archiveQuote(id: string, options: QuoteCommandOptions) {
  const quoteId = identifierSchema.parse(id);
  const database = options.db ?? prisma;
  const now = options.now ?? new Date();
  return database.$transaction(async (transaction) => {
    const current = await transaction.quote.findUnique({ where: { id: quoteId } });
    if (!current) throw new HttpError(404, "Cotización no encontrada.", "QUOTE_NOT_FOUND");
    if (current.archivedAt) return current;
    const quote = await transaction.quote.update({ where: { id: quoteId }, data: { archivedAt: now } });
    await recordActivity(transaction, {
      actorUserId: options.actorUserId,
      entityType: "QUOTE",
      entityId: quote.id,
      action: "QUOTE_ARCHIVED",
      metadata: { number: quote.number, status: quote.status },
    });
    return quote;
  });
}

export async function restoreQuote(id: string, options: QuoteCommandOptions) {
  const quoteId = identifierSchema.parse(id);
  const database = options.db ?? prisma;
  return database.$transaction(async (transaction) => {
    const current = await transaction.quote.findUnique({ where: { id: quoteId } });
    if (!current) throw new HttpError(404, "Cotización no encontrada.", "QUOTE_NOT_FOUND");
    if (!current.archivedAt) return current;
    const quote = await transaction.quote.update({ where: { id: quoteId }, data: { archivedAt: null } });
    await recordActivity(transaction, {
      actorUserId: options.actorUserId,
      entityType: "QUOTE",
      entityId: quote.id,
      action: "QUOTE_RESTORED",
      metadata: { number: quote.number, status: quote.status },
    });
    return quote;
  });
}

export async function getQuoteById(id: string, includeArchived = false, database: PrismaClient = prisma) {
  const quoteId = identifierSchema.parse(id);
  return database.quote.findFirst({
    where: { id: quoteId, ...(includeArchived ? {} : { archivedAt: null }) },
    include: quoteDetailsInclude,
  });
}
