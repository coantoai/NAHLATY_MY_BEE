const HEART_TOPICS = [
  {
    id: "overview",
    scene: 0,
    keywords: ["قلب","وظيفة","مضخة","heart","pump"],
    answer: "القلب عضلة تعمل كمضخة تدفع الدم باستمرار عبر الرئتين وبقية الجسم.",
    explanation: "الفكرة الأساسية هي دورة مستمرة: القلب يستقبل الدم ثم يدفعه في المسار المناسب، ويكرر ذلك مع كل نبضة.",
    visualIntent: { target: "القلب كمركز للدورة", operations: ["FOCUS","FLOW"], focus: ["heart","blood-flow"], camera: "overview" }
  },
  {
    id: "inside",
    scene: 1,
    keywords: ["داخل","تشريح","بنية","structure","inside","anatomy"],
    answer: "داخل القلب توجد أربع حجرات وصمامات ومسارات تسمح للدم بالدخول والخروج بترتيب محدد.",
    explanation: "لفهم عمل القلب يجب الانتقال من شكله الخارجي إلى الحجرات والمسارات الداخلية.",
    visualIntent: { target: "البنية الداخلية", operations: ["ZOOM","CUTAWAY","ISOLATE"], focus: ["chambers","valves"], camera: "cutaway" }
  },
  {
    id: "chambers",
    scene: 2,
    keywords: ["حجرة","حجرات","أذين","بطين","atrium","ventricle","chamber"],
    answer: "القلب يتكون من أربع حجرات: أذينين في الأعلى وبطينين في الأسفل، وتعمل معًا لإبقاء مساري الدم منظّمين.",
    explanation: "الجانب الأيمن يرسل الدم نحو الرئتين، والجانب الأيسر يدفع الدم الغني بالأكسجين إلى الجسم.",
    visualIntent: { target: "الحجرات الأربع", operations: ["ZOOM","ISOLATE","HIGHLIGHT"], focus: ["right-atrium","right-ventricle","left-atrium","left-ventricle"], camera: "interior" }
  },
  {
    id: "valves",
    scene: 3,
    keywords: ["صمام","صمامات","رجوع","يرجع","اتجاه واحد","valve","backflow"],
    answer: "الصمامات تعمل كأبواب أحادية الاتجاه: تفتح عندما يجب أن يمر الدم، ثم تغلق لتمنع رجوعه للخلف.",
    explanation: "فرق الضغط بين الحجرات يفتح الصمام ويغلقه، ولذلك يبقى جريان الدم في الاتجاه الصحيح.",
    visualIntent: { target: "منع رجوع الدم", operations: ["ZOOM","FOCUS","FLOW","DIRECTION"], focus: ["valves"], camera: "macro" }
  },
  {
    id: "circulation",
    scene: 4,
    keywords: ["دم","مسار","رحلة","دورة","يدور","blood","circulation","route"],
    answer: "المسار المبسط هو: الجسم ← القلب الأيمن ← الرئتان ← القلب الأيسر ← الجسم.",
    explanation: "هذه حلقة مستمرة؛ الدم يعود قليل الأكسجين من الجسم، يذهب للرئتين، ثم يعود غنيًا بالأكسجين قبل أن يُضخ إلى الجسم.",
    visualIntent: { target: "رحلة الدم الكاملة", operations: ["FLOW","DIRECTION","SEQUENCE"], focus: ["heart","lungs","body"], camera: "tracking" }
  },
  {
    id: "lungs",
    scene: 5,
    keywords: ["رئة","رئتين","أكسجين","ثاني أكسيد","تنفس","lung","oxygen","co2"],
    answer: "يذهب الدم إلى الرئتين ليتخلص من ثاني أكسيد الكربون ويلتقط الأكسجين.",
    explanation: "بعد تبادل الغازات يعود الدم الغني بالأكسجين إلى الجانب الأيسر من القلب ليُضخ إلى الجسم.",
    visualIntent: { target: "تبادل الغازات", operations: ["FOCUS","FLOW","DIRECTION"], focus: ["lungs","pulmonary-flow"], camera: "heart-to-lungs" }
  },
  {
    id: "body",
    scene: 6,
    keywords: ["جسم","أعضاء","شريان","شرايين","توزيع","body","artery","organs"],
    answer: "القلب الأيسر يدفع الدم الغني بالأكسجين عبر الشريان الأبهر ثم عبر شبكة الشرايين إلى أنسجة الجسم.",
    explanation: "الأكسجين والمواد الغذائية تصل مع الدم إلى الأنسجة، ثم يعود الدم عبر الأوردة إلى القلب.",
    visualIntent: { target: "توزيع الدم إلى الجسم", operations: ["FLOW","DIRECTION"], focus: ["aorta","systemic-circulation"], camera: "heart-to-body" }
  },
  {
    id: "coronary",
    scene: 7,
    keywords: ["تاجي","تاجية","يغذي القلب","عضلة القلب","coronary"],
    answer: "عضلة القلب نفسها تحصل على الأكسجين والمواد الغذائية عبر الشرايين التاجية الموجودة على سطح القلب.",
    explanation: "القلب لا يأخذ حاجته مباشرة من الدم الموجود داخل حجراته؛ له شبكة تروية خاصة به.",
    visualIntent: { target: "تروية عضلة القلب", operations: ["FOCUS","HIGHLIGHT"], focus: ["coronary-arteries"], camera: "surface-closeup" }
  },
  {
    id: "electrical",
    scene: 8,
    keywords: ["كهرب","نبض","خفق","إشارة","rhythm","electrical","beat"],
    answer: "النبضة تبدأ من نظام كهربائي داخل القلب ينسّق توقيت انقباض الحجرات.",
    explanation: "تنتشر الإشارة الكهربائية عبر عضلة القلب بترتيب يجعل الأذينين ثم البطينين يعملون بصورة منسقة.",
    visualIntent: { target: "تنسيق النبض كهربائيًا", operations: ["FOCUS","TRACE","SEQUENCE"], focus: ["electrical-path"], camera: "trace" }
  },
  {
    id: "whole",
    scene: 9,
    keywords: ["كامل","كلها","منظومة","الصورة الكاملة","whole","system"],
    answer: "عمل القلب هو نتيجة تنسيق النبض والحجرات والصمامات والرئتين والأوعية ضمن دورة واحدة مستمرة.",
    explanation: "كل جزء يؤدي وظيفة مختلفة، لكن الفهم الكامل يظهر عندما نرى كيف تتصل هذه الوظائف زمنيًا ومكانيًا.",
    visualIntent: { target: "ربط المنظومة كاملة", operations: ["CONTEXT","FLOW","SEQUENCE"], focus: ["heart","lungs","body"], camera: "wide-system" }
  }
];

