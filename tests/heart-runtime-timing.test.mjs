import test from "node:test";
import assert from "node:assert/strict";

test("native heart timing clamps BPM and preserves a common cycle phase on tempo changes",async()=>{
 const {heartBeatPeriod,syncHeartAnimations}=await import("../app/lib/heartRuntimeTiming.js");
 assert.equal(heartBeatPeriod(40),1.5);
 assert.equal(heartBeatPeriod(180),1/3);
 assert.equal(heartBeatPeriod(0),1);
 assert.equal(heartBeatPeriod(300),1/3);
 assert.equal(heartBeatPeriod(20),1.5);
 const motions=[0,1,2].map(()=>({currentTime:750,playState:"running",effect:{target:{closest:()=>true}},pause(){this.playState="paused"},play(){this.playState="running"}}));
 const host={getAnimations:()=>motions};
 syncHeartAnimations(host,1.5,1/3,false);
 for(const motion of motions){assert.ok(Math.abs(motion.currentTime-1000/6)<1e-8);assert.equal(motion.playState,"paused")}
 syncHeartAnimations(host,1/3,1/3,true);
 for(const motion of motions)assert.equal(motion.playState,"running");
});
