import EngineCutaway from './EngineCutaway.js';
import { ENGINE_REFERENCE, VISUAL_ASSUMPTIONS } from '../lib/engine/zz4Reference.js';
import { getGeometry } from '../lib/engine/zz4Model.js';
import styles from './page.module.css';

export const metadata = {
  title: 'ZZ4 350 · Engine Benchmark | نحلتي',
  description: 'مقطع تعليمي لأسطوانة واحدة من مرجع ZZ4 350، مع فصل الأبعاد الموثقة عن التوقيت والرسوم التخطيطية.',
};

const DIMENSIONS = [
  { key: 'boreMm', ar: 'قطر الأسطوانة', en: 'Bore' },
  { key: 'strokeMm', ar: 'طول الشوط', en: 'Stroke' },
  { key: 'rodLengthMm', ar: 'المسافة بين مركزي الذراع', en: 'Rod center distance' },
];

export default function EngineBenchmarkPage() {
  const geometry = getGeometry();
  return <main className={styles.page}>
    <header className={styles.header}>
      <a href="/" className={styles.brand}>نحلتي <span>MY BEE</span></a>
      <span dir="ltr">ENGINE BENCHMARK / 01</span>
    </header>
    <section className={styles.intro}>
      <span className={styles.eyebrow} dir="ltr">CHEVROLET PERFORMANCE · ZZ4 350</span>
      <h1>دورة واحدة.<br /><em>ميكانيكا مترابطة.</em></h1>
      <p>شاهد المكبس والذراع والمرفق خلال الأشواط الأربعة. هذا مقطع تعليمي لأسطوانة واحدة، بأبعاد مرجعية وحركة مترابطة.</p>
    </section>
    <EngineCutaway />
    <section className={styles.reference} aria-labelledby="reference-title">
      <div className={styles.referenceHeading}>
        <h2 id="reference-title">ما الذي يستند إليه المشهد؟</h2>
        <p>نميّز قيمة المرجع الموثقة عن الافتراض المستخدم للرسم.</p>
      </div>
      <div className={styles.dimensions}>
        {DIMENSIONS.map(({ key, ar, en }) => {
          const parameter = ENGINE_REFERENCE.parameters[key];
          return <article key={key} className={styles.dimension}>
            <div className={styles.parameterHeading}><b>{ar}</b><span className={styles.status} data-status={parameter.status}>{parameter.status}</span></div>
            <small lang="en">{en}</small>
            <strong dir="ltr">{geometry[key]} <span>{parameter.unit}</span></strong>
            {parameter.status !== 'VERIFIED' && <p className={styles.candidateNote}>قيمة مستخدمة في المشهد؛ ليست بُعدًا مصنعياً موثقًا لهذا المحرك.</p>}
            <p dir="ltr" lang="en">{parameter.notes}</p>
          </article>;
        })}
      </div>
      <div className={styles.referenceNotes}>
        <div><h3>توقيت الحركة · INFERRED</h3><p>فتح الصمامات ومنحنى الرفع والشرارة وتمثيل الاحتراق تعليمي. علامة الشرارة المختارة عند {VISUAL_ASSUMPTIONS.sparkAdvanceDeg}° تقدّم؛ خريطة المصنع الكاملة غير معروفة.</p></div>
        <div><h3>شكل الأجزاء · تخطيطي</h3><p>زاوية الصمام {ENGINE_REFERENCE.parameters.valveAngleDeg.value}° وقطره وأقصى رفعه من المرجع. مواضع الصمامات والمنافذ والشمعة وشكل الرأس والتاج وخلوص المكبس ومسارات الغاز تخطيطية؛ منحنى حركة الصمام تعليمي.</p></div>
      </div>
      <details className={styles.sourceDetails}>
        <summary>المصدر وإعدادات الإشعال المنشورة</summary>
        {Object.entries(ENGINE_REFERENCE.sources).map(([id, source]) => <p key={id} dir="ltr" lang="en"><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>{source.specificationsPartNumber && <> · PN {source.specificationsPartNumber}</>}{source.revision && <> · REV {source.revision}</>}</p>)}
        <p>دليل المصنع يوصي بتقدّم ابتدائي 10° قبل النقطة الميتة العليا عند 650 rpm، وتقدّم إجمالي 32° عند 4000 rpm، مع فصل وتسكير خرطوم تقدّم التفريغ وإبقائه مفصولًا. هذه إعدادات منشورة وليست خريطة إشعال كاملة، ولا توقيت الشرارة التعليمي المعروض.</p>
      </details>
    </section>
    <footer className={styles.footer}><span>ZZ4 350 · أسطوانة واحدة · دورة 720°</span><span>حركة محلية قابلة للإيقاف والفحص</span></footer>
  </main>;
}
