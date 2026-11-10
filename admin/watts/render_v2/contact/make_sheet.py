# Contact sheet: reference photo + render progression (PIL). python3 make_sheet.py
from PIL import Image, ImageDraw, ImageFont
tiles=[("0_reference_crop.jpg","Reference","Watts product photo (what we are matching)", "contain"),
       ("1_original_revit.jpg","1. Original","Revit file as published by Watts on BIMobject", "cover"),
       ("2_website_v1.jpg","2. First website render","Our Blender rebuild, first material pass", "cover"),
       ("5_final_v9.jpg","3. Final: matched to the photo","2\" proportions, one-piece cast center, photo-matched details", "cover")]
W,H=1000,667; PAD=36; CAP=92; TOP=118; COLS=2
rows=(len(tiles)+COLS-1)//COLS
sheet=Image.new("RGB",(PAD*(COLS+1)+W*COLS, TOP+PAD+(H+CAP)*rows+PAD-20),(245,246,248)); d=ImageDraw.Draw(sheet)
def font(sz,bold=False):
    for p in (["/System/Library/Fonts/Supplemental/Arial Bold.ttf"] if bold else [])+["/System/Library/Fonts/Supplemental/Arial.ttf"]:
        try: return ImageFont.truetype(p,sz)
        except Exception: pass
    return ImageFont.load_default()
d.text((PAD,34),"Ames 2000B-FP: from Revit file to photo-matched 3D",fill=(20,24,30),font=font(44,True))
d.text((PAD,86),"Tiles 1 to 3 are rendered in Blender (Cycles) with the same camera and studio lighting. No AI-generated imagery. Reference is Watts' own product photo.",fill=(100,106,115),font=font(22))
for i,(f,t,sub,mode) in enumerate(tiles):
    r,c=divmod(i,COLS); x=PAD+c*(W+PAD); y=TOP+PAD+r*(H+CAP)
    im=Image.open(f).convert("RGB")
    if mode=="contain":
        bg=Image.new("RGB",(W,H),(255,255,255)); im.thumbnail((W-40,H-40),Image.LANCZOS); bg.paste(im,((W-im.width)//2,(H-im.height)//2)); im=bg
    else: im=im.resize((W,H),Image.LANCZOS)
    sheet.paste(im,(x,y)); final=t.startswith("3.")
    d.rectangle([x,y,x+W-1,y+H-1],outline=(0,83,155) if final else (210,213,218),width=4 if final else 2)
    d.text((x,y+H+14),t,fill=(20,24,30),font=font(30,True)); d.text((x,y+H+52),sub,fill=(100,106,115),font=font(22))
sheet.save("watts_render_progression_v2.jpg",quality=92); print(sheet.size)
