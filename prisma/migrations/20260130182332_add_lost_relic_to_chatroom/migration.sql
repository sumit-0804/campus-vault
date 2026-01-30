-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "lostRelicId" TEXT;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_lostRelicId_fkey" FOREIGN KEY ("lostRelicId") REFERENCES "LostRelic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
