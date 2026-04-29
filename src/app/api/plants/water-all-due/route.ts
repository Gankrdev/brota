import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPlantsNeedingAttention } from "@/lib/dashboard/queries";
import { regenerateWateringReminders } from "@/lib/watering";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const overdue = await getPlantsNeedingAttention(session.user.id);
  if (overdue.length === 0) {
    return NextResponse.json({ watered: 0 });
  }

  const occurredAt = new Date();
  const userId = session.user.id;

  await prisma.$transaction(async (tx) => {
    for (const p of overdue) {
      await tx.careEvent.create({
        data: {
          plantId: p.id,
          type: "WATERING",
          occurredAt,
          amount: "NORMAL",
          registeredBy: userId,
        },
      });
      await regenerateWateringReminders(p.id, occurredAt, tx);
    }
  });

  return NextResponse.json({ watered: overdue.length });
}
