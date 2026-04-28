import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { put } from "@vercel/blob";
import { claude, CLAUDE_MODEL } from "@/lib/ai/claude";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedMime = (typeof ALLOWED_TYPES)[number];

function isAllowedMime(mime: string): mime is AllowedMime {
  return (ALLOWED_TYPES as readonly string[]).includes(mime);
}

const DiagnosisResponseSchema = z.object({
  healthStatus: z.enum(["healthy", "attention", "critical"]),
  healthScore: z.number().min(0).max(100),
  detectedIssues: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      probability: z.number().min(0).max(100),
      severity: z.enum(["low", "medium", "high"]),
    })
  ),
  recommendedActions: z.array(
    z.object({
      order: z.number(),
      action: z.string(),
      urgency: z.enum(["low", "medium", "high"]),
    })
  ),
  reviewNextDate: z.string().nullable(),
  confidence: z.enum(["low", "medium", "high"]),
  summary: z.string(),
});

export type DiagnosisResponse = z.infer<typeof DiagnosisResponseSchema>;

const HEALTH_STATUS_MAP = {
  healthy: "HEALTHY",
  attention: "ATTENTION",
  critical: "CRITICAL",
} as const;

const SYSTEM_PROMPT = `Eres un experto en botánica y fitosanidad. Analizas fotos de plantas para diagnosticar su estado de salud.

Siempre responde con un JSON válido con esta estructura exacta:
{
  "healthStatus": "healthy" | "attention" | "critical",
  "healthScore": número entre 0 y 100,
  "detectedIssues": [
    {
      "title": "nombre del problema",
      "description": "descripción breve",
      "probability": número entre 0 y 100,
      "severity": "low" | "medium" | "high"
    }
  ],
  "recommendedActions": [
    {
      "order": número,
      "action": "acción concreta a tomar",
      "urgency": "low" | "medium" | "high"
    }
  ],
  "reviewNextDate": "YYYY-MM-DD o null",
  "confidence": "low" | "medium" | "high",
  "summary": "resumen de 1-2 oraciones del estado general"
}

Reglas:
- Si la planta se ve sana, dilo claramente (healthStatus: "healthy", healthScore >= 80).
- detectedIssues puede ser array vacío si la planta está sana.
- Las acciones deben ser concretas y accionables, no vagas.
- Responde SOLO con el JSON, sin texto adicional ni markdown.`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const formData = await req.formData();
  const photo = formData.get("photo");
  const speciesName = formData.get("speciesName");
  const symptoms = formData.get("symptoms");
  const plantIdRaw = formData.get("plantId");
  const plantId = typeof plantIdRaw === "string" && plantIdRaw ? plantIdRaw : null;

  if (!(photo instanceof File)) {
    return NextResponse.json({ error: "Se requiere una foto." }, { status: 400 });
  }
  if (!isAllowedMime(photo.type)) {
    return NextResponse.json({ error: "Formato no soportado. Usa JPEG, PNG o WebP." }, { status: 400 });
  }
  if (photo.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "La imagen no puede superar 10 MB." }, { status: 400 });
  }

  // Validate plantId belongs to a real plant if provided
  if (plantId) {
    const plant = await prisma.plant.findFirst({ where: { id: plantId, deletedAt: null }, select: { id: true } });
    if (!plant) {
      return NextResponse.json({ error: "Planta no encontrada." }, { status: 404 });
    }
  }

  const imageBytes = new Uint8Array(await photo.arrayBuffer());

  const userText = [
    speciesName ? `Especie: ${speciesName}` : null,
    symptoms ? `Síntomas reportados por el usuario: ${symptoms}` : null,
    "Analiza la salud de esta planta y responde con el JSON requerido.",
  ]
    .filter(Boolean)
    .join("\n");

  const aiResult = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: photo.type,
              data: Buffer.from(imageBytes).toString("base64"),
            },
          },
          { type: "text", text: userText },
        ],
      },
    ],
  });

  const raw = aiResult.content[0].type === "text" ? aiResult.content[0].text : "";
  const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  let parsed: DiagnosisResponse;
  try {
    parsed = DiagnosisResponseSchema.parse(JSON.parse(json));
  } catch {
    return NextResponse.json(
      { error: "No se pudo interpretar la respuesta de la IA. Intenta de nuevo." },
      { status: 502 }
    );
  }

  // Upload photo and save to DB only if linked to a plant
  if (plantId) {
    const blob = await put(`diagnosis/${Date.now()}-${photo.name}`, photo, {
      access: "public",
      contentType: photo.type,
    });

    await prisma.diagnosis.create({
      data: {
        plantId,
        photoUrl: blob.url,
        reportedSymptoms: typeof symptoms === "string" ? symptoms : null,
        aiModel: CLAUDE_MODEL,
        aiResponse: parsed as object,
        healthStatus: HEALTH_STATUS_MAP[parsed.healthStatus],
        detectedIssues: parsed.detectedIssues as object[],
        recommendedActions: parsed.recommendedActions as object[],
        reviewNextDate: parsed.reviewNextDate ? new Date(parsed.reviewNextDate) : null,
      },
    });
  }

  return NextResponse.json(parsed);
}
