"use client";

import { useState } from "react";
import styles from "./page.module.css";
import MYBEE_REFERENCE from "../mybee-reference-data";

export default function InteractionDemo(){
  const [mode,setMode]=useState("flow");
  const [run,setRun]=useState(0);

  function replay(){
    setRun(v=>v+1);
  }

  return <div className={styles.cinematicDemo}>
    <div className={styles.cinematicFrame} data-mode={mode}>
      <img className={styles.cinematicImage} src={MYBEE_REFERENCE} alt="مشهد سينمائي توضيحي للتلقيح"/>

      <div className={styles.cinematicShade}/>

      <div className={styles.cinematicCopy}>
        <span>تجربة تفاعلية على مشهد سينمائي</span>
        <b>كيف تنقل النحلة حبوب اللقاح؟</b>
        <small>المشهد يبقى هو البطل. التفاعل يشرح ما يحدث داخله.</small>
      </div>

      <div key={run} className={styles.pollenLayer} aria-hidden="true">
        {Array.from({length:12}).map((_,i)=><i key={i} style={{"--i":i}}/>)}
      </div>

      <div className={styles.cinematicFocus} aria-hidden="true"/>

      <div className={styles.cinematicControls}>
        <button className={mode==="flow"?styles.cinematicControlActive:""} onClick={()=>setMode("flow")}>
          تتبّع حبوب اللقاح
        </button>
        <button className={mode==="focus"?styles.cinematicControlActive:""} onClick={()=>setMode("focus")}>
          ركّز على النحلة
        </button>
        <button onClick={()=>{setMode("flow");replay();}}>
          ↻ إعادة
        </button>
      </div>

      <div className={styles.cinematicHint}>
        {mode==="focus" ? "تم عزل نقطة التركيز بصريًا بدون تغيير المشهد." : "الحركة تمثل انتقال حبوب اللقاح، وليست مؤثرًا زخرفيًا."}
      </div>
    </div>
  </div>;
}
