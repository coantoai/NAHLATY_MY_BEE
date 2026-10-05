export const HEART_REQUIRED_CONCEPT_IDS=Object.freeze([
 "heart.venaCava",
 "heart.rightAtrium",
 "heart.tricuspidValve",
 "heart.rightVentricle",
 "heart.pulmonaryValve",
 "heart.pulmonaryArtery",
 "heart.pulmonaryVeins",
 "heart.leftAtrium",
 "heart.mitralValve",
 "heart.leftVentricle",
 "heart.aorticValve",
 "heart.aorta",
 "heart.myocardium"
]);

const labels={
 "heart.venaCava":["الوريدان الأجوفان","Venae cavae"],
 "heart.rightAtrium":["الأذين الأيمن","Right atrium"],
 "heart.tricuspidValve":["الصمام ثلاثي الشرفات","Tricuspid valve"],
 "heart.rightVentricle":["البطين الأيمن","Right ventricle"],
 "heart.pulmonaryValve":["الصمام الرئوي","Pulmonary valve"],
 "heart.pulmonaryArtery":["الشريان الرئوي","Pulmonary artery"],
 "heart.pulmonaryVeins":["الأوردة الرئوية","Pulmonary veins"],
 "heart.leftAtrium":["الأذين الأيسر","Left atrium"],
 "heart.mitralValve":["الصمام التاجي","Mitral valve"],
 "heart.leftVentricle":["البطين الأيسر","Left ventricle"],
 "heart.aorticValve":["الصمام الأبهري","Aortic valve"],
 "heart.aorta":["الأبهر","Aorta"],
 "heart.myocardium":["عضلة القلب","Myocardium"],
 "circulation.lungs":["الرئتان","Lungs"]
};

const chambers=new Set(["heart.rightAtrium","heart.rightVentricle","heart.leftAtrium","heart.leftVentricle"]);
const valves=new Set(["heart.tricuspidValve","heart.pulmonaryValve","heart.mitralValve","heart.aorticValve"]);

export const HEART_FLOW_PATH=Object.freeze([
 "heart.venaCava",
 "heart.rightAtrium",
 "heart.tricuspidValve",
 "heart.rightVentricle",
 "heart.pulmonaryValve",
 "heart.pulmonaryArtery",
 "circulation.lungs",
 "heart.pulmonaryVeins",
 "heart.leftAtrium",
 "heart.mitralValve",
 "heart.leftVentricle",
 "heart.aorticValve",
 "heart.aorta"
]);

const heartConcepts=HEART_REQUIRED_CONCEPT_IDS.map(conceptId=>({
 conceptId,
 label:{ar:labels[conceptId][0],en:labels[conceptId][1]},
 kind:chambers.has(conceptId)?"chamber":valves.has(conceptId)?"valve":conceptId==="heart.myocardium"?"tissue":"vessel",
 assetRequired:true
}));

