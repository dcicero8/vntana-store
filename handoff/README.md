# Hexion Home Product Explorer — web team handoff

A VNTANA 3D viewer with clickable hotspots and an Exterior/Interior switch.
Everything needed is in **`hexion-home-explorer.html`** (markup + CSS + JS, one file,
no build step, no framework).

## What you need (three things)

1. **The VNTANA viewer** — one dependency. The file loads it from the CDN:
   ```html
   <script type="module" src="https://cdn.jsdelivr.net/npm/@vntana/viewer/dist/bundle.js"></script>
   ```
   Or via npm: `npm i @vntana/viewer` then `import '@vntana/viewer';`

2. **Config** — the `CONFIG` object at the top of the `<script>`: API base, org/workspace
   slugs, and the Exterior/Interior product UUIDs. Edit these to point at other assets.
   ```js
   const CONFIG = {
     apiBase: "https://api.vntana.com",
     org: "hexion",
     workspace: "demo-room",
     views: {
       exterior: "39f54c5d-6a80-4337-b974-c5e0d2dcc8da",
       interior: "b86d5716-d564-481b-bea3-5e7aa0446449",
     },
   };
   ```

3. **The custom code** — the `<style>` block and the module `<script>` in the file. That
   is the hotspot / card / switcher layer that sits on top of the viewer.

## Embedding in your page

- Drop the `<div class="hx-explorer"> … </div>` where you want it.
- Include the viewer `<script>` once, plus the `<style>` block and the module `<script>`.
- The explorer fills its container; set `.hx-explorer { height }` to size it (defaults to `100vh`).
- All styles are scoped under `.hx-explorer`, so they won't touch the rest of your site.

## Notes

- All VNTANA calls are **read-only and unauthenticated** (the assets are public). No API
  keys or tokens are required.
- Hotspots (position, camera, image, copy) are authored in the VNTANA platform and pulled
  at runtime — no hotspot data is hard-coded here. Add/edit hotspots in VNTANA and they
  appear automatically.
- Card placement is automatic: it opens beside the pin, flips to the other side or drops
  below/above the pin when space is tight, and always stays within the viewport.
- Tested standalone with no external stylesheet; renders with zero console errors.
