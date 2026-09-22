import { createGemini, generateJson, isTransientGenAIError } from "./genai";
import MYBEE_REFERENCE from "../mybee-reference-data";

export const IMAGE_MODEL="gemini-3.1-flash-image";

const scalarText=value=>{
  if(value===null||value===undefined)return "";
  if(typeof value==="string"||typeof value==="number"||typeof value==="boolean")return String(value);
  if(Array.isArray(value))return value.map(scalarText).filter(Boolean).join(" · ");
  if(typeof value==="object"){
    for(const key of ["label","text","title","name","value","caption","description","action","meaning","cue"]){
      const text=scalarText(value[key]);
      if(text)return text;
    }
    const from=scalarText(value.from),to=scalarText(value.to);
    if(from&&to)return from+" → "+to;
    return from||to||"";
  }
  return "";
};
const clean=(value,max=700)=>scalarText(value).replace(/\s+/g," ").trim().slice(0,max);
const cleanList=(value,limit,max)=>{
  const items=Array.isArray(value)?value:(value?[value]:[]);
  return items.map(item=>clean(item,max)).filter(Boolean).slice(0,limit);
};
const hasAny=(text,terms)=>terms.some(term=>text.includes(term));
const VISUAL_DEVICE_TYPES=[
  "icon","frame","container","stage-number","contrast-marker",
  "3d-model","hotspot","explanation-card","progress-bar","scale-indicator","arrow"
];

function normalizeVisualDevices(value){
  const items=Array.isArray(value)?value:(value?[value]:[]);
  return items.map((item,index)=>{
    if(typeof item==="string")return {type:"icon",purpose:clean(item,120),label:"",placement:""};
    if(!item||typeof item!=="object")return null;
    const rawType=clean(item.type||item.kind||item.device,40).toLowerCase();
    const type=VISUAL_DEVICE_TYPES.includes(rawType)?rawType:"icon";
    return {
      type,
      purpose:clean(item.purpose||item.reason||item.description||item.meaning,140),
      label:clean(item.label||item.text||item.title,40),
      placement:clean(item.placement||item.position,40)
    };
  }).filter(x=>x&&x.purpose).slice(0,6);
}

function deviceLine(device){
  const bits=[device.type,device.label,device.purpose,device.placement].filter(Boolean);
  return bits.join(" — ");
}

function buildUnderstandingPrinciples(question,audience){
  const q=clean(question,700).toLowerCase();
  let relation="concept";
  let coreEssence=clean(question,420);
  let essentialElements=["الموضوع الرئيسي","العلاقة الأساسية","النتيجة أو المعنى"];
  let mustShow=["بداية أو سبب واضح","العلاقة أو التحول الأساسي","نتيجة مرئية"];

  if(hasAny(q,["كيف","how ","ماذا يحدث","what happens"])){
    relation="mechanism";
    essentialElements=["الموضوع الرئيسي","المدخل أو السبب","الآلية/التحول","النتيجة"];
  }else if(hasAny(q,["لماذا","ليش","why "])){
    relation="causality";
    essentialElements=["السبب","الآلية التي تربط السبب بالنتيجة","النتيجة"];
  }else if(hasAny(q,["الفرق","مقارنة","compare"," vs ","versus"])){
    relation="comparison";
    essentialElements=["العنصر الأول","العنصر الثاني","معيار الفرق الأساسي"];
  }

  const plant=hasAny(q,["نبات","النبات","النباتات","ورقة","الأوراق","photosynthesis","plant"]);
  if(plant&&hasAny(q,["غذاء","طعام","يصنع","تصنع","تمثيل ضوئي","البناء الضوئي","photosynthesis"])){
    relation="transformation";
    coreEssence="النبات يحوّل ضوء الشمس والماء وثاني أكسيد الكربون داخل الورقة إلى سكريات تخزن طاقة كيميائية، مع إطلاق الأكسجين.";
    essentialElements=["ضوء الشمس","الماء من الجذور","ثاني أكسيد الكربون","الورقة/البلاستيدات الخضراء","السكر الناتج","الأكسجين الناتج"];
    mustShow=["دخول الضوء والماء وثاني أكسيد الكربون","مكان التحول داخل الورقة","خروج السكر/الطاقة والأكسجين"];
  }else if(plant&&hasAny(q,["ينمو","نمو","grow","growth"])){
    relation="growth";
    coreEssence="نمو النبات نتيجة تفاعل امتصاص الماء والمغذيات مع الضوء وتبادل الغازات ثم بناء أنسجة جديدة.";
    essentialElements=["الجذور","الماء والمغذيات","الضوء","الأوراق وتبادل الغازات","نسيج جديد/مرحلة نمو"];
    mustShow=["مصدر الماء والمغذيات","التقاط الضوء عبر الأوراق","التغير التدريجي إلى نسيج جديد"];
  }

  return {
    name:"المبادئ الحاكمة للفهم",
    question:clean(question,700),
    audience:clean(audience||"عام",80),
    relation,
    coreEssence,
    essentialElements:cleanList(essentialElements,8,90),
    mustShow:cleanList(mustShow,6,120),
    primaryMotionRule:"حركة أساسية واحدة فقط تمثل أهم انتقال أو تحول في الفكرة.",
    microMotionRule:"Micro motion خفيف جداً لدعم الحياة والانتباه من دون منافسة الحركة الأساسية."
  };
}

