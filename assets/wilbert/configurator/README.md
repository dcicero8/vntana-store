# wilbert-configurator

A Lit custom element that renders a single Wilbert burial vault in a VNTANA viewer and exposes
its configurable parts as attributes. The GLB URL is baked into the bundle — there is no product
catalogue or SKU lookup, and no way to point it at a different model.

Ships as `build/` plus this README. `build/index.js` is the entry point; `build/index.d.ts` has
the types. The other `.js` file beside it is a lazily imported chunk — keep the directory intact.

## Install

`@vntana-internal/vntana-viewer-module` is **not on npm**. It ships separately as a tarball and
must be installed before anything else, or `npm install` will fail to resolve it:

```sh
npm install ./vntana-viewer-module-<version>.tgz
npm install ./wilbert-demo-<version>.tgz
```

## Usage

```html
<wilbert-configurator lid-position="off" cover-fit="contain"></wilbert-configurator>
```

```ts
import "wilbert-demo";        // side-effect: registers <wilbert-configurator>

const configurator = document.querySelector("wilbert-configurator")!;
configurator.lidPosition = "on";
configurator.cover = URL.createObjectURL(file);
configurator.coverFit = "contain";
```

The host is `display: block` and fills its parent — give it a sized container or it collapses.

## Attributes

| Attribute | Property | Values | Default | Effect |
| --- | --- | --- | --- | --- |
| `lid-position` | `lidPosition` | `on`, `off` | `off` | `on` seats the lid on the vault; `off` shows it displaced as authored |
| `cover` | `cover` | image URL | *(empty)* | Base texture for the `Cover_Print` mesh |
| `cover-fit` | `coverFit` | `fill`, `contain`, `cover` | `fill` | How the cover image is fitted, like CSS `object-fit` |
| `emblem` | `emblem` | image URL | *(empty)* | Base texture for the `Emblem` mesh |
| `emblem-fit` | `emblemFit` | `fill`, `contain`, `cover` | `fill` | Same, for the emblem |

Anything unrecognised falls back to the default. Image URLs can be `blob:` object URLs from a
file input; revoke the old one yourself after swapping.

No events and no public methods — drive it entirely through the attributes.

## Behaviour worth knowing

**Decal meshes are hidden when their image is empty.** Both `Cover_Print` and `Emblem` start
invisible, because the material would otherwise draw as a blank quad. Visibility follows the
loaded texture, not the property string, so a URL that fails to load also leaves the mesh hidden.

**Lid meshes are moved, not toggled.** `lid-position="on"` zeroes the local position and
rotation of `3086_CARAPACE_VEN_PLAIN`, `3086_COVER_CONCRETE_VEN_FT`, `3086_COVER_LINER_VEN_FT`,
`Cover_Print`, `Emblem` and `Label`; `off` restores the transforms snapshotted at load. The GLB
authors the lid in its displaced position, so annulling the transforms closes it.

**Mesh names are matched on their base name.** Blender's `.001` dedup suffixes are stripped
before comparing, and a lookup walks into the node's subtree if the name sits on a parent rather
than the primitive.

**Fit is computed from the mesh's UV island, not from `[0,1]²`.** Each decal's UVs are measured
at load (`decalFrame`) — the emblem's island sits at `[1,2] × [0,1]`, not at the origin. The
image is mapped onto that rectangle and scaled about its centre, so it stays centred under every
fit. `contain` letterboxes by sampling outside the island under `ClampToEdgeWrapping`, so the
bands are smeared edge pixels rather than a background colour.

**Changing a fit does not reload the scene.** Only `lid-position`, `cover` and `emblem` trigger
`$loadScene`; a fit change writes the texture matrix directly and requests a render. This matters
because a reload with unchanged URLs never invokes the assemble callback, so routing fit through
it would silently do nothing.

**Camera is preserved across reloads.** Target, distance, rotation and field of view are stashed
at the start of each assemble after the first, and restored on the viewer's `updates-loaded`
event. The first load still frames the model.

Missing meshes and unusable UVs are reported with `console.warn` and degrade rather than throw.
