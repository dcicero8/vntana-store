#!/usr/bin/env python3
"""Costco Mexico POC: full asset QA battery.

Runs every check learned during the Oct 2026 cleanup against one GLB
(and optionally its platform USDZ). Pure-python header checks first,
then headless Blender for geometry truth (lean detector, grounding,
renders), then USDZ ground/scale audit.

Usage:
  python3 qa-asset.py asset.glb [--usdz asset.usdz] [--expect W D H]
      [--outdir DIR] [--fix]

  --expect  real-world meters (from PDP/brief) to validate scale against
  --fix     when geometry problems are found, also export a corrected
            _qafix.glb (straightened, grounded, centered, un-Draco'd)

Exit report: PASS / FLAG per check, fix recommendations at the end.
"""
import argparse, json, math, os, struct, subprocess, sys, tempfile

BLENDER = "/Applications/Blender.app/Contents/MacOS/Blender"

# ---------------- GLB header checks (no Blender needed) ----------------

def read_glb_json(path):
    with open(path, "rb") as f:
        magic, ver, total = struct.unpack("<4sII", f.read(12))
        if magic != b"glTF":
            return None
        clen, ctype = struct.unpack("<I4s", f.read(8))
        return json.loads(f.read(clen))

SAT_EPS = 0.30   # saturation above this on an untextured material = CAD viz color
TINY_TEX = 512   # px: textures smaller than this on labeled parts are suspect

