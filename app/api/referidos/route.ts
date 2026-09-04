import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, rateLimitError, readJsonBody } from "@/lib/api";
import { sendReferralEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { referralSchema } from "@/lib/validation";

export const runtime = "nodejs";

function normalizeBody(body: unknown) {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  return {
    clientId: input.clientId ?? input.cliente_id,
    referrerName: input.referrerName ?? input.nombre_referidor ?? input.tu_nombre,
    referrerEmail: input.referrerEmail ?? input.correo_referidor ?? input.tu_correo,
    referrerPhone: input.referrerPhone ?? input.telefono_referidor ?? input.tu_telefono,
    referredName: input.referredName ?? input.nombre_referido,
    referredEmail: input.referredEmail ?? input.correo_referido,
    referredPhone: input.referredPhone ?? input.telefono_referido,
    notes: input.notes ?? input.notas,
    website: input.website ?? input.sitio_web ?? "",
  };
}

export async function POST(request: NextRequest) {
  try {
    const rate = consumeRateLimit(`referrals:${getClientIp(request)}`, 4, 30 * 60_000);
    if (!rate.allowed) return rateLimitError(rate);
    const normalized = normalizeBody(await readJsonBody(request));
    if (normalized.website) return NextResponse.json({ ok: true }, { status: 202 });
    const input = referralSchema.parse(normalized);

    const referral = await prisma.referral.create({
      data: {
        clientId: input.clientId,
        referrerName: input.referrerName,
        referrerEmail: input.referrerEmail,
        referrerPhone: input.referrerPhone,
        referredName: input.referredName,
        referredEmail: input.referredEmail,
        referredPhone: input.referredPhone,
        notes: input.notes,
      },
      select: { id: true, status: true, createdAt: true },
    });
    await sendReferralEmail({
      referrerName: input.referrerName,
      referrerPhone: input.referrerPhone,
      referredName: input.referredName,
      referredPhone: input.referredPhone,
    });
    return NextResponse.json({ ok: true, referral }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
