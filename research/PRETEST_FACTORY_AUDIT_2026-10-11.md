# NAHLATY — PRE-TEST FACTORY AUDIT

Date: 2026-10-11  
Branch: `research/asset-hunt-ledger`  
Rule: **audit first; tests confirm only candidates that survive source/code/license/output-contract review.**

## Acceptance target

A candidate is useful only if it advances the NAHLATY target: high-fidelity real 3D, semantic independent parts, Solid/Transparent/Cutaway/Exploded/Inside, motion/processes, PBR/cinematic rendering, scientific correctness where applicable, and a commercial path.

Statuses:
- **KEEP** — strong role with no known blocker for that role.
- **CONDITIONAL** — technically useful but license/dependency/coverage gap must be isolated or replaced.
- **REJECT** — known mismatch or blocker makes a test decision-irrelevant.
- **REFERENCE** — useful architecture/output example, not a production factory component.

## Pre-test decisions

| Candidate | Role | Decision | Why / hard boundary |
|---|---|---|---|
| Procedura | Parametric mechanical structure / editable assembly | **KEEP — PARTIAL** | Real source-level named parts/assembly and deterministic geometry gates. Our E2E proved generation→parts→SceneSpec→GLB. It is not the cinematic surface generator. |
| Multi-Agent-CAD | Mechanical CAD fallback | **KEEP — PARTIAL** | MIT + structured CAD/STEP/GLB/URDF direction. No evidence it reaches cinematic visual quality; use only for engineering structure. |
| SIMART | GLB → parts + kinematics + URDF | **KEEP — STRONG** | Best current mechanical postprocessor role: decomposes normalized assets and predicts articulation. Not a visual generator. |
| PartCrafter | Image → multiple independent 3D parts | **KEEP — STRONG / CONDITIONAL** | MIT and native multi-part output are highly aligned with semantic decomposition. Replace/audit the default background-removal dependency before commercial lock. No joints/PBR/science guarantee. |
| Hi3DGen | High-fidelity general geometry | **KEEP — STRONG** | Strong image-conditioned geometry; the Stable-X route explicitly removes kaolin/nvdiffrast/flexicube dependencies for commercial use. Geometry role only; requires separate materials/parts. |
| Human Reference Atlas / BodyParts3D | Scientific anatomy geometry + semantics | **KEEP — PASS for source role** | CC BY 4.0 anatomical reference objects/hierarchies are a better source of scientific geometry than stochastic generation. Add attribution, motion/process and lookdev downstream. |
| Material Anything | Object-specific PBR material estimation/refinement | **KEEP — STRONG / CONDITIONAL** | MIT code; released estimator is Apache-2.0; generates albedo/roughness/metallic/bump for varied mesh states. Need exact license pinning for every downloaded checkpoint/base diffusion dependency before commercial lock. |
| MV-Adapter | Multi-view consistent text/image texture generation | **KEEP — CONDITIONAL** | Apache code/adapter, geometry-guided texture generation and <10GB SD2.1 mode. Base SD model carries OpenRAIL-style conditions. Produces texture, not full PBR material semantics. |
| EmbodiedGen V2 | Orchestration / sim-ready conversion / quality gates | **KEEP — STRONG** | Apache orchestration with pluggable 3D backends, collision, URDF, physical properties, validators, affordance/function semantics and simulator export. Use as integration reference/component source, not visual generator. |
| OpenX Clay | Provider/postprocess architecture | **KEEP — REFERENCE/PARTIAL** | Real committed GPU benchmark outputs + decimation/xatlas/export/provider abstraction. Useful postprocess patterns; do not trust its provider license labels without independent audit. |
| Kiln | Procedural Blender asset/scene authoring | **KEEP — PARTIAL** | MIT, editable procedural source, batch/structural review path. Strong for authored procedural domains; not universal organic/scientific generator. |
| cardiac-flow-visualization | Heart motion/cinema architecture | **KEEP — REFERENCE** | MIT code + CC BY source anatomy; deterministic Blender flow/material/camera/validation separation matches the target heart experience. Explicitly illustrative, not CFD/clinical physics. |
| V8 Engine reference | Interactive mechanical runtime benchmark | **KEEP — REFERENCE** | Independently passed upstream tests/browser self-test. Excellent control/cutaway/exploded reference; not a factory. |
| TRELLIS.2 | High-fidelity/PBR general 3D | **CONDITIONAL / HOLD** | Technically strong and MIT at top level, but current textured/PBR pipeline relies on NVIDIA nvdiffrast/nvdiffrec licensing that is not a clean commercial path. Geometry-only may be salvageable if renderer/baker is replaced. |
| Pixal3D | High-fidelity image→PBR 3D | **CONDITIONAL / HOLD** | Very strong reconstruction/PBR direction, MIT top level, but inspected PBR renderer imports nvdiffrast and nvdiffrec components. Do not make it commercial core as shipped. |
| Step1X-3D | Geometry + texture generation | **CONDITIONAL / HOLD** | Apache top level but requirements directly include NVlabs/nvdiffrast. Requires renderer replacement/isolation before commercial consideration. |
| 3DTopia-XL | Text/image→PBR 3D | **CONDITIONAL / HOLD** | Apache model/code claim and attractive PBR output, but official requirements include nvdiffrast. Same dependency trap; no need to test current pipeline as commercial core. |
| StableMaterials | Tileable PBR material generation | **KEEP — CONDITIONAL / SUPPORT** | Generates basecolor/normal/height/roughness/metallic material sets. HF weights are OpenRAIL, not Apache. Useful for generic material library, not object-specific mesh texturing. |
| LumiTex | State-of-the-art PBR texture research | **REJECT commercial core / REFERENCE** | Repo itself Apache, but official README explicitly depends on non-commercial FLUX and Tencent Hunyuan rendering components. Excellent architecture benchmark only. |
| TexGaussian | Mesh-specific PBR materials | **REJECT current commercial core** | Strong PBR role but installation explicitly requires NVlabs/nvdiffrast. Do not test until renderer is replaced. |
| PartField | Open-world 3D part decomposition | **REJECT commercial core** | NVIDIA license is non-commercial. Architecture/reference only. |
| Hunyuan3D 2.1 / Hunyuan3D-Part | PBR generation / part decomposition | **REJECT universal global core** | Useful technology but current license has territory/commercial-scale constraints inconsistent with a clean global core. Benchmark only if separately approved. |
| PAct | Part GLB + joints/URDF | **REJECT commercial core** | Pretrained checkpoint is CC BY-NC-SA; decision blocker despite strong task fit. |
| DIPO | Articulated object generation from dual-state images | **HOLD / REJECT core** | Strong research idea, but inspected repo has no explicit root license and depends on GPT-4o/Azure for graph prediction. |
| OpenTopos | Prompt→Blender parts/joints/URDF | **HOLD** | Interesting architecture but no explicit usable license found; do not copy/integrate. |
| Goo Engine | NPR/anime Blender fork | **REJECT target** | Visual style mismatch with the realistic/cinematic target. |
| MeshAnything V2 | Low-poly topology generation | **REJECT final premium geometry** | Artist topology role can be useful in cleanup research, but its low-poly ceiling is not the target visual geometry generator. |
| MyMeshy | Local orchestrator | **REJECT as core** | Very young project; PBR maps are partly heuristic from albedo and maturity is insufficient for NAHLATY core. |
| Paint3D / TexPainter / SyncMVD | RGB texture generation | **REFERENCE/PARTIAL** | Useful lighting-less or multi-view texture methods, but they are texture-oriented rather than true object PBR material decomposition. Material Anything is a better fit for the PBR role. |

