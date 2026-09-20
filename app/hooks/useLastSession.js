"use client";
import { useEffect, useState } from "react";

const KEY="mybee:last-session";
const LEGACY_KEY="eshrahli:last-session";

export default function useLastSession({
 content,audience,result,active,
 setContent,setAudience,setResult,setActive,setSpeed
}){
 const [sessionRestored,setSessionRestored]=useState(false);

 useEffect(()=>{
  try{
   const raw=localStorage.getItem(KEY)||localStorage.getItem(LEGACY_KEY);
   if(!raw)return;
   const saved=JSON.parse(raw);
   if(!localStorage.getItem(KEY))localStorage.setItem(KEY,raw);
   if(!saved?.result?.sceneGraph?.nodes?.length)return;
   setContent(String(saved.content||""));
   setAudience(String(saved.audience||""));
   setResult(saved.result);
   setActive(Math.max(0,Math.min((saved.result?.steps?.length||1)-1,Number(saved.active)||0)));
   if(saved.result?.presentation?.paceSec)setSpeed(saved.result.presentation.paceSec);
   setSessionRestored(true);
  }catch{}
 },[setContent,setAudience,setResult,setActive,setSpeed]);

 useEffect(()=>{
  if(!result?.sceneGraph?.nodes?.length)return;
  try{
   localStorage.setItem(KEY,JSON.stringify({
    content,audience,result,active,updatedAt:Date.now()
   }));
  }catch{}
 },[content,audience,result,active]);

 return {sessionRestored,setSessionRestored};
}