def header_checks(path, report):
    j = read_glb_json(path)
    if j is None:
        report.flag("format", "Not a GLB (wrong magic). Unsupported or legacy format: vendor must re-export.")
        return None
    a = j.get("asset", {})
    report.info("generator", a.get("generator", "unknown"))

    req = j.get("extensionsRequired") or []
    KNOWN_REQ = ("draco", "webp", "basisu", "texture_transform")
    for ext in req:
        el = ext.lower()
        if "draco" in el:
            report.flag("pre-compressed", "Draco in extensionsRequired: optimization pipelines reject this. Decompress (Blender re-export) or Convert Only.")
        elif "webp" in el or "basisu" in el:
            report.flag("texture-format", f"{ext} required: conversion may not decode it. Re-export with PNG/JPEG.")
        elif "texture_transform" in el:
            report.flag("required-extension", f"{ext} in extensionsRequired: optimization pipelines MUST reject (LG OLED case). Fix: Blender import, bake texture transforms into UVs per polygon, re-export raw.")
        else:
            report.flag("required-extension", f"{ext} in extensionsRequired: any unsupported REQUIRED extension makes pipelines reject the whole file. Decode/bake it out in Blender and re-export raw.")

    meshes = j.get("meshes", [])
    if not meshes:
        report.flag("empty", "ZERO meshes: rig-only or empty export. Vendor re-export with mesh objects selected/visible.")
        return j
    tris = 0
    for m in meshes:
        for p in m.get("primitives", []):
            idx = p.get("indices")
            if idx is not None:
                tris += j["accessors"][idx]["count"] // 3
            elif "POSITION" in p.get("attributes", {}):
                tris += j["accessors"][p["attributes"]["POSITION"]]["count"] // 3
    report.info("triangles", f"{tris:,}")
    if tris > 1_500_000:
        report.flag("poly-heavy", f"{tris:,} triangles: fine as a master, but must go through an optimization pipeline, never Convert Only.")
    elif tris > 300_000:
        report.note("poly", f"{tris:,} triangles: consider optimization pipeline over Convert Only for mobile.")

    if j.get("skins"):
        report.flag("rigged", f"{len(j['skins'])} skin(s): rigged asset, check pipeline support / was this intended?")
    anims = j.get("animations", [])
    if anims:
        ch = sum(len(an.get("channels", [])) for an in anims)
        report.note("animations", f"{len(anims)} clips / {ch:,} channels. Delete unused clips; dense bakes (>25k channels) can fail processing.")

    # nodes: junk, scales
    for n in j.get("nodes", []):
        nm = (n.get("name") or "")
        low = nm.lower()
        if any(k in low for k in ("helper", "particle", "dummy", "lux_root")) or nm.startswith("相机"):
            report.flag("stray-node", f"Node '{nm}': render-scene junk (causes AR float/offset). Delete before export.")
        sc = n.get("scale")
        if sc:
            if any(abs(v) < 1e-9 for v in sc):
                report.flag("zero-scale", f"Node '{nm}' has scale 0: breaks processing. Fix transforms.")
            elif any(v < 0 for v in sc):
                report.note("neg-scale", f"Node '{nm}' uses negative scale (mirroring): can invert normals after optimization.")
    # transmission glass: opaque in AR (USDZ cannot represent it)
    for m in j.get("materials", []):
        if "KHR_materials_transmission" in (m.get("extensions") or {}):
            report.flag("transmission-glass", f"Material '{m.get('name','?')}' uses transmission: renders OPAQUE in AR Quick Look. Convert to alpha-blend glass (alpha ~0.2, alphaMode BLEND).")
    if j.get("cameras"):
        report.note("cameras", f"{len(j['cameras'])} camera(s) in file: render-scene leftovers, strip before export.")

    # materials
    mats = j.get("materials", [])
    imgs = j.get("images", [])
    report.info("materials/images", f"{len(mats)} / {len(imgs)}")
    sat_hits, black_metal, default_metal_named = [], [], []
    for m in mats:
        p = m.get("pbrMetallicRoughness", {})
        base = p.get("baseColorFactor")
        has_tex = "baseColorTexture" in p
        name = m.get("name") or "?"
        metal = p.get("metallicFactor")  # None = 1.0 per spec!
        if m.get("emissiveFactor"):
            continue  # emissive = display/LED: saturation is intentional
        if base and not has_tex:
            r, g, b = base[:3]
            mx, mn = max(r, g, b), min(r, g, b)
            sat = 0 if mx == 0 else (mx - mn) / mx
            if sat > SAT_EPS and mx > 0.5:
                sat_hits.append(name)
            if mx < 0.02 and (metal is None or metal > 0.5):
                black_metal.append(name)
        if metal is None and not has_tex and any(k in name.lower() for k in ("wood", "fabric", "plastic", "rubber")):
            default_metal_named.append(name)
    if sat_hits:
        report.flag("viz-colors", f"Saturated untextured materials (CAD part-ID colors?): {sat_hits[:6]}. Needs real product materials (Blender retint or vendor).")
    if black_metal:
        report.flag("black-metal", f"Black base + metallic materials: {black_metal[:4]}: renders black (wine-cooler defect). Retint to real finish.")
    if default_metal_named:
        report.flag("default-metallic", f"Non-metal-named materials with metallic unset (defaults to 1.0): {default_metal_named[:4]}: will render as gray metal.")
    if mats and not imgs:
        report.note("no-textures", "Zero textures: factor-only materials. Fine if intentional; check against PDP.")

    # tiny textures
    bvs = j.get("bufferViews", [])
    small = 0
    for im in imgs:
        if "bufferView" in im and bvs[im["bufferView"]]["byteLength"] < 40_000:
            small += 1
    if imgs and small > len(imgs) * 0.5:
        report.note("small-textures", f"{small}/{len(imgs)} textures are very small files: possible low-DPI bakes; check text/logos in renders.")
    return j

# ---------------- Blender geometry battery ----------------

