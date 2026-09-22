import { createGemini, generateJson, isTransientGenAIError } from "../../lib/genai";
import MYBEE_REFERENCE from "../../mybee-reference-data";

export const runtime = "nodejs";
export const maxDuration = 60;

const IMAGE_MODEL = "gemini-3.1-flash-image";

function clean(value,max=700){
  return String(value||"").replace(/\s+/g," ").trim().slice(0,max);
}

function referencePart(){
  const match=String(MYBEE_REFERENCE||"").match(/^data:([^;]+);base64,(.+)$/s);
  if(!match) return null;
  return {inlineData:{mimeType:match[1],data:match[2]}};
}

function buildImagePrompt(question,brief,audience){
  const labels=(brief?.labels||[]).slice(0,5).map(x=>clean(x,28)).filter(Boolean);
  const arrows=(brief?.arrows||[]).slice(0,5).map(x=>clean(x,90)).filter(Boolean);
  const objects=(brief?.objects||[]).slice(0,7).map(x=>clean(x,80)).filter(Boolean);

  return `You are generating the final hero image for NAHLATY, a premium AI visual-explanation product.

The attached image is the OFFICIAL VISUAL QUALITY BENCHMARK.
Use it only as a benchmark for:
- cinematic production quality
- depth and scene richness
- premium lighting and atmospheric perspective
- clear hero subject
- integrated educational arrows / labels / callouts
- elegant composition and visual hierarchy
- "understand at first glance" explanatory power

DO NOT copy the bee, flowers, child, lake, layout, or literal content unless the user's topic actually requires them.
DO NOT turn every topic into the same composition.
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
6. Integrate visual explanation into the world itself: elegant arrows, paths, numbered cues, cutaways, magnified insets, glow traces, before→after, flow trails, or localized callouts only when they teach something.
7. Arabic text must be minimal, short, legible, and placed cleanly. No paragraphs.
8. Show sequence, causality, transfer, transformation, comparison or mechanism spatially when relevant.
9. For biology/science: premium scientific visualization with cinematic realism, not toy-like 3D.
10. For abstract/business/technology topics: invent an appropriate visual metaphor or spatial scene rather than defaulting to boxes and flowcharts.
11. No generic stock-photo look. No childish flat illustration unless explicitly appropriate. No PowerPoint aesthetic. No dense infographic grid. No excessive cards.
12. No neon cyberpunk, no decorative charts, no fake measurements, no invented scientific facts, no logos, no watermarks.
13. If a detail is uncertain, simplify it instead of inventing it.
14. Scientific / mechanical / logical correctness outranks spectacle.
15. Match the attached benchmark's AMBITION and FINISH, not its literal subject.

Return only the finished image.`;
}

export async function POST(req){
  try{
    const body=await req.json();
    const question=clean(body?.question,700);
    const audience=clean(body?.audience||"عام",80);
    if(!question) return Response.json({error:"اكتب ما الذي تريد فهمه."},{status:400});

    const ai=createGemini();
    if(!ai) return Response.json({error:"GEMINI_API_KEY غير موجود."},{status:500});

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
    const prompt=buildImagePrompt(question,brief,audience);
    const ref=referencePart();

    const parts=[ref,{text:prompt}].filter(Boolean);
    const response=await ai.models.generateContent({
      model:IMAGE_MODEL,
      contents:[{role:"user",parts}],
      config:{
        responseModalities:["IMAGE"],
        responseFormat:{image:{aspectRatio:"16:9",imageSize:"2K"}}
      }
    });

    const outputParts=response?.candidates?.[0]?.content?.parts||[];
    const imagePart=outputParts.find(p=>p?.inlineData?.data);
    if(!imagePart) return Response.json({error:"لم يرجع مولد الصور صورة هذه المرة."},{status:502});

    return Response.json({
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
    });
  }catch(error){
    const detail=String(error?.message||error);
    console.error("[NAHLATY_STATIC_VISUAL_ERROR]",detail);
    if(isTransientGenAIError(error)) return Response.json({error:"مولد الصور مشغول مؤقتاً. أعد المحاولة بعد قليل.",code:"AI_BUSY"},{status:503});
    return Response.json({error:"تعذر توليد الصورة.",detail},{status:500});
  }
}
