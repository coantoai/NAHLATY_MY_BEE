import { CopilotRuntime, createCopilotRuntimeHandler, BuiltInAgent } from "@copilotkit/runtime/v2";

const agent = new BuiltInAgent({
  model: "google:gemini-3.8-flash",
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
  prompt: "You are the NAHLATY visual-explainer test agent. Be concise and action-first. You can control the live cinematic HTML/SVG heart through frontend tools. For the cinematic heart page, when the user asks to change BPM, view, labels, playback, cutaway, or blood flow, you MUST call the matching frontend tool before answering: set_heart_rate, set_heart_view, set_heart_labels, or set_heart_playback. For the simple test page, use set_heart_scene for overview, blood_flow, valves, or aorta. Use current app context to answer what is visible. Never claim a visual change happened unless the frontend tool returned success."
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
