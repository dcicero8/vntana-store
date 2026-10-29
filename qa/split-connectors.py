#!/usr/bin/env python3
"""Bobcat engine-start harness: make each of the 10 connectors its own named object
with its own material, so the VNTANA viewer can highlight them one at a time.

Run headless:
  /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
      --python qa/split-connectors.py -- qa/harness.glb qa/hotspots.json out.glb [sheet.png]

How each connector is built (from the loose-part analysis of harness.glb):
  WHOLE   the connector already is its own object: rename it, give it mat_<ID>.
  CARVE   the connector is loose parts inside a bigger object (the cable body
          TULKA_PRT.001, or the T12 boot): take every loose part whose nearest
          vertex is within `radius` of the hotspot and whose bounding box is
          smaller than `maxdim`, move those faces into a new object named <ID>.
After export the GLB is re-imported and checked: node names, unique materials,
face counts, hotspot distance. The optional sheet renders each connector (red)
head-on along its hotspot normal for a visual check.
"""
import bpy, bmesh, json, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
GLB, HOT, OUT = argv[0], argv[1], argv[2]
SHEET = argv[3] if len(argv) > 3 else None

WHOLE = {"T14": "B204_PRT.003", "T12": "7405398_PRT.003", "T11": "B204_PRT_NEW_20_19",
         "T9": "7405398_PRT_NEW_24_23", "T7": "B104_PRT_NEW_1_2", "T10": "B307_PRT.003"}
# id: (source object, radius m, max bbox dimension m)
CARVE = {"T43": ("7405398_PRT.003", 0.012, 0.020),      # nozzle ring at the boot's cable exit
         "C111": ("TULKA_PRT.001", 0.035, 0.050),       # plug housing (shells + wire exit)
         "C101": ("TULKA_PRT.001", 0.030, 0.040),       # threaded sensor plug + body
         "T21": ("TULKA_PRT.001", 0.013, 0.030)}        # ring terminal + nut stack
ORDER = ["T14", "T12", "T11", "T43", "T9", "C111", "C101", "T7", "T21", "T10"]

def to_blender(s):
    x, y, z = [float(v.rstrip("m")) for v in s.split()]
    return Vector((x, -z, y))                     # glTF Y-up -> Blender Z-up
H = {h["id"]: (to_blender(h["position"]), to_blender(h["normal"]).normalized())
     for h in json.load(open(HOT))}

def components(o):
    """Loose parts of a mesh: list of (vertex index set, face index list)."""
    me = o.data; parent = list(range(len(me.vertices)))
    def find(a):
        while parent[a] != a: parent[a] = parent[parent[a]]; a = parent[a]
        return a
    for e in me.edges:
        a, b = find(e.vertices[0]), find(e.vertices[1])
        if a != b: parent[a] = b
    comp = {}
    for i in range(len(me.vertices)): comp.setdefault(find(i), [set(), []])[0].add(i)
    for p in me.polygons: comp[find(p.vertices[0])][1].append(p.index)
    return list(comp.values())

def unique_material(o, cid):
    counts = {}
    for p in o.data.polygons: counts[p.material_index] = counts.get(p.material_index, 0) + 1
    src = o.data.materials[max(counts, key=counts.get)] if o.data.materials else None
    mat = src.copy() if src else bpy.data.materials.new("m")
    mat.name = f"mat_{cid}"
    o.data.materials.clear(); o.data.materials.append(mat)
    for p in o.data.polygons: p.material_index = 0

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
bpy.context.view_layer.update()
# the glTF importer instances repeated parts (both boots, both B204 terminals share one mesh);
# make every mesh single-user so a carve or material change touches one object only
for o in bpy.data.objects:
    if o.type == "MESH" and o.data.users > 1: o.data = o.data.copy()

# tag every carve face up front on the untouched meshes (a loose part that falls inside two
# radii goes to the nearer hotspot), then separate by tag so face renumbering cannot bite
tags = {}                                    # src object -> {face index: cid}
for cid, (src_name, radius, maxdim) in CARVE.items():
    src = bpy.data.objects[src_name]; p = H[cid][0]; mw = src.matrix_world
    tag = tags.setdefault(src_name, {})
    for vset, fidx in components(src):
        pts = [mw @ src.data.vertices[i].co for i in vset]
        d = min((q - p).length for q in pts)
        if d > radius: continue
        lo = Vector(map(min, zip(*pts))); hi = Vector(map(max, zip(*pts)))
        if max(hi - lo) > maxdim: continue
        for f in fidx:
            prev = tag.get(f)
            if prev is None or d < prev[1]: tag[f] = (cid, d)
for cid, (src_name, radius, maxdim) in CARVE.items():
    src = bpy.data.objects[src_name]
    faces = [f for f, (c, _) in tags[src_name].items() if c == cid]
    assert faces, f"{cid}: nothing found within {radius*100:.1f} cm of the hotspot"
    if "carve" not in src.data.attributes:
        src.data.attributes.new("carve", "INT", "FACE")
    attr = src.data.attributes["carve"].data
    for f in faces: attr[f].value = ORDER.index(cid) + 1
