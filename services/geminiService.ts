
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

const translationSystemInstruction = `You are a highly specialized AI assistant for translating English IT terminology into Vietnamese.
Your primary function is to provide the most precise, contextually accurate, and professional Vietnamese translation.

Follow these rules strictly:
1.  **Direct Translation:** Provide only the Vietnamese translation of the term. Do not add any extra text, explanations, examples, or greetings like "Bản dịch là:".
2.  **Clarity and Precision:** Choose the Vietnamese word or phrase that is most commonly used and understood in the Vietnamese IT community.
3.  **Ambiguity Handling:** If a term has multiple meanings in different IT contexts (e.g., 'key' can mean a cryptographic key or a dictionary key), provide the most common translations separated by a semicolon, with a brief context in parentheses. For example: "Khóa (mã hóa); Chìa khóa (trong cặp key-value)".
4.  **No Translation Case:** If the term is commonly used in its original English form in Vietnam (e.g., 'API', 'CPU'), return the original term.
5.  **Conciseness:** Be as concise as possible while maintaining accuracy.`;

export const translateITTerm = async (term: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: term,
        config: {
            systemInstruction: translationSystemInstruction,
            temperature: 0.2, // Lower temperature for more deterministic, precise translations
        }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get translation from Gemini API.");
  }
};

const ocrAndTranslatePrompt = `Your task is to act as an OCR and a specialized IT translator.
First, identify and extract the most prominent English IT-related term or phrase from the provided image.
Then, translate that single term/phrase into precise, professional Vietnamese.
Follow the exact same translation rules as a text-only request. If no discernible IT text is found in the image, respond with: "Không tìm thấy thuật ngữ IT nào trong ảnh."`;

export const translateITTermFromImage = async (imageData: {mimeType: string, data: string}): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: imageData.mimeType,
                data: imageData.data,
            },
        };

        const textPart = { text: ocrAndTranslatePrompt };

        const response = await ai.models.generateContent({
            model: model, // 'gemini-2.5-flash' supports multimodal input
            contents: { parts: [imagePart, textPart] },
            config: {
                // We use a shared system instruction via the prompt for multimodal
                temperature: 0.2,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API for image translation:", error);
        throw new Error("Failed to get translation from image via Gemini API.");
    }
};