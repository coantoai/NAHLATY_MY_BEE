"""Nahlaty cinematic heart: first editable Blender blockout, not a finished anatomical model.
Run: blender --background --python tools/blender/build_cinematic_heart.py
Outputs: public/models/nahlaty-heart-blockout.glb
The left-heart educational anatomy and reference appearance require visual review.
"""
import bpy
import math
from mathutils import Vector
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "models" / "nahlaty-heart-blockout.glb"
OUT.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

def material(name, color, roughness=0.5, transmission=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Transmission Weight"].default_value = transmission
    return m

muscle = material("muscle_warm_crimson", (0.35, 0.055, 0.085), 0.43)
inner = material("inner_tissue", (0.65, 0.18, 0.20), 0.53)
vessel = material("vessel_red", (0.48, 0.065, 0.09), 0.38)
valve = material("valve_pale_rose", (0.84, 0.45, 0.41), 0.52)
blood = material("blood_particles", (0.88, 0.10, 0.12), 0.22)

def ellipsoid(name, location, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=40, location=location)
    ob = bpy.context.object
    ob.name = name
    ob.scale = scale
    ob.data.materials.append(mat)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for polygon in ob.data.polygons:
        polygon.use_smooth = True
    return ob

def tube(name, coords, radius, mat):
    curve = bpy.data.curves.new(name + "_path", type="CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 24
    curve.bevel_depth = radius
    curve.bevel_resolution = 5
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(coords) - 1)
    for point, xyz in zip(spline.bezier_points, coords):
        point.co = xyz
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj

# Front cutaway: the near wall is omitted so internal geometry remains visible.
# Objects are deliberately separate for Three.js animation and future sculpting.
ellipsoid("left_ventricle_back_wall", (0.0, -1.75, -0.65), (1.75, 2.55, 0.64), muscle)
ellipsoid("left_atrium_back_wall", (-0.12, 1.75, -0.7), (1.47, 1.32, 0.53), muscle)
ellipsoid("ventricle_inner_lining", (0.0, -1.75, -0.12), (1.44, 2.19, 0.25), inner)
ellipsoid("atrium_inner_lining", (-0.12, 1.75, -0.1), (1.17, 1.06, 0.21), inner)
tube("pulmonary_vein_inlet", [(-3.3, 2.8, -0.2), (-2.3, 2.5, -0.15), (-1.05, 1.9, 0.0)], 0.32, vessel)
tube("aorta_outlet", [(0.8, -2.65, -0.3), (2.25, -2.0, -0.3), (2.8, 0.15, -0.4), (2.2, 2.85, -0.5)], 0.4, vessel)
tube("mitral_annulus", [(-0.85, 0.05, 0.32), (-0.42, 0.13, 0.35), (0.0, 0.17, 0.36), (0.45, 0.13, 0.35), (0.85, 0.05, 0.32)], 0.085, valve)

for side in (-1, 1):
    leaflet = ellipsoid("mitral_leaflet_left" if side < 0 else "mitral_leaflet_right",
                        (side * 0.39, -0.05, 0.47), (0.45, 0.36, 0.07), valve)
    leaflet.rotation_euler[1] = side * 0.27

# Animation anchors exported as named nodes; particle motion stays in Three.js.
for name, position in (
    ("FLOW_INLET", (-2.7, 2.7, 0.55)),
    ("FLOW_MITRAL", (0, 0.1, 0.65)),
    ("FLOW_VENTRICLE", (0, -2.0, 0.65)),
    ("FLOW_AORTA", (2.4, 0.5, 0.25)),
):
    anchor = bpy.data.objects.new(name, None)
    anchor.location = position
    bpy.context.collection.objects.link(anchor)

bpy.ops.export_scene.gltf(filepath=str(OUT), export_format="GLB", export_yup=True)
print("Exported", OUT)
