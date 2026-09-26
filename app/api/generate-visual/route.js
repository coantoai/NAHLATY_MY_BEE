import { NextResponse } from "next/server";
import { requestLimit } from "../../lib/requestGuard";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=180;

const API_KEY=process.env.DASHSCOPE_API_KEY;
const IMAGE_MODEL=process.env.QWEN_IMAGE_MODEL||"qwen-image-3.0";
const VISION_MODEL=process.env.QWEN_VISION_MODEL||"qwen3-vl-flash";
const BASE=(process.env.DASHSCOPE_BASE_URL||"https://dashscope-intl.aliyuncs.com").replace(/\/$/,"");
const IMAGE_ENDPOINT=`${BASE}/api/v1/services/aigc/multimodal-generation/generation`;
const CHAT_ENDPOINT=`${BASE}/compatible-mode/v1/chat/completions`;

function imageAnchor(value){
 const raw=String(value||"");
 return raw.startsWith("data:image/")&&raw.includes(";base64,")&&raw.length<=10000000?raw:null;
}
function parseJson(text){
 const raw=String(text||"").trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"");
 try{return JSON.parse(raw)}catch{}
 const a=raw.indexOf("{"),b=raw.lastIndexOf("}");
 if(a>=0&&b>a){try{return JSON.parse(raw.slice(a,b+1))}catch{}}
 return null;
}
async function qwenText(messages,max_tokens=900){
 const r=await fetch(CHAT_ENDPOINT,{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${API_KEY}`},body:JSON.stringify({model:VISION_MODEL,messages,temperature:0.1,max_tokens,enable_thinking:false})});
 const p=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(p?.error?.message||p?.message||`Qwen verification failed (${r.status})`);
 return {text:p?.choices?.[0]?.message?.content||"",usage:p?.usage||null};
}
async function buildTruthSpec(question,previous,summary){
 const prompt=`You are NAHLATY's scientific truth gate. Build a conservative visual truth specification for an educational image. Do not invent uncertain facts.
Question: ${question}
Previous topic: ${previous}
Previous context: ${summary}
Return ONLY JSON:
{"status":"VERIFIED|PARTIAL|UNKNOWN","topic":"...","claims":[{"claim":"...","status":"VERIFIED|UNCERTAIN","importance":"critical|supporting"}],"mustShow":["..."],"mustNotShow":["..."],"uncertainties":["..."]}
Use established scientific knowledge. If a critical detail is uncertain, mark it uncertain and prohibit depicting it.`;
 const out=await qwenText([{role:"user",content:prompt}],850);
 const spec=parseJson(out.text);
 if(!spec||!Array.isArray(spec.claims))throw new Error("Qwen Truth Gate returned invalid specification");
 if(spec.status==="UNKNOWN")throw new Error("Qwen Truth Gate blocked generation: truth unresolved");
 if(!spec.claims.some(c=>c?.importance==="critical"&&c?.status==="VERIFIED"))throw new Error("Qwen Truth Gate blocked generation: no verified critical claim");
 return {spec,usage:out.usage};
}
async function generateImage(prompt,anchor){
 const content=[];
 if(anchor)content.push({image:anchor});
 content.push({text:prompt});
 const r=await fetch(IMAGE_ENDPOINT,{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${API_KEY}`},body:JSON.stringify({
  model:IMAGE_MODEL,
  input:{messages:[{role:"user",content}]},
  parameters:{prompt_extend:false,n:1,size:"1536*1024",watermark:false,negative_prompt:"dashboard, UI cards, poster, title card, paragraph text, decorative typography, watermark, logo, inaccurate anatomy, reversed arrows, invented labels"}
 })});
 const p=await r.json().catch(()=>({}));
 if(!r.ok||p?.code)throw new Error(p?.message||`Qwen Image failed (${r.status})`);
 const url=p?.output?.choices?.[0]?.message?.content?.find?.(x=>x?.image)?.image;
 if(!url)throw new Error("Qwen Image returned no image URL");
 const ir=await fetch(url);
 if(!ir.ok)throw new Error(`Qwen image download failed (${ir.status})`);
 const mime=ir.headers.get("content-type")||"image/png";
 const bytes=Buffer.from(await ir.arrayBuffer());
 return {data:`data:${mime};base64,${bytes.toString("base64")}`,usage:p?.usage||null,requestId:p?.request_id||null};
}
async function verifyVisual(dataUrl,spec){
 const prompt=`Inspect this educational image against this locked truth specification: ${JSON.stringify(spec)}
Reject visible factual contradictions: wrong anatomy, reversed flow/arrows, impossible sequence, false labels, unsupported invented detail, or mustNotShow violations.
Return ONLY JSON {"pass":true|false,"criticalErrors":["..."],"reason":"..."}.`;
 const out=await qwenText([{role:"user",content:[{type:"image_url",image_url:{url:dataUrl}},{type:"text",text:prompt}]}],450);
 const verdict=parseJson(out.text);
 if(!verdict||typeof verdict.pass!=="boolean")return {pass:false,criticalErrors:["Invalid verification verdict"],reason:"invalid-verdict",usage:out.usage};
 return {...verdict,usage:out.usage};
}

export async function POST(req){
 const blocked=requestLimit(req,{scope:"visual-generation",limit:3,windowMs:60000});
 if(blocked)return blocked;
 try{
  if(!API_KEY)return NextResponse.json({ok:false,error:"DASHSCOPE_API_KEY is not configured"},{status:503});
  const body=await req.json();
  const question=String(body?.question||"").trim().slice(0,1200);
  const context=body?.context||{};
  if(!question)return NextResponse.json({ok:false,error:"question required"},{status:400});
  const previous=String(context?.previousTitle||"").slice(0,180);
  const summary=String(context?.previousSummary||"").slice(0,900);
  const anchor=imageAnchor(context?.previousImage);
  const truth=await buildTruthSpec(question,previous,summary);
  const prompt=`Create exactly one premium cinematic educational visual for My Bee.
User question: ${question}
Existing topic: ${previous}
Existing context: ${summary}
LOCKED TRUTH: ${JSON.stringify(truth.spec)}
${anchor?"Use the reference image as the SAME visual world. Preserve subject identity, spatial relationships, palette and lighting; evolve only what the follow-up requires.":"Create a coherent visual world that can evolve through follow-up questions."}
The image itself must explain the idea. Prefer ZERO text. Use composition, cutaway, zoom, transparency, layers, flow, arrows and cause/effect only when licensed by LOCKED TRUTH. Omit uncertain details. Deep navy cinematic environment with restrained honey-gold guidance accents. No dashboard, cards, paragraphs, poster typography or irrelevant objects.`;
  // Cost guard: one image generation per user request. No automatic paid regeneration.
  const out=await generateImage(prompt,anchor);
  const verdict=await verifyVisual(out.data,truth.spec);
  if(!verdict.pass)return NextResponse.json({ok:false,error:"Visual Truth Gate rejected generated image",visualTruthGate:verdict,provider:"qwen-only"},{status:422});
  return NextResponse.json({ok:true,image:out.data,model:IMAGE_MODEL,provider:"qwen-only",continuity:Boolean(anchor),generationUsage:out.usage,generationRequestId:out.requestId,truthGate:{status:truth.spec.status,topic:truth.spec.topic,claims:truth.spec.claims,usage:truth.usage},visualTruthGate:{pass:true,usage:verdict.usage}});
 }catch(error){
  console.error("[NAHLATY_QWEN_ERROR]",String(error?.message||error));
  return NextResponse.json({ok:false,error:String(error?.message||error)},{status:500});
 }
}
