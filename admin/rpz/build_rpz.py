# Northline (fictional brand) 1" Reduced Pressure Zone (RPZ) backflow preventer.
# Run headless:  Blender -b ../watts/2000B-FP_v6.blend --python build_rpz.py -- <out_basename>
# Reuses the Watts materials/textures from that file, builds in a new scene, saves + exports separately.
import bpy, bmesh, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vlib as V
from vlib import MM, add, fillet, lathe, vlathe, prism, ngon, rrect, cyl, hexX, torus, spring, mirrorX, ring, finish
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = (sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "northline_rpz_v1")

# ---------- scene ----------
sc = bpy.data.scenes.new("Northline_RPZ")
if bpy.context.window: bpy.context.window.scene = sc
V.SC = sc; V.COLL = "RPZ"; V.AXZ = 0.110          # pipe axis 110 mm up: room for relief valve + air gap below
A = 110.0                                           # axis height in mm, for readability

# ---------- materials ----------
V.mat("N_Teal", (0.0, 0.30, 0.34), 0.0, 0.45)       # Northline brand colour (lever grips)
V.mat("N_GreyPVC", (0.36, 0.38, 0.40), 0.0, 0.55)   # air-gap funnel
V.mat("N_Steel", (0.55, 0.55, 0.55), 1.0, 0.38)

# ---------- shutoff: quarter-turn ball valve with lever (built inlet-side, mirrored for outlet) ----------
VX = -128.0   # valve stem x
def hex_ring_X(af, ri, x0, x1):
    """Hex prism along X with a round bore (FNPT end you can see into)."""
    R = af/2/math.cos(math.pi/6); outer = []
    for k in range(6):
        p0 = Vector((R*math.cos(math.radians(60*k)), R*math.sin(math.radians(60*k))))
        p1 = Vector((R*math.cos(math.radians(60*(k+1))), R*math.sin(math.radians(60*(k+1)))))
        for j in range(8): q = p0.lerp(p1, j/8); outer.append((q.x, q.y))
    n = len(outer); inner = [(ri*math.cos(math.atan2(y, x)), ri*math.sin(math.atan2(y, x))) for x, y in outer]
    bm = bmesh.new()
    O0 = [bm.verts.new((x*MM, y*MM, 0)) for x, y in outer]; O1 = [bm.verts.new((x*MM, y*MM, (x1-x0)*MM)) for x, y in outer]
    I0 = [bm.verts.new((x*MM, y*MM, 0)) for x, y in inner]; I1 = [bm.verts.new((x*MM, y*MM, (x1-x0)*MM)) for x, y in inner]
    for i in range(n):
        j = (i+1) % n
        bm.faces.new((O0[i], O0[j], O1[j], O1[i])); bm.faces.new((I1[i], I1[j], I0[j], I0[i]))
        bm.faces.new((O1[i], O1[j], I1[j], I1[i])); bm.faces.new((I0[i], I0[j], O0[j], O0[i]))
    bm.transform(Matrix.Translation((x0*MM, 0, A*MM)) @ Matrix.Rotation(math.radians(90), 4, 'Y') @ Matrix.Rotation(math.radians(30), 4, 'Z'))
    return bm

def shutoff():
    out = {}
    b = hex_ring_X(42, 13.5, -168, -156)                                    # FNPT inlet hex
    add(b, lathe([(-158, 13.5), (-158, 0)], seg=48))                         # bore floor (dark inside the thread)
    P = [(-156, 0), (-156, 17), (-153.5, 19.5), (-149, 22.5), (-142, 24.5), (-114, 24.5), (-108, 22), (-104, 18.5), (-104, 0)]
    add(b, lathe(fillet(P, [0, 0, 1, 2, 5, 5, 2, 1, 0], 6), seg=80))        # ball-valve body
    add(b, hexX(38, -104, -95, bevel=0.8))                                   # union hex to the RPZ body
    add(b, cyl(9.5, A+16, A+29, cx=VX, bevel=1.0))                           # stem boss
    add(b, prism(ngon(6, 8.2, cx=VX), A+29, A+34, bevel=0.5, seg=1))         # packing nut
    out["ShutoffValve"] = (b, "W_CastBronze")
    st = cyl(4.2, A+34, A+41, seg=24, cx=VX)
    add(st, prism(rrect(104, 15, 7, cx=VX-46), A+41, A+44.2, bevel=0.6, seg=2))   # stainless lever strap (open = along the pipe)
    add(st, prism(ngon(6, 5.2, cx=VX), A+44.2, A+48, bevel=0.4, seg=1))           # handle nut
    out["Lever"] = (st, "N_Steel")
    g = prism(rrect(58, 19, 9.5, cx=VX-73), A+39.5, A+46.2, bevel=2.6, seg=4)     # vinyl grip
    out["LeverGrip"] = (g, "N_Teal")
    return out

