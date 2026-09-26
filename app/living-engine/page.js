"use client";
import {useState} from "react";
export default function LivingEngine(){
 const [q,setQ]=useState("كيف تعمل الرئتان؟"),[result,setResult]=useState(null),[image,setImage]=useState(""),[loading,setLoading]=useState(false),[error,setError]=useState(""),[history,setHistory]=useState([]);
 async function run(e){e?.preventDefault?.();const question=q.trim();if(!question||loading)return;setLoading(true);setError("");
  try{
   const previous=result?{title:result.title||"",summary:result.summary||"",domain:result.engineMeta?.domain||"",topic:result.engineMeta?.topic||"",truthAnchors:result.truthAnchors||[],causalRelations:(result.sceneGraph?.edges||[]).filter(x=>x.causal).slice(0,8),sceneGraph:{nodes:(result.sceneGraph?.nodes||[]).slice(0,10).map(n=>({id:n.id,label:n.label}))}}:null;
   const ex=await fetch("/api/engine",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({question,context:{audience:"عام",scene:0,previous}})});
   const ep=await ex.json();if(!ex.ok||!ep?.ok)throw new Error(ep?.error?.message||"تعذر فهم السؤال");
   const engine=ep.result||{},experience=engine.experience;if(!experience)throw new Error("المحرك لم يرجع تجربة");
   const next={...experience,engineMeta:{provider:ep.provider,model:ep.model,domain:engine.domain,topic:engine.topic,confidence:engine.confidence},verification:engine.verification};
   setResult(next);
   const im=await fetch("/api/generate-visual",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({question,context:{previousTitle:previous?.title||next.title,previousSummary:previous?.summary||next.summary}})});
   const ip=await im.json();if(!im.ok||!ip?.ok)throw new Error(ip?.error||"تعذر توليد الصورة");
   setImage(ip.image);setHistory(h=>[...h,{question,title:next.title,image:ip.image}].slice(-6));setQ("");
  }catch(err){setError(String(err?.message||err))}finally{setLoading(false)}
 }
 return <main dir="rtl" style={{minHeight:"100vh",background:"radial-gradient(circle at 60% 10%,#182033,#060912 55%)",color:"#f8f3e8",padding:"24px",fontFamily:"system-ui"}}>
  <div style={{maxWidth:1180,margin:"0 auto"}}><header style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div><b style={{color:"#e8b84c",fontSize:22}}>نحلتي · MY BEE</b><div style={{opacity:.6,fontSize:12}}>LIVING VISUAL ENGINE · EXPERIMENT</div></div><a href="/" style={{color:"#e8b84c"}}>النسخة الثابتة ←</a></header>
  <section style={{position:"relative",minHeight:560,border:"1px solid #ffffff18",borderRadius:28,overflow:"hidden",background:"#090d16",boxShadow:"0 30px 80px #0008"}}>
   {image?<img src={image} alt={result?.title||"مشهد مولد"} style={{width:"100%",height:560,objectFit:"cover",display:"block"}}/>:<div style={{height:560,display:"grid",placeItems:"center",textAlign:"center",padding:30}}><div><div style={{fontSize:64}}>✦</div><h1>اسأل عن أي شيء</h1><p style={{opacity:.65}}>السؤال يبني عالمًا بصريًا جديدًا. والسؤال التالي يعيد البحث داخل نفس العالم.</p></div></div>}
   {result&&<div style={{position:"absolute",right:24,left:24,bottom:22,padding:"18px 20px",borderRadius:18,background:"#05070bd9",backdropFilter:"blur(14px)",border:"1px solid #ffffff1c"}}><small style={{color:"#e8b84c"}}>العالم الحالي</small><h2 style={{margin:"5px 0"}}>{result.title}</h2><p style={{margin:0,opacity:.78}}>{result.summary}</p></div>}
  </section>
  <form onSubmit={run} style={{display:"flex",gap:10,margin:"16px 0"}}><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder={result?"اسأل عن أي شيء تراه الآن…":"ما الذي تريد أن تفهمه؟"} style={{flex:1,padding:"18px 20px",borderRadius:18,border:"1px solid #ffffff22",background:"#0d1320",color:"white",fontSize:18,outline:"none"}}/><button disabled={loading||!q.trim()} style={{padding:"0 26px",borderRadius:18,border:0,background:"#e8b84c",color:"#111",fontWeight:800,fontSize:16}}>{loading?"يبني المشهد…":result?"ابحث داخل العالم":"ابدأ الفهم"}</button></form>
  {error&&<div style={{padding:14,border:"1px solid #ff6b6b55",borderRadius:14,color:"#ffb3b3"}}>{error}</div>}
  {history.length>1&&<div style={{display:"flex",gap:10,overflowX:"auto",padding:"8px 0 20px"}}>{history.map((h,i)=><button key={i} onClick={()=>{setImage(h.image);setQ(h.question)}} style={{minWidth:190,textAlign:"right",padding:10,borderRadius:14,border:"1px solid #ffffff18",background:"#0c111b",color:"white"}}><img src={h.image} alt="" style={{width:"100%",height:90,objectFit:"cover",borderRadius:9}}/><small>{h.question}</small></button>)}</div>}
  </div></main>
}
