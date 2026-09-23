"use client";

import { useCallback, useState } from "react";
import HeartWorld from "./HeartWorld";
import { applyIntent, DEFAULT_WORLD, LESSONS, localIntent } from "../lib/prototype1/heartDirector";
import styles from "./page.module.css";

const EXAMPLES = [
  "كيف الدم بيمشي جوّا القلب؟",
  "ليش الدم ما بيرجع لورا؟",
  "شو بيصير إذا الصمام ما سكر منيح؟",
  "ليش هيدا ممكن يضر؟"
];

export default function PrototypeOnePage() {
  const [world, setWorld] = useState({ ...DEFAULT_WORLD });
  const [answer, setAnswer] = useState(LESSONS.flow);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [engine, setEngine] = useState("scene");
  const [notice, setNotice] = useState("");
  const [phase, setPhase] = useState("الامتلاء: الصمام التاجي مفتوح");
  const [activeQuestion, setActiveQuestion] = useState("كيف يتحرك الدم في القلب الأيسر؟");

  const ask = async (asked) => {
    const text = String(asked ?? question).trim();
    if (!text || busy) return;
    setBusy(true);
    setQuestion("");
    setNotice("");
    try {
      const response = await fetch("/api/prototype-1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, world, history })
      });
      const result = await response.json();
      if (!response.ok || !result?.world || !result?.lesson) {
        throw new Error(result?.error || "تعذّر توجيه السؤال.");
      }
      setWorld(result.world);
      setAnswer(result.lesson);
      setEngine(result.engine);
      setNotice(result.notice || "");
      setActiveQuestion(text);
      setHistory(previous => [...previous, { question: text, intent: result.intent }].slice(-5));
    } catch {
      const decision = applyIntent(localIntent(text, world), world);
      setWorld(decision.world);
      setAnswer(decision.lesson);
      setEngine("local");
      setNotice("تعذّر الاتصال بالخادم. عمل التفسير المحلي المحدود بدل AI؛ لن ندّعي أنه فهم سؤالًا خارج النطاق.");
      setActiveQuestion(text);
      setHistory(previous => [...previous, { question: text, intent: decision.intent }].slice(-5));
    } finally {
      setBusy(false);
    }
  };

  const selectValve = useCallback(() => {
    setWorld(previous => applyIntent("valve", previous).world);
    setAnswer(LESSONS.valve);
    setActiveQuestion("لمست الصمام التاجي");
    setEngine("interaction");
    setNotice("");
  }, []);

  const togglePlayback = () => {
    const intent = world.playing ? "pause" : "resume";
    const result = applyIntent(intent, world);
    setWorld(result.world);
    setAnswer(result.lesson);
    setEngine("interaction");
    setNotice("");
  };

  const restore = () => {
    const result = applyIntent("restore", world);
    setWorld(result.world);
    setAnswer(result.lesson);
    setEngine("interaction");
    setActiveQuestion("أعد الصمام إلى حالته الطبيعية");
    setNotice("");
  };

  return (
    <main className={styles.page} dir="rtl">
      <header className={styles.header}>
        <div className={styles.brand}><span className={styles.symbol}>✳</span><span>نحلتي <small>MY BEE</small></span></div>
        <div className={styles.prototype}>PROTOTYPE 01 · تجربة محدودة</div>
      </header>

      <section className={styles.intro}>
        <div className={styles.introCopy}>
          <span className={styles.kicker}>عالم واحد، يستمر مع أسئلتك</span>
          <h1>لا تشرح لي.<br/><em>أرِني كيف يعمل.</em></h1>
          <p>اسأل عن حركة الدم في القلب الأيسر. ثم اسأل عن الصمام، أو غيّر حالته. لن نبدّل الصورة: سيستمر المشهد نفسه ويتحوّل مع سؤالك.</p>
        </div>
        <div className={styles.scope}><span>نطاق التجربة</span><strong>القلب الأيسر والصمام التاجي</strong><small>نموذج تفسيري ثلاثي الأبعاد، وليس تشريحًا كاملًا أو تشخيصًا طبيًا.</small></div>
      </section>

      <section className={styles.experience} aria-label="تجربة نحلتي التفاعلية">
        <div className={styles.scene}>
          <HeartWorld world={world} onSelectValve={selectValve} onPhase={setPhase}/>
          <div className={styles.sceneTop}>
            <span className={styles.live}><i/> نفس المشهد · {world.playing ? "يعمل" : "متوقف"}</span>
            <span className={world.leaky ? styles.leakState : styles.normalState}>{world.leaky ? "الصمام: ارتجاع تجريبي" : "الصمام: طبيعي"}</span>
          </div>
          <div className={styles.sceneBottom}>
            <div><small>ما يحدث الآن</small><strong>{phase}</strong></div>
            <div className={styles.sceneLegend}><span><i className={styles.forward}/> تدفق طبيعي</span>{world.leaky && <span><i className={styles.backward}/> ارتجاع</span>}</div>
          </div>
        </div>

        <div className={styles.belowScene}>
          <article className={styles.explanation} aria-live="polite">
            <span className={styles.micro}>سؤالك الحالي</span>
            <small className={styles.userQuestion}>{activeQuestion}</small>
            <h2>{answer.title}</h2>
            <p>{answer.explanation}</p>
            <div className={styles.directorCue}><span>كيف تغيّر المشهد؟</span>{answer.cue}</div>
            <div className={styles.engineNote}>{engine === "ai" ? "فهم السؤال: Gemini AI · الحركة: محرك نحلتي" : engine === "scene" ? "المشهد الأولي جاهز للاستكشاف" : engine === "interaction" ? "تفاعل مباشر داخل المشهد" : "تفسير محلي محدود · ليس فهمًا حرًا من AI"}</div>
            {notice && <p className={styles.notice} role="status">{notice}</p>}
          </article>

          <div className={styles.composer}>
            <form onSubmit={event => { event.preventDefault(); ask(); }}>
              <label htmlFor="p1-question">اسأل المشهد الآن</label>
              <div className={styles.promptRow}>
                <input id="p1-question" type="text" value={question} maxLength={420}
                  onChange={event => setQuestion(event.target.value)}
                  placeholder="مثلاً: ليش الصمام ما بيسمح للدم يرجع؟"
                  disabled={busy} autoComplete="off"/>
                <button className={styles.askButton} type="submit" disabled={busy || !question.trim()}>
                  {busy ? "عم نفهم…" : "اسأل ↗"}
                </button>
              </div>
            </form>
            <div className={styles.suggestions}>
              <span>جرّب سؤال متابعة، أو اكتب سؤالك بطريقتك:</span>
              {EXAMPLES.map(sample => <button type="button" key={sample} onClick={() => ask(sample)} disabled={busy}>{sample}</button>)}
            </div>
            <div className={styles.actions}>
              <button type="button" onClick={togglePlayback}>{world.playing ? "إيقاف الحركة" : "متابعة الحركة"}</button>
              <button type="button" onClick={restore} disabled={!world.leaky}>إرجاع الصمام للطبيعي</button>
              <span>اسحب لتدوير القلب · المس الصمام للتقريب</span>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        هذا اختبار حقيقي لاستمرارية المشهد وتوجيه الأسئلة ضمن نطاق محدود. حركة الدم والضغط هنا مبسّطة ولا تحسب قياسات طبية أو نتائج علاج.
        <span>المراجع العلمية: <a href="https://www.heart.org/en/health-topics/heart-valve-problems-and-disease/about-heart-valves" target="_blank" rel="noopener noreferrer">صمامات القلب – AHA</a> · <a href="https://www.heart.org/en/health-topics/heart-valve-problems-and-disease/heart-valve-problems-and-causes/problem-mitral-valve-regurgitation" target="_blank" rel="noopener noreferrer">ارتجاع الصمام التاجي – AHA</a></span>
      </footer>
    </main>
  );
}
