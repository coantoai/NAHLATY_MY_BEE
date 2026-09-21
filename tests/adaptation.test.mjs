import test from "node:test";
import assert from "node:assert/strict";
import { getExperienceProfile } from "../app/lib/experienceProfile.js";
import { deriveLearnerState } from "../app/lib/learnerAdaptation.js";
import { chooseLearningAction } from "../app/lib/learningDirector.js";
import { analyzeMentalModel, deriveRememberedModelRepair } from "../app/lib/mentalModel.js";
import { mergeReframeAvoidance, updateRepresentationHistory } from "../app/lib/representationMemory.js";
import { deriveTransferEdgeIds } from "../app/lib/transferEvidence.js";
import { compileVisualSceneResult, compileVisualStep } from "../app/lib/visualSceneCompiler.js";

test("audience profiles stay meaningfully distinct",()=>{
 const child=getExperienceProfile("طفل");
 const senior=getExperienceProfile("كبير بالعمر");
 const educator=getExperienceProfile("معلّم");
 const expert=getExperienceProfile("متخصص");
 assert.equal(child.id,"child");
 assert.equal(child.auto3d,"manual");
 assert.ok(child.maxNodes<=5);
 assert.equal(senior.id,"senior");
 assert.equal(getExperienceProfile("كبير بالسن").id,"senior");
 assert.equal(getExperienceProfile("كبار السن").id,"senior");
 assert.equal(getExperienceProfile("مسن").id,"senior");
 assert.ok(senior.fontScale>1);
 assert.notEqual(senior.terminology,"simple");
 assert.equal(educator.challengeStyle,"teachback");
 assert.equal(expert.terminology,"precise");
 assert.equal(expert.toolDepth,"full");
});

test("one mistake does not trigger full support mode",()=>{
 const nodes=[{id:"a"},{id:"b"},{id:"c"}];
 const state=deriveLearnerState({
  nodes,
  states:{a:"uncertain",b:"seen",c:"seen"},
  evidence:{a:{uncertain:1}},
  profile:getExperienceProfile("طالب")
 });
 assert.equal(state.mode,"steady");
});

test("repeated confusion triggers support mode",()=>{
 const nodes=[{id:"a"},{id:"b"},{id:"c"}];
 const state=deriveLearnerState({
  nodes,
  states:{a:"uncertain",b:"seen",c:"seen"},
  evidence:{a:{uncertain:2}},
  profile:getExperienceProfile("طالب")
 });
 assert.equal(state.mode,"support");
 assert.equal(state.toolDepth,"minimal");
});

test("successful transfer opens stretch state without changing profile complexity",()=>{
 const profile=getExperienceProfile("طفل");
 const state=deriveLearnerState({
  nodes:[{id:"a"},{id:"b"}],
  states:{a:"transferred",b:"understood"},
  evidence:{a:{transferred:1}},
  profile
 });
 assert.equal(state.mode,"stretch");
 assert.equal(state.toolDepth,profile.toolDepth);
});

test("repeated confusion changes representation before repeating repair",()=>{
 const nodes=[{id:"a",label:"A",analogyLabel:"مثل بوابة"},{id:"b",label:"B"}];
 const action=chooseLearningAction({
  nodes,
  steps:[{focusNodeIds:["a"]}],
  active:0,
  understandingState:{a:"uncertain",b:"seen"},
  evidence:{a:{uncertain:2}},
  currentVisibleIds:["a","b"],
  experience:{...getExperienceProfile("طالب"),learnerMode:"support"},
  hasAnalogy:true,
  hasLayers:true,
  scales:[{id:"s1"},{id:"s2"}],
  perspectives:[{id:"p1"},{id:"p2"}],
  reframeHistory:{}
 });
 assert.equal(action.type,"reframe");
 assert.equal(action.nodeId,"a");
 assert.equal(action.representation,"analogy");
});

test("representation shift avoids repeating the same failed representation",()=>{
 const nodes=[{id:"a",label:"A",analogyLabel:"مثل بوابة",layers:{concrete:{label:"ملموس"}}},{id:"b",label:"B"}];
 const action=chooseLearningAction({
  nodes,
  steps:[{focusNodeIds:["a"]}],
  active:0,
  understandingState:{a:"uncertain",b:"seen"},
  evidence:{a:{uncertain:3}},
  currentVisibleIds:["a","b"],
  experience:{...getExperienceProfile("طالب"),learnerMode:"support"},
  hasAnalogy:true,
  hasLayers:true,
  scales:[{id:"s1"},{id:"s2"}],
  perspectives:[{id:"p1"},{id:"p2"}],
  reframeHistory:{a:["analogy"]}
 });
 assert.equal(action.type,"reframe");
 assert.notEqual(action.representation,"analogy");
});


