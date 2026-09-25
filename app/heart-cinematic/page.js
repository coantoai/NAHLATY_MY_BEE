"use client";
import {useState} from "react";

const cardLeft=[1.45,11.05,20.75,30.45,40.15,49.85,59.55,69.25,78.95,88.65];

const scenes=[
 {n:"01",title:"البداية",sub:"نظرة عامة على القلب",kind:"overview"},
 {n:"02",title:"داخل القلب",sub:"رحلة إلى الداخل",kind:"inside"},
 {n:"03",title:"الحجرات",sub:"الأربع حجرات",kind:"chambers"},
 {n:"04",title:"الصمامات",sub:"تعمل كأبواب",kind:"valves"},
 {n:"05",title:"رحلة الدم",sub:"المسار الكامل",kind:"flow"},
 {n:"06",title:"إلى الرئتين",sub:"لأخذ الأكسجين",kind:"lungs"},
 {n:"07",title:"إلى الجسم",sub:"توزيع الأكسجين",kind:"body"},
 {n:"08",title:"الشرايين التاجية",sub:"تغذية القلب",kind:"coronary"},
 {n:"09",title:"النظام الكهربائي",sub:"تنظيم الخفقان",kind:"electric"},
 {n:"10",title:"الصورة الكاملة",sub:"القلب والجسم",kind:"whole"}
];

