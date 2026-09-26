import { NextResponse } from "next/server";
import { POST as enginePOST } from "../engine/route";
import { POST as visualPOST } from "../generate-visual/route";
import { internalRequestHeaders, requestLimit } from "../../lib/requestGuard";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=180;

async function callEngine(headers,question,previous=null){
 const request=new Request("http://internal/api/engine",{
  method:"POST",
  headers,
  body:JSON.stringify({question,context:{audience:"عام",...(previous?{previous}:{})}})
 });
 const response=await enginePOST(request);
 return {response,body:await response.json()};
}

async function callVisual(headers,question,context){
 const request=new Request("http://internal/api/generate-visual",{
  method:"POST",
  headers,
  body:JSON.stringify({question,context})
 });
 const response=await visualPOST(request);
 return {response,body:await response.json()};
}

export async function GET(request){
 const blocked=requestLimit(request,{scope:"living-self-test",limit:2,windowMs:60000});
 if(blocked)return blocked;
 const started=Date.now();
 try{
  const headers={"content-type":"application/json",...internalRequestHeaders()};

  const first=await callEngine(headers,"كيف تعمل الرئتان؟");
  const firstExperience=first.body?.result?.experience;
  if(!first.response.ok||!first.body?.ok||!firstExperience){
   return NextResponse.json({ok:false,stage:"first-engine",status:first.response.status,error:first.body?.error||"engine failed"},{status:502});
  }

  const suiteQuestions=[
   "كيف يتكوّن البرق؟",
   "كيف تعمل الثلاجة؟",
   "كيف تنتقل البيانات عبر الإنترنت؟",
   "لماذا تتغير الفصول؟",
   "كيف ترتفع الطائرة في الهواء؟"
  ];
  const genericSuite=[];
  for(const question of suiteQuestions){
   const check=await callEngine(headers,question);
   const experience=check.body?.result?.experience;
   if(!check.response.ok||!check.body?.ok||!experience){
    return NextResponse.json({ok:false,stage:"generic-suite",question,status:check.response.status,error:check.body?.error||"generic engine failed"},{status:502});
   }
   genericSuite.push({question,provider:check.body.provider||null,title:experience.title||null,domain:check.body?.result?.domain||null});
  }

  const firstVisual=await callVisual(headers,"كيف تعمل الرئتان؟",{
   previousTitle:firstExperience.title||"",
   previousSummary:firstExperience.summary||""
  });
  if(!firstVisual.response.ok||!firstVisual.body?.ok||!String(firstVisual.body?.image||"").startsWith("data:image/")){
   return NextResponse.json({ok:false,stage:"first-visual",status:firstVisual.response.status,error:firstVisual.body?.error||"visual failed",model:firstVisual.body?.model||null},{status:502});
  }

  const previous={
   title:firstExperience.title||"",
   summary:firstExperience.summary||"",
   domain:first.body?.result?.domain||"",
   topic:first.body?.result?.topic||"",
   truthAnchors:firstExperience.truthAnchors||[],
   causalRelations:(firstExperience.sceneGraph?.edges||[]).filter(e=>e?.causal).slice(0,8),
   sceneGraph:{nodes:(firstExperience.sceneGraph?.nodes||[]).slice(0,10).map(n=>({id:n.id,label:n.label}))}
  };

  const followQuestion="ماذا يحدث داخل الحويصلات الهوائية؟";
  const follow=await callEngine(headers,followQuestion,previous);
  const followExperience=follow.body?.result?.experience;
  if(!follow.response.ok||!follow.body?.ok||!followExperience){
   return NextResponse.json({ok:false,stage:"follow-engine",status:follow.response.status,error:follow.body?.error||"follow-up engine failed"},{status:502});
  }

  const followVisual=await callVisual(headers,followQuestion,{
   previousTitle:firstExperience.title||"",
   previousSummary:firstExperience.summary||"",
   previousImage:firstVisual.body.image
  });
  if(!followVisual.response.ok||!followVisual.body?.ok||followVisual.body?.continuity!==true||!String(followVisual.body?.image||"").startsWith("data:image/")){
   return NextResponse.json({ok:false,stage:"follow-visual",status:followVisual.response.status,error:followVisual.body?.error||"follow-up visual failed",model:followVisual.body?.model||null,continuity:followVisual.body?.continuity||false},{status:502});
  }

  return NextResponse.json({
   ok:true,
   first:{
    engineProvider:first.body.provider||null,
    title:firstExperience.title||null,
    visualModel:firstVisual.body.model||null,
    imagePayloadLength:String(firstVisual.body.image).length
   },
   followUp:{
    title:followExperience.title||null,
    visualModel:followVisual.body.model||null,
    continuity:followVisual.body.continuity===true,
    imagePayloadLength:String(followVisual.body.image).length
   },
   genericSuite,
   elapsedMs:Date.now()-started
  },{headers:{"cache-control":"no-store"}});
 }catch(error){
  return NextResponse.json({ok:false,stage:"exception",error:String(error?.message||error),elapsedMs:Date.now()-started},{status:500});
 }
}
