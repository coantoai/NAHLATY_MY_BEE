import test from "node:test";
import assert from "node:assert/strict";
import * as heart from "../app/lib/heartSemanticVector.js";
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

test("heart SceneSpec includes body and lungs without expanding required anatomy IDs",()=>{
 assert.equal(HEART_SCENE_SPEC.sceneId,"heart.core-flow");
 assert.equal(HEART_REQUIRED_CONCEPT_IDS.length,13);
 assert.equal(HEART_SCENE_SPEC.concepts.length,HEART_REQUIRED_CONCEPT_IDS.length+2);
 assert.equal(new Set(HEART_SCENE_SPEC.concepts.map(x=>x.conceptId)).size,HEART_REQUIRED_CONCEPT_IDS.length+2);
 for(const id of HEART_REQUIRED_CONCEPT_IDS){
  assert.ok(HEART_SCENE_SPEC.concepts.some(x=>x.conceptId===id),id);
 }
 const lungs=HEART_SCENE_SPEC.concepts.find(x=>x.conceptId==="circulation.lungs");
 assert.equal(lungs?.assetRequired,false);
 const body=HEART_SCENE_SPEC.concepts.find(x=>x.conceptId==="circulation.body");
 assert.equal(body?.assetRequired,false);
 assert.equal(body?.kind,"externalContext");
});

test("blood flow closes the body-to-lungs-to-body circuit through all four valves",()=>{
 assert.deepEqual(HEART_FLOW_PATH,[
  "circulation.body","heart.venaCava","heart.rightAtrium","heart.tricuspidValve","heart.rightVentricle",
  "heart.pulmonaryValve","heart.pulmonaryArtery","circulation.lungs","heart.pulmonaryVeins","heart.leftAtrium",
  "heart.mitralValve","heart.leftVentricle","heart.aorticValve","heart.aorta","circulation.body"
 ]);
 assert.equal(HEART_SCENE_SPEC.relations.length,HEART_FLOW_PATH.length-1);
 assert.ok(HEART_SCENE_SPEC.relations.every(x=>x.direction==="forward"));
 const pairs=HEART_SCENE_SPEC.relations.map(({from,to})=>[from,to]);
 assert.deepEqual(pairs,HEART_FLOW_PATH.slice(0,-1).map((from,i)=>[from,HEART_FLOW_PATH[i+1]]));
 assert.equal(new Set(HEART_SCENE_SPEC.relations.map(x=>x.id)).size,pairs.length);
});

// Reversing pulmonary oxygenation or assigning it by artery/vein name breaks
// this behavior: pulmonary arteries are oxygen-poor, pulmonary veins oxygen-rich.
test("pulmonary oxygenation changes at the lungs and systemic oxygenation at body tissues",()=>{
 const relation=(from,to)=>HEART_SCENE_SPEC.relations.find(x=>x.from===from&&x.to===to);
 for(const [from,to] of [["circulation.body","heart.venaCava"],["heart.pulmonaryArtery","circulation.lungs"]]){
  assert.equal(relation(from,to)?.oxygenation,"deoxygenated");
 }
 for(const [from,to] of [["circulation.lungs","heart.pulmonaryVeins"],["heart.pulmonaryVeins","heart.leftAtrium"],["heart.aorta","circulation.body"]]){
  assert.equal(relation(from,to)?.oxygenation,"oxygenated");
 }
 for(const edge of HEART_SCENE_SPEC.relations){
  assert.equal(edge.knowledge,"fact");
  assert.equal(edge.colorKnowledge,"inference");
  assert.equal(edge.bloodColor,edge.oxygenation==="oxygenated"?"red":"blue");
 }
});

test("the anatomy contract distinguishes four chambers and four valves",()=>{
 const concepts=HEART_SCENE_SPEC.concepts;
 assert.deepEqual(concepts.filter(x=>x.kind==="chamber").map(x=>x.conceptId).sort(),[
  "heart.leftAtrium","heart.leftVentricle","heart.rightAtrium","heart.rightVentricle"
 ]);
 assert.deepEqual(concepts.filter(x=>x.kind==="valve").map(x=>x.conceptId).sort(),[
  "heart.aorticValve","heart.mitralValve","heart.pulmonaryValve","heart.tricuspidValve"
 ]);
 assert.ok(concepts.filter(x=>x.assetRequired).every(x=>x.knowledge==="fact"));
});

test("canonical cutaway bindings retain stable concept IDs with distinct geometry",()=>{
 assert.ok(Array.isArray(heart.HEART_ANATOMY_BINDINGS));
 assert.deepEqual(heart.HEART_ANATOMY_BINDINGS.map(x=>[x.conceptId,x.elementId]),[
  ["heart.venaCava","vena-cava"],["heart.rightAtrium","right-atrium"],
  ["heart.tricuspidValve","tricuspid-valve"],["heart.rightVentricle","right-ventricle"],
  ["heart.pulmonaryValve","pulmonary-valve"],["heart.pulmonaryArtery","pulmonary-artery"],
  ["heart.pulmonaryVeins","pulmonary-veins"],["heart.leftAtrium","left-atrium"],
  ["heart.mitralValve","mitral-valve"],["heart.leftVentricle","left-ventricle"],
  ["heart.aorticValve","aortic-valve"],["heart.aorta","aorta"],["heart.myocardium","myocardium"]
 ]);
 const manifest={sceneId:"heart.core-flow",bindings:heart.HEART_ANATOMY_BINDINGS,sourceLicense:[{provider:"original-authored",license:"repository-license"}]};
 assert.equal(validateHeartSemanticManifest(manifest).ok,true);
 const svg='<svg>'+manifest.bindings.map(x=>'<g id="'+x.elementId+'"><path d="M0 0"/></g>').join("")+'</svg>';
 assert.match(bindHeartSemanticIds(svg,manifest),/id="pulmonary-veins" data-concept-id="heart\.pulmonaryVeins"/);
});

