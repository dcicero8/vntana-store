# v9 gap-list items 4-7, read off the Watts product photo. Harsher, more industrial edges throughout (bevels <= 0.5 mm).
#  4. test cocks: short cast riser bosses blended into the chamber tops (not tall pipes); chunkier test cocks
#     (white thread tape, hex, body with a big round slotted plug facing out, hex, open threaded port on top), ~2x taller.
#  5. body <-> shutoff joints: hex wrench flats on the body end, a longer bare brass thread, hex union nut on the valve.
#     The white Teflon band is tucked inside the fatter thread (object kept: the parts page references it).
#  6. shutoff (ball) valves: straight cylinder with crisp shoulders, machined bright-brass grooved ends (2" OD, real groove).
#  7. handwheels: flat cast wheel, rectangular section rim, 3 wide flat spokes, 6 square tabs, flush brass button.
# Backup: 2000B-FP_v9_pre_items47.blend.   Blender -b 2000B-FP_v9.blend --python modify_watts_v9k.py
import bpy, bmesh, math, os, sys, shutil
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "rpz"))
import vlib as V
from vlib import MM, prism, ngon, cyl, add, lathe, rrect
sc = bpy.data.scenes["Watts_2000BFP"]
if bpy.context.window: bpy.context.window.scene = sc
V.SC = sc; V.COLL = "Rebuild"
O = bpy.data.objects; MAT = bpy.data.materials
bk = os.path.join(HERE, "2000B-FP_v9_pre_items47.blend")
if not os.path.exists(bk): shutil.copy(bpy.data.filepath, bk)

nip = [v.co for v in O["Nipple_Inlet"].data.vertices]
AX = (min(p.z for p in nip) + max(p.z for p in nip))/2*1000            # pipe axis height (mm)
V.AXZ = AX*MM
CR = 46.0                                                              # chamber radius
cover_top = max(v.co.z for v in O["Cover"].data.vertices)*1000
print("axis", round(AX, 1), "cover top", round(cover_top, 1))

def islands(bm):
    bm.verts.ensure_lookup_table(); seen = set(); out = []
    for v in bm.verts:
        if v.index in seen: continue
        st = [v]; isl = []
        while st:
            w = st.pop()
            if w.index in seen: continue
            seen.add(w.index); isl.append(w); st += [e.other_vert(w) for e in w.link_edges]
        out.append(isl)
    return out
def ext(isl):
    ps = [w.co*1000 for w in isl]
    return [min(p[i] for p in ps) for i in range(3)], [max(p[i] for p in ps) for i in range(3)]
def set_mesh(name, bm, mats, mat_of_face=None, angle=30):
    """Replace an object's mesh (keeps the object, its name and collection) or create it."""
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    for f in bm.faces:
        f.smooth = True
        if mat_of_face: f.material_index = mat_of_face(f)
    for e in bm.edges:
        if len(e.link_faces) == 2 and e.calc_face_angle(0) > math.radians(angle): e.smooth = False
    me = bpy.data.meshes.new(name + "_v9k"); bm.to_mesh(me); bm.free()
    for m in mats: me.materials.append(MAT[m])
    o = O.get(name)
    if o: o.data = me
    else: o = bpy.data.objects.new(name, me); V.coll().objects.link(o)
    V.box_uv(o); return o
def merge_into(obj, bm_add, keep=lambda isl: True):
    bb = bmesh.new(); bb.from_mesh(obj.data)
    kill = [w for isl in islands(bb) if not keep(isl) for w in isl]
    bmesh.ops.delete(bb, geom=kill, context='VERTS')
    n0 = len(bb.faces); me = bpy.data.meshes.new("_t"); bm_add.to_mesh(me); bm_add.free(); bb.from_mesh(me); bpy.data.meshes.remove(me)
    bb.faces.ensure_lookup_table()
    for f in bb.faces[n0:]: f.smooth = True
    bb.to_mesh(obj.data); bb.free(); obj.data.update(); V.box_uv(obj)
    return len(kill)
