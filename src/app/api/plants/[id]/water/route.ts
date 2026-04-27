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

  const plant = await prisma.plant.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });

  if (!plant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.careEvent.create({
    data: {
      plantId: plant.id,
      type: "WATERING",
      occurredAt: new Date(),
      amount: "NORMAL",
      registeredBy: session.user.id,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true });
}
