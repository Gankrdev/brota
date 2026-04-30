import { prisma } from "@/lib/db";

export interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  bio: string | null;
  createdAt: Date;
  daysCaring: number;
  stats: {
    plantCount: number;
    speciesCount: number;
    wateringsThisMonth: number;
    diagnosisCount: number;
  };
  weeklyActivity: { day: string; count: number }[];
  recentActivity: RecentActivityItem[];
}

export interface RecentActivityItem {
  id: string;
  type: "WATERING" | "FERTILIZING" | "PRUNING" | "OTHER" | "DIAGNOSIS";
  occurredAt: Date;
  plantNickname: string;
  plantIds: string[];
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const WEEK_DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Monday-based week start
function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

export async function getProfileData(userId: string): Promise<ProfileData> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const weekStart = startOfWeek(now);

  const [user, plantCount, speciesGroup, wateringsThisMonth, diagnosisCount, weeklyEvents, recentCare, recentDiagnoses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, bio: true, createdAt: true },
    }),
    prisma.plant.count({ where: { userId, deletedAt: null } }),
    prisma.plant.findMany({
      where: { userId, deletedAt: null },
      select: { speciesId: true },
      distinct: ["speciesId"],
    }),
    prisma.careEvent.count({
      where: {
        type: "WATERING",
        occurredAt: { gte: monthStart },
        plant: { userId, deletedAt: null },
      },
    }),
    prisma.diagnosis.count({
      where: { plant: { userId, deletedAt: null } },
    }),
    prisma.careEvent.findMany({
      where: {
        occurredAt: { gte: weekStart },
        plant: { userId, deletedAt: null },
      },
      select: { occurredAt: true },
    }),
    prisma.careEvent.findMany({
      where: { plant: { userId, deletedAt: null } },
      include: { plant: { select: { id: true, nickname: true } } },
      orderBy: { occurredAt: "desc" },
      take: 10,
    }),
    prisma.diagnosis.findMany({
      where: { plant: { userId, deletedAt: null } },
      include: { plant: { select: { id: true, nickname: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  if (!user) {
    throw new Error("User not found");
  }

  const daysCaring = Math.max(0, Math.floor((now.getTime() - user.createdAt.getTime()) / MS_PER_DAY));

  // Build weekly buckets (Mon..Sun)
  const buckets = WEEK_DAY_LABELS.map((day) => ({ day, count: 0 }));
  for (const ev of weeklyEvents) {
    const day = ev.occurredAt.getDay();
    const idx = day === 0 ? 6 : day - 1;
    buckets[idx].count++;
  }

  // Group recent care events: same type + same minute = a single "session"
  const grouped = new Map<string, { type: RecentActivityItem["type"]; occurredAt: Date; plantIds: Set<string>; plantNicknames: string[] }>();
  for (const ev of recentCare) {
    const key = `${ev.type}-${Math.floor(ev.occurredAt.getTime() / 60000)}`;
    const existing = grouped.get(key);
    if (existing) {
      if (!existing.plantIds.has(ev.plant.id)) {
        existing.plantIds.add(ev.plant.id);
        existing.plantNicknames.push(ev.plant.nickname);
      }
    } else {
      grouped.set(key, {
        type: ev.type,
        occurredAt: ev.occurredAt,
        plantIds: new Set([ev.plant.id]),
        plantNicknames: [ev.plant.nickname],
      });
    }
  }

  const careActivity: RecentActivityItem[] = Array.from(grouped.entries()).map(([key, g]) => ({
    id: `care-${key}`,
    type: g.type,
    occurredAt: g.occurredAt,
    plantNickname: g.plantNicknames.length > 1
      ? `${g.plantNicknames.slice(0, 2).join(", ")}${g.plantNicknames.length > 2 ? ` +${g.plantNicknames.length - 2}` : ""}`
      : g.plantNicknames[0],
    plantIds: Array.from(g.plantIds),
  }));

  const diagnosisActivity: RecentActivityItem[] = recentDiagnoses.map((d) => ({
    id: `diag-${d.id}`,
    type: "DIAGNOSIS" as const,
    occurredAt: d.createdAt,
    plantNickname: d.plant.nickname,
    plantIds: [d.plant.id],
  }));

  const recentActivity = [...careActivity, ...diagnosisActivity]
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .slice(0, 5);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    createdAt: user.createdAt,
    daysCaring,
    stats: {
      plantCount,
      speciesCount: speciesGroup.length,
      wateringsThisMonth,
      diagnosisCount,
    },
    weeklyActivity: buckets,
    recentActivity,
  };
}
