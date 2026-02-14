/*
  Warnings:

  - The values [MUGGLE,WIZARD,AUROR,DARK_KNIGHT] on the enum `KarmaRank` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "OfferAction" AS ENUM ('CREATED', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'REVIVED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'ACTIONED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('USER', 'ITEM', 'UNBAN_REQUEST');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('SPAM', 'HARASSMENT', 'SCAM', 'INAPPROPRIATE', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "KarmaRank_new" AS ENUM ('E_RANK', 'D_RANK', 'C_RANK', 'B_RANK', 'A_RANK', 'S_RANK', 'NATIONAL_LEVEL', 'SHADOW_MONARCH');
ALTER TABLE "public"."Wizard" ALTER COLUMN "karmaRank" DROP DEFAULT;
ALTER TABLE "Wizard" ALTER COLUMN "karmaRank" TYPE "KarmaRank_new" USING ("karmaRank"::text::"KarmaRank_new");
ALTER TYPE "KarmaRank" RENAME TO "KarmaRank_old";
ALTER TYPE "KarmaRank_new" RENAME TO "KarmaRank";
DROP TYPE "public"."KarmaRank_old";
ALTER TABLE "Wizard" ALTER COLUMN "karmaRank" SET DEFAULT 'E_RANK';
COMMIT;

-- AlterEnum
ALTER TYPE "MessageType" ADD VALUE 'COUNTER_OFFER';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'OFFER_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'OFFER_COUNTERED';
ALTER TYPE "NotificationType" ADD VALUE 'ITEM_SOLD';
ALTER TYPE "NotificationType" ADD VALUE 'RATING_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE 'RELIC_MATCH';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OfferStatus" ADD VALUE 'COUNTER_OFFER_PENDING';
ALTER TYPE "OfferStatus" ADD VALUE 'DELIVERED';

-- AlterTable
ALTER TABLE "BloodPact" ADD COLUMN     "counterOfferAmount" DOUBLE PRECISION,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CursedObject" ADD COLUMN     "piiDetected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "LostRelic" ADD COLUMN     "piiDetected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "Wizard" ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "lastLoginDate" TIMESTAMP(3),
ALTER COLUMN "karmaRank" SET DEFAULT 'E_RANK';

-- CreateTable
CREATE TABLE "OfferHistory" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "action" "OfferAction" NOT NULL,
    "amount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT NOT NULL,

    CONSTRAINT "OfferHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KarmaLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KarmaLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" "ReportTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "category" "ReportCategory",
    "evidence" TEXT[],
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_transactionId_key" ON "Rating"("transactionId");

-- AddForeignKey
ALTER TABLE "OfferHistory" ADD CONSTRAINT "OfferHistory_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "BloodPact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferHistory" ADD CONSTRAINT "OfferHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Wizard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostRelic" ADD CONSTRAINT "LostRelic_claimerId_fkey" FOREIGN KEY ("claimerId") REFERENCES "Wizard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "Wizard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Wizard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KarmaLog" ADD CONSTRAINT "KarmaLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Wizard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "Wizard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
