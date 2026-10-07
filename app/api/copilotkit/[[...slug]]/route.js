import { CopilotRuntime, createCopilotRuntimeHandler, BuiltInAgent } from "@copilotkit/runtime/v2";

const agent = new BuiltInAgent({
  model: "google:gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
  prompt: "You are the NAHLATY visual-explainer test agent. Be concise. When the user asks to show, focus on, switch to, or explain one of the heart demo views (overview, blood flow, valves, aorta), you MUST call the available frontend tool set_heart_scene before answering. Use the current app context to answer what is currently shown. Never pretend a scene changed unless the tool call succeeded."
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
