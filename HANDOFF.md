# VNTANA Store — Session Handoff

**Project**: Pure static site (HTML/CSS/JS) deployed on Railway via `dcicero8/vntana-store`  
**Live URL**: `vntana-store-production.up.railway.app`  
**Owner**: Derek Cicero, `dcicero8@gmail.com` (ORGANIZATION_ADMIN — use this, NOT the vntana.com super-admin)  
**Org slug**: `DCicero` | **Org UUID**: `49a01b09-ee65-4fc5-8777-433d7b5b5b29`

---

## Site Map

| File | Purpose |
|------|---------|
| `index.html` | Root landing — "Derek's Demos" |
| `store.html` | VNTANA 3D Showcase Store |
| `embed.html` | Basic Embed — stroller iframe |
| `variants.html` | Variants — jacket color swatches |
| `product.html` + `product.js` | Custom Viewer — stroller with controls + hotspot tour |
| `parts.html` + `parts.js` | Interactive Parts Catalog — die head assembly |
| `home.html` | Personalized Demo — Hexion Home Product Explorer (client-facing) |
| `s86-demo.html` | Personalized Demo — Bobcat S86-2 multilingual hotspots (client-facing) |
| `hotspot-translations.html` | Internal tool — Bobcat S86 translation preview |
| `personalized-demos.html` | Landing page linking all personalized demos |
| `n8n.html` | n8n integration page with downloadable templates |
| `admin/index.html` | Admin tool — upload xlsx → publish translations |
| `style.css` | All styles |

---

## Products

| Name | UUID | Workspace / Org |
|------|------|----------------|
| VNTANA Full-Zip Jacket | `080a7f32-c744-4cc9-8fb3-a0fa7755c69d` | example-files / DCicero |
| Orbit Stroller | `ca4aebfc-ebc6-4e79-b4e7-8ce4bca4d58d` | example-files / DCicero |
| Die Head 100mm | `7b28ac78-89ca-4bd8-9948-5076439eb496` | figurement / DCicero |
| House w HotSpots (Hexion) | `1d946378-c041-424f-86d0-7ddad134cf6c` | demo-room / hexion |
| Bobcat S86-2 Snowblower | `f047fcd9-eceb-465b-9abd-625efaa99ac2` | n8n-work / DCicero |

---

## Hotspot Translation System (WORKING)

Translations are stored as VNTANA product attributes — one attribute per language:
- `hotspot_translations_fr`
- `hotspot_translations_es`
- `hotspot_translations_de`

Each attribute value is JSON: `{ "hotspot_uuid": { "title": "...", "description": "..." } }`

English is hardcoded in the page (not stored in VNTANA).

### Translation UUIDs for Bobcat S86-2 (`f047fcd9`)
Hotspot API UUIDs → Translation UUIDs (positional mapping):
```
74f59490 → 9f6157ae  (Feature 1)
0aa8f6a7 → 6d4f81d9  (Feature 2)
30ab9f3c → 6fac5a12  (Feature 3)
2c607392 → 02bdfbd9  (Feature 4)
9577a5ee → 2fba9efa  (Feature 5)
```

### Platform API PUT (confirmed working body format)
```
PUT https://api-platform.vntana.com/v1/products
Body: { uuid, name, attributes: [{ name: "hotspot_translations_fr", value: "<json string>" }] }
Auth: X-AUTH-TOKEN header (POST /v1/auth/login first)
```

---

## n8n Workflows

All workflow JSON files are in `admin/`. Import via n8n UI → Workflows → Import.

| File | Webhook path | Status |
|------|-------------|--------|
| `n8n-translation-workflow.json` | `vntana-translations` | **Working** — writes hotspot translations to VNTANA attributes |
| `n8n-attach-file-workflow.json` | `vntana-attach-file` | Built, untested |
| `n8n-sync-attachment-workflow.json` | `vntana-sync-attachment` | Built, untested |
| `n8n-auto-sync-workflow.json` | Schedule (15 min) | Built, untested |
| `n8n-vntana-attributes-from-attachment.json` | Schedule (15 min) | Submitted to n8n template gallery |

