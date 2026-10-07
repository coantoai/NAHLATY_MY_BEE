export const HEART_REFERENCE_ASSETS=Object.freeze([
 {path:"/heart-cinematic/heart-01.webp",publicUrl:"https://raw.githubusercontent.com/coantoai/NAHLATY_MY_BEE/main/public/heart-cinematic/heart-01.webp",role:"external-overview"},
 {path:"/heart-cinematic/heart-02.webp",publicUrl:"https://raw.githubusercontent.com/coantoai/NAHLATY_MY_BEE/main/public/heart-cinematic/heart-02.webp",role:"cutaway-reference"}
]);

export const HEART_SCIENTIFIC_SOURCES=Object.freeze([
 {id:"nhlbi-anatomy",title:"NHLBI — Heart anatomy",url:"https://www.nhlbi.nih.gov/health/heart/anatomy"},
 {id:"nhlbi-blood-flow",title:"NHLBI — Blood flow through the heart",url:"https://www.nhlbi.nih.gov/health/heart/blood-flow"},
 {id:"nhlbi-heart-beats",title:"NHLBI — How the Heart Beats",url:"https://www.nhlbi.nih.gov/health/heart/heart-beats"},
 {id:"openstax-heart-anatomy",title:"OpenStax — Heart Anatomy (publisher source)",url:"https://github.com/openstax/osbooks-anatomy-physiology/blob/5ae32b3f4bc24ed003e91dc38bf47dba80751044/modules/m46676/index.cnxml"},
 {id:"openstax-cardiac-physiology",title:"OpenStax — Cardiac Physiology (publisher source)",url:"https://github.com/openstax/osbooks-anatomy-physiology/blob/5ae32b3f4bc24ed003e91dc38bf47dba80751044/modules/m46672/index.cnxml"}
]);

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
 "heart.pulmonaryArtery":["الجذع والشرايين الرئوية","Pulmonary trunk and arteries"],
 "heart.pulmonaryVeins":["الأوردة الرئوية","Pulmonary veins"],
 "heart.leftAtrium":["الأذين الأيسر","Left atrium"],
 "heart.mitralValve":["الصمام التاجي","Mitral valve"],
 "heart.leftVentricle":["البطين الأيسر","Left ventricle"],
 "heart.aorticValve":["الصمام الأبهري","Aortic valve"],
 "heart.aorta":["الأبهر","Aorta"],
 "heart.myocardium":["عضلة القلب","Myocardium"],
 "circulation.lungs":["الرئتان","Lungs"],
 "circulation.body":["أنسجة الجسم","Body tissues"]
};

const chambers=new Set(["heart.rightAtrium","heart.rightVentricle","heart.leftAtrium","heart.leftVentricle"]);
const valves=new Set(["heart.tricuspidValve","heart.pulmonaryValve","heart.mitralValve","heart.aorticValve"]);

export const HEART_FLOW_PATH=Object.freeze([
 "circulation.body",
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
 "heart.aorta",
 "circulation.body"
]);

// These bindings describe the original educational cutaway. They must never
// be applied to the NIAID exterior's positional vessel groups by inference.
export const HEART_ANATOMY_BINDINGS=Object.freeze([
 ["heart.venaCava","vena-cava"],
 ["heart.rightAtrium","right-atrium"],
 ["heart.tricuspidValve","tricuspid-valve"],
 ["heart.rightVentricle","right-ventricle"],
 ["heart.pulmonaryValve","pulmonary-valve"],
 ["heart.pulmonaryArtery","pulmonary-artery"],
 ["heart.pulmonaryVeins","pulmonary-veins"],
 ["heart.leftAtrium","left-atrium"],
 ["heart.mitralValve","mitral-valve"],
 ["heart.leftVentricle","left-ventricle"],
 ["heart.aorticValve","aortic-valve"],
 ["heart.aorta","aorta"],
 ["heart.myocardium","myocardium"]
].map(([conceptId,elementId])=>Object.freeze({conceptId,elementId})));

export const HEART_VENA_CAVA_SUBPARTS=Object.freeze([
 {parentConceptId:"heart.venaCava",elementId:"superior-vena-cava",label:{ar:"الوريد الأجوف العلوي",en:"Superior vena cava"},knowledge:"fact"},
 {parentConceptId:"heart.venaCava",elementId:"inferior-vena-cava",label:{ar:"الوريد الأجوف السفلي",en:"Inferior vena cava"},knowledge:"fact"}
].map(Object.freeze));