test("mental model analysis separates correct missing and invented links",()=>{
 const edges=[
  {id:"e1",from:"a",to:"b",relation:"cause",causal:true},
  {id:"e2",from:"b",to:"c",relation:"flow",causal:true},
  {id:"e3",from:"c",to:"d",relation:"contain",causal:false}
 ];
 const attempts=[
  {from:"a",to:"b",ok:true,edgeId:"e1"},
  {from:"a",to:"c",ok:false,edgeId:""}
 ];
 const result=analyzeMentalModel(edges,attempts);
 assert.equal(result.correctIds.has("e1"),true);
 assert.equal(result.missing.some(e=>e.id==="e2"),true);
 assert.equal(result.wrong.length,1);
 assert.equal(result.wrong[0].to,"c");
});

test("mental model falls back to structural edges when no causal core exists",()=>{
 const edges=[{id:"e1",from:"a",to:"b",relation:"connect",causal:false}];
 const result=analyzeMentalModel(edges,[]);
 assert.equal(result.expected.length,1);
 assert.equal(result.expected[0].id,"e1");
});


test("mental model exposes a targeted missing-link repair",()=>{
 const edges=[
  {id:"e1",from:"a",to:"b",relation:"cause",causal:true},
  {id:"e2",from:"b",to:"c",relation:"flow",causal:true}
 ];
 const result=analyzeMentalModel(edges,[{from:"b",to:"c",ok:true,edgeId:"e2"}]);
 assert.equal(result.repair.kind,"missing");
 assert.equal(result.repair.from,"a");
 assert.equal(result.repair.expectedEdgeId,"e1");
});

test("invented mental link takes repair priority and points back to a supported path",()=>{
 const edges=[
  {id:"e1",from:"a",to:"b",relation:"cause",causal:true},
  {id:"e2",from:"b",to:"c",relation:"flow",causal:true}
 ];
 const result=analyzeMentalModel(edges,[{from:"a",to:"c",ok:false,edgeId:""}]);
 assert.equal(result.repair.kind,"invented");
 assert.equal(result.repair.from,"a");
 assert.equal(result.repair.to,"c");
 assert.equal(result.repair.expectedEdgeId,"e1");
});

test("learning director prioritizes repairing the mental model over generic remediation",()=>{
 const nodes=[{id:"a",label:"A"},{id:"b",label:"B"},{id:"c",label:"C"}];
 const action=chooseLearningAction({
  nodes,
  steps:[{focusNodeIds:["a","b"]}],
  active:0,
  understandingState:{a:"seen",b:"uncertain",c:"seen"},
  evidence:{b:{uncertain:3}},
  currentVisibleIds:["a","b","c"],
  experience:{...getExperienceProfile("طالب"),learnerMode:"support"},
  mentalModelRepair:{kind:"invented",from:"a",to:"c",nodeId:"a",expectedEdgeId:"e1",expectedTo:"b"}
 });
 assert.equal(action.type,"model-repair");
 assert.equal(action.from,"a");
 assert.equal(action.expectedEdgeId,"e1");
});


test("one structural uncertainty does not trigger support by itself",()=>{
 const state=deriveLearnerState({
  nodes:[{id:"a"},{id:"b"}],
  edges:[{id:"e1",from:"a",to:"b"}],
  states:{a:"seen",b:"uncertain"},
  evidence:{b:{uncertain:1}},
  relationStates:{e1:"uncertain"},
  relationEvidence:{e1:{uncertain:1}},
  profile:getExperienceProfile("طالب")
 });
 assert.equal(state.mode,"steady");
});

test("repeated uncertainty on the same relationship triggers support",()=>{
 const state=deriveLearnerState({
  nodes:[{id:"a"},{id:"b"}],
  edges:[{id:"e1",from:"a",to:"b"}],
  states:{a:"seen",b:"seen"},
  evidence:{},
  relationStates:{e1:"uncertain"},
  relationEvidence:{e1:{uncertain:2}},
  profile:getExperienceProfile("طالب")
 });
 assert.equal(state.mode,"support");
});

test("repairing a structural relationship moves the learner to consolidate",()=>{
 const state=deriveLearnerState({
  nodes:[{id:"a"},{id:"b"}],
  edges:[{id:"e1",from:"a",to:"b"}],
  states:{a:"seen",b:"seen"},
  relationStates:{e1:"repaired"},
  relationEvidence:{e1:{repaired:1}},
  profile:getExperienceProfile("طالب")
 });
 assert.equal(state.mode,"consolidate");
});

test("restored relation uncertainty recreates the exact repair target",()=>{
 const repair=deriveRememberedModelRepair(
  [{id:"e1",from:"a",to:"b",relation:"cause"}],
  {e1:"uncertain"}
 );
 assert.equal(repair.kind,"missing");
 assert.equal(repair.from,"a");
 assert.equal(repair.to,"b");
 assert.equal(repair.expectedEdgeId,"e1");
 assert.equal(repair.source,"memory");
});


