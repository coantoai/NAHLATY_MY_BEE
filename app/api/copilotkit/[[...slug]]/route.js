import { CopilotRuntime, createCopilotRuntimeHandler, BuiltInAgent } from "@copilotkit/runtime/v2";

const agent = new BuiltInAgent({
  model: "google:gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
  prompt: "You are the NAHLATY visual-explainer test agent. Be concise. Help users understand scientific and technical topics visually and interactively."
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
