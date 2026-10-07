import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { HEART_REQUIRED_CONCEPT_IDS, HEART_SCENE_SPEC } from "../app/lib/heartSemanticVector.js";

const assetUrl=new URL("../public/heart-vector/heart-science.svg",import.meta.url);
const moduleUrl=new URL("../app/lib/heartScienceAsset.js",import.meta.url);
const bindings=[
 ["heart.venaCava","vena-cava"],["heart.rightAtrium","right-atrium"],
 ["heart.tricuspidValve","tricuspid-valve"],["heart.rightVentricle","right-ventricle"],
 ["heart.pulmonaryValve","pulmonary-valve"],["heart.pulmonaryArtery","pulmonary-artery"],
 ["heart.pulmonaryVeins","pulmonary-veins"],["heart.leftAtrium","left-atrium"],
 ["heart.mitralValve","mitral-valve"],["heart.leftVentricle","left-ventricle"],
 ["heart.aorticValve","aortic-valve"],["heart.aorta","aorta"],["heart.myocardium","myocardium"]
];
const requiredGroups=["heart-root","chambers","valves","back-heart","blood-interior","front-occlusion","oxygenated-flow","deoxygenated-flow"];

function source(){
 assert.equal(existsSync(assetUrl),true,"Science-lock cutaway asset must exist at public/heart-vector/heart-science.svg");
 return readFileSync(assetUrl,"utf8");
}

async function assetModule(){
 assert.equal(existsSync(moduleUrl),true,"Science-lock loader must exist at app/lib/heartScienceAsset.js");
 const module=await import(moduleUrl.href);
 assert.equal(typeof module.loadScienceHeart,"function","Science-lock loader must export loadScienceHeart");
 return module;
}

// The independent XML parser verifies the asset is well-formed rather than
// duplicating the production validator's string checks.
function xml(svg){
 const script=`import json,sys,xml.etree.ElementTree as E
root=E.fromstring(sys.stdin.read())
nodes=[]
def visit(e,ancestors):
 nodes.append({'tag':e.tag.split('}')[-1],'attrs':e.attrib,'ancestors':ancestors})
 for child in e: visit(child,ancestors+[e.attrib.get('id','')])
visit(root,[])
print(json.dumps(nodes))`;
 const result=spawnSync("python3",["-c",script],{input:svg,encoding:"utf8"});
 assert.equal(result.status,0,"Science SVG must be well-formed XML: "+result.stderr);
 return JSON.parse(result.stdout);
}

test("science cutaway contains all required anatomy and depth groups in valid SVG",()=>{
 const nodes=xml(source());
 assert.equal(nodes[0].tag,"svg");
 const byId=new Map(nodes.filter(n=>n.attrs.id).map(n=>[n.attrs.id,n]));
 assert.equal(byId.get("heart-root")?.tag,"svg","Semantic root must be the native SVG root");
 for(const id of [...requiredGroups.filter(id=>id!=="heart-root"),...bindings.map(([,id])=>id)]){
  assert.equal(byId.get(id)?.tag,"g","Missing semantic or depth group: "+id);
 }
 assert.equal(new Set(nodes.filter(n=>n.attrs.id).map(n=>n.attrs.id)).size,nodes.filter(n=>n.attrs.id).length,"SVG IDs must be unique");
 assert.ok(nodes.filter(n=>n.tag==="path").length>=20,"Cutaway must contain distinct native vector geometry");
 for(const [,id] of bindings){
  assert.ok(nodes.some(n=>n.ancestors.includes(id)&&["path","ellipse","circle","polygon","polyline","rect","line"].includes(n.tag)),"Anatomy group requires geometry: "+id);
 }
});

test("superior and inferior vena cava are distinct children of the one vena-cava concept",()=>{
 const nodes=xml(source());
 for(const id of ["superior-vena-cava","inferior-vena-cava"]){
  const part=nodes.find(n=>n.attrs.id===id);
  assert.ok(part,"Missing vena cava subpart: "+id);
  assert.ok(part.ancestors.includes("vena-cava"),id+" must belong to the vena-cava group");
 }
});

