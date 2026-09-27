import test from "node:test";
import assert from "node:assert/strict";
import { acceptVisualVerdict } from "../app/lib/visualTruthGate.js";

test("rejects a text-heavy infographic even when the model says it passed",()=>{
 const result=acceptVisualVerdict({pass:true,changeFulfilled:true,containsReadableText:true,hasInfographicLayout:true});
 assert.equal(result.pass,false);
 assert.equal(result.reason,"visible-typography");
});

test("fails closed when the image review omits typography judgement",()=>{
 const result=acceptVisualVerdict({pass:true,changeFulfilled:true});
 assert.equal(result.pass,false);
 assert.equal(result.reason,"typography-unverified");
});

test("rejects a panel layout even if its lettering is unreadable",()=>{
 const result=acceptVisualVerdict({pass:true,changeFulfilled:true,containsReadableText:false,hasInfographicLayout:true});
 assert.equal(result.pass,false);
 assert.equal(result.reason,"infographic-layout");
});

test("accepts a reviewed image without lettering when other checks pass",()=>{
 const result=acceptVisualVerdict({pass:true,changeFulfilled:true,containsReadableText:false,hasInfographicLayout:false});
 assert.equal(result.pass,true);
});
