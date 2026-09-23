// Prototype 1: the AI may select an intent, but cannot invent physiology or scene commands.
// The persistent world belongs to the application, not to an individual AI response.
export const DEFAULT_WORLD = Object.freeze({
  view: "flow", leaky: false, playing: true, pace: 1, intent: "flow"
});

export const INTENTS = Object.freeze([
  "flow", "valve", "regurgitation", "consequence", "restore", "pause", "resume", "unsupported"
]);

export const LESSONS = Object.freeze({
  flow: {
    title: "اتبع حركة الدم",
    explanation: "نرى جزءًا محددًا من الدورة: الدم العائد من الرئتين يدخل الأذين الأيسر، يمر عبر الصمام التاجي إلى البطين الأيسر، ثم يخرج عبر الصمام الأبهري إلى الجسم.",
    cue: "اتبع المسار الأحمر. هذه صورة تفسيرية للقلب الأيسر، وليست نموذجًا تشريحيًا كاملًا.",
    focus: "flow"
  },
  valve: {
    title: "لماذا لا يرجع الدم؟",
    explanation: "يفتح الصمام التاجي عندما يسمح فرق الضغط بمرور الدم من الأذين إلى البطين. وعندما ينقبض البطين ويرتفع ضغطه، تنطبق وريقتا الصمام فتمنعان رجوع الدم.",
    cue: "اقتربنا من الصمام وأبطأنا الدورة لتمييز الفتح عن الإغلاق.",
    focus: "valve"
  },
  regurgitation: {
    title: "ماذا لو لم ينغلق جيدًا؟",
    explanation: "إذا لم تنطبق وريقتا الصمام التاجي بالكامل أثناء انقباض البطين، يمكن أن يتسرّب جزء من الدم إلى الأذين الأيسر بدلًا من التوجه كله إلى الأبهر. هذا يُسمى ارتجاعًا.",
    cue: "راقب المسار العكسي البرتقالي أثناء الانقباض؛ هو سيناريو تعليمي، لا قياس لمريض.",
    focus: "valve"
  },
  consequence: {
    title: "ماذا يتغيّر بعد الارتجاع؟",
    explanation: "قد يزيد الدم المتسرّب حجم الدم والضغط في الأذين الأيسر. وفي الحالات الأشد قد يمتد تأثير الضغط إلى الأوردة القادمة من الرئتين. لا تعني هذه التجربة أن كل ارتجاع يسبب أعراضًا.",
    cue: "وسّعنا المشهد إلى الأذين واتصاله بالأوردة الرئوية. التأثيرات هنا نوعية وليست حسابات سريرية.",
    focus: "consequence"
  },
  restore: {
    title: "عدنا إلى الصمام الطبيعي",
    explanation: "أعدنا انطباق وريقتَي الصمام أثناء انقباض البطين. يتوقف المسار العكسي وتستمر الدورة في اتجاهها المعتاد.",
    cue: "نفس العالم؛ الذي تغيّر هو حالة الصمام، وليس ملفًا بصريًا جديدًا.",
    focus: "valve"
  },
  pause: {
    title: "أوقفنا الزمن",
    explanation: "توقف المشهد في حالته الحالية. يمكنك تدوير المشهد أو طرح سؤال آخر دون فقدان حالة الصمام.",
    cue: "يمكنك إعادة التشغيل في أي وقت.",
    focus: null
  },
  resume: {
    title: "تابع من حيث توقّفنا",
    explanation: "استأنفنا حركة المشهد بالحالة نفسها. إذا كان الصمام يتسرّب، سيظل يتسرّب حتى تطلب إعادته إلى الوضع الطبيعي.",
    cue: "استمرارية الحالة جزء أساسي من الاختبار.",
    focus: null
  },
  unsupported: {
    title: "هذا السؤال خارج عالم التجربة الحالي",
    explanation: "تجربة اليوم تغطي مسار الدم في القلب الأيسر، الصمام التاجي، وارتجاعه بصورة مبسطة. لن أختلق مشهدًا أو آلية غير موجودة بعد.",
    cue: "احتفظنا بالمشهد كما هو. جرّب سؤالًا عن الصمام أو حركة الدم.",
    focus: null
  }
});

const VALID_VIEWS = new Set(["flow", "valve", "consequence"]);
export function normalizeWorld(value) {
  const w = value && typeof value === "object" ? value : {};
  return {
    view: VALID_VIEWS.has(w.view) ? w.view : DEFAULT_WORLD.view,
    leaky: w.leaky === true,
    playing: w.playing !== false,
    pace: Number.isFinite(w.pace) ? Math.max(0.3, Math.min(1.5, w.pace)) : 1,
    intent: INTENTS.includes(w.intent) ? w.intent : DEFAULT_WORLD.intent
  };
}

const norm = value => String(value || "").toLowerCase()
  .replace(/[\u064b-\u065f]/g, "")
  .replace(/[أإآ]/g, "ا")
  .replace(/\s+/g, " ").trim();

export function localIntent(question, world = DEFAULT_WORLD) {
  const q = norm(question), w = normalizeWorld(world);
  if (!q) return "unsupported";
  if (/(ارجع|رجع|طبيعي|اصلح|صلح|reset|restore)/.test(q)) return "restore";
  if (/(شغل|كمل|استمر|تابع|resume|play)/.test(q)) return "resume";
  if (/(وقف|اوقف|جمد|pause|stop)/.test(q)) return "pause";
  if (/(خطير|الخطر|يضر|ليش هيك|ليش هيدا|شو تاثير|النتيجة|الرئة|الرئتين|تنفس|ضيق النفس|consequence|harm)/.test(q) && (w.leaky || w.intent === "regurgitation" || /ارتجاع|تسرب/.test(q))) return "consequence";
  if (/(ما سكر|ما يسكر|ما ينغلق|ما اغلق|ما يقفل|ما قفل|ارتجاع|تسرب|يرجع الدم|leak|regurgitation)/.test(q)) return "regurgitation";
  if (/(صمام|بلف|valve|ما بيرجع|ما يرجع|ليش ما|لماذا لا يرجع|فرق الضغط|ضغط|يفتح|يسكر|يغلق)/.test(q)) return "valve";
  if (/(الدم|القلب|الدورة|مسار|يمشي|يمر|يتحرك|جريان|flow|blood|heart)/.test(q)) return "flow";
  return "unsupported";
}

export function applyIntent(rawIntent, currentWorld = DEFAULT_WORLD) {
  const world = normalizeWorld(currentWorld);
  const intent = INTENTS.includes(rawIntent) ? rawIntent : "unsupported";
  const lesson = LESSONS[intent];
  const next = { ...world };
  if (lesson.focus) next.view = lesson.focus;
  if (intent === "regurgitation" || intent === "consequence") next.leaky = true;
  if (intent === "restore") next.leaky = false;
  if (intent === "valve") next.pace = 0.48;
  if (intent === "flow" || intent === "consequence" || intent === "restore") next.pace = 1;
  if (intent === "pause") next.playing = false;
  if (intent === "resume") next.playing = true;
  if (intent !== "unsupported" && intent !== "pause" && intent !== "resume") next.playing = true;
  if (intent !== "unsupported") next.intent = intent;
  return { intent, world: next, lesson };
}
