"use client";
import {useEffect,useRef,useState} from "react";
import {listTurns,listWorlds,makeId,storeTurn} from "../lib/livingHistory";


function SemanticFallback({experience}){
 const nodes=(experience?.sceneGraph?.nodes||[]).slice(0,7);
 const edges=(experience?.sceneGraph?.edges||[]).slice(0,10);
 const byId=new Map(nodes.map(n=>[n.id,n]));
 if(!nodes.length)return <div style={{height:"min(66vh,620px)",minHeight:460,display:"grid",placeItems:"center",padding:30,textAlign:"center",background:"radial-gradient(circle at 50% 45%,#172235 0%,#090d16 68%)"}}><div><div style={{fontSize:64,color:"#e8b84c"}}>✦</div><div style={{opacity:.55,fontSize:14}}>VISUAL UNDERSTANDING</div></div></div>;
 return <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-label={experience?.title||"مشهد بصري"} style={{width:"100%",height:"min(66vh,620px)",minHeight:460,display:"block",background:"radial-gradient(circle at 50% 45%,#172235 0%,#090d16 68%)"}}>
  <defs>
   <marker id="bee-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#e8b84c"/></marker>
   <filter id="bee-glow"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  {edges.map((edge,i)=>{
   const a=byId.get(edge.from),b=byId.get(edge.to);
   if(!a||!b)return null;
   return <g key={edge.id||i}><line x1={Number(a.x)||50} y1={Number(a.y)||50} x2={Number(b.x)||50} y2={Number(b.y)||50} stroke={edge.causal?"#e8b84c":"#7e8ca6"} strokeWidth={edge.causal?1.05:.55} opacity={edge.causal ? .9 : .5} markerEnd="url(#bee-arrow)"/>{edge.causal&&edge.label&&<text x={((Number(a.x)||50)+(Number(b.x)||50))/2} y={((Number(a.y)||50)+(Number(b.y)||50))/2-1.5} fill="#d6d9df" fontSize="2.4" textAnchor="middle">{String(edge.label).split(/\s+/).slice(0,3).join(" ")}</text>}</g>;
  })}
  {nodes.map((node,i)=><g key={node.id||i} transform={`translate(${Number(node.x)||50} ${Number(node.y)||50})`} filter={node.knowledge==="fact"?"url(#bee-glow)":undefined}>
   <circle r={node.spatial?7.2:6.2} fill="#111827" stroke={node.knowledge==="fact"?"#e8b84c":"#8a96aa"} strokeWidth={node.knowledge==="fact" ? .9 : .55}/>
   <text y="-1" fill="#f6e7bd" fontSize="4.2" textAnchor="middle">{String(node.glyph||"●").slice(0,3)}</text>
   <text y="10" fill="#f7f2e7" fontSize="2.9" textAnchor="middle">{String(node.label||"").split(/\s+/).slice(0,3).join(" ")}</text>
  </g>)}
 </svg>;
}

async function compactReference(source){
 if(!String(source||"").startsWith("data:image/"))return "";
 return new Promise(resolve=>{
  const img=new Image();
  img.onload=()=>{
   try{
    const width=Math.min(1000,img.naturalWidth||1000);
    const height=Math.max(1,Math.round((img.naturalHeight||width)*width/(img.naturalWidth||width)));
    const canvas=document.createElement("canvas");
    canvas.width=width;canvas.height=height;
    canvas.getContext("2d").drawImage(img,0,0,width,height);
    const data=canvas.toDataURL("image/jpeg",0.76);
    resolve(data.length<2000000?data:"");
   }catch{resolve("");}
  };
  img.onerror=()=>resolve("");
  img.src=source;
 });
}

