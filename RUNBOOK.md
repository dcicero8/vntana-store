# VNTANA Interactive Demos, Master Runbook

Internal build guide for the demos in this repo. Two tracks:

- **Track A, Interactive pages** on the VNTANA custom viewer (`@vntana/viewer`): click a
  part, ghost the rest, fly the camera, explode, drive it all from your own UI.
- **Track B, Material work in Blender**: bake procedural materials (mottle, edge wear) onto
  a GLB when glTF/Figurement cannot express them, then get it back into VNTANA.

Everything runs off a **Live Public** VNTANA asset. No backend. No auth token in the front end.

> House style: no em dashes in any copy. Use commas, colons, periods, or parentheses.

---

## 0. The mental model

- One VNTANA asset (one product UUID) feeds BOTH the default embed and the custom viewer.
  Same file from the same CDN. The custom viewer just exposes more of the engine as code.
- The default embed is a fixed binary (settings are on/off toggles). The custom viewer is the
  same viewer as a package, so hover/highlight/ghost/camera/explode become function calls and
  you can hide or restyle any control.
- What makes this possible: VNTANA preserves the **named mesh nodes** in the optimized GLB.
  The scene tree is the contract. Clean names in, smooth build.
- **License:** the viewer is authorized through VNTANA and will not run without a valid
  license. It is not standalone or open.

---

## 1. VNTANA prep (do this first, every asset)

1. **Upload and process the CAD.** Pipeline choice matters a lot (see §7):
   - **Preserve Meshes and UVs**: keeps parts separate (needed for click-to-select and
     exploded view) and keeps materials/UVs, still optimizes. Default for these demos.
   - **Industrial / Intelligent Optimization**: merges meshes, removes internal geometry,
     decimates. Produces a clean AR-ready USDZ, but **breaks the exploded view and per-part
     selection** because parts are fused.
   - **Convert Only**: preserves everything as-is (all meshes, no decimation). Preserves a
     baked texture exactly. Heavier files.
2. **Set the product Live Public.**
3. **Name the parts in the scene tree** (see §6). This is the single biggest lever.
4. **(Optional) Add hotspots** on featured parts. Each hotspot stores a camera angle, a text
   body, and a per-hotspot explode value the page reads automatically.
5. Record **UUID, organization slug, client (workspace) slug**.

Handy endpoints (all public for Live Public assets):

```
GET  api.vntana.com/products/{uuid}/organizations/{org}/clients/{ws}
     -> response.asset.models[].modelBlobId (find GLB), response.viewerSettings.config
Asset URL:
     api.vntana.com/assets/products/{uuid}/organizations/{org}/clients/{ws}/{blobId}
Embed:
     embed.vntana.com/v2?productUuid={uuid}&clientSlug={ws}&organizationSlug={org}[&autoAR=true]
Hotspots (POST, body {productUuid,page:1,size:50}):
     api.vntana.com/hotspots/search/organizations/{org}/clients/{ws}
```

---

## 2. The viewer

```bash
npm install @vntana/viewer     # https://www.npmjs.com/package/@vntana/viewer
```
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@vntana/viewer/dist/bundle.js"></script>
<vntana-viewer id="viewer" picking="true"></vntana-viewer>
```

`picking="true"` arms click and hover on parts. Without it, selection only fires by accident.
Set it on the tag AND as a property in JS, re-asserted on `load` (custom-element upgrade can
drop the attribute, which is why selection "works sometimes"):

```js
viewer.picking = true;
viewer.addEventListener("load", () => { viewer.picking = true; }, { once:true });
```

Capabilities used:

| API | Purpose |
|-----|---------|
| `viewer.sceneGraph` | node tree; leaf `primitive` nodes carry a `uuid` (name/uuid/type/parent/children only, no transforms) |
| `object-select` / `object-hover` events | `e.detail.intersections[0].uuid` is the hit primitive |
| `viewer.setEffect(uuid, "dim"\|"outline"\|"highlight"\|"glow")` | visual effects |
| `viewer.clearEffect("dim")` | remove one effect from everything |
| `viewer.explodedStrength = 0..1` | radial explode (a property on the element, NOT `viewer.scene.explodedStrength`) |
| `viewer.cameraTarget / cameraDistance / cameraRotation / fieldOfView` | camera (values are in bounds-relative `r` units and radians) |
| `viewer.src = ".../assets/products/{uuid}/.../{blobId}"` | load / swap the model |

Load the model:

```js
const p = await fetch(`${BASE}/products/${UUID}/organizations/${ORG}/clients/${WS}`).then(r=>r.json());
const { asset, viewerSettings } = p.response;
const blobId = asset.models.find(m => (m.conversionFormat ?? m.type) === "GLB")?.modelBlobId;
if (viewerSettings?.config)
  viewer.addEventListener("load", () => Object.assign(viewer, JSON.parse(viewerSettings.config)), { once:true });
