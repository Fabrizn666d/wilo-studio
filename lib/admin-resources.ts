import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { HttpError, cleanText } from "@/lib/api";
import type { AdminResourceRoleMap } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { createQuoteSchema, updateQuoteSchema } from "@/lib/wilo-os/quotes";

type RecordData = Record<string, unknown>;

export type AdminDelegate = {
  findMany(args?: RecordData): Promise<RecordData[]>;
  findUnique(args: RecordData): Promise<RecordData | null>;
  count(args?: RecordData): Promise<number>;
  create(args: RecordData): Promise<RecordData>;
  update(args: RecordData): Promise<RecordData>;
  delete(args: RecordData): Promise<RecordData>;
};

export type AdminResource = {
  delegate: AdminDelegate;
  createSchema?: z.ZodType<RecordData>;
  updateSchema: z.ZodType<RecordData>;
  searchFields: string[];
  filterFields?: Record<string, "string" | "boolean">;
  include?: RecordData;
  detailInclude?: RecordData;
  orderBy: RecordData | RecordData[];
  hiddenFields?: string[];
  roles?: AdminResourceRoleMap;
  canDelete?: boolean;
  archivable?: boolean;
  jsonFields?: string[];
  dateFilterField?: string;
  sortableFields?: string[];
};

const asDelegate = (delegate: unknown) => delegate as AdminDelegate;
const clean = (max = 5_000) => z.string().transform(cleanText).pipe(z.string().max(max));
const required = (max = 255) => clean(max).pipe(z.string().min(1));
const optional = (max = 5_000) => clean(max).optional().nullable();
const slug = z.string().trim().toLowerCase().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const id = z.string().cuid();
const optionalId = id.optional().nullable();
const url = z
  .string()
  .trim()
  .url()
  .max(2_000)
  .refine((value) => {
    try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
  }, "Usa una URL HTTP o HTTPS válida.")
  .optional()
  .nullable()
  .or(z.literal(""));
function isLocalImagePath(value: string) {
  try {
    const decoded = decodeURIComponent(value);
    const segments = decoded.split("/");
    return decoded.startsWith("/")
      && !decoded.startsWith("//")
      && !decoded.includes("\\")
      && !decoded.includes("\0")
      && !segments.some((segment) => segment === "." || segment === "..")
      && /\.(?:jpe?g|png|webp)$/i.test(decoded);
  } catch {
    return false;
  }
}
const imagePath = z
  .string()
  .trim()
  .max(2_000)
  .refine(
    isLocalImagePath,
    "Usa una imagen local JPG, PNG o WebP; por ejemplo /uploads/media/archivo.webp.",
  );
const imageAssetPath = imagePath
  .optional()
  .nullable()
  .or(z.literal(""));
const videoAssetPath = z
  .string()
  .trim()
  .max(2_000)
  .refine((value) => {
    try {
      const decoded = decodeURIComponent(value);
      return decoded.startsWith("/")
        && !decoded.startsWith("//")
        && !decoded.includes("\\")
        && !decoded.split("/").some((segment) => segment === "." || segment === "..")
        && /\.(?:mp4|webm)$/i.test(decoded);
    } catch { return false; }
  }, "Usa una ruta local MP4 o WebM.")
  .optional()
  .nullable()
  .or(z.literal(""));
const money = z.number().int().min(0).max(100_000_000);
const sortOrder = z.number().int().min(-100_000).max(100_000).default(0);
const date = z
  .union([z.string().datetime(), z.date(), z.null()])
  .transform((value) => (typeof value === "string" ? new Date(value) : value));
const jsonText = z
  .union([z.string().max(500_000), z.array(z.unknown()), z.record(z.string(), z.unknown())])
  .transform((value, context) => {
    if (typeof value !== "string") return JSON.stringify(value);
    try {
      JSON.parse(value);
      return value;
    } catch {
      context.addIssue({ code: "custom", message: "Debe ser JSON válido." });
      return z.NEVER;
    }
  });
const imageList = z
  .union([z.string().max(500_000), z.array(z.unknown())])
  .transform((value, context) => {
    if (Array.isArray(value)) return value;
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // The issue below is intentionally shared by invalid JSON and non-array JSON.
    }
    context.addIssue({ code: "custom", message: "Debe ser una lista JSON de rutas de imagen." });
    return z.NEVER;
  })
  .pipe(z.array(imagePath).max(100))
  .transform((value) => JSON.stringify(value));

