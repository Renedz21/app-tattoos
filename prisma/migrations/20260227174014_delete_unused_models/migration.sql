/*
  Warnings:

  - The values [DRAFT,REFERENCES_SET,GENERATED] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `assignedToId` on the `tattoo_request` table. All the data in the column will be lost.
  - You are about to drop the column `selectedImageId` on the `tattoo_request` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `tattoo_request` table. All the data in the column will be lost.
  - You are about to drop the `generated_image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `generation_job` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('SENT', 'QUOTED', 'DEPOSIT_PENDING', 'APPOINTMENT_CONFIRMED', 'FINISHED', 'EXPIRED');
ALTER TABLE "public"."tattoo_request" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "tattoo_request" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "public"."RequestStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "generated_image" DROP CONSTRAINT "generated_image_parentImageId_fkey";

-- DropForeignKey
ALTER TABLE "generated_image" DROP CONSTRAINT "generated_image_requestId_fkey";

-- DropForeignKey
ALTER TABLE "generation_job" DROP CONSTRAINT "generation_job_baseImageId_fkey";

-- DropForeignKey
ALTER TABLE "generation_job" DROP CONSTRAINT "generation_job_requestId_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_requestId_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_verifiedById_fkey";

-- DropForeignKey
ALTER TABLE "tattoo_request" DROP CONSTRAINT "tattoo_request_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "tattoo_request" DROP CONSTRAINT "tattoo_request_selectedImageId_fkey";

-- DropForeignKey
ALTER TABLE "tattoo_request" DROP CONSTRAINT "tattoo_request_userId_fkey";

-- AlterTable
ALTER TABLE "tattoo_request" DROP COLUMN "assignedToId",
DROP COLUMN "selectedImageId",
DROP COLUMN "userId",
ADD COLUMN     "depositAdminNote" TEXT,
ADD COLUMN     "depositMethod" "PaymentMethod",
ADD COLUMN     "depositProofMimeType" TEXT,
ADD COLUMN     "depositProofPublicUrl" TEXT,
ADD COLUMN     "depositProofR2Key" TEXT,
ADD COLUMN     "depositProofSizeBytes" INTEGER,
ADD COLUMN     "depositVerificationCode" VARCHAR(3),
ADD COLUMN     "selectedImageMimeType" TEXT,
ADD COLUMN     "selectedImagePublicUrl" TEXT,
ADD COLUMN     "selectedImageR2Key" TEXT,
ADD COLUMN     "selectedImageSizeBytes" INTEGER,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- DropTable
DROP TABLE "generated_image";

-- DropTable
DROP TABLE "generation_job";

-- DropTable
DROP TABLE "payment";

-- DropEnum
DROP TYPE "AiProvider";

-- DropEnum
DROP TYPE "ImageKind";

-- DropEnum
DROP TYPE "JobStatus";

-- DropEnum
DROP TYPE "JobType";

-- DropEnum
DROP TYPE "PaymentKind";

-- DropEnum
DROP TYPE "PaymentStatus";

-- CreateIndex
CREATE INDEX "tattoo_request_sentAt_idx" ON "tattoo_request"("sentAt");
