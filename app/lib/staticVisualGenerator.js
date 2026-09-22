import { createGemini, generateJson, isTransientGenAIError } from "./genai";
import MYBEE_REFERENCE from "../mybee-reference-data";

export const IMAGE_MODEL="gemini-3.1-flash-image";

const clean=(value,max=700)=>String(value||"").replace(/\s+/g," ").trim().slice(0,max);

function referencePart(){
  const match=String(MYBEE_REFERENCE||"").match(/^data:([^;]+);base64,(.+)$/s);
  return match?{inlineData:{mimeType:match[1],data:match[2]}}:null;
}

function buildImagePrompt(question,brief,audience){
  const labels=(brief?.labels||[]).slice(0,5).map(x=>clean(x,28)).filter(Boolean);
  const arrows=(brief?.arrows||[]).slice(0,5).map(x=>clean(x,90)).filter(Boolean);
  const objects=(brief?.objects||[]).slice(0,7).map(x=>clean(x,80)).filter(Boolean);

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

VISUAL DIRECTOR PLAN:
Title: ${clean(brief?.title,90)}
One-sentence idea: ${clean(brief?.coreIdea,320)}
Hero subject: ${clean(brief?.heroSubject,180)}
Visual story: ${clean(brief?.visualStory,850)}
Main visible objects: ${objects.join(" | ")}
Meaningful arrows / directional cues: ${arrows.join(" | ")}
Short Arabic labels: ${labels.join(" | ")}
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
6. Integrate explanation into the world itself: elegant arrows, paths, numbered cues, cutaways, magnified insets, glow traces, before→after, flow trails, or localized callouts only when they teach something.
7. Arabic text must be minimal, short, legible, and placed cleanly. No paragraphs.
8. Show sequence, causality, transfer, transformation, comparison or mechanism spatially when relevant.
9. For biology/science: premium scientific visualization with cinematic realism, not toy-like 3D.
10. For abstract/business/technology topics: invent an appropriate visual metaphor or spatial scene rather than defaulting to boxes and flowcharts.
11. No generic stock-photo look. No childish flat illustration unless explicitly appropriate. No PowerPoint aesthetic. No dense infographic grid. No excessive cards.
12. No neon cyberpunk, decorative charts, fake measurements, invented scientific facts, logos or watermarks.
13. If a detail is uncertain, simplify it instead of inventing it.
14. Scientific / mechanical / logical correctness outranks spectacle.
15. Match the attached benchmark's AMBITION and FINISH, not its literal subject.

Return only the finished image.`;
}

export async function generateStaticVisual(questionInput,audienceInput="عام"){
  const question=clean(questionInput,700);
  const audience=clean(audienceInput||"عام",80);
  if(!question) throw Object.assign(new Error("اكتب ما الذي تريد فهمه."),{status:400});

  const ai=createGemini();
  if(!ai) throw Object.assign(new Error("GEMINI_API_KEY غير موجود."),{status:500});

  const directorPrompt=`You are the senior visual director for NAHLATY.
Your job is NOT to create an infographic. Design ONE cinematic still image that teaches the user's idea visually at first glance.

Think like a film production designer + scientific illustrator + information designer.
Choose the visual world according to the topic. Determine what the eye notices first, what spatial relationship carries the meaning, what should be foreground/midground/background, and which tiny set of arrows/labels truly improves understanding.

Return JSON only with:
title, coreIdea, heroSubject, visualStory, objects, arrows, labels, composition, depthPlan, lighting, palette, accuracyNotes.

Rules:
- heroSubject: one dominant visual focus.
- objects: 3-7 concrete visible elements only.
- arrows: 0-5 meaningful causal/directional cues, not decoration.
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
  const response=await ai.models.generateContent({
    model:IMAGE_MODEL,
    contents:[{role:"user",parts:[ref,{text:buildImagePrompt(question,brief,audience)}].filter(Boolean)}],
    config:{
      responseModalities:["IMAGE"],
      responseFormat:{image:{aspectRatio:"16:9",imageSize:"2K"}}
    }
  });

  const imagePart=(response?.candidates?.[0]?.content?.parts||[]).find(p=>p?.inlineData?.data);
  if(!imagePart) throw Object.assign(new Error("لم يرجع مولد الصور صورة هذه المرة."),{status:502});

  return {
    image:`data:${imagePart.inlineData.mimeType||"image/png"};base64,${imagePart.inlineData.data}`,
    title:clean(brief?.title,100)||question,
    brief:{
      coreIdea:clean(brief?.coreIdea,320),
      heroSubject:clean(brief?.heroSubject,180),
      labels:Array.isArray(brief?.labels)?brief.labels.slice(0,5).map(x=>clean(x,32)):[],
      arrows:Array.isArray(brief?.arrows)?brief.arrows.slice(0,5).map(x=>clean(x,100)):[]
    },
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
