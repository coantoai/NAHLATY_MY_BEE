// Answer-first: decide what a question means BEFORE requesting an image.
const clean=x=>String(x??"").trim();
const uniq=x=>[...new Set(x.map(clean).filter(Boolean))];
export function parseModelJson(raw){
 const value=Array.isArray(raw)?raw.map(p=>typeof p==="string"?p:clean(p?.text||p?.content)).join("\n"):clean(raw);
 const s=value.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");
 try{return JSON.parse(s)}catch{}
 const a=s.indexOf("{"),b=s.lastIndexOf("}");
 try{return a>=0&&b>a?JSON.parse(s.slice(a,b+1)):null}catch{return null}
}
export function normalizeAnswerPlan(raw,question){
 if(!raw||typeof raw!=="object")throw new Error("ANSWER_FIRST_INVALID_JSON");
 const intent=clean(raw.questionIntent).slice(0,300),answer=clean(raw.answer).slice(0,1600),brief=clean(raw.visualBrief);
 const scene=raw.scene||{},subject=clean(scene.subject).slice(0,150),setting=clean(scene.setting).slice(0,200);
 const objects=uniq(Array.isArray(scene.objects)?scene.objects:[]).slice(0,8);
 const avoid=uniq(Array.isArray(scene.avoid)?scene.avoid:[]).slice(0,8);
 const claims=(Array.isArray(raw.claims)?raw.claims:[]).slice(0,8).map(c=>({claim:clean(c?.claim).slice(0,280),certainty:c?.certainty==="uncertain"?"uncertain":"model-reviewed"})).filter(c=>c.claim);
 const causalSteps=(Array.isArray(raw.causalSteps)?raw.causalSteps:[]).slice(0,7).map((s,i)=>({
  index:i,fact:clean(s?.fact).slice(0,300),mode:["visible","overlay","nonvisual"].includes(s?.mode)?s.mode:"nonvisual",visual:clean(s?.visual).slice(0,240)
 })).filter(s=>s.fact);
 const uncertainties=uniq(Array.isArray(raw.uncertainties)?raw.uncertainties:[]).slice(0,6);
 if(!clean(question)||clean(question).length>700)throw new Error("ANSWER_FIRST_INVALID_QUESTION");
 if(intent.length<10||answer.length<35||brief.length<35||brief.length>900)throw new Error("ANSWER_FIRST_INCOMPLETE_ANSWER");
 if(!subject||!setting||!objects.length||!claims.length||causalSteps.length<2)throw new Error("ANSWER_FIRST_INCOMPLETE_PLAN");
 if(causalSteps.some(s=>s.mode==="overlay"&&!s.visual))throw new Error("ANSWER_FIRST_OVERLAY_UNDEFINED");
 return {question:clean(question),questionIntent:intent,answer,claims,causalSteps,scene:{subject,setting,objects,avoid},visualBrief:brief,uncertainties};
}
export function acceptanceOfReview(v,{hasUpstream=false,hasStages=false}={}){
 if(!v||typeof v!=="object")return {pass:false,reason:"ANSWER_FIRST_INVALID_REVIEW"};
 for(const [key,reason] of [["answersQuestion","ANSWER_FIRST_ANSWER_MISMATCH"],["topicAligned","ANSWER_FIRST_TOPIC_DRIFT"],["scientificallyCoherent","ANSWER_FIRST_SCIENCE_CONCERN"]]){
  if(v[key]!==true)return {pass:false,reason};
 }
 if(hasUpstream&&v.agreesWithUpstream!==true)return {pass:false,reason:"ANSWER_FIRST_UPSTREAM_CONFLICT"};
 if(hasStages&&v.stagesMatch!==true)return {pass:false,reason:"ANSWER_FIRST_STAGE_CONFLICT"};
 if((Array.isArray(v.criticalErrors)?v.criticalErrors:[]).length)return {pass:false,reason:"ANSWER_FIRST_REVIEW_ERRORS"};
 return {pass:true,reason:"model-reviewed-not-externally-verified"};
}
async function ask(apiKey,endpoint,model,prompt,maxTokens){
 const res=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+apiKey},body:JSON.stringify({model,messages:[{role:"user",content:prompt}],temperature:0,max_tokens:maxTokens,enable_thinking:false})});
 const data=await res.json().catch(()=>null);
 if(!res.ok)throw new Error("ANSWER_FIRST_PROVIDER_"+res.status);
 const value=parseModelJson(data?.choices?.[0]?.message?.content);
 if(!value)throw new Error("ANSWER_FIRST_UNPARSEABLE_MODEL_OUTPUT");
 return {value,usage:data?.usage||null};
}
function answerPrompt(q,previous,previousSummary,evidence){
 return [
 "You are NAHLATY's scientific editor. FIRST answer the precise user question; THEN choose the scene. A shared topic is NOT enough.",
 "Question: "+q,
 "Earlier topic (context only, not the current target): "+previous,
 "Earlier summary (context only): "+previousSummary,
 evidence?"Curated scientific constraints: "+JSON.stringify(evidence):"No external scientific source supplied. Do not claim external verification.",
 "Return ONLY JSON: {\"questionIntent\":\"specific question intent in Arabic\",\"answer\":\"full concise scientific answer in Arabic\",\"claims\":[{\"claim\":\"...\",\"certainty\":\"model-reviewed|uncertain\"}],\"causalSteps\":[{\"fact\":\"scientific step in Arabic\",\"mode\":\"visible|overlay|nonvisual\",\"visual\":\"how to explain visually or why invisible\"}],\"scene\":{\"subject\":\"precise physical subject in English\",\"setting\":\"scientifically justified setting in English\",\"objects\":[\"actual visible object\"],\"avoid\":[\"misleading object\"]},\"visualBrief\":\"one English sentence describing a scientifically suitable static base scene, without baked-in arrows or labels\",\"uncertainties\":[]}.",
 "Do not silently replace an eruption with cloud formation, or choose water/land/volcano without scientific relevance. Water vapor, cooling and forces are not directly visible: represent these only as later explanatory overlays, never as photographed matter. Keep the STATIC image separate from interactive effects. If ambiguity is material, identify it in uncertainties; avoid unsupported certainty."
 ].join("\n");
}
function reviewPrompt(q,plan,evidence,upstream,stages){
 return [
 "Independently CRITIQUE the answer before any image is generated. Be skeptical.",
 "Exact user question: "+q,
 "Proposed answer, steps and scene: "+JSON.stringify(plan),
 evidence?"Curated constraints: "+JSON.stringify(evidence):"This is only model review, NOT independent scientific verification.",
 upstream?"Upstream engine answer: "+upstream:"No upstream answer.",
 stages.length?"Upstream UI stages: "+JSON.stringify(stages):"No UI stages.",
 "Check that the answer addresses the actual question, the subject has NOT drifted, the picture is a faithful representation of the answer, and invisible effects are NOT portrayed as photographic reality.",
 "Volcanic eruption plume and meteorological cumulus cloud formation are DIFFERENT questions even when both have upward motion. Reject an unwanted topic change or mismatched UI stages.",
 "Return ONLY JSON: {\"answersQuestion\":true,\"topicAligned\":true,\"scientificallyCoherent\":true,\"agreesWithUpstream\":true,\"stagesMatch\":true,\"criticalErrors\":[]}. If uncertain set false; do not automatically approve."
 ].join("\n");
}
export async function buildAnswerFirst({question,previous="",previousSummary="",evidence=null,upstreamAnswer="",stages=[],apiKey,endpoint,model}){
 if(!apiKey||!endpoint||!model)throw new Error("ANSWER_FIRST_PROVIDER_NOT_CONFIGURED");
 const first=await ask(apiKey,endpoint,model,answerPrompt(question,previous,previousSummary,evidence),1700);
 const plan=normalizeAnswerPlan(first.value,question);
 const uiStages=(Array.isArray(stages)?stages:[]).slice(0,7).map(s=>({title:clean(s?.title).slice(0,90),text:clean(s?.text).slice(0,180)})).filter(s=>s.title||s.text);
 const upstream=clean(upstreamAnswer).slice(0,900);
 const review=await ask(apiKey,endpoint,model,reviewPrompt(question,plan,evidence,upstream,uiStages),350);
 const gate=acceptanceOfReview(review.value,{hasUpstream:Boolean(upstream),hasStages:uiStages.length>0});
 if(!gate.pass)throw new Error(gate.reason+": "+(Array.isArray(review.value?.criticalErrors)?review.value.criticalErrors:[]).slice(0,2).map(clean).join(" | ").slice(0,220));
 return {plan,review:gate,usage:{answer:first.usage,review:review.usage}};
}
