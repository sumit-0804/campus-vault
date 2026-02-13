import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI | null {
    if (!apiKey) {
        console.warn("GEMINI_API_KEY not set — AI features disabled");
        return null;
    }
    if (!genAI) {
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}
