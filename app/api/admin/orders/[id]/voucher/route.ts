import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { HttpError, handleRouteError } from "@/lib/api";
import { requireStaff } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { resolveVoucherUploadPath } from "@/lib/uploads";

export const runtime = "nodejs";

const mimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff(["ADMIN"]);
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id }, select: { number: true, voucherUrl: true } });
    if (!order?.voucherUrl) throw new HttpError(404, "El pedido no tiene un voucher adjunto.", "VOUCHER_NOT_FOUND");

    const absolutePath = resolveVoucherUploadPath(order.voucherUrl);
    const extension = path.extname(absolutePath).toLowerCase();
    const mimeType = mimeTypes[extension];
    if (!mimeType) throw new HttpError(415, "Tipo de voucher no permitido.", "INVALID_VOUCHER_TYPE");
    const bytes = await readFile(absolutePath).catch(() => null);
    if (!bytes) throw new HttpError(404, "No encontramos el archivo del voucher.", "VOUCHER_FILE_NOT_FOUND");
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="voucher-${order.number}${extension}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
