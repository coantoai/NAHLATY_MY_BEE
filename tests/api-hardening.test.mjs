import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

async function importSource(relativePath){
 const url=new URL(relativePath,import.meta.url);
 const source=readFileSync(url,"utf8");
 const data="data:text/javascript;base64,"+Buffer.from(source).toString("base64");
 return import(data);
}

const {internalRequestHeaders,requestLimit,rateLimitInfo}=await importSource("../app/lib/requestGuard.js");

function req(id,extra={}){
 return new Request("http://nahlaty.local/api/test",{
  headers:{
   "x-forwarded-for":"203.0.113."+id,
   "user-agent":"nahlaty-test-"+id,
   ...extra
  }
 });
}

test("request guard allows requests inside the window and then returns 429",async()=>{
 const r=req("41");
 assert.equal(requestLimit(r,{scope:"test-limit-41",limit:2,windowMs:60000}),null);
 assert.equal(requestLimit(r,{scope:"test-limit-41",limit:2,windowMs:60000}),null);
 const blocked=requestLimit(r,{scope:"test-limit-41",limit:2,windowMs:60000});
 assert.equal(blocked.status,429);
 assert.ok(Number(blocked.headers.get("retry-after"))>=1);
 const body=await blocked.json();
 assert.equal(body.code,"RATE_LIMITED");
});

test("internal engine calls bypass request guard",()=>{
 const internal=req("42",internalRequestHeaders());
 for(let i=0;i<5;i++)assert.equal(requestLimit(internal,{scope:"test-internal",limit:1,windowMs:60000}),null);
});

test("request protection reports that preview guard is not durable",()=>{
 assert.deepEqual(rateLimitInfo(),{mode:"best-effort-instance-local",durable:false});
});

test("API hardening contract hides provider details and marks internal explain call",()=>{
 const engine=readFileSync(new URL("../app/api/engine/route.js",import.meta.url),"utf8");
 const explain=readFileSync(new URL("../app/api/explain/route.js",import.meta.url),"utf8");
 const analyze=readFileSync(new URL("../app/api/analyze-input/route.js",import.meta.url),"utf8");
 assert.match(engine,/internalRequestHeaders\(\)/);
 assert.match(engine,/requestLimit\(request,\{scope:"engine"/);
 assert.match(explain,/requestLimit\(req,\{scope:"explain"/);
 assert.match(analyze,/requestLimit\(req,\{scope:"analyze-input"/);
 assert.doesNotMatch(explain,/Response\.json\(\{error:"تعذر إنشاء الشرح",detail/);
 assert.doesNotMatch(analyze,/Response\.json\(\{error:"تعذر قراءة الملف",detail/);
 assert.match(explain,/EXPLAIN_FAILED/);
 assert.match(analyze,/ANALYZE_INPUT_FAILED/);
});

test("all interactive AI routes are rate guarded and redact provider errors",()=>{
 const routes=[
  ["ask-scene","ASK_SCENE_FAILED"],
  ["check-invariance","CHECK_INVARIANCE_FAILED"],
  ["check-understanding","CHECK_UNDERSTANDING_FAILED"],
  ["remap-analogy","REMAP_ANALOGY_FAILED"],
  ["transfer-test","TRANSFER_TEST_FAILED"]
 ];
 for(const [name,code] of routes){
  const source=readFileSync(new URL("../app/api/"+name+"/route.js",import.meta.url),"utf8");
  assert.match(source,/requestLimit\(req,\{scope:/,name+" missing request guard");
  assert.match(source,new RegExp(code),name+" missing public error code");
  assert.doesNotMatch(source,/Response\.json\(\{error:[^}]*detail:/,name+" leaks provider detail");
  assert.match(source,/console\.error\(/,name+" missing server diagnostic log");
 }
});

test("all active AI routes use the Qwen client without Gemini imports",()=>{
 const names=["analyze-input","ask-scene","check-invariance","check-understanding","remap-analogy","transfer-test","explain"];
 for(const name of names){
  const code=readFileSync(new URL("../app/api/"+name+"/route.js",import.meta.url),"utf8");
  assert.doesNotMatch(code,/createGemini|GEMINI_API_KEY|@google\\/genai/);
  assert.match(code,/DASHSCOPE_API_KEY/);
 }
 const packageJson=readFileSync(new URL("../package.json",import.meta.url),"utf8");
 assert.doesNotMatch(packageJson,/@google\\/genai/);
});

test("pilot security headers are configured without blocking same-origin media input",()=>{
 const config=readFileSync(new URL("../next.config.mjs",import.meta.url),"utf8");
 assert.match(config,/X-Content-Type-Options/);
 assert.match(config,/nosniff/);
 assert.match(config,/Referrer-Policy/);
 assert.match(config,/X-Frame-Options/);
 assert.match(config,/SAMEORIGIN/);
 assert.match(config,/microphone=\(self\)/);
 assert.match(config,/camera=\(self\)/);
 assert.match(config,/geolocation=\(\)/);
});
