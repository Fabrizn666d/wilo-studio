import nodemailer from "nodemailer";
import { escapeHtml } from "@/lib/api";

type Mail = { to: string; subject: string; text: string; html: string };
type MailDelivery = { sent: true } | { sent: false; reason: "SMTP_NOT_CONFIGURED" };

const safeHeader = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

function smtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const from = process.env.SMTP_FROM;
  if (!host || !port || !from) return null;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  return {
    from,
    transport: {
      host,
      port,
      secure: process.env.SMTP_SECURE === "true",
      ...(user && pass ? { auth: { user, pass } } : {}),
    },
  };
}

export function isSmtpConfigured() {
  return smtpConfig() !== null;
}

export async function sendMail(mail: Mail): Promise<MailDelivery> {
  const config = smtpConfig();
  if (!config) return { sent: false, reason: "SMTP_NOT_CONFIGURED" as const };
  const transport = nodemailer.createTransport(config.transport);
  await transport.sendMail({ from: config.from, ...mail });
  return { sent: true as const };
}

async function settleMailBatch(context: string, messages: Array<Promise<MailDelivery>>) {
  const results = await Promise.allSettled(messages);
  for (const result of results) {
    if (result.status === "rejected") {
      const reason = result.reason;
      console.error("SMTP delivery failed", {
        context,
        error: reason instanceof Error ? reason.message : "Unknown SMTP error",
      });
    } else if (!result.value.sent) {
      console.warn("SMTP delivery skipped", { context, reason: result.value.reason });
    }
  }
}

function businessInbox() {
  return process.env.SMTP_TO || process.env.ADMIN_EMAIL || null;
}

export async function sendLeadEmails(input: {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  message?: string | null;
  type: string;
}) {
  const inbox = businessInbox();
  const safeName = escapeHtml(input.name);
  const lines = [
    `Tipo: ${input.type}`,
    `Nombre: ${input.name}`,
    `Correo: ${input.email}`,
    input.phone ? `Teléfono: ${input.phone}` : null,
    input.company ? `Empresa: ${input.company}` : null,
    input.service ? `Servicio: ${input.service}` : null,
    input.message ? `Mensaje: ${input.message}` : null,
  ].filter(Boolean) as string[];

  const messages: Array<Promise<MailDelivery>> = [
    sendMail({
      to: input.email,
      subject: "Recibimos tu solicitud — Wilo Studio",
      text: `Hola ${input.name}, recibimos tu solicitud. Nuestro equipo se pondrá en contacto contigo pronto.`,
      html: `<p>Hola ${safeName},</p><p>Recibimos tu solicitud. Nuestro equipo se pondrá en contacto contigo pronto.</p><p>Wilo Studio</p>`,
    }),
  ];
  if (inbox) {
    messages.push(
      sendMail({
        to: inbox,
        subject: `Nuevo lead: ${safeHeader(input.name)}`,
        text: lines.join("\n"),
        html: `<h1>Nuevo lead</h1><ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`,
      }),
    );
  }
  await settleMailBatch("lead", messages);
}

export async function sendReferralEmail(input: {
  referrerName: string;
  referrerPhone: string;
  referredName: string;
  referredPhone: string;
}) {
  const inbox = businessInbox();
  if (!inbox) return;
  const text = `${input.referrerName} (${input.referrerPhone}) refirió a ${input.referredName} (${input.referredPhone}).`;
  await settleMailBatch("referral", [
    sendMail({
      to: inbox,
      subject: `Nuevo referido: ${safeHeader(input.referredName)}`,
      text,
      html: `<p>${escapeHtml(text)}</p>`,
    }),
  ]);
}

