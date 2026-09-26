import test from "node:test";
import assert from "node:assert/strict";
import { generateJson, generateText } from "../app/lib/genai.js";

test("Gemini text helper retries transient errors before succeeding",async()=>{
 let calls=0;
 const ai={models:{generateContent:async()=>{
  calls+=1;
  if(calls<3){const e=new Error("503 capacity");e.status=503;throw e;}
  return {text:"ok"};
 }}};
 const text=await generateText(ai,"hello",{maxAttempts:3,retryBaseMs:0});
 assert.equal(text,"ok");
 assert.equal(calls,3);
});

test("Gemini text helper does not retry permanent errors",async()=>{
 let calls=0;
 const ai={models:{generateContent:async()=>{
  calls+=1;
  const e=new Error("400 invalid");e.status=400;throw e;
 }}};
 await assert.rejects(()=>generateText(ai,"hello",{maxAttempts:3,retryBaseMs:0}));
 assert.equal(calls,1);
});


test("Gemini JSON helper retries malformed JSON before succeeding",async()=>{
 let calls=0;
 const ai={models:{generateContent:async()=>{
  calls+=1;
  if(calls===1)return {text:'{"title":"bad",}'};
  return {text:'{"title":"ok","value":2}'};
 }}};
 const value=await generateJson(ai,"return json",{maxAttempts:3,retryBaseMs:0});
 assert.equal(value.title,"bad");
 assert.equal(calls,1);
});

test("Gemini JSON helper retries unrecoverable malformed JSON",async()=>{
 let calls=0;
 const ai={models:{generateContent:async()=>{
  calls+=1;
  if(calls===1)return {text:'{"title":"bad", broken}'};
  return {text:'{"title":"ok"}'};
 }}};
 const value=await generateJson(ai,"return json",{maxAttempts:3,retryBaseMs:0});
 assert.equal(value.title,"ok");
 assert.equal(calls,2);
});
