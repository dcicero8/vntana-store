# Render the untouched Revit-derived GLB (as VNTANA ingested it) in the same studio + hero camera, materials unchanged.
import bpy, bmesh, math, os
from mathutils import Vector, Matrix
D = os.path.dirname(os.path.abspath(__file__)); GLB = os.path.join(D, "..", "..", "2000B-FP_vntana.glb")
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=GLB)
meshes = [o for o in sc.objects if o.type == 'MESH']
for o in [o for o in sc.objects if o.type == 'CAMERA' or o.name == 'lines']: bpy.data.objects.remove(o, do_unlink=True)
meshes = [o for o in sc.objects if o.type == 'MESH']
R = Matrix.Rotation(math.radians(-90), 4, 'X')            # Revit export lies on its side (product up = -Y)
for o in meshes:
    mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = R @ mw
bpy.context.view_layer.update()
pts = [o.matrix_world @ v.co for o in meshes for v in o.data.vertices]
mn = [min(p[i] for p in pts) for i in range(3)]; mx = [max(p[i] for p in pts) for i in range(3)]
off = Vector((-(mn[0]+mx[0])/2, -(mn[1]+mx[1])/2, -mn[2]))
for o in meshes: o.location += off
# same studio as the v2 renders: grey cyc, key/strip/rim, studio HDRI
bm = bmesh.new(); P = [(i*0.15, 0.0) for i in range(-10, 1)]; Rr = 0.4
for k in range(1, 13):
    a = math.radians(90*k/12); P.append((Rr*math.sin(a), Rr*(1 - math.cos(a))))
P.append((Rr, 1.4)); rows = [[bm.verts.new((x, y + 0.28, z)) for y, z in P] for x in (-1.6, 1.6)]
for i in range(len(P) - 1): bm.faces.new((rows[0][i], rows[1][i], rows[1][i+1], rows[0][i+1]))
me = bpy.data.meshes.new("Cyc"); bm.to_mesh(me); bm.free()
for p in me.polygons: p.use_smooth = True
cyc = bpy.data.objects.new("Cyc", me); sc.collection.objects.link(cyc)
g = bpy.data.materials.new("Grey"); g.use_nodes = True; b = g.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (0.17, 0.175, 0.185, 1); b.inputs["Roughness"].default_value = 0.85; me.materials.append(g)
def area(name, loc, size, power, sy):
    L = bpy.data.lights.new(name, 'AREA'); L.shape = 'RECTANGLE'; L.size = size; L.size_y = sy; L.energy = power
    o = bpy.data.objects.new(name, L); sc.collection.objects.link(o); o.location = loc; o.rotation_euler = (Vector((0, 0, 0.05)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
area("Key", (-0.45, -0.5, 0.55), 0.55, 18, 0.35); area("Strip", (0.55, 0.15, 0.35), 0.9, 9, 0.08); area("Rim", (0.15, 0.6, 0.45), 0.6, 10, 0.2)
w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True; nt = w.node_tree; bg = nt.nodes["Background"]
env = nt.nodes.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(os.path.join(D, "..", "studio_small_09.hdr")); nt.links.new(env.outputs[0], bg.inputs[0]); bg.inputs[1].default_value = 0.3
cam = bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam")); sc.collection.objects.link(cam); sc.camera = cam
t = Vector((0, 0, 0.045)); cam.location = t + Vector((-0.55, -1, 0.42)).normalized()*0.95; cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler(); cam.data.lens = 85
sc.render.engine = 'CYCLES'
prefs = bpy.context.preferences.addons['cycles'].preferences; prefs.compute_device_type = 'METAL'; prefs.get_devices()
for dv in prefs.devices: dv.use = (dv.type == 'METAL')
sc.cycles.device = 'GPU'; sc.cycles.samples = 128; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = 1600, 1067
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 92
sc.view_settings.view_transform = 'Filmic'
try: sc.view_settings.look = 'Medium High Contrast'
except Exception: pass
sc.render.filepath = os.path.join(D, "1_original_revit.jpg"); bpy.ops.render.render(write_still=True)
print("RENDERED original", [round(mx[i]-mn[i], 3) for i in range(3)])
