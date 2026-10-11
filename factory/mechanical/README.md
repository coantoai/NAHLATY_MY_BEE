# NAHLATY Factory — Mechanical Path v1

This branch builds the **first Universal Factory backend path: mechanical / articulated systems** without changing production.

## Fixed target

Input: an educational/mechanical concept.

Output: one semantic 3D assembly that is:
- mechanically coherent,
- split into named parts,
- articulated where appropriate,
- PBR/cinematic,
- exportable as GLB + SceneSpec,
- controllable as Solid / Transparent / Cutaway / Exploded / Inside.

## Selected stack after code review

### Primary generator: SpatiaOS/Procedura
Why it is first:
- emits editable procedural source rather than an opaque image/mesh;
- decomposes into named parts;
- supports typed assembly mates;
- its code explicitly treats LLM declarations as soft priors and **measured geometry as authoritative**;
- has deterministic mesh/contact/clearance analysis;
- can assign per-part PBR materials;
- exports articulation to OpenUSD and URDF;
- can perform physics validation through Isaac Sim;
- MIT licensed.

### Fallback / independent second builder: Pan-Chera/Multi-Agent-CAD
Useful because it is based on build123d/OCP, exports STEP/STL/GLB and has geometry/visual judging and URDF assembly handoff. Its single-part benchmark is strong, but its assembly mode is explicitly a technology preview, so it is **not the primary critical path in v1**.

### Reference implementation: heliosv24/v8-engine
Already independently verified in this repository's isolated research workflow:
- 96 upstream mechanical checks PASS;
- 12/12 in-browser self checks PASS;
- real WebGL scene;
- cutaway and exploded controls work.
It proves the target behavior is implementable, but it is a reference fixture, not the universal generator.

## What “certain before visual test” means

We cannot honestly guarantee that a stochastic generator succeeds on every arbitrary prompt. The factory therefore uses a **fail-closed contract**:

> It either produces an artifact that passes every deterministic gate, or it produces no shippable result.

A bad or incomplete result is never allowed to reach the NAHLATY runtime.

Hard gates:
1. semantic part completeness;
2. geometry compilation;
3. measured contacts / assembly sanity;
4. articulation graph and kinematics;
5. PBR material completeness;
6. GLB/glTF validation;
7. stable semantic IDs + SceneSpec;
8. all five interaction modes addressable from the same assembly.

The final visual run is therefore evidence that a validated build looks right — not the mechanism used to discover whether the architecture makes sense.

## Critical path

```
Meaning / mechanical brief
        ↓
Procedura named-part parametric assembly
        ↓
deterministic geometry + contact + clearance measurement
        ↓
validated mates + joints
        ↓
URDF / OpenUSD kinematics
        ↓
Blender PBR lookdev
        ↓
GLB + glTF validation
        ↓
NAHLATY SceneSpec
        ↓
existing Three.js runtime
        ↓
Solid / Transparent / Cutaway / Exploded / Inside
```

No production code is modified by this branch.
