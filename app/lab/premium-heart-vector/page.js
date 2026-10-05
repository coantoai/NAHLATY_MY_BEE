"use client";
import {useCallback,useEffect,useState} from "react";
import Home from "../../page";
import "./premium-heart.css";

export default function PremiumHeartVectorLab(){
 const [result,setResult]=useState(null),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 const [bpm,setBpm]=useState(60),[labels,setLabels]=useState(true),[vessels,setVessels]=useState(true),[resetKey,setResetKey]=useState(0);
 const load=useCallback(async(signal)=>{
  setLoading(true);setError("");
  try{
   const response=await fetch("/api/generate-vector?preset=heart",{signal,cache:"no-store"});
   const payload=await response.json();
   if(!response.ok||!payload.ok||!payload.experience)throw new Error(payload.error||"تعذر تحميل القلب");
   setResult(payload);
  }catch(e){if(e.name!=="AbortError")setError(e.message||"تعذر تحميل القلب")}
  finally{if(!signal?.aborted)setLoading(false)}
 },[]);
 useEffect(()=>{const controller=new AbortController();load(controller.signal);return()=>controller.abort()},[load]);
 return <main className="premiumHeartLab" dir="rtl">
  <header className="heartLabHeader">
   <div><p>NAHLATY · SCIENTIFIC VECTOR</p><h1>القلب — استكشف التفاصيل</h1><span>أصل NIH / NIAID العلمي، داخل تفاعل نحلتي الحالي.</span></div>
   <a href="https://bioart.niaid.nih.gov/bioart/228" target="_blank" rel="noreferrer">Human Heart · Public Domain ↗</a>
  </header>
  {loading&&!result&&<div className="heartLoad" role="status">يتم تحميل القلب…</div>}
  {error&&<div className="heartLoad" role="alert">{error}<button onClick={()=>load()}>إعادة المحاولة</button></div>}
  {result&&<>
   <div className="heartLabToolbar">
    <label>النبض التعليمي <input aria-label="BPM" type="range" min="40" max="180" value={bpm} onChange={e=>setBpm(Number(e.target.value))}/><output>{bpm} BPM</output></label>
    <button aria-pressed={labels} onClick={()=>setLabels(v=>!v)}>{labels?"إخفاء التسميات":"إظهار التسميات"}</button>
    <button aria-pressed={vessels} onClick={()=>setVessels(v=>!v)}>{vessels?"إخفاء الأوعية":"إظهار الأوعية"}</button>
    <button onClick={()=>{setBpm(60);setLabels(true);setVessels(true);setResetKey(v=>v+1)}}>إعادة الضبط</button>
   </div>
   <div className={"heartExistingRuntime"+(labels?"":" hideHeartLabels")}>
    <Home key={resetKey} initialExperience={result.experience} nativeBpm={bpm} nativeHiddenIds={vessels?[]:["heart.upperVessels","heart.sideVessels","heart.lowerVessels"]}/>
   </div>
   <aside className="heartScientificNote">هذا الأصل منظر خارجي؛ الحجرات الأربع والصمامات الأربع غير ظاهرة. لا تُعرض مسارات دم على أعضاء غير متحققة. النبض المعروض توضيحي، وليس محاكاة طبية. <a href="https://www.nhlbi.nih.gov/health/heart/anatomy" target="_blank" rel="noreferrer">المرجع العلمي ↗</a></aside>
   <footer className="heartAssetCredit">Courtesy of NIAID · Ryan Kissinger · {result.metrics.pathCount} native paths · <a href="/heart-vector/niaid-heart.svg" download>تنزيل SVG القابل للتحرير</a></footer>
  </>}
 </main>;
}
