import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEFAULT_WORLD, applyIntent, localIntent, normalizeWorld } from "../app/lib/prototype1/heartDirector.js";

const leaking = applyIntent("regurgitation", DEFAULT_WORLD).world;

const ROUTING_CASES = [
  ["كيف الدم بيمشي جوّا القلب؟", DEFAULT_WORLD, "flow"],
  ["كيف يتحرك الدم داخل القلب؟", DEFAULT_WORLD, "flow"],
  ["ورجيني مسار الدم", DEFAULT_WORLD, "flow"],
  ["شو جريان الدم؟", DEFAULT_WORLD, "flow"],
  ["blood flow through the heart", DEFAULT_WORLD, "flow"],
  ["heart circulation", DEFAULT_WORLD, "flow"],
  ["كيف يمر الدم؟", DEFAULT_WORLD, "flow"],
  ["شو مسار الدورة؟", DEFAULT_WORLD, "flow"],

  ["ليش الدم ما بيرجع لورا؟", DEFAULT_WORLD, "valve"],
  ["ليش ما يرجع الدم؟", DEFAULT_WORLD, "valve"],
  ["كيف يشتغل الصمام؟", DEFAULT_WORLD, "valve"],
  ["شو وظيفة البلف؟", DEFAULT_WORLD, "valve"],
  ["ماذا يفعل فرق الضغط؟", DEFAULT_WORLD, "valve"],
  ["ليش الصمام بيسكر؟", DEFAULT_WORLD, "valve"],
  ["mitral valve", DEFAULT_WORLD, "valve"],
  ["why does blood not flow backward?", DEFAULT_WORLD, "valve"],
  ["one-way valve", DEFAULT_WORLD, "valve"],
  ["explain backflow prevention", DEFAULT_WORLD, "valve"],

  ["شو بيصير اذا الصمام ما سكر منيح؟", DEFAULT_WORLD, "regurgitation"],
  ["ماذا يحدث اذا ما ينغلق الصمام", DEFAULT_WORLD, "regurgitation"],
  ["الصمام ما يقفل", DEFAULT_WORLD, "regurgitation"],
  ["في ارتجاع", DEFAULT_WORLD, "regurgitation"],
  ["في تسرب بالدم", DEFAULT_WORLD, "regurgitation"],
  ["valve leak", DEFAULT_WORLD, "regurgitation"],
  ["mitral regurgitation", DEFAULT_WORLD, "regurgitation"],
  ["what if it doesn't close", DEFAULT_WORLD, "regurgitation"],

  ["ليش هيدا خطير؟", leaking, "consequence"],
  ["شو تاثير هيدا؟", leaking, "consequence"],
  ["شو اثر الارتجاع؟", leaking, "consequence"],
  ["شو بصير بالرئتين؟", leaking, "consequence"],
  ["في ضيق النفس ليش؟", leaking, "consequence"],
  ["why is this dangerous?", leaking, "consequence"],
  ["what is the effect?", leaking, "consequence"],
  ["what happens to the lungs?", leaking, "consequence"],
  ["does it affect breathing?", leaking, "consequence"],
  ["symptoms?", leaking, "consequence"],

  ["رجع الصمام طبيعي", leaking, "restore"],
  ["ارجع الوضع الطبيعي", leaking, "restore"],
  ["اصلح الصمام", leaking, "restore"],
  ["صلح الصمام", leaking, "restore"],
  ["reset", leaking, "restore"],
  ["restore", leaking, "restore"],
  ["back to normal", leaking, "restore"],

  ["وقف الحركة", leaking, "pause"],
  ["اوقف", leaking, "pause"],
  ["pause", leaking, "pause"],
  ["stop", leaking, "pause"],
  ["freeze", leaking, "pause"],

  ["كمل", leaking, "resume"],
  ["تابع", leaking, "resume"],
  ["استمر", leaking, "resume"],
  ["شغل", leaking, "resume"],
  ["resume", leaking, "resume"],
  ["play", leaking, "resume"],
  ["continue", leaking, "resume"],

  ["من فاز بالمباراة؟", leaking, "unsupported"],
  ["اشرح لي البركان", leaking, "unsupported"],
  ["what is bitcoin", leaking, "unsupported"],
  ["افتح الباب", leaking, "unsupported"],
  ["طبخ رز", leaking, "unsupported"]
];

for (const [question, world, expected] of ROUTING_CASES) {
  test("routing: " + question, () => {
    assert.equal(localIntent(question, world), expected);
  });
}

test("canonical backflow question is never confused with restore", () => {
  assert.equal(localIntent("ليش الدم ما بيرجع لورا؟", DEFAULT_WORLD), "valve");
});

test("regurgitation mutates one persistent world state instead of inventing another schema", () => {
  const next = applyIntent("regurgitation", DEFAULT_WORLD).world;
  assert.equal(next.leaky, true);
  assert.equal(next.view, "valve");
  assert.equal(next.playing, true);
});

test("consequence keeps leak active and changes only the explanatory view", () => {
  const next = applyIntent("consequence", leaking).world;
  assert.equal(next.leaky, true);
  assert.equal(next.view, "consequence");
});

test("restore closes leak and keeps the same bounded world schema", () => {
  const next = applyIntent("restore", leaking).world;
  assert.equal(next.leaky, false);
  assert.equal(next.view, "valve");
  assert.deepEqual(Object.keys(next).sort(), ["intent", "leaky", "pace", "playing", "view"]);
});

