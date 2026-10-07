import assert from "node:assert/strict";

const base=process.env.NAHLATY_SMOKE_BASE||"http://127.0.0.1:3010";

async function json(url,options){
 const response=await fetch(base+url,options);
 const body=await response.json().catch(()=>null);
 return {response,body};
}

async function text(url){
 const response=await fetch(base+url);
 return {response,body:await response.text()};
}

const root=await text("/");
assert.equal(root.response.status,200);
assert.match(root.body,/نحلتي|My Bee|__next/i);

const living=await text("/living-engine");
assert.equal(living.response.status,200);
assert.match(living.body,/LIVING VISUAL ENGINE|اسأل عن أي شيء|__next/i);

const health=await json("/api/engine");
assert.equal(health.response.status,200);
assert.equal(health.body?.ok,true);
assert.equal(health.body?.engine,"nahlaty");
assert.equal(health.body?.selfTest?.passed,true);

const science=await json("/api/generate-vector?preset=heart&view=cutaway");
assert.equal(science.response.status,200);
assert.equal(science.body?.semantic?.ready,true);
assert.equal(science.body?.semantic?.clinicalValidation,false);
assert.equal(science.body?.semantic?.boundConceptIds.length,13);
assert.deepEqual(science.body?.semantic?.missingConceptIds,[]);
const circuit=["circulation.body","heart.venaCava","heart.rightAtrium","heart.tricuspidValve","heart.rightVentricle","heart.pulmonaryValve","heart.pulmonaryArtery","circulation.lungs","heart.pulmonaryVeins","heart.leftAtrium","heart.mitralValve","heart.leftVentricle","heart.aorticValve","heart.aorta","circulation.body"];
assert.deepEqual(science.body.experience.sceneGraph.edges.map(e=>[e.from,e.to]),circuit.slice(0,-1).map((id,index)=>[id,circuit[index+1]]));
assert.equal(science.body.experience.sceneGraph.edges.find(e=>e.from==="heart.pulmonaryVeins").oxygenation,"oxygenated");
const cutawaySvg=await text("/heart-vector/heart-science.svg");
assert.equal(cutawaySvg.response.status,200);
assert.match(cutawaySvg.body,/id="heart-root"/);
assert.doesNotMatch(cutawaySvg.body,/<image\b|data:image\//i);
const exterior=await json("/api/generate-vector?preset=heart&view=exterior");
assert.equal(exterior.response.status,200);
assert.equal(exterior.body?.semantic?.ready,false);
assert.equal(exterior.body?.metrics?.pathCount,639);

const heart=await json("/api/engine",{
 method:"POST",
 headers:{"content-type":"application/json"},
 body:JSON.stringify({question:"كيف يعمل القلب؟",context:{audience:"عام"}})
});
assert.equal(heart.response.status,200);
assert.equal(heart.body?.ok,true);
assert.equal(heart.body?.provider,"sourced-knowledge");
assert.equal(heart.body?.result?.verification?.status,"source-grounded");
assert.equal(heart.body?.result?.experience?.steps?.length,10);
assert.equal(heart.body.result.experience.sceneGraph.nativeSvg.scienceLock,true);
assert.equal(heart.body.result.experience.sceneGraph.nodes.length,15);
assert.equal(heart.body.result.experience.sceneGraph.edges.length,14);
assert.equal(heart.body.result.experience.renderer,"heart-semantic-svg");
assert.equal(heart.body.result.renderPlan.renderer,heart.body.result.experience.renderer);
assert.ok(heart.body.result.experience.steps.every(step=>!step.image&&!step.thumbnail&&!step.media));
assert.equal(heart.body.result.experience.semantic.clinicalValidation,false);
assert.deepEqual(heart.body.result.experience.sceneGraph.edges.map(edge=>[edge.from,edge.to]),circuit.slice(0,-1).map((id,index)=>[id,circuit[index+1]]));
for(const index of [7,8])assert.equal(heart.body.result.experience.steps[index].visualCoverage,"text-only");

const explainHeart=await json("/api/explain",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({content:"اشرح البطين الأيسر",audience:"عام"})});
assert.equal(explainHeart.response.status,200);
assert.equal(explainHeart.body.sceneGraph.nativeSvg.scienceLock,true);
assert.equal(explainHeart.body.steps.length,10);

for(let i=1;i<=10;i++){
 const n=String(i).padStart(2,"0");
 const stage=await fetch(base+`/heart-cinematic/heart-${n}.webp`);
 const thumb=await fetch(base+`/heart-cinematic/heart-${n}-thumb.webp`);
 assert.equal(stage.status,200,`stage ${n} missing`);
 assert.equal(thumb.status,200,`thumb ${n} missing`);
 assert.match(stage.headers.get("content-type")||"",/image\/webp/);
 assert.match(thumb.headers.get("content-type")||"",/image\/webp/);
}

const valve=await json("/api/engine",{
 method:"POST",
 headers:{"content-type":"application/json"},
 body:JSON.stringify({question:"كيف تعمل الصمامات؟",context:{audience:"عام"}})
});
assert.equal(valve.response.status,200);
assert.equal(valve.body?.result?.scene,3);
assert.equal(valve.body?.result?.experience?.initialStep,3);

const follow=await json("/api/engine",{
 method:"POST",
 headers:{"content-type":"application/json"},
 body:JSON.stringify({
  question:"وليش؟",
  context:{
   audience:"عام",
   scene:3,
   previous:{
    title:valve.body?.result?.experience?.title,
    summary:valve.body?.result?.answer,
    domain:valve.body?.result?.domain,
    topic:valve.body?.result?.topic,
    truthAnchors:valve.body?.result?.experience?.truthAnchors||[],
    causalRelations:(valve.body?.result?.experience?.sceneGraph?.edges||[]).filter(e=>e?.causal).slice(0,8),
    sceneGraph:{nodes:(valve.body?.result?.experience?.sceneGraph?.nodes||[]).slice(0,8).map(n=>({id:n.id,label:n.label}))}
   }
  }
 })
});
assert.equal(follow.response.status,200);
assert.equal(follow.body?.result?.verification?.status,"source-grounded");
assert.equal(follow.body?.result?.scene,3);
assert.equal(follow.body.result.experience.initialStep,3);
assert.equal(follow.body.result.experience.sceneGraph.nativeSvg.scienceLock,true);
assert.equal(follow.body.result.experience.sceneGraph.nodes.length,15);

for(const path of ["/heart-cinematic","/engine-proof","/lab/premium-heart-vector"]){
 const page=await text(path);
 assert.equal(page.response.status,200,path);
 assert.doesNotMatch(page.body,/class="cinematicScene"/);
}

console.log(JSON.stringify({
 ok:true,
 checks:{
  root:root.response.status,
  living:living.response.status,
  health:health.body?.version,
  scienceConcepts:science.body.semantic.boundConceptIds.length,
  scienceFlowEdges:science.body.experience.sceneGraph.edges.length,
  exteriorPaths:exterior.body.metrics.pathCount,
  heartSteps:heart.body?.result?.experience?.steps?.length,
  heartRenderer:heart.body.result.experience.renderer,
  explainHeartSteps:explainHeart.body.steps.length,
  heartAssets:20,
  valveInitialStep:valve.body?.result?.experience?.initialStep,
  followUpScene:follow.body?.result?.scene
 }
}));
