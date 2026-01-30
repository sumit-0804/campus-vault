-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RelicStatus" ADD VALUE 'VERIFIED';
ALTER TYPE "RelicStatus" ADD VALUE 'PENDING_PICKUP';
ALTER TYPE "RelicStatus" ADD VALUE 'DROPPED_OFF';
ALTER TYPE "RelicStatus" ADD VALUE 'DELIVERED';

-- AlterTable
ALTER TABLE "LostRelic" ADD COLUMN     "claimerId" TEXT,
ADD COLUMN     "claimerVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "droppedOffAt" TIMESTAMP(3);
