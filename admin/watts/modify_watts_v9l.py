# v9 gap-list items 8-9 (item 10, sand-cast grain, lives in render_v2/render_watts_v2.py + the export material tweak below).
#  8. position indicators: orange bow-tie (two wings flaring wider toward the tips, round hub, dark centre button);
#     gearbox nameplate shrunk to a small riveted plate beside the indicator (the photo's) instead of covering the whole lid.
#  9. cast markings: the photo's front face has only a feathered flow arrow on the outlet chamber (no AMES / 2000B text),
#     plus a small red tag near the outlet end.
# Backup: 2000B-FP_v9_pre_items810.blend.   Blender -b 2000B-FP_v9.blend --python modify_watts_v9l.py
import bpy, bmesh, math, os, sys, shutil
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "rpz"))
import vlib as V
from vlib import MM, prism, cyl, add, rrect
sc = bpy.data.scenes["Watts_2000BFP"]
if bpy.context.window: bpy.context.window.scene = sc
V.SC = sc; V.COLL = "Rebuild"
O = bpy.data.objects; MAT = bpy.data.materials
bk = os.path.join(HERE, "2000B-FP_v9_pre_items810.blend")
if not os.path.exists(bk): shutil.copy(bpy.data.filepath, bk)
nip = [v.co for v in O["Nipple_Inlet"].data.vertices]
AX = (min(p.z for p in nip) + max(p.z for p in nip))/2*1000

def bbox(o):
    ps = [v.co*1000 for v in o.data.vertices]
    return [min(p[i] for p in ps) for i in range(3)], [max(p[i] for p in ps) for i in range(3)]
def set_mesh(name, bm, mats, angle=25):
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    for f in bm.faces: f.smooth = True
    for e in bm.edges:
        if len(e.link_faces) == 2 and e.calc_face_angle(0) > math.radians(angle): e.smooth = False
    me = bpy.data.meshes.new(name + "_v9l"); bm.to_mesh(me); bm.free()
    for m in mats: me.materials.append(MAT[m])
    o = O.get(name)
    if o: o.data = me
    else: o = bpy.data.objects.new(name, me); V.coll().objects.link(o)
    V.box_uv(o); return o
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
def tagmat():
    m = MAT.get("W_TagRed") or MAT.new("W_TagRed"); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (0.42, 0.09, 0.07, 1); b.inputs["Metallic"].default_value = 0.5; b.inputs["Roughness"].default_value = 0.45
    return m

# ======================= 8. indicators + nameplates =======================
for tag, s in (("Inlet", -1), ("Outlet", 1)):
    lo, hi = bbox(O[f"Indicator_{tag}"]); icx = (lo[0] + hi[0])/2; zb = lo[2]
    ind = cyl(4.6, zb - 0.2, zb + 4.5, seg=32, cx=icx, bevel=0.3)                                  # stem neck
    add(ind, cyl(7.6, zb + 3.5, zb + 20.5, seg=48, cx=icx, bevel=0.5))                              # hub
    for sx in (-1, 1):                                                                      # wings, flaring toward the tips
        wing = [(icx + sx*5.0, -5.4), (icx + sx*21.5, -10.6), (icx + sx*21.5, 10.6), (icx + sx*5.0, 5.4)]
        if sx < 0: wing = wing[::-1]
        add(ind, prism(wing, zb + 4.5, zb + 17.0, bevel=0.5, seg=1))
        for k in (-1, 1):                                                                   # moulded grip ridges on each wing face
            add(ind, prism(rrect(1.4, 18.0, 0.5, n=2, cx=icx + sx*13.5 + k*3.5, cy=0), zb + 16.8, zb + 17.7, bevel=0.2, seg=1))
    set_mesh(f"Indicator_{tag}", ind, ["W_IndicatorOrange"])
    set_mesh(f"IndicatorCap_{tag}", cyl(3.3, zb + 20.4, zb + 21.3, seg=32, cx=icx, bevel=0.2), ["W_BlackPlastic"])
    # small riveted nameplate beside the indicator, toward the outboard end of the lid
    plo, phi = bbox(O[f"GearboxPlate_{tag}"]); zt = plo[2]
    gx_out = phi[0] if s > 0 else plo[0]
    x0, x1 = sorted((gx_out - s*5.0, icx + s*0.0 - s*9.0))
    plate = prism(rrect(x1 - x0, 30.0, 1.5, n=3, cx=(x0 + x1)/2, cy=-6.0), zt, zt + 0.7, bevel=0.15, seg=1)
    for (px, py) in ((x0 + 2.5, -18.5), (x1 - 2.5, -18.5), (x0 + 2.5, 6.5), (x1 - 2.5, 6.5)):
        add(plate, cyl(1.0, zt + 0.6, zt + 1.1, seg=12, cx=px, cy=py, bevel=0.2))
    set_mesh(f"GearboxPlate_{tag}", plate, ["W_Label"])

