# v9 placement pass against the product photo (straight-on, equal-length overlay):
#  - actuators ~9 mm further outboard (photo stem spacing ~388 mm)
#  - handwheels lower and further out (hub level with the top of the ball-valve body)
#  - test cocks raised on taller bronze risers (No. 2 / No. 4 on the body, No. 3 on the cover)
# Blender -b 2000B-FP_v9.blend --python modify_watts_v9b.py
import bpy, bmesh, math, os, sys
from mathutils import Matrix, Vector
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "rpz"))
import vlib as V
from vlib import MM, cyl, prism, ngon
sc = bpy.data.scenes["Watts_2000BFP"]
if bpy.context.window: bpy.context.window.scene = sc
V.SC = sc; V.COLL = "Rebuild"
O = bpy.data.objects
def move(name, d):
    o = O.get(name)
    if not o: print("missing", name); return
    for v in o.data.vertices: v.co += Vector(d)
    o.data.update()
for tag, S in (("Inlet", -1), ("Outlet", 1)):
    for base in ("Gearbox", "GearboxPlate", "GearboxGasket", "Indicator", "IndicatorCap", "Handwheel", "HandwheelHub"):
        move(f"{base}_{tag}", (S*0.009, 0, 0))
    for base in ("Handwheel", "HandwheelHub"):
        move(f"{base}_{tag}", (S*0.026, 0, -0.019))
# taller test-cock risers: lift the cock and fill the gap with a bronze riser
def riser(i, lift, r):
    tc = O.get(f"TestCock_{i}"); pts = [v.co for v in tc.data.vertices]
    cx = (min(p.x for p in pts) + max(p.x for p in pts))/2; cy = (min(p.y for p in pts) + max(p.y for p in pts))/2; z0 = min(p.z for p in pts)
    for nm in (f"TestCock_{i}", f"TestCock_{i}_Port"): move(nm, (0, 0, lift))
    bm = cyl(r, (z0 - 0.004)*1000, (z0 + lift + 0.0005)*1000, seg=40, cx=cx*1000, cy=cy*1000, bevel=1.0)
    old = O.get(f"TestCockRiser_{i}")
    if old: bpy.data.objects.remove(old, do_unlink=True)
    o = V.finish(f"TestCockRiser_{i}", bm, "W_CastBronze" if i != 3 else "W_Brass"); V.box_uv(o)
riser(2, 0.016, 8.5); riser(4, 0.016, 8.5); riser(3, 0.008, 6.5)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "2000B-FP_v9.blend"), compress=True)
meshes = [o for o in sc.objects if o.type == 'MESH' and o.users_collection and o.users_collection[0].name not in ("Studio", "Revit_ref", "Context")]
vl = bpy.context.view_layer
for o in vl.objects: o.select_set(o in meshes and o.visible_get())
bpy.ops.export_scene.gltf(filepath=os.path.join(HERE, "2000B-FP_v9.glb"), export_format='GLB', use_selection=True, export_draco_mesh_compression_enable=False,
                          export_apply=True, export_cameras=False, export_lights=False, export_yup=True, export_image_format='JPEG', export_jpeg_quality=90)
print("V9B DONE", len([o for o in vl.objects if o.select_get()]))
