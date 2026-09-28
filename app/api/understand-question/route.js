import { NextResponse } from "next/server";
import { requestLimit } from "../../lib/requestGuard";
import { buildAnswerFirst } from "../../lib/answerFirst";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=90;
const BASE=(process.env.DASHSCOPE_BASE_URL||"https://dashscope-intl.aliyuncs.com").replace(/\/$/,"");

export async function POST(req){
 const blocked=requestLimit(req,{scope:"answer-first-preview",limit:12,windowMs:60000});
 if(blocked)return blocked;
 try{
  const body=await req.json();
  const question=String(body?.question||"").trim().slice(0,700);
  if(!question)return NextResponse.json({ok:false,error:"السؤال مطلوب"},{status:400});
  if(!process.env.DASHSCOPE_API_KEY)return NextResponse.json({ok:false,error:"Qwen API is not configured"},{status:503});
  const out=await buildAnswerFirst({
   question,previous:String(body?.previous||"").slice(0,180),
   previousSummary:String(body?.previousSummary||"").slice(0,900),
   upstreamAnswer:String(body?.upstreamAnswer||"").slice(0,900),
   stages:Array.isArray(body?.stages)?body.stages:[],
   apiKey:process.env.DASHSCOPE_API_KEY,
   endpoint:BASE+"/compatible-mode/v1/chat/completions",
   model:process.env.QWEN_VISION_MODEL||"qwen3-vl-flash"
  });
  return NextResponse.json({ok:true,plan:out.plan,review:out.review,
   verification:"Internal model review only; not independently fact-checked.",usage:out.usage,imageGenerated:false});
 }catch(err){
  return NextResponse.json({ok:false,error:String(err?.message||err),imageGenerated:false},{status:422});
 }
}
