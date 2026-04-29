import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { identifyPlant } from "@/lib/ai/identify-plant";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedMime = (typeof ALLOWED_TYPES)[number];

function isAllowedMime(mime: string): mime is AllowedMime {
  return (ALLOWED_TYPES as readonly string[]).includes(mime);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  if (!checkRateLimit(`create-plant:${session.user.id}`, { maxRequests: 10, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta más tarde." }, { status: 429 });
  }

  const formData = await req.formData();
  const photo = formData.get("photo");
  const location = formData.get("location");
  const lastWateredRaw = formData.get("lastWatered");

  if (!(photo instanceof File)) {
    return NextResponse.json({ error: "La foto es obligatoria." }, { status: 400 });
  }
  if (!isAllowedMime(photo.type)) {
    return NextResponse.json(
      { error: "Formato no soportado. Usa JPG, PNG o WebP." },
      { status: 400 },
    );
  }
  if (photo.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "La imagen no puede superar 10 MB." }, { status: 400 });
  }

  const lastWatered =
    typeof lastWateredRaw === "string" && lastWateredRaw
      ? new Date(lastWateredRaw)
      : new Date();

  // Upload photo to Vercel Blob
  const blob = await put(`plants/${Date.now()}-${photo.name}`, photo, {
    access: "public",
    contentType: photo.type,
  });

  // Identify plant with Claude
  const imageBytes = new Uint8Array(await photo.arrayBuffer());
  const identification = await identifyPlant(imageBytes, photo.type);

  // Create Species + Plant + CareEvent + Reminders in a single transaction
  const plant = await prisma.$transaction(async (tx) => {
    const species = await tx.species.create({
      data: {
        commonName: identification.commonName,
        scientificName: identification.scientificName,
        family: identification.family,
        description: identification.description,
        lightRequirement: identification.lightRequirement,
        wateringFrequencyDays: identification.wateringFrequencyDays,
        wateringFrequencyMin: identification.wateringFrequencyMin,
        wateringFrequencyMax: identification.wateringFrequencyMax,
        idealTempMinC: identification.idealTempMinC,
        idealTempMaxC: identification.idealTempMaxC,
        humidityIdealMin: identification.humidityIdealMin,
        humidityIdealMax: identification.humidityIdealMax,
        substrateType: identification.substrateType,
        fertilizationFrequency: identification.fertilizationFrequency,
        difficulty: identification.difficulty,
        growthRate: identification.growthRate,
        specialCare: identification.specialCare,
        commonProblems: identification.commonProblems,
        generatedByAi: true,
        aiModel: "claude-sonnet-4-6",
        aiGeneratedAt: new Date(),
      },
    });

    const newPlant = await tx.plant.create({
      data: {
        nickname: identification.nickname,
        speciesId: species.id,
        userId: session.user!.id!,
        photoUrl: blob.url,
        location: typeof location === "string" && location ? location : null,
      },
    });

    // Register last watering as a care event
    await tx.careEvent.create({
      data: {
        plantId: newPlant.id,
        type: "WATERING",
        occurredAt: lastWatered,
        registeredBy: session.user!.id!,
      },
    });

    // Create two reminders covering the watering range (min and max days)
    await tx.reminder.createMany({
      data: [
        {
          plantId: newPlant.id,
          type: "WATERING",
          scheduledFor: addDays(lastWatered, identification.wateringFrequencyMin),
        },
        {
          plantId: newPlant.id,
          type: "WATERING",
          scheduledFor: addDays(lastWatered, identification.wateringFrequencyMax),
        },
      ],
    });

    return newPlant;
  });

  return NextResponse.json({ id: plant.id }, { status: 201 });
}
