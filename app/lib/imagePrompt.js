const INTERNAL_TERMS=/locked truth|visual edit contract|mustShow|mustNotShow|criticalErrors|\{[^}]*\}/i;

export function buildImagePrompt(spec,changePlan={},hasReference=false){
 const brief=String(spec?.visualBrief||'').trim();
 if(!brief||brief.length>900||INTERNAL_TERMS.test(brief))throw new Error('Unsafe visual brief');
 const cloudScene=/(?:سحب|سحابة|ركامي|cumulus|cumulonimbus|cloud)/i.test(String(spec?.topic||''));
 const subjectGuard=cloudScene
  ?'Depict atmospheric cloud formation in one continuous spatial scene: sunlight warms the ground; subtle translucent amber streamlines of humid air rise from a broad surface area; higher up they cool into tiny visible condensation droplets at the flat cloud base, then gather into several natural cauliflower-shaped cumulus towers. Keep these cause-and-effect stages simultaneously visible through light, depth and flow, rather than showing only a mature cloud. This is meteorology, with no eruption, smoke column, ash, fire, explosion or mushroom cloud.'
  :'';
 const continuity=hasReference
  ?changePlan?.mode==='replace'
   ?'Use the prior image for palette and unaffected setting only. Replace the requested subject visibly; remove its old form.'
   :'Keep the recognizable subject and setting, while visibly changing the explanatory focus or camera.'
  :'Compose one coherent world that can evolve through later questions.';
 return `Create one cinematic educational scene. ${brief} ${subjectGuard} ${continuity} Explain through physical objects, light, depth, transparency and causal motion cues. The image must contain no text, pseudo-text, letters, labels, panels, cards, posters, charts, or infographic layout. No watermark or logo.`;
}
