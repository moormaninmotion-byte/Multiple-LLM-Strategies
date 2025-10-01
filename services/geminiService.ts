
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function* streamGeminiResponse(prompt: string, systemInstruction?: string) {
    try {
        const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                ...(systemInstruction && { systemInstruction }),
            },
        });

        for await (const chunk of response) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error streaming from Gemini:", error);
        yield "An error occurred while generating the response. Please check the console for details.";
    }
}