function understandingBlock(u){
  return [
    "Core essence: "+clean(u?.coreEssence,420),
    "Indispensable elements: "+cleanList(u?.essentialElements,8,90).join(" | "),
    "Must-show relations: "+cleanList(u?.mustShow,6,120).join(" | "),
    "Semantic relation: "+clean(u?.relation,80),
    "Motion policy: "+clean(u?.primaryMotionRule,180)+" "+clean(u?.microMotionRule,180)
  ].join("\n");
}

function referencePart(){
  const match=String(MYBEE_REFERENCE||"").match(/^data:([^;]+);base64,(.+)$/s);
  return match?{inlineData:{mimeType:match[1],data:match[2]}}:null;
}

function buildImagePrompt(question,brief,audience,understanding){
  const labels=cleanList(brief?.labels,5,28);
  const arrows=cleanList(brief?.arrows,1,90);
  const objects=cleanList(brief?.objects,7,80);
  const primaryMotion=clean(brief?.primaryMotion||arrows[0],120);
  const microMotion=cleanList(brief?.microMotion,2,90);
  const visualDevices=normalizeVisualDevices(brief?.visualDevices);

  return `You are generating the final hero image for NAHLATY, a premium AI visual-explanation product.

The attached image is the OFFICIAL VISUAL QUALITY BENCHMARK.
Use it only as a benchmark for cinematic production quality, depth, scene richness, premium lighting, clear hero subject, integrated educational arrows/labels/callouts, elegant composition, and "understand at first glance" explanatory power.

DO NOT copy the bee, flowers, child, lake, layout, or literal content unless the user's topic actually requires them.
DO NOT force every topic into the same composition.
The topic must determine the world, camera, materials, palette and visual language.

USER QUESTION:
${question}

AUDIENCE:
${audience}

GOVERNING UNDERSTANDING PRINCIPLES — DECIDED BY NAHLATY BEFORE GEMINI:
${understandingBlock(understanding)}

These principles are a semantic contract. Preserve the indispensable elements and must-show relation; visual beauty must not erase meaning.

VISUAL DIRECTOR PLAN:
Title: ${clean(brief?.title,90)}
One-sentence idea: ${clean(brief?.coreIdea,320)}
Hero subject: ${clean(brief?.heroSubject,180)}
Visual story: ${clean(brief?.visualStory,850)}
Main visible objects: ${objects.join(" | ")}
Primary semantic motion: ${primaryMotion}
Micro motion: ${microMotion.join(" | ")}
Meaningful directional cue: ${arrows.join(" | ")}
Short Arabic labels: ${labels.join(" | ")}
Selected explanation devices: ${visualDevices.map(deviceLine).join(" | ") || "none"}
Composition: ${clean(brief?.composition,650)}
Depth plan: ${clean(brief?.depthPlan,500)}
Lighting: ${clean(brief?.lighting,450)}
Palette: ${clean(brief?.palette,350)}
Accuracy constraints: ${clean(brief?.accuracyNotes,650)}

NON-NEGOTIABLE OUTPUT STANDARD:
1. ONE unified 16:9 cinematic scene, not a dashboard and not a slide deck.
2. The image itself must explain the concept before the viewer reads the labels.
3. Premium documentary / cinematic key-art quality with believable materials, shadows, depth, lighting and atmosphere.
4. Use a strong foreground / midground / background composition when useful.
5. One dominant hero subject. Secondary objects support the explanation, never compete with it.
6. Integrate explanation into the world itself using the BEST device for the idea, not arrows by default. Available devices include: icons, frames/containers, stage numbers, contrast markers, 3D models, hotspots, explanatory cards, progress bars, scale indicators, arrows/paths, cutaways, magnified insets, before→after and flow trails. Use only devices that materially improve comprehension.
7. Arabic text must be minimal, short, legible, and placed cleanly. No paragraphs.
8. Show sequence, causality, transfer, transformation, comparison or mechanism spatially when relevant.
9. For biology/science: premium scientific visualization with cinematic realism, not toy-like 3D.
10. For abstract/business/technology topics: invent an appropriate visual metaphor or spatial scene rather than defaulting to boxes and flowcharts.
11. No generic stock-photo look. No childish flat illustration unless explicitly appropriate. No PowerPoint aesthetic. No dense infographic grid. No excessive cards.
12. No neon cyberpunk, decorative charts, fake measurements, invented scientific facts, logos or watermarks.
13. If a detail is uncertain, simplify it instead of inventing it.
14. Scientific / mechanical / logical correctness outranks spectacle.
15. Match the attached benchmark's AMBITION and FINISH, not its literal subject.
16. Use ONE primary semantic motion only. Any other motion must be subtle micro motion and never compete for attention.
17. Arrows are optional. Do not choose an arrow if another visual device communicates the relationship more clearly.
18. Never use every device at once. Choose the smallest useful combination; visual devices are explanatory instruments, not decoration.

Return only the finished image.`;
}

