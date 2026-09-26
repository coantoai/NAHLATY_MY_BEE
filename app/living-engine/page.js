"use client";
import {useState} from "react";

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
    body:JSON.stringify({question,context:{audience:"عام",...(previous?{previous}:{})...(Number.isInteger(previous?.scene)?{scene:previous.scene}:{})}})
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
   if(!im.ok||!ip?.ok)throw new Error(ip?.error||"تعذر توليد الصورة");

   setResult(next);
   setImage(ip.image);
   setHistory(h=>[...h,{question,title:next.title,image:ip.image,result:next,model:ip.model}].slice(-8));
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
     <img src={h.image} alt="" style={{width:"100%",height:90,objectFit:"cover",borderRadius:9}}/>
     <small style={{display:"block",marginTop:8,lineHeight:1.4}}>{h.question}</small>
    </button>)}
   </div>}
  </div>
 </main>;
}
