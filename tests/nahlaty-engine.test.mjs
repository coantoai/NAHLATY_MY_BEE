import test from "node:test";
import assert from "node:assert/strict";
import {
  contextualHeartResult,
  localHeartResult,
  sanitizeEngineResult
} from "../lib/nahlaty-engine.js";

test("valve question maps to curated valve scene",()=>{
  const r=localHeartResult("كيف تمنع صمامات القلب رجوع الدم؟");
  assert.equal(r.topic,"valves");
  assert.equal(r.scene,3);
  assert.equal(r.verification.status,"curated");
});

test("blood circulation question maps to flow scene",()=>{
  const r=localHeartResult("ما هي رحلة الدم في الجسم؟");
  assert.equal(r.topic,"circulation");
  assert.equal(r.scene,4);
  assert.ok(r.visualPlan.operations.includes("FLOW"));
});

test("unknown domain is not falsely matched to heart",()=>{
  assert.equal(localHeartResult("كيف يعمل محرك السيارة؟"),null);
});

test("contextual short follow-up preserves current heart scene",()=>{
  const r=contextualHeartResult("وليش؟",{scene:3});
  assert.equal(r.topic,"valves");
  assert.equal(r.scene,3);
});

test("curated facts override model prose when verification is curated",()=>{
  const local=localHeartResult("كيف تعمل الصمامات؟");
  const out=sanitizeEngineResult({
    answer:"نص نموذج مختلف",
    explanation:"شرح نموذج مختلف",
    confidence:"high",
    visualPlan:{operations:["FOCUS","FLOW"],focus:["valve"],target:"valve",camera:"macro"}
  },local);
  assert.equal(out.answer,local.answer);
  assert.equal(out.explanation,local.explanation);
  assert.equal(out.verification.status,"curated");
  assert.equal(out.needsVerification,false);
});

test("open-domain model output remains unverified and has no forced heart scene",()=>{
  const out=sanitizeEngineResult({
    domain:"engine",
    topic:"combustion",
    answer:"answer",
    explanation:"explanation",
    confidence:"medium",
    visualPlan:{operations:["CUTAWAY","SEQUENCE"],focus:["piston"],target:"cycle",camera:"cutaway"}
  },null);
  assert.equal(out.scene,null);
  assert.equal(out.needsVerification,true);
  assert.equal(out.verification.status,"model-only");
});
