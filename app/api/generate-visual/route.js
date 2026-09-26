import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=120;
const API_KEY=process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY||process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const IMAGE_MODEL=process.env.GEMINI_IMAGE_MODEL||"gemini-2.5-flash-image";
export async function POST(req){
 try{
  if(!API_KEY)return NextResponse.json({ok:false,error:"GEMINI_API_KEY is not configured"},{status:503});
  const body=await req.json();
  const question=String(body?.question||"").trim().slice(0,1200);
  const context=body?.context||{};
  if(!question)return NextResponse.json({ok:false,error:"question required"},{status:400});
  const ai=new GoogleGenAI({apiKey:API_KEY});
  const previous=String(context?.previousTitle||"").slice(0,180);
  const summary=String(context?.previousSummary||"").slice(0,700);
  const prompt=`Create one premium cinematic educational visual for an interactive visual-understanding engine called My Bee. User question: ${question}. Existing world/topic: ${previous}. Existing explanation: ${summary}. Preserve continuity with the existing world when this is a follow-up. Show the mechanism spatially and clearly, not a poster or dashboard. One dominant focal subject, meaningful depth, clean composition, dark navy cinematic environment with restrained warm honey-gold guidance accents. Anatomical/scientific accuracy where relevant. No UI, no cards, no logos, no decorative text, no watermark. If labels are essential, keep them minimal and in the user's language. The image must help answer the question visually.`;
  const response=await ai.models.generateContent({model:IMAGE_MODEL,contents:prompt,config:{responseModalities:["TEXT","IMAGE"]}});
  let image=null,mime="image/png",caption="";
  for(const part of response?.candidates?.[0]?.content?.parts||[]){
   if(part?.inlineData?.data){image=part.inlineData.data;mime=part.inlineData.mimeType||mime}
   else if(part?.text)caption+=part.text;
  }
  if(!image)return NextResponse.json({ok:false,error:"Image model returned no image",caption},{status:502});
  return NextResponse.json({ok:true,image:`data:${mime};base64,${image}`,caption:caption.trim(),model:IMAGE_MODEL});
 }catch(error){return NextResponse.json({ok:false,error:String(error?.message||error)},{status:500})}
}
