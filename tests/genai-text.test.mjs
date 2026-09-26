import test from "node:test";
import assert from "node:assert/strict";
import { generateJson, generateText } from "../app/lib/genai.js";

async function withMockFetch(responses,fn){
 const original=globalThis.fetch;
 let calls=0;
 globalThis.fetch=async (_url,options)=>{
  calls++;
  const item=responses[Math.min(calls-1,responses.length-1)];
  if(item instanceof Error)throw item;
  return {ok:item.status===200,status:item.status,json:async()=>item.body};
 };
 try{await fn(()=>calls);}finally{globalThis.fetch=original;}
}
const ok=text=>({status:200,body:{choices:[{message:{content:text}}]}});
const error=status=>({status,body:{error:{message:"provider error"}}});
const ai={apiKey:"test-key"};

test("Qwen text helper retries transient provider errors",async()=>{
 await withMockFetch([error(503),error(503),ok("ok")],async calls=>{
  assert.equal(await generateText(ai,"hello",{maxAttempts:3,retryBaseMs:0}),"ok");
  assert.equal(calls(),3);
 });
});
test("Qwen text helper does not retry permanent errors",async()=>{
 await withMockFetch([error(400)],async calls=>{
  await assert.rejects(()=>generateText(ai,"hello",{maxAttempts:3,retryBaseMs:0}));
  assert.equal(calls(),1);
 });
});
test("Qwen JSON helper repairs trailing comma without retry",async()=>{
 await withMockFetch([ok('{"title":"bad",}')],async calls=>{
  const value=await generateJson(ai,"return json",{maxAttempts:3,retryBaseMs:0});
  assert.equal(value.title,"bad");
  assert.equal(calls(),1);
 });
});
test("Qwen JSON helper retries malformed JSON",async()=>{
 await withMockFetch([ok('{"title":"bad", broken}'),ok('{"title":"ok"}')],async calls=>{
  const value=await generateJson(ai,"return json",{maxAttempts:3,retryBaseMs:0});
  assert.equal(value.title,"ok");
  assert.equal(calls(),2);
 });
});
