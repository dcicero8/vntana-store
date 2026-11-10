# Watts 2000B-FP "photoreal" render pass (render-only; the web GLB is untouched).
# Blender -b ../2000B-FP_v6.blend --python render_watts_v2.py -- <shot> <out.jpg> [samples]
import bpy, bmesh, math, os, sys
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "rpz"))
import vlib as V
from vlib import MM, add, prism, ngon, cyl, torus

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SHOT = argv[0] if argv else "hero"
OUT = argv[1] if len(argv) > 1 else os.path.join(HERE, f"watts_{SHOT}_v2.jpg")
SAMPLES = int(argv[2]) if len(argv) > 2 else 256
WEAR = float(os.environ.get("WEAR", "0"))   # 0 = clean catalog look, 1 = used: scratches, patina, dust, rougher

sc = bpy.data.scenes["Watts_2000BFP"]
if bpy.context.window: bpy.context.window.scene = sc
V.SC = sc; V.COLL = "Rebuild"

# ------------------------------------------------------------------ geometry: less toy-like handwheels
def handwheel(tag):
    S = -1 if tag == "Inlet" else 1
    W = Matrix.Translation((-0.131, -0.027, 0.059)) @ Matrix.Rotation(math.radians(90), 4, 'X')   # built at the inlet, mirrored for the outlet
    hw = torus(22.8, 2.7, seg=128, ms=20, sx=0.85, sy=1.25)                      # slimmer cast rim
    for k in range(8):                                                            # small knurl bumps, not blobs
        a = math.radians(22.5 + 45*k); b = bmesh.new()
        bmesh.ops.create_uvsphere(b, u_segments=16, v_segments=10, radius=2.6*MM)
        b.transform(Matrix.Translation((24.2*MM*math.cos(a), 24.2*MM*math.sin(a), 0)) @ Matrix.Rotation(a, 4, 'Z') @ Matrix.Diagonal((0.8, 1.6, 1.05, 1)))
        add(hw, b)
    for k in range(4):                                                            # tapered spokes
        sp = prism([(6, -3.1), (21, -2.0), (21, 2.0), (6, 3.1)], -1.9, 1.9, bevel=0.7, seg=3)
        sp.transform(Matrix.Rotation(math.radians(90*k), 4, 'Z')); add(hw, sp)
    add(hw, cyl(7.5, -4.0, 3.2, seg=48, bevel=0.9))
    hw.transform(W)
    if S == 1: V.mirrorX(hw)
    old = bpy.data.objects.get(f"Handwheel_{tag}")
    mats = [m for m in old.data.materials] if old else []
    me = bpy.data.meshes.new(f"Handwheel_{tag}_v2"); bmesh.ops.recalc_face_normals(hw, faces=hw.faces[:])
    for f in hw.faces: f.smooth = True
    hw.to_mesh(me); hw.free()
    if old: old.data = me
    for m in mats: me.materials.append(m)
pass   # v8 model has the photo-accurate 3-spoke handwheels built in; no render-only swap

# ------------------------------------------------------------------ render-only layered materials (Cycles)
def node(nt, t, loc, **kw):
    n = nt.nodes.new(t); n.location = loc
    for k, v in kw.items(): setattr(n, k, v)
    return n
def inp(n, *names):
    for nm in names:
        if nm in n.inputs: return n.inputs[nm]
    return None

