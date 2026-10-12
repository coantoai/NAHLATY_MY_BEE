# NAHLATY — CINEMATIC ASSEMBLY FACTORY

Date: 2026-10-12
Status: PRE-TEST ARCHITECTURE DECISION
Branch: research/asset-hunt-ledger

## Decision

The strongest practical route found for NAHLATY's target is no longer to force one procedural CAD model to produce both structure and cinema.

Use a composable factory:

**Trusted concept/reference → Hyper3D Rodin Gen-2.5 Extreme-High → Hyper3D BANG part separation → deterministic NAHLATY AssemblySpec compiler → optional articulation/simulation → Blender cinematic lookdev → GLB + SceneSpec → existing NAHLATY Runtime**

This is a STRONG CANDIDATE, not yet a NAHLATY production PASS. It survives the pre-test gates strongly enough that the next run would be a confirmation run rather than a discovery experiment.

## Why this route is materially stronger

### 1. Rodin Gen-2.5 handles the visual ceiling

Official API supports:
- image-to-3D and text-to-3D;
- up to five image references;
- Gen-2.5 Extreme-High tier;
- Raw or Quad topology;
- PBR materials;
- base color, metallic, normal, roughness;
- GLB / FBX / OBJ / USDZ / STL;
- custom face-count controls up to 2M in normal API controls;
- very high resolution texture modes, with Extreme-High/HighPack controls;
- deterministic seeds and geometry controls.

Official docs:
- https://docs.hyper3d.ai/en/api-specification/rodin-gen2-5
- https://docs.hyper3d.ai/en/get-started/quick-start

### 2. BANG solves the missing decomposition problem directly

BANG accepts either an existing Rodin asset or a custom GLB/OBJ/STL/FBX/USD-family model.

It supports:
- instruction-guided model splitting;
- split strength 1–12;
- Raw/Quad output;
- up to 2M faces across output parts;
- PBR material regeneration after splitting;
- 2K/4K texture output;
- GLB/USDZ/FBX/OBJ/STL output.

Hyper3D explicitly describes BANG as separating a model into individual parts for interactive inspection, recoloring and reassembly one piece at a time.

Official docs:
- https://docs.hyper3d.ai/en/api-specification/bang
- https://hyper3d.ai/features/mcp/mcp-codex

### 3. Assembly/reassembly should be deterministic and owned by NAHLATY

Do not ask another generative model to invent the exploded/reassembly animation.

After BANG, compile an AssemblySpec from the delivered parts:

For every part store:
- stable part ID;
- semantic name;
- exact home transform matrix;
- bounding box / center / volume;
- material bindings;
- parent/contact relationships;
- optional joint metadata;
- optional scientific ontology ID.

Then derive view states from the same geometry:
- Solid = exact home transforms;
- Transparent = material opacity state;
- Cutaway = clipping planes;
- Exploded = collision-free offsets from home transforms;
- Inside = clipping + controlled transparency;
- Reassemble = deterministic interpolation back to the stored home matrices.

This guarantees the parts can return exactly to the original assembly instead of relying on stochastic generation.

### 4. Build a contact graph

Use mesh proximity/BVH intersections to construct part adjacency.

The graph controls:
- explode directions;
- minimum safe distances;
- assembly order;
- camera focus sequence;
- semantic selection;
- dependency hierarchy.

For an ordinary decomposable object, reverse the explode graph to reconstruct it.

For a physically articulated object, attach real joint data separately.

### 5. Articulation is optional and domain-specific

Mechanical assets:
- BANG split model → SimArt (or another validated kinematic solver) → joint type / axis / pivot / limit → URDF → SceneSpec.

Anatomy:
- do NOT represent biology as rigid joints.
- use trusted anatomical geometry + domain rules/validated deformation/process animation.

Blood, fire, air, electricity and similar phenomena are process layers, not mesh-generation responsibilities.

### 6. Cinematic layer stays explicit

Rodin supplies high-quality PBR geometry/material input.
Blender performs final lookdev:
- AgX;
- HDRI + key/fill/rim;
- physically plausible materials;
- contact shadows;
- DOF;
- controlled volumetrics;
- displacement/normal use;
- hero camera paths;
- optional Cycles proof render.

Export a runtime-safe GLB and recreate the chosen lighting/tone/post contract in the NAHLATY runtime.

### 7. Existing runtime remains

No runtime replacement.

Delivery:
- scene.glb with independent named nodes;
- AssemblySpec;
- SceneSpec;
- optional URDF/joint channel;
- optional process-simulation channel.

Runtime consumes:
- home/exploded transforms;
- visibility;
- opacity;
- clipping;
- selected semantic part;
- camera path;
- joint/process animation.

## Scientific / engineering source gate

For a topic with trusted source geometry, use it instead of hallucinating geometry.

Examples:
- anatomy: HRA / BodyParts3D / cleared NIH assets;
- engineering: source CAD when available;
- molecular: PDB/RCSB-derived geometry;
- geography: source GIS data.

BANG can also accept a custom model, so trusted geometry can enter the same decomposition/material pipeline without Rodin generation.

## Commercial / privacy gates

Current Hyper3D terms say Rodin does not impose an additional restriction on use of generated output, subject to agreement, applicable law and third-party rights. Commercial use still depends on the user's plan and the rights to reference inputs.

The current API data-retention policy states API payloads and generated outputs are retained in active systems for seven days, are not used for training, are not published publicly, and are not made available to other users.

References:
- https://hyper3d.ai/legal/terms
- https://docs.hyper3d.ai/en/legal/data-retention-policy

## Acceptance tests — only after this architecture gate

A confirmation run passes only if:
1. all requested semantic parts exist independently;
2. home pose has no accidental gaps/duplicates;
3. exploded pose has no collisions;
4. reassembly returns every part exactly to its stored home matrix;
5. PBR bindings survive separation;
6. stable node IDs survive GLB export/import;
7. GLB validation passes;
8. runtime five-state controls work;
9. visual output is near the approved cinematic-heart bar;
10. domain science/kinematics passes its own validator.

## Verdict

**STRONG CANDIDATE / GO TO ONE CONFIRMATION RUN.**

Reason: the previously missing combination—high-end PBR geometry plus native part separation plus reassembly-oriented interaction—is now covered by explicit product/API capabilities, while the actual assembly/reassembly logic is made deterministic and owned by NAHLATY.

The experiment is no longer “can this kind of system exist?” It is only “does this exact implementation meet NAHLATY's visual acceptance bar on one representative asset?”
