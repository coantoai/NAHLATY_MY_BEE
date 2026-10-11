import { assertMechanicalManifest, REQUIRED_VIEW_MODES } from "./mechanicalContract.mjs";

const clean = (value) => String(value ?? "").trim();

export function buildMechanicalSceneSpec(input) {
  const manifest = assertMechanicalManifest(input);

  const parts = manifest.parts.map((part, index) => ({
    id: part.id,
    label: part.label,
    role: part.role,
    assetNode: clean(part.mesh?.node || part.id),
    order: index,
    material: {
      metalness: Number(part.material.metalness),
      roughness: Number(part.material.roughness),
      baseColor: part.material.baseColor || "#b8b8b8"
    }
  }));

  const joints = manifest.joints.map((joint) => ({
    id: joint.id,
    parent: joint.parent,
    child: joint.child,
    type: joint.type,
    ...(joint.axis ? { axis: joint.axis.map(Number) } : {})
  }));

  return {
    version: "nahlaty-scenespec/v1",
    domain: "mechanical",
    subject: manifest.subject,
    asset: {
      format: "glb",
      uri: manifest.artifacts.glb,
      semanticRoot: "assembly",
      parts
    },
    articulation: {
      joints,
      couplings: manifest.couplings || [],
      urdf: manifest.simulation?.urdf || "",
      openusd: manifest.simulation?.usda || ""
    },
    views: Object.fromEntries(REQUIRED_VIEW_MODES.map((mode) => [mode, { enabled: true }])),
    cinema: {
      pipeline: "pbr",
      toneMapping: manifest.render.toneMapping,
      environment: manifest.render.environment,
      cameraShots: manifest.render.cameraShots
    },
    interaction: {
      orbit: true,
      selectPart: true,
      isolatePart: true,
      scrubMotion: true,
      modes: [...REQUIRED_VIEW_MODES]
    },
    provenance: {
      generator: manifest.source.generator,
      revision: manifest.source.revision,
      license: manifest.source.license
    }
  };
}
