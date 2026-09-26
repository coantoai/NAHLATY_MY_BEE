import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { requestLimit } from "../../lib/requestGuard";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=180;

const API_KEY=process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY||process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const DASHSCOPE_API_KEY=process.env.DASHSCOPE_API_KEY;
const QWEN_IMAGE_MODEL=process.env.QWEN_IMAGE_MODEL||"qwen-image-3.0";
const DASHSCOPE_BASE_URL=(process.env.DASHSCOPE_BASE_URL||"https://dashscope-intl.aliyuncs.com").replace(/\\\/$/,"");
const QWEN_ENDPOINT=`${DASHSCOPE_BASE_URL}/api/v1/services/aigc/multimodal-generation/generation`;
const GROUNDING_MODEL=process.env.GEMINI_GROUNDING_MODEL||"gemini-2.5-flash";
const VERIFY_MODEL=process.env.GEMINI_VERIFY_MODEL||GROUNDING_MODEL;
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

function extractText(response){
 return (response?.candidates?.[0]?.content?.parts||[]).map(p=>p?.text||"").join("").trim();
}

function parseJson(text){
 const raw=String(text||"").trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"");
 try{return JSON.parse(raw)}catch{}
 const start=raw.indexOf("{");
 const end=raw.lastIndexOf("}");
 if(start>=0&&end>start){try{return JSON.parse(raw.slice(start,end+1))}catch{}}
 return null;
}

function groundingSources(response){
 const chunks=response?.candidates?.[0]?.groundingMetadata?.groundingChunks||[];
 return chunks.map(x=>({title:String(x?.web?.title||"").slice(0,180),url:String(x?.web?.uri||"").slice(0,1000)})).filter(x=>x.url).slice(0,12);
}

function sourceHost(url){
 try{return new URL(url).hostname.replace(/^www\./,"").toLowerCase()}catch{return ""}
}

function sourceTier(host){
 if(!host)return 0;
 if(/(^|\.)(who\.int|nih\.gov|ncbi\.nlm\.nih\.gov|cdc\.gov|fda\.gov|nasa\.gov|noaa\.gov|usgs\.gov|nist\.gov|si\.edu)$/.test(host))return 4;
 if(/\.gov$|\.gov\.[a-z]{2}$|\.edu$|\.ac\.[a-z]{2}$/.test(host))return 3;
 if(/(nature\.com|science\.org|thelancet\.com|nejm\.org|bmj\.com|cell\.com|britannica\.com|merckmanuals\.com)$/.test(host))return 3;
 return 1;
}

async function buildTruthSpec(ai,question,previous,summary){
 const groundingPrompt=`You are the mandatory Evidence Gate for My Bee, a visual learning engine. No image may be generated before you verify what it will visually claim.
Question: ${question}
Existing topic: ${previous}
Existing context: ${summary}

Search the web. Resolve the user's actual intent. Break the answer into atomic claims that could appear visually: identity, anatomy/structure, direction, sequence, quantity, cause/effect, location, chronology, and any important exception. Prefer primary/official/institutional sources and peer-reviewed or expert reference sources appropriate to the domain. Current/time-sensitive claims require current sources. Never fill a gap from imagination.

Return ONLY JSON with this shape:
{"status":"VERIFIED|PARTIAL|CONFLICTING|UNKNOWN","topic":"...","visualQuestion":"...","claims":[{"claim":"...","status":"VERIFIED|UNCERTAIN|CONFLICTING|UNKNOWN","importance":"critical|supporting"}],"mustShow":["..."],"mustNotShow":["..."],"uncertainties":["..."]}
Rules: A critical claim may be VERIFIED only when the searched evidence supports it. If a critical visual detail is uncertain, mark it UNCERTAIN and put the unsafe depiction in mustNotShow. Do not invent citations or URLs in JSON; grounding metadata supplies sources.`;
 const response=await ai.models.generateContent({model:GROUNDING_MODEL,contents:groundingPrompt,config:{tools:[{googleSearch:{}}]}});
 const spec=parseJson(extractText(response));
 const sources=groundingSources(response);
 if(!spec||!Array.isArray(spec.claims))throw new Error("Evidence Gate could not produce a valid truth specification");
 const verifiedCritical=spec.claims.filter(c=>c?.importance==="critical"&&c?.status==="VERIFIED");
 const unsafeCritical=spec.claims.filter(c=>c?.importance==="critical"&&c?.status!=="VERIFIED");
 const strongSources=sources.filter(s=>sourceTier(sourceHost(s.url))>=3);
 const independentHosts=new Set(sources.map(s=>sourceHost(s.url)).filter(Boolean));
 if(spec.status==="UNKNOWN"||spec.status==="CONFLICTING")throw new Error("Evidence Gate blocked generation: truth is unresolved");
 if(!verifiedCritical.length)throw new Error("Evidence Gate blocked generation: no critical claim was verified");
 if(!sources.length)throw new Error("Evidence Gate blocked generation: no grounded sources returned");
 // Sensitive/precise claims should not depend on a single weak web page. We do not require two sources for every simple fact,
 // but when uncertainty remains we demand either an authoritative source or independent corroboration before visualization.
 if(unsafeCritical.length&&!strongSources.length&&independentHosts.size<2)throw new Error("Evidence Gate blocked generation: critical details lack authoritative corroboration");
 return {spec,sources,quality:{sourceCount:sources.length,strongSourceCount:strongSources.length,independentHostCount:independentHosts.size}};
}

