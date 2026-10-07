import { localHeartResult } from "../../lib/nahlaty-engine.js";
import { compileVisualPlan } from "../../lib/visual-director.js";
import { loadScienceHeart } from "./heartScienceAsset.js";
import { getExperienceProfile } from "./experienceProfile.js";
import { isHeartLessonInput } from "./heartLessonScope.js";

export function curatedHeartLesson(input){
 if(!isHeartLessonInput(input))return null;
 const question=String(input);
 // Extend vocabulary without changing the synchronous legacy topic contract.
 const vocabulary=/vena(?:e)? cava|الوريد الأجوف|الوريدان الأجوفان/i.test(question)?"رحلة الدم":
  /صمام|صمامات|valve|mitral|tricuspid/i.test(question)?"الصمامات":
  /pulmonary|الدورة الرئوية|الشريان الرئوي|الأوردة الرئوية/i.test(question)?"الرئتين":
  /أذين|اذين|بطين|atri(?:um|a)|ventric/i.test(question)?"الحجرات":
  /coronary|تاجي|تاجية/i.test(question)?"تاجية":
  /aorta|الأبهر|الأبهري/i.test(question)?"توزيع":
  /كهرب|electrical|rhythm/i.test(question)?"كهرب":"";
 const result=vocabulary?localHeartResult(vocabulary):localHeartResult(question);
 const concept=/vena(?:e)? cava|الوريد الأجوف|الوريدان الأجوفان/i.test(question)?"heart.venaCava":
  /aortic valve|الصمام الأبهري/i.test(question)?"heart.aorticValve":
  /pulmonary valve|الصمام الرئوي/i.test(question)?"heart.pulmonaryValve":
  /mitral|الصمام التاجي/i.test(question)?"heart.mitralValve":
  /tricuspid|ثلاثي الشرفات/i.test(question)?"heart.tricuspidValve":
  /pulmonary arter|الشريان الرئوي/i.test(question)?"heart.pulmonaryArtery":
  /pulmonary vein|الأوردة الرئوية/i.test(question)?"heart.pulmonaryVeins":
  /aorta|الأبهر/i.test(question)?"heart.aorta":"";
 return result?{...result,sourceInput:question,...(concept?{answer:details[concept]}:{})}:null;
}

const fourChambers=["heart.rightAtrium","heart.rightVentricle","heart.leftAtrium","heart.leftVentricle"];
const fourValves=["heart.tricuspidValve","heart.pulmonaryValve","heart.mitralValve","heart.aorticValve"];
const details={
 "heart.venaCava":"يعيد الوريدان الأجوفان الدم قليل الأكسجين من الجسم إلى الأذين الأيمن.",
 "heart.rightAtrium":"يستقبل الدم الوريدي من الجسم ويمرره عبر الصمام ثلاثي الشرفات إلى البطين الأيمن.",
 "heart.tricuspidValve":"بين الأذين الأيمن والبطين الأيمن؛ يفتح ويغلق بفروق الضغط ويحد من رجوع الدم.",
 "heart.rightVentricle":"يقذف الدم قليل الأكسجين عبر الصمام الرئوي والشريان الرئوي إلى الرئتين.",
 "heart.pulmonaryValve":"بين البطين الأيمن والشريان الرئوي؛ يحد من رجوع الدم إلى البطين.",
 "heart.pulmonaryArtery":"ينقل الدم قليل الأكسجين من البطين الأيمن إلى الرئتين؛ الشريان يُسمى باتجاه الجريان.",
 "heart.pulmonaryVeins":"تعيد الدم الغني بالأكسجين من الرئتين إلى الأذين الأيسر.",
 "heart.leftAtrium":"يستقبل الدم المؤكسج من الأوردة الرئوية ويمرره عبر الصمام التاجي إلى البطين الأيسر.",
 "heart.mitralValve":"بين الأذين الأيسر والبطين الأيسر؛ يفتح ويغلق بفروق الضغط ويحد من رجوع الدم.",
 "heart.leftVentricle":"جداره أكثر سماكة من البطين الأيمن؛ يقذف الدم المؤكسج عبر الصمام الأبهري إلى الأبهر.",
 "heart.aorticValve":"بين البطين الأيسر والأبهر؛ يحد من رجوع الدم إلى البطين.",
 "heart.aorta":"ينقل الدم الغني بالأكسجين من البطين الأيسر إلى أنسجة الجسم.",
 "heart.myocardium":"عضلة القلب تنقبض لتوليد الضغط؛ ترويتها التاجية ومسارات التوصيل الكهربائي غير مرسومة في هذا المقطع.",
 "circulation.lungs":"موضع تبادل الغازات: يخرج ثاني أكسيد الكربون من الدم ويصل الأكسجين إليه.",
 "circulation.body":"تتلقى الأنسجة الدم المؤكسج؛ يعود الدم قليل الأكسجين عبر الأوردة إلى القلب الأيمن."
};

