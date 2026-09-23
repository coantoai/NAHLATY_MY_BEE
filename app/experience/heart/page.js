"use client";

import { useEffect, useRef, useState } from "react";
import HeartWorld from "./HeartWorld";
import styles from "./page.module.css";

const START = {
  scene: "overview",
  title: "اسأل، وشاهد كيف يعمل",
  answer: "هذا العالم يبدأ من القلب. اسأل عن رحلة الدم، ثم اسأل سؤالًا ثانيًا وأنت تشاهد: سيتغيّر المشهد نفسه بدل فتح شرح منفصل.",
  cue: "تستطيع تدوير المشهد وإيقاف الحركة، أو اختيار مرحلة لتجربتها فورًا.",
  valveMode: "normal"
};
const SCENE_TEXT = {
  overview: START,
  flow: {
    scene: "flow", title: "رحلة الدم",
    answer: "يصل الدم الأقل أكسجة إلى الجهة اليمنى من القلب، ثم يتجه إلى الرئتين. ويعود الدم الغني بالأكسجين إلى الجهة اليسرى، فتدفعه إلى الجسم.",
    cue: "تتبّع المسارين داخل المشهد.", valveMode: "normal"
  },
  valve: {
    scene: "valve", title: "لماذا لا يعود الدم؟",
    answer: "يفتح الصمام ويغلق استجابةً لفرق الضغط. عندما ينعكس فرق الضغط، تلتقي وريقاته وتمنع رجوع الدم.",
    cue: "راقب الصمام وهو يفتح ثم يغلق.", valveMode: "normal"
  },
  leak: {
    scene: "leak", title: "عندما لا يُغلق الصمام",
    answer: "هذه محاكاة مبسطة لارتجاع الدم عبر صمام لا يُغلق جيدًا. هي توضيح لمبدأ الحركة وليست محاكاة تشخيصية.",
    cue: "راقب التيار الذي يعود عكس الاتجاه.", valveMode: "leaky"
  },
  effect: {
    scene: "effect", title: "الأثر على الدورة",
    answer: "رجوع جزء من الدم قد يضيف عبئًا على القلب. يعتمد الأثر الحقيقي على عوامل سريرية لا تقيسها هذه التجربة.",
    cue: "قارن تدفق الدم قبل التسرب وبعده.", valveMode: "leaky"
  }
};
const GUIDE = [
  { scene: "flow", question: "كيف الدم بيمشي جوّا القلب؟" },
  { scene: "valve", question: "ليش الدم ما بيرجع لورا؟" },
  { scene: "leak", question: "شو بيصير لو الصمام ما سكّر منيح؟" },
  { scene: "effect", question: "ليش هالشي ممكن يكون مشكلة؟" }
];

