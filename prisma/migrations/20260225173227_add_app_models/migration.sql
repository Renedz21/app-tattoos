-- CreateEnum
CREATE TYPE "TattooStyle" AS ENUM ('FINE_LINE', 'BLACKWORK', 'REALISM', 'TRADITIONAL', 'LETTERING', 'MINIMAL', 'OTHER');

-- CreateEnum
CREATE TYPE "TattooSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'OTHER');

-- CreateEnum
CREATE TYPE "ColorMode" AS ENUM ('BLACK_AND_GREY', 'COLOR');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'REFERENCES_SET', 'GENERATED', 'SENT', 'QUOTED', 'DEPOSIT_PENDING', 'APPOINTMENT_CONFIRMED', 'FINISHED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ImageKind" AS ENUM ('INITIAL', 'VARIATION', 'REFINEMENT');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('GENERATE_IMAGES', 'GENERATE_VARIATIONS', 'REFINE_IMAGE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'DONE', 'ERROR', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('AI_STUDIO', 'VERTEX');

-- CreateEnum
CREATE TYPE "PaymentKind" AS ENUM ('DEPOSIT', 'FULL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('YAPE', 'PLIN', 'TRANSFER', 'CASH', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUBMITTED', 'CONFIRMED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "tattoo_request" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT,
    "trackingToken" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'DRAFT',
    "userId" TEXT,
    "assignedToId" TEXT,
    "title" TEXT,
    "style" "TattooStyle" NOT NULL DEFAULT 'OTHER',
    "styleOther" TEXT,
    "bodyZone" TEXT NOT NULL,
    "size" "TattooSize" NOT NULL DEFAULT 'OTHER',
    "sizeNotes" TEXT,
    "colorMode" "ColorMode" NOT NULL DEFAULT 'BLACK_AND_GREY',
    "detailLevel" INTEGER NOT NULL DEFAULT 3,
    "specialInstructions" TEXT,
    "finalPrompt" TEXT,
    "selectedImageId" TEXT,
    "fullName" TEXT,
    "whatsappE164" TEXT,
    "district" TEXT,
    "availability" TEXT,
    "extraComments" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'PEN',
    "priceCents" INTEGER,
    "depositCents" INTEGER,
    "depositDueAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "quotedAt" TIMESTAMP(3),
    "depositSubmittedAt" TIMESTAMP(3),
    "depositConfirmedAt" TIMESTAMP(3),
    "appointmentAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tattoo_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_image" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "r2Key" TEXT NOT NULL,
    "publicUrl" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reference_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_image" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "kind" "ImageKind" NOT NULL DEFAULT 'INITIAL',
    "slotIndex" INTEGER,
    "r2Key" TEXT NOT NULL,
    "publicUrl" TEXT,
    "mimeType" TEXT DEFAULT 'image/png',
    "sizeBytes" INTEGER,
    "modelName" TEXT,
    "seed" TEXT,
    "parentImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_job" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "baseImageId" TEXT,
    "provider" "AiProvider" NOT NULL DEFAULT 'AI_STUDIO',
    "modelName" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generation_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "kind" "PaymentKind" NOT NULL DEFAULT 'DEPOSIT',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "PaymentMethod",
    "currency" TEXT NOT NULL DEFAULT 'PEN',
    "amountCents" INTEGER NOT NULL,
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "proofR2Key" TEXT,
    "proofUrl" TEXT,
    "proofMimeType" TEXT,
    "proofSizeBytes" INTEGER,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_item" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "style" "TattooStyle" NOT NULL DEFAULT 'OTHER',
    "bodyZone" TEXT,
    "colorMode" "ColorMode" NOT NULL DEFAULT 'BLACK_AND_GREY',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_image" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "r2Key" TEXT NOT NULL,
    "publicUrl" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tattoo_request_requestCode_key" ON "tattoo_request"("requestCode");

-- CreateIndex
CREATE UNIQUE INDEX "tattoo_request_trackingToken_key" ON "tattoo_request"("trackingToken");

-- CreateIndex
CREATE INDEX "tattoo_request_status_createdAt_idx" ON "tattoo_request"("status", "createdAt");

-- CreateIndex
CREATE INDEX "tattoo_request_requestCode_idx" ON "tattoo_request"("requestCode");

-- CreateIndex
CREATE INDEX "tattoo_request_fullName_idx" ON "tattoo_request"("fullName");

-- CreateIndex
CREATE INDEX "tattoo_request_whatsappE164_idx" ON "tattoo_request"("whatsappE164");

-- CreateIndex
CREATE INDEX "reference_image_requestId_createdAt_idx" ON "reference_image"("requestId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "reference_image_requestId_r2Key_key" ON "reference_image"("requestId", "r2Key");

-- CreateIndex
CREATE INDEX "generated_image_requestId_createdAt_idx" ON "generated_image"("requestId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "generated_image_requestId_kind_slotIndex_key" ON "generated_image"("requestId", "kind", "slotIndex");

-- CreateIndex
CREATE INDEX "generation_job_status_runAt_idx" ON "generation_job"("status", "runAt");

-- CreateIndex
CREATE INDEX "generation_job_requestId_createdAt_idx" ON "generation_job"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "payment_requestId_createdAt_idx" ON "payment"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "payment_status_dueAt_idx" ON "payment"("status", "dueAt");

-- CreateIndex
CREATE INDEX "portfolio_item_isPublished_sortOrder_idx" ON "portfolio_item"("isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "portfolio_item_style_idx" ON "portfolio_item"("style");

-- CreateIndex
CREATE INDEX "portfolio_image_itemId_sortOrder_idx" ON "portfolio_image"("itemId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_image_itemId_r2Key_key" ON "portfolio_image"("itemId", "r2Key");

-- AddForeignKey
ALTER TABLE "tattoo_request" ADD CONSTRAINT "tattoo_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tattoo_request" ADD CONSTRAINT "tattoo_request_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tattoo_request" ADD CONSTRAINT "tattoo_request_selectedImageId_fkey" FOREIGN KEY ("selectedImageId") REFERENCES "generated_image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reference_image" ADD CONSTRAINT "reference_image_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "tattoo_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_image" ADD CONSTRAINT "generated_image_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "tattoo_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_image" ADD CONSTRAINT "generated_image_parentImageId_fkey" FOREIGN KEY ("parentImageId") REFERENCES "generated_image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_job" ADD CONSTRAINT "generation_job_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "tattoo_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_job" ADD CONSTRAINT "generation_job_baseImageId_fkey" FOREIGN KEY ("baseImageId") REFERENCES "generated_image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "tattoo_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_image" ADD CONSTRAINT "portfolio_image_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "portfolio_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
