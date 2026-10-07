export const TRAINING_MODES = [
  { id: "understand", label: "افهم النظام", description: "شرح بصري لعمل النظام ومكوّناته." },
  { id: "troubleshoot", label: "شخّص العطل", description: "رحلة تشخيص مرتبة من العرض إلى السبب المحتمل." },
  { id: "train", label: "تدرّب", description: "إجراء موجّه بخطوات ونقاط تحقق واضحة." },
];

export const ENGINE_DEMO = {
  id: "engine-cooling-demo",
  title: "Engine Cooling System",
  subtitle: "أول نموذج تجاري لنحلتي · تدريب تقني + تشخيص أعطال",
  evidenceClass: "teaching-demo",
  sourcePolicy: "FACT / INFERENCE / UNKNOWN",
  overview: {
    objective: "فهم دورة التبريد، مكوّناتها، وكيف ننتقل من عَرَض ارتفاع الحرارة إلى تشخيص مدروس.",
    components: [
      { id: "radiator", label: "Radiator", role: "يبدّد الحرارة من سائل التبريد.", status: "fact" },
      { id: "pump", label: "Water Pump", role: "تدفع سائل التبريد عبر النظام.", status: "fact" },
      { id: "block", label: "Block Water Jackets", role: "تمتص الحرارة من مناطق الأسطوانات.", status: "fact" },
      { id: "heads", label: "Head Water Jackets", role: "تنقل الحرارة بعيدًا عن مناطق الرأس الساخنة.", status: "fact" },
      { id: "thermostat", label: "Thermostat", role: "ينظّم مرور السائل نحو الراديتر بحسب الحرارة.", status: "fact" },
    ],
    flow: [
      "Radiator lower return",
      "Water pump",
      "Block water jackets",
      "Head water jackets",
      "Thermostat / outlet",
      "Upper hose",
      "Radiator",
    ],
  },
  fault: {
    id: "overheating-cooling-flow",
    symptom: "حرارة المحرك ترتفع فوق الطبيعي",
    principle: "لا نقفز من العرض إلى التشخيص؛ نفحص الاحتمالات بالترتيب ونُظهر درجة اليقين.",
    steps: [
      {
        id: "safety",
        title: "السلامة أولًا",
        check: "لا تفتح نظام تبريد ساخن أو مضغوط. ابدأ الفحص بعد أن يصبح آمنًا.",
        why: "نظام التبريد الساخن قد يكون تحت ضغط ويسبب إصابة.",
        outcome: "جاهز للفحص الآمن",
        knowledge: "fact",
      },
      {
        id: "coolant-level",
        title: "تحقق من مستوى السائل والتسريب",
        check: "افحص مستوى سائل التبريد عند الحالة الآمنة وابحث عن تسريب ظاهر.",
        why: "نقص السائل يقلل قدرة النظام على نقل الحرارة.",
        outcome: "إذا كان منخفضًا، نحتاج سبب النقص قبل القفز لقطع أخرى.",
        knowledge: "fact",
      },
      {
        id: "radiator-airflow",
        title: "تحقق من تبديد الحرارة",
        check: "تحقق من أن الراديتر ومسار الهواء/المروحة قادران على طرح الحرارة.",
        why: "حتى مع دوران السائل، ضعف تبديد الحرارة يمكن أن يرفع الحرارة.",
        outcome: "نستبعد أو نثبت مشكلة تبديد الحرارة.",
        knowledge: "fact",
      },
      {
        id: "thermostat",
        title: "تحقق من سلوك الثرموستات",
        check: "قارن سلوك ارتفاع الحرارة وتغيّر التدفق/الحرارة بما يتوافق مع فتح الثرموستات حسب مرجع المعدة.",
        why: "ثرموستات لا يفتح كما ينبغي قد يقيّد التدفق إلى الراديتر.",
        outcome: "فرضية الثرموستات تصبح أقوى أو أضعف، لا تتحول تلقائيًا إلى حقيقة.",
        knowledge: "inference",
      },
      {
        id: "pump-flow",
        title: "تحقق من قدرة المضخة على تدوير السائل",
        check: "ابحث عن دليل على ضعف التدفق أو عطل ميكانيكي وفق إجراءات المصنع.",
        why: "ضعف تدوير السائل يمنع نقل الحرارة من المحرك إلى الراديتر.",
        outcome: "إذا بقيت الأدلة غير كافية، النتيجة تبقى UNKNOWN بدل التخمين.",
        knowledge: "inference",
      },
    ],
  },
  training: {
    title: "مسار تدريب قصير",
    steps: [
      "سمِّ المكوّنات الرئيسية ووظيفة كل مكوّن.",
      "اتبع مسار السائل في وضع التشغيل الطبيعي.",
      "حدد أين تُمتص الحرارة وأين تُطرح.",
      "شغّل سيناريو ارتفاع الحرارة.",
      "نفّذ الفحوص بالترتيب وفسّر نتيجة كل فحص.",
    ],
  },
};

export const SCIENCE_GATES = [
  "مصدر أو مرجع لكل ادعاء تقني حاسم",
  "فصل FACT / INFERENCE / UNKNOWN",
  "ممنوع اختراع هندسة داخلية مخفية",
  "العلم له حق الفيتو على الشكل",
  "أي مسار أو حركة يجب ألا توحي بفيزياء خاطئة",
  "PASS علمي + PASS بصري + PASS Runtime قبل الاعتماد",
];
