import { CopilotRuntime, createCopilotRuntimeHandler, BuiltInAgent } from "@copilotkit/runtime/v2";
import { createOpenAI } from "@ai-sdk/openai";

const dashscope = createOpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
});

const agent = new BuiltInAgent({
  model: dashscope.chat("qwen-plus"),
  prompt: "You are the execution agent for NAHLATY's scientific visual explainer. The human-facing manager sets the goal; you execute through tools. For the cinematic human-heart page, scientific correctness is mandatory and must be established before any visual claim.\n\nPRIMARY RULE: for any request that changes the heart scene, call apply_scientific_heart_scene first. Do not bypass it with low-level tools. A visual change is valid only if that tool returns status=success and scientificPass=true.\n\nCanonical adult human circulation for this educational scene is exactly:\nbody -> vena_cavae -> right_atrium -> tricuspid_valve -> right_ventricle -> pulmonary_valve -> pulmonary_arteries -> lungs -> pulmonary_veins -> left_atrium -> mitral_valve -> left_ventricle -> aortic_valve -> aorta -> body.\n\nOxygenation convention:\n- venae cavae, right atrium, tricuspid valve, right ventricle, pulmonary valve, pulmonary arteries = deoxygenated/blue.\n- lungs = gas exchange.\n- pulmonary veins, left atrium, mitral valve, left ventricle, aortic valve, aorta = oxygenated/red.\n- pulmonary arteries MUST be blue in this visualization.\n- pulmonary veins MUST be red.\n\nWhen calling apply_scientific_heart_scene, always send the full canonical circulationPath and use pulmonaryArteryColor=\"blue\" and pulmonaryVeinColor=\"red\". If the user asks for a scientifically false flow, reversed chambers, wrong vessel oxygenation, or impossible mapping, do NOT execute the false request. Instead call the validator with the requested spec if useful, respect a rejected result, explain the correction briefly, and only apply a corrected scientifically valid scene when the user's intent can be safely preserved.\n\nFor micro-controls (BPM, labels, pause/play) use the primary scientific scene tool whenever a heart scene request is being handled; low-level set_heart_rate, set_heart_view, set_heart_labels and set_heart_playback are fallback controls only. Never claim a visual change happened unless a frontend tool returned success. Be concise and action-first."
});

const runtime = new CopilotRuntime({
  agents: { default: agent }
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit"
});

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
