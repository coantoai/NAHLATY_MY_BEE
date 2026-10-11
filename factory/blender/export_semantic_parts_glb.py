import argparse
import json
import math
import os
import bpy
from mathutils import Vector

def args():
    argv = __import__("sys").argv
    argv = argv[argv.index("--")+1:] if "--" in argv else []
    p=argparse.ArgumentParser()
    p.add_argument("--manifest", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--preview", required=True)
    return p.parse_args(argv)

def reset():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

def srgb(v):
    v=max(0.0,min(1.0,v))
    return v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4

def rgba(hexv):
    s=str(hexv or "#888888").lstrip("#")
    if len(s)!=6: s="888888"
    vals=[int(s[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(srgb(v) for v in vals)+(1.0,)

def import_stl(path):
    before=set(bpy.data.objects)
    if hasattr(bpy.ops.wm, "stl_import"):
        bpy.ops.wm.stl_import(filepath=path)
    else:
        bpy.ops.import_mesh.stl(filepath=path)
    objs=[o for o in bpy.data.objects if o not in before and o.type=="MESH"]
    if not objs: raise RuntimeError("STL produced no mesh: "+path)
    return objs[0]

def add_area(name,energy,size,location,color):
    d=bpy.data.lights.new(name,type="AREA"); d.energy=energy; d.shape="DISK"; d.size=size; d.color=color
    o=bpy.data.objects.new(name,d); o.location=location; bpy.context.scene.collection.objects.link(o)
    return o

a=args()
reset()
with open(a.manifest,"r",encoding="utf8") as f: manifest=json.load(f)

meshes=[]
for part in manifest["parts"]:
    obj=import_stl(part["stl"])
    obj.name=part["id"]
    obj["nahlaty_semantic_id"]=part["id"]
    obj["nahlaty_role"]=part.get("role","")
    mat=bpy.data.materials.new("PBR_"+part["id"]); mat.use_nodes=True
    bs=mat.node_tree.nodes.get("Principled BSDF")
    pm=part.get("material",{})
    if bs:
        bs.inputs["Base Color"].default_value=rgba(pm.get("baseColor"))
        bs.inputs["Metallic"].default_value=float(pm.get("metalness",0.45))
        bs.inputs["Roughness"].default_value=float(pm.get("roughness",0.38))
        if "Coat Weight" in bs.inputs: bs.inputs["Coat Weight"].default_value=0.08
    obj.data.materials.clear(); obj.data.materials.append(mat)
    meshes.append(obj)

scene=bpy.context.scene
scene.render.engine="BLENDER_EEVEE_NEXT"
try: scene.view_settings.view_transform="AgX"
except: pass
try: scene.view_settings.look="Medium High Contrast"
except: pass
world=bpy.data.worlds.new("NAHLATY_Studio"); scene.world=world; world.use_nodes=True
bg=world.node_tree.nodes.get("Background"); bg.inputs["Color"].default_value=(.008,.012,.022,1); bg.inputs["Strength"].default_value=.22
add_area("Key",1900,6.5,(6,-7,8),(1.0,.82,.62))
add_area("Fill",900,7.0,(-6,-2,4),(.5,.68,1.0))
add_area("Rim",1500,5.0,(0,7,7),(1.0,.68,.38))

corners=[]
for o in meshes:
    corners.extend([o.matrix_world@Vector(c) for c in o.bound_box])
mn=Vector((min(v.x for v in corners),min(v.y for v in corners),min(v.z for v in corners)))
mx=Vector((max(v.x for v in corners),max(v.y for v in corners),max(v.z for v in corners)))
center=(mn+mx)/2
extent=max((mx-mn).x,(mx-mn).y,(mx-mn).z,1.0)

cd=bpy.data.cameras.new("NAHLATY_Camera"); cd.lens=58
cam=bpy.data.objects.new("NAHLATY_Camera",cd); scene.collection.objects.link(cam); scene.camera=cam
cam.location=center+Vector((1.45*extent,-2.15*extent,1.05*extent))
cam.rotation_euler=(center-cam.location).to_track_quat("-Z","Y").to_euler()

os.makedirs(os.path.dirname(a.out),exist_ok=True)
bpy.ops.export_scene.gltf(filepath=a.out,export_format="GLB",export_extras=True,export_materials="EXPORT",export_yup=True,export_apply=True)

scene.render.resolution_x=1280; scene.render.resolution_y=720; scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"; scene.render.filepath=a.preview
bpy.ops.render.render(write_still=True)
print(json.dumps({"ok":True,"parts":len(meshes),"glb":a.out,"preview":a.preview}))
