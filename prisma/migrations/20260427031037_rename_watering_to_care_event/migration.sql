/*
  Warnings:

  - You are about to drop the `WateringEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CareType" AS ENUM ('WATERING', 'FERTILIZING', 'PRUNING', 'OTHER');

-- DropForeignKey
ALTER TABLE "WateringEvent" DROP CONSTRAINT "WateringEvent_plantId_fkey";

-- DropForeignKey
ALTER TABLE "WateringEvent" DROP CONSTRAINT "WateringEvent_registeredBy_fkey";

-- DropTable
DROP TABLE "WateringEvent";

-- CreateTable
CREATE TABLE "CareEvent" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "type" "CareType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "amount" "WateringAmount",
    "notes" TEXT,
    "registeredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CareEvent_plantId_occurredAt_idx" ON "CareEvent"("plantId", "occurredAt");

-- CreateIndex
CREATE INDEX "CareEvent_type_occurredAt_idx" ON "CareEvent"("type", "occurredAt");

-- AddForeignKey
ALTER TABLE "CareEvent" ADD CONSTRAINT "CareEvent_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareEvent" ADD CONSTRAINT "CareEvent_registeredBy_fkey" FOREIGN KEY ("registeredBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
