"use client";
import {useState} from "react";


function SemanticFallback({experience}){
 const nodes=(experience?.sceneGraph?.nodes||[]).slice(0,7);
 const edges=(experience?.sceneGraph?.edges||[]).slice(0,10);
 const byId=new Map(nodes.map(n=>[n.id,n]));
 if(!nodes.length)return <div style={{height:"min(66vh,620px)",minHeight:460,display:"grid",placeItems:"center",padding:30,textAlign:"center"}}><div><div style={{fontSize:58,color:"#e8b84c"}}>✦</div><h2>{experience?.title||"شرح بصري"}</h2><p style={{maxWidth:640,opacity:.72,lineHeight:1.8}}>{experience?.summary||""}</p></div></div>;
 return <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-label={experience?.title||"مشهد بصري"} style={{width:"100%",height:"min(66vh,620px)",minHeight:460,display:"block",background:"radial-gradient(circle at 50% 45%,#172235 0%,#090d16 68%)"}}>
  <defs>
   <marker id="bee-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#e8b84c"/></marker>
   <filter id="bee-glow"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  {edges.map((edge,i)=>{
   const a=byId.get(edge.from),b=byId.get(edge.to);
   if(!a||!b)return null;
   return <g key={edge.id||i}><line x1={Number(a.x)||50} y1={Number(a.y)||50} x2={Number(b.x)||50} y2={Number(b.y)||50} stroke={edge.causal?"#e8b84c":"#7e8ca6"} strokeWidth={edge.causal?1.05:.55} opacity={edge.causal ? .9 : .5} markerEnd="url(#bee-arrow)"/>{edge.label&&<text x={((Number(a.x)||50)+(Number(b.x)||50))/2} y={((Number(a.y)||50)+(Number(b.y)||50))/2-1.5} fill="#d6d9df" fontSize="2.6" textAnchor="middle">{String(edge.label).slice(0,22)}</text>}</g>;
  })}
  {nodes.map((node,i)=><g key={node.id||i} transform={`translate(${Number(node.x)||50} ${Number(node.y)||50})`} filter={node.knowledge==="fact"?"url(#bee-glow)":undefined}>
   <circle r={node.spatial?7.2:6.2} fill="#111827" stroke={node.knowledge==="fact"?"#e8b84c":"#8a96aa"} strokeWidth={node.knowledge==="fact" ? .9 : .55}/>
   <text y="-1" fill="#f6e7bd" fontSize="4.2" textAnchor="middle">{String(node.glyph||"●").slice(0,3)}</text>
   <text y="10" fill="#f7f2e7" fontSize="3.1" textAnchor="middle">{String(node.label||"").slice(0,18)}</text>
  </g>)}
 </svg>;
}

