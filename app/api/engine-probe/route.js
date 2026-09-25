import { POST as enginePOST } from "../engine/route";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=120;

async function probe(question,context={},expectedTopic=null){
 const request=new Request("http://nahlaty.local/api/engine",{
  method:"POST",
  headers:{"content-type":"application/json"},
  body:JSON.stringify({question,context})
 });
 const response=await enginePOST(request);
 const payload=await response.json();
 return {
  question,
  status:response.status,
  ok:Boolean(response.ok&&payload?.ok),
  provider:payload?.provider||null,
  topic:payload?.result?.topic||null,
  verification:payload?.result?.verification?.status||null,
  scene:payload?.result?.scene??null,
  nodes:payload?.result?.experience?.sceneGraph?.nodes?.length||0,
  edges:payload?.result?.experience?.sceneGraph?.edges?.length||0,
  renderPlan:Boolean(payload?.result?.renderPlan),
  expectedTopic,
  topicMatched:expectedTopic?payload?.result?.topic===expectedTopic:true
 };
}

function productionGuard(){return process.env.VERCEL_ENV==="production"?Response.json({error:"Not found"},{status:404}):null;}

export async function GET(request){
 const blocked=productionGuard(); if(blocked)return blocked;
 const deep=new URL(request.url).searchParams.get("deep")==="1";
 const checks=[];
 checks.push(await probe("كيف تمنع صمامات القلب رجوع الدم؟",{},"valves"));
 checks.push(await probe("كيف تنمو النباتات؟",{},"plant-growth"));
 checks.push(await probe("كيف تعمل الخلية الشمسية؟",{},"solar-cell"));
 checks.push(await probe("كيف يلقح النحل الأزهار؟",{},"bee-pollination"));
 checks.push(await probe("كيف يعمل محرك الاحتراق الداخلي؟",{},"combustion-engine"));
 const followUp=await probe("ليش؟",{previous:{topic:"solar-cell",title:"كيف تعمل الخلية الشمسية؟",summary:"تحول الخلية الشمسية طاقة الضوء إلى تيار كهربائي."}},"solar-cell");
 followUp.kind="context-follow-up";
 checks.push(followUp);
 const general=await probe("كيف تتكوّن أطوار القمر؟");
 general.kind="open-domain";
 general.providerExpected="gemini-explain-engine";
 general.providerMatched=general.provider==="gemini-explain-engine";
 checks.push(general);
 const passed=checks.every(x=>x.ok&&x.renderPlan&&x.topicMatched&&(x.scene!==null||x.nodes>=3)&&(x.kind!=="open-domain"||x.providerMatched));
 return Response.json({
  ok:passed,
  version:"engine-e2e/v2",
  deep,
  passed,
  checks
 },{status:passed?200:500});
}
