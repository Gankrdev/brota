import { NextRequest, NextResponse } from "next/server";
import { claude, CLAUDE_MODEL } from "@/lib/ai/claude";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedMime = (typeof ALLOWED_TYPES)[number];

function isAllowedMime(mime: string): mime is AllowedMime {
  return (ALLOWED_TYPES as readonly string[]).includes(mime);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  if (!checkRateLimit(`verify-photo:${session.user.id}`, { maxRequests: 10, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta más tarde." }, { status: 429 });
  }

  const formData = await req.formData();
  const photo = formData.get("photo");
  const expectedSpecies = formData.get("expectedSpecies");

  if (!(photo instanceof File) || typeof expectedSpecies !== "string") {
    return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
  }
  if (!isAllowedMime(photo.type)) {
    return NextResponse.json({ error: "Formato no soportado." }, { status: 400 });
  }
  if (photo.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "La imagen no puede superar 10 MB." }, { status: 400 });
  }

  const imageBytes = new Uint8Array(await photo.arrayBuffer());

  const result = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 128,
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
          {
            type: "text",
            text: `La planta registrada es "${expectedSpecies}". ¿La foto que ves corresponde a esta especie o a una planta similar? Responde SOLO con JSON: {"match": true} o {"match": false}. Si hay dudas razonables, responde {"match": true}.`,
          },
        ],
      },
    ],
  });

  const raw = result.content[0].type === "text" ? result.content[0].text : "";
  const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    const { match } = JSON.parse(json);
    return NextResponse.json({ match: Boolean(match) });
  } catch {
    return NextResponse.json({ match: true });
  }
}
