# Part-Swap Configurator — Build Spec (Robot / End-of-Arm Tooling)

*One spec for two threads: the Blender/asset thread and the front-end thread. Goal: make the robot configurator swap **only the end-effector geometry** (not the whole model) so it's fast, matching how YKK's VNTANA configurator works.*

---

## 0. Where the assets live

All component assets live in the **`DCicero / configurators`** workspace:
**https://platform.vntana.com/DCicero/configurators/products/**

- Each swappable part (the **base arm** and **each tool**) is its own VNTANA product in that workspace.
- The app loads each part by its **public model-blob URL** (resolve `productUuid` → GLB `blobId` via the products API, then `…/assets/products/{uuid}/organizations/DCicero/clients/configurators/{blobId}` — exactly how `robot-configurator.html` resolves a product today). **Each part product must be Live Public** or the blob URL 404s.

**Existing products today (the OLD monolithic approach — each is a whole arm+tool combined GLB; being replaced):**
| Config | UUID |
|---|---|
| Bare arm | `59f8d231-7980-447a-a1b2-f00adff8a8d9` |
| Dispensing nozzle (original tool) | `44a8b683-7b9d-4e96-8d78-86b99d283803` |
| Gripper fingers (9495N17) | `c710334e-21e3-46ad-a3ea-6c58d2e8ebcc` |
| Vacuum lifter mount (3136N511) | `d8d2e21b-7e0d-47a6-a927-26d1c9369120` |
| Vacuum lifter kit (3136N512) | `5b843862-c1a0-4472-a06f-2b2cbe7c4d9a` |

We are replacing these five combined products with **one base arm + four tool products** (see Part A).

---

## 1. Why / the reference (how YKK does it)

YKK's VNTANA configurator (`ykk.vntana.com`, v3.5) is fast because the geometry is **split into separate GLBs per swappable part** and composed in-scene:
- `models/base/{size}_{chain}_{classification}.glb` (the base)
- `models/slider/{size}_M_{slider}.glb` (the end piece)

Changing the slider fetches only the small slider GLB and swaps that node — the base stays resident. **Finishes are pure material/texture swaps** (separate PBR maps), no geometry reload. Our current robot configurator reloads the whole combined GLB per config; we're moving to the YKK pattern.

**Good news:** our vendored viewer (`vntana-store/vendor/viewer-test/`) already supports this natively — a built-in **configurator mode** (`$loadScene` + `assemble`). No custom three.js engine needed. Details in Part B.

---

## 2. Sequence / dependencies

1. **Blender thread** produces the split assets (Part A) and uploads each as a Live-Public product in `DCicero/configurators`.
2. **Front-end thread** runs the spike (Part B) — can start immediately against two placeholder GLBs to validate the viewer API, then wire in the real assets once they land.
3. The **mount convention** (Part A §3) is the contract between them: the front-end `assemble` step parents each tool at the base's `ToolMount` node with an identity transform, so tools MUST be authored origin-at-mount-face.

---

## PART A — Blender / asset thread

**You already have the source** (you built the current products): the Sketchfab six-axis arm (welding torch removed) + the McMaster end effectors, currently assembled into the 5 combined products above.

### Deliverables

1. **`robot_base_v1.glb`** — the arm **only** (no tool). Transforms applied, real-world meters, upright, origin bottom-center (RUNBOOK §2). Include a **named empty node `ToolMount`** placed exactly at the wrist-flange mounting face, oriented per the convention below.

2. **One small GLB per end effector, tool-only geometry** (no arm), each with **origin at the mount face**, same orientation convention:
   - `tool_nozzle_v1.glb` (dispensing nozzle)
   - `tool_gripper_v1.glb` (gripper fingers, 9495N17)
   - `tool_vacarm_v1.glb` (vacuum lifter mount, 3136N511)
   - `tool_vackit_v1.glb` (vacuum lifter kit, 3136N512)
   - *(bare arm = no tool GLB; the app mounts nothing)*

3. **Mount convention — identical across all tools (the whole point):**
   - Each tool's **origin = center of the bolt/mount face** (the plane that meets the flange).
   - Pick one axis convention and apply it to every tool **and** to the base's `ToolMount` empty — e.g. **+Z points away from the flange** (the direction the tool extends), **+Y up**. Document your choice.
   - Result: parenting any tool to `ToolMount` at **identity transform** lands it perfectly — no per-tool offset/rotation. Derive the flange pose from where tools currently sit in the combined models so the split versions match today's look.

4. **Consistent units/scale/up-axis** across base and all tools (meters, same up) — no per-tool scaling ever needed.

5. **Config → file manifest** (hand back as JSON):
   ```json
   { "bare": null,
     "nozzle": "tool_nozzle_v1.glb",
     "gripper": "tool_gripper_v1.glb",
     "vacarm": "tool_vacarm_v1.glb",
     "vackit": "tool_vackit_v1.glb" }
   ```
   Plus the product UUID for each uploaded part (base + 4 tools) once they're in `DCicero/configurators`.

6. **Verify in Blender:** append each tool at the `ToolMount` empty in the base scene; confirm it mounts flush, correct axis, no gap/rotation, matching the current combined product. Screenshot each for sign-off.

7. **Upload** base + 4 tools to `DCicero/configurators` and set each **Live Public** (publish is UI-gated).

### Gotchas
- Tool GLBs are **tool-only** (never bake the arm in).
- Keep the mount frame **byte-identical** across all tools.
- Apply all transforms; real-world meters; versioned filenames; follow the asset-prep spec (mesh-per-part, no animations, embedded textures).

