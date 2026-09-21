"use client";

import {useMemo,useState} from "react";
import styles from "./page.module.css";

const TOPICS=[
 {id:"bee",label:"النحلة",kicker:"الكائن الناقل",title:"النحلة تربط زهرةً بأخرى",body:"نركّز على النحلة لأنها العنصر الذي ينقل حبوب اللقاح بين الأزهار. الحركة هنا هادئة: مسار ضوء قصير يوضح الانتقال فقط.",x:47,y:43,tone:"gold"},
 {id:"nectar",label:"الرحيق",kicker:"سبب الزيارة",title:"الرحيق يجذب النحلة إلى الزهرة",body:"الرحيق مصدر غذاء غني بالسكريات. عند اختيار هذه النقطة يهدأ باقي المشهد ويصبح مركز الزهرة هو نقطة الانتباه.",x:65,y:53,tone:"amber"},
 {id:"pollen",label:"حبوب اللقاح",kicker:"ما الذي ينتقل؟",title:"حبوب اللقاح تلتصق بجسم النحلة",body:"الحبيبات الدقيقة تظهر حول الأرجل والجسم، ثم ينتقل الضوء معها باتجاه الزهرة التالية بدل إضافة كلام طويل.",x:42,y:60,tone:"pollen"},
 {id:"result",label:"النتيجة",kicker:"من السبب إلى الأثر",title:"انتقال اللقاح يساعد الزهرة على التكاثر",body:"آخر لحظة في المشهد تُظهر النتيجة بصريًا: الزهرة المستقبِلة تضيء وتظهر إشارة حياة جديدة، من دون تحويل الشرح إلى لوحة بيانات.",x:79,y:34,tone:"green"}
];

export default function VisualBenchmarkV2(){
 const [active,setActive]=useState("bee");
 const [playing,setPlaying]=useState(true);
 const [pointer,setPointer]=useState({x:0,y:0});
 const item=useMemo(()=>TOPICS.find(x=>x.id===active)||TOPICS[0],[active]);
 const progress=(TOPICS.findIndex(x=>x.id===active)+1)/TOPICS.length*100;

 const move=e=>{
   const r=e.currentTarget.getBoundingClientRect();
   const x=((e.clientX-r.left)/r.width-.5)*2;
   const y=((e.clientY-r.top)/r.height-.5)*2;
   setPointer({x,y});
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
     <div className={styles.depthLayer}/>
     <div className={styles.warmLight}/>
     <div className={styles.vignette}/>

     <header className={styles.topbar}>
       <div className={styles.brand}><span>✦</span><div><b>نحلتي</b><small>VISUAL BENCHMARK · R2</small></div></div>
       <div className={styles.topStatus}><i/> المرجع البصري المعتمد · مشهد حي</div>
     </header>

     <aside className={styles.explanationCard}>
       <small>{item.kicker}</small>
       <h1>{item.title}</h1>
       <p>{item.body}</p>
       <div className={styles.truth}><i/> حقيقة <span>•</span> الحركة تخدم الفهم</div>
     </aside>

     <div className={styles.hotspots}>
       {TOPICS.map(topic=><button
         key={topic.id}
         className={topic.id===active?styles.hotspotActive:styles.hotspot}
         style={{left:topic.x+"%",top:topic.y+"%"}}
         onClick={()=>setActive(topic.id)}
         aria-label={"استكشف "+topic.label}
       >
         <i/>
         <span>{topic.label}</span>
       </button>)}
     </div>

     <div className={styles.causalPath} aria-hidden="true">
       <span className={styles.pathDot+" "+styles.p1}/>
       <span className={styles.pathDot+" "+styles.p2}/>
       <span className={styles.pathDot+" "+styles.p3}/>
       <span className={styles.pathDot+" "+styles.p4}/>
     </div>

     <div className={styles.focusHalo} style={{left:item.x+"%",top:item.y+"%"}}/>

     <div className={styles.microParticles} aria-hidden="true">
       {Array.from({length:18},(_,i)=><i key={i} style={{"--i":i}}/> )}
     </div>

     <nav className={styles.journey} aria-label="رحلة التلقيح">
       {TOPICS.map((topic,i)=><button
         key={topic.id}
         onClick={()=>setActive(topic.id)}
         className={topic.id===active?styles.journeyActive:""}
       >
         <span>{String(i+1).padStart(2,"0")}</span>
         <div><small>{topic.kicker}</small><b>{topic.label}</b></div>
       </button>)}
     </nav>

     <div className={styles.controls}>
       <button onClick={()=>setPlaying(v=>!v)} className={styles.playButton}>
         {playing?"❚❚":"▶"} <span>{playing?"إيقاف الحركة":"تشغيل الحركة"}</span>
       </button>
       <div className={styles.progress}><i style={{width:progress+"%"}}/></div>
       <span>{TOPICS.findIndex(x=>x.id===active)+1} / {TOPICS.length}</span>
     </div>

     <div className={styles.interactionHint}>
       <b>جرّب بنفسك</b>
       <span>حرّك المؤشر للمشهد · اضغط على العناصر</span>
     </div>

     <div className={styles.modeNote}>
       <i>✦</i>
       <span>المشهد أولاً</span>
       <small>النص فقط يدعم ما تراه</small>
     </div>
   </section>
 </main>;
}
