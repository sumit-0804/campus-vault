"use server";

import { getGeminiClient } from "@/lib/gemini";

/**
 * Auto-tag an image using Gemini Vision API.
 * Sends the image URL to Gemini and extracts relevant tags.
 * Returns an empty array if Gemini is not configured.
 */
export async function autoTagImage(imageUrl: string): Promise<string[]> {
    try {
        const genAI = getGeminiClient();
        if (!genAI) return [];

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Fetch image as base64
        const response = await fetch(imageUrl);
        if (!response.ok) return [];

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = response.headers.get("content-type") || "image/jpeg";

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64,
                    mimeType,
                },
            },
            {
                text: `Analyze this image and return 5-8 relevant tags that describe the item shown.
Return ONLY a JSON array of lowercase strings, nothing else.
Example: ["electronics", "laptop", "silver", "used", "dell"]
Focus on: item type, category, color, brand (if visible), condition.`,
            },
        ]);

        const text = result.response.text().trim();

        // Parse the JSON array from the response
        const jsonMatch = text.match(/\[.*\]/);
        if (!jsonMatch) return [];

        const tags: string[] = JSON.parse(jsonMatch[0]);
        return tags.filter((t) => typeof t === "string").slice(0, 10);
    } catch (error) {
        console.error("Auto-tag error:", error);
        return [];
    }
}

/**
 * Detect PII (Personally Identifiable Information) in an image.
 * Uses Gemini Vision to check for phone numbers, emails, ID cards, etc.
 * Returns { hasPII: false } if Gemini is not configured.
 */
export async function detectPII(imageUrl: string): Promise<{
    hasPII: boolean;
    details: string;
}> {
    try {
        const genAI = getGeminiClient();
        if (!genAI) return { hasPII: false, details: "" };

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Fetch image as base64
        const response = await fetch(imageUrl);
        if (!response.ok) return { hasPII: false, details: "" };

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = response.headers.get("content-type") || "image/jpeg";

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64,
                    mimeType,
                },
            },
            {
                text: `Analyze this image for any Personally Identifiable Information (PII).
Check for:
- Phone numbers
- Email addresses
- Physical addresses
- ID cards, student IDs, driver's licenses
- Credit/debit card numbers
- Faces that could identify someone
- Any other PII

Return ONLY a JSON object in this format:
{"hasPII": true/false, "details": "brief description of PII found or empty string"}`,
            },
        ]);

        const text = result.response.text().trim();

        const jsonMatch = text.match(/\{.*\}/);
        if (!jsonMatch) return { hasPII: false, details: "" };

        const parsed = JSON.parse(jsonMatch[0]);
        return {
            hasPII: Boolean(parsed.hasPII),
            details: String(parsed.details || ""),
        };
    } catch (error) {
        console.error("PII detection error:", error);
        return { hasPII: false, details: "" };
    }
}