export const HEART_SCENE_SPEC=Object.freeze({
 version:"scene-spec/v1",
 sceneId:"heart.core-flow",
 title:{ar:"كيف يعمل القلب؟",en:"How does the heart work?"},
 concepts:[
  ...heartConcepts,
  {conceptId:"circulation.lungs",label:{ar:labels["circulation.lungs"][0],en:labels["circulation.lungs"][1]},kind:"externalContext",assetRequired:false}
 ],
 layers:[
  {id:"heart.layer.anatomy",label:{ar:"التشريح",en:"Anatomy"},defaultVisible:true},
  {id:"heart.layer.flow",label:{ar:"مسار الدم",en:"Blood flow"},defaultVisible:true},
  {id:"heart.layer.labels",label:{ar:"التسميات",en:"Labels"},defaultVisible:true}
 ],
 relations:HEART_FLOW_PATH.slice(0,-1).map((from,index)=>({
  id:"heart.flow."+(index+1),
  from,
  to:HEART_FLOW_PATH[index+1],
  relation:"flow",
  direction:"forward",
  knowledge:"fact"
 })),
 parameters:[
  {id:"heart.heartRate",label:{ar:"معدل النبض",en:"Heart rate"},unit:"bpm",min:60,max:120,step:1,default:60},
  {id:"heart.strokeVolume",label:{ar:"حجم الضربة",en:"Stroke volume"},unit:"mL/beat",fixed:70},
  {id:"heart.cardiacOutput",label:{ar:"النتاج القلبي",en:"Cardiac output"},unit:"L/min",formula:"heartRate*strokeVolume/1000",educationalAssumption:true}
 ],
 states:[
  {id:"heart.filling",label:{ar:"الامتلاء",en:"Filling"}},
  {id:"heart.ejection",label:{ar:"القذف",en:"Ejection"}}
 ],
 timeline:[
  {at:0,state:"heart.filling",focus:["heart.rightAtrium","heart.leftAtrium"],action:"fill"},
  {at:.35,state:"heart.filling",focus:["heart.rightVentricle","heart.leftVentricle"],action:"fill"},
  {at:.62,state:"heart.ejection",focus:["heart.pulmonaryValve","heart.aorticValve"],action:"open"},
  {at:.72,state:"heart.ejection",focus:["heart.pulmonaryArtery","heart.aorta"],action:"flow"},
  {at:1,state:"heart.filling",focus:["heart.rightAtrium","heart.leftAtrium"],action:"reset"}
 ],
 sourceLicense:[]
});

export function cardiacOutputLitersPerMinute(heartRate,strokeVolume=70){
 const hr=Number(heartRate),sv=Number(strokeVolume);
 if(!Number.isFinite(hr)||!Number.isFinite(sv))return null;
 return Math.round((hr*sv/1000)*10)/10;
}

function escapeRegExp(value){
 return String(value).replace(/[.*+?^$()|[\\]\\]/g,"\\$&");
}

export function validateHeartSemanticManifest(manifest={}){
 const sceneId=String(manifest.sceneId||"");
 const bindings=Array.isArray(manifest.bindings)?manifest.bindings:[];
 const seenConcepts=new Set();
 const seenElements=new Set();
 const errors=[];
 for(const item of bindings){
  const conceptId=String(item?.conceptId||"");
  const elementId=String(item?.elementId||"");
  if(!conceptId||!elementId){errors.push("binding requires conceptId and elementId");continue;}
  if(!/^[A-Za-z_][A-Za-z0-9_:.-]*$/.test(elementId)){errors.push("invalid elementId: "+elementId);continue;}
  if(seenConcepts.has(conceptId))errors.push("duplicate conceptId: "+conceptId);
  if(seenElements.has(elementId))errors.push("duplicate elementId: "+elementId);
  seenConcepts.add(conceptId);seenElements.add(elementId);
 }
 for(const conceptId of HEART_REQUIRED_CONCEPT_IDS){
  if(!seenConcepts.has(conceptId))errors.push("missing conceptId: "+conceptId);
 }
 if(sceneId!==HEART_SCENE_SPEC.sceneId)errors.push("sceneId must be "+HEART_SCENE_SPEC.sceneId);
 const sourceLicense=Array.isArray(manifest.sourceLicense)?manifest.sourceLicense:[];
 if(!sourceLicense.length)errors.push("sourceLicense is required before publication");
 return {ok:errors.length===0,errors};
}

export function bindHeartSemanticIds(svg,manifest={}){
 let output=String(svg||"");
 const verdict=validateHeartSemanticManifest(manifest);
 if(!verdict.ok)throw new Error(verdict.errors.join("; "));
 for(const item of manifest.bindings){
  const conceptId=String(item.conceptId);
  const elementId=String(item.elementId);
  const idEscaped=escapeRegExp(elementId);
  const re=new RegExp("(<(?:g|path|ellipse|circle|polygon|polyline|rect)\\b[^>]*\\bid=[\"']"+idEscaped+"[\"'][^>]*?)(\\s*\\/?>)","i");
  if(!re.test(output))throw new Error("SVG element not found: "+elementId);
  output=output.replace(re,(match,start,end)=>{
   if(/\bdata-concept-id=/.test(start))return match;
   return start+" data-concept-id=\""+conceptId+"\" tabindex=\"0\" role=\"button\""+end;
  });
 }
 return output;
}
