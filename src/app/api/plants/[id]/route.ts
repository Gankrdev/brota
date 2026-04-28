import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedMime = (typeof ALLOWED_TYPES)[number];

function isAllowedMime(mime: string): mime is AllowedMime {
  return (ALLOWED_TYPES as readonly string[]).includes(mime);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { id } = await params;

  const plant = await prisma.plant.findFirst({ where: { id, deletedAt: null }, select: { id: true, userId: true } });
  if (!plant) {
    return NextResponse.json({ error: "Planta no encontrada." }, { status: 404 });
  }
  if (plant.userId !== session.user.id) {
    return NextResponse.json({ error: "Sin permiso." }, { status: 403 });
  }

  const formData = await req.formData();
  const photo = formData.get("photo");
  const location = formData.get("location");

  const updates: { photoUrl?: string; location?: string | null } = {};

  if (photo instanceof File) {
    if (!isAllowedMime(photo.type)) {
      return NextResponse.json({ error: "Formato no soportado. Usa JPG, PNG o WebP." }, { status: 400 });
    }
    if (photo.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen no puede superar 10 MB." }, { status: 400 });
    }

    const blob = await put(`plants/${Date.now()}-${photo.name}`, photo, {
      access: "public",
      contentType: photo.type,
    });
    updates.photoUrl = blob.url;
  }

  if (typeof location === "string") {
    updates.location = location || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No hay cambios que guardar." }, { status: 400 });
  }

  await prisma.plant.update({ where: { id }, data: updates });

  return NextResponse.json({ id });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { id } = await params;

  const plant = await prisma.plant.findFirst({ where: { id, deletedAt: null }, select: { id: true, userId: true } });
  if (!plant) {
    return NextResponse.json({ error: "Planta no encontrada." }, { status: 404 });
  }
  if (plant.userId !== session.user.id) {
    return NextResponse.json({ error: "Sin permiso." }, { status: 403 });
  }

  await prisma.plant.update({ where: { id }, data: { deletedAt: new Date() } });

  return NextResponse.json({ id });
}
