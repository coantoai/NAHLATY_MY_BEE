import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { validateProviderSvg } from "./recraftVector.js";
import { HEART_ANATOMY_BINDINGS, HEART_REQUIRED_CONCEPT_IDS, HEART_SCENE_SPEC, HEART_SCIENCE_LOCK, HEART_SCIENTIFIC_SOURCES } from "./heartSemanticVector.js";

// Parse the deliberately limited, safe SVG vocabulary we bundle. The independent
// test parser also checks the XML; this check fails closed before runtime insertion.
function svgElements(source){
 if(/&(?!(?:amp|lt|gt|apos|quot|#[0-9]+|#x[0-9A-Fa-f]+);)/.test(source)||/[\x00-\x08\x0B\x0C\x0E-\x1F\uFFFE\uFFFF]/.test(source))throw new Error("Malformed XML entity or character");
 for(const entity of source.matchAll(/&#(x[0-9A-Fa-f]+|[0-9]+);/g)){
  const code=entity[1].startsWith("x")?parseInt(entity[1].slice(1),16):Number(entity[1]);
  if(!(code===9||code===10||code===13||code>=32&&code<=0xD7FF||code>=0xE000&&code<=0xFFFD||code>=0x10000&&code<=0x10FFFF))throw new Error("Malformed XML character reference");
 }
 const elements=[],stack=[];
 const tokens=source.matchAll(/<!--[\s\S]*?-->|<\?xml[^>]*\?>|<(?:[^<>"']|"[^"]*"|'[^']*')+>/g);
 let end=0,roots=0;
 for(const token of tokens){
  if(source.slice(end,token.index).includes("<"))throw new Error("Malformed XML markup");
  end=token.index+token[0].length;
  const markup=token[0];
  if(markup.startsWith("<!--")||markup.startsWith("<?xml"))continue;
  const closing=markup.match(/^<\/([A-Za-z][\w:-]*)\s*>$/);
  if(closing){if(stack.pop()?.tag!==closing[1])throw new Error("Malformed XML: mismatched closing tag");continue;}
  const opening=markup.match(/^<([A-Za-z][\w:-]*)([\s\S]*?)(\/?)>$/);
  if(!opening)throw new Error("Malformed XML opening tag");
  const attrs={};let consumed=0;
  for(const attr of opening[2].matchAll(/\s+([A-Za-z_][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)){
   if(opening[2].slice(consumed,attr.index).trim())throw new Error("Malformed XML attributes");
   if(Object.hasOwn(attrs,attr[1]))throw new Error("Malformed XML: duplicate attribute");
   attrs[attr[1]]=attr[2]??attr[3];consumed=attr.index+attr[0].length;
   if(attrs[attr[1]].includes("<"))throw new Error("Malformed XML attribute value");
  }
  if(opening[2].slice(consumed).trim())throw new Error("Malformed XML attributes");
  const element={tag:opening[1],attrs,ancestors:[...stack]};
  if(!stack.length){if(++roots!==1||element.tag!=="svg")throw new Error("Malformed XML root");}
  elements.push(element);
  if(!opening[3])stack.push(element);
 }
 if(stack.length||roots!==1||source.slice(end).trim())throw new Error("Malformed XML: unclosed markup");
 return elements;
}

export function validateScienceHeartSvg(source){
 const checked=validateProviderSvg(source),elements=svgElements(checked.svg);
 const byId=new Map(elements.filter(e=>e.attrs.id).map(e=>[e.attrs.id,e]));
 if(byId.get("heart-root")?.tag!=="svg")throw new Error("Missing heart-root SVG anatomy");
 const required=["back-heart","blood-interior","front-occlusion","chambers","valves","oxygenated-flow","deoxygenated-flow"];
 for(const id of required)if(byId.get(id)?.tag!=="g")throw new Error("Missing anatomy/depth group: "+id);
 const geometry=new Set(["path","ellipse","circle","rect","polygon","polyline"]);
 for(const {conceptId,elementId} of HEART_ANATOMY_BINDINGS){
  const node=byId.get(elementId);
  if(node?.tag!=="g"||node.attrs["data-concept-id"]!==conceptId)throw new Error("Missing anatomy binding: "+elementId);
  if(!elements.some(e=>geometry.has(e.tag)&&e.ancestors.includes(node)))throw new Error("Missing anatomy geometry: "+elementId);
 }
 for(const id of ["superior-vena-cava","inferior-vena-cava"]){
  if(!byId.get(id)?.ancestors.includes(byId.get("vena-cava")))throw new Error("Missing vena-cava anatomy: "+id);
 }
 const depth=required.slice(0,3).map(id=>elements.indexOf(byId.get(id)));
 if(!(depth[0]<depth[1]&&depth[1]<depth[2]))throw new Error("Incorrect blood layer order / front occlusion");
 for(const reference of checked.svg.matchAll(/url\(\s*["']?#([\w:.-]+)["']?\s*\)/g)){
  if(!byId.has(reference[1]))throw new Error("Unresolved SVG reference: "+reference[1]);
 }
 for(const e of elements)for(const key of ["href","xlink:href"]){
  if(e.attrs[key]&&!byId.has(e.attrs[key].slice(1)))throw new Error("Unresolved SVG reference: "+e.attrs[key]);
 }
 const expected=new Map(HEART_SCENE_SPEC.relations.map(e=>[e.from+"→"+e.to,e])),seen=new Set();
 for(const e of elements.filter(e=>e.attrs["data-from"]||e.attrs["data-to"])){
  const key=e.attrs["data-from"]+"→"+e.attrs["data-to"],edge=expected.get(key);
  if(e.tag!=="path"||!edge)throw new Error("Noncanonical blood flow relation: "+key);
  if(e.attrs["data-oxygenation"]!==edge.oxygenation)throw new Error("Incorrect flow oxygenation: "+key);
  const oxygenGroup=edge.oxygenation==="oxygenated"?"oxygenated-flow":"deoxygenated-flow";
  if(!e.ancestors.includes(byId.get(oxygenGroup))||!e.ancestors.includes(byId.get("blood-interior")))throw new Error("Incorrect oxygenation flow layer: "+key);
  if(![e,...e.ancestors].some(n=>/url\(#heart-lumen\)/.test(n.attrs["clip-path"]||"")))throw new Error("Unclipped blood flow: "+key);
  if(!/^[Mm]\s*[-+\d.]/.test(e.attrs.d||""))throw new Error("Missing flow direction geometry: "+key);
  const coordinates=(e.attrs.d.match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi)||[]).map(Number);
  const start=(e.attrs["data-start"]||"").split(/[ ,]+/).map(Number),finish=(e.attrs["data-end"]||"").split(/[ ,]+/).map(Number);
  if(start.length!==2||finish.length!==2||[...start,...finish].some(n=>!Number.isFinite(n))||
    Math.abs(coordinates[0]-start[0])>.01||Math.abs(coordinates[1]-start[1])>.01||
    Math.abs(coordinates.at(-2)-finish[0])>.01||Math.abs(coordinates.at(-1)-finish[1])>.01)throw new Error("Incorrect flow direction anchors: "+key);
  seen.add(key);
 }
 if(byId.get("heart-lumen")?.tag!=="clipPath")throw new Error("Missing heart-lumen clip geometry");
 for(const key of expected.keys())if(!seen.has(key))throw new Error("Missing canonical blood flow: "+key);
 return {...checked,elements};
}

const labelPositions=[[12,18],[12,33],[12,48],[12,65],[37,18],[49,7],[88,20],[88,35],[88,49],[88,66],[68,19],[72,7],[52,89],[88,8],[12,87]];

export async function loadScienceHeart(){
 const source=await readFile(join(process.cwd(),"public","heart-vector","heart-science.svg"),"utf8");
 const {svg,pathCount,groupCount,bytes,elements}=validateScienceHeartSvg(source);
 const bindings=HEART_ANATOMY_BINDINGS.map(binding=>({...binding,elementIds:elements
  .filter(e=>e.tag==="g"&&e.attrs["data-concept-id"]===binding.conceptId)
  .map(e=>e.attrs.id).filter(Boolean)}));
 const nodes=HEART_SCENE_SPEC.concepts.map((concept,index)=>({
  id:concept.conceptId,label:concept.label.ar,labelEn:concept.label.en,x:labelPositions[index][0],y:labelPositions[index][1],
  type:"structure",visual:"generic",glyph:"◉",knowledge:concept.knowledge,
  sourceIds:[...concept.sourceIds],
  sourceRef:HEART_SCIENTIFIC_SOURCES.find(source=>source.id===concept.sourceIds[0]).url,
  detail:concept.label.en+" — بنية تعليمية؛ الرسم والمقياس تقريبيان."+(concept.kind==="valve"?
   " وريقات الصمام تستجيب لفرق الضغط؛ الحركة المرسومة تقريبية."+(["heart.tricuspidValve","heart.mitralValve"].includes(concept.conceptId)?
    " الحبال الوترية والعضلات الحليمية تمنع انقلاب الوريقات نحو الأذين؛ حُذفت من الرسم للتبسيط.":""):"")
 }));
 const allIds=nodes.map(n=>n.id);
 const sections=[
  ["تشريح القلب", "حجرات وصمامات مستقلة؛ يمين الجسم يظهر في يسار الرسم.",HEART_REQUIRED_CONCEPT_IDS],
  ["الامتلاء", "الدم الوريدي يعود إلى الأذين الأيمن؛ الأوردة الرئوية تعيد الدم المؤكسج إلى الأذين الأيسر.",["heart.venaCava","heart.rightAtrium","heart.pulmonaryVeins","heart.leftAtrium"]],
  ["الصمامات الأذينية البطينية", "فرق الضغط يفتح الصمامات ويغلقها؛ ثلاثي الشرفات والتاجي يسمحان بامتلاء البطينين أثناء الانبساط. معظم الامتلاء سلبي، ويضيف انقباض الأذينين الدم في نهايته.",["heart.tricuspidValve","heart.rightVentricle","heart.mitralValve","heart.leftVentricle"]],
  ["القذف إلى الرئتين والجسم", "البطينان يضخان في الدورة نفسها؛ ثلاثي الشرفات والتاجي مغلقان، والرئوي والأبهري مفتوحان أثناء القذف. الجذع الرئوي يتفرع نحو الرئتين؛ الأبهر يوصل الدم إلى الجسم.",["heart.pulmonaryValve","heart.pulmonaryArtery","heart.aorticValve","heart.aorta"]],
  ["عودة الدم المؤكسج", "من الرئتين عبر الأوردة الرئوية إلى الأذين الأيسر. اللون الأحمر والأزرق اصطلاح بصري.",["circulation.lungs","heart.pulmonaryVeins","heart.leftAtrium"]]
 ];
 const semantic={ready:true,coverage:"educational-cutaway",boundConceptIds:HEART_REQUIRED_CONCEPT_IDS,missingConceptIds:[],clinicalValidation:false,
  reason:"Canonical anatomy bindings and normal circulation verified; authored geometry and timing are illustrative, not clinically certified."};
 const experience={
  title:"القلب — التشريح ومسار الدم",summary:"مقطع تعليمي متجهي؛ تشريح ومسار الدم موثقان، والرسم وتوقيت الحركة تقريبيان.",visual:"concept",
  presentation:{profileId:"general",auto3d:"manual",labelMode:"always",challengeStyle:"direct",interactionStyle:"exploratory",paceSec:2.7},
  sceneGraph:{world:{dimension:"2d",theme:"biology",label:"Normal circulation · educational cutaway"},nodes,
   edges:HEART_SCENE_SPEC.relations.map(e=>({...e,label:e.oxygenation==="oxygenated"?"دم مؤكسج":"دم قليل الأكسجين",path:"curve",causal:false})),
   nativeSvg:{svg,bindings,scienceLock:true,source:{publicPath:"/heart-vector/heart-science.svg",kind:"original educational cutaway",referencePath:"/heart-vector/niaid-heart.svg"}}
  },
  steps:sections.map(([title,text,focus])=>({title,text,motion:"reveal",runtime:{dimension:"2d",focusNodeIds:focus,visibleNodeIds:allIds,nodeActions:[]}})),
  parameters:HEART_SCENE_SPEC.parameters,scientificSources:HEART_SCIENTIFIC_SOURCES,scienceLock:HEART_SCIENCE_LOCK,semantic
 };
 return {ok:true,provider:"nahlaty-science-cutaway",output:"native-svg",svg,metrics:{pathCount,groupCount,bytes},
  billing:{credits:0,model:"Original educational vector cutaway"},scientificSources:HEART_SCIENTIFIC_SOURCES,semantic,experience};
}