BLENDER_SCRIPT = r'''
import bpy, json, math, sys
import numpy as np
import mathutils
from mathutils import Matrix
argv = sys.argv[sys.argv.index("--")+1:]
src, outdir, do_fix, expect = argv[0], argv[1], argv[2]=="1", json.loads(argv[3])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
out = {}
pts=[]; sliver_pts=[]; out["slivers"]=[]
from mathutils import Vector as _V
for o in bpy.data.objects:
    if o.type!="MESH": continue
    me=o.data; n=len(me.vertices)
    if n==0: continue
    bb=[o.matrix_world @ _V(c) for c in o.bound_box]
    bd=sorted(max(p[i] for p in bb)-min(p[i] for p in bb) for i in range(3))
    is_sliver=(bd[0]<0.002 and bd[1]<0.01 and bd[2]>0.5)
    co=np.empty(n*3); me.vertices.foreach_get("co",co); co=co.reshape(-1,3)
    mw=np.array(o.matrix_world)
    w=(co @ mw[:3,:3].T) + mw[:3,3]
    if is_sliver:
        out["slivers"].append([o.name, round(bd[2],3), len(me.polygons)])
        sliver_pts.append(w[::max(1,n//20000)])
        continue
    pts.append(w[::max(1,n//20000)])
P=np.vstack(pts) if pts else np.zeros((1,3))
if sliver_pts:
    PF=np.vstack([P]+sliver_pts)
    out["full_dims_with_slivers"]=[float(PF[:,i].max()-PF[:,i].min()) for i in range(3)]
dims=[float(P[:,i].max()-P[:,i].min()) for i in range(3)]
out["aabb_dims"]=dims
out["min_z"]=float(P[:,2].min())
out["center_xy"]=[float((P[:,0].max()+P[:,0].min())/2), float((P[:,1].max()+P[:,1].min())/2)]
# lean detector
def best_angle(P, rot_axis, minimize_axis):
    best=(1e18,0.0)
    for deg in np.arange(-25,25.01,0.25):
        th=math.radians(deg); c,s=math.cos(th),math.sin(th)
        if rot_axis==0: Q=np.array([[1,0,0],[0,c,-s],[0,s,c]])
        else: Q=np.array([[c,0,s],[0,1,0],[-s,0,c]])
        col=(P@Q.T)[:,minimize_axis]
        e=float(col.max()-col.min())
        if e<best[0]: best=(e,float(deg))
    return best
eY,degX=best_angle(P,0,1)
Qx=Matrix.Rotation(math.radians(degX),4,'X')
P2=P@np.array(Qx.to_3x3()).T
eX,degY=best_angle(P2,1,0)
out["lean_pitch_deg"]=degX; out["lean_roll_deg"]=degY
out["straight_dims"]=[eX, eY, dims[2]]
needs_fix = abs(degX)>1.0 or abs(degY)>1.0 or abs(out["min_z"])>0.02 or max(map(abs,out["center_xy"]))>0.05
out["needs_geo_fix"]=bool(needs_fix)
if out["slivers"]: needs_fix=True
out["needs_geo_fix"]=bool(needs_fix)
if do_fix and needs_fix:
    sliver_names={s[0] for s in out["slivers"]}
    for o in [x for x in bpy.data.objects if x.name in sliver_names]:
        bpy.data.objects.remove(o, do_unlink=True)
    R=Matrix.Rotation(math.radians(degY),4,'Y') @ Qx
    for o in bpy.data.objects:
        if o.parent is None: o.matrix_world = R @ o.matrix_world
    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    mins=[1e9]*3; maxs=[-1e9]*3
    for o in bpy.data.objects:
        if o.type!="MESH": continue
        for cnr in o.bound_box:
            w=o.matrix_world@mathutils.Vector(cnr)
            for i in range(3): mins[i]=min(mins[i],w[i]); maxs[i]=max(maxs[i],w[i])
    cx=(mins[0]+maxs[0])/2; cy=(mins[1]+maxs[1])/2
    for o in bpy.data.objects:
        if o.parent is None:
            o.location.x-=cx; o.location.y-=cy; o.location.z-=mins[2]
    bpy.context.view_layer.update()
    import os
    fixpath=os.path.join(outdir, os.path.splitext(os.path.basename(src))[0]+"_qafix.glb")
    bpy.ops.export_scene.gltf(filepath=fixpath, export_format='GLB', export_draco_mesh_compression_enable=False)
    out["fix_file"]=fixpath
# renders: front / side-with-floor / three-quarter
sc=bpy.context.scene
sc.render.engine='CYCLES'; sc.cycles.samples=40
sc.render.resolution_x=560; sc.render.resolution_y=640
w=bpy.data.worlds.new("W"); sc.world=w; w.use_nodes=True
bg=next(n for n in w.node_tree.nodes if n.type=='BACKGROUND')
bg.inputs[0].default_value=(0.92,0.92,0.94,1); bg.inputs[1].default_value=1.3
bpy.ops.mesh.primitive_plane_add(size=max(dims)*4)
pl=bpy.context.active_object; pl.location=(0,0,P[:,2].min() if not (do_fix and needs_fix) else 0)
from mathutils import Vector
H=dims[2]; ctr=Vector((out["center_xy"][0],out["center_xy"][1],P[:,2].min()+H/2)) if not (do_fix and needs_fix) else Vector((0,0,H/2))
dist=2.1*max(dims)
import os
for name,az,el in [("front",0,4),("side",90,2),("three4",35,12)]:
    cam=bpy.data.cameras.new(name); co=bpy.data.objects.new(name,cam); sc.collection.objects.link(co)
    azr=math.radians(az); elr=math.radians(el)
    co.location=ctr+Vector((dist*math.cos(elr)*math.sin(azr), -dist*math.cos(elr)*math.cos(azr), dist*math.sin(elr)))
    d=(ctr-co.location).normalized(); co.rotation_euler=d.to_track_quat('-Z','Y').to_euler()
    cam.lens=55; sc.camera=co
    sc.render.filepath=os.path.join(outdir, f"qa_{name}.png")
    bpy.ops.render.render(write_still=True)
print("QAJSON:"+json.dumps(out))
'''

