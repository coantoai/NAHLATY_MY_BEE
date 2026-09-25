import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

async function importSource(relativePath){
 const url=new URL(relativePath,import.meta.url);
 const source=readFileSync(url,"utf8");
 const data="data:text/javascript;base64,"+Buffer.from(source).toString("base64");
 return import(data);
}

const {localHeartResult}=await importSource("../lib/nahlaty-engine.js");

test("heart product journey is exactly ten visual steps with a valid initial card",()=>{
 const r=localHeartResult("كيف تعمل الصمامات؟");
 assert.equal(r.domain,"heart");
 assert.equal(r.scene,3);
 assert.ok(r.experience);
 assert.equal(r.experience.steps.length,10);
 assert.equal(r.experience.initialStep,3);
 assert.equal(r.experience.steps[3].title,"الصمامات");
 assert.match(r.experience.steps[3].image,/heart-04\.webp$/);
 assert.match(r.experience.steps[3].thumbnail,/heart-04-thumb\.webp$/);
 assert.equal(r.verification.status,"source-grounded");
 assert.ok(r.verification.sources.length>=2);
});

test("product page contract keeps homepage ask, engine gateway, living ask, context and source links",()=>{
 const page=readFileSync(new URL("../app/page.js",import.meta.url),"utf8");
 const css=readFileSync(new URL("../app/globals.css",import.meta.url),"utf8");
 assert.match(page,/homeAskLive/);
 assert.match(page,/fetch\("\/api\/engine"/);
 assert.match(page,/livingAskBar/);
 assert.match(page,/scene:active/);
 assert.match(page,/verification\?\.status==="source-grounded"/);
 assert.match(page,/truthAnchors:engineResult\.experience\?\.truthAnchors|truthAnchors:r\?\.truthAnchors/);
 assert.match(page,/sceneGraph:\{nodes:/);
 assert.match(page,/r\.sources\.slice/);
 assert.match(page,/journeyActive/);
 assert.match(css,/\.journeyActive \.exactHomeFrame\{display:none\}/);
 assert.match(css,/scroll-snap-type:x mandatory/);
});

test("engine gateway supports long-form content in addition to questions",()=>{
 const route=readFileSync(new URL("../app/api/engine/route.js",import.meta.url),"utf8");
 assert.match(route,/const content=String\(body\?\.content/);
 assert.match(route,/sourceKind=content&&!question\?"content":"question"/);
 assert.match(route,/CONTENT_TOO_LONG/);
 assert.match(route,/input-derived/);
});