# ---------- test cock (small brass ball valve with a teal tab handle) ----------
def testcock(x, y, z0, name, horiz_dir=None):
    b = prism(ngon(6, 5.0, rot=math.pi/6, cx=x, cy=y), z0, z0+3, bevel=0.4, seg=1)
    add(b, cyl(4.7, z0+2.5, z0+10.5, seg=40, cx=x, cy=y, bevel=1.8))
    add(b, prism(ngon(6, 5.4, rot=math.pi/6, cx=x, cy=y), z0+10, z0+14.5, bevel=0.5, seg=1))
    add(b, cyl(1.7, 0, 5.5, seg=16, bevel=0.3, xform=Matrix.Translation((x*MM, (y-4)*MM, (z0+6.5)*MM)) @ Matrix.Rotation(math.radians(90), 4, 'X')))
    tab = prism(rrect(9, 2.6, 1.1), 0, 2.4, bevel=0.3, xform=Matrix.Translation((x*MM, (y-10)*MM, (z0+6.5)*MM)) @ Matrix.Rotation(math.radians(90), 4, 'X'))
    cap = cyl(2.7, z0+14.45, z0+14.6, seg=24, cx=x, cy=y)
    finish(name, b, "W_Brass"); finish(name+"_Handle", tab, "N_Teal"); finish(name+"_Port", cap, "W_BlackPlastic")

# ---------- check module (axis along X), same construction as the 2000B rebuild ----------
def check_module(n, xc, heavy):
    Rx = Matrix.Rotation(math.radians(90), 4, 'Y')
    def obj(name, bm, m):
        bm.transform(Matrix.Translation((xc*MM, 0, A*MM)) @ Rx); finish(name, bm, m)
    def cage(ro, L):
        bm = ring(ro*MM, (ro-1.8)*MM, 4*MM, 6*MM)
        add(bm, ring(ro*MM, (ro-1.8)*MM, 3*MM, (L-3)*MM))
        for k in range(4):
            a = k*math.pi/2 + math.pi/4; s = bmesh.new(); bmesh.ops.create_cube(s, size=1)
            bmesh.ops.scale(s, vec=(4*MM, 1.8*MM, (L-6)*MM), verts=s.verts)
            bmesh.ops.translate(s, vec=((ro-0.9)*MM, 0, (6+(L-6)/2)*MM), verts=s.verts)
            bmesh.ops.rotate(s, cent=(0, 0, 0), matrix=Matrix.Rotation(a, 3, 'Z'), verts=s.verts); add(bm, s)
        for k in range(3):
            s = bmesh.new(); bmesh.ops.create_cube(s, size=1); bmesh.ops.scale(s, vec=((ro*2-3)*MM, 3*MM, 2.5*MM), verts=s.verts)
            bmesh.ops.translate(s, vec=(0, 0, (L-1.5)*MM), verts=s.verts)
            bmesh.ops.rotate(s, cent=(0, 0, 0), matrix=Matrix.Rotation(k*math.pi/3, 3, 'Z'), verts=s.verts); add(bm, s)
        add(bm, ring(4.2*MM, 3.0*MM, 8*MM, (L-10)*MM)); return bm
    L = 34; seat_ri = 9.5 if heavy else 11.5
    obj(f"Check{n}_Seat", ring(17.5*MM, seat_ri*MM, 5*MM, 0), "W_PlasticGrey")
    obj(f"Check{n}_SeatORing", torus(16.5, 1.3, seg=48, ms=10, xform=Matrix.Translation((0, 0, 2.5*MM))), "W_Rubber")
    d = cyl(12.8, 5.0, 7.5); add(d, cyl(8.0, 7.5, 10.5)); add(d, cyl(2.4, 8.0, 24.0))
    obj(f"Check{n}_Disc", d, "W_Rubber")
    obj(f"Check{n}_Spring", spring(6.0*MM, (0.85 if heavy else 0.55)*MM, 16*MM, 6 if heavy else 5, 10.5*MM), "W_SpringSteel")
    obj(f"Check{n}_Cage", cage(17.0, L), "W_PlasticGrey")

