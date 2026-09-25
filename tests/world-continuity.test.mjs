import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

async function importSource(relativePath){
 const url=new URL(relativePath,import.meta.url);
 const source=readFileSync(url,"utf8");
 const data="data:text/javascript;base64,"+Buffer.from(source).toString("base64");
 return import(data);
}

const {reconcilePreservedWorld}=await importSource("../lib/world-continuity.js");

test("follow-up world preserves node identity and rewrites every dependent reference",()=>{
 const result={
  truthAnchors:["new model anchor"],
  sceneGraph:{
   nodes:[{id:"new-heart",label:"القلب"},{id:"lungs",label:"الرئتان"}],
   edges:[{id:"e1",from:"new-heart",to:"lungs",label:"إلى"}],
   scales:[{id:"s1",visibleNodeIds:["new-heart","lungs"],focusNodeIds:["new-heart"]}],
   perspectives:[{id:"p1",focusNodeIds:["new-heart"],backgroundNodeIds:["lungs"]}]
  },
  steps:[{
   focusNodeIds:["new-heart"],visibleNodeIds:["new-heart","lungs"],
   nodeActions:[{id:"new-heart",action:"pulse"}],
   camera:{mode:"focus",targetNodeId:"new-heart"},
   prediction:{choiceNodeIds:["new-heart","lungs"],answerNodeId:"new-heart"}
  }],
  physics:{controlNodeIds:["new-heart"],rules:[{id:"r1",from:"new-heart",to:"lungs"}]},
  simulation:{affectedNodeIds:["new-heart"]},
  misconception:{nodeIds:["new-heart"]},
  challenge:{choiceNodeIds:["new-heart","lungs"],answerNodeId:"new-heart"}
 };
 const preserve={
  truthAnchors:["القلب يدفع الدم."],
  sceneGraph:{nodes:[{id:"heart",label:"القلب"},{id:"lungs",label:"الرئتان"}]}
 };
 const out=reconcilePreservedWorld(result,preserve);
 assert.equal(out.sceneGraph.nodes[0].id,"heart");
 assert.equal(out.sceneGraph.edges[0].from,"heart");
 assert.equal(out.steps[0].focusNodeIds[0],"heart");
 assert.equal(out.steps[0].nodeActions[0].id,"heart");
 assert.equal(out.steps[0].camera.targetNodeId,"heart");
 assert.equal(out.steps[0].prediction.answerNodeId,"heart");
 assert.equal(out.physics.controlNodeIds[0],"heart");
 assert.equal(out.physics.rules[0].from,"heart");
 assert.equal(out.simulation.affectedNodeIds[0],"heart");
 assert.equal(out.misconception.nodeIds[0],"heart");
 assert.equal(out.challenge.answerNodeId,"heart");
 assert.deepEqual(out.truthAnchors,["القلب يدفع الدم."]);
 assert.equal(out.continuity.worldPreserved,true);
 assert.equal(out.continuity.preservedNodeIds,2);
});

test("world reconciler does not invent continuity without prior world",()=>{
 const input={sceneGraph:{nodes:[{id:"a",label:"A"}],edges:[]},steps:[],truthAnchors:["x"]};
 assert.equal(reconcilePreservedWorld(input,null),input);
});