viewer.src = `${BASE}/assets/products/${UUID}/organizations/${ORG}/clients/${WS}/${blobId}`;
```

---

## 3. Core interaction pattern (the whole trick)

Do not match names per click. Walk the scene tree once, build a `uuid -> feature` map, then
read the clicked uuid off the event.

```js
// One entry per clickable feature.
//   match   = regex over node NAMES -> which parts belong to this feature
//   textKey = regex over hotspot TEXT -> which hotspot's camera + copy to bind
//   explode = 0..1 auto-explode target on select (optional)
//   ghost   = borrow another feature's parts if this one has no node of its own (optional)
const FEATURES = [
  { id:"bars", name:"UHMW Impact Bars", tag:"Belt contact surface",
    match:/impact bar tray/i, textKey:/uhmw/i, explode:1, body:"fallback copy" },
];
const byId = Object.fromEntries(FEATURES.map(f => [f.id, f]));

const GROUP = {}, UUID_ID = {}, BODY = [];
const featureFor = (nm) => (FEATURES.find(f => f.match && f.match.test(nm||"")) || {}).id || null;
const collectPrims = (n, out=[]) => { if (n.type==="primitive") out.push(n.uuid);
                                      (n.children||[]).forEach(c=>collectPrims(c,out)); return out; };
let tries = 0;
const buildGroups = () => {
  const root = viewer.sceneGraph;
  if (!root) { if (tries++ < 80) setTimeout(buildGroups, 120); return; }
  Object.keys(GROUP).forEach(k=>delete GROUP[k]); Object.keys(UUID_ID).forEach(k=>delete UUID_ID[k]); BODY.length=0;
  (function walk(n){
    const id = featureFor(n.name);
    if (id){ const u = collectPrims(n); GROUP[id]=(GROUP[id]||[]).concat(u); u.forEach(x=>UUID_ID[x]=id); return; }
    if (n.type==="primitive") BODY.push(n.uuid);
    (n.children||[]).forEach(walk);
  })(root);
};

const dimAllExcept = (id) => {
  for (const u of BODY) viewer.setEffect(u,"dim");
  for (const [gid,uuids] of Object.entries(GROUP)) if (gid!==id) for (const u of uuids) viewer.setEffect(u,"dim");
};
const clearAll = () => ["dim","outline","highlight","glow"].forEach(e=>viewer.clearEffect(e));

const selectFeature = (id) => {
  const f = byId[id]; if (!f) return;
  clearAll();
  const gid = f.ghost || id;                 // borrow another group if this feature has no node
  const uuids = GROUP[gid];
  if (uuids && uuids.length){ dimAllExcept(gid); for (const u of uuids) viewer.setEffect(u,"outline","highlight"); }
  if (f.cam) applyCam(f.cam);
  animateExplode(f.explode ?? 0);
  showPanel(f);
};