test("science SVG has no raster, executable markup, or external resource references",()=>{
 const svg=source();
 const nodes=xml(svg);
 assert.ok(nodes.every(n=>!["image","script","foreignObject","iframe","object","embed","animate","animateMotion","animateTransform","set"].includes(n.tag)));
 assert.doesNotMatch(svg,/\son[a-z]+\s*=|<!DOCTYPE|<!ENTITY|@import|(?:javascript|vbscript|data):/i);
 for(const node of nodes)for(const [name,value] of Object.entries(node.attrs)){
  if(name==="href"||name.endsWith("}href"))assert.match(value,/^#[A-Za-z_][\w:.-]*$/,"Only local fragment references are allowed");
 }
});

test("all SVG fragment references resolve and depth layers paint blood behind the front wall",()=>{
 const svg=source(),nodes=xml(svg);
 const ids=new Set(nodes.map(n=>n.attrs.id).filter(Boolean));
 const refs=[...svg.matchAll(/url\(\s*["']?#([A-Za-z_][\w:.-]*)["']?\s*\)/g)].map(m=>m[1]);
 for(const node of nodes)for(const [name,value] of Object.entries(node.attrs))if((name==="href"||name.endsWith("}href"))&&value.startsWith("#"))refs.push(value.slice(1));
 assert.ok(refs.length>0,"Blood/lumen clipping must use real SVG references");
 for(const id of refs)assert.ok(ids.has(id),"Dangling SVG reference: "+id);
 const index=id=>nodes.findIndex(n=>n.attrs.id===id);
 assert.ok(index("back-heart")<index("blood-interior"),"Back anatomy must paint before the blood");
 assert.ok(index("blood-interior")<index("front-occlusion"),"Blood must paint before the front wall");
});

test("blood paths follow canonical circulation edges and are clipped inside vessel or chamber lumens",()=>{
 const svg=source(),nodes=xml(svg);
 const paths=nodes.filter(n=>n.tag==="path"&&n.attrs["data-from"]);
 assert.ok(paths.length>0,"Cutaway needs directed, semantic blood paths");
 const expected=new Map(HEART_SCENE_SPEC.relations.map(e=>[e.from+"→"+e.to,e]));
 const seen=new Set();
 for(const path of paths){
  const {"data-from":from,"data-to":to,"data-oxygenation":oxygenation,d}=path.attrs;
  const key=from+"→"+to,edge=expected.get(key);
  assert.ok(edge,"Noncanonical or reversed flow edge: "+key);
  assert.equal(oxygenation,edge.oxygenation,"Incorrect pulmonary/systemic oxygenation: "+key);
  const flowGroup=oxygenation==="oxygenated"?"oxygenated-flow":"deoxygenated-flow";
  assert.ok(path.ancestors.includes(flowGroup),"Flow must belong to its oxygenation group: "+key);
  assert.ok(path.ancestors.includes("blood-interior"),"Flow must paint inside the heart: "+key);
  const ancestry=[path,...path.ancestors.map(id=>nodes.find(n=>n.attrs.id===id)).filter(Boolean)];
  const clips=ancestry.flatMap(n=>[n.attrs["clip-path"]||"",n.attrs.style||""]).filter(v=>/url\(\s*["']?#/.test(v));
  assert.ok(clips.length>0,"Unclipped blood path: "+key);
  assert.match(d||"",/^\s*[Mm]\s*[-+\d.]/,"Directed blood flow requires explicit path geometry: "+key);
  assert.match(d||"",/[LlCcQqSsTtHhVvAa]/,"Blood path must travel beyond its start: "+key);
  seen.add(key);
 }
 for(const edge of HEART_SCENE_SPEC.relations)assert.ok(seen.has(edge.from+"→"+edge.to),"Missing canonical flow edge: "+edge.from+"→"+edge.to);
});

test("science loader exposes complete semantic coverage using the existing concept IDs",async()=>{
 const {loadScienceHeart}=await assetModule();
 const result=await loadScienceHeart();
 assert.equal(result.ok,true);
 assert.equal(result.semantic?.ready,true);
 assert.deepEqual([...result.semantic.boundConceptIds].sort(),[...HEART_REQUIRED_CONCEPT_IDS].sort());
 assert.deepEqual(result.semantic.missingConceptIds,[]);
 assert.ok(result.metrics.bytes>1000);
 assert.equal(result.metrics.pathCount,xml(result.svg).filter(n=>n.tag==="path").length);
 const runtimeBindings=result.experience.sceneGraph.nativeSvg.bindings;
 assert.deepEqual(runtimeBindings.map(b=>b.conceptId),bindings.map(([conceptId])=>conceptId));
 const idsFor=b=>b.elementIds||[b.elementId];
 for(const [conceptId,elementId] of bindings){
  assert.ok(idsFor(runtimeBindings.find(b=>b.conceptId===conceptId)).includes(elementId),"Runtime must bind the actual anatomy group: "+elementId);
 }
 const runtimeIds=runtimeBindings.flatMap(idsFor);
 assert.equal(new Set(runtimeIds).size,runtimeIds.length,"Runtime geometry bindings must be distinct");
 for(const [conceptId,elementId] of bindings){
  const node=xml(result.svg).find(n=>n.attrs.id===elementId);
  assert.equal(node.attrs["data-concept-id"],conceptId);
 }
});

// Runtime node construction must not replace the concept's supporting reference
// with a single default anatomy URL, including for external circulation context.
test("science runtime retains the supporting sources for each displayed concept",async()=>{
 const {loadScienceHeart}=await assetModule();
 const {experience}=await loadScienceHeart();
 for(const concept of HEART_SCENE_SPEC.concepts){
  const node=experience.sceneGraph.nodes.find(x=>x.id===concept.conceptId);
  const anatomy=concept.kind==="chamber"||concept.conceptId==="heart.myocardium";
  const sourceId=anatomy?"nhlbi-anatomy":"nhlbi-blood-flow";
  assert.deepEqual(node.sourceIds,[sourceId],concept.conceptId);
  assert.equal(node.sourceRef,experience.scientificSources.find(x=>x.id===sourceId).url,concept.conceptId);
  assert.equal(node.labelEn,concept.label.en);
 }
 assert.match(experience.steps.map(x=>x.text).join(" "),/فرق الضغط/);
 assert.match(experience.sceneGraph.nodes.find(x=>x.id==="heart.mitralValve").detail,/الحبال الوترية.*العضلات الحليمية/);
});

test("science experience retains canonical facts, authoritative sources, and illustrative geometry/timing",async()=>{
 const {loadScienceHeart}=await assetModule();
 const {experience}=await loadScienceHeart();
 const trustedSource=url=>/^https:\/\/www\.nhlbi\.nih\.gov\/health\/heart\//.test(url)||
  /^https:\/\/github\.com\/openstax\/osbooks-anatomy-physiology\/blob\/[a-f0-9]{40}\/modules\/m\d+\/index\.cnxml$/.test(url)||
  /^https:\/\/raw\.githubusercontent\.com\/openstax\/osbooks-anatomy-physiology\/[a-f0-9]{40}\/modules\/m\d+\/index\.cnxml$/.test(url);
 assert.ok(experience.scientificSources.every(s=>trustedSource(s.url)),"Sources must be authoritative NHLBI pages or pinned official OpenStax publisher modules");
 for(const url of ["https://www.nhlbi.nih.gov/health/heart/anatomy","https://www.nhlbi.nih.gov/health/heart/blood-flow"]){
  assert.ok(experience.scientificSources.some(s=>s.url===url),"Required NHLBI anatomy and circulation evidence: "+url);
 }
 assert.deepEqual(experience.sceneGraph.edges.map(({from,to})=>[from,to]),HEART_SCENE_SPEC.relations.map(({from,to})=>[from,to]));
 assert.ok(experience.steps.length>=4,"Runtime must explain filling/ejection and the circulation route");
 for(const id of HEART_REQUIRED_CONCEPT_IDS)assert.ok(experience.sceneGraph.nodes.some(n=>n.id===id),"Missing runtime anatomy: "+id);
 assert.match(JSON.stringify(experience),/inference|توضيحي|تقريبي|illustrative/);
});

test("science validator rejects malformed markup, missing anatomy, duplicate IDs, and dangling clips",async()=>{
 const {validateScienceHeartSvg}=await assetModule();
 assert.equal(typeof validateScienceHeartSvg,"function","Science loader must expose its fail-closed validator for reusable asset review");
 const svg=source();
 assert.doesNotThrow(()=>validateScienceHeartSvg(svg));
 const corruptions=[
  ["unclosed SVG",svg.replace(/<\/svg>\s*$/,""),/malformed|invalid|well.formed|closed|markup|xml/i],
  ["mismatched group",svg.replace(/<\/g>/,"</path>"),/malformed|invalid|well.formed|markup|xml|mismatch/i],
  ["invalid XML entity",svg.replace(/<svg\b/,'<svg data-review="&unresolved;"'),/malformed|invalid|entity|xml/i],
  ["literal opening bracket in XML attribute",svg.replace(/<svg\b/,'<svg data-review="<unreviewed"'),/malformed|invalid|attribute|xml/i],
  ["invalid numeric XML character",svg.replace(/<svg\b/,'<svg data-review="&#0;"'),/malformed|invalid|character|xml/i],
  ["missing right atrium",svg.replace(/id=["']right-atrium["']/, 'id="unreviewed-atrium"'),/missing|anatomy|right-atrium|binding|not found/i],
  ["duplicate anatomy ID",svg.replace(/<\/svg>\s*$/, '<g id="right-atrium"><path d="M0 0L1 1"/></g></svg>'),/duplicate|unique/i],
  ["dangling lumen clip",svg.replace(/clip-path\s*=\s*["']url\(#[^)]+\)["']/, 'clip-path="url(#missing-lumen)"'),/reference|clip|missing-lumen|unresolved|not found/i],
  ["unclipped blood",svg.replace(/\sclip-path\s*=\s*["'][^"']*["']/g,""),/clip|lumen|blood/i]
 ];
 for(const [name,corrupt,message] of corruptions){
  assert.notEqual(corrupt,svg,"Mutation did not exercise "+name);
  assert.throws(()=>validateScienceHeartSvg(corrupt),message,name+" must fail closed");
 }
});

test("science validator rejects untrusted SVG and incorrect blood layer ordering",async()=>{
 const {validateScienceHeartSvg}=await assetModule();
 assert.equal(typeof validateScienceHeartSvg,"function");
 const svg=source();
 for(const payload of ['<image href="https://example.com/raster.png"/>','<script>alert(1)</script>','<path onload="alert(1)" d="M0 0L1 1"/>','<use href="https://example.com/heart.svg#x"/>']){
  assert.throws(()=>validateScienceHeartSvg(svg.replace(/<\/svg>\s*$/,payload+"</svg>")),/unsafe|reject|external|raster|script/i);
 }
 const reordered=svg.replace(/id=["']back-heart["']/,'id="temporary-depth"').replace(/id=["']front-occlusion["']/,'id="back-heart"').replace('id="temporary-depth"','id="front-occlusion"');
 assert.throws(()=>validateScienceHeartSvg(reordered),/layer|order|depth|occlusion/i,"Blood depth order must fail closed");
});

test("science validator rejects reversed flow semantics and oxygenation mistakes",async()=>{
 const {validateScienceHeartSvg}=await assetModule();
 assert.equal(typeof validateScienceHeartSvg,"function");
 const svg=source();
 const wrongSource=svg.replace(/data-from=["']heart\.pulmonaryVeins["']/, 'data-from="heart.pulmonaryArtery"');
 assert.notEqual(wrongSource,svg);
 assert.throws(()=>validateScienceHeartSvg(wrongSource),/flow|relation|edge|route|canonical/i);
 const wrongOxygen=svg.replace(/(<path\b[^>]*data-from=["']heart\.pulmonaryArtery["'][^>]*data-oxygenation=["'])deoxygenated(["'])/,"$1oxygenated$2");
 if(wrongOxygen!==svg)assert.throws(()=>validateScienceHeartSvg(wrongOxygen),/oxygen|flow|canonical/i);
 else {
  const veinOxygen=svg.replace(/(<path\b[^>]*data-from=["']heart\.pulmonaryVeins["'][^>]*data-oxygenation=["'])oxygenated(["'])/,"$1deoxygenated$2");
  assert.notEqual(veinOxygen,svg,"Oxygenation mutation requires a canonical pulmonary flow path");
  assert.throws(()=>validateScienceHeartSvg(veinOxygen),/oxygen|flow|canonical/i);
 }
});

test("science validator rejects reversed blood path geometry while preserving canonical semantics",async()=>{
 const {validateScienceHeartSvg}=await assetModule();
 assert.equal(typeof validateScienceHeartSvg,"function");
 const svg=source();
 const route=xml(svg).find(n=>n.tag==="path"&&n.attrs["data-from"]==="heart.leftAtrium"&&n.attrs["data-to"]==="heart.mitralValve");
 assert.ok(route,"Left atrium to mitral valve must have a directed blood path");
 const start=route.attrs["data-start"].split(/[ ,]+/).map(Number);
 const finish=route.attrs["data-end"].split(/[ ,]+/).map(Number);
 assert.notDeepEqual(start,finish,"Blood path start and end must differ");
 const pathTag=[...svg.matchAll(/<path\b[^>]*>/g)].map(m=>m[0]).find(tag=>/data-from=["']heart\.leftAtrium["']/.test(tag)&&/data-to=["']heart\.mitralValve["']/.test(tag));
 assert.ok(pathTag);
 const reversedTag=pathTag.replace(/\bd=["'][^"']*["']/,'d="M'+finish.join(" ")+" L"+start.join(" ")+'"');
 const reversed=svg.replace(pathTag,reversedTag);
 assert.notEqual(reversed,svg,"Direction mutation must alter path geometry");
 assert.throws(()=>validateScienceHeartSvg(reversed),/direction|anchor|flow/i,"Reversed geometry must fail despite unchanged canonical data-from/data-to and oxygenation");
});
