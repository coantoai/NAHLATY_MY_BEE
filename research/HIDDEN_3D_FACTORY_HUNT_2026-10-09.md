# NAHLATY — Hidden Cinematic 3D Factory Hunt (2026-10-09)

Mission: discover and compose existing working asset factories, not hand-model a heart or engine. Keep production/runtime unchanged.

## Ranked research leads — independently published code and examples, NOT locally integrated

1. **Procedura (Nanjing University)** — https://github.com/SpatiaOS/Procedura ; https://spatiaos.github.io/projects/procedura/ . MIT licensed agentic OpenSCAD/Blender code; prompt/image -> editable code with named parametric parts, mates, geometry compile gates, PBR paint, optional USD/URDF articulations and Isaac physics validation. Studio API POST /api/generate, batch execution. CPU geometry can operate without NVIDIA GPU; external LLM endpoint/API cost remains. Highest-priority ownership-friendly mechanical factory, no scientific heart fidelity claim.
2. **Multi-Agent CAD v2** — https://github.com/Pan-Chera/Multi-Agent-CAD . MIT text->part/assemblies using build123d, exports STEP/STL/GLB/URDF, browser UI, automated geometric and visual validation. Curated complex gallery claims roughly $1, $2, $3 and $13 in LLM cost across selected examples, NOT an average or success-rate measure. Need cinematic PBR/material pass and scientific QA.
3. **SceneCode** — https://github.com/wangpuyi/SceneCode ; https://scene-code.github.io/ . MIT code, text-to-executable indoor environments with multi-part geometry, simulation URDF, and public scene viewer. Indoor scope narrow. Web page inspected but interactive 3D controls not independently actuated.
4. **PAct** — https://github.com/Mobiuslqm/PAct ; https://pact-project.github.io/ . Code MIT, image->part-level GLB, joints/URDF; paper quotes ~15 seconds/object on NVIDIA A800 80GB excluding some textured mesh export. CRITICAL LICENSE BLOCKER: pretrained checkpoint https://huggingface.co/PAct000/PAct is CC BY-NC-SA-4.0, NOT commercially cleared. HF demo https://huggingface.co/spaces/PAct000/PAct currently shows NO APPLICATION FILE. Trained/tested primarily on 7 household categories and shallow joint trees, not complex organ or engine.
5. **svVascularize** — https://github.com/SimVascular/svVascularize ; scientific procedural vascular generator with Python API, geometry + multi-fidelity hemodynamics; SimVascular BSD ecosystem. Domain-specialized, no cinematic finished heart promised.
6. **NeuroMorphoVis, Blue Brain/EPFL** — https://github.com/BlueBrain/NeuroMorphoVis ; archived project! Actual Blender/Python CLI and batch tools for neuron morphology meshes, astrocytes, synapses and high-quality renders, with editable .blend/OBJ/STL/PLY. Verify code and data licensing separately and pinned Blender compatibility.
7. **OpenTopos** — https://github.com/gaoypeng/opentopos ; multi-agent Blender bpy source-code projects per named part, GLB and URDF export and vision critic. README admits geometry currently blocky; NO explicit LICENSE detected, do not copy code without rights review.
8. **mesh-to-sim-asset** — https://github.com/nepfaff/mesh-to-sim-asset ; MIT converter from mesh file types to Drake physical simulation asset. Adapter, not geometry factory.
9. **textcad** — https://github.com/dbhavery/textcad ; MIT local Ollama+OpenSCAD CAD+vision correction for small parts, no proprietary API.

## Decision
Prioritize Procedura -> MAC v2 -> SceneCode. Treat svVascularize and NeuroMorphoVis as hidden SPECIALIST factories. Hold PAct checkpoints pending commercial permission; hold OpenTopos until a usable code license appears.

## Required proof / stop points
- Run the project's EXISTING bundled example in isolation; inspect genuine independent meshes, named semantic parts, and articulation.
- Generate visual proof of rendered output vs reference, not a static illustrated mockup.
- Verify actual legal rights to code, model weights, and generated source assets separately.
- Measure generation cost/time, mesh quality, geometry errors, export files, Blender PBR workflow, browser/mobile performance.
- Do not claim a million educational concepts based on raw objects or parametric variants.
- No merge, no runtime replacement, and no paid GPU/API use without approval.

Current status: primary source pages and official README inspected, commercial checkpoint blocker verified. No new local end-to-end generation has run during this hunt.