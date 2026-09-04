-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "challenge" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "contentStatus" TEXT NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "deliverables" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "publicCaseStudy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "repositoryUrl" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "solution" TEXT,
ADD COLUMN     "stagingUrl" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PLANNING',
ADD COLUMN     "targetDate" TIMESTAMP(3),
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "year" INTEGER,
ALTER COLUMN "published" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'PE',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "whatsapp" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "budgetRange" TEXT,
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "consentAt" TIMESTAMP(3),
ADD COLUMN     "followUpNote" TEXT,
ADD COLUMN     "lastContactAt" TIMESTAMP(3),
ADD COLUMN     "launchTimeframe" TEXT,
ADD COLUMN     "lostReason" TEXT,
ADD COLUMN     "nextFollowUpAt" TIMESTAMP(3),
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'NORMAL';

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "leadId" TEXT,
    "projectId" TEXT,
    "createdById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'PEN',
    "taxRateBps" INTEGER NOT NULL DEFAULT 0,
    "subtotalCents" INTEGER NOT NULL,
    "taxCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "sentAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "deliveryStartedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceCents" INTEGER NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteCounter" (
    "year" INTEGER NOT NULL,
    "nextValue" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteCounter_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quote_number_key" ON "Quote"("number");

-- CreateIndex
CREATE INDEX "Quote_status_createdAt_idx" ON "Quote"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Quote_clientId_createdAt_idx" ON "Quote"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "Quote_leadId_idx" ON "Quote"("leadId");

-- CreateIndex
CREATE INDEX "Quote_projectId_idx" ON "Quote"("projectId");

-- CreateIndex
CREATE INDEX "Quote_createdById_idx" ON "Quote"("createdById");

-- CreateIndex
CREATE INDEX "QuoteItem_quoteId_position_idx" ON "QuoteItem"("quoteId", "position");

-- CreateIndex
CREATE INDEX "Activity_entityType_entityId_createdAt_idx" ON "Activity"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_actorUserId_createdAt_idx" ON "Activity"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_action_createdAt_idx" ON "Activity"("action", "createdAt");

-- CreateIndex
CREATE INDEX "Note_entityType_entityId_createdAt_idx" ON "Note"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "Note_authorId_createdAt_idx" ON "Note"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "Project_status_archivedAt_idx" ON "Project"("status", "archivedAt");

-- CreateIndex
CREATE INDEX "Project_assignedToId_status_idx" ON "Project"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "Project_publicCaseStudy_contentStatus_sortOrder_idx" ON "Project"("publicCaseStudy", "contentStatus", "sortOrder");

-- CreateIndex
CREATE INDEX "Client_email_idx" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_phone_idx" ON "Client"("phone");

-- CreateIndex
CREATE INDEX "Client_archivedAt_name_idx" ON "Client"("archivedAt", "name");

-- CreateIndex
CREATE INDEX "Lead_source_createdAt_idx" ON "Lead"("source", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_assignedToId_status_idx" ON "Lead"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "Lead_clientId_idx" ON "Lead"("clientId");

-- CreateIndex
CREATE INDEX "Lead_nextFollowUpAt_status_idx" ON "Lead"("nextFollowUpAt", "status");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DataMigration: preserve administrative access and normalize legacy CRM values.
UPDATE "User"
SET "role" = 'SUPER_ADMIN'
WHERE "id" = (
    SELECT "id" FROM "User"
    WHERE "active" = true AND "role" = 'ADMIN'
    ORDER BY "createdAt" ASC
    LIMIT 1
)
AND NOT EXISTS (SELECT 1 FROM "User" WHERE "active" = true AND "role" = 'SUPER_ADMIN');

UPDATE "Lead"
SET "source" = CASE
    WHEN LOWER("source") LIKE 'events%' THEN 'EVENTS'
    WHEN LOWER("source") LIKE 'education%' THEN 'EDUCATION'
    WHEN LOWER("source") LIKE 'express%' THEN 'EXPRESS'
    WHEN LOWER("source") = 'manual' THEN 'MANUAL'
    ELSE 'STUDIO'
END;

UPDATE "Lead" SET "status" = 'CONTACTED' WHERE "status" = 'IN_PROGRESS';
UPDATE "Lead"
SET "status" = 'CONTACTED', "archivedAt" = "updatedAt"
WHERE "status" = 'ARCHIVED';

-- Password reset and session revocation support.
ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");
CREATE INDEX "PasswordResetToken_expiresAt_usedAt_idx" ON "PasswordResetToken"("expiresAt", "usedAt");
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
