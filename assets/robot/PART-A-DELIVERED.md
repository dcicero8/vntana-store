# Part A delivered (2026-08-25) — read with manifest.json

Files in this folder + products in `DCicero/configurators` (UUIDs in `manifest.json`).

**Mount convention:** origin = center of the flange bolt face; **+Z = away from the
flange** (the direction the tool extends); **+Y = up**. Base `ToolMount` empty has
identity rotation at the flange point. Everything real-world meters, every node
transform identity — the mount frame lives in vertex data.

**Verified in Blender:** each tool parented to `ToolMount` at identity lands flush,
matching the old combined products (screenshots: session scratchpad robot/parts/verify_*.png).

## Two platform behaviors the front end MUST handle
(verified empirically against Convert Only conversions; repo-served files in this
folder have NEITHER issue — the spike can use plain `ToolMount` parenting)

1. **The platform drops mesh-less (empty) nodes.** The platform-served base has NO
   `ToolMount` node. The base therefore also carries **`ToolMountMarker`**: a 0.6mm
   triangle whose **world-space bounding-box center IS the mount point** (verified:
   decodes to the authored mount exactly, and it inherits the same uniform recenter
   shift as the arm meshes, so a world-space Box3 lookup is always correct).
   Rule: use `getObjectByName('ToolMount')` if present, else
   `new THREE.Box3().setFromObject(scene.getObjectByName('ToolMountMarker')).getCenter(v)`
   and parent tools to a group placed at `v`.

2. **The platform injects one recenter translation per mesh node** (vertex data is
   preserved byte-identical — verified). Tools are authored all-identity, so for
   platform-served TOOL scenes zero every node's position/rotation/scale before
   parenting. Do NOT strip the base — its shift is uniform and harmless.

## Publish status
All five part products are DRAFT until Derek clicks Live Public (UI-gated):
base `be3b39eb` · nozzle `7dd157c3` · gripper `873cd7c4` · vacarm `0ea102da` · vackit `b07a5039`.
Until then, platform blob URLs 404 — build against the repo files in this folder.
