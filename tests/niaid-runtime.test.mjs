import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadNiaidHeart,NIAID_VISIBLE_PARTS} from '../app/lib/niaidHeartAsset.js';
import {validateProviderSvg} from '../app/lib/recraftVector.js';

test('bundled zero-login heart loads as a safe runtime scene and fails closed on internal anatomy',async()=>{
 const result=await loadNiaidHeart();
 assert.equal(result.ok,true);
 assert.equal(result.billing.credits,0);
 assert.equal(result.semantic.ready,false);
 assert.equal(result.semantic.missingConceptIds.length,13);
 assert.equal(result.experience.sceneGraph.nodes.length,4);
 assert.equal(result.experience.sceneGraph.edges.length,0);
 assert.equal(validateProviderSvg(result.svg).pathCount,result.metrics.pathCount);
 const ids=[...result.svg.matchAll(/\sid="([^" ]+)"/g)].map(x=>x[1]);
 const elements=NIAID_VISIBLE_PARTS.flatMap(p=>p.elementIds||[p.elementId]);
 assert.equal(new Set(elements).size,elements.length);
 for(const id of elements)assert.equal(ids.filter(x=>x===id).length,1,id);
 for(const p of NIAID_VISIBLE_PARTS){
  assert.ok(result.experience.sceneGraph.nodes.some(n=>n.id===p.conceptId));
  assert.ok(result.experience.steps.some(s=>s.runtime.focusNodeIds.includes(p.conceptId)));
 }
});

test('external body bindings never include an ancestor of the vessel bindings',()=>{
 const svg=readFileSync(new URL('../public/heart-vector/niaid-heart.svg',import.meta.url),'utf8');
 const body=NIAID_VISIBLE_PARTS.find(p=>p.conceptId==='heart.exterior');
 for(const id of body.elementIds){
  assert.match(svg,new RegExp('<path[^>]*id="'+id+'"'));
 }
 assert.equal(body.elementIds.length,23);
});
