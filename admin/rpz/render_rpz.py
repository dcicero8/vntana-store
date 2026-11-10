# Studio renders for the Northline RPZ (headless): Blender -b northline_rpz_v2.blend --python render_rpz.py
import bpy, bmesh, math, os
from mathutils import Vector
OUT = "/Users/derekcicero/Documents/Claude/Code Projects/vntana-store/assets/northline"; os.makedirs(OUT, exist_ok=True)
sc = bpy.data.scenes["Northline_RPZ"]
st = bpy.data.collections.new("Studio"); sc.collection.children.link(st)

# cyclorama backdrop
bm = bmesh.new(); P = [(i*0.15, 0.0) for i in range(-10, 1)]; R = 0.35
for k in range(1, 13):
    a = math.radians(90*k/12); P.append((R*math.sin(a), R*(1 - math.cos(a))))
P.append((R, 1.4)); rows = [[bm.verts.new((x, y + 0.25, z)) for y, z in P] for x in (-1.6, 1.6)]
for i in range(len(P) - 1): bm.faces.new((rows[0][i], rows[1][i], rows[1][i+1], rows[0][i+1]))
me = bpy.data.meshes.new("Cyc"); bm.to_mesh(me); bm.free()
for p in me.polygons: p.use_smooth = True
cyc = bpy.data.objects.new("Cyc", me); st.objects.link(cyc)
wm = bpy.data.materials.new("Studio_White"); wm.use_nodes = True
b = next(n for n in wm.node_tree.nodes if n.type == "BSDF_PRINCIPLED"); b.inputs["Base Color"].default_value = (0.85, 0.85, 0.86, 1); b.inputs["Roughness"].default_value = 0.9
me.materials.append(wm)
blk = bpy.data.materials.new("Studio_Black"); blk.use_nodes = True
b = next(n for n in blk.node_tree.nodes if n.type == "BSDF_PRINCIPLED"); b.inputs["Base Color"].default_value = (0.005, 0.005, 0.005, 1)
def area(name, loc, size, power, aim=(0, 0, 0.09)):
    L = bpy.data.lights.new(name, 'AREA'); L.size = size; L.size_y = size*0.6; L.shape = 'RECTANGLE'; L.energy = power
    o = bpy.data.objects.new(name, L); st.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(aim) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
area("Key", (-0.35, -0.55, 0.6), 0.35, 9); area("Fill", (0.55, -0.35, 0.3), 0.8, 0.6); area("Rim", (0.1, 0.45, 0.55), 0.5, 6); area("Top", (0, 0, 0.95), 0.9, 0.8)
def flag(name, loc, size):
    m2 = bpy.data.meshes.new(name); b2 = bmesh.new(); bmesh.ops.create_grid(b2, x_segments=1, y_segments=1, size=size/2); b2.to_mesh(m2); b2.free()
    m2.materials.append(blk); o = bpy.data.objects.new(name, m2); st.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((0, 0, 0.09)) - Vector(loc)).to_track_quat('Z', 'Y').to_euler(); o.visible_camera = False
flag("FlagL", (-0.8, 0.05, 0.25), 0.6); flag("FlagR", (0.8, 0.05, 0.25), 0.6); flag("FlagFront", (0.05, -0.75, 0.12), 0.5)
w = sc.world or bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True
bg = next(n for n in w.node_tree.nodes if n.type == "BACKGROUND"); bg.inputs[1].default_value = 0.12
for n in [n for n in w.node_tree.nodes if n.type == "TEX_ENVIRONMENT"]: w.node_tree.nodes.remove(n)
bg.inputs[0].default_value = (0.8, 0.8, 0.82, 1)
for o in list(sc.objects):
    if o.name == "PrevCam": bpy.data.objects.remove(o, do_unlink=True)

cam = bpy.data.objects.new("RenderCam", bpy.data.cameras.new("RenderCam")); st.objects.link(cam); sc.camera = cam
def aim(d, dist, tgt, lens=85):
    t = Vector(tgt); dv = Vector(d).normalized(); cam.location = t + dv*dist
    cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler(); cam.data.lens = lens
sc.render.engine = 'CYCLES'
prefs = bpy.context.preferences.addons['cycles'].preferences; prefs.compute_device_type = 'METAL'; prefs.get_devices()
for d in prefs.devices: d.use = (d.type == 'METAL')
sc.cycles.device = 'GPU'; sc.cycles.samples = 128; sc.cycles.use_denoising = True; sc.cycles.use_adaptive_sampling = True
sc.render.resolution_x, sc.render.resolution_y = 1600, 1067
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 90
sc.view_settings.view_transform = 'Filmic' if 'Filmic' in [i.identifier for i in bpy.types.ColorManagedViewSettings.bl_rna.properties['view_transform'].enum_items] else 'AgX'

def shot(name, d, dist, tgt, lens=85):
    aim(d, dist, tgt, lens); sc.render.filepath = os.path.join(OUT, f"render_{name}.jpg"); bpy.ops.render.render(write_still=True, scene=sc.name)

shot("hero", (-0.55, -1, 0.42), 1.0, (0, 0, 0.085))
shot("front", (0, -1, 0.08), 1.05, (0, 0, 0.085))
shot("top", (0.55, -0.75, 1.0), 1.0, (0, 0, 0.09))
shot("detail", (-0.35, -1, 0.05), 0.42, (-0.003, 0, 0.05))
# service pose: covers up, checks lifted and fanned, relief internals pulled forward (Blender -Y = front)
O = bpy.data.objects
off = {"Cover1": (0, 0, .075), "CoverBolts1": (0, 0, .075), "Cover2": (0, 0, .075), "CoverBolts2": (0, 0, .075), "CoverORing1": (0, 0, .06), "CoverORing2": (0, 0, .06),
       "Relief_Cover": (0, -.075, 0), "Relief_CoverBolts": (0, -.075, 0), "Relief_Diaphragm": (0, -.055, 0), "Relief_Disc": (0, -.04, 0), "Relief_Spring": (0, -.026, 0)}
SP = {"Seat": -.016, "SeatORing": -.010, "Disc": -.003, "Spring": .004, "Cage": .011}
for k, dx in SP.items():
    off[f"Check1_{k}"] = (dx*2.2, 0, .07); off[f"Check2_{k}"] = (dx*2.2, 0, .07)
for n, v in off.items(): O[n].location = v
shot("service", (-0.35, -1, 0.45), 1.0, (0, 0, 0.11))
print("RENDERED", sorted(os.listdir(OUT)))
