import { prisma } from "@/lib/db";
import type { PrismaClient } from "@/generated/prisma/client";

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Deletes pending watering reminders for a plant and creates two new ones
 * covering the min–max watering range from the given base date.
 */
export async function regenerateWateringReminders(
  plantId: string,
  wateredAt: Date,
  tx: Tx = prisma,
): Promise<void> {
  const plant = await tx.plant.findFirst({
    where: { id: plantId },
    select: {
      customWateringDays: true,
      species: {
        select: {
          wateringFrequencyMin: true,
          wateringFrequencyMax: true,
        },
      },
    },
  });

  if (!plant) return;

  const freqMin = plant.customWateringDays ?? plant.species.wateringFrequencyMin;
  const freqMax = plant.customWateringDays ?? plant.species.wateringFrequencyMax;

  await tx.reminder.deleteMany({
    where: { plantId, type: "WATERING", status: { in: ["PENDING", "SENT"] } },
  });

  await tx.reminder.createMany({
    data: [
      { plantId, type: "WATERING", scheduledFor: addDays(wateredAt, freqMin) },
      { plantId, type: "WATERING", scheduledFor: addDays(wateredAt, freqMax) },
    ],
  });
}
