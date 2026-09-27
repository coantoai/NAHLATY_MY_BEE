import test from "node:test";
import assert from "node:assert/strict";
import {flightDurationMs,flightFrame} from "../lib/pollination-flight-v2.js";

test("one deterministic automatic cycle visits the same scene in order",()=>{
 const at=p=>flightFrame(p*flightDurationMs);
 assert.equal(at(.04).stage,0);
 assert.equal(at(.25).stage,1);
 assert.equal(at(.45).stage,2);
 assert.equal(at(.65).stage,3);
 assert.equal(at(.81).stage,4);
 assert.equal(at(.25).carrying,true);
 assert.equal(at(.45).carrying,true);
 assert.equal(at(.65).transfer,true);
 assert.equal(at(.65).carrying,false);
 assert.equal(at(.81).transfer,true);
 assert.equal(at(.99).carrying,false);
 assert.equal(at(1.04).stage,0);
});
test("bee moves smoothly on an explicit authored curve rather than teleporting",()=>{
 const a=flightFrame(.41*flightDurationMs);
 const b=flightFrame(.4101*flightDurationMs);
 assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1.0);
 assert.ok(a.x>260 && a.x<745);
 assert.ok(Number.isFinite(a.heading));
 assert.ok(a.y>0&&a.y<600);
});
test("blocked counterfactual still has bee carry pollen but prevents transfer",()=>{
 const allowed=flightFrame(.64*flightDurationMs,false);
 const blocked=flightFrame(.64*flightDurationMs,true);
 assert.equal(blocked.x,allowed.x);
 assert.equal(blocked.y,allowed.y);
 assert.equal(blocked.transfer,false);
 assert.equal(blocked.carrying,true);
 assert.equal(allowed.transfer,true);
});
test("photo method can calibrate same flight against a distinct pair of anchors",()=>{
 const anchors={first:{x:310,y:280},second:{x:820,y:320}};
 const arrival=flightFrame(.62*flightDurationMs,false,anchors);
 assert.ok(Math.abs(arrival.x-820)<3);
 assert.ok(Math.abs(arrival.y-320)<3);
});
test("timestamps, positions and heading remain finite",()=>{
 for(let i=0;i<=200;i++){
  const v=flightFrame(i*flightDurationMs/200);
  assert.ok(Number.isFinite(v.x)&&Number.isFinite(v.y)&&Number.isFinite(v.heading));
 }
});