def layered(name, base, metal, rough, dirt=(0.05, 0.035, 0.022), dirt_amt=0.55, edge_col=None, edge_rough=None,
            coat=0.0, aniso=0.0, chip=0.0, chip_col=(0.36, 0.22, 0.10), bump=0.03, var=0.12, bump_scale=2200,
            patina=0.0, scratch_col=None, painted=False, sand=0.0, sand_scale=1500):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear(); L = nt.links.new
    out = node(nt, "ShaderNodeOutputMaterial", (1400, 0))
    bs = node(nt, "ShaderNodeBsdfPrincipled", (1100, 0)); L(bs.outputs[0], out.inputs[0])
    tc = node(nt, "ShaderNodeTexCoord", (-900, 0))
    # large-scale colour variation (casting / tarnish)
    nz = node(nt, "ShaderNodeTexNoise", (-650, 250)); nz.inputs["Scale"].default_value = 28; nz.inputs["Detail"].default_value = 6
    L(tc.outputs["Object"], nz.inputs["Vector"])
    vr = node(nt, "ShaderNodeMapRange", (-420, 250)); vr.inputs["To Min"].default_value = 1 - var; vr.inputs["To Max"].default_value = 1 + var
    L(nz.outputs["Fac"], vr.inputs["Value"])
    basec = node(nt, "ShaderNodeRGB", (-420, 450)); basec.outputs[0].default_value = (*base, 1)
    tint = node(nt, "ShaderNodeMixRGB", (-180, 350), blend_type='MULTIPLY'); tint.inputs[0].default_value = 1.0
    L(basec.outputs[0], tint.inputs[1]); L(vr.outputs[0], tint.inputs[2])
    # cavity grime from ambient occlusion
    ao = node(nt, "ShaderNodeAmbientOcclusion", (-650, -50)); ao.inputs["Distance"].default_value = 0.006; ao.only_local = True
    cav = node(nt, "ShaderNodeMapRange", (-420, -50)); cav.inputs["From Min"].default_value = 0.35; cav.inputs["From Max"].default_value = 0.95
    cav.inputs["To Min"].default_value = dirt_amt; cav.inputs["To Max"].default_value = 0.0
    L(ao.outputs["AO"], cav.inputs["Value"])
    dirtc = node(nt, "ShaderNodeRGB", (-180, 120)); dirtc.outputs[0].default_value = (*dirt, 1)
    grime = node(nt, "ShaderNodeMixRGB", (60, 300)); L(cav.outputs[0], grime.inputs[0]); L(tint.outputs[0], grime.inputs[1]); L(dirtc.outputs[0], grime.inputs[2])
    # convex edge mask from a bevel-normal vs true-normal difference (worn / polished edges)
    bev = node(nt, "ShaderNodeBevel", (-650, -350)); bev.inputs["Radius"].default_value = 0.0012; bev.samples = 8
    geo = node(nt, "ShaderNodeNewGeometry", (-650, -550))
    dot = node(nt, "ShaderNodeVectorMath", (-420, -400), operation='DOT_PRODUCT'); L(bev.outputs[0], dot.inputs[0]); L(geo.outputs["Normal"], dot.inputs[1])
    edge = node(nt, "ShaderNodeMapRange", (-200, -400)); edge.inputs["From Min"].default_value = 0.995; edge.inputs["From Max"].default_value = 0.94
    L(dot.outputs["Value"], edge.inputs["Value"])
    col_out = grime.outputs[0]; rough_val = node(nt, "ShaderNodeValue", (60, -100)); rough_val.outputs[0].default_value = rough
    rough_out = rough_val.outputs[0]; metal_out = None
    if edge_col:   # polished / brighter edges
        ec = node(nt, "ShaderNodeRGB", (60, 520)); ec.outputs[0].default_value = (*edge_col, 1)
        em = node(nt, "ShaderNodeMixRGB", (300, 300)); L(edge.outputs[0], em.inputs[0]); L(col_out, em.inputs[1]); L(ec.outputs[0], em.inputs[2]); col_out = em.outputs[0]
        er = node(nt, "ShaderNodeMapRange", (300, -100)); er.inputs["To Min"].default_value = rough; er.inputs["To Max"].default_value = edge_rough or rough*0.5
        L(edge.outputs[0], er.inputs["Value"]); rough_out = er.outputs[0]
    if chip > 0:   # paint chipped on the sharpest edges, bare metal underneath
        ch = node(nt, "ShaderNodeMath", (300, -300), operation='MULTIPLY'); ch.inputs[1].default_value = chip
        nz2 = node(nt, "ShaderNodeTexNoise", (60, -500)); nz2.inputs["Scale"].default_value = 160; L(tc.outputs["Object"], nz2.inputs["Vector"])
        gate = node(nt, "ShaderNodeMath", (300, -500), operation='GREATER_THAN'); gate.inputs[1].default_value = 0.55; L(nz2.outputs["Fac"], gate.inputs[0])
        mm = node(nt, "ShaderNodeMath", (520, -400), operation='MULTIPLY'); L(edge.outputs[0], mm.inputs[0]); L(gate.outputs[0], mm.inputs[1])
        L(mm.outputs[0], ch.inputs[0])
        cc = node(nt, "ShaderNodeRGB", (520, 520)); cc.outputs[0].default_value = (*chip_col, 1)
        cm = node(nt, "ShaderNodeMixRGB", (760, 300)); L(ch.outputs[0], cm.inputs[0]); L(col_out, cm.inputs[1]); L(cc.outputs[0], cm.inputs[2]); col_out = cm.outputs[0]
        mt = node(nt, "ShaderNodeMapRange", (760, -300)); mt.inputs["To Min"].default_value = metal; mt.inputs["To Max"].default_value = 1.0
        L(ch.outputs[0], mt.inputs["Value"]); metal_out = mt.outputs[0]
    if metal_out is None:
        mv = node(nt, "ShaderNodeValue", (760, -500)); mv.outputs[0].default_value = metal; metal_out = mv.outputs[0]
    if WEAR > 0:
        def mixc(fac, a_sock, rgb, loc):
            c = node(nt, "ShaderNodeRGB", (loc[0], loc[1] + 200)); c.outputs[0].default_value = (*rgb, 1)
            m_ = node(nt, "ShaderNodeMixRGB", loc); L(fac, m_.inputs[0]); L(a_sock, m_.inputs[1]); L(c.outputs[0], m_.inputs[2]); return m_.outputs[0]
        def mixv(fac, a_sock, val, loc):
            m_ = node(nt, "ShaderNodeMix", loc); m_.data_type = 'FLOAT'; L(fac, m_.inputs["Factor"]); L(a_sock, m_.inputs[2]); m_.inputs[3].default_value = val
            return m_.outputs[0]
        def strength(sock, k, loc):
            mm = node(nt, "ShaderNodeMath", loc, operation='MULTIPLY'); L(sock, mm.inputs[0]); mm.inputs[1].default_value = k; return mm.outputs[0]
        # scratches: two sets of thin, stretched noise lines at different angles
        scr = None
        for i, (rx, rz) in enumerate(((0.3, 0.9), (1.2, -0.5))):
            mp = node(nt, "ShaderNodeMapping", (1300, -900 - 200*i)); mp.inputs["Rotation"].default_value = (rx, 0.4*i, rz); mp.inputs["Scale"].default_value = (14, 650, 650)   # long along one axis, hair-thin across
            L(tc.outputs["Object"], mp.inputs["Vector"])
            nzs = node(nt, "ShaderNodeTexNoise", (1500, -900 - 200*i)); nzs.inputs["Scale"].default_value = 1.0; nzs.inputs["Detail"].default_value = 1; L(mp.outputs[0], nzs.inputs["Vector"])
            line = node(nt, "ShaderNodeMapRange", (1700, -900 - 200*i)); line.inputs["From Min"].default_value = 0.725; line.inputs["From Max"].default_value = 0.755
            L(nzs.outputs["Fac"], line.inputs["Value"])
            if scr is None: scr = line.outputs[0]
            if i == 1:                     # combine both scratch directions
                mx = node(nt, "ShaderNodeMath", (1900, -1000), operation='MAXIMUM'); L(prev, mx.inputs[0]); L(line.outputs[0], mx.inputs[1]); scr = mx.outputs[0]
            prev = line.outputs[0]
        # only in scattered patches (handled areas), not uniformly everywhere
        nzk = node(nt, "ShaderNodeTexNoise", (1700, -1300)); nzk.inputs["Scale"].default_value = 22; nzk.inputs["Detail"].default_value = 3; L(tc.outputs["Object"], nzk.inputs["Vector"])
        pk = node(nt, "ShaderNodeMapRange", (1900, -1300)); pk.inputs["From Min"].default_value = 0.52; pk.inputs["From Max"].default_value = 0.66; L(nzk.outputs["Fac"], pk.inputs["Value"])
        pkm = node(nt, "ShaderNodeMath", (2000, -1100), operation='MULTIPLY'); L(scr, pkm.inputs[0]); L(pk.outputs[0], pkm.inputs[1]); scr = pkm.outputs[0]
        scr = strength(scr, 0.8*WEAR, (2100, -1000))
        col_out = mixc(scr, col_out, scratch_col or ((0.55, 0.40, 0.22) if metal > 0.5 else (0.30, 0.28, 0.26)), (2300, 200))
        rough_out = mixv(scr, rough_out, 0.25 if metal > 0.5 else 0.6, (2300, -200))
        if painted: metal_out = mixv(scr, metal_out, 0.0, (2300, -400))
        # patina: verdigris / brown oxide pooling in crevices on copper alloys
        if patina > 0:
            ao2 = node(nt, "ShaderNodeAmbientOcclusion", (1300, 700)); ao2.inputs["Distance"].default_value = 0.012; ao2.only_local = True
            cv = node(nt, "ShaderNodeMapRange", (1500, 700)); cv.inputs["From Min"].default_value = 0.55; cv.inputs["From Max"].default_value = 0.95
            cv.inputs["To Min"].default_value = 1.0; cv.inputs["To Max"].default_value = 0.0; L(ao2.outputs["AO"], cv.inputs["Value"])
            nzp = node(nt, "ShaderNodeTexNoise", (1300, 950)); nzp.inputs["Scale"].default_value = 60; nzp.inputs["Detail"].default_value = 8; L(tc.outputs["Object"], nzp.inputs["Vector"])
            blotch = node(nt, "ShaderNodeMapRange", (1500, 950)); blotch.inputs["From Min"].default_value = 0.45; blotch.inputs["From Max"].default_value = 0.65; L(nzp.outputs["Fac"], blotch.inputs["Value"])
            pm = node(nt, "ShaderNodeMath", (1700, 800), operation='MULTIPLY'); L(cv.outputs[0], pm.inputs[0]); L(blotch.outputs[0], pm.inputs[1])
            pf = strength(pm.outputs[0], patina*WEAR, (1900, 800))
            ox = node(nt, "ShaderNodeMath", (1900, 1000), operation='MULTIPLY'); L(blotch.outputs[0], ox.inputs[0]); ox.inputs[1].default_value = 0.35*patina*WEAR
            col_out = mixc(ox.outputs[0], col_out, (0.10, 0.065, 0.035), (2100, 1000))        # general brown tarnish
            col_out = mixc(pf, col_out, (0.07, 0.16, 0.12), (2500, 800))                    # verdigris in the recesses
            rough_out = mixv(pf, rough_out, 0.85, (2500, 500)); metal_out = mixv(pf, metal_out, 0.0, (2500, 300))
        # dust settling on upward-facing surfaces
        geo2 = node(nt, "ShaderNodeNewGeometry", (1300, 1300)); upz = node(nt, "ShaderNodeSeparateXYZ", (1500, 1300)); L(geo2.outputs["Normal"], upz.inputs[0])
        up = node(nt, "ShaderNodeMapRange", (1700, 1300)); up.inputs["From Min"].default_value = 0.45; up.inputs["From Max"].default_value = 1.0; L(upz.outputs["Z"], up.inputs["Value"])
        nzd = node(nt, "ShaderNodeTexNoise", (1500, 1500)); nzd.inputs["Scale"].default_value = 220; nzd.inputs["Detail"].default_value = 10; L(tc.outputs["Object"], nzd.inputs["Vector"])
        dm = node(nt, "ShaderNodeMath", (1900, 1400), operation='MULTIPLY'); L(up.outputs[0], dm.inputs[0]); L(nzd.outputs["Fac"], dm.inputs[1])
        df = strength(dm.outputs[0], 0.75*WEAR, (2100, 1400))
        col_out = mixc(df, col_out, (0.30, 0.28, 0.25), (2700, 1300)); rough_out = mixv(df, rough_out, 0.92, (2700, 1100)); metal_out = mixv(df, metal_out, 0.0, (2700, 900))
        # everything a bit rougher once it has been handled
        rr = node(nt, "ShaderNodeMath", (2900, 0), operation='ADD'); L(rough_out, rr.inputs[0]); rr.inputs[1].default_value = 0.08*WEAR; rough_out = rr.outputs[0]
    L(col_out, inp(bs, "Base Color"))
    L(rough_out, inp(bs, "Roughness"))
    L(metal_out, inp(bs, "Metallic"))
    if coat and inp(bs, "Coat Weight", "Clearcoat"):
        inp(bs, "Coat Weight", "Clearcoat").default_value = coat
        c_r = inp(bs, "Coat Roughness", "Clearcoat Roughness")
        if c_r: c_r.default_value = 0.08
    if aniso and inp(bs, "Anisotropic"): inp(bs, "Anisotropic").default_value = aniso
    # fine surface (sand cast / orange peel) bump on top of the bevel normal so edges catch light
    nz3 = node(nt, "ShaderNodeTexNoise", (600, -650)); nz3.inputs["Scale"].default_value = bump_scale; nz3.inputs["Detail"].default_value = 4
    L(tc.outputs["Object"], nz3.inputs["Vector"])
    bp = node(nt, "ShaderNodeBump", (850, -600)); bp.inputs["Strength"].default_value = bump; bp.inputs["Distance"].default_value = 0.0002
    if sand > 0:   # sand-cast grain: dense small pits (voronoi) on top of the fine noise, pits slightly darker
        vo = node(nt, "ShaderNodeTexVoronoi", (600, -900)); vo.inputs["Scale"].default_value = sand_scale
        if "Randomness" in vo.inputs: vo.inputs["Randomness"].default_value = 1.0
        L(tc.outputs["Object"], vo.inputs["Vector"])
        pit = node(nt, "ShaderNodeMapRange", (800, -900)); pit.inputs["From Min"].default_value = 0.0; pit.inputs["From Max"].default_value = 0.55
        L(vo.outputs["Distance"], pit.inputs["Value"])
        hsum = node(nt, "ShaderNodeMath", (950, -800), operation='MULTIPLY_ADD'); L(pit.outputs[0], hsum.inputs[0]); hsum.inputs[1].default_value = sand
        L(nz3.outputs["Fac"], hsum.inputs[2])
        L(hsum.outputs[0], bp.inputs["Height"]); bp.inputs["Distance"].default_value = 0.00035
        dk = node(nt, "ShaderNodeMapRange", (1000, 200)); dk.inputs["To Min"].default_value = 1.0 - 0.10*sand; dk.inputs["To Max"].default_value = 1.0
        L(pit.outputs[0], dk.inputs["Value"])
        dm = node(nt, "ShaderNodeMixRGB", (1050, 350), blend_type='MULTIPLY'); dm.inputs[0].default_value = 1.0
        old = bs.inputs["Base Color"].links[0].from_socket; L(old, dm.inputs[1]); L(dk.outputs[0], dm.inputs[2]); L(dm.outputs[0], inp(bs, "Base Color"))
    L(nz3.outputs["Fac"], bp.inputs["Height"]) if sand <= 0 else None
    L(bev.outputs[0], bp.inputs["Normal"]); L(bp.outputs[0], inp(bs, "Normal"))
    return m

