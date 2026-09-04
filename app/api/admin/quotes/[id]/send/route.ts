import { NextResponse } from "next/server";
import { escapeHtml, handleRouteError, HttpError } from "@/lib/api";
import { requireAdminResource } from "@/lib/auth-guard";
import { sendMail } from "@/lib/email";
import { claimQuoteDelivery, getQuoteById, releaseQuoteDelivery, setQuoteStatus } from "@/lib/wilo-os/quotes";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await requireAdminResource("quotes", "update");
    const { id } = await context.params;
    const quote = await getQuoteById(id);
    if (!quote) throw new HttpError(404, "Cotización no encontrada.", "QUOTE_NOT_FOUND");
    if (quote.status !== "DRAFT") throw new HttpError(409, "Solo se puede enviar una cotización en borrador.", "QUOTE_NOT_DRAFT");
    if (!quote.client.email) throw new HttpError(422, "El cliente necesita un correo antes de enviar la cotización.", "CLIENT_EMAIL_REQUIRED");
    const deliveryVersion = await claimQuoteDelivery(id, quote.updatedAt);

    const formatter = new Intl.NumberFormat("es-PE", { style: "currency", currency: quote.currency });
    const itemText = quote.items.map((item) => `${item.quantity} × ${item.name}: ${formatter.format(item.subtotalCents / 100)}`);
    const itemRows = quote.items.map((item) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(item.name)}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${escapeHtml(formatter.format(item.subtotalCents / 100))}</td></tr>`).join("");
    const expiry = quote.expiresAt ? new Intl.DateTimeFormat("es-PE", { dateStyle: "long", timeZone: "America/Lima" }).format(quote.expiresAt) : "Sin fecha de vencimiento";
    let delivery;
    try {
      delivery = await sendMail({
        to: quote.client.email,
        subject: `Cotización ${quote.number} — Wilo Studio`,
        text: `Hola ${quote.client.name},\n\nTe enviamos la cotización ${quote.number}.\n\n${itemText.join("\n")}\n\nTotal: ${formatter.format(quote.totalCents / 100)}\nVigencia: ${expiry}\n\n${quote.notes || ""}\n\nWilo Studio`,
        html: `<div style="max-width:680px;margin:auto;font-family:Arial,sans-serif;color:#171717"><p style="font-weight:700">Wilo Studio</p><h1 style="font-size:28px">Cotización ${escapeHtml(quote.number)}</h1><p>Hola ${escapeHtml(quote.client.name)}, compartimos la propuesta preparada para tu proyecto.</p><table style="width:100%;border-collapse:collapse"><thead><tr><th style="padding:8px;text-align:left">Concepto</th><th style="padding:8px">Cantidad</th><th style="padding:8px;text-align:right">Importe</th></tr></thead><tbody>${itemRows}</tbody></table><p style="font-size:20px;text-align:right"><strong>Total: ${escapeHtml(formatter.format(quote.totalCents / 100))}</strong></p><p>Vigencia: ${escapeHtml(expiry)}</p>${quote.notes ? `<p style="white-space:pre-wrap">${escapeHtml(quote.notes)}</p>` : ""}<p>Responde este correo para coordinar el siguiente paso.</p></div>`,
      });
    } catch (error) {
      await releaseQuoteDelivery(id, deliveryVersion);
      throw error;
    }
    if (!delivery.sent) {
      await releaseQuoteDelivery(id, deliveryVersion);
      throw new HttpError(503, "Configura SMTP antes de enviar cotizaciones.", "SMTP_NOT_CONFIGURED");
    }

    const updated = await setQuoteStatus(id, "SENT", {
      actorUserId: user.id,
      allowSentTransition: true,
      expectedUpdatedAt: deliveryVersion,
    });
    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}
