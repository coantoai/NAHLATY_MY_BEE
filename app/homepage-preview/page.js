import styles from "./page.module.css";

const examples=["كيف يعمل القلب؟","كيف تنمو النباتات؟","كيف يتعلم الدماغ؟","ما هو الاحتباس الحراري؟"];
export default function HomepagePreview(){
 return <main className={styles.page} dir="rtl">
  <aside className={styles.side}>
   <div className={styles.logo}><span className={styles.logoBee}>✦</span><div><b>نحلتي</b><small>MY BEE</small></div></div>
   <nav><button className={styles.active}>⌂ <span>الرئيسية</span></button><button>✦ <span>اشرح لي</span></button><button>▣ <span>مكتبتي</span></button><button>◈ <span>أمثلة جاهزة</span></button></nav>
   <div className={styles.sideBottom}><button>◎ <span>تخصيص الجمهور</span></button><button>↺ <span>سجل الفهم</span></button><button>⚙ <span>الإعدادات</span></button></div>
  </aside>
  <section className={styles.shell}>
   <header><div className={styles.mobileLogo}>✦ <b>نحلتي</b></div><div className={styles.lang}>AR⌄</div><button className={styles.login}>تسجيل الدخول</button></header>
   <section className={styles.hero}>
    <div className={styles.glow}/>
    <div className={styles.beeWrap} aria-hidden="true">
     <svg viewBox="0 0 620 500" className={styles.bee}>
      <defs><radialGradient id="g" cx="42%" cy="35%"><stop offset="0" stopColor="#ffe992"/><stop offset=".48" stopColor="#dca72c"/><stop offset="1" stopColor="#6d4309"/></radialGradient><linearGradient id="w" x1="0" x2="1"><stop stopColor="#fff8ce" stopOpacity=".72"/><stop offset="1" stopColor="#b78822" stopOpacity=".08"/></linearGradient></defs>
      <ellipse cx="310" cy="258" rx="116" ry="152" fill="url(#g)"/>
      <path d="M210 176c-74-94-157-83-159-16-2 72 91 115 174 107" fill="url(#w)" stroke="#e4b94d" strokeWidth="5"/>
      <path d="M410 176c74-94 157-83 159-16 2 72-91 115-174 107" fill="url(#w)" stroke="#e4b94d" strokeWidth="5"/>
      <path d="M205 281c-87 11-138 65-107 108 34 46 112 4 151-54" fill="url(#w)" stroke="#e4b94d" strokeWidth="5"/>
      <path d="M415 281c87 11 138 65 107 108-34 46-112 4-151-54" fill="url(#w)" stroke="#e4b94d" strokeWidth="5"/>
      <ellipse cx="310" cy="151" rx="79" ry="71" fill="#2d210d"/><circle cx="281" cy="140" r="11" fill="#f7c84a"/><circle cx="339" cy="140" r="11" fill="#f7c84a"/>
      <path d="M262 93c-22-47-58-59-74-35M358 93c22-47 58-59 74-35" fill="none" stroke="#d9a52b" strokeWidth="8" strokeLinecap="round"/>
      <path d="M210 230c61 22 139 20 200-2M201 285c71 28 148 28 218-2M220 342c57 22 123 22 181 0" fill="none" stroke="#3c2a0d" strokeWidth="30" opacity=".9"/>
      <path d="M278 402l-30 57M342 402l30 57" stroke="#b77d16" strokeWidth="10" strokeLinecap="round"/>
     </svg>
    </div>
    <div className={styles.heroText}><span className={styles.kicker}>من الفضول إلى الفهم</span><h1>حوّل فضولك<br/>إلى <em>فهم حيّ.</em></h1><p>اسأل عن أي شيء. نحلتي تحوّل سؤالك إلى رحلة بصرية واضحة، عميقة، وممتعة.</p></div>
    <div className={styles.ask}>
      <div className={styles.askTitle}>ما الذي تريد أن تفهمه اليوم؟</div>
      <div className={styles.askRow}><button className={styles.go}>←</button><input placeholder="اسأل نحلتي عن أي شيء..." /><button>🎙</button><button>▧</button><button>⌁</button></div>
      <div className={styles.modes}><span>✦ سؤال</span><span>▧ صورة</span><span>⌁ ملف</span><span>🎙 صوت</span></div>
    </div>
   </section>
   <section className={styles.examples}><div className={styles.sectionHead}><span>ابدأ من مثال</span><b>أو جرّب أحد هذه الأسئلة</b></div><div className={styles.cards}>{examples.map((x,i)=><button key={x}><span>{["♥","♧","◉","◌"][i]}</span><b>{x}</b><small>ابدأ رحلة الفهم ←</small></button>)}</div></section>
  </section>
 </main>
}