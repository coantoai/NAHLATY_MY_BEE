import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { requestLimit } from "../../lib/requestGuard";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=180;

const API_KEY=process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY||process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const IMAGE_MODELS=[...new Set([process.env.GEMINI_IMAGE_MODEL,"gemini-3.1-flash-image","gemini-2.5-flash-image"].filter(Boolean))];

function previousImagePart(value){
 const raw=String(value||"");
 if(!raw.startsWith("data:image/")||!raw.includes(";base64,")||raw.length>3600000)return null;
 const comma=raw.indexOf(",");
 const meta=raw.slice(5,comma);
 const mimeType=meta.slice(0,meta.indexOf(";"));
 const data=raw.slice(comma+1);
 return mimeType&&data?{inlineData:{mimeType,data}}:null;
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
The visual must answer the question spatially. Show mechanism, cause-and-effect, flow, layers, scale, cutaway, or focus only when they improve understanding. One dominant focal subject, meaningful depth, uncluttered composition, scientifically and anatomically accurate where relevant. Deep navy cinematic environment with restrained warm honey-gold guidance accents. No dashboard, UI cards, logo, decorative poster text, or irrelevant objects. Avoid labels unless indispensable; if indispensable keep them very short and in the user's language.`;

  const ai=new GoogleGenAI({apiKey:API_KEY});
  const contents=imageAnchor?[{role:"user",parts:[imageAnchor,{text:prompt}]}]:prompt;
  let lastError=null;

  for(const model of IMAGE_MODELS){
   try{
    const response=await ai.models.generateContent({model,contents,config:{responseModalities:["IMAGE"]}});
    let image=null,mime="image/png",caption="";
    for(const part of response?.candidates?.[0]?.content?.parts||[]){
     if(part?.inlineData?.data){image=part.inlineData.data;mime=part.inlineData.mimeType||mime}
     else if(part?.text)caption+=part.text;
    }
    if(image)return NextResponse.json({ok:true,image:`data:${mime};base64,${image}`,caption:caption.trim(),model,continuity:Boolean(imageAnchor)});
    lastError=new Error("Image model returned no image");
   }catch(error){lastError=error}
  }

  throw lastError||new Error("Visual generation failed");
 }catch(error){
  return NextResponse.json({ok:false,error:String(error?.message||error)},{status:500});
 }
}
