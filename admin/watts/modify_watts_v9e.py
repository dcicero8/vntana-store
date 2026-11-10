# v9 pass 5 (gap list items 1-3), read off a gridded zoom of the Watts photo:
#  1. centre casting = ONE tapered hex column (vertex fore/aft, truncated by a ~19 mm flat front rib) from the bowl up to the
#     cover seat. The "V" shapes beside it in the photo are where its angled faces cut into the round chambers, so no gussets.
#     Bowl hangs ~1.55 barrel radii below the axis and is narrower (~90 mm) than the seat (~120 mm).
#  2. cover seat = thin hex rim cast into the column (no separate bronze slab); top is open over the dark bore.
#  3. cover = thin (4.5 mm) crisp steel plate, 6 large hex bolts + washers at the corners (heads overhang the edge,
#     threaded studs visible), small red ID tag.
# Removes the old housing, slab, sump and v9d box from Body_main. Backup: 2000B-FP_v9_pre_center.blend
# Blender -b 2000B-FP_v9.blend --python modify_watts_v9e.py
import bpy, bmesh, math, os, sys, shutil
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "rpz"))
import vlib as V
from vlib import MM, prism, ngon, cyl, add
sc = bpy.data.scenes["Watts_2000BFP"]
if bpy.context.window: bpy.context.window.scene = sc
V.SC = sc; V.COLL = "Rebuild"
O = bpy.data.objects
src = bpy.data.filepath
bk = os.path.join(HERE, "2000B-FP_v9_pre_center.blend")
if not os.path.exists(bk): shutil.copy(src, bk)

AXZ, BR = 63.0, 47.0                        # pipe axis height, chamber radius (mm)
body = O["Body_main"]; cover = O["Cover"]; cav = O["Body_Cavity"]

def hull2d(pts):
    pts = sorted(set(pts))
    def cr(o, a, b): return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])
    lo, hi = [], []
    for p in pts:
        while len(lo) >= 2 and cr(lo[-2], lo[-1], p) <= 0: lo.pop()
        lo.append(p)
    for p in reversed(pts):
        while len(hi) >= 2 and cr(hi[-2], hi[-1], p) <= 0: hi.pop()
        hi.append(p)
    return lo[:-1] + hi[:-1]
def corners(poly, ang=20):                  # drop bevel points: keep vertices where the outline turns > ang degrees
    out = []; n = len(poly)
    for i in range(n):
        a = Vector(poly[i]) - Vector(poly[i-1]); b = Vector(poly[(i+1) % n]) - Vector(poly[i])
        if a.length < 1e-6 or b.length < 1e-6: continue
        if math.degrees(a.angle(b)) > ang: out.append(poly[i])
    return out
def round_poly(poly, r, n=6):               # fillet every corner of a closed convex polygon
    out = []; m = len(poly)
    for i in range(m):
        p0, p1, p2 = Vector(poly[i-1]), Vector(poly[i]), Vector(poly[(i+1) % m])
        a = (p0 - p1); b = (p2 - p1); R = min(r, a.length*0.45, b.length*0.45); a.normalize(); b.normalize()
        A = p1 + a*R; B = p1 + b*R
        for k in range(n + 1):
            t = k/n; q = (1-t)**2*A + 2*(1-t)*t*p1 + t*t*B; out.append((q.x, q.y))
    return out
def ray_r(poly, c, ang):                    # distance from c to a convex polygon along direction ang
    d = Vector((math.cos(ang), math.sin(ang))); best = 1e9; m = len(poly)
    for i in range(m):
        p = Vector(poly[i]) - c; q = Vector(poly[(i+1) % m]) - c; e = q - p
        den = d.x*e.y - d.y*e.x
        if abs(den) < 1e-12: continue
        t = (p.x*e.y - p.y*e.x)/den; u = (p.x*d.y - p.y*d.x)/den
        if t > 0 and -1e-9 <= u <= 1+1e-9: best = min(best, t)
    return best

# ---- reference outlines (mm) ----
ctop = [(v.co.x*1000, v.co.y*1000) for v in cover.data.vertices]
cov_hull = hull2d([(round(x, 3), round(y, 3)) for x, y in ctop])
cov_c = []                                   # corner centres: cluster the bevelled hull points
for q in cov_hull:
    for g in cov_c:
        if (Vector(q) - Vector(g[0])).length < 12: g.append(q); break
    else: cov_c.append([q])