def blender_checks(path, outdir, fix, expect, report):
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False) as f:
        f.write(BLENDER_SCRIPT)
        spath = f.name
    r = subprocess.run([BLENDER, "-b", "-P", spath, "--", path, outdir,
                        "1" if fix else "0", json.dumps(expect)],
                       capture_output=True, text=True, timeout=900)
    out = None
    for line in r.stdout.splitlines():
        if line.startswith("QAJSON:"):
            out = json.loads(line[7:])
    os.unlink(spath)
    if out is None:
        report.flag("blender", "Blender battery failed to run:\n" + r.stdout[-500:])
        return None
    d = out["aabb_dims"]
    report.info("world dims (m)", f'{d[0]:.2f} x {d[1]:.2f} x {d[2]:.2f}')
    if out.get("slivers"):
        fd = out.get("full_dims_with_slivers", d)
        names = ", ".join(f"{s[0]} ({s[1]}m/{s[2]} tris)" for s in out["slivers"][:8])
        report.flag("SLIVERS", f"{len(out['slivers'])} degenerate sliver mesh(es) (CAD centerline/routing artifacts): {names}. They inflate the bounding box to {fd[0]:.2f} x {fd[1]:.2f} x {fd[2]:.2f} m, so the viewer orbit center sits off the model (giant-ball rotation) and AR scale/dimensions read wrong. Delete them (--fix does it). Dims above are measured WITHOUT them.")
    if max(d) > 20 or max(d) < 0.03:
        report.flag("units", f"Implausible size ({max(d):.1f} m): wrong units at export (cm/inches as meters). Rescale.")
    pitch, roll = out["lean_pitch_deg"], out["lean_roll_deg"]
    if abs(pitch) > 1 or abs(roll) > 1:
        sd = out["straight_dims"]
        gain = 1 - (sd[0]*sd[1]) / max(d[0]*d[1], 1e-9)
        if gain < 0.04:
            report.note("lean?", f"Solver found pitch {pitch:.1f}/roll {roll:.1f} deg but footprint shrinks only {gain*100:.0f}%: likely shape-driven (slab with feet, curvy product), not a real lean. Confirm in the side render.")
        else:
            report.flag("LEAN", f"Baked lean: pitch {pitch:.1f} deg, roll {roll:.1f} deg ({gain*100:.0f}% footprint reduction). True dims ~{sd[0]:.2f} x {sd[1]:.2f} m. Straighten in Blender (AR will tilt).")
    else:
        report.ok("lean", f"straight (pitch {pitch:.1f}, roll {roll:.1f} deg)")
    if abs(out["min_z"]) > 0.02:
        report.flag("grounding", f"Base at z={out['min_z']:.3f} m (not 0): floats or clips in AR. Re-ground or pivot Bottom Center.")
    else:
        report.ok("grounding", "base at ground level")
    cx, cy = out["center_xy"]
    if max(abs(cx), abs(cy)) > 0.05:
        report.note("centering", f"Center offset ({cx:.2f},{cy:.2f}) m from origin: shadow/orbit may look off. Bottom Center pivot fixes.")
    if expect:
        exp = sorted(expect); got = sorted(out.get("straight_dims", d))
        errs = [abs(a - b) / max(b, 0.01) for a, b in zip(got, exp)]
        if max(errs) > 0.15:
            report.flag("scale-vs-expected", f"Dims {got} vs expected {sorted(expect)}: >15% off. Check units/orientation vs PDP.")
        else:
            report.ok("scale-vs-expected", "within 15% of PDP/brief dims")
    report.info("PIVOT on upload", "Bottom Center (floor-standing default). Exceptions: wall-hung -> Back Center; hanging -> Top Center; eyewear -> Front Center; configurator part with authored anchor -> None.")
    if out.get("fix_file"):
        report.info("FIX EXPORTED", out["fix_file"])
    report.info("renders", f"{outdir}/qa_front.png, qa_side.png, qa_three4.png (side view shows lean/grounding against floor plane)")
    return out

