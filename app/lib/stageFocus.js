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
  const source=['verified-image-asset','designed-layer'].includes(region.source)?region.source:undefined;
  return [{index,x,y,...(effect?{effect}:{}),...(source?{source}:{})}];
 });
}

export function cameraFrame(region,scale=1.7){
 if(!region)return {scale:1,tx:0,ty:0};
 const s=Math.max(1,Math.min(2.2,scale));
 return {scale:s,tx:Math.max(1-s,Math.min(0,.5-s*region.x)),ty:Math.max(1-s,Math.min(0,.5-s*region.y))};
}
