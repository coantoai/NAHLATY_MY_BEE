export function visualGenerationNeeded(provider){
 return provider!=="sourced-knowledge";
}

export function initialVisualStep(experience){
 const index=experience?.initialStep;
 return Number.isInteger(index)&&index>=0&&index<(experience?.steps?.length||0)?index:0;
}

export function sceneCaption(step){
 const text=String(step?.text||step?.outcome||step?.title||"").trim().replace(/\s+/g," ");
 return text.length>53?text.slice(0,50).trimEnd()+"…":text;
}

export function resolveVisualOutcome({previousResult,previousImage,nextResult,generatedImage,imageFailed}){
 if(!imageFailed){
  return {shownResult:nextResult,shownImage:generatedImage,status:"complete",notice:""};
 }
 if(previousResult){
  return {
   shownResult:previousResult,
   shownImage:previousImage||"",
   status:"visual-failed",
   notice:"لم يتم تنفيذ التغيير البصري؛ أُبقي المشهد السابق دون ادعاء أنه الإجابة الجديدة."
  };
 }
 return {
  shownResult:nextResult,
  shownImage:"",
  status:"complete",
  notice:"لم تكتمل الصورة المولّدة؛ أُظهر مشهد بصري دلالي للشرح."
 };
}
