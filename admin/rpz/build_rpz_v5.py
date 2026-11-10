# Northline v5 = v4 (harsh edges) + group B: industrial shape language for the body and covers.
#  - barrel: plain cast cylinder, crisp shoulders, octagon wrench flats at each union end
#  - check housings: flat-sided rounded-square castings (slight draft) with a seat flange, instead of round bulbous towers
#  - raised parting line (casting flash) along the barrel top/bottom and up the housing sides
#  - relief housing: flat-sided block instead of a revolved bulb
#  - covers: flat machined plates with a centre boss, 4 big hex bolts + washers at the corners (no domes)
#  - lettering on the flat housing faces; arrow moved clear of the wider housing
# Every part keeps its name (the page's parts list / explode use them).
# Blender -b ../watts/2000B-FP_v6.blend --python build_rpz_v5.py -- northline_rpz_v5
import os, sys, re
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import vlib as V
_prism, _fillet = V.prism, V.fillet
def prism(poly, z0, z1, bevel=0.0, seg=3, xform=None):
    return _prism(poly, z0, z1, bevel=min(bevel*0.5, 0.6) if bevel else 0.0, seg=seg, xform=xform)
def cyl(r, z0, z1, seg=48, cx=0, cy=0, bevel=0.0, xform=None):
    return prism(V.ngon(seg, r, cx=cx, cy=cy), z0, z1, bevel=bevel, seg=2, xform=xform)
def fillet(pts, rad, n=6):
    return _fillet(pts, [r*0.6 for r in rad] if isinstance(rad, (list, tuple)) else rad*0.6, n)
V.prism, V.cyl, V.fillet = prism, cyl, fillet

