const clean = (value) => String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9_\-]+/g, "_");

export function proceduraToMechanicalDraft({
  subject,
  revision,
  license = "MIT",
  parts = [],
  joints = [],
  materials = {},
  artifacts = {}
} = {}) {
  return {
    subject,
    units: "mm",
    source: {
      generator: "SpatiaOS/Procedura",
      revision,
      license
    },
    parts: parts.map((part, index) => {
      const id = clean(part.id || part.name || `part_${index + 1}`);
      const material = materials[id] || part.material || {};
      return {
        id,
        label: part.label || part.name || id,
        role: part.role || part.description || "",
        mesh: {
          uri: part.meshUri || part.objPath || part.glbPath || "",
          proceduralSource: part.proceduralSource || part.scadModule || ""
        },
        material: {
          metalness: Number(material.metalness ?? 0),
          roughness: Number(material.roughness ?? 0.5),
          baseColor: material.baseColor || material.color || "#b8b8b8"
        }
      };
    }),
    joints: joints.map((joint, index) => ({
      id: clean(joint.id || joint.name || `joint_${index + 1}`),
      parent: clean(joint.parent),
      child: clean(joint.child),
      type: joint.type || "fixed",
      axis: joint.axis
    })),
    couplings: [],
    capabilities: {
      solid: true,
      transparent: true,
      cutaway: true,
      exploded: true,
      inside: true
    },
    simulation: {
      format: artifacts.urdf ? "urdf" : artifacts.usda ? "openusd" : "none",
      urdf: artifacts.urdf || "",
      usda: artifacts.usda || ""
    },
    render: {
      pipeline: "pbr",
      toneMapping: "aces",
      environment: "studio-hdri-or-generated-room",
      cameraShots: ["hero"]
    },
    validation: {
      geometry: false,
      assembly: false,
      kinematics: false,
      materials: false,
      gltf: false
    },
    artifacts: {
      glb: artifacts.glb || "",
      sceneSpec: artifacts.sceneSpec || ""
    }
  };
}

export function applyMechanicalGateResults(draft, gates = {}) {
  return {
    ...draft,
    validation: {
      ...draft.validation,
      geometry: gates.geometry === true,
      assembly: gates.assembly === true,
      kinematics: gates.kinematics === true,
      materials: gates.materials === true,
      gltf: gates.gltf === true
    }
  };
}
