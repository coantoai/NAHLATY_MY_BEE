import test from "node:test";
import assert from "node:assert/strict";
import {parseModelJson,normalizeAnswerPlan,acceptanceOfReview,buildAnswerFirst} from "../app/lib/answerFirst.js";
import {buildImagePrompt} from "../app/lib/imagePrompt.js";
const question="لماذا يصعد الدخان والرماد من فوهة البركان؟";
const volcano={
 questionIntent:"تفسير صعود الغازات والرماد من الفوهة أثناء ثوران البركان.",
 answer:"عندما تندفع الصهارة نحو السطح ينخفض الضغط، فتتمدد الغازات وتدفع الرماد والجسيمات إلى أعلى في عمود الثوران، وقد يتأثر مساره برياح الجو.",
 claims:[{claim:"تمدد الغازات يدفع المواد البركانية صعوداً",certainty:"model-reviewed"}],
 causalSteps:[
  {fact:"تندفع الصهارة",mode:"visible",visual:"lava within volcano"},
  {fact:"تتمدد الغازات",mode:"overlay",visual:"separate rising gas pressure overlay"}
 ],
 scene:{subject:"erupting volcano",setting:"mountain with visible crater",objects:["lava","ash plume","volcanic cone"],avoid:["cumulus formation explanation","agricultural landscape"]},
 visualBrief:"A detailed volcanic mountain with an active summit crater, glowing lava and a tall natural column of ash rising above the vent.",
 uncertainties:[]
};
test("scientific answer is accepted before image",()=>{
 const p=normalizeAnswerPlan(volcano,question);
 assert.match(p.answer,/الغازات/);
 assert.equal(p.causalSteps[1].mode,"overlay");
 assert.match(buildImagePrompt(p),/erupting volcano/);
});
test("volcano stays a volcano; no hardwired cloud landscape",()=>{
 const p=buildImagePrompt(normalizeAnswerPlan(volcano,question));
 assert.doesNotMatch(p,/sunlight warms the ground|amber streamlines|cauliflower-shaped cumulus/i);
 assert.match(p,/ash plume/);
 assert.match(p,/separate layers/);
});
test("cloud scene comes ONLY from its own approved answer",()=>{
 const plan={...volcano,scene:{subject:"coastal cumulus clouds",setting:"coast with seawater and land",objects:["sea surface","sky","cumulus clouds"],avoid:["volcanic ash"]},visualBrief:"A coastal sea and nearby land beneath a growing cumulus cloud, with a continuous natural horizon and distinct cloud base."};
 const text=buildImagePrompt(normalizeAnswerPlan(plan,"كيف تتشكل الغيوم فوق الساحل؟"));
 assert.match(text,/coast with seawater and land/);
 assert.doesNotMatch(text,/sunlight warms the ground|amber streamlines|erupting volcano/i);
});
test("missing answer, subject or overlay semantics fail closed",()=>{
 assert.throws(()=>normalizeAnswerPlan({...volcano,answer:"غيم"},question),/INCOMPLETE_ANSWER/);
 assert.throws(()=>normalizeAnswerPlan({...volcano,causalSteps:[{fact:"أشياء تتحرك",mode:"overlay",visual:""},{fact:"أخرى",mode:"visible",visual:"ash"}]},question),/OVERLAY_UNDEFINED/);
 assert.throws(()=>normalizeAnswerPlan({...volcano,scene:{subject:"",setting:"x",objects:["y"]}},question),/INCOMPLETE_PLAN/);
});
test("review rejects topic drift and mismatched UI stages",()=>{
 const ok={answersQuestion:true,topicAligned:true,scientificallyCoherent:true,agreesWithUpstream:true,stagesMatch:true,criticalErrors:[]};
 assert.equal(acceptanceOfReview({...ok,topicAligned:false}).reason,"ANSWER_FIRST_TOPIC_DRIFT");
 assert.equal(acceptanceOfReview({...ok,stagesMatch:false},{hasStages:true}).reason,"ANSWER_FIRST_STAGE_CONFLICT");
 assert.equal(acceptanceOfReview({...ok,agreesWithUpstream:false},{hasUpstream:true}).reason,"ANSWER_FIRST_UPSTREAM_CONFLICT");
 assert.equal(acceptanceOfReview(ok,{hasUpstream:true,hasStages:true}).pass,true);
});
test("Qwen fenced JSON output parses",()=>{
 const fence=String.fromCharCode(96).repeat(3);
 assert.deepEqual(parseModelJson(fence+"json\n"+JSON.stringify({ok:true})+"\n"+fence),{ok:true});
});
test("text-only gate takes exactly two model calls; no image call",async()=>{
 const prior=globalThis.fetch,calls=[];
 try{
  globalThis.fetch=async(url,options)=>{
   calls.push({url,body:JSON.parse(options.body)});
   const value=calls.length===1?volcano:{answersQuestion:true,topicAligned:true,scientificallyCoherent:true,agreesWithUpstream:true,stagesMatch:true,criticalErrors:[]};
   return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(value)}}],usage:{total_tokens:13}})};
  };
  const out=await buildAnswerFirst({question,apiKey:"test-key",endpoint:"https://example.invalid/chat",model:"mock",stages:[{title:"الرماد",text:"تصاعد الرماد"}],upstreamAnswer:volcano.answer});
  assert.equal(calls.length,2);
  assert.equal(out.plan.scene.subject,"erupting volcano");
  assert.equal(out.review.pass,true);
  assert.match(calls[0].body.messages[0].content,/BEFORE/);
  assert.match(calls[1].body.messages[0].content,/Upstream UI stages/);
 }finally{globalThis.fetch=prior}
});
test("no image generation after science or stage review fails",async()=>{
 const previous=globalThis.fetch;let calls=0;
 try{
  globalThis.fetch=async()=>{calls++;return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(calls===1?volcano:{answersQuestion:true,topicAligned:false,scientificallyCoherent:true,criticalErrors:["Wrong subject"]})}}]})}};
  await assert.rejects(()=>buildAnswerFirst({question,apiKey:"test",endpoint:"https://example.invalid/chat",model:"mock"}),/ANSWER_FIRST_TOPIC_DRIFT/);
  assert.equal(calls,2);
 }finally{globalThis.fetch=previous}
});
