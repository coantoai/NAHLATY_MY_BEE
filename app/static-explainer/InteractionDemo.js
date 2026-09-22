"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function InteractionDemo(){
  const [focus,setFocus]=useState("");
  const [run,setRun]=useState(0);

  const selected = id => focus===id ? styles.demoNodeSelected : styles.demoNode;

  return <div className={styles.liveDemo}>
    <div className={styles.liveDemoTop}>
      <div>
        <b>تجربة تفاعل مباشرة</b>
        <small>اضغط على العنصر. الحركة تعمل محليًا بدون AI جديد.</small>
      </div>
      <button type="button" onClick={()=>setRun(v=>v+1)}>↻ أعد الحركة</button>
    </div>

    <div className={styles.demoScene}>
      <svg key={run} viewBox="0 0 1000 560" role="img" aria-label="مسار الطاقة من الشمس إلى اللوح الشمسي ثم المصباح">
        <defs>
          <linearGradient id="panel" x1="0" x2="1">
            <stop offset="0%" stopColor="#243a4a"/>
            <stop offset="100%" stopColor="#172530"/>
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <circle cx="150" cy="135" r="58" className={styles.demoSun}/>
        <g className={selected("sun")} onClick={()=>setFocus(focus==="sun"?"":"sun")} role="button" tabIndex="0">
          <circle cx="150" cy="135" r="78" className={styles.demoHit}/>
          <text x="150" y="235" textAnchor="middle">الشمس</text>
        </g>

        <g className={selected("panel")} onClick={()=>setFocus(focus==="panel"?"":"panel")} role="button" tabIndex="0">
          <polygon points="360,250 610,205 675,365 425,410" fill="url(#panel)" className={styles.demoPanel}/>
          <line x1="410" y1="260" x2="645" y2="220" className={styles.demoGrid}/>
          <line x1="435" y1="318" x2="665" y2="278" className={styles.demoGrid}/>
          <line x1="470" y1="238" x2="530" y2="392" className={styles.demoGrid}/>
          <line x1="545" y1="225" x2="605" y2="379" className={styles.demoGrid}/>
          <text x="520" y="450" textAnchor="middle">اللوح الشمسي</text>
        </g>

        <path d="M205 160 C290 185 315 225 365 275" className={styles.demoPhotonBase}/>
        <path d="M205 160 C290 185 315 225 365 275" className={styles.demoPhotonFlow}/>

        <path d="M655 345 C760 370 790 350 835 320" className={styles.demoWire}/>
        <path d="M655 345 C760 370 790 350 835 320" className={styles.demoCurrent}/>

        <g className={selected("lamp")} onClick={()=>setFocus(focus==="lamp"?"":"lamp")} role="button" tabIndex="0">
          <circle cx="855" cy="285" r="48" className={styles.demoLampGlow} filter="url(#softGlow)"/>
          <circle cx="855" cy="285" r="31" className={styles.demoLamp}/>
          <rect x="840" y="315" width="30" height="42" rx="7" className={styles.demoLampBase}/>
          <text x="855" y="405" textAnchor="middle">المصباح</text>
        </g>
      </svg>

      {focus && <div className={styles.demoFocusLabel}>
        {focus==="sun" && "مصدر الطاقة"}
        {focus==="panel" && "هنا تتحول طاقة الضوء إلى كهرباء"}
        {focus==="lamp" && "تصل الكهرباء فيتغير وضع المصباح إلى ON"}
      </div>}
    </div>

    <div className={styles.liveDemoHint}>اضغط: الشمس ← اللوح ← المصباح</div>
  </div>;
}
