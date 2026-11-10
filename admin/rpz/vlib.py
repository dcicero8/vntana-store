# Shared Blender modeling helpers for the backflow demos (Watts 2000B-FP rebuild, Northline RPZ).
# Units: helper inputs are millimetres; Blender scene is metres. Pipe axis runs along X at height AXZ.
import bpy, bmesh, math
from mathutils import Vector, Matrix

MM = 0.001
AXZ = 0.026          # pipe-axis height in metres; scripts override this per model
SC = None            # target scene, set by the build script
COLL = "Build"

def coll():
    c = bpy.data.collections.get(COLL)
    if not c:
        c = bpy.data.collections.new(COLL); SC.collection.children.link(c)
    return c

def finish(name, bm, mat, angle=35):
    old = bpy.data.objects.get(name)
    if old: bpy.data.objects.remove(old, do_unlink=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    th = math.radians(angle)
    for f in bm.faces: f.smooth = True
    for e in bm.edges:
        if len(e.link_faces) == 2 and e.calc_face_angle(0) > th: e.smooth = False
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); coll().objects.link(o)
    me.materials.append(bpy.data.materials[mat])
    return o

def add(bm, other):
    me = bpy.data.meshes.new("_t"); other.to_mesh(me); bm.from_mesh(me); bpy.data.meshes.remove(me); other.free(); return bm

def fillet(pts, rad, n=6):
    out = [pts[0]]
    for i in range(1, len(pts) - 1):
        R = rad[i] if isinstance(rad, (list, tuple)) else rad
        p0, p1, p2 = Vector(pts[i-1]), Vector(pts[i]), Vector(pts[i+1])
        a = p0 - p1; b = p2 - p1
        if R <= 0 or a.length < 1e-6 or b.length < 1e-6: out.append(pts[i]); continue
        R = min(R, a.length * 0.49, b.length * 0.49); a.normalize(); b.normalize()
        A = p1 + a * R; B = p1 + b * R
        for k in range(n + 1):
            t = k / n; q = (1-t)**2*A + 2*(1-t)*t*p1 + t*t*B; out.append((q.x, q.y))
    out.append(pts[-1]); return out

def lathe(pts, seg=72, cx=0, cy=0, cz=None):
    """(x_mm, r_mm) polyline revolved about the X axis at height cz (default AXZ)."""
    cz = AXZ if cz is None else cz
    bm = bmesh.new(); rings = []
    for (x, r) in pts:
        if r <= 1e-6: rings.append([bm.verts.new((x*MM+cx, cy, cz))]); continue
        rings.append([bm.verts.new((x*MM+cx, cy+r*MM*math.cos(2*math.pi*k/seg), cz+r*MM*math.sin(2*math.pi*k/seg))) for k in range(seg)])
    for a, b in zip(rings, rings[1:]):
        if len(a) == 1 and len(b) == 1: continue
        if len(a) == 1:
            for k in range(seg): bm.faces.new((a[0], b[(k+1) % seg], b[k]))
        elif len(b) == 1:
            for k in range(seg): bm.faces.new((a[k], a[(k+1) % seg], b[0]))
        else:
            for k in range(seg): bm.faces.new((a[k], a[(k+1) % seg], b[(k+1) % seg], b[k]))
    return bm

def vlathe(pts, seg=64, cx=0, cy=0, z0=0):
    """(z_mm, r_mm) polyline revolved about a vertical axis at (cx, cy) mm, z measured from z0 mm."""
    bm = lathe([(z, r) for z, r in pts], seg=seg, cz=0)
    bm.transform(Matrix.Translation((cx*MM, cy*MM, z0*MM)) @ Matrix.Rotation(math.radians(-90), 4, 'Y'))
    return bm

