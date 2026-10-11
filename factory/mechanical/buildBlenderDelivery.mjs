import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export function mechanicalDeliveryPaths(runDir) {
  const root = resolve(runDir);
  return {
    runDir: root,
    obj: join(root, "final_painted.obj"),
    materials: join(root, "final_materials.json"),
    outDir: join(root, "nahlaty_delivery"),
    glb: join(root, "nahlaty_delivery", "scene.glb"),
    preview: join(root, "nahlaty_delivery", "hero.png"),
    sceneSpec: join(root, "nahlaty_delivery", "scene-spec.json")
  };
}

export function buildBlenderCommand(runDir, {
  blender = process.env.BLENDER_BIN || "blender",
  tone = "AgX",
  samples = 256
} = {}) {
  const p = mechanicalDeliveryPaths(runDir);
  return {
    command: blender,
    args: [
      "--background",
      "--python", resolve("factory/blender/export_pbr_glb.py"),
      "--",
      "--obj", p.obj,
      "--materials", p.materials,
      "--out", p.glb,
      "--preview", p.preview,
      "--tone", tone,
      "--samples", String(samples)
    ],
    paths: p
  };
}

export function verifyDeliveryInputs(runDir) {
  const p = mechanicalDeliveryPaths(runDir);
  const missing = [p.obj, p.materials].filter((path) => !existsSync(path));
  return { ok: missing.length === 0, missing, paths: p };
}

export function runBlenderDelivery(runDir, options = {}) {
  const check = verifyDeliveryInputs(runDir);
  if (!check.ok) {
    return { ok: false, stage: "preflight", errors: check.missing.map((p) => `missing ${p}`), paths: check.paths };
  }

  mkdirSync(dirname(check.paths.glb), { recursive: true });
  const cmd = buildBlenderCommand(runDir, options);
  const result = spawnSync(cmd.command, cmd.args, {
    cwd: options.cwd || process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  const errors = [];
  if (result.error) errors.push(String(result.error));
  if (result.status !== 0) errors.push(`Blender exit code ${result.status}`);
  if (!existsSync(check.paths.glb)) errors.push("GLB was not created");

  return {
    ok: errors.length === 0,
    stage: "blender-delivery",
    command: cmd.command,
    args: cmd.args,
    paths: check.paths,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    errors
  };
}
