// An editing request must not be interpreted as a request to reproduce the old frame.
const replacement=/حوّل|حوِّل|تحويل|استبدل|بد[ّ]?ل|غي[ّ]?ر|استبدال|تحو[ّ]?ل|replace|transform|convert|swap|turn (?:it|this) into|change (?:it|this) to/i;
const inspection=/داخل|افتح|تكبير|قر[ّ]?ب|اكشف|قطع|مقطع|تفاصيل|محرك|zoom|cutaway|inside|open|explode|x-ray/i;
const fan=/مروح|fan/i;
const pedestal=/عمود|عامود|واقف|أرضي|قاعدة|standing|pedestal|tower fan/i;
const ceiling=/سقف|سقفي|ceiling/i;

export function visualChangePlan(question,previous="",hasReference=false){
 const current=String(question||"");
 const context=String(previous||"");
 const pedestalConversion=Boolean(hasReference&&fan.test(current+" "+context)&&pedestal.test(current)&&ceiling.test(current+" "+context));
 const isReplacement=hasReference&&(pedestalConversion||replacement.test(current));
 const mode=!hasReference?"create":isReplacement?"replace":inspection.test(current)?"explore":"explain";
 const required=pedestalConversion?[
  "The output must feature a freestanding floor pedestal fan as the main subject.",
  "A vertical pole connects a stable floor base to a circular protective grille around the fan blades.",
  "Show the requested opened motor housing and internal drive components where visible.",
  "The old ceiling fan must no longer appear anywhere in the resulting image."
 ]:mode==="replace"?[
  "Execute the user-requested object, type, shape or configuration replacement visibly.",
  "Remove the original object or configuration that the user explicitly asked to replace."
 ]:mode==="explore"?[
  "Change viewpoint, zoom or cutaway visibly to reveal the requested internal or detailed structure."
 ]:mode==="explain"?[
  "Add a meaningful visual explanation of the new question: show flow, causal change, detail or different camera emphasis.",
  "The result must not merely be an unchanged copy of the prior frame."
 ]:["Visually explain the question with the requested subject."];
 return {mode,pedestalConversion,required,
  forbidden:pedestalConversion?["ceiling-mounted fan","fan hanging from a ceiling","multiple incompatible fan types in the same frame"]:[],
  continuity:mode==="replace"
   ?"The previous image is a style and scene-context reference, NOT a geometry lock. Preserve palette and unaffected environment, but REPLACE the requested subject; changing its mounting, structure, or location is mandatory. Do not leave the old object in the frame."
   :"Preserve the recognizable subject and scientific context, but make the requested camera, flow, detail or explanation visibly different from the input frame.",
  changeRequired:hasReference
 };
}