## Critical license correction

Several attractive repositories advertise MIT/Apache at the project level while their **actual inference path imports NVIDIA nvdiffrast/nvdiffrec**. For NAHLATY, repository license and runtime dependency license are separate gates. Therefore TRELLIS.2 PBR, Pixal3D PBR, Step1X-3D, 3DTopia-XL and TexGaussian are not accepted as commercial-core pipelines as currently wired.

This is a pre-test rejection: no runtime experiment is needed to learn that the current dependency chain fails the clean-commercial-path requirement.

## Strongest current composable stack

There is still no single universal factory. The strongest evidence-backed composition is:

### Anatomy / scientific systems
**HRA / BodyParts3D geometry + ontology → semantic part mapping → validated process/motion layer → Material Anything or authored tissue materials → Blender lookdev → NAHLATY SceneSpec/runtime.**

For the heart specifically, use anatomical source geometry and authored/validated blood-flow and valve timing. Do not ask a generic 3D generator to invent the science.

### Mechanical / articulated systems
**Meaning/spec → Procedura or CAD source when exact structure matters → high-fidelity shell if needed → SIMART articulation → URDF/SceneSpec → PBR/material layer → Blender → runtime.**

### General cinematic objects
**Reference image → Hi3DGen geometry → PartCrafter when semantic part geometry is needed → Material Anything / MV-Adapter texture-material path → Blender lookdev → SceneSpec/runtime.**

### Orchestration / hardening
Borrow proven patterns from **EmbodiedGen V2** (physical props, collision, URDF, validators, affordances, simulator export) and **Clay** (provider registry, decimation, xatlas UV, format export), instead of rebuilding those plumbing layers from zero.

## What remains genuinely unresolved

1. A universal scientifically correct geometry generator does not exist in the reviewed set.
2. The best-looking general PBR generators often have a non-commercial NVIDIA renderer dependency in their official path.
3. **Material Anything is now the strongest newly identified mesh-specific PBR candidate**, but every checkpoint/base-model license must be pinned before production.
4. A universal final validator remains unsolved. Validation must stay domain-specific: anatomy ontology/flow rules, mechanical kinematics/collision, chemistry structure rules, etc.
5. Dynamic processes (blood/fire/air/electricity) must be generated/validated by specialist simulation or deterministic rules, not baked into the appearance generator.

## Next action — no blind tests

Do not spend another test on a REJECT/HOLD candidate just to reconfirm its known blocker.

Next implementation proof should be only after source audit of the exact chosen chain. Highest-value proof:
**one high-quality anatomy asset using trusted source geometry + semantic parts + true process motion + PBR material + Blender/runtime**, because it directly tests the user-visible quality target rather than another generic CAD object.

The acceptance bar is the approved cinematic-heart target, not merely "valid GLB".
