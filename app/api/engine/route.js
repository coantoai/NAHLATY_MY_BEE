import { NextResponse } from "next/server";
import { POST as explainPOST } from "../explain/route";
import { contextualHeartResult, localHeartResult } from "../../../lib/nahlaty-engine";
import { compileVisualPlan } from "../../../lib/visual-director";
import { curatedKnowledgeResult, curatedKnowledgeResultById, listCuratedKnowledgePacks } from "../../../lib/knowledge-packs";

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

async function runGeneralExplainEngine(question,context,sourceKind="question"){
 const audience=String(context?.audience||"عام").slice(0,80);
 const prior=context?.previous && typeof context.previous==="object" ? context.previous : null;
 const content=prior?.title && prior?.summary
  ? `السياق السابق: ${prior.title}. ${prior.summary}\nسؤال المتابعة: ${question}`
  : question;
 const preserve=prior?{
  truthAnchors:Array.isArray(prior?.truthAnchors)?prior.truthAnchors:[],
  causalRelations:Array.isArray(prior?.causalRelations)?prior.causalRelations:[],
  sceneGraph:prior?.sceneGraph&&typeof prior.sceneGraph==="object"?prior.sceneGraph:null
 }:null;
 const request=new Request("http://nahlaty.local/api/explain",{
  method:"POST",
  headers:{"content-type":"application/json"},
  body:JSON.stringify({content,audience,preserve})
 });
 const response=await explainPOST(request);
 const data=await response.json();
 if(!response.ok||data?.error)throw new Error(data?.error||"General explanation engine failed");
 return data;
}

function adaptGeneralExperience(experience,sourceKind="question"){
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
   status:sourceKind==="content"?"input-derived":"model-generated",
   source:sourceKind==="content"?"User-provided content + NAHLATY explain engine":"NAHLATY general explain engine",
   sources:[],
   note:sourceKind==="content"
    ?"This explanation is derived from user-provided content and has not been externally fact-checked."
    :"This open-domain answer is model-generated. Its scene knowledge labels describe internal support, not external factual verification."
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
 const content=String(body?.content||"").trim();
 const sourceKind=content&&!question?"content":"question";
 const input=question||content;
 const context=body?.context&&typeof body.context==="object"?body.context:{};

 if(!input)return jsonError("أدخل سؤالًا أو محتوى تريد فهمه.",422,"INPUT_REQUIRED");
 if(sourceKind==="question"&&input.length<4)return jsonError("السؤال قصير جدًا. اكتب ما الذي تريد أن تفهمه بوضوح.",422,"QUESTION_TOO_SHORT");
 if(sourceKind==="question"&&input.length>700)return jsonError("السؤال طويل جدًا. أرسله كمحتوى للشرح بدل السؤال.",422,"QUESTION_TOO_LONG");
 if(sourceKind==="content"&&input.length>70000)return jsonError("المحتوى طويل جدًا لهذه النسخة.",422,"CONTENT_TOO_LONG");

 const directPack=sourceKind==="question"?curatedKnowledgeResult(input):null;
 const directHeart=sourceKind==="question"?localHeartResult(input):null;
 const shortFollowUp=sourceKind==="question"&&(/^(ليش|لماذا|كيف|وضح|اشرح|وبعدين|ثم ماذا|شو يعني|ماذا يعني|what|why|how)/i.test(input)||input.length<24);
 const priorPack=shortFollowUp?curatedKnowledgeResultById(context?.previous?.topic):null;
 const heartContext=sourceKind==="question"&&!priorPack?contextualHeartResult(input,context):null;
 const sourced=directPack||directHeart||priorPack||heartContext;

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
  const experience=await runGeneralExplainEngine(input,context,sourceKind);
  return NextResponse.json({
   ok:true,
   provider:"gemini-explain-engine",
   model:MODEL,
   result:adaptGeneralExperience(experience,sourceKind)
  });
 }catch(error){
  return jsonError(
   "تعذر بناء الشرح العام لهذا السؤال الآن.",
   502,
   "GENERAL_ENGINE_ERROR"
  );
 }
}
