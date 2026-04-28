import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { prisma } from "@/lib/db";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const windowEnd = new Date(now.getTime() + 60 * 60 * 1000); // next hour

  const reminders = await prisma.reminder.findMany({
    where: {
      status: "PENDING",
      scheduledFor: { gte: now, lte: windowEnd },
    },
    include: {
      plant: { select: { nickname: true, id: true, userId: true } },
    },
  });

  const REMINDER_LABELS: Record<string, string> = {
    WATERING: "riego",
    FERTILIZING: "fertilización",
    CHECK: "revisión",
  };

  let sent = 0;
  let failed = 0;

  for (const reminder of reminders) {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: reminder.plant.userId },
    });

    const label = REMINDER_LABELS[reminder.type] ?? reminder.type.toLowerCase();
    const payload = JSON.stringify({
      title: `🌱 ${reminder.plant.nickname}`,
      body: `Es hora del ${label} de tu planta.`,
      url: `/jardin/${reminder.plant.id}`,
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch {
        failed++;
        // Remove invalid subscriptions (e.g. browser unsubscribed)
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => null);
      }
    }

    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  }

  return NextResponse.json({ processed: reminders.length, sent, failed });
}
