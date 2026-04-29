import { prisma } from "@/lib/db";
import type { CareType, LightRequirement } from "@/generated/prisma/enums";

export interface NeedsAttentionPlant {
  id: string;
  nickname: string;
  location: string | null;
  photoUrl: string | null;
  speciesCommonName: string;
  daysOverdue: number;
  expectedFrequencyDays: number;
}

export async function getPlantsNeedingAttention(userId?: string): Promise<NeedsAttentionPlant[]> {
  const plants = await prisma.plant.findMany({
    where: { deletedAt: null, ...(userId ? { userId } : {}) },
    include: {
      species: { select: { commonName: true, wateringFrequencyDays: true } },
      careEvents: {
        where: { type: "WATERING" },
        orderBy: { occurredAt: "desc" },
        take: 1,
        select: { occurredAt: true },
      },
    },
  });

  const now = Date.now();
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  const overdue = plants
    .map((p) => {
      const expectedFrequencyDays = p.customWateringDays ?? p.species.wateringFrequencyDays;
      const lastWatered = p.careEvents[0]?.occurredAt ?? p.createdAt;
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

export type PlantHealth = "healthy" | "thirsty" | "critical" | "pending_diagnosis";

export interface CalendarTask {
  id: string;
  plantId: string;
  plantNickname: string;
  plantLocation: string | null;
  type: "WATERING" | "FERTILIZING" | "CHECK";
  scheduledFor: Date;
  status: "PENDING" | "SENT" | "ACKNOWLEDGED" | "DISMISSED";
}

export async function getCalendarTasks(from: Date, to: Date): Promise<CalendarTask[]> {
  const reminders = await prisma.reminder.findMany({
    where: {
      scheduledFor: { gte: from, lte: to },
    },
    include: {
      plant: { select: { id: true, nickname: true, location: true } },
    },
    orderBy: { scheduledFor: "asc" },
  });

  return reminders.map((r) => ({
    id: r.id,
    plantId: r.plant.id,
    plantNickname: r.plant.nickname,
    plantLocation: r.plant.location,
    type: r.type,
    scheduledFor: r.scheduledFor,
    status: r.status,
  }));
}

export interface GardenPlant {
  id: string;
  nickname: string;
  location: string | null;
  photoUrl: string | null;
  speciesCommonName: string;
  lightRequirement: LightRequirement;
  wateringFrequencyDays: number;
  health: PlantHealth;
}

export async function getAllPlants(): Promise<GardenPlant[]> {
  const plants = await prisma.plant.findMany({
    where: { deletedAt: null },
    include: {
      species: {
        select: {
          commonName: true,
          lightRequirement: true,
          wateringFrequencyDays: true,
        },
      },
      careEvents: {
        where: { type: "WATERING" },
        orderBy: { occurredAt: "desc" },
        take: 1,
        select: { occurredAt: true },
      },
      diagnoses: { select: { id: true }, take: 1 },
    },
    orderBy: { nickname: "asc" },
  });

  const now = Date.now();
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  return plants.map((p) => {
    const frequency = p.customWateringDays ?? p.species.wateringFrequencyDays;
    const lastWatered = p.careEvents[0]?.occurredAt ?? p.createdAt;
    const daysSinceWater = Math.floor((now - lastWatered.getTime()) / MS_PER_DAY);
    const daysOverdue = daysSinceWater - frequency;

    let health: PlantHealth = p.diagnoses.length === 0 ? "pending_diagnosis" : "healthy";
    if (daysOverdue >= 3) health = "critical";
    else if (daysOverdue >= 0) health = "thirsty";

    return {
      id: p.id,
      nickname: p.nickname,
      location: p.location,
      photoUrl: p.photoUrl,
      speciesCommonName: p.species.commonName,
      lightRequirement: p.species.lightRequirement,
      wateringFrequencyDays: frequency,
      health,
    };
  });
}

export interface PlantDetail {
  id: string;
  nickname: string;
  location: string | null;
  photoUrl: string | null;
  notes: string | null;
  acquiredAt: Date | null;
  customWateringDays: number | null;
  health: PlantHealth;
  species: {
    commonName: string;
    scientificName: string | null;
    family: string | null;
    description: string | null;
    lightRequirement: LightRequirement;
    wateringFrequencyDays: number;
    wateringFrequencyMin: number;
    wateringFrequencyMax: number;
    humidityIdealMin: number | null;
    humidityIdealMax: number | null;
    idealTempMinC: number | null;
    idealTempMaxC: number | null;
  };
  history: PlantHistoryEvent[];
}

export type PlantHistoryEvent =
  | {
      kind: "care";
      id: string;
      at: Date;
      careType: CareType;
      amount: "LIGHT" | "NORMAL" | "HEAVY" | null;
      notes: string | null;
    }
  | {
      kind: "diagnosis";
      id: string;
      at: Date;
      healthStatus: "HEALTHY" | "ATTENTION" | "CRITICAL";
    };

export async function getPlantDetail(id: string): Promise<PlantDetail | null> {
  const plant = await prisma.plant.findFirst({
    where: { id, deletedAt: null },
    include: {
      species: true,
      careEvents: {
        orderBy: { occurredAt: "desc" },
        take: 10,
      },
      diagnoses: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, createdAt: true, healthStatus: true },
      },
    },
  });

  if (!plant) return null;

  const frequency = plant.customWateringDays ?? plant.species.wateringFrequencyDays;
  const lastWatering = plant.careEvents.find((e) => e.type === "WATERING");
  const lastWatered = lastWatering?.occurredAt ?? plant.createdAt;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const daysOverdue = Math.floor((Date.now() - lastWatered.getTime()) / MS_PER_DAY) - frequency;

  let health: PlantHealth = plant.diagnoses.length === 0 ? "pending_diagnosis" : "healthy";
  if (daysOverdue >= 3) health = "critical";
  else if (daysOverdue >= 0) health = "thirsty";

  const careEvents: PlantHistoryEvent[] = plant.careEvents.map((c) => ({
    kind: "care" as const,
    id: c.id,
    at: c.occurredAt,
    careType: c.type,
    amount: c.amount,
    notes: c.notes,
  }));

  const diagnosisEvents: PlantHistoryEvent[] = plant.diagnoses.map((d) => ({
    kind: "diagnosis" as const,
    id: d.id,
    at: d.createdAt,
    healthStatus: d.healthStatus,
  }));

  const history = [...careEvents, ...diagnosisEvents]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  return {
    id: plant.id,
    nickname: plant.nickname,
    location: plant.location,
    photoUrl: plant.photoUrl,
    notes: plant.notes,
    acquiredAt: plant.acquiredAt,
    customWateringDays: plant.customWateringDays,
    health,
    species: {
      commonName: plant.species.commonName,
      scientificName: plant.species.scientificName,
      family: plant.species.family,
      description: plant.species.description,
      lightRequirement: plant.species.lightRequirement,
      wateringFrequencyDays: plant.species.wateringFrequencyDays,
      wateringFrequencyMin: plant.species.wateringFrequencyMin,
      wateringFrequencyMax: plant.species.wateringFrequencyMax,
      humidityIdealMin: plant.species.humidityIdealMin,
      humidityIdealMax: plant.species.humidityIdealMax,
      idealTempMinC: plant.species.idealTempMinC,
      idealTempMaxC: plant.species.idealTempMaxC,
    },
    history,
  };
}

// ---------- Care history (timeline page) ----------

export interface HistoryFilters {
  plantId?: string;
  types?: CareType[];
  limit?: number;
  offset?: number;
}

export interface HistoryEntry {
  id: string;
  type: CareType;
  occurredAt: Date;
  notes: string | null;
  amount: "LIGHT" | "NORMAL" | "HEAVY" | null;
  plantId: string;
  plantNickname: string;
}

export async function getCareHistory({
  plantId,
  types,
  limit = 20,
  offset = 0,
}: HistoryFilters = {}): Promise<{ entries: HistoryEntry[]; hasMore: boolean }> {
  const events = await prisma.careEvent.findMany({
    where: {
      ...(plantId ? { plantId } : {}),
      ...(types && types.length > 0 ? { type: { in: types } } : {}),
      plant: { deletedAt: null },
    },
    include: {
      plant: { select: { id: true, nickname: true } },
    },
    orderBy: { occurredAt: "desc" },
    take: limit + 1,
    skip: offset,
  });

  const hasMore = events.length > limit;
  const sliced = hasMore ? events.slice(0, limit) : events;

  return {
    entries: sliced.map((e) => ({
      id: e.id,
      type: e.type,
      occurredAt: e.occurredAt,
      notes: e.notes,
      amount: e.amount,
      plantId: e.plant.id,
      plantNickname: e.plant.nickname,
    })),
    hasMore,
  };
}

export async function getCareEventCountSince(since: Date): Promise<number> {
  return prisma.careEvent.count({
    where: {
      occurredAt: { gte: since },
      plant: { deletedAt: null },
    },
  });
}

export interface PlantOption {
  id: string;
  nickname: string;
}

export async function getPlantOptions(): Promise<PlantOption[]> {
  const plants = await prisma.plant.findMany({
    where: { deletedAt: null },
    select: { id: true, nickname: true },
    orderBy: { nickname: "asc" },
  });
  return plants;
}