function normalizeText(value="") {
  return value.toLowerCase().replace(/[ًٌٍَُِّْـ]/g,"").replace(/\s+/g," ").trim();
}

function scoreTopic(question, topic) {
  const q=normalizeText(question);
  return topic.keywords.reduce((score,k)=>score+(q.includes(normalizeText(k))?1:0),0);
}

export function localHeartResult(question) {
  const ranked=HEART_TOPICS.map(topic=>({topic,score:scoreTopic(question,topic)})).sort((a,b)=>b.score-a.score);
  const best=ranked[0];
  if(!best || best.score===0) return null;
  return {
    domain: "heart",
    topic: best.topic.id,
    scene: best.topic.scene,
    answer: best.topic.answer,
    explanation: best.topic.explanation,
    visualPlan: best.topic.visualIntent,
    confidence: best.score>1 ? "high" : "medium",
    verification: {
      status: "curated",
      source: "NAHLATY heart knowledge v1",
      note: "Core anatomy/physiology facts are served from the curated prototype knowledge layer."
    }
  };
}

export function contextualHeartResult(question, context={}) {
  const q=normalizeText(question);
  const followup=/^(ليش|لماذا|كيف|وضح|اشرح|وبعدين|ثم ماذا|شو يعني|ماذا يعني|what|why|how)/.test(q) || q.length<24;
  if(!followup || !Number.isInteger(context?.scene)) return null;
  const topic=HEART_TOPICS.find(x=>x.scene===context.scene);
  if(!topic) return null;
  return {
    domain:"heart",
    topic:topic.id,
    scene:topic.scene,
    answer:topic.answer,
    explanation:topic.explanation,
    visualPlan:topic.visualIntent,
    confidence:"medium",
    verification:{
      status:"curated",
      source:"NAHLATY heart knowledge v1",
      note:"Contextual follow-up resolved against the curated heart prototype knowledge layer."
    }
  };
}

