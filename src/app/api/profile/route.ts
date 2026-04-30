import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const PatchSchema = z.object({
  bio: z.string().max(280).nullable(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const bio = parsed.data.bio?.trim() || null;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { bio },
  });

  return NextResponse.json({ bio });
}
