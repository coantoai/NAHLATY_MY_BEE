export function analyzeMentalModel(edges=[],attempts=[]){
 const expectedBase=edges.filter(e=>e.causal||["cause","transform","flow"].includes(e.relation||""));
 const expected=(expectedBase.length?expectedBase:edges).slice(0,8);
 const correctIds=new Set(attempts.filter(x=>x.ok&&x.edgeId).map(x=>x.edgeId));
 const missing=expected.filter(e=>!correctIds.has(e.id));
 const wrong=attempts.filter(x=>!x.ok);
 let repair=null;
 if(wrong.length){
  const mistaken=wrong[wrong.length-1];
  const anchor=missing.find(e=>e.from===mistaken.from)
   ||expected.find(e=>e.from===mistaken.from)
   ||missing.find(e=>e.to===mistaken.to)
   ||missing[0]
   ||null;
  repair={
   kind:"invented",
   from:mistaken.from,
   to:mistaken.to,
   nodeId:mistaken.from,
   expectedEdgeId:anchor?.id||null,
   expectedTo:anchor?.to||null
  };
 }else if(missing.length){
  const edge=missing[0];
  repair={
   kind:"missing",
   from:edge.from,
   to:edge.to,
   nodeId:edge.from,
   expectedEdgeId:edge.id,
   expectedTo:edge.to
  };
 }
 return {expected,correctIds,missing,wrong,repair};
}


export function deriveRememberedModelRepair(edges=[],relationStates={}){
 const edge=edges.find(e=>relationStates?.[e.id]==="uncertain");
 if(!edge)return null;
 return {
  kind:"missing",
  from:edge.from,
  to:edge.to,
  nodeId:edge.from,
  expectedEdgeId:edge.id,
  expectedTo:edge.to,
  source:"memory"
 };
}
