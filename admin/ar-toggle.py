#!/usr/bin/env python3
"""Turn the viewer AR buttons (AR for Mobile = arButton, AR for Desktop = qrButton)
off or on for every asset in Costco / mexico-poc. Only viewerSettings.ui changes;
attributes, tags, locations and publish status are kept.

Usage:
  python3 ar-toggle.py off|on [--apply] [--only <productUuid>]
  python3 ar-toggle.py restore <backup.json> [--apply]

"off" writes a backup of every asset's current viewerSettings first
(ar-backup-<timestamp>.json next to this script), so "restore" can put
each asset back exactly as it was.
"""
import json, sys, os, time, importlib.util

here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("pt", os.path.join(here, "pdp-attributes.py"))
pt = importlib.util.module_from_spec(spec); spec.loader.exec_module(pt)
pa = pt.pa
KEYS = ("arButton", "qrButton")

def put(tok, full, viewer_settings):
    body = {k: v for k, v in full.items() if k not in pt.READ_ONLY}
    body["tagsUuids"] = [t["uuid"] for t in body.pop("tags", None) or []]
    body["locationsUuids"] = [l["uuid"] for l in body.pop("locations", None) or []]
    body["viewerSettings"] = viewer_settings
    body["deleteAsset"] = False
    body["publishToStatus"] = body.pop("status", None) or full.get("status")
    r, _ = pa.http(f"{pa.API}/v1/products", data=json.dumps(body).encode(),
                   headers=pt.hdr(tok), method="PUT", raw=True)
    return pt.DEC.decode(r.decode("utf-8", "replace") or "{}")

def ui_of(vs):
    try: return json.loads((vs or {}).get("ui") or "{}")
    except ValueError: return {}

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    apply = "--apply" in sys.argv
    only = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else None
    tok = pa.org_token()
    if mode == "restore":
        backup = json.load(open(sys.argv[2]))
        targets = list(backup.items())
    elif mode in ("off", "on"):
        targets = [(p["uuid"], None) for p in pt.list_products(tok) if not only or p["uuid"] == only]
        backup = {}
    else:
        sys.exit(__doc__)
    for uuid, saved in targets:
        full = pt.get(f"{pa.API}/v1/products/{uuid}", tok).get("response", {})
        vs = dict(full.get("viewerSettings") or {})
        ui = ui_of(vs)
        if mode in ("off", "on"):
            backup[uuid] = {"name": full.get("name"), "viewerSettings": full.get("viewerSettings")}
            want = dict(ui, **{k: mode == "on" for k in KEYS})
            new_vs = dict(vs, ui=json.dumps(want))
        else:
            new_vs = saved["viewerSettings"]
            want = ui_of(new_vs)
        now = {k: ui.get(k) for k in KEYS}
        print(f"{uuid[:8]} {full.get('status'):12} {now} {(full.get('name') or '')[:50]}")
        if not apply or all(ui.get(k) == want.get(k) for k in KEYS): continue
        res = put(tok, full, new_vs)
        after = pt.get(f"{pa.API}/v1/products/{uuid}", tok).get("response", {})
        got = ui_of(after.get("viewerSettings"))
        same_model = (after.get("asset") or {}).get("assetBlobId") == (full.get("asset") or {}).get("assetBlobId")
        ok = res.get("success") and all(got.get(k) == want.get(k) for k in KEYS)
        print(f"         {'OK' if ok else 'FAILED'} -> {({k: got.get(k) for k in KEYS})} status {after.get('status')} "
              f"model unchanged={same_model} version {full.get('version')}->{after.get('version')} "
              f"{'' if ok else res.get('errors')}")
    if mode in ("off", "on") and apply and backup:
        path = os.path.join(here, f"ar-backup-{time.strftime('%Y%m%d-%H%M%S')}.json")
        json.dump(backup, open(path, "w"), indent=1)
        print(f"\nbackup: {path}")

if __name__ == "__main__":
    main()
