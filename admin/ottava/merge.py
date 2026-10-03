import bpy, bmesh, json, os, sys, hashlib, math, re
from mathutils import Vector, Matrix
base=os.path.dirname(os.path.abspath(__file__))
OUT=os.path.join(base,'out'); os.makedirs(OUT,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
layout=json.load(open(os.path.join(base,'layout.json')))
def g2b(p): return Vector((p[0], -p[2], p[1]))
def ext(o):
    pts=[o.matrix_world @ v.co for v in o.data.vertices]
    return Vector(map(min,zip(*pts))), Vector(map(max,zip(*pts)))
def fmt(mn,mx): return f"x[{mn.x:+.3f},{mx.x:+.3f}] y[{mn.y:+.3f},{mx.y:+.3f}] z[{mn.z:+.3f},{mx.z:+.3f}]"
def sel(objs, active=None):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = active or objs[0]
def import_as_one(f, name, delete=()):
    before={o.name for o in bpy.data.objects}
    bpy.ops.import_scene.gltf(filepath=os.path.join(base,'glb',f))
    names=[o.name for o in bpy.data.objects if o.name not in before]
    for n in list(names):
        if n in delete: bpy.data.objects.remove(bpy.data.objects[n], do_unlink=True); names.remove(n)
    bpy.context.view_layer.update()
    # bake world transforms into mesh data, drop empties
    meshes=[]
    for n in names:
        o=bpy.data.objects[n]
        if o.type!='MESH': continue
        if o.data.users>1: o.data=o.data.copy()
        mw=o.matrix_world.copy(); o.parent=None; o.data.transform(mw); o.matrix_world=Matrix.Identity(4)
        meshes.append(o)
    for n in names:
        o=bpy.data.objects.get(n)
        if o and o.type!='MESH': bpy.data.objects.remove(o, do_unlink=True)
    main=max(meshes, key=lambda o: len(o.data.vertices))
    sel(meshes, main)
    if len(meshes)>1: bpy.ops.object.join()
    main.name=name; main.data.name=name
    return main
top=None; report=[]
for it in layout['items']:
    o=import_as_one(it['file'], it['name'], it.get('delete',()))
    mn,mx=ext(o); pre=fmt(mn,mx)
    if 'keep_y_from_min' in it:
        bm=bmesh.new(); bm.from_mesh(o.data); y0=min(v.co.y for v in bm.verts)
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y>y0+it['keep_y_from_min']], context='VERTS')
        bm.to_mesh(o.data); bm.free()
    if it.get('rot'):
        R=Matrix.Rotation(math.radians(it['rot'][0]),4,'X') @ Matrix.Rotation(math.radians(it['rot'][1]),4,'Y') @ Matrix.Rotation(math.radians(it['rot'][2]),4,'Z')
        o.data.transform(R)
    if it.get('center'):   # recenter geometry: xy bbox center -> origin, min z -> 0
        mn,mx=ext(o); c=Vector(((mn.x+mx.x)/2,(mn.y+mx.y)/2,mn.z)); o.data.transform(Matrix.Translation(-c))
    mn,mx=ext(o)
    if it['name']=='instrumentTrolley':
        o.data.transform(Matrix.Translation(Vector((0,0,-mn.z))))
        # top surface = max z over the central area (ignore cloth corners / poles)
        top=max(v.co.z for v in o.data.vertices if abs(v.co.x)<0.3 and abs(v.co.y)<0.6)
        mn,mx=ext(o); report.append(f"trolley {fmt(mn,mx)} top(central)={top:.3f}")
    else:
        p=list(it['pos'])
        if p[1]=='top': p[1]=top
        o.location=g2b(p); o.location.z = p[1]-mn.z+0.002
        bpy.context.view_layer.update(); mn2,mx2=ext(o)
        report.append(f"{it['name']:22s} pre={pre}  ->  {fmt(mn2,mx2)}")
# ---- merge duplicate materials by base name (keep the one with the largest images)
def imgs_of(m): return [n.image for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image] if m.node_tree else []
groups={}
for m in bpy.data.materials: groups.setdefault(re.sub(r'\.\d+$','',m.name),[]).append(m)
for basename,ms in groups.items():
    keep=max(ms, key=lambda m: sum(i.size[0] for i in imgs_of(m)))
    for m in ms:
        if m is keep: continue
        for o in bpy.data.objects:
            if o.type=='MESH':
                for s in o.material_slots:
                    if s.material is m: s.material=keep
        bpy.data.materials.remove(m)
    keep.name=basename
for img in list(bpy.data.images):
    if img.users==0: bpy.data.images.remove(img)
for img in bpy.data.images:
    if max(img.size)>2048: img.scale(2048,2048)
report.append(f"images: {len(bpy.data.images)} {[ (i.name,i.size[0],i.file_format) for i in bpy.data.images][:40]}")
report.append(f"materials: {[m.name for m in bpy.data.materials]}  objects: {len(bpy.data.objects)}")
glb=os.path.join(OUT,'ottava-back-table-v1.glb')
bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB', export_apply=True, export_draco_mesh_compression_enable=False,
    export_image_format='JPEG', export_jpeg_quality=85, export_animations=False, export_skins=False, export_yup=True)
report.append(f"exported {glb} {os.path.getsize(glb)/1e6:.1f} MB")
# ---- previews with random object colors
sc=bpy.context.scene; sc.render.engine='BLENDER_WORKBENCH'; sc.display.shading.light='STUDIO'; sc.display.shading.color_type='RANDOM'; sc.display.shading.show_cavity=True
sc.render.resolution_x=1600; sc.render.resolution_y=1100
def cam(name, loc, look, ortho=None):
    cd=bpy.data.cameras.new(name); co=bpy.data.objects.new(name,cd); sc.collection.objects.link(co)
    co.location=loc; co.rotation_euler=(look-co.location).to_track_quat('-Z','Y').to_euler()
    if ortho: cd.type='ORTHO'; cd.ortho_scale=ortho
    return co
T=Vector((0,0,top))
views={'persp': cam('persp', Vector((1.4,-2.0,top+1.3)), T), 'top': cam('top', Vector((0,0,top+3)), T, ortho=2.3), 'side': cam('side', Vector((-2.6,0.0,top+0.6)), T)}
for k,co in views.items():
    sc.camera=co; sc.render.filepath=os.path.join(OUT,f'preview_{k}.png'); bpy.ops.render.render(write_still=True)
print("\n".join(["REPORT"]+report))
