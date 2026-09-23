import { createGemini, generateJson } from "../../lib/genai";
import { applyIntent, INTENTS, localIntent, normalizeWorld } from "../../lib/prototype1/heartDirector";

export const runtime = "nodejs";
export const maxDuration = 25;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "تعذّر قراءة السؤال." }, { status: 400 });
  }
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question || question.length > 420) {
    return Response.json({ error: "اكتب سؤالًا بين حرف واحد و420 حرفًا." }, { status: 400 });
  }
  const world = normalizeWorld(body?.world);
  const history = Array.isArray(body?.history)
    ? body.history.slice(-5).map(entry => ({
        question: String(entry?.question || "").slice(0,220),
        intent: INTENTS.includes(entry?.intent) ? entry.intent : "unsupported"
      }))
    : [];

  let intent = localIntent(question, world);
  let engine = "local";
  let notice = "تفسير محلي محدود: لم نتصل بالذكاء الاصطناعي. المشهد يعمل ضمن موضوع القلب فقط.";
  const ai = createGemini();
  if (ai) {
    const prompt = [
      "You route Arabic or English user follow-up questions to an EXISTING persistent interactive scene.",
      "The world is an educational SCHEMATIC of LEFT heart blood flow: pulmonary veins > left atrium > mitral valve > left ventricle > aortic valve > aorta.",
      "Available intents: " + INTENTS.join(", ") + ".",
      "flow: follow left heart circulation; valve: why/how mitral valve opens or closes, pressure, one-way flow;",
      "regurgitation: what if mitral valve fails to close, leakage/backflow; consequence: consequences of current mitral regurgitation;",
      "restore: return leaky mitral valve to normal; pause: freeze time; resume: play; unsupported: any other topic, uncertain requests or inaccessible anatomy.",
      "Interpret demonstratives ('this', 'it', 'why dangerous') using currentWorld and recentHistory.",
      "NEVER label aortic regurgitation, right-heart disease, surgery, treatment or unrelated subjects as supported.",
      "Do not answer the medical question; output ONLY JSON with a single property 'intent' set to one exact allowed intent.",
      "currentWorld: " + JSON.stringify(world),
      "recentHistory: " + JSON.stringify(history),
      "newQuestion: " + JSON.stringify(question)
    ].join("\n");
    try {
      const result = await generateJson(ai, prompt, { maxAttempts: 1 });
      intent = INTENTS.includes(result?.intent) ? result.intent : "unsupported";
      engine = "ai";
      notice = "";
    } catch (error) {
      console.error("[NAHLATY_P1_ROUTING]", String(error?.message || error).slice(0,220));
      notice = "تعذّر اتصال AI حاليًا؛ استخدمنا التفسير المحلي المقيّد، ولم نغيّر المشهد إن لم نفهم السؤال.";
    }
  }
  const decision = applyIntent(intent, world);
  return Response.json({
    ...decision,
    engine,
    notice,
    scope: "left-heart-mitral-valve-v1"
  }, { headers: { "Cache-Control": "no-store" } });
}
