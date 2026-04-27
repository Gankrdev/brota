import { z } from "zod";

export const PlantIdentificationSchema = z.object({
  confidence: z.enum(["high", "medium", "low"]),
  nickname: z.string().min(1),
  commonName: z.string().min(1),
  scientificName: z.string().nullable(),
  family: z.string().nullable(),
  description: z.string().min(1),
  lightRequirement: z.enum(["LOW", "MEDIUM_INDIRECT", "BRIGHT_INDIRECT", "DIRECT"]),
  wateringFrequencyDays: z.number().int().positive(),
  wateringFrequencyMin: z.number().int().positive(),
  wateringFrequencyMax: z.number().int().positive(),
  idealTempMinC: z.number().nullable(),
  idealTempMaxC: z.number().nullable(),
  humidityIdealMin: z.number().int().nullable(),
  humidityIdealMax: z.number().int().nullable(),
  substrateType: z.string().nullable(),
  fertilizationFrequency: z.string().nullable(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  growthRate: z.enum(["FAST", "MEDIUM", "SLOW"]),
  specialCare: z.array(z.string()),
  commonProblems: z.array(
    z.object({
      problem: z.string(),
      cause: z.string(),
      solution: z.string(),
    }),
  ),
});

export type PlantIdentification = z.infer<typeof PlantIdentificationSchema>;