# real cast bronze is darker, warmer and more reflective than the old flat tan
layered("W_CastBronze", (0.31, 0.186, 0.108), 1.0, 0.62, dirt=(0.04, 0.03, 0.024), dirt_amt=0.7, edge_col=(0.50, 0.33, 0.22), edge_rough=0.4, bump=0.45, var=0.22, bump_scale=900, patina=1.0, sand=1.0, sand_scale=1500)
layered("W_Brass",      (0.50, 0.35, 0.14), 1.0, 0.26, edge_col=(0.70, 0.52, 0.26), edge_rough=0.15, bump=0.01, var=0.06, patina=0.4)   # machined: brighter, smoother than the casting
layered("W_Stainless",  (0.24, 0.24, 0.235), 1.0, 0.58, dirt=(0.10, 0.09, 0.08), dirt_amt=0.5, edge_col=(0.62, 0.62, 0.6), edge_rough=0.3, bump=0.05, var=0.08)
if bpy.data.materials.get("W_CoverSteel"): layered("W_CoverSteel", (0.12, 0.12, 0.118), 1.0, 0.62, dirt=(0.08, 0.075, 0.07), dirt_amt=0.45, edge_col=(0.45, 0.45, 0.44), edge_rough=0.32, bump=0.12, var=0.1, bump_scale=1800)
layered("W_HandwheelRed", (0.22, 0.007, 0.005), 0.0, 0.36, dirt=(0.06, 0.01, 0.01), dirt_amt=0.45, coat=0.6, chip=0.2 + 0.9*WEAR, chip_col=(0.30, 0.17, 0.08), bump=0.015, var=0.06, painted=True, scratch_col=(0.20, 0.17, 0.15))
layered("W_GearboxRed",   (0.085, 0.012, 0.008), 0.0, 0.45, dirt=(0.04, 0.01, 0.01), dirt_amt=0.45, coat=0.35, chip=0.6 + 0.6*WEAR, chip_col=(0.45, 0.45, 0.45), bump=0.02, var=0.05, painted=True, scratch_col=(0.18, 0.18, 0.18))
layered("W_IndicatorOrange", (0.55, 0.11, 0.004), 0.0, 0.28, dirt_amt=0.25, coat=0.4, bump=0.01, var=0.04)
layered("W_Label", (0.62, 0.62, 0.60), 1.0, 0.30, dirt_amt=0.2, aniso=0.4, bump=0.0, var=0.02)
layered("W_BlackPlastic", (0.018, 0.018, 0.018), 0.0, 0.42, dirt_amt=0.0, var=0.0, bump=0.01)
layered("W_Teflon", (0.86, 0.86, 0.84), 0.0, 0.7, dirt=(0.4, 0.38, 0.34), dirt_amt=0.35, bump=0.05)