export async function sendComplaintEmails(input: {
  code: string;
  createdAt: Date;
  consumerName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  address: string;
  recordType: "RECLAMO" | "QUEJA";
  goodType: "PRODUCT" | "SERVICE";
  amountCents?: number;
  description: string;
  requestedAction: string;
}) {
  const inbox = businessInbox();
  const recordLabel = input.recordType === "QUEJA" ? "Queja" : "Reclamo";
  const goodLabel = input.goodType === "PRODUCT" ? "Producto" : "Servicio";
  const submittedAt = new Intl.DateTimeFormat("es-PE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Lima",
  }).format(input.createdAt);
  const amount = input.amountCents === undefined
    ? "No indicado"
    : new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(input.amountCents / 100);
  const rows = [
    ["Código", input.code],
    ["Fecha de registro", submittedAt],
    ["Tipo de registro", recordLabel],
    ["Consumidor", input.consumerName],
    ["Documento", `${input.documentType} ${input.documentNumber}`],
    ["Correo", input.email],
    ["Teléfono", input.phone],
    ["Domicilio", input.address],
    ["Relacionado con", goodLabel],
    ["Monto reclamado", amount],
  ];
  const text = [
    `Copia de la hoja ${input.code}`,
    ...rows.slice(1).map(([label, value]) => `${label}: ${value}`),
    "",
    "Detalle:",
    input.description,
    "",
    "Pedido del consumidor:",
    input.requestedAction,
  ].join("\n");
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><th style="padding:6px 10px;text-align:left;vertical-align:top">${escapeHtml(label)}</th><td style="padding:6px 10px">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  const printableCopy = `<div style="max-width:720px;margin:auto;font-family:Arial,sans-serif;color:#171717"><p>Wilo Studio · Libro de Reclamaciones</p><h1 style="font-size:24px">Copia de tu ${recordLabel.toLowerCase()}</h1><p>Conserva o imprime este correo como constancia de los datos registrados.</p><table style="width:100%;border-collapse:collapse">${rowsHtml}</table><h2 style="font-size:18px">Detalle</h2><p style="white-space:pre-wrap">${escapeHtml(input.description)}</p><h2 style="font-size:18px">Pedido del consumidor</h2><p style="white-space:pre-wrap">${escapeHtml(input.requestedAction)}</p><p>Wilo Studio registrará la atención con el código <strong>${escapeHtml(input.code)}</strong>.</p></div>`;
  const confirmation = sendMail({
    to: input.email,
    subject: `${recordLabel} ${input.code} recibido — Wilo Studio`,
    text,
    html: printableCopy,
  });
  const notifications: Array<Promise<MailDelivery>> = [confirmation];
  if (inbox) {
    notifications.push(
      sendMail({
        to: inbox,
        subject: `Nuevo ${recordLabel.toLowerCase()} ${input.code}`,
        text,
        html: printableCopy,
      }),
    );
  }
  await settleMailBatch("complaint", notifications);
}

export async function sendOrderConfirmation(input: {
  number: string;
  customerName: string;
  email: string;
  totalCents: number;
  currency: string;
}) {
  const total = new Intl.NumberFormat("es-PE", { style: "currency", currency: input.currency }).format(
    input.totalCents / 100,
  );
  const inbox = businessInbox();
  const messages: Array<Promise<MailDelivery>> = [
    sendMail({
      to: input.email,
      subject: `Pedido ${input.number} recibido — Wilo Studio`,
      text: `Hola ${input.customerName}, recibimos tu pedido ${input.number} por ${total}.`,
      html: `<p>Hola ${escapeHtml(input.customerName)}, recibimos tu pedido <strong>${escapeHtml(input.number)}</strong> por ${escapeHtml(total)}.</p>`,
    }),
  ];
  if (inbox) {
    messages.push(
      sendMail({
        to: inbox,
        subject: `Nuevo pedido ${input.number}`,
        text: `${input.customerName} realizó un pedido por ${total}.`,
        html: `<p>${escapeHtml(input.customerName)} realizó un pedido por ${escapeHtml(total)}.</p>`,
      }),
    );
  }
  await settleMailBatch("order-confirmation", messages);
}

export async function sendLicenseDelivery(input: {
  number: string;
  customerName: string;
  email: string;
  products: Array<{ name: string; keys: string[] }>;
}) {
  const textLines = input.products.flatMap((product) => [product.name, ...product.keys.map((key) => `- ${key}`)]);
  return sendMail({
    to: input.email,
    subject: `Entrega de licencias — pedido ${input.number}`,
    text: `Hola ${input.customerName}, estas son las licencias de tu pedido ${input.number}:\n\n${textLines.join("\n")}`,
    html: `<p>Hola ${escapeHtml(input.customerName)},</p><p>Estas son las licencias de tu pedido <strong>${escapeHtml(input.number)}</strong>:</p>${input.products
      .map(
        (product) =>
          `<h2>${escapeHtml(product.name)}</h2><ul>${product.keys.map((key) => `<li><code>${escapeHtml(key)}</code></li>`).join("")}</ul>`,
      )
      .join("")}<p>Wilo Studio</p>`,
  });
}
