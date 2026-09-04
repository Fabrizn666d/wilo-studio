import { unlink } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { HttpError, handleRouteError, rateLimitError } from "@/lib/api";
import { publicTokenMatches } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { persistUpload, resolveVoucherUploadPath } from "@/lib/uploads";
import { voucherAccessSchema } from "@/lib/validation";

export const runtime = "nodejs";

async function removeFailedVoucher(relativePath: string) {
  const absolutePath = resolveVoucherUploadPath(relativePath);
  await unlink(absolutePath).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") {
      console.error("Could not remove a failed voucher upload", { code: error.code });
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const rate = consumeRateLimit(`vouchers:${getClientIp(request)}`, 5, 30 * 60_000);
    if (!rate.allowed) return rateLimitError(rate);
    const declaredLength = Number(request.headers.get("content-length") || 0);
    if (declaredLength > 5.5 * 1024 * 1024) {
      throw new HttpError(413, "El archivo debe pesar como máximo 5 MB.", "INVALID_UPLOAD_SIZE");
    }

    const form = await request.formData();
    const access = voucherAccessSchema.parse({
      orderNumber: form.get("orderNumber") ?? form.get("numero_pedido"),
      email: form.get("email") ?? form.get("correo"),
      token: form.get("token"),
    });
    const file = form.get("file") ?? form.get("voucher") ?? form.get("comprobante");
    if (!(file instanceof File)) throw new HttpError(422, "Adjunta un comprobante válido.", "FILE_REQUIRED");

    const order = await prisma.order.findFirst({
      where: { number: access.orderNumber, email: access.email },
      select: { id: true, status: true, paymentMethod: true, voucherUrl: true, publicTokenHash: true },
    });
    if (!order || !publicTokenMatches(access.token, order.publicTokenHash)) {
      throw new HttpError(404, "No encontramos el pedido.", "ORDER_NOT_FOUND");
    }
    if (order.paymentMethod !== "MANUAL" || order.status !== "PENDING" || order.voucherUrl) {
      throw new HttpError(409, "Este pedido no admite otro comprobante.", "ORDER_VOUCHER_CONFLICT");
    }

    const upload = await persistUpload(file, "vouchers");
    try {
      const updated = await prisma.order.updateMany({
        where: { id: order.id, paymentMethod: "MANUAL", status: "PENDING", voucherUrl: null },
        data: { voucherUrl: upload.path, status: "VERIFYING" },
      });
      if (updated.count !== 1) {
        throw new HttpError(409, "El pedido ya recibió un comprobante.", "ORDER_VOUCHER_RACE");
      }
    } catch (error) {
      await removeFailedVoucher(upload.path);
      throw error;
    }
    return NextResponse.json({ ok: true, status: "VERIFYING" });
  } catch (error) {
    return handleRouteError(error);
  }
}
