import { validateMechanicalManifest } from "../core/mechanicalContract.mjs";

export const MECHANICAL_STACK = Object.freeze({
  generator: {
    primary: "SpatiaOS/Procedura",
    fallback: "Pan-Chera/Multi-Agent-CAD",
    policy: "part-first parametric CAD; never accept image-only geometry"
  },
  geometryKernel: ["OpenSCAD/Manifold", "build123d/OCP"],
  semanticAssembly: "named parts + measured mates; measured geometry overrides model-declared coordinates",
  motion: "OpenUSD + URDF; deterministic joint/tree validation; physics validation when available",
  lookdev: "Blender PBR",
  delivery: "GLB/glTF + NAHLATY SceneSpec",
  runtime: "existing NAHLATY Three.js runtime",
  referenceFixture: "heliosv24/v8-engine"
});

export const MECHANICAL_STAGES = Object.freeze([
  {
    id: "brief",
    input: "educational intent + required scientific/mechanical facts",
    output: "mechanical blueprint",
    hardGate: "all required parts, roles, dimensions, relationships and intended motions are explicit"
  },
  {
    id: "generate",
    input: "mechanical blueprint",
    output: "editable parametric named-part assembly",
    hardGate: "source compiles; no monolithic anonymous mesh"
  },
  {
    id: "measure",
    input: "compiled assembly",
    output: "measured part bounds, contacts, clearances and axes",
    hardGate: "measured geometry is authoritative over guessed coordinates"
  },
  {
    id: "assemble",
    input: "measured parts",
    output: "validated static mates + moving joints",
    hardGate: "no orphan part, self-joint, unresolved parent, illegal cycle or gross interpenetration"
  },
  {
    id: "simulate",
    input: "articulation graph",
    output: "validated kinematics / URDF / OpenUSD",
    hardGate: "motion constraints pass before visual polish"
  },
  {
    id: "lookdev",
    input: "validated geometry",
    output: "per-part PBR materials + cinematic lighting",
    hardGate: "every visible semantic part has valid PBR material values"
  },
  {
    id: "package",
    input: "validated cinematic assembly",
    output: "GLB + SceneSpec",
    hardGate: "glTF validator passes and semantic ids survive export"
  },
  {
    id: "runtime",
    input: "GLB + SceneSpec",
    output: "solid / transparent / cutaway / exploded / inside interactive scene",
    hardGate: "all five modes are addressable from one semantic 3D assembly"
  }
]);

export function reviewMechanicalReadiness(manifest) {
  const validation = validateMechanicalManifest(manifest);
  return {
    ready: validation.ok,
    stack: MECHANICAL_STACK,
    stages: MECHANICAL_STAGES,
    errors: validation.errors,
    warnings: validation.warnings,
    rule: "No invalid artifact is allowed to reach the NAHLATY runtime."
  };
}
