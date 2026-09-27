"use client";
import {useEffect,useRef,useState} from "react";
import {flightDurationMs,flightFrame} from "../../lib/pollination-flight-v2.js";

/** Updates the SVG transform on requestAnimationFrame without rerendering the full scene. */
export function usePollinationFlight(anchors) {
 const spriteRef=useRef(null),pollenRef=useRef(null),glowRef=useRef(null);
 const elapsedRef=useRef(0),lastRef=useRef(null),anchorsRef=useRef(anchors),blockedRef=useRef(false),speedRef=useRef(1);
 const prevHeadingRef=useRef(null);
 const [playing,setPlaying]=useState(true),[blocked,updateBlocked]=useState(false);
 const [phase,setPhase]=useState(0),[carrying,setCarrying]=useState(false);
 const [transfer,setTransfer]=useState(false),[speed,setSpeed]=useState(1);
 const phaseRef=useRef(-1),carryRef=useRef(null),transferRef=useRef(null);
 anchorsRef.current=anchors;
 blockedRef.current=blocked;
 speedRef.current=speed;

 function seek(step) {
  const times=[.015,.23,.43,.635,.79];
  const value=Number.isInteger(step)?Math.max(0,Math.min(4,step)):0;
  elapsedRef.current=flightDurationMs*times[value];
  lastRef.current=null;
  phaseRef.current=-1;
 }
 function setBlocked(next) {
  updateBlocked(Boolean(next));
  if(next!==undefined) seek(3);
 }
 function reset() {updateBlocked(false);seek(0);setPlaying(true);}
 useEffect(()=>{
  let frame=0;
  function tick(now){
   const last=lastRef.current;
   if(last!==null&&playing)elapsedRef.current+=Math.min(100,now-last)*speedRef.current;
   lastRef.current=now;
   const f=flightFrame(elapsedRef.current,blockedRef.current,anchorsRef.current);
   // The bee is authored pointing left; tangent + 180 degrees faces the flight heading.
   let heading=f.heading;
   if(prevHeadingRef.current!==null){
    const prev=prevHeadingRef.current;
    const delta=(((heading-prev)%360)+540)%360-180;
    heading=prev+delta*(playing?.11:1);
   }
   prevHeadingRef.current=heading;
   spriteRef.current?.setAttribute("transform",
    "translate("+f.x.toFixed(2)+" "+f.y.toFixed(2)+") rotate("+heading.toFixed(2)+")");
   pollenRef.current?.setAttribute("opacity",f.carrying?"1":"0");
   glowRef.current?.setAttribute("opacity",f.transfer?"1":"0");
   if(phaseRef.current!==f.stage){phaseRef.current=f.stage;setPhase(f.stage);}
   if(carryRef.current!==f.carrying){carryRef.current=f.carrying;setCarrying(f.carrying);}
   if(transferRef.current!==f.transfer){transferRef.current=f.transfer;setTransfer(f.transfer);}
   frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);
  return ()=>{cancelAnimationFrame(frame);lastRef.current=null;};
 },[playing]);
 return {spriteRef,pollenRef,glowRef,playing,setPlaying,phase,carrying,transfer,
  blocked,setBlocked,speed,setSpeed,seek,reset};
}
