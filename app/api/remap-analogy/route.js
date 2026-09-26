import { createQwen, generateJson } from "../../lib/genai";
import { requestLimit } from "../../lib/requestGuard";

const cut=(v,n=500)=>String(v||"").slice(0,n);

export async function POST(req){
 const blocked=requestLimit(req,{scope:"remap-analogy",limit:10,windowMs:60_000});
 if(blocked)return blocked;
 try{
  const {target,title,nodes=[],edges=[]}=await req.json();
  if(!cut(target).trim()) return Response.json({error:"اكتب الشيء المألوف الذي تريد التشبيه به"},{status:400});
  const cleanNodes=(Array.isArray(nodes)?nodes:[]).slice(0,8).map(n=>({id:cut(n?.id,40),label:cut(n?.label,80),detail:cut(n?.detail,180)}));
  const ids=new Set(cleanNodes.map(n=>n.id));
  const cleanEdges=(Array.isArray(edges)?edges:[]).slice(0,12).map(e=>({id:cut(e?.id,40),from:cut(e?.from,40),to:cut(e?.to,40),label:cut(e?.label,80)})).filter(e=>ids.has(e.from)&&ids.has(e.to));
  const edgeIds=new Set(cleanEdges.map(e=>e.id));
  const key=process.env.DASHSCOPE_API_KEY;

  if(!key){
   return Response.json({
    mode:"demo",
    label:`تشبيه بـ ${cut(target,40)}`,
    nodes:cleanNodes.map(n=>({id:n.id,label:`${cut(target,18)}: ${n.label}`,glyph:"✦",detail:n.detail,limit:"هذا تشبيه تجريبي فقط ولا يطابق كل خصائص العنصر."})),
    edges:cleanEdges.map(e=>({id:e.id,label:e.label})),
    breaks:[{nodeId:cleanNodes[0]?.id||"",text:"النسخة التجريبية لا تقيم حدود التشبيه دلالياً بدون DASHSCOPE_API_KEY."}]
   });
  }

  const ai=createQwen(key);
  const prompt=`أنت تبني جسراً معرفياً بين مفهوم جديد وشيء مألوف للمستخدم.
الموضوع الأصلي: ${cut(title,160)}
العالم المألوف المطلوب: ${cut(target,160)}
عناصر المفهوم: ${JSON.stringify(cleanNodes)}
العلاقات: ${JSON.stringify(cleanEdges)}

أعد JSON فقط:
label: اسم قصير للتشبيه كله
nodes: عنصر لكل id أصلي، يحتوي id,label,glyph,detail,limit
edges: عنصر لكل id أصلي، يحتوي id,label
breaks: حتى 4 عناصر، كل واحد nodeId,text

القواعد:
- حافظ على نفس بنية المفهوم والعلاقات، ولا تضف عقدة جديدة.
- اجعل كل mapping من نفس العالم المألوف الذي اختاره المستخدم.
- detail يشرح لماذا التشبيه مفيد.
- limit يشرح باختصار أين يفشل هذا التشبيه لذلك العنصر، حتى لا يتحول التشبيه إلى معلومة خاطئة.
- breaks تعرض أهم حدود التشبيه فقط.
- لا تدّعي تطابقاً كاملاً؛ التشبيه أداة فهم لا حقيقة علمية.
- إذا كان العالم الذي اختاره المستخدم غير مناسب، استخدم أقرب mapping ممكن واذكر القيود بوضوح.`;
  const data=await generateJson(ai,prompt);
  const nodeMap=new Map((Array.isArray(data?.nodes)?data.nodes:[]).map(x=>[String(x?.id),x]));
  const edgeMap=new Map((Array.isArray(data?.edges)?data.edges:[]).map(x=>[String(x?.id),x]));
  return Response.json({
   label:cut(data?.label,80),
   nodes:cleanNodes.map(n=>{const x=nodeMap.get(n.id)||{};return {id:n.id,label:cut(x?.label||n.label,50),glyph:cut(x?.glyph||"✦",4),detail:cut(x?.detail,160),limit:cut(x?.limit,180)}}),
   edges:cleanEdges.map(e=>{const x=edgeMap.get(e.id)||{};return {id:e.id,label:cut(x?.label||e.label,60)}}),
   breaks:(Array.isArray(data?.breaks)?data.breaks:[]).slice(0,4).map(x=>({nodeId:ids.has(String(x?.nodeId))?String(x.nodeId):"",text:cut(x?.text,180)})).filter(x=>x.text)
  });
 }catch(e){
  console.error("[NAHLATY_REMAP_ANALOGY_ERROR]",String(e?.message||e),e?.stack||"");
  return Response.json({error:"تعذر بناء التشبيه المخصص",code:"REMAP_ANALOGY_FAILED"},{status:500});
 }
}
