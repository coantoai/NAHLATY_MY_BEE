import { NextResponse } from "next/server";
import { POST as explainPOST } from "../explain/route";
import { contextualHeartResult, localHeartResult } from "../../../lib/nahlaty-engine";
import { compileVisualPlan } from "../../../lib/visual-director";
import { curatedKnowledgeResult, listCuratedKnowledgePacks } from "../../../lib/knowledge-packs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

function jsonError(message,status=400,code="BAD_REQUEST"){
 return NextResponse.json({ok:false,error:{code,message}},{status});
}

function uniq(values){
 return [...new Set(values.filter(Boolean))];
}

function planFromExperience(experience){
 const step=experience?.steps?.[0]||{};
 const runtime=step?.runtime||{};
 const camera=runtime?.camera?.mode||step?.camera?.mode||"overview";
 const motion=String(step?.motion||"");
 const operations=["FOCUS"];
 if(["inside","explode"].includes(camera))operations.push("CUTAWAY");
 if(["travel","connect","wave","accumulate"].includes(motion)||runtime?.activeEdgeIds?.length)operations.push("FLOW","DIRECTION");
 if(["pulse","burst","grow","compress"].includes(motion))operations.push("HIGHLIGHT");
 if((experience?.steps?.length||0)>1)operations.push("SEQUENCE");
 if(experience?.sceneGraph?.world?.dimension==="3d")operations.push("CONTEXT");
 return {
  target:String(step?.outcome||step?.why||experience?.summary||experience?.title||"فهم الفكرة").slice(0,180),
  operations:uniq(operations).slice(0,7),
  focus:(runtime?.focusNodeIds||step?.focusNodeIds||[]).map(String).slice(0,8),
  camera
 };
}

async function runGeneralExplainEngine(question,context){
 const audience=String(context?.audience||"عام").slice(0,80);
 const prior=context?.previous && typeof context.previous==="object" ? context.previous : null;
 const content=prior?.title && prior?.summary
  ? `السياق السابق: ${prior.title}. ${prior.summary}\nسؤال المتابعة: ${question}`
  : question;
 const request=new Request("http://nahlaty.local/api/explain",{
  method:"POST",
  headers:{"content-type":"application/json"},
  body:JSON.stringify({content,audience})
 });
 const response=await explainPOST(request);
 const data=await response.json();
 if(!response.ok||data?.error)throw new Error(data?.error||"General explanation engine failed");
 return data;
}

function adaptGeneralExperience(experience){
 const visualPlan=planFromExperience(experience);
 const result={
  domain:String(experience?.sceneGraph?.world?.theme||"general"),
  topic:String(experience?.title||"شرح بصري"),
  answer:String(experience?.summary||"").slice(0,900),
  explanation:String(experience?.steps?.[0]?.text||experience?.summary||"").slice(0,1200),
  scene:null,
  confidence:"medium",
  needsVerification:true,
  visualPlan,
  verification:{
   status:"model-generated",
   source:"NAHLATY general explain engine",
   sources:[],
   note:"This open-domain answer is model-generated. Its scene knowledge labels describe internal support, not external factual verification."
  },
  experience
 };
 return {...result,renderPlan:compileVisualPlan(result)};
}

function finalizeCurated(result){
 return {...result,renderPlan:compileVisualPlan(result)};
}

export async function GET(){
 const heart=localHeartResult("كيف تمنع صمامات القلب رجوع الدم؟");
 const solar=curatedKnowledgeResult("كيف تعمل الخلية الشمسية؟");
 const plant=curatedKnowledgeResult("كيف تنمو النباتات؟");
 const bee=curatedKnowledgeResult("كيف يلقح النحل الأزهار؟");
 const engine=curatedKnowledgeResult("كيف يعمل محرك الاحتراق الداخلي؟");
 const packs=listCuratedKnowledgePacks();
 return NextResponse.json({
  ok:true,
  engine:"nahlaty",
  version:"engine-v2",
  architecture:"question-context-knowledge-verification-visual-director-scene",
  providerConfigured:Boolean(API_KEY),
  provider:API_KEY?"gemini":"curated-only",
  model:API_KEY?MODEL:null,
  sourcedKnowledge:["heart",...packs.map(p=>p.id)],
  selfTest:{
   passed:Boolean(
    heart?.topic==="valves"&&
    solar?.topic==="solar-cell"&&
    plant?.topic==="plant-growth"&&
    bee?.topic==="bee-pollination"&&
    engine?.topic==="combustion-engine"
   ),
   checks:{
    heart:heart?.topic||null,
    solar:solar?.topic||null,
    plant:plant?.topic||null,
    pollination:bee?.topic||null,
    combustion:engine?.topic||null
   }
  }
 });
}

export async function POST(request){
 let body;
 try{body=await request.json();}
 catch{return jsonError("Invalid JSON body.");}

 const question=String(body?.question||"").trim();
 const context=body?.context&&typeof body.context==="object"?body.context:{};

 if(question.length<4)return jsonError("السؤال قصير جدًا. اكتب ما الذي تريد أن تفهمه بوضوح.",422,"QUESTION_TOO_SHORT");
 if(question.length>700)return jsonError("السؤال طويل جدًا لهذه النسخة التجريبية.",422,"QUESTION_TOO_LONG");

 const heart=localHeartResult(question)||contextualHeartResult(question,context);
 const sourced=heart||curatedKnowledgeResult(question);

 if(sourced){
  return NextResponse.json({
   ok:true,
   provider:"sourced-knowledge",
   model:null,
   result:finalizeCurated(sourced)
  });
 }

 if(!API_KEY)return jsonError("لا توجد طبقة نموذج مفعّلة لهذا السؤال خارج المعرفة الموثقة.",503,"MODEL_PROVIDER_NOT_CONFIGURED");

 try{
  const experience=await runGeneralExplainEngine(question,context);
  return NextResponse.json({
   ok:true,
   provider:"gemini-explain-engine",
   model:MODEL,
   result:adaptGeneralExperience(experience)
  });
 }catch(error){
  return jsonError(
   "تعذر بناء الشرح العام لهذا السؤال الآن.",
   502,
   "GENERAL_ENGINE_ERROR"
  );
 }
}
