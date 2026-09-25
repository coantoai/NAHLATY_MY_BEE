import { POST as enginePOST } from "../engine/route";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=120;

async function callEngine(question,context={}){
 const request=new Request("http://nahlaty.local/api/engine",{
  method:"POST",
  headers:{"content-type":"application/json"},
  body:JSON.stringify({question,context})
 });
 const response=await enginePOST(request);
 const payload=await response.json();
 return {response,payload,result:payload?.result||{}};
}

function productionGuard(){return process.env.VERCEL_ENV==="production"?Response.json({error:"Not found"},{status:404}):null;}

export async function GET(){
 const blocked=productionGuard(); if(blocked)return blocked;
 const first=await callEngine("كيف تتكوّن أطوار القمر؟",{audience:"عام"});
 const firstResult=first.result;
 const nodes=firstResult?.experience?.sceneGraph?.nodes||[];
 const edges=firstResult?.experience?.sceneGraph?.edges||[];
 const steps=firstResult?.experience?.steps||[];
 const prior={
  title:firstResult?.topic||"",
  summary:firstResult?.answer||"",
  domain:firstResult?.domain||"",
  topic:firstResult?.topic||"",
  truthAnchors:firstResult?.experience?.truthAnchors||[],
  causalRelations:edges.filter(e=>e?.causal).slice(0,8).map(e=>({from:e.from,to:e.to,relation:e.relation,label:e.label})),
  sceneGraph:{nodes:nodes.slice(0,8).map(n=>({id:n.id,label:n.label}))}
 };
 const follow=await callEngine("وليش بتتغير بالشكل؟",{audience:"عام",previous:prior});
 const followResult=follow.result;
 const continuity=followResult?.experience?.continuity||{};
 const firstAnchors=prior.truthAnchors||[];
 const nextAnchors=followResult?.experience?.truthAnchors||[];
 const anchorsPreserved=firstAnchors.length===0||firstAnchors.every(a=>nextAnchors.includes(a));
 const initialPassed=Boolean(
  first.response.ok&&first.payload?.ok&&
  first.payload?.provider==="gemini-explain-engine"&&
  firstResult?.verification?.status==="model-generated"&&
  firstResult?.renderPlan&&nodes.length>=3&&edges.length>=1&&steps.length>=1
 );
 const followPassed=Boolean(
  follow.response.ok&&follow.payload?.ok&&
  follow.payload?.provider==="gemini-explain-engine"&&
  followResult?.renderPlan&&
  (followResult?.experience?.sceneGraph?.nodes?.length||0)>=3&&
  anchorsPreserved&&
  continuity?.worldPreserved===true
 );
 const passed=initialPassed&&followPassed;
 return Response.json({
  ok:passed,
  version:"engine-deep-e2e/v2",
  passed,
  initial:{
   status:first.response.status,
   provider:first.payload?.provider||null,
   model:first.payload?.model||null,
   topic:firstResult?.topic||null,
   verification:firstResult?.verification?.status||null,
   nodes:nodes.length,edges:edges.length,steps:steps.length,
   renderPlan:Boolean(firstResult?.renderPlan)
  },
  followUp:{
   status:follow.response.status,
   provider:follow.payload?.provider||null,
   topic:followResult?.topic||null,
   nodes:followResult?.experience?.sceneGraph?.nodes?.length||0,
   truthAnchors:firstAnchors.length,
   anchorsPreserved,
   continuity,
   renderPlan:Boolean(followResult?.renderPlan)
  }
 },{status:passed?200:500});
}
