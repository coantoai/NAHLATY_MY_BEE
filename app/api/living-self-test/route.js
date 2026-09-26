import { NextResponse } from "next/server";
import { POST as enginePOST } from "../engine/route";
import { POST as visualPOST } from "../generate-visual/route";
import { internalRequestHeaders } from "../../lib/requestGuard";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=180;

export async function GET(){
 const started=Date.now();
 try{
  const headers={"content-type":"application/json",...internalRequestHeaders()};

  const engineRequest=new Request("http://internal/api/engine",{
   method:"POST",
   headers,
   body:JSON.stringify({question:"كيف تعمل الرئتان؟",context:{audience:"عام"}})
  });
  const engineResponse=await enginePOST(engineRequest);
  const engine=await engineResponse.json();
  const experience=engine?.result?.experience;
  if(!engineResponse.ok||!engine?.ok||!experience){
   return NextResponse.json({ok:false,stage:"engine",status:engineResponse.status,error:engine?.error||"engine failed"},{status:502});
  }

  const visualRequest=new Request("http://internal/api/generate-visual",{
   method:"POST",
   headers,
   body:JSON.stringify({
    question:"كيف تعمل الرئتان؟",
    context:{previousTitle:experience.title||"",previousSummary:experience.summary||""}
   })
  });
  const visualResponse=await visualPOST(visualRequest);
  const visual=await visualResponse.json();

  if(!visualResponse.ok||!visual?.ok||!String(visual?.image||"").startsWith("data:image/")){
   return NextResponse.json({ok:false,stage:"visual",status:visualResponse.status,error:visual?.error||"visual failed",model:visual?.model||null},{status:502});
  }

  return NextResponse.json({
   ok:true,
   engine:{provider:engine.provider||null,title:experience.title||null},
   visual:{model:visual.model||null,imagePayloadLength:String(visual.image).length},
   elapsedMs:Date.now()-started
  },{headers:{"cache-control":"no-store"}});
 }catch(error){
  return NextResponse.json({ok:false,stage:"exception",error:String(error?.message||error),elapsedMs:Date.now()-started},{status:500});
 }
}
