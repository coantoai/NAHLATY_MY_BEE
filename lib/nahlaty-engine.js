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


const HEART_SOURCES=[
 {title:"NHLBI — Heart anatomy",url:"https://www.nhlbi.nih.gov/health/heart/anatomy"},
 {title:"NHLBI — Blood flow through the heart",url:"https://www.nhlbi.nih.gov/health/heart/blood-flow"}
];

function buildHeartExperience(selectedScene=0){
 const nodes=[
  {id:"body",label:"الجسم",glyph:"◎",visual:"person",x:12,y:50,knowledge:"fact",detail:"يعيد الدم قليل الأكسجين إلى القلب ويتلقى الدم الغني بالأكسجين."},
  {id:"right-heart",label:"القلب الأيمن",glyph:"◖",visual:"heart",x:34,y:58,knowledge:"fact",detail:"يستقبل الدم العائد من الجسم ويدفعه إلى الرئتين.",spatial:true},
  {id:"lungs",label:"الرئتان",glyph:"◌",visual:"lungs",x:50,y:20,knowledge:"fact",detail:"يحدث فيهما تبادل الغازات."},
  {id:"left-heart",label:"القلب الأيسر",glyph:"◗",visual:"heart",x:66,y:58,knowledge:"fact",detail:"يستقبل الدم الغني بالأكسجين ويدفعه إلى الجسم.",spatial:true},
  {id:"valves",label:"الصمامات",glyph:"⌁",visual:"valve",x:50,y:56,knowledge:"fact",detail:"تساعد على إبقاء الدم في اتجاه واحد داخل القلب.",spatial:true},
  {id:"aorta",label:"الأبهر",glyph:"↗",visual:"vessel",x:80,y:44,knowledge:"fact",detail:"الشريان الرئيسي الخارج من القلب الأيسر."},
  {id:"coronary",label:"الشرايين التاجية",glyph:"⌇",visual:"vessel",x:60,y:78,knowledge:"fact",detail:"تغذي عضلة القلب نفسها."},
  {id:"electrical",label:"النظام الكهربائي",glyph:"ϟ",visual:"signal",x:40,y:78,knowledge:"fact",detail:"ينسق توقيت انقباض حجرات القلب."}
 ];
 const edges=[
  {id:"body-right",from:"body",to:"right-heart",label:"عودة الدم",relation:"flow",causal:false,knowledge:"fact"},
  {id:"right-lungs",from:"right-heart",to:"lungs",label:"إلى الرئتين",relation:"flow",causal:true,knowledge:"fact"},
  {id:"lungs-left",from:"lungs",to:"left-heart",label:"عودة مؤكسجة",relation:"flow",causal:true,knowledge:"fact"},
  {id:"left-aorta",from:"left-heart",to:"aorta",label:"ضخ",relation:"flow",causal:true,knowledge:"fact"},
  {id:"aorta-body",from:"aorta",to:"body",label:"توزيع",relation:"flow",causal:true,knowledge:"fact"},
  {id:"valve-right",from:"valves",to:"right-heart",label:"اتجاه واحد",relation:"enable",causal:true,knowledge:"fact"},
  {id:"valve-left",from:"valves",to:"left-heart",label:"اتجاه واحد",relation:"enable",causal:true,knowledge:"fact"},
  {id:"coronary-heart",from:"aorta",to:"coronary",label:"تروية",relation:"flow",causal:true,knowledge:"fact"},
  {id:"electric-right",from:"electrical",to:"right-heart",label:"تنسيق النبض",relation:"cause",causal:true,knowledge:"fact"},
  {id:"electric-left",from:"electrical",to:"left-heart",label:"تنسيق النبض",relation:"cause",causal:true,knowledge:"fact"}
 ];
 const all=["body","right-heart","lungs","left-heart","valves","aorta","coronary","electrical"];
 const heartImage=i=>`/heart-cinematic/heart-${String(i+1).padStart(2,"0")}.webp`;
 const heartThumb=i=>`/heart-cinematic/heart-${String(i+1).padStart(2,"0")}-thumb.webp`;
 const steps=[
  {title:"البداية",text:"القلب عضلة تعمل كمضخة تدفع الدم ضمن دورة مستمرة بين الجسم والرئتين.",motion:"pulse",glyph:"♥",focus:"all",focusNodeIds:["right-heart","left-heart"],activeEdgeIds:[],visibleNodeIds:["right-heart","left-heart"],why:"نبدأ من وظيفة القلب العامة قبل التفاصيل.",outcome:"يتضح أن القلب مركز دفع ضمن دورة أكبر.",camera:{mode:"overview",targetNodeId:"",distance:90}},
  {title:"داخل القلب",text:"يتكوّن القلب من أربع حجرات ومسارات داخلية تنظّم استقبال الدم ودفعه.",motion:"reveal",glyph:"◫",focus:"process",focusNodeIds:["right-heart","left-heart","valves"],activeEdgeIds:[],visibleNodeIds:["right-heart","left-heart","valves"],why:"فهم الداخل ضروري لفهم حركة الدم.",outcome:"تظهر البنية التي تنظّم الضخ.",camera:{mode:"inside",targetNodeId:"right-heart",distance:55}},
  {title:"الحجرات الأربع",text:"الأذينان يستقبلان الدم والبطينان يدفعانه، مع فصل وظيفي بين الجانبين الأيمن والأيسر.",motion:"split",glyph:"▦",focus:"process",focusNodeIds:["right-heart","left-heart"],activeEdgeIds:[],visibleNodeIds:["right-heart","left-heart","valves"],why:"تقسيم الحجرات يحافظ على مساري الدم.",outcome:"نرى جانبي القلب كمسارين مترابطين.",camera:{mode:"focus",targetNodeId:"right-heart",distance:60}},
  {title:"الصمامات",text:"تفتح الصمامات وتغلق مع فروق الضغط لتساعد على منع رجوع الدم للخلف.",motion:"connect",glyph:"⌁",focus:"process",focusNodeIds:["valves","right-heart","left-heart"],activeEdgeIds:["valve-right","valve-left"],visibleNodeIds:["right-heart","left-heart","valves"],why:"اتجاه الجريان يحتاج بوابات وظيفية.",outcome:"يبقى الدم متجهًا للأمام.",camera:{mode:"inside",targetNodeId:"valves",distance:42}},
  {title:"رحلة الدم",text:"الجسم ← القلب الأيمن ← الرئتان ← القلب الأيسر ← الأبهر ← الجسم.",motion:"travel",glyph:"➜",focus:"all",focusNodeIds:["body","right-heart","lungs","left-heart","aorta"],activeEdgeIds:["body-right","right-lungs","lungs-left","left-aorta","aorta-body"],visibleNodeIds:["body","right-heart","lungs","left-heart","valves","aorta"],why:"المعنى الكامل يظهر عندما نتبع الدورة كحلقة.",outcome:"تتصل كل المحطات في مسار واحد مستمر.",camera:{mode:"follow",targetNodeId:"right-heart",distance:85}},
  {title:"إلى الرئتين",text:"يدفع القلب الأيمن الدم إلى الرئتين للتخلص من ثاني أكسيد الكربون والتقاط الأكسجين.",motion:"travel",glyph:"◌",focus:"target",focusNodeIds:["right-heart","lungs"],activeEdgeIds:["right-lungs"],visibleNodeIds:["right-heart","lungs","left-heart"],why:"الدم يحتاج تبادل الغازات قبل العودة للجسم.",outcome:"يعود الدم من الرئتين غنيًا بالأكسجين.",camera:{mode:"follow",targetNodeId:"lungs",distance:55}},
  {title:"إلى الجسم",text:"يدفع القلب الأيسر الدم الغني بالأكسجين عبر الأبهر ثم إلى أنسجة الجسم.",motion:"travel",glyph:"↗",focus:"target",focusNodeIds:["left-heart","aorta","body"],activeEdgeIds:["left-aorta","aorta-body"],visibleNodeIds:["left-heart","aorta","body"],why:"الأكسجين يجب أن يصل إلى الأنسجة.",outcome:"يصل الدم المؤكسج إلى أنحاء الجسم.",camera:{mode:"follow",targetNodeId:"aorta",distance:65}},
  {title:"تغذية القلب نفسه",text:"تحصل عضلة القلب على الدم عبر الشرايين التاجية المتفرعة من بداية الأبهر.",motion:"branch",glyph:"⌇",focus:"target",focusNodeIds:["aorta","coronary"],activeEdgeIds:["coronary-heart"],visibleNodeIds:["left-heart","aorta","coronary"],why:"عضلة القلب تحتاج تروية مثل أي نسيج حي.",outcome:"تظهر شبكة خاصة تغذي عضلة القلب.",camera:{mode:"focus",targetNodeId:"coronary",distance:45}},
  {title:"النظام الكهربائي",text:"إشارة كهربائية داخلية تنسق توقيت انقباض حجرات القلب.",motion:"wave",glyph:"ϟ",focus:"process",focusNodeIds:["electrical","right-heart","left-heart"],activeEdgeIds:["electric-right","electric-left"],visibleNodeIds:["electrical","right-heart","left-heart"],why:"الضخ يحتاج توقيتًا منظمًا بين الحجرات.",outcome:"يظهر كيف يتحول النشاط الكهربائي إلى نبض منسق.",camera:{mode:"follow",targetNodeId:"electrical",distance:52}},
  {title:"الصورة الكاملة",text:"النبض والحجرات والصمامات والرئتان والأوعية تعمل معًا كمنظومة واحدة مستمرة.",motion:"connect",glyph:"◎",focus:"all",focusNodeIds:all,activeEdgeIds:edges.map(e=>e.id),visibleNodeIds:all,why:"الفهم النهائي هو ربط الأجزاء في نظام واحد.",outcome:"تتضح الدورة الكاملة من النبضة إلى توصيل الأكسجين ثم العودة.",camera:{mode:"overview",targetNodeId:"",distance:110}}
 ];
 steps.forEach((step,i)=>{step.image=heartImage(i);step.thumbnail=heartThumb(i);step.media={type:"image",src:heartImage(i),thumbnail:heartThumb(i),role:"cinematic-stage"};});
 return {
  mode:"curated",
  title:"كيف يعمل القلب؟",
  summary:"القلب مضخة عضلية تنسق حركة الدم بين الجسم والرئتين عبر حجرات وصمامات وأوعية ونظام كهربائي.",
  truthAnchors:[
   "القلب يتكون من أربع حجرات.",
   "الجانب الأيمن يرسل الدم إلى الرئتين والجانب الأيسر يرسله إلى الجسم.",
   "الصمامات تساعد على إبقاء جريان الدم في اتجاه واحد.",
   "النظام الكهربائي للقلب ينسق النبض."
  ],
  visual:"flow",
  audience:"عام",
  sceneGraph:{world:{theme:"medical",dimension:"3d",label:"رحلة الدم عبر القلب والجسم"},nodes,edges},
  steps,
  sources:HEART_SOURCES,
  initialStep:Math.max(0,Math.min(9,Number(selectedScene)||0)),
  renderer:"cinematic-heart",
  runtimeVersion:"curated-heart/v2"
 };
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
      status: "source-grounded",
      source: "NAHLATY heart knowledge v1",
      sources: HEART_SOURCES,
      note: "Core heart facts are curated against NHLBI references."
    },
    experience: buildHeartExperience(best.topic.scene)
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
      status:"source-grounded",
      source:"NAHLATY heart knowledge v1",
      sources:HEART_SOURCES,
      note:"Contextual follow-up resolved against sourced heart knowledge."
    },
    experience:buildHeartExperience(topic.scene)
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
  const scene=local?.scene ?? null;
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
