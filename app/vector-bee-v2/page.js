"use client";
import {useState} from "react";
import {usePollinationFlight} from "../components/usePollinationFlight.js";
import Bee from "../components/PollinationBeeVector.js";
import {interpretPollinationPrompt} from "../../lib/hybrid-pollination.js";
import "./style.css";

const angles=Array.from({length:11},(_,i)=>i*360/11);
const anchors={first:{x:263,y:305},second:{x:745,y:307}};
const phases=["الاقتراب","جمع اللقاح","الانتقال","نقل اللقاح","رحلة العودة"];
function Flower({x,y,pink,active,onClick}) {
 return <g transform={"translate("+x+" "+y+")"} className="v2-plant" onClick={onClick}
    role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onClick();}}}
    aria-label={pink?"تفحص الزهرة الأولى":"تفحص الزهرة الثانية"}>
   <g transform="translate(0 48)">
    <path d="M0 0 Q-6 145 20 267" stroke="#335740" strokeWidth="13" fill="none" strokeLinecap="round"/>
    <path d="M0 70 Q-120 -5 -136 89 Q-56 125 7 103Z" fill="#45684e" stroke="#82a578" strokeOpacity=".4" strokeWidth="2"/>
    <path d="M8 144 Q126 53 156 149 Q97 206 7 174Z" fill="#345d4a" stroke="#89a674" strokeOpacity=".4" strokeWidth="2"/>
   </g>
   <g className={active?"v2-flower-active":""}>
    <circle r="110" fill={pink?"#eeaecc":"#f6b788"} opacity=".07"/>
    {angles.map((a,i)=><g key={i} transform={"rotate("+a+")"}>
     <path d={"M-17 -6 Q-56 -69 -23 -106 Q0 -125 22 -107 Q57 -68 18 -6Z"}
       fill={pink?"url(#petalPink)":"url(#petalPeach)"} opacity=".96"
       stroke={pink?"#ffd7dd":"#ffe7d4"} strokeWidth="1.3"/>
     <path d="M0 -9 Q-10 -43 0 -102 M0 -31 Q-15 -55 -25 -60 M0 -31 Q20 -54 26 -63"
       stroke="#fff1ef" strokeWidth="1.2" opacity=".36" fill="none"/>
    </g>)}
    <circle r="48" fill="url(#v2Pollen)" stroke="#ffde84" strokeWidth="3"/>
    <circle r="24" fill="#a66530" opacity=".57"/>
    {angles.map((a,i)=><g key={i} transform={"rotate("+a+")"}>
      <path d="M0 -9 V-45" stroke="#eec76f" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cy="-43" rx="5" ry="8" fill="#ffe27c"/>
    </g>)}
    {active&&<circle r="109" stroke="#fff4b1" strokeOpacity=".9" strokeWidth="2"
      fill="none" className="v2-flower-highlight"/>}
   </g>
  </g>;
}

