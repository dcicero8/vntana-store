# side-by-side at equal overall length: reference photo (top) vs our straight-on render (bottom)
import sys
from PIL import Image, ImageChops, ImageDraw
def content_bbox(im, bg, thr=28):
    d = ImageChops.difference(im, Image.new("RGB", im.size, bg)).convert("L").point(lambda v: 255 if v > thr else 0); return d.getbbox()
ref = Image.open("0_reference_photo.jpg").convert("RGB")
W0, H0 = ref.size; ref = ref.crop((0, int(H0*0.30), W0, H0)); ref = ref.crop(content_bbox(ref, (255, 255, 255)))
r = Image.open(sys.argv[1]).convert("RGB"); bgc = r.getpixel((5, 5)); r = r.crop(content_bbox(r, bgc, 45))
L = 1200
ref = ref.resize((L, int(ref.height*L/ref.width))); r = r.resize((L, int(r.height*L/r.width)))
out = Image.new("RGB", (L + 40, ref.height + r.height + 60), (255, 255, 255)); out.paste(ref, (20, 20)); out.paste(r, (20, ref.height + 40))
d = ImageDraw.Draw(out); d.text((24, 22), "Watts photo", fill=(0, 0, 0)); d.text((24, ref.height + 42), "Our render", fill=(0, 0, 0))
out.save(sys.argv[2], quality=90); print(out.size, "ref h/len", round(ref.height/L, 3), "ours h/len", round(r.height/L, 3))