const projectCreate = z
  .object({
    slug,
    title: required(180),
    category: required(80),
    clientId: optionalId,
    assignedToId: optionalId,
    summary: optional(1_000),
    description: optional(30_000),
    challenge: optional(20_000),
    solution: optional(20_000),
    services: jsonText.default("[]"),
    deliverables: jsonText.default("[]"),
    coverImage: imageAssetPath,
    videoUrl: videoAssetPath,
    logoUrl: imageAssetPath,
    gallery: imageList.default("[]"),
    liveUrl: url,
    stagingUrl: url,
    repositoryUrl: url,
    internalNotes: optional(20_000),
    year: z.number().int().min(2_000).max(2_100).optional().nullable(),
    status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).default("PLANNING"),
    startDate: date.optional().nullable(),
    targetDate: date.optional().nullable(),
    completedAt: date.optional().nullable(),
    publicCaseStudy: z.boolean().default(false),
    contentStatus: z.enum(["DRAFT", "REVIEW", "PUBLISHED"]).default("DRAFT"),
    seoTitle: optional(180),
    seoDescription: optional(320),
    featured: z.boolean().default(false),
    published: z.boolean().default(false),
    sortOrder,
  })
  .strict();

const serviceCreate = z
  .object({
    slug,
    title: required(180),
    category: required(80),
    summary: required(1_000),
    description: optional(30_000),
    icon: optional(120),
    imageUrl: imageAssetPath,
    priceFromCents: money.optional().nullable(),
    currency: z.literal("PEN").default("PEN"),
    published: z.boolean().default(true),
    sortOrder,
  })
  .strict();

const planCreate = z
  .object({
    slug,
    title: required(180),
    subtitle: optional(250),
    category: required(80).default("WEB"),
    priceCents: money,
    taxCents: money.default(0),
    includesTax: z.boolean().default(false),
    currency: z.literal("PEN").default("PEN"),
    billingCycle: optional(40),
    features: jsonText.default("[]"),
    note: optional(2_000),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
    sortOrder,
  })
  .strict();

const categoryCreate = z
  .object({
    slug,
    name: required(160),
    description: optional(2_000),
    imageUrl: imageAssetPath,
    active: z.boolean().default(true),
    sortOrder,
  })
  .strict();

const productCreate = z
  .object({
    categoryId: id,
    slug,
    sku: optional(100),
    name: required(200),
    description: optional(30_000),
    specifications: jsonText.default("[]"),
    images: imageList.default("[]"),
    licenseType: optional(120),
    licenseDuration: optional(120),
    digital: z.boolean().default(true),
    education: z.boolean().default(false),
    priceCents: money,
    includesTax: z.boolean().default(true),
    currency: z.literal("PEN").default("PEN"),
    stock: z.number().int().min(0).max(1_000_000).optional().nullable(),
    active: z.boolean().default(true),
    featured: z.boolean().default(false),
  })
  .strict();

const clientCreate = z
  .object({
    slug,
    name: required(180),
    contactName: optional(180),
    email: z.string().trim().toLowerCase().email().max(254).optional().nullable().or(z.literal("")),
    phone: optional(40),
    whatsapp: optional(40),
    taxId: optional(30),
    city: optional(120),
    country: required(2).default("PE"),
    notes: optional(10_000),
    source: z.enum(["STUDIO", "EVENTS", "EDUCATION", "EXPRESS", "MANUAL"]).default("MANUAL"),
    logoUrl: imageAssetPath,
    website: url,
    active: z.boolean().default(true),
    featured: z.boolean().default(false),
    sortOrder,
  })
  .strict();

const testimonialCreate = z
  .object({
    clientId: optionalId,
    name: required(180),
    company: required(180),
    role: optional(180),
    quote: required(5_000),
    avatarUrl: imageAssetPath,
    published: z.boolean().default(true),
    sortOrder,
  })
  .strict();

