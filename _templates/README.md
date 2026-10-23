# Client Program Cockpit — reusable template

A gated, branded, **live-3D** client review page: stat tiles, status table, ready-to-spin
embeds, an optional material/spotlight block, received/decisions/questions/next-steps, and
a password gate. This is the generalized version of the Taco weekly review page.

**Live example:** `try.vntana.com/taco-review/` (password `taco2026`).

## Spin up a new client (~10 min)

1. **Copy** `_templates/cockpit-template.html` to `/<client>-review/index.html`
   (a folder gives you a clean URL: `try.vntana.com/<client>-review/`).
2. **Edit only the `CONFIG` block** at the bottom of the file (the `renderCockpit({...})` call).
   Everything above it (styles + render engine) stays untouched.
3. **Put images** (spotlight swatch, reference photos) in `/assets/<client>/` and point the
   `spotlight.image` / `gallery[].src` at `../assets/<client>/<file>` (paths are relative to
   the page, so from `/<client>-review/index.html` that resolves to `/assets/<client>/...`).
4. `git add . && git commit && git push origin HEAD:main` → live on try.vntana.com.
5. Add a row to `/hub/index.html`.

## CONFIG cheat-sheet

| Field | What it does |
|---|---|
| `client`, `partner`, `title`, `subtitle`, `crumbs`, `intro`, `updated` | Header text. |
| `brand.brand` / `brand.brand2` | Accent + header colors (use the client's brand). |
| `gate.password`, `gate.key` | Soft password gate (sessionStorage-remembered). |
| `platform.orgSlug` / `workspaceSlug` | Builds the embed + platform-link URLs. |
| `links[]` | Header buttons (`{label, href, ghost?}`). |
| `checkin.questions[]` | The "is it working?" questions above the embeds. |
| `families[]` | `{id, variants:[{sku, body, conn}]}`. Drives the status table. |
| `built{sku:uuid}` | Any SKU here renders a **live embed** + "Ready". Asset must be **LIVE_PUBLIC**. |
| `approved{sku:1}` | Moves a built SKU into the **Approved** pile (dark-green pill + stat). Locked / confirmed. |
| `approvedPending{sku:1}` | Amber **Approved?** badge (marked approved but not yet confirmed). Stays "Ready for review" until you confirm, then move it to `approved`. |
| `newset{sku:1}` | **NEW** badge. |
| `eta{sku:"Oct 28"}` | Date next to the status pill for un-built items. |
| `famStatus{famId:"next\|wait\|mat\|none"}` | Status for families with no built SKUs. |
| `statusLabels{}` | Override pill text, e.g. `mat:["p-wait","After bronze sign-off"]`. |
| `spotlight{}` | Optional material/hero review block (image + keep/fix/note rows + gallery). Delete to hide. |
| `received[]`, `decisions[]`, `questions[]`, `nextSteps[]` | Data-driven sections. Omit any to hide it. |
| `statusNote` | Heads-up line under the status legend (e.g. Approved-vs-Live-Public). |

Stat tiles and section numbers are **auto-generated** from the data — you don't set them.

## Getting product UUIDs + slugs

- **Quick:** open the asset on `platform.vntana.com/<org>/<ws>/products/details/<UUID>` and copy
  the UUID from the URL. `orgSlug`/`workspaceSlug` are the two path segments after the domain.
- **Bulk (admin API, dcicero8):** you can't list a workspace via search (that endpoint 405s),
  but you can read each product by UUID and list workspaces. Auth with the dcicero8 PAT
  (`~/.config/vntana/dcicero8.key`) via `kohler-usd-poc/tools/vntana_api.py`:
  - List an org's workspaces: `GET /v1/clients/client-organizations` (org token).
  - Read one product: `GET /v1/products/{uuid}` (+ `clientUuid` header) → name, status.
  - Download GLB to QA/render: `/v1/products/{uuid}/download/model?clientUuid={ws}&conversionFormat=GLB`.

**Embeds only load for LIVE_PUBLIC assets.** Publishing to Live Public is UI-gated (one click
on the platform). Until then, a built SKU shows a blank embed card.
