# Option B: the Watts 2000B-FP installed in context (fire sprinkler line in a mechanical room).
# Same valve materials as the studio set (option A); only the setting changes.
# Blender -b ../../2000B-FP_v6.blend --python render_watts_context.py -- <out.jpg> [samples] [shot]
import bpy, bmesh, math, os, sys
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__))
V2 = os.path.join(HERE, "..", "render_watts_v2.py")
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else os.path.join(HERE, "watts_context.jpg")
SAMPLES = int(argv[1]) if len(argv) > 1 else 256
SHOT = argv[2] if len(argv) > 2 else "wide"

# reuse the option-A handwheel + layered valve materials verbatim (everything before the studio section)
src = open(V2).read(); src = src[:src.index("# ------------------------------------------------------------------ studio")]
sys.argv = [sys.argv[0], "--", "hero", "/dev/null"]       # keep v2's arg parsing happy
CTX = HERE; _keep = (OUT, SAMPLES, SHOT)
__file__ = V2                                         # so v2 resolves its own paths (vlib in admin/rpz)
exec(compile(src, V2, "exec"))
HERE = CTX; OUT, SAMPLES, SHOT = _keep
import vlib as V
from vlib import MM, add, lathe, prism, cyl, ngon, rrect, torus

for c in ("Studio",):
    col = bpy.data.collections.get(c)
    if col:
        for o in list(col.objects): bpy.data.objects.remove(o, do_unlink=True)
env = bpy.data.collections.get("Context") or bpy.data.collections.new("Context")
if env.name not in sc.collection.children: sc.collection.children.link(env)
for o in list(env.objects): bpy.data.objects.remove(o, do_unlink=True)

FLOOR = -0.62          # metres; valve centreline is at z = 0.026
WALL_Y = 0.24          # wall behind the valve (front is -Y)

def put(name, bm, mat):
    me = bpy.data.meshes.new(name); bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    for f in bm.faces: f.smooth = True
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); env.objects.link(o); me.materials.append(mat); return o

# ---------- materials for the room ----------
def texmat(name, stem, tile, nor_strength=1.0, tint=None, rough_mul=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); L = nt.links.new
    out = nt.nodes.new("ShaderNodeOutputMaterial"); bs = nt.nodes.new("ShaderNodeBsdfPrincipled"); L(bs.outputs[0], out.inputs[0])
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1/tile, 1/tile, 1/tile)
    L(tc.outputs["UV"], mp.inputs["Vector"])
    def img(kind, non_color):
        t = nt.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(os.path.join(HERE, f"{stem}_{kind}.jpg"), check_existing=True)
        if non_color: t.image.colorspace_settings.name = 'Non-Color'
        L(mp.outputs[0], t.inputs["Vector"]); return t
    d = img("diff", False)
    if tint:
        mx = nt.nodes.new("ShaderNodeMixRGB"); mx.blend_type = 'MULTIPLY'; mx.inputs[0].default_value = 1.0
        mx.inputs[2].default_value = (*tint, 1); L(d.outputs[0], mx.inputs[1]); L(mx.outputs[0], bs.inputs["Base Color"])
    else: L(d.outputs[0], bs.inputs["Base Color"])
    r = img("rough", True); rm = nt.nodes.new("ShaderNodeMath"); rm.operation = 'MULTIPLY'; rm.inputs[1].default_value = rough_mul
    L(r.outputs[0], rm.inputs[0]); L(rm.outputs[0], bs.inputs["Roughness"])
    n = img("nor", True); nm = nt.nodes.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = nor_strength
    L(n.outputs[0], nm.inputs["Color"]); L(nm.outputs[0], bs.inputs["Normal"])
    return m
