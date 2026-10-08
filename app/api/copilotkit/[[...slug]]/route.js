import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
  BuiltInAgent,
  defineTool
} from "@copilotkit/runtime/v2";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

const dashscope = createOpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
});

const HeartSceneSpec = z.object({
  conceptId: z.literal("human-heart-circulation"),
  visualStyle: z.literal("premium_scientific_cinematic"),
  view: z.enum(["anterior_cutaway", "blood_flow_focus"]),
  bpm: z.number().int().min(45).max(140),
  labels: z.boolean(),
  chambers: z.array(z.enum(["right_atrium", "right_ventricle", "left_atrium", "left_ventricle"])).length(4),
  valves: z.array(z.enum(["tricuspid", "pulmonary", "mitral", "aortic"])).length(4),
  vessels: z.array(z.enum([
    "superior_vena_cava",
    "inferior_vena_cava",
    "pulmonary_arteries",
    "pulmonary_veins",
    "aorta"
  ])).min(5),
  flowSequence: z.array(z.enum([
    "body",
    "vena_cavae",
    "right_atrium",
    "tricuspid",
    "right_ventricle",
    "pulmonary_valve",
    "pulmonary_arteries",
    "lungs",
    "pulmonary_veins",
    "left_atrium",
    "mitral",
    "left_ventricle",
    "aortic_valve",
    "aorta"
  ])).length(14),
  deoxygenatedColor: z.literal("blue"),
  oxygenatedColor: z.literal("red"),
  pulmonaryArteriesCarry: z.literal("deoxygenated"),
  pulmonaryVeinsCarry: z.literal("oxygenated"),
  septumVisible: z.literal(true),
  coronarySurfaceDetail: z.boolean(),
  showValveMotion: z.literal(true),
  showBloodParticles: z.literal(true),
  showDepthLighting: z.literal(true),
  scientificClaims: z.array(z.string()).max(8)
});

const EXPECTED_FLOW = [
  "body",
  "vena_cavae",
  "right_atrium",
  "tricuspid",
  "right_ventricle",
  "pulmonary_valve",
  "pulmonary_arteries",
  "lungs",
  "pulmonary_veins",
  "left_atrium",
  "mitral",
  "left_ventricle",
  "aortic_valve",
  "aorta"
];

const scientificValidateHeartScene = defineTool({
  name: "scientific_validate_heart_scene",
  description:
    "MANDATORY hard gate for a NAHLATY heart scene. Call this before applying any heart scene. It checks anatomy, valve set, vessel set, oxygenation colors, pulmonary artery/vein oxygenation, circulation order, and required visual semantics. If FAIL, repair the spec and call again. Never apply a heart scene before PASS.",
  parameters: HeartSceneSpec,
  execute: async (spec) => {
    const issues = [];
    const same = JSON.stringify(spec.flowSequence) === JSON.stringify(EXPECTED_FLOW);
    if (!same) issues.push("Blood-flow sequence is not physiologically ordered.");
    if (new Set(spec.chambers).size !== 4) issues.push("All four chambers must be unique and present.");
    if (new Set(spec.valves).size !== 4) issues.push("All four cardiac valves must be unique and present.");
    if (!spec.vessels.includes("pulmonary_arteries")) issues.push("Pulmonary arteries are missing.");
    if (!spec.vessels.includes("pulmonary_veins")) issues.push("Pulmonary veins are missing.");
    if (!spec.vessels.includes("aorta")) issues.push("Aorta is missing.");
    if (!spec.vessels.includes("superior_vena_cava") || !spec.vessels.includes("inferior_vena_cava")) {
      issues.push("Both superior and inferior vena cava are required.");
    }
    if (spec.pulmonaryArteriesCarry !== "deoxygenated") issues.push("Pulmonary arteries must carry deoxygenated blood in this normal adult circulation scene.");
    if (spec.pulmonaryVeinsCarry !== "oxygenated") issues.push("Pulmonary veins must carry oxygenated blood in this normal adult circulation scene.");
    if (spec.deoxygenatedColor !== "blue") issues.push("Deoxygenated blood convention must be blue.");
    if (spec.oxygenatedColor !== "red") issues.push("Oxygenated blood convention must be red.");
    if (!spec.septumVisible) issues.push("Septum must be represented.");
    if (!spec.showValveMotion) issues.push("Valve motion is required.");
    if (!spec.showBloodParticles) issues.push("Blood-flow animation is required.");
    if (!spec.showDepthLighting) issues.push("Depth lighting is required for the cinematic target.");
    const forbidden = spec.scientificClaims.filter((x) =>
      /100%|guaranteed|exact pressure|exact velocity|exact oxygen saturation/i.test(x)
    );
    if (forbidden.length) issues.push("Unsupported exact physiological claims are not allowed.");

    if (issues.length) {
      return {
        status: "FAIL",
        issues,
        instruction: "Repair every issue and call scientific_validate_heart_scene again. Do not call apply_validated_heart_scene."
      };
    }
    return {
      status: "PASS",
      validationToken: "NAHLATY_HEART_SCIENCE_PASS_V1",
      checks: [
        "4 chambers present",
        "4 valves present",
        "great vessels present",
        "pulmonary artery oxygenation correct",
        "pulmonary vein oxygenation correct",
        "circulation order correct",
        "semantic color convention correct",
        "septum present",
        "valve motion required",
        "blood-flow animation required",
        "unsupported exact claims rejected"
      ]
    };
  }
});

