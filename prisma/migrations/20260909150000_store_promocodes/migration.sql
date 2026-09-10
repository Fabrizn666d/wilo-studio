-- Store delivery data and server-validated promotion codes.
ALTER TABLE "Order" ADD COLUMN     "department" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "addressReference" TEXT,
ADD COLUMN     "discountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "promoCode" TEXT;

ALTER TABLE "Promotion" ADD COLUMN     "code" TEXT,
ADD COLUMN     "discountType" TEXT,
ADD COLUMN     "discountValue" INTEGER,
ADD COLUMN     "minimumCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxUses" INTEGER,
ADD COLUMN     "usedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "categorySlugs" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "productIds" TEXT NOT NULL DEFAULT '[]';

CREATE UNIQUE INDEX "Promotion_code_key" ON "Promotion"("code");
