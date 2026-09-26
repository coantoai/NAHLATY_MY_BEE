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

function curatedVisualEvidence(question,previous){
 const subject=`${question} ${previous}`;
 if(/(حوت|حيتان|whale)/i.test(subject)&&/(رضع|رضاعة|حليب|لبن|nurs|milk)/i.test(subject))return {
  topic:"whale-nursing",
  source:"https://sanctuaries.noaa.gov/news/mar20/new-research-humpback-whale-nursing-behavior.html",
  facts:["A humpback calf nurses underwater with its mouth at the mother's mammary slit on the underside of her body.","The mother and calf align during feeding. A calf must surface separately to breathe air."],
  forbid:["Milk from a blowhole or mouth","A humanlike external breast on the whale","The calf nursing from the mother's head"]
 };
 if(/(قلب|صمام|بطين|أذين|heart|ventric|valve)/i.test(subject))return {
  topic:"heart-flow",
  source:"https://www.nhlbi.nih.gov/health/heart/blood-flow",
  facts:["Oxygen-poor blood moves from the body through the right heart to the lungs.","Oxygen-rich blood returns from the lungs through the left heart and exits via the aorta.","Heart valves prevent backward flow."],
  forbid:["Reversing the physiological direction of blood flow","Exchanging the roles of the right and left heart","A valve that pumps instead of regulating one-way flow"]
 };
 if(/(رئة|رئتان|الرئتين|حويصل|تنفس|lung|alveol)/i.test(subject))return {
  topic:"lung-gas-exchange",
  source:"https://www.nhlbi.nih.gov/health/lungs/breathing-benefits",
  facts:["Inhaled air travels through the trachea and branching airways to alveoli.","Oxygen diffuses from alveoli into surrounding capillary blood; carbon dioxide diffuses from blood into alveoli.","Contraction of the diaphragm during inhalation expands the chest cavity."],
  forbid:["Oxygen arrows from blood into alveolar air as the main uptake pathway","Carbon dioxide arrows from inhaled air into blood as the main elimination pathway","Treating alveoli as blood vessels"]
 };
 return null;
}

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
 const reference=curatedVisualEvidence(question,previous);
 const prompt=`You are NAHLATY's scientific truth gate. Build a conservative visual truth specification for an educational image. Do not invent uncertain facts.
Question: ${question}
Previous topic: ${previous}
Previous context: ${summary}
${reference?`CURATED SOURCE CONSTRAINTS: ${JSON.stringify(reference)}. Follow these reference-backed constraints. Do not imply all other claims are externally verified.`:"No curated source for this topic: do not imply external verification."}
Return ONLY JSON:
{"status":"VERIFIED|PARTIAL|UNKNOWN","topic":"...","claims":[{"claim":"...","status":"VERIFIED|UNCERTAIN","importance":"critical|supporting"}],"mustShow":["..."],"mustNotShow":["..."],"uncertainties":["..."]}
Use established scientific knowledge. If a critical detail is uncertain, mark it uncertain and prohibit depicting it.`;
 const out=await qwenText([{role:"user",content:prompt}],850);
 const spec=parseJson(out.text);
 if(!spec||!Array.isArray(spec.claims))throw new Error("Qwen Truth Gate returned invalid specification");
 if(spec.status==="UNKNOWN")throw new Error("Qwen Truth Gate blocked generation: truth unresolved");
 if(!spec.claims.some(c=>c?.importance==="critical"&&c?.status==="VERIFIED"))throw new Error("Qwen Truth Gate blocked generation: no verified critical claim");
 return {spec:{...spec,sourceEvidence:reference},usage:out.usage};
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
async function verifyVisual(dataUrl,spec,anchor=null){
 const prompt=`Inspect the educational result against this truth specification: ${JSON.stringify(spec)}
${anchor?"There are TWO images: first = previous world, second = newly generated result. Confirm the original subject/world remains recognizable while the camera or explanatory detail evolves. A different animal, different anatomy, or unrelated visual world fails continuity.":"There is one newly generated image."}
Reject factual contradictions: wrong anatomy, reversed flow/arrows, impossible sequence, false labels, unsupported invented detail, and mustNotShow violations.
Return ONLY JSON {"pass":true|false,"continuityPreserved":true|false,"criticalErrors":["..."],"reason":"..."}.
If only one image is supplied, set continuityPreserved to false; that is not a failure.
If two images are supplied, set continuityPreserved true only if the underlying world and subject remain coherent.`;
 const images=anchor?[{type:"image_url",image_url:{url:anchor}},{type:"image_url",image_url:{url:dataUrl}}]:[{type:"image_url",image_url:{url:dataUrl}}];
 const out=await qwenText([{role:"user",content:[...images,{type:"text",text:prompt}]}],550);
 const verdict=parseJson(out.text);
 if(!verdict||typeof verdict.pass!=="boolean")return {pass:false,criticalErrors:["Invalid verification verdict"],reason:"invalid-verdict",continuityPreserved:false,usage:out.usage};
 if(anchor&&verdict.continuityPreserved!==true)return {pass:false,criticalErrors:[...(Array.isArray(verdict.criticalErrors)?verdict.criticalErrors:[]),"Continuity was not confirmed"],reason:verdict.reason||"continuity-unverified",continuityPreserved:false,usage:out.usage};
 return {...verdict,continuityPreserved:anchor?verdict.continuityPreserved===true:false,usage:out.usage};
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
  const verdict=await verifyVisual(out.data,truth.spec,anchor);
  if(!verdict.pass)return NextResponse.json({ok:false,error:"Visual Truth Gate rejected generated image",visualTruthGate:verdict,provider:"qwen-only"},{status:422});
  return NextResponse.json({ok:true,image:out.data,model:IMAGE_MODEL,provider:"qwen-only",continuity:Boolean(anchor)&&verdict.continuityPreserved===true,generationUsage:out.usage,generationRequestId:out.requestId,truthGate:{status:truth.spec.status,reviewLevel:truth.spec.sourceEvidence?"model-reviewed-with-curated-constraints":"model-reviewed-only",sourceEvidence:truth.spec.sourceEvidence?{topic:truth.spec.sourceEvidence.topic,source:truth.spec.sourceEvidence.source}:null,topic:truth.spec.topic,claims:truth.spec.claims,usage:truth.usage},visualTruthGate:{pass:true,usage:verdict.usage}});
 }catch(error){
  console.error("[NAHLATY_QWEN_ERROR]",String(error?.message||error));
  return NextResponse.json({ok:false,error:String(error?.message||error)},{status:500});
 }
}
