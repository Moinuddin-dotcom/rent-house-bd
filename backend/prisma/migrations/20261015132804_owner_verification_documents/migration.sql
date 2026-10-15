-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('SELF', 'INHERITED', 'DEVELOPER_PURCHASE', 'REPRESENTATIVE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentType" ADD VALUE 'NATIONAL_ID_BACK';
ALTER TYPE "DocumentType" ADD VALUE 'SELFIE_WITH_NID';
ALTER TYPE "DocumentType" ADD VALUE 'MUTATION_KHATIAN';
ALTER TYPE "DocumentType" ADD VALUE 'DCR';
ALTER TYPE "DocumentType" ADD VALUE 'HOLDING_TAX_RECEIPT';
ALTER TYPE "DocumentType" ADD VALUE 'WARISH_CERTIFICATE';
ALTER TYPE "DocumentType" ADD VALUE 'ALLOTMENT_LETTER';
ALTER TYPE "DocumentType" ADD VALUE 'POWER_OF_ATTORNEY';

-- AlterTable
ALTER TABLE "OwnerProfile" ADD COLUMN     "ownershipType" "OwnershipType" NOT NULL DEFAULT 'SELF';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PhoneOtp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhoneOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PhoneOtp_userId_createdAt_idx" ON "PhoneOtp"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "PhoneOtp" ADD CONSTRAINT "PhoneOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
