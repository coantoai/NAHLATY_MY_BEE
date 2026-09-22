import { generateStaticVisual } from "../../lib/staticVisualGenerator";

export const runtime="nodejs";
export const maxDuration=60;

export async function GET(){
  const started=Date.now();
  try{
    const data=await generateStaticVisual("كيف تنقل النحلة حبوب اللقاح بين الأزهار؟","عام");
    const image=String(data?.image||"");
    return Response.json({
      ok:image.startsWith("data:image/"),
      title:data?.title||"",
      model:data?.model||"",
      benchmark:data?.benchmark||"",
      imageChars:image.length,
      elapsedMs:Date.now()-started
    });
  }catch(error){
    return Response.json({ok:false,error:String(error?.message||error),elapsedMs:Date.now()-started},{status:500});
  }
}
