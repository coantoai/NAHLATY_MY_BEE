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
  const fallback=(Array.isArray(brief?.arrows)?brief.arrows:[]).map(safeText).find(Boolean);
  const primaryMotion=safeText(brief?.primaryMotion)||fallback||"";
  if(!labels.length&&!primaryMotion)return null;
  const spots=[{top:"18%",right:"9%"},{top:"35%",left:"7%"},{bottom:"19%",right:"12%"},{bottom:"14%",left:"10%"}];
  return <div className={styles.overlay} aria-hidden="true">
    {labels.map((label,i)=><span key={"l-"+i} className={styles.hotspot} style={spots[i%spots.length]}>
      <i/><b>{label}</b>
    </span>)}
    {primaryMotion&&<span className={styles.motionCue} style={{top:"46%",left:"38%"}}>
      <i>↗</i><small>{primaryMotion}</small>
    </span>}
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
      <p className={styles.sub}>صورة واحدة، سينمائية وواضحة، تستخدم المشهد والأسهم والكلمات القليلة لشرح الفكرة من أول نظرة.</p>

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
        <p>نفهم الجوهر → نحدد ما لا يكتمل الفهم بدونه → نختار المشهد → نولّد الصورة</p>
      </div>}

      {result&&<figure className={styles.figure}>
        <div className={styles.scene}><img src={result.image} alt={result.title||question}/><VisualOverlay brief={result.brief}/></div>
        <figcaption><b>{result.title}</b><span>صورة مولّدة بالذكاء الاصطناعي · راجع التفاصيل الحساسة قبل الاعتماد التعليمي الرسمي</span></figcaption>
      </figure>}
    </section>
  </main>
}
