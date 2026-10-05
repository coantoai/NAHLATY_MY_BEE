import { createQwen, generateJson } from "../../lib/genai";
import { requestLimit } from "../../lib/requestGuard";
import { buildVisualBrainPrompt, compileSafeFallback, sanitizeVisualPlan } from "../../lib/visualBrain";

const cut=(v,n=1600)=>String(v||"").slice(0,n);

export async function POST(req){
 const blocked=requestLimit(req,{scope:"visual-brain",limit:24,windowMs:60_000});
 if(blocked)return blocked;
 try{
  const body=await req.json();
  const question=cut(body?.question).trim();
  const sceneGraph=body?.sceneGraph&&typeof body.sceneGraph==="object"?body.sceneGraph:{nodes:[],edges:[]};
  const currentState=body?.currentState&&typeof body.currentState==="object"?body.currentState:{};
  if(!question)return Response.json({error:"السؤال مطلوب",code:"QUESTION_REQUIRED"},{status:400});
  if(!Array.isArray(sceneGraph.nodes)||!sceneGraph.nodes.length)return Response.json({error:"المشهد لا يحتوي عناصر قابلة للتحكم",code:"SCENE_REQUIRED"},{status:400});

  const ai=createQwen();
  if(!ai){
   const fallback=compileSafeFallback({question,sceneGraph,currentState});
   const checked=sanitizeVisualPlan(fallback,sceneGraph);
   return Response.json({...checked.plan,mode:"deterministic-fallback",provider:"none"});
  }

  const raw=await generateJson(ai,buildVisualBrainPrompt({question,sceneGraph,currentState,locale:body?.locale||"ar"}),{maxAttempts:3});
  const checked=sanitizeVisualPlan(raw,sceneGraph);
  if(!checked.ok){
   const fallback=compileSafeFallback({question,sceneGraph,currentState});
   return Response.json({...sanitizeVisualPlan(fallback,sceneGraph).plan,mode:"guardrail-fallback",provider:ai.provider,rejected:{code:checked.code,message:checked.message}});
  }
  return Response.json({...checked.plan,mode:"ai",provider:ai.provider});
 }catch(e){
  console.error("[NAHLATY_VISUAL_BRAIN_ERROR]",String(e?.message||e),e?.stack||"");
  return Response.json({error:"تعذر تخطيط المشهد",code:"VISUAL_BRAIN_FAILED"},{status:500});
 }
}
