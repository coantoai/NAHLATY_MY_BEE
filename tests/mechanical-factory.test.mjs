import test from "node:test";
import assert from "node:assert/strict";
import {
  REQUIRED_VIEW_MODES,
  validateMechanicalManifest,
  assertMechanicalManifest
} from "../factory/core/mechanicalContract.mjs";
import { reviewMechanicalReadiness, MECHANICAL_STACK } from "../factory/mechanical/mechanicalPipeline.mjs";
import { proceduraToMechanicalDraft, applyMechanicalGateResults } from "../factory/mechanical/proceduraAdapter.mjs";

function validFixture() {
  const draft = proceduraToMechanicalDraft({
    subject: "four-stroke inline engine",
    revision: "pinned-upstream-revision",
    parts: [
      {
        name: "engine_block",
        role: "fixed structural body",
        proceduralSource: "module engine_block()",
        material: { metalness: 0.72, roughness: 0.46 }
      },
      {
        name: "crankshaft",
        role: "rotating shaft converting reciprocating motion",
        proceduralSource: "module crankshaft()",
        material: { metalness: 0.9, roughness: 0.24 }
      },
      {
        name: "piston_1",
        role: "reciprocating gas-force member",
        proceduralSource: "module piston_1()",
        material: { metalness: 0.78, roughness: 0.3 }
      }
    ],
    joints: [
      { name: "block_crank", parent: "engine_block", child: "crankshaft", type: "continuous", axis: [0, 0, 1] },
      { name: "block_piston_1", parent: "engine_block", child: "piston_1", type: "prismatic", axis: [0, 1, 0] }
    ],
    artifacts: {
      urdf: "motion/urdf/robot.urdf",
      glb: "delivery/model.glb",
      sceneSpec: "delivery/scene-spec.json"
    }
  });

  return applyMechanicalGateResults(draft, {
    geometry: true,
    assembly: true,
    kinematics: true,
    materials: true,
    gltf: true
  });
}

test("mechanical path is pinned to structured procedural generation, not image-only output", () => {
  assert.equal(MECHANICAL_STACK.generator.primary, "SpatiaOS/Procedura");
  assert.match(MECHANICAL_STACK.generator.policy, /part-first parametric CAD/);
});

test("a fully gated mechanical artifact is shippable", () => {
  const fixture = validFixture();
  const result = validateMechanicalManifest(fixture);
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.doesNotThrow(() => assertMechanicalManifest(fixture));
  assert.equal(reviewMechanicalReadiness(fixture).ready, true);
});

test("all five NAHLATY interaction modes are mandatory", () => {
  const fixture = validFixture();
  fixture.capabilities.inside = false;
  const result = validateMechanicalManifest(fixture);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("missing required view mode: inside"));
  assert.deepEqual(REQUIRED_VIEW_MODES, ["solid", "transparent", "cutaway", "exploded", "inside"]);
});

test("the path fails closed if even one deterministic gate is missing", () => {
  const fixture = validFixture();
  fixture.validation.kinematics = false;
  const result = validateMechanicalManifest(fixture);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("validation gate not passed: kinematics"));
});

test("anonymous monolithic geometry cannot pass as a semantic mechanical assembly", () => {
  const fixture = validFixture();
  fixture.parts = [fixture.parts[0]];
  const result = validateMechanicalManifest(fixture);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("mechanical assembly needs at least 2 semantic parts"));
});

test("invalid articulation cycles are blocked before runtime", () => {
  const fixture = validFixture();
  fixture.joints.push({
    id: "cycle",
    parent: "piston_1",
    child: "engine_block",
    type: "revolute",
    axis: [1, 0, 0]
  });
  const result = validateMechanicalManifest(fixture);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("directed cycle")));
});
