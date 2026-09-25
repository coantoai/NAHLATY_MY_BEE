import { POST as enginePOST } from "../engine/route";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=120;

export async function GET(){
 const request=new Request("http://nahlaty.local/api/engine",{
  method:"POST",
  headers:{"content-type":"application/json"},
  body:JSON.stringify({question:"كيف تتكوّن أطوار القمر؟",context:{audience:"عام"}})
 });
 const response=await enginePOST(request);
 const payload=await response.json();
 const result=payload?.result||{};
 const nodes=result?.experience?.sceneGraph?.nodes?.length||0;
 const edges=result?.experience?.sceneGraph?.edges?.length||0;
 const steps=result?.experience?.steps?.length||0;
 const passed=Boolean(
  response.ok&&payload?.ok&&
  payload?.provider==="gemini-explain-engine"&&
  result?.verification?.status==="model-generated"&&
  result?.renderPlan&&nodes>=3&&edges>=1&&steps>=1
 );
 return Response.json({
  ok:passed,
  version:"engine-deep-e2e/v1",
  passed,
  status:response.status,
  provider:payload?.provider||null,
  model:payload?.model||null,
  topic:result?.topic||null,
  verification:result?.verification?.status||null,
  nodes,edges,steps,
  renderPlan:Boolean(result?.renderPlan)
 },{status:passed?200:500});
}
