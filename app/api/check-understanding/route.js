import { createGemini, generateJson } from "../../lib/genai";

const safeText=(v,n=500)=>String(v||"").slice(0,n);

export async function POST(req){
 try{
  const {response,title,nodes=[],edges=[],experience={}}=await req.json();
  if(!safeText(response).trim()) return Response.json({error:"اكتب شرحك أولاً"},{status:400});
  const cleanNodes=(Array.isArray(nodes)?nodes:[]).slice(0,8).map(n=>({id:safeText(n?.id,40),label:safeText(n?.label,80),detail:safeText(n?.detail,180)}));
  const ids=new Set(cleanNodes.map(n=>n.id));
  const cleanEdges=(Array.isArray(edges)?edges:[]).slice(0,12).map(e=>({from:safeText(e?.from,40),to:safeText(e?.to,40),label:safeText(e?.label,80)})).filter(e=>ids.has(e.from)&&ids.has(e.to));
  const key=process.env.GEMINI_API_KEY;

  if(!key){
   const lower=safeText(response,1200).toLowerCase();
   const coveredNodeIds=cleanNodes.filter(n=>lower.includes(n.label.toLowerCase())).map(n=>n.id);
   const missingNodeIds=cleanNodes.filter(n=>!coveredNodeIds.includes(n.id)).map(n=>n.id);
   return Response.json({
    mode:"demo",
    status:coveredNodeIds.length>=Math.max(1,Math.ceil(cleanNodes.length*.6))?"partial":"needs_work",
    feedback:"تم فحص المصطلحات الأساسية محلياً. أضف GEMINI_API_KEY للحصول على تقييم دلالي أعمق.",
    coveredNodeIds,missingNodeIds,
    nextHint:missingNodeIds.length?"حاول ربط العناصر ببعضها وشرح لماذا ينتقل الأثر من عنصر للذي يليه.":"حاول الآن شرح السبب والنتيجة بدون الرجوع للمشهد.",
    remedyMode:experience?.id==="child"?"concrete":experience?.id==="senior"?"direct":experience?.id==="educator"?"teachback":experience?.id==="expert"?"causal":"visual"
   });
  }

  const ai=createGemini(key);
  const prompt=`أنت مقيّم فهم، لا مقيّم أسلوب كتابة. عنوان الشرح: ${safeText(title,160)}.\nسياسة تجربة المتعلم: ${JSON.stringify(experience||{})}.
هذه عناصر المشهد: ${JSON.stringify(cleanNodes)}
وهذه العلاقات: ${JSON.stringify(cleanEdges)}
شرح المستخدم بكلماته: ${safeText(response,1800)}

أعد JSON فقط بالمفاتيح:
status: واحد من strong,partial,needs_work
feedback: جملة عربية قصيرة تصف ما فهمه المستخدم فعلاً بدون مجاملة زائدة
coveredNodeIds: ids التي شرح معناها أو دورها بشكل صحيح دلالياً، حتى لو لم يذكر الاسم حرفياً
missingNodeIds: ids المهمة التي أغفلها أو خلط بينها
nextHint: تلميح قصير واحد يساعده يكمل الفجوة التالية بدون إعطائه الجواب كاملاً\nremedyMode: واحد من concrete,direct,teachback,causal,visual بحسب سياسة المتعلم

لا تستخدم درجات رقمية. لا تعاقب المستخدم على الصياغة أو اللغة. قيّم العلاقات والسببية والفهم.\nكيّف feedback وnextHint وremedyMode مع الفئة: الطفل = concrete وملموس؛ الكبير بالعمر = direct واضح ومحترم؛ المعلّم = teachback؛ المتخصص = causal ودقيق؛ الطالب/العام = visual أو concrete بحسب الفجوة.`;
  const data=await generateJson(ai,prompt);
  const covered=(Array.isArray(data?.coveredNodeIds)?data.coveredNodeIds:[]).map(String).filter(id=>ids.has(id));
  const missing=(Array.isArray(data?.missingNodeIds)?data.missingNodeIds:[]).map(String).filter(id=>ids.has(id)&&!covered.includes(id));
  const status=["strong","partial","needs_work"].includes(data?.status)?data.status:"partial";
  const remedyMode=["concrete","direct","teachback","causal","visual"].includes(data?.remedyMode)?data.remedyMode:"visual";
  return Response.json({
   status,
   feedback:safeText(data?.feedback,320),
   coveredNodeIds:covered,
   missingNodeIds:missing,
   nextHint:safeText(data?.nextHint,260),
   remedyMode
  });
 }catch(e){
  return Response.json({error:"تعذر تقييم الفهم",detail:String(e?.message||e)},{status:500});
 }
}
