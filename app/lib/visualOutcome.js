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
