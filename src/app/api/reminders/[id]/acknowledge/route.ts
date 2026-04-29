import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const reminder = await prisma.reminder.findFirst({
    where: { id, plant: { userId: session.user.id } },
    select: { id: true, status: true, type: true, plantId: true },
  });

  if (!reminder) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.reminder.update({
    where: { id },
    data: {
      status: "ACKNOWLEDGED",
      acknowledgedAt: new Date(),
    },
  });

  const reminderTypeToCareType = {
    WATERING: "WATERING",
    FERTILIZING: "FERTILIZING",
  } as const;

  const careType = reminderTypeToCareType[reminder.type as "WATERING" | "FERTILIZING"];
  if (careType) {
    await prisma.careEvent.create({
      data: {
        plantId: reminder.plantId,
        type: careType,
        occurredAt: new Date(),
        amount: careType === "WATERING" ? "NORMAL" : null,
        registeredBy: session.user.id,
      },
      select: { id: true },
    });
  }

  return NextResponse.json({ ok: true });
}
