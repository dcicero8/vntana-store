# Northline v4 group A: same build as build_rpz.py, with harsher, more industrial edges (Derek: Watts read "video gamey" until
# bevels came down). Every prism/cyl bevel is halved and capped at 0.6 mm; lathe/vlathe fillet radii are cut to 60%.
# Blender -b ../watts/2000B-FP_v6.blend --python build_rpz_v4.py -- northline_rpz_v4
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import vlib as V
_prism, _fillet = V.prism, V.fillet
def prism(poly, z0, z1, bevel=0.0, seg=3, xform=None):
    return _prism(poly, z0, z1, bevel=min(bevel*0.5, 0.6) if bevel else 0.0, seg=seg, xform=xform)
def cyl(r, z0, z1, seg=48, cx=0, cy=0, bevel=0.0, xform=None):
    return prism(V.ngon(seg, r, cx=cx, cy=cy), z0, z1, bevel=bevel, seg=2, xform=xform)
def fillet(pts, rad, n=6):
    return _fillet(pts, [r*0.6 for r in rad] if isinstance(rad, (list, tuple)) else rad*0.6, n)
V.prism, V.cyl, V.fillet = prism, cyl, fillet
src = os.path.join(HERE, "build_rpz.py")
exec(compile(open(src).read(), src, "exec"), {"__file__": src, "__name__": "__main__"})
