"use client";
import {useRef,useState} from "react";
import {usePollinationFlight} from "../components/usePollinationFlight.js";
import {interpretPollinationPrompt} from "../../lib/hybrid-pollination.js";
import "./style.css";

const PHOTO="https://images.pexels.com/photos/17516957/pexels-photo-17516957.jpeg?auto=compress&cs=tinysrgb&w=1800";
const PHOTO_CREDIT="https://www.pexels.com/photo/two-pink-flowers-in-a-field-with-green-grass-17516957/";
export default function PhotoOverlayLab(){
 const svgRef=useRef(null);
 const [anchors,setAnchors]=useState({first:{x:298,y:302},second:{x:720,y:303}});
 const [calibrating,setCalibrating]=useState("");
 const [photoFailed,setPhotoFailed]=useState(false),[assetFailed,setAssetFailed]=useState(false);
 const [warmth,setWarmth]=useState(48),[scale,setScale]=useState(1);
 const [focus,setFocus]=useState("");
 const [q,setQ]=useState(""),[notice,setNotice]=useState("");
 const motion=usePollinationFlight(anchors);
 function place(e){
  if(!calibrating)return;
  const svg=svgRef.current,ctm=svg?.getScreenCTM();
  if(!svg||!ctm)return;
  const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;
  const local=pt.matrixTransform(ctm.inverse());
  setAnchors(v=>({...v,[calibrating]:{x:Math.max(75,Math.min(925,local.x)),y:Math.max(115,Math.min(470,local.y))}}));
  setCalibrating("");setNotice("");
 }
 function submit(e){
  e.preventDefault();
  const intent=interpretPollinationPrompt(q);
  if(intent==="BLOCK_TRANSFER")motion.setBlocked(true);
  else if(intent==="ALLOW_TRANSFER")motion.setBlocked(false);
  else if(intent==="RESET")motion.reset();
  else{setNotice("تجربة محدودة: اسأل «ماذا لو لم ينتقل اللقاح؟»");return;}
  setQ("");setNotice("");setFocus("");
 }
 const detail=focus==="bee"?"عنصر نحلة شفّاف مستقل":
  focus==="first"?"يمكن تعديل مرساة الزهرة الأولى":
  focus==="second"?"يمكن تعديل مرساة الزهرة الثانية":
  motion.blocked&&motion.phase>=3?"غيّرنا الشرط: لم يصل اللقاح":
  motion.transfer?"وصول اللقاح إلى الزهرة الثانية":
  ["الاقتراب من الزهرة","جمع حبوب اللقاح","الطيران إلى زهرة ثانية","الوصول إلى الميسم","عودة النحلة"][motion.phase];
 return <main className="photo-lab" dir="rtl">
  <header className="photo-head"><div><small>نحلتي • تجربة رقم ٢ / تركيب مستقل</small>
   <h1>صورة حقيقية… وحركة منفصلة</h1></div><span>صورة فوتوغرافية + أصل شفاف • بلا توليد مدفوع</span></header>
  <section className={"photo-stage"+(calibrating?" is-calibrating":"")} aria-label="صورة طبيعة فوتوغرافية مع طبقة نحلة شفافة متحركة">
   <img src={PHOTO} alt="زهرتان ورديتان في مرج، تصوير رومـان بيرناكي على بيكسلز"
     className="photo-background" onError={()=>setPhotoFailed(true)} />
   {photoFailed&&<div role="alert" className="photo-error">تعذّر تحميل الصورة الفوتوغرافية من المصدر الخارجي. هذا التدرّج خلفية احتياطية، وليس صورة فوتوغرافية.</div>}
   <div className="photo-grade" aria-hidden="true"/>
   <svg ref={svgRef} viewBox="0 0 1000 600" className="photo-overlay"
     preserveAspectRatio="none" onClick={place} role="img"
     aria-label="طبقة متحركة شفافة مع مرساتين قابلتين للضبط لتوجيه مسار النحلة">
    <defs>
     <radialGradient id="sunbeam"><stop stopColor="#f6d79e" stopOpacity=".38"/><stop offset="1" stopColor="#f6d79e" stopOpacity="0"/></radialGradient>
     <filter id="overlayShadow"><feGaussianBlur stdDeviation="7"/></filter>
     <filter id="pollenGlow"><feGaussianBlur stdDeviation="5" result="soft"/><feMerge><feMergeNode in="soft"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <ellipse cx="510" cy="150" rx="480" ry="400" fill="url(#sunbeam)" pointerEvents="none"/>
    {(["first","second"]).map((id,i)=><g key={id}>
     <circle cx={anchors[id].x} cy={anchors[id].y+61} r="19"
       fill={i?"#e5bc98":"#e4add7"} opacity=".12" pointerEvents="none"/>
     <circle cx={anchors[id].x} cy={anchors[id].y+61} r="7"
       fill="#ffe4a7" opacity=".7" pointerEvents="none"/>
     {calibrating&&<circle cx={anchors[id].x} cy={anchors[id].y+61} r="33"
        fill="none" stroke="#ffebb3" strokeDasharray="5 7" strokeWidth="2" pointerEvents="none"/>}
    </g>)}
    <g ref={motion.glowRef} opacity="0" pointerEvents="none" filter="url(#pollenGlow)">
      <circle cx={anchors.second.x-14} cy={anchors.second.y+52} r="6" fill="#ffe19a"/>
      <circle cx={anchors.second.x+7} cy={anchors.second.y+65} r="5" fill="#ffdd75"/>
      <circle cx={anchors.second.x+18} cy={anchors.second.y+54} r="6" fill="#fff0ae"/>
    </g>
    <g ref={motion.spriteRef} pointerEvents={calibrating?"none":"auto"}
      onClick={e=>{if(!calibrating){e.stopPropagation();setFocus("bee");}}}
      role="button" tabIndex={0} aria-label="تفحّص الأصل المتحرك الشفاف"
      onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setFocus("bee");}}}>
     <ellipse cx="3" cy="22" rx="49" ry="15" fill="#08100c" opacity=".17"
       filter="url(#overlayShadow)"/>
     <image href="/visual-lab/bee-transparent.svg" x={-79*scale} y={-51*scale}
       width={158*scale} height={102*scale} onError={()=>setAssetFailed(true)}
       className="photo-bee-asset"
       style={{filter:"saturate("+(75+warmth*.7)+"%) sepia("+(warmth*.22)+"%) drop-shadow(0 4px 5px #080f10a3)"}} />
     <g ref={motion.pollenRef} opacity="0" filter="url(#pollenGlow)">
       <circle cx="-23" cy={34*scale} r={6*scale} fill="#f8df75"/>
       <circle cx="-30" cy={28*scale} r={3*scale} fill="#fff0b5"/>
     </g>
     <circle r={47*scale} fill="transparent" className="photo-bee-hit"/>
    </g>
    <g className="photo-caption" pointerEvents="none">
     <rect x="155" y="532" width="690" height="44" rx="22" fill="#07121b" fillOpacity=".6"
       stroke="#e6c588" strokeOpacity=".22"/>
     <text x="500" y="561" textAnchor="middle" fontSize="23" fill="#ffefcc" direction="rtl">{detail}</text>
    </g>
   </svg>
   <div className="photo-state"><span>{calibrating?"انقر على مركز الزهرة في الصورة":motion.playing?"الحركة تلقائية":"الحركة متوقفة"}</span>
    <span>{motion.blocked?"نقل اللقاح ممنوع":"نقل اللقاح مفعّل"}</span></div>
   {assetFailed&&<div role="alert" className="photo-error asset">تعذر تحميل أصل النحلة الشفاف.</div>}
  </section>
  <div className="photo-tools">
   <div className="photo-controls">
    <button onClick={()=>motion.setPlaying(!motion.playing)}>{motion.playing?"إيقاف":"تشغيل الحركة"}</button>
    <button onClick={()=>setCalibrating("first")} aria-pressed={calibrating==="first"}>حدّد الزهرة الأولى</button>
    <button onClick={()=>setCalibrating("second")} aria-pressed={calibrating==="second"}>حدّد الزهرة الثانية</button>
    <button onClick={()=>{motion.reset();setFocus("");}}>إعادة</button>
   </div>
   <div className="photo-settings">
    <label>دفء لون النحلة <input type="range" min="0" max="100" value={warmth}
       onChange={e=>setWarmth(Number(e.target.value))}/></label>
    <label>حجم الأصل <input type="range" min=".6" max="1.5" step=".05" value={scale}
       onChange={e=>setScale(Number(e.target.value))}/></label>
   </div>
  </div>
  <form className="photo-question" onSubmit={submit}><input value={q} onChange={e=>setQ(e.target.value)}
   placeholder="ماذا لو لم ينتقل اللقاح؟" aria-label="سؤال يغيّر النتيجة في الصورة نفسها"/>
   <button disabled={!q.trim()} type="submit">غيّر النتيجة</button></form>
  <div className="photo-quick">
   <button onClick={()=>motion.setBlocked(true)}>امنع انتقال اللقاح</button>
   <button onClick={()=>motion.setBlocked(false)}>اسمح بالانتقال</button>
  </div>
  {notice&&<p role="status" className="photo-notice">{notice}</p>}
  <p className="photo-disclosure">تجربة تركيب حقيقية: <a href={PHOTO_CREDIT} target="_blank" rel="noopener noreferrer">صورة مجانية من بيكسلز</a> + <strong>ملف نحلة متحركة مستقل وشفاف</strong> صنعناه محليًا. ضبط اللون والمسار يدوي في هذا النموذج؛ لا ندّعي بعد مطابقة إضاءة ثلاثية الأبعاد أو حجب الأجسام بصورة تلقائية.</p>
 </main>;
}