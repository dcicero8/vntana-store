# Watts 2000B-FP v9: re-proportion the 1" model to the 2" size (the size in Watts' product photo).
# Targets from spec ES-A-2000B-FP (2"): grooved laying length 500 mm, 2" pipe (60.3 OD), gearbox spacing ~340 mm,
# and the product photo (handwheel ~92 mm, gearbox ~80 mm long).
# Blender -b 2000B-FP_v8.blend --python modify_watts_v9_2in.py
import bpy, bmesh, math, os, sys
from mathutils import Matrix, Vector
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "rpz"))
import vlib as V

sc = bpy.data.scenes["Watts_2000BFP"]
if bpy.context.window: bpy.context.window.scene = sc

AX0 = 0.026            # old pipe-axis height (m)
SX = 250.0 / 168.5     # length: 337 -> 500 mm
SR = 30.2 / 16.4       # radial: 1" grooved end -> 2" (60.3 mm OD)
SA = 1.80              # actuator (gearbox + handwheel) uniform scale, from the photo
SI = 0.75              # indicator relative to the actuator scale (net ~1.35x)
STC = 1.55             # test cocks
SB = 1.45              # cover bolts

O = bpy.data.objects
def deform_pt(p):      # pipe-axis parts: stretch along X, swell radially about the axis
    return Vector((p.x*SX, p.y*SR, AX0 + (p.z - AX0)*SR))

AXIAL = ["ShutoffValve_Inlet", "ShutoffValve_Outlet", "Nipple_Inlet", "Nipple_Outlet", "Teflon_Inlet", "Teflon_Outlet",
         "Body_main", "Body_Cavity", "Cover", "Cover_ORing", "Retainer"] + [o.name for o in O if o.name.startswith(("Check1_", "Check2_"))]
for n in AXIAL:
    o = O.get(n)
    if not o: print("missing", n); continue
    for v in o.data.vertices: v.co = deform_pt(o.matrix_world @ v.co)   # objects have identity transforms
    o.data.update()

def islands(me):
    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table(); seen = set(); out = []
    for v in bm.verts:
        if v.index in seen: continue
        stack = [v]; isl = []
        while stack:
            w = stack.pop()
            if w.index in seen: continue
            seen.add(w.index); isl.append(w.index)
            for e in w.link_edges: stack.append(e.other_vert(w))
        out.append(isl)
    bm.free(); return out

def rigid(name, scale, per_island=False):
    """Scale about each piece's bottom-centre, then move that anchor to where the deformed body puts it."""
    o = O.get(name)
    if not o: print("missing", name); return
    groups = islands(o.data) if per_island else [list(range(len(o.data.vertices)))]
    co = [v.co.copy() for v in o.data.vertices]
    for g in groups:
        pts = [co[i] for i in g]
        anc = Vector(((min(p.x for p in pts)+max(p.x for p in pts))/2, (min(p.y for p in pts)+max(p.y for p in pts))/2, min(p.z for p in pts)))
        new = deform_pt(anc)
        for i in g: o.data.vertices[i].co = new + (co[i] - anc)*scale
    o.data.update()

# cover bolts: each bolt keeps its shape, rides the stretched cover
rigid("CoverBolts", SB, per_island=True)
# test cocks (+ their port caps) stay round, scaled up, anchored on their bosses
for i in range(1, 5):
    o = O.get(f"TestCock_{i}"); p = O.get(f"TestCock_{i}_Port")
    if not o: continue
    pts = [v.co for v in o.data.vertices]
    anc = Vector(((min(q.x for q in pts)+max(q.x for q in pts))/2, (min(q.y for q in pts)+max(q.y for q in pts))/2, min(q.z for q in pts)))
    new = deform_pt(anc)
    for ob in (o, p):
        if not ob: continue
        for v in ob.data.vertices: v.co = new + (v.co - anc)*STC
        ob.data.update()

# actuators: gearbox, plate, gasket, handwheel, hub, indicator scale together about the stem mount, then sit on the deformed valve neck
for tag, S in (("Inlet", -1), ("Outlet", 1)):
    pivot = Vector((S*0.125, 0.0, 0.0555))          # top of the actuator mount plate on the 1" model
    new_pivot = deform_pt(pivot)
    for base in ("Gearbox", "GearboxPlate", "GearboxGasket", "Handwheel", "HandwheelHub", "Indicator", "IndicatorCap"):
        o = O.get(f"{base}_{tag}")
        if not o: print("missing", base, tag); continue
        for v in o.data.vertices: v.co = new_pivot + (v.co - pivot)*SA
        o.data.update()
    # indicator back down to its real size, sitting on the (scaled) gearbox lid
    for base in ("Indicator", "IndicatorCap"):
        o = O.get(f"{base}_{tag}")
        ind = O.get(f"Indicator_{tag}"); pts = [v.co for v in ind.data.vertices]
        anc = Vector((sum(p.x for p in pts)/len(pts), sum(p.y for p in pts)/len(pts), min(p.z for p in pts)))
        for v in o.data.vertices: v.co = anc + (v.co - anc)*SI
        o.data.update()

# ground: put the lowest point on z = 0 again
meshes = [o for o in sc.objects if o.type == 'MESH' and o.users_collection and o.users_collection[0].name not in ("Studio", "Revit_ref", "Context")]
zmin = min((o.matrix_world @ v.co).z for o in meshes for v in o.data.vertices)
for o in meshes:
    for v in o.data.vertices: v.co.z -= zmin
    o.data.update()
for o in meshes: V.box_uv(o)

# darker, duller cover steel (export material + render preset both key off W_Stainless)
m = bpy.data.materials["W_Stainless"]
b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
if not b.inputs["Base Color"].is_linked: b.inputs["Base Color"].default_value = (0.27, 0.27, 0.265, 1)

xs = [(o.matrix_world @ v.co).x for o in meshes for v in o.data.vertices]; zs = [(o.matrix_world @ v.co).z for o in meshes for v in o.data.vertices]
print("V9 bounds mm: length", round((max(xs)-min(xs))*1000), "height", round((max(zs)-min(zs))*1000), "axis z", round((AX0 - zmin)*1000))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "2000B-FP_v9.blend"), compress=True)
vl = bpy.context.view_layer
for o in vl.objects: o.select_set(o in meshes and o.visible_get())
bpy.ops.export_scene.gltf(filepath=os.path.join(HERE, "2000B-FP_v9.glb"), export_format='GLB', use_selection=True, export_draco_mesh_compression_enable=False,
                          export_apply=True, export_cameras=False, export_lights=False, export_yup=True, export_image_format='JPEG', export_jpeg_quality=90)
print("V9 DONE", len([o for o in vl.objects if o.select_get()]))
