# Northline v7 = v6 + real cap screws (Ashley: bolts looked fake; AI-edit used as the reference):
#  - hex head with the corners chamfered off the top (circular bearing face look), separate flat washer,
#    small raised grade mark "8.8" on each head; matte zinc in the render preset
# Northline v6 = v5 + group C (fittings):
#  - test fittings: ~2x taller, crisp hex / body / hex / threaded port, white thread tape, bigger teal quarter-turn tab,
#    on short drafted cast risers; No. 2 / No. 4 moved outboard so they clear the covers
#  - ball valves: straight cylinder with crisp shoulders (not egg-shaped)
#  - unions: hex nut + exposed brass thread (UnionThread_*) between valve and body; cut thread visible inside the open ends
#  - levers: shorter, wider, thicker stamped strap; flat-sided teal grip (not a rounded pill)
# Northline v5 = v4 (harsh edges) + group B: industrial shape language for the body and covers.
#  - barrel: plain cast cylinder, crisp shoulders, octagon wrench flats at each union end
#  - check housings: flat-sided rounded-square castings (slight draft) with a seat flange, instead of round bulbous towers
#  - raised parting line (casting flash) along the barrel top/bottom and up the housing sides
#  - relief housing: flat-sided block instead of a revolved bulb
#  - covers: flat machined plates with a centre boss, 4 big hex bolts + washers at the corners (no domes)
#  - lettering on the flat housing faces; arrow moved clear of the wider housing
# Every part keeps its name (the page's parts list / explode use them).
# Blender -b ../watts/2000B-FP_v6.blend --python build_rpz_v7.py -- northline_rpz_v7
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

NEW_FIT = r'''
def hexbolt(af, h, wr, wt, mark=True, rot=0.0):
    """Cap screw at the origin, axis +Z: washer (0..wt), hex head with chamfered top corners, raised grade mark."""
    R = af/2/math.cos(math.pi/6); ri = af/2
    b = cyl(wr, 0, wt, seg=40, bevel=0.3)
    pts = []
    for k in range(6):
        a0, a1 = math.radians(60*k) + rot, math.radians(60*(k+1)) + rot
        c0 = (R*math.cos(a0), R*math.sin(a0)); c1 = (R*math.cos(a1), R*math.sin(a1))
        pts += [c0, ((c0[0]+c1[0])/2, (c0[1]+c1[1])/2)]
    ch = 0.16*af
    top = []
    for i, (x, y) in enumerate(pts):
        r = math.hypot(x, y); k = (ri*0.95)/r if i % 2 == 0 else 0.95
        top.append((x*k, y*k))
    hb = bmesh.new(); z0, z1, z2 = wt - 0.02, wt + h - ch, wt + h
    rings = [[hb.verts.new((x*MM, y*MM, z*MM)) for x, y in P] for P, z in ((pts, z0), (pts, z1), (top, z2))]
    n = len(pts)
    for A_, B_ in zip(rings, rings[1:]):
        for i in range(n): hb.faces.new((A_[i], A_[(i+1) % n], B_[(i+1) % n], B_[i]))
    hb.faces.new(rings[0][::-1]); hb.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(hb, faces=hb.faces[:]); add(b, hb)
    if mark:
        t = V.text_bm("8.8", af*0.26, extrude=0.14); t.transform(Matrix.Translation((0, 0, (z2 - 0.02)*MM)) @ Matrix.Rotation(rot + 0.4, 4, 'Z')); add(b, t)
    return b
def shutoff():
    out = {}
    b = hex_ring_X(42, 13.5, -168, -156)                                    # FNPT inlet hex
    add(b, lathe([(-158, 13.5), (-158, 0)], seg=48))                         # bore floor
    for k in range(7):                                                       # cut thread visible inside the open end
        t = ring(13.6*MM, 12.4*MM, 0.55*MM, 0, seg=48); t.transform(Matrix.Translation(((-167.2 + 1.3*k)*MM, 0, A*MM)) @ Matrix.Rotation(math.radians(90), 4, 'Y')); add(b, t)
    P = [(-156, 0), (-156, 18.5), (-154.5, 20.5), (-152.5, 24.0), (-108.5, 24.0), (-106.5, 20.5), (-105, 18.5), (-105, 0)]
    add(b, lathe(P, seg=80))                                                 # straight cylinder, crisp shoulders
    add(b, hexX(40, -105, -99.5, bevel=0.6))                                 # union nut
    add(b, cyl(9.5, A+16, A+29, cx=VX, bevel=0.8))                           # stem boss
    add(b, prism(ngon(6, 8.2, cx=VX), A+29, A+34, bevel=0.5, seg=1))         # packing nut
    out["ShutoffValve"] = (b, "W_CastBronze")
    th = cyl(15.6, 0, 4.6, seg=64)                                           # bare brass union thread
    for k in range(4): add(th, cyl(16.4, 0.4 + 1.1*k, 0.95 + 1.1*k, seg=64))
    th.transform(Matrix.Translation((-99.6*MM, 0, A*MM)) @ Matrix.Rotation(math.radians(90), 4, 'Y'))
    out["UnionThread"] = (th, "W_Brass")
    st = cyl(4.4, A+34, A+41, seg=24, cx=VX)
    add(st, prism(V.rrect(86, 17, 2.5, cx=VX-38), A+41, A+44.0, bevel=0.6, seg=1))   # stamped steel strap (open = along the pipe)
    add(st, prism(ngon(6, 5.4, cx=VX), A+44.0, A+48, bevel=0.4, seg=1))              # handle nut
    out["Lever"] = (st, "N_Steel")
    g = prism(V.rrect(46, 20, 3.0, cx=VX-60), A+40.2, A+45.4, bevel=1.0, seg=2)     # flat-sided vinyl grip
    out["LeverGrip"] = (g, "N_Teal")
    return out

def testcock(x, y, z0, name, horiz_dir=None):
    """Quarter-turn test fitting: tape, hex, body with side stem + teal tab, hex, threaded port. ~31 mm tall."""
    b = prism(ngon(6, 12/2/math.cos(math.pi/6), rot=math.pi/6, cx=x, cy=y), z0+2.8, z0+7.5, bevel=0.3, seg=1)
    add(b, cyl(6.3, z0+7.3, z0+19.2, seg=40, cx=x, cy=y, bevel=0.4))
    Rf = Matrix.Translation((x*MM, (y-6.0)*MM, (z0+13.0)*MM)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    add(b, cyl(2.6, 0, 4.2, seg=24, bevel=0.3, xform=Rf))                                       # stem
    add(b, prism(ngon(6, 11/2/math.cos(math.pi/6), rot=math.pi/6, cx=x, cy=y), z0+19.0, z0+23.5, bevel=0.3, seg=1))
    add(b, cyl(5.5, z0+23.3, z0+31.0, seg=40, cx=x, cy=y, bevel=0.4))                           # threaded port
    tab = prism(V.rrect(13, 3.6, 0.8), 0, 2.2, bevel=0.3, xform=Matrix.Translation((x*MM, (y-10.0)*MM, (z0+13.0)*MM)) @ Matrix.Rotation(math.radians(90), 4, 'X'))
    cap = cyl(3.5, z0+30.9, z0+31.15, seg=24, cx=x, cy=y)
    tape = cyl(4.7, z0, z0+3.0, seg=32, cx=x, cy=y, bevel=0.3)
    finish(name, b, "W_Brass"); finish(name+"_Handle", tab, "N_Teal"); finish(name+"_Port", cap, "W_BlackPlastic"); finish(name+"_Tape", tape, "W_Teflon")
'''
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

