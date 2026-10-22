#!/usr/bin/env python3
"""Pull product gallery images from a Costco MX PDP and attach them to a VNTANA asset.

Usage:
  python3 pdp-attach.py <item_code> <product_uuid> [--max N] [--dry-run]

Reads the PAT from ~/.config/vntana/dcicero8.key (or $VNTANA_PAT).
Defaults to the Costco org / mexico-poc workspace.
Also prints the PDP product name (use it for the asset description).
"""
import json, os, sys, subprocess, tempfile

ORG = "24d89641-5d42-4f33-90ca-7ba254e1895d"          # Costco
WS  = "6b7d3cd0-bae8-4ac5-acaa-f767951a4ba4"          # mexico-poc
API = "https://api-platform.vntana.com"
UA  = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130.0 Safari/537.36"

def http(url, data=None, headers=None, method=None, raw=False):
    """curl-backed (macOS system python TLS fails against api-platform)."""
    cmd = ["curl", "-s", "-L", "-D", "-", url, "--max-time", "120"]
    if method: cmd += ["-X", method]
    for k, v in (headers or {}).items():
        cmd += ["-H", f"{k}: {v}"]
    tmp = None
    if data is not None:
        tmp = tempfile.NamedTemporaryFile(delete=False)
        tmp.write(data); tmp.close()
        cmd += ["--data-binary", f"@{tmp.name}"]
        if not method: cmd += ["-X", "POST"]
    out = subprocess.run(cmd, capture_output=True).stdout
    if tmp: os.unlink(tmp.name)
    # split final header block from body (handles redirects' multiple blocks)
    while out.startswith(b"HTTP/"):
        head, _, out = out.partition(b"\r\n\r\n")
        hdrs = {}
        for line in head.decode("latin1").split("\r\n")[1:]:
            if ":" in line:
                k, v = line.split(":", 1)
                hdrs[k.strip().lower()] = v.strip()
        if not out.startswith(b"HTTP/"):
            break
    body = out
    return (body, hdrs) if raw else (json.loads(body or b"{}"), hdrs)

def pat():
    p = os.environ.get("VNTANA_PAT")
    if p: return p.strip()
    keyfile = os.path.expanduser("~/.config/vntana/dcicero8.key")
    if os.path.exists(keyfile):
        return open(keyfile).read().strip()
    sys.exit("No PAT: set VNTANA_PAT or create ~/.config/vntana/dcicero8.key")

def org_token():
    _, h = http(f"{API}/v1/auth/login/token",
                data=json.dumps({"personal-access-token": pat()}).encode(),
                headers={"Content-Type": "application/json"})
    t = h.get("x-auth-token")
    _, h2 = http(f"{API}/v1/auth/refresh-token", data=b"",
                 headers={"X-AUTH-TOKEN": f"Bearer {t}", "organizationUuid": ORG})
    return h2.get("x-auth-token")

def pdp_images(code, max_n):
    d, _ = http(f"https://www.costco.com.mx/rest/v2/mexico/products/{code}?fields=FULL&lang=es_MX",
                headers={"User-Agent": UA})
    if "errors" in d:
        sys.exit(f"PDP API: {d['errors'][0].get('message')} (item may be discontinued: NO REFERENCE)")
    name = d.get("name") or ""
    rank = {"superZoom": 4, "zoom": 3, "product": 2, "results": 1, "thumbnail": 0, "cartIcon": 0}
    groups = {}
    for im in d.get("images") or []:
        u = im.get("url")
        if not u or im.get("imageType") not in (None, "GALLERY", "PRIMARY"): continue
        gi = im.get("galleryIndex", u.split("?")[0])
        r = rank.get(im.get("format") or "", 0)
        if gi not in groups or groups[gi][0] < r:
            groups[gi] = (r, u)
    urls = []
    for gi in sorted(groups, key=lambda x: str(x)):
        u = groups[gi][1]
        urls.append("https://www.costco.com.mx" + u if u.startswith("/") else u)
    return name, urls[:max_n]

def attach(tok, puid, fname, blob):
    body = {"resourceSettings": {"contentType": "image/jpeg",
                                 "originalName": fname, "originalSize": len(blob)},
            "clientUuid": WS, "storeType": "ATTACHMENT",
            "parentEntityUuid": puid, "parentEntityType": "PRODUCT"}
    d, _ = http(f"{API}/v1/storage/upload/clients/resource/sign-url",
                data=json.dumps(body).encode(),
                headers={"X-AUTH-TOKEN": f"Bearer {tok}", "organizationUuid": ORG,
                         "clientUuid": WS, "Content-Type": "application/json",
                         "Origin": "https://platform.vntana.com"})
    r = d.get("response") or {}
    loc = r.get("location")
    if not loc: sys.exit(f"sign-url failed: {d.get('errors')}")
    http(loc, data=blob, method="PUT",
         headers={"Content-Type": "image/jpeg", "Origin": "https://platform.vntana.com"}, raw=True)
    return r.get("blobId")

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) < 2: sys.exit(__doc__)
    code, puid = args[0], args[1]
    max_n = int(sys.argv[sys.argv.index("--max") + 1]) if "--max" in sys.argv else 4
    dry = "--dry-run" in sys.argv
    name, urls = pdp_images(code, max_n)
    print(f"PDP name: {name}")
    print(f"gallery images: {len(urls)}")
    tok = None if dry else org_token()
    for i, u in enumerate(urls, 1):
        blob, _ = http(u, headers={"User-Agent": UA}, raw=True)
        fname = f"{code}_pdp_{i}.jpg"
        if dry:
            print(f"  would attach {fname} ({len(blob)//1024} KB) from {u[:90]}")
        else:
            bid = attach(tok, puid, fname, blob)
            print(f"  attached {fname} ({len(blob)//1024} KB) blobId {bid}")
    print("done")

if __name__ == "__main__":
    main()
