"use client";
import {useState} from "react";
import styles from "./page.module.css";

const EXAMPLES=["كيف تنقل النحلة حبوب اللقاح؟","كيف يعمل القلب؟","كيف يحدث البرق؟","كيف تعمل الخلية الشمسية؟"];

function safeText(value){
  if(value===null||value===undefined)return "";
  if(typeof value==="string"||typeof value==="number"||typeof value==="boolean")return String(value).trim();
  if(Array.isArray(value))return value.map(safeText).filter(Boolean).join(" · ");
  if(typeof value==="object"){
    for(const key of ["label","text","title","name","value","caption","description","action","meaning","cue"]){
      const text=safeText(value[key]);
      if(text)return text;
    }
    const from=safeText(value.from),to=safeText(value.to);
    if(from&&to)return from+" → "+to;
    return from||to||"";
  }
  return "";
}

function VisualOverlay({brief}){
  const labels=(Array.isArray(brief?.labels)?brief.labels:[]).map(safeText).filter(Boolean).slice(0,4);
  const devices=Array.isArray(brief?.visualDevices)?brief.visualDevices:[];
  const types=new Set(devices.map(x=>safeText(x?.type).toLowerCase()).filter(Boolean));
  const fallback=(Array.isArray(brief?.arrows)?brief.arrows:[]).map(safeText).find(Boolean);
  const primaryMotion=safeText(brief?.primaryMotion)||fallback||"";
  const showHotspots=types.has("hotspot");
  const showArrow=types.has("arrow");
  const stage=devices.find(x=>safeText(x?.type).toLowerCase()==="stage-number");
  const contrast=devices.find(x=>safeText(x?.type).toLowerCase()==="contrast-marker");
  const card=devices.find(x=>safeText(x?.type).toLowerCase()==="explanation-card");
  const scale=devices.find(x=>safeText(x?.type).toLowerCase()==="scale-indicator");
  const progress=devices.find(x=>safeText(x?.type).toLowerCase()==="progress-bar");
  const spots=[{top:"18%",right:"9%"},{top:"35%",left:"7%"},{bottom:"19%",right:"12%"},{bottom:"14%",left:"10%"}];

  if(!devices.length&&!primaryMotion&&!labels.length)return null;

  return <div className={styles.overlay} aria-hidden="true">
    {showHotspots&&labels.map((label,i)=><span key={"l-"+i} className={styles.hotspot} style={spots[i%spots.length]}>
      <i/><b>{label}</b>
    </span>)}

    {primaryMotion&&<span className={styles.motionCue} style={{top:"46%",left:"38%"}}>
      <i>{showArrow?"↗":"●"}</i><small>{primaryMotion}</small>
    </span>}

    {stage&&<span className={styles.stageCue}><b>01</b><small>{safeText(stage.label)||safeText(stage.purpose)}</small></span>}
    {contrast&&<span className={styles.contrastCue}><i/><small>{safeText(contrast.label)||safeText(contrast.purpose)}</small><i/></span>}
    {card&&<span className={styles.explainerCard}><b>{safeText(card.label)||"معلومة"}</b><small>{safeText(card.purpose)}</small></span>}
    {scale&&<span className={styles.scaleCue}><i/><small>{safeText(scale.label)||safeText(scale.purpose)}</small></span>}
    {progress&&<span className={styles.progressCue}><i/><i/><i/><small>{safeText(progress.label)||safeText(progress.purpose)}</small></span>}
  </div>
}

export default function StaticExplainer(){
  const [question,setQuestion]=useState("كيف تنقل النحلة حبوب اللقاح؟");
  const [audience,setAudience]=useState("عام");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  async function generate(){
    if(!question.trim()||loading)return;
    setLoading(true);setError("");setResult(null);
    try{
      const res=await fetch("/api/static-visual",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,audience})});
      const data=await res.json();
      if(!res.ok)throw new Error(data?.error||"تعذر التوليد");
      setResult(data);
    }catch(e){setError(e.message||"تعذر التوليد")}finally{setLoading(false)}
  }

  return <main className={styles.page} dir="rtl">
    <header className={styles.header}>
      <div className={styles.brand}><span className={styles.bee}>✦</span><div><b>نحلتي</b><small>الفكرة تصبح صورة تُفهم</small></div></div>
      <span className={styles.badge}>Static Visual MVP</span>
    </header>

    <section className={styles.hero}>
      <p className={styles.eyebrow}>شرح بصري من سؤال واحد</p>
      <h1>اكتب ما تريد أن تفهمه.<br/><span>نحلتي ترسمه لك.</span></h1>
      <p className={styles.sub}>صورة واحدة، سينمائية وواضحة، تختار وسائل الإيضاح المناسبة للفكرة: مجسمات، نقاط ساخنة، مراحل، مقاييس، بطاقات أو أسهم عند الحاجة.</p>

      <div className={styles.composer}>
        <textarea value={question} onChange={e=>setQuestion(e.target.value)} rows={3} placeholder="مثلاً: كيف يحدث التلقيح؟"/>
        <div className={styles.actions}>
          <select value={audience} onChange={e=>setAudience(e.target.value)} aria-label="الجمهور">
            <option>عام</option><option>طفل</option><option>طالب</option><option>معلّم</option><option>متخصص</option>
          </select>
          <button onClick={generate} disabled={loading}>{loading?"نحلتي تبني المشهد…":"حوّلها إلى صورة"}</button>
        </div>
      </div>

      <div className={styles.examples}>{EXAMPLES.map(x=><button key={x} onClick={()=>setQuestion(x)}>{x}</button>)}</div>
    </section>

    {error&&<div className={styles.error}>{error}</div>}

    <section className={styles.output}>
      {!result&&!loading&&<div className={styles.placeholder}>
        <div className={styles.orbit}><span>✦</span></div>
        <b>الصورة ستظهر هنا</b>
        <p>المشهد هو الشرح. لا رسوم بيانية ولا صفحات مزدحمة.</p>
      </div>}

      {loading&&<div className={styles.loading}>
        <div className={styles.scan}/>
        <p>نفهم الجوهر → نطبّق القواعد البصرية → نرتّب أولوية النظر → نفحص الفهم → نولّد الصورة</p>
      </div>}

      {result&&<figure className={styles.figure}>
        <div className={styles.scene}><img src={result.image} alt={result.title||question}/><VisualOverlay brief={result.brief}/></div>
        <figcaption><b>{result.title}</b><span>{result.understandingCheck?.pass?"✓ فحص الفهم اجتاز":"⚠ يحتاج مراجعة"} · صورة مولّدة بالذكاء الاصطناعي · راجع التفاصيل الحساسة قبل الاعتماد التعليمي الرسمي</span></figcaption>
      </figure>}
    </section>
  </main>
}
