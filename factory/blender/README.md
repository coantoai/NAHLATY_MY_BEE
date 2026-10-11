# Mechanical Blender / LookDev bridge

This layer converts Procedura's **already separated and painted** mechanical output into the delivery asset consumed by NAHLATY.

Input:
- `final_painted.obj`
- `final_materials.json`

Output:
- `nahlaty_delivery/scene.glb`
- `nahlaty_delivery/hero.png`

The bridge intentionally does **not** ask Blender to invent geometry. Geometry and semantics are upstream. Blender's job is:
1. preserve named semantic meshes;
2. map the PBR material values;
3. apply the cinematic studio baseline;
4. export one GLB for the runtime;
5. render one proof frame for visual QA.

Procedura already contains a much richer Cycles/AgX paint renderer (edge wear, grime, micro-bump, clearcoat, studio lighting). The NAHLATY bridge reuses the same architectural split: structured geometry first, lookdev second. For interactive delivery, only physically meaningful PBR properties are baked into GLB; camera/light/post effects are recreated by the runtime.
