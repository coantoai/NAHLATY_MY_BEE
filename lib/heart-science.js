export const HEART_SCIENCE_VERSION = "2026-10-08-v1";

export const CANONICAL_CIRCULATION = [
  "body",
  "vena_cavae",
  "right_atrium",
  "tricuspid_valve",
  "right_ventricle",
  "pulmonary_valve",
  "pulmonary_arteries",
  "lungs",
  "pulmonary_veins",
  "left_atrium",
  "mitral_valve",
  "left_ventricle",
  "aortic_valve",
  "aorta",
  "body"
];

const OXYGENATION = {
  vena_cavae: "deoxygenated",
  right_atrium: "deoxygenated",
  tricuspid_valve: "deoxygenated",
  right_ventricle: "deoxygenated",
  pulmonary_valve: "deoxygenated",
  pulmonary_arteries: "deoxygenated",
  lungs: "exchange",
  pulmonary_veins: "oxygenated",
  left_atrium: "oxygenated",
  mitral_valve: "oxygenated",
  left_ventricle: "oxygenated",
  aortic_valve: "oxygenated",
  aorta: "oxygenated"
};

const ALLOWED_VIEWS = new Set(["anatomy", "cutaway", "blood_flow"]);

function normalizeStep(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
}

export function validateHeartSceneSpec(spec = {}) {
  const errors = [];
  const warnings = [];

  const view = String(spec.view || "anatomy");
  if (!ALLOWED_VIEWS.has(view)) {
    errors.push(`Unsupported view: ${view}`);
  }

  const bpm = Number(spec.bpm ?? 72);
  if (!Number.isFinite(bpm) || bpm < 45 || bpm > 140) {
    errors.push("BPM must be between 45 and 140 for this educational scene.");
  }

  const requestedFlow = Array.isArray(spec.circulationPath)
    ? spec.circulationPath.map(normalizeStep)
    : CANONICAL_CIRCULATION;

  const canonical = CANONICAL_CIRCULATION.map(normalizeStep);
  if (requestedFlow.length !== canonical.length ||
      requestedFlow.some((step, index) => step !== canonical[index])) {
    errors.push("Circulation path does not match canonical human blood flow.");
  }

  const oxygenation = spec.oxygenation || {};
  for (const [structure, expected] of Object.entries(OXYGENATION)) {
    if (oxygenation[structure] && oxygenation[structure] !== expected) {
      errors.push(`${structure} must be ${expected}, not ${oxygenation[structure]}.`);
    }
  }

  if (spec.pulmonaryArteryColor && spec.pulmonaryArteryColor !== "blue") {
    errors.push("Pulmonary arteries must be shown as deoxygenated/blue in this educational color convention.");
  }

  if (spec.pulmonaryVeinColor && spec.pulmonaryVeinColor !== "red") {
    errors.push("Pulmonary veins must be shown as oxygenated/red in this educational color convention.");
  }

  if (spec.labels === false && view === "anatomy") {
    warnings.push("Labels are hidden in anatomy mode; acceptable, but less useful educationally.");
  }

  return {
    ok: errors.length === 0,
    version: HEART_SCIENCE_VERSION,
    errors,
    warnings,
    normalized: {
      view,
      bpm: Math.round(bpm),
      labels: spec.labels !== false,
      running: spec.running !== false,
      circulationPath: CANONICAL_CIRCULATION,
      oxygenation: OXYGENATION,
      pulmonaryArteryColor: "blue",
      pulmonaryVeinColor: "red"
    }
  };
}
