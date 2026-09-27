/**
 * Authored pollination motion fixture, shared by two independent rendering methods.
 * All coordinates are in a stable 1000 × 600 stage. No AI or paid calls.
 */
const PERIOD_MS = 14800;
const bound = n => Math.max(0, Math.min(1, Number(n)||0));
const mix = (a,b,t) => a+(b-a)*t;
const ease = t => t*t*(3-2*t);
function curve(a,b,c,d,t){
 const u=1-t;
 return {x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,
         y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y};
}
function tangent(a,b,c,d,t){
 const u=1-t;
 return {x:3*u*u*(b.x-a.x)+6*u*t*(c.x-b.x)+3*t*t*(d.x-c.x),
         y:3*u*u*(b.y-a.y)+6*u*t*(c.y-b.y)+3*t*t*(d.y-c.y)};
}
function linear(a,b,t){
 const s=ease(t);
 return {x:mix(a.x,b.x,s), y:mix(a.y,b.y,s)};
}
const inRange=(v,start,end)=>bound((v-start)/(end-start));
export function flightFrame(ms, blocked=false, anchors) {
 const a=anchors?.first||{x:263,y:314};
 const b=anchors?.second||{x:745,y:311};
 const start={x:Math.max(48,a.x-150),y:Math.max(95,a.y-130)};
 const duration=Math.max(1, PERIOD_MS);
 const p=((Number(ms)||0)%duration+duration)%duration/duration;
 let pos,heading,stage,carrying,transfer,phase;
 if(p<.19){
  const t=inRange(p,0,.19);
  pos=linear(start,a,t);
  heading=180+Math.atan2(a.y-start.y,a.x-start.x)*180/Math.PI;
  stage=0;phase="approach";carrying=false;transfer=false;
 }else if(p<.32){
  const t=inRange(p,.19,.32);
  pos={x:a.x+Math.sin(t*10)*2,y:a.y+Math.sin(t*Math.PI*2)*2};
  heading=205;stage=1;phase="collect";carrying=true;transfer=false;
 }else if(p<.60){
  const t=inRange(p,.32,.60);
  const rise=Math.max(58,Math.min(a.y,b.y)-155);
  const c1={x:mix(a.x,b.x,.27),y:rise};
  const c2={x:mix(a.x,b.x,.73),y:rise+5};
  pos=curve(a,c1,c2,b,ease(t));
  const d=tangent(a,c1,c2,b,ease(t));
  heading=180+Math.atan2(d.y,d.x)*180/Math.PI;
  stage=2;phase="travel";carrying=true;transfer=false;
 }else if(p<.73){
  const t=inRange(p,.60,.73);
  pos={x:b.x+Math.sin(t*9)*2,y:b.y+Math.sin(t*Math.PI*2)*1.5};
  heading=135;stage=3;phase="transfer";carrying=blocked;transfer=!blocked;
 }else if(p<.965){
  const t=inRange(p,.73,.965);
  const c1={x:Math.min(960,b.x+92),y:Math.max(38,b.y-210)};
  const c2={x:Math.max(50,a.x-115),y:Math.max(45,a.y-200)};
  pos=curve(b,c1,c2,start,ease(t));
  const d=tangent(b,c1,c2,start,ease(t));
  heading=180+Math.atan2(d.y,d.x)*180/Math.PI;
  stage=4;phase="return";carrying=blocked;transfer=!blocked;
 }else{
  pos=start;heading=180;stage=4;phase="reset";carrying=false;transfer=!blocked;
 }
 return {progress:p,periodMs:PERIOD_MS,stage,phase,x:pos.x,y:pos.y,heading,carrying,transfer};
}
export const flightDurationMs=PERIOD_MS;