export const HEART_SCIENCE_LOCK=Object.freeze({
 version:"heart-science-lock/v1",
 scope:"Simplified normal postnatal human circulation; educational cutaway, not patient-specific anatomy or a clinical simulation.",
 claims:Object.freeze([
  {id:"four-chambers-four-valves",knowledge:"fact",evidenceStatus:"source-supported",sourceIds:["nhlbi-anatomy","nhlbi-blood-flow"],statement:"The heart has right and left atria, right and left ventricles, and tricuspid, pulmonary, mitral and aortic valves."},
  {id:"normal-directed-flow",knowledge:"fact",evidenceStatus:"source-supported",sourceIds:["nhlbi-blood-flow","openstax-heart-anatomy"],statement:"Body → venae cavae → right atrium → tricuspid valve → right ventricle → pulmonary valve → pulmonary trunk and arteries → lungs → pulmonary veins → left atrium → mitral valve → left ventricle → aortic valve → aorta → body."},
  {id:"pulmonary-oxygenation",knowledge:"fact",evidenceStatus:"source-supported",sourceIds:["nhlbi-blood-flow"],statement:"Pulmonary arteries carry oxygen-poor blood toward the lungs; pulmonary veins return oxygen-rich blood to the left atrium."},
  {id:"vessel-direction",knowledge:"fact",evidenceStatus:"source-supported",sourceIds:["nhlbi-blood-flow"],statement:"Artery and vein names describe flow away from and toward the heart, not blood oxygen content."},
  {id:"vena-cava-return",knowledge:"fact",evidenceStatus:"source-supported",sourceIds:["nhlbi-blood-flow"],statement:"Superior and inferior vena cava return systemic venous blood to the right atrium."},
  {id:"ventricular-separation",knowledge:"fact",evidenceStatus:"source-supported",sourceIds:["nhlbi-anatomy"],statement:"The septum separates the right and left sides; no direct right-to-left chamber connection is modeled in normal postnatal circulation."},
  {id:"left-ventricular-wall",knowledge:"fact",evidenceStatus:"source-supported",sourceIds:["openstax-heart-anatomy","nhlbi-blood-flow"],statement:"The left ventricle has a thicker muscular wall than the right ventricle and ejects through the aortic valve into the aorta."},
  {id:"paired-ventricular-pumping",knowledge:"fact",evidenceStatus:"source-supported",sourceIds:["nhlbi-heart-beats"],statement:"The two ventricles pump in the same cardiac cycle; a sequential route highlight does not mean the chambers pump one after another."},
  {id:"pressure-driven-valves",knowledge:"fact",evidenceStatus:"source-supported",sourceIds:["openstax-heart-anatomy"],statement:"Heart valve leaflets move passively in response to pressure differences. During ventricular ejection, atrioventricular valves are closed and semilunar valves are open. Papillary muscles tension the chordae tendineae to prevent atrioventricular leaflet prolapse into the atria; they do not actively pull the valves open."},
  {id:"valve-support-simplification",knowledge:"inference",sourceIds:[],statement:"Leaflets are schematic; chordae tendineae and papillary muscles are omitted from this cutaway. Valve poses and transitions illustrate filling and ejection, not measured kinetics or a complete pressure-based cardiac cycle."},
  {id:"red-blue-convention",knowledge:"inference",sourceIds:[],statement:"Red denotes oxygen-rich and blue oxygen-poor blood in the diagram. Blood is red; blue is an educational color convention, not the physical color of venous blood."},
  {id:"illustrative-geometry",knowledge:"inference",sourceIds:[],statement:"Paths, scale, cutaway arrangement and simplified vessel branches are authored educational geometry, not measured or clinically certified anatomy."},
  {id:"illustrative-timing",knowledge:"inference",sourceIds:[],statement:"Cycle phases and flow animation are illustrative. They do not measure transit time, pressures, valve kinetics or individual physiology; normalized filling and ejection fractions are not measured phase durations or a model of how those durations vary with heart rate."},
  {id:"fixed-stroke-volume",knowledge:"inference",sourceIds:[],statement:"A fixed 70 mL per beat is an educational assumption for the cardiac-output calculation, not an invariant human stroke volume."},
  {id:"individual-stroke-volume",knowledge:"unknown",sourceIds:[],statement:"Individual stroke volume, ejection fraction, cardiac output, pathology, coronary flow and exercise responses are not estimated by this scene."}
 ].map(Object.freeze)),
 scientificSources:HEART_SCIENTIFIC_SOURCES
});

const heartConcepts=HEART_REQUIRED_CONCEPT_IDS.map(conceptId=>({
 conceptId,
 label:{ar:labels[conceptId][0],en:labels[conceptId][1]},
 kind:chambers.has(conceptId)?"chamber":valves.has(conceptId)?"valve":conceptId==="heart.myocardium"?"tissue":"vessel",
 assetRequired:true,
 knowledge:"fact",
 sourceIds:[chambers.has(conceptId)||conceptId==="heart.myocardium"?"nhlbi-anatomy":"nhlbi-blood-flow"],
 geometryKnowledge:"inference"
}));

