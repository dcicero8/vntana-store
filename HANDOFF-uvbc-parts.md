# UVBC Parts Explorer — Handoff Doc

## What this is

A two-page Roeslein demo built on the VNTANA 3D viewer, deployed as a static site on Railway.

- **System Explorer** (`roeslein-uvbc.html`) — walk-through page with hotspot annotations, camera snap on click, "Shop Replacement Parts" CTA. This page works correctly.
- **Parts Explorer** (`roeslein-uvbc-parts.html`) — click a component in the 3D model → right panel shows a mini PDP with replacement parts, SKUs, real prices, and an "Order Part" link. **This page has a click-detection bug that is NOT yet confirmed working.**

Live site: `https://vntana-store-production.up.railway.app`
Repo: `github.com/dcicero8/vntana-store` (auto-deploys from `main`)
Local path: `/Users/derekcicero/Documents/Claude/Code Projects/vntana-store/`

---

## The 3D Asset

- **Asset name:** UVBC UV Curing System
- **Product UUID:** `657f3fe0-1188-4988-8d02-122750504c86`
- **Org:** `DCicero` / UUID `49a01b09-ee65-4fc5-8777-433d7b5b5b29`
- **Workspace:** `n8n-work` / UUID `b577b1c8-80bd-4dab-b1b1-b22f9de4671a`
- **API base:** `https://api.vntana.com`
- **Asset is Live Public** — no auth needed to load the model
- **VNTANA Platform API auth:** Always use `dcicero8@gmail.com`. Never use `derek.cicero@vntana.com` (super-admin causes 403s).

---

## Viewer Setup (both pages)

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@vntana/viewer/dist/bundle.js"></script>
<vntana-viewer id="viewer" shadow-intensity="0.25" shadow-radius="3" loading="eager">
  ...buttons...
</vntana-viewer>

<script type="module">
  const viewer = document.getElementById("viewer");
  const BASE_URL  = "https://api.vntana.com";
  const UUID      = "657f3fe0-1188-4988-8d02-122750504c86";
  const ORG       = "DCicero";
  const WORKSPACE = "n8n-work";

  // Fetch product and set src
  const product = await fetch(
    `${BASE_URL}/products/${UUID}/organizations/${ORG}/clients/${WORKSPACE}`
  ).then(r => r.json());
  const blobId = product.response.asset.models[0].modelBlobId;
  viewer.src = `${BASE_URL}/assets/products/${UUID}/organizations/${ORG}/clients/${WORKSPACE}/${blobId}`;
