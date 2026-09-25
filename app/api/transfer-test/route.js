import { createGemini, generateJson } from "../../lib/genai";
import { deriveTransferEdgeIds } from "../../lib/transferEvidence";
import { requestLimit } from "../../lib/requestGuard";

const cut=(v,n=500)=>String(v||"").slice(0,n);

export async function POST(req){
 const blocked=requestLimit(req,{scope:"transfer-test",limit:10,windowMs:60_000});
 if(blocked)return blocked;
 try{
  const {title,nodes=[],edges=[]}=await req.json();
  const cleanNodes=(Array.isArray(nodes)?nodes:[]).slice(0,8).map(n=>({
   id:cut(n?.id,40),label:cut(n?.label,80),detail:cut(n?.detail,180),type:cut(n?.type,30)
  }));
  const ids=new Set(cleanNodes.map(n=>n.id));
  const cleanEdges=(Array.isArray(edges)?edges:[]).slice(0,12).map(e=>({
   id:cut(e?.id,40),from:cut(e?.from,40),to:cut(e?.to,40),label:cut(e?.label,80),
   relation:cut(e?.relation,30),causal:Boolean(e?.causal)
  })).filter(e=>ids.has(e.from)&&ids.has(e.to));
  if(cleanNodes.length<2) return Response.json({error:"المشهد يحتاج عنصرين على الأقل"},{status:400});

  const key=process.env.GEMINI_API_KEY;
  if(!key){
   const answer=cleanNodes[Math.min(1,cleanNodes.length-1)];
   return Response.json({
    mode:"demo",
    title:"نفس المنطق في عالم مختلف",
    summary:"هذا اختبار نقل تجريبي يحافظ على نفس بنية المشهد ويبدّل السطح فقط.",
    nodes:cleanNodes.map((n,i)=>({id:n.id,label:`عنصر جديد ${i+1}`,glyph:["◆","●","▲","■"][i%4],detail:"يمثل نفس الدور البنيوي في سياق جديد."})),
    edges:cleanEdges.map(e=>({id:e.id,label:e.label||"يؤثر"})),
    prompt:"أي عنصر يلعب الدور نفسه للعقدة المركزية في المشهد الأصلي؟",
    choiceNodeIds:cleanNodes.map(n=>n.id).slice(0,4),
    answerNodeId:answer.id,
    testedEdgeIds:deriveTransferEdgeIds(cleanEdges,[],answer.id),
    explanation:"النسخة التجريبية تحفظ الهوية البنيوية فقط. فعّل GEMINI_API_KEY لبناء سياق نقل دلالي كامل."
   });
  }

  const ai=createGemini(key);
  const prompt=`أنت تبني اختبار "نقل فهم" لاختبار ما إذا كان المستخدم فهم البنية والسببية، لا الكلمات.
الموضوع الأصلي: ${cut(title,160)}
العناصر الأصلية: ${JSON.stringify(cleanNodes)}
العلاقات الأصلية: ${JSON.stringify(cleanEdges)}

ابنِ سيناريو جديداً مختلفاً سطحياً بوضوح عن الموضوع الأصلي، لكنه يحافظ على نفس الهيكل الوظيفي والسببي قدر الإمكان.
أعد JSON فقط:
title: عنوان العالم الجديد
summary: وصف قصير للموقف الجديد بدون كشف الجواب
nodes: عنصر لكل id أصلي بالضبط، يحتوي id,label,glyph,detail
edges: عنصر لكل id أصلي بالضبط، يحتوي id,label
prompt: سؤال واحد يختبر نقل العلاقة أو الدور، وليس حفظ الاسم
choiceNodeIds: من 2 إلى 4 ids أصلية ممثلة بالعناصر الجديدة
answerNodeId: id واحد من choiceNodeIds
testedEdgeIds: من 1 إلى 2 ids للعلاقات الأصلية التي يحتاج المستخدم فهمها فعلاً حتى يحل السؤال
explanation: بعد الإجابة، اشرح لماذا العنصر الصحيح يحمل نفس الدور أو العلاقة في البنية الجديدة

القواعد:
- لا تستخدم نفس المجال أو المصطلحات أو التشبيه الموجود في الموضوع الأصلي.
- حافظ على ids حتى نستطيع إسقاط العالم الجديد على نفس المشهد.
- لا تغيّر اتجاه العلاقات السببية الأساسية.
- لا تجعل السؤال قابلاً للحل من الاسم وحده؛ يجب أن يحتاج فهم الدور أو السبب والنتيجة.
- لا تضف ادعاءات علمية جديدة.
- استخدم glyph Unicode بسيطاً.
- اجعل السيناريو قصيراً وواضحاً بالعربية.`;

  const data=await generateJson(ai,prompt);
  const nodeMap=new Map((Array.isArray(data?.nodes)?data.nodes:[]).map(x=>[String(x?.id),x]));
  const edgeMap=new Map((Array.isArray(data?.edges)?data.edges:[]).map(x=>[String(x?.id),x]));
  const choice=(Array.isArray(data?.choiceNodeIds)?data.choiceNodeIds:[]).map(String).filter(id=>ids.has(id)).slice(0,4);
  const answer=choice.includes(String(data?.answerNodeId))?String(data.answerNodeId):choice[0]||cleanNodes[0].id;

  return Response.json({
   title:cut(data?.title,100),
   summary:cut(data?.summary,260),
   nodes:cleanNodes.map(n=>{const x=nodeMap.get(n.id)||{};return {id:n.id,label:cut(x?.label||n.label,60),glyph:cut(x?.glyph||"◆",4),detail:cut(x?.detail,180)}}),
   edges:cleanEdges.map(e=>{const x=edgeMap.get(e.id)||{};return {id:e.id,label:cut(x?.label||e.label,80)}}),
   prompt:cut(data?.prompt,180),
   choiceNodeIds:choice,
   answerNodeId:answer,
   testedEdgeIds:deriveTransferEdgeIds(cleanEdges,data?.testedEdgeIds,answer),
   explanation:cut(data?.explanation,320)
  });
 }catch(e){
  console.error("[NAHLATY_TRANSFER_TEST_ERROR]",String(e?.message||e),e?.stack||"");
  return Response.json({error:"تعذر بناء اختبار نقل الفهم",code:"TRANSFER_TEST_FAILED"},{status:500});
 }
}
