import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

async function importSource(relativePath){
 const url=new URL(relativePath,import.meta.url);
 const source=readFileSync(url,"utf8");
 const data="data:text/javascript;base64,"+Buffer.from(source).toString("base64");
 return import(data);
}

const {requestLimit,rateLimitInfo}=await importSource("../app/lib/requestGuard.js");

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
 const internal=req("42",{"x-nahlaty-internal":"1"});
 for(let i=0;i<5;i++)assert.equal(requestLimit(internal,{scope:"test-internal",limit:1,windowMs:60000}),null);
});

test("request protection reports that preview guard is not durable",()=>{
 assert.deepEqual(rateLimitInfo(),{mode:"best-effort-instance-local",durable:false});
});

test("API hardening contract hides provider details and marks internal explain call",()=>{
 const engine=readFileSync(new URL("../app/api/engine/route.js",import.meta.url),"utf8");
 const explain=readFileSync(new URL("../app/api/explain/route.js",import.meta.url),"utf8");
 const analyze=readFileSync(new URL("../app/api/analyze-input/route.js",import.meta.url),"utf8");
 assert.match(engine,/x-nahlaty-internal/);
 assert.match(engine,/requestLimit\(request,\{scope:"engine"/);
 assert.match(explain,/requestLimit\(req,\{scope:"explain"/);
 assert.match(analyze,/requestLimit\(req,\{scope:"analyze-input"/);
 assert.doesNotMatch(explain,/Response\.json\(\{error:"تعذر إنشاء الشرح",detail/);
 assert.doesNotMatch(analyze,/Response\.json\(\{error:"تعذر قراءة الملف",detail/);
 assert.match(explain,/EXPLAIN_FAILED/);
 assert.match(analyze,/ANALYZE_INPUT_FAILED/);
});
