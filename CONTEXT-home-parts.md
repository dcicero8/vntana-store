# Context: Hexion Home Explorer & Industrial Parts Catalog

## Repo & deployment
- Repo: `dcicero8/vntana-store` — static site, auto-deployed to Railway
- Live: `https://vntana-store-production.up.railway.app`
- VNTANA public API base: `https://api.vntana.com`
- Viewer script: `<script type="module" src="https://cdn.jsdelivr.net/npm/@vntana/viewer/dist/bundle.js">`
  - **Must be `type="module"`** or the custom element never registers
- Shared styles: `style.css`
- Shared product helpers: `products.js` (exports `BASE_URL`)

---

## 1. Hexion Home Product Explorer — `home.html`

**Live:** https://vntana-store-production.up.railway.app/home.html

### What it is
A client-facing personalized demo for Hexion (building materials). Shows a 3D house model with two views (Exterior / Interior), hotspot tour, and product links. Branded as "Hexion — Building Material Solutions."

### VNTANA assets
| View | UUID | Org | Workspace |
|------|------|-----|-----------|
| Exterior | `39f54c5d-6a80-4337-b974-c5e0d2dcc8da` | `hexion` | `demo-room` |
| Interior | `b86d5716-d564-481b-bea3-5e7aa0446449` | `hexion` | `demo-room` |

Both are **Live Public** — no auth required.

### Architecture
- Single inline `<script type="module">` — no separate JS file
- Two-pane layout: sticky viewer left, scrollable info panel right
- Responsive: stacks vertically on mobile (< 800px)

### View switching
- Exterior/Interior toggle buttons (`data-view` attribute)
- `loadView(viewKey)`: fetches product + hotspots in parallel, applies `viewerSettings.config`, sets `viewer.src`
- Viewer config applied via `Object.assign(viewer, config)` before setting `viewer.src`
- GLB URL: `product.response.asset.models.find(m => m.conversionFormat === "GLB")?.modelBlobId`

### Hotspot system
- Fetched from: `POST https://api.vntana.com/hotspots/search/organizations/hexion/clients/demo-room`
  - Body: `{ productUuid, page: 1, size: 100 }`
- Each hotspot has `config.dimensions` (JSON: `position`, `normal`) and `config.camera` (JSON)
- Hotspot images: `GET /hotspots/images/products/{uuid}/organizations/{org}/clients/{ws}/{blobId}`
- Title/desc parsed from hotspot `description` HTML (bold tag = title, remaining text = desc)
- `<vntana-hotspot>` elements injected into viewer after model `load` event
- Camera snap: `viewer.setCameraRotation/Distance/Target/setFieldOfView/setOrthographicSize`
- Clicking viewer background (not a hotspot) closes all open hotspots

### Guided tour
- "Begin Tour" button → dismisses overlay, shows progress bar + dot indicators + Prev/Pause/Next controls
- Auto-advances every 5 seconds (`TOUR_INTERVAL = 5000`)
- At last exterior stop → automatically switches to Interior view and continues from stop 1
- Prev/Next buttons also trigger view switch at boundary
- Clicking a hotspot card pauses tour, snaps camera to that stop
- Manually clicking a hotspot pin pauses tour

### Sidebar
- Hotspot cards (numbered, with thumbnail image + title + desc)
- Active card highlighted in blue when that stop is open
- "Learn More" links to hexion.com product pages

### Known issues / gotchas
- Hotspots injected on viewer `load` event (`{ once: true }`) — must re-inject on every view switch
- View switch disables both buttons during load, re-enables after model loads
- `closeAll()` removes `.open` class from all `vntana-hotspot.open` elements

---

## 2. Industrial Parts Catalog — `parts.html` + `parts.js`

**Live:** https://vntana-store-production.up.railway.app/parts.html

### What it is
An industry use case demo: 3D interactive parts catalog for a "3-Layer Die Head 110mm Assembly." Click a part in the 3D viewer or scene graph → right panel shows part details, price, availability, render image. Cart functionality (fake).

