import argparse
import json
import math
import os
import sys

import bpy


def parse_args():
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        argv = []
    p = argparse.ArgumentParser()
    p.add_argument("--obj", required=True)
    p.add_argument("--materials", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--preview")
    p.add_argument("--tone", default="AgX")
    p.add_argument("--samples", type=int, default=256)
    return p.parse_args(argv)


def load_material_data(path):
    with open(path, "r", encoding="utf-8") as f:
        raw = json.load(f)
    if isinstance(raw, dict) and "parts" in raw:
        return raw
    return {"parts": raw if isinstance(raw, dict) else {}}


def find_assignment(material_data, name):
    parts = material_data.get("parts") or {}
    if name in parts:
        return parts[name]
    key = name.lower().replace(".", "_").replace(" ", "_")
    for part_name, value in parts.items():
        candidate = str(part_name).lower().replace(".", "_").replace(" ", "_")
        if candidate == key or candidate in key or key in candidate:
            return value
    return {}


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_rgba(value):
    value = str(value or "#b8b8b8").strip().lstrip("#")
    if len(value) == 3:
        value = "".join(ch * 2 for ch in value)
    if len(value) != 6:
        value = "b8b8b8"
    rgb = [int(value[i:i+2], 16) / 255 for i in (0, 2, 4)]
    rgb = [srgb_to_linear(v) for v in rgb]
    return (*rgb, 1.0)


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def import_obj(path):
    before = set(bpy.data.objects)
    if hasattr(bpy.ops.wm, "obj_import"):
        bpy.ops.wm.obj_import(filepath=path)
    else:
        bpy.ops.import_scene.obj(filepath=path)
    imported = [obj for obj in bpy.data.objects if obj not in before and obj.type == "MESH"]
    if not imported:
        raise RuntimeError("OBJ import produced no mesh objects")
    return imported


def set_principled_material(obj, spec):
    material = bpy.data.materials.new(name=f"NAHLATY_{obj.name}")
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    color = spec.get("color") or spec.get("baseColor") or "#b8b8b8"
    metalness = float(spec.get("metalness", 0.0) or 0.0)
    roughness = float(spec.get("roughness", 0.45) or 0.45)
    metalness = max(0.0, min(1.0, metalness))
    roughness = max(0.02, min(1.0, roughness))
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_rgba(color)
        bsdf.inputs["Metallic"].default_value = metalness
        bsdf.inputs["Roughness"].default_value = roughness
        if "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = float(spec.get("clearcoat", 0.08) or 0.08)
        elif "Clearcoat" in bsdf.inputs:
            bsdf.inputs["Clearcoat"].default_value = float(spec.get("clearcoat", 0.08) or 0.08)
    obj.data.materials.clear()
    obj.data.materials.append(material)
    obj["nahlaty_semantic_id"] = obj.name
    obj["nahlaty_role"] = str(spec.get("role", ""))


def setup_lookdev(scene, meshes, tone, samples):
    scene.render.engine = "BLENDER_EEVEE_NEXT" if hasattr(bpy.types, "EEVEE_NEXT") else scene.render.engine
    try:
        scene.view_settings.look = "Medium High Contrast"
    except Exception:
        pass
    try:
        scene.view_settings.view_transform = tone
    except Exception:
        for fallback in ("AgX", "Filmic", "Standard"):
            try:
                scene.view_settings.view_transform = fallback
                break
            except Exception:
                continue
    scene.view_settings.exposure = 0.0

    world = bpy.data.worlds.new("NAHLATY_Studio")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.025, 0.03, 0.045, 1.0)
        bg.inputs["Strength"].default_value = 0.22

    def area(name, energy, size, location, rotation, color):
        data = bpy.data.lights.new(name=name, type="AREA")
        data.energy = energy
        data.shape = "DISK"
        data.size = size
        data.color = color
        obj = bpy.data.objects.new(name, data)
        obj.location = location
        obj.rotation_euler = rotation
        scene.collection.objects.link(obj)
        return obj

    area("Key", 1500, 6.5, (5.5, -6.0, 7.0), (math.radians(35), 0, math.radians(38)), (1.0, 0.88, 0.72))
    area("Fill", 800, 7.5, (-5.5, -3.0, 4.0), (math.radians(65), 0, math.radians(-55)), (0.55, 0.7, 1.0))
    area("Rim", 1200, 5.5, (0.0, 5.5, 6.5), (math.radians(-42), 0, math.radians(180)), (1.0, 0.78, 0.5))

    mins = [float("inf")] * 3
    maxs = [float("-inf")] * 3
    for obj in meshes:
        for corner in obj.bound_box:
            world_corner = obj.matrix_world @ mathutils.Vector(corner)
            for i in range(3):
                mins[i] = min(mins[i], world_corner[i])
                maxs[i] = max(maxs[i], world_corner[i])

    center = [(mins[i] + maxs[i]) / 2 for i in range(3)]
    extent = max(maxs[i] - mins[i] for i in range(3)) or 1.0

    cam_data = bpy.data.cameras.new("NAHLATY_Camera")
    cam_data.lens = 58
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = extent * 2.6
    cam_data.dof.aperture_fstop = 4.0
    cam = bpy.data.objects.new("NAHLATY_Camera", cam_data)
    scene.collection.objects.link(cam)
    cam.location = (center[0] + extent * 1.35, center[1] - extent * 2.15, center[2] + extent * 1.05)
    scene.camera = cam

    direction = mathutils.Vector(center) - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()

    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    if hasattr(scene, "cycles"):
        scene.cycles.samples = samples


def export_glb(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=False,
        export_cameras=True,
        export_lights=False,
        export_materials="EXPORT",
        export_yup=True,
        export_apply=True
    )


def render_preview(path):
    if not path:
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    scene = bpy.context.scene
    scene.render.filepath = path
    scene.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)


def main():
    args = parse_args()
    reset_scene()

    global mathutils
    import mathutils

    meshes = import_obj(args.obj)
    materials = load_material_data(args.materials)

    for obj in meshes:
        spec = find_assignment(materials, obj.name)
        set_principled_material(obj, spec)

    setup_lookdev(bpy.context.scene, meshes, args.tone, args.samples)
    export_glb(args.out)
    render_preview(args.preview)

    print(json.dumps({
        "ok": True,
        "meshCount": len(meshes),
        "glb": args.out,
        "preview": args.preview or None,
        "tone": args.tone
    }))


if __name__ == "__main__":
    main()