test("pause preserves leak and camera intent", () => {
  const next = applyIntent("pause", leaking).world;
  assert.equal(next.playing, false);
  assert.equal(next.leaky, leaking.leaky);
  assert.equal(next.view, leaking.view);
});

test("resume preserves leak and view", () => {
  const paused = applyIntent("pause", leaking).world;
  const next = applyIntent("resume", paused).world;
  assert.equal(next.playing, true);
  assert.equal(next.leaky, leaking.leaky);
  assert.equal(next.view, leaking.view);
});

test("unsupported intent cannot mutate world", () => {
  assert.deepEqual(applyIntent("unsupported", leaking).world, leaking);
  assert.deepEqual(applyIntent("made-up-intent", leaking).world, leaking);
});

test("valve focus slows the simulation for explanation", () => {
  assert.equal(applyIntent("valve", DEFAULT_WORLD).world.pace, 0.48);
});

test("flow returns the camera state to flow and normal pace", () => {
  const next = applyIntent("flow", leaking).world;
  assert.equal(next.view, "flow");
  assert.equal(next.pace, 1);
  assert.equal(next.leaky, true);
});

test("normalization clamps excessive pace", () => {
  assert.equal(normalizeWorld({ pace: 99 }).pace, 1.5);
});

test("normalization clamps too-slow pace", () => {
  assert.equal(normalizeWorld({ pace: -10 }).pace, 0.3);
});

test("normalization rejects invalid view and intent", () => {
  const next = normalizeWorld({ view: "invented", intent: "invented" });
  assert.equal(next.view, "flow");
  assert.equal(next.intent, "flow");
});

test("normalization accepts false playing only as a real boolean", () => {
  assert.equal(normalizeWorld({ playing: false }).playing, false);
  assert.equal(normalizeWorld({ playing: "false" }).playing, true);
});

test("normalization refuses string-based leak injection", () => {
  assert.equal(normalizeWorld({ leaky: "true" }).leaky, false);
});

const heartSource = readFileSync(new URL("../app/prototype-1/HeartWorld.js", import.meta.url), "utf8");
const pageSource = readFileSync(new URL("../app/prototype-1/page.js", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../app/prototype-1/page.module.css", import.meta.url), "utf8");

test("visual world uses the inspected anatomical heart asset", () => {
  assert.match(heartSource, /\/assets\/heart\/ijiri-heart-v4\.glb/);
});

test("visual world keeps semantic geometry separate from anatomical shell", () => {
  assert.match(heartSource, /const semantic = new THREE\.Group/);
  assert.match(heartSource, /anatomicalShell/);
});

test("visual world contains true mitral leaflets instead of a generic dot marker", () => {
  assert.match(heartSource, /leftLeaflet/);
  assert.match(heartSource, /rightLeaflet/);
  assert.doesNotMatch(heartSource, /genericPulseMarker/);
});

test("visual world has distinct forward, regurgitation, and pressure paths", () => {
  assert.match(heartSource, /inflowCurve/);
  assert.match(heartSource, /regurgitationCurve/);
  assert.match(heartSource, /pressureCurve/);
});

test("visual world has a resize observer for screen changes", () => {
  assert.match(heartSource, /ResizeObserver/);
});

test("visual world caps device pixel ratio for mobile stability", () => {
  assert.match(heartSource, /Math\.min\(window\.devicePixelRatio \|\| 1, 1\.65\)/);
});

test("visual world disposes WebGL resources on teardown", () => {
  assert.match(heartSource, /renderer\.dispose/);
  assert.match(heartSource, /geometry\.dispose/);
  assert.match(heartSource, /material\.dispose/);
});

test("visual world never swaps in video for the interactive explanation", () => {
  assert.doesNotMatch(heartSource, /<video|VideoTexture|\.mp4/);
});

test("page keeps a free-form question input", () => {
  assert.match(pageSource, /id="p1-question"/);
  assert.match(pageSource, /setQuestion/);
});

test("page keeps AI routing endpoint connected", () => {
  assert.match(pageSource, /fetch\("\/api\/prototype-1"/);
});

test("page keeps local bounded fallback instead of failing silently", () => {
  assert.match(pageSource, /localIntent/);
  assert.match(pageSource, /تعذّر الاتصال بالخادم/);
});

test("page exposes pause and resume without destroying state", () => {
  assert.match(pageSource, /togglePlayback/);
});

test("page exposes restore only for the changed valve state", () => {
  assert.match(pageSource, /disabled=\{!world\.leaky\}/);
});

test("screen CSS has desktop/tablet/mobile breakpoints", () => {
  assert.match(cssSource, /@media\(max-width:900px\)/);
  assert.match(cssSource, /@media\(max-width:650px\)/);
  assert.match(cssSource, /@media\(max-width:390px\)/);
});

test("mobile question field avoids iOS zoom by using 16px input text", () => {
  assert.match(cssSource, /\.promptRow input\{flex-basis:100%;font-size:16px\}/);
});

test("3D canvas reserves touch gestures for its own orbit interaction", () => {
  assert.match(cssSource, /touch-action:none/);
});

test("page does not use fixed-position UI that can cover small screens", () => {
  assert.doesNotMatch(cssSource, /position\s*:\s*fixed/);
});

test("experience reflows to one column on tablet screens", () => {
  assert.match(cssSource, /\.belowScene\{grid-template-columns:1fr\}/);
});

test("small phone layout removes the nonessential legend before shrinking the scene", () => {
  assert.match(cssSource, /\.sceneLegend\{display:none\}/);
});

test("reduced-motion users get a stable presentation", () => {
  assert.match(cssSource, /prefers-reduced-motion:reduce/);
});
