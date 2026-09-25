"use client";
import {useState} from "react";

const cardLeft=[1.45,11.05,20.75,30.45,40.15,49.85,59.55,69.25,78.95,88.65];

const scenes=[
 {n:"01",title:"البداية",sub:"نظرة عامة على القلب",image:"https://dnznrvs05pmza.cloudfront.net/gemini/gemini-3-pro-image/images/5fe9ea29-8f8d-4c7d-aefd-fd65d28fbe1b/4a954350-cb6d-421d-bd87-7162686ce8fe/Match_the_exact_cinematic_medical_visual_language_of__refere.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMDIzYTA0ZGU5NGQ0ZmFiYSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MDQxMjc2Nn0.8qnJQThjFfE-hAeR8v9ywwivohfmn2DiSpX8BvrRCT4"},
 {n:"02",title:"داخل القلب",sub:"رحلة إلى الداخل",image:"https://dnznrvs05pmza.cloudfront.net/gemini/gemini-3-pro-image/images/d4966826-70f6-4b4e-aa24-301080443674/cd6c927c-ca7f-42b0-b32e-41baf675c76d/Match_the_exact_cinematic_medical_visual_language_of__refere.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMjUzNDFhMDZkZGFkNjI5ZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MDQ4NTEyNn0.KtFB8fDQlHu9LJRbhWqKrwfmOBjJ5Avf5j-NZiI69jc"},
 {n:"03",title:"الحجرات",sub:"الأربع حجرات",image:"https://dnznrvs05pmza.cloudfront.net/gemini/gemini-3-pro-image/images/80d4a605-df12-4c0b-8808-c5ca4e582d9b/6d7d155f-aec0-4128-bc32-e97e7b247b34/Match_the_exact_cinematic_medical_visual_language_of__refere.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYTdlZWQwM2ZhODBmNTUzNCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MDQwOTE1MX0.ccTh31j-aLnhWZ4XdahmJ87jorvj4XDF66QDKz5XQcc"},
 {n:"04",title:"الصمامات",sub:"تعمل كأبواب",image:"https://dnznrvs05pmza.cloudfront.net/gemini/gemini-3-pro-image/images/9dbef5d4-97f8-457c-a2d7-56a91a0059f9/685b0588-06b0-402e-9d7e-68d7f1fbf298/Match_the_exact_cinematic_medical_visual_language_of__refere.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZWZmYjE1OTU4ZWE3NTI3ZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MDQzNjg4NX0.Tz-FH_T1yB2nft9YInPv2OxJZDtq82-OBXfZd1l7zSA"},
 {n:"05",title:"رحلة الدم",sub:"المسار الكامل",image:"https://dnznrvs05pmza.cloudfront.net/gemini/gemini-3-pro-image/images/762e0b81-782e-4c49-8c10-2aa2e813cace/94bdd1c1-10f0-4810-bdd3-75857d742d93/Match_the_exact_cinematic_medical_visual_language_of__refere.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZDI3ZjBkYTEyNjJjZjdkNSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MDQwOTEyMX0.cyAFKCphw5nXVo1NPeSGDSYAM9NMy6rB2_gNRNd-Ofc"},
 {n:"06",title:"إلى الرئتين",sub:"لأخذ الأكسجين",image:"https://dnznrvs05pmza.cloudfront.net/gemini/gemini-3-pro-image/images/9fd6d252-8c55-4b27-9c2e-40c58dad5a6e/2ce1661d-bf3a-479b-a4d9-ed2110ee49b3/Match_the_exact_cinematic_medical_visual_language_of__refere.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMjhkNWIyNTIxNmQxZWUxYSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MDQwODY1OH0.kyomkWx78oNNa8BOxX7rVUWRrTQttc4YXwil1VB975c"},
 {n:"07",title:"إلى الجسم",sub:"توزيع الأكسجين",image:"https://dnznrvs05pmza.cloudfront.net/gemini/gemini-3-pro-image/images/3371ff8d-3ee8-47bc-9441-089813f66727/d4796b9e-c5fc-4647-9e86-3348b41b1992/Match_the_exact_cinematic_medical_visual_language_of__refere.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiODFiMjNjOWJmMjExYmNiMyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MDQyNDk4N30.PJq5gc3i0l80dxYqKXQ5nlXefwri0-PGj2N4WZF7nw0"},
 {n:"08",title:"الشرايين التاجية",sub:"تغذية القلب",image:"https://dnznrvs05pmza.cloudfront.net/gemini/gemini-3-pro-image/images/311b968b-8181-41f9-b388-d553c92ee248/08eafd1e-d365-46d6-9148-858c97696596/Match_the_exact_cinematic_medical_visual_language_of__refere.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZjI3MmVhMjdiNTMyMjFkMiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MDQ1ODkxOX0.QdN_hl70_xHKdnHdcE2bKfee7dZT6zwEiu2uVOIMDbY"},
 {n:"09",title:"النظام الكهربائي",sub:"تنظيم الخفقان",image:"https://dnznrvs05pmza.cloudfront.net/gemini/gemini-3-pro-image/images/30112d47-5011-402c-8e52-0dab0880a97c/edb5b30a-84e6-4d8b-950d-0844f8d41a81/Match_the_exact_cinematic_medical_visual_language_of__refere.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMDU4NWQyZWE5ZjBiMDdmYyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MDQxNjM2Mn0.aIt5SbMaugOgxhXxQpTgWUfFxbH3_xV2nXJDDzpvue0"},
 {n:"10",title:"الصورة الكاملة",sub:"القلب والجسم",image:"https://dnznrvs05pmza.cloudfront.net/gemini/gemini-3-pro-image/images/7aa9da5a-65c1-457f-87a4-d13fd608aae2/da238478-d99b-4885-8580-e771341caa66/Match_the_exact_cinematic_medical_visual_language_of__refere.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZmQyMTQ0NjU5MDYzY2Q4OSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MDQ2Mzg0NX0.QkwxeEKx5auQyXeTcUCZUnEBa2OChTnfLkJE7Isik8Q"}
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

function VisualGuide({index}){
 const guides=[
  {points:[[50,48]],paths:[],tone:"#6bd8ff"},
  {points:[[48,45],[57,55]],paths:[["M22 52 C35 35 48 32 61 45"]],tone:"#6bd8ff"},
  {points:[[42,36],[57,36],[42,61],[58,61]],paths:[],tone:"#ffd76b"},
  {points:[[50,51]],paths:[["M38 50 C45 43 55 43 62 50"],["M38 54 C45 61 55 61 62 54"]],tone:"#ffd76b"},
  {points:[[35,35],[63,62]],paths:[["M28 30 C18 48 30 69 48 72"],["M52 72 C72 62 78 38 64 27"]],tone:"#67d9ff",second:"#ff665e"},
  {points:[[31,45],[69,45],[50,55]],paths:[["M50 58 C38 55 30 49 24 39"],["M50 58 C62 55 70 49 76 39"]],tone:"#67d9ff",second:"#ff665e"},
  {points:[[50,50],[69,28],[75,70]],paths:[["M52 47 C62 40 68 33 73 23"],["M54 54 C64 61 70 68 76 78"]],tone:"#ff665e"},
  {points:[[48,42],[56,53],[42,61]],paths:[["M49 30 C43 40 42 53 35 68"],["M51 30 C58 41 59 53 66 68"]],tone:"#ffd76b"},
  {points:[[44,31],[52,48],[47,67]],paths:[["M44 30 L39 43 L51 40 L45 53 L56 50 L48 66"]],tone:"#ffe66b"},
  {points:[[50,49],[28,45],[72,45]],paths:[["M50 52 C38 50 32 47 25 41"],["M50 52 C62 50 68 47 75 41"],["M50 55 C50 66 50 73 50 80"]],tone:"#6bd8ff",second:"#ff665e"}
 ];
 const g=guides[index];
 return <svg className="visualGuide" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
   <defs><filter id={"guideGlow"+index}><feGaussianBlur stdDeviation="1.1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
   {g.paths.map((p,i)=><path key={i} d={p[0]} className="guidePath" style={{stroke:i&&g.second?g.second:g.tone}} filter={"url(#guideGlow"+index+")"}/>)}
   {g.points.map((p,i)=><g key={i} className="guidePoint" transform={"translate("+p[0]+" "+p[1]+")"} filter={"url(#guideGlow"+index+")"}>
      <circle r="3.2" fill="none" stroke={i&&g.second?g.second:g.tone} strokeWidth=".7"/>
      <circle r=".85" fill={i&&g.second?g.second:g.tone}/>
    </g>)}
 </svg>
}

export default function Page(){
 const [active,setActive]=useState(0);
 const scene=scenes[active];
 return <main className="heartPlatform" dir="rtl">
  <section className="heartScreen" aria-label="رحلة القلب">
   <img className="referenceUI" src="https://d2jqrm6oza8nb6.cloudfront.net/datasets/078beba2-aa73-4316-a80c-4a9b3146fc01.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZDQ2M2JhNDg2Y2JmMzYyOCIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MDQ2Mzk0NH0.6pzblTKmS7lOudEDHVacbwjtxoVrtUTU7qufyWrRNXY" alt="منصة نحلتي — رحلة القلب"/>

   <div className="stageOverlay">
     <img className="cinematicScene" src={scene.image} alt={scene.title+" — "+scene.sub}/>
   </div>

   <button className="hot brandHome" aria-label="نحلتي — العودة للرئيسية" onClick={()=>{window.location.href="/"}}/>
   <button className="hot homeNav" aria-label="العودة للرئيسية" onClick={()=>{window.location.href="/"}}/>
   {cardLeft.map((left,i)=><div key={"thumb-"+i} className="cardThumb" style={{left:(left+.38)+"%"}}><img src={scenes[i].image} alt="" /></div>)}
   {cardLeft.map((left,i)=><button key={i} className="hot cardHot" style={{left:left+"%"}} aria-label={scenes[i].title} aria-pressed={active===i} onClick={()=>setActive(i)}/>)}
   <div className="activeFrame" style={{left:cardLeft[active]+"%"}} aria-hidden="true"/>
  </section>

  <style jsx global>{`
   *{box-sizing:border-box} html,body{margin:0;background:#020812} body{overflow-x:hidden}
   .heartPlatform{min-height:100vh;background:#020812;display:flex;justify-content:center;align-items:flex-start}
   .heartScreen{position:relative;width:100%;max-width:1536px;aspect-ratio:3/2;background:#020812;overflow:hidden}
   .referenceUI{display:block;width:100%;height:100%;object-fit:contain;user-select:none;-webkit-user-drag:none}
   .stageOverlay{position:absolute;left:9.5%;top:8.5%;width:63.55%;height:56.1%;overflow:hidden;z-index:3;background:#07111c}
   .cinematicScene{width:100%;height:100%;object-fit:cover;display:block}
   .visualGuide{position:absolute;inset:0;width:100%;height:100%;z-index:4;pointer-events:none}
   .guidePath{fill:none;stroke-width:.75;stroke-linecap:round;stroke-dasharray:2.2 1.5;opacity:.92}
   .guidePoint{transform-box:fill-box;transform-origin:center;animation:guidePulse 2s ease-in-out infinite}
   @keyframes guidePulse{0%,100%{opacity:.58}50%{opacity:1}}
   .cardThumb{position:absolute;top:75.85%;width:8.45%;height:12.2%;z-index:5;overflow:hidden;border-radius:10px;pointer-events:none;background:#07111c}
   .cardThumb img{width:100%;height:100%;object-fit:cover;display:block}
   .generatedScene{position:absolute;inset:0;background:radial-gradient(circle at 48% 48%,#132d3f 0,#091725 43%,#040a12 77%,#02060b 100%);overflow:hidden}
   .generatedScene:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,10,18,.78),transparent 18%,transparent 82%,rgba(3,10,18,.7));pointer-events:none}
   .halo{position:absolute;width:62%;height:80%;left:18%;top:7%;border-radius:50%;background:radial-gradient(ellipse,rgba(23,151,211,.23),rgba(15,64,91,.09) 48%,transparent 72%);filter:blur(9px)}
   .heartArt{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 20px 28px rgba(0,0,0,.55))}
   .stageCaption{position:absolute;right:3%;bottom:3%;display:flex;flex-direction:column;align-items:flex-end;padding:8px 13px;border-radius:9px;background:rgba(2,10,18,.62);border:1px solid rgba(65,182,239,.22);backdrop-filter:blur(6px);color:#eaf7ff;z-index:4}
   .stageCaption b{font-size:clamp(11px,1.15vw,18px)} .stageCaption span{font-size:clamp(8px,.8vw,13px);color:#9cc5dc;margin-top:2px}
   .particle{position:absolute;border-radius:50%;background:#62d7ff;box-shadow:0 0 13px #36c4ff;opacity:.65}.p1{width:5px;height:5px;left:18%;top:22%}.p2{width:4px;height:4px;left:72%;top:35%}.p3{width:6px;height:6px;left:25%;top:72%}
   .hot{position:absolute;border:0;background:transparent;cursor:pointer;padding:0;z-index:7}.hot:focus-visible{outline:2px solid #f7bf48;outline-offset:2px}
   .brandHome{left:88.2%;top:1.1%;width:10.8%;height:6.8%}.homeNav{left:.5%;top:11.2%;width:8.4%;height:6.2%}.cardHot{top:75.2%;width:9.2%;height:21.4%}
   .activeFrame{position:absolute;top:75.2%;width:9.2%;height:21.4%;border:3px solid #16a9ff;border-radius:16px;box-shadow:0 0 24px rgba(22,169,255,.9),inset 0 0 16px rgba(22,169,255,.12);pointer-events:none;z-index:6;transition:left .22s ease}
   @media(max-width:700px){.heartScreen{width:100vw;height:auto;aspect-ratio:3/2}.activeFrame{border-width:2px;border-radius:7px}.stageCaption{padding:4px 7px;border-radius:5px}}
  `}</style>
 </main>
}