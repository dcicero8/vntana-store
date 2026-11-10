# v9 pass 4: the centre body is ONE vertical casting in the product photo (cover seat straight down to the bowl),
# not a housing on top of the barrel plus a separate sump. Add a single filleted column, merged into Body_main.
# Measured from the photo at the 500 mm scale: ~145 mm wide (x), a little deeper than the barrel, base to just under the seat.
# Blender -b 2000B-FP_v9.blend --python modify_watts_v9d.py
import bpy, bmesh, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "rpz"))
import vlib as V
from vlib import prism, rrect, add
sc = bpy.data.scenes["Watts_2000BFP"]
if bpy.context.window: bpy.context.window.scene = sc
V.SC = sc; V.COLL = "Rebuild"
O = bpy.data.objects
body = O["Body_main"]; cav = O.get("Body_Cavity")

# centre of the cover / housing in plan, and the heights to fit between (read from the current geometry, mm)
cover = O["Cover"]; cp = [v.co for v in cover.data.vertices]
cx = (min(p.x for p in cp) + max(p.x for p in cp)) / 2 * 1000
seat_bottom = min(p.z for p in cp) * 1000                     # underside of the cover
cav_z = min(v.co.z for v in cav.data.vertices) * 1000 if cav else seat_bottom - 10
top = min(cav_z - 3.0, seat_bottom - 12.0)                    # stay below the dark bore so the open-cover view still works
W, D, R = 146.0, 104.0, 24.0                                   # plan size and corner radius (mm)
col = prism(rrect(W, D, R, n=10, cx=cx, cy=0), 1.0, top, bevel=0.0)
# fillet the vertical-to-bottom edge and soften the top edge with a bevel on horizontal edges only
bm = col
horiz = [e for e in bm.edges if abs(e.verts[0].co.z - e.verts[1].co.z) < 1e-6]
bmesh.ops.bevel(bm, geom=horiz, offset=0.014, segments=8, affect='EDGES', profile=0.5, clamp_overlap=True)
# gentle draft: the column narrows ~6% toward the bottom like a casting
zmin = min(v.co.z for v in bm.verts); zmax = max(v.co.z for v in bm.verts)
for v in bm.verts:
    t = (v.co.z - zmin) / (zmax - zmin)
    k = 0.94 + 0.06 * t
    v.co.x = cx/1000 + (v.co.x - cx/1000) * k; v.co.y *= k
# merge into Body_main so it stays part of "Body, cast bronze" everywhere (parts list, highlights)
me_tmp = bpy.data.meshes.new("_col"); bm.to_mesh(me_tmp); bm.free()
bb = bmesh.new(); bb.from_mesh(body.data); n0 = len(bb.faces); bb.from_mesh(me_tmp); bpy.data.meshes.remove(me_tmp)
bb.faces.ensure_lookup_table()
for f in bb.faces[n0:]: f.material_index = 0; f.smooth = True
bb.to_mesh(body.data); bb.free(); body.data.update(); V.box_uv(body)
print("V9D column: x centre %.1f mm, %.0f x %.0f mm, z 1..%.1f mm (cover underside %.1f, bore %.1f)" % (cx, W, D, top, seat_bottom, cav_z))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "2000B-FP_v9.blend"), compress=True)
meshes = [o for o in sc.objects if o.type == 'MESH' and o.users_collection and o.users_collection[0].name not in ("Studio", "Revit_ref", "Context")]
vl = bpy.context.view_layer
for o in vl.objects: o.select_set(o in meshes and o.visible_get())
bpy.ops.export_scene.gltf(filepath=os.path.join(HERE, "2000B-FP_v9.glb"), export_format='GLB', use_selection=True, export_draco_mesh_compression_enable=False,
                          export_apply=True, export_cameras=False, export_lights=False, export_yup=True, export_image_format='JPEG', export_jpeg_quality=90)
print("V9D DONE")
