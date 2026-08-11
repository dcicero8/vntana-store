# Context: VNTANA Showroom Maker Automations

## What this is
Sierra at Patagonia provides a list of style numbers in store order. The goal:
1. Get the right assets into a VNTANA Showroom
2. Group them by style, sorted alphabetically by color code within each style
3. Keep that showroom up to date as assets are added/changed

Sierra uses **Office 365 only** (no Google Drive, no n8n access). Derek runs the automation on her behalf.

There are now two parallel paths for doing this, described below. They are not competing, they solve different problems.

---

## VNTANA Credentials & IDs

| Field | Value |
|-------|-------|
| Org slug | `DCicero` |
| Org UUID | `49a01b09-ee65-4fc5-8777-433d7b5b5b29` |
| Workspace (Patagonia) | `n8n-work` |
| Workspace UUID | `b577b1c8-80bd-4dab-b1b1-b22f9de4671a` |
| API account | `dcicero8@gmail.com` / `OriolesMagic72!!!` |
| Platform API base | `https://api-platform.vntana.com` |

**CRITICAL**: Never use `derek.cicero@vntana.com` — it's a SUPER_ADMIN with undocumented restrictions that cause 403s on many endpoints. Always use `dcicero8@gmail.com`.

**CRITICAL**: The permanent "Authentication Key" in VNTANA Profile UI is for CLO/Browseware plugins ONLY — it does NOT work for REST API calls. Must login with email + password.

---

## VNTANA Platform API Auth Flow

```
POST https://api-platform.vntana.com/v1/auth/login
Body: {"email":"dcicero8@gmail.com","password":"OriolesMagic72!!!"}
→ Grab token from response HEADER: X-AUTH-TOKEN

POST https://api-platform.vntana.com/v1/auth/refresh-token
Headers: X-AUTH-TOKEN: Bearer <token_from_above>
         organizationUuid: 49a01b09-ee65-4fc5-8777-433d7b5b5b29
→ Grab org-scoped token from response HEADER: X-AUTH-TOKEN

All subsequent calls:
Headers: X-AUTH-TOKEN: Bearer <org_scoped_token>
```

---

## Showrooms API — Confirmed Working

