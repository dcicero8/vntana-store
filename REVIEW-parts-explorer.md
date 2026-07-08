# Senior Dev Review — Roeslein Parts Explorer

Reviewed: `roeslein-uvbc.html`, `roeslein-uvbc-lamp.html`, `parts.html`/`parts.js`, `tadano-crane-explorer.html`
Date: 2026-07-08

---

## 1. Bugs (fix in this order)

### BUG-1 · Hotspots are bound to the old product — camera snap silently dead
`roeslein-uvbc.html` fetches hotspots with `productUuid: d72e48cd…` (the new Figurement model), but every hotspot in `HS_MAP` was **created on the old product** `657f3fe0…`. The search returns zero rows, so:

- No hotspot pins render on the model
- `HOTSPOT_CAMERAS` stays empty → `selectAssembly()` never moves the camera

**This is why the camera doesn't swing when you click a sidebar name plate.**

Fix options (pick one):
- **(a) Recreate the hotspots on the new product** in the VNTANA platform UI, then update the UUIDs in `HS_MAP`. Correct long-term fix.
- **(b) Point the hotspot search back at the old product UUID** (`657f3fe0`) as a stopgap — the positions/cameras were authored against essentially the same geometry, so they'll roughly line up. One-line change, ships today.

### BUG-2 · `showSkuPart()` never moves the camera at all
Clicking IEC/Gearmotor (sidebar or 3D) shows the part card but has no camera logic. Even after BUG-1 is fixed, parts won't snap because parts aren't assemblies — they have no hotspot.

Fix: add an optional `camera` field to `SKU_DATA` and apply it in `showSkuPart`:

```js
const SKU_DATA = {
  "500-0005291": {
    name: "IEC Load Switch",
    // capture from embed console:
    camera: { cameraTarget: "…", cameraDistance: "…", cameraRotation: "…" },
    …
  },
};

function showSkuPart(sku) {
  const d = SKU_DATA[sku];
  if (!d) return;
  if (d.camera) {
    try {
      if (d.camera.cameraTarget)   viewer.setCameraTarget(d.camera.cameraTarget);
      if (d.camera.cameraDistance) viewer.setCameraDistance(d.camera.cameraDistance);
      if (d.camera.cameraRotation) viewer.setCameraRotation(d.camera.cameraRotation);
    } catch (_) {}
  }
  …
}
```

Camera values are captured once per part from the embed:
```js
const v=document.querySelector("vntana-viewer");
JSON.stringify({cameraRotation:v.cameraRotation,cameraDistance:v.cameraDistance,cameraTarget:v.cameraTarget})
```

### BUG-3 · `NODE_MAP` is entirely stale
All 23 entries in `NODE_MAP` are node names from the **old GLB export** (`"VTU RH 36in Single Lamp"`, `"AB 194E-FA16 Electrical Disconnect_DS-MA005 - Applicator Roller"`, …). The Figurement re-export renamed everything. None of these match anymore, so clicking any assembly geometry does nothing.

Fix: confirm actual names with the CLICK CHAIN debug output, then either rebuild `NODE_MAP` — or better, stop maintaining a name map at all and put SKUs/keys in the node names (see §3, naming convention).

### BUG-4 · `activeKey` short-circuit after viewing a part
`selectAssembly()` early-returns when `activeKey === key`, but `showSkuPart()` doesn't reset `activeKey`. Sequence: click assembly A → click IEC → click assembly A again → **nothing happens**.

Fix: add `activeKey = null;` inside `showSkuPart()`.

### BUG-5 · Debug logging still in production
`handleNodeSelection` in `roeslein-uvbc.html` still logs `CLICK CHAIN` to the console. Remove once the IEC node name is confirmed.

### BUG-6 · `models[0]` is not guaranteed to be the GLB
`roeslein-uvbc.html` and `roeslein-uvbc-lamp.html` both do `asset.models[0].modelBlobId`. The models array can contain USDZ too. `parts.js` already does this right:

```js
const m = models.find(m => (m.conversionFormat ?? m.type) === "GLB");
```
Copy that helper into both Roeslein pages.

### BUG-7 · ~80 lines of dead code in `roeslein-uvbc.html`
`loadLampSubModel()`, `restoreMainModel()`, `LAMP_CAMERA`, `LAMP_PARTS`, `mainSrc`, the `#lamp-back` listener, and the entire `#lamp-detail-inner` HTML block are unreachable since the UV Lamp went to its own page. Delete them — they're the exact kind of leftovers that caused the "two steps forward one step back" churn.

---

## 2. Optimizations (nice-to-have, not urgent)

