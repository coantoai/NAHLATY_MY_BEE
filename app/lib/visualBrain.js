const ACTIONS=new Set(["focus","zoom","pan","reveal","hide","isolate","setLayer","pulse","flow","cutaway","setParameter","sequence","restore"]);
const MAX_ACTIONS=12;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)));
const uniq=xs=>[...new Set((xs||[]).filter(Boolean).map(String))];
const cut=(v,n=600)=>String(v||"").slice(0,n);

function sceneIndex(sceneGraph={}){
 const nodes=Array.isArray(sceneGraph.nodes)?sceneGraph.nodes:[];
 const edges=Array.isArray(sceneGraph.edges)?sceneGraph.edges:[];
 return {
  nodeIds:new Set(nodes.map(n=>String(n.id)).filter(Boolean)),
  edgeIds:new Set(edges.map(e=>String(e.id)).filter(Boolean)),
  layerIds:new Set((sceneGraph.layers||[]).map(x=>String(x.id)).filter(Boolean)),
  parameterIds:new Set((sceneGraph.parameters||[]).map(x=>String(x.id)).filter(Boolean))
 };
}

function fail(code,message,actionIndex=-1){return {ok:false,code,message,actionIndex};}

export function validateVisualPlan(plan,sceneGraph={}){
 if(!plan||typeof plan!=="object")return fail("PLAN_INVALID","Visual plan must be an object");
 const index=sceneIndex(sceneGraph);
 const actions=Array.isArray(plan.actions)?plan.actions:[];
 if(!actions.length)return fail("PLAN_EMPTY","Visual plan has no actions");
 if(actions.length>MAX_ACTIONS)return fail("PLAN_TOO_LARGE",`Visual plan exceeds ${MAX_ACTIONS} actions`);

 for(let i=0;i<actions.length;i++){
  const a=actions[i]||{};
  if(!ACTIONS.has(String(a.type||"")))return fail("ACTION_NOT_ALLOWED",`Unsupported action: ${a.type||""}`,i);

  const nodeTargets=uniq(a.targetIds||a.nodeIds||(a.targetId?[a.targetId]:[]));
  const edgeTargets=uniq(a.edgeIds||(a.edgeId?[a.edgeId]:[]));
  if(nodeTargets.some(id=>!index.nodeIds.has(id)))return fail("UNKNOWN_NODE","Action targets an unknown node",i);
  if(edgeTargets.some(id=>!index.edgeIds.has(id)))return fail("UNKNOWN_EDGE","Action targets an unknown edge",i);

  if(["focus","reveal","hide","isolate","pulse","cutaway"].includes(a.type)&&!nodeTargets.length)
   return fail("TARGET_REQUIRED",`${a.type} requires a scene node target`,i);
  if(a.type==="flow"&&!edgeTargets.length)
   return fail("EDGE_REQUIRED","flow requires a real scene edge",i);
  if(a.type==="zoom"){
   const scale=Number(a.scale);
   if(!Number.isFinite(scale)||scale<0.6||scale>3)return fail("ZOOM_OUT_OF_RANGE","zoom scale must be between 0.6 and 3",i);
  }
  if(a.type==="pan"){
   const x=Number(a.x),y=Number(a.y);
   if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>100||Math.abs(y)>100)return fail("PAN_OUT_OF_RANGE","pan x/y must be within -100..100",i);
  }
  if(a.type==="setLayer"){
   const id=String(a.layerId||"");
   if(!id||!index.layerIds.has(id))return fail("UNKNOWN_LAYER","setLayer requires a known layerId",i);
   if(typeof a.visible!=="boolean")return fail("LAYER_VISIBILITY_REQUIRED","setLayer requires visible boolean",i);
  }
  if(a.type==="setParameter"){
   const id=String(a.parameterId||"");
   if(!id||!index.parameterIds.has(id))return fail("UNKNOWN_PARAMETER","setParameter requires a known parameterId",i);
   if(!Number.isFinite(Number(a.value)))return fail("PARAMETER_VALUE_REQUIRED","setParameter requires numeric value",i);
  }
  if(a.durationMs!=null){
   const d=Number(a.durationMs);
   if(!Number.isFinite(d)||d<80||d>12000)return fail("DURATION_OUT_OF_RANGE","durationMs must be 80..12000",i);
  }
 }
 return {ok:true,plan:{...plan,version:"visual-brain/v1",actions}};
}

