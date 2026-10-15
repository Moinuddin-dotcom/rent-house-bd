-- CreateEnum
CREATE TYPE "ZoneType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'NON_RESIDENTIAL');

-- AlterTable
ALTER TABLE "OwnerProfile" ADD COLUMN     "addressZone" "ZoneType",
ADD COLUMN     "propertyZone" "ZoneType";
