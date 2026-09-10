import { z } from "zod";
import { cleanText } from "@/lib/api";

const text = (min: number, max: number) => z.string().transform(cleanText).pipe(z.string().min(min).max(max));
const optionalText = (max: number) =>
  z
    .string()
    .transform(cleanText)
    .pipe(z.string().max(max))
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined);
const email = z.string().transform((value) => cleanText(value).toLowerCase()).pipe(z.string().email().max(254));
const optionalEmail = z
  .union([email, z.literal("")])
  .optional()
  .transform((value) => value || undefined);
const phone = z
  .string()
  .transform(cleanText)
  .pipe(z.string().min(6).max(30).regex(/^[+\d\s()-]+$/, "Ingresa un teléfono válido."));

export const honeypotSchema = z.string().max(0).optional().or(z.literal(""));

export const leadSchema = z.object({
  name: text(2, 120),
  company: optionalText(160),
  phone: z
    .union([phone, z.literal("")])
    .optional()
    .transform((value) => value || undefined),
  email,
  type: z.enum(["CONTACT", "QUOTE", "CONSULTATION"]).default("CONTACT"),
  service: optionalText(120),
  message: optionalText(4_000),
  source: optionalText(80).default("website"),
  details: z.record(z.string(), z.unknown()).default({}),
  website: honeypotSchema,
});

export const quoteSchema = z.object({
  name: text(2, 120),
  company: optionalText(160),
  phone,
  email,
  projectType: text(2, 120),
  planSlug: optionalText(120),
  features: z.array(text(1, 160)).max(30).default([]),
  message: optionalText(4_000),
  consent: z.literal(true),
  clientElapsedMs: z.number().finite().min(1_000).max(24 * 60 * 60 * 1_000),
  website: honeypotSchema,
});

export const referralSchema = z.object({
  clientId: z.string().cuid().optional(),
  referrerName: text(2, 120),
  referrerEmail: optionalEmail,
  referrerPhone: phone,
  referredName: text(2, 120),
  referredEmail: optionalEmail,
  referredPhone: phone,
  notes: optionalText(2_000),
  website: honeypotSchema,
});

export const complaintSchema = z
  .object({
    consumerName: text(2, 160),
    documentType: z.enum(["DNI", "CE", "PASSPORT", "RUC"]),
    documentNumber: z
      .string()
      .transform(cleanText)
      .pipe(z.string().min(6).max(20).regex(/^[A-Za-z0-9-]+$/, "Ingresa un documento válido.")),
    email,
    phone,
    address: text(5, 300),
    recordType: z.enum(["RECLAMO", "QUEJA"]),
    goodType: z.enum(["PRODUCT", "SERVICE"]),
    amountCents: z.number().int().nonnegative().max(100_000_000).optional(),
    description: text(10, 5_000),
    requestedAction: text(5, 3_000),
    website: honeypotSchema,
  })
  .strict();

export const orderSchema = z
  .object({
    customerName: text(2, 160),
    email,
    phone,
    documentType: z.enum(["BOLETA", "FACTURA"]),
    documentNumber: optionalText(20),
    companyName: optionalText(200),
    companyRuc: optionalText(11),
    department: optionalText(120),
    province: optionalText(120),
    district: optionalText(120),
    address: optionalText(300),
    addressReference: optionalText(300),
    promoCode: optionalText(40),
    paymentMethod: z.enum(["ONLINE", "MANUAL", "WHATSAPP"]),
    notes: optionalText(2_000),
    expectedTotalCents: z.number().int().nonnegative().max(100_000_000),
    items: z
      .array(
        z.object({
          productId: z.string().cuid(),
          quantity: z.number().int().min(1).max(20),
        }),
      )
      .min(1)
      .max(30),
    website: honeypotSchema,
  })
  .superRefine((value, context) => {
    if (value.items.reduce((total, item) => total + item.quantity, 0) > 50) {
      context.addIssue({ code: "custom", path: ["items"], message: "El pedido supera la cantidad máxima permitida." });
    }
    if (value.documentType === "FACTURA") {
      if (!/^\d{11}$/.test(value.companyRuc || "")) {
        context.addIssue({ code: "custom", path: ["companyRuc"], message: "El RUC debe tener 11 dígitos." });
      }
      if (!value.companyName) {
        context.addIssue({ code: "custom", path: ["companyName"], message: "La razón social es obligatoria." });
      }
    }
  });

export const voucherAccessSchema = z.object({
  orderNumber: text(4, 40),
  email,
  token: z.string().min(32).max(200),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type ReferralInput = z.infer<typeof referralSchema>;
export type ComplaintInput = z.infer<typeof complaintSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
