"use client";
import { useCallback, useEffect, useState } from "react";

const KEY="mybee:explanation-library";
const LIMIT=24;

function normalizeItem(item){
 const total=Math.max(1,Number(item?.totalSteps||item?.result?.steps?.length||1));
 const active=Math.max(0,Math.min(total-1,Number(item?.lastActive||0)));
 return {
  ...item,
  lastActive:active,
  totalSteps:total,
  openedCount:Math.max(0,Number(item?.openedCount||0)),
  lastOpenedAt:Number(item?.lastOpenedAt||item?.savedAt||0),
  updatedAt:Number(item?.updatedAt||item?.savedAt||0)
 };
}

function safeRead(){
 try{
  const raw=localStorage.getItem(KEY);
  const parsed=raw?JSON.parse(raw):[];
  return Array.isArray(parsed)?parsed.slice(0,LIMIT).map(normalizeItem):[];
 }catch{return []}
}

export default function useExplanationLibrary(){
 const [items,setItems]=useState([]);
 const [ready,setReady]=useState(false);

 useEffect(()=>{setItems(safeRead());setReady(true)},[]);

 const persist=useCallback(next=>{
  const clean=next.slice(0,LIMIT).map(normalizeItem);
  setItems(clean);
  try{localStorage.setItem(KEY,JSON.stringify(clean))}catch{}
  return clean;
 },[]);

 const save=useCallback(({content,audience,result,active=0,total})=>{
  if(!result?.sceneGraph?.nodes?.length)return null;
  const signature=[String(content||"").trim().slice(0,180),String(audience||""),String(result?.title||"")].join("|");
  const current=safeRead();
  const previous=current.find(x=>x?.signature===signature);
  const now=Date.now();
  const totalSteps=Math.max(1,Number(total||result?.steps?.length||1));
  const item=normalizeItem({
   id:previous?.id||("ex-"+now.toString(36)),
   signature,
   title:String(result?.title||"شرح بصري").slice(0,90),
   summary:String(result?.summary||"").slice(0,180),
   content:String(content||"").slice(0,70000),
   audience:String(audience||"عام").slice(0,80),
   result,
   theme:String(result?.sceneGraph?.world?.theme||"abstract"),
   dimension:String(result?.sceneGraph?.world?.dimension||"2d"),
   savedAt:previous?.savedAt||now,
   updatedAt:now,
   lastOpenedAt:previous?.lastOpenedAt||now,
   openedCount:previous?.openedCount||0,
   lastActive:active,
   totalSteps
  });
  persist([item,...current.filter(x=>x?.signature!==signature&&x?.id!==item.id)]);
  return item;
 },[persist]);

 const touch=useCallback((id,{active,total}={})=>{
  if(!id)return null;
  const current=safeRead();
  const found=current.find(x=>x?.id===id);
  if(!found)return null;
  const now=Date.now();
  const next=normalizeItem({
   ...found,
   lastOpenedAt:now,
   updatedAt:now,
   openedCount:Number(found.openedCount||0)+1,
   lastActive:active??found.lastActive,
   totalSteps:total??found.totalSteps
  });
  persist([next,...current.filter(x=>x?.id!==id)]);
  return next;
 },[persist]);

 const updateProgress=useCallback((id,{active,total}={})=>{
  if(!id)return null;
  const current=safeRead();
  const found=current.find(x=>x?.id===id);
  if(!found)return null;
  const next=normalizeItem({
   ...found,
   updatedAt:Date.now(),
   lastActive:active??found.lastActive,
   totalSteps:total??found.totalSteps
  });
  persist(current.map(x=>x?.id===id?next:x));
  return next;
 },[persist]);

 const remove=useCallback(id=>{
  persist(safeRead().filter(x=>x?.id!==id));
 },[persist]);

 const clear=useCallback(()=>persist([]),[persist]);

 return {items,ready,save,touch,updateProgress,remove,clear};
}