# ---------- body ----------
C1, C2, RX = -45.0, 40.0, -3.0      # check 1 / check 2 cover centres, relief valve x
def body():
    P = [(-95, 0), (-95, 19), (-93.5, 22.5), (-90, 24.5), (-80, 26), (80, 26), (90, 24.5), (93.5, 22.5), (95, 19), (95, 0)]
    b = lathe(fillet(P, [0, 0, 1, 2, 4, 4, 2, 1, 0, 0], 6), seg=96)
    for cx in (C1, C2):                                                       # check housings rising to their covers
        add(b, vlathe(fillet([(A-16, 0), (A-16, 27.5), (A+31, 27.5), (A+34, 30.5), (A+37, 30.5), (A+37, 23), (A+33, 23), (A+33, 0)],
                             [0, 0, 2, 1, 0.6, 0.6, 0, 0], 5), seg=72, cx=cx))
    # relief valve housing hanging below, between the checks
    add(b, vlathe(fillet([(A-10, 0), (A-10, 16), (A-24, 21), (A-62, 21), (A-68, 17), (A-70, 11), (A-78, 11), (A-78, 8.5), (A-70, 8.5), (A-70, 0)],
                         [0, 0, 6, 4, 3, 1, 0, 0, 0, 0], 5), seg=72, cx=RX))
    # front boss for the relief valve cover (axis along -Y)
    add(b, cyl(18.5, 0, 6, seg=64, bevel=1.0, xform=Matrix.Translation((RX*MM, -18*MM, (A-44)*MM)) @ Matrix.Rotation(math.radians(90), 4, 'X')))
    for x in (-80.0, 76.0):                                                   # test cock bosses (No. 2 / No. 4)
        add(b, cyl(7.2, A+18, A+30, seg=40, cx=x, bevel=1.2))
    add(b, cyl(7.2, A+16, A+30, seg=40, cx=-3, bevel=1.2))                    # test cock No. 3 between the checks
    # raised flow arrow on the outlet side, front face
    arrow = [(52, -1.5), (70, -1.5), (70, -4.4), (80, 0), (70, 4.4), (70, 1.5), (52, 1.5)]
    add(b, prism(arrow, -26.6, -24.2, bevel=0.35, seg=1, xform=Matrix.Translation((0, 0, A*MM)) @ Matrix.Rotation(math.radians(-90), 4, 'X')))
    o = finish("Body_main", b, "W_CastBronze", angle=40)
    # cast lettering
    bm = bmesh.new(); bm.from_mesh(o.data)
    for tb in (V.wrap_text(V.text_bm("NORTHLINE", 5.6), 26, -16, 14), V.wrap_text(V.text_bm("RP 1\"", 4.4), 26, 66, -22)):
        me = bpy.data.meshes.new("_t"); tb.to_mesh(me); tb.free(); n0 = len(bm.faces); bm.from_mesh(me); bpy.data.meshes.remove(me)
        bm.faces.ensure_lookup_table()
        for f in bm.faces[n0:]: f.smooth = False
    bm.to_mesh(o.data); bm.free()
    # dark bores under each check cover (seen once a cover is lifted)
    for cx, nm in ((C1, "Body_Cavity1"), (C2, "Body_Cavity2")):
        finish(nm, cyl(22.6, A+33.5, A+33.9, seg=64, cx=cx), "W_Cavity")   # sits 0.5 mm above the bore floor: no coplanar faces (z-fighting)

def check_covers():
    for i, cx in ((1, C1), (2, C2)):
        c = vlathe(fillet([(A+37, 0), (A+37, 31), (A+41.5, 31), (A+43, 27), (A+44.5, 14), (A+44.5, 0)], [0, 0, 1.2, 4, 3, 0], 6), seg=96, cx=cx)
        finish(f"Cover{i}", c, "W_CastBronze")
        bolts = bmesh.new()
        for k in range(4):
            a = math.radians(45 + 90*k); bx, by = cx + 25.5*math.cos(a), 25.5*math.sin(a)
            add(bolts, prism(ngon(6, 4.0, cx=bx, cy=by), A+41.5, A+45, bevel=0.4, seg=1))
            add(bolts, cyl(4.2, A+41.3, A+41.9, seg=24, cx=bx, cy=by))
        finish(f"CoverBolts{i}", bolts, "W_Stainless")
        finish(f"CoverORing{i}", torus(27.0, 1.4, seg=72, ms=10, xform=Matrix.Translation((cx*MM, 0, (A+37)*MM))), "W_Rubber")

