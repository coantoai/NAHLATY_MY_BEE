"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { updateRepresentationHistory } from "../lib/representationMemory";

export default function useUnderstandingMemory({title,nodes=[],edges=[],visibleIds=[],active}){
 const [understandingState,setUnderstandingState]=useState({});
 const [understandingEvidence,setUnderstandingEvidence]=useState({});
 const [relationState,setRelationState]=useState({});
 const [relationEvidence,setRelationEvidence]=useState({});
 const [representationHistory,setRepresentationHistory]=useState({});
 const previousStates=useRef({});
 const [memoryRestored,setMemoryRestored]=useState(false);
 const [memoryUpdatedAt,setMemoryUpdatedAt]=useState(null);

 const nodeSignature=useMemo(()=>nodes.map(n=>n.id).join(","),[nodes]);
 const memoryKey=useMemo(()=>`mybee-understanding:${String(title||"untitled").slice(0,80)}:${nodeSignature}`,[title,nodeSignature]);
 const legacyMemoryKey=useMemo(()=>`eshrahli-understanding:${String(title||"untitled").slice(0,80)}:${nodeSignature}`,[title,nodeSignature]);
 const visibleKey=visibleIds.join("|");

 useEffect(()=>{
  setUnderstandingState({});
  setUnderstandingEvidence({});
  setRelationState({});
  setRelationEvidence({});
  setRepresentationHistory({});
  previousStates.current={};
  setMemoryRestored(false);
  setMemoryUpdatedAt(null);
  if(!nodes.length)return;
  try{
   const raw=localStorage.getItem(memoryKey)||localStorage.getItem(legacyMemoryKey);
   if(!raw)return;
   const saved=JSON.parse(raw);
   if(!localStorage.getItem(memoryKey))localStorage.setItem(memoryKey,raw);
   if(saved?.states&&typeof saved.states==="object"){
    previousStates.current=saved.states;
    setUnderstandingState(saved.states);
    if(saved?.evidence&&typeof saved.evidence==="object")setUnderstandingEvidence(saved.evidence);
    if(saved?.relationStates&&typeof saved.relationStates==="object")setRelationState(saved.relationStates);
    if(saved?.relationEvidence&&typeof saved.relationEvidence==="object")setRelationEvidence(saved.relationEvidence);
    if(saved?.representationHistory&&typeof saved.representationHistory==="object")setRepresentationHistory(saved.representationHistory);
    setMemoryRestored(true);
    setMemoryUpdatedAt(Number(saved.updatedAt)||null);
   }
  }catch{}
 },[memoryKey,legacyMemoryKey]);

 useEffect(()=>{
  if(!nodes.length)return;
  const fresh=visibleIds.filter(id=>!understandingState[id]);
  if(!fresh.length)return;
  setUnderstandingState(prev=>{
   const next={...prev};
   for(const id of fresh)if(!next[id])next[id]="seen";
   return next;
  });
  setUnderstandingEvidence(current=>{
   const next={...current};
   for(const id of fresh){
    const item={seen:0,understood:0,uncertain:0,repaired:0,transferred:0,...(next[id]||{})};
    item.seen+=1;
    next[id]=item;
   }
   return next;
  });
 },[active,visibleKey]);


 useEffect(()=>{
  if(!nodes.length||!Object.keys(understandingState).length)return;
  try{
   const updatedAt=Date.now();
   localStorage.setItem(memoryKey,JSON.stringify({states:understandingState,evidence:understandingEvidence,relationStates:relationState,relationEvidence,representationHistory,updatedAt,title:title||""}));
   setMemoryUpdatedAt(updatedAt);
  }catch{}
 },[understandingState,understandingEvidence,relationState,relationEvidence,representationHistory,memoryKey,title]);

 function recordUnderstandingEvidence(id,signal){
  if(!id||!["seen","understood","uncertain","repaired","transferred"].includes(signal))return;
  setUnderstandingEvidence(current=>{
   const next={...current};
   const item={seen:0,understood:0,uncertain:0,repaired:0,transferred:0,...(next[id]||{})};
   item[signal]+=1;
   next[id]=item;
   return next;
  });
 }

 function recordRelationEvidence(id,signal){
  if(!id||!["seen","understood","uncertain","repaired","transferred"].includes(signal))return;
  setRelationEvidence(current=>{
   const next={...current};
   const item={seen:0,understood:0,uncertain:0,repaired:0,transferred:0,...(next[id]||{})};
   item[signal]+=1;
   next[id]=item;
   return next;
  });
 }

 function recordRepresentationOutcome(id,representation,outcome){
  setRepresentationHistory(current=>updateRepresentationHistory(current,id,representation,outcome));
 }

 return {
  understandingState,
  setUnderstandingState,
  understandingEvidence,
  recordUnderstandingEvidence,
  relationState,
  setRelationState,
  relationEvidence,
  recordRelationEvidence,
  representationHistory,
  recordRepresentationOutcome,
  memoryRestored,
  setMemoryRestored,
  memoryUpdatedAt
 };
}
