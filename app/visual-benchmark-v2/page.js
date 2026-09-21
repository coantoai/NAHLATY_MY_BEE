"use client";

import {useMemo,useState} from "react";
import styles from "./page.module.css";

const TOPICS=[
 {id:"bee",label:"النحلة",title:"النحلة تربط زهرةً بأخرى",body:"حركتها هي المسار الذي ينقل المعنى من زهرة إلى أخرى.",x:49,y:43,cardX:36,cardY:35},
 {id:"nectar",label:"الرحيق",title:"الرحيق هو سبب الزيارة",body:"عند التركيز هنا يهدأ باقي المشهد ويصبح قلب الزهرة نقطة الانتباه.",x:64,y:52,cardX:67,cardY:42},
 {id:"pollen",label:"حبوب اللقاح",title:"هذه هي المادة التي تنتقل",body:"الحبيبات الدقيقة تضيء حول النحلة ثم يتبعها مسار الحركة إلى الزهرة التالية.",x:43,y:55,cardX:31,cardY:58},
 {id:"result",label:"النتيجة",title:"من النقل إلى حياة جديدة",body:"الزهرة المستقبلة تصبح هي النهاية البصرية للمسار: سبب، انتقال، ثم نتيجة.",x:82,y:31,cardX:76,cardY:37}
];

export default function VisualBenchmarkV2(){
 const [active,setActive]=useState("bee");
 const [playing,setPlaying]=useState(true);
 const [pointer,setPointer]=useState({x:0,y:0});
 const item=useMemo(()=>TOPICS.find(x=>x.id===active)||TOPICS[0],[active]);

 const move=e=>{
   const r=e.currentTarget.getBoundingClientRect();
   setPointer({
     x:((e.clientX-r.left)/Math.max(1,r.width)-.5)*2,
     y:((e.clientY-r.top)/Math.max(1,r.height)-.5)*2
   });
 };

 return <main className={styles.page}>
   <section
     className={styles.scene}
     data-playing={playing?"true":"false"}
     data-active={active}
     onPointerMove={move}
     onPointerLeave={()=>setPointer({x:0,y:0})}
     style={{"--px":pointer.x,"--py":pointer.y}}
   >
     <div className={styles.referenceLayer}/>
     <div className={styles.depthLight}/>
     <div className={styles.vignette}/>

     <div className={styles.liveBadge}><i/> BENCHMARK LIVE · تفاعلي</div>

     <div className={styles.hotspots}>
       {TOPICS.map(topic=><button
         key={topic.id}
         className={topic.id===active?styles.hotspotActive:styles.hotspot}
         style={{left:topic.x+"%",top:topic.y+"%"}}
         onClick={()=>setActive(topic.id)}
         aria-label={"استكشف "+topic.label}
       >
         <i/><span>{topic.label}</span>
       </button>)}
     </div>

     <div
       className={styles.contextCard}
       style={{left:item.cardX+"%",top:item.cardY+"%"}}
       aria-live="polite"
     >
       <small>✦ {item.label}</small>
       <b>{item.title}</b>
       <p>{item.body}</p>
       <span>● حقيقة بصريّة <em>·</em> اضغط على عنصر آخر</span>
     </div>

     <div className={styles.focusHalo} style={{left:item.x+"%",top:item.y+"%"}}/>

     <div className={styles.causalTrail} aria-hidden="true">
       {Array.from({length:7},(_,i)=><i key={i} style={{left:`${48+i*2.2}%`,top:`${47+i*.82}%`,"--delay":`${i*.16}s`}}/> )}
     </div>

     <div className={styles.pollenField} aria-hidden="true">
       {Array.from({length:22},(_,i)=><i key={i} style={{left:`${43+(i%7)*1.1}%`,top:`${51+(i%5)*.9}%`,"--delay":`${-i*.13}s`,"--dur":`${2.3+(i%6)*.28}s`,"--dx":`${(i%3-1)*8}px`}}/> )}
     </div>

     <div className={styles.motionControl}>
       <button onClick={()=>setPlaying(v=>!v)} aria-label={playing?"إيقاف الحركة":"تشغيل الحركة"}>
         {playing?"❚❚":"▶"}
       </button>
       <div><b>{playing?"المشهد حي":"المشهد متوقف"}</b><small>الحركة فقط عندما تخدم الفهم</small></div>
     </div>

     <div className={styles.exploreHint}>
       <span>↔</span>
       <div><b>حرّك المؤشر</b><small>ثم اضغط على النحلة أو عناصر الزهرة</small></div>
     </div>
   </section>
 </main>;
}