# ---------- relief valve: front cover + internals (axis along -Y) ----------
def relief():
    Ry = lambda y: Matrix.Translation((RX*MM, y*MM, (A-44)*MM)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    cv = cyl(18.5, 0, 5.5, seg=72, bevel=1.4, xform=Ry(-24))
    add(cv, cyl(10, 5.5, 8.5, seg=48, bevel=1.0, xform=Ry(-24)))
    finish("Relief_Cover", cv, "W_CastBronze")
    bolts = bmesh.new()
    for k in range(4):
        a = math.radians(45 + 90*k)
        add(bolts, prism(ngon(6, 3.4), 0, 3.2, bevel=0.35, seg=1,
                         xform=Matrix.Translation(((RX + 13.5*math.cos(a))*MM, -29.5*MM, (A-44 + 13.5*math.sin(a))*MM)) @ Matrix.Rotation(math.radians(90), 4, 'X')))
    finish("Relief_CoverBolts", bolts, "W_Stainless")
    finish("Relief_Diaphragm", cyl(16.5, 0, 1.4, seg=64, xform=Ry(-18.5)), "W_Rubber")
    sp = spring(7.5*MM, 0.8*MM, 14*MM, 5, 0); sp.transform(Ry(-4)); finish("Relief_Spring", sp, "W_SpringSteel")
    d = cyl(9.5, 0, 3.0, seg=48, bevel=0.6); add(d, cyl(2.4, 3.0, 14, seg=16)); d.transform(Ry(-17))
    finish("Relief_Disc", d, "W_PlasticGrey")

# ---------- air-gap funnel under the relief discharge ----------
def airgap():
    f = vlathe(fillet([(30, 23), (29, 24.5), (27, 24.5), (17, 12.5), (10, 12.5), (0, 12.5), (0, 11), (10, 11), (17, 11), (27.5, 22), (30, 23)],
                      [0, 0.8, 1.2, 3, 0, 0, 0, 0, 3, 1.2, 0], 5), seg=72, cx=RX)
    finish("AirGap_Funnel", f, "N_GreyPVC")
    br = bmesh.new()
    for s in (-1, 1):
        add(br, prism(rrect(5, 3, 1.2, cx=RX, cy=s*22.5), 28, A-60, bevel=0.4, seg=1))
        add(br, prism(rrect(5, 6, 1.2, cx=RX, cy=s*20.5), A-62, A-58, bevel=0.4, seg=1))
    finish("AirGap_Brackets", br, "N_GreyPVC")

# ---------- assemble ----------
for tag, S in (("Inlet", -1), ("Outlet", 1)):
    for k, (bm, m) in shutoff().items():
        if S == 1: mirrorX(bm)
        finish(f"{k}_{tag}", bm, m)
body(); check_covers(); relief(); airgap()
check_module(1, C1 - 17, True); check_module(2, C2 - 17, False)
testcock(-112, 0, A+24, "TestCock_1")
testcock(-80, 0, A+30, "TestCock_2"); testcock(-3, 0, A+30, "TestCock_3"); testcock(76, 0, A+30, "TestCock_4")

for o in bpy.data.collections["RPZ"].objects:
    if o.type == 'MESH': V.box_uv(o)

# ---------- preview render ----------
def preview(path, d, dist, tgt, lens=70, explode=False):
    cam = bpy.data.objects.get("PrevCam") or bpy.data.objects.new("PrevCam", bpy.data.cameras.new("PrevCam"))
    if cam.name not in sc.collection.objects: sc.collection.objects.link(cam)
    t = Vector(tgt); dv = Vector(d).normalized(); cam.location = t + dv*dist; cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
    cam.data.lens = lens; sc.camera = cam
    sc.render.engine = 'BLENDER_EEVEE' if 'BLENDER_EEVEE' in [i.identifier for i in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE_NEXT'
    sc.render.resolution_x, sc.render.resolution_y = 1200, 800
    w = sc.world or bpy.data.worlds.new("RPZ_World"); sc.world = w; w.use_nodes = True
    nt = w.node_tree; bg = next(n for n in nt.nodes if n.type == "BACKGROUND")
    env = next((n for n in nt.nodes if n.type == "TEX_ENVIRONMENT"), None) or nt.nodes.new("ShaderNodeTexEnvironment")
    hdr = bpy.data.images.get("interior.exr") or bpy.data.images.load("/Applications/Blender.app/Contents/Resources/5.1/datafiles/studiolights/world/studio.exr")
    env.image = hdr; nt.links.new(env.outputs[0], bg.inputs[0]); bg.inputs[1].default_value = 0.9
    sc.render.filepath = path; sc.render.image_settings.file_format = 'PNG'
    bpy.ops.render.render(write_still=True, scene=sc.name)

preview(os.path.join(HERE, OUT + "_prev_hero.png"), (-0.55, -1, 0.42), 0.95, (0, 0, 0.09))
preview(os.path.join(HERE, OUT + "_prev_front.png"), (0, -1, 0.05), 0.95, (0, 0, 0.085))

for s in list(bpy.data.scenes):
    if s != sc: bpy.data.scenes.remove(s)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, OUT + ".blend"), compress=True)
for o in bpy.data.objects: o.select_set(o.type == 'MESH' and o.name in bpy.data.collections["RPZ"].objects)
bpy.ops.export_scene.gltf(filepath=os.path.join(HERE, OUT + ".glb"), export_format='GLB', use_selection=True, export_draco_mesh_compression_enable=False,
                          export_apply=True, export_cameras=False, export_lights=False, export_yup=True, export_image_format='JPEG', export_jpeg_quality=90)
print("BUILT", OUT, len(bpy.data.collections["RPZ"].objects), "objects")
