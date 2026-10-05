import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { validateProviderSvg } from "./recraftVector.js";
import { HEART_REQUIRED_CONCEPT_IDS, HEART_SCIENTIFIC_SOURCES } from "./heartSemanticVector.js";

export const NIAID_HEART_ASSET=Object.freeze({
 url:"https://bioart.niaid.nih.gov/api/bioarts/228/files/630873",
 page:"https://bioart.niaid.nih.gov/bioart/228",
 publicPath:"/heart-vector/niaid-heart.svg",
 license:"Public Domain",credit:"Courtesy of NIAID / Ryan Kissinger"
});

// These are the illustrator's visible groups, not inferred internal anatomy.
export const NIAID_VISIBLE_PARTS=Object.freeze([
 {conceptId:"heart.exterior",elementIds:["niaid-path-001", "niaid-path-002", "niaid-path-025", "niaid-path-026", "niaid-path-027", "niaid-path-028", "niaid-path-029", "niaid-path-030", "niaid-path-031", "niaid-path-032", "niaid-path-033", "niaid-path-034", "niaid-path-035", "niaid-path-036", "niaid-path-037", "niaid-path-038", "niaid-path-039", "niaid-path-040", "niaid-path-041", "niaid-path-042", "niaid-path-043", "niaid-path-044", "niaid-path-045"],label:"القلب — المنظر الخارجي",x:50,y:63,kind:"exterior"},
 {conceptId:"heart.upperVessels",elementId:"top_vessels",label:"الأوعية العلوية الظاهرة",x:52,y:18,kind:"vessel"},
 {conceptId:"heart.sideVessels",elementId:"left_vessels",label:"الأوعية الجانبية الظاهرة",x:32,y:42,kind:"vessel"},
 {conceptId:"heart.lowerVessels",elementId:"bottom_vessels",label:"الأوعية السفلية الظاهرة",x:25,y:86,kind:"vessel"}
]);

export function createNiaidHeartExperience(svg){
 return {
  title:"القلب العلمي — NIH / NIAID",summary:"منظر خارجي متجهي قابل للفحص. الحجرات والصمامات الداخلية غير ظاهرة في هذا الأصل؛ لا تُنسب إليها أجزاء بالتخمين.",visual:"concept",
  presentation:{profileId:"general",auto3d:"manual",labelMode:"always",challengeStyle:"direct",interactionStyle:"exploratory",paceSec:2.7},
  sceneGraph:{
   world:{dimension:"2d",theme:"biology",label:"Human Heart · NIAID"},
   nativeSvg:{svg,bindings:NIAID_VISIBLE_PARTS,source:NIAID_HEART_ASSET},
   nodes:NIAID_VISIBLE_PARTS.map(p=>({id:p.conceptId,label:p.label,x:p.x,y:p.y,type:"structure",visual:"generic",glyph:"◉",knowledge:"fact",detail:p.kind==="exterior"?"القلب من الخارج؛ هذا الأصل لا يعرض الحجرات أو الصمامات الداخلية.":"مجموعة أوعية ظاهرة في الرسم الأصلي. تسميتها هنا حسب موضعها، دون اعتماد هوية وعاء طبي بعينه."})),
   edges:[]
  },
  steps:NIAID_VISIBLE_PARTS.map(p=>({title:p.label,text:p.kind==="exterior"?"انقر على القلب أو على مجموعة أوعية لفحصها. التكبير والسحب يستخدمان تفاعل نحلتي الحالي.":"أوعية ظاهرة قابلة للاختيار والتحريك؛ هذه تسمية موضعية ولا تحدد هوية تشريحية غير متحققة.",motion:"reveal",runtime:{dimension:"2d",focusNodeIds:[p.conceptId],visibleNodeIds:NIAID_VISIBLE_PARTS.map(x=>x.conceptId),nodeActions:[]}})),
  scientificSources:HEART_SCIENTIFIC_SOURCES,
  semantic:{ready:false,coverage:"external-groups-only",boundConceptIds:NIAID_VISIBLE_PARTS.map(x=>x.conceptId),missingConceptIds:HEART_REQUIRED_CONCEPT_IDS,reason:"External illustration does not expose four chambers or four valves. No physiological blood-flow overlay is asserted."}
 };
}

export async function loadNiaidHeart(){
 const source=await readFile(join(process.cwd(),"public","heart-vector","niaid-heart.svg"),"utf8");
 const result=validateProviderSvg(source);
 const experience=createNiaidHeartExperience(result.svg);
 return {ok:true,provider:"niaid-bioart",output:"native-svg",svg:result.svg,
  metrics:{bytes:result.bytes,pathCount:result.pathCount,groupCount:result.groupCount},
  billing:{credits:0,model:"NIH BioArt editable SVG"},providerAsset:NIAID_HEART_ASSET,
  scientificSources:HEART_SCIENTIFIC_SOURCES,semantic:experience.semantic,experience};
}
