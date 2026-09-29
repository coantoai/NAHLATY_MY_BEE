"use client";

import {useCallback,useEffect,useRef,useState} from "react";
import "./cloud-journey.css";

const ART="/lab/cloud-journey/cloud.png";
const scenes=[
 {id:"overview",title:"ما هي السحب الركامية؟",micro:"مشهد كامل",detail:"سحابة تنمو عموديًا من هواء رطب صاعد، وقد تتطوّر إلى سحابة ركامية مزنية.",fx:51,fy:46,z:1,kind:"none",chip:"01 / البداية",palette:"blue"},
 {id:"surface",title:"تسخين السطح",micro:"مصدر الطاقة",detail:"تسخّن الشمس سطح الأرض أو البحر؛ وهذا يساعد الهواء القريب على اكتساب حرارة.",fx:21,fy:82,z:1.68,kind:"heat",chip:"02 / الحرارة",palette:"warm"},
 {id:"updraft",title:"صعود الهواء الرطب",micro:"اتّجاه الحركة",detail:"عندما يصبح الهواء أدفأ من محيطه، يمكنه الصعود حاملًا بخار ماء غير مرئي.",fx:42,fy:68,z:1.47,kind:"none",chip:"03 / الصعود",palette:"warm"},
 {id:"condensation",title:"تكوّن القطرات",micro:"من هواء إلى غيم",detail:"مع الصعود يتمدّد الهواء ويبرد. إذا بلغ الإشباع، يتكاثف بخار الماء إلى قطرات دقيقة.",fx:47,fy:48,z:1.64,kind:"none",chip:"04 / التكاثف",palette:"ice"},
 {id:"growth",title:"النمو الرأسي للسحابة",micro:"تضخّم البرج",detail:"يستمر نمو البرج السحابي ما دام الصعود وتغذية السحابة بالرطوبة مناسبين.",fx:50,fy:31,z:1.48,kind:"none",chip:"05 / النمو",palette:"blue"},
 {id:"anvil",title:"انتشار السندان",micro:"الحد الأعلى",detail:"في السحابة الركامية المزنية، قد ينتشر أعلى السحابة أفقيًا قرب طبقة تحدّ من صعودها.",fx:69,fy:14,z:1.61,kind:"none",chip:"06 / السندان",palette:"ice"},
 {id:"rain",title:"هطول الأمطار",micro:"داخل السحابة",detail:"تنمو القطرات أو بلورات الجليد، وحين تكبر بما يكفي تسقط كهطول.",fx:69,fy:65,z:1.61,kind:"rain",chip:"07 / الهطول",palette:"ice"},
 {id:"lightning",title:"البرق والرعد",micro:"تفريغ كهربائي",detail:"في العواصف الرعدية ينشأ انفصال للشحنات؛ البرق تفريغ كهربائي، والرعد صوت تمدّد الهواء السريع.",fx:68,fy:57,z:1.73,kind:"flash",chip:"08 / الطاقة",palette:"violet"}
];

