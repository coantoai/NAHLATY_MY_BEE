"use client";
import {useState} from "react";

// VISUAL ENGINE PROOF V1: planner -> structured plan -> renderer -> context
const visualPlans=[
 {target:"القلب مضخة تحافظ على حركة الدم",operations:["FOCUS","FLOW"],zoom:1},
 {target:"رؤية البنية الداخلية",operations:["ZOOM","CUTAWAY","ISOLATE"],zoom:1.08},
 {target:"فهم الحجرات الأربع",operations:["ZOOM","ISOLATE","HIGHLIGHT"],zoom:1.12},
 {target:"فهم منع رجوع الدم",operations:["ZOOM","FOCUS","FLOW","DIRECTION"],zoom:1.22},
 {target:"تتبع رحلة الدم",operations:["FLOW","DIRECTION","SEQUENCE"],zoom:1.05},
 {target:"فهم تبادل الأكسجين",operations:["FOCUS","FLOW","DIRECTION"],zoom:1.05},
 {target:"توزيع الأكسجين للجسم",operations:["FLOW","DIRECTION"],zoom:1},
 {target:"تغذية عضلة القلب",operations:["FOCUS","HIGHLIGHT"],zoom:1.1},
 {target:"فهم الإشارة الكهربائية",operations:["FOCUS","TRACE","SEQUENCE"],zoom:1.08},
 {target:"ربط المنظومة كاملة",operations:["CONTEXT","FLOW","SEQUENCE"],zoom:1}
];

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

function DynamicScene({result}){
 const plan=result?.renderPlan||{};
 const graph=result?.experience?.sceneGraph||{};
 const graphNodes=Array.isArray(graph?.nodes)?graph.nodes.slice(0,7):[];
 const graphEdges=Array.isArray(graph?.edges)?graph.edges.slice(0,10):[];
 const step=result?.experience?.steps?.[0]||{};
 const focusIds=new Set(step?.runtime?.focusNodeIds||step?.focusNodeIds||plan.focus||[]);
 const activeEdgeIds=new Set(step?.runtime?.activeEdgeIds||step?.activeEdgeIds||[]);
 const fallback=(Array.isArray(plan.focus)&&plan.focus.length?plan.focus:["الفكرة الأساسية"]).slice(0,6).map((label,i)=>({id:"fallback-"+i,label:String(label).replaceAll("-"," "),glyph:"✦",x:[18,82,18,82,50,50][i]||50,y:[26,26,74,74,15,85][i]||50,detail:""}));
 const nodes=graphNodes.length?graphNodes:fallback;
 const byId=new Map(nodes.map(n=>[String(n.id),n]));
 const clamp=v=>Math.max(7,Math.min(93,Number(v)||50));
 return <div className={"dynamicScene theme-"+(graph?.world?.theme||result?.domain||"general")} aria-label="شرح بصري دلالي">
   <div className="dynamicAura"/>
   <div className="dynamicTarget graphTitle">{graph?.world?.label||plan.target||result?.topic||"فهم الفكرة"}</div>
   <svg className="dynamicLinks" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <defs><marker id="sceneArrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0 L5 2.5 L0 5Z" fill="#5ed4ff"/></marker></defs>
    {graphEdges.map((edge,i)=>{const a=byId.get(String(edge.from)),b=byId.get(String(edge.to));if(!a||!b)return null;const x1=clamp(a.x),y1=clamp(a.y),x2=clamp(b.x),y2=clamp(b.y),mx=(x1+x2)/2,my=Math.min(y1,y2)-Math.max(3,Math.abs(x2-x1)*.08);return <g key={edge.id||i} className={activeEdgeIds.has(String(edge.id))?"active":""}><path d={"M"+x1+" "+y1+" Q"+mx+" "+my+" "+x2+" "+y2} markerEnd="url(#sceneArrow)"/>{edge.label&&<text x={(x1+x2)/2} y={(y1+y2)/2-2}>{edge.label}</text>}</g>})}
   </svg>
   <div className="dynamicOrbit">
    {nodes.map((node,i)=><div key={node.id||i} className={"dynamicNode "+(focusIds.has(String(node.id))?"focus":"")} style={{left:clamp(node.x)+"%",top:clamp(node.y)+"%"}}><i>{node.glyph||"●"}</i><span>{node.label||node.id}</span>{node.detail&&<small>{node.detail}</small>}</div>)}
   </div>
   <div className="dynamicOp">{plan.operations?.slice(0,5).join(" · ")}</div>
   <div className={"verificationBadge "+(result?.verification?.status==="source-grounded"?"grounded":"modelOnly")}>{result?.verification?.status==="source-grounded"?"موثّق بالمصادر":"يحتاج تحققًا خارجيًا"}{result?.verification?.sources?.length?" · "+result.verification.sources.length+" مصادر":""}</div>
 </div>
}

