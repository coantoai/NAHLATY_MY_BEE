"use client";
import { useCallback, useEffect, useState } from "react";

const KEY="mybee:explanation-library";
const LIMIT=24;

function safeRead(){
 try{
  const raw=localStorage.getItem(KEY);
  const parsed=raw?JSON.parse(raw):[];
  return Array.isArray(parsed)?parsed.slice(0,LIMIT):[];
 }catch{return []}
}

export default function useExplanationLibrary(){
 const [items,setItems]=useState([]);
 const [ready,setReady]=useState(false);

 useEffect(()=>{setItems(safeRead());setReady(true)},[]);

 const persist=useCallback(next=>{
  const clean=next.slice(0,LIMIT);
  setItems(clean);
  try{localStorage.setItem(KEY,JSON.stringify(clean))}catch{}
  return clean;
 },[]);

 const save=useCallback(({content,audience,result})=>{
  if(!result?.sceneGraph?.nodes?.length)return null;
  const signature=[String(content||"").trim().slice(0,180),String(audience||""),String(result?.title||"")].join("|");
  const item={
   id:"ex-"+Date.now().toString(36),
   signature,
   title:String(result?.title||"شرح بصري").slice(0,90),
   summary:String(result?.summary||"").slice(0,180),
   content:String(content||"").slice(0,70000),
   audience:String(audience||"عام").slice(0,80),
   result,
   theme:String(result?.sceneGraph?.world?.theme||"abstract"),
   dimension:String(result?.sceneGraph?.world?.dimension||"2d"),
   savedAt:Date.now()
  };
  const current=safeRead().filter(x=>x?.signature!==signature&&x?.id!==item.id);
  persist([item,...current]);
  return item;
 },[persist]);

 const remove=useCallback(id=>{
  persist(safeRead().filter(x=>x?.id!==id));
 },[persist]);

 const clear=useCallback(()=>persist([]),[persist]);

 return {items,ready,save,remove,clear};
}
