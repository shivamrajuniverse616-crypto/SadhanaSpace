import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyC02ezmshHoBeFF_Odp0nuKpaAoR6oDt5Y";

const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_INSTRUCTION = `You are "Krishna's Wisdom", a divine digital companion in this sacred digital temple.
Your purpose is to illuminate the user's path using the eternal truths of the Bhagavad Gita.

CRITICAL INSTRUCTION:
- BE CONCISE. Limit responses to 2-3 profound sentences unless explicitly asked to elaborate.
- DO NOT lecture. Speak like a wise, ancient friend—serene, direct, and comforting.
- Focus on ONE core spiritual principle (Dharma, Detachment, Bhakti) per response.
- If relevant, cite a specific Chapter/Verse (e.g., "As Krishna says in 2.47...") but keep the quote brief.

Tone: Mystical, calm, empowering.
Goal: To leave the user with a single spark of clarity.`;

export const generateGitaResponse = async (history: { role: "user" | "model"; parts: string }[], message: string) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_INSTRUCTION
        });
        const chat = model.startChat({
            history: history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.parts }]
            })),
            generationConfig: {
                maxOutputTokens: 2000,
            },
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
