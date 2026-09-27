/**
 * An authored, deterministic pollination proof. This is a LAB fixture rather
 * than an AI-generated or general-purpose biological simulation.
 * Stable IDs and coordinates are the contract for composited scene overlays.
 */
export const POLLINATION_WORLD_ID = "pollination-world-v1";
export const POLLINATION_PHASES = Object.freeze(["approach", "collect", "travel", "transfer", "outcome"]);
export const POLLINATION_POSITIONS = Object.freeze([
  { x: 178, y: 240 },
  { x: 258, y: 312 },
  { x: 492, y: 202 },
  { x: 751, y: 306 },
  { x: 846, y: 214 }
]);

export function pollinationScene(phase = 0, condition = "normal") {
  const step = Number.isInteger(phase) ? Math.max(0, Math.min(4, phase)) : 0;
  const blocked = condition === "blocked";
  return {
    worldId: POLLINATION_WORLD_ID,
    subjectId: "bee-1",
    stageId: POLLINATION_PHASES[step],
    step,
    bee: { ...POLLINATION_POSITIONS[step], pollenOnLegs: step >= 1 && (step < 3 || blocked) },
    flowerOne: { id: "flower-1", x: 263, y: 375, pollenAvailable: true },
    flowerTwo: {
      id: "flower-2", x: 748, y: 375,
      pollenReceived: !blocked && step >= 3,
      postPollinationProcess: !blocked && step === 4
    },
    condition: blocked ? "blocked" : "normal",
    focus: step === 0 ? "bee" : step === 1 ? "first-flower" : step === 2 ? "flight" : "second-flower",
    note: [
      "اقترب من الزهرة",
      "التقط حبوب اللقاح",
      "انقل اللقاح إلى زهرة أخرى",
      blocked ? "لم يصل اللقاح إلى الميسم" : "وصل اللقاح إلى الميسم",
      blocked ? "لم يحدث تلقيح في هذه الرحلة" : "بدأت مرحلة ما بعد التلقيح"
    ][step]
  };
}

export function pollinationTransition(current, event) {
  const previous = pollinationScene(current?.step, current?.condition);
  switch (event) {
    case "NEXT":
      return pollinationScene(Math.min(4, previous.step + 1), previous.condition);
    case "BACK":
      return pollinationScene(Math.max(0, previous.step - 1), previous.condition);
    case "BLOCK_TRANSFER":
      return pollinationScene(3, "blocked");
    case "ALLOW_TRANSFER":
      return pollinationScene(3, "normal");
    case "RESET":
      return pollinationScene();
    default:
      return previous;
  }
}

export function interpretPollinationPrompt(question) {
  const q = String(question || "").trim();
  if (!q) return null;
  if (/(?:لم|لا|بدون|منع|غياب|توقف|توقّف|blocked|without|no\s+pollen)/i.test(q)
    && /(لقاح|تلقيح|انتقال|تنتقل|تحمل|pollen|pollinat)/i.test(q)) return "BLOCK_TRANSFER";
  if (/(?:ماذا|كيف|عندما|إذا|اذا|يصل|تنتقل|وصل|normal|allow)/i.test(q)
    && /(لقاح|تلقيح|انتقال|pollen|pollinat)/i.test(q)) return "ALLOW_TRANSFER";
  if (/(?:البداية|ابدأ|أعد|ارجع|reset|restart)/i.test(q)) return "RESET";
  return null;
}
