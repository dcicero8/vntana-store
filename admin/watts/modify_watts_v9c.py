# v9 pass 3 against the photo: fatter ball-valve bodies (grooved ends stay true 2" pipe) and a deeper sump bowl.
# Blender -b 2000B-FP_v9.blend --python modify_watts_v9c.py
import bpy, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "rpz"))
import vlib as V
sc = bpy.data.scenes["Watts_2000BFP"]
if bpy.context.window: bpy.context.window.scene = sc
O = bpy.data.objects
AX = 0.047                      # current pipe-axis height (from the v9 report)
VALVE_R = 1.22                  # extra radial swell for the ball-valve bodies
def smooth(e0, e1, x):          # 0 below e0, 1 above e1
    t = max(0.0, min(1.0, (x - e0)/(e1 - e0))); return t*t*(3 - 2*t)
for tag in ("Inlet", "Outlet"):
    o = O[f"ShutoffValve_{tag}"]
    for v in o.data.vertices:
        ax = abs(v.co.x)
        k = 1 + (VALVE_R - 1)*(1 - smooth(0.203, 0.214, ax))       # full swell on the body, none on the grooved end
        v.co.y *= k; v.co.z = AX + (v.co.z - AX)*k
    o.data.update()
# deeper sump: drop the bowl's lower vertices (only under the centre housing)
b = O["Body_main"]
xs = [v.co.x for v in b.data.vertices if v.co.z < AX - 0.044]
cx = (min(xs) + max(xs))/2 if xs else -0.016
DROP = 0.017
for v in b.data.vertices:          # bowl floor + its lower fillet only; the side walls stretch down with it
    if v.co.z < AX - 0.043 and abs(v.co.x - cx) < 0.075 and abs(v.co.y) < 0.045:
        v.co.z -= DROP
b.data.update()
# re-ground everything
meshes = [o for o in sc.objects if o.type == 'MESH' and o.users_collection and o.users_collection[0].name not in ("Studio", "Revit_ref", "Context")]
zmin = min(v.co.z for o in meshes for v in o.data.vertices)
for o in meshes:
    for v in o.data.vertices: v.co.z -= zmin
    o.data.update(); V.box_uv(o)
print("V9C axis now", round((AX - zmin)*1000), "mm")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "2000B-FP_v9.blend"), compress=True)
vl = bpy.context.view_layer
for o in vl.objects: o.select_set(o in meshes and o.visible_get())
bpy.ops.export_scene.gltf(filepath=os.path.join(HERE, "2000B-FP_v9.glb"), export_format='GLB', use_selection=True, export_draco_mesh_compression_enable=False,
                          export_apply=True, export_cameras=False, export_lights=False, export_yup=True, export_image_format='JPEG', export_jpeg_quality=90)
print("V9C DONE")
