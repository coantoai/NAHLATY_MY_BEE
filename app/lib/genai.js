import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL="gemini-3.5-flash";

export function createGemini(apiKey=process.env.GEMINI_API_KEY){
 if(!apiKey) return null;
 return new GoogleGenAI({apiKey});
}

export function genAIErrorStatus(error){
 const direct=Number(error?.status||error?.code||error?.error?.code);
 if(Number.isFinite(direct)&&direct>0) return direct;
 const message=String(error?.message||error||"");
 const match=message.match(/\b(429|500|502|503|504)\b/);
 return match?Number(match[1]):0;
}

export function isTransientGenAIError(error){
 return [429,500,502,503,504].includes(genAIErrorStatus(error));
}

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

export async function generateJson(ai,prompt,{maxAttempts=3,retryBaseMs=450}={}){
 let lastError=null;
 for(let attempt=1;attempt<=Math.max(1,maxAttempts);attempt++){
  try{
   const response=await ai.models.generateContent({
    model:GEMINI_MODEL,
    contents:prompt,
    config:{responseMimeType:"application/json"}
   });
   const raw=String(response.text||"").replace(/```json|```/g,"").trim();
   return JSON.parse(raw);
  }catch(error){
   lastError=error;
   if(!isTransientGenAIError(error)||attempt>=maxAttempts) throw error;
   const jitter=Math.floor(Math.random()*120);
   await sleep(Math.max(0,retryBaseMs)*(2**(attempt-1))+jitter);
  }
 }
 throw lastError||new Error("Gemini generation failed");
}
