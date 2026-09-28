// The camera may only move to a region that was located in the actual image.
export function acceptedStageFocus(regions,steps){
 if(!Array.isArray(regions)||!Array.isArray(steps))return [];
 const seen=new Set();
 return regions.flatMap(region=>{
  const index=region?.index;
  const x=region?.x,y=region?.y;
  if(!Number.isInteger(index)||index<0||index>=steps.length||seen.has(index)||region?.visible!==true||
     !Number.isFinite(x)||!Number.isFinite(y)||x<.08||x>.92||y<.08||y>.92)return [];
  seen.add(index);
  return [{index,x,y}];
 });
}
