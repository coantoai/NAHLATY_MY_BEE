import test from "node:test";
import assert from "node:assert/strict";
import { buildRecraftVectorRequest, normalizeRecraftVectorRequest, validateProviderSvg } from "../app/lib/recraftVector.js";

test("defaults to one low-cost native vector generation",()=>{
 const req=buildRecraftVectorRequest({prompt:"premium scientific heart"});
 assert.equal(req.url,"https://external.api.recraft.ai/v1/images/generations/vector");
 assert.equal(req.body.model,"recraftv4_1_vector");
 assert.equal(req.body.n,1);
 assert.equal(req.body.response_format,"url");
});

test("uses styles pro vector when reference images are supplied",()=>{
 const body=normalizeRecraftVectorRequest({
  prompt:"premium heart",
  styleReferenceUrls:["https://example.com/reference.png"]
 });
 assert.equal(body.model,"recraftv4_styles_pro_vector");
 assert.equal(body.style_match,"precise");
 assert.deepEqual(body.style_reference_urls,["https://example.com/reference.png"]);
});

test("rejects mixed style id and inline references",()=>{
 assert.throws(()=>normalizeRecraftVectorRequest({
  prompt:"heart",
  styleId:"style-1",
  styleReferenceUrls:["https://example.com/ref.png"]
 }),/not both/);
});

test("rejects active or externally linked SVG content",()=>{
 const scripted='<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><path/><path/><path/><path/></svg>';
 assert.throws(()=>validateProviderSvg(scripted),/Unsafe/);
 const external='<svg xmlns="http://www.w3.org/2000/svg"><image href="https://example.com/a.png"/><path/><path/><path/><path/></svg>';
 assert.throws(()=>validateProviderSvg(external),/Unsafe/);
});

test("accepts a real path-based SVG shell and reports geometry",()=>{
 const svg='<svg xmlns="http://www.w3.org/2000/svg"><g><path d="M0 0"/><path d="M1 1"/><path d="M2 2"/><path d="M3 3"/></g></svg>';
 const result=validateProviderSvg(svg);
 assert.equal(result.pathCount,4);
 assert.equal(result.groupCount,1);
 assert.ok(result.bytes>0);
});