const agent = new BuiltInAgent({
  model: dashscope.chat("qwen-plus"),
  maxSteps: 8,
  temperature: 0.15,
  tools: [scientificValidateHeartScene],
  prompt: `You are the NAHLATY Visual Science Architect working through CopilotKit.

MISSION:
Build a premium scientific cinematic HTML/SVG human-heart explanation scene for NAHLATY. The user wants the heart to feel deep, modern, medically credible, alive, and globally premium — never cartoon, school-diagram, cheap infographic, neon cyberpunk, or generic dashboard.

NON-NEGOTIABLE NAHLATY PRINCIPLES:
- Animate meaning, not decoration.
- The explanation is the scene.
- One dominant explanatory motion + restrained micro-motion + intentional stillness.
- Semantic parts, not free decorative shapes.
- FACT != INFERENCE != UNKNOWN.
- No unsupported scientific claims.
- External visual layer must preserve scientific truth.
- Do not invent anatomy.
- Use the existing semantic HTML/SVG runtime rather than replacing the engine.

SCIENTIFIC GROUND TRUTH FOR THIS NORMAL ADULT CIRCULATION SCENE:
body -> vena cavae -> right atrium -> tricuspid valve -> right ventricle -> pulmonary valve -> pulmonary arteries -> lungs -> pulmonary veins -> left atrium -> mitral valve -> left ventricle -> aortic valve -> aorta.
Pulmonary arteries carry deoxygenated blood and pulmonary veins carry oxygenated blood.
Use the standard explanatory convention: deoxygenated blue, oxygenated red.
Required structures: four chambers, four valves, SVC, IVC, pulmonary arteries, pulmonary veins, aorta, septum.
Valves must visually support one-way flow.
No exact pressure, velocity, oxygen saturation, or other unsupported exact physiological numbers. Describe the septum precisely as separating the right and left sides of the heart and limiting mixing in normal anatomy; do not loosely claim it alone separates the entire pulmonary and systemic circulations.

WORKFLOW — MANDATORY:
1) Design one constrained HeartSceneSpec matching the frontend schema.
2) Call scientific_validate_heart_scene.
3) If it returns FAIL, repair every issue and validate again.
4) Only after PASS, call the frontend tool apply_validated_heart_scene with the exact validated spec and validationToken NAHLATY_HEART_SCIENCE_PASS_V1.
5) If a frontend tool named submit_generated_heart_html is available, you MUST generate a complete self-contained browser-ready HTML/SVG/CSS/JS heart artifact and call submit_generated_heart_html after apply_validated_heart_scene. Do not merely return a SceneSpec.\n6) Then give one short completion message. Never claim success if required frontend tool calls do not return success.

QUALITY TARGET:
- premium scientific cinematic
- clear depth hierarchy
- visible chamber separation and septum
- strong but restrained red/blue flow illumination
- valve motion synchronized to one-way flow
- moving blood particles that follow physiological routing
- readable labels only if they improve comprehension
- no clutter
- no fake 3D claims; use layered SVG depth honestly

When asked to build the heart, act immediately and use the tools. Do not merely describe what you would build.`
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
