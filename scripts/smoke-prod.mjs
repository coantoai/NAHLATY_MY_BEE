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

const health=await json("/api/engine");
assert.equal(health.response.status,200);
assert.equal(health.body?.ok,true);
assert.equal(health.body?.engine,"nahlaty");
assert.equal(health.body?.selfTest?.passed,true);

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

console.log(JSON.stringify({
 ok:true,
 checks:{
  root:root.response.status,
  health:health.body?.version,
  heartSteps:heart.body?.result?.experience?.steps?.length,
  heartAssets:20,
  valveInitialStep:valve.body?.result?.experience?.initialStep,
  followUpScene:follow.body?.result?.scene
 }
}));
