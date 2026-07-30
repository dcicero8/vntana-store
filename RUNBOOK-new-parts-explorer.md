# RUNBOOK — "Make a new parts explorer page"

When Derek says "make a parts explorer page for X," follow this exactly. Do not
improvise a different structure. Golden template: `roeslein-uvbc-lamp.html`
(cleanest working implementation). Reference for bugs/architecture:
`REVIEW-parts-explorer.md`.

**Claude: read this whole runbook BEFORE writing any code or improvising a layout.**
The click-to-select glow + ghost effect is the viewer's built-in selection
(`viewer.selection.highlight` + scene-graph picking), NOT a hand-rolled `setEffect`.
It only works when the clickable parts are named `Name (SKU)` in the model. No
naming = no highlight. If the model is not prepped, stop and give Derek the
prep checklist below instead of building a workaround.

---

## Derek's prep (Figurement + VNTANA) — do this BEFORE Claude builds

The page cannot make a part clickable/glow unless the model is prepped this way.
Claude: when a model is not ready, hand Derek exactly these steps.

1. **Identify the core parts.** Decide which components a customer should be able
   to click (e.g. Trunnion, V-Flights, Flop Gate). Everything else stays background.
2. **Group each part into one node.** In Figurement, the part is usually many
   scattered CAD meshes. Select them and collapse/parent them under a **single
   node** so a click selects the whole part, not one bolt. One parent node per
   clickable component.
3. **Rename that node `Name (SKU)`.** Exact format, with the SKU in parentheses,
   e.g. `Trunnion (DB-TR-0900)`. This is what the page matches on. Do this for
   every clickable part. (Alphanumeric SKUs are fine; tell Claude and it widens
   the regex.)
4. **Fix materials if raw.** If the model imported with magenta/unassigned faces
   (common from NWD/STEP), assign materials in Figurement so it reads clean. Use
   procedural metals (Polished/Brushed), not texture Patterns — CAD has no UVs.
5. **Export + upload.** Either Derek exports, or Claude exports the GLB via
   `POST https://app.figurement.com/api/scenes/{sceneId}/export` `{"format":"glb"}`
   (Bearer key in memory) and Derek uploads it to VNTANA as a new version.
   Make sure it is **Live Public**.
6. **Author a hotspot per clickable part** in the VNTANA platform:
   - **Frame the camera FIRST**, then place the hotspot — the hotspot saves that
     camera, and that saved view becomes the click-to-zoom snap.
   - Set the hotspot **text = the SKU or the exact part name** (matches the node).
   - Optionally set an exploded view; the saved `explodedStrength` is usable.
7. **Set the default camera + lighting** in the product's viewer settings (this is
   the opening view the page auto-applies on load).
8. **Give Claude:** the **product UUID**, the **org/workspace** (default
   `DCicero` / `n8n-work`, or whatever it lives in), and the parts list (SKU, name,
   price, order URL). Then Claude runs Phase 1 to verify before building.

**Quick "is it ready?" check (Claude runs this, reports the gaps to Derek):**
download the GLB and confirm the clickable parts appear as `... (SKU)` in the node
names, and that a hotspot exists for each. Missing name = not clickable. Missing
hotspot = no camera snap. Report both before building.

---

## Phase 0 — What to ask Derek for (all of it, up front, in one message)

1. **Product UUID** of the model in VNTANA (must be Live Public, org `DCicero`,
   workspace `n8n-work` unless he says otherwise). Nothing works without this —
   and a wrong UUID fails *silently* (empty hotspots, unclickable nodes).
2. **Parts list** — for each part: SKU, display name, description, price (or
   "Contact for pricing"), order URL (usually `https://parts.roeslein.com/...`).
   A BOM `.xls` works — SKU/description/price columns can be extracted from it.
3. **Part images** — one per SKU, dropped into `assets/parts/{sku}.jpg`.
   Ask which parts are missing images; missing ones get the grey placeholder.
4. **Hotspots (recommended)** — Derek places them in the VNTANA platform:
   - Frame the camera view FIRST (the hotspot saves it — that becomes the snap view)
   - Name/text = the SKU or the exact part name (anything else needs a code alias)
   - Optionally set an exploded view on the hotspot; the saved `explodedStrength` is usable
5. **Default camera / lighting** — set in the product's viewer settings in the
   platform (the page auto-applies `viewerSettings.config` on load). If he wants a
   different opening view than the saved settings, get camera JSON from the embed console:
   ```js
   const v=document.querySelector("vntana-viewer");
   JSON.stringify({cameraRotation:v.cameraRotation,cameraDistance:v.cameraDistance,cameraTarget:v.cameraTarget,fieldOfView:v.fieldOfView})
   ```