1. **Cache the product lookup.** Every page load does 1 product fetch + 1 hotspot fetch before the model request starts. Inline the blob URL as a constant (it's stable for a published asset) and cut time-to-first-pixel; keep the fetch as fallback.
2. **`loading="lazy"` + `poster`** on the viewer with a pre-rendered image (Gemini renders exist already) so the page paints instantly.
3. **Shared stylesheet.** The Roeslein pages carry ~300 duplicated lines of `<style>` each. Extract `roeslein.css`.
4. **One selection-listener implementation.** The same `attachSelectionListener` is now hand-copied in 3+ files with slight drift (that drift is what broke the main page while the lamp page worked). Shared JS module.

---

## 3. Architecture: making new parts explorers a repeatable process

### The core insight
Every explorer page is the same machine: **viewer + node-click resolution + parts panel**. The only things that change per product are *data*. Stop writing pages; write one engine and feed it configs.

### 3.1 The naming contract (most important thing in this doc)
Everything hinges on one convention, enforced at the CAD/Figurement stage:

```
<Human Name> (<SKU>)          e.g.  Gearmotor (172-017)
<Human Name> (<SKU>) - <Pos>  e.g.  UVLED Lamp 250mm Long (500-0003042) - Left
```

- One regex resolves every click: `/\((\d{3}-\d{3,7})\)/`
- No `NODE_MAP` to maintain, ever. New part = rename the node, add one row of data.
- Assemblies that link to sub-model pages get their own marker, e.g. suffix `[ASM:lamp]`, or just keep a tiny per-page assembly map (there are few of them).

**Pipeline going forward (needs SolidWorks source files):**
```
SolidWorks assembly
  → export with BOM metadata (part numbers live in the feature tree already)
  → script renames nodes to "Name (SKU)" from the BOM   ← automatable, kills the manual step
  → GLB → VNTANA upload (existing script pattern: scratchpad/upload_uvbc_model.py)
  → hotspots authored once in VNTANA UI
  → one JSON config per product (below)
```
Today this rename step is manual in Figurement — that's the bottleneck to call out to Roeslein/Ashley when asking for SolidWorks files.

### 3.2 One engine, JSON configs
```
/explorer/
  engine.js            ← viewer boot, selection listener, camera snap, panel render
  explorer.css         ← shared styles (Roeslein theme via CSS vars)
  configs/
    uvbc-main.json
    uvbc-lamp.json
    tadano.json
explorer.html?config=uvbc-main    ← ONE html file serves every product
```

Config schema (everything we currently hardcode, nothing more):

```json
{
  "title": "UVBC UV Curing System",
  "eyebrow": "Can Manufacturing · UV Curing",
  "product": { "uuid": "d72e48cd-…", "org": "DCicero", "workspace": "n8n-work" },
  "camera": { "cameraRotation": "…", "cameraDistance": "…", "cameraTarget": "…" },
  "assemblies": [
    { "key": "lamp", "name": "UV Lamp Assembly", "pn": "RP001-092-15-2009",
      "href": "explorer.html?config=uvbc-lamp" }
  ],
  "parts": [
    { "sku": "500-0005291", "name": "IEC Load Switch",
      "desc": "Disconnect Switch, 194E IEC Rotary…", "price": "$241.72",
      "img": "assets/parts/500-0005291.jpg",
      "orderUrl": "https://parts.roeslein.com/iec-load-switch/",
      "camera": { "cameraTarget": "…", "cameraDistance": "…", "cameraRotation": "…" },
      "skuAliases": ["500-0000395"] }
  ],
  "greyedOut": [ { "badge": "VTU", "name": "UV Conveyor Transport Unit", "pn": "DI001-STD-0310001" } ]
}
```

Note `skuAliases` — it formalizes the Temperature Sensor hack (GLB says `500-0000395`, catalog says `500-0002622`) instead of burying it in code.

**Adding a new product then becomes:**
1. Name the nodes (automated once we have SolidWorks + BOM)
2. Upload GLB to VNTANA, set Live Public
3. Write one JSON file (could even be generated from the BOM `.xls` — the `DI001-STD-0110001 BOM.xls` in this repo has SKU, description, and price columns already)
4. Link `explorer.html?config=<name>` from the index

Zero new HTML/JS per product. The BOM→JSON step is a 30-line Python script away.

### 3.3 Migration path (don't big-bang it)
1. Fix BUG-1…BUG-7 in place on the current pages (hours)
2. Extract `engine.js` from `roeslein-uvbc-lamp.html` — it's the cleanest implementation (day)
3. Port the lamp page to `explorer.html?config=uvbc-lamp`, verify identical behavior, then port the main page
4. Retire `roeslein-uvbc-parts.html` (already orphaned) and `selection-test.html`
5. BOM→config generator script when SolidWorks files arrive

---

## 4. Immediate checklist

- [ ] Get CLICK CHAIN output for IEC on the new model (debug is live now) → confirm node has `(500-0005291)`
- [ ] If not: rename the IEC group in Figurement scene `sc2seroj1euw661`, re-export, re-upload
- [ ] Recreate hotspots on product `d72e48cd` (or repoint search at `657f3fe0` as stopgap)
- [ ] Capture camera JSON for IEC + Gearmotor from the embed; add to `SKU_DATA` with snap logic
- [ ] `activeKey = null` in `showSkuPart`
- [ ] Remove debug logging
- [ ] Swap `models[0]` for GLB-format lookup on both Roeslein pages
- [ ] Delete dead lamp-inline code from `roeslein-uvbc.html`
- [ ] Ask Roeslein for SolidWorks files — framing: "part numbers already live in your feature tree; with source files we automate node naming and can generate an explorer for any assembly in your BOM"
