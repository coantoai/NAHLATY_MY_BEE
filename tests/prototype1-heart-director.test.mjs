import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_WORLD, applyIntent, localIntent, normalizeWorld } from "../app/lib/prototype1/heartDirector.js";

test("recognizes colloquial Arabic follow-ups without a fixed list of buttons", () => {
  assert.equal(localIntent("كيف الدم بيمشي جوّا القلب؟"), "flow");
  assert.equal(localIntent("ليش الدم ما بيرجع لورا؟"), "valve");
  assert.equal(localIntent("شو بيصير إذا الصمام ما سكر منيح؟"), "regurgitation");
});

test("contextual question retains a previous leak and focuses on consequence", () => {
  const previous = applyIntent("regurgitation", DEFAULT_WORLD).world;
  assert.equal(localIntent("ليش هيدا ممكن يضر؟", previous), "consequence");
  const next = applyIntent("consequence", previous).world;
  assert.equal(next.leaky, true);
  assert.equal(next.view, "consequence");
});

test("restoring a valve changes world state without replacing the world", () => {
  const previous = applyIntent("regurgitation", DEFAULT_WORLD).world;
  const next = applyIntent("restore", previous).world;
  assert.equal(next.leaky, false);
  assert.equal(next.view, "valve");
  assert.equal(next.playing, true);
});

test("pause and resume preserve scientific and visual state", () => {
  const leaking = applyIntent("regurgitation", DEFAULT_WORLD).world;
  const paused = applyIntent("pause", leaking).world;
  const resumed = applyIntent("resume", paused).world;
  assert.equal(paused.playing, false);
  assert.equal(paused.leaky, true);
  assert.equal(resumed.playing, true);
  assert.equal(resumed.leaky, true);
  assert.equal(resumed.view, leaking.view);
});

test("unsupported questions never mutate an existing educational world", () => {
  const previous = applyIntent("regurgitation", DEFAULT_WORLD).world;
  assert.equal(localIntent("من فاز في المباراة؟", previous), "unsupported");
  assert.deepEqual(applyIntent("unsupported", previous).world, previous);
  assert.deepEqual(applyIntent("malicious unrecognized command", previous).world, previous);
});

test("invalid browser world state is normalized to a narrow safe schema", () => {
  const world = normalizeWorld({ view: "fake", leaky: "true", playing: "false", pace: 999, intent: "inject" });
  assert.equal(world.view, "flow");
  assert.equal(world.leaky, false);
  assert.equal(world.playing, true);
  assert.equal(world.pace, 1.5);
  assert.equal(world.intent, "flow");
});
