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
  return [{index,x,y,...(['updraft','cooling','droplets','tower'].includes(region.effect)?{effect:region.effect}:{}),...(region.source==='cloud-lab-composition'?{source:region.source}:{})}];
 });
}

// A bounded lab composition for the cloud prototype. Never infer these positions
// for other subjects; model-localized regions take priority when available.
export function cloudLabFocus(steps,title){
 if(!/(?:سحب|سحابة|ركامي|cloud|cumulus)/i.test(String(title||''))||!Array.isArray(steps))return [];
 const anchors=[
  {pattern:/دافئ|رطب|صعود|يرتفع|warm|rise/i,x:.51,y:.84,effect:'updraft'},
  {pattern:/يبرد|برود|تبريد|cool/i,x:.50,y:.66,effect:'cooling'},
  {pattern:/تكثف|تكثّف|قطرات|condens/i,x:.50,y:.48,effect:'droplets'},
  {pattern:/سحابة|سحب|ركامي|cloud/i,x:.52,y:.30,effect:'tower'}
 ];
 const used=new Set();
 return steps.flatMap((step,index)=>{
  const label=String(step?.title||'');
  const anchor=anchors.find(a=>!used.has(a.effect)&&a.pattern.test(label));
  if(!anchor)return [];
  used.add(anchor.effect);
  return [{index,x:anchor.x,y:anchor.y,effect:anchor.effect,source:'cloud-lab-composition'}];
 });
}

export function sceneStageFocus(regions,steps,title){
 const located=acceptedStageFocus(regions,steps);
 return located.length?located:cloudLabFocus(steps,title);
}