export default function LivingEngine(){
 const [q,setQ]=useState("كيف تعمل الرئتان؟");
 const [result,setResult]=useState(null);
 const [image,setImage]=useState("");
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [history,setHistory]=useState([]);

 function resetWorld(){
  setResult(null);
  setImage("");
  setHistory([]);
  setError("");
  setQ("");
 }

 async function run(e){
  e?.preventDefault?.();
  const question=q.trim();
  if(!question||loading)return;
  setLoading(true);
  setError("");
  try{
   const previous=result?{
    title:result.title||"",
    summary:result.summary||"",
    domain:result.engineMeta?.domain||"",
    topic:result.engineMeta?.topic||"",
    scene:Number.isInteger(result.engineMeta?.scene)?result.engineMeta.scene:null,
    truthAnchors:result.truthAnchors||[],
    causalRelations:(result.sceneGraph?.edges||[]).filter(x=>x.causal).slice(0,8),
    sceneGraph:{nodes:(result.sceneGraph?.nodes||[]).slice(0,10).map(n=>({id:n.id,label:n.label}))}
   }:null;

   const ex=await fetch("/api/engine",{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({question,context:{audience:"عام",...(previous?{previous}:{}),...(Number.isInteger(previous?.scene)?{scene:previous.scene}:{})}})
   });
   const ep=await ex.json();
   if(!ex.ok||!ep?.ok)throw new Error(ep?.error?.message||"تعذر فهم السؤال");

   const engine=ep.result||{};
   const experience=engine.experience;
   if(!experience)throw new Error("المحرك لم يرجع تجربة");

   const next={
    ...experience,
    engineMeta:{
     provider:ep.provider,
     model:ep.model,
     domain:engine.domain,
     topic:engine.topic,
     scene:Number.isInteger(engine.scene)?engine.scene:null,
     confidence:engine.confidence
    },
    verification:engine.verification
   };

   let visualImage="";
   let visualModel="semantic-fallback";
   try{
    const im=await fetch("/api/generate-visual",{
     method:"POST",
     headers:{"content-type":"application/json"},
     body:JSON.stringify({
      question,
      context:{
       previousTitle:previous?.title||next.title,
       previousSummary:previous?.summary||next.summary,
       previousImage:image||""
      }
     })
    });
    const ip=await im.json();
    if(im.ok&&ip?.ok&&String(ip.image||"").startsWith("data:image/")){
     visualImage=ip.image;
     visualModel=ip.model||"generated-image";
    }
   }catch{}
   setResult(next);
   setImage(visualImage);
   setHistory(h=>[...h,{question,title:next.title,image:visualImage,result:next,model:visualModel}].slice(-8));
   setQ("");
  }catch(err){
   setError(String(err?.message||err));
  }finally{
   setLoading(false);
  }
 }

 const followUp=Boolean(result);

 return <main dir="rtl" style={{minHeight:"100vh",background:"radial-gradient(circle at 60% 10%,#182033,#060912 55%)",color:"#f8f3e8",padding:"clamp(14px,3vw,28px)",fontFamily:"system-ui"}}>
  <div style={{maxWidth:1180,margin:"0 auto"}}>
   <header style={{display:"flex",gap:12,justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap"}}>
    <div><b style={{color:"#e8b84c",fontSize:22}}>نحلتي · MY BEE</b><div style={{opacity:.6,fontSize:12}}>LIVING VISUAL ENGINE · PROOF</div></div>
    <div style={{display:"flex",gap:8}}>
     {followUp&&<button onClick={resetWorld} style={{border:"1px solid #ffffff25",background:"#0d1320",color:"white",padding:"10px 14px",borderRadius:12}}>＋ بحث جديد</button>}
     <a href="/" style={{color:"#e8b84c",padding:"10px 0"}}>النسخة الثابتة ←</a>
    </div>
   </header>

   <section style={{position:"relative",minHeight:"min(66vh,620px)",border:"1px solid #ffffff18",borderRadius:28,overflow:"hidden",background:"#090d16",boxShadow:"0 30px 80px #0008"}}>
    {image
     ?<img src={image} alt={result?.title||"مشهد مولد"} style={{width:"100%",height:"min(66vh,620px)",minHeight:460,objectFit:"cover",display:"block"}}/>
     :result
      ?<SemanticFallback experience={result}/>
      :<div style={{height:"min(66vh,620px)",minHeight:460,display:"grid",placeItems:"center",textAlign:"center",padding:30}}><div><div style={{fontSize:64}}>✦</div><h1 style={{fontSize:"clamp(30px,5vw,54px)",margin:"10px 0"}}>اسأل عن أي شيء</h1><p style={{opacity:.65,fontSize:18}}>السؤال يبني عالمًا بصريًا جديدًا. والسؤال التالي يعيد البحث داخل نفس العالم.</p></div></div>}

    {loading&&<div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",background:"#050811bb",backdropFilter:"blur(8px)",zIndex:3}}><div style={{textAlign:"center"}}><div style={{fontSize:52,color:"#e8b84c"}}>✦</div><b style={{fontSize:20}}>{followUp?"أطوّر نفس البحث…":"أبني العالم البصري…"}</b><p style={{opacity:.65}}>فهم السؤال ← بناء المعنى ← توليد المشهد</p></div></div>}

    {result&&<div style={{position:"absolute",right:20,left:20,bottom:18,padding:"16px 18px",borderRadius:18,background:"#05070bd9",backdropFilter:"blur(14px)",border:"1px solid #ffffff1c"}}>
     <small style={{color:"#e8b84c"}}>{history.length>1?"متابعة داخل البحث":"العالم الحالي"}</small>
     <h2 style={{margin:"5px 0",fontSize:"clamp(20px,3vw,30px)"}}>{result.title}</h2>
     <p style={{margin:0,opacity:.78,lineHeight:1.7}}>{result.summary}</p>
    </div>}
   </section>

   <form onSubmit={run} style={{display:"flex",gap:10,margin:"16px 0",flexWrap:"wrap"}}>
    <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder={followUp?"اسأل عن أي شيء تراه الآن…":"ما الذي تريد أن تفهمه؟"} style={{flex:"1 1 520px",padding:"18px 20px",borderRadius:18,border:"1px solid #ffffff22",background:"#0d1320",color:"white",fontSize:18,outline:"none"}}/>
    <button disabled={loading||!q.trim()} style={{padding:"0 26px",minHeight:58,borderRadius:18,border:0,background:"#e8b84c",color:"#111",fontWeight:800,fontSize:16,opacity:loading?.65:1}}>{loading?"يعمل…":followUp?"تعمّق داخل البحث":"ابدأ الفهم"}</button>
   </form>

   {followUp&&<div style={{fontSize:13,opacity:.6,margin:"-6px 4px 12px"}}>السؤال التالي يحتفظ بموضوع البحث وسياقه. استخدم «بحث جديد» عندما تريد الانتقال إلى موضوع آخر.</div>}
   {error&&<div style={{padding:14,border:"1px solid #ff6b6b55",borderRadius:14,color:"#ffb3b3",marginBottom:12}}>{error}</div>}

   {history.length>1&&<div style={{display:"flex",gap:10,overflowX:"auto",padding:"8px 0 20px"}}>
    {history.map((h,i)=><button key={i} onClick={()=>{setImage(h.image);setResult(h.result);setQ("")}} style={{minWidth:190,maxWidth:190,textAlign:"right",padding:10,borderRadius:14,border:"1px solid #ffffff18",background:"#0c111b",color:"white"}}>
     {h.image?<img src={h.image} alt="" style={{width:"100%",height:90,objectFit:"cover",borderRadius:9}}/>:<div style={{width:"100%",height:90,borderRadius:9,display:"grid",placeItems:"center",background:"radial-gradient(circle,#25324b,#0a0f19)",color:"#e8b84c",fontSize:28}}>✦</div>}
     <small style={{display:"block",marginTop:8,lineHeight:1.4}}>{h.question}</small>
    </button>)}
   </div>}
  </div>
 </main>;
}