export function buildEnginePrompt({question, context, local}) {
  return `You are the reasoning layer inside NAHLATY, a visual understanding engine.
Your job is not to make pretty text. Convert the user's question into a concise, factual answer and a visual explanation plan.

Rules:
- Answer in the user's language. The current user mostly uses Arabic.
- Never invent certainty. If a claim is uncertain, say so.
- Separate factual answer from visual direction.
- Preserve the current world/context when relevant.
- Prefer causal sequences, spatial relations, flow, scale, cutaway, isolation, comparison, or timing only when they improve understanding.
- Output JSON only.
- Allowed visual operations: FOCUS, ZOOM, CUTAWAY, ISOLATE, HIGHLIGHT, FLOW, DIRECTION, SEQUENCE, TRACE, CONTEXT, COMPARE, SCALE, TRANSPARENCY.
- Keep answer under 70 Arabic words and explanation under 90 Arabic words.

User question: ${question}
Current context: ${JSON.stringify(context||{})}
Curated local result (may be null): ${JSON.stringify(local||null)}

Return this exact JSON shape:
{
  "domain": "short domain",
  "topic": "short topic",
  "answer": "direct factual answer",
  "explanation": "how to understand it",
  "scene": null,
  "confidence": "high|medium|low",
  "needsVerification": true,
  "visualPlan": {
    "target": "what the user must understand",
    "operations": ["FOCUS"],
    "focus": ["semantic-element-id"],
    "camera": "short camera instruction"
  }
}`;
}

export function sanitizeEngineResult(result, local) {
  const ops=new Set(["FOCUS","ZOOM","CUTAWAY","ISOLATE","HIGHLIGHT","FLOW","DIRECTION","SEQUENCE","TRACE","CONTEXT","COMPARE","SCALE","TRANSPARENCY"]);
  const rawOps=Array.isArray(result?.visualPlan?.operations)?result.visualPlan.operations:[];
  const safeOps=rawOps.filter(x=>ops.has(x)).slice(0,6);
  const scene=local?.scene ?? (Number.isInteger(result?.scene)?Math.min(9,Math.max(0,result.scene)):null);
  return {
    domain: String(local?.domain||result?.domain||"general").slice(0,60),
    topic: String(local?.topic||result?.topic||"unknown").slice(0,80),
    answer: String(local?.answer||result?.answer||"").slice(0,900),
    explanation: String(local?.explanation||result?.explanation||"").slice(0,1200),
    scene,
    confidence: local?.confidence || (["high","medium","low"].includes(result?.confidence)?result.confidence:"low"),
    needsVerification: local ? false : true,
    visualPlan: {
      target: String(result?.visualPlan?.target||local?.visualPlan?.target||"فهم الفكرة").slice(0,160),
      operations: safeOps.length?safeOps:(local?.visualPlan?.operations||["FOCUS"]),
      focus: Array.isArray(result?.visualPlan?.focus)?result.visualPlan.focus.map(x=>String(x).slice(0,80)).slice(0,8):(local?.visualPlan?.focus||[]),
      camera: String(result?.visualPlan?.camera||local?.visualPlan?.camera||"overview").slice(0,120)
    },
    verification: local?.verification || {
      status: "model-only",
      source: "Gemini",
      note: "This response has not yet been externally grounded."
    }
  };
}
