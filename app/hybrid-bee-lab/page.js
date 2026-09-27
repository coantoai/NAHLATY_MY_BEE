"use client";

import {useState} from "react";
import {
  POLLINATION_PHASES, pollinationScene, pollinationTransition, interpretPollinationPrompt
} from "../../lib/hybrid-pollination.js";
import "./scene.css";

const STEP_LABELS = ["اقترب", "اجمع", "انتقل", "انقل", "تابع"];
const PETALS = Array.from({length:8},(_,i)=>i*45);

function Flower({x,y,id,color,active,onFocus}) {
  return <g transform={"translate("+x+" "+y+")"} className="poll-flower"
    role="button" tabIndex={0} aria-label={id==="flower-1"?"تفحّص الزهرة الأولى":"تفحّص الزهرة الثانية"}
    onClick={onFocus} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onFocus();}}}>
    <path d="M0 18 C-6 105 18 166 4 246" stroke="#567d5c" strokeWidth="9" fill="none" strokeLinecap="round"/>
    <path d="M-2 99 Q-89 49 -101 108 Q-54 156 4 119" fill="#3b6d57"/>
    <path d="M4 148 Q90 104 102 162 Q63 192 1 177" fill="#37604a"/>
    <g className={active?"poll-flower-active":""}>
      <circle r="67" fill={color} opacity=".12"/>
      {PETALS.map((angle,i)=><g transform={"rotate("+angle+")"} key={i}>
        <ellipse cy="-42" rx="22" ry="38" fill={color} stroke="#ffd6c5" strokeWidth=".6"
          opacity=".96" />
        <path d="M0 -14 Q7 -46 0 -75" fill="none" stroke="#fff3ec" opacity=".27" strokeWidth="1"/>
      </g>)}
      <circle r="31" fill="url(#poll-nectar)" stroke="#ffe99b" strokeWidth="2"/>
      <circle r="12" fill="#9a6226" opacity=".54"/>
      {PETALS.map((angle,i)=><circle key={i} cx={Math.cos(angle*Math.PI/180)*22}
        cy={Math.sin(angle*Math.PI/180)*22} r="3.3" fill="#ffe47d" />)}
      <circle r="34" fill="none" stroke="#ffe58b" strokeWidth="1.5"
        className={active?"poll-target-ring":""} opacity={active?1:0}/>
    </g>
  </g>;
}

function Bee({point,pollen,focused,playing}) {
  return <g id="bee-overlay" className="poll-bee-position"
    style={{transform:"translate("+point.x+"px,"+point.y+"px)"}}>
    {focused&&<circle r="58" className="poll-bee-focus" fill="none" stroke="#ffe89a" strokeWidth="2"/>}
    <g className={playing?"poll-bee-alive":""}>
      <ellipse cx="-16" cy="-19" rx="21" ry="12" fill="#dff4ff" fillOpacity=".72"
        stroke="#fff" strokeOpacity=".65" className="poll-wing poll-wing-left"/>
      <ellipse cx="9" cy="-22" rx="25" ry="14" fill="#dff4ff" fillOpacity=".68"
        stroke="#fff" strokeOpacity=".6" className="poll-wing poll-wing-right"/>
      <ellipse cx="9" cy="2" rx="37" ry="25" fill="#e4a93d" stroke="#4a2c1d" strokeWidth="1.5"/>
      {[[-1,16],[18,20]].map(([x,h],i)=><path key={i} d={"M"+x+" -18 Q"+(x+10)+" 0 "+x+" "+h}
        stroke="#432919" strokeWidth="11" fill="none" opacity=".93"/>)}
      <ellipse cx="-26" cy="-1" rx="17" ry="18" fill="#2b1b1a"/>
      <circle cx="-34" cy="-6" r="3.2" fill="#fff2cd"/>
      <path d="M-38 -16 Q-48 -31 -58 -30 M-27 -18 Q-29 -36 -18 -38"
        stroke="#30221c" strokeWidth="2.4" fill="none"/>
      <path d="M-8 24 l-8 15 M8 24 l-1 16 M24 18 l9 18" stroke="#33221a"
        strokeWidth="3" strokeLinecap="round" fill="none"/>
      {pollen&&<g className="poll-carried-grains">
        <circle cx="-16" cy="31" r="6.5" fill="#fbd664" stroke="#fff0a4"/>
        <circle cx="-23" cy="28" r="3" fill="#ffe987"/>
        <circle cx="-9" cy="33" r="3" fill="#ffe987"/>
        <circle cx="7" cy="30" r="4" fill="#ffc94b"/>
      </g>}
    </g>
  </g>;
}

