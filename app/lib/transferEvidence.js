export function deriveTransferEdgeIds(edges=[],requestedIds=[],answerNodeId=""){
 const valid=new Set((edges||[]).map(e=>e?.id).filter(Boolean));
 const requested=(Array.isArray(requestedIds)?requestedIds:[]).map(String).filter(id=>valid.has(id)).slice(0,2);
 if(requested.length)return requested;
 const incident=(edges||[]).filter(e=>e?.from===answerNodeId||e?.to===answerNodeId);
 const causal=incident.filter(e=>e?.causal||["cause","transform","flow"].includes(e?.relation||""));
 const fallback=(causal.length?causal:incident).slice(0,1).map(e=>e.id).filter(Boolean);
 return fallback;
}
