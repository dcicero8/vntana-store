# wilbert-configurator

A Lit custom element that renders a single Wilbert burial vault in a VNTANA viewer and exposes
its configurable parts as attributes. The GLB URL is baked into the bundle — there is no product
catalogue or SKU lookup, and no way to point it at a different model.

Ships as `build/` plus this README. `build/index.js` is the entry point; `build/index.d.ts` has
the types. The other `.js` file beside it is a lazily imported chunk — keep the directory intact.

## Install

```sh
npm install ./wilbert-demo-<version>.tgz
```

No npm dependencies. Lit, three and `@vntana-internal/vntana-viewer-module` 3.0.0 are all bundled
into `build/index.js`, so nothing else needs installing. It does need the colour textures served
alongside the page, though — see [Textures](#textures).

`@vntana-internal/vntana-viewer-module` is **not on npm** — it ships separately as a tarball. You
only need to install it if your own code imports the viewer module directly:

```sh
npm install ./vntana-viewer-module-3.0.0.tgz
```

Note that doing so puts a *second* copy of the viewer and of three on the page. The bundled copy
is what `<wilbert-configurator>` uses; your instance will not share state with it.

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
| `base-color` | `baseColor` | `white`, `navy`, `black` | `white` | Body colour — swaps the `Base_Concrete` and `Cover_Concrete` maps |
| `accent-color` | `accentColor` | `silver`, `pink` | `silver` | Accent colour — swaps the `Base_Accent` and `Cover_Accent` maps |
| `cover` | `cover` | image URL | *(empty)* | Base texture for the `Cover_Print` mesh |
| `cover-fit` | `coverFit` | `fill`, `contain`, `cover` | `fill` | How the cover image is fitted, like CSS `object-fit` |
| `emblem` | `emblem` | image URL | *(empty)* | Base texture for the `Emblem` mesh |
| `emblem-fit` | `emblemFit` | `fill`, `contain`, `cover` | `fill` | Same, for the emblem |
| `texture-root` | `textureRoot` | URL or path | `textures` | Where the colour textures live — see [Textures](#textures) |

Anything unrecognised falls back to the default. Image URLs can be `blob:` object URLs from a
file input; revoke the old one yourself after swapping.

Base and accent are independent: all six pairings are valid, including combinations no source
asset was authored for.

No events and no public methods — drive it entirely through the attributes.

## Textures

`base-color` and `accent-color` work by swapping base-colour maps at runtime, so eight image
files have to be served. They are **not** part of the npm package — `files` only covers `build/`.
Copy the `textures/` directory to wherever the page is hosted:

```
textures/black-body-base.jpg    textures/silver-accent-base.png
textures/black-body-cover.jpg   textures/silver-accent-cover.png
textures/navy-body-base.jpg     textures/pink-accent-base.png
textures/navy-body-cover.jpg    textures/pink-accent-cover.png
```

The filenames are fixed — the component builds each URL as `<texture-root>/<name>`.

`texture-root` defaults to `textures`, **relative**, so it resolves against the embedding page.
A page at `/wilbert-demo/v1.0/index.html` finds them at `/wilbert-demo/v1.0/textures/`. Set the
attribute to an absolute URL or a different path if they live elsewhere:

```html
<wilbert-configurator texture-root="https://demo.vntana.com/wilbert-demo/v1.0/textures">
</wilbert-configurator>
```

A leading slash makes it origin-relative and will look under the domain root — usually not what
you want. `texture-root` is read when the scene loads, so set it up front; changing it later does
not re-fetch.

There is no `white` body texture and no set for a fourth colour, because **white is the model's
own state**. The GLB at `MODEL_URL` already carries the white maps, so `base-color="white"` loads
nothing and restores the maps captured at load. Adding a colour means adding files here *and* an
entry in `BODY_TEXTURES` / `ACCENT_TEXTURES`.

## Behaviour worth knowing

**Decal meshes hide when their image is empty**, because the material would otherwise draw as a
blank quad. Visibility follows the *loaded texture*, not the property string, so a URL that fails
to load also leaves the mesh hidden. The one exception is `Cover_Print` under a non-white base,
which stays visible to show the metallic finish; it then draws with `depthWrite` off and a lower
`renderOrder` than `Emblem`, so it acts as a backdrop rather than occluding the emblem on top.

**Non-white bases also change three materials' shading.** `Cover_Print`, `Plastic` and
`Plastice_Liner` take the metallic finish (`color`, `metalness`, `roughness`) that the navy and
black source assets author; white restores the values captured at load. `Cover_Print` is exempt
whenever it carries a cover image — a print is never metallic. This is a parameter change, not a
texture swap, so no files are involved.

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

**Changing a fit does not reload the scene.** `lid-position`, `base-color`, `accent-color`,
`cover` and `emblem` trigger `$loadScene`; a fit change writes the texture matrix directly and
requests a render. This matters because a reload with unchanged URLs never invokes the assemble
callback, so routing fit through it would silently do nothing.

**Camera is preserved across reloads.** Target, distance, rotation and field of view are stashed
at the start of each assemble after the first, and restored on the viewer's `updates-loaded`
event. The first load still frames the model.

Missing meshes and unusable UVs are reported with `console.warn` and degrade rather than throw.
