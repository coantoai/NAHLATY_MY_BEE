export const MECHANICAL_CONTRACT_VERSION = "nahlaty-mechanical/v1";

export const REQUIRED_VIEW_MODES = Object.freeze([
  "solid",
  "transparent",
  "cutaway",
  "exploded",
  "inside"
]);

const JOINT_TYPES = new Set([
  "fixed",
  "revolute",
  "continuous",
  "prismatic",
  "spherical",
  "gear",
  "rack_and_pinion"
]);

const finite = (value) => Number.isFinite(Number(value));

function isVec3(value) {
  return Array.isArray(value) && value.length === 3 && value.every(finite);
}

function normalizeId(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function hasDirectedCycle(parts, joints) {
  const ids = new Set(parts.map((part) => part.id));
  const outgoing = new Map([...ids].map((id) => [id, []]));
  for (const joint of joints) {
    if (joint.type === "gear" || joint.type === "rack_and_pinion") continue;
    if (joint.parent && joint.child && outgoing.has(joint.parent)) {
      outgoing.get(joint.parent).push(joint.child);
    }
  }

  const visiting = new Set();
  const visited = new Set();

  function visit(id) {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const next of outgoing.get(id) ?? []) {
      if (visit(next)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  }

  return [...ids].some(visit);
}

export function normalizeMechanicalManifest(input = {}) {
  const parts = (Array.isArray(input.parts) ? input.parts : []).map((part, index) => ({
    ...part,
    id: normalizeId(part?.id || part?.name || `part_${index + 1}`),
    label: String(part?.label || part?.name || part?.id || `Part ${index + 1}`).trim(),
    role: String(part?.role || "").trim(),
    mesh: part?.mesh ? { ...part.mesh } : null,
    material: part?.material ? { ...part.material } : null
  }));

  const joints = (Array.isArray(input.joints) ? input.joints : []).map((joint, index) => ({
    ...joint,
    id: normalizeId(joint?.id || joint?.name || `joint_${index + 1}`),
    parent: normalizeId(joint?.parent),
    child: normalizeId(joint?.child),
    type: String(joint?.type || "fixed").toLowerCase()
  }));

  const capabilities = Object.fromEntries(
    REQUIRED_VIEW_MODES.map((mode) => [mode, Boolean(input?.capabilities?.[mode])])
  );

  return {
    version: MECHANICAL_CONTRACT_VERSION,
    domain: "mechanical",
    subject: String(input.subject || "").trim(),
    units: String(input.units || "mm").trim(),
    source: {
      generator: String(input?.source?.generator || "").trim(),
      revision: String(input?.source?.revision || "").trim(),
      license: String(input?.source?.license || "").trim()
    },
    parts,
    joints,
    couplings: Array.isArray(input.couplings) ? input.couplings : [],
    capabilities,
    simulation: input.simulation ? { ...input.simulation } : {},
    render: input.render ? { ...input.render } : {},
    validation: input.validation ? { ...input.validation } : {},
    artifacts: input.artifacts ? { ...input.artifacts } : {}
  };
}

export function validateMechanicalManifest(input = {}) {
  const manifest = normalizeMechanicalManifest(input);
  const errors = [];
  const warnings = [];

  if (!manifest.subject) errors.push("subject is required");
  if (manifest.parts.length < 2) errors.push("mechanical assembly needs at least 2 semantic parts");

  const partIds = manifest.parts.map((part) => part.id);
  const partSet = new Set(partIds);
  if (partSet.size !== partIds.length) errors.push("part ids must be unique");
  if (partIds.some((id) => !id)) errors.push("every part needs a stable id");

  for (const part of manifest.parts) {
    if (!part.label) errors.push(`part ${part.id || "(unknown)"} is missing label`);
    if (!part.role) errors.push(`part ${part.id || "(unknown)"} is missing semantic role`);
    if (!part.mesh?.uri && !part.mesh?.primitive && !part.mesh?.proceduralSource) {
      errors.push(`part ${part.id || "(unknown)"} has no geometry source`);
    }
    if (!part.material) {
      errors.push(`part ${part.id || "(unknown)"} has no PBR material`);
    } else {
      for (const key of ["metalness", "roughness"]) {
        if (!finite(part.material[key]) || Number(part.material[key]) < 0 || Number(part.material[key]) > 1) {
          errors.push(`part ${part.id || "(unknown)"} has invalid material.${key}`);
        }
      }
    }
  }

  const jointIds = manifest.joints.map((joint) => joint.id);
  if (new Set(jointIds).size !== jointIds.length) errors.push("joint ids must be unique");

  for (const joint of manifest.joints) {
    if (!JOINT_TYPES.has(joint.type)) errors.push(`joint ${joint.id} has unsupported type ${joint.type}`);
    if (!partSet.has(joint.parent)) errors.push(`joint ${joint.id} parent does not exist`);
    if (!partSet.has(joint.child)) errors.push(`joint ${joint.id} child does not exist`);
    if (joint.parent && joint.parent === joint.child) errors.push(`joint ${joint.id} cannot self-connect`);
    if (["revolute", "continuous", "prismatic"].includes(joint.type) && !isVec3(joint.axis)) {
      errors.push(`joint ${joint.id} requires a numeric axis vec3`);
    }
  }

  if (hasDirectedCycle(manifest.parts, manifest.joints)) {
    errors.push("articulation tree contains a directed cycle; represent loop closures as couplings");
  }

  for (const mode of REQUIRED_VIEW_MODES) {
    if (!manifest.capabilities[mode]) errors.push(`missing required view mode: ${mode}`);
  }

  if (manifest.render.pipeline !== "pbr") errors.push("render.pipeline must be pbr");
  if (!["aces", "agx"].includes(String(manifest.render.toneMapping || "").toLowerCase())) {
    errors.push("render.toneMapping must be ACES or AgX");
  }
  if (!manifest.render.environment) errors.push("render.environment is required");
  if (!Array.isArray(manifest.render.cameraShots) || manifest.render.cameraShots.length < 1) {
    errors.push("at least one cinematic camera shot is required");
  }

  const requiredGates = [
    "geometry",
    "assembly",
    "kinematics",
    "materials",
    "gltf"
  ];
  for (const gate of requiredGates) {
    if (manifest.validation?.[gate] !== true) errors.push(`validation gate not passed: ${gate}`);
  }

  if (!manifest.artifacts?.glb) errors.push("final GLB artifact is required");
  if (!manifest.artifacts?.sceneSpec) errors.push("SceneSpec artifact is required");

  if (!manifest.source.generator) warnings.push("generator source is not recorded");
  if (!manifest.source.revision) warnings.push("generator revision is not pinned");
  if (!manifest.source.license) warnings.push("license is not recorded");

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    manifest
  };
}

export function assertMechanicalManifest(input = {}) {
  const result = validateMechanicalManifest(input);
  if (!result.ok) {
    const error = new Error(`Mechanical factory gate failed:\n- ${result.errors.join("\n- ")}`);
    error.details = result;
    throw error;
  }
  return result.manifest;
}