# ------------------------------------------------------------------ studio: HDRI reflections + soft key, graded backdrop
st = bpy.data.collections.get("Studio")
if st:
    for o in list(st.objects): bpy.data.objects.remove(o, do_unlink=True)
else:
    st = bpy.data.collections.new("Studio"); sc.collection.children.link(st)
bm = bmesh.new(); P = [(i*0.15, 0.0) for i in range(-10, 1)]; R = 0.4
for k in range(1, 13):
    a = math.radians(90*k/12); P.append((R*math.sin(a), R*(1 - math.cos(a))))
P.append((R, 1.4)); rows = [[bm.verts.new((x, y + 0.28, z)) for y, z in P] for x in (-1.6, 1.6)]
for i in range(len(P) - 1): bm.faces.new((rows[0][i], rows[1][i], rows[1][i+1], rows[0][i+1]))
me = bpy.data.meshes.new("Cyc"); bm.to_mesh(me); bm.free()
for p in me.polygons: p.use_smooth = True
cyc = bpy.data.objects.new("Cyc", me); st.objects.link(cyc)
bg = bpy.data.materials.get("Studio_Grey") or bpy.data.materials.new("Studio_Grey"); bg.use_nodes = True
b = next(n for n in bg.node_tree.nodes if n.type == "BSDF_PRINCIPLED"); b.inputs["Base Color"].default_value = (0.17, 0.175, 0.185, 1); b.inputs["Roughness"].default_value = 0.85
me.materials.append(bg)
def area(name, loc, size, power, aim=(0, 0, 0.05), sy=None):
    Ld = bpy.data.lights.new(name, 'AREA'); Ld.shape = 'RECTANGLE'; Ld.size = size; Ld.size_y = sy or size*0.5; Ld.energy = power
    o = bpy.data.objects.new(name, Ld); st.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(aim) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return o
