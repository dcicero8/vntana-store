# v9 bolts pass (Ashley: bolts looked fake; same fix as Northline v7): the 6 cover bolts become real cap screws:
# hex head with the top corners chamfered off, flat washer, small raised "8.8" grade mark, stud thread showing at the cover edge.
# Faceted shading (no smoothing into domes); render preset gives them matte zinc with a tight shading bevel.
# Backup: 2000B-FP_v9_pre_bolts.blend.   Blender -b 2000B-FP_v9.blend --python modify_watts_v9n.py
import bpy, bmesh, math, os, sys, shutil
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "rpz"))
import vlib as V
from vlib import MM, cyl, add
sc = bpy.data.scenes["Watts_2000BFP"]
if bpy.context.window: bpy.context.window.scene = sc
V.SC = sc; V.COLL = "Rebuild"
O = bpy.data.objects
bk = os.path.join(HERE, "2000B-FP_v9_pre_bolts.blend")
if not os.path.exists(bk): shutil.copy(bpy.data.filepath, bk)

def hexbolt(af, h, wr, wt, rot=0.0):
    """Cap screw at the origin, axis +Z: washer (0..wt), hex head with chamfered top corners, raised grade mark."""
    R = af/2/math.cos(math.pi/6); ri = af/2
    b = cyl(wr, 0, wt, seg=40, bevel=0.2)
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
    t = V.text_bm("8.8", af*0.26, extrude=0.16); t.transform(Matrix.Translation((0, 0, (z2 - 0.02)*MM)) @ Matrix.Rotation(rot + 0.4, 4, 'Z')); add(b, t)
    return b

# cover outline -> 6 corner centres (same clustering as v9e), cover top / bottom
cover = O["Cover"]; cp = [v.co*1000 for v in cover.data.vertices]
ztop, zbot = max(p.z for p in cp), min(p.z for p in cp)
hull = sorted(set((round(p.x, 3), round(p.y, 3)) for p in cp if p.z > ztop - 0.01))
corners = []
for q in hull:
    for g in corners:
        if (Vector(q) - Vector(g[0])).length < 12: g.append(q); break
    else: corners.append([q])
corners = [Vector((sum(a for a, b in g)/len(g), sum(b for a, b in g)/len(g))) for g in corners]
C = Vector(((min(p.x for p in cp) + max(p.x for p in cp))/2, 0.0))
# keep only the true outline corners (farthest points), in case the top face cluster picked up interior points
corners = sorted(corners, key=lambda c: -(c - C).length)[:6]
print("cover corners", [(round(c.x, 1), round(c.y, 1)) for c in corners], "top", round(ztop, 1))
bolts = bmesh.new()
for i, p in enumerate(corners):
    d = (C - p).normalized(); q = p + d*4.0
    hb = hexbolt(13.0, 6.0, 8.6, 1.2, rot=0.35*i); hb.transform(Matrix.Translation((q.x*MM, q.y*MM, ztop*MM))); add(bolts, hb)
    for k in range(5):                                                       # stud thread visible in the gap at the cover edge
        z0 = zbot + 0.9*k
        add(bolts, cyl(4.5 if k % 2 == 0 else 4.0, z0, min(z0 + 0.9, ztop), seg=24, cx=q.x, cy=q.y))
bo = O["CoverBolts"]
bmesh.ops.remove_doubles(bolts, verts=bolts.verts, dist=1e-6)
me = bpy.data.meshes.new("CoverBolts_v9n"); bolts.to_mesh(me); bolts.free()
me.materials.append(bpy.data.materials["W_Stainless"])
for f in me.polygons: f.use_smooth = False                                   # faceted: crisp hex flats, not smoothed domes
bo.data = me; V.box_uv(bo)

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "2000B-FP_v9.blend"), compress=True)
meshes = [o for o in sc.objects if o.type == 'MESH' and o.users_collection and o.users_collection[0].name not in ("Studio", "Revit_ref", "Context")]
vl = bpy.context.view_layer
for o in vl.objects: o.select_set(o in meshes and o.visible_get())
bpy.ops.export_scene.gltf(filepath=os.path.join(HERE, "2000B-FP_v9.glb"), export_format='GLB', use_selection=True, export_draco_mesh_compression_enable=False,
                          export_apply=True, export_cameras=False, export_lights=False, export_yup=True, export_image_format='JPEG', export_jpeg_quality=90)
print("V9N DONE")
