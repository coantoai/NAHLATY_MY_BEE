"use client";
import {useEffect,useMemo,useState} from "react";

const refs=[
 {src:"/heart-cinematic/heart-01.webp",label:"مرجع الشكل الخارجي"},
 {src:"/heart-cinematic/heart-02.webp",label:"مرجع الـ cutaway"}
];

export default function PremiumHeartVectorLab(){
 const [status,setStatus]=useState(null);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [result,setResult]=useState(null);
 const [zoom,setZoom]=useState(1);

 useEffect(()=>{
  fetch("/api/generate-vector",{cache:"no-store"})
   .then(r=>r.json()).then(setStatus)
   .catch(()=>setStatus({ok:false,configured:false}));
 },[]);

 const svgUrl=useMemo(()=>{
  if(!result?.svg)return "";
  return URL.createObjectURL(new Blob([result.svg],{type:"image/svg+xml"}));
 },[result?.svg]);

 useEffect(()=>()=>{if(svgUrl)URL.revokeObjectURL(svgUrl)},[svgUrl]);

 async function generate(){
  if(loading)return;
  setLoading(true);
  setError("");
  setResult(null);
  setZoom(1);
  try{
   const r=await fetch("/api/generate-vector",{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({preset:"heart"})
   });
   const payload=await r.json();
   if(!r.ok||!payload?.ok)throw new Error(payload?.error||"تعذر توليد الـSVG");
   setResult(payload);
  }catch(e){
   setError(String(e?.message||e));
  }finally{
   setLoading(false);
  }
 }

 return <main dir="rtl" style={styles.page}>
  <header style={styles.header}>
   <div>
    <p style={styles.kicker}>NAHLATY · PREMIUM VECTOR LAB</p>
    <h1 style={styles.h1}>القلب العلمي — فحص الأصل الحقيقي</h1>
    <p style={styles.sub}>هذه الصفحة لا تغيّر الـRuntime. وظيفتها فقط توليد أصل SVG واحد وفحصه قبل الربط الدلالي.</p>
   </div>
   <div style={{...styles.status,borderColor:status?.configured?"#2dd4bf":"#f59e0b"}}>
    <b>{status?.configured?"Recraft جاهز":"Recraft Token غير موجود"}</b>
    <span>GET check فقط · بدون توليد أو إنفاق</span>
   </div>
  </header>

  <section style={styles.grid}>
   <div style={styles.panel}>
    <div style={styles.panelHead}><b>المراجع الموجودة أصلًا في المشروع</b><span>يُستخدمان تلقائيًا كـStyle Reference</span></div>
    <div style={styles.refs}>
     {refs.map(x=><figure key={x.src} style={styles.figure}>
      <img src={x.src} alt={x.label} style={styles.refImg}/>
      <figcaption style={styles.caption}>{x.label}</figcaption>
     </figure>)}
    </div>
    <div style={styles.sourceBox}>
     <b>المصدر العلمي</b>
     <span>NHLBI — Heart anatomy</span>
     <span>NHLBI — Blood flow through the heart</span>
    </div>
   </div>

   <div style={styles.panel}>
    <div style={styles.panelHead}><b>التوليد</b><span>طلب واحد فقط عند الضغط</span></div>
    <button onClick={generate} disabled={loading||status?.configured===false} style={{...styles.button,opacity:(loading||status?.configured===false)? .55:1}}>
     {loading?"يتم التوليد…":"ولّد Premium SVG واحد"}
    </button>
    {status?.configured===false&&<p style={styles.warn}>المتبقي الوحيد لبدء التوليد: إضافة RECRAFT_API_TOKEN إلى Vercel Preview.</p>}
    {error&&<p style={styles.error}>{error}</p>}
    {result&&<div style={styles.metrics}>
     <span>Model: {result.billing?.model||"—"}</span>
     <span>Paths: {result.metrics?.pathCount??"—"}</span>
     <span>Groups: {result.metrics?.groupCount??"—"}</span>
     <span>Semantic ready: {result.semantic?.ready?"YES":"NO — review required"}</span>
    </div>}
   </div>
  </section>

  <section style={styles.stage}>
   <div style={styles.stageBar}>
    <b>Generated SVG</b>
    <div style={styles.zoom}>
     {[1,1.3,1.7].map(v=><button key={v} onClick={()=>setZoom(v)} style={styles.zoomBtn}>{v}×</button>)}
    </div>
   </div>
   <div style={styles.viewport}>
    {svgUrl?<img src={svgUrl} alt="Generated premium scientific heart vector" style={{...styles.generated,transform:`scale(${zoom})`}}/>:
     <div style={styles.empty}>لا يوجد SVG مولّد بعد.</div>}
   </div>
  </section>
 </main>;
}

const styles={
 page:{minHeight:"100vh",background:"#030913",color:"#e8f1f7",padding:"32px",fontFamily:"Arial,sans-serif"},
 header:{maxWidth:1280,margin:"0 auto 24px",display:"flex",gap:24,justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap"},
 kicker:{fontSize:12,letterSpacing:1.4,color:"#69c9f0",margin:"0 0 8px"},
 h1:{fontSize:"clamp(28px,4vw,52px)",margin:0},
 sub:{maxWidth:760,color:"#9fb2bf",lineHeight:1.7},
 status:{display:"flex",flexDirection:"column",gap:5,padding:"14px 16px",border:"1px solid",borderRadius:12,background:"#08131e"},
 grid:{maxWidth:1280,margin:"0 auto 24px",display:"grid",gridTemplateColumns:"minmax(0,1.4fr) minmax(280px,.6fr)",gap:18},
 panel:{background:"#07111c",border:"1px solid #16324a",borderRadius:16,padding:16},
 panelHead:{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",marginBottom:14,color:"#cfe8f5",fontSize:13},
 refs:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},
 figure:{margin:0,background:"#02070d",borderRadius:12,overflow:"hidden",border:"1px solid #14283a"},
 refImg:{width:"100%",aspectRatio:"4/3",objectFit:"cover",display:"block"},
 caption:{padding:10,fontSize:12,color:"#a9c5d5"},
 sourceBox:{marginTop:12,display:"grid",gap:6,padding:12,borderRadius:10,background:"#091b29",fontSize:12,color:"#a9c5d5"},
 button:{width:"100%",padding:"16px 18px",border:0,borderRadius:12,background:"#5ed4ff",color:"#031018",fontWeight:800,fontSize:16,cursor:"pointer"},
 warn:{color:"#f6c56f",lineHeight:1.6,fontSize:13},
 error:{color:"#ff8f8f",lineHeight:1.6,fontSize:13},
 metrics:{display:"grid",gap:8,marginTop:14,padding:12,borderRadius:10,background:"#071925",fontSize:12,color:"#b8d1df"},
 stage:{maxWidth:1280,margin:"0 auto",background:"#050c14",border:"1px solid #17334a",borderRadius:18,overflow:"hidden"},
 stageBar:{height:54,padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #17334a"},
 zoom:{display:"flex",gap:6},
 zoomBtn:{background:"#0b1d2b",color:"#cae7f4",border:"1px solid #1d4560",borderRadius:8,padding:"7px 10px",cursor:"pointer"},
 viewport:{height:"min(64vh,720px)",overflow:"auto",display:"grid",placeItems:"center",background:"radial-gradient(circle at 50% 45%,#10293c 0,#050b12 55%,#02060a 100%)"},
 generated:{maxWidth:"88%",maxHeight:"88%",transformOrigin:"center",transition:"transform .2s ease"},
 empty:{color:"#627c8d"},
};
