# Runtime bridge

The mechanical path now ends in the existing Three.js stack rather than a rendered video.

Delivery contract:

```
Procedura
  -> named parametric parts
  -> PBR paint data
  -> Blender lookdev/export
  -> scene.glb
  -> SceneSpec
  -> MechanicalGLBScene
  -> Solid / Transparent / Cutaway / Exploded / Inside
```

The runtime does not replace the model for each mode. It keeps one semantic GLB in memory and changes opacity, clipping, per-part transforms and camera state.

Cinematic responsibility is split deliberately:
- Blender: material authoring, high-quality proof render, semantic GLB packaging.
- Runtime: ACES tone mapping, environment reflections, three-point lighting, camera, bloom, interaction and live view modes.

This preserves interactivity while keeping the look consistent with the offline Blender proof frame.
