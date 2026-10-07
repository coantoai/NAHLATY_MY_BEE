"use client";
import { cardiacOutputLitersPerMinute } from "../lib/heartSemanticVector";

export default function HeartScienceControls({bpm,labels,vessels,flow,onBpm,onLabels,onVessels,onFlow,onReset}){
 return <div className="scienceControls" dir="rtl">
  <div className="scienceControlsBar">
   <label>النبض التعليمي <input aria-label="BPM" type="range" min="40" max="180" value={bpm} onChange={event=>onBpm(Number(event.target.value))}/><output>{bpm} BPM</output></label>
   <button type="button" aria-pressed={labels} onClick={onLabels}>{labels?"إخفاء التسميات":"إظهار التسميات"}</button>
   <button type="button" aria-pressed={vessels} onClick={onVessels}>{vessels?"إخفاء الأوعية":"إظهار الأوعية"}</button>
   <button type="button" aria-pressed={flow} onClick={onFlow}>{flow?"إخفاء مسار الدم":"إظهار مسار الدم"}</button>
   <button type="button" onClick={onReset}>إعادة الضبط</button>
  </div>
  <p>النتاج القلبي التعليمي <output data-testid="cardiac-output">{cardiacOutputLitersPerMinute(bpm).toFixed(1)} L/min</output> <small>HR × 70 mL ÷ 1000؛ حجم ضربة ثابت للتوضيح، وليس قياسًا للمستخدم.</small></p>
  <p className="scienceControlsNote">مقطع تعليمي أصلي؛ التشريح ومسار الدورة الطبيعية موثقان، والرسم وتوقيت الصمامات تقريبيان. الأحمر والأزرق اصطلاح بصري؛ الدم ليس أزرق. ليس محاكاة طبية أو تشريحًا مقاسًا. لا يعرض هذا المقطع التروية التاجية أو مسارات التوصيل الكهربائي. <a href="https://www.nhlbi.nih.gov/health/heart/anatomy" target="_blank" rel="noreferrer">المرجع العلمي ↗</a></p>
  <style jsx global>{`
   .scienceControls{padding:14px;margin:14px 0;border:1px solid #29495a;border-radius:14px;background:#0b1824;color:#dcecf5}
   .scienceControlsBar{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
   .scienceControlsBar label{display:flex;gap:10px;align-items:center;flex:1;min-width:min(260px,100%);font-size:13px}
   .scienceControlsBar input{flex:1;min-width:65px;accent-color:#65dcc8}
   .scienceControlsBar button{padding:8px 11px;background:#122737;border:1px solid #355064;border-radius:9px;color:#deeff7;cursor:pointer}
   .scienceControls output{display:inline-block;direction:ltr;white-space:nowrap;color:#82dce7;font-variant-numeric:tabular-nums}
   .scienceControls p{font-size:13px;line-height:1.8;margin:12px 0 0}.scienceControls small,.scienceControlsNote{color:#9fb6c5}.scienceControls a{color:#82dce7}
   [data-heart-labels="hidden"] .graphNode{visibility:hidden!important}
   [data-heart-flow="hidden"] #blood-interior{visibility:hidden}
   .scientificHeartExperience{display:block!important}
   .scientificHeartExperience .beeRail{display:none!important}
   .scientificHeartExperience>main{width:100%!important;max-width:100%;min-width:0}
   .scientificHeartExperience .workspace{display:block;width:100%;min-width:0}
   .scientificHeartExperience .viewer{min-width:0;width:100%}
   .scientificHeartExperience .explainHeader>div:first-child{min-width:0;flex:1;overflow-wrap:anywhere}
   .scientificHeartExperience .dynamicScene{min-height:620px}
   .scientificHeartExperience .dynamicScene .graphNode{height:auto!important;min-height:35px!important}
   @media(max-width:820px){.scientificHeartExperience .viewerTop{flex-wrap:wrap;gap:8px}.scientificHeartExperience .dynamicScene{min-height:560px}}
  `}</style>
 </div>;
}
