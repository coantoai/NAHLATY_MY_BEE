export function chooseLearningAction({
 nodes=[],
 edges=[],
 steps=[],
 active=0,
 understandingState={},
 currentVisibleIds=[],
 experience={},
 evidence={},
 relationStates={},
 perspectives=[],
 scales=[],
 hasAnalogy=false,
 hasLayers=false,
 reframeHistory={},
 mentalModelRepair=null
}){
 const toolDepth=experience.toolDepth||"progressive";
 const challengeStyle=experience.challengeStyle||"prediction";
 if(mentalModelRepair){
  const fromLabel=nodes.find(n=>n.id===mentalModelRepair.from)?.label||mentalModelRepair.from||"العنصر الأول";
  const toLabel=nodes.find(n=>n.id===mentalModelRepair.to)?.label||mentalModelRepair.to||"العنصر الثاني";
  if(mentalModelRepair.kind==="invented"){
   return {
    type:"model-repair",
    nodeId:mentalModelRepair.nodeId,
    from:mentalModelRepair.from,
    to:mentalModelRepair.to,
    expectedEdgeId:mentalModelRepair.expectedEdgeId,
    expectedTo:mentalModelRepair.expectedTo,
    label:"صحّح الرابط",
    reason:`نموذجك أضاف رابطاً من «${fromLabel}» إلى «${toLabel}» غير موجود في البنية المدعومة. الأفضل إعادة بناء هذا الجزء قبل المتابعة.`
   };
  }
  return {
   type:"model-repair",
   nodeId:mentalModelRepair.nodeId,
   from:mentalModelRepair.from,
   to:mentalModelRepair.to,
   expectedEdgeId:mentalModelRepair.expectedEdgeId,
   expectedTo:mentalModelRepair.expectedTo,
   label:"أكمل الرابط الناقص",
   reason:`النموذج ما زال ناقصاً حول «${fromLabel}». أعد بناء العلاقة الأساسية بدل إعادة الشرح كله.`
  };
 }
 const repairedEdge=edges.find(e=>relationStates?.[e.id]==="repaired");
 if(repairedEdge){
  const fromLabel=nodes.find(n=>n.id===repairedEdge.from)?.label||repairedEdge.from||"البداية";
  return {
   type:"verify-repair",
   edgeId:repairedEdge.id,
   from:repairedEdge.from,
   to:repairedEdge.to,
   label:"ثبّت الإصلاح",
   reason:`أصلحت العلاقة عند «${fromLabel}». الآن أعد بناءها وحدك بدون تلميح للتأكد أن الفهم ثبت، لا أنه مجرد تذكّر للحل.`
  };
 }
 const repeatedWeak=nodes.find(n=>understandingState[n.id]==="uncertain"&&Number(evidence?.[n.id]?.uncertain||0)>=2);
 if(repeatedWeak){
  const profile=experience.id||"general";
  const preferred=profile==="child"?["analogy","concrete","scale","perspective"]:
   profile==="senior"?["concrete","perspective","scale","analogy"]:
   profile==="educator"?["perspective","analogy","scale","concrete"]:
   profile==="expert"?["scale","perspective","concrete","analogy"]:
   ["analogy","scale","perspective","concrete"];
  const available=preferred.filter(x=>x==="analogy"?hasAnalogy:x==="concrete"?hasLayers:x==="scale"?scales.length>1:x==="perspective"?perspectives.length>1:false);
  const used=new Set(reframeHistory?.[repeatedWeak.id]||[]);
  const representation=available.find(x=>!used.has(x));
  if(representation){
   return {
    type:"reframe",
    nodeId:repeatedWeak.id,
    representation,
    label:"غيّر طريقة الشرح",
    reason:`التردد تكرر عند «${repeatedWeak.label}». بدل إعادة نفس العرض، الأفضل نشوف نفس الحقيقة بتمثيل مختلف.`
   };
  }
  const diagnosticEdge=edges.find(e=>e.from===repeatedWeak.id)||edges.find(e=>e.to===repeatedWeak.id);
  if(diagnosticEdge){
   return {
    type:"model-check",
    nodeId:repeatedWeak.id,
    from:diagnosticEdge.from,
    label:"ابنِ العلاقة بنفسك",
    reason:`جرّبنا طرق العرض المناسبة وما حلت التردد عند «${repeatedWeak.label}». بدل إعادة الشرح، ابنِ الرابط بنفسك حتى نكشف مكان الكسر في النموذج.`
   };
  }
 }
 const weak=nodes.find(n=>understandingState[n.id]==="uncertain");
 if(weak){
  const stepIndex=steps.findIndex(s=>(s.focusNodeIds||[]).includes(weak.id));
  return {
   type:"repair",
   nodeId:weak.id,
   stepIndex,
   label:"راجع الفجوة",
   reason:`آخر تفاعل أظهر تردداً عند «${weak.label}».`
  };
 }

 const current=steps[active]||{};
 if(experience.learnerMode==="consolidate"&&active>=Math.max(1,Math.floor((steps.length-1)*.5))){
  return challengeStyle==="teachback"
   ?{type:"teachback",label:"ثبّت الفكرة بشرحك",reason:"الأساس صار مترابطاً؛ الأفضل تثبيته بشرح قصير منك قبل فتح طبقة جديدة."}
   :{type:"reflect",label:"ثبّت فهمك",reason:"الأساس صار مترابطاً؛ الأفضل تطبيقه أو اختباره قبل زيادة العمق."};
 }
 if(experience.learnerMode==="stretch"){
  if(perspectives.length>1)return {type:"perspective",label:"شوفها من زاوية ثانية",reason:"الفهم انتقل بنجاح، فهلق فينا نوسّعه بدون إعادة الأساسيات."};
  if(scales.length>1)return {type:"scale",label:"غيّر مقياس الفهم",reason:"الفهم صار ثابتاً بما يكفي لنشوف نفس الفكرة من مستوى أكبر أو أصغر."};
 }
 if(challengeStyle==="teachback"&&active>=steps.length-1){return {type:"teachback",label:"خلّيك أنت تشرحها",reason:"لهذا الجمهور، أفضل تثبيت للفهم هو إعادة شرح الفكرة بكلماتك ثم كشف الفجوات."}}
 const currentFocused=(current.focusNodeIds||[]).map(id=>nodes.find(n=>n.id===id)).filter(Boolean);
 const spatial=currentFocused.find(n=>n.spatial||n.depthParts?.length);
 if(spatial&&toolDepth!=="minimal"){
  return {
   type:"depth",
   nodeId:spatial.id,
   label:"ادخل أعمق",
   reason:`هذا الجزء فيه بنية داخلية تساعد رؤيتها على فهم «${spatial.label}».`
  };
 }

 const seen=nodes.filter(n=>["understood","repaired","transferred"].includes(understandingState[n.id]));
 const transferred=nodes.filter(n=>understandingState[n.id]==="transferred");
 if(toolDepth!=="minimal"&&nodes.length>=3&&active>=Math.max(1,Math.floor((steps.length-1)*.6))&&seen.length>=Math.ceil(nodes.length*.45)&&transferred.length===0){
  return {
   type:"transfer",
   label:"اختبر نقل الفهم",
   reason:"صار عندك أساس كافٍ؛ جرّب نفس البنية في عالم مختلف لتتأكد أن الفهم مش حفظاً للمشهد."
  };
 }

 const unresolved=nodes.find(n=>currentVisibleIds.includes(n.id)&&n.knowledge==="unknown");
 if(unresolved&&toolDepth!=="minimal"){
  return {
   type:"knowledge",
   nodeId:unresolved.id,
   label:"شوف حدود المعرفة",
   reason:`في جزء غير محسوم حول «${unresolved.label}» ومن الأفضل تمييزه قبل المتابعة.`
  };
 }

 if(active<steps.length-1){
  return {
   type:"continue",
   stepIndex:active+1,
   label:"كمّل",
   reason:"ما ظهر عائق فهم واضح، فالخطوة التالية هي الأنسب."
  };
 }

 return {
  type:challengeStyle==="direct"?"reflect":"reflect",
  label:challengeStyle==="concrete"?"جرّبها بطريقتك":"اختبر فهمك",
  reason:"وصلت لنهاية الشرح؛ الأفضل الآن تثبيت النموذج بدل إعادة العرض."
 };
}
