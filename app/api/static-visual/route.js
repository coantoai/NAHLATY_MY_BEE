import { createGemini, generateJson, isTransientGenAIError } from "../../lib/genai";

export const runtime = "nodejs";
export const maxDuration = 60;

const IMAGE_MODEL = "gemini-3.1-flash-image";

function clean(value, max=500){
  return String(value||"").replace(/\s+/g," ").trim().slice(0,max);
}

function buildImagePrompt(question, brief, audience){
  const labels = (brief?.labels||[]).slice(0,6).map(x=>clean(x,36)).filter(Boolean);
  const arrows = (brief?.arrows||[]).slice(0,6).map(x=>clean(x,70)).filter(Boolean);
  const objects = (brief?.objects||[]).slice(0,8).map(x=>clean(x,70)).filter(Boolean);
  return `Create ONE premium cinematic educational visual explanation in a single 16:9 image.

USER QUESTION:
${question}

AUDIENCE:
${audience}

VISUAL DIRECTOR BRIEF:
Title: ${clean(brief?.title,80)}
Core idea: ${clean(brief?.coreIdea,300)}
Visual story: ${clean(brief?.visualStory,700)}
Main objects: ${objects.join(" | ")}
Directional arrows / cause-effect cues: ${arrows.join(" | ")}
Arabic labels to place in the image: ${labels.join(" | ")}
Composition: ${clean(brief?.composition,500)}
Lighting / palette: ${clean(brief?.palette,300)}
Accuracy notes: ${clean(brief?.accuracyNotes,500)}

ART DIRECTION — NON-NEGOTIABLE:
- The image itself must teach the idea at first glance.
- Premium cinematic realism or premium cinematic scientific illustration depending on the subject.
- Strong depth, deliberate lighting, beautiful composition, subject separation, atmospheric perspective, realistic materials and texture.
- Integrate explanation INTO the scene: elegant arrows, numbered cues, short Arabic labels, small visual callouts only where useful.
- Keep Arabic text very short and readable. Do not create paragraphs.
- Show causal flow, sequence, transformation, direction, or comparison visually where relevant.
- One dominant hero subject, with secondary explanatory elements arranged around it.
- Use the visual language of a world-class documentary frame + educational explainer, not a dashboard, not a slide deck, not a flat infographic, not a cartoon unless the topic truly calls for it.
- Avoid generic stock imagery, excessive UI chrome, excessive text, decorative charts, neon cyberpunk, clutter, fake scientific measurements, invented facts, random icons, watermarks, logos.
- If there is uncertainty, prefer a simple honest visual over invented detail.
- Preserve scientific/mechanical/logical correctness over spectacle.
- Output only the finished image.`;
}

export async function POST(req){
  try{
    const body = await req.json();
    const question = clean(body?.question,700);
    const audience = clean(body?.audience||"عام",80);
    if(!question) return Response.json({error:"اكتب ما الذي تريد فهمه."},{status:400});

    const ai = createGemini();
    if(!ai) return Response.json({error:"GEMINI_API_KEY غير موجود."},{status:500});

    const directorPrompt = `You are the visual director of NAHLATY, an AI visual explanation product.
Turn the user's question into a precise plan for ONE static cinematic educational image.
The image must make the concept understandable at a glance using composition, arrows, spatial relationships, visual cues and only a few short Arabic labels.

Return JSON only with:
title, coreIdea, visualStory, objects, arrows, labels, composition, palette, accuracyNotes.
objects: 3-8 concrete visible things.
arrows: 0-6 short descriptions of meaningful directional/causal arrows.
labels: 2-6 short Arabic labels, preferably 1-4 words each.
accuracyNotes: what must NOT be visually misrepresented.
Do not design a dashboard or multi-card UI.
Question: ${question}
Audience: ${audience}`;

    const brief = await generateJson(ai,directorPrompt,{maxAttempts:2,retryBaseMs:350});
    const imagePrompt = buildImagePrompt(question,brief,audience);

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: imagePrompt,
      config:{
        responseModalities:["IMAGE"],
        responseFormat:{
          image:{aspectRatio:"16:9",imageSize:"2K"}
        }
      }
    });

    const parts = response?.candidates?.[0]?.content?.parts||[];
    const imagePart = parts.find(p=>p?.inlineData?.data);
    if(!imagePart) return Response.json({error:"لم يرجع مولد الصور صورة هذه المرة."},{status:502});

    return Response.json({
      image:`data:${imagePart.inlineData.mimeType||"image/png"};base64,${imagePart.inlineData.data}`,
      title:clean(brief?.title,100)||question,
      brief:{
        coreIdea:clean(brief?.coreIdea,320),
        labels:Array.isArray(brief?.labels)?brief.labels.slice(0,6).map(x=>clean(x,40)):[],
        arrows:Array.isArray(brief?.arrows)?brief.arrows.slice(0,6).map(x=>clean(x,90)):[]
      },
      model:IMAGE_MODEL
    });
  }catch(error){
    const detail=String(error?.message||error);
    console.error("[NAHLATY_STATIC_VISUAL_ERROR]",detail);
    if(isTransientGenAIError(error)) return Response.json({error:"مولد الصور مشغول مؤقتاً. أعد المحاولة بعد قليل.",code:"AI_BUSY"},{status:503});
    return Response.json({error:"تعذر توليد الصورة.",detail},{status:500});
  }
}