async function verifyRenderedVisual(ai,image,mime,truthSpec){
 const prompt=`You are the final Visual Truth Gate. Inspect the generated educational image against the locked truth specification below.
TRUTH SPECIFICATION:\n${JSON.stringify(truthSpec)}
Check only factual/semantic contradictions that are visible: wrong anatomy/structure, reversed arrows or flow, impossible sequence, wrong spatial relation, false labels, invented unsupported detail, or a mustNotShow violation. Do not reject for artistic style. Return ONLY JSON: {"pass":true|false,"criticalErrors":["..."],"reason":"..."}.`;
 const response=await ai.models.generateContent({model:VERIFY_MODEL,contents:[{role:"user",parts:[{inlineData:{mimeType:mime,data:image}},{text:prompt}]}]});
 const verdict=parseJson(extractText(response));
 if(!verdict||typeof verdict.pass!=="boolean")return {pass:false,criticalErrors:["Visual verification did not return a valid verdict"],reason:"invalid-verdict"};
 return verdict;
}

async function generateWithRetry(prompt,imageAnchor=null){
 let lastError=null;
 for(let attempt=1;attempt<=2;attempt++){
  try{
   const content=[];
   if(imageAnchor)content.push({image:imageAnchor});
   content.push({text:prompt});
   const response=await fetch(QWEN_ENDPOINT,{
    method:"POST",
    headers:{"content-type":"application/json","authorization":`Bearer ${DASHSCOPE_API_KEY}`},
    body:JSON.stringify({
     model:QWEN_IMAGE_MODEL,
     input:{messages:[{role:"user",content}]},
     parameters:{
      prompt_extend:false,
      n:1,
      size:"1536*1024",
      negative_prompt:"dashboard, UI cards, poster, title card, paragraph text, decorative typography, watermark, logo, inaccurate anatomy, reversed arrows, invented labels"
     }
    })
   });
   const payload=await response.json().catch(()=>({}));
   if(!response.ok||payload?.code)throw Object.assign(new Error(payload?.message||`Qwen image request failed (${response.status})`),{status:response.status,code:payload?.code});
   const url=payload?.output?.choices?.[0]?.message?.content?.find?.(x=>x?.image)?.image;
   if(!url)throw new Error("Qwen Image returned no image URL");
   const imageResponse=await fetch(url);
   if(!imageResponse.ok)throw new Error(`Qwen image download failed (${imageResponse.status})`);
   const mime=imageResponse.headers.get("content-type")||"image/png";
   const bytes=Buffer.from(await imageResponse.arrayBuffer());
   return {image:bytes.toString("base64"),mime,caption:"",usage:payload?.usage||null,requestId:payload?.request_id||null};
  }catch(error){
   lastError=error;
   if(!retryable(error)||attempt===2)break;
   await sleep(650*attempt);
  }
 }
 throw lastError||new Error("Qwen visual generation failed");
}

