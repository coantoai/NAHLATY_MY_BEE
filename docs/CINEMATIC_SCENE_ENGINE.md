# NAHLATY — Cinematic Scene Engine Integration

This branch is the protected integration lane for the next cinematic visual-explanation engine. It does not replace the current working product until reviewed.

## Target pipeline

Question / voice / text / file / optional image
→ explanation director
→ scene specification
→ asset/world provider
→ NAHLATY scene graph
→ semantic motion
→ interactive renderer
→ adaptive follow-up.

## Provider adapters

World-generation providers are optional render/asset backends, not the reasoning layer.

- HY-World 2.x: persistent 3D world/asset generation from text or images; useful when a navigable spatial world materially improves explanation.
- SpAItial Echo: candidate hosted 3DGS generation backend; keep behind an adapter and never make core explanation dependent on it.
- Local/browser assets: default fallback for explanatory scenes that need precise semantic control.

## Rules

1. Semantic correctness precedes visual spectacle.
2. Choose 2D, 2.5D, 3D, or hybrid per concept; never force 3D.
3. Motion must encode mechanism, causality, state change, transfer, or attention.
4. Generated worlds must be converted into controllable scene objects before educational interaction.
5. Keep FACT / INFERENCE / UNKNOWN distinct.
6. External provider failure must degrade gracefully to the existing renderer.
7. Mobile/touch performance is a first-class constraint.
8. No provider may silently invent educational facts.

## First vertical slice

“كيف يعمل القلب؟”

Required controllable semantic objects:
- right/left atria
- right/left ventricles
- tricuspid/mitral/pulmonary/aortic valves
- pulmonary and systemic flow paths
- coronary-flow scenario

Required states:
- filling / diastole
- atrial contraction
- ventricular contraction
- ejection
- simplified coronary obstruction scenario

The cinematic layer may enhance tissue, depth, lighting, particles, camera and atmosphere, but the NAHLATY semantic state machine owns timing, focus, labels, causal transitions and user interaction.

## Integration contract (draft)

A future provider adapter should normalize output to:

```js
{
  provider,
  assetType: "mesh" | "3dgs" | "image-layers" | "procedural",
  assets: [{ id, uri, role, transform }],
  cameraHints: [],
  depthAvailable: true,
  semanticBindings: [{ sceneNodeId, assetId }],
  provenance: [],
  limitations: []
}
```

This keeps the core engine provider-independent.
