import { NextResponse } from "next/server";
import { buildEnginePrompt, localHeartResult, sanitizeEngineResult } from "../../../lib/nahlaty-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

function jsonError(message, status=400, code="BAD_REQUEST") {
  return NextResponse.json({ ok:false, error:{ code, message } }, { status });
}

async function callGemini(prompt) {
  const endpoint=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`;
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),12000);
  try {
    const response=await fetch(endpoint,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "x-goog-api-key":API_KEY
      },
      body:JSON.stringify({
        contents:[{role:"user",parts:[{text:prompt}]}],
        generationConfig:{
          temperature:0.15,
          responseMimeType:"application/json",
          maxOutputTokens:1100
        }
      }),
      signal:controller.signal,
      cache:"no-store"
    });
    const payload=await response.json().catch(()=>null);
    if(!response.ok) {
      const message=payload?.error?.message || `Gemini request failed (${response.status})`;
      throw new Error(message);
    }
    const text=payload?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("").trim();
    if(!text) throw new Error("Gemini returned an empty response");
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const selfTest=localHeartResult("كيف تمنع صمامات القلب رجوع الدم؟");
  return NextResponse.json({
    ok:true,
    engine:"nahlaty",
    version:"engine-v1",
    providerConfigured:Boolean(API_KEY),
    provider:API_KEY ? "gemini" : "curated-local",
    model:API_KEY ? MODEL : null,
    localKnowledge:["heart"],
    selfTest:{
      passed:selfTest?.topic==="valves" && selfTest?.scene===3,
      topic:selfTest?.topic||null,
      scene:Number.isInteger(selfTest?.scene)?selfTest.scene:null
    }
  });
}

export async function POST(request) {
  let body;
  try { body=await request.json(); }
  catch { return jsonError("Invalid JSON body."); }

  const question=String(body?.question||"").trim();
  const context=body?.context && typeof body.context==="object" ? body.context : {};

  if(question.length<4) return jsonError("السؤال قصير جدًا. اكتب ما الذي تريد أن تفهمه بوضوح.",422,"QUESTION_TOO_SHORT");
  if(question.length>700) return jsonError("السؤال طويل جدًا لهذه النسخة التجريبية.",422,"QUESTION_TOO_LONG");

  const local=localHeartResult(question);

  if(!API_KEY) {
    if(!local) return jsonError("Gemini API key is not configured yet for open-domain questions.",503,"MODEL_PROVIDER_NOT_CONFIGURED");
    return NextResponse.json({
      ok:true,
      provider:"curated-local",
      model:null,
      result:sanitizeEngineResult(local,local)
    });
  }

  try {
    const raw=await callGemini(buildEnginePrompt({question,context,local}));
    const result=sanitizeEngineResult(raw,local);
    return NextResponse.json({
      ok:true,
      provider:"gemini",
      model:MODEL,
      result
    });
  } catch(error) {
    if(local) {
      return NextResponse.json({
        ok:true,
        provider:"curated-fallback",
        model:MODEL,
        warning:"Model provider unavailable; served verified prototype knowledge.",
        result:sanitizeEngineResult(local,local)
      });
    }
    const timedOut=error?.name==="AbortError";
    return jsonError(
      timedOut ? "The model provider timed out." : "The model provider could not complete this request.",
      502,
      timedOut ? "MODEL_TIMEOUT" : "MODEL_PROVIDER_ERROR"
    );
  }
}