### VNTANA asset
| Asset | UUID | Org | Workspace |
|-------|------|-----|-----------|
| 3-Layer Die Head 110mm | `7b28ac78-89ca-4bd8-9948-5076439eb496` | `DCicero` | `figurement` |

Live Public — no auth required.

### Architecture
- `parts.html` — layout, viewer embed, static table structure
- `parts.js` — all logic (ES module, `import { BASE_URL } from "./products.js"`)
- Viewer has built-in scene graph button (`<vntana-scene-graph-button active>`) and explode slider

### Parts data
Hardcoded `PARTS_DATA` object in `parts.js` — 13 parts keyed by scene graph node name:
```
Booster, Bolts, Fetzer_Valve, Long_Bolt, Mandrel, Gasket_Head,
Outer_Ring, O-Ring, Core_Winder, Back_Plate, Casing, Back_Housing, Main_Dowel
```
Each part has: `sku`, `price`, `qty`, `avail` (In Stock / Low Stock / Out of Stock), `lead`, `desc`

### Part renders
Figurement-generated renders in `renders/parts/{PartName}.jpg` — one per part. Shown in the detail panel when a part is selected.

### Selection detection
```javascript
viewer.selection.highlight.addEventListener("change", (event) => {
  event.changes.forEach((value, node) => {
    if (value !== 0) return; // 0 = selected
    // Walk up scene graph until PARTS_DATA key found
    let n = node;
    while (n) {
      const name = normalizePartName(n.name ?? "");
      if (PARTS_DATA[name]) { handlePartName(name); return; }
      n = n.parent;
    }
  });
});
```
`normalizePartName` strips count suffixes like ` (27)` from scene graph labels.

**Note:** This uses the `change` event approach (value 0 = selected). The memory file notes that the `rAF + click` approach is more reliable for some assets — if selection breaks, switch to that pattern.

### UI states
- **Default state** (`#part-default`): full parts table with "Add All to Cart" button + hero render image
- **Selected state** (`#part-selected`): part detail panel with render, specs, qty control, Add to Cart
- Clicking "Home" breadcrumb returns to default state

### Explode slider
```javascript
document.getElementById("explode-slider").addEventListener("input", (e) => {
  if (viewer.scene) viewer.scene.explodedStrength = parseFloat(e.target.value);
});
```

### Cart
- Fake cart — `cartCount` variable, flashing cart button in header
- "Add to Cart" adds `qty` items; "Add All Parts" adds sum of all `PARTS_DATA[x].qty`
- Out-of-stock parts: Add button disabled in table + detail panel

### Viewer init
```javascript
const product = await fetch(`${BASE_URL}/products/${UUID}/organizations/${ORG}/clients/${WORKSPACE}`).then(r => r.json());
Object.assign(viewer, JSON.parse(product.response.viewerSettings.config));
viewer.enableAutoRotate = false;
viewer.src = glbUrl;
viewer.usdzSrc = usdzUrl; // AR
viewer.poster = "renders/3-Layer Die Head 110mm Assembly_2560x1440.png";
```

---

## Critical patterns (apply to both pages)

### Viewer config
Always apply stored config via `Object.assign(viewer, config)` BEFORE setting `viewer.src`. Config contains environment HDR, camera, lighting settings.

### GLB URL construction
```javascript
const glb = models.find(m => (m.conversionFormat ?? m.type) === "GLB");
const url = `${BASE_URL}/assets/products/${UUID}/organizations/${ORG}/clients/${WS}/${glb.modelBlobId}`;
```
Use `modelBlobId` (converted), NOT `assetBlobId` (original upload — may return 0 bytes).

### Hotspot page parameter
Always `page: 1` (not 0) in hotspot search body — `page: 0` returns 500 for some workspaces.

### Camera snap
```javascript
viewer.setCameraRotation(cam.cameraRotation);
viewer.setCameraDistance(cam.cameraDistance);
viewer.setCameraTarget(cam.cameraTarget);
viewer.setFieldOfView(cam.fieldOfView);
viewer.setOrthographicSize(cam.orthographicSize);
```
Wrap in try/catch — not all properties are set on every hotspot.
