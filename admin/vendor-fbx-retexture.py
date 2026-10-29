#!/usr/bin/env python3
"""Vendor FBX + loose texture folder -> textured GLB(s), one per colorway.

For FBX files whose materials are placeholders (flat colors, texture links pointing at
the artist's own disk) while the baked PBR set sits unreferenced in a Texturas folder.
Every mesh gets ONE material wired to the vendor's maps; nothing is painted or invented.

Run headless:
  /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
      --python admin/vendor-fbx-retexture.py -- <model.fbx> <texture dir> <out dir> <ProductName>

Texture discovery is by filename (case-insensitive): diffuse*_<colorway>, metal*, roug*,
normal*. Outputs <out dir>/<ProductName>_<Colorway>_v2.glb and <ProductName>_v2_check.png.
Also: applies transforms, drops zero-scale objects, puts the pivot at bottom center.
"""
import bpy, sys, os, re, glob
import numpy as np
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
FBX, TEX, OUTDIR, NAME = argv[0], argv[1], argv[2], argv[3]

files = {os.path.basename(f).lower(): f for f in glob.glob(os.path.join(TEX, "*.png")) + glob.glob(os.path.join(TEX, "*.jpg"))}
def find(prefix):
    return next((p for n, p in files.items() if n.startswith(prefix)), None)
diffuse = {re.match(r"diffuse[^_]*_[^_]+_([a-z0-9]+)\.", n).group(1).capitalize(): p
           for n, p in files.items() if re.match(r"diffuse[^_]*_[^_]+_([a-z0-9]+)\.", n)}
maps = {"metallic": find("metal"), "roughness": find("roug"), "normal": find("normal")}
print("TEXTURES diffuse:", {k: os.path.basename(v) for k, v in diffuse.items()},
      "maps:", {k: os.path.basename(v) if v else None for k, v in maps.items()})
assert diffuse, "no diffuse map found"

def build(colorway, diff_path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=FBX)
    for img in list(bpy.data.images): bpy.data.images.remove(img)       # broken artist-disk links
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    dropped = [o.name for o in meshes if min(abs(c) for c in o.matrix_world.to_scale()) < 1e-4]
    for o in meshes:
        if o.name in dropped: bpy.data.objects.remove(o)
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    mat = bpy.data.materials.new(f"{NAME}_{colorway}"); mat.use_nodes = True
    nt = mat.node_tree; bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    def tex(path, colorspace):
        n = nt.nodes.new("ShaderNodeTexImage"); n.image = bpy.data.images.load(path)
        n.image.colorspace_settings.name = colorspace; return n
    nt.links.new(tex(diff_path, "sRGB").outputs["Color"], bsdf.inputs["Base Color"])
    if maps["metallic"]: nt.links.new(tex(maps["metallic"], "Non-Color").outputs["Color"], bsdf.inputs["Metallic"])
    else: bsdf.inputs["Metallic"].default_value = 0
    if maps["roughness"]: nt.links.new(tex(maps["roughness"], "Non-Color").outputs["Color"], bsdf.inputs["Roughness"])
    if maps["normal"]:
        nm = nt.nodes.new("ShaderNodeNormalMap")
        nt.links.new(tex(maps["normal"], "Non-Color").outputs["Color"], nm.inputs["Color"])
        nt.links.new(nm.outputs["Normal"], bsdf.inputs["Normal"])
    for o in meshes:
        o.data.materials.clear(); o.data.materials.append(mat)
        for p in o.data.polygons: p.material_index = 0
    bpy.ops.object.select_all(action="DESELECT")
    for o in meshes: o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    pts = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    lo = Vector(map(min, zip(*pts))); hi = Vector(map(max, zip(*pts)))
    shift = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))
    for o in meshes:
        for v in o.data.vertices: v.co -= shift
    if len(meshes) == 1: meshes[0].name = meshes[0].data.name = f"{NAME}_{colorway}"
    print(f"{colorway}: meshes={len(meshes)} dropped={dropped} size_cm(w,d,h)={tuple(round(c*100,1) for c in (hi-lo))} "
          f"faces={sum(len(o.data.polygons) for o in meshes)}")
    out = os.path.join(OUTDIR, f"{NAME}_{colorway}_v2.glb")
    bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_yup=True, export_apply=True,
                              export_normals=True, export_texcoords=True, export_materials="EXPORT",
                              export_image_format="AUTO", export_draco_mesh_compression_enable=False)
    print("EXPORTED", out, f"{os.path.getsize(out)/1e6:.1f} MB")
    return out

outs = [build(c, p) for c, p in sorted(diffuse.items())]

tiles = []
for out in outs:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=out)
    sc = bpy.context.scene; sc.render.engine = "BLENDER_EEVEE"
    sc.world = bpy.data.worlds.new("w"); sc.world.use_nodes = True
    bg = sc.world.node_tree.nodes["Background"]; bg.inputs[0].default_value = (0.9, 0.9, 0.9, 1); bg.inputs[1].default_value = 1.5
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sun.data.energy = 3
    sun.rotation_euler = (0.8, 0.2, 0.6); sc.collection.objects.link(sun)
    cam = bpy.data.objects.new("c", bpy.data.cameras.new("c")); sc.collection.objects.link(cam); sc.camera = cam
    sc.render.resolution_x = sc.render.resolution_y = 500
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    pts = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    lo = Vector(map(min, zip(*pts))); hi = Vector(map(max, zip(*pts))); ctr = (lo + hi) / 2
    dist = max(hi - lo) * 1.6 + 0.1
    for d in (Vector((1, -1.2, 0.6)), Vector((-1, -1, 0.3)), Vector((0, -0.2, 1))):
        cam.location = ctr + d.normalized() * dist
        cam.rotation_euler = (ctr - cam.location).to_track_quat("-Z", "Y").to_euler()
        f = "/tmp/_rt.png"; sc.render.filepath = f; bpy.ops.render.render(write_still=True)
        img = bpy.data.images.load(f); tiles.append(np.array(img.pixels[:]).reshape(500, 500, 4)[::-1]); bpy.data.images.remove(img)
rows = [np.concatenate(tiles[i:i + 3], axis=1) for i in range(0, len(tiles), 3)]
sheet = np.concatenate(rows, axis=0)
img = bpy.data.images.new("s", sheet.shape[1], sheet.shape[0], alpha=True); img.pixels = sheet[::-1].ravel().tolist()
img.filepath_raw = os.path.join(OUTDIR, f"{NAME}_v2_check.png"); img.file_format = "PNG"; img.save()
print("SHEET", img.filepath_raw)
