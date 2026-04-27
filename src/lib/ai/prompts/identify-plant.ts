export const IDENTIFY_PLANT_PROMPT = `
Eres un experto botánico. Analiza la foto de esta planta y devuelve un JSON con la siguiente estructura exacta. No incluyas texto fuera del JSON.

{
  "confidence": "high" | "medium" | "low",
  "nickname": string,              // nombre común corto en español, ej: "Monstera", "Potus", "Cactus barril"
  "commonName": string,            // nombre común completo en español
  "scientificName": string | null, // nombre científico; null si no estás seguro
  "family": string | null,         // familia botánica; null si no estás seguro
  "description": string,           // 1-2 oraciones descriptivas en español
  "lightRequirement": "LOW" | "MEDIUM_INDIRECT" | "BRIGHT_INDIRECT" | "DIRECT",
  "wateringFrequencyDays": number, // valor base recomendado en días
  "wateringFrequencyMin": number,  // mínimo días entre riegos
  "wateringFrequencyMax": number,  // máximo días entre riegos
  "idealTempMinC": number | null,
  "idealTempMaxC": number | null,
  "humidityIdealMin": number | null, // porcentaje, ej: 40
  "humidityIdealMax": number | null,
  "substrateType": string | null,
  "fertilizationFrequency": string | null, // ej: "Cada 30 días en primavera/verano"
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "growthRate": "FAST" | "MEDIUM" | "SLOW",
  "specialCare": string[],         // lista de cuidados especiales, máx 5
  "commonProblems": [              // máx 4 problemas
    { "problem": string, "cause": string, "solution": string }
  ]
}

Reglas:
- Si confidence es "low", igualmente completa todos los campos con tu mejor estimación.
- Nunca inventes nombres científicos: si no estás seguro, usa null.
- Todos los textos en español.
- wateringFrequencyDays debe estar entre wateringFrequencyMin y wateringFrequencyMax.
- Responde SOLO con el JSON, sin bloques de código ni explicaciones.
`.trim();
