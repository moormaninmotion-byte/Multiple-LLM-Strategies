import { GoogleGenAI } from "@google/genai";

export async function* streamGeminiResponse(
    apiKey: string,
    prompt: string, 
    systemInstruction?: string
) {
    const ai = new GoogleGenAI({ apiKey });

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
        if (error instanceof Error && error.message.includes('API key not valid')) {
             yield "Error: The provided API key is not valid. Please check your key and try again.";
        } else {
            yield "An error occurred while generating the response. Please check the console for details.";
        }
    }
}