def hexX(af, x0, x1, bevel=0.4):                                       # hex prism along X on the pipe axis, flats top/bottom
    r = af/2/math.cos(math.pi/6)
    bm = prism(ngon(6, r, rot=0), 0, x1 - x0, bevel=bevel, seg=1)
    bm.transform(Matrix.Translation((x0*MM, 0, AX*MM)) @ Matrix.Rotation(math.radians(90), 4, 'Y')); return bm
def X(s, x): return s*x                                                # mirror helper: s=-1 inlet, +1 outlet

# ======================= 5. joints =======================
body = O["Body_main"]
def keep_body(isl):
    lo, hi = ext(isl); n = len(isl)
    end_plate = n < 200 and min(abs(lo[0]), abs(hi[0])) > 127 and max(abs(lo[0]), abs(hi[0])) < 144
    old_riser = n == 480 and hi[2] - lo[2] > 40 and (abs((lo[0] + hi[0])/2 + 102.4) < 4 or abs((lo[0] + hi[0])/2 - 93.5) < 4)
    return not (end_plate or old_riser)
ends = bmesh.new()
for s in (-1, 1):
    a, b = sorted((X(s, 124.0), X(s, 142.9)))
    add(ends, hexX(93.0, a, b, bevel=0.5))                              # wrench flats on the chamber ends
print("body: removed", merge_into(body, ends, keep_body), "verts (end plates + old riser pipes)")
for tag, s in (("Inlet", -1), ("Outlet", 1)):
    n = O[f"Nipple_{tag}"]                                             # fatter bare brass thread, slightly longer into the nut
    for v in n.data.vertices:
        p = v.co*1000; v.co.y = p.y*1.2*MM; v.co.z = (AX + (p.z - AX)*1.2)*MM
    n.data.update()
    t = O[f"Teflon_{tag}"]                                             # tuck the white band inside the thread
    for v in t.data.vertices:
        p = v.co*1000; v.co.y = p.y*0.9*MM; v.co.z = (AX + (p.z - AX)*0.9)*MM
    t.data.update()

# ======================= 6. ball valves =======================
for tag, s in (("Inlet", -1), ("Outlet", 1)):
    sv = O[f"ShutoffValve_{tag}"]
    bb = bmesh.new(); bb.from_mesh(sv.data); isls = islands(bb)
    main = max(isls, key=len)
    kill = list(main)
    for isl in isls:                                                   # old end plate / flange at the union
        lo, hi = ext(isl)
        if isl is not main and len(isl) < 300 and min(abs(lo[0]), abs(hi[0])) > 150 and max(abs(lo[0]), abs(hi[0])) < 170: kill += isl
    bmesh.ops.delete(bb, geom=list(set(kill)), context='VERTS')
    # profile from the grooved end (|x| 250) to the union (|x| 167): (|x| mm, r mm)
    G = 30.15                                                          # 2" pipe OD / 2
    prof = [(250.0, 0.0), (250.0, G - 1.0), (249.4, G), (234.0, G), (233.4, G - 1.6), (225.6, G - 1.6), (225.0, G),
            (221.0, G), (221.0, 41.5), (218.5, 41.5), (218.5, 46.5), (217.0, 48.0), (178.0, 48.0), (176.5, 46.5),
            (174.0, 44.0), (167.0, 44.0), (167.0, 0.0)]
    pts = [(X(s, x), r) for x, r in prof]
    if s < 0: pts = pts[::-1]
    body_v = lathe(pts, seg=96)
    add(body_v, hexX(90.0, *sorted((X(s, 156.0), X(s, 169.0))), bevel=0.5))  # hex union nut on the valve end
    n0 = len(bb.faces); me = bpy.data.meshes.new("_t"); body_v.to_mesh(me); body_v.free(); bb.from_mesh(me); bpy.data.meshes.remove(me)
    bb.faces.ensure_lookup_table()
    bmesh.ops.recalc_face_normals(bb, faces=bb.faces[n0:])
    bb.faces.ensure_lookup_table()
    for f in bb.faces[n0:]:
        c = f.calc_center_median()*1000
        f.material_index = 1 if abs(c.x) > 220.8 and math.hypot(c.y, c.z - AX) < 32 else 0   # machined grooved end
        f.smooth = True
    for e in bb.edges:
        if len(e.link_faces) == 2 and e.calc_face_angle(0) > math.radians(30): e.smooth = False
    me = bpy.data.meshes.new(f"ShutoffValve_{tag}_v9k"); bb.to_mesh(me); bb.free()
    me.materials.append(MAT["W_CastBronze"]); me.materials.append(MAT["W_Brass"])
    sv.data = me; V.box_uv(sv)

