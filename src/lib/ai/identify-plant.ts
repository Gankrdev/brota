import { claude, CLAUDE_MODEL } from "@/lib/ai/claude";
import { IDENTIFY_PLANT_PROMPT } from "@/lib/ai/prompts/identify-plant";
import { PlantIdentificationSchema, type PlantIdentification } from "@/lib/validators/plant-identification";

export async function identifyPlant(
  imageBytes: Uint8Array,
  mimeType: "image/jpeg" | "image/png" | "image/webp",
): Promise<PlantIdentification> {
  const result = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType,
              data: Buffer.from(imageBytes).toString("base64"),
            },
          },
          { type: "text", text: IDENTIFY_PLANT_PROMPT },
        ],
      },
    ],
  });

  const raw = result.content[0].type === "text" ? result.content[0].text : "";
  const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  const parsed = JSON.parse(json);
  return PlantIdentificationSchema.parse(parsed);
}
