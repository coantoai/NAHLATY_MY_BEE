import test from "node:test";
import assert from "node:assert/strict";
import {
 HEART_FLOW_PATH,
 HEART_REFERENCE_ASSETS,
 HEART_REQUIRED_CONCEPT_IDS,
 HEART_SCENE_SPEC,
 HEART_SCIENTIFIC_SOURCES,
 bindHeartSemanticIds,
 cardiacOutputLitersPerMinute,
 validateHeartSemanticManifest
} from "../app/lib/heartSemanticVector.js";

test("heart SceneSpec contains the full benchmark anatomy plus lung context",()=>{
 assert.equal(HEART_SCENE_SPEC.sceneId,"heart.core-flow");
 assert.equal(HEART_SCENE_SPEC.concepts.length,HEART_REQUIRED_CONCEPT_IDS.length+1);
 assert.equal(new Set(HEART_SCENE_SPEC.concepts.map(x=>x.conceptId)).size,HEART_REQUIRED_CONCEPT_IDS.length+1);
 for(const id of HEART_REQUIRED_CONCEPT_IDS){
  assert.ok(HEART_SCENE_SPEC.concepts.some(x=>x.conceptId===id),id);
 }
 const lungs=HEART_SCENE_SPEC.concepts.find(x=>x.conceptId==="circulation.lungs");
 assert.equal(lungs?.assetRequired,false);
});

test("blood flow order is one-way and passes through the lungs",()=>{
 assert.deepEqual(HEART_FLOW_PATH,[
  "heart.venaCava","heart.rightAtrium","heart.tricuspidValve","heart.rightVentricle",
  "heart.pulmonaryValve","heart.pulmonaryArtery","circulation.lungs","heart.pulmonaryVeins","heart.leftAtrium",
  "heart.mitralValve","heart.leftVentricle","heart.aorticValve","heart.aorta"
 ]);
 assert.equal(HEART_SCENE_SPEC.relations.length,HEART_FLOW_PATH.length-1);
 assert.ok(HEART_SCENE_SPEC.relations.every(x=>x.direction==="forward"));
});

test("educational cardiac output endpoints stay deterministic",()=>{
 assert.equal(cardiacOutputLitersPerMinute(60),4.2);
 assert.equal(cardiacOutputLitersPerMinute(120),8.4);
});

function completeManifest(){
 return {
  sceneId:"heart.core-flow",
  bindings:HEART_REQUIRED_CONCEPT_IDS.map((conceptId,index)=>({conceptId,elementId:"part-"+index})),
  sourceLicense:[{provider:"recraft",commercialRights:true}]
 };
}

test("publication manifest fails closed when concepts or provenance are missing",()=>{
 const bad=validateHeartSemanticManifest({sceneId:"heart.core-flow",bindings:[]});
 assert.equal(bad.ok,false);
 assert.ok(bad.errors.some(x=>x.includes("missing conceptId")));
 assert.ok(bad.errors.some(x=>x.includes("sourceLicense")));
});

test("semantic binding decorates reviewed SVG elements for runtime access",()=>{
 const manifest=completeManifest();
 const svg='<svg>'+manifest.bindings.map(x=>'<path id="'+x.elementId+'" d="M0 0"/>').join("")+'</svg>';
 const bound=bindHeartSemanticIds(svg,manifest);
 assert.match(bound,/data-concept-id="heart\.leftVentricle"/);
 assert.match(bound,/tabindex="0"/);
 assert.match(bound,/role="button"/);
});


test("heart scene has permanent visual references and authoritative scientific sources",()=>{
 assert.ok(HEART_REFERENCE_ASSETS.length>=2);
 assert.ok(HEART_REFERENCE_ASSETS.every(x=>x.path.startsWith("/heart-cinematic/heart-")));
 assert.ok(HEART_REFERENCE_ASSETS.every(x=>x.publicUrl.startsWith("https://raw.githubusercontent.com/")));
 assert.ok(HEART_SCIENTIFIC_SOURCES.length>=2);
 assert.ok(HEART_SCIENTIFIC_SOURCES.every(x=>x.url.startsWith("https://www.nhlbi.nih.gov/")));
 assert.deepEqual(HEART_SCENE_SPEC.scientificSources,HEART_SCIENTIFIC_SOURCES);
});