def painted_cmu():
    """Painted concrete masonry units: 16 x 8 in blocks, running bond, light grey paint, recessed mortar (procedural)."""
    m = bpy.data.materials.new("C_PaintedCMU"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); L = nt.links.new
    out = nt.nodes.new("ShaderNodeOutputMaterial"); bs = nt.nodes.new("ShaderNodeBsdfPrincipled"); L(bs.outputs[0], out.inputs[0])
    tc = nt.nodes.new("ShaderNodeTexCoord")
    # wall lies in the XZ plane: use world-ish X and Z as the brick UV
    sep = nt.nodes.new("ShaderNodeSeparateXYZ"); L(tc.outputs["Object"], sep.inputs[0])
    com = nt.nodes.new("ShaderNodeCombineXYZ"); L(sep.outputs["X"], com.inputs["X"]); L(sep.outputs["Z"], com.inputs["Y"])
    br = nt.nodes.new("ShaderNodeTexBrick"); L(com.outputs[0], br.inputs["Vector"])
    br.inputs["Scale"].default_value = 2.0; br.inputs["Brick Width"].default_value = 0.406; br.inputs["Row Height"].default_value = 0.203
    br.inputs["Mortar Size"].default_value = 0.012; br.inputs["Mortar Smooth"].default_value = 0.3; br.offset = 0.5
    br.inputs["Color1"].default_value = (0.40, 0.405, 0.40, 1); br.inputs["Color2"].default_value = (0.37, 0.375, 0.37, 1); br.inputs["Mortar"].default_value = (0.33, 0.33, 0.325, 1)
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 140; nz.inputs["Detail"].default_value = 8; L(tc.outputs["Object"], nz.inputs["Vector"])
    nz2 = nt.nodes.new("ShaderNodeTexNoise"); nz2.inputs["Scale"].default_value = 3; nz2.inputs["Detail"].default_value = 4; L(tc.outputs["Object"], nz2.inputs["Vector"])
    grime = nt.nodes.new("ShaderNodeMapRange"); grime.inputs["From Min"].default_value = 0.4; grime.inputs["From Max"].default_value = 0.75
    grime.inputs["To Min"].default_value = 0.0; grime.inputs["To Max"].default_value = 0.25; L(nz2.outputs["Fac"], grime.inputs["Value"])
    mix = nt.nodes.new("ShaderNodeMixRGB"); mix.blend_type = 'MULTIPLY'; L(grime.outputs[0], mix.inputs[0]); L(br.outputs["Color"], mix.inputs[1])
    mix.inputs[2].default_value = (0.55, 0.52, 0.47, 1); L(mix.outputs[0], bs.inputs["Base Color"])
    bs.inputs["Roughness"].default_value = 0.8
    hb = nt.nodes.new("ShaderNodeMath"); hb.operation = 'ADD'; L(br.outputs["Fac"], hb.inputs[0])
    sc2 = nt.nodes.new("ShaderNodeMath"); sc2.operation = 'MULTIPLY'; sc2.inputs[1].default_value = 0.15; L(nz.outputs["Fac"], sc2.inputs[0]); L(sc2.outputs[0], hb.inputs[1])
    bp = nt.nodes.new("ShaderNodeBump"); bp.invert = True; bp.inputs["Strength"].default_value = 0.6; bp.inputs["Distance"].default_value = 0.004
    L(hb.outputs[0], bp.inputs["Height"]); L(bp.outputs[0], bs.inputs["Normal"])
    return m
wall_m = painted_cmu()
floor_m = texmat("C_Floor", "concrete_floor_worn_001", 1.6, 0.8, rough_mul=1.0)
# painted steel / iron reuse the layered() preset from option A so pipe paint matches the valve's paint quality
pipe_m = layered("C_PipeRed", (0.11, 0.006, 0.005), 0.0, 0.55, dirt=(0.05, 0.02, 0.015), dirt_amt=0.6, coat=0.2, chip=0.5, chip_col=(0.25, 0.22, 0.2), bump=0.03, var=0.1)
coup_m = layered("C_CouplingIron", (0.035, 0.035, 0.037), 0.0, 0.5, dirt=(0.02, 0.02, 0.02), dirt_amt=0.4, chip=0.4, chip_col=(0.3, 0.3, 0.3), bump=0.06, var=0.08, bump_scale=900)
galv_m = layered("C_Galv", (0.40, 0.41, 0.42), 1.0, 0.45, dirt=(0.08, 0.08, 0.08), dirt_amt=0.5, bump=0.03, var=0.2)

# ---------- room ----------
g = bmesh.new(); _uv = g.loops.layers.uv.new("UVMap"); bmesh.ops.create_grid(g, x_segments=1, y_segments=1, size=2.5, calc_uvs=True)
for f in g.faces:
    for l in f.loops: l[_uv].uv *= 5.0
g.transform(Matrix.Translation((0, 0, FLOOR))); put("Floor", g, floor_m)
g = bmesh.new(); _uv = g.loops.layers.uv.new("UVMap"); bmesh.ops.create_grid(g, x_segments=1, y_segments=1, size=2.5, calc_uvs=True)
for f in g.faces:
    for l in f.loops: l[_uv].uv *= 5.0
g.transform(Matrix.Translation((0, WALL_Y, FLOOR + 2.5)) @ Matrix.Rotation(math.radians(90), 4, 'X')); put("Wall", g, wall_m)