test("repaired relationship is verified before generic consolidation",()=>{
 const nodes=[{id:"a",label:"A"},{id:"b",label:"B"}];
 const edges=[{id:"e1",from:"a",to:"b",relation:"cause",causal:true}];
 const action=chooseLearningAction({
  nodes,
  edges,
  steps:[{focusNodeIds:["a","b"]},{focusNodeIds:["b"]}],
  active:1,
  understandingState:{a:"seen",b:"repaired"},
  evidence:{b:{repaired:1}},
  relationStates:{e1:"repaired"},
  currentVisibleIds:["a","b"],
  experience:{...getExperienceProfile("طالب"),learnerMode:"consolidate"}
 });
 assert.equal(action.type,"verify-repair");
 assert.equal(action.edgeId,"e1");
 assert.equal(action.from,"a");
 assert.equal(action.to,"b");
});

test("verified repaired relationship no longer asks for the same verification",()=>{
 const action=chooseLearningAction({
  nodes:[{id:"a",label:"A"},{id:"b",label:"B"}],
  edges:[{id:"e1",from:"a",to:"b",relation:"cause",causal:true}],
  steps:[{focusNodeIds:["a","b"]},{focusNodeIds:["b"]}],
  active:1,
  understandingState:{a:"understood",b:"understood"},
  evidence:{b:{repaired:1,understood:1}},
  relationStates:{e1:"understood"},
  currentVisibleIds:["a","b"],
  experience:{...getExperienceProfile("طالب"),learnerMode:"consolidate"}
 });
 assert.notEqual(action.type,"verify-repair");
});

test("open mental-model repair still takes priority over repair verification",()=>{
 const action=chooseLearningAction({
  nodes:[{id:"a",label:"A"},{id:"b",label:"B"}],
  edges:[{id:"e1",from:"a",to:"b",relation:"cause",causal:true}],
  steps:[{focusNodeIds:["a","b"]}],
  active:0,
  understandingState:{a:"seen",b:"repaired"},
  relationStates:{e1:"repaired"},
  currentVisibleIds:["a","b"],
  experience:{...getExperienceProfile("طالب"),learnerMode:"consolidate"},
  mentalModelRepair:{kind:"missing",from:"a",to:"b",nodeId:"a",expectedEdgeId:"e1",expectedTo:"b"}
 });
 assert.equal(action.type,"model-repair");
});


test("representation outcome memory persists failed reframes without hiding successful ones",()=>{
 let history={};
 history=updateRepresentationHistory(history,"a","analogy","needs_work");
 history=updateRepresentationHistory(history,"a","scale","strong");
 const merged=mergeReframeAvoidance({},history);
 assert.deepEqual(merged.a,["analogy"]);
 assert.equal(history.a.analogy.difficulties,1);
 assert.equal(history.a.scale.successes,1);
});

test("learning director avoids a representation that failed in an earlier session",()=>{
 const nodes=[{id:"a",label:"A",analogyLabel:"مثل بوابة",layers:{concrete:{label:"ملموس"}}},{id:"b",label:"B"}];
 const remembered=mergeReframeAvoidance({},{
  a:{analogy:{attempts:1,successes:0,difficulties:1,lastOutcome:"needs_work"}}
 });
 const action=chooseLearningAction({
  nodes,
  steps:[{focusNodeIds:["a"]}],
  active:0,
  understandingState:{a:"uncertain",b:"seen"},
  evidence:{a:{uncertain:2}},
  currentVisibleIds:["a","b"],
  experience:{...getExperienceProfile("طالب"),learnerMode:"support"},
  hasAnalogy:true,
  hasLayers:true,
  scales:[{id:"s1"},{id:"s2"}],
  perspectives:[{id:"p1"},{id:"p2"}],
  reframeHistory:remembered
 });
 assert.equal(action.type,"reframe");
 assert.notEqual(action.representation,"analogy");
});

test("a representation that previously worked remains eligible after later regression",()=>{
 const remembered=mergeReframeAvoidance({},{
  a:{analogy:{attempts:1,successes:1,difficulties:0,lastOutcome:"strong"}}
 });
 assert.deepEqual(remembered.a,[]);
});


test("after all suitable reframes fail the director switches to active model reconstruction",()=>{
 const nodes=[
  {id:"a",label:"A",analogyLabel:"مثل بوابة",layers:{concrete:{label:"ملموس"}}},
  {id:"b",label:"B"}
 ];
 const action=chooseLearningAction({
  nodes,
  edges:[{id:"e1",from:"a",to:"b",relation:"cause",causal:true}],
  steps:[{focusNodeIds:["a","b"]}],
  active:0,
  understandingState:{a:"uncertain",b:"seen"},
  evidence:{a:{uncertain:3}},
  currentVisibleIds:["a","b"],
  experience:{...getExperienceProfile("طالب"),learnerMode:"support"},
  hasAnalogy:true,
  hasLayers:true,
  scales:[{id:"s1"},{id:"s2"}],
  perspectives:[{id:"p1"},{id:"p2"}],
  reframeHistory:{a:["analogy","scale","perspective","concrete"]}
 });
 assert.equal(action.type,"model-check");
 assert.equal(action.from,"a");
});

