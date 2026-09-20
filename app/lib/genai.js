import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL="gemini-3.6-flash";

export function createGemini(apiKey=process.env.GEMINI_API_KEY){
 if(!apiKey) return null;
 return new GoogleGenAI({apiKey});
}

export async function generateJson(ai,prompt){
 const response=await ai.models.generateContent({
  model:GEMINI_MODEL,
  contents:prompt,
  config:{responseMimeType:"application/json"}
 });
 const raw=String(response.text||"").replace(/```json|```/g,"").trim();
 return JSON.parse(raw);
}
