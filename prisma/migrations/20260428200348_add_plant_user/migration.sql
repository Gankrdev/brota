/*
  Warnings:

  - Added the required column `userId` to the `Plant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: add nullable first, backfill, then set NOT NULL
ALTER TABLE "Plant" ADD COLUMN "userId" TEXT;
UPDATE "Plant" SET "userId" = 'cmodun7pa0000fkw1uf8tat1t' WHERE "userId" IS NULL;
ALTER TABLE "Plant" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
