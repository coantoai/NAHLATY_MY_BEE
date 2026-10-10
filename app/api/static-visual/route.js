import { generateStaticVisual, staticVisualErrorResponse } from "../../lib/staticVisualGenerator";

export const runtime="nodejs";
export const maxDuration=60;

export async function POST(req){
  try{
    const body=await req.json();
    return Response.json(await generateStaticVisual(body?.question,body?.audience));
  }catch(error){
    console.error("[NAHLATY_STATIC_VISUAL_ERROR]",String(error?.message||error));
    const out=staticVisualErrorResponse(error);
    return Response.json(out.body,{status:out.status});
  }
}