export default function Page(){
 const [active,setActive]=useState(0);
 const [engineQuestion,setEngineQuestion]=useState("");
 const [lastQuestion,setLastQuestion]=useState("");
 const [engineResult,setEngineResult]=useState(null);
 const [engineLoading,setEngineLoading]=useState(false);
 const [engineProvider,setEngineProvider]=useState("");
 const scene=scenes[active];
 const renderPlan=engineResult?.renderPlan||null;
 const dynamicMode=Boolean(engineResult&&!engineResult.error&&engineResult.scene==null);
 const renderOps=new Set(renderPlan?.operations||[]);
 const stageClass=["stageOverlay",renderPlan?"directorActive":"",renderOps.has("FLOW")?"hasFlow":"",renderOps.has("HIGHLIGHT")?"hasHighlight":"",dynamicMode?"dynamicMode":""].filter(Boolean).join(" ");
 const stageStyle={"--directorZoom":String(renderPlan?.camera?.zoom||1)};
 const concepts=[
  {q:"ما وظيفة القلب؟",a:"مضخة تدفع الدم باستمرار عبر الجسم.",cue:"راقب القلب كمركز الحركة والدفع."},
  {q:"ماذا يوجد داخل القلب؟",a:"حجرات ومسارات تنظّم دخول الدم وخروجه.",cue:"انظر إلى الداخل بدل الشكل الخارجي فقط."},
  {q:"لماذا أربع حجرات؟",a:"لفصل الدم القادم من الجسم عن الدم العائد من الرئتين.",cue:"لاحظ جانبي القلب ومساري الدم المختلفين."},
  {q:"كيف لا يرجع الدم للخلف؟",a:"الصمامات تفتح باتجاه واحد ثم تُغلق.",cue:"تخيّلها أبوابًا أحادية الاتجاه."},
  {q:"ما رحلة الدم الكاملة؟",a:"الجسم ← القلب ← الرئتان ← القلب ← الجسم.",cue:"اتبع المسار كحلقة مستمرة، لا كخط منفصل."},
  {q:"لماذا يذهب الدم للرئتين؟",a:"ليتخلّص من ثاني أكسيد الكربون ويحمل الأكسجين.",cue:"الأزرق يذهب للرئتين، والأحمر يعود للقلب."},
  {q:"كيف يصل الأكسجين للجسم؟",a:"القلب يدفع الدم الغني بالأكسجين عبر الشرايين.",cue:"اتبع الدم الأحمر الخارج من القلب."},
  {q:"من يغذّي القلب نفسه؟",a:"الشرايين التاجية توصل الدم إلى عضلة القلب.",cue:"راقب شبكة الأوعية الملتفة على سطح القلب."},
  {q:"من ينظّم النبض؟",a:"إشارة كهربائية تبدأ النبضة وتنسّق الانقباض.",cue:"اتبع مسار الإشارة عبر عضلة القلب."},
  {q:"كيف تعمل المنظومة كلها؟",a:"النبض والصمامات والرئتان والأوعية تعمل كدورة واحدة.",cue:"اربط كل المشاهد السابقة في حلقة واحدة."}
 ];
 const concept=concepts[active];
 const visualPlan=visualPlans[active];
 async function runEngine(e){
  e.preventDefault();
  const q=engineQuestion.trim();
  if(q.length<4){setEngineResult({error:"اكتب سؤالًا أوضح قليلًا حتى أستطيع فهم ما تريد رؤيته."});return;}
  setEngineLoading(true);
  setEngineResult(null);
  setEngineProvider("");
  setLastQuestion(q);
  try{
   const response=await fetch("/api/engine",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({question:q,context:{scene:active,lastQuestion,audience:"عام",previous:engineResult&&!engineResult.error?{title:engineResult.topic,summary:engineResult.answer,domain:engineResult.domain,topic:engineResult.topic}:null}})
   });
   const payload=await response.json();
   if(!response.ok||!payload?.ok) throw new Error(payload?.error?.message||"تعذر تشغيل المحرك.");
   const result=payload.result;
   if(Number.isInteger(result?.scene)) setActive(Math.max(0,Math.min(9,result.scene)));
   setEngineProvider(payload.provider||"engine");
   setEngineResult(result);
   setEngineQuestion("");
  }catch(error){
   setEngineResult({error:error?.message||"تعذر تشغيل المحرك الآن."});
  }finally{
   setEngineLoading(false);
  }
 }
 return <main className="heartPlatform" dir="rtl">
  <section className="heartScreen" aria-label="رحلة القلب">
   <div className="referenceUI fastShell" aria-hidden="true"><div className="shellBrand">MY BEE</div><div className="shellSide"/><div className="shellAsk"/><div className="shellCards"/></div>

   <div className={stageClass} style={stageStyle}>
     {dynamicMode?<DynamicScene result={engineResult}/>:<HeartScene kind={["overview","inside","chambers","valves","flow","lungs","body","coronary","electric","whole"][active]}/>}
     {!dynamicMode&&<VisualGuide index={active}/>}
     <div className="stageCaption"><b>{dynamicMode?(engineResult?.topic||"شرح بصري"):scene.title}</b><span>{dynamicMode?(renderPlan?.target||engineResult?.explanation):scene.sub}</span></div>
   </div>

   <form className="engineAsk" onSubmit={runEngine}><input value={engineQuestion} onChange={e=>setEngineQuestion(e.target.value)} placeholder="جرّب: لماذا لا يرجع الدم؟" disabled={engineLoading}/><button disabled={engineLoading}>{engineLoading?"أفهم…":"نفّذ"}</button></form>{lastQuestion&&<div className="engineContext">Context: {lastQuestion}</div>}{engineResult&&<div className={"engineResult "+(engineResult.error?"isError":"")}><b>{engineResult.error?"لم أُنفّذ تخمينًا":"النتيجة"}</b><span>{engineResult.error||engineResult.answer}</span>{!engineResult.error&&<><small>{engineResult.explanation}</small><em>{engineResult.visualPlan?.operations?.join(" → ")}</em><i>{engineResult.verification?.status||"unverified"} · {engineResult.confidence||"low"}{engineProvider?" · "+engineProvider:""}{engineResult.verification?.sources?.length?" · sources "+engineResult.verification.sources.length:""}</i></>}</div>}
   <button className="hot brandHome" aria-label="نحلتي — العودة للرئيسية" onClick={()=>{window.location.href="/"}}/>
   <button className="hot homeNav" aria-label="العودة للرئيسية" onClick={()=>{window.location.href="/"}}/>
   {cardLeft.map((left,i)=><div key={"thumb-"+i} className={"cardThumb miniScene m"+i} style={{left:(left+.38)+"%"}}><span>{scenes[i].n}</span><b>{scenes[i].title}</b></div>)}
   {cardLeft.map((left,i)=><button key={i} className="hot cardHot" style={{left:left+"%"}} aria-label={scenes[i].title} aria-pressed={active===i} onClick={()=>setActive(i)}/>)}
   <div className="activeFrame" style={{left:cardLeft[active]+"%"}} aria-hidden="true"/>
  </section>

  <style jsx global>{`
   *{box-sizing:border-box} html,body{margin:0;background:#020812} body{overflow-x:hidden}
   .heartPlatform{min-height:100vh;background:#020812;display:flex;justify-content:center;align-items:flex-start}
   .heartScreen{position:relative;width:100%;max-width:1536px;aspect-ratio:3/2;background:#020812;overflow:hidden}
   .referenceUI{display:block;width:100%;height:100%;user-select:none}.fastShell{position:absolute;inset:0;background:radial-gradient(circle at 42% 30%,#102a3b 0,#06111d 42%,#020812 78%);border:1px solid #102536}.shellBrand{position:absolute;right:2.5%;top:2%;color:#e8b94f;font:800 clamp(10px,1.2vw,18px)/1 Arial;letter-spacing:2px}.shellSide{position:absolute;right:1.2%;top:10%;width:6.5%;height:84%;border-left:1px solid rgba(83,166,204,.18);background:rgba(3,13,23,.5)}.shellAsk{position:absolute;left:10%;top:65.7%;width:62.5%;height:5.8%;border:1px solid rgba(86,180,222,.18);border-radius:8px;background:rgba(3,15,25,.55)}.shellCards{position:absolute;left:1%;right:1%;top:74%;height:23%;border-top:1px solid rgba(83,166,204,.12)}
   .stageOverlay{position:absolute;left:9.5%;top:8.5%;width:63.55%;height:56.1%;overflow:hidden;z-index:3;background:#07111c;transition:transform .55s ease;transform-origin:center}
   .directorActive .heartArt{transform:scale(var(--directorZoom));transform-origin:50% 50%;transition:transform .7s cubic-bezier(.2,.75,.2,1)}
   .hasFlow .guidePath{animation:directorDash 1.2s linear infinite}.hasHighlight .guidePoint{filter:drop-shadow(0 0 5px #ffd76b)}
   @keyframes directorDash{to{stroke-dashoffset:-7}}
   .dynamicScene{position:absolute;inset:0;overflow:hidden;background:radial-gradient(circle at 50% 48%,#15334a 0,#081723 45%,#030913 78%);color:#eef8ff}
   .dynamicAura{position:absolute;left:30%;top:17%;width:40%;height:65%;border-radius:50%;background:radial-gradient(circle,rgba(49,177,231,.2),rgba(49,177,231,.04) 48%,transparent 72%);filter:blur(10px)}
   .dynamicTarget.graphTitle{position:absolute;left:24%;top:3.5%;width:52%;min-height:auto;display:flex;align-items:center;justify-content:center;text-align:center;padding:1.2% 2%;border-radius:999px;border:1px solid rgba(105,211,255,.3);background:rgba(7,29,43,.78);box-shadow:0 0 30px rgba(55,184,238,.12);font-size:clamp(9px,1vw,16px);font-weight:700;z-index:5}
   .dynamicOrbit{position:absolute;inset:0;z-index:3}.dynamicNode{position:absolute;transform:translate(-50%,-50%);width:18%;min-height:13%;padding:1.1% 1.2%;border-radius:14px;background:rgba(5,25,38,.88);border:1px solid rgba(95,194,235,.28);text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;box-shadow:0 0 16px rgba(45,166,216,.1);transition:.35s ease}.dynamicNode.focus{border-color:rgba(255,211,91,.75);box-shadow:0 0 24px rgba(255,197,54,.22);transform:translate(-50%,-50%) scale(1.06)}.dynamicNode i{font-style:normal;font-size:clamp(12px,1.45vw,23px);color:#f0c45d}.dynamicNode span{font-size:clamp(7px,.76vw,12px);font-weight:800}.dynamicNode small{font-size:clamp(6px,.58vw,9px);line-height:1.25;color:#9fc1d4;max-width:95%}
   .dynamicLinks{position:absolute;inset:0;width:100%;height:100%;z-index:2}.dynamicLinks path{fill:none;stroke:#51c7f5;stroke-width:.38;stroke-dasharray:1.8 1.8;opacity:.42}.dynamicLinks g.active path{stroke:#ffd25b;stroke-width:.62;opacity:.95;animation:directorDash 1.15s linear infinite}.dynamicLinks text{fill:#8dcfe8;font-size:2.25px;text-anchor:middle}.dynamicLinks g.active text{fill:#ffdf78}
   .dynamicOp{position:absolute;left:3%;bottom:3%;z-index:4;color:#75cdef;font-size:clamp(6px,.58vw,9px);letter-spacing:.5px;direction:ltr}.verificationBadge{position:absolute;right:3%;bottom:3%;z-index:4;padding:6px 9px;border-radius:999px;background:rgba(3,16,25,.8);font-size:clamp(6px,.58vw,9px);border:1px solid rgba(255,204,82,.25);color:#b8c9d3}.verificationBadge.grounded{color:#f1cd69;border-color:rgba(241,205,105,.45)}.verificationBadge.modelOnly{color:#9bb4c3}
   .engineProof{position:absolute;left:10.5%;top:9.5%;z-index:8;background:rgba(2,10,18,.84);border:1px solid rgba(90,196,244,.35);border-radius:9px;padding:7px 10px;display:flex;flex-direction:column;gap:2px;direction:rtl;pointer-events:none}.engineProof b{font-size:9px;color:#6bd0f6;letter-spacing:1px}.engineProof span{font-size:11px;color:#fff}.engineProof small{font-size:8px;color:#f4c95f;direction:ltr}.engineAsk{position:absolute;left:10%;top:65.7%;width:62.5%;height:5.8%;z-index:9;display:flex;gap:6px;direction:rtl}.engineAsk input{flex:1;min-width:0;border:1px solid rgba(86,180,222,.35);border-radius:8px;background:rgba(3,15,25,.92);color:#fff;padding:0 10px;font-size:clamp(8px,.8vw,13px)}.engineAsk button{border:0;border-radius:8px;background:#e8b94f;color:#111;font-weight:800;padding:0 14px;cursor:pointer}.engineAsk button:disabled,.engineAsk input:disabled{opacity:.65;cursor:wait}.engineContext{position:absolute;left:10.5%;top:62.4%;z-index:8;color:#8fd8f5;font-size:clamp(7px,.65vw,10px);direction:rtl}.engineResult{position:absolute;right:27.8%;top:10.5%;width:25%;z-index:8;display:flex;flex-direction:column;gap:5px;padding:10px 12px;border-radius:10px;background:rgba(2,10,18,.86);border:1px solid rgba(89,196,242,.3);color:#eaf7ff;pointer-events:none}.engineResult b{color:#f0c45d;font-size:clamp(8px,.8vw,12px)}.engineResult span{font-size:clamp(8px,.8vw,13px);line-height:1.5}.engineResult small{color:#9cc5dc;font-size:clamp(7px,.68vw,10px)}.engineResult em{font-style:normal;color:#6bd8ff;font-size:clamp(6px,.6vw,9px);direction:ltr}.engineResult i{font-style:normal;color:#7f9daf;font-size:clamp(6px,.56vw,8px);direction:ltr}.engineResult.isError{border-color:rgba(240,196,93,.35)}
   .cinematicScene{width:100%;height:100%;object-fit:cover;display:block}
   .embeddedMeaning{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen}
   .meaningPulse{position:absolute;left:47%;top:43%;width:12%;aspect-ratio:1;border:2px solid rgba(255,214,96,.82);border-radius:50%;box-shadow:0 0 18px rgba(255,205,72,.5),inset 0 0 14px rgba(255,205,72,.2)}
   .meaningFlow{position:absolute;left:57%;top:48%;font:700 clamp(18px,2.2vw,34px)/1 Arial;color:rgba(255,224,120,.88);text-shadow:0 0 12px rgba(255,193,56,.85)}
   .m4,.m5,.m6{border-color:rgba(93,205,255,.88);box-shadow:0 0 18px rgba(70,190,255,.55)}
   .m7,.m8{border-color:rgba(255,214,96,.9)}
   .conceptPanel{position:absolute;right:1.1%;top:14.2%;width:24.1%;height:43%;z-index:5;padding:2.2% 1.65%;display:flex;flex-direction:column;align-items:flex-start;text-align:right;color:#eef8ff;background:linear-gradient(180deg,rgba(4,17,29,.94),rgba(4,13,23,.91));border:1px solid rgba(73,169,216,.16);border-radius:12px}
   .conceptPanel small{color:#70c9ef;font-size:clamp(8px,.72vw,12px)}
   .conceptPanel h2{margin:8% 0 4%;font-size:clamp(13px,1.35vw,21px);line-height:1.45}
   .conceptPanel p{margin:0;color:#d3e4ee;font-size:clamp(9px,.9vw,14px);line-height:1.7}
   .lookCue{margin-top:auto;width:100%;padding:7% 8%;border-radius:10px;background:rgba(15,68,94,.35);border:1px solid rgba(87,198,246,.18);display:flex;flex-direction:column;gap:5px}
   .lookCue b{color:#ffd46b;font-size:clamp(8px,.78vw,12px)} .lookCue span{color:#b8d5e5;font-size:clamp(8px,.78vw,12px);line-height:1.55}
   .visualGuide{position:absolute;inset:0;width:100%;height:100%;z-index:4;pointer-events:none}
   .guidePath{fill:none;stroke-width:.75;stroke-linecap:round;stroke-dasharray:2.2 1.5;opacity:.92}
   .guidePoint{transform-box:fill-box;transform-origin:center;animation:guidePulse 2s ease-in-out infinite}
   @keyframes guidePulse{0%,100%{opacity:.58}50%{opacity:1}}
   .cardThumb{position:absolute;top:75.85%;width:8.45%;height:12.2%;z-index:5;overflow:hidden;border-radius:10px;pointer-events:none;background:#07111c}
   .cardThumb img{width:100%;height:100%;object-fit:cover;display:block}.miniScene{background:radial-gradient(circle at 50% 42%,#17364a,#07111c 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#dceef8;border:1px solid rgba(80,174,215,.14)}.miniScene span{color:#e8b94f;font-size:clamp(7px,.7vw,11px)}.miniScene b{margin-top:5px;font-size:clamp(7px,.68vw,10px);font-weight:600}
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