cov_c = [(sum(a for a, b in g)/len(g), sum(b for a, b in g)/len(g)) for g in cov_c]
cx = (min(p[0] for p in cov_hull) + max(p[0] for p in cov_hull))/2
C = Vector((cx, 0.0))
cav_poly = hull2d([(round(v.co.x*1000, 3), round(v.co.y*1000, 3)) for v in cav.data.vertices])
cav_z = min(v.co.z for v in cav.data.vertices)*1000
print("cover corners", [(round(x, 1), round(y, 1)) for x, y in cov_c], "cx", round(cx, 1))

# Column plan: flat front/back rib, angled faces, then FLAT SIDE FACES at x = +-A. The side faces slope in elevation
# (wide at the seat, pinched at the pipe axis, wide again at the bowl), so where they cut the round chambers the photo's
# straight-edged triangles appear (a vertical angled face would give a rounded arc instead).
# v9g: the column itself goes STRAIGHT down (constant hex section, vertex to the sides, flat rib fore/aft). The triangles come from
# the chambers: each one pinches from round into a diamond-section neck as it enters the column, and the neck's flat faces cut
# the column's angled faces along straight lines.
RIB, CF, ACOL = 9.5, 80.0, 56.0               # rib half-width, rib front depth, side-vertex half-width
AKEYS = [(-30, ACOL), (300, ACOL)]
def A_of(z):
    if z <= AKEYS[0][0]: return AKEYS[0][1]
    for (z0, a0), (z1, a1) in zip(AKEYS, AKEYS[1:]):
        if z <= z1: return a0 + (a1 - a0)*(z - z0)/(z1 - z0)
    return AKEYS[-1][1]
def colpoly(A, rr=2.5):
    p = [(cx + RIB, CF), (cx - RIB, CF), (cx - A, 0), (cx - RIB, -CF), (cx + RIB, -CF), (cx + A, 0)]
    return round_poly(p, rr, n=3)
FLANGE = cov_hull
N = 192
angs = [2*math.pi*k/N for k in range(N)]
def radii(poly, grow=0.0): return [ray_r(poly, C, a) + grow for a in angs]
rf, rh = radii(FLANGE, 2.0), radii(cav_poly, 0.3)

Z0, ZTOP_COL, ZF0, ZF1 = AXZ - 1.55*BR, 106.0, 110.5, 119.5     # bowl bottom, column top, flange bottom/top
_rc = {}
def rcol(z, k):
    key = round(z, 4)
    if key not in _rc: _rc[key] = radii(colpoly(A_of(z)))
    return _rc[key][k]
rings = []                                   # (z, [r per angle])
FR = 6.0
for th in range(0, 91, 10):                  # rounded bowl bottom
    a = math.radians(th); z = Z0 + FR*(1 - math.cos(a))
    rings.append((z, [rcol(Z0 + FR, k) - FR*(1 - math.sin(a)) for k in range(N)]))
zs = sorted(set([round(Z0 + FR + 3.0*i, 3) for i in range(1, 200) if Z0 + FR + 3.0*i < ZTOP_COL] + [k[0] for k in AKEYS if Z0 + FR < k[0] < ZTOP_COL] + [ZTOP_COL]))
for z in zs: rings.append((z, [rcol(z, k) for k in range(N)]))
for zz, t in ((107.6, 0.35), (109.2, 0.75), (ZF0, 1.0)):          # cast fillet into the underside of the seat rim
    rings.append((zz, [rcol(ZTOP_COL, k) + (rf[k] - 1.2 - rcol(ZTOP_COL, k))*t for k in range(N)]))
rings += [(ZF0 + 0.8, rf), (ZF1 - 0.8, rf), (ZF1, [r - 0.8 for r in rf])]
rings += [(ZF1, rh), (cav_z - 0.3, rh)]
bm = bmesh.new()
vr = [[bm.verts.new(((C.x + r*math.cos(a))*MM, (r*math.sin(a))*MM, z*MM)) for r, a in zip(rr, angs)] for z, rr in rings]
bot = bm.verts.new((C.x*MM, 0, Z0*MM)); topc = bm.verts.new((C.x*MM, 0, (cav_z - 0.3)*MM))
for k in range(N): bm.faces.new((bot, vr[0][(k+1) % N], vr[0][k]))
for A_, B_ in zip(vr, vr[1:]):
    for k in range(N): bm.faces.new((A_[k], A_[(k+1) % N], B_[(k+1) % N], B_[k]))
for k in range(N): bm.faces.new((vr[-1][k], vr[-1][(k+1) % N], topc))
bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])

