import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { localHeartResult, contextualHeartResult } from "../lib/nahlaty-engine.js";
import { HEART_FLOW_PATH } from "../app/lib/heartSemanticVector.js";

async function adapter(){
 const url=new URL("../app/lib/heartScienceExperience.js",import.meta.url);
 assert.equal(existsSync(url),true,"Scientific heart API adapter is required");
 return import(url.href);
}

test("curated valve lesson reaches native anatomy without changing its scene index",async()=>{
 const {scienceHeartResult}=await adapter();
 const result=await scienceHeartResult(localHeartResult("كيف تعمل الصمامات؟"),"طالب");
 assert.equal(result.scene,3);
 assert.equal(result.experience.initialStep,3);
 assert.equal(result.experience.steps.length,10);
 assert.equal(result.experience.sceneGraph.nativeSvg.scienceLock,true);
 assert.equal(result.experience.sceneGraph.nodes.length,15);
 assert.deepEqual(result.experience.sceneGraph.edges.map(e=>[e.from,e.to]),HEART_FLOW_PATH.slice(0,-1).map((id,i)=>[id,HEART_FLOW_PATH[i+1]]));
 assert.equal(result.experience.renderer,"heart-semantic-svg");
 assert.equal(result.renderPlan.renderer,result.experience.renderer);
 assert.equal(result.experience.semantic.clinicalValidation,false);
 assert.ok(result.experience.steps.every(s=>!s.image&&!s.thumbnail&&!s.media));
 const ids=new Set(result.experience.sceneGraph.nodes.map(n=>n.id));
 assert.ok(result.experience.steps.every(s=>s.runtime.focusNodeIds.every(id=>ids.has(id))));
 for(const id of ["heart.tricuspidValve","heart.mitralValve"]){
  const detail=result.experience.sceneGraph.nodes.find(node=>node.id===id).detail;
  assert.match(detail,/الحبال الوترية/);
  assert.match(detail,/العضلات الحليمية/);
  assert.match(detail,/حُذفت من الرسم/);
 }
});

test("contextual follow-up preserves the valve lesson and complete circuit",async()=>{
 const {scienceHeartResult}=await adapter();
 const result=await scienceHeartResult(contextualHeartResult("وليش؟",{scene:3}));
 assert.equal(result.topic,"valves");
 assert.equal(result.scene,3);
 assert.equal(result.experience.initialStep,3);
 assert.equal(result.experience.sceneGraph.edges.length,14);
});

test("unmodeled coronary and conduction lessons disclose their visual limits",async()=>{
 const {scienceHeartResult}=await adapter();
 const result=await scienceHeartResult(localHeartResult("كيف يعمل القلب؟"));
 for(const index of [7,8]){
  assert.equal(result.experience.steps[index].visualCoverage,"text-only");
  assert.match(result.experience.steps[index].text,/لا يعرض|غير ممثل/);
  assert.deepEqual(result.experience.steps[index].runtime.focusNodeIds,["heart.myocardium"]);
  assert.deepEqual(result.experience.steps[index].runtime.activeEdgeIds,[]);
 }
});

test("heart lesson routing accepts anatomy and flow while leaving unrelated and clinical questions outside scope",async()=>{
 const url=new URL("../app/lib/heartLessonScope.js",import.meta.url);
 assert.equal(existsSync(url),true,"Shared educational heart scope is required");
 const {isHeartLessonInput}=await import(url.href);
 for(const input of ["كيف يعمل القلب؟","How does the heart pump blood?","كيف تعمل الصمامات؟","اشرح البطين الأيسر","ما وظيفة الوريد الأجوف؟","كيف تعمل الدورة الرئوية؟"])
  assert.equal(isHeartLessonInput(input),true,input);
 for(const input of ["ما قلب الزهرة؟","كيف تعمل مضخة المياه؟","How does a bicycle pump work?","كيف أعالج ألم القلب؟","What causes a heart attack?","هل أحتاج جراحة صمام؟"])
  assert.equal(isHeartLessonInput(input),false,input);
});

test("specific anatomy questions select the relevant lesson instead of the generic function overview",async()=>{
 const {curatedHeartLesson}=await adapter();
 for(const [question,scene] of [["ما وظيفة الوريد الأجوف؟",4],["ما وظيفة الصمام التاجي؟",3],["What does the mitral valve do?",3],["ما وظيفة الشريان الرئوي؟",5],["ما وظيفة البطين الأيسر؟",2],["ما وظيفة الأبهر؟",6],["Explain the aorta",6]]){
  assert.equal(curatedHeartLesson(question)?.scene,scene,question);
 }
 const aortic=curatedHeartLesson("ما وظيفة الصمام الأبهري؟");
 assert.match(aortic.answer,/يحد من رجوع الدم إلى البطين/);
 assert.doesNotMatch(aortic.answer,/أنسجة الجسم/);
 assert.match(curatedHeartLesson("ما وظيفة الصمام الرئوي؟").answer,/بين البطين الأيمن والشريان الرئوي/);
});

test("short educational requests are distinct from articles, uploaded content and clinical requests",async()=>{
 const {isHeartLessonQuestion}=await import(new URL("../app/lib/heartLessonScope.js",import.meta.url).href);
 assert.equal(typeof isHeartLessonQuestion,"function");
 for(const input of ["كيف يعمل القلب؟","اشرح البطين الأيسر","Explain heart blood flow."])
  assert.equal(isHeartLessonQuestion(input),true,input);
 for(const input of ["ملاحظة تعليمية عن القلب: البطين الأيسر يولد ضغطًا أعلى من الأيمن. المطلوب: اشرح فقط لماذا يختلف الضغط بين البطينين ولا تحولها إلى درس عام عن القلب.","اشرح النص التالي عن القلب:\nهذا نص مرفق يجب الحفاظ عليه.","كيف أعالج ألم القلب؟"])
  assert.equal(isHeartLessonQuestion(input),false,input);
});

test("scene questions and analogy retain the complete heart graph and valve support limits",async()=>{
 const {scienceHeartResult}=await adapter();
 const {experience}=await scienceHeartResult(localHeartResult("كيف يعمل القلب؟"));
 const originalKey=process.env.DASHSCOPE_API_KEY;
 delete process.env.DASHSCOPE_API_KEY;
 try{
  const load=async(name)=>{
   const url=new URL(`../app/api/${name}/route.js`,import.meta.url);
   const source=readFileSync(url,"utf8").replace(/from "(\.\.[^"]+)"/g,(_,path)=>`from "${new URL(path+".js",url).href}"`);
   return import("data:text/javascript;base64,"+Buffer.from(source).toString("base64"));
  };
  const body={title:experience.title,nodes:experience.sceneGraph.nodes,edges:experience.sceneGraph.edges,steps:experience.steps};
  const ask=await load("ask-scene");
  const response=await ask.POST(new Request("http://localhost/api/ask-scene",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...body,question:"البطين الأيسر"})}));
  assert.equal(response.status,200);
  assert.ok((await response.json()).nodeIds.includes("heart.leftVentricle"));
  const analogy=await load("remap-analogy");
  const mapped=await analogy.POST(new Request("http://localhost/api/remap-analogy",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...body,target:"بوابات"})}));
  const data=await mapped.json();
  assert.equal(data.nodes.length,15);
  assert.equal(data.edges.length,14);
  assert.match(data.nodes.find(node=>node.id==="heart.mitralValve").detail,/حُذفت من الرسم/);
 }finally{
  if(originalKey===undefined)delete process.env.DASHSCOPE_API_KEY;
  else process.env.DASHSCOPE_API_KEY=originalKey;
 }
});
