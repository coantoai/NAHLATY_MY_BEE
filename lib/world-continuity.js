const identityText=value=>String(value||"").toLowerCase().replace(/[ًٌٍَُِّْـ]/g,"").replace(/\s+/g," ").trim();

export function reconcilePreservedWorld(result,preserve){
 const prevNodes=(Array.isArray(preserve?.sceneGraph?.nodes)?preserve.sceneGraph.nodes:[]).slice(0,10)
  .map(n=>({id:String(n?.id||"").slice(0,80),label:String(n?.label||"").slice(0,100)}))
  .filter(n=>n.id&&n.label);
 const anchors=(Array.isArray(preserve?.truthAnchors)?preserve.truthAnchors:[]).slice(0,6).map(x=>String(x||"").slice(0,220)).filter(Boolean);
 if(!prevNodes.length&&!anchors.length)return result;

 const nodes=(Array.isArray(result?.sceneGraph?.nodes)?result.sceneGraph.nodes:[]).map(n=>({...n}));
 const used=new Set();
 const remap=new Map();
 let preservedNodeIds=0;
 for(const node of nodes){
  const label=identityText(node?.label);
  if(!label)continue;
  const prev=prevNodes.find(p=>!used.has(p.id)&&identityText(p.label)===label);
  if(prev&&prev.id!==node.id){
   remap.set(String(node.id),prev.id);
   node.id=prev.id;
   used.add(prev.id);
   preservedNodeIds++;
  }else if(prev){
   used.add(prev.id);
   preservedNodeIds++;
  }
 }
 const mapId=id=>remap.get(String(id))||String(id||"");
 const edges=(result?.sceneGraph?.edges||[]).map(e=>({...e,id:String(e.id||""),from:mapId(e.from),to:mapId(e.to)}));
 const steps=(result?.steps||[]).map(s=>({
  ...s,
  focusNodeIds:(s.focusNodeIds||[]).map(mapId),
  visibleNodeIds:(s.visibleNodeIds||[]).map(mapId),
  nodeActions:(s.nodeActions||[]).map(a=>({...a,id:mapId(a.id)})),
  camera:{...(s.camera||{}),targetNodeId:mapId(s?.camera?.targetNodeId)},
  prediction:{...(s.prediction||{}),choiceNodeIds:(s?.prediction?.choiceNodeIds||[]).map(mapId),answerNodeId:mapId(s?.prediction?.answerNodeId)}
 }));
 const scales=(result?.sceneGraph?.scales||[]).map(s=>({...s,visibleNodeIds:(s.visibleNodeIds||[]).map(mapId),focusNodeIds:(s.focusNodeIds||[]).map(mapId)}));
 const perspectives=(result?.sceneGraph?.perspectives||[]).map(p=>({...p,focusNodeIds:(p.focusNodeIds||[]).map(mapId),backgroundNodeIds:(p.backgroundNodeIds||[]).map(mapId)}));
 const physics={...(result?.physics||{}),controlNodeIds:(result?.physics?.controlNodeIds||[]).map(mapId),rules:(result?.physics?.rules||[]).map(r=>({...r,from:mapId(r.from),to:mapId(r.to)}))};
 const simulation={...(result?.simulation||{}),affectedNodeIds:(result?.simulation?.affectedNodeIds||[]).map(mapId)};
 const misconception={...(result?.misconception||{}),nodeIds:(result?.misconception?.nodeIds||[]).map(mapId)};
 const challenge={...(result?.challenge||{}),choiceNodeIds:(result?.challenge?.choiceNodeIds||[]).map(mapId),answerNodeId:mapId(result?.challenge?.answerNodeId)};
 return {
  ...result,
  truthAnchors:anchors.length?anchors:result.truthAnchors,
  sceneGraph:{...(result.sceneGraph||{}),nodes,edges,scales,perspectives},
  steps,physics,simulation,misconception,challenge,
  continuity:{worldPreserved:prevNodes.length>0,preservedNodeIds,truthAnchorsPreserved:anchors.length}
 };
}