# ---- strip the old centre pieces out of Body_main and restore the barrel bottom ----
bb = bmesh.new(); bb.from_mesh(body.data); bb.verts.ensure_lookup_table()
seen = set(); kill = []
for v in bb.verts:
    if v.index in seen: continue
    st = [v]; isl = []
    while st:
        w = st.pop()
        if w.index in seen: continue
        seen.add(w.index); isl.append(w); st += [e.other_vert(w) for e in w.link_edges]
    zs = [w.co.z*1000 for w in isl]; xs = [w.co.x*1000 for w in isl]; ys = [w.co.y*1000 for w in isl]
    big_barrel = len(isl) > 5000
    if big_barrel:
        barrel = isl
        for w in isl:
            if w.co.z*1000 < 15.0: w.co.z += 17.0*MM                         # undo the v9c sump drop (it lowered these by 17 mm)
        continue
    centre = abs((min(xs) + max(xs))/2 - cx) < 30 and max(xs) - min(xs) > 60
    if centre and (min(zs) < 60 or max(zs) > 105): kill += isl                # old housing, seat slab, sump, v9d box
print("removing", len(kill), "verts of old centre geometry")
bmesh.ops.delete(bb, geom=kill, context='VERTS')
# ---- chambers -> diamond necks into the column ----
bv = [v for v in barrel if v.is_valid]
def rad(v): return math.hypot(v.co.y*1000, v.co.z*1000 - AXZ)
rings_x = {}
for v in bv: rings_x.setdefault(round(v.co.x*1000, 1), []).append(v)
rx = sorted(k for k, vs in rings_x.items() if len(vs) >= 24)
def pick(cands):
    for k in cands:
        rr_ = [rad(v) for v in rings_x[k]]
        if max(rr_) - min(rr_) < 3.0: return k
xL = pick(sorted([k for k in rx if k <= cx - 76], reverse=True)); xR = pick(sorted(k for k in rx if k >= cx + 76))
bmesh.ops.delete(bb, geom=[v for v in bv if xL + 0.15 < v.co.x*1000 < xR - 0.15], context='VERTS')
new_faces = []
for xb, sgn in ((xL, -1), (xR, 1)):
    ring0 = [v for v in bv if v.is_valid and abs(v.co.x*1000 - xb) < 0.2 and any(e.is_boundary for e in v.link_edges)]
    ring0.sort(key=lambda v: math.atan2(v.co.z*1000 - AXZ, v.co.y*1000))
    th = [math.atan2(v.co.z*1000 - AXZ, v.co.y*1000) for v in ring0]; r0 = [rad(v) for v in ring0]
    Rd = 1.07*sum(r0)/len(r0); d0 = abs(xb - cx)        # +7% so the check cages (r 32.5) stay inside the pinched neck
    def diam(t): return Rd/(abs(math.cos(t)) + abs(math.sin(t)))
    ds = [d0 - (d0 - ACOL)*i/8 for i in range(1, 9)] + [ACOL - 18, 20.0]
    prev = ring0
    for d in ds:
        t = min(1.0, (d0 - d)/(d0 - ACOL)); sm = t*t*(3 - 2*t)
        cur = [bb.verts.new(((cx + sgn*d)*MM, ((1-sm)*r + sm*diam(a))*math.cos(a)*MM, (AXZ + ((1-sm)*r + sm*diam(a))*math.sin(a))*MM)) for a, r in zip(th, r0)]
        n = len(cur)
        for i in range(n): new_faces.append(bb.faces.new((prev[i], prev[(i+1) % n], cur[(i+1) % n], cur[i])))
        prev = cur
    cc = bb.verts.new(((cx + sgn*20.0)*MM, 0, AXZ*MM))
    for i in range(len(prev)): new_faces.append(bb.faces.new((prev[i], prev[(i+1) % len(prev)], cc)))
for f in new_faces:                       # orient outward from the pipe axis
    c = f.calc_center_median(); out = Vector((0, c.y, c.z - AXZ*MM))
    if out.length < 1e-6: out = Vector((1 if c.x > cx*MM else -1, 0, 0))
    f.normal_update()
    if f.normal.dot(out) < 0: f.normal_flip()
    f.material_index = 0; f.smooth = True
print("necks from x", xL, "and", xR)
n0 = len(bb.faces)
me_tmp = bpy.data.meshes.new("_c"); bm.to_mesh(me_tmp); bm.free(); bb.from_mesh(me_tmp); bpy.data.meshes.remove(me_tmp)
bb.faces.ensure_lookup_table()
for f in bb.faces[n0:]: f.material_index = 0; f.smooth = True
bb.to_mesh(body.data); bb.free()
body.data.update(); V.box_uv(body)

