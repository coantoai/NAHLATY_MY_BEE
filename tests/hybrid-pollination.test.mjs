import test from "node:test";
import assert from "node:assert/strict";
import {
  POLLINATION_WORLD_ID, pollinationScene, pollinationTransition, interpretPollinationPrompt
} from "../lib/hybrid-pollination.js";

test("the same world and bee persist through every visual state", () => {
  let scene = pollinationScene();
  const world = scene.worldId, bee = scene.subjectId;
  for (let i = 0; i < 4; i++) {
    scene = pollinationTransition(scene, "NEXT");
    assert.equal(scene.worldId, world);
    assert.equal(scene.subjectId, bee);
    assert.equal(scene.step, i + 1);
  }
  assert.equal(scene.flowerTwo.pollenReceived, true);
  assert.equal(scene.flowerTwo.postPollinationProcess, true);
  assert.equal(world, POLLINATION_WORLD_ID);
});

test("a counterfactual follow-up changes pollen transfer without rebuilding the world", () => {
  const initial = pollinationScene(3, "normal");
  const blocked = pollinationTransition(initial, "BLOCK_TRANSFER");
  assert.equal(blocked.worldId, initial.worldId);
  assert.equal(blocked.step, 3);
  assert.equal(blocked.flowerTwo.pollenReceived, false);
  assert.equal(blocked.bee.pollenOnLegs, true);
  assert.equal(pollinationTransition(blocked, "NEXT").flowerTwo.seedDevelopment, false);
  assert.equal(pollinationTransition(blocked, "ALLOW_TRANSFER").flowerTwo.pollenReceived, true);
});

test("a successful transfer removes the carried grain and registers the target state", () => {
  const collecting = pollinationScene(1);
  const flying = pollinationTransition(collecting, "NEXT");
  const receiving = pollinationTransition(flying, "NEXT");
  assert.equal(collecting.bee.pollenOnLegs, true);
  assert.equal(flying.bee.pollenOnLegs, true);
  assert.equal(receiving.bee.pollenOnLegs, false);
  assert.equal(receiving.flowerTwo.pollenReceived, true);
});

test("scene controls clamp phases; reset restores the deterministic fixture", () => {
  assert.equal(pollinationScene(-1).step, 0);
  assert.equal(pollinationScene(99).step, 4);
  assert.equal(pollinationScene(NaN).step, 0);
  assert.equal(pollinationTransition(pollinationScene(4), "NEXT").step, 4);
  assert.deepEqual(pollinationTransition(pollinationScene(3,"blocked"), "RESET"), pollinationScene());
});

test("limited prototype accepts its explicit follow-ups and rejects unrelated questions", () => {
  assert.equal(interpretPollinationPrompt("ماذا يحدث لو لم تنتقل حبوب اللقاح؟"), "BLOCK_TRANSFER");
  assert.equal(interpretPollinationPrompt("كيف يصل اللقاح؟"), "ALLOW_TRANSFER");
  assert.equal(interpretPollinationPrompt("أعد من البداية"), "RESET");
  assert.equal(interpretPollinationPrompt("كيف يعمل القلب؟"), null);
});