TC2X, TC4X = -85.0, 79.0                                                   # clear of the cover plates
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
    for x in (TC2X, TC4X, -3.0):                                              # short drafted cast risers for the test fittings
        r = prism(V.rrect(16.0, 16.0, 3.0, n=4, cx=x, cy=0), A+16, A+31, bevel=1.0, seg=2)
        for v in r.verts:
            if v.co.z*1000 < A + 27: v.co.x = x*MM + (v.co.x - x*MM)*1.15; v.co.y *= 1.15
        add(b, r)
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
                hb = hexbolt(9.0, 4.6, 6.6, 0.9, rot=0.3*(sx + 2*sy))                                # washer + chamfered cap screw
                hb.transform(Matrix.Translation((bx*MM, by*MM, (A+42.9)*MM))); add(bolts, hb)
        finish(f"CoverBolts{i}", bolts, "W_Stainless", angle=8)                    # faceted, not smoothed into domes
        finish(f"CoverORing{i}", torus(27.0, 1.4, seg=72, ms=10, xform=Matrix.Translation((cx*MM, 0, (A+37)*MM))), "W_Rubber")
'''
src_path = os.path.join(HERE, "build_rpz.py"); src = open(src_path).read()
a = src.index("def body():"); b = src.index("# ---------- relief valve")
src = src[:a] + NEW_BODY.lstrip("\n") + "\n" + src[b:]
a = src.index("def shutoff():"); b = src.index("# ---------- check module")
OLD_RB = '''        add(bolts, prism(ngon(6, 3.4), 0, 3.2, bevel=0.35, seg=1,
                         xform=Matrix.Translation(((RX + 13.5*math.cos(a))*MM, -29.5*MM, (A-44 + 13.5*math.sin(a))*MM)) @ Matrix.Rotation(math.radians(90), 4, 'X')))'''
assert OLD_RB in src
src = src.replace('    finish("Relief_CoverBolts", bolts, "W_Stainless")', '    finish("Relief_CoverBolts", bolts, "W_Stainless", angle=8)')
src = src.replace(OLD_RB, '''        hb = hexbolt(5.9, 3.2, 4.4, 0.6, rot=0.5*k)
        hb.transform(Matrix.Translation(((RX + 13.5*math.cos(a))*MM, -29.5*MM, (A-44 + 13.5*math.sin(a))*MM)) @ Matrix.Rotation(math.radians(90), 4, 'X')); add(bolts, hb)''')
src = src[:a] + NEW_FIT.lstrip("\n") + "\n" + src[b:]
src = src.replace('testcock(-80, 0, A+30, "TestCock_2"); testcock(-3, 0, A+30, "TestCock_3"); testcock(76, 0, A+30, "TestCock_4")',
                  'testcock(TC2X, 0, A+31, "TestCock_2"); testcock(-3, 0, A+31, "TestCock_3"); testcock(TC4X, 0, A+31, "TestCock_4")')
assert 'testcock(TC2X' in src
exec(compile(src, src_path, "exec"), {"__file__": src_path, "__name__": "__main__"})
