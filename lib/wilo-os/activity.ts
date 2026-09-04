import type { Prisma, PrismaClient } from "@prisma/client";

export type ActivityClient = Pick<PrismaClient, "activity"> | Pick<Prisma.TransactionClient, "activity">;

export type RecordActivityInput = {
  actorUserId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
};

const ADMIN_ENTITY_TYPES: Record<string, string> = {
  projects: "PROJECT",
  services: "SERVICE",
  plans: "PLAN",
  productCategories: "PRODUCT_CATEGORY",
  products: "PRODUCT",
  clients: "CLIENT",
  testimonials: "TESTIMONIAL",
  promotions: "PROMOTION",
  referrals: "REFERRAL",
  leads: "LEAD",
  quotes: "QUOTE",
  complaints: "COMPLAINT",
  orders: "ORDER",
  media: "MEDIA",
  settings: "SETTING",
  users: "USER",
};

export function activityEntityTypeForResource(resource: string) {
  return ADMIN_ENTITY_TYPES[resource] ?? resource.replace(/s$/i, "").toUpperCase();
}

function serializeMetadata(metadata: Record<string, unknown> | undefined) {
  return JSON.stringify(metadata ?? {});
}

/**
 * Appends an immutable audit entry using either the root Prisma client or the
 * transaction that owns the business mutation. Passing the transaction keeps
 * the state change and its audit trail atomic.
 */
export async function recordActivity(client: ActivityClient, input: RecordActivityInput) {
  return client.activity.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      entityType: input.entityType.trim().toUpperCase(),
      entityId: input.entityId,
      action: input.action.trim().toUpperCase(),
      metadata: serializeMetadata(input.metadata),
    },
  });
}
