import type { LeadInput } from "@/lib/validation";
import { HttpError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { recordActivity } from "@/lib/wilo-os/activity";

export const leadSources = ["STUDIO", "EVENTS", "EDUCATION", "EXPRESS", "MANUAL"] as const;
export type LeadSource = (typeof leadSources)[number];

export const leadStatuses = ["NEW", "CONTACTED", "MEETING", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

const leadTransitions: Record<LeadStatus, readonly LeadStatus[]> = {
  NEW: ["CONTACTED", "LOST"],
  CONTACTED: ["MEETING", "PROPOSAL", "NEGOTIATION", "WON", "LOST"],
  MEETING: ["CONTACTED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"],
  PROPOSAL: ["MEETING", "NEGOTIATION", "WON", "LOST"],
  NEGOTIATION: ["PROPOSAL", "WON", "LOST"],
  WON: [],
  LOST: ["CONTACTED"],
};

export function assertLeadStatusTransition(current: string, next: string) {
  if (current === next) return;
  const allowed = leadTransitions[current as LeadStatus] ?? [];
  if (!leadStatuses.includes(next as LeadStatus) || !allowed.includes(next as LeadStatus)) {
    throw new HttpError(409, `No se puede cambiar un lead de ${current} a ${next}.`, "INVALID_LEAD_STATUS_TRANSITION");
  }
}

const SOURCE_ALIASES: Record<string, LeadSource> = {
  "studio-contact": "STUDIO",
  "contact-page": "STUDIO",
  website: "STUDIO",
  "quote-wizard": "STUDIO",
  studio: "STUDIO",
  "events-page": "EVENTS",
  "events-ecosystem-bridge": "EVENTS",
  events: "EVENTS",
  "education-page": "EDUCATION",
  education: "EDUCATION",
  express: "EXPRESS",
  "express-page": "EXPRESS",
  manual: "MANUAL",
};

export function normalizeLeadSource(source: string | null | undefined): LeadSource {
  const normalized = source?.trim().toLowerCase() || "website";
  return SOURCE_ALIASES[normalized] ?? (normalized.startsWith("events-")
    ? "EVENTS"
    : normalized.startsWith("education-")
      ? "EDUCATION"
      : normalized.startsWith("express-")
        ? "EXPRESS"
        : "STUDIO");
}

type CreateInboundLeadOptions = {
  estimatedMinCents?: number | null;
  estimatedMaxCents?: number | null;
};

export async function createInboundLead(input: LeadInput, options: CreateInboundLeadOptions = {}) {
  const source = normalizeLeadSource(input.source);
  const duplicateSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1_000);
  const duplicate = await prisma.lead.findFirst({
    where: {
      createdAt: { gte: duplicateSince },
      OR: [
        { email: input.email },
        ...(input.phone ? [{ phone: input.phone }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const details = {
    ...input.details,
    sourceOriginal: input.source ?? "website",
    ...(duplicate ? { potentialDuplicateLeadId: duplicate.id } : {}),
  };

  return prisma.$transaction(async (transaction) => {
    const lead = await transaction.lead.create({
      data: {
        name: input.name,
        company: input.company,
        phone: input.phone,
        email: input.email,
        type: input.type,
        service: input.service,
        message: input.message,
        source,
        details: JSON.stringify(details),
        estimatedMinCents: options.estimatedMinCents,
        estimatedMaxCents: options.estimatedMaxCents,
        consentAt: input.details.consent === true ? new Date() : null,
      },
      select: { id: true, name: true, email: true, type: true, service: true, createdAt: true },
    });

    await recordActivity(transaction, {
      entityType: "LEAD",
      entityId: lead.id,
      action: "LEAD_CREATED",
      metadata: { source, potentialDuplicate: Boolean(duplicate) },
    });

    return lead;
  });
}