const promotionShape = {
  slug,
  title: required(200),
  summary: optional(2_000),
  details: jsonText.default("[]"),
  imageUrl: imageAssetPath,
  referralBenefit: optional(1_000),
  startAt: date.optional().nullable(),
  endAt: date.optional().nullable(),
  active: z.boolean().default(false),
  featured: z.boolean().default(false),
};

function validatePromotionDates(value: { startAt?: Date | null; endAt?: Date | null }, context: z.RefinementCtx) {
  if (value.startAt && value.endAt && value.endAt < value.startAt) {
    context.addIssue({ code: "custom", path: ["endAt"], message: "La fecha final debe ser posterior a la inicial." });
  }
}

const promotionCreate = z
  .object(promotionShape)
  .strict()
  .superRefine(validatePromotionDates);
const promotionUpdate = z.object(promotionShape).partial().strict().superRefine(validatePromotionDates);

const userCreate = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    name: optional(180),
    password: z.string().min(12).max(128),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "COMMERCIAL", "EDITOR"]).default("EDITOR"),
    active: z.boolean().default(true),
  })
  .strict();

const userUpdate = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254).optional(),
    name: optional(180),
    password: z.string().min(12).max(128).optional(),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "COMMERCIAL", "EDITOR"]).optional(),
    active: z.boolean().optional(),
  })
  .strict();

const referralUpdate = z
  .object({ status: z.enum(["NEW", "CONTACTED", "CONVERTED", "REWARDED", "CLOSED"]).optional(), benefit: optional(1_000), notes: optional(2_000), clientId: optionalId })
  .strict();
