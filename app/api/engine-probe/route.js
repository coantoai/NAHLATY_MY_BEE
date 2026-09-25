import { POST as enginePOST } from "../engine/route";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=120;

async function probe(question,context={}){
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
  renderPlan:Boolean(payload?.result?.renderPlan)
 };
}

export async function GET(request){
 const deep=new URL(request.url).searchParams.get("deep")==="1";
 const checks=[];
 checks.push(await probe("كيف تمنع صمامات القلب رجوع الدم؟"));
 checks.push(await probe("كيف تنمو النباتات؟"));
 checks.push(await probe("كيف تعمل الخلية الشمسية؟"));
 checks.push(await probe("كيف يلقح النحل الأزهار؟"));
 checks.push(await probe("كيف يعمل محرك الاحتراق الداخلي؟"));
 if(deep)checks.push(await probe("كيف تتكوّن أطوار القمر؟"));
 const passed=checks.every(x=>x.ok&&x.renderPlan&&(x.scene!==null||x.nodes>=3));
 return Response.json({
  ok:passed,
  version:"engine-e2e/v1",
  deep,
  passed,
  checks
 },{status:passed?200:500});
}
