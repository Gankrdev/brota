import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPlantsNeedingAttention } from "@/lib/dashboard/queries";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const overdue = await getPlantsNeedingAttention();
  if (overdue.length === 0) {
    return NextResponse.json({ watered: 0 });
  }

  const wateredAt = new Date();
  const userId = session.user.id;

  const result = await prisma.$transaction(
    overdue.map((p) =>
      prisma.wateringEvent.create({
        data: {
          plantId: p.id,
          wateredAt,
          amount: "NORMAL",
          registeredBy: userId,
        },
        select: { id: true },
      }),
    ),
  );

  return NextResponse.json({ watered: result.length });
}
