import { NextRequest, NextResponse } from "next/server";
import { claude, CLAUDE_MODEL } from "@/lib/ai/claude";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedMime = (typeof ALLOWED_TYPES)[number];

function isAllowedMime(mime: string): mime is AllowedMime {
  return (ALLOWED_TYPES as readonly string[]).includes(mime);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const photo = formData.get("photo");
  const expectedSpecies = formData.get("expectedSpecies");

  if (!(photo instanceof File) || typeof expectedSpecies !== "string") {
    return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
  }
  if (!isAllowedMime(photo.type)) {
    return NextResponse.json({ error: "Formato no soportado." }, { status: 400 });
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
    // If parsing fails, allow the update to proceed
    return NextResponse.json({ match: true });
  }
}
