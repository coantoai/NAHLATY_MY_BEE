import test from "node:test";
import assert from "node:assert/strict";
import {initialVisualStep,resolveVisualOutcome,sceneCaption,visualGenerationNeeded} from "../app/lib/visualOutcome.js";

test("scene caption stays short enough to fit inside the visual stage",()=>{
 assert.equal(sceneCaption({text:"  تنتقل الطاقة عبر الخلية الشمسية.  "}),"تنتقل الطاقة عبر الخلية الشمسية.");
 assert.ok(sceneCaption({text:"شرح بصري طويل ".repeat(12)}).length<=53);
});

test("a focused follow-up opens the relevant visual stage, not the overview",()=>{
 assert.equal(initialVisualStep({initialStep:3,steps:Array.from({length:10},(_,i)=>({title:String(i)}))}),3);
 assert.equal(initialVisualStep({initialStep:99,steps:[{title:"single"}]}),0);
});

test("sourced knowledge can complete the visual journey without a paid image request",()=>{
 assert.equal(visualGenerationNeeded("sourced-knowledge"),false);
 assert.equal(visualGenerationNeeded("qwen-explain-engine"),true);
});

test("initial image failure retains the new explanatory graph as a usable turn",()=>{
 const graph={title:"القلب",sceneGraph:{nodes:[{id:"heart"}],edges:[]},steps:[{title:"النبض"}]};
 const outcome=resolveVisualOutcome({previousResult:null,previousImage:"",nextResult:graph,generatedImage:"",imageFailed:true});
 assert.equal(outcome.shownResult,graph);
 assert.equal(outcome.shownImage,"");
 assert.equal(outcome.status,"complete");
 assert.match(outcome.notice,/مشهد/);
});

test("failed follow-up keeps the previously verified world visible",()=>{
 const old={title:"القلب"},newResult={title:"الرئتان"};
 const outcome=resolveVisualOutcome({previousResult:old,previousImage:"data:image/png;base64,abc",nextResult:newResult,generatedImage:"",imageFailed:true});
 assert.equal(outcome.shownResult,old);
 assert.equal(outcome.shownImage,"data:image/png;base64,abc");
 assert.equal(outcome.status,"visual-failed");
});

test("verified generation shows the new result and image",()=>{
 const newResult={title:"القلب"};
 const outcome=resolveVisualOutcome({previousResult:null,previousImage:"",nextResult:newResult,generatedImage:"data:image/png;base64,xyz",imageFailed:false});
 assert.equal(outcome.shownResult,newResult);
 assert.equal(outcome.shownImage,"data:image/png;base64,xyz");
 assert.equal(outcome.status,"complete");
 assert.equal(outcome.notice,"");
});