export async function generateStaticVisual(questionInput,audienceInput="عام"){
  const question=clean(questionInput,700);
  const audience=clean(audienceInput||"عام",80);
  if(!question) throw Object.assign(new Error("اكتب ما الذي تريد فهمه."),{status:400});

  // NAHLATY establishes the semantic contract before any Gemini request.
  const understanding=buildUnderstandingPrinciples(question,audience);

  const ai=createGemini();
  if(!ai) throw Object.assign(new Error("GEMINI_API_KEY غير موجود."),{status:500});

  const directorPrompt=`You are the senior visual director for NAHLATY.
Your job is NOT to create an infographic. Design ONE cinematic still image that teaches the user's idea visually at first glance.

Think like a film production designer + scientific illustrator + information designer.
Choose the visual world according to the topic. Determine what the eye notices first, what spatial relationship carries the meaning, what should be foreground/midground/background, and which tiny set of arrows/labels truly improves understanding.

Return JSON only with:
title, coreIdea, heroSubject, visualStory, objects, primaryMotion, microMotion, visualDevices, arrows, labels, composition, depthPlan, lighting, palette, accuracyNotes.

Rules:
- heroSubject: one dominant visual focus.
- objects: 3-7 concrete visible elements only.
- primaryMotion: exactly ONE sentence for the single most important semantic movement/transition.
- microMotion: 0-2 subtle supporting motions only.
- visualDevices: choose 0-6 items ONLY when useful. Each item must be an object with {type,purpose,label,placement}. Allowed type values: icon, frame, container, stage-number, contrast-marker, 3d-model, hotspot, explanation-card, progress-bar, scale-indicator, arrow.
- Choose devices by meaning: stage-number for sequence; contrast-marker for comparison; 3d-model for spatial/mechanical structure; hotspot for inspectable local detail; explanation-card for a short local clarification; progress-bar for genuine progression; scale-indicator for magnitude/size; frame/container for grouping; icon for rapid recognition; arrow only for directional/causal flow.
- arrows: 0-1 only when direction itself matters. An arrow is NOT the default visual aid.
- labels: 2-5 short Arabic labels, ideally 1-3 words each.
- composition: describe camera angle and placement.
- depthPlan: foreground/midground/background and any cutaway or magnified detail.
- lighting: cinematic key/fill/rim or natural equivalent appropriate to the topic.
- accuracyNotes: specific things the image must not misrepresent.
- No dashboards, card grids, flowchart boxes, slide layouts, or generic SaaS visuals.
- Prefer a single memorable visual story over many disconnected facts.

Question: ${question}
Audience: ${audience}`;

  const brief=await generateJson(ai,directorPrompt,{maxAttempts:2,retryBaseMs:350});
  const ref=referencePart();
  const request={
    model:IMAGE_MODEL,
    contents:[{role:"user",parts:[ref,{text:buildImagePrompt(question,brief,audience,understanding)}].filter(Boolean)}],
    config:{
      responseModalities:["IMAGE"],
      responseFormat:{image:{aspectRatio:"16:9",imageSize:"2K"}}
    }
  };

  // Gemini documents 503/429/5xx as transient conditions. Retry the same
  // cinematic request with bounded exponential backoff instead of immediately
  // falling back to the legacy explainer.
  let response;
  let lastError;
  const retryDelays=[0,1200,3000,6500];
  for(let attempt=0;attempt<retryDelays.length;attempt+=1){
    if(retryDelays[attempt]) await new Promise(resolve=>setTimeout(resolve,retryDelays[attempt]));
    try{
      response=await ai.models.generateContent(request);
      break;
    }catch(error){
      lastError=error;
      if(!isTransientGenAIError(error)||attempt===retryDelays.length-1) throw error;
    }
  }
  if(!response) throw lastError||new Error("Image generation failed.");

  const imagePart=(response?.candidates?.[0]?.content?.parts||[]).find(p=>p?.inlineData?.data);
  if(!imagePart) throw Object.assign(new Error("لم يرجع مولد الصور صورة هذه المرة."),{status:502});

  return {
    image:`data:${imagePart.inlineData.mimeType||"image/png"};base64,${imagePart.inlineData.data}`,
    title:clean(brief?.title,100)||question,
    brief:{
      coreIdea:clean(brief?.coreIdea,320),
      heroSubject:clean(brief?.heroSubject,180),
      labels:cleanList(brief?.labels,5,32),
      arrows:cleanList(brief?.arrows,1,100),
      primaryMotion:clean(brief?.primaryMotion||cleanList(brief?.arrows,1,100)[0],120),
      microMotion:cleanList(brief?.microMotion,2,90),
      visualDevices:normalizeVisualDevices(brief?.visualDevices)
    },
    understanding:{name:understanding.name,relation:understanding.relation,coreEssence:understanding.coreEssence,essentialElements:understanding.essentialElements,mustShow:understanding.mustShow},
    benchmark:"NAHLATY_OFFICIAL_CINEMATIC_REFERENCE",
    model:IMAGE_MODEL
  };
}

export function staticVisualErrorResponse(error){
  const detail=String(error?.message||error);
  const status=Number(error?.status)||500;
  const noImageQuota=status===429&&(detail.includes("limit: 0")||detail.includes("free_tier"));
  if(noImageQuota) return {status:503,body:{error:"توليد الصور عبر Gemini API غير مفعّل على الخطة الحالية للمفتاح. المنصة جاهزة برمجياً لكن نحتاج تفعيل Billing لتجربة التوليد الحقيقية.",code:"IMAGE_BILLING_REQUIRED"}};
  if(isTransientGenAIError(error)) return {status:503,body:{error:"مولد الصور مشغول مؤقتاً. أعد المحاولة بعد قليل.",code:"AI_BUSY"}};
  return {status,body:{error:status===400?detail:"تعذر توليد الصورة.",detail}};
}