viewer.addEventListener("object-hover", (e) => {
  const id = UUID_ID[e.detail?.intersections?.[0]?.uuid];
  viewer.clearEffect("glow"); viewer.style.cursor = id ? "pointer" : "";
  if (id) for (const u of GROUP[id]) viewer.setEffect(u,"glow");
});
viewer.addEventListener("object-select", (e) => {
  const id = UUID_ID[e.detail?.intersections?.[0]?.uuid];
  if (id) selectFeature(id); else resetView();
});
["scene-loaded","updates-loaded","load"].forEach(ev => viewer.addEventListener(ev, buildGroups));
```

Wire a chip list and a Back/Reset button to the same `selectFeature(id)` / `resetView()`.

---

## 4. Hotspots: camera, copy, explode

Fetch the hotspots and attach each to a feature by matching the text you wrote in VNTANA.

```js
const stripHtml = (s) => (s||"").replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").trim();
const loadHotspots = async () => {
  const r = await fetch(`${BASE}/hotspots/search/organizations/${ORG}/clients/${WS}`,
    { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ productUuid: UUID, page:1, size:50 }) }).then(r=>r.json());
  (r.response?.grid || []).forEach(h => {
    let cfg = {}; try { cfg = typeof h.config==="string" ? JSON.parse(h.config) : (h.config||{}); } catch(_){}
    // GOTCHA: cfg.camera is itself a JSON STRING. Parse it a SECOND time.
    let cam = cfg.camera; if (typeof cam==="string") { try { cam = JSON.parse(cam); } catch(_){ cam=null; } }
    const txt = stripHtml(h.text);
    const f = FEATURES.find(f => f.textKey && f.textKey.test(txt));
    if (f) { if (cam) f.cam = cam; if (txt) f.body = txt; }
  });
};
```

Hotspot row shape: `{ type, uuid, text (HTML body), config }`, where `config` is a JSON string
holding `camera` (a nested JSON string), `dimensions` (pin position/normal), and `explodedView`
(`{explodedStrength}`). There is no separate title/name field; the card renders the text HTML,
so a title is a bold first line in the text, authored in VNTANA.

Camera and explode are not keyframed animation. You freeze a camera pose and an explode value
per part; selecting one interpolates to it.

```js
const applyCam = (c) => {
  if (!c) return;
  if (c.cameraTarget   !== undefined) viewer.cameraTarget   = c.cameraTarget;
  if (c.cameraDistance !== undefined) viewer.cameraDistance = c.cameraDistance;
  if (c.cameraRotation !== undefined) viewer.cameraRotation = c.cameraRotation;
  if (c.fieldOfView    !== undefined) viewer.fieldOfView    = c.fieldOfView;
};
let raf = null;
const animateExplode = (target) => {
  if (raf) cancelAnimationFrame(raf);
  const start = viewer.explodedStrength || 0, t0 = performance.now(), dur = 550;
  const step = (t) => { const k = Math.min(1,(t-t0)/dur);
    viewer.explodedStrength = start + (target-start)*(k*k*(3-2*k)); // smoothstep
    if (k<1) raf = requestAnimationFrame(step); else raf = null; };
  raf = requestAnimationFrame(step);
};
```

Save a home camera on `load` (`{cameraTarget,cameraDistance,cameraRotation,fieldOfView}` read
off the viewer) and `applyCam(homeCam)` on reset.

Correct endpoint is `/hotspots/search/...`, NOT `/products/hotspots/search/...` (the latter
returns 0 silently).

---

## 5. Feature config reference

| Field | Meaning |
|-------|---------|
| `id` | stable key |
| `name`, `tag` | UI label |
| `match` | regex over node names. `null` = no node of its own (copy + camera only) |
| `textKey` | regex over hotspot text to bind camera + copy |
| `explode` | 0..1 auto-explode on select |
| `ghost` | another feature id whose parts to highlight (for parts with no distinct node) |
| `cam`, `body` | filled at runtime from the matched hotspot |

A primitive belongs to exactly one feature (first match wins). If two callouts want the same
casting, give one `ghost:"otherId"`. If a callout has no geometry at all, `match:null`.

---

## 6. Scene-tree best practices (make or break)

- **Name every clickable part clearly** (`Impact Roller`, `Gearbox`, `Output Shaft`). Clean
  trees map in minutes; scrambled/auto names (a fan face named "Rear Controler", a big housing
  named "Motor", a tiny cover named "Gearbox") cannot be labeled accurately from names. Fix by
  renaming in the model or Figurement, not in code.
- **Instances get suffixes** (`impact bar tray.004/.009`). Match on the base name with a regex.
- **Space vs underscore**: node names may use spaces while your data keys use underscores.
  Normalize when matching (strip a trailing " (N)", trim, then space to underscore).
- **You do not have to expose every part.** Name only the ones you want clickable; the rest
  optimize into un-clickable background.
- **For ERP/SKU mapping**: bake the identifier into the node name with a delimiter, for example
  `HumanName_SKU` or `ERP-00046 Roller` (keep a human-readable part so a person or Claude can
  still tell what it is, split the SKU programmatically). GLB carries no metadata, but VNTANA
  product **Attributes** can hold `sku=`, `material=` etc. via the API if you prefer clean names.

---

## 7. AR vs Exploded view (the tradeoff)

They are mutually exclusive from one asset:

- Exploded view and per-part selection need **separate meshes** (Preserve Meshes and UVs).
- AR needs a merged, optimized model (Industrial pipeline merges meshes, which breaks explode).
- If you want both, ship **two products**: one Preserve-Meshes for the explodable viewer, one
  Industrial for the AR button. Same source file, two uploads.

AR failing to load is almost never file size or triangle count. It is **draw calls / mesh
count**. A 10 MB, 162k-tri model with 1,787 meshes fails; merged to 2 meshes it works. Fixes:
re-upload via the Industrial pipeline, or pre-merge with gltf-transform:

```
npx @gltf-transform/cli optimize in.glb out.glb --compress false --texture-compress false --instance false
```

---

## 8. Material baking in Blender (Track B)

When a look cannot be expressed in glTF/Figurement (procedural noise mottle, curvature-based
edge wear), bake it to a texture in Blender. Reference case: the injection-molded "cast green"
on a pump.

Pipeline:

1. Start from the **Figurement-optimized GLB** (already has materials split into slots, has
   hotspots/explode, is light). Do NOT re-derive geometry from STEP (see §9).
2. Identify the target objects by material membership, JOIN them into one body.
3. Build the procedural material (Principled BSDF):
   - Base color, Roughness ~0.58, Metallic 0, **Coat 0** (a clear coat looks waxy, avoid it).
   - Mottle: `TexNoise` (Object coords) -> `ColorRamp` -> `MixRGB` between base and a lighter
     splotch color.
   - Edge wear: `Geometry.Pointiness` -> `ColorRamp` -> `MixRGB` toward a near-white edge color.
   - sRGB to linear before setting any color: `((c+0.055)/1.055)**2.4 if c>0.04045 else c/12.92`.
4. Smart UV Project the joined body.
5. Cycles bake, `type=DIFFUSE`, COLOR pass only (`use_pass_direct=False`,
   `use_pass_indirect=False`, `use_pass_color=True`) so lighting is not baked in.
6. Relink the baked image to Base Color, pack it, export GLB.
7. Re-upload via Preserve Meshes and UVs (keeps the texture and the separate meshes). Convert
   Only also preserves it; use Industrial only if you additionally want AR.

Geometry gotchas (only relevant if you are NOT on a clean GLB):

- **Weld first**: `remove_doubles` at ~0.1 to 0.2 mm closes tessellation cracks and halves poly
  count. Protect fine threads (weld the body more aggressively than threaded parts).
- **Recalculate normals** consistent (outside) per body. Flipped inner-bore faces render as
  black "holes". But do NOT `normals_make_consistent` on a mesh with good custom split normals;
  it destroys them and creates shading streaks. Clear custom split normals first, then smooth.
- **Orientation**: measure the true axis (average normal of a flat cap face) and align it to
  +Z. Bounding-box-center vectors are unreliable on asymmetric bodies. Center the assembly on
  the origin or the viewer orbit pivots around empty space. Export +Y up.
- **Material region cuts**: cut along a part's own face-normal direction, not a flat world
  height plane. A height cut zig-zags across tilted or curved surfaces and looks ragged.

Material notes: match the real reference, not a guess. Baked params stay live in the Blender
scene, so re-tuning is a value change plus re-bake (seconds), not a rebuild.

---

## 9. STEP to GLB is a dead end (documented so nobody repeats it)

Converting raw STEP with `cascadio` looks appealing for "clean" geometry but is not worth it:

- Every CAD-to-mesh converter (cascadio AND VNTANA's own optimizer) leaves the tessellation
  **non-watertight**: thousands of unwelded patch-boundary edges. VNTANA's optimized mesh had
  MORE non-manifold edges than cascadio's.
- Those seams cause the artifacts you then chase (black "flipped normal" circles in bores, dark
  shading lines). They are normals/seam artifacts, not base-geometry problems.
- STEP AP203 carries no color, so you also lose all materials.
- A single-part STEP can import as one fused solid that shatters into thousands of fragments on
  loose-separation.

Conclusion: bake and edit on the **Figurement-optimized GLB**. The STEP is fine; the conversion
is the problem.

---

## 10. Assets, renders, turntables

- **Turntable GIFs and still renders** come from VNTANA (named after the product blobId, e.g.
  `render-0-{blobId}.png`, `turntable-gif-{blobId}.gif`). Store under `renders/<Product>/`.
- Product pages can offer a **3D / Turntable** toggle plus a **thumbnail strip** of stills.
  Clicking a still swaps a hidden `<img>` into the viewer frame (a third "view" alongside the
  iframe and the turntable).
- When you swap an asset's material, the old turntable GIF no longer matches. Regenerate it
  from the new product and swap the file (new blobId name).

---

## 11. Deploy (Railway static site)

- Pure static site. Push to GitHub, Railway auto-deploys.
- **Dual remote**: `origin` pushes to both `dcicero8/vntana-store` and
  `derekcicero-vntana/store-demos`. `company` is `store-demos` directly.
- **Always push after commit** (Railway live site is the test target).
- **Versioned filenames** for re-exports (v2, v3). Re-uploading the same filename to VNTANA
  silently keeps the old geometry.
- **Cache-bust** when verifying (`?v=2`); Railway/browser can serve stale HTML/JS for a bit.
- **Gitignored GIFs**: large render GIFs may be gitignored. `git add -f` them, or they push as
  a fallback and serve `text/html` (the SPA index) instead of `image/gif`.
- macOS blocks this tool from reading `~/Downloads` (TCC). Move files into the repo, or use the
  Blender process (which can read Downloads) to copy them.

---

## 12. Gotchas cheat-sheet

| Symptom | Cause / fix |
|---------|-------------|
| Selection works "sometimes" | `picking` not armed. Set attribute + property, re-assert on `load`. |
| Panel updates, model does not (or vice versa) | node name did not match your `match` regex. Log `viewer.sceneGraph` names; watch spaces vs underscores and instance suffixes. |
| Camera never moves | `config.camera` is a nested JSON string. Parse twice. |
| Explode snaps back / no-op | it is `viewer.explodedStrength` (property), not `viewer.scene.explodedStrength`. |
| Hotspots return 0 | wrong endpoint. Use `/hotspots/search/...`, POST, body `{productUuid,page,size}`. |
| Feature has no distinct part | `ghost:"otherId"` to borrow, or `match:null` for copy + camera only. |
| Wrong part highlights | CAD names do not match geometry. Rename in the model, or relabel the feature to what it actually highlights. |
| AR will not load | draw calls / mesh count, not size. Merge meshes or use the Industrial pipeline. |
| Black bore / hole in render | flipped normals. Recalculate consistent (outside). |
| Waxy plastic in bake | Coat > 0. Set Coat 0, Roughness up. |
| GIF serves as text/html | not committed (gitignored). `git add -f`. |
| 403 from VNTANA API | wrong account. Use the ORGANIZATION_ADMIN identity, not super-admin. |

---

## 13. Worked examples in this repo

- **Impact bed** and **helical inline drive** (`fluent-*.html`): the full Track A pattern.
  Impact bed tree is clean; the helical tree has some scrambled names (documented in §6).
- **Skid-steer / component explorer**: product-switcher plus in-context node explorer.
- **Interactive parts catalog** (`parts.html`): click-to-select with a parts table and renders.
- **Taco 007e** (`taco-007e.html`): embed swap for a re-materialed asset, turntable + still
  gallery. The cast-green material was baked per §8.