</script>
```

---

## Click Detection — CRITICAL CONTEXT

This has been the hardest part. Here is everything known:

### What works on `parts.html` (the die-head demo, confirmed working)

```javascript
// Attach to viewer.selection.highlight "change" event
// value === 0 means SELECTED (counterintuitive — 0 = selected, not falsy = selected)
const attachSelectionListener = () => {
  if (!viewer.selection?.highlight?.addEventListener) return false;
  viewer.selection.highlight.addEventListener("change", (event) => {
    event.changes.forEach((value, node) => {
      if (value !== 0) return; // skip — value 0 = selected, anything else = deselect
      handlePartName(node); // walk node.parent chain to find a match
    });
  });
  return true;
};
if (!attachSelectionListener()) {
  viewer.addEventListener("load", attachSelectionListener, { once: true });
}
```

### What the current `roeslein-uvbc-parts.html` uses

The same pattern above is now in the file. It has NOT been confirmed working by the user yet as of this handoff. The click detection went through several broken iterations:

1. **Broken attempt 1:** RAF + iterating `viewer.selection.highlight` as a Map, checking `if (!val) continue` — this skipped value=0 which IS the selected state, so nothing ever fired.
2. **Broken attempt 2:** Background channel (hover tracking) + click — overcomplicated and unproven for this asset.
3. **Current attempt:** `highlight.addEventListener("change")` with `if (value !== 0) return` — this is the correct pattern from `parts.js`. Needs user confirmation.

### Key facts about the VNTANA selection API
- `viewer.selection.highlight` is a Map-like object that fires `"change"` events on click
- `event.changes` is a Map: `forEach((value, node) => ...)` — note the order is `(value, node)` not `(node, value)`
- `value === 0` means the node was just selected
- `value !== 0` means deselected — skip these
- Walk `node.parent` up the tree to find a named assembly match
- `viewer.selection` may be null until model loads — always check `?.` and fall back to `viewer.addEventListener("load", ...)`

---

## Scene Graph → Assembly Mapping

The 3D model's scene graph node names map to assembly keys as follows. These are the EXACT names you need to match (after stripping count suffixes like ` (2)` and `.001` suffixes):

```javascript
const NODE_MAP = {
  "VTU RH 36in Single Lamp":                                         "vtu",
  "RP001-092-15-2009":                                               "lamp",
  "RP001-092-04-1003":                                               "coating",
  "36 RH DD Bottom Coater":                                          "coating",
  "116-423 SQAF270-4-CWUB-160_2":                                   "blower",
  "AB 194E-FA Electrical Disconnect_DS-MA001 - Vacuum Blower":       "disc_blower",
  "AB 194E-FA16 Electrical Disconnect_DS-MA003 - Vacuum Conveyor":   "disc_conveyor",
  "AB 194E-FA16 Electrical Disconnect_DS-MA005 - Applicator Roller": "disc_applicator",
  "AB 194E-FA16 Electrical Disconnect_DS-MA006 - Day Tank Mixer":    "disc_daytank",
  "AB 194E-FA16 Electrical Disconnect_DS-MA015 - Lacquer Pump":      "disc_lacquer",
  "ESPB01 - 8017.685 Estop Pushbutton Station":                      "estop",
  "AB 440N-Z21SS2H, Guard Switch, Base_GS-01 - Lamp Front":         "guard",
  "AB 440N-Z21SS2H, Guard Switch, Base_GS-02 - Roller Front":       "guard",
  "AB 440N-Z21SS2H, Guard Switch, Base_GS-03 - Lamp Rear":          "guard",
  "AB 440N-Z21SS2H, Guard Switch, Base_GS-04 - Can Entrance":       "guard",
  "AB 44N-Z21SS2H, Guard Switch, Actuator":                         "guard",
  "SICK WL9-3P2432 Photoelectric Sensor with BEF-WN-W9-2 B_74579a9": "sensor",
  "SICK WL9-3P2432 Photoelectric Sensor with BEF-WN-W9-2 B_5b5eeeb": "sensor",
  "SICK WL9-3P2432 Photoelectric Sensor with BEF-WN-W9-2 B_53d1321": "sensor",
  "SICK WL9-3P2432 Photoelectric Sensor with BEF-WN-W9-2 B_d283af2": "sensor",
  "SICK PL80A Photoelectric Sensor Reflector":                       "sensor",
  "SICK WL9-3P2432 Photoelectric Sensor":                           "sensor",
  "UVBC03 - 8017.545, Machine Mounted Junction Box":                 "jbox",
};

// Normalize node names before lookup
const normalize = t => t?.replace(/\s*\(\d+\)\s*$/, "").replace(/\.\d{3}$/, "").trim() ?? "";

