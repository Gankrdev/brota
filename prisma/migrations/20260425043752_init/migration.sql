-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "LightRequirement" AS ENUM ('LOW', 'MEDIUM_INDIRECT', 'BRIGHT_INDIRECT', 'DIRECT');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "GrowthRate" AS ENUM ('FAST', 'MEDIUM', 'SLOW');

-- CreateEnum
CREATE TYPE "WateringAmount" AS ENUM ('LIGHT', 'NORMAL', 'HEAVY');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('HEALTHY', 'ATTENTION', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('WATERING', 'FERTILIZING', 'CHECK');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'ACKNOWLEDGED', 'DISMISSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Species" (
    "id" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "scientificName" TEXT,
    "family" TEXT,
    "description" TEXT,
    "lightRequirement" "LightRequirement" NOT NULL,
    "wateringFrequencyDays" INTEGER NOT NULL,
    "wateringFrequencyMin" INTEGER NOT NULL,
    "wateringFrequencyMax" INTEGER NOT NULL,
    "idealTempMinC" DOUBLE PRECISION,
    "idealTempMaxC" DOUBLE PRECISION,
    "criticalTempMinC" DOUBLE PRECISION,
    "criticalTempMaxC" DOUBLE PRECISION,
    "humidityIdealMin" INTEGER,
    "humidityIdealMax" INTEGER,
    "substrateType" TEXT,
    "phIdeal" DOUBLE PRECISION,
    "fertilizationFrequency" TEXT,
    "fertilizationType" TEXT,
    "specialCare" JSONB,
    "commonProblems" JSONB,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "growthRate" "GrowthRate" NOT NULL DEFAULT 'MEDIUM',
    "activeSeasons" JSONB,
    "generatedByAi" BOOLEAN NOT NULL DEFAULT false,
    "aiModel" TEXT,
    "aiGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "location" TEXT,
    "customWateringDays" INTEGER,
    "acquiredAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WateringEvent" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "wateredAt" TIMESTAMP(3) NOT NULL,
    "amount" "WateringAmount",
    "notes" TEXT,
    "registeredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WateringEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "reportedSymptoms" TEXT,
    "aiModel" TEXT NOT NULL,
    "aiResponse" JSONB NOT NULL,
    "healthStatus" "HealthStatus" NOT NULL,
    "detectedIssues" JSONB,
    "probableCauses" JSONB,
    "recommendedActions" JSONB,
    "reviewNextDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorReading" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL,
    "soilMoisture" DOUBLE PRECISION,
    "ambientTemp" DOUBLE PRECISION,
    "ambientHumidity" DOUBLE PRECISION,
    "lightLevel" DOUBLE PRECISION,
    "batteryVoltage" DOUBLE PRECISION,

    CONSTRAINT "SensorReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Species_commonName_idx" ON "Species"("commonName");

-- CreateIndex
CREATE INDEX "Species_scientificName_idx" ON "Species"("scientificName");

-- CreateIndex
CREATE INDEX "Plant_speciesId_idx" ON "Plant"("speciesId");

-- CreateIndex
CREATE INDEX "Plant_deletedAt_idx" ON "Plant"("deletedAt");

-- CreateIndex
CREATE INDEX "WateringEvent_plantId_wateredAt_idx" ON "WateringEvent"("plantId", "wateredAt");

-- CreateIndex
CREATE INDEX "Diagnosis_plantId_createdAt_idx" ON "Diagnosis"("plantId", "createdAt");

-- CreateIndex
CREATE INDEX "Reminder_scheduledFor_status_idx" ON "Reminder"("scheduledFor", "status");

-- CreateIndex
CREATE INDEX "Reminder_plantId_idx" ON "Reminder"("plantId");

-- CreateIndex
CREATE INDEX "SensorReading_plantId_readAt_idx" ON "SensorReading"("plantId", "readAt");

-- CreateIndex
CREATE INDEX "SensorReading_sensorId_readAt_idx" ON "SensorReading"("sensorId", "readAt");

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WateringEvent" ADD CONSTRAINT "WateringEvent_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WateringEvent" ADD CONSTRAINT "WateringEvent_registeredBy_fkey" FOREIGN KEY ("registeredBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorReading" ADD CONSTRAINT "SensorReading_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
