import test from "node:test";
import assert from "node:assert/strict";
import { compileVisualSceneResult, compileVisualStep } from "../app/lib/visualSceneCompiler.js";

function baseResult(overrides={}){
  return {
    sceneGraph:{
      world:{dimension:"hybrid"},
      nodes:[
        {id:"a",visual:"gear",knowledge:"fact"},
        {id:"b",visual:"water",knowledge:"fact",spatial:true,depthParts:[{id:"b-inner",label:"inner"}]},
        {id:"c",visual:"document",knowledge:"unknown"}
      ],
      edges:[
        {id:"e1",from:"a",to:"b",relation:"flow",causal:true,knowledge:"fact",label:"A to B"},
        {id:"e2",from:"a",to:"c",relation:"connect",causal:false,knowledge:"inference"}
      ]
    },
    steps:[],
    ...overrides
  };
}

test("runtime guard filters unknown node, edge, and explicit-action ids",()=>{
  const result=baseResult();
  const runtime=compileVisualStep(result,{
    focusNodeIds:["ghost","a"],
    visibleNodeIds:["ghost","a"],
    activeEdgeIds:["ghost-edge","e1"],
    nodeActions:[
      {id:"ghost",action:"ignite"},
      {id:"a",action:"not-an-action"}
    ]
  });
  assert.deepEqual(runtime.focusNodeIds,["a"]);
  assert.deepEqual(runtime.activeEdgeIds,["e1"]);
  assert.equal(runtime.visibleNodeIds.includes("ghost"),false);
  assert.equal(runtime.nodeActions.some(x=>x.id==="ghost"),false);
  assert.equal(runtime.nodeActions.some(x=>x.action==="not-an-action"),false);
});

test("runtime guard refuses depth camera for a non-spatial target",()=>{
  const result=baseResult();
  const runtime=compileVisualStep(result,{
    focusNodeIds:["a"],
    visibleNodeIds:["a"],
    camera:{mode:"inside",targetNodeId:"a",distance:60}
  });
  assert.equal(runtime.camera.mode,"focus");
  assert.ok(runtime.corrections.includes("depth-without-spatial-meaning"));
});

test("runtime guard permits depth camera for a spatial target and selects 3d in hybrid world",()=>{
  const result=baseResult();
  const runtime=compileVisualStep(result,{
    focusNodeIds:["b"],
    visibleNodeIds:["b"],
    camera:{mode:"inside",targetNodeId:"b",distance:60}
  });
  assert.equal(runtime.camera.mode,"inside");
  assert.equal(runtime.dimension,"3d");
  assert.equal(runtime.intent.spatial,true);
});

test("runtime guard downgrades follow camera when there is no valid edge",()=>{
  const result=baseResult({sceneGraph:{world:{dimension:"hybrid"},nodes:[{id:"a",visual:"gear"}],edges:[]}});
  const runtime=compileVisualStep(result,{
    focusNodeIds:["a"],
    visibleNodeIds:["a"],
    camera:{mode:"follow",distance:60}
  });
  assert.equal(runtime.camera.mode,"focus");
  assert.ok(runtime.corrections.includes("follow-without-edge"));
});

test("runtime guard clamps unsafe camera distances",()=>{
  const result=baseResult();
  const tooNear=compileVisualStep(result,{focusNodeIds:["a"],camera:{mode:"focus",distance:1}});
  const tooFar=compileVisualStep(result,{focusNodeIds:["a"],camera:{mode:"focus",distance:999}});
  assert.equal(tooNear.camera.distance,35);
  assert.equal(tooFar.camera.distance,150);
});

test("runtime guard preserves already revealed nodes across steps",()=>{
  const result=baseResult({
    steps:[
      {focusNodeIds:["a"],visibleNodeIds:["a"]},
      {focusNodeIds:["b"],visibleNodeIds:["b"],activeEdgeIds:["e1"],motion:"travel"}
    ]
  });
  const compiled=compileVisualSceneResult(result);
  assert.equal(compiled.runtimeVersion,"visual-scene/v1");
  assert.deepEqual(compiled.steps[1].runtime.visibleNodeIds,["a","b"]);
  assert.deepEqual(compiled.steps[1].runtime.transition.contextNodeIds,["a"]);
});

test("runtime guard gives a flow source semantic motion without inventing nodes",()=>{
  const result=baseResult();
  const runtime=compileVisualStep(result,{
    focusNodeIds:["a","b"],
    activeEdgeIds:["e1"],
    visibleNodeIds:["a","b"],
    motion:"travel"
  });
  assert.equal(runtime.nodeActions.find(x=>x.id==="a")?.action,"spin");
  assert.equal(runtime.nodeActions.find(x=>x.id==="b")?.action,"flow");
  assert.equal(runtime.nodeActions.every(x=>["a","b","c"].includes(x.id)),true);
});

test("runtime guard prefers the causal factual relation when deriving an edge",()=>{
  const result=baseResult();
  const runtime=compileVisualStep(result,{
    focusNodeIds:["a","b","c"],
    visibleNodeIds:["a","b","c"],
    motion:"connect"
  });
  assert.deepEqual(runtime.activeEdgeIds,["e1"]);
  assert.equal(runtime.causalCue?.edgeId,"e1");
  assert.equal(runtime.causalCue?.causal,true);
});

test("runtime guard preserves fact/inference/unknown accounting",()=>{
  const result=baseResult();
  const runtime=compileVisualStep(result,{
    focusNodeIds:["a","c"],
    visibleNodeIds:["a","c"],
    activeEdgeIds:["e2"]
  });
  assert.equal(runtime.knowledgeSummary.fact,1);
  assert.equal(runtime.knowledgeSummary.inference,1);
  assert.equal(runtime.knowledgeSummary.unknown,1);
});

test("runtime guard reports visual overload instead of silently accepting it",()=>{
  const nodes=Array.from({length:5},(_,i)=>({id:`n${i}`,visual:"document"}));
  const result={sceneGraph:{world:{dimension:"2d"},nodes,edges:[]},steps:[]};
  const runtime=compileVisualStep(result,{
    focusNodeIds:nodes.map(n=>n.id),
    visibleNodeIds:nodes.map(n=>n.id)
  });
  assert.equal(runtime.quality.overloaded,true);
  assert.ok(runtime.corrections.includes("visual-overload"));
});

test("runtime guard remains deterministic for identical inputs",()=>{
  const result=baseResult();
  const step={focusNodeIds:["a","b"],activeEdgeIds:["e1"],visibleNodeIds:["a","b"],motion:"travel",camera:{mode:"follow",distance:64}};
  assert.deepEqual(
    compileVisualStep(result,step,0,[]),
    compileVisualStep(result,step,0,[])
  );
});
