import { GoogleGenAI } from "@google/genai";

if (!process.env.GOOGLE_GENAI_API_KEY) {
  throw new Error("GOOGLE_GENAI_API_KEY is not set");
}

export const gemini = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
export const GEMINI_MODEL = "gemini-2.5-flash";
