import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, HttpError, rateLimitError, readJsonBody } from "@/lib/api";
import { sendLeadEmails } from "@/lib/email";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { leadSchema } from "@/lib/validation";
import { createInboundLead } from "@/lib/wilo-os/leads";
import { leadAttributionFromRequest } from "@/lib/wilo-os/attribution";

export const runtime = "nodejs";

function publicLeadSource(request: NextRequest) {
  const fallback = "studio-contact";
  const referer = request.headers.get("referer");
  if (!referer) return fallback;
  try {
    const url = new URL(referer);
    const requestHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const configuredHost = process.env.SITE_URL ? new URL(process.env.SITE_URL).host : null;
    if (url.host !== requestHost && url.host !== configuredHost) return fallback;
    if (url.pathname === "/education" || url.pathname.startsWith("/education/")) return "education-page";
    if (url.pathname === "/events" || url.pathname.startsWith("/events/")) return "events-page";
    if (url.pathname === "/express" || url.pathname.startsWith("/express/")) return "express-page";
    return fallback;
  } catch {
    return fallback;
  }
}

function normalizeLeadBody(body: unknown) {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const rawType = input.type ?? input.tipo_solicitud;
  const type =
    rawType === "cotizacion" || rawType === "QUOTE"
      ? "QUOTE"
      : rawType === "consultoria" || rawType === "CONSULTATION"
        ? "CONSULTATION"
        : "CONTACT";
  return {
    name: input.name ?? input.nombre,
    company: input.company ?? input.empresa,
    phone: input.phone ?? input.telefono,
    email: input.email ?? input.correo,
    type,
    service: input.service ?? input.servicio_interes,
    message: input.message ?? input.mensaje,
    source: "studio-contact",
    details: input.details ?? input.detalles ?? {},
    website: input.website ?? input.sitio_web ?? "",
  };
}

export async function POST(request: NextRequest) {
  try {
    const rate = consumeRateLimit(`leads:${getClientIp(request)}`, 5, 10 * 60_000);
    if (!rate.allowed) return rateLimitError(rate);

    const raw = await readJsonBody(request);
    const normalized = normalizeLeadBody(raw);
    // Public callers cannot assert MANUAL or impersonate another channel.
    // Brand attribution is derived from the same-origin page that submitted.
    normalized.source = publicLeadSource(request);
    normalized.details = {
      ...(normalized.details && typeof normalized.details === "object" ? normalized.details : {}),
      ...leadAttributionFromRequest(request),
    };
    if (normalized.website) return NextResponse.json({ ok: true }, { status: 202 });
    const input = leadSchema.parse(normalized);

    if (input.details.consent !== true) {
      throw new HttpError(422, "Debes autorizar el uso de tus datos para enviar la solicitud.", "CONSENT_REQUIRED");
    }
    const elapsed = input.details.clientElapsedMs;
    if (typeof elapsed !== "number" || !Number.isFinite(elapsed) || elapsed < 1_000) {
      throw new HttpError(422, "Espera un momento y revisa los datos antes de enviar.", "FORM_TOO_FAST");
    }

    const lead = await createInboundLead(input);

    await sendLeadEmails({ ...input, phone: input.phone, company: input.company, service: input.service, message: input.message });
    return NextResponse.json(
      {
        ok: true,
        lead: {
          id: lead.id,
          nombre: lead.name,
          correo: lead.email,
          tipo_solicitud: lead.type.toLowerCase(),
          servicio_interes: lead.service,
          fecha_creacion: lead.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
