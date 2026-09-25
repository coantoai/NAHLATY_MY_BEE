import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

async function importSource(relativePath){
 const url=new URL(relativePath,import.meta.url);
 const source=readFileSync(url,"utf8");
 const data="data:text/javascript;base64,"+Buffer.from(source).toString("base64");
 return import(data);
}

const {curatedKnowledgeResult}=await importSource("../lib/knowledge-packs.js");

const cases=[
 ["كيف تنمو النباتات؟","plant-growth"],
 ["كيف تعمل الخلية الشمسية؟","solar-cell"],
 ["كيف يلقح النحل الأزهار؟","bee-pollination"],
 ["كيف يعمل محرك الاحتراق الداخلي؟","combustion-engine"]
];

test("all sourced packs satisfy knowledge and graph integrity contracts",()=>{
 for(const [question,topic] of cases){
  const r=curatedKnowledgeResult(question);
  assert.equal(r.topic,topic);
  assert.equal(r.verification.status,"source-grounded");
  assert.equal(r.needsVerification,false);
  assert.ok(r.experience.truthAnchors.length>=2);
  assert.ok(r.verification.sources.length>=1);

  for(const source of r.verification.sources){
   assert.ok(source.title.trim().length>3);
   assert.match(source.url,/^https:\/\//);
  }

  const nodes=r.experience.sceneGraph.nodes||[];
  const edges=r.experience.sceneGraph.edges||[];
  const nodeIds=nodes.map(n=>String(n.id));
  const edgeIds=edges.map(e=>String(e.id));
  assert.equal(new Set(nodeIds).size,nodeIds.length);
  assert.equal(new Set(edgeIds).size,edgeIds.length);
  assert.ok(nodes.length>=4);
  assert.ok(edges.length>=1);

  const nodeSet=new Set(nodeIds);
  const edgeSet=new Set(edgeIds);
  for(const edge of edges){
   assert.ok(nodeSet.has(String(edge.from)));
   assert.ok(nodeSet.has(String(edge.to)));
  }
  for(const step of r.experience.steps||[]){
   for(const id of step.focusNodeIds||[]) assert.ok(nodeSet.has(String(id)));
   for(const id of step.activeEdgeIds||[]) assert.ok(edgeSet.has(String(id)));
  }
 }
});
