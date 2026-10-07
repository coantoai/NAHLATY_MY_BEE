"use client";
import {useCallback,useEffect,useState} from "react";
import Home from "../../page";
import {cardiacOutputLitersPerMinute} from "../../lib/heartSemanticVector";
import "./premium-heart.css";

export default function PremiumHeartVectorLab(){
 const [result,setResult]=useState(null),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 const [bpm,setBpm]=useState(60),[labels,setLabels]=useState(true),[vessels,setVessels]=useState(true),[resetKey,setResetKey]=useState(0);
 const [view,setView]=useState("cutaway"),[flow,setFlow]=useState(true);
 const load=useCallback(async(signal)=>{
  setLoading(true);setError("");
  try{
   const response=await fetch("/api/generate-vector?preset=heart&view="+view,{signal,cache:"no-store"});
   const payload=await response.json();
   if(!response.ok||!payload.ok||!payload.experience)throw new Error(payload.error||"تعذر تحميل القلب");
   setResult(payload);
  }catch(e){if(e.name!=="AbortError")setError(e.message||"تعذر تحميل القلب")}
  finally{if(!signal?.aborted)setLoading(false)}
 },[view]);
 useEffect(()=>{const controller=new AbortController();setResult(null);load(controller.signal);return()=>controller.abort()},[load]);
 return <main className="premiumHeartLab" dir="rtl">
  <header className="heartLabHeader">
   <div><p>NAHLATY · SCIENTIFIC VECTOR</p><h1>القلب — استكشف التفاصيل</h1><span>تشريح ومسار دم داخل تفاعل نحلتي الحالي؛ مرجع NIH الخارجي محفوظ.</span></div>
   <a href="https://bioart.niaid.nih.gov/bioart/228" target="_blank" rel="noreferrer">Human Heart · Public Domain ↗</a>
  </header>
  <label className="heartViewChoice">المنظر <select aria-label="Heart view" value={view} onChange={e=>setView(e.target.value)}><option value="cutaway">المقطع التعليمي — التشريح ومسار الدم</option><option value="exterior">مرجع NIH / NIAID — المنظر الخارجي</option></select></label>
  {loading&&!result&&<div className="heartLoad" role="status">يتم تحميل القلب…</div>}
  {error&&<div className="heartLoad" role="alert">{error}<button onClick={()=>load()}>إعادة المحاولة</button></div>}
  {result&&<>
   <div className="heartLabToolbar">
    <label>النبض التعليمي <input aria-label="BPM" type="range" min="40" max="180" value={bpm} onChange={e=>setBpm(Number(e.target.value))}/><output>{bpm} BPM</output></label>
    <button aria-pressed={labels} onClick={()=>setLabels(v=>!v)}>{labels?"إخفاء التسميات":"إظهار التسميات"}</button>
    <button aria-pressed={vessels} onClick={()=>setVessels(v=>!v)}>{vessels?"إخفاء الأوعية":"إظهار الأوعية"}</button>
    {view==="cutaway"&&<button aria-pressed={flow} onClick={()=>setFlow(v=>!v)}>{flow?"إخفاء مسار الدم":"إظهار مسار الدم"}</button>}
    <button onClick={()=>{setBpm(60);setLabels(true);setVessels(true);setFlow(true);setResetKey(v=>v+1)}}>إعادة الضبط</button>
   </div>
   {view==="cutaway"&&<div className="heartDynamicValues"><span>النتاج القلبي التعليمي <output data-testid="cardiac-output">{cardiacOutputLitersPerMinute(bpm).toFixed(1)} L/min</output></span><small>HR × 70 mL ÷ 1000؛ حجم ضربة ثابت للتوضيح، وليس قياسًا للمستخدم.</small></div>}
   <div className={"heartExistingRuntime"+(labels?"":" hideHeartLabels")+(!flow||!vessels?" hideHeartFlow":"")}>
    <Home key={view+resetKey} initialExperience={result.experience} nativeBpm={bpm} nativeHiddenIds={vessels?[]:view==="exterior"?["heart.upperVessels","heart.sideVessels","heart.lowerVessels"]:["heart.venaCava","heart.pulmonaryArtery","heart.pulmonaryVeins","heart.aorta"]}/>
   </div>
   <aside className="heartScientificNote">{view==="cutaway"?"المقطع رسم تعليمي أصلي: حجرات وصمامات ومسار الدورة الطبيعية. الأوردة الرئوية تعيد دمًا مؤكسجًا إلى الأذين الأيسر. الأحمر والأزرق اصطلاح بصري؛ الدم ليس أزرق. الرسم وتوقيت الصمامات تقريبيان، وليس محاكاة طبية أو تشريحًا مقاسًا. تحريك الأجزاء يوقف عرض مسار الدم حتى إعادة المشهد لتجنب وصلات غير صحيحة.":"أصل NIH منظر خارجي؛ لا تظهر فيه الحجرات أو الصمامات الداخلية، ولا تُنسب إليه تلك البنى بالتخمين."} <a href="https://www.nhlbi.nih.gov/health/heart/anatomy" target="_blank" rel="noreferrer">المرجع العلمي ↗</a></aside>
   <footer className="heartAssetCredit">{view==="cutaway"?"NAHLATY · Original educational cutaway. Exterior reference: NIAID / Ryan Kissinger.":"Courtesy of NIAID · Ryan Kissinger · Public Domain"} · {result.metrics.pathCount} native paths · <a href={view==="cutaway"?"/heart-vector/heart-science.svg":"/heart-vector/niaid-heart.svg"} download>تنزيل SVG القابل للتحرير</a></footer>
  </>}
 </main>;
}