### PART A — DELIVERED 2026-08-25 (see `assets/robot/PART-A-DELIVERED.md` + `manifest.json`)
All five part products are Live Public in `DCicero/configurators`: base `be3b39eb` (robot_base_v2.glb) · nozzle `7dd157c3` · gripper `873cd7c4` · vacarm `0ea102da` · vackit `b07a5039`. Convention: origin = flange bolt-face center, **+Z away from the flange**, **+Y up**; all node transforms identity. **Two contract amendments from platform testing:** (1) the platform drops empty nodes, so the base also carries a **`ToolMountMarker`** micro-mesh whose world-space bbox center IS the mount point — use `ToolMount` when present (repo files), else the marker; (2) the platform injects one recenter translation per mesh node (vertices byte-identical) — zero all node TRS on platform-served TOOL scenes before parenting; leave the base untouched. Repo copies in `assets/robot/` have neither issue.

### Optional (finishes)
If tool/base finishes are wanted later, two options: (a) separate PBR map sets per finish (YKK's approach), or (b) a **single GLB with glTF material variants** (`KHR_materials_variants`) switched by name — the viewer supports `Model.setVariant()`. (b) is simpler for a fixed set of finishes.

---

## PART B — Front-end spike thread

**Objective:** prove our vendored `viewer-test` build loads the **arm once** and swaps **only the tool GLB** (arm stays resident), via its built-in configurator mode — then productionize.

### The API (confirmed in our build's type defs — `vendor/viewer-test/dist/*.d.ts`)
```ts
[$configuratorMode]: boolean
[$loadScene](config: { model?: Record<string,string>; texture?: Record<string,string> }, assemble: Assemble): Promise<boolean>
[$preload](config: { model?; texture?; environment? }): Promise<void>
type Assemble = (models: Record<string,Model>, textures: Record<string,THREE.Texture>) => boolean
// Model: { scene: THREE.Object3D; setVariant(v): Promise<void>; animations; dispose(); ... }
```

**Import path (important):** the `<vntana-viewer>` element registers from `dist/index.js` (already loaded by `robot-configurator.html`); the **symbols come from `dist/core.js`**:
```js
import { $configuratorMode, $loadScene, $preload } from './vendor/viewer-test/dist/core.js';
```
Load both from the **same `dist/`** so the three.js chunks are shared (module singletons — otherwise the imported symbol won't match the viewer instance's).

### Spike code (replaces the `viewer.src`-per-config path in `robot-configurator.html`)
```html
<script type="module">
import { $configuratorMode, $loadScene, $preload } from './vendor/viewer-test/dist/core.js';

const viewer = document.getElementById('viewer');
viewer[$configuratorMode] = true;

// resolve each part product -> its public GLB blob URL (same as the app does today),
// or hardcode URLs for the spike:
const ARM = 'assets/robot/robot_base_v1.glb';
const TOOLS = {
  nozzle:  'assets/robot/tool_nozzle_v1.glb',
  gripper: 'assets/robot/tool_gripper_v1.glb',
  vacarm:  'assets/robot/tool_vacarm_v1.glb',
  vackit:  'assets/robot/tool_vackit_v1.glb',
};

// assemble: mount the tool onto the arm's flange node.
// tools are authored origin-at-mount-face, so identity transform lands them.
const assemble = (models, textures) => {
  const arm  = models.arm?.scene;
  const tool = models.tool?.scene;
  if (!arm) return false;
  if (tool) (arm.getObjectByName('ToolMount') || arm).add(tool);
  return true;
};

async function loadTool(id) {
  const model = { arm: ARM };
  if (id && TOOLS[id]) model.tool = TOOLS[id];
  await viewer[$loadScene]({ model }, assemble);
}

viewer[$preload]({ model: TOOLS });   // warm tools for instant swaps
await loadTool('nozzle');
// wire the existing chips to call loadTool(id) / loadTool(null) for bare arm
</script>
```

**Assets for the spike:** needs the Part A split GLBs. To start before they land, fake it — `npx @gltf-transform/cli` split one existing combined product into arm + tool, or use any two GLBs, to validate the mechanics; then swap in the real assets.

### Success criteria — verify and report
1. **Arm stays resident** (the whole point): after the first load, switching tools fetches **only** the new tool GLB; the arm GLB does **not** re-download (check Network — arm fetched once).
2. The composite renders and the **tool sits correctly at the flange** (validates the mount convention).
3. **Camera preserved** across swaps (or re-apply the saved camera on load, like the current `captureCamera` logic).
4. **`$preload` makes swaps instant** on already-warmed tools.

### Unknowns the spike must resolve (report back)
- **Exact `assemble` contract** — does the viewer auto-add the models' `.scene` graphs to its display, or does `assemble` build the shown composite? Log the args, confirm what ends up in the scene, adjust parenting (our pattern parents `tool` under `arm`, so as long as `arm.scene` is displayed we're fine).
- **How `texture` maps bind to materials** — by name, or assigned inside `assemble`? Test one finish.
- **Finishes alt:** compare separate maps vs `Model.setVariant()` (glTF `KHR_materials_variants`) for chain/tool finishes.

### If the spike passes → production
Replace the `viewer.src`-per-config logic in `robot-configurator.html` with the `configuratorMode` + `$loadScene(config, assemble)` flow, driven by the Part A config→file/UUID manifest, keeping:
- the camera-preserve behavior,
- the `?embed` compact mode (used by the IMTS page Section 02),
- the existing chips UI (each chip → `loadTool(id)`).

---

## Repo pointers
- Configurator page: `vntana-store/robot-configurator.html` (loads `vendor/viewer-test/dist/index.js`)
- Viewer build + type defs: `vntana-store/vendor/viewer-test/dist/` (`core.js` = symbols, `*.d.ts` = API)
- Deploy: pushing to `derekcicero-vntana/store-demos` auto-deploys the VNTANA instance (`vntana-store.up.railway.app`, `demo.vntana.com` once DNS lands). All new work ships there.
