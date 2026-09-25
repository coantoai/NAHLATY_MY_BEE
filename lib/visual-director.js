const SUPPORTED = new Set([
  "FOCUS","ZOOM","CUTAWAY","ISOLATE","HIGHLIGHT","FLOW","DIRECTION",
  "SEQUENCE","TRACE","CONTEXT","COMPARE","SCALE","TRANSPARENCY"
]);

function cameraFrom(operations, cameraHint="overview") {
  const ops=new Set(operations);
  return {
    mode: ops.has("CUTAWAY") ? "cutaway" : ops.has("TRACE") ? "trace" : ops.has("FLOW") ? "tracking" : cameraHint,
    zoom: ops.has("ZOOM") ? 1.18 : ops.has("FOCUS") ? 1.08 : 1,
    transitionMs: ops.has("SEQUENCE") ? 700 : 480
  };
}

function motionFrom(operations, focus) {
  const steps=[];
  if(operations.includes("FOCUS")) steps.push({type:"focus",targets:focus,durationMs:650});
  if(operations.includes("CUTAWAY")) steps.push({type:"cutaway",targets:focus,durationMs:800});
  if(operations.includes("ISOLATE")) steps.push({type:"isolate",targets:focus,durationMs:650});
  if(operations.includes("HIGHLIGHT")) steps.push({type:"highlight",targets:focus,durationMs:900});
  if(operations.includes("FLOW")) steps.push({type:"flow",targets:focus,durationMs:1800,loop:true});
  if(operations.includes("DIRECTION")) steps.push({type:"direction",targets:focus,durationMs:1200});
  if(operations.includes("TRACE")) steps.push({type:"trace",targets:focus,durationMs:1600});
  if(operations.includes("SEQUENCE")) steps.push({type:"sequence",targets:focus,durationMs:2200});
  if(operations.includes("TRANSPARENCY")) steps.push({type:"transparency",targets:focus,durationMs:700});
  return steps;
}

export function compileVisualPlan(engineResult) {
  const visual=engineResult?.visualPlan||{};
  const operations=(Array.isArray(visual.operations)?visual.operations:[])
    .filter(x=>SUPPORTED.has(x))
    .slice(0,7);
  const focus=(Array.isArray(visual.focus)?visual.focus:[]).map(String).slice(0,8);
  const sceneId=engineResult?.domain==="heart" && engineResult?.topic
    ? `heart:${engineResult.topic}`
    : `dynamic:${engineResult?.domain||"general"}:${engineResult?.topic||"unknown"}`;

  return {
    version:"visual-director-v1",
    sceneId,
    renderer:engineResult?.domain==="heart" ? "heart-semantic-svg" : "dynamic-semantic",
    target:String(visual.target||"فهم الفكرة"),
    focus,
    operations,
    camera:cameraFrom(operations,String(visual.camera||"overview")),
    layers:{
      context:operations.includes("CONTEXT"),
      cutaway:operations.includes("CUTAWAY"),
      transparent:operations.includes("TRANSPARENCY"),
      isolate:operations.includes("ISOLATE")
    },
    motion:motionFrom(operations,focus),
    interactions:["focus","zoom","reset","ask-follow-up"],
    guardrails:{
      animateMeaning:true,
      maxPrimaryMotions:1,
      preserveContext:true
    }
  };
}
