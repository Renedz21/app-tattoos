/*
  Warnings:

  - The values [DEPOSIT_PENDING] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `depositAdminNote` on the `tattoo_request` table. All the data in the column will be lost.
  - You are about to drop the column `depositMethod` on the `tattoo_request` table. All the data in the column will be lost.
  - You are about to drop the column `depositProofMimeType` on the `tattoo_request` table. All the data in the column will be lost.
  - You are about to drop the column `depositProofPublicUrl` on the `tattoo_request` table. All the data in the column will be lost.
  - You are about to drop the column `depositProofR2Key` on the `tattoo_request` table. All the data in the column will be lost.
  - You are about to drop the column `depositProofSizeBytes` on the `tattoo_request` table. All the data in the column will be lost.
  - You are about to drop the column `depositSubmittedAt` on the `tattoo_request` table. All the data in the column will be lost.
  - You are about to drop the column `depositVerificationCode` on the `tattoo_request` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('SENT', 'QUOTED', 'APPOINTMENT_CONFIRMED', 'FINISHED', 'EXPIRED');
ALTER TABLE "tattoo_request" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "public"."RequestStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "tattoo_request" DROP COLUMN "depositAdminNote",
DROP COLUMN "depositMethod",
DROP COLUMN "depositProofMimeType",
DROP COLUMN "depositProofPublicUrl",
DROP COLUMN "depositProofR2Key",
DROP COLUMN "depositProofSizeBytes",
DROP COLUMN "depositSubmittedAt",
DROP COLUMN "depositVerificationCode",
ADD COLUMN     "generationCount" INTEGER NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "PaymentMethod";
