import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, rateLimitError, readJsonBody } from "@/lib/api";
import { sendComplaintEmails } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { complaintSchema } from "@/lib/validation";

export const runtime = "nodejs";

function complaintCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `REC-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function normalizeBody(body: unknown) {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const soles = typeof input.monto === "number" ? Math.round(input.monto * 100) : undefined;
  const rawDescription = input.description ?? input.descripcion;
  const legacyRecordType = typeof rawDescription === "string" ? /^\s*\[(RECLAMO|QUEJA)\]\s*/i.exec(rawDescription) : null;
  return {
    consumerName: input.consumerName ?? input.nombre_consumidor ?? input.nombre,
    documentType: String(input.documentType ?? input.tipo_documento ?? "").toUpperCase(),
    documentNumber: input.documentNumber ?? input.numero_documento,
    email: input.email ?? input.correo,
    phone: input.phone ?? input.telefono,
    address: input.address ?? input.direccion,
    recordType: String(input.recordType ?? input.tipo_registro ?? legacyRecordType?.[1] ?? "").toUpperCase(),
    goodType:
      String(input.goodType ?? input.tipo_bien ?? "").toLowerCase() === "producto"
        ? "PRODUCT"
        : String(input.goodType ?? input.tipo_bien ?? "").toLowerCase() === "servicio"
          ? "SERVICE"
          : String(input.goodType ?? input.tipo_bien ?? "").toUpperCase(),
    amountCents: input.amountCents ?? input.monto_centimos ?? soles,
    description: legacyRecordType && typeof rawDescription === "string"
      ? rawDescription.slice(legacyRecordType[0].length)
      : rawDescription,
    requestedAction: input.requestedAction ?? input.pedido ?? input.accion_solicitada,
    website: input.website ?? input.sitio_web ?? "",
  };
}

export async function POST(request: NextRequest) {
  try {
    const rate = consumeRateLimit(`complaints:${getClientIp(request)}`, 3, 60 * 60_000);
    if (!rate.allowed) return rateLimitError(rate);
    const normalized = normalizeBody(await readJsonBody(request));
    if (normalized.website) return NextResponse.json({ ok: true }, { status: 202 });
    const input = complaintSchema.parse(normalized);
    const code = complaintCode();
    const complaint = await prisma.complaint.create({
      data: {
        code,
        consumerName: input.consumerName,
        documentType: input.documentType,
        documentNumber: input.documentNumber,
        email: input.email,
        phone: input.phone,
        address: input.address,
        recordType: input.recordType,
        goodType: input.goodType,
        amountCents: input.amountCents,
        description: input.description,
        requestedAction: input.requestedAction,
      },
      select: { id: true, code: true, status: true, createdAt: true },
    });
    await sendComplaintEmails({
      code,
      createdAt: complaint.createdAt,
      consumerName: input.consumerName,
      documentType: input.documentType,
      documentNumber: input.documentNumber,
      email: input.email,
      phone: input.phone,
      address: input.address,
      recordType: input.recordType,
      goodType: input.goodType,
      amountCents: input.amountCents,
      description: input.description,
      requestedAction: input.requestedAction,
    });
    return NextResponse.json({ ok: true, complaint }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