# ---- 3. cover: thin crisp plate on the rim ----
CT = 4.5
cb = prism(cov_hull, ZF1, ZF1 + CT, bevel=0.5, seg=2)
cm = bpy.data.materials.get("W_CoverSteel") or bpy.data.materials["W_Stainless"].copy(); cm.name = "W_CoverSteel"
cbs = next(n for n in cm.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
if not cbs.inputs["Base Color"].is_linked: cbs.inputs["Base Color"].default_value = (0.14, 0.14, 0.138, 1)
me = bpy.data.meshes.new("Cover_v9e"); cb.to_mesh(me); cb.free(); me.materials.append(cm)
old_top = max(v.co.z for v in cover.data.vertices)*1000
cover.data = me
for f in cover.data.polygons: f.use_smooth = False
V.box_uv(cover)
dz = (ZF1 + CT - old_top)*MM
for nm in ("TestCock_3", "TestCock_3_Port", "TestCockRiser_3"):
    o = O.get(nm)
    for v in o.data.vertices: v.co.z += dz
    o.data.update()
# 6 big bolts at the corners, heads overhanging the edge, stud threads showing in the gap
bolts = bmesh.new()
for (x, y) in cov_c:
    p = Vector((x, y)); d = (C - p).normalized(); q = p + d*4.0
    add(bolts, cyl(8.6, ZF1 + CT, ZF1 + CT + 1.2, seg=32, cx=q.x, cy=q.y, bevel=0.3))                       # washer
    add(bolts, prism(ngon(6, 7.5, rot=math.atan2(d.y, d.x), cx=q.x, cy=q.y), ZF1 + CT + 1.2, ZF1 + CT + 7.0, bevel=0.5, seg=2))
    add(bolts, cyl(4.4, ZF1 + CT + 6.9, ZF1 + CT + 8.6, seg=24, cx=q.x, cy=q.y, bevel=0.6))                  # thread end
    for k in range(5):                                                                                       # stud under the head
        z0 = ZF1 + 0.9*k
        add(bolts, cyl(4.5 if k % 2 == 0 else 4.0, z0, z0 + 0.9, seg=24, cx=q.x, cy=q.y))
bo = O["CoverBolts"]; me = bpy.data.meshes.new("CoverBolts_v9e"); bolts.to_mesh(me); bolts.free()
me.materials.append(bpy.data.materials["W_Stainless"]); bo.data = me; V.box_uv(bo)
# red ID tag
m = bpy.data.materials.get("W_TagRed") or bpy.data.materials.new("W_TagRed"); m.use_nodes = True
b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
b.inputs["Base Color"].default_value = (0.42, 0.09, 0.07, 1); b.inputs["Metallic"].default_value = 0.5; b.inputs["Roughness"].default_value = 0.45
tag = prism(V.rrect(26, 9, 2.5, cx=0, cy=0), ZF1 + CT - 0.05, ZF1 + CT + 0.35, bevel=0.15, seg=1)
add(tag, cyl(1.1, ZF1 + CT + 0.3, ZF1 + CT + 0.8, seg=12, cx=8, cy=0, bevel=0.2))
tag.transform(Matrix.Translation(((cx - 28)*MM, 22*MM, 0)) @ Matrix.Rotation(math.radians(-8), 4, 'Z'))
to = V.finish("CoverTag", tag, "W_TagRed"); V.box_uv(to)

# ---- re-ground ----
meshes = [o for o in sc.objects if o.type == 'MESH' and o.users_collection and o.users_collection[0].name not in ("Studio", "Revit_ref", "Context")]
zmin = min(v.co.z for o in meshes for v in o.data.vertices)
for o in meshes:
    for v in o.data.vertices: v.co.z -= zmin
    o.data.update()
print("V9E column x %.1f, bowl %.1f below axis; axis now %.1f mm; cover top %.1f" % (cx, 1.55*BR, AXZ - zmin*1000, ZF1 + CT - zmin*1000))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "2000B-FP_v9.blend"), compress=True)
vl = bpy.context.view_layer
for o in vl.objects: o.select_set(o in meshes and o.visible_get())
bpy.ops.export_scene.gltf(filepath=os.path.join(HERE, "2000B-FP_v9.glb"), export_format='GLB', use_selection=True, export_draco_mesh_compression_enable=False,
                          export_apply=True, export_cameras=False, export_lights=False, export_yup=True, export_image_format='JPEG', export_jpeg_quality=90)
print("V9E DONE")
