import { prisma } from "@/lib/db";

export interface NeedsAttentionPlant {
  id: string;
  nickname: string;
  location: string | null;
  photoUrl: string | null;
  speciesCommonName: string;
  daysOverdue: number;
  expectedFrequencyDays: number;
}

export async function getPlantsNeedingAttention(): Promise<NeedsAttentionPlant[]> {
  const plants = await prisma.plant.findMany({
    where: { deletedAt: null },
    include: {
      species: { select: { commonName: true, wateringFrequencyDays: true } },
      wateringEvents: {
        orderBy: { wateredAt: "desc" },
        take: 1,
        select: { wateredAt: true },
      },
    },
  });

  const now = Date.now();
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  const overdue = plants
    .map((p) => {
      const expectedFrequencyDays = p.customWateringDays ?? p.species.wateringFrequencyDays;
      const lastWatered = p.wateringEvents[0]?.wateredAt ?? p.createdAt;
      const daysSinceWater = Math.floor((now - lastWatered.getTime()) / MS_PER_DAY);
      const daysOverdue = daysSinceWater - expectedFrequencyDays;
      return {
        id: p.id,
        nickname: p.nickname,
        location: p.location,
        photoUrl: p.photoUrl,
        speciesCommonName: p.species.commonName,
        expectedFrequencyDays,
        daysOverdue,
      };
    })
    .filter((p) => p.daysOverdue >= 0)
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  return overdue;
}

export interface UpcomingReminder {
  id: string;
  plantNickname: string;
  type: "WATERING" | "FERTILIZING" | "CHECK";
  scheduledFor: Date;
}

export async function getUpcomingReminders(limitDays = 7): Promise<UpcomingReminder[]> {
  const horizon = new Date(Date.now() + limitDays * 24 * 60 * 60 * 1000);

  const reminders = await prisma.reminder.findMany({
    where: {
      status: "PENDING",
      scheduledFor: { lte: horizon },
    },
    include: { plant: { select: { nickname: true } } },
    orderBy: { scheduledFor: "asc" },
    take: 20,
  });

  return reminders.map((r) => ({
    id: r.id,
    plantNickname: r.plant.nickname,
    type: r.type,
    scheduledFor: r.scheduledFor,
  }));
}
