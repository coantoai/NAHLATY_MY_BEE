import { createGemini, generateText } from "../../lib/genai";
import { requestLimit } from "../../lib/requestGuard";

export const maxDuration = 120;

const MAX_BYTES=4*1024*1024;
const allowed=new Set([
 "application/pdf",
 "image/png","image/jpeg","image/webp",
 "text/plain","text/markdown","text/csv","application/json"
]);

const kindOf=mime=>mime==="application/pdf"?"pdf":mime.startsWith("image/")?"image":"text";

export async function POST(req){
 const blocked=requestLimit(req,{scope:"analyze-input",limit:8,windowMs:60_000});
 if(blocked)return blocked;
 try{
  const form=await req.formData();
  const file=form.get("file");
  if(!file||typeof file.arrayBuffer!=="function") return Response.json({error:"الملف مطلوب"},{status:400});
  const mime=String(file.type||"application/octet-stream").toLowerCase();
  const name=String(file.name||"ملف").slice(0,180);
  if(file.size>MAX_BYTES) return Response.json({error:"بهذه النسخة حجم الملف المباشر يجب أن يكون أقل من 4MB."},{status:413});
  if(!allowed.has(mime)) return Response.json({error:"حالياً ندعم PDF، الصور PNG/JPG/WebP، والملفات النصية."},{status:415});

  if(kindOf(mime)==="text"){
   const text=(await file.text()).slice(0,70000);
   return Response.json({content:text,sourceName:name,mimeType:mime,kind:"text"});
  }

  const key=process.env.GEMINI_API_KEY;
  if(!key) return Response.json({error:"تحليل الصور وPDF يحتاج GEMINI_API_KEY في هذه النسخة."},{status:503});

  const bytes=Buffer.from(await file.arrayBuffer()).toString("base64");
  const ai=createGemini(key);
  const fileKind=kindOf(mime);
  const instruction=fileKind==="pdf"
   ?`اقرأ هذا الـPDF كوثيقة بصرية كاملة، لا كاستخراج نص فقط. حوّله إلى مادة دقيقة جاهزة لمحرك شرح بصري تفاعلي. حافظ على: العنوان والموضوع، المفاهيم الرئيسية، التعريفات، التسلسل، السبب والنتيجة، المقارنات، الأرقام المهمة، وما توضحه الجداول والرسومات والصور. لا تخترع شيئاً غير موجود. إذا كان شيء غير واضح اذكر أنه غير واضح. اكتب بالعربية نصاً منظماً ومكثفاً، لكن لا تختصر لدرجة تفقد العلاقات المهمة. عندما تستطيع تحديد الصفحة بثقة، ضع مرجعاً بالشكل [صفحة N] بجانب المعلومة المرتبطة بها. لا تخمّن رقم الصفحة.`
   :`افهم هذه الصورة بصرياً بدقة وحوّلها إلى مادة جاهزة لمحرك شرح بصري تفاعلي. صف ما يظهر فعلاً، استخرج أي نص ظاهر، وحدد العناصر والعلاقات والمراحل والأسهم أو المقارنات والسبب والنتيجة إن كانت ظاهرة. إذا كانت صورة لشيء مادي فاشرح مكوناته وعلاقاته المكانية. لا تخترع ما لا يظهر. اكتب بالعربية نصاً منظماً يمكن لمحرك آخر تحويله إلى شرح تفاعلي. ضع المرجع [الصورة] بجانب النقاط المستخرجة مباشرةً منها.`;

  const text=await generateText(ai,[
   {inlineData:{mimeType:mime,data:bytes}},
   {text:instruction}
  ],{config:{maxOutputTokens:6000},maxAttempts:3,retryBaseMs:450});
  if(!text) return Response.json({error:"لم أستطع استخراج مادة قابلة للشرح من الملف."},{status:422});
  return Response.json({content:text.slice(0,70000),sourceName:name,mimeType:mime,kind:fileKind});
 }catch(e){
  console.error("[NAHLATY_ANALYZE_INPUT_ERROR]",String(e?.message||e),e?.stack||"");
  return Response.json({error:"تعذر قراءة الملف",code:"ANALYZE_INPUT_FAILED"},{status:500});
 }
}