test("superior and inferior vena cava remain separate subparts of the existing concept",()=>{
 assert.deepEqual(heart.HEART_VENA_CAVA_SUBPARTS,[
  {parentConceptId:"heart.venaCava",elementId:"superior-vena-cava",label:{ar:"الوريد الأجوف العلوي",en:"Superior vena cava"},knowledge:"fact"},
  {parentConceptId:"heart.venaCava",elementId:"inferior-vena-cava",label:{ar:"الوريد الأجوف السفلي",en:"Inferior vena cava"},knowledge:"fact"}
 ]);
 assert.equal(HEART_REQUIRED_CONCEPT_IDS.includes("heart.superiorVenaCava"),false);
});

test("science lock separates established physiology from visual conventions and unknowns",()=>{
 assert.ok(heart.HEART_SCIENCE_LOCK);
 assert.equal(heart.HEART_SCIENCE_LOCK.version,"heart-science-lock/v1");
 const claims=heart.HEART_SCIENCE_LOCK.claims;
 const claim=id=>claims.find(x=>x.id===id);
 assert.equal(claim("normal-directed-flow")?.knowledge,"fact");
 assert.equal(claim("pulmonary-oxygenation")?.knowledge,"fact");
 assert.equal(claim("red-blue-convention")?.knowledge,"inference");
 assert.equal(claim("illustrative-geometry")?.knowledge,"inference");
 assert.equal(claim("illustrative-timing")?.knowledge,"inference");
 assert.equal(claim("individual-stroke-volume")?.knowledge,"unknown");
 const sv=HEART_SCENE_SPEC.parameters.find(x=>x.id==="heart.strokeVolume");
 assert.equal(sv.fixed,70);
 assert.equal(sv.knowledge,"inference");
 assert.equal(sv.educationalAssumption,true);
 const co=HEART_SCENE_SPEC.parameters.find(x=>x.id==="heart.cardiacOutput");
 assert.equal(co.formulaKnowledge,"fact");
 assert.equal(co.knowledge,"inference");
 assert.ok(HEART_SCENE_SPEC.timeline.every(x=>x.knowledge==="inference"));
});

test("scientific claims identify the precise official source text that supports them",()=>{
 const claim=id=>heart.HEART_SCIENCE_LOCK.claims.find(x=>x.id===id);
 for(const id of ["four-chambers-four-valves","normal-directed-flow","pulmonary-oxygenation","vessel-direction","vena-cava-return","ventricular-separation","paired-ventricular-pumping","left-ventricular-wall"]){
  assert.equal(claim(id)?.evidenceStatus,"source-supported",id);
  assert.ok(claim(id).sourceIds.length>0,id);
 }
 assert.deepEqual(claim("four-chambers-four-valves").sourceIds,["nhlbi-anatomy","nhlbi-blood-flow"]);
 assert.deepEqual(claim("vena-cava-return").sourceIds,["nhlbi-blood-flow"]);
 assert.deepEqual(claim("paired-ventricular-pumping").sourceIds,["nhlbi-heart-beats"]);
 assert.deepEqual(claim("left-ventricular-wall").sourceIds,["openstax-heart-anatomy","nhlbi-blood-flow"]);
 const co=HEART_SCENE_SPEC.parameters.find(x=>x.id==="heart.cardiacOutput");
 assert.deepEqual(co.formulaSourceIds,["openstax-cardiac-physiology"]);
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

test("semantic binding rejects unknown concepts, duplicate elements and conflicting annotations",()=>{
 const manifest=completeManifest();
 const svg='<svg>'+manifest.bindings.map(x=>'<path id="'+x.elementId+'" d="M0 0"/>').join("")+'</svg>';
 assert.throws(()=>bindHeartSemanticIds(svg.replace('id="part-0"','id="part-0" data-concept-id="heart.aorta"'),manifest),/conflict/i);
 assert.throws(()=>bindHeartSemanticIds(svg.replace('</svg>','<path id="part-0"/></svg>'),manifest),/unique|duplicate/i);
 assert.equal(validateHeartSemanticManifest({...manifest,bindings:[...manifest.bindings,{conceptId:'bad" onclick="alert(1)',elementId:"bad"}]}).ok,false);
 const dotted={...manifest,bindings:manifest.bindings.map((x,i)=>({...x,elementId:'part.'+i}))};
 assert.throws(()=>bindHeartSemanticIds(svg,dotted),/not found/i);
});


test("heart scene has permanent visual references and authoritative scientific sources",()=>{
 assert.ok(HEART_REFERENCE_ASSETS.length>=2);
 assert.ok(HEART_REFERENCE_ASSETS.every(x=>x.path.startsWith("/heart-cinematic/heart-")));
 assert.ok(HEART_REFERENCE_ASSETS.every(x=>x.publicUrl.startsWith("https://raw.githubusercontent.com/")));
 assert.ok(HEART_SCIENTIFIC_SOURCES.length>=2);
 assert.ok(HEART_SCIENTIFIC_SOURCES.every(x=>x.url.startsWith("https://www.nhlbi.nih.gov/")||/^https:\/\/github\.com\/openstax\/osbooks-anatomy-physiology\/blob\/[a-f0-9]{40}\/modules\/m\d+\/index\.cnxml$/.test(x.url)));
 assert.deepEqual(HEART_SCENE_SPEC.scientificSources,HEART_SCIENTIFIC_SOURCES);
});