export default function HybridBeeLab() {
  const [world,setWorld] = useState(()=>pollinationScene());
  const [playing,setPlaying] = useState(true);
  const [selected,setSelected] = useState("");
  const [question,setQuestion] = useState("");
  const [notice,setNotice] = useState("");
  const canAdvance = world.step < POLLINATION_PHASES.length-1;
  function transition(event) {
    setWorld(previous=>pollinationTransition(previous,event));
    setSelected("");
    setNotice("");
  }
  function ask(event) {
    event.preventDefault();
    const instruction=interpretPollinationPrompt(question);
    if (!instruction) {
      setNotice("هذا إثبات تجريبي محدود: جرّب «ماذا لو لم تنتقل حبوب اللقاح؟».");
      return;
    }
    transition(instruction);
    setQuestion("");
  }
  const detail=selected==="bee"
    ? "راقب حبوب اللقاح على جسم النحلة"
    : selected==="flower-1"
      ? "حبوب اللقاح متاحة هنا"
      : selected==="flower-2"
        ? world.flowerTwo.pollenReceived?"وصل اللقاح إلى ميسم الزهرة":"لم يصل اللقاح بعد"
        : world.note;

  return <main className="poll-page" dir="rtl">
    <header className="poll-header">
      <div><small>نحلتي • مختبر العالم البصري</small><h1>رحلة حبة لقاح</h1></div>
      <span>نموذج مستقل • بلا توليد مدفوع</span>
    </header>

    <section className="poll-stage" aria-label="عالم تفاعلي يوضح تلقيح الأزهار">
      <svg className="poll-scene" viewBox="0 0 1000 600" role="img"
        aria-label="زهرتان ثابتتان، ونحلة متحركة تنقل حبوب اللقاح بينهما">
        <defs>
          <linearGradient id="poll-sky" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#080e22"/><stop offset=".54" stopColor="#283a4b"/>
            <stop offset="1" stopColor="#38534b"/>
          </linearGradient>
          <radialGradient id="poll-nectar">
            <stop stopColor="#fff4b4"/><stop offset=".56" stopColor="#f4c963"/>
            <stop offset="1" stopColor="#b37330"/>
          </radialGradient>
          <radialGradient id="poll-haze">
            <stop stopColor="#f2b863" stopOpacity=".3"/><stop offset="1" stopColor="#f2b863" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="poll-ground" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#375347"/><stop offset="1" stopColor="#102922"/>
          </linearGradient>
          <filter id="poll-soft"><feGaussianBlur stdDeviation="22"/></filter>
          <filter id="poll-glow"><feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <g id="static-cinematic-world">
          <rect width="1000" height="600" fill="url(#poll-sky)"/>
          <circle cx="520" cy="235" r="380" fill="url(#poll-haze)"/>
          <g opacity=".5" filter="url(#poll-soft)">
            {[{x:98,y:85,r:37},{x:391,y:156,r:26},{x:834,y:119,r:45},
              {x:921,y:270,r:28},{x:673,y:78,r:15}].map((b,i)=>
              <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={i%2?"#efab83":"#a0d4a5"} opacity=".32"/>)}
          </g>
          <path d="M0 458 Q140 427 298 470 T610 463 T1000 436 V600 H0Z"
            fill="url(#poll-ground)"/>
          <path d="M0 515 Q180 462 332 525 T702 492 T1000 514 V600 H0Z"
            fill="#16372b" opacity=".88"/>
          {Array.from({length:17},(_,i)=><path key={i}
            d={"M"+(i*67-30)+" 605 Q"+(i*67-25)+" 540 "+(i*67+12)+" "+(466+(i%4)*24)}
            fill="none" stroke={i%2?"#69866b":"#47694f"} strokeWidth={i%3?3:6} opacity=".43"/>)}
          <Flower x={263} y={375} id="flower-1" color="#b976a2"
            active={selected==="flower-1"} onFocus={()=>setSelected("flower-1")}/>
          <Flower x={748} y={375} id="flower-2" color="#e3a68b"
            active={selected==="flower-2"} onFocus={()=>setSelected("flower-2")}/>
          <g opacity=".4">
            {[{x:170,y:280},{x:326,y:260},{x:616,y:170},{x:862,y:250}].map((dot,i)=>
              <circle key={i} cx={dot.x} cy={dot.y} r={i%2?2:3} fill="#f7d88a"/>)}
          </g>
        </g>
        <g id="transparent-semantic-motion-overlay">
          {world.step===2&&<g className="poll-flight-path" aria-hidden="true">
            <path d="M260 305 Q450 65 745 306" fill="none"
              stroke="#ffe2a0" strokeWidth="3" strokeDasharray="6 15" opacity=".84"/>
            {[0,1,2,3].map(i=><circle key={i} cx={350+i*81} cy={183+Math.sin(i)*18}
              r={3+i%2} fill="#f7cf67" opacity=".65"/>)}
          </g>}
          {world.flowerTwo.pollenReceived&&<g className="poll-transfer" filter="url(#poll-glow)">
            <circle cx="735" cy="361" r="8" fill="#f7dc75"/>
            <circle cx="750" cy="356" r="6" fill="#fbe999"/>
            <circle cx="762" cy="369" r="6" fill="#f8cf56"/>
          </g>}
          {world.flowerTwo.postPollinationProcess&&<g className="poll-after" aria-hidden="true">
            <path d="M750 382 Q741 423 753 449" fill="none" stroke="#ffe69b"
              strokeWidth="5" strokeDasharray="7 8"/>
            <circle cx="753" cy="461" r="17" fill="none" stroke="#ffe69b" strokeWidth="2"/>
          </g>}
          <g role="button" tabIndex={0} aria-label="تفحّص النحلة"
            onClick={()=>setSelected("bee")}
            onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelected("bee");}}}>
            <Bee point={world.bee} pollen={world.bee.pollenOnLegs}
              focused={selected==="bee"} playing={playing}/>
            <circle cx={world.bee.x} cy={world.bee.y} r="55" fill="transparent"
              className="poll-bee-hit"/>
          </g>
          <g id="in-scene-explanation">
            <rect x="155" y="520" width="690" height="52" rx="25"
              fill="#07121c" fillOpacity=".63" stroke="#fff3d4" strokeOpacity=".18"/>
            <text x="500" y="551" textAnchor="middle" direction="rtl"
              fill="#fff4d4" fontSize="23" fontWeight="600">{detail}</text>
          </g>
        </g>
      </svg>
      <div className="poll-scene-state">
        <span>{world.step+1} / ٥</span>
        <span>{world.condition==="blocked"?"التجربة: لم يصل اللقاح":"التجربة: انتقال اللقاح"}</span>
      </div>
    </section>

    <div className="poll-actions">
      <div className="poll-steps" aria-label="مراحل التجربة">
        {STEP_LABELS.map((title,index)=><button key={title} type="button"
          aria-pressed={world.step===index}
          className={world.step===index?"poll-step active":"poll-step"}
          onClick={()=>{setWorld(pollinationScene(index,world.condition));setSelected("");setNotice("");}}>
          <b>{index+1}</b>{title}
        </button>)}
      </div>
      <div className="poll-buttons">
        <button type="button" onClick={()=>transition("BACK")} disabled={world.step===0}>السابق</button>
        <button type="button" className="poll-primary" onClick={()=>transition("NEXT")}
          disabled={!canAdvance}>التالي ←</button>
        <button type="button" onClick={()=>setPlaying(v=>!v)}>{playing?"أوقف حركة الأجنحة":"شغّل الحركة"}</button>
        <button type="button" onClick={()=>transition("RESET")}>إعادة</button>
      </div>
    </div>

    <form className="poll-ask" onSubmit={ask}>
      <input value={question} onChange={event=>setQuestion(event.target.value)}
        aria-label="سؤال متابعة تجريبي" placeholder="اسأل عن المشهد: ماذا لو لم تنتقل حبوب اللقاح؟"/>
      <button type="submit" className="poll-primary" disabled={!question.trim()}>غيّر المشهد</button>
    </form>
    <div className="poll-quick">
      <button type="button" onClick={()=>transition("BLOCK_TRANSFER")}>ماذا لو لم يصل اللقاح؟</button>
      <button type="button" onClick={()=>transition("ALLOW_TRANSFER")}>اسمح بانتقال اللقاح</button>
    </div>
    {notice&&<p role="status" className="poll-notice">{notice}</p>}
    <p className="poll-lab-note">إثبات تفاعلي محلي: الخلفية والطبقات المتحركة من رسوم متجهة داخل المتصفح. لم تُستخدم صورة مولّدة أو نموذج ذكاء اصطناعي هنا. هذه ليست محاكاة علمية عامة.</p>
  </main>;
}
