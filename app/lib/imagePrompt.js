const INTERNAL_TERMS=/locked truth|visual edit contract|mustShow|mustNotShow|criticalErrors|\{[^}]*\}/i;
const clean=x=>String(x??"").trim();
export function buildImagePrompt(spec,changePlan={},hasReference=false){
 const brief=clean(spec?.visualBrief);
 if(!brief||brief.length>900||INTERNAL_TERMS.test(brief))throw new Error("Unsafe visual brief");
 // Never inject a fixed cloud/land/volcano scene. The accepted scientific answer owns the composition.
 const scene=spec?.scene||{};
 const subject=clean(scene.subject),setting=clean(scene.setting);
 if(!subject||!setting)throw new Error("ANSWER_FIRST_SCENE_REQUIRED");
 const objects=(Array.isArray(scene.objects)?scene.objects:[]).map(clean).filter(Boolean).slice(0,8);
 const avoid=(Array.isArray(scene.avoid)?scene.avoid:[]).map(clean).filter(Boolean).slice(0,8);
 if(!objects.length)throw new Error("ANSWER_FIRST_OBJECTS_REQUIRED");
 const continuity=hasReference
  ?changePlan?.mode==="replace"?"Use the reference only for visual style and unchanged setting; REPLACE the requested object.":"Preserve the recognizable world and subject, while showing the newly requested scientific focus."
  :"Compose a coherent scene that could evolve across follow-up questions.";
 return [
  "Create ONE cinematic educational base image matching the EXACT scientific answer.",
  brief,"Physical subject: "+subject+".","Justified setting: "+setting+".",
  "Visible objects: "+objects.join("; ")+".",
  avoid.length?"Do not depict: "+avoid.join("; ")+".":"",
  continuity,
  "Do not invent a different subject or a default landscape.",
  "Invisible processes such as water vapor, cooling, forces or flow paths MUST NOT be drawn as photographic objects. Interactive arrows, particles, highlights and other explanatory overlays will be rendered by the app on separate layers, never baked into this image.",
  "No text, pseudo-text, labels, diagram panels, floating cards, infographic elements, logo or watermark."
 ].filter(Boolean).join(" ");
}