export default function HeartExperiencePage() {
  const [world, setWorld] = useState(START);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [needsAccess, setNeedsAccess] = useState(false);
  const input = useRef(null);

  useEffect(() => {
    try {
      const draft = window.localStorage.getItem("nahlaty-heart-experience-v1");
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed?.world?.scene in SCENE_TEXT && Array.isArray(parsed.history)) {
          setWorld(parsed.world);
          setHistory(parsed.history.slice(-10));
          setSaved(true);
        }
      }
    } catch {}
  }, []);

  async function ask(value = question) {
    const q = String(value || "").trim();
    if (q.length < 3 || loading) {
      if (q.length < 3) setError("اكتب سؤالك أولًا.");
      return;
    }
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch("/api/experience/heart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessCode ? { "x-nahlaty-access-code": accessCode.trim() } : {})
        },
        body: JSON.stringify({
          question: q,
          currentScene: world.scene,
          history: history.slice(-4).map(item => ({ question: item.question, scene: item.scene }))
        })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) setNeedsAccess(true);
        throw new Error(data?.error || "تعذّر الاتصال بالمساعد.");
      }
      setNeedsAccess(false);
      setWorld({
        scene: data.scene,
        title: data.title,
        answer: data.answer,
        cue: data.cue,
        valveMode: data.valveMode
      });
      setHistory(prev => [...prev, {
        question: q, scene: data.scene, answer: data.answer
      }].slice(-10));
      setQuestion("");
      setPlaying(true);
    } catch (err) {
      setError(String(err?.message || "تعذّر فهم السؤال."));
    } finally {
      setLoading(false);
    }
  }

  function guided(scene) {
    setWorld(SCENE_TEXT[scene]);
    setPlaying(true);
    setError("");
    setSaved(false);
  }

  function save() {
    try {
      window.localStorage.setItem("nahlaty-heart-experience-v1", JSON.stringify({
        version: 1, world, history, savedAt: new Date().toISOString()
      }));
      setSaved(true);
      setError("");
    } catch {
      setError("لم يمكن حفظ التجربة على هذا الجهاز.");
    }
  }

  return (
    <main className={styles.page} dir="rtl">
      <header className={styles.top}>
        <div className={styles.brand}><span className={styles.mark}>✦</span><span>نحلتي <small>MY BEE</small></span></div>
        <span className={styles.preview}>تجربة خاصة · نسخة أولى</span>
      </header>

      <section className={styles.intro}>
        <div className={styles.introText}>
          <div className={styles.eyebrow}>تجربة فهم بصري حيّة</div>
          <h1>لا تشرح لي القلب.<br/><em>أرِني كيف يعمل.</em></h1>
          <p>ابدأ بسؤال. شاهد الإجابة داخل المشهد، ثم اسأل مرة أخرى. العالم نفسه يواصل الرحلة معك.</p>
        </div>
        <div className={styles.number}><strong>01</strong><span>عالم القلب</span></div>
      </section>

      <section className={styles.workspace} aria-label="عالم القلب التفاعلي">
        <div className={styles.sceneArea}>
          <HeartWorld sceneName={world.scene} valveMode={world.valveMode} playing={playing}/>
          <div className={styles.sceneTop}><span className={styles.liveDot}/>{playing ? "المشهد يعمل" : "المشهد متوقف"}<span className={styles.sceneDivider}/>رسم تعليمي مبسّط</div>
          <div className={styles.sceneBottom}>
            <button type="button" onClick={() => setPlaying(v => !v)}>{playing ? "إيقاف الحركة" : "تشغيل الحركة"}</button>
            <button type="button" onClick={() => {guided("overview");setPlaying(true);}}>المشهد الكامل</button>
          </div>
        </div>

        <aside className={styles.panel}>
          <div className={styles.panelKicker}>ما الذي نراه الآن؟</div>
          <h2>{world.title}</h2>
          <p className={styles.answer} aria-live="polite">{world.answer}</p>
          <div className={styles.visualCue}><span>داخل المشهد</span><p>{world.cue}</p></div>
          <div className={styles.sequenceTitle}>استكشف بنفسك</div>
          <div className={styles.guides}>
            {GUIDE.map((item, index) => (
              <button key={item.scene} type="button" onClick={() => guided(item.scene)}
                className={world.scene === item.scene ? styles.selected : ""}>
                <span>{String(index + 1).padStart(2, "0")}</span>{item.question}
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className={styles.ask} aria-label="اسأل عن المشهد الحالي">
        <div className={styles.askTop}>
          <div><span className={styles.eyebrow}>اسأل المشهد نفسه</span><h2>شو بدك تفهم هلأ؟</h2></div>
          <span className={styles.hint}>أسئلة متابعة حرّة · يجيب عنها AI عند الاتصال</span>
        </div>
        <form onSubmit={event => {event.preventDefault();ask();}} className={styles.form}>
          <input ref={input} value={question} onChange={event => setQuestion(event.target.value)}
            maxLength={400} disabled={loading} placeholder="مثلاً: طيب ليش ما بيرجع الدم لورا؟" aria-label="سؤالك"/>
          <button type="submit" disabled={loading || question.trim().length < 3}>{loading ? "يفهم سؤالك…" : "اسأل ←"}</button>
        </form>
        {needsAccess && <div className={styles.access}><label htmlFor="heart-access">رمز الدعوة</label><input id="heart-access" type="password" value={accessCode} onChange={event => setAccessCode(event.target.value)} placeholder="أدخل رمز الوصول إلى التجربة"/></div>}
        {error && <div className={styles.error} role="alert">{error}</div>}
        {history.length > 0 && <div className={styles.history}>
          <div className={styles.historyTitle}>رحلتك في نفس العالم</div>
          {history.slice(-3).map((item, index) => <p key={index}><span>سألتَ:</span> {item.question}</p>)}
        </div>}
        <div className={styles.footer}>
          <span>التجربة تعليمية وليست أداة للتشخيص أو العلاج. المسارات والأحجام مبسّطة لتوضيح المبدأ.</span>
          <button type="button" onClick={save}>{saved ? "✓ محفوظة على هذا الجهاز" : "احفظ رحلتي"}</button>
        </div>
      </section>
    </main>
  );
}