const bound=(v,min,max)=>Math.max(min,Math.min(max,v));
function cameraStyle(s,extra){
 const z=s.z+(extra?0.42:0);
 const x=bound(50-s.fx*z,100-100*z,0);
 const y=bound(50-s.fy*z,100-100*z,0);
 return {transform:"translate("+x+"%, "+y+"%) scale("+z+")"};
}
function Effect({kind}){
 if(kind==="none")return null;
 return <svg className={"cloud-effect cloud-effect-"+kind} viewBox="0 0 100 58" preserveAspectRatio="none" aria-hidden="true">
  <defs>
   <linearGradient id="warm-air" x1="0" x2="0" y1="1" y2="0"><stop stopColor="#ff9b36" stopOpacity="0"/><stop offset=".48" stopColor="#ffad49" stopOpacity=".68"/><stop offset="1" stopColor="#ffe0a0" stopOpacity=".18"/></linearGradient>
   <linearGradient id="cool-air" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#d8f6ff" stopOpacity=".15"/><stop offset=".65" stopColor="#8bdcff" stopOpacity=".82"/><stop offset="1" stopColor="#c8f2ff" stopOpacity=".15"/></linearGradient>
   <filter id="glow"><feGaussianBlur stdDeviation=".8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  {kind==="heat"&&<g className="heat-haze">
   {[0,1,2,3].map(i=><path key={i} d={"M "+(24+i*5)+" 57 C "+(21+i*5)+" 51 "+(30+i*4)+" 47 "+(27+i*5)+" 41 C "+(24+i*5)+" 35 "+(31+i*4)+" 31 "+(30+i*4)+" 25"} fill="none" stroke="url(#warm-air)" strokeWidth=".72" strokeLinecap="round" style={{animationDelay:(i*.27)+"s"}}/> )}
  </g>}
  {kind==="rain"&&Array.from({length:29},(_,i)=>{const x=52+(i%10)*2.4,y=30+Math.floor(i/10)*6.5;return <path key={i} className="rain-stroke" style={{animationDelay:(i%7)*.17+"s"}} d={"M "+x+" "+y+" l -1.1 6"} stroke="url(#cool-air)" strokeWidth=".54" strokeLinecap="round" />;})}
  {kind==="flash"&&<g className="flash-pulse"><path d="M 65 12 L 55 29 L 64 29 L 56 47 L 77 22 L 66 24 L 74 12 Z" fill="#ffffff" stroke="#aff2ff" strokeWidth=".75" strokeLinejoin="round" filter="url(#glow)"/><path d="M 35 19 L 31 27 L 38 26 L 30 39" fill="none" stroke="#e8d8ff" strokeWidth=".7" filter="url(#glow)"/></g>}
 </svg>;
}