export default function LivingEngine(){
 const [q,setQ]=useState("كيف تعمل الرئتان؟");
 const [result,setResult]=useState(null);
 const [image,setImage]=useState("");
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [visualNotice,setVisualNotice]=useState("");
 const [history,setHistory]=useState([]);
 const [worlds,setWorlds]=useState([]);
 const [selectedId,setSelectedId]=useState("");
 const [ready,setReady]=useState(false);
 const [saving,setSaving]=useState("loading");
 const [archiveError,setArchiveError]=useState("");
 const worldRef=useRef(null);

 useEffect(()=>{
  let active=true;
  (async()=>{
   try{
    const saved=await listWorlds();
    if(!active)return;
    setWorlds(saved);
    if(saved.length){
     const turns=await listTurns(saved[0].id);
     if(!active)return;
     worldRef.current=saved[0];
     setSelectedId(saved[0].id);
     setHistory(turns);
     const last=[...turns].reverse().find(t=>t.status==="complete"&&t.result);
     if(last){setResult(last.result);setImage(last.image||"");}
    }
    setSaving("saved");
   }catch(error){
    if(active){setSaving("unavailable");setArchiveError("التخزين المحلي غير متاح في هذا المتصفح. لا تغلق الصفحة إذا أردت الاحتفاظ بالتجربة الحالية.");}
   }finally{if(active)setReady(true);}
  })();
  return ()=>{active=false;};
 },[]);

 async function persist(world,turn){
  try{
   setSaving("saving");
   await storeTurn(world,turn);
   setSaving("saved");
   setArchiveError("");
   setWorlds(await listWorlds());
  }catch(error){
   setSaving("unavailable");
   setArchiveError("لم ينجح حفظ هذه التجربة على الجهاز. تحقق من مساحة التخزين أو إعدادات المتصفح.");
  }
 }

 async function restoreWorld(world){
  if(loading)return;
  try{
   const turns=await listTurns(world.id);
   worldRef.current=world;
   setSelectedId(world.id);
   setHistory(turns);
   const last=[...turns].reverse().find(t=>t.status==="complete"&&t.result);
   setResult(last?.result||null);
   setImage(last?.image||"");
   setQ("");
   setError("");
   setVisualNotice("");
  }catch(error){setArchiveError("تعذرت استعادة الرحلة المحفوظة.");}
 }


 function resetWorld(){
  setResult(null);
  setImage("");
  setHistory([]);
  worldRef.current=null;
  setSelectedId("");
  setError("");
  setVisualNotice("");
  setQ("");
 }

 async function run(e){
  e?.preventDefault?.();
  const question=q.trim();
  if(!question||loading||!ready)return;
  setLoading(true);
  setError("");
  setVisualNotice("");
  const createdAt=Date.now();
  const world=worldRef.current||{id:makeId(),title:question.slice(0,110),createdAt,updatedAt:createdAt};
  worldRef.current=world;
  setSelectedId(world.id);
  const pending={id:makeId(),worldId:world.id,createdAt,question,title:question,status:"processing",image:"",result:null,model:""};
  setHistory(h=>[...h,pending]);
  await persist(world,pending);
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
   let imageFailed=false;
   let imageError="";
   try{
    const reference=await compactReference(image);
    if(image&&!reference)throw new Error("تعذر إرسال الصورة السابقة للتعديل.");
    const im=await fetch("/api/generate-visual",{
     method:"POST",
     headers:{"content-type":"application/json"},
     body:JSON.stringify({
      question,
      context:{
       previousTitle:previous?.title||next.title,
       previousSummary:previous?.summary||next.summary,
       previousImage:reference
      }
     })
    });
    const ip=await im.json();
    if(im.ok&&ip?.ok&&String(ip.image||"").startsWith("data:image/")){
     visualImage=ip.image;
     visualModel=ip.model||"generated-image";
    }else{
     imageFailed=true;
     imageError=ip?.error||"لم يؤكد فحص الصورة تنفيذ التغيير.";
    }
   }catch(e){imageFailed=true;imageError=String(e?.message||e);}
   if(imageFailed){
    setVisualNotice("لم يتم تنفيذ التغيير البصري؛ أُبقيت الصورة السابقة دون ادعاء أنها الإجابة الجديدة.");
   }else{
    setResult(next);
    setImage(visualImage);
   }
   const done={...pending,title:next.title,image:visualImage,result:next,model:visualModel,
    status:imageFailed?"visual-failed":"complete",error:imageFailed?imageError:"",updatedAt:Date.now()};
   setHistory(h=>h.map(t=>t.id===pending.id?done:t));
   await persist(world,done);
   setQ("");
  }catch(err){
   const message=String(err?.message||err);
   const failed={...pending,status:"failed",error:message,updatedAt:Date.now()};
   setHistory(h=>h.map(t=>t.id===pending.id?failed:t));
   await persist(world,failed);
   setError(message);
  }finally{
   setLoading(false);
  }
 }

 const followUp=Boolean(result);

 return <main dir="rtl" style={{minHeight:"100vh",background:"radial-gradient(circle at 60% 10%,#182033,#060912 55%)",color:"#f8f3e8",padding:"clamp(14px,3vw,28px)",fontFamily:"system-ui"}}>
  <div style={{maxWidth:1180,margin:"0 auto"}}>
   <header style={{display:"flex",gap:12,justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap"}}>
    <div><b style={{color:"#e8b84c",fontSize:22}}>نحلتي · MY BEE</b><div style={{opacity:.6,fontSize:12}}>LIVING VISUAL ENGINE · {saving==="saved"?"محفوظ محليًا":saving==="saving"?"جارٍ الحفظ…":saving==="loading"?"تحميل السجل…":"الحفظ غير متاح"}</div></div>
    <div style={{display:"flex",gap:8}}>
     {(followUp||selectedId)&&<button onClick={resetWorld} disabled={loading} style={{border:"1px solid #ffffff25",background:"#0d1320",color:"white",padding:"10px 14px",borderRadius:12}}>＋ بحث جديد</button>}
     <a href="/" style={{color:"#e8b84c",padding:"10px 0"}}>النسخة الثابتة ←</a>
    </div>
   </header>

   {worlds.length>0&&<nav aria-label="الرحلات المحفوظة" style={{display:"flex",gap:9,overflowX:"auto",padding:"1px 0 14px",alignItems:"center"}}>
    <span style={{flexShrink:0,color:"#e8b84c",fontSize:12}}>رحلات محفوظة</span>
    {worlds.map(w=><button key={w.id} disabled={loading} onClick={()=>restoreWorld(w)}
     style={{flexShrink:0,maxWidth:240,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",textAlign:"right",
      padding:"9px 12px",borderRadius:11,border:w.id===selectedId?"1px solid #e8b84c":"1px solid #ffffff30",
      background:w.id===selectedId?"#302816":"#101725",color:"#f8f3e8",cursor:"pointer"}}>{w.title}</button>)}
   </nav>}
   {archiveError&&<div role="alert" style={{padding:"10px 13px",border:"1px solid #e8b84c55",borderRadius:11,marginBottom:12,fontSize:12}}>{archiveError}</div>}
   <section style={{position:"relative",minHeight:"min(66vh,620px)",border:"1px solid #ffffff18",borderRadius:28,overflow:"hidden",background:"#090d16",boxShadow:"0 30px 80px #0008"}}>
    {image
     ?<img src={image} alt={result?.title||"مشهد مولد"} style={{width:"100%",height:"min(66vh,620px)",minHeight:460,objectFit:"cover",display:"block"}}/>
     :result
      ?<SemanticFallback experience={result}/>
      :<div style={{height:"min(66vh,620px)",minHeight:460,display:"grid",placeItems:"center",textAlign:"center",padding:30}}><div><div style={{fontSize:64}}>✦</div><h1 style={{fontSize:"clamp(30px,5vw,54px)",margin:"10px 0"}}>اسأل عن أي شيء</h1><p style={{opacity:.65,fontSize:18}}>السؤال يبني عالمًا بصريًا جديدًا. والسؤال التالي يعيد البحث داخل نفس العالم.</p></div></div>}

    {loading&&<div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",background:"#050811bb",backdropFilter:"blur(8px)",zIndex:3}}><div style={{textAlign:"center"}}><div style={{fontSize:52,color:"#e8b84c"}}>✦</div><b style={{fontSize:20}}>{followUp?"أطوّر نفس البحث…":"أبني العالم البصري…"}</b><p style={{opacity:.65}}>فهم السؤال ← بناء المعنى ← توليد المشهد</p></div></div>}

   </section>

   <form onSubmit={run} style={{display:"flex",gap:10,margin:"16px 0",flexWrap:"wrap"}}>
    <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder={followUp?"اسأل عن أي شيء تراه الآن…":"ما الذي تريد أن تفهمه؟"} style={{flex:"1 1 520px",padding:"18px 20px",borderRadius:18,border:"1px solid #ffffff22",background:"#0d1320",color:"white",fontSize:18,outline:"none"}}/>
    <button disabled={!ready||loading||!q.trim()} style={{padding:"0 26px",minHeight:58,borderRadius:18,border:0,background:"#e8b84c",color:"#111",fontWeight:800,fontSize:16,opacity:loading?.65:1}}>{loading?"يعمل…":followUp?"تعمّق داخل البحث":"ابدأ الفهم"}</button>
   </form>

   {followUp&&<div style={{fontSize:13,opacity:.6,margin:"-6px 4px 12px"}}>السؤال التالي يحتفظ بموضوع البحث وسياقه. استخدم «بحث جديد» عندما تريد الانتقال إلى موضوع آخر.</div>}
   {error&&<div style={{padding:14,border:"1px solid #ff6b6b55",borderRadius:14,color:"#ffb3b3",marginBottom:12}}>{error}</div>}
   {visualNotice&&<div role="status" style={{fontSize:12,opacity:.8,marginBottom:12}}>{visualNotice}</div>}

   {history.length>0&&<div style={{display:"flex",gap:10,overflowX:"auto",padding:"8px 0 20px"}}>
    {history.map((h,i)=><button key={h.id||i} disabled={loading} onClick={()=>{if(h.status==="complete"&&h.result){setImage(h.image);setResult(h.result);setQ("");setVisualNotice("");}}} style={{minWidth:190,maxWidth:190,textAlign:"right",padding:10,borderRadius:14,border:"1px solid #ffffff18",background:"#0c111b",color:"white"}}>
     {h.image?<img src={h.image} alt="" style={{width:"100%",height:90,objectFit:"cover",borderRadius:9}}/>:<div style={{width:"100%",height:90,borderRadius:9,display:"grid",placeItems:"center",background:"radial-gradient(circle,#25324b,#0a0f19)",color:"#e8b84c",fontSize:28}}>✦</div>}
     <small style={{display:"block",marginTop:8,lineHeight:1.4}}>{h.question}</small><small style={{display:"block",opacity:.55,marginTop:4}}>{h.status==="complete"?"صورة محفوظة":h.status==="processing"?"لم يكتمل":h.status==="visual-failed"?"لم يتغير المشهد":"تعذر التنفيذ"}</small>
    </button>)}
   </div>}
  </div>
 </main>;
}
