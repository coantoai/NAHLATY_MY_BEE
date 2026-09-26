import { NextResponse } from "next/server";
import { POST as generateVisualPOST } from "../generate-visual/route";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=180;

export async function GET(request){
 const url=new URL(request.url);
 const question=String(url.searchParams.get("q")||"كيف تعمل الرئتان؟").slice(0,300);
 const previousTitle=String(url.searchParams.get("previousTitle")||"").slice(0,180);
 const previousSummary=String(url.searchParams.get("previousSummary")||"").slice(0,500);
 const req=new Request("http://nahlaty.local/api/generate-visual",{
  method:"POST",
  headers:{"content-type":"application/json","x-forwarded-for":"127.0.0.1"},
  body:JSON.stringify({question,context:{previousTitle,previousSummary}})
 });
 const started=Date.now();
 const response=await generateVisualPOST(req);
 const data=await response.json();
 return NextResponse.json({
  ok:Boolean(response.ok&&data?.ok),
  status:response.status,
  elapsedMs:Date.now()-started,
  provider:data?.provider||null,
  model:data?.model||null,
  continuity:data?.continuity??null,
  evidenceGate:data?.evidenceGate||null,
  visualTruthGate:data?.visualTruthGate||null,
  generationUsage:data?.generationUsage||null,
  generationRequestId:data?.generationRequestId||null,
  imageBytes:typeof data?.image==="string"?data.image.length:0,
  error:data?.error||null
 },{status:response.status});
}
