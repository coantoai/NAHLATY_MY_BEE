export function deriveLearnerState({nodes=[],edges=[],states={},evidence={},relationStates={},relationEvidence={},profile={}}){
 const values=nodes.map(n=>states[n.id]||"unseen");
 const uncertain=values.filter(v=>v==="uncertain").length;
 const repaired=values.filter(v=>v==="repaired").length;
 const transferred=values.filter(v=>v==="transferred").length;
 const solid=values.filter(v=>["understood","repaired","transferred"].includes(v)).length;
 const seen=values.filter(v=>v!=="unseen").length;
 const uncertaintySignals=nodes.reduce((sum,n)=>sum+Number(evidence?.[n.id]?.uncertain||0),0);
 const transferSignals=nodes.reduce((sum,n)=>sum+Number(evidence?.[n.id]?.transferred||0),0);
 const repairSignals=nodes.reduce((sum,n)=>sum+Number(evidence?.[n.id]?.repaired||0),0);
 const relationValues=edges.map(e=>relationStates[e.id]||"unseen");
 const relationUncertain=relationValues.filter(v=>v==="uncertain").length;
 const relationRepaired=relationValues.filter(v=>v==="repaired").length;
 const relationTransferred=relationValues.filter(v=>v==="transferred").length;
 const relationUncertaintySignals=edges.reduce((sum,e)=>sum+Number(relationEvidence?.[e.id]?.uncertain||0),0);
 const relationRepairSignals=edges.reduce((sum,e)=>sum+Number(relationEvidence?.[e.id]?.repaired||0),0);
 const relationTransferSignals=edges.reduce((sum,e)=>sum+Number(relationEvidence?.[e.id]?.transferred||0),0);

 if(uncertain>=2||relationUncertain>=2||uncertaintySignals>=2||relationUncertaintySignals>=2){
  return {
   mode:"support",
   label:"دعم",
   reason:"في فجوة ظهرت من التفاعل، فالأفضل تقليل الحمل والتركيز على إصلاحها قبل التوسّع.",
   toolDepth:"minimal"
  };
 }
 if(transferred>0||relationTransferred>0||transferSignals>0||relationTransferSignals>0){
  return {
   mode:"stretch",
   label:"توسعة",
   reason:"الفهم نجح في سياق جديد، فممكن نرفع مستوى الاستكشاف بدون إعادة الأساسيات.",
   toolDepth:profile.toolDepth||"progressive"
  };
 }
 if(repaired>0||relationRepaired>0||repairSignals>0||relationRepairSignals>0||solid>=Math.max(2,Math.ceil(nodes.length*.55))){
  return {
   mode:"consolidate",
   label:"تثبيت",
   reason:"الأساس صار مترابطاً؛ الأفضل تثبيته بسؤال أو تطبيق قبل زيادة العمق.",
   toolDepth:profile.toolDepth||"progressive"
  };
 }
 if(seen>0){
  return {
   mode:"steady",
   label:"استمرار",
   reason:"ما ظهر عائق واضح بعد، فالمسار الطبيعي مناسب حالياً.",
   toolDepth:profile.toolDepth||"progressive"
  };
 }
 return {mode:"start",label:"بداية",reason:"لسه ما في تفاعل كافٍ لتعديل المسار.",toolDepth:profile.toolDepth||"progressive"};
}
