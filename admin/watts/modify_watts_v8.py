# Watts 2000B-FP v8: match the product photo more closely.
#  - chunky orange position indicators (chamfered block, raised ridge, dark cap) instead of flat paddles
#  - 3-spoke handwheels with lobed grip rim and brass centre button
#  - test cocks get a slotted screwdriver stem instead of a lever
#  - black gasket line between gearbox and its base; tamper-switch wires removed
# Blender -b 2000B-FP_v6.blend --python modify_watts_v8.py
import bpy, bmesh, math, os, sys
from mathutils import Matrix, Vector
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "rpz"))
import vlib as V
from vlib import MM, add, prism, ngon, rrect, cyl, torus, mirrorX

sc = bpy.data.scenes["Watts_2000BFP"]
if bpy.context.window: bpy.context.window.scene = sc
V.SC = sc; V.COLL = "Rebuild"; V.AXZ = 0.026

def replace(name, bm, mat):
    """Swap an object's mesh in place (keeps name, collection, transforms) or create it."""
    o = bpy.data.objects.get(name)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    th = math.radians(35)
    for f in bm.faces: f.smooth = True
    for e in bm.edges:
        if len(e.link_faces) == 2 and e.calc_face_angle(0) > th: e.smooth = False
    me = bpy.data.meshes.new(name + "_v8"); bm.to_mesh(me); bm.free()
    me.materials.append(bpy.data.materials[mat])
    if o: o.data = me
    else:
        o = bpy.data.objects.new(name, me); V.coll().objects.link(o)
    V.box_uv(o); return o

# ---------------- remove the wiring harness ----------------
for o in [o for o in bpy.data.objects if o.name.startswith("Wire")]: bpy.data.objects.remove(o, do_unlink=True)

for tag, S in (("Inlet", -1), ("Outlet", 1)):
    flip = (lambda bm: mirrorX(bm)) if S == 1 else (lambda bm: bm)
    ix = -125.0   # indicator / stem axis x (inlet side)
    # ---------------- orange position indicator ----------------
    ind = cyl(6.2, 80.8, 84.2, seg=40, cx=ix, bevel=0.6)
    body = [(-15.5, -4.6), (-12.5, -7.6), (12.5, -7.6), (15.5, -4.6), (15.5, 4.6), (12.5, 7.6), (-12.5, 7.6), (-15.5, 4.6)]
    add(ind, prism([(x + ix, y) for x, y in body], 83.8, 95.5, bevel=1.4, seg=3))           # chamfered block
    add(ind, prism(rrect(31, 5.2, 2.4, cx=ix), 95.0, 98.2, bevel=1.0, seg=3))                  # raised centre ridge
    replace(f"Indicator_{tag}", flip(ind), "W_IndicatorOrange")
    replace(f"IndicatorCap_{tag}", flip(cyl(2.6, 98.1, 98.7, seg=32, cx=ix, bevel=0.2)), "W_BlackPlastic")
    # ---------------- gasket line between gearbox base and housing ----------------
    replace(f"GearboxGasket_{tag}", flip(prism(rrect(45.4, 33.4, 4.6, cx=-117), 58.7, 59.6, bevel=0.2, seg=1)), "W_BlackPlastic")
    # ---------------- 3-spoke handwheel with lobed grip rim ----------------
    W = Matrix.Translation((-0.131, -0.027, 0.059)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    hw = torus(22.0, 3.0, seg=128, ms=20, sx=0.9, sy=1.3)
    for k in range(6):                                                                         # grip lobes
        a = math.radians(30 + 60*k); b = bmesh.new()
        bmesh.ops.create_uvsphere(b, u_segments=18, v_segments=12, radius=4.2*MM)
        b.transform(Matrix.Translation((23.6*MM*math.cos(a), 23.6*MM*math.sin(a), 0)) @ Matrix.Rotation(a, 4, 'Z') @ Matrix.Diagonal((0.85, 1.45, 1.0, 1)))
        add(hw, b)
    for k in range(3):                                                                         # cast spokes, wide at the hub
        sp = prism([(6.5, -5.2), (20.5, -3.0), (20.5, 3.0), (6.5, 5.2)], -2.3, 2.3, bevel=1.3, seg=3)
        sp.transform(Matrix.Rotation(math.radians(90 + 120*k), 4, 'Z')); add(hw, sp)
    add(hw, cyl(8.5, -4.2, 3.4, seg=48, bevel=1.4))
    hw.transform(W); replace(f"Handwheel_{tag}", flip(hw), "W_HandwheelRed")
    hub = cyl(3.0, -11, -3.5, seg=24)
    dome = bmesh.new(); bmesh.ops.create_uvsphere(dome, u_segments=32, v_segments=16, radius=5.0*MM)
    bmesh.ops.delete(dome, geom=[v for v in dome.verts if v.co.z < -0.0001], context='VERTS')
    dome.transform(Matrix.Translation((0, 0, 3.2*MM)) @ Matrix.Diagonal((1, 1, 0.55, 1))); add(hub, dome)
    hub.transform(W); replace(f"HandwheelHub_{tag}", flip(hub), "W_Brass")

# ---------------- test cocks: slotted screwdriver stem instead of a lever ----------------
def testcock(x, y, z0, name):
    b = prism(ngon(6, 5.0, rot=math.pi/6, cx=x, cy=y), z0, z0 + 3, bevel=0.4, seg=1)
    add(b, cyl(4.7, z0 + 2.5, z0 + 10.5, seg=40, cx=x, cy=y, bevel=1.8))
    add(b, prism(ngon(6, 5.4, rot=math.pi/6, cx=x, cy=y), z0 + 10, z0 + 14.5, bevel=0.5, seg=1))
    Rf = Matrix.Translation((x*MM, (y - 4.2)*MM, (z0 + 6.5)*MM)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    add(b, cyl(3.4, 0, 3.6, seg=32, bevel=0.6, xform=Rf))                                       # round stem boss on the side
    port = cyl(2.7, z0 + 14.45, z0 + 14.6, seg=24, cx=x, cy=y)
    add(port, prism(rrect(5.6, 0.9, 0.3), 3.3, 3.75, xform=Rf))                                  # screwdriver slot
    replace(name, b, "W_Brass"); replace(name + "_Port", port, "W_BlackPlastic")
for nm, (x, y, z0) in {"TestCock_1": (-128, 21.5, 26), "TestCock_2": (-69, 0, 57.5), "TestCock_3": (-11, 0, 62), "TestCock_4": (63, 0, 57.5)}.items():
    testcock(x, y, z0, nm)

# ---------------- save + export (same settings as v6/v7: raw, JPEG textures) ----------------
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "2000B-FP_v8.blend"), compress=True)
vl = bpy.context.view_layer
skip = set()
for cn in ("Studio", "Revit_ref", "Context"):
    c = bpy.data.collections.get(cn)
    if c: skip |= set(c.all_objects)
for o in vl.objects: o.select_set(o.type == 'MESH' and o.visible_get() and o not in skip and o.location.length < 1e-9)
bpy.ops.export_scene.gltf(filepath=os.path.join(HERE, "2000B-FP_v8.glb"), export_format='GLB', use_selection=True, export_draco_mesh_compression_enable=False,
                          export_apply=True, export_cameras=False, export_lights=False, export_yup=True, export_image_format='JPEG', export_jpeg_quality=90)
print("V8 DONE", len([o for o in vl.objects if o.select_get()]), "meshes exported")