export function sanitizeVisualPlan(plan,sceneGraph={}){
 const checked=validateVisualPlan(plan,sceneGraph);
 if(!checked.ok)return checked;
 const actions=checked.plan.actions.map(a=>{
  const out={type:String(a.type)};
  if(a.targetId)out.targetId=String(a.targetId);
  if(Array.isArray(a.targetIds))out.targetIds=uniq(a.targetIds);
  if(a.edgeId)out.edgeId=String(a.edgeId);
  if(Array.isArray(a.edgeIds))out.edgeIds=uniq(a.edgeIds);
  if(a.type==="zoom")out.scale=clamp(a.scale,.6,3);
  if(a.type==="pan"){out.x=clamp(a.x,-100,100);out.y=clamp(a.y,-100,100);}
  if(a.type==="setLayer"){out.layerId=String(a.layerId);out.visible=Boolean(a.visible);}
  if(a.type==="setParameter"){out.parameterId=String(a.parameterId);out.value=Number(a.value);}
  if(a.durationMs!=null)out.durationMs=clamp(a.durationMs,80,12000);
  if(a.reason)out.reason=cut(a.reason,220);
  return out;
 });
 return {ok:true,plan:{...checked.plan,actions}};
}

export function buildVisualBrainPrompt({question,sceneGraph,currentState={},locale="ar"}={}){
 const nodes=(sceneGraph?.nodes||[]).slice(0,80).map(n=>({id:String(n.id||""),label:cut(n.label,120),detail:cut(n.detail,240),knowledge:n.knowledge||"unknown",spatial:Boolean(n.spatial)}));
 const edges=(sceneGraph?.edges||[]).slice(0,120).map(e=>({id:String(e.id||""),from:String(e.from||""),to:String(e.to||""),label:cut(e.label,120),relation:e.relation||"connect",knowledge:e.knowledge||"unknown"}));
 const layers=(sceneGraph?.layers||[]).slice(0,30).map(x=>({id:String(x.id||""),label:cut(x.label,120)}));
 const parameters=(sceneGraph?.parameters||[]).slice(0,30).map(x=>({id:String(x.id||""),label:cut(x.label,120),min:x.min,max:x.max,value:x.value}));
 return `You are NAHLATY Visual Brain, a scene director. Your job is not to write an explanation; your job is to decide what the user should SEE next inside an existing interactive scene.

USER QUESTION:
${cut(question,1400)}

LOCALE: ${cut(locale,20)}
CURRENT STATE:
${JSON.stringify(currentState||{})}

AVAILABLE SCENE NODES:
${JSON.stringify(nodes)}

AVAILABLE EDGES:
${JSON.stringify(edges)}

AVAILABLE LAYERS:
${JSON.stringify(layers)}

AVAILABLE PARAMETERS:
${JSON.stringify(parameters)}

Return ONE JSON object only:
{
 "intent":"short semantic intent",
 "confidence":0.0,
 "answerMode":"visual-first",
 "actions":[
   {"type":"focus","targetIds":["existing-node-id"],"durationMs":500,"reason":"why this helps understanding"}
 ],
 "unknowns":[],
 "needsKnowledge":false,
 "needsStrongerModel":false
}

Allowed action types ONLY:
focus, zoom, pan, reveal, hide, isolate, setLayer, pulse, flow, cutaway, setParameter, sequence, restore.

Rules:
- Never invent a node, edge, layer, parameter, or anatomical/scientific relationship.
- Use only IDs supplied above.
- Prefer the smallest visual change that makes the meaning clearer.
- For a causal or directional relationship, use flow only on a supplied edge.
- Use cutaway only when the target node is spatial=true.
- Never use more than ${MAX_ACTIONS} actions.
- zoom.scale must be 0.6..3.
- pan x/y must be -100..100.
- durationMs must be 80..12000.
- If the scene lacks evidence needed to answer safely, set needsKnowledge=true and explain the missing fact in unknowns.
- If the task is genuinely too complex or ambiguous for a cheap model, set needsStrongerModel=true.
- Preserve continuity with CURRENT STATE; do not reset the world unless restore is explicitly necessary.
- The output is a control plan for a runtime, not prose for the user.`;
}

export function compileSafeFallback({question,sceneGraph,currentState={}}={}){
 const nodes=Array.isArray(sceneGraph?.nodes)?sceneGraph.nodes:[];
 const q=String(question||"").toLowerCase();
 const exact=nodes.find(n=>q.includes(String(n.label||"").toLowerCase())||q.includes(String(n.id||"").toLowerCase()));
 const target=exact||nodes.find(n=>currentState?.selectedNodeId===n.id)||nodes[0];
 if(!target)return {version:"visual-brain/v1",intent:"insufficient-scene",confidence:0,actions:[{type:"restore"}],unknowns:["scene has no addressable nodes"],needsKnowledge:true,needsStrongerModel:false};
 return {version:"visual-brain/v1",intent:"grounded-focus",confidence:exact?.id?0.72:0.35,actions:[{type:"focus",targetIds:[String(target.id)],durationMs:420,reason:"grounded fallback focuses an existing scene concept"}],unknowns:[],needsKnowledge:false,needsStrongerModel:!exact};
}