# ---------- red sprinkler pipe both sides, grooved couplings, hangers ----------
AX = 0.026
for S in (-1, 1):
    x0 = 0.1685; x1 = 1.9
    p = lathe([(x0*1000, 0), (x0*1000, 14.0), (x1*1000, 14.0), (x1*1000, 16.7), (x0*1000 + 1.2, 16.7), (x0*1000, 15.6), (x0*1000, 14.0)], seg=72)
    p = lathe([(x0*1000 + 0.5, 15.6), (x0*1000 + 1.5, 16.7), (x1*1000, 16.7), (x1*1000, 0)], seg=72)
    # groove near the joint so the coupling key has something to sit in
    if S < 0: V.mirrorX(p)
    put(f"Pipe_{'L' if S < 0 else 'R'}", p, pipe_m)
    for xc, tag in ((x0 + 0.002, "A"), (S*0 + 0.95, "B")):
        c = lathe([(xc*1000 - 12, 17.0), (xc*1000 - 11, 22.5), (xc*1000 + 11, 22.5), (xc*1000 + 12, 17.0)], seg=72)
        for zz in (1, -1):   # bolt pads + bolts, top and bottom, like a two-piece grooved coupling
            add(c, prism(rrect(16, 13, 3, cx=xc*1000, cy=0), 0, 9, bevel=1.2, seg=2,
                         xform=Matrix.Translation((0, 0, AX + zz*0.0205)) @ (Matrix() if zz > 0 else Matrix.Rotation(math.pi, 4, 'X'))))
            add(c, cyl(3.2, -14, 14, seg=16, cx=0, cy=0, xform=Matrix.Translation((xc, -0.006, AX + zz*0.026)) @ Matrix.Rotation(math.radians(90), 4, 'X')))
            add(c, prism(ngon(6, 5.2), 0, 4.5, bevel=0.4, seg=1, xform=Matrix.Translation((xc, -0.014, AX + zz*0.026)) @ Matrix.Rotation(math.radians(90), 4, 'X')))
        if S < 0: V.mirrorX(c)
        put(f"Coupling_{tag}_{'L' if S < 0 else 'R'}", c, coup_m)
    # clevis hanger + threaded rod to the ceiling
    hx = S*0.62
    h = torus(20.5, 2.2, seg=48, ms=10, xform=Matrix.Translation((hx, 0, AX)) @ Matrix.Rotation(math.radians(90), 4, 'Y'))
    add(h, cyl(4.5, AX*1000 + 20, 1600, seg=16, cx=hx*1000, cy=0))
    add(h, prism(ngon(6, 7.5, cx=hx*1000), AX*1000 + 22, AX*1000 + 28, bevel=0.5, seg=1))
    put(f"Hanger_{'L' if S < 0 else 'R'}", h, galv_m)

# ---------- lighting: real boiler-room HDRI + overhead fixture + soft key ----------
w = sc.world or bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True; nt = w.node_tree
for n in [n for n in nt.nodes if n.type in ("TEX_ENVIRONMENT", "MAPPING", "TEX_COORD")]: nt.nodes.remove(n)
bgn = next(n for n in nt.nodes if n.type == "BACKGROUND")
envn = nt.nodes.new("ShaderNodeTexEnvironment"); envn.image = bpy.data.images.load(os.path.join(HERE, "boiler_room.hdr"), check_existing=True)
mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Rotation"].default_value[2] = math.radians(200); tcw = nt.nodes.new("ShaderNodeTexCoord")
nt.links.new(tcw.outputs["Generated"], mp.inputs["Vector"]); nt.links.new(mp.outputs[0], envn.inputs["Vector"]); nt.links.new(envn.outputs[0], bgn.inputs[0])
bgn.inputs[1].default_value = 0.8
def light(name, loc, size, sy, power, color, aim):
    Ld = bpy.data.lights.new(name, 'AREA'); Ld.shape = 'RECTANGLE'; Ld.size = size; Ld.size_y = sy; Ld.energy = power; Ld.color = color
    o = bpy.data.objects.new(name, Ld); env.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(aim) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
light("Overhead", (0.1, -0.35, 1.25), 1.2, 0.12, 55, (1.0, 0.96, 0.9), (0.0, 0.0, 0.0))     # strip fixture above
light("Key", (-0.7, -0.75, 0.45), 0.5, 0.35, 16, (1.0, 0.98, 0.95), (0, 0, 0.03))
light("Bounce", (0.6, -0.6, -0.3), 0.8, 0.5, 4, (0.9, 0.95, 1.0), (0, 0, 0.03))

# ---------- camera ----------
cam = bpy.data.objects.get("RenderCam") or bpy.data.objects.new("RenderCam", bpy.data.cameras.new("RenderCam"))
if cam.name not in env.objects and cam.name not in sc.objects: env.objects.link(cam)
sc.camera = cam
SHOTS = {"wide": ((-0.5, -1, 0.42), 0.82, (0.0, 0.03, 0.02), 50, 5.6), "close": ((-0.5, -1, 0.3), 0.8, (0.0, 0.0, 0.035), 70, 5.6)}
d, dist, tgt, lens, fstop = SHOTS[SHOT]
t = Vector(tgt); cam.location = t + Vector(d).normalized()*dist; cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.lens = lens; cam.data.dof.use_dof = True; cam.data.dof.focus_distance = dist; cam.data.dof.aperture_fstop = fstop

# ---------- render ----------
sc.render.engine = 'CYCLES'
prefs = bpy.context.preferences.addons['cycles'].preferences; prefs.compute_device_type = 'METAL'; prefs.get_devices()
for dv in prefs.devices: dv.use = (dv.type == 'METAL')
sc.cycles.device = 'GPU'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True; sc.cycles.use_adaptive_sampling = True
sc.cycles.max_bounces = 10
sc.render.resolution_x, sc.render.resolution_y = 1600, 1067; sc.render.resolution_percentage = 100
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 92
sc.view_settings.view_transform = 'Filmic'
try: sc.view_settings.look = 'Medium High Contrast'
except Exception: pass
sc.render.filepath = OUT
bpy.ops.render.render(write_still=True, scene=sc.name)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "watts_context.blend"), compress=True)
print("RENDERED", OUT)