Full reference: `guides/showrooms/api-showrooms.md` in the [vntana-api-docs](https://github.com/VNTANA-3D/vntana-api-docs) repo. The public help docs don't cover this; the GitHub repo does.

```
POST https://api-platform.vntana.com/v2/showrooms/get-by-uuid
Body: {"uuid": "showroom-uuid"}
→ Returns full showroom data including products, attributes, and (under response.viewInfo.groups)
  the current group titles/order/dividers.
```

```
PUT https://api-platform.vntana.com/v1/showrooms
Body: {
  "uuid": "showroom-uuid",
  "name": "Showroom Name",
  "productsUuids": ["asset-uuid-1", "asset-uuid-2", ...],
  "groups": [
    {
      "title": "Group Title",
      "dividers": ["TOP"],
      "visible": true,
      "productsInfo": [
        {"productUuid": "asset-uuid-1", "visible": true, "order": 1},
        {"productUuid": "asset-uuid-2", "visible": true, "order": 2}
      ]
    }
  ]
}
```

**IMPORTANT**: `PUT` replaces the entire showroom. Any asset not included in `productsUuids`/`groups` gets removed. Always fetch first, then include everything.

There is **no v1 GET `/v1/showrooms/{uuid}`** endpoint (a stale reference to it existed in an old n8n node and just 404s). Use `v2/showrooms/get-by-uuid` to read.

---

## Product Search API — Confirmed Working

```
POST https://api-platform.vntana.com/v1/products/clients/search?clientUuid=b577b1c8-80bd-4dab-b1b1-b22f9de4671a
Headers: X-AUTH-TOKEN: Bearer <org_token>
Body: {
  "organizationUuid": "49a01b09-ee65-4fc5-8777-433d7b5b5b29",
  "searchTerm": "52199",
  "page": 1,
  "size": 50,
  "sorts": {"UPDATED": "DESC"}
}
```

- `page` is **1-indexed** (page 0 returns INVALID_PAGE error)
- To pull ALL assets at once: omit `searchTerm`, use `size: 200`
- There are ~88 Patagonia assets in the workspace
- Style number is a prefix: `52199` matches `52199_SALB.glb`, `52199_DYWH.glb`, etc.
- Color code is the suffix after `_` in the asset name

---

## The Rules (confirmed)

Grouping and ordering is driven entirely by two things on each asset:

1. **`Style` attribute** — a custom attribute added directly on each asset (e.g. `"M's SST Wading Jkt"`). This becomes the group title. No separate style-number-to-name mapping file is needed; the display name lives on the asset itself.
2. **Asset name convention** — `<style>_<color>.<ext>` (e.g. `52199_DYWH.glb`). The suffix after `_` is the color code.

Sort logic:
- Groups are ordered alphabetically by `Style` attribute value (not by style number, not by upload order). This was confirmed as correct even though an earlier hand-built reference showroom had a non-alphabetical "hero color first" order — that was a manual mistake, not the intended rule.
- Within a group, assets are sorted alphabetically by color code.

Validation rules the structured workflow now enforces (fails loudly instead of guessing):
- Every asset in the showroom must have a non-empty `Style` attribute.
- Every asset name must match the `<style>_<color>.ext` pattern.
- No two assets in the same `Style` group may share the same color code (ambiguous order).

---

## Path 1 — Structured (rules-based, no spreadsheet)

**Use this when assets are already tagged correctly.** No human decides group/order, the rules above do.

**n8n Workflow**: `gIXbKD5aSNY2lHok` — "VNTANA Showroom Export — UUID List"
**Webhook**: `POST https://vntana.app.n8n.cloud/webhook/vntana-showroom-export`
**Body**: `{"showroomUuid": "<uuid>"}` — or the native VNTANA `showroom.asset.added` event payload (`{"showroom": {"uuid": "..."}}`), both are accepted.

### Node chain
`Webhook → Extract UUID → Get Showroom (v2/get-by-uuid) → Compute Groups (rules + validation) → Update Showroom (PUT, in place) → Build Report → Encode File → Respond`

### What it does
1. Fetches the showroom by UUID
2. Validates every asset has a `Style` attribute and a valid `<style>_<color>.ext` name
3. Groups by `Style`, sorts each group alphabetically by color code
4. `PUT`s the reorganized groups back to **the same showroom** (updates in place, does not create a new one)
5. Returns a CSV receipt (Asset UUID, Asset Name, Group, Order) as the webhook response — this is an output record, not a required input

### Trigger (proof of concept, not yet wired up)
VNTANA supports a `showroom.asset.added` webhook event ("Showroom Asset Added" in the UI) whose payload includes `showroom.uuid`. There is **no way to scope a VNTANA webhook to one specific showroom** — only to a workspace via "Select Workspaces". To pilot auto-reorganize-on-asset-add:

| Field | Value |
|-------|-------|
| Name | `Showroom Structured Reorganize (POC)` |
| URL | `https://vntana.app.n8n.cloud/webhook/vntana-showroom-export` |
| Select Workspaces | Scope to the Patagonia workspace(s) only — leaving blank fires org-wide across every customer's showrooms |
| Events | `Showroom Asset Added` only |

**Caveat**: confirmed via `GET /v1/webhooks/events/` that VNTANA has no "batch done" or general showroom-updated event — only per-item events (`showroom.asset.added`, `showroom.asset.removed`, `showroom.order.placed`, `showroom.order.item.added`, `showroom.user.added`). Adding 5 assets fires this webhook 5 times, each re-running the full reorganize. Harmless since the workflow is idempotent, but redundant. See the feature request below.

**Gotcha discovered**: the `Style` attribute lives on the **asset**, not on a showroom's inclusion of it. If the same asset UUIDs are shared across multiple showrooms (e.g. a test showroom and a "real" one), running this workflow against one will produce the same grouping logic for any showroom containing those assets — there's no isolation between showrooms that share assets.

### Known example
Showroom `6f4e4e8d-62b2-4ad0-a5f3-2cd3db4b796d` ("Patagonia Test") was fixed live using this workflow:
- Group "M's L/S Seersucker Shirt" (style 41795): CVMI, SSBG, WVAL
- Group "M's L/S ULW Stretch Shirt" (style 52199): DYWH, MCSG, PKGR, SALB
- Group "M's SST Wading Jkt" (style 81867): BSNG, NGRY

---

## Path 2 — Unstructured (spreadsheet-driven, full manual control)

**Use this for one-off/custom layouts** the rules can't express, or when styling (colors, dividers, per-asset visibility) needs a human decision.

**n8n Workflow**: `VNHQ8hHxcejkhzck` — "VNTANA Showroom Maker — Excel Trigger"
**Trigger**: Publishing the dedicated **"Trigger Asset"** (in the `showroom-maker` workspace's Asset Library) to **Live Internal** status. This fires the VNTANA webhook "Show Room Maker" → `https://vntana.app.n8n.cloud/webhook/vntana-showroom-maker`.

### How it works
1. Publishing the Trigger Asset fires the webhook
2. Workflow finds the **latest `.xlsx`** in Google Drive folder `1dH_9ztHhg97nigv8XV_FEm5hPY0eIsZn`
3. Reads three sheets:
   - **Assets**: Asset UUID, Asset Name, Group, Order
   - **Groups**: Group Title, Divider Top, Divider Bottom, Visible
   - **Styling**: Field, Value (Background Color, Text Color, Divider Color, Products Per Row, Image Style, Showroom Name)
4. Builds the showroom payload and **creates a brand-new showroom** every run (`POST /v1/showrooms`, not an update)

### Manual n8n steps required after every API push
n8n Cloud does not persist credential assignments or "Options" values (like Sheet Name) when workflows are pushed via the API — these must be reset by hand in the n8n UI after every deploy:
1. **Find Latest Excel** → credential: `Google Drive Account Derek`
2. **Download Excel** → credential: `Google Drive Account Derek`
3. **Download Excel** → File ID field: `={{ $json.id }}`
4. **Read Assets** → Options → Sheet Name: `Assets`
5. **Read Groups** → Options → Sheet Name: `Groups`
6. **Read Styling** → Options → Sheet Name: `Styling`
7. **Create Showroom** → credential: `VNTANA account 3`
8. Click **Publish** after saving all nodes.

---

## Retired / Abandoned Approaches

- **Power Automate (Office 365)**: Got as far as reading style numbers and searching VNTANA products via HTTP nodes. Abandoned before ever writing output. Nested "Apply to each" loops for building the output table were confusing and error-prone compared to n8n's Code nodes, which let the same logic be plain JavaScript. No live Power Automate flow exists today.
- **Standalone Python script**: Was considered as a simpler alternative to Power Automate, never built. Superseded by the structured n8n path once the `Style` attribute + rules approach was confirmed to work.
- **Style-order TXT / manual style search per style number** (workflow `qWBwmcdXffGma8X8`): Searched VNTANA per style number from a `.txt` file and sorted by color code, output an XLSX to Drive. Superseded by the structured path, which reads Style directly from asset attributes instead of requiring a separate input file. Left in place but not the recommended path going forward.

---

## n8n Access — API Deployment

**Instance**: `https://vntana.app.n8n.cloud`  
**API key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhOTIwMWE2My1iYWVjLTQ1OWEtYWMzYi0xMDYyNGYxMDNmMjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOGJiYzI0M2YtNTczMy00YTEyLWFjMGEtOTAwNTY2MTBmNzFkIiwiaWF0IjoxNzgyMTcyMzc0LCJleHAiOjE3OTg3MDQwMDB9.XfkejQPguVSDiOVTsUi_5aof1rxRvNbcoBwx1hnU30E`

**Always deploy workflows via n8n API** — never ask Derek to import JSON manually.

```bash
# Update an existing workflow
curl -X PUT https://vntana.app.n8n.cloud/api/v1/workflows/{WORKFLOW_ID} \
  -H "X-N8N-API-KEY: <api_key>" \
  -H "Content-Type: application/json" \
  -d @workflow.json
```

### All Workflow IDs
| Workflow | ID |
|----------|-----|
| Showroom Maker (Excel Trigger) | `VNHQ8hHxcejkhzck` |
| Showroom Export / Structured Reorganize | `gIXbKD5aSNY2lHok` |
| Showroom Maker (Style Order TXT) | `qWBwmcdXffGma8X8` |
| Populate Google Sheet | `NnO4Kg9t5jP7iflY` |
| Submit from Google Sheet | `NIBo3Zbd0gx1W1rT` |

---

## Things That Would Make This Easier

Feature requests for the VNTANA platform itself (not something we can build in n8n):

1. **A `showroom.updated` / batch-complete webhook event (does not exist today — new event, not a workaround).** Confirmed via `GET /v1/webhooks/events/` that the only showroom events are per-item: `showroom.asset.added`, `showroom.asset.removed`, `showroom.order.placed`, `showroom.order.item.added`, `showroom.user.added`. The real workflow is "add a batch of assets, then organize once" — a single event that fires once after a showroom's contents settle (rather than once per asset) would let the structured path run automatically without redundant back-to-back reorganize calls.
2. **Showroom-scoped webhooks.** VNTANA webhook config only scopes by workspace, not by individual showroom. The event payload does carry `showroom.uuid` so the workflow can still act correctly, but there's no way to restrict a webhook to firing for just one showroom. Showroom-level scoping would remove the cross-showroom side-effect risk described above.
3. **Attribute enforcement at upload time.** `Style` is a manually-added, unenforced attribute. If VNTANA supported required-attribute rules per workspace, bad data would get caught at asset-upload time instead of at showroom-reorganize time.
4. **Dry-run mode.** No way to preview what the structured workflow would do without actually calling `PUT`. A dry-run flag would make it safer to test against unfamiliar showrooms.
5. **Explicit style order support.** Groups currently sort alphabetically by `Style` title. If Sierra's real store order isn't alphabetical, we'd need a `StyleOrder`-style attribute or a lookup table to override it.

Until #1 exists, the practical workaround is the same pattern the unstructured path already uses: add assets first, then explicitly trigger the reorganize (publish a trigger asset, or call the webhook directly with the `showroomUuid`) instead of firing on every single `asset.added` event.

---

## Notes / Gotchas

- **403 errors** always mean wrong account (`derek.cicero@vntana.com`) or using permanent Auth Key instead of login flow. Switch to `dcicero8@gmail.com` + email/password login.
- **Attachment search returns 403** for `dcicero8@gmail.com` — plan restriction on current n8n plan. Not needed for showroom maker.
- **VNTANA pagination**: always use `page: 1` (1-indexed). `page: 0` → `INVALID_PAGE` error.
- **All 88 assets in one call**: `POST /v1/products/clients/search` with no `searchTerm` and `size: 200` returns all assets. More efficient than searching per-style.
- Sierra's assets are in workspace `n8n-work` (UUID `b577b1c8...`). Query parameter is `clientUuid` in the URL, not in the body.
- n8n API pushes require `settings` to be exactly `{"executionOrder": "v1"}` — extra keys like `binaryMode` get rejected with `request/body/settings must NOT have additional properties`.
