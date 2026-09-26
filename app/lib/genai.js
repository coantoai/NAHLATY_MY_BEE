import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL=process.env.GEMINI_MODEL||"gemini-3.5-flash-lite";

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

export async function generateJson(ai,prompt,{maxAttempts=4,retryBaseMs=450}={}){
 let lastError=null;
 const attempts=Math.max(1,maxAttempts);
 for(let attempt=1;attempt<=attempts;attempt++){
  try{
   const response=await ai.models.generateContent({
    model:GEMINI_MODEL,
    contents:attempt===1?prompt:`${prompt}\n\nIMPORTANT RETRY: Return one complete, strictly valid JSON object only. Use double quotes for every key and string. Do not use comments, trailing commas, markdown fences, or text before/after the JSON.`,
    config:{responseMimeType:"application/json"}
   });
   const raw=String(response.text||"").replace(/```json|```/g,"").trim();
   if(!raw) throw new SyntaxError("Empty JSON response");
   try{
    return JSON.parse(raw);
   }catch(parseError){
    const repaired=raw
     .replace(/,\s*([}\]])/g,"$1")
     .replace(/[\u201C\u201D]/g,'"')
     .replace(/[\u2018\u2019]/g,"'");
    if(repaired!==raw){
     try{return JSON.parse(repaired);}catch{}
    }
    throw parseError;
   }
  }catch(error){
   lastError=error;
   const retryable=isTransientGenAIError(error)||error instanceof SyntaxError;
   if(!retryable||attempt>=attempts) throw error;
   const base=Math.max(0,retryBaseMs);
   const jitter=base?Math.floor(Math.random()*120):0;
   await sleep(base*(2**(attempt-1))+jitter);
  }
 }
 throw lastError||new Error("Gemini generation failed");
}

export async function generateText(ai,contents,{config={},maxAttempts=3,retryBaseMs=450}={}){
 let lastError=null;
 for(let attempt=1;attempt<=Math.max(1,maxAttempts);attempt++){
  try{
   const response=await ai.models.generateContent({
    model:GEMINI_MODEL,
    contents,
    config
   });
   return String(response.text||"").trim();
  }catch(error){
   lastError=error;
   if(!isTransientGenAIError(error)||attempt>=maxAttempts) throw error;
   const base=Math.max(0,retryBaseMs);
   const jitter=base?Math.floor(Math.random()*120):0;
   await sleep(base*(2**(attempt-1))+jitter);
  }
 }
 throw lastError||new Error("Gemini generation failed");
}