def prism(poly, z0, z1, bevel=0.0, seg=3, xform=None):
    bm = bmesh.new()
    vs = [bm.verts.new((x*MM, y*MM, z0*MM)) for x, y in poly]
    f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    bmesh.ops.translate(bm, vec=(0, 0, (z1-z0)*MM), verts=[v for v in ext["geom"] if isinstance(v, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    if bevel > 0:
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=bevel*MM, segments=seg, affect='EDGES', profile=0.5, clamp_overlap=True)
    if xform: bm.transform(xform)
    return bm

def ngon(n, r, rot=0, cx=0, cy=0):
    return [(cx + r*math.cos(rot + 2*math.pi*k/n), cy + r*math.sin(rot + 2*math.pi*k/n)) for k in range(n)]

def rrect(w, h, r, n=6, cx=0, cy=0):
    pts = []
    for (sx, sy, a0) in ((1, 1, 0), (-1, 1, 90), (-1, -1, 180), (1, -1, 270)):
        ccx = cx + sx*(w/2 - r); ccy = cy + sy*(h/2 - r)
        for k in range(n + 1):
            a = math.radians(a0 + 90*k/n); pts.append((ccx + r*math.cos(a), ccy + r*math.sin(a)))
    return pts

def cyl(r, z0, z1, seg=48, cx=0, cy=0, bevel=0.0, xform=None):
    return prism(ngon(seg, r, cx=cx, cy=cy), z0, z1, bevel=bevel, seg=2, xform=xform)

def hexX(af, x0, x1, bevel=0.6, cz=None):
    cz = AXZ if cz is None else cz
    r = af / 2 / math.cos(math.pi/6)
    bm = prism(ngon(6, r), 0, (x1 - x0), bevel=bevel, seg=2)
    bm.transform(Matrix.Translation((x0*MM, 0, cz)) @ Matrix.Rotation(math.radians(90), 4, 'Y') @ Matrix.Rotation(math.radians(30), 4, 'Z'))
    return bm

def torus(R, r, seg=64, ms=16, sx=1.0, sy=1.0, xform=None):
    bm = bmesh.new(); rows = []
    for i in range(seg):
        a = 2*math.pi*i/seg; row = []
        for j in range(ms):
            b = 2*math.pi*j/ms
            row.append(bm.verts.new(((R + r*sx*math.cos(b))*MM*math.cos(a), (R + r*sx*math.cos(b))*MM*math.sin(a), r*sy*MM*math.sin(b))))
        rows.append(row)
    for i in range(seg):
        for j in range(ms): bm.faces.new((rows[i][j], rows[(i+1) % seg][j], rows[(i+1) % seg][(j+1) % ms], rows[i][(j+1) % ms]))
    if xform: bm.transform(xform)
    return bm

def spring(R, wire, L, turns, z):
    bm = bmesh.new(); N = turns*24; ms = 8; rows = []
    for i in range(N + 1):
        t = i/N; a = 2*math.pi*turns*t; c = Vector((R*math.cos(a), R*math.sin(a), z + L*t))
        tan = Vector((-R*math.sin(a)*2*math.pi*turns, R*math.cos(a)*2*math.pi*turns, L)).normalized()
        nrm = Vector((math.cos(a), math.sin(a), 0)); bn = tan.cross(nrm)
        rows.append([bm.verts.new(c + wire*(math.cos(2*math.pi*j/ms)*nrm + math.sin(2*math.pi*j/ms)*bn)) for j in range(ms)])
    for i in range(N):
        for j in range(ms): bm.faces.new((rows[i][j], rows[i+1][j], rows[i+1][(j+1) % ms], rows[i][(j+1) % ms]))
    return bm

def mirrorX(bm):
    bm.transform(Matrix.Scale(-1, 4, (1, 0, 0))); bmesh.ops.reverse_faces(bm, faces=bm.faces[:]); return bm

def ring(ro, ri, h, z, seg=48):
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=False, segments=seg, radius=ro)
    bmesh.ops.create_circle(bm, cap_ends=False, segments=seg, radius=ri)
    bm.edges.ensure_lookup_table(); bmesh.ops.bridge_loops(bm, edges=bm.edges[:])
    ext = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
    bmesh.ops.translate(bm, vec=(0, 0, h), verts=[v for v in ext["geom"] if isinstance(v, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:]); bmesh.ops.translate(bm, vec=(0, 0, z), verts=bm.verts); return bm

def box_uv(obj, T=0.03):
    bm = bmesh.new(); bm.from_mesh(obj.data); uv = bm.loops.layers.uv.get("UVMap") or bm.loops.layers.uv.new("UVMap"); bm.normal_update()
    for f in bm.faces:
        n = f.normal; ax = max(range(3), key=lambda i: abs(n[i]))
        for l in f.loops:
            p = l.vert.co; u, v = ((p.y, p.z), (p.x, p.z), (p.x, p.y))[ax]; l[uv].uv = (u/T, v/T)
    bm.to_mesh(obj.data); bm.free()

def mat(name, col, metal, rough):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*col, 1); b.inputs["Metallic"].default_value = metal; b.inputs["Roughness"].default_value = rough
    return m

def text_bm(txt, size, extrude=0.45, font="/System/Library/Fonts/Supplemental/Arial Black.ttf"):
    cu = bpy.data.curves.new("_txt", "FONT"); cu.body = txt; cu.size = size*MM; cu.extrude = extrude*MM; cu.align_x = 'CENTER'; cu.align_y = 'CENTER'
    try: cu.font = bpy.data.fonts.load(font, check_existing=True)
    except Exception: pass
    ob = bpy.data.objects.new("_txt", cu); bpy.context.scene.collection.objects.link(ob)
    dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    bpy.data.objects.remove(ob); bpy.data.curves.remove(cu)
    bm = bmesh.new(); bm.from_mesh(me); bpy.data.meshes.remove(me); return bm

def wrap_text(bm, R, xc, theta_deg, cz=None):
    """Wrap flat text (XY plane, Z = relief) onto the -Y face of a cylinder of radius R mm along X."""
    cz = AXZ if cz is None else cz; th = math.radians(theta_deg)
    for v in bm.verts:
        x, y, z = v.co; phi = th + y/(R*MM); rad = R*MM + (z + 0.15*MM)
        v.co = Vector((xc*MM + x, -rad*math.cos(phi), cz + rad*math.sin(phi)))
    return bm
