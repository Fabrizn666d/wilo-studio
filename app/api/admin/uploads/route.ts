import { NextRequest, NextResponse } from "next/server";
import { HttpError, handleRouteError, rateLimitError } from "@/lib/api";
import { requireAdminResource } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";
import { persistUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminResource("uploads", "create");
    const rate = consumeRateLimit(`admin-uploads:${user.id}`, 30, 60 * 60_000);
    if (!rate.allowed) return rateLimitError(rate);
    const declaredLength = Number(request.headers.get("content-length") || 0);
    if (declaredLength > 5.5 * 1024 * 1024) {
      throw new HttpError(413, "El archivo debe pesar como máximo 5 MB.", "INVALID_UPLOAD_SIZE");
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(422, "Adjunta un archivo válido.", "FILE_REQUIRED");
    const alt = String(form.get("alt") || "").trim().slice(0, 500) || null;
    const uploaded = await persistUpload(file, "media");
    const media = await prisma.media.create({ data: { ...uploaded, alt, uploadedById: user.id } });
    return NextResponse.json({ ok: true, media }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