const leadShape = {
  name: required(120),
  company: optional(160),
  clientId: optionalId,
  assignedToId: optionalId,
  phone: optional(40),
  email: z.string().trim().toLowerCase().email().max(254),
  type: z.enum(["CONTACT", "QUOTE", "CONSULTATION"]).default("CONTACT"),
  service: optional(160),
  message: optional(4_000),
  status: z.enum(["NEW", "CONTACTED", "MEETING", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]).default("NEW"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  budgetRange: optional(160),
  launchTimeframe: optional(160),
  estimatedMinCents: money.optional().nullable(),
  estimatedMaxCents: money.optional().nullable(),
  lastContactAt: date.optional().nullable(),
  nextFollowUpAt: date.optional().nullable(),
  followUpNote: optional(4_000),
  lostReason: optional(2_000),
};
const leadCreate = z.object({ ...leadShape, source: z.literal("MANUAL").default("MANUAL") }).strict();
const leadUpdate = z.object(leadShape).partial().strict();
const complaintUpdate = z
  .object({
    status: z.enum(["RECEIVED", "IN_REVIEW", "RESPONDED", "CLOSED"]).optional(),
    response: optional(10_000),
    respondedAt: date.optional().nullable(),
  })
  .strict();
const orderUpdate = z
  .object({
    status: z.enum(["PENDING", "VERIFYING", "PAID", "CANCELLED", "REFUNDED"]).optional(),
    paymentReference: optional(255),
    notes: optional(2_000),
    paidAt: date.optional().nullable(),
    deliveredAt: date.optional().nullable(),
  })
  .strict();
const mediaUpdate = z.object({ alt: optional(500) }).strict();
const settingCreate = z
  .object({ key: z.string().trim().min(2).max(160).regex(/^[a-z0-9_.-]+$/), value: clean(500_000), type: z.enum(["text", "url", "json"]).default("text"), public: z.boolean().default(false), description: optional(1_000) })
  .strict();

export const adminResources = {
  projects: {
    delegate: asDelegate(prisma.project),
    createSchema: projectCreate,
    updateSchema: projectCreate.partial(),
    searchFields: ["title", "slug", "summary"],
    filterFields: { category: "string", status: "string", contentStatus: "string", published: "boolean", publicCaseStudy: "boolean", featured: "boolean", assignedToId: "string" },
    include: {
      client: { select: { id: true, name: true, slug: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
    detailInclude: {
      client: { select: { id: true, name: true, slug: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      quotes: { select: { id: true, number: true, status: true, totalCents: true, currency: true }, orderBy: { createdAt: "desc" }, take: 25 },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    jsonFields: ["services", "deliverables", "gallery"],
    canDelete: false,
    archivable: true,
  },
  services: {
    delegate: asDelegate(prisma.service),
    createSchema: serviceCreate,
    updateSchema: serviceCreate.partial(),
    searchFields: ["title", "slug", "summary"],
    filterFields: { category: "string", published: "boolean" },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  },
  plans: {
    delegate: asDelegate(prisma.plan),
    createSchema: planCreate,
    updateSchema: planCreate.partial(),
    searchFields: ["title", "slug", "subtitle"],
    filterFields: { category: "string", published: "boolean", featured: "boolean" },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    jsonFields: ["features"],
  },
  productCategories: {
    delegate: asDelegate(prisma.productCategory),
    createSchema: categoryCreate,
    updateSchema: categoryCreate.partial(),
    searchFields: ["name", "slug"],
    filterFields: { active: "boolean" },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  },
  products: {
    delegate: asDelegate(prisma.product),
    createSchema: productCreate,
    updateSchema: productCreate.partial(),
    searchFields: ["name", "slug", "sku"],
    filterFields: { categoryId: "string", active: "boolean", featured: "boolean", education: "boolean" },
    include: { category: { select: { id: true, slug: true, name: true } } },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    jsonFields: ["specifications", "images"],
  },
  clients: {
    delegate: asDelegate(prisma.client),
    createSchema: clientCreate,
    updateSchema: clientCreate.partial(),
    searchFields: ["name", "slug", "contactName", "email", "phone", "taxId"],
    filterFields: { active: "boolean", featured: "boolean", source: "string" },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    detailInclude: {
      leads: { select: { id: true, name: true, status: true, source: true }, orderBy: { createdAt: "desc" }, take: 25 },
      projects: { select: { id: true, title: true, status: true, slug: true }, orderBy: { createdAt: "desc" }, take: 25 },
      quotes: { select: { id: true, number: true, status: true, totalCents: true, currency: true }, orderBy: { createdAt: "desc" }, take: 25 },
    },
    canDelete: false,
    archivable: true,
  },
  testimonials: {
    delegate: asDelegate(prisma.testimonial),
    createSchema: testimonialCreate,
    updateSchema: testimonialCreate.partial(),
    searchFields: ["name", "company", "quote"],
    filterFields: { published: "boolean", clientId: "string" },
    include: { client: { select: { id: true, name: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  },
  promotions: {
    delegate: asDelegate(prisma.promotion),
    createSchema: promotionCreate,
    updateSchema: promotionUpdate,
    searchFields: ["title", "slug", "summary"],
    filterFields: { active: "boolean", featured: "boolean" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    jsonFields: ["details"],
  },
  referrals: {
    delegate: asDelegate(prisma.referral),
    updateSchema: referralUpdate,
    searchFields: ["referrerName", "referrerEmail", "referredName", "referredEmail"],
    filterFields: { status: "string", clientId: "string" },
    include: { client: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  },
  leads: {
    delegate: asDelegate(prisma.lead),
    createSchema: leadCreate,
    updateSchema: leadUpdate,
    searchFields: ["name", "email", "company", "phone", "service"],
    filterFields: { status: "string", type: "string", source: "string", service: "string", priority: "string", clientId: "string", assignedToId: "string" },
    include: {
      client: { select: { id: true, name: true, slug: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
    detailInclude: {
      client: { select: { id: true, name: true, slug: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      quotes: { select: { id: true, number: true, status: true, totalCents: true, currency: true }, orderBy: { createdAt: "desc" }, take: 25 },
    },
    orderBy: { createdAt: "desc" },
    dateFilterField: "createdAt",
    sortableFields: ["createdAt", "updatedAt", "status", "priority", "nextFollowUpAt"],
    jsonFields: ["details"],
    canDelete: false,
    archivable: true,
  },
  quotes: {
    delegate: asDelegate(prisma.quote),
    createSchema: createQuoteSchema,
    updateSchema: updateQuoteSchema,
    searchFields: ["number", "notes"],
    filterFields: { status: "string", currency: "string", clientId: "string", leadId: "string", projectId: "string" },
    include: {
      items: { orderBy: { position: "asc" } },
      client: { select: { id: true, name: true, email: true } },
      lead: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, title: true, slug: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    dateFilterField: "createdAt",
    sortableFields: ["createdAt", "updatedAt", "status", "totalCents", "expiresAt"],
    canDelete: false,
    archivable: true,
  },
  activity: {
    delegate: asDelegate(prisma.activity),
    updateSchema: z.object({}).strict(),
    searchFields: ["entityType", "entityId", "action"],
    filterFields: { entityType: "string", action: "string", actorUserId: "string" },
    include: { actor: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    jsonFields: ["metadata"],
    canDelete: false,
  },
  complaints: {
    delegate: asDelegate(prisma.complaint),
    updateSchema: complaintUpdate,
    searchFields: ["code", "consumerName", "email", "documentNumber"],
    filterFields: { status: "string", recordType: "string", goodType: "string" },
    orderBy: { createdAt: "desc" },
    canDelete: false,
  },
  orders: {
    delegate: asDelegate(prisma.order),
    updateSchema: orderUpdate,
    searchFields: ["number", "customerName", "email", "phone", "companyRuc"],
    filterFields: { status: "string", paymentMethod: "string" },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    hiddenFields: ["publicTokenHash"],
    canDelete: false,
  },
  media: {
    delegate: asDelegate(prisma.media),
    updateSchema: mediaUpdate,
    searchFields: ["originalName", "filename", "alt"],
    filterFields: { mimeType: "string" },
    include: { uploadedBy: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  },
  settings: {
    delegate: asDelegate(prisma.siteSetting),
    createSchema: settingCreate,
    updateSchema: settingCreate.partial(),
    searchFields: ["key", "description"],
    filterFields: { type: "string", public: "boolean" },
    orderBy: { key: "asc" },
    roles: { read: ["SUPER_ADMIN"], create: ["SUPER_ADMIN"], update: ["SUPER_ADMIN"], delete: ["SUPER_ADMIN"] },
  },
  users: {
    delegate: asDelegate(prisma.user),
    createSchema: userCreate,
    updateSchema: userUpdate,
    searchFields: ["name", "email"],
    filterFields: { role: "string", active: "boolean" },
    orderBy: { createdAt: "desc" },
    hiddenFields: ["passwordHash"],
    roles: { read: ["SUPER_ADMIN"], create: ["SUPER_ADMIN"], update: ["SUPER_ADMIN"], delete: ["SUPER_ADMIN"] },
    canDelete: false,
  },
} satisfies Record<string, AdminResource>;

export type AdminResourceName = keyof typeof adminResources;

export function getAdminResource(name: string): AdminResource {
  const resource = adminResources[name as AdminResourceName];
  if (!resource) throw new HttpError(404, "Módulo administrativo no encontrado.", "RESOURCE_NOT_FOUND");
  return resource;
}

export function getTransactionAdminDelegate(transaction: Prisma.TransactionClient, name: string): AdminDelegate {
  const delegates: Record<string, unknown> = {
    projects: transaction.project,
    services: transaction.service,
    plans: transaction.plan,
    productCategories: transaction.productCategory,
    products: transaction.product,
    clients: transaction.client,
    testimonials: transaction.testimonial,
    promotions: transaction.promotion,
    referrals: transaction.referral,
    leads: transaction.lead,
    quotes: transaction.quote,
    activity: transaction.activity,
    complaints: transaction.complaint,
    orders: transaction.order,
    media: transaction.media,
    settings: transaction.siteSetting,
    users: transaction.user,
  };
  const delegate = delegates[name];
  if (!delegate) throw new HttpError(404, "Módulo administrativo no encontrado.", "RESOURCE_NOT_FOUND");
  return asDelegate(delegate);
}

export function serializeAdminRecord(record: RecordData, resource: AdminResource) {
  const copy = { ...record };
  for (const field of resource.hiddenFields || []) delete copy[field];
  if (copy.type === "secret" && typeof copy.value === "string") copy.value = "••••••••";
  for (const field of resource.jsonFields || []) {
    if (typeof copy[field] !== "string") continue;
    try {
      copy[field] = JSON.parse(copy[field] as string) as unknown;
    } catch {
      copy[field] = null;
    }
  }
  if (typeof copy.voucherUrl === "string" && copy.voucherUrl && typeof copy.id === "string") {
    copy.voucherUrl = `/api/admin/orders/${copy.id}/voucher`;
  }
  return copy;
}