area("Key", (-0.45, -0.5, 0.55), 0.55, 18, sy=0.35)        # big soft key, upper left front
area("Strip", (0.55, 0.15, 0.35), 0.9, 9, sy=0.08)          # long strip: clean highlight line along the barrel
area("Rim", (0.15, 0.6, 0.45), 0.6, 10, sy=0.2)
blk = bpy.data.materials.get("Studio_Black") or bpy.data.materials.new("Studio_Black"); blk.use_nodes = True
b = next(n for n in blk.node_tree.nodes if n.type == "BSDF_PRINCIPLED"); b.inputs["Base Color"].default_value = (0.004, 0.004, 0.004, 1)
def flag(name, loc, sx, sz):
    m2 = bpy.data.meshes.new(name); b2 = bmesh.new(); bmesh.ops.create_grid(b2, x_segments=1, y_segments=1, size=0.5); b2.to_mesh(m2); b2.free()
    m2.materials.append(blk); o = bpy.data.objects.new(name, m2); st.objects.link(o); o.location = loc; o.scale = (sx, sz, 1)
    o.rotation_euler = (Vector((0, 0, 0.05)) - Vector(loc)).to_track_quat('Z', 'Y').to_euler(); o.visible_camera = False
flag("FlagL", (-0.7, 0.1, 0.25), 0.8, 0.8); flag("FlagFront", (0.1, -0.7, -0.02), 1.2, 0.35)   # dark reflections = metal reads as metal
w = sc.world or bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True; nt = w.node_tree
for n in [n for n in nt.nodes if n.type in ("TEX_ENVIRONMENT", "MAPPING", "TEX_COORD")]: nt.nodes.remove(n)
bgn = next(n for n in nt.nodes if n.type == "BACKGROUND")
env = nt.nodes.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(os.path.join(HERE, "studio_small_09.hdr"), check_existing=True)
mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Rotation"].default_value[2] = math.radians(110); tcw = nt.nodes.new("ShaderNodeTexCoord")
nt.links.new(tcw.outputs["Generated"], mp.inputs["Vector"]); nt.links.new(mp.outputs[0], env.inputs["Vector"]); nt.links.new(env.outputs[0], bgn.inputs[0])
bgn.inputs[1].default_value = 0.3