export async function scienceHeartResult(result,audience="عام"){
 if(result?.domain!=="heart")return result;
 const {experience:science}=await loadScienceHeart();
 const nodes=science.sceneGraph.nodes.map(node=>({...node,detail:details[node.id]?(details[node.id]+(fourValves.includes(node.id)?" "+node.detail:"")):node.detail}));
 const all=nodes.map(node=>node.id),edges=science.sceneGraph.edges;
 const focuses=[
  ["heart.myocardium",...fourChambers],all,fourChambers,fourValves,all,
  ["heart.rightVentricle","heart.pulmonaryValve","heart.pulmonaryArtery","circulation.lungs","heart.pulmonaryVeins","heart.leftAtrium"],
  ["heart.leftVentricle","heart.aorticValve","heart.aorta","circulation.body","heart.venaCava"],
  ["heart.myocardium"],["heart.myocardium"],all
 ];
 const steps=result.experience.steps.map((legacy,index)=>{
  const {image,thumbnail,media,...step}=legacy;
  const textOnly=index===7||index===8;
  const focus=focuses[index];
  const active=([4,9].includes(index)?edges:[5,6].includes(index)?edges.filter(edge=>focus.includes(edge.from)&&focus.includes(edge.to)):[]).map(edge=>edge.id);
  const limit=index===7?"هذا المقطع لا يعرض الشرايين التاجية أو ترويتها؛ تُشرح هنا نصيًا فقط.":index===8?"هذا المقطع لا يعرض العقدة الجيبية أو العقدة الأذينية البطينية أو حزمة هِس وفروعها؛ تُشرح وظيفة التوصيل نصيًا فقط.":"";
  return {...step,text:step.text+(limit?" "+limit:""),motion:"reveal",visualCoverage:textOnly?"text-only":"educational-cutaway",
   ...(textOnly?{why:index===7?"عضلة القلب تحتاج تروية خاصة؛ الشبكة التاجية غير مرسومة هنا.":"التوصيل الكهربائي ينسق الانقباض؛ مساره غير مرسوم هنا.",outcome:index===7?"يتضح نصيًا أن الشرايين التاجية تغذي عضلة القلب؛ لا تظهر شبكة تاجية في المقطع.":"تُشرح وظيفة التوصيل نصيًا؛ حركة العضلة تعليمية ولا تمثل مسار الإشارة الكهربائي."}:{}),
   focusNodeIds:focus,visibleNodeIds:all,activeEdgeIds:active,nodeActions:[],
   runtime:{dimension:"2d",focusNodeIds:focus,visibleNodeIds:all,activeEdgeIds:active,nodeActions:[],camera:{mode:"overview"}}};
 });
 const profile=getExperienceProfile(audience);
 const experience={...result.experience,...science,title:result.experience.title,steps,audience,
  truthAnchors:result.experience.truthAnchors,
  sceneGraph:{...science.sceneGraph,nodes},
  initialStep:result.scene,renderer:"heart-semantic-svg",runtimeVersion:"heart-science/v1",
  sourceInput:result.sourceInput||"كيف يعمل القلب؟",
  engineMeta:{provider:"sourced-knowledge",domain:"heart",topic:result.topic,scene:result.scene},
  presentation:{...profile,profileId:profile.id,auto3d:"manual"},
  sources:science.scientificSources,
  verification:{...result.verification,sources:science.scientificSources,note:"Established physiology is source-supported; geometry and timing are illustrative, not clinical validation."}
 };
 const mapped={...result,experience,verification:experience.verification,
  visualPlan:{...result.visualPlan,focus:focuses[result.scene]||all,camera:"overview",operations:["FOCUS",...(result.scene===7||result.scene===8?[]:["FLOW","DIRECTION"]),"SEQUENCE"]}};
 return {...mapped,renderPlan:compileVisualPlan(mapped)};
}
