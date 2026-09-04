import { cache } from "react";
import { bankAccounts, siteConfig } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export type PublicBankAccount = {
  bank: string;
  currency: string;
  account: string;
  cci: string;
};

export type PublicSiteSettings = {
  name: string;
  legalName: string;
  ruc: string;
  location: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  url: string;
  invoiceNote: string;
  paymentTerms: string;
  yapePlin: string;
  paymentInstructions: string;
  bankAccounts: PublicBankAccount[];
};

const fallbackSettings: PublicSiteSettings = {
  ...siteConfig,
  emailVerified: process.env.CONTACT_EMAIL_VERIFIED === "true",
  invoiceNote: "Emitimos boleta y factura electrónica.",
  paymentTerms: "50% para iniciar y 50% contra entrega.",
  yapePlin: siteConfig.phoneDisplay.replace("+51 ", ""),
  paymentInstructions: "Una vez realizado el pago, envíanos el comprobante por WhatsApp.",
  bankAccounts: bankAccounts.map((account) => ({ ...account })),
};

function displayPhone(phone: string) {
  if (/^51\d{9}$/.test(phone)) return `+51 ${phone.slice(2, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`;
  return `+${phone}`;
}

function validBankAccounts(value: unknown): PublicBankAccount[] | null {
  if (!Array.isArray(value)) return null;
  const accounts = value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (![record.bank, record.currency, record.account, record.cci].every((field) => typeof field === "string" && field.trim())) return [];
    const currency = record.currency === "PEN" ? "Soles" : record.currency === "USD" ? "Dólares" : String(record.currency);
    return [{ bank: String(record.bank), currency, account: String(record.account), cci: String(record.cci) }];
  });
  return accounts.length ? accounts : null;
}

export const getPublicSiteSettings = cache(async (): Promise<PublicSiteSettings> => {
  try {
    const records = await prisma.siteSetting.findMany({ where: { public: true } });
    const values = new Map(records.map((record) => [record.key, record]));
    const read = (key: string, fallback: string) => values.get(key)?.value.trim() || fallback;
    const readBoolean = (key: string, fallback: boolean) => {
      const value = values.get(key)?.value.trim().toLowerCase();
      if (value === "true" || value === "1" || value === "yes") return true;
      if (value === "false" || value === "0" || value === "no") return false;
      return fallback;
    };
    const phone = read("contact.whatsapp", fallbackSettings.phone).replace(/\D/g, "") || fallbackSettings.phone;
    const rawBanks = values.get("payments.bank_accounts")?.value;
    let parsedBanks: unknown = null;
    if (rawBanks) {
      try { parsedBanks = JSON.parse(rawBanks); } catch {}
    }
    const urlCandidate = read("site.url", fallbackSettings.url);
    let url = fallbackSettings.url;
    try { url = new URL(urlCandidate).origin; } catch {}
    return {
      name: read("business.name", fallbackSettings.name),
      legalName: read("business.owner", fallbackSettings.legalName),
      ruc: read("business.ruc", fallbackSettings.ruc),
      location: read("business.location", fallbackSettings.location),
      email: read("contact.email", fallbackSettings.email),
      emailVerified: readBoolean("contact.email_verified", fallbackSettings.emailVerified),
      phone,
      phoneDisplay: displayPhone(phone),
      whatsapp: `https://wa.me/${phone}?text=${encodeURIComponent("Hola Wilo Studio, quiero cotizar un proyecto.")}`,
      url,
      invoiceNote: read("business.invoice_note", fallbackSettings.invoiceNote),
      paymentTerms: read("projects.payment_terms", fallbackSettings.paymentTerms),
      yapePlin: read("payments.yape_plin", fallbackSettings.yapePlin),
      paymentInstructions: read("payments.instructions", fallbackSettings.paymentInstructions),
      bankAccounts: validBankAccounts(parsedBanks) || fallbackSettings.bankAccounts,
    };
  } catch {
    return fallbackSettings;
  }
});
