"use client";

import {useCallback,useEffect,useRef,useState} from "react";
import "./cloud-journey.css";

const ART="/lab/cloud-journey/cloud.png";
const scenes=[
 {id:"overview",title:"ما هي السحب الركامية؟",micro:"مشهد كامل",detail:"سحابة تنمو عموديًا من هواء رطب صاعد، وقد تتطوّر إلى سحابة ركامية مزنية.",fx:51,fy:46,z:1,kind:"none",chip:"01 / البداية",palette:"blue"},
 {id:"surface",title:"تسخين السطح",micro:"مصدر الطاقة",detail:"تسخّن الشمس سطح الأرض أو البحر؛ وهذا يساعد الهواء القريب على اكتساب حرارة.",fx:21,fy:82,z:1.68,kind:"sun",chip:"02 / الحرارة",palette:"warm"},
 {id:"updraft",title:"صعود الهواء الرطب",micro:"اتّجاه الحركة",detail:"عندما يصبح الهواء أدفأ من محيطه، يمكنه الصعود حاملًا بخار ماء غير مرئي.",fx:42,fy:68,z:1.47,kind:"rise",chip:"03 / الصعود",palette:"warm"},
 {id:"condensation",title:"تكوّن القطرات",micro:"من هواء إلى غيم",detail:"مع الصعود يتمدّد الهواء ويبرد. إذا بلغ الإشباع، يتكاثف بخار الماء إلى قطرات دقيقة.",fx:47,fy:48,z:1.64,kind:"drops",chip:"04 / التكاثف",palette:"ice"},
 {id:"growth",title:"النمو الرأسي للسحابة",micro:"تضخّم البرج",detail:"يستمر نمو البرج السحابي ما دام الصعود وتغذية السحابة بالرطوبة مناسبين.",fx:50,fy:31,z:1.48,kind:"growth",chip:"05 / النمو",palette:"blue"},
 {id:"anvil",title:"انتشار السندان",micro:"الحد الأعلى",detail:"في السحابة الركامية المزنية، قد ينتشر أعلى السحابة أفقيًا قرب طبقة تحدّ من صعودها.",fx:69,fy:14,z:1.61,kind:"anvil",chip:"06 / السندان",palette:"ice"},
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
   <linearGradient id="warm-air" x1="0" x2="0" y1="1" y2="0"><stop stopColor="#ffb248" stopOpacity="0"/><stop offset=".45" stopColor="#ffbb5b" stopOpacity=".94"/><stop offset="1" stopColor="#fff2ad" stopOpacity=".6"/></linearGradient>
   <linearGradient id="cool-air" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#bceeff" stopOpacity=".1"/><stop offset=".6" stopColor="#6fd0ff" stopOpacity=".95"/><stop offset="1" stopColor="#b3e9ff" stopOpacity=".2"/></linearGradient>
   <filter id="glow"><feGaussianBlur stdDeviation="1.05" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  {kind==="sun"&&<>
   <circle cx="17" cy="29" r="6.5" fill="#ffcd69" opacity=".65" filter="url(#glow)"/>
   {[0,1,2,3,4].map(i=><path key={i} d={"M "+(11+i*4)+" 33 Q "+(15+i*3)+" 41 "+(24+i*3)+" 46"} fill="none" stroke="url(#warm-air)" strokeWidth="1.2" strokeLinecap="round" className="glow-flow"/>)}
  </>}
  {kind==="rise"&&[0,1,2].map(i=><g key={i} className="glow-flow" style={{animationDelay:(i*.32)+"s"}}>
   <path d={"M "+(29+i*9)+" 55 Q "+(20+i*9)+" 40 "+(36+i*4)+" 29 Q "+(39+i*4)+" 25 "+(39+i*5)+" 18"} fill="none" stroke="url(#warm-air)" strokeWidth="1.35" strokeLinecap="round" filter="url(#glow)"/>
   <path d={"M "+(35+i*5)+" 21 l "+(4)+ " -4 l "+(-1)+" 6"} fill="none" stroke="#ffdb87" strokeWidth=".8" strokeLinecap="round" strokeLinejoin="round"/>
  </g>)}
  {kind==="drops"&&<g filter="url(#glow)">{Array.from({length:16},(_,i)=>{
   const x=34+(i%8)*4.3,y=18+Math.floor(i/8)*6.5;
   return <g className="drop-pulse" key={i} style={{animationDelay:(i*.12)+"s"}}><circle cx={x} cy={y} r={.46+(i%3)*.1} fill="#c6f6ff"/><circle cx={x+.7} cy={y-.7} r=".35" fill="#5dcbff" opacity=".8"/></g>;
  })}</g>}
  {kind==="growth"&&[0,1,2].map(i=><g key={i} className="glow-flow" style={{animationDelay:(i*.25)+"s"}}>
   <path d={"M "+(39+i*9)+" 46 Q "+(33+i*9)+" 25 "+(42+i*9)+" 11"} fill="none" stroke="url(#cool-air)" strokeWidth="1.3" strokeLinecap="round"/>
   <path d={"M "+(39+i*9)+" 15 l "+(3)+" -5 l "+(2)+" 5"} fill="none" stroke="#b7f4ff" strokeWidth=".9"/>
  </g>)}
  {kind==="anvil"&&<g className="glow-flow"><path d="M 46 13 Q 57 4 76 8" stroke="url(#cool-air)" strokeWidth="1.55" fill="none"/><path d="M 73 5 l 5 3 l -5 3" stroke="#b6e9ff" strokeWidth="1" fill="none"/><path d="M 42 15 Q 32 8 19 11" stroke="url(#cool-air)" strokeWidth="1.3" fill="none"/><path d="M 21 8 l -4 3 l 4 3" stroke="#b6e9ff" strokeWidth="1" fill="none"/></g>}
  {kind==="rain"&&Array.from({length:29},(_,i)=>{
   const x=52+(i%10)*2.4,y=30+Math.floor(i/10)*6.5;
   return <path key={i} className="rain-stroke" style={{animationDelay:(i%7)*.17+"s"}} d={"M "+x+" "+y+" l -1.1 6"} stroke="url(#cool-air)" strokeWidth=".54" strokeLinecap="round" />;
  })}
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