6. **Node naming** — remind him: every clickable part's node/group must be named
   `Name (SKU)` (e.g. `Gearmotor (172-017)`), done in Figurement/CAD **before**
   export. If renaming happens in Figurement, YOU export the GLB via API (see
   Phase 1) and he uploads it to VNTANA.

## Phase 1 — Verify before writing any code (no auth needed for any of this)

```bash
# 1. Product exists, is Live Public, and has a GLB
curl -s "https://api.vntana.com/products/{UUID}/organizations/DCicero/clients/n8n-work" \
  | python3 -m json.tool | head -50
# → check response.asset.models[] contains conversionFormat "GLB"; note modelBlobId

# 2. Download the GLB and verify node names contain the SKUs
curl -s -o /tmp/check.glb \
  "https://api.vntana.com/assets/products/{UUID}/organizations/DCicero/clients/n8n-work/{modelBlobId}"
python3 - <<'EOF'
import json, struct, re
d = open("/tmp/check.glb","rb").read()
ln = struct.unpack("<I", d[12:16])[0]
g = json.loads(d[20:20+ln])
names = [n.get("name","") for n in g.get("nodes",[])]
skus = sorted({m.group(1) for n in names for m in [re.search(r"\((\d{3}-\d{3,7})\)", n)] if m})
print("nodes:", len(names), "| SKUs found in node names:", skus)
EOF

# 3. Fetch hotspots — see exactly what Derek authored (text, camera, explodedView)
curl -s -X POST "https://api.vntana.com/hotspots/search/organizations/DCicero/clients/n8n-work" \
  -H "Content-Type: application/json" \
  -d '{"productUuid":"{UUID}","page":1,"size":50}' | python3 -m json.tool
```

**Report the diff to Derek before building:** which catalog SKUs are missing from
the GLB node names (→ he renames in Figurement, you re-export via
`POST https://app.figurement.com/api/scenes/{sceneId}/export` `{"format":"glb"}`
with the Bearer key from memory, he re-uploads), and which parts have no hotspot.
SKU mismatches between GLB and catalog (like `500-0000395` vs `500-0002622`) go in
`skuAliases` — do NOT silently drop the part.

## Phase 2 — Build

1. `cp roeslein-uvbc-lamp.html roeslein-{product}.html` — keep the structure:
   viewer column left (fs / center / scene-graph-**active** / zoom buttons),
   parts table + part card right.
2. Set the constants: `UUID`, `ORG`, `WORKSPACE`, page title, eyebrow, subtitle.
3. Fill the `PARTS` array (sku, name, desc, price, img, url). Add `SKU_INDEX`
   aliases for any GLB/catalog SKU mismatches found in Phase 1.
4. Selection: keep the existing pattern verbatim —
   `viewer.selection.highlight.addEventListener("change", ...)`, `value === 0` =
   selected, walk `node.parent`, match `/\((\d{3}-\d{3,7})\)/`.
5. Hotspots (if any): copy the text-matching block from `roeslein-uvbc.html`
   (`stripHtml` → SKU-in-text → exact-name → alias table). Store cameras per SKU;
   apply camera in the show-part function so sidebar clicks snap too. If a hotspot
   has `explodedView`, set `viewer.scene.explodedStrength` BEFORE the camera,
   camera on next `requestAnimationFrame` (r-units are bounds-relative).
6. Model load: pick GLB by format (`models.find(m => (m.conversionFormat ?? m.type) === "GLB")`),
   never `models[0]`. Camera/config listeners registered BEFORE `viewer.src`.
7. Link the new page from wherever Derek says (index, or a parent assembly page
   card with `→ View replacement parts`).

## Phase 3 — Ship & verify

1. Commit AND push immediately (Derek tests on Railway live, not locally).
2. Tell Derek it's pushed and give him this test list:
   - each part clickable in the 3D viewport → card + camera snap
   - each table row click → card (+ camera if hotspot exists)
   - hotspot pins render and snap
   - no console errors; model not black (if black: `environmentSrc` problem)
3. If a 3D click doesn't resolve: add the CLICK CHAIN debug (ASCII only, no `→`
   character), push, ask Derek to paste the console line. Fix by data, not guess.
4. Remove debug logging, push again.

## Failure modes already hit once (don't repeat)
- Wrong/old product UUID → everything silently half-works. Check UUIDs first.
- Hotspots matched by UUID → break when recreated. Match by text.
- `NODE_MAP` of raw node names → goes stale on every re-export. Use SKU-in-name.
- Camera applied before explode state / before `load` event → wrong position.
- `const viewer` declared after first use when splicing code → page dies. Read the
  whole script block after editing.
- Duplicated `detailPane`-style IDs across show-functions — hide ALL other panels
  in every show function.
