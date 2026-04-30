import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { regenerateWateringReminders } from "@/lib/watering";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const plant = await prisma.plant.findFirst({
    where: { id, deletedAt: null, userId: session.user.id },
    select: { id: true },
  });

  if (!plant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const occurredAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.careEvent.create({
      data: {
        plantId: plant.id,
        type: "WATERING",
        occurredAt,
        amount: "NORMAL",
        registeredBy: session.user!.id!,
      },
    });
    await regenerateWateringReminders(plant.id, occurredAt, tx);
  });

  return NextResponse.json({ ok: true });
}
