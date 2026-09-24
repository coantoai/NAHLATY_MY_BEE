import { createGemini, generateJson } from "../../lib/genai";

const cut=(v,n=500)=>String(v||"").slice(0,n);

export async function POST(req){
 try{
  const {question,title,nodes=[],edges=[],steps=[],conversation=[]}=await req.json();
  if(!cut(question).trim()) return Response.json({error:"اكتب سؤالك أولاً"},{status:400});
  const cleanNodes=(Array.isArray(nodes)?nodes:[]).slice(0,8).map(n=>({id:cut(n?.id,40),label:cut(n?.label,80),detail:cut(n?.detail,180),sourceRef:cut(n?.sourceRef,80)}));
  const ids=new Set(cleanNodes.map(n=>n.id));
  const cleanEdges=(Array.isArray(edges)?edges:[]).slice(0,12).map(e=>({id:cut(e?.id,40),from:cut(e?.from,40),to:cut(e?.to,40),label:cut(e?.label,80),sourceRef:cut(e?.sourceRef,80)})).filter(e=>ids.has(e.from)&&ids.has(e.to));
  const edgeIds=new Set(cleanEdges.map(e=>e.id));
  const cleanSteps=(Array.isArray(steps)?steps:[]).slice(0,8).map(s=>({title:cut(s?.title,100),text:cut(s?.text,240),why:cut(s?.why,180),outcome:cut(s?.outcome,180)}));
  const cleanConversation=(Array.isArray(conversation)?conversation:[]).slice(-6).map(x=>({question:cut(x?.question,240),answer:cut(x?.answer,420)}));
  const key=process.env.GEMINI_API_KEY;

  if(!key){
   const q=cut(question,600).toLowerCase();
   const hits=cleanNodes.filter(n=>q.includes(n.label.toLowerCase())||n.label.toLowerCase().includes(q)).map(n=>n.id);
   return Response.json({
    mode:"demo",
    answer:hits.length?"هذا السؤال مرتبط بالعناصر المضيئة في المشهد. أضف GEMINI_API_KEY للحصول على جواب دلالي كامل.":"السؤال غير مطابق مباشرةً لعناصر النسخة التجريبية.",
    nodeIds:hits,edgeIds:[],followUp:"جرّب سؤالاً عن عنصر ظاهر في المشهد."
   });
  }

  const ai=createGemini(key);
  const prompt=`أنت مساعد داخل مشهد شرح بصري، ويجب أن تكون إجابتك grounded فقط في البيانات التالية.
العنوان: ${cut(title,160)}
العناصر: ${JSON.stringify(cleanNodes)}
العلاقات: ${JSON.stringify(cleanEdges)}
خطوات الشرح: ${JSON.stringify(cleanSteps)}
المحادثة السابقة داخل نفس العالم: ${JSON.stringify(cleanConversation)}\nسؤال المستخدم الحالي: ${cut(question,1000)}

افهم الضمائر والإشارات في السؤال الحالي من سياق المحادثة والمشهد (مثل: هو، هيدا، سكر، رجع) ولا تعامل السؤال كموضوع جديد ما دام يمكن تفسيره من العالم الحالي.\nأعد JSON فقط:
answer: جواب عربي واضح ومختصر. إذا السؤال يتطلب معلومة غير موجودة في المشهد، قل بوضوح أن المشهد الحالي لا يحتوي دليلاً كافياً ولا تخترع.
nodeIds: ids العناصر التي اعتمد عليها الجواب فعلياً
edgeIds: ids العلاقات التي اعتمد عليها الجواب فعلياً
followUp: سؤال متابعة واحد اختياري يساعد المستخدم يفهم أعمق، أو نص فارغ

لا تضف مصادر خارجية ولا معلومات غير موجودة في المشهد.`;
  const data=await generateJson(ai,prompt);
  return Response.json({
   answer:cut(data?.answer,700),
   nodeIds:(Array.isArray(data?.nodeIds)?data.nodeIds:[]).map(String).filter(id=>ids.has(id)),
   edgeIds:(Array.isArray(data?.edgeIds)?data.edgeIds:[]).map(String).filter(id=>edgeIds.has(id)),
   followUp:cut(data?.followUp,220)
  });
 }catch(e){
  return Response.json({error:"تعذر سؤال المشهد",detail:String(e?.message||e)},{status:500});
 }
}