export async function POST(req){
 const blocked=requestLimit(req,{scope:"visual-generation",limit:6,windowMs:60000});
 if(blocked)return blocked;
 try{
  if(!API_KEY)return NextResponse.json({ok:false,error:"GEMINI_API_KEY is not configured for Evidence/Visual Truth gates"},{status:503});
  if(!DASHSCOPE_API_KEY)return NextResponse.json({ok:false,error:"DASHSCOPE_API_KEY is not configured for Qwen Image"},{status:503});
  const body=await req.json();
  const question=String(body?.question||"").trim().slice(0,1200);
  const context=body?.context||{};
  if(!question)return NextResponse.json({ok:false,error:"question required"},{status:400});

  const previous=String(context?.previousTitle||"").slice(0,180);
  const summary=String(context?.previousSummary||"").slice(0,900);
  const imageAnchor=previousImagePart(context?.previousImage);
  const ai=new GoogleGenAI({apiKey:API_KEY});

  // Mandatory for EVERY question: evidence first, image second.
  const grounding=await buildTruthSpec(ai,question,previous,summary);
  const lockedTruth=JSON.stringify(grounding.spec);
  const prompt=`Create exactly one premium cinematic educational visual for an interactive visual-understanding engine called My Bee.
User question: ${question}
Existing world/topic: ${previous}
Existing explanation: ${summary}
LOCKED VISUAL TRUTH SPECIFICATION (factual authority; never contradict or embellish beyond it):
${lockedTruth}
${imageAnchor?"The attached image is the current scene. Keep it as the same visual world and evolve it for the new question. Preserve subject identity, spatial relationships, palette and lighting unless the verified truth requires zoom, cutaway, transparency or another viewpoint.":"Create a coherent first visual world that can be evolved by later questions."}
The visual itself is the explanation. Do not rely on a caption, paragraph, text panel, title card, or written summary. Explain through composition, spatial relationships, arrows, flow, highlighted parts, cutaway, zoom, layers, before/after states, scale, and cause-and-effect. Prefer ZERO rendered text. Only when a word is indispensable for understanding, use at most 4 tiny labels total, each 1 to 3 words, in the user's language. Never render sentences or paragraphs. One dominant focal subject, meaningful depth, uncluttered composition. Never invent anatomy, mechanisms, chronology, labels, quantities, arrows, or causal relationships not licensed by the locked truth specification. If the truth spec marks a detail uncertain, omit it rather than guessing. Deep navy cinematic environment with restrained warm honey-gold guidance accents. No dashboard, UI cards, logo, poster typography, decorative text, or irrelevant objects.`;

  const plans=imageAnchor
   ?[{imageAnchor,continuity:true},{imageAnchor:null,continuity:false}]
   :[{imageAnchor:null,continuity:false}];

  let lastError=null;
  let rejectedVisuals=0;
  for(const plan of plans){
   {
    try{
     // A generated image is not trusted until the final visual gate passes it.
     for(let visualAttempt=1;visualAttempt<=2;visualAttempt++){
      const out=await generateWithRetry(prompt,plan.imageAnchor);
      const verdict=await verifyRenderedVisual(ai,out.image,out.mime,grounding.spec);
      if(!verdict.pass){
       rejectedVisuals++;
       lastError=new Error(`Visual Truth Gate rejected image: ${String(verdict.reason||verdict.criticalErrors?.join("; ")||"factual contradiction")}`);
       continue;
      }
      return NextResponse.json({
       ok:true,
       image:`data:${out.mime};base64,${out.image}`,
       caption:out.caption,
       model:QWEN_IMAGE_MODEL,
       provider:"qwen",
       generationUsage:out.usage,
       generationRequestId:out.requestId,
       continuity:plan.continuity,
       continuityFallback:Boolean(imageAnchor&&!plan.continuity),
       evidenceGate:{status:grounding.spec.status,topic:grounding.spec.topic,claims:grounding.spec.claims,sources:grounding.sources,quality:grounding.quality},
       visualTruthGate:{pass:true,rejectedVisuals}
      });
     }
    }catch(error){lastError=error}
   }
  }

  throw lastError||new Error("Visual generation failed");
 }catch(error){
  console.error("[NAHLATY_VISUAL_ERROR]",String(error?.message||error),error?.stack||"");
  return NextResponse.json({ok:false,error:String(error?.message||error)},{status:500});
 }
}