export default function CloudJourneyDemo(){
 const [selected,setSelected]=useState(0);
 const [deepZoom,setDeepZoom]=useState(false);
 const [motionKey,setMotionKey]=useState(0);
 const [expanded,setExpanded]=useState(false);
 const [ready,setReady]=useState(false);
 const cards=useRef([]);
 const touchStart=useRef(null);
 const scene=scenes[selected];
 const choose=useCallback(index=>{
  const target=(index+scenes.length)%scenes.length;
  setSelected(target);setDeepZoom(false);setMotionKey(k=>k+1);
 },[]);
 useEffect(()=>{setReady(true)},[]);
 useEffect(()=>{cards.current[selected]?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"})},[selected]);
 useEffect(()=>{
  const listener=e=>{
   if(e.target?.tagName==="INPUT"||e.target?.tagName==="TEXTAREA")return;
   if(e.key==="ArrowLeft"){e.preventDefault();choose(selected+1)}
   if(e.key==="ArrowRight"){e.preventDefault();choose(selected-1)}
  };
  window.addEventListener("keydown",listener);return()=>window.removeEventListener("keydown",listener);
 },[selected,choose]);
 const onTouchStart=e=>{touchStart.current=e.touches?.[0]?.clientX??null};
 const onTouchEnd=e=>{
  if(touchStart.current==null)return;
  const diff=(e.changedTouches?.[0]?.clientX??touchStart.current)-touchStart.current;
  touchStart.current=null;
  if(Math.abs(diff)>55)choose(selected+(diff>0?1:-1));
 };
 return <main className="cloud-app" dir="rtl">
  <header className="cloud-header">
   <div className="cloud-brand"><div className="cloud-bee" aria-hidden="true">🐝</div><div><b>نحلتي</b><small>من الفضول إلى الفهم</small></div></div>
   <div className="cloud-header-center"><span className="cloud-spark">✦</span><span>كيف تتطوّر السحب الركامية؟</span><span className="cloud-model">تجربة بصرية</span></div>
   <a className="cloud-exit" href="/living-engine" aria-label="العودة إلى نحلتي">↗ <span>المحرك الأساسي</span></a>
  </header>
  <div className="cloud-wrap">
   <div className="cloud-intro"><div><span className="cloud-eyebrow">تجربة المشهد الحي · 08 مراحل</span><h1>ادخل إلى قلب السحابة</h1></div><p>اختَر صورة من الشريط. يتغيّر منظور المشهد ويُضاء الجزء الذي يشرح المرحلة — بلا انتقال إلى صفحة ثانية.</p></div>
   <section className="cloud-stage" aria-label="المشهد التعليمي التفاعلي" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
    <div className="cloud-stage-bg" style={{backgroundImage:"url("+ART+")",...cameraStyle(scene,deepZoom)}} />
    <div className={"cloud-grade cloud-grade-"+scene.palette}/>
    <div key={motionKey} className="cloud-motion"><Effect kind={scene.kind}/></div>
    <div className="cloud-vignette"/>
    <div className="cloud-stage-top">
     <div className="cloud-breadcrumb"><span className="cloud-orbit">◈</span><span>رحلة تشكّل السحاب</span><span className="cloud-breadcrumb-sep">/</span><strong>{scene.chip}</strong></div>
     <div className="cloud-live"><span className="cloud-live-dot"/> منظور تفاعلي</div>
    </div>
    <div className="cloud-stage-side">
     <button type="button" title="المرحلة السابقة" className="cloud-round" onClick={()=>choose(selected-1)}>›</button>
     <button type="button" title="المرحلة التالية" className="cloud-round" onClick={()=>choose(selected+1)}>‹</button>
    </div>
    <div className="cloud-stage-bottom">
     <div className="cloud-explain">
      <div className="cloud-index">{String(selected+1).padStart(2,"0")} <span>/ 08</span></div>
      <div><span className="cloud-micro">{scene.micro}</span><h2>{scene.title}</h2><p>{scene.detail}</p></div>
     </div>
     <div className="cloud-tools">
      <button type="button" className={deepZoom?"cloud-pill active":"cloud-pill"} onClick={()=>setDeepZoom(z=>!z)} aria-pressed={deepZoom}><span className="cloud-ico">⌕</span> {deepZoom?"رجوع":"قرّب"}</button>
      <button type="button" className="cloud-pill" onClick={()=>setMotionKey(k=>k+1)}><span className="cloud-ico">↻</span> أعد الحركة</button>
     </div>
    </div>
   </section>
   <div className="cloud-strip-head"><div><span className="cloud-eyebrow">STORYBOARD</span><h3>استكشف المراحل بنفسك</h3></div><span className="cloud-swipe">اسحب الصور أو اضغط عليها ←</span></div>
   <nav className="cloud-gallery" aria-label="صور مراحل تشكّل السحاب">
    {scenes.map((s,i)=><button type="button" ref={n=>{cards.current[i]=n}} aria-current={i===selected?"step":undefined} aria-label={"اعرض المرحلة "+(i+1)+": "+s.title} onClick={()=>choose(i)} key={s.id} className={"cloud-card "+(i===selected?"chosen":"")}>
      <div className="cloud-thumb"><div className="cloud-thumb-img" style={{backgroundImage:"url("+ART+")",...cameraStyle(s,false)}}/><span className="cloud-card-num">{i+1}</span><span className="cloud-card-arrow" aria-hidden="true">↗</span></div>
      <span className="cloud-card-title">{s.title}</span>
     </button>)}
   </nav>
   <div className="cloud-footer"><div className="cloud-track" aria-label={"المرحلة "+(selected+1)+" من 8"}><div className="cloud-track-fill" style={{width:((selected+1)/scenes.length*100)+"%"}}/></div><p>النصوص والحركات هنا وسائل توضيح. التصوير الأساسي ثابت؛ الانتقال بين ثماني صور مولّدة مستقلّة لم يُفعّل في هذه التجربة بعد.</p><button type="button" className="cloud-details-btn" aria-expanded={expanded} onClick={()=>setExpanded(x=>!x)}>{expanded?"إخفاء تفاصيل التجربة":"ما الذي يعمل في هذه النسخة؟"} <span>⌄</span></button></div>
   {expanded&&<div className="cloud-details"><b>ما هو فعلي الآن؟</b> اختيار البطاقات، تغيير الإطار والتكبير، الحركة البصرية المرتبطة بالمرحلة، التنقّل والأسهم والسحب على الهاتف. <b>وما زال تجريبيًا؟</b> كل المراحل مبنيّة من لوحة أصلية واحدة، لا ثماني صور مولّدة منفصلة؛ ولا تدّعي هذه النسخة أن طبقات الحركة ناتجة تلقائيًا عن فهم Qwen.</div>}
  </div>
 </main>;
}