NEW_BODY = r'''
def plate_hole(cx, cy, w, d, rr, r_in, z0, z1, N=96):
    """Rounded-square plate with a round through-hole (seat flange)."""
    outer = V.rrect(w, d, rr, n=8, cx=cx, cy=cy)
    def ray(poly, a):
        dx, dy = math.cos(a), math.sin(a); best = 1e9
        for i in range(len(poly)):
            p = Vector((poly[i][0]-cx, poly[i][1]-cy)); q = Vector((poly[(i+1) % len(poly)][0]-cx, poly[(i+1) % len(poly)][1]-cy)); e = q - p
            den = dx*e.y - dy*e.x
            if abs(den) < 1e-12: continue
            t = (p.x*e.y - p.y*e.x)/den; u = (p.x*dy - p.y*dx)/den
            if t > 0 and -1e-9 <= u <= 1+1e-9: best = min(best, t)
        return best
    bm = bmesh.new(); angs = [2*math.pi*k/N for k in range(N)]
    O0, O1, I0, I1 = [], [], [], []
    for a in angs:
        ro = ray(outer, a)
        for L, r, z in ((O0, ro, z0), (O1, ro, z1), (I0, r_in, z0), (I1, r_in, z1)):
            L.append(bm.verts.new(((cx + r*math.cos(a))*MM, (cy + r*math.sin(a))*MM, z*MM)))
    for i in range(N):
        j = (i+1) % N
        bm.faces.new((O0[i], O0[j], O1[j], O1[i])); bm.faces.new((I1[i], I1[j], I0[j], I0[i]))
        bm.faces.new((O1[i], O1[j], I1[j], I1[i])); bm.faces.new((I0[i], I0[j], O0[j], O0[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:]); return bm

HW, HD = 56.0, 56.0                                                           # check housing plan (x, y)
def body():
    P = [(-95, 0), (-95, 21), (-93, 23), (-88, 26), (88, 26), (93, 23), (95, 21), (95, 0)]
    b = lathe(fillet(P, [0, 0, 1, 2.5, 2.5, 1, 0, 0], 4), seg=96)            # plain cast barrel, crisp shoulders
    R8 = 28.5/math.cos(math.pi/8)
    for s in (-1, 1):                                                         # octagon wrench flats at the union ends
        x0 = 84.0 if s > 0 else -95.0
        o8 = prism(ngon(8, R8, rot=math.pi/8), 0, 11.0, bevel=0.8, seg=1)
        o8.transform(Matrix.Translation((x0*MM, 0, A*MM)) @ Matrix.Rotation(math.radians(90), 4, 'Y')); add(b, o8)
    for cx in (C1, C2):                                                       # flat-sided check housings + seat flange
        h = prism(V.rrect(HW, HD, 7.0, n=6, cx=cx, cy=0), A-22, A+33, bevel=1.0, seg=2)
        for v in h.verts:                                                     # casting draft: narrower toward the bottom
            t = (v.co.z*1000 - (A-22))/55.0; k = 0.95 + 0.05*max(0.0, min(1.0, t))
            v.co.x = cx*MM + (v.co.x - cx*MM)*k; v.co.y *= k
        add(b, h)
        add(b, plate_hole(cx, 0, HW + 6, HD + 6, 9.0, 23.0, A+33, A+37))
        for sx in (-1, 1):                                                    # parting line up each housing side
            add(b, prism(V.rrect(0.9, 1.4, 0.3, n=2, cx=cx + sx*(HW/2 - 0.2), cy=0), A-21, A+33, bevel=0.0))
    for sz in (-1, 1):                                                        # parting line along the barrel top / bottom
        add(b, prism([(-86, -0.7), (86, -0.7), (86, 0.7), (-86, 0.7)], 0, 0.6,
                     xform=Matrix.Translation((0, 0, (A + sz*25.8)*MM)) @ (Matrix() if sz > 0 else Matrix.Rotation(math.pi, 4, 'X'))))
    # relief valve housing: flat-sided block under the barrel, round discharge spout
    add(b, prism(V.rrect(44, 42, 6.0, n=6, cx=RX, cy=0), A-70, A-12, bevel=1.0, seg=2))
    add(b, vlathe([(A-68, 0), (A-68, 11), (A-78, 11), (A-78, 8.5), (A-70, 8.5), (A-70, 0)], seg=72, cx=RX))
    add(b, cyl(18.5, 0, 6, seg=64, bevel=1.0, xform=Matrix.Translation((RX*MM, -18*MM, (A-44)*MM)) @ Matrix.Rotation(math.radians(90), 4, 'X')))
    for x in (-80.0, 76.0):                                                   # test cock bosses (No. 2 / No. 4)
        add(b, cyl(7.2, A+18, A+30, seg=40, cx=x, bevel=1.2))
    add(b, cyl(7.2, A+16, A+30, seg=40, cx=-3, bevel=1.2))                    # test cock No. 3 between the checks
    arrow = [(-12, -1.4), (5, -1.4), (5, -4.0), (13, 0), (5, 4.0), (5, 1.4), (-12, 1.4)]          # flow arrow on the outlet housing face
    add(b, prism(arrow, -0.2, 0.7, bevel=0.3, seg=1, xform=Matrix.Translation((C2*MM, -(HD/2 - 0.2)*MM, (A - 9)*MM)) @ Matrix.Rotation(math.radians(90), 4, 'X')))
    o = finish("Body_main", b, "W_CastBronze", angle=30)
    bm = bmesh.new(); bm.from_mesh(o.data)                                    # lettering on the flat housing faces
    for txt, size, cx in (("NORTHLINE", 5.2, C1), ("RP 1\"", 5.0, C2)):
        tb = V.text_bm(txt, size)
        tb.transform(Matrix.Translation((cx*MM, -(HD/2 - 0.2)*MM, (A + 8)*MM)) @ Matrix.Rotation(math.radians(90), 4, 'X'))
        me = bpy.data.meshes.new("_t"); tb.to_mesh(me); tb.free(); n0 = len(bm.faces); bm.from_mesh(me); bpy.data.meshes.remove(me)
        bm.faces.ensure_lookup_table()
        for f in bm.faces[n0:]: f.smooth = False
    bm.to_mesh(o.data); bm.free()
    for cx, nm in ((C1, "Body_Cavity1"), (C2, "Body_Cavity2")):
        finish(nm, cyl(22.6, A+33.5, A+33.9, seg=64, cx=cx), "W_Cavity")

def check_covers():
    for i, cx in ((1, C1), (2, C2)):
        c = prism(V.rrect(HW + 6, HD + 6, 9.0, n=8, cx=cx, cy=0), A+37, A+43, bevel=1.0, seg=1)   # flat machined plate
        add(c, cyl(14.0, A+42.9, A+45.0, seg=64, cx=cx, bevel=0.8))                                   # centre boss
        finish(f"Cover{i}", c, "W_CastBronze", angle=30)
        bolts = bmesh.new()
        for sx in (-1, 1):
            for sy in (-1, 1):
                bx, by = cx + sx*23.0, sy*23.0
                add(bolts, cyl(6.2, A+42.9, A+43.7, seg=32, cx=bx, cy=by, bevel=0.4))               # washer
                add(bolts, prism(ngon(6, 5.2, cx=bx, cy=by), A+43.7, A+48.5, bevel=0.8, seg=1))    # hex head
        finish(f"CoverBolts{i}", bolts, "W_Stainless")
        finish(f"CoverORing{i}", torus(27.0, 1.4, seg=72, ms=10, xform=Matrix.Translation((cx*MM, 0, (A+37)*MM))), "W_Rubber")
'''
src_path = os.path.join(HERE, "build_rpz.py"); src = open(src_path).read()
a = src.index("def body():"); b = src.index("# ---------- relief valve")
src = src[:a] + NEW_BODY.lstrip("\n") + "\n" + src[b:]
exec(compile(src, src_path, "exec"), {"__file__": src_path, "__name__": "__main__"})
