import { HttpError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export type PromotionLine = {
  productId: string;
  categorySlug: string;
  totalCents: number;
};

function parseStringList(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function normalizePromoCode(value: string | null | undefined) {
  return (value || "").trim().toUpperCase();
}

export async function calculatePromotion(codeValue: string | null | undefined, lines: readonly PromotionLine[]) {
  const code = normalizePromoCode(codeValue);
  if (!code) return null;

  const promotion = await prisma.promotion.findUnique({ where: { code } });
  const now = new Date();
  if (!promotion || !promotion.active || !promotion.discountType || !promotion.discountValue) {
    throw new HttpError(422, "El cupón no existe o no está activo.", "INVALID_PROMO_CODE");
  }
  if (promotion.startAt && promotion.startAt > now) {
    throw new HttpError(422, "Este cupón todavía no está vigente.", "PROMO_NOT_STARTED");
  }
  if (promotion.endAt && promotion.endAt < now) {
    throw new HttpError(422, "Este cupón ya venció.", "PROMO_EXPIRED");
  }
  if (promotion.maxUses !== null && promotion.usedCount >= promotion.maxUses) {
    throw new HttpError(422, "Este cupón alcanzó su límite de usos.", "PROMO_USAGE_LIMIT");
  }

  const categorySlugs = new Set(parseStringList(promotion.categorySlugs));
  const productIds = new Set(parseStringList(promotion.productIds));
  const unrestricted = categorySlugs.size === 0 && productIds.size === 0;
  const eligibleCents = lines.reduce((sum, line) => {
    const eligible = unrestricted || categorySlugs.has(line.categorySlug) || productIds.has(line.productId);
    return sum + (eligible ? line.totalCents : 0);
  }, 0);
  const cartCents = lines.reduce((sum, line) => sum + line.totalCents, 0);

  if (cartCents < promotion.minimumCents) {
    throw new HttpError(
      422,
      `Este cupón requiere una compra mínima de S/ ${(promotion.minimumCents / 100).toFixed(2)}.`,
      "PROMO_MINIMUM_NOT_MET",
    );
  }
  if (eligibleCents <= 0) {
    throw new HttpError(422, "El cupón no aplica a los productos seleccionados.", "PROMO_NOT_APPLICABLE");
  }

  const discountCents = promotion.discountType === "PERCENT"
    ? Math.round(eligibleCents * Math.min(promotion.discountValue, 100) / 100)
    : Math.min(eligibleCents, promotion.discountValue);

  return {
    id: promotion.id,
    code,
    discountCents: Math.max(0, Math.min(discountCents, cartCents)),
    totalCents: Math.max(0, cartCents - discountCents),
    title: promotion.title,
    maxUses: promotion.maxUses,
  };
}
