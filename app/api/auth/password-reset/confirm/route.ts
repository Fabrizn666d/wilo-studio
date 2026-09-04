import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, HttpError, rateLimitError, readJsonBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { recordActivity } from "@/lib/wilo-os/activity";

export const runtime = "nodejs";

const confirmSchema = z.object({
  token: z.string().trim().min(40).max(100).regex(/^[A-Za-z0-9_-]+$/),
  password: z.string().min(12).max(128),
}).strict();

export async function POST(request: NextRequest) {
  try {
    const rate = consumeRateLimit(`password-reset-confirm:${getClientIp(request)}`, 5, 15 * 60_000);
    if (!rate.allowed) return rateLimitError(rate);
    const input = confirmSchema.parse(await readJsonBody(request, 5_000));
    const tokenHash = createHash("sha256").update(input.token).digest("hex");
    const passwordHash = await bcrypt.hash(input.password, 12);
    const now = new Date();

    await prisma.$transaction(async (transaction) => {
      const reset = await transaction.passwordResetToken.findUnique({
        where: { tokenHash },
        include: { user: { select: { id: true, active: true } } },
      });
      if (!reset?.user.active || reset.usedAt || reset.expiresAt <= now) {
        throw new HttpError(422, "El enlace es inválido o ya venció.", "INVALID_RESET_TOKEN");
      }
      const claimed = await transaction.passwordResetToken.updateMany({
        where: { id: reset.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (claimed.count !== 1) throw new HttpError(422, "El enlace es inválido o ya venció.", "INVALID_RESET_TOKEN");
      await transaction.user.update({
        where: { id: reset.user.id },
        data: { passwordHash, sessionVersion: { increment: 1 } },
      });
      await transaction.passwordResetToken.updateMany({ where: { userId: reset.user.id, usedAt: null }, data: { usedAt: now } });
      await recordActivity(transaction, {
        actorUserId: reset.user.id,
        entityType: "USER",
        entityId: reset.user.id,
        action: "PASSWORD_RESET_COMPLETED",
      });
    });

    return NextResponse.json({ ok: true, message: "Contraseña actualizada. Ya puedes iniciar sesión." });
  } catch (error) {
    return handleRouteError(error);
  }
}
