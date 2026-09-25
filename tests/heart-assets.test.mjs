import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";

test("heart cinematic journey uses ten permanent optimized stage and thumbnail assets",()=>{
 for(let i=1;i<=10;i++){
  const n=String(i).padStart(2,"0");
  const stage=new URL("../public/heart-cinematic/heart-"+n+".webp",import.meta.url);
  const thumb=new URL("../public/heart-cinematic/heart-"+n+"-thumb.webp",import.meta.url);
  const png=new URL("../public/heart-cinematic/heart-"+n+".png",import.meta.url);
  assert.equal(existsSync(stage),true,"missing "+stage.pathname);
  assert.equal(existsSync(thumb),true,"missing "+thumb.pathname);
  assert.equal(existsSync(png),false,"heavy PNG should not remain in public");
  const stageSize=statSync(stage).size;
  const thumbSize=statSync(thumb).size;
  assert.ok(stageSize>20_000&&stageSize<500_000,"unexpected stage size "+stageSize);
  assert.ok(thumbSize>3_000&&thumbSize<100_000,"unexpected thumb size "+thumbSize);
 }
});

test("heart runtime has no dependency on expiring signed image URLs",()=>{
 const engine=readFileSync(new URL("../lib/nahlaty-engine.js",import.meta.url),"utf8");
 const page=readFileSync(new URL("../app/page.js",import.meta.url),"utf8");
 const legacy=readFileSync(new URL("../app/heart-cinematic/page.js",import.meta.url),"utf8");
 assert.match(engine,/heart-\$\{String\(i\+1\).*\.webp/);
 assert.match(page,/CinematicMeaningScene/);
 assert.match(page,/s\.thumbnail\|\|s\.image/);
 assert.doesNotMatch(legacy,/cloudfront\.net/);
 assert.doesNotMatch(legacy,/_jwt=/);
});
