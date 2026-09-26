import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { requestLimit } from "../../lib/requestGuard";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=180;

const API_KEY=process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY||process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const IMAGE_MODELS=[...new Set([process.env.GEMINI_IMAGE_MODEL,"gemini-3.1-flash-image","gemini-2.5-flash-image"].filter(Boolean))];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function previousImagePart(value){
 const raw=String(value||"");
 if(!raw.startsWith("data:image/")||!raw.includes(";base64,")||raw.length>3600000)return null;
 const comma=raw.indexOf(",");
 const meta=raw.slice(5,comma);
 const mimeType=meta.slice(0,meta.indexOf(";"));
 const data=raw.slice(comma+1);
 return mimeType&&data?{inlineData:{mimeType,data}}:null;
}

function retryable(error){
 const status=Number(error?.status||error?.code||error?.error?.code);
 if([429,500,502,503,504].includes(status))return true;
 return /429|500|502|503|504|timeout|temporar|overload|unavailable/i.test(String(error?.message||error||""));
}

function extractImage(response){
 let image=null,mime="image/png",caption="";
 for(const part of response?.candidates?.[0]?.content?.parts||[]){
  if(part?.inlineData?.data){image=part.inlineData.data;mime=part.inlineData.mimeType||mime}
  else if(part?.text)caption+=part.text;
 }
 return {image,mime,caption:caption.trim()};
}

async function generateWithRetry(ai,model,contents){
 let lastError=null;
 for(let attempt=1;attempt<=2;attempt++){
  try{
   const response=await ai.models.generateContent({model,contents,config:{responseModalities:["IMAGE"]}});
   const out=extractImage(response);
   if(out.image)return out;
   lastError=new Error("Image model returned no image");
  }catch(error){
   lastError=error;
   if(!retryable(error)||attempt===2)break;
   await sleep(500*attempt);
  }
 }
 throw lastError||new Error("Visual generation failed");
}

export async function POST(req){
 const blocked=requestLimit(req,{scope:"visual-generation",limit:6,windowMs:60000});
 if(blocked)return blocked;
 try{
  if(!API_KEY)return NextResponse.json({ok:false,error:"GEMINI_API_KEY is not configured"},{status:503});
  const body=await req.json();
  const question=String(body?.question||"").trim().slice(0,1200);
  const context=body?.context||{};
  if(!question)return NextResponse.json({ok:false,error:"question required"},{status:400});

  const previous=String(context?.previousTitle||"").slice(0,180);
  const summary=String(context?.previousSummary||"").slice(0,900);
  const imageAnchor=previousImagePart(context?.previousImage);
  const prompt=`Create exactly one premium cinematic educational visual for an interactive visual-understanding engine called My Bee.
User question: ${question}
Existing world/topic: ${previous}
Existing explanation: ${summary}
${imageAnchor?"The attached image is the current scene. Keep it as the same visual world and evolve it for the new question. Preserve subject identity, spatial relationships, palette and lighting unless the question requires zoom, cutaway, transparency or another viewpoint.":"Create a coherent first visual world that can be evolved by later questions."}
The visual itself is the explanation. Do not rely on a caption, paragraph, text panel, title card, or written summary. Explain through composition, spatial relationships, arrows, flow, highlighted parts, cutaway, zoom, layers, before/after states, scale, and cause-and-effect. Prefer ZERO rendered text. Only when a word is indispensable for understanding, use at most 4 tiny labels total, each 1 to 3 words, in the user's language. Never render sentences or paragraphs. One dominant focal subject, meaningful depth, uncluttered composition, scientifically and anatomically accurate where relevant. Deep navy cinematic environment with restrained warm honey-gold guidance accents. No dashboard, UI cards, logo, poster typography, decorative text, or irrelevant objects.`;

  const ai=new GoogleGenAI({apiKey:API_KEY});
  const anchoredContents=imageAnchor?[{role:"user",parts:[imageAnchor,{text:prompt}]}]:null;
  const plans=imageAnchor
   ?[{contents:anchoredContents,continuity:true},{contents:prompt,continuity:false}]
   :[{contents:prompt,continuity:false}];

  let lastError=null;
  for(const plan of plans){
   for(const model of IMAGE_MODELS){
    try{
     const out=await generateWithRetry(ai,model,plan.contents);
     return NextResponse.json({
      ok:true,
      image:`data:${out.mime};base64,${out.image}`,
      caption:out.caption,
      model,
      continuity:plan.continuity,
      continuityFallback:Boolean(imageAnchor&&!plan.continuity)
     });
    }catch(error){lastError=error}
   }
  }

  throw lastError||new Error("Visual generation failed");
 }catch(error){
  console.error("[NAHLATY_VISUAL_ERROR]",String(error?.message||error),error?.stack||"");
  return NextResponse.json({ok:false,error:String(error?.message||error)},{status:500});
 }
}
