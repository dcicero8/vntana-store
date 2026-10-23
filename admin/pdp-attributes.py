#!/usr/bin/env python3
"""Write Costco item number + PDP dimensions as attributes on every
"<item> (Production) - ..." asset in Costco / mexico-poc.

Usage:
  python3 pdp-attributes.py [--apply] [--only <productUuid>]

Without --apply it prints the plan only. Existing attributes, tags,
locations and publish status are kept; only attributes are added/updated.
Dimensions come from the Costco MX catalog API (Ancho/Profundo/Alto).
"""
import json, re, sys, importlib.util, os

here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("pa", os.path.join(here, "pdp-attach.py"))
pa = importlib.util.module_from_spec(spec); spec.loader.exec_module(pa)

DIMS = [("Ancho", "PDP Width (Ancho)"), ("Profundo", "PDP Depth (Profundo)"), ("Alto", "PDP Height (Alto)")]
READ_ONLY = ["created", "updated", "isUpdatable", "variantGroups", "conversionStatus",
             "malwareProcessingStatus", "lastUpdatedBy", "latestVersion", "updatable",
             "version", "asset", "thumbnail", "originalModel"]
DEC = json.JSONDecoder(strict=False)

def get(url, tok):
    b, _ = pa.http(url, headers=hdr(tok), raw=True)
    return DEC.decode(b.decode("utf-8", "replace"))

def hdr(tok):
    return {"X-AUTH-TOKEN": f"Bearer {tok}", "organizationUuid": pa.ORG,
            "clientUuid": pa.WS, "Content-Type": "application/json"}

def list_products(tok):
    out, page = [], 1
    while True:
        body = {"page": page, "size": 100, "clientUuids": [pa.WS], "organizationUuid": pa.ORG}
        b, _ = pa.http(f"{pa.API}/v1/products/clients/search", data=json.dumps(body).encode(),
                       headers=hdr(tok), raw=True)
        g = DEC.decode(b.decode("utf-8", "replace")).get("response", {})
        rows = g.get("grid") or g.get("products") or []
        out += rows
        if len(rows) < 100: return out
        page += 1

def pdp_dims(item):
    d, _ = pa.http(f"https://www.costco.com.mx/rest/v2/mexico/products/{item}?fields=FULL&lang=es_MX",
                   headers={"User-Agent": pa.UA})
    if "errors" in d: return None
    got = {}
    for c in d.get("classifications") or []:
        for f in c.get("features") or []:
            vals = [v.get("value") for v in f.get("featureValues") or [] if v.get("value")]
            unit = (f.get("featureUnit") or {}).get("symbol") or ""
            if vals: got[f.get("name")] = f"{vals[0]} {unit}".strip()
    return {label: got[k] for k, label in DIMS if k in got}

def main():
    apply = "--apply" in sys.argv
    only = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else None
    tok = pa.org_token()
    for p in list_products(tok):
        uuid, name = p.get("uuid"), p.get("name") or ""
        m = re.match(r"^(\S+) \(Production\)", name)
        if not m or (only and uuid != only): continue
        item = m.group(1)
        dims = pdp_dims(item)
        new = {"Costco Item Number": item}
        new.update(dims or {})
        full = get(f"{pa.API}/v1/products/{uuid}", tok).get("response", {})
        attrs = dict(full.get("attributes") or {})
        changes = {k: v for k, v in new.items() if attrs.get(k) != v}
        print(f"{item:10} {uuid[:8]} {full.get('status'):12} dims={'none (no PDP data)' if not dims else len(dims)} "
              f"-> {changes if changes else 'already set'}")
        if not apply or not changes: continue
        attrs.update(changes)
        body = {k: v for k, v in full.items() if k not in READ_ONLY}
        body["tagsUuids"] = [t["uuid"] for t in body.pop("tags", None) or []]
        body["locationsUuids"] = [l["uuid"] for l in body.pop("locations", None) or []]
        body["attributes"] = attrs
        body["deleteAsset"] = False
        body["publishToStatus"] = body.pop("status", None) or full.get("status")
        r, _ = pa.http(f"{pa.API}/v1/products", data=json.dumps(body).encode(),
                       headers=hdr(tok), method="PUT", raw=True)
        res = DEC.decode(r.decode("utf-8", "replace") or "{}")
        after = get(f"{pa.API}/v1/products/{uuid}", tok).get("response", {})
        same_model = (after.get("asset") or {}).get("assetBlobId") == (full.get("asset") or {}).get("assetBlobId")
        ok = res.get("success") and all((after.get("attributes") or {}).get(k) == v for k, v in changes.items())
        print(f"           {'OK' if ok else 'FAILED'} status {after.get('status')} model unchanged={same_model} "
              f"{'' if ok else res.get('errors')}")

if __name__ == "__main__":
    main()