# ======================= 7. handwheels =======================
for tag in ("Inlet", "Outlet"):
    hub = O[f"HandwheelHub_{tag}"]; hw = O[f"Handwheel_{tag}"]
    hp = [v.co*1000 for v in hub.data.vertices]; wp = [v.co*1000 for v in hw.data.vertices]
    cxw = (min(p.x for p in wp) + max(p.x for p in wp))/2; czw = (min(p.z for p in wp) + max(p.z for p in wp))/2
    ymid = (min(p.y for p in wp) + max(p.y for p in wp))/2; yback = max(p.y for p in hp)           # gearbox face
    T = 7.0                                                                                       # wheel thickness
    M = Matrix.Translation((cxw*MM, ymid*MM, czw*MM)) @ Matrix.Rotation(math.radians(90), 4, 'X')  # local z -> world -y
    w = V.ring(44.0*MM, 34.0*MM, T*MM, -T/2*MM, seg=120)              # chunky cast rim (photo)
    for k in range(6):                                                 # square grip tabs
        a = math.radians(30 + 60*k); tab = prism([(42.5, -5.2), (50.5, -5.2), (50.5, 5.2), (42.5, 5.2)], -T/2, T/2, bevel=0.5, seg=1)
        tab.transform(Matrix.Rotation(a, 4, 'Z')); add(w, tab)
    for k in range(3):                                                 # wide flat cast spokes
        a = math.radians(90 + 120*k); sp = prism([(10.0, -12.5), (36.0, -9.0), (36.0, 9.0), (10.0, 12.5)], -T/2 + 0.6, T/2 - 0.6, bevel=0.5, seg=1)
        sp.transform(Matrix.Rotation(a, 4, 'Z')); add(w, sp)
    add(w, cyl(15.0, -T/2 - 1.0, T/2 + 1.5, seg=64, bevel=0.5))      # hub boss
    w.transform(M); set_mesh(f"Handwheel_{tag}", w, ["W_HandwheelRed"], angle=25)
    btn = cyl(7.5, T/2 + 1.5, T/2 + 2.1, seg=48, bevel=0.2)            # flush brass button
    add(btn, cyl(4.0, -(yback - ymid) - 0.5, -T/2 - 0.8, seg=32))      # stem back to the gearbox
    btn.transform(M); set_mesh(f"HandwheelHub_{tag}", btn, ["W_Brass"], angle=25)

