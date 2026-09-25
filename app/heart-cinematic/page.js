"use client";
import {useState} from "react";

const REF="https://d2jqrm6oza8nb6.cloudfront.net/datasets/078beba2-aa73-4316-a80c-4a9b3146fc01.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZDQ2M2JhNDg2Y2JmMzYyOCIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MDQ2Mzk0NH0.6pzblTKmS7lOudEDHVacbwjtxoVrtUTU7qufyWrRNXY";

const cardLeft=[1.45,11.05,20.75,30.45,40.15,49.85,59.55,69.25,78.95,88.65];

const thumbCrops=[
 null,
 {x:11.6,y:75.3,w:8.8,h:13.2},
 {x:21.35,y:75.3,w:8.8,h:13.2},
 {x:31.15,y:75.3,w:8.8,h:13.2},
 {x:40.9,y:75.3,w:8.8,h:13.2},
 {x:50.65,y:75.3,w:8.8,h:13.2},
 {x:60.4,y:75.3,w:8.8,h:13.2},
 {x:70.15,y:75.3,w:8.8,h:13.2},
 {x:79.95,y:75.3,w:8.8,h:13.2},
 {x:89.65,y:75.3,w:8.8,h:13.2}
];

function cropStyle(c){
 if(!c)return {};
 return {
  backgroundImage:`url("${REF}")`,
  backgroundRepeat:"no-repeat",
  backgroundSize:`${10000/c.w}% ${10000/c.h}%`,
  backgroundPosition:`${100*c.x/(100-c.w)}% ${100*c.y/(100-c.h)}%`
 };
}

export default function Page(){
 const [active,setActive]=useState(0);
 return <main className="heartPlatform" dir="rtl">
  <section className="heartScreen" aria-label="رحلة القلب">
   <img className="platformReference" src={REF} alt="منصة نحلتي — رحلة القلب"/>

   {active>0&&<div className="mainStageSwap" aria-live="polite">
     <div className="sceneBlur" style={cropStyle(thumbCrops[active])}/>
     <div className="sceneImage" style={cropStyle(thumbCrops[active])}/>
   </div>}

   <button className="hot homeNav" aria-label="العودة للرئيسية" onClick={()=>{window.location.href="/"}}/>
   {cardLeft.map((left,i)=>
    <button
      key={i}
      className="hot cardHot"
      style={{left:left+"%"}}
      aria-label={"المشهد "+(i+1)}
      aria-pressed={active===i}
      onClick={()=>setActive(i)}
    />
   )}
   <div className="activeFrame" style={{left:cardLeft[active]+"%"}} aria-hidden="true"/>
  </section>

  <style jsx global>{`
   *{box-sizing:border-box}
   html,body{margin:0;background:#020812}
   body{overflow-x:hidden}
   .heartPlatform{min-height:100vh;background:#020812;display:flex;justify-content:center;align-items:flex-start}
   .heartScreen{position:relative;width:100%;max-width:1536px;aspect-ratio:3/2;background:#020812;overflow:hidden}
   .platformReference{display:block;width:100%;height:100%;object-fit:contain;user-select:none;-webkit-user-drag:none}

   .mainStageSwap{
     position:absolute;
     left:9.35%;
     top:8.3%;
     width:63.9%;
     height:56.8%;
     overflow:hidden;
     z-index:3;
     background:#06111c;
   }
   .sceneBlur{
     position:absolute;
     inset:-8%;
     filter:blur(18px) brightness(.55) saturate(1.15);
     transform:scale(1.14);
     opacity:.95;
   }
   .sceneImage{
     position:absolute;
     left:18%;
     top:0;
     width:64%;
     height:100%;
     background-color:#081522;
     box-shadow:0 0 60px rgba(0,0,0,.48);
   }

   .hot{position:absolute;border:0;background:transparent;cursor:pointer;padding:0;z-index:7}
   .hot:focus-visible{outline:2px solid #f7bf48;outline-offset:2px}
   .homeNav{left:.5%;top:11.2%;width:8.4%;height:6.2%}
   .cardHot{top:75.2%;width:9.2%;height:21.4%}
   .activeFrame{
     position:absolute;
     top:75.2%;
     width:9.2%;
     height:21.4%;
     border:3px solid #16a9ff;
     border-radius:16px;
     box-shadow:0 0 24px rgba(22,169,255,.9),inset 0 0 16px rgba(22,169,255,.12);
     pointer-events:none;
     z-index:6;
     transition:left .22s ease;
   }

   @media(max-width:700px){
     .heartScreen{width:100vw;height:auto;aspect-ratio:3/2}
     .activeFrame{border-width:2px;border-radius:7px}
     .sceneBlur{filter:blur(8px) brightness(.58)}
   }
  `}</style>
 </main>
}