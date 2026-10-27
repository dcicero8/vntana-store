#!/usr/bin/env python3
"""Read-only audit of every "<item> (Production)" asset in Costco / mexico-poc:
name, description, PDP URL + item number + dimension attributes, PDP image
attachments, tag and publish status. Prints one line per asset plus gaps.

Usage: python3 costco-audit.py [--json out.json]
"""
import json, re, sys, os, importlib.util

here = os.path.dirname(os.path.abspath(__file__))
def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(here, file))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
pa = load("pa", "pdp-attach.py")
pt = load("pt", "pdp-attributes.py")
DEC = json.JSONDecoder(strict=False)

def attachments(tok, uuid):
    body = {"page": 0, "size": 100, "productUuid": uuid, "sortDirection": "DESC"}
    b, _ = pa.http(f"{pa.API}/v1/attachments/search", data=json.dumps(body).encode(),
                   headers=pt.hdr(tok), raw=True)
    d = DEC.decode(b.decode("utf-8", "replace") or "{}")
    r = d.get("response") or {}
    items = r.get("grid") or r.get("attachments") or (r if isinstance(r, list) else [])
    if not d.get("success"): return None, d.get("errors")
    return [i.get("name") or i.get("originalName") or "" for i in items], None

def pdp(item):
    d, _ = pa.http(f"https://www.costco.com.mx/rest/v2/mexico/products/{item}?fields=FULL&lang=es_MX",
                   headers={"User-Agent": pa.UA})
    return d if d.get("code") else None

def main():
    tok = pa.org_token()
    out = []
    for p in pt.list_products(tok):
        name = p.get("name") or ""
        m = re.match(r"^(\S+)(?: [^(]*)? \(Production\)", name)
        if not m: continue
        item, uuid = m.group(1), p["uuid"]
        full = pt.get(f"{pa.API}/v1/products/{uuid}", tok)["response"]
        attrs = full.get("attributes") or {}
        desc = (full.get("description") or "").strip()
        att, err = attachments(tok, uuid)
        pd = pdp(item)
        pd_imgs = len([1 for im in (pd or {}).get("images") or [] if im.get("format") == "zoom"]) if pd else 0
        dims = pt.pdp_dims(item) if pd else {}
        gaps = []
        if not desc: gaps.append("no description")
        if attrs.get("PDP URL") != f"https://www.costco.com.mx/p/{item}": gaps.append(f"PDP URL={attrs.get('PDP URL')!r}")
        if attrs.get("Costco Item Number") != item: gaps.append("item # attr missing")
        for k, v in (dims or {}).items():
            if attrs.get(k) != v: gaps.append(f"{k} missing")
        if att is None: gaps.append(f"attachments lookup failed {err}")
        elif pd and not [a for a in att if "_pdp_" in a]: gaps.append("no PDP photo attachments (QR codes do not count)")
        tags = [t["name"] for t in full.get("tags") or []]
        if not ({"Live Asset", "Final Review"} & set(tags)): gaps.append(f"tags={tags}")
        if full.get("status") != "LIVE_PUBLIC": gaps.append(f"status={full.get('status')}")
        row = {"item": item, "uuid": uuid, "name": name, "desc": desc, "pdp_live": bool(pd),
               "pdp_name": (pd or {}).get("name"), "attachments": att, "pdp_zoom_imgs": pd_imgs,
               "tags": tags, "status": full.get("status"), "gaps": gaps}
        out.append(row)
        print(f"{item:10} {uuid[:8]} pdp={'Y' if pd else 'N'} photos={len([a for a in att if '_pdp_' in a]) if att is not None else '?'} "
              f"tags={','.join(tags)} {'OK' if not gaps else 'GAPS: ' + '; '.join(gaps)}")
    if "--json" in sys.argv:
        json.dump(out, open(sys.argv[sys.argv.index("--json") + 1], "w"), ensure_ascii=False, indent=1)
    print(f"\n{len(out)} assets, {sum(1 for r in out if r['gaps'])} with gaps")

if __name__ == "__main__":
    main()
