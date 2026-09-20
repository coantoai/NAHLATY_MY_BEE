"use client";
import { useEffect, useRef, useState } from "react";
import { getExperienceProfile } from "../lib/experienceProfile";

export default function InputComposer({content,setContent,audience,setAudience,onGenerate,loading,error}){
 const [fileLoad,setFileLoad]=useState(false);
 const [fileMeta,setFileMeta]=useState(null);
 const [voiceOn,setVoiceOn]=useState(false);
 const [voiceSupported,setVoiceSupported]=useState(true);
 const [voiceDraft,setVoiceDraft]=useState("");
 const file=useRef(null);
 const speech=useRef(null);
 const profile=getExperienceProfile(audience);

 useEffect(()=>{
  if(typeof window==="undefined")return;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){setVoiceSupported(false);return}
  const rec=new SR();
  rec.lang=navigator.language||"ar-LB";
  rec.continuous=true;
  rec.interimResults=true;
  rec.onresult=e=>{
   let interim="",final="";
   for(let i=e.resultIndex;i<e.results.length;i++){
    const t=e.results[i][0]?.transcript||"";
    if(e.results[i].isFinal)final+=t;else interim+=t;
   }
   setVoiceDraft(interim);
   if(final.trim())setContent(v=>(v?v+" ":"")+final.trim());
  };
  rec.onend=()=>{setVoiceOn(false);setVoiceDraft("")};
  rec.onerror=()=>{setVoiceOn(false);setVoiceDraft("")};
  speech.current=rec;
  return()=>{try{rec.stop()}catch{}};
 },[setContent]);

 function toggleVoice(){
  const rec=speech.current;
  if(!rec)return;
  if(voiceOn){try{rec.stop()}catch{}setVoiceOn(false);return}
  try{setFileMeta(null);setVoiceDraft("");rec.start();setVoiceOn(true)}catch{}
 }

 async function pick(e){
  const f=e.target.files?.[0];
  if(!f)return;
  setFileLoad(true);
  setFileMeta({name:f.name,status:"reading"});
  try{
   if(f.size>4*1024*1024)throw new Error("بهذه النسخة حجم الملف يجب أن يكون أقل من 4MB.");
   const textLike=f.type.startsWith("text/")||f.type==="application/json"||/\.(txt|md|csv|json)$/i.test(f.name);
   if(textLike){
    const text=(await f.text()).slice(0,70000);
    setContent(text);
    setFileMeta({name:f.name,status:"ready",kind:"text"});
    return;
   }
   const form=new FormData();
   form.append("file",f);
   const x=await fetch("/api/analyze-input",{method:"POST",body:form});
   const data=await x.json();
   if(!x.ok||data?.error)throw new Error(data?.error||"تعذر قراءة الملف");
   setContent(data?.content||"");
   setFileMeta({name:f.name,status:"ready",kind:data?.kind||"file"});
  }catch(err){
   setFileMeta({name:f.name,status:"error",error:String(err?.message||err)});
  }finally{
   setFileLoad(false);
   e.target.value="";
  }
 }

 return <div className={"composer audienceProfile-"+profile.id} style={{"--composer-font-scale":profile.fontScale||1}}>
  <div className="composerIntro"><small>ابدأ من أي شيء</small><h3>ما الذي تريد أن تفهمه؟</h3><p>اكتب سؤالاً، ارفع ملفاً أو صورة، أو احكِ بصوتك. نحلتي ستبحث عن المسار البصري الأنسب للفهم.</p></div>
  <div className="tabs inputPaths">
   <button disabled={fileLoad} onClick={()=>file.current?.click()}><span>◫</span><div><b>{fileLoad?"أقرأ الملف…":"ملف أو صورة"}</b><small>PDF · صورة · نص</small></div></button>
   <button onClick={()=>{setContent("");setFileMeta(null)}}><span>✎</span><div><b>نص أو سؤال</b><small>اكتب أو الصق الفكرة</small></div></button>
   <button className={voiceOn?"voiceActive":""} disabled={!voiceSupported} onClick={toggleVoice}><span>{voiceOn?"■":"◉"}</span><div><b>{!voiceSupported?"الصوت غير مدعوم":voiceOn?"أوقف التسجيل":"احكِ بصوتك"}</b><small>نحوّل الكلام إلى شرح</small></div></button>
  </div>
  <input ref={file} type="file" hidden accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.csv,.json,application/pdf,image/png,image/jpeg,image/webp,text/plain,text/markdown,text/csv,application/json" onChange={pick}/>
  {fileMeta&&<div className={"fileStatus "+fileMeta.status}><span>{fileMeta.status==="ready"?"✓":fileMeta.status==="error"?"!":"◌"}</span><div><b>{fileMeta.name}</b><small>{fileMeta.status==="ready"?(fileMeta.kind==="pdf"?"تم فهم الـPDF بصرياً":fileMeta.kind==="image"?"تم فهم الصورة بصرياً":"تمت قراءة الملف"):fileMeta.status==="error"?fileMeta.error:"عم اقرأ المحتوى…"}</small></div></div>}
  <div className="voiceComposer"><textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="اكتب، الصق، ارفع ملف، أو احكي ما تريد شرحه…"/>{voiceOn&&<div className="voiceLive"><i/><span>{voiceDraft||"عم اسمعك…"}</span></div>}</div>
  <div className="audienceBlock"><div><small>لمن هذا الشرح؟</small><span>نفس الحقيقة، إخراج يناسب الشخص.</span></div><div className="audiencePresets"><button className={audience==="طفل"?"active":""} onClick={()=>setAudience("طفل")}>طفل</button><button className={audience==="طالب"?"active":""} onClick={()=>setAudience("طالب")}>طالب</button><button className={audience==="عام"?"active":""} onClick={()=>setAudience("عام")}>عام</button><button className={audience==="معلّم"?"active":""} onClick={()=>setAudience("معلّم")}>معلّم</button><button className={audience==="كبير بالعمر"?"active":""} onClick={()=>setAudience("كبير بالعمر")}>كبير بالعمر</button><button className={audience==="متخصص"?"active":""} onClick={()=>setAudience("متخصص")}>متخصص</button></div></div>
  <div className="row composerActionRow"><input value={audience} onChange={e=>setAudience(e.target.value)} placeholder="أو اكتب جمهوراً محدداً…"/><button className="primary generateBee" disabled={loading||fileLoad||!content.trim()} onClick={onGenerate}><span>{loading?"◌":"✦"}</span>{loading?"أبني مسار الفهم…":"حوّلها إلى فهم بصري"}</button></div>
  {error&&<div className="makeError"><span>!</span><div><b>ما قدرت أبني الشرح بهالمحاولة</b><small>{error}</small></div></div>}
  {loading&&<div className="beeBuildJourney" role="status" aria-live="polite"><div className="beeBuildJourneyHead"><span>✦</span><div><b>نحلتي عم تبني مسار الفهم</b><small>ما في نسبة وهمية — أول ما يجهز المشهد بيظهر مباشرة.</small></div></div><div className="beeBuildSteps"><span>تفهم المحتوى</span><span>تختار التمثيل</span><span>تبني المشهد</span></div></div>}
  <div className="promise"><span>يفهم</span><i>←</i><span>يختار الوسيلة</span><i>←</i><span>يبني المشهد</span><i>←</i><span>يحرّكه</span></div>
 </div>;
}
