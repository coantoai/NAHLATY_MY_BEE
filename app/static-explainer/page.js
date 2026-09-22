"use client";
import {useState} from "react";
import styles from "./page.module.css";
import InteractionRuntime from "./InteractionRuntime";

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
        <div className={styles.scene}><InteractionRuntime image={result.image} alt={result.title||question} plan={result.interactionPlan} anchors={result.brief?.semanticAnchors}/></div>
        <figcaption><b>{result.title}</b><span>{result.understandingCheck?.pass?"✓ فحص الفهم اجتاز":"⚠ يحتاج مراجعة"} · صورة مولّدة بالذكاء الاصطناعي · راجع التفاصيل الحساسة قبل الاعتماد التعليمي الرسمي</span></figcaption>
      </figure>}
    </section>
  </main>
}
