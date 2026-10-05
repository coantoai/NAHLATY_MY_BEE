import test from "node:test";
import assert from "node:assert/strict";
import {buildVisualBrainPrompt,compileSafeFallback,sanitizeVisualPlan,validateVisualPlan} from "../app/lib/visualBrain.js";

const scene={
 nodes:[
  {id:"heart.leftVentricle",label:"البطين الأيسر",spatial:true},
  {id:"heart.aorta",label:"الأبهر",spatial:false}
 ],
 edges:[{id:"flow.lv-aorta",from:"heart.leftVentricle",to:"heart.aorta",relation:"flow"}],
 layers:[{id:"internal",label:"الداخل"}],
 parameters:[{id:"heartRate",label:"BPM",min:40,max:180,value:60}]
};

test("accepts grounded runtime actions",()=>{
 const r=validateVisualPlan({actions:[
  {type:"focus",targetIds:["heart.leftVentricle"]},
  {type:"flow",edgeIds:["flow.lv-aorta"]},
  {type:"zoom",scale:1.8}
 ]},scene);
 assert.equal(r.ok,true);
});

test("fails closed on invented scene targets",()=>{
 const r=validateVisualPlan({actions:[{type:"focus",targetIds:["heart.fakeValve"]}]},scene);
 assert.equal(r.ok,false);
 assert.equal(r.code,"UNKNOWN_NODE");
});

test("rejects arbitrary actions and unsafe camera bounds",()=>{
 assert.equal(validateVisualPlan({actions:[{type:"executeCode",targetIds:["heart.leftVentricle"]}]},scene).code,"ACTION_NOT_ALLOWED");
 assert.equal(validateVisualPlan({actions:[{type:"zoom",scale:99}]},scene).code,"ZOOM_OUT_OF_RANGE");
});

test("flow must use a real edge",()=>{
 const r=validateVisualPlan({actions:[{type:"flow",edgeIds:["invented"]}]},scene);
 assert.equal(r.ok,false);
 assert.equal(r.code,"UNKNOWN_EDGE");
});

test("layer and parameter actions are schema bounded",()=>{
 assert.equal(validateVisualPlan({actions:[{type:"setLayer",layerId:"internal",visible:true}]},scene).ok,true);
 assert.equal(validateVisualPlan({actions:[{type:"setParameter",parameterId:"heartRate",value:120}]},scene).ok,true);
 assert.equal(validateVisualPlan({actions:[{type:"setLayer",layerId:"fake",visible:true}]},scene).ok,false);
});

test("fallback only addresses existing concepts",()=>{
 const p=compileSafeFallback({question:"ورجيني البطين الأيسر",sceneGraph:scene});
 const checked=sanitizeVisualPlan(p,scene);
 assert.equal(checked.ok,true);
 assert.deepEqual(checked.plan.actions[0].targetIds,["heart.leftVentricle"]);
});

test("prompt exposes only scene-grounded planning contract",()=>{
 const p=buildVisualBrainPrompt({question:"كيف يخرج الدم؟",sceneGraph:scene,currentState:{selectedNodeId:"heart.leftVentricle"}});
 assert.match(p,/NAHLATY Visual Brain/);
 assert.match(p,/heart\.leftVentricle/);
 assert.match(p,/Never invent a node/);
 assert.match(p,/needsStrongerModel/);
});
