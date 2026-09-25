import { createGemini, generateJson } from "../../lib/genai";
import { requestLimit } from "../../lib/requestGuard";

const cut=(v,n=500)=>String(v||"").slice(0,n);

export async function POST(req){
 const blocked=requestLimit(req,{scope:"check-invariance",limit:20,windowMs:60_000});
 if(blocked)return blocked;
 try{
  const {response,truthAnchors=[],node=null,title=""}=await req.json();
  const answer=cut(response,1600).trim();
  if(!answer) return Response.json({error:"اكتب شو بقي ثابت أولاً"},{status:400});
  const anchors=(Array.isArray(truthAnchors)?truthAnchors:[]).slice(0,6).map(x=>cut(x,220)).filter(Boolean);
  const focus=node?{id:cut(node?.id,40),label:cut(node?.label,80),detail:cut(node?.detail,220)}:null;

  const key=process.env.GEMINI_API_KEY;
  if(!key){
   const words=new Set(answer.toLowerCase().split(/\s+/).filter(x=>x.length>3));
   const hits=anchors.filter(a=>a.toLowerCase().split(/\s+/).some(w=>w.length>3&&words.has(w))).length;
   const strong=anchors.length?hits>0:answer.length>28;
   return Response.json({
    mode:"demo",
    status:strong?"strong":"partial",
    feedback:strong?"التقطت معنى ثابتاً بدل وصف الشكل الجديد.":"حاول تذكر العلاقة أو الفكرة التي بقيت صحيحة رغم تغيّر الرسم أو التشبيه.",
    nextHint:strong?"ممتاز. جرّب الآن تطبيق نفس العلاقة بسياق ثالث.":"لا تصف الألوان أو الأشكال؛ صف ما بقي صحيحاً في السبب والنتيجة أو الدور."
   });
  }

  const ai=createGemini(key);
  const prompt=`أنت تقيّم فهم "الثابت عبر التمثيلات"، لا جودة الكتابة.
الموضوع: ${cut(title,140)}
العنصر الذي سبّب الالتباس إن وجد: ${JSON.stringify(focus)}
Truth Anchors التي يجب أن تبقى ثابتة: ${JSON.stringify(anchors)}
إجابة المستخدم عن سؤال: "ما الذي بقي ثابتاً رغم أن طريقة العرض تغيّرت؟"
الإجابة: ${answer}

أعد JSON فقط:
status: strong أو partial أو needs_work
feedback: جملة عربية قصيرة توضح هل وصف المستخدم حقيقة/علاقة ثابتة أم مجرد شكل العرض
nextHint: تلميح واحد فقط إذا احتاج، بدون إعطائه الإجابة كاملة

القواعد:
- لا تستخدم درجات رقمية.
- لا تطلب نفس الكلمات الموجودة في Truth Anchors؛ المعنى يكفي.
- إذا وصف المستخدم لوناً أو رسماً أو اسم التشبيه فقط، فهذا ليس ثباتاً مفاهيمياً.
- strong فقط إذا التقط علاقة أو حقيقة بقيت صحيحة عبر التمثيلين.
- إذا Truth Anchors فارغة، استخدم معنى العنصر وعلاقته الوظيفية بحذر ولا تخترع حقيقة جديدة.`;
  const data=await generateJson(ai,prompt);
  return Response.json({
   status:["strong","partial","needs_work"].includes(data?.status)?data.status:"partial",
   feedback:cut(data?.feedback,320),
   nextHint:cut(data?.nextHint,240)
  });
 }catch(e){
  console.error("[NAHLATY_CHECK_INVARIANCE_ERROR]",String(e?.message||e),e?.stack||"");
  return Response.json({error:"تعذر فحص الثابت بين التمثيلات",code:"CHECK_INVARIANCE_FAILED"},{status:500});
 }
}
