#!/usr/bin/env python3
"""Create a NEW product in Costco / mexico-poc and upload a GLB to it.

Usage: python3 costco-upload.py <file.glb> "<product name>" [--tag "Final Review"] [--status DRAFT]

Mirrors the production assets: pipeline 957e8b6e (standard optimizer), bottom-center
pivot, Draco on, 2048 textures, 75k poly target. Never touches existing products.
Polls conversion until COMPLETED and prints the product UUID + platform URL.
"""
import json, os, sys, time, importlib.util

here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("pt", os.path.join(here, "pdp-attributes.py"))
pt = importlib.util.module_from_spec(spec); spec.loader.exec_module(pt)
pa = pt.pa

PIPELINE = "957e8b6e-7b41-477d-9a42-a12cc598d136"
MODEL_OPS = {"AR_SCALING": None, "ORIENTATION": None,
             "PIVOT_POINT_ALIGNMENT": {"pivotPoint": "bottom-center"},
             "TEXTURE_COMPRESSION": {"ambientOcclusionRadius": "null", "useKTX": "false", "bakeAmbientOcclusion": "false",
                                     "maxDimension": "2048", "ambientOcclusionResolution": "null", "forceFileSizeLimit": "false",
                                     "aggression": "2", "lossless": "false", "fileSizeLimit": "null", "ambientOcclusionStrength": "null"},
             "OPTIMIZATION": {"forcePolygonCount": "false", "bakeSmallFeatures": "true", "obstructedGeometry": "true",
                              "freezeTransforms": "true", "poly": "75000", "desiredOutput": "AUTO"},
             "DRACO_COMPRESSION": {"enabled": "true"}, "OUTPUT_LAYER": {"fbxPbr": "true"}}
TAGS = {"Final Review": "254b54ab-915c-427c-9004-6f31359e8015",
        "For Discussion": "65614b9c-145a-4dba-86b0-c537ec729415",
        "Live Asset": "6c7fa44e-c4d8-4aea-a694-be1ee94dbf83"}

def main():
    path, name = sys.argv[1], sys.argv[2]
    tag = sys.argv[sys.argv.index("--tag") + 1] if "--tag" in sys.argv else "Final Review"
    status = sys.argv[sys.argv.index("--status") + 1] if "--status" in sys.argv else "DRAFT"
    tok = pa.org_token(); hdr = pt.hdr(tok)
    body = {"name": name, "clientUuid": pa.WS, "pipelineUuid": PIPELINE, "assetType": "THREE_D",
            "status": "DRAFT", "publishToStatus": status, "attributes": {}, "locationsUuids": [],
            "tagsUuids": [TAGS[tag]], "modelOpsParameters": MODEL_OPS}
    r, _ = pa.http(f"{pa.API}/v1/products", data=json.dumps(body).encode(), headers=hdr, raw=True)
    d = pt.DEC.decode(r.decode("utf-8", "replace"))
    assert d.get("success"), d.get("errors")
    uuid = d["response"]["uuid"]
    print(f"created {uuid} {name!r} tag={tag}")
    size = os.path.getsize(path)
    sign = {"clientUuid": pa.WS, "productUuid": uuid,
            "resourceSettings": {"contentType": "application/octet-stream", "originalName": os.path.basename(path), "originalSize": size}}
    r, _ = pa.http(f"{pa.API}/v1/storage/upload/clients/products/asset/sign-url", data=json.dumps(sign).encode(),
                   headers=dict(hdr, Origin="https://platform.vntana.com"), raw=True)
    d = pt.DEC.decode(r.decode("utf-8", "replace")); assert d.get("success"), d.get("errors")
    loc = d["response"]["location"]
    import subprocess
    out = subprocess.run(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", "PUT", "-H", "Content-Type: application/octet-stream",
                          "-H", "Origin: https://platform.vntana.com", "--data-binary", f"@{path}", loc], capture_output=True, text=True).stdout
    print(f"uploaded {size/1e6:.1f} MB -> HTTP {out}")
    for _ in range(90):
        time.sleep(10)
        f = pt.get(f"{pa.API}/v1/products/{uuid}", tok)["response"]
        cs = f.get("conversionStatus")
        if cs in ("COMPLETED", "FAILED"): break
    models = {m["conversionFormat"]: m.get("conversionStatus") for m in (f.get("asset") or {}).get("models") or []}
    print(f"conversion {cs} status={f.get('status')} models={models}")
    print(f"https://platform.vntana.com/Costco/mexico-poc/products/details/{uuid}")

if __name__ == "__main__":
    main()