# ---------------- USDZ AR gate ----------------

def usdz_checks(path, report, expect):
    try:
        from pxr import Usd, UsdGeom
    except ImportError:
        report.note("usdz", "usd-core not installed; skipping USDZ gate (pip3 install usd-core)")
        return
    stage = Usd.Stage.Open(path)
    up = UsdGeom.GetStageUpAxis(stage)
    mpu = UsdGeom.GetStageMetersPerUnit(stage)
    if str(up) != "Y":
        report.flag("usdz-upaxis", f"upAxis={up}, expected Y")
    cache = UsdGeom.BBoxCache(Usd.TimeCode.Default(), ["default", "render"])
    prim = stage.GetDefaultPrim() or list(stage.GetPseudoRoot().GetChildren())[0]
    r = cache.ComputeWorldBound(prim).ComputeAlignedRange()
    mn, mx = r.GetMin(), r.GetMax()
    dims = [mx[i] - mn[i] for i in range(3)]
    report.info("usdz dims (m)", f"{dims[0]:.2f} x {dims[1]:.2f} x {dims[2]:.2f} (X,up,Z) | metersPerUnit {mpu}")
    if abs(mn[1]) > 0.02:
        report.flag("usdz-ground", f"AR base at y={mn[1]:.3f}: floats/clips below floor in Quick Look.")
    else:
        report.ok("usdz-ground", "sits on AR floor")
    if expect:
        exp = sorted(expect); got = sorted(dims)
        if max(abs(a - b) / max(b, 0.01) for a, b in zip(got, exp)) > 0.15:
            report.flag("usdz-dims", f"AR size {got} vs expected {exp}: tilt or scale baked into AR output.")

# ---------------- report ----------------

class Report:
    def __init__(self): self.rows = []
    def flag(self, k, v): self.rows.append(("FLAG", k, v))
    def note(self, k, v): self.rows.append(("note", k, v))
    def ok(self, k, v): self.rows.append(("ok", k, v))
    def info(self, k, v): self.rows.append(("info", k, v))
    def dump(self):
        flags = [r for r in self.rows if r[0] == "FLAG"]
        print("\n" + "=" * 70)
        for lvl, k, v in self.rows:
            tag = {"FLAG": "[FLAG]", "note": "[note]", "ok": "[ ok ]", "info": "[info]"}[lvl]
            print(f"{tag} {k}: {v}")
        print("=" * 70)
        print(f"VERDICT: {'NEEDS WORK: ' + str(len(flags)) + ' flag(s)' if flags else 'PASS'}")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("glb")
    ap.add_argument("--usdz")
    ap.add_argument("--expect", nargs=3, type=float, metavar=("W", "D", "H"))
    ap.add_argument("--outdir", default=None)
    ap.add_argument("--fix", action="store_true")
    a = ap.parse_args()
    outdir = a.outdir or os.path.join(tempfile.gettempdir(), "qa_" + os.path.splitext(os.path.basename(a.glb))[0])
    os.makedirs(outdir, exist_ok=True)
    rep = Report()
    rep.info("file", f"{a.glb} ({os.path.getsize(a.glb)/1e6:.1f} MB)")
    j = header_checks(a.glb, rep)
    if j and j.get("meshes"):
        blender_checks(a.glb, outdir, a.fix, list(a.expect) if a.expect else None, rep)
    if a.usdz:
        usdz_checks(a.usdz, rep, list(a.expect) if a.expect else None)
    rep.dump()

if __name__ == "__main__":
    main()
