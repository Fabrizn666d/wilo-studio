import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { encryptSecret, fingerprintSecret } from "@/lib/crypto";
import { HttpError, handleRouteError, readJsonBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const createSchema = z
  .object({
    productId: z.string().cuid(),
    keys: z.array(z.string().trim().min(3).max(500)).min(1).max(100),
  })
  .strict();

export async function GET(request: NextRequest) {
  try {
    await requireStaff(["ADMIN"]);
    const productId = request.nextUrl.searchParams.get("productId") || undefined;
    const status = request.nextUrl.searchParams.get("status")?.slice(0, 40);
    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 25));
    const where = { ...(productId ? { productId } : {}), ...(status ? { status } : {}) };
    const [keys, total] = await Promise.all([
      prisma.licenseKey.findMany({
        where,
        select: {
          id: true,
          productId: true,
          status: true,
          orderItemId: true,
          deliveredAt: true,
          createdAt: true,
          updatedAt: true,
          product: { select: { id: true, name: true, sku: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.licenseKey.count({ where }),
    ]);
    return NextResponse.json({ ok: true, data: keys, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireStaff(["ADMIN"]);
    const input = createSchema.parse(await readJsonBody(request, 100_000));
    const uniqueKeys = [...new Set(input.keys)];
    const product = await prisma.product.findUnique({ where: { id: input.productId }, select: { id: true, digital: true } });
    if (!product) throw new HttpError(404, "Producto no encontrado.", "PRODUCT_NOT_FOUND");
    if (!product.digital) throw new HttpError(409, "Solo los productos digitales admiten claves de licencia.", "PRODUCT_NOT_DIGITAL");

    await prisma.$transaction(
      uniqueKeys.map((secret) => {
        const encrypted = encryptSecret(secret);
        return prisma.licenseKey.create({
          data: { productId: input.productId, ...encrypted, fingerprint: fingerprintSecret(secret) },
        });
      }),
    );
    return NextResponse.json({ ok: true, created: uniqueKeys.length }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
