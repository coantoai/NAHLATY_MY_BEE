// Camera targets are attached to an actual image, never inferred from the
// wording of a stage. Unlocalized stages remain disabled in the image viewer.
export function acceptedStageFocus(regions,steps){
 if(!Array.isArray(regions)||!Array.isArray(steps))return [];
 const seen=new Set();
 return regions.flatMap(region=>{
  const index=region?.index,x=region?.x,y=region?.y;
  if(!Number.isInteger(index)||index<0||index>=steps.length||seen.has(index)||region?.visible!==true||
     !Number.isFinite(x)||!Number.isFinite(y)||x<0||x>1||y<0||y>1)return [];
  seen.add(index);
  const effect=['updraft','cooling','droplets','tower'].includes(region.effect)?region.effect:undefined;
  const source=['verified-image-asset','designed-layer','visual-review','image-locator','user-selected'].includes(region.source)?region.source:undefined;
  return [{index,x,y,visible:true,...(effect?{effect}:{}),...(source?{source}:{})}];
 });
}

export function normalizeTextContent(content){
 if(typeof content==="string")return content;
 if(!Array.isArray(content))return "";
 return content.flatMap(part=>{
  if(typeof part==="string")return [part];
  if(typeof part?.text==="string")return [part.text];
  if(typeof part?.content==="string")return [part.content];
  return [];
 }).join("");
}

export function missingStageIndices(regions,steps){
 const located=new Set(acceptedStageFocus(regions,steps).map(region=>region.index));
 return steps.map((_,index)=>index).filter(index=>!located.has(index));
}

export function mergeStageFocus(primary,secondary,steps){
 const combined=[...acceptedStageFocus(primary,steps),...acceptedStageFocus(secondary,steps)];
 const seen=new Set();
 return combined.filter(region=>{
  if(seen.has(region.index))return false;
  seen.add(region.index);
  return true;
 });
}

export function stageFocusDiagnostics(regions,steps){
 const focus=acceptedStageFocus(regions,steps);
 const located=new Set(focus.map(region=>region.index));
 const missing=steps.map((_,index)=>index).filter(index=>!located.has(index));
 return {
  status:!steps.length?"no-stages":missing.length===0?"complete":focus.length?"partial":"no-targets",
  expected:steps.length,
  located:focus.length,
  missing
 };
}

export function resolveStageFocus(reviewed,located,steps){
 const regions=mergeStageFocus(reviewed,located,steps);
 return {regions,diagnostics:stageFocusDiagnostics(regions,steps)};
}

export function selectStagesForLocalization(steps,indices){
 const requested=Array.isArray(indices)?indices:steps.map((_,index)=>index);
 return requested.flatMap(index=>{
  const step=steps[index];
  return Number.isInteger(index)&&step? [{index,title:String(step.title||""),text:String(step.text||"")}]:[];
 });
}

export function imagePointAt(clientX,clientY,rect){
 const {left,top,width,height}=rect||{};
 if(![clientX,clientY,left,top,width,height].every(Number.isFinite)||width<=0||height<=0)return null;
 const x=(clientX-left)/width,y=(clientY-top)/height;
 if(x<0||x>1||y<0||y>1)return null;
 return {x,y};
}

export function cameraFrame(region,scale=1.7){
 if(!region)return {scale:1,tx:0,ty:0};
 const s=Math.max(1,Math.min(2.2,scale));
 return {scale:s,tx:Math.max(1-s,Math.min(0,.5-s*region.x)),ty:Math.max(1-s,Math.min(0,.5-s*region.y))};
}
