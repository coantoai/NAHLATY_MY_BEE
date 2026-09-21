const ACTIONS=new Set(["activate","fill","empty","heat","cool","grow","shrink","pulse","split","transform","dim","ignite","contract","expand","flow","spin","compress"]);
const CAMERA_MODES=new Set(["overview","focus","follow","inside","explode"]);
const EDGE_MOTIONS=new Set(["travel","connect","wave","accumulate"]);
const DEPTH_MODES=new Set(["inside","explode"]);

const VISUAL_ACTION={
 heart:"contract",
 lung:"expand",
 plant:"grow",
 fire:"ignite",
 volcano:"ignite",
 gear:"spin",
 water:"flow",
 stream:"flow",
 data:"flow",
 signal:"pulse",
 portal:"pulse"
};

const MOTION_ACTION={
 pulse:"pulse",
 orbit:"spin",
 grow:"grow",
 split:"split",
 compress:"compress",
 accumulate:"fill",
 burst:"expand",
 wave:"pulse"
};

const uniq=xs=>[...new Set((xs||[]).filter(Boolean))];

function validIds(values,set){
 return uniq(values).map(String).filter(id=>set.has(id));
}

function semanticAction(node,motion,isFlowSource=false){
 const byVisual=VISUAL_ACTION[String(node?.visual||"").toLowerCase()];
 if(byVisual) return byVisual;
 if(isFlowSource) return "flow";
 const byMotion=MOTION_ACTION[motion];
 if(byMotion) return byMotion;
 return "activate";
}

function hasDepthMeaning(node){
 return Boolean(node?.spatial||node?.inside?.length||node?.depthParts?.length);
}

function deriveEdgeIds(edges,edgeIds,focusIds,motion){
 const edgeSet=new Set(edges.map(e=>e.id));
 const explicit=validIds(edgeIds,edgeSet);
 if(explicit.length) return explicit;

 const focusSet=new Set(focusIds);
 const between=edges.filter(e=>focusSet.has(e.from)&&focusSet.has(e.to));
 if(between.length) return [between[0].id];

 if(EDGE_MOTIONS.has(motion)&&focusIds.length){
  const touching=edges.find(e=>focusSet.has(e.from)||focusSet.has(e.to));
  if(touching) return [touching.id];
 }
 return [];
}

export function compileVisualStep(result,step={},index=0,previousVisible=[]){
 const nodes=result?.sceneGraph?.nodes||[];
 const edges=result?.sceneGraph?.edges||[];
 const nodeSet=new Set(nodes.map(n=>n.id));
 const edgeSet=new Set(edges.map(e=>e.id));
 const byId=new Map(nodes.map(n=>[n.id,n]));
 const motion=String(step?.motion||"reveal");

 let focusIds=validIds(step?.focusNodeIds,nodeSet);
 let activeEdgeIds=deriveEdgeIds(edges,step?.activeEdgeIds,focusIds,motion);

 if(!focusIds.length&&activeEdgeIds.length){
  const e=edges.find(x=>x.id===activeEdgeIds[0]);
  focusIds=validIds([e?.from,e?.to],nodeSet);
 }
 if(!focusIds.length){
  const fallback=validIds(step?.visibleNodeIds,nodeSet)[0]||nodes[index%Math.max(1,nodes.length)]?.id;
  focusIds=validIds([fallback],nodeSet);
 }

 const activeEndpoints=activeEdgeIds.flatMap(id=>{
  const e=edges.find(x=>x.id===id);
  return e?[e.from,e.to]:[];
 });
 const explicitVisible=validIds(step?.visibleNodeIds,nodeSet);
 let visibleNodeIds=uniq([...previousVisible,...explicitVisible,...focusIds,...activeEndpoints]).filter(id=>nodeSet.has(id));
 if(!visibleNodeIds.length) visibleNodeIds=nodes.map(n=>n.id);

 const explicitActions=new Map();
 for(const a of Array.isArray(step?.nodeActions)?step.nodeActions:[]){
  const id=String(a?.id||"");
  const action=String(a?.action||"");
  if(nodeSet.has(id)&&ACTIONS.has(action)) explicitActions.set(id,action);
 }

 const flowSources=new Set(activeEdgeIds.map(id=>edges.find(e=>e.id===id)?.from).filter(Boolean));
 const nodeActions=[];
 for(const id of uniq([...focusIds,...flowSources,...explicitActions.keys()])){
  const node=byId.get(id);
  if(!node) continue;
  const action=explicitActions.get(id)||semanticAction(node,motion,flowSources.has(id)&&["travel","wave","connect"].includes(motion));
  nodeActions.push({id,action});
 }
 if(!nodeActions.length&&focusIds[0]) nodeActions.push({id:focusIds[0],action:"activate"});

 const requestedCamera=CAMERA_MODES.has(step?.camera?.mode)?step.camera.mode:"focus";
 let targetNodeId=nodeSet.has(String(step?.camera?.targetNodeId||""))?String(step.camera.targetNodeId):"";
 if(!targetNodeId&&requestedCamera==="follow"&&activeEdgeIds.length){
  const edge=edges.find(e=>e.id===activeEdgeIds[0]);
  targetNodeId=edge?.to||edge?.from||"";
 }
 if(!targetNodeId) targetNodeId=focusIds[0]||"";

 let cameraMode=requestedCamera;
 const corrections=[];
 if(cameraMode==="follow"&&!activeEdgeIds.length){
  cameraMode="focus";
  corrections.push("follow-without-edge");
 }
 if(DEPTH_MODES.has(cameraMode)&&!hasDepthMeaning(byId.get(targetNodeId))){
  cameraMode="focus";
  corrections.push("depth-without-spatial-meaning");
 }

 const distance=Math.max(35,Math.min(150,Number(step?.camera?.distance)||72));
 const worldDimension=["2d","3d","hybrid"].includes(result?.sceneGraph?.world?.dimension)?result.sceneGraph.world.dimension:"2d";
 const needsDepth=DEPTH_MODES.has(cameraMode)||focusIds.some(id=>hasDepthMeaning(byId.get(id)));
 const dimension=worldDimension==="3d"?"3d":worldDimension==="hybrid"&&needsDepth?"3d":"2d";

 return {
  version:"visual-scene/v1",
  index,
  focusNodeIds:focusIds,
  activeEdgeIds:validIds(activeEdgeIds,edgeSet),
  visibleNodeIds,
  nodeActions,
  camera:{mode:cameraMode,targetNodeId,distance},
  dimension,
  intent:{
   motion,
   relationDriven:activeEdgeIds.length>0,
   spatial:needsDepth
  },
  corrections
 };
}

export function compileVisualSceneResult(result){
 if(!result||!Array.isArray(result?.steps)) return result;
 let previousVisible=[];
 const steps=result.steps.map((step,index)=>{
  const runtime=compileVisualStep(result,step,index,previousVisible);
  previousVisible=runtime.visibleNodeIds;
  return {...step,runtime};
 });
 return {...result,runtimeVersion:"visual-scene/v1",steps};
}
