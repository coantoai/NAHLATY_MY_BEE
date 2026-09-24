"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import styles from "./discovery.module.css";
const heart=[
["كيف يتحرّك الدم داخل القلب؟","الصورة الكاملة","رحلة الدم من الجسم إلى الرئتين ثم إلى الجسم مجددًا."],
["من وين بيرجع الدم للقلب؟","الوريدان الأجوفان","يعود الدم من الجسم إلى الأذين الأيمن."],
["شو بيعمل الأذين الأيمن؟","حجرة الاستقبال","يمرّر الدم إلى البطين الأيمن عبر الصمام ثلاثي الشرفات."],
["ليش الدم ما بيرجع لورا؟","الصمام ثلاثي الشرفات","يساعد الصمام على منع ارتداد الدم أثناء انقباض البطين."],
["كيف الدم بيطلع من البطين الأيمن؟","الضخ إلى الرئتين","يندفع الدم عبر الصمام الرئوي إلى الشريان الرئوي."],
["ليش الدم بيروح عالرئتين؟","الدورة الرئوية","ينتقل الدم إلى الرئتين لتبادل الغازات."],
["شو بيصير للدم بالرئتين؟","تبادل الأكسجين","يأخذ الدم الأكسجين ويتخلّص من جزء من ثاني أكسيد الكربون."],
["كيف بيرجع الدم من الرئتين؟","الأوردة الرئوية","يعود الدم الغني بالأكسجين إلى الأذين الأيسر."],
["كيف بيشتغل الصمام المترالي؟","العبور إلى البطين الأيسر","يسمح بمرور الدم إلى البطين الأيسر ويساعد على منع ارتداده."],
["ليش البطين الأيسر عضلته أقوى؟","حجرة الضخ الرئيسية","يولّد الضغط اللازم لدفع الدم إلى الجسم."],
["شو وظيفة الصمام الأبهري؟","البوابة نحو الأبهر","يساعد على منع رجوع الدم من الأبهر إلى البطين."],
["وين بيروح الدم بعد القلب؟","الأبهر والجسم","ينتقل الدم إلى أنسجة الجسم ثم يعود إلى القلب."]
];
const symbols=["♥","↙","◉","◇","↗","◎","✦","↩","◇","♥","⇧","∞"];
function loadHistory(){try{return JSON.parse(localStorage.getItem("nahlaty-discovery-world-v1")||"[]")}catch{return []}}
export default function DiscoveryWorld(){
 const [question,setQuestion]=useState(""),[result,setResult]=useState(null),[active,setActive]=useState(0),[history,setHistory]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[showMap,setShowMap]=useState(true);
 const strip=useRef(null);
 useEffect(()=>{setHistory(loadHistory())},[]);
 const cards=result?.steps?.length?result.steps.map((s,i)=>({title:s.title||"اكتشاف "+(i+1),label:"الخطوة "+(i+1),summary:s.text||s.why||s.outcome||""})):heart.map(([title,label,summary])=>({title,label,summary}));
 const selected=cards[active]||cards[0];
 async function ask(e){
  e?.preventDefault();const q=question.trim();if(!q||busy)return;
  setBusy(true);setError("");
  try{
   const res=await fetch("/api/explain",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({content:q,audience:"عام",preserve:result?{title:result.title,sceneGraph:result.sceneGraph,truthAnchors:result.truthAnchors}:null})});
   const data=await res.json();if(!res.ok||data.error)throw new Error(data.error||"تعذّر إنشاء الشرح");
   setResult(data);setActive(0);setShowMap(false);
   setHistory(prev=>{const next=[{question:q,title:data.title||q,date:new Date().toISOString()},...prev.filter(x=>x.question!==q)].slice(0,30);try{localStorage.setItem("nahlaty-discovery-world-v1",JSON.stringify(next))}catch{}return next});
  }catch(e){setError(e.message||"تعذّر إنشاء الشرح")}finally{setBusy(false)}
 }
 function choose(i){setActive(i);setShowMap(false)}
 function goHome(){setShowMap(true);setResult(null);setActive(0);setError("")}
 return <main className={styles.shell} dir="rtl">
  <aside className={styles.sidebar}><div className={styles.brand}><span>✦</span><div><strong>نحلتي</strong><small>My Bee · من الفضول إلى الفهم</small></div></div>
   <button className={styles.navActive} onClick={goHome}>⌂ &nbsp; عالمي البصري</button>
   <a className={styles.nav} href="/cinematic-heart">♡ &nbsp; محرك القلب ثلاثي الأبعاد</a>
   <a className={styles.nav} href="/">✧ &nbsp; نحلتي الأصلية</a>
   <div className={styles.sideNote}>كل سؤال يفتح طريقًا جديدًا. اكتشافاتك السابقة محفوظة على هذا الجهاز.</div>
  </aside>
  <div className={styles.content}>
   <header className={styles.top}><div className={styles.mobileBrand}>✦ نحلتي</div><form className={styles.search} onSubmit={ask}><span>⌕</span><input aria-label="سؤالك" placeholder="شو حابب تفهم اليوم؟" value={question} onChange={e=>setQuestion(e.target.value)}/><button disabled={busy||!question.trim()}>{busy?"عم نبني الشرح…":"✦ اشرح لي"}</button></form><button className={styles.worldButton} onClick={goHome}>عالمي ◈</button></header>
   <section className={styles.hero}>
    <div className={styles.glow}/><div className={styles.heroTop}><span className={styles.kicker}>{showMap?"✦ خريطة اكتشافاتك":result?"✦ جواب بصري جديد":"✦ أول رحلة بصرية"}</span><span className={styles.counter}>{showMap?history.length+" اكتشاف محفوظ":String(active+1).padStart(2,"0")+" / "+cards.length}</span></div>
    {showMap?<div className={styles.world}><div className={styles.bee}>✦</div><h1>من الفضول <em>إلى الفهم</em></h1><p>عالمك بيتكوّن من أسئلتك. اختَر رحلة سابقة أو ابدأ بسؤال جديد.</p><div className={styles.worldMap}><button onClick={()=>setShowMap(false)} className={styles.mapNode}>♥<small>رحلة القلب · 12 اكتشافًا</small></button>{history.slice(0,5).map((h,i)=><button key={h.date+i} className={styles.mapNode} onClick={()=>{setQuestion(h.question);setError("اضغط «اشرح لي» لإعادة إنشاء الشرح؛ الملخص السابق محفوظ، وليس المشهد الكامل.")}}>✧<small>{h.title}</small></button>)}</div></div>:
    <div className={styles.answer}><div className={styles.visual}><div className={styles.halo}/><div className={styles.visualIcon}>{result?(result.sceneGraph?.nodes?.[active]?.glyph||symbols[active%symbols.length]):symbols[active%symbols.length]}</div><div className={styles.visualNodes}>{(result?.sceneGraph?.nodes||[]).slice(0,5).map((n,i)=><span key={n.id||i} className={styles.visualNode}>{n.glyph||"✦"} {n.label}</span>)}</div></div><div className={styles.answerText}><span className={styles.kicker}>{selected.label}</span><h1>{result?.title||selected.title}</h1><h2>{result?selected.title:"رحلة القلب"}</h2><p>{selected.summary}</p><div className={styles.answerActions}><button onClick={()=>setActive(v=>(v+1)%cards.length)}>الاكتشاف التالي ←</button><button onClick={goHome}>◈ خريطتي</button></div></div></div>}
    <div className={styles.heroBottom}><span>✦ الصورة الرئيسية هي مساحة الشرح والاكتشاف</span><span>{result?"مشهد مبني من بيانات Gemini · ليس صورة مولّدة":"رحلة تجريبية · المحرك ثلاثي الأبعاد محفوظ"}</span></div>
   </section>
   {error&&<p className={styles.error} role="alert">{error}</p>}
   <div className={styles.sectionHead}><div><span>اكتشف أكثر</span><h2>{result?"سلسلة مرتبطة بسؤالك":"سلسلة القلب · 12 بطاقة"}</h2></div><div className={styles.arrows}><button aria-label="السابق" onClick={()=>strip.current?.scrollBy({left:260,behavior:"smooth"})}>→</button><button aria-label="التالي" onClick={()=>strip.current?.scrollBy({left:-260,behavior:"smooth"})}>←</button></div></div>
   <div className={styles.cards} ref={strip}>{cards.map((c,i)=><button key={i} className={styles.card+" "+(!showMap&&i===active?styles.selected:"")} onClick={()=>choose(i)}><div className={styles.cardArt}><span>{symbols[i%symbols.length]}</span><small>{String(i+1).padStart(2,"0")}</small></div><div className={styles.cardBody}><strong>{c.title}</strong><span>←</span></div><p>{c.summary}</p></button>)}</div>
   <footer className={styles.footer}>نحلتي · تجربة واجهة مستقلة على فرع تطوير · لم تُغيّر النسخة المنشورة. <Link href="/cinematic-heart">افتح محرك القلب الحي ↗</Link></footer>
  </div>
 </main>
}