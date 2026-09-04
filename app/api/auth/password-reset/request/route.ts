import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { escapeHtml, handleRouteError, rateLimitError, readJsonBody } from "@/lib/api";
import { isSmtpConfigured, sendMail } from "@/lib/email";
import { isUserRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const requestSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) }).strict();
const genericResponse = { ok: true, message: "Si la cuenta existe y el correo está configurado, recibirás un enlace de recuperación." };

export async function POST(request: NextRequest) {
  try {
    const input = requestSchema.parse(await readJsonBody(request, 5_000));
    const rate = consumeRateLimit(`password-reset-request:${getClientIp(request)}:${input.email}`, 3, 60 * 60_000);
    if (!rate.allowed) return rateLimitError(rate);
    if (!isSmtpConfigured()) return NextResponse.json(genericResponse, { status: 202 });

    const user = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true, email: true, name: true, role: true, active: true } });
    if (!user?.active || !isUserRole(user.role)) return NextResponse.json(genericResponse, { status: 202 });

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60_000);
    const reset = await prisma.$transaction(async (transaction) => {
      await transaction.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: now } });
      return transaction.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });
    });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.SITE_URL || request.nextUrl.origin;
    const resetUrl = new URL("/admin/restablecer", baseUrl);
    resetUrl.searchParams.set("token", token);
    try {
      const delivery = await sendMail({
        to: user.email,
        subject: "Recupera tu acceso a Wilo OS",
        text: `Hola ${user.name || "equipo Wilo"}, usa este enlace durante los próximos 30 minutos para crear una nueva contraseña:\n\n${resetUrl.toString()}\n\nSi no solicitaste este cambio, ignora el mensaje.`,
        html: `<div style="max-width:620px;margin:auto;font-family:Arial,sans-serif;color:#171717"><p style="font-weight:700">Wilo OS</p><h1>Recupera tu acceso</h1><p>Hola ${escapeHtml(user.name || "equipo Wilo")}, este enlace estará disponible durante 30 minutos.</p><p><a style="display:inline-block;padding:12px 18px;border-radius:8px;background:#ffd21f;color:#171717;font-weight:700;text-decoration:none" href="${escapeHtml(resetUrl.toString())}">Crear nueva contraseña</a></p><p>Si no solicitaste este cambio, ignora el mensaje.</p></div>`,
      });
      if (!delivery.sent) await prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } });
    } catch (error) {
      await prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }).catch(() => undefined);
      console.error("Password reset email delivery failed", { error: error instanceof Error ? error.message : "Unknown SMTP error" });
    }

    return NextResponse.json(genericResponse, { status: 202 });
  } catch (error) {
    return handleRouteError(error);
  }
}