# ------------------------------------------------------------------ camera, render settings
cam = bpy.data.objects.get("RenderCam") or bpy.data.objects.new("RenderCam", bpy.data.cameras.new("RenderCam"))
if cam.name not in st.objects: st.objects.link(cam)
sc.camera = cam
SHOTS = {"hero": ((-0.55, -1, 0.42), 1.42, (0, 0, 0.085), 85, 11), "detail": ((-0.45, -1, 0.38), 0.64, (-0.18, -0.02, 0.12), 85, 16),
         "front": ((0, -1, 0.10), 1.5, (0, 0, 0.085), 85, 8), "top": ((0.55, -0.75, 1.0), 1.45, (0, 0, 0.08), 85, 8),
         "service": ((-0.35, -1, 0.5), 1.6, (0, 0, 0.17), 85, 11),
         "photo": ((0, -1, 0.06), 3.2, (0, 0, 0.088), 200, 16)}   # straight-on, long lens: matches the Watts product photo
if SHOT == "service":   # cover lifted, retainer + both checks pulled and fanned (same layout as the original service render)
    O = bpy.data.objects
    off = {"Cover": (0, 0, 0.19), "CoverBolts": (0, 0, 0.19), "TestCock_3": (0, 0, 0.19), "TestCock_3_Port": (0, 0, 0.19), "TestCockRiser_3": (0, 0, 0.19),
           "Cover_ORing": (0, 0, 0.16), "Retainer": (0, 0, 0.125)}
    for k, dx in {"Seat": -0.016, "SeatORing": -0.010, "Disc": -0.003, "Spring": 0.004, "Cage": 0.011}.items():
        off[f"Check1_{k}"] = (-0.030 + dx*1.5, 0, 0.092); off[f"Check2_{k}"] = (0.045 + dx*1.5, 0, 0.092)
    for n, v in off.items():
        if n in O: O[n].location = v