# ======================= 4. test cocks =======================
def testcock(face):
    """Vertical test cock from z=0 up; plug faces local -y. Returns (brass, dark, tape) bmeshes."""
    br = prism(ngon(6, 15/2/math.cos(math.pi/6), rot=math.pi/6), 3.5, 9.0, bevel=0.35, seg=1)       # lower hex
    add(br, cyl(7.6, 8.8, 25.2, seg=48, bevel=0.4))                                                    # body
    R = Matrix.Translation((0, 0, 17.0*MM)) @ Matrix.Rotation(math.radians(90), 4, 'X')                # local z -> -y
    add(br, cyl(6.4, 0.0, 10.6, seg=40, bevel=0.3, xform=R))                                           # plug boss
    add(br, cyl(5.4, 10.4, 12.6, seg=40, bevel=0.4, xform=R))                                          # round slotted plug
    add(br, prism(ngon(6, 14/2/math.cos(math.pi/6), rot=math.pi/6), 25.0, 30.5, bevel=0.35, seg=1))  # upper hex
    add(br, cyl(6.9, 30.3, 42.0, seg=48, bevel=0.45))                                                 # threaded port
    dk = cyl(4.2, 41.9, 42.15, seg=32)                                                                 # open bore
    sl = prism(rrect(8.4, 1.3, 0.3), 12.4, 12.75); sl.transform(R @ Matrix.Rotation(math.radians(-25), 4, 'Z')); add(dk, sl)
    tp = cyl(5.9, 0.0, 3.7, seg=40, bevel=0.3)                                                         # white thread tape
    return br, dk, tp
def place(bms, xf):
    for b in bms: b.transform(xf)
    return bms
for i in (1, 2, 3, 4):
    old = O[f"TestCock_{i}"]; ps = [v.co*1000 for v in old.data.vertices]
    cx_, cy_ = (min(p.x for p in ps) + max(p.x for p in ps))/2, (min(p.y for p in ps) + max(p.y for p in ps))/2
    riser = bmesh.new()
    if i in (2, 4):                                                   # short cast boss blended into the chamber top
        top = AX + CR + 11.0
        riser = prism(rrect(21.0, 21.0, 4.0, n=4, cx=cx_, cy=0.0), AX + 25.0, top, bevel=0.8, seg=2)
        for v in riser.verts:                                          # cast draft: wider at the root
            if v.co.z*1000 < AX + CR + 2: v.co.x = cx_*MM + (v.co.x - cx_*MM)*1.18; v.co.y *= 1.18
        xf = Matrix.Translation((cx_*MM, 0, top*MM)); tc_x, tc_y = cx_, 0.0
    elif i == 3:                                                      # brass hex nipple on the cover
        riser = prism(ngon(6, 13/2/math.cos(math.pi/6), rot=math.pi/6, cx=cx_, cy=0.0), cover_top - 0.5, cover_top + 7.0, bevel=0.3, seg=1)
        xf = Matrix.Translation((cx_*MM, 0, (cover_top + 7.0)*MM))
    else:                                                             # TC1: horizontal, out of the back of the inlet valve
        xf = Matrix.Translation((cx_*MM, 47.0*MM, AX*MM)) @ Matrix.Rotation(math.radians(-90), 4, 'X')
    br, dk, tp = place(testcock(None), xf)
    set_mesh(f"TestCock_{i}", br, ["W_Brass"], angle=25)
    set_mesh(f"TestCock_{i}_Port", dk, ["W_BlackPlastic"])
    for f in tp.faces: f.material_index = 1
    add(riser, tp)
    rm = "W_Brass" if i == 3 else "W_CastBronze"
    set_mesh(f"TestCockRiser_{i}", riser, [rm, "W_Teflon"],
             angle=25)

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "2000B-FP_v9.blend"), compress=True)
meshes = [o for o in sc.objects if o.type == 'MESH' and o.users_collection and o.users_collection[0].name not in ("Studio", "Revit_ref", "Context")]
vl = bpy.context.view_layer
for o in vl.objects: o.select_set(o in meshes and o.visible_get())
bpy.ops.export_scene.gltf(filepath=os.path.join(HERE, "2000B-FP_v9.glb"), export_format='GLB', use_selection=True, export_draco_mesh_compression_enable=False,
                          export_apply=True, export_cameras=False, export_lights=False, export_yup=True, export_image_format='JPEG', export_jpeg_quality=90)
print("V9K DONE")
