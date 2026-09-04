import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, rateLimitError, readJsonBody } from "@/lib/api";
import { sendLeadEmails } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { leadSchema, quoteSchema } from "@/lib/validation";
import { createInboundLead } from "@/lib/wilo-os/leads";
import { leadAttributionFromRequest } from "@/lib/wilo-os/attribution";

export const runtime = "nodejs";

function normalizeQuoteBody(body: unknown) {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  return {
    name: input.name ?? input.nombre,
    company: input.company ?? input.empresa,
    phone: input.phone ?? input.telefono,
    email: input.email ?? input.correo,
    projectType: input.projectType ?? input.tipo_proyecto ?? input.servicio,
    planSlug: input.planSlug ?? input.plan_slug,
    features: input.features ?? input.funciones ?? [],
    message: input.message ?? input.mensaje,
    consent: input.consent,
    clientElapsedMs: input.clientElapsedMs,
    website: input.website ?? input.sitio_web ?? "",
  };
}

export async function POST(request: NextRequest) {
  try {
    const rate = consumeRateLimit(`quotes:${getClientIp(request)}`, 5, 15 * 60_000);
    if (!rate.allowed) return rateLimitError(rate);

    const normalized = normalizeQuoteBody(await readJsonBody(request));
    if (normalized.website) return NextResponse.json({ ok: true }, { status: 202 });
    const input = quoteSchema.parse(normalized);
    const plan = input.planSlug
      ? await prisma.plan.findFirst({ where: { slug: input.planSlug, published: true } })
      : null;
    const estimatedFromCents = plan ? plan.priceCents + plan.taxCents : null;
    const details = {
      projectType: input.projectType,
      planSlug: input.planSlug ?? null,
      features: input.features,
      priceNote:
        "Todos los proyectos son personalizados. El precio final puede variar según funcionalidades, secciones, integraciones y complejidad.",
      consent: input.consent,
      clientElapsedMs: input.clientElapsedMs,
      ...leadAttributionFromRequest(request),
    };
    const lead = await createInboundLead(
      leadSchema.parse({
        name: input.name,
        company: input.company,
        phone: input.phone,
        email: input.email,
        type: "QUOTE",
        service: input.projectType,
        message: input.message,
        details,
        source: "quote-wizard",
      }),
      { estimatedMinCents: estimatedFromCents },
    );

    await sendLeadEmails({
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      service: input.projectType,
      message: input.message,
      type: "QUOTE",
    });
    return NextResponse.json(
      {
        ok: true,
        leadId: lead.id,
        estimate: estimatedFromCents
          ? { currency: plan?.currency ?? "PEN", fromCents: estimatedFromCents, finalPriceRequiresReview: true }
          : null,
        note: details.priceNote,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