// Some assembly keys roll up to a broader filter category
const ASM_TO_FILTER = {
  vtu: "vtu", lamp: "lamp", coating: "coating", blower: "blower",
  disc_blower: "electrical", disc_conveyor: "electrical",
  disc_applicator: "electrical", disc_daytank: "electrical", disc_lacquer: "electrical",
  estop: "safety", guard: "safety", sensor: "safety", jbox: "electrical",
};
```

**Note:** The chiller is NOT in NODE_MAP — there is no chiller assembly visible as a distinct clickable node in this model. Chiller parts are in the PARTS array but can only be accessed if a chiller node is found or via a manual UI element.

---

## Parts Data

61 parts across 7 categories. Each part has `{ sku, name, desc, filter: [array of keys] }`.

**Categories and part counts:**
- `lamp` — 12 parts (UV lamp, power supply, cables, radiometer instruments)
- `coating` — 14 parts (rollers, scrapers, valves, pump, hand wheels, hose)
- `vtu` — 3 parts (bearing, screw jack, universal joint)
- `blower` — 2 parts (drive belts)
- `chiller` — 13 parts (all Pfannenberg chiller spares)
- `electrical` — 7 parts (disconnects, solenoid valves, cables, filters, sensors)
- `safety` — 4 parts (440N guard switches, photo eye sensor, bracket, air flow switch)

All prices are real — sourced from `parts.roeslein.com` (logged-in view, July 2026). Full price list in `UVBC_Part_Mapping_v2.xlsx` in Downloads.

**Price lookup map (all 61 SKUs with known prices):**
```javascript
const PRICES = {
  "500-0003042":"$21,987.73","500-0003029":"$11,188.24","500-0000616":"$1,448.62",
  "500-0000982":"$1,098.55", "500-0003075":"$848.75",   "500-0002121":"$1,049.38",
  "500-0004569":"$12,922.58","500-0002249":"$3,325.67", "200-0006477":"$6,392.95",
  "800-0000153":"$499.00",   "800-0000152":"$410.30",   "800-0000151":"$319.93",
  "800-0000117":"$9,185.17", "800-0000010":"$6,632.99", "800-0000012":"$11,252.25",
  "800-0000013":"$8,388.34", "800-0000023":"$320.06",   "800-0000049":"$590.12",
  "800-0000104":"$106.69",   "020-009409": "$0.00",     "200-0000764":"$157.21",
  "200-0006562":"$94.04",    "200-0000096":"$90.43",    "200-0004781":"$346.89",
  "070-128518": "$0.00",     "400-0000050":"$100.69",   "800-0000050":"$953.36",
  "800-0000093":"$486.76",   "100-0000103":"$538.36",   "800-0000120":"$658.47",
  "400-0000036":"$32.82",    "800-0000033":"$426.75",   "800-0000212":"$2,307.13",
  "800-0000213":"$2,070.41", "800-0000214":"$238.38",   "800-0000215":"$415.08",
  "800-0000216":"$351.74",   "800-0000217":"$581.78",   "800-0000218":"$355.07",
  "800-0000219":"$1,631.99", "800-0000220":"$3,944.12", "800-0000221":"$220.04",
  "800-0000222":"$1,295.26", "800-0000223":"$453.42",   "800-0000224":"$3,737.41",
  "500-0003828":"$1,993.73", "500-0004384":"$201.71",   "500-0005384":"$0.00",
  "500-0005298":"$325.07",   "500-0002634":"$645.13",   "500-0005291":"$241.72",
  "500-0005292":"$220.26",   "200-0006452":"$502.43",   "500-0000227":"$583.45",
  "500-0002525":"$21.67",    "070-128531": "$0.00",     "500-0002622":"$646.30",
  "500-0003967":"$222.41",   "500-0003449":"$0.00",     "500-0003278":"$0.00",
  "500-0002631":"$468.21",
};
```
SKUs with `$0.00` mean the price shows as $0.00 on the Roeslein site — show "Contact for pricing" instead.

---

## Current Page Layout (`roeslein-uvbc-parts.html`)

Two-column CSS grid: `1fr 460px`

**Left:** Sticky 3D viewer (dark blue background, VNTANA viewer element)
**Right:** Parts panel with two states:
1. **Idle** (`#pdp-default`) — centered "Click any component" prompt
2. **Active** (`#pdp-active`) — shows after a click:
   - Assembly name + description header
   - "← All assemblies" back link
   - Scrollable list of part cards, each showing: SKU, name, description, price, "Order Part" button (links to `parts.roeslein.com/d-i-canmaking-parts/roeslein-associates/uvbc/`)

---

## What Still Needs to be Verified / Fixed

1. **Click detection on Railway** — the `highlight.addEventListener("change")` pattern was pushed in the last commit (`689d4c7` then overridden by `cbb96ad`) but was NOT confirmed working by the user. If clicking still does nothing, the next debugging step is to open browser devtools on the live page, add a console.log inside `attachSelectionListener` to confirm it fires and that `viewer.selection?.highlight` is not null after model load.

2. **Chiller has no clickable 3D node** — there is no Pfannenberg chiller visible as a distinct assembly in this model's scene graph. Chiller parts are orphaned. Options: (a) add a UI button for chiller spares, or (b) accept that chiller parts aren't reachable via 3D click and only show them in a full catalog view.

3. **"Order Part" link** — currently all parts link to the UVBC category page on `parts.roeslein.com`. Individual deep links per SKU would be better if Roeslein's site supports them.

---

## Reference: Working Example (parts.html)

`parts.html` + `parts.js` is the die-head demo at `/parts.html` — confirmed working. It uses:
- Same `highlight.addEventListener("change")` pattern
- `event.changes.forEach((value, node) => { if (value !== 0) return; ... })`
- Walks `node.parent` to find scene graph match
- Right panel shows a single-part PDP (name, SKU, price, description, availability, add-to-cart)

The UVBC parts page goal is the same UX pattern but where one click = one assembly = a list of multiple replacement parts (because the 3D nodes are assemblies, not individual SKUs).

---

## Deployment

- Static site on Railway, auto-deploys from `github.com/dcicero8/vntana-store` `main` branch
- No build step — pure HTML/CSS/JS
- `git push` → Railway picks it up in ~60 seconds
