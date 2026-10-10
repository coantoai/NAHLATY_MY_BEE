export const SMART_HEART_REQUIREMENTS = Object.freeze({
  benchmark: "heart-depth-exploration-v1",
  goal: "Navigate from whole heart to internal structures without replacing the scene with generated raster images.",
  requiredSemanticParts: Object.freeze([
    "left-atrium",
    "right-atrium",
    "left-ventricle",
    "right-ventricle",
    "interatrial-septum",
    "interventricular-septum",
    "aorta",
    "pulmonary-trunk",
    "pulmonary-veins",
    "superior-vena-cava",
    "inferior-vena-cava",
    "mitral-valve",
    "tricuspid-valve",
    "aortic-valve",
    "pulmonary-valve",
    "papillary-muscles",
    "chordae-tendineae"
  ]),
  preferredSemanticParts: Object.freeze([
    "coronary-arteries",
    "coronary-veins",
    "sa-node",
    "av-node",
    "bundle-of-his",
    "purkinje-network"
  ]),
  requiredCapabilities: Object.freeze([
    "rotate",
    "zoom",
    "focus-part",
    "isolate-part",
    "cutaway",
    "transparency",
    "enter-region",
    "depth-navigation",
    "blood-flow",
    "heartbeat",
    "valve-motion",
    "reset"
  ]),
  depthLevels: Object.freeze([
    { id: "whole-heart", label: "Whole heart" },
    { id: "chambers", label: "Chambers and great vessels" },
    { id: "valves", label: "Valves and internal structures" },
    { id: "subvalvular", label: "Papillary muscles and chordae" },
    { id: "micro-anatomy", label: "Optional deeper educational layer" }
  ]),
  acceptanceRules: Object.freeze({
    medicallyPlausibleGeometry: true,
    noFakeRasterMotion: true,
    independentSemanticSelection: true,
    supportsClippingOrCutaway: true,
    webRuntimeTarget: "glb/glTF",
    coreLicenseTarget: "public-domain-or-cc0-no-attribution"
  })
});
