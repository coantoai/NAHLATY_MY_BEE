import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

async function importSource(relativePath){
  const url=new URL(relativePath,import.meta.url);
  const source=readFileSync(url,"utf8");
  const data="data:text/javascript;base64,"+Buffer.from(source).toString("base64");
  return import(data);
}

const {
  contextualHeartResult,
  localHeartResult,
  sanitizeEngineResult
}=await importSource("../lib/nahlaty-engine.js");

const { compileVisualPlan }=await importSource("../lib/visual-director.js");
const { curatedKnowledgeResult, listCuratedKnowledgePacks }=await importSource("../lib/knowledge-packs.js");

test("valve question maps to curated valve scene",()=>{
  const r=localHeartResult("كيف تمنع صمامات القلب رجوع الدم؟");
  assert.equal(r.topic,"valves");
  assert.equal(r.scene,3);
  assert.equal(r.verification.status,"source-grounded");
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
  assert.equal(out.verification.status,"source-grounded");
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

test("visual director compiles semantic operations into executable motion",()=>{
  const engine=localHeartResult("كيف تمنع صمامات القلب رجوع الدم؟");
  const plan=compileVisualPlan(engine);
  assert.equal(plan.renderer,"heart-semantic-svg");
  assert.equal(plan.sceneId,"heart:valves");
  assert.ok(plan.motion.some(step=>step.type==="flow"));
  assert.equal(plan.guardrails.animateMeaning,true);
});

test("priority knowledge packs are sourced and routable",()=>{
  const cases=[
    ["كيف تنمو النباتات؟","plant-growth"],
    ["كيف تعمل الخلية الشمسية؟","solar-cell"],
    ["كيف يلقح النحل الأزهار؟","bee-pollination"],
    ["كيف يعمل محرك الاحتراق الداخلي؟","combustion-engine"]
  ];
  for(const [q,id] of cases){
    const r=curatedKnowledgeResult(q);
    assert.equal(r.topic,id);
    assert.equal(r.verification.status,"source-grounded");
    assert.ok(r.verification.sources.length>=1);
    assert.ok(r.experience.sceneGraph.nodes.length>=4);
  }
  assert.equal(listCuratedKnowledgePacks().length,4);
});