for cid, (src_name, radius, maxdim) in CARVE.items():
    src = bpy.data.objects[src_name]; want = ORDER.index(cid) + 1
    bpy.ops.object.select_all(action="DESELECT")
    src.select_set(True); bpy.context.view_layer.objects.active = src
    before = set(bpy.data.objects)
    bpy.ops.object.mode_set(mode="EDIT")
    bm = bmesh.from_edit_mesh(src.data); bm.faces.ensure_lookup_table()
    layer = bm.faces.layers.int["carve"]
    bpy.ops.mesh.select_mode(type="FACE"); bpy.ops.mesh.select_all(action="DESELECT")
    faces = [f for f in bm.faces if f[layer] == want]
    for f in faces: f.select = True
    bm.select_flush_mode(); bmesh.update_edit_mesh(src.data)
    bpy.ops.mesh.separate(type="SELECTED"); bpy.ops.object.mode_set(mode="OBJECT")
    new = (set(bpy.data.objects) - before).pop()
    new.name = cid; new.data.name = cid
    unique_material(new, cid)
    print(f"CARVE {cid:5} <- {src_name}: {len(faces)} faces")
for o in bpy.data.objects:
    if o.type == "MESH" and "carve" in o.data.attributes: o.data.attributes.remove(o.data.attributes["carve"])

for cid, src_name in WHOLE.items():
    o = bpy.data.objects[src_name]; o.name = cid; o.data.name = cid
    unique_material(o, cid)
    print(f"WHOLE {cid:5} <- {src_name}: {len(o.data.polygons)} faces")

bpy.ops.object.select_all(action="DESELECT")
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_yup=True, export_apply=True,
                          export_normals=True, export_texcoords=True, export_materials="EXPORT",
                          export_draco_mesh_compression_enable=False, use_selection=False)
print("EXPORTED", OUT, f"{os.path.getsize(OUT)/1e6:.2f} MB")

# ---- verify by re-importing the exported file ---------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=OUT)
bpy.context.view_layer.update()
ok = True
mats_seen = {}
print("\nVERIFY")
for cid in ORDER:
    o = bpy.data.objects.get(cid)
    if not o or o.type != "MESH": print(f"  {cid:5} MISSING"); ok = False; continue
    mats = [m.name for m in o.data.materials if m]
    mw = o.matrix_world; p = H[cid][0]
    d = min((mw @ v.co - p).length for v in o.data.vertices)
    pts = [mw @ v.co for v in o.data.vertices]
    size = Vector(map(max, zip(*pts))) - Vector(map(min, zip(*pts)))
    for m in mats: mats_seen.setdefault(m, []).append(cid)
    flag = "" if (len(mats) == 1 and mats[0].startswith("mat_") and d < 0.01) else "  <-- CHECK"
    if flag: ok = False
    print(f"  {cid:5} faces={len(o.data.polygons):5} mats={mats} hotspot_dist={d*100:.2f}cm "
          f"size_cm={tuple(round(c*100,1) for c in size)}{flag}")
shared = {m: ids for m, ids in mats_seen.items() if len(ids) > 1}
if shared: print("  SHARED MATERIALS:", shared); ok = False
print("  meshes:", len([o for o in bpy.data.objects if o.type == "MESH"]), "materials:", len(bpy.data.materials))
print("RESULT", "PASS" if ok else "FAIL")

if SHEET:
    import numpy as np
    sc = bpy.context.scene
    for o in bpy.data.objects:
        if o.type == "MESH": o.color = (0.78, 0.78, 0.78, 1)
    cam_data = bpy.data.cameras.new("c"); cam_data.type = "ORTHO"; cam_data.clip_start = 0.001
    cam = bpy.data.objects.new("c", cam_data); sc.collection.objects.link(cam); sc.camera = cam
    sc.render.engine = "BLENDER_WORKBENCH"; sh = sc.display.shading
    sh.light = "STUDIO"; sh.color_type = "OBJECT"; sh.show_object_outline = True; sh.show_cavity = True
    sc.render.resolution_x = sc.render.resolution_y = 400
    sc.world = bpy.data.worlds.new("w"); sc.world.color = (1, 1, 1)
    tiles = []
    for row, (dist, width) in enumerate([(0.2, 0.08), (0.4, 0.2)]):
        for cid in ORDER:
            for o in bpy.data.objects:
                if o.type == "MESH": o.color = (0.78, 0.78, 0.78, 1)
            if cid in bpy.data.objects: bpy.data.objects[cid].color = (0.9, 0.1, 0.1, 1)
            p, n = H[cid]
            cam.location = p + n * dist; cam.rotation_euler = (-n).to_track_quat("-Z", "Y").to_euler()
            cam_data.ortho_scale = width
            f = f"/tmp/_v_{row}_{cid}.png"; sc.render.filepath = f; bpy.ops.render.render(write_still=True)
            img = bpy.data.images.load(f); tiles.append(np.array(img.pixels[:]).reshape(400, 400, 4)[::-1])
            bpy.data.images.remove(img); os.remove(f)
    W = 400; sheet = np.ones((2 * W, 10 * W, 4))
    for i, px in enumerate(tiles): sheet[(i // 10) * W:(i // 10 + 1) * W, (i % 10) * W:(i % 10 + 1) * W] = px
    img = bpy.data.images.new("sheet", 10 * W, 2 * W, alpha=True); img.pixels = sheet[::-1].ravel().tolist()
    img.filepath_raw = SHEET; img.file_format = "PNG"; img.save()
    print("SHEET", SHEET)
