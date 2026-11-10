import bpy, os
out=os.path.dirname(os.path.abspath(__file__)) if '__file__' in dir() else "."
for t in bpy.data.texts: 
    open(os.path.join("/Users/derekcicero/Documents/Claude/Code Projects/vntana-store/admin/rpz", t.name+".py"),"w").write(t.as_string()); print("TEXT",t.name,len(t.as_string()))
print("MATS",sorted(m.name for m in bpy.data.materials if m.name.startswith("W_")))
print("IMGS",sorted(i.name for i in bpy.data.images))