function HeartScene({kind}){
 const cut=kind==="inside"||kind==="chambers"||kind==="valves"||kind==="flow";
 return <div className={"generatedScene "+kind} aria-hidden="true">
   <div className="halo"/>
   <svg className="heartArt" viewBox="0 0 900 560" role="img">
    <defs>
     <radialGradient id="r" cx="38%" cy="30%"><stop offset="0" stopColor="#ff6259"/><stop offset=".52" stopColor="#b81924"/><stop offset="1" stopColor="#4c0710"/></radialGradient>
     <radialGradient id="b" cx="45%" cy="32%"><stop offset="0" stopColor="#41bfff"/><stop offset=".58" stopColor="#0c68bd"/><stop offset="1" stopColor="#07345f"/></radialGradient>
     <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffe79a"/><stop offset="1" stopColor="#e69c19"/></linearGradient>
     <filter id="glow"><feGaussianBlur stdDeviation="6" result="c"/><feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <g transform="translate(175 8) scale(.78)">
     <path d="M345 105 C290 38 173 49 132 151 C88 262 151 430 335 590 C520 430 582 260 538 151 C497 49 400 38 345 105Z" fill="url(#r)" stroke="#ff7b67" strokeWidth="5"/>
     <path d="M335 116 C304 66 244 57 205 89 C161 125 160 211 194 276 C224 334 279 386 335 437Z" fill="url(#b)" opacity=".95"/>
     <path d="M346 116 C379 67 442 58 481 91 C522 127 521 209 488 274 C456 336 400 389 346 438Z" fill="#d5262f" opacity=".92"/>
     <path d="M338 104 C334 210 335 331 340 450" fill="none" stroke="#f8b2a4" strokeWidth="9" opacity=".75"/>
     <path d="M275 83 C270 25 292 -12 322 -36" fill="none" stroke="#1675c9" strokeWidth="31" strokeLinecap="round"/>
     <path d="M405 82 C405 25 432 -13 466 -36" fill="none" stroke="#db2b2d" strokeWidth="33" strokeLinecap="round"/>
     <path d="M414 83 C474 32 533 39 562 81" fill="none" stroke="#d82b2e" strokeWidth="31" strokeLinecap="round"/>
     {cut&&<g filter="url(#glow)">
       <ellipse cx="273" cy="215" rx="69" ry="86" fill="#082f59" stroke="#5bd4ff" strokeWidth="5"/>
       <ellipse cx="410" cy="218" rx="69" ry="88" fill="#6c101b" stroke="#ff7f70" strokeWidth="5"/>
       <ellipse cx="275" cy="365" rx="82" ry="104" fill="#073e72" stroke="#61d8ff" strokeWidth="5"/>
       <ellipse cx="414" cy="365" rx="82" ry="106" fill="#7f121d" stroke="#ff806e" strokeWidth="5"/>
     </g>}
     {kind==="valves"&&<g stroke="url(#gold)" strokeWidth="12" fill="none" filter="url(#glow)"><path d="M307 292 q34 35 67 0"/><path d="M302 299 l-25 -28"/><path d="M377 299 l26 -28"/></g>}
     {kind==="flow"&&<g fill="none" strokeWidth="11" strokeLinecap="round" filter="url(#glow)"><path d="M250 120 C190 210 220 355 305 425" stroke="#48caff" strokeDasharray="18 15"/><path d="M388 430 C480 340 500 190 430 110" stroke="#ff5d4e" strokeDasharray="18 15"/></g>}
     {kind==="coronary"&&<g fill="none" stroke="#ffd85e" strokeWidth="8" strokeLinecap="round" filter="url(#glow)"><path d="M345 150 C270 220 265 330 220 420"/><path d="M345 150 C415 220 420 335 470 420"/><path d="M345 230 C310 285 315 360 300 470"/><path d="M345 230 C390 290 385 360 405 470"/></g>}
     {kind==="electric"&&<g fill="none" stroke="#ffd747" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"><path d="M280 145 l-25 70 48-17-31 78 55-25-30 88 55-35-22 105"/><circle cx="278" cy="144" r="15" fill="#fff3a2"/></g>}
    </g>
    {kind==="lungs"&&<g transform="translate(105 30)" opacity=".92"><path d="M160 80 C70 95 25 180 45 320 C58 410 125 455 196 402 L207 120Z" fill="#27465b" stroke="#58a9cf" strokeWidth="4"/><path d="M430 80 C520 95 565 180 545 320 C532 410 465 455 394 402 L383 120Z" fill="#27465b" stroke="#58a9cf" strokeWidth="4"/><path d="M295 50 V210" stroke="#85d8f6" strokeWidth="22"/><path d="M295 185 L185 290 M295 185 L405 290" stroke="#85d8f6" strokeWidth="14"/></g>}
    {kind==="body"&&<g transform="translate(650 85)" fill="none" stroke="#4e83a3" strokeWidth="16" opacity=".85"><circle cx="60" cy="40" r="35"/><path d="M60 80 V250 M60 125 L5 200 M60 125 L115 200 M60 250 L20 365 M60 250 L100 365"/></g>}
    {kind==="whole"&&<g transform="translate(645 65)" fill="none" stroke="#79b7d8" strokeWidth="13" opacity=".7"><circle cx="70" cy="45" r="38"/><path d="M70 86 V260 M70 130 L10 205 M70 130 L130 205 M70 260 L25 390 M70 260 L115 390"/><path d="M70 160 C30 170 30 235 70 250 C110 235 110 170 70 160Z" fill="#bd2430" stroke="#ff665c" strokeWidth="5"/></g>}
   </svg>
   <div className="particle p1"/><div className="particle p2"/><div className="particle p3"/>
 </div>
}

export default function Page(){
 const [active,setActive]=useState(0);
 const scene=scenes[active];
 return <main className="heartPlatform" dir="rtl">
  <section className="heartScreen" aria-label="رحلة القلب">
   <img className="referenceUI" src="https://d2jqrm6oza8nb6.cloudfront.net/datasets/078beba2-aa73-4316-a80c-4a9b3146fc01.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZDQ2M2JhNDg2Y2JmMzYyOCIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MDQ2Mzk0NH0.6pzblTKmS7lOudEDHVacbwjtxoVrtUTU7qufyWrRNXY" alt="منصة نحلتي — رحلة القلب"/>

   {active>0&&<div className="stageOverlay">
     <HeartScene kind={scene.kind}/>
     <div className="stageCaption"><b>{scene.title}</b><span>{scene.sub}</span></div>
   </div>}

   <button className="hot homeNav" aria-label="العودة للرئيسية" onClick={()=>{window.location.href="/"}}/>
   {cardLeft.map((left,i)=><button key={i} className="hot cardHot" style={{left:left+"%"}} aria-label={scenes[i].title} aria-pressed={active===i} onClick={()=>setActive(i)}/>)}
   <div className="activeFrame" style={{left:cardLeft[active]+"%"}} aria-hidden="true"/>
  </section>

  <style jsx global>{`
   *{box-sizing:border-box} html,body{margin:0;background:#020812} body{overflow-x:hidden}
   .heartPlatform{min-height:100vh;background:#020812;display:flex;justify-content:center;align-items:flex-start}
   .heartScreen{position:relative;width:100%;max-width:1536px;aspect-ratio:3/2;background:#020812;overflow:hidden}
   .referenceUI{display:block;width:100%;height:100%;object-fit:contain;user-select:none;-webkit-user-drag:none}
   .stageOverlay{position:absolute;left:9.5%;top:8.5%;width:63.55%;height:56.1%;overflow:hidden;z-index:3;background:#07111c}
   .generatedScene{position:absolute;inset:0;background:radial-gradient(circle at 48% 48%,#132d3f 0,#091725 43%,#040a12 77%,#02060b 100%);overflow:hidden}
   .generatedScene:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,10,18,.78),transparent 18%,transparent 82%,rgba(3,10,18,.7));pointer-events:none}
   .halo{position:absolute;width:62%;height:80%;left:18%;top:7%;border-radius:50%;background:radial-gradient(ellipse,rgba(23,151,211,.23),rgba(15,64,91,.09) 48%,transparent 72%);filter:blur(9px)}
   .heartArt{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 20px 28px rgba(0,0,0,.55))}
   .stageCaption{position:absolute;right:3%;bottom:3%;display:flex;flex-direction:column;align-items:flex-end;padding:8px 13px;border-radius:9px;background:rgba(2,10,18,.62);border:1px solid rgba(65,182,239,.22);backdrop-filter:blur(6px);color:#eaf7ff;z-index:4}
   .stageCaption b{font-size:clamp(11px,1.15vw,18px)} .stageCaption span{font-size:clamp(8px,.8vw,13px);color:#9cc5dc;margin-top:2px}
   .particle{position:absolute;border-radius:50%;background:#62d7ff;box-shadow:0 0 13px #36c4ff;opacity:.65}.p1{width:5px;height:5px;left:18%;top:22%}.p2{width:4px;height:4px;left:72%;top:35%}.p3{width:6px;height:6px;left:25%;top:72%}
   .hot{position:absolute;border:0;background:transparent;cursor:pointer;padding:0;z-index:7}.hot:focus-visible{outline:2px solid #f7bf48;outline-offset:2px}
   .homeNav{left:.5%;top:11.2%;width:8.4%;height:6.2%}.cardHot{top:75.2%;width:9.2%;height:21.4%}
   .activeFrame{position:absolute;top:75.2%;width:9.2%;height:21.4%;border:3px solid #16a9ff;border-radius:16px;box-shadow:0 0 24px rgba(22,169,255,.9),inset 0 0 16px rgba(22,169,255,.12);pointer-events:none;z-index:6;transition:left .22s ease}
   @media(max-width:700px){.heartScreen{width:100vw;height:auto;aspect-ratio:3/2}.activeFrame{border-width:2px;border-radius:7px}.stageCaption{padding:4px 7px;border-radius:5px}}
  `}</style>
 </main>
}