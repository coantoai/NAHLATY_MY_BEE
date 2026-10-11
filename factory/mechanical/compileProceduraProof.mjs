import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

const runDir = resolve(process.argv[2] || "");
if (!runDir) {
  console.error("usage: node compileProceduraProof.mjs <runDir>");
  process.exit(2);
}

const planPath = resolve(runDir, "plan.json");
const legendPath = resolve(runDir, "_parts_color_full", "parts_color_meta.txt");
const motionPath = resolve(runDir, "motion", "manifest.json");
const outDir = resolve(runDir, "nahlaty_delivery");
mkdirSync(outDir, { recursive: true });

if (!existsSync(planPath)) throw new Error("missing plan.json");
if (!existsSync(legendPath)) throw new Error("missing _parts_color_full/parts_color_meta.txt");

const planRaw = JSON.parse(readFileSync(planPath, "utf8"));
const plan = Array.isArray(planRaw) ? planRaw : [];
const byName = new Map(plan.map((p) => [String(p?.name || ""), p]));

const lines = readFileSync(legendPath, "utf8").trim().split(/\r?\n/).slice(1);
const legend = lines.map((line) => {
  const [name, r, g, b, stl] = line.split("\t");
  return {
    name,
    rgb: [Number(r), Number(g), Number(b)],
    stl
  };
}).filter((x) => x.name && x.stl);

function hex(rgb) {
  return "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v * 255))).toString(16).padStart(2, "0")).join("");
}

function materialFor(name, rgb) {
  const n = name.toLowerCase();
  if (/rubber|seal|belt|hose|tire/.test(n)) return { baseColor: hex(rgb), metalness: 0.0, roughness: 0.82 };
  if (/glass|window|lens/.test(n)) return { baseColor: hex(rgb), metalness: 0.0, roughness: 0.08 };
  if (/spark|glow|lamp|led/.test(n)) return { baseColor: hex(rgb), metalness: 0.08, roughness: 0.28 };
  if (/block|shaft|rod|piston|valve|gear|bearing|flywheel|bolt|cam|crank|cylinder/.test(n)) {
    return { baseColor: hex(rgb), metalness: 0.82, roughness: 0.28 };
  }
  return { baseColor: hex(rgb), metalness: 0.45, roughness: 0.38 };
}

const parts = legend.map((entry, index) => {
  const meta = byName.get(entry.name) || {};
  return {
    id: entry.name,
    label: entry.name.replace(/_/g, " "),
    role: String(meta.description || meta.level || "mechanical semantic part"),
    stl: entry.stl,
    order: index,
    material: materialFor(entry.name, entry.rgb)
  };
});

let motion = null;
if (existsSync(motionPath)) {
  motion = JSON.parse(readFileSync(motionPath, "utf8"));
}

const joints = Array.isArray(motion?.joints) ? motion.joints.map((j) => ({
  id: String(j.name || ""),
  type: String(j.type || "fixed"),
  parent: j.parent == null ? null : String(j.parent),
  child: String(j.child || "")
})) : [];

const proofManifest = {
  version: "nahlaty-procedura-proof/v1",
  source: {
    generator: "SpatiaOS/Procedura",
    runDir: basename(runDir)
  },
  parts,
  joints,
  motionValidation: motion?.validation || null,
  artifacts: {
    glb: "scene.glb",
    preview: "hero.png",
    sceneSpec: "scene-spec.json"
  }
};

const sceneSpec = {
  version: "nahlaty-scenespec/v1",
  domain: "mechanical",
  subject: "Procedura mechanical proof",
  asset: {
    format: "glb",
    uri: "scene.glb",
    semanticRoot: "assembly",
    parts: parts.map((p) => ({
      id: p.id,
      label: p.label,
      role: p.role,
      assetNode: p.id,
      order: p.order,
      material: p.material
    }))
  },
  articulation: {
    joints,
    validated: motion?.validation?.ok === true
  },
  views: {
    solid: { enabled: true },
    transparent: { enabled: true },
    cutaway: { enabled: true },
    exploded: { enabled: true },
    inside: { enabled: true }
  },
  cinema: {
    pipeline: "pbr",
    toneMapping: "AgX",
    environment: "studio",
    cameraShots: ["hero"]
  },
  interaction: {
    orbit: true,
    selectPart: true,
    isolatePart: true,
    scrubMotion: joints.length > 0,
    modes: ["solid", "transparent", "cutaway", "exploded", "inside"]
  },
  validation: {
    level: "proof",
    semanticParts: parts.length >= 2,
    geometrySplit: true,
    articulationPresent: joints.length > 0,
    physicsValidated: motion?.validation?.ok === true
  }
};

writeFileSync(resolve(outDir, "proof-manifest.json"), JSON.stringify(proofManifest, null, 2));
writeFileSync(resolve(outDir, "scene-spec.json"), JSON.stringify(sceneSpec, null, 2));

console.log(JSON.stringify({
  ok: parts.length >= 2,
  parts: parts.length,
  joints: joints.length,
  outDir
}, null, 2));
