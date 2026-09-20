export function updateRepresentationHistory(history={},nodeId,representation,outcome){
 if(!nodeId||!representation||!["strong","partial","needs_work"].includes(outcome))return history;
 const current=history?.[nodeId]?.[representation]||{};
 const item={
  attempts:Number(current.attempts||0)+1,
  successes:Number(current.successes||0)+(outcome==="strong"?1:0),
  difficulties:Number(current.difficulties||0)+(outcome==="strong"?0:1),
  lastOutcome:outcome
 };
 return {
  ...history,
  [nodeId]:{
   ...(history?.[nodeId]||{}),
   [representation]:item
  }
 };
}

export function mergeReframeAvoidance(sessionHistory={},representationHistory={}){
 const ids=new Set([...Object.keys(sessionHistory||{}),...Object.keys(representationHistory||{})]);
 const merged={};
 for(const id of ids){
  const session=Array.isArray(sessionHistory?.[id])?sessionHistory[id]:[];
  const remembered=Object.entries(representationHistory?.[id]||{})
   .filter(([,item])=>["partial","needs_work"].includes(item?.lastOutcome))
   .map(([representation])=>representation);
  merged[id]=[...new Set([...session,...remembered])];
 }
 return merged;
}