**n8n credential**: "VNTANA account 3" — predefined type `vntanaApi`, has email/password/org/workspace/API base. Use `predefinedCredentialType` on HTTP Request nodes (do NOT put email/password in body expressions — n8n blocks that for security).

**n8n API access** (for building workflows via API):
- Workflow IDs: Populate = `NnO4Kg9t5jP7iflY` / `wUL7nN03OoPdKgGK`, Submit = `NIBo3Zbd0gx1W1rT`

---

## Admin Tool (`admin/index.html`)

Three tabs:
1. **Upload and Publish** — drop xlsx → parse FR/ES/DE columns → POST JSON to `vntana-translations` webhook → writes attributes
2. **Attach File to Product** — drop xlsx → POST binary to `vntana-attach-file` webhook
3. **Sync from Attachment** — POST `{productUuid, clientUuid}` to `vntana-sync-attachment` webhook

Spreadsheets:
- `admin/hotspot-translations-template.xlsx` — blank template (EN pre-filled, FR/ES/DE empty)
- `admin/bobcat-translations-completed.xlsx` — all 5 hotspots, FR/ES/DE translated

---

## Viewer Basics

```html
<!-- Load (MUST be type="module") -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@vntana/viewer/dist/bundle.js"></script>

<!-- Embed -->
<vntana-viewer></vntana-viewer>
```

Key JS patterns:
```js
// Apply stored viewer config (environment HDR etc.)
Object.assign(viewer, JSON.parse(product.viewerSettings.config));

// Set model
viewer.src = `https://api.vntana.com/assets/products/${uuid}/organizations/${org}/clients/${workspace}/${blobId}`;

// Camera snap
viewer.setCameraRotation(azimuth, elevation);
viewer.setCameraDistance(distance);
viewer.setCameraTarget(x, y, z);
```

**GLB blob ID**: Always use `asset.models[0].modelBlobId`, NOT `asset.assetBlobId` (assetBlobId may return 0 bytes).

**Hotspot search**: Use `page: 1` (not 0) — `page: 0` returns 500 for n8n-work workspace.

---

## Known Open Issues

1. **`admin/test-put.mjs`** — scratch test script from debugging the PUT body format. Can be deleted.
2. **`variants.html`** — bottom thumbnails disappear on colorway switch. Needs fix when Neven deploys a viewer update.
3. **`parts.html`** — parts picker bug fix pending Neven's viewer update.
4. **Attachment search** — returns 403 for `dcicero8@gmail.com` (plan restriction). The Sync from Attachment workflow is built but can't be fully tested without plan upgrade.
5. **Inbound postMessage to iframe** — open question: does the VNTANA embed support inbound postMessage to update hotspot text? Ask Neven. Would let iframe-only customers get multilingual hotspots without switching to `<vntana-viewer>`.

---

## VNTANA Public API

```
Base: https://api.vntana.com

GET  /products/{uuid}/organizations/{org}/clients/{workspace}
     → product.asset.models[0].modelBlobId  (GLB blob)
     → product.attributes  (array of {key, value})
     → product.viewerSettings.config  (JSON string)

POST /hotspots/search/organizations/{org}/clients/{workspace}
     Body: { productUuid, page: 1, size: 50 }
     → response.grid[].config.dimensions  (JSON: position, normal)
     → response.grid[].config.camera  (JSON)

GET  /assets/products/{uuid}/organizations/{org}/clients/{workspace}/{blobId}
     → GLB binary
```

## VNTANA Platform API (auth required)

```
Base: https://api-platform.vntana.com

POST /v1/auth/login
     Body: { email, password }
     → response.token  (use as X-AUTH-TOKEN header)

PUT  /v1/products
     Body: { uuid, name, attributes: [{name, value}] }

POST /v1/attachments/upload/product-attachment?clientUuid=...&productUuid=...
POST /v1/attachments  (register after upload)
```

---

## Deployment

Auto-deploys from `dcicero8/vntana-store` GitHub repo on push to main.  
After every commit: `git push` immediately — Derek tests on the live Railway URL.