export default function VectorBeeV2(){
 const motion=usePollinationFlight(anchors);
 const [focus,setFocus]=useState("");
 const [q,setQ]=useState("");
 const [notice,setNotice]=useState("");
 const detail=focus==="bee"?"راقب موضع اللقاح على جسم النحلة":
  focus==="first"?"حبوب اللقاح على أسدية الزهرة":
  focus==="second"?(motion.transfer?"وصل اللقاح إلى الميسم":"لم يصل اللقاح إلى الميسم"):
  motion.blocked&&motion.phase>=3?"غيّرنا الشرط: منع وصول اللقاح":
  ["النحلة تقترب من الزهرة","تلتقط حبوب اللقاح","تنقل الحبوب إلى زهرة أخرى",
   "بعض الحبوب تصل إلى الميسم","تعود النحلة؛ وتبقى الحبوب المنقولة"][motion.phase];
 function submit(e) {
  e.preventDefault();
  const intent=interpretPollinationPrompt(q);
  if(intent==="BLOCK_TRANSFER")motion.setBlocked(true);
  else if(intent==="ALLOW_TRANSFER")motion.setBlocked(false);
  else if(intent==="RESET")motion.reset();
  else setNotice("هذه تجربة محدودة. جرّب: ماذا لو لم ينتقل اللقاح؟");
  if(intent){setNotice("");setFocus("");setQ("");}
 }
 return <main className="v2-page" dir="rtl">
  <header className="v2-heading"><div><small>نحلتي • تجربة رقم ١ / فيكتور كامل</small>
   <h1>رقصة التلقيح</h1></div><span>عالم واحد • حركة تلقائية • لا تكاليف توليد</span></header>
  <section className="v2-world" aria-label="مشهد فيكتور متحرك تلقائيًا">
   <svg viewBox="0 0 1000 600" className="v2-scene" role="img" aria-label="نحلة تتجه تلقائيًا بين زهرتين وتتفاعل مع منع انتقال اللقاح">
    <defs>
      <linearGradient id="v2Sky" x2="0" y2="1"><stop stopColor="#11152a"/><stop offset=".45" stopColor="#445161"/><stop offset="1" stopColor="#294e42"/></linearGradient>
      <radialGradient id="v2Sun"><stop stopColor="#fff2bb" stopOpacity=".64"/><stop offset=".5" stopColor="#eab773" stopOpacity=".22"/><stop offset="1" stopColor="#eab773" stopOpacity="0"/></radialGradient>
      <radialGradient id="v2Pollen"><stop stopColor="#ffec94"/><stop offset=".65" stopColor="#d6a649"/><stop offset="1" stopColor="#85502a"/></radialGradient>
      <linearGradient id="petalPink" x1="0" y1="0" x2=".6" y2="1"><stop stopColor="#f6cee0"/><stop offset=".43" stopColor="#dd98bf"/><stop offset="1" stopColor="#8e4674"/></linearGradient>
      <linearGradient id="petalPeach" x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#fff1da"/><stop offset=".4" stopColor="#e6b197"/><stop offset="1" stopColor="#98596e"/></linearGradient>
      <linearGradient id="wingGlaze" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f2ffff" stopOpacity=".94"/><stop offset="1" stopColor="#97d6e2" stopOpacity=".37"/></linearGradient>
      <radialGradient id="beeVelvet"><stop stopColor="#ffe3a3"/><stop offset=".6" stopColor="#d39132"/><stop offset="1" stopColor="#4a2e1f"/></radialGradient>
      <radialGradient id="beeHead"><stop stopColor="#9a6843"/><stop offset=".7" stopColor="#3d2e27"/><stop offset="1" stopColor="#201f21"/></radialGradient>
      <filter id="v2Blur"><feGaussianBlur stdDeviation="22"/></filter>
      <filter id="v2Glow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <g id="self-contained-vector-world">
      <rect width="1000" height="600" fill="url(#v2Sky)"/>
      <circle cx="672" cy="165" r="420" fill="url(#v2Sun)"/>
      <g filter="url(#v2Blur)" opacity=".45">{Array.from({length:14},(_,i)=>
        <circle key={i} cx={(i*187)%1040} cy={55+(i*61)%390} r={25+i%5*11}
         fill={i%3?"#ffca96":"#d3e3b1"} opacity=".32"/>)}</g>
      <path d="M0 476 Q225 419 471 475 T1000 443 V600 H0Z" fill="#365943"/>
      <path d="M0 520 Q173 469 367 527 T750 499 T1000 517 V600 H0Z" fill="#142e29"/>
      {Array.from({length:24},(_,i)=><path key={i} d={"M"+(i*46)+" 600 Q"+(i*44-30)+" 533 "+(i*44+10)+" "+(464+i%4*18)}
        stroke={i%2?"#719066":"#67804a"} strokeWidth={i%4+1} fill="none" opacity=".32"/>)}
      <Flower x={263} y={364} pink active={focus==="first"} onClick={()=>setFocus("first")}/>
      <Flower x={745} y={364} active={focus==="second"} onClick={()=>setFocus("second")}/>
    </g>
    <g id="semantic-vector-motion">
      {motion.phase===2&&<path d="M263 305 C425 93 584 97 745 307" fill="none" stroke="#ffe5a2" strokeDasharray="4 17" strokeWidth="2.3" opacity=".48"/>}
      <g ref={motion.glowRef} opacity="0" filter="url(#v2Glow)">
       <circle cx="731" cy="360" r="7" fill="#ffec9b"/><circle cx="747" cy="366" r="6" fill="#ffe596"/><circle cx="762" cy="354" r="8" fill="#f6d36b"/>
      </g>
      <g role="button" tabIndex={0} aria-label="افحص النحلة" onClick={()=>setFocus("bee")}
       onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setFocus("bee");}}}>
       <Bee ref={motion.spriteRef} pollenRef={motion.pollenRef} alive={motion.playing}/>
      </g>
      <g className="v2-scene-caption" aria-live="polite">
       <rect x="183" y="533" rx="23" width="634" height="44" fill="#091321" fillOpacity=".68" stroke="#f8db97" strokeOpacity=".22"/>
       <text x="500" y="562" fill="#fff0c6" fontSize="23" fontWeight="500" textAnchor="middle" direction="rtl">{detail}</text>
      </g>
    </g>
   </svg>
   <div className="v2-corner"><span>{phases[motion.phase]}</span><span>{motion.blocked?"تجربة دون نقل":"انتقال اللقاح مفعّل"}</span></div>
  </section>
  <div className="v2-toolbar">
   <div className="v2-steps">{phases.map((phase,i)=><button key={i} aria-pressed={motion.phase===i} onClick={()=>motion.seek(i)} className={motion.phase===i?"active":""}>{phase}</button>)}</div>
   <div className="v2-buttons">
    <button onClick={()=>motion.setPlaying(!motion.playing)}>{motion.playing?"إيقاف مؤقت":"تشغيل الحركة"}</button>
    {[.5,1,1.5].map(x=><button key={x} className={motion.speed===x?"active":""} onClick={()=>motion.setSpeed(x)}>{x}×</button>)}
    <button onClick={()=>{motion.reset();setFocus("");setNotice("");}}>إعادة</button>
   </div>
  </div>
  <form className="v2-question" onSubmit={submit}>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="ماذا لو لم يصل اللقاح إلى الزهرة الثانية؟" aria-label="سؤال متابعة"/>
    <button type="submit" disabled={!q.trim()}>غيّر ما يحدث</button>
  </form>
  <div className="v2-quick"><button onClick={()=>motion.setBlocked(true)}>امنع انتقال اللقاح</button>
   <button onClick={()=>motion.setBlocked(false)}>أعِد انتقال اللقاح</button></div>
  {notice&&<p role="status" className="v2-notice">{notice}</p>}
  <p className="v2-disclosure">مختبر فيكتور مُصمَّم ومتحرّك برمجيًا؛ تحكم تلقائي بالاتجاه والمسار. هذا نموذج موضوع محدد، وليس شرحًا عامًا مولّدًا بالذكاء الاصطناعي.</p>
 </main>;
}