# ======================= 9. cast markings =======================
body = O["Body_main"]
bb = bmesh.new(); bb.from_mesh(body.data)
kill = []
for isl in islands(bb):
    ps = [w.co*1000 for w in isl]
    if len(isl) < 1200 and min(p.x for p in ps) > 55 and max(p.x for p in ps) < 115 and max(p.y for p in ps) < -33: kill += isl
bmesh.ops.delete(bb, geom=kill, context='VERTS')
print("removed", len(kill), "verts of front text/arrow")
R = 45.3                                                                                     # outlet chamber radius
def wrap(b, relief):                                                                         # (x, s, d) local -> onto the chamber front
    for v in b.verts:
        x, sz, d = v.co.x*1000, v.co.y*1000, v.co.z*1000
        r = math.sqrt(max(R*R - sz*sz, 1.0)) - 0.35 + d
        v.co = Vector((x*MM, -r*MM, (AX + sz)*MM))
    return b
arrow = bmesh.new(); RL = 1.1
ZC = -4.0                                                                                    # arrow sits a touch below the axis
add(arrow, prism([(66.0, ZC - 1.5), (97.0, ZC - 1.5), (97.0, ZC + 1.5), (66.0, ZC + 1.5)], 0, RL, bevel=0.3, seg=1))   # shaft
add(arrow, prism([(95.0, ZC - 6.0), (107.0, ZC), (95.0, ZC + 6.0), (97.5, ZC)], 0, RL, bevel=0.3, seg=1))            # head
for k in range(2):                                                                           # tail fletching
    x0 = 66.0 + 6.0*k
    for sgn in (-1, 1):
        q = [(x0 + 5.0, ZC + sgn*1.0), (x0 + 1.0, ZC + sgn*6.0), (x0 - 1.6, ZC + sgn*6.0), (x0 + 2.4, ZC + sgn*1.0)]
        if sgn < 0: q = q[::-1]
        add(arrow, prism(q, 0, RL, bevel=0.25, seg=1))
wrap(arrow, RL)
n0 = len(bb.faces); me = bpy.data.meshes.new("_t"); arrow.to_mesh(me); arrow.free(); bb.from_mesh(me); bpy.data.meshes.remove(me)
bb.faces.ensure_lookup_table()
for f in bb.faces[n0:]: f.smooth = False
bb.to_mesh(body.data); bb.free(); body.data.update(); V.box_uv(body)
# red tag wrapped on the upper front of the outlet chamber, near the end hex
A0 = math.radians(30)                                                                        # 30 deg up from the front
W, H, T = 21.0, 13.0, 0.5
# build as a thin slab, then wrap around the chamber axis
slab = prism([(114.0 - W/2, -H/2), (114.0 + W/2, -H/2), (114.0 + W/2, H/2), (114.0 - W/2, H/2)], 0.0, T)
bmesh.ops.subdivide_edges(slab, edges=[e for e in slab.edges if abs(e.verts[0].co.y - e.verts[1].co.y) > 1e-6], cuts=8, use_grid_fill=True)
add(slab, cyl(0.9, T - 0.05, T + 0.45, seg=12, cx=114.0 - W/2 + 2.4, cy=0.0, bevel=0.2))
add(slab, cyl(0.9, T - 0.05, T + 0.45, seg=12, cx=114.0 + W/2 - 2.4, cy=0.0, bevel=0.2))
for v in slab.verts:
    x, s_, d = v.co.x*1000, v.co.y*1000, v.co.z*1000
    ang = A0 + s_/R; r = R + 0.05 + d
    v.co = Vector((x*MM, -r*math.cos(ang)*MM, (AX + r*math.sin(ang))*MM))
tagmat()
set_mesh("BodyTag", slab, ["W_TagRed"], angle=40)

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "2000B-FP_v9.blend"), compress=True)
meshes = [o for o in sc.objects if o.type == 'MESH' and o.users_collection and o.users_collection[0].name not in ("Studio", "Revit_ref", "Context")]
vl = bpy.context.view_layer
for o in vl.objects: o.select_set(o in meshes and o.visible_get())
bpy.ops.export_scene.gltf(filepath=os.path.join(HERE, "2000B-FP_v9.glb"), export_format='GLB', use_selection=True, export_draco_mesh_compression_enable=False,
                          export_apply=True, export_cameras=False, export_lights=False, export_yup=True, export_image_format='JPEG', export_jpeg_quality=90)
print("V9L DONE")
