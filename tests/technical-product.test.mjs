import test from "node:test";
import assert from "node:assert/strict";
import { ENGINE_DEMO, SCIENCE_GATES, TRAINING_MODES } from "../app/lib/technicalProductData.js";

test("technical product exposes the three required modes", () => {
  assert.deepEqual(TRAINING_MODES.map((mode) => mode.id), ["understand", "troubleshoot", "train"]);
});

test("engine demo has a complete normal flow", () => {
  assert.ok(ENGINE_DEMO.overview.flow.length >= 5);
  assert.equal(ENGINE_DEMO.overview.flow[0], "Radiator lower return");
  assert.equal(ENGINE_DEMO.overview.flow.at(-1), "Radiator");
});

test("troubleshooting does not jump straight from symptom to diagnosis", () => {
  assert.ok(ENGINE_DEMO.fault.symptom.length > 0);
  assert.ok(ENGINE_DEMO.fault.steps.length >= 4);
  for (const step of ENGINE_DEMO.fault.steps) {
    assert.ok(step.check);
    assert.ok(step.why);
    assert.ok(step.outcome);
    assert.ok(["fact", "inference", "unknown"].includes(step.knowledge));
  }
});

test("science gates explicitly forbid invented hidden geometry", () => {
  assert.ok(SCIENCE_GATES.some((gate) => gate.includes("هندسة داخلية مخفية")));
});

test("all overview components declare evidence class", () => {
  for (const component of ENGINE_DEMO.overview.components) {
    assert.ok(["fact", "inference", "unknown"].includes(component.status));
  }
});