test("model reconstruction fallback can anchor from an inbound relation",()=>{
 const action=chooseLearningAction({
  nodes:[{id:"a",label:"A"},{id:"b",label:"B"}],
  edges:[{id:"e1",from:"a",to:"b",relation:"cause",causal:true}],
  steps:[{focusNodeIds:["b"]}],
  active:0,
  understandingState:{a:"seen",b:"uncertain"},
  evidence:{b:{uncertain:2}},
  currentVisibleIds:["a","b"],
  experience:{...getExperienceProfile("طالب"),learnerMode:"support"},
  reframeHistory:{}
 });
 assert.equal(action.type,"model-check");
 assert.equal(action.from,"a");
});


test("transfer evidence keeps only valid structural relations named by the transfer task",()=>{
 const edges=[
  {id:"e1",from:"a",to:"b",relation:"cause",causal:true},
  {id:"e2",from:"b",to:"c",relation:"flow",causal:true}
 ];
 assert.deepEqual(deriveTransferEdgeIds(edges,["e2","ghost"],"b"),["e2"]);
});

test("transfer evidence falls back to a causal relation touching the answer role",()=>{
 const edges=[
  {id:"e1",from:"a",to:"b",relation:"cause",causal:true},
  {id:"e2",from:"c",to:"d",relation:"connect",causal:false}
 ];
 assert.deepEqual(deriveTransferEdgeIds(edges,[],"b"),["e1"]);
});


test("visual scene compiler infers semantic motion without inventing new nodes",()=>{
 const result={
  sceneGraph:{world:{dimension:"hybrid"},nodes:[
   {id:"heart",visual:"heart",spatial:true,inside:[{id:"chamber"}]},
   {id:"blood",visual:"blood"}
  ],edges:[{id:"e1",from:"heart",to:"blood",relation:"flow"}]},
  steps:[{motion:"travel",focusNodeIds:["heart","blood"],activeEdgeIds:["e1"],visibleNodeIds:["heart","blood"],camera:{mode:"follow",distance:60}}]
 };
 const compiled=compileVisualSceneResult(result);
 assert.equal(compiled.runtimeVersion,"visual-scene/v1");
 assert.deepEqual(compiled.steps[0].runtime.activeEdgeIds,["e1"]);
 assert.equal(compiled.steps[0].runtime.camera.mode,"follow");
 assert.equal(compiled.steps[0].runtime.nodeActions.find(x=>x.id==="heart")?.action,"flow");
});

test("visual scene compiler downgrades meaningless depth camera to focus",()=>{
 const result={sceneGraph:{world:{dimension:"hybrid"},nodes:[{id:"a",visual:"document"}],edges:[]}};
 const runtime=compileVisualStep(result,{focusNodeIds:["a"],visibleNodeIds:["a"],camera:{mode:"inside",targetNodeId:"a"}},0,[]);
 assert.equal(runtime.camera.mode,"focus");
 assert.equal(runtime.dimension,"2d");
 assert.ok(runtime.corrections.includes("depth-without-spatial-meaning"));
});

test("visual scene compiler keeps prior reveals visible across steps",()=>{
 const result={
  sceneGraph:{world:{dimension:"2d"},nodes:[{id:"a",visual:"document"},{id:"b",visual:"gear"}],edges:[{id:"e1",from:"a",to:"b",relation:"transform"}]},
  steps:[
   {focusNodeIds:["a"],visibleNodeIds:["a"]},
   {focusNodeIds:["b"],visibleNodeIds:["b"],activeEdgeIds:["e1"],motion:"connect"}
  ]
 };
 const compiled=compileVisualSceneResult(result);
 assert.deepEqual(compiled.steps[1].runtime.visibleNodeIds,["a","b"]);
});

test("visual scene compiler uses semantic actions for focused objects",()=>{
 const result={sceneGraph:{world:{dimension:"2d"},nodes:[{id:"gear",visual:"gear"},{id:"plant",visual:"plant"}],edges:[]}};
 const gear=compileVisualStep(result,{focusNodeIds:["gear"],visibleNodeIds:["gear"],motion:"reveal"},0,[]);
 const plant=compileVisualStep(result,{focusNodeIds:["plant"],visibleNodeIds:["plant"],motion:"reveal"},0,[]);
 assert.equal(gear.nodeActions[0].action,"spin");
 assert.equal(plant.nodeActions[0].action,"grow");
});
