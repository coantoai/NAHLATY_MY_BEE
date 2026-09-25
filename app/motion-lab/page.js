"use client";
import {useState} from "react";
const demos=[
 {id:"webp",name:"Animated WebP",note:"Reusable raster animation overlay",kind:"asset"},
 {id:"webm",name:"Transparent WebM",note:"Reusable video-style transparent overlay",kind:"video"},
 {id:"lottie",name:"Lottie",note:"Reusable vector-style motion asset",kind:"vector"},
 {id:"svg",name:"SVG + CSS",note:"Programmatic path generated over the image",kind:"code"}
];
export default function MotionLab(){
 const [playing,setPlaying]=useState(true); const [speed,setSpeed]=useState(1);
 return <main className="lab" dir="rtl">
  <header><span>NAHLATY • MOTION LAB</span><h1>نفس الصورة — أربع طرق لتحريك المعنى</h1><p>تجربة مستقلة: صورة القلب تبقى ثابتة، والحركة طبقة شفافة فوقها.</p>
  <div className="controls"><button onClick={()=>setPlaying(!playing)}>{playing?"إيقاف":"تشغيل"}</button>{[.5,1,2].map(x=><button className={speed===x?"on":""} onClick={()=>setSpeed(x)} key={x}>{x}×</button>)}</div></header>
  <section className="grid">{demos.map((d,i)=><article key={d.id} className={"card "+(!playing?"paused":"")} style={{"--dur":(2.6/speed)+"s"}}>
   <div className="tag">{i+1} • {d.name}</div><div className="stage">
    <img src="/heart-cinematic/heart-05.webp" alt="Heart"/>
    {d.id==="webp"&&<div className="webpSim"><i/><i/><i/><b>➜</b></div>}
    {d.id==="webm"&&<div className="webmSim">{[0,1,2,3,4,5].map(n=><i key={n} style={{"--n":n}}/>)}</div>}
    {d.id==="lottie"&&<div className="lottieSim"><span>⌁</span><span>➜</span><span>⌁</span></div>}
    {d.id==="svg"&&<svg className="svgflow" viewBox="0 0 600 400"><path id={"p"+i} d="M105 305 C180 245 205 170 285 205 S390 295 500 105"/><circle r="8"><animateMotion dur={(2.6/speed)+"s"} repeatCount="indefinite"><mpath href={"#p"+i}/></animateMotion></circle><path className="dash" d="M105 305 C180 245 205 170 285 205 S390 295 500 105"/></svg>}
   </div><h2>{d.name}</h2><p>{d.note}</p><small>{d.id==="svg"?"حقيقي: SVG/CSS برمجي":"محاكاة بصرية للـPrototype — لا ندّعي أنها codec/asset فعلي"}</small>
  </article>)}</section>
 </main>
}