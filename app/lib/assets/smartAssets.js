export const SMART_ASSETS = Object.freeze({
  "engine-piston-v1": Object.freeze({
    id: "engine-piston-v1",
    title: "محرك — بستم ومرفق",
    type: "procedural-3d",
    domain: "mechanics",
    matchTerms: ["محرك","المحرك","بستم","مكبس","engine","piston","crank"],
    semanticParts: Object.freeze({
      piston: { id: "piston", label: "البستم", role: "moving-part", capabilities: ["translate-y","focus","isolate"] },
      rod: { id: "rod", label: "ذراع التوصيل", role: "connector", capabilities: ["rotate","focus"] },
      crank: { id: "crank", label: "عمود المرفق", role: "driver", capabilities: ["rotate","focus","isolate"] },
      chamber: { id: "chamber", label: "غرفة الاحتراق", role: "reaction-zone", capabilities: ["highlight","reveal"] },
      spark: { id: "spark", label: "الشرارة", role: "ignition", capabilities: ["state-change","highlight"] }
    }),
    capabilities: Object.freeze([
      "mechanical-cycle",
      "focus-part",
      "isolate-part",
      "replay",
      "reset",
      "state-change"
    ]),
    states: Object.freeze({
      idle: { running: false, isolatedPart: null, focusedPart: null },
      running: { running: true, isolatedPart: null, focusedPart: null },
      pistonFocus: { running: false, isolatedPart: null, focusedPart: "piston" },
      pistonIsolated: { running: false, isolatedPart: "piston", focusedPart: "piston" }
    }),
    actionBindings: Object.freeze({
      "mechanical-cycle": ["spark","chamber","piston","rod","crank"],
      "focus": ["piston","rod","crank","chamber"],
      "isolate": ["piston","crank"],
      "replay": ["mechanical-cycle"],
      "reset": ["all"]
    })
  })
});

export function getSmartAsset(id){
  return SMART_ASSETS[id] || null;
}

export function resolveSmartAsset(question=""){
  const q=String(question||"").toLowerCase();
  for(const asset of Object.values(SMART_ASSETS)){
    if((asset.matchTerms||[]).some(term=>q.includes(term))) return asset;
  }
  return null;
}