export const HEART_SCENE_SPEC=Object.freeze({
 version:"scene-spec/v1",
 sceneId:"heart.core-flow",
 title:{ar:"كيف يعمل القلب؟",en:"How does the heart work?"},
 concepts:[
  ...heartConcepts,
  {conceptId:"circulation.lungs",label:{ar:labels["circulation.lungs"][0],en:labels["circulation.lungs"][1]},kind:"externalContext",assetRequired:false,knowledge:"fact",sourceIds:["nhlbi-blood-flow"]},
  {conceptId:"circulation.body",label:{ar:labels["circulation.body"][0],en:labels["circulation.body"][1]},kind:"externalContext",assetRequired:false,knowledge:"fact",sourceIds:["nhlbi-blood-flow"]}
 ],
 layers:[
  {id:"heart.layer.anatomy",label:{ar:"التشريح",en:"Anatomy"},defaultVisible:true},
  {id:"heart.layer.flow",label:{ar:"مسار الدم",en:"Blood flow"},defaultVisible:true},
  {id:"heart.layer.labels",label:{ar:"التسميات",en:"Labels"},defaultVisible:true}
 ],
 relations:HEART_FLOW_PATH.slice(0,-1).map((from,index)=>({
  // Preserve the prior twelve intracardiac/pulmonary relation IDs.
  id:index===0?"heart.flow.body-return":index===HEART_FLOW_PATH.length-2?"heart.flow.body-delivery":"heart.flow."+index,
  from,
  to:HEART_FLOW_PATH[index+1],
  relation:"flow",
  direction:"forward",
  knowledge:"fact",
  sourceIds:["nhlbi-blood-flow"],
  oxygenation:index<HEART_FLOW_PATH.indexOf("circulation.lungs")?"deoxygenated":"oxygenated",
  bloodColor:index<HEART_FLOW_PATH.indexOf("circulation.lungs")?"blue":"red",
  colorKnowledge:"inference"
 })),
 parameters:[
  {id:"heart.heartRate",label:{ar:"معدل النبض",en:"Heart rate"},unit:"bpm",min:40,max:180,step:1,default:60,knowledge:"inference",educationalAssumption:true},
  {id:"heart.strokeVolume",label:{ar:"حجم الضربة",en:"Stroke volume"},unit:"mL/beat",fixed:70,knowledge:"inference",educationalAssumption:true},
  {id:"heart.cardiacOutput",label:{ar:"النتاج القلبي",en:"Cardiac output"},unit:"L/min",formula:"heartRate*strokeVolume/1000",formulaKnowledge:"fact",formulaSourceIds:["openstax-cardiac-physiology"],knowledge:"inference",educationalAssumption:true}
 ],
 states:[
  {id:"heart.filling",label:{ar:"الامتلاء",en:"Filling"}},
  {id:"heart.ejection",label:{ar:"القذف",en:"Ejection"}}
 ],
 timeline:[
  {at:0,state:"heart.filling",focus:["heart.rightAtrium","heart.leftAtrium"],action:"fill",knowledge:"inference"},
  {at:.35,state:"heart.filling",focus:["heart.rightVentricle","heart.leftVentricle"],action:"fill",knowledge:"inference"},
  {at:.62,state:"heart.ejection",focus:["heart.pulmonaryValve","heart.aorticValve"],action:"open",knowledge:"inference"},
  {at:.72,state:"heart.ejection",focus:["heart.pulmonaryArtery","heart.aorta"],action:"flow",knowledge:"inference"},
  {at:1,state:"heart.filling",focus:["heart.rightAtrium","heart.leftAtrium"],action:"reset",knowledge:"inference"}
 ],
 scientificSources:HEART_SCIENTIFIC_SOURCES,
 referenceAssets:HEART_REFERENCE_ASSETS,
 scienceLock:HEART_SCIENCE_LOCK,
 sourceLicense:[]
});

export function cardiacOutputLitersPerMinute(heartRate,strokeVolume=70){
 const hr=Number(heartRate),sv=Number(strokeVolume);
 if(!Number.isFinite(hr)||!Number.isFinite(sv))return null;
 return Math.round((hr*sv/1000)*10)/10;
}

function escapeRegExp(value){
 return String(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
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
  if(!HEART_REQUIRED_CONCEPT_IDS.includes(conceptId))errors.push("unknown conceptId: "+conceptId);
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
  const count=[...output.matchAll(new RegExp("\\s+id=[\"']"+idEscaped+"[\"']","g"))].length;
  if(count>1)throw new Error("SVG element must be unique: "+elementId);
  const re=new RegExp("(<(?:g|path|ellipse|circle|polygon|polyline|rect)\\b[^>]*\\sid=[\"']"+idEscaped+"[\"'][^>]*?)(\\s*\\/?>)","i");
  if(!re.test(output))throw new Error("SVG element not found: "+elementId);
  output=output.replace(re,(match,start,end)=>{
   const current=start.match(/\bdata-concept-id=["']([^"']*)["']/)?.[1];
   if(current&&current!==conceptId)throw new Error("Conflicting semantic annotation: "+elementId);
   if(current)return match;
   return start+" data-concept-id=\""+conceptId+"\" tabindex=\"0\" role=\"button\""+end;
  });
 }
 return output;
}
