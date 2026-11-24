import bpy, sys, math, json, os
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
GLB, HDR, OUT, SAMPLES, SIZE = argv[0], argv[1], argv[2], int(argv[3]), int(argv[4])
ONLY = argv[5].split(",") if len(argv) > 5 else None

# name, pitch(deg, viewer convention: negative = camera above), yaw(deg), zoom (1 = fit whole model), target offset (fraction of bbox dims) , aspect
SHOTS = [
    ("hero",     -16,  65, 1.12, (0, 0, 0)),
    ("front",     -6,   0, 1.12, (0, 0, 0)),
    ("vessel",    -8, 180, 1.12, (0, 0, 0)),
    ("displays",  -8, 270, 1.12, (0, 0, 0)),
    ("top",      -60, 120, 1.12, (0, 0, 0)),
    ("rear34",   -14, 220, 1.12, (0, 0, 0)),
]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
sc = bpy.context.scene

meshes = [o for o in sc.objects if o.type == "MESH"]
bpy.context.view_layer.update()
mn = Vector((1e9,) * 3); mx = Vector((-1e9,) * 3)
for o in meshes:
    for c in o.bound_box:
        w = o.matrix_world @ Vector(c)
        mn = Vector(map(min, mn, w)); mx = Vector(map(max, mx, w))
ctr = (mn + mx) / 2; dims = mx - mn
radius = dims.length / 2

# shadow catcher floor
bpy.ops.mesh.primitive_plane_add(size=radius * 20, location=(ctr.x, ctr.y, mn.z))
floor = bpy.context.active_object
floor.is_shadow_catcher = True

# world: product's own VNTANA env HDR (polished steel goes black under generic studio maps)
w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True
nt = w.node_tree; nt.nodes.clear()
tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
env = nt.nodes.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(HDR)
bg = nt.nodes.new("ShaderNodeBackground"); bg.inputs["Strength"].default_value = 1.0
out = nt.nodes.new("ShaderNodeOutputWorld")
mp.inputs["Rotation"].default_value = (0, 0, math.radians(90))
nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"])
nt.links.new(mp.outputs["Vector"], env.inputs["Vector"])
nt.links.new(env.outputs["Color"], bg.inputs["Color"])
nt.links.new(bg.outputs["Background"], out.inputs["Surface"])

# soft key + fill area lights for form
def area(loc, energy, size):
    d = bpy.data.lights.new("A", "AREA"); d.energy = energy; d.size = size
    o = bpy.data.objects.new("A", d); sc.collection.objects.link(o)
    o.location = loc
    dirv = ctr - Vector(loc); o.rotation_euler = dirv.to_track_quat("-Z", "Y").to_euler()
r = radius
area((ctr.x + r * 2.0, ctr.y - r * 2.0, ctr.z + r * 2.5), 650 * r * r, r * 2.5)
area((ctr.x - r * 2.5, ctr.y - r * 1.0, ctr.z + r * 1.2), 220 * r * r, r * 3)
area((ctr.x - r * 0.5, ctr.y + r * 2.5, ctr.z + r * 2.0), 300 * r * r, r * 2.5)

try:
    sc.render.engine = "CYCLES"
except TypeError:
    pass
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
try:
    sc.cycles.device = "GPU"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"; prefs.get_devices()
    for d in prefs.devices: d.use = True
except Exception:
    sc.cycles.device = "CPU"
sc.render.film_transparent = True
sc.render.resolution_x = SIZE; sc.render.resolution_y = SIZE
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA"
try:
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
except TypeError:
    pass

cam_d = bpy.data.cameras.new("C"); cam_d.lens = 70
cam = bpy.data.objects.new("C", cam_d); sc.collection.objects.link(cam); sc.camera = cam
fov = 2 * math.atan(cam_d.sensor_width / 2 / cam_d.lens)

os.makedirs(OUT, exist_ok=True)
log = {}
for name, pitch, yaw, zoom, off in SHOTS:
    if ONLY and name not in ONLY:
        continue
    p = math.radians(-pitch); y = math.radians(yaw)
    # viewer yaw 0 looks at glTF +Z face = Blender -Y; yaw rotates toward +X
    dirv = Vector((math.sin(y) * math.cos(p), -math.cos(y) * math.cos(p), math.sin(p)))
    tgt = ctr + Vector((off[0] * dims.x, off[1] * dims.y, off[2] * dims.z))
    dist = (radius * 1.08 / math.sin(fov / 2)) / zoom
    cam.location = tgt + dirv * dist
    cam.rotation_euler = (-dirv).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = os.path.join(OUT, name + ".png")
    bpy.ops.render.render(write_still=True)
    log[name] = [round(v, 3) for v in cam.location]
print("DONE", json.dumps({"dims": [round(v, 3) for v in dims], "cams": log}))
