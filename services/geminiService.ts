import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL_TEXT } from "../constants";

// NOTE: In a production app, this should be proxied through a backend.
// The user requested a client-side implementation for this specific structure.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAIResponse = async (prompt: string, history: string[] = []) => {
  try {
    if (!process.env.API_KEY) {
      return "Please configure the API_KEY in your environment to use ChatXA Intelligence.";
    }

    const model = ai.models;
    
    const context = `You are ChatXA, a helpful, intelligent assistant developed by Company XA. 
    Your name is ChatXA. You are polite, concise, and helpful. 
    You can help with drafting messages, translation, and general knowledge.
    Previous conversation context: ${history.join('\n')}
    `;

    const response = await model.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: `${context}\nUser: ${prompt}`,
      config: {
        systemInstruction: "You are a highly advanced AI assistant named ChatXA built by Company XA.",
      }
    });

    return response.text || "I'm having trouble processing that right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection to ChatXA Brain failed. Please try again later.";
  }
};