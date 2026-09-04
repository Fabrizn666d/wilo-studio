import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { RateLimitResult } from "@/lib/rate-limit";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "REQUEST_ERROR",
  ) {
    super(message);
  }
}

export async function readJsonBody(request: Request, maxBytes = 100_000): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > maxBytes) throw new HttpError(413, "La solicitud es demasiado grande.", "PAYLOAD_TOO_LARGE");

  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > maxBytes) {
    throw new HttpError(413, "La solicitud es demasiado grande.", "PAYLOAD_TOO_LARGE");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new HttpError(400, "El contenido JSON no es válido.", "INVALID_JSON");
  }
}

export function rateLimitError(result: RateLimitResult) {
  return NextResponse.json(
    { ok: false, error: "Demasiados intentos. Inténtalo nuevamente en unos minutos.", code: "RATE_LIMITED" },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
  );
}

export function handleRouteError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        ok: false,
        error: "Revisa los datos enviados.",
        code: "VALIDATION_ERROR",
        fields: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      },
      { status: 422 },
    );
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "Ya existe un registro con esos datos.", code: "DUPLICATE_RECORD" },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json({ ok: false, error: "Registro no encontrado.", code: "NOT_FOUND" }, { status: 404 });
    }
    if (error.code === "P2003") {
      return NextResponse.json(
        { ok: false, error: "No se puede eliminar porque el registro está en uso.", code: "RECORD_IN_USE" },
        { status: 409 },
      );
    }
  }

  console.error("Unhandled API error", error);
  return NextResponse.json(
    { ok: false, error: "No pudimos procesar la solicitud.", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}

export function cleanText(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#039;",
      '"': "&quot;",
    };
    return entities[character];
  });
}