d, dist, tgt, lens, fstop = SHOTS[SHOT]
t = Vector(tgt); cam.location = t + Vector(d).normalized()*dist; cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.lens = lens; cam.data.dof.use_dof = True; cam.data.dof.focus_distance = dist; cam.data.dof.aperture_fstop = fstop
sc.render.engine = 'CYCLES'
prefs = bpy.context.preferences.addons['cycles'].preferences; prefs.compute_device_type = 'METAL'; prefs.get_devices()
for dv in prefs.devices: dv.use = (dv.type == 'METAL')
sc.cycles.device = 'GPU'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True; sc.cycles.use_adaptive_sampling = True
sc.cycles.max_bounces = 10; sc.cycles.glossy_bounces = 6
sc.render.resolution_x, sc.render.resolution_y = 1600, 1067; sc.render.resolution_percentage = 100
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 92
vt = [i.identifier for i in bpy.types.ColorManagedViewSettings.bl_rna.properties['view_transform'].enum_items]
print("VIEW_TRANSFORMS", vt); sc.view_settings.view_transform = next((x for x in vt if x.lower().startswith("agx")), "Filmic")
for look in ("AgX - Medium High Contrast", "AgX - Punchy", "Medium High Contrast"):
    try: sc.view_settings.look = look; break
    except Exception: pass
sc.view_settings.exposure = 0.0
sc.render.filepath = OUT
bpy.ops.render.render(write_still=True, scene=sc.name)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "watts_render_v2.blend"), compress=True)
print("RENDERED", OUT, sc.view_settings.view_transform, sc.view_settings.look)
