# VNTANA Viewer
[![npm version](https://img.shields.io/npm/v/@vntana/viewer.svg)](https://www.npmjs.com/package/@vntana/viewer)
[![license](https://img.shields.io/badge/license-commercial-red)](LICENSE)

`@vntana/viewer` is a package for rendering interactive 3D models and launching Augmented
Reality experiences in the browser. It provides a `<vntana-viewer>` custom HTML element
built on [three.js](https://threejs.org) that loads glTF/GLB models directly - no plugins
required.

The 3D experience can be customized with physically-based lighting, screen-space ambient
occlusion (SSAO), screen-space reflections, and configurable tone mapping. The viewer
supports native AR on iOS and Android, WebXR on headsets including Meta Quest, Apple
Vision Pro, and other WebXR-compatible devices, and QR-based AR sharing for desktop users.

Additional UI components (fullscreen, AR button, QR overlay, measurements,
and more) are available as composable custom elements. As a standard custom HTML element,
`<vntana-viewer>` can be placed, styled, and scripted like any native HTML element, and
integrates with any web framework or plain HTML page.

Use cases:
* Ecommerce product pages with interactive 3D and AR visualization
* 3D asset management through VNTANA Platform
* Digital showrooms
* Manufacturing and engineering asset visualization
* Interactive parts manuals and service documentation
* Parts ordering and spare parts catalogs

You can learn more at 
[vntana.com](https://www.vntana.com/solutions/enterprise-3d-web-viewer/) 
and see examples at 
[VNTANA-3D/viewer-demo](https://github.com/VNTANA-3D/viewer-demo).


**Table of Contents**

- [License](#license)
- [Getting Started](#getting-started)
- [Exports](#exports)
- [Properties and Attributes](#properties-and-attributes)
- [API](#api)
  - [Loading](#loading)
  - [Scene](#scene)
  - [Camera Controls](#camera-controls)
  - [Rendering](#rendering)
  - [Lighting](#lighting)
  - [Jewelry](#jewelry)
  - [Augmented Reality](#augmented-reality)
  - [Utility](#utility)
- [Hotspots](#hotspots)
- [UI Elements](#ui-elements)
  - [Fullscreen Button](#fullscreen-button)
  - [Center Button](#center-button)
  - [Zoom Buttons](#zoom-buttons)
  - [QR Button](#qr-button)
  - [QR Overlay](#qr-overlay)
  - [AR Button](#ar-button)
  - [AR Overlay](#ar-overlay)
  - [Scene Graph](#scene-graph)
  - [Scene Graph Button](#scene-graph-button)
  - [Exploded View](#exploded-view)
  - [Measurements](#measurements)
  - [Measurements Button](#measurements-button)
  - [Dimensions Button](#dimensions-button)
  - [Info Button](#info-button)
  - [Info Overlay](#info-overlay)
- [Accessibility](#accessibility)



## License

This software requires a commercial license for any commercial use. 
See [LICENSE](LICENSE) for details.
To purchase a commercial license, visit https://vntana.com or contact info@vntana.com.

## Getting Started
Install the package through `npm`:
```
npm install @vntana/viewer
```
Adding
```
import '@vntana/viewer'
```
into your JS file will load all the web components in the package. The viewer
can then be used as a regular HTML element once the JS file is loaded:
```
<body>
  <vntana-viewer src="DamagedHelmet.glb" environment-src="Neutral.hdr"></vntana-viewer>
</body>
```
For smaller bundles, use submodules:
```
import '@vntana/viewer/core'            // <vntana-viewer> element
import '@vntana/viewer/ui/fs-button'    // <vntana-fs-button> element
```

Bundled code is available through [UNPKG](https://unpkg.com) or [jsDelivr](https://jsdelivr.com) 
as `bundle.js` (ESM), `bundle.cjs` (CJS) or `bundle.umd.js` (UMD).
```
<body>
  <script src="https://cdn.jsdelivr.net/npm/@vntana/viewer/dist/bundle.umd.js"></script>
  <vntana-viewer src="DamagedHelmet.glb" environment-src="Neutral.hdr"></vntana-viewer>
</body>
```

## Exports
The package exports the following submodules:
```
./
./core
./hotspot
./ui
./ui/fs-button
./ui/qr-button
./ui/qr-overlay
./ui/ar-button
./ui/ar-overlay
./ui/center-button
./ui/zoom-buttons
./ui/scene-graph-button
./ui/scene-graph
./ui/exploded-view
./ui/measurements-button
./ui/measurements
./ui/dimensions-button
./ui/info-button
./ui/info-overlay
./styles/viewer.css
```
Importing from a directory path (e.g. `@vntana/viewer/ui`) automatically loads all submodules
in its subtree.
All file paths support both ES modules (`.js`) and CommonJS (`.cjs`) formats. 
TypeScript declarations (`.d.ts`) are available for all submodules.


## Properties and Attributes

As all web components, `<vntana-viewer>` can be manipulated through properties and attributes.
Properties can be set in a standard way:

```
<vntana-viewer src="DamagedHelmet.glb" environment-src="Neutral.hdr"></vntana-viewer>

<script>
  const viewer = document.querySelector("vntana-viewer");
  viewer.shadowIntensity = 0.3;
  viewer.enableAutoRotate = true;
</script>
```

For a comprehensive list of all properties, see [API](#api). 

Each property has an associated type, a default value, and the domain of values it accepts. All properties are
initially set to `null`, which indicates the default value is used. Setting the property value to `null` can generally
be used to reset its value to the default value.  If the property is set to an invalid or out-of-range value, 
its value will be set to `null`.


Most of the property types fall into one of the following categories:
- **strings** 
- **booleans** 
- **colors** Strings with six-digit hex color codes. Example: `"#aabbcc"`.
- **options**  String from a predefined set of available options.
- **numbers** Accepts numbers and strings, where strings will be automatically converted to numbers. 
- **angles** Strings containing number-unit pairs. Available units are radians (`"rad"`, default) and
degrees (`"deg"`). If a number is passed, it will be converted to string of the form `"<number>rad"`. Example: `"20deg"`.
- **rotations** Triplets of angle values specifying Euler angles around X, Y, and Z axes. 
Rotations are applied in the YXZ order. Example: `"20deg 2rad -10deg"`.
- **offsets** Strings containing number-unit pairs. Available units are:
    * meters (`m`, default),
    * centimeters (`cm`),
    * millimeters (`mm`),
    * radius (`r`),
    * width (`w`),
    * height (`h`),
    * depth (`d`).
    <!-- keep paragraph from merging -->
    Width, height, and depth refer to dimensions of model's bounding box, while radius is the radius
    of model's bounding sphere centered at the center of model's bounding box. If model's dimensions
    change (e.g. through `scale` or `rotation` properties), offsets with relative units (`r`, `w`, `h`, `d`)
    will be internally updated.
- **positions** Triplets of offset values. Example: `"20m 3r 40h"`.

All attributes are passed as strings, only exception being boolean attributes whose presence or
absence indicate whether the value is true or false. For example, to set shadow intensity to `0.3` 
and enable auto-rotation of the camera, we would use:
```
<vntana-viewer shadow-intensity="0.3" enable-auto-rotate></vntana-viewer>
```

To reset the attribute value to the default value, the user can either remove the attribute
or set the attribute's value to `"auto"`. Attribute values are automatically reflected in property values, but the converse doesn't hold -
changing property values won’t change the attributes. For example, when we set `shadow-intensity` to `0.3`, 
the viewer’s `shadowIntensity` property will be set to `0.3`, but if we set `shadowIntensity` to `0.3`, the
`shadow-intensity` attribute won't change.

## API

### Loading
Properties and events governing when and how the model and environment load, and the
poster image shown while loading.

#### Properties

##### src
A URL to a glTF or glB model to load in the web viewer.
```
auto: ""
```
##### environmentSrc (environment-src)
A URL to the HDR file containing the equirectangular environment map.
```
auto: ""
```
##### loading
The loading strategy used for loading the model and setting up the scene. 
`"eager"` starts loading as soon as possible, `"lazy"` when the element is near the viewport, `"click"`
when the element is clicked, and `"hover"` when the pointer enters the element.
```
Accepted Values: lazy, eager, click, hover
auto: lazy
```
##### poster
A URL to a poster image to be displayed while the model is loading.
```
auto: ""
```

#### Events

##### progress
Dispatched as loading progresses. `event.detail` has `progress` (a value from 0 to 1) and
`source` (`"model"` or `"environment"`).

##### load
Dispatched when model load is complete. During the next animation frame the poster will be removed 
 and the model will become visible. Model's loading time in milliseconds can be obtained through `event.detail.time`.

##### error
Dispatched when an error is encountered during load. `event.detail.type` describes what failed.

##### environment-change
Dispatched when the environment map finishes loading and is applied. `event.detail.src` is
the loaded environment URL.

### Scene
Properties, methods, and events for the loaded scene content: its transform, exploded
view, and interactive per-object selection effects.

#### Properties

##### scale
Scene's scaling factors in X, Y, and Z directions.
```
auto: "1 1 1"
```
##### rotation
Euler angles specifying rotation of the scene around X, Y and Z axes. Rotations are applied
 in YXZ order, that is, the scene is first rotated around Z axis, then X, then Y.
```
Accepted Values: (-Infinity, Infinity) (-Infinity, Infinity) (-Infinity, Infinity)
auto: "0deg 0deg 0deg"
```
##### explodedStrength (exploded-strength)
Separation between the model's components, from fully assembled (`0`) to fully separated
(`1`). Disabled for animated models. Changes are animated; use `jumpExplodedStrength()` to apply
a value instantly.
```
Accepted Values: [0, 1]
auto: 0
```
##### picking
Enables pointer-driven object picking. When enabled, hovering over and clicking scene
objects dispatches the `object-hover` and `object-select` events.

##### outlineColor (outline-color)
Color of the outline drawn around objects with the `outline` effect.
```
auto: "#9ca9fc"
```
##### outlineWidth (outline-width)
Width, in pixels, of the outline drawn around objects with the `outline` effect. Accepted
values are integers in the specified range.
```
Accepted Values: [1, 20]
auto: 3
```
##### highlightColor (highlight-color)
Color applied to objects with the `highlight` effect.
```
auto: "#6975bf"
```
##### glowColor (glow-color)
Color of the glow applied to objects with the `glow` effect.
```
auto: "#6975bf"
```
##### glowIntensity (glow-intensity)
Intensity of the glow applied to objects with the `glow` effect.
```
Accepted Values: [0, Infinity)
auto: 0.6
```
##### dimColor (dim-color)
Color overlaid on objects with the `dim` effect.
```
auto: "#7A7A7A"
```
##### dimOpacity (dim-opacity)
Opacity of the overlay applied to objects with the `dim` effect.
```
Accepted Values: [0, 1]
auto: 0.2
```

#### Methods

##### sceneGraph
Getter returning the root of the scene graph as a tree of nodes, each shaped
`{name, uuid, type, parent, children}`, where `type` is one of `"object"`, `"mesh"`,
`"primitive"`, `"light"`, or `"camera"`. The glTF scene wrapper level is skipped. 

##### setEffect(uuid, ...effects)
Applies one or more selection effects to the node with the given `uuid`. Each effect is one
of `"outline"`, `"highlight"`, `"glow"`, or `"dim"`. `"dim"` is mutually exclusive with the
other effects. Returns `false` if no node matches the uuid, `true` otherwise.

##### removeEffect(uuid, ...effects)
Removes the given effects from the node with the given `uuid`. Returns `false` if no node
matches the uuid, `true` otherwise.

##### clearEffect(effect)
Removes the given effect from every object it is applied to.

##### focusNodes(uuids)
Frames the camera on the combined bounding box of the nodes identified by `uuids` (an
iterable of uuid strings).

##### getExplodedStrength()
Returns the current exploded strength.

##### setExplodedStrength(value)
Animates the exploded strength towards `value`. Has no effect if the model doesn't support
explosion.

##### jumpExplodedStrength()
Immediately applies the target exploded strength without animating.

#### Events

##### object-hover
Dispatched while `picking` is enabled and the pointer moves over the model. `event.detail`
contains the originating `originalEvent` (a `PointerEvent`) and an `intersections` array of
`{uuid, name, distance}` entries.

##### object-select
Dispatched while `picking` is enabled and the model is clicked. `event.detail` has the same
shape as `object-hover`.

### Camera Controls
Attributes to control the camera. Includes the ability to restrict certain camera movements, disable
 some or all camera controls entirely, and generally change various camera settings such as the camera type itself. 
 Camera settings such as `cameraRotation` and `fieldOfView` are the initial values used when the model loads, not
 the current values when interacting with the camera.

#### Properties

##### disableZoom (disable-zoom)
Disables camera zoom through pointer events.

##### disablePan (disable-pan)
Disables camera panning through pointer events.

##### disableRotation (disable-rotation)
Disables camera rotation through pointer events.

##### disableControls (disable-controls)
Disables camera controls in general.

##### rotationSensitivity (rotation-sensitivity)
Sensitivity of camera rotation changes on user interaction.
```
Accepted Values: (-Infinity, Infinity)
auto: 1.5
```

##### panSensitivity (pan-sensitivity)
Sensitivity of camera pan changes on user interaction.
```
Accepted Values: (-Infinity, Infinity)
auto: 1
```

##### zoomSensitivity (zoom-sensitivity)
Sensitivity of camera zoom changes on user interaction.
```
Accepted Values: (-Infinity, Infinity)
auto: 1
```
##### enableAutoRotate (enable-auto-rotate)
Enables automatic rotation of camera. Use `autoRotateSpeed` and `autoRotateDelay` to control
 the visual.

##### autoRotateSpeed (auto-rotate-speed)
Angle traversed in one second of auto-rotate mode.
```
Accepted Values: (-Infinity, Infinity)
auto: "15deg"
```
##### autoRotateDelay (auto-rotate-delay)
Number of seconds without user interaction after which the auto-rotating starts.
```
Accepted Values: [0, Infinity)
auto: 5
```
##### minFieldOfView (min-field-of-view)
The minimum value (degrees or radians) the Field of View will be clamped to. Only for Perspective Camera
```
Accepted Values: [0deg, 180deg]
auto: "18deg"
```
##### maxFieldOfView (max-field-of-view)
The maximum value (degrees or radians) the Field of View will be clamped to. Only for Perspective Camera
```
Accepted Values: [0deg, 180deg]
auto: "45deg"
```
##### fieldOfView (field-of-view)
Vertical field of view. Determines how much of the scene is visible in the camera's view. While distance remains the same, 
 changing field of view will result in larger/smaller objects in the scene as more or less area becomes visible. Used as is for Perspective camera.
```
Accepted Values: [0deg, 180deg]
auto: "45deg"
```
##### minCameraDistance (min-camera-distance)
The minimum distance to clamp the camera to.
```
Accepted Values: [0m, Infinity)
auto: "2r"
```
##### maxCameraDistance (max-camera-distance)
The maximum distance to clamp the camera to. Default is calculated as a scaling factor of radius using the default
 field of view (`45deg`). 
```
Accepted Values: [0m, Infinity)
```

##### cameraDistance (camera-distance)
Distance to the target from the camera. Default is calculated as a scaling factor of radius using the default
 field of view (`45deg`). 
```
Accepted Values: [0m, Infinity)
```
##### minOrthographicSize (min-orthographic-size)
The minimum value the Orthographic camera frustum can have. Default is calculated 
 using default minimum FoV and default minimum `cameraDistance`, in meters.
```
Accepted Values: [0m, Infinity)
```

##### maxOrthographicSize (max-orthographic-size)
The maximum value the Orthographic camera frustum can have. Default is calculated 
 using default FoV and default `cameraDistance`, in meters. 
```
Accepted Values: [0m, Infinity)
```

##### orthographicSize (orthographic-size)
Size of the camera frustum for Orthographic Camera. A smaller value makes the model appear
 bigger or closer to the camera. Default calculated based on default `fieldOfView` and `cameraDistance`, in meters. 
```
Accepted Values: [0m, Infinity)
```

##### minCameraRotation (min-camera-rotation)
Clamps minimum rotation angles for pitch, yaw, roll. 
Each rotation angle has its own domain defining allowable values, however `roll` cannot be set and must be `0<units>`.
```
Accepted Values: [-90deg, 90deg] (-Infinity, Infinity) [0 0]
auto: "-90deg -Infinity 0deg"
```
##### maxCameraRotation (max-camera-rotation)
Clamps maximum rotation angles for pitch, yaw, roll. 
 Each rotation angle has its own domain defining allowable values, however `roll` cannot be set and must be `0<units>`.
```
Accepted Values: [-90deg, 90deg] (-Infinity, Infinity) [0 0]
auto: "90deg +Infinity 0deg"
```
##### cameraRotation (camera-rotation)
The initial Euler angles of the camera upon load. Value is a string representing the three rotations to make: rotation
 about the X axis (pitch), rotation about the Y axis (yaw), and rotation about the Z axis (roll). At this time, roll cannot be set to a custom
 value and must be set to `0deg` or `0rad`.
 Units are in degrees or radians. Default "-15deg 0deg 0deg". Each rotation angle has its own `domain` defining allowable values. 
```
Accepted Values: [-90deg, 90deg] (-Infinity, Infinity) [0 0]
auto: "-15deg 0deg 0deg"
```
##### Example
```
// Script
 const viewer = document.querySelector('vntana-viewer');
 viewer.cameraRotation = "0deg 30deg 0deg";
 
 <!-- HTML -->
 <vntana-viewer camera-rotation="0deg 30deg 0deg"></vntana-viewer>
```
##### cameraTarget (camera-target)
Coordinates of the initial point around which the camera rotates. Coordinates are specified
relative to model's bounding box.
```
Accepted Values: (-Infinity, Infinity) (-Infinity, Infinity) (-Infinity, Infinity)
auto: "0m 0m 0m"
```
##### cameraType (camera-type)
Indicates which type of camera to employ: `perspective` (default) or `orthographic`.
```
Accepted Values: perspective, orthographic
auto: perspective
```
##### cameraAspect (camera-aspect)
Aspect ratio based on the current type of camera. Default value is computed so that
model fits the screen from all possible rotation angles, if possible.

```
Accepted Values: [0, Infinity)
```

#### Methods
The camera getters return the current interactive value as a string; the setters apply a
value immediately, independent of the initial-state properties above.

##### getFieldOfView() / setFieldOfView(value)
Gets or sets the current vertical field of view of the perspective camera. When
the orthographic camera is active, `getFieldOfView` returns the field of view that matches the
current orthographic size.

##### getOrthographicSize() / setOrthographicSize(value)
Gets or sets the current orthographic frustum size of the orthographic camera. When
the perspective camera is active, `getOrthographicSize` returns the orthographic size that
matches the current field of view.

##### getCameraDistance() / setCameraDistance(value)
Gets or sets the current distance from the camera to its target.

##### getCameraRotation() / setCameraRotation(value)
Gets or sets the current camera rotation (pitch, yaw, roll).

##### getCameraTarget() / setCameraTarget(value)
Gets or sets the current point the camera orbits around.

##### centerCamera()
Resets the camera to its initial state (`cameraTarget`, `cameraDistance`, `cameraRotation`,
`fieldOfView`, `orthographicSize`). 

##### jumpCamera()
Immediately applies pending camera changes without animating the transition.

#### Events

##### camera-change
Dispatched whenever the camera moves. `event.detail.source` identifies what triggered the
change.

### Rendering
Attributes available to control the scene rendering. Exposes various post-processing effects such as anti-aliasing, 
 SSAO, and tone mapping.

#### Properties

##### exposure
Controls the level of exposure for tone mapping, affecting the perceived brightness of the scene.
```
Accepted Values: [0, Infinity)
auto: 1
```
##### toneMapping (tone-mapping)
Sets the tone mapping type which is used to approximate the appearance of HDR on the LDR medium of 
 a standard computer monitor or mobile device's screen.
```
Accepted Values: none, linear, reinhard, cineon, aces, agx, neutral
auto: aces
```
##### antiAliasing (anti-aliasing)
Sets the method for anti-aliasing to SSAA or MSAA.
```
Accepted Values: ssaa, msaa
auto: ssaa
```
##### msaaSamples (msaa-samples)
The number of samples used for MSAA. Accepted values are integers in the specified range.
```
Accepted Values: [1, 8]
auto: 8
```
##### ssaaSamples (ssaa-samples)
The number of SSAA samples. Accepted values are power-of-two values in the specified range.
```
Accepted Values: (1, 16)
auto: 1
```
##### sharpenStrength (sharpen-strength)
Sets the intensity of the sharpen pass.
```
Accepted Values: [0, 1]
auto: 0
```
##### bloomStrength (bloom-strength)
Sets the intensity of the Bloom pass. This setting produces the effect of bright light on a camera, 
 creating fringes of light extending beyond the borders of a bright area.
```
Accepted Values: [0, Infinity)
auto: 0
```
##### bloomRadius (bloom-radius)
The radius of the Bloom kernel. Larger values produce a wider, softer glow while smaller values will create
 a more concentrated, sharp glow.
```
Accepted Values: [0, 5]
auto: 0
```
##### bloomThreshold (bloom-threshold)
Indicates the brightness threshold a pixel must meet to contribute to the bloom effect.
```
Accepted Values: [0, Infinity)
auto: 0.85
```
##### ssaoStrength (ssao-strength)
Controls the intensity of the shadowing applied to occluded areas. Higher value results in darker occluded areas 
 which may look unnatural if overdone.
```
Accepted Values: [0, 20]
auto: 4
```
##### ssaoRadius (ssao-radius)
Determines how far the occlusion effect spreads.
```
Accepted Values: [0, 3]
auto: 1
```
##### enableSsr (enable-ssr)
Setting this flag will enable screen space reflections.

##### hueShift (hue-shift)
Angle by which hue component of individual pixel colors is rotated.
```
Accepted Values: [0, 360deg]
auto: "0deg"
```
##### saturation
Amount by which pixel colors are super-saturated or desaturated.
```
Accepted Values: [0, Infinity)
auto: 1
```
##### brightness
Applies the linear multiplier to pixel colors.
```
Accepted Values: [-1, 1]
auto: 0
```
##### contrast
Sets the contrast factor of the rendered image.
```
Accepted Values: [0, 2]
auto: 1
```
##### transparencyMode (transparency-mode)
Transparency mode is used when rendering transparent objects. Available options are normal and depth-write.
 If set to depth-write, transparent meshes will use the depth buffer when being rendered. This may improve render quality of transparent
 meshes. Default is normal.
```
Accepted Values: normal, depth-write
auto: normal
```

### Lighting
Controls for Lighting and Shadows in the scene, including the Environment map. Lighting controls
 for both the lights present in the model and custom lighting to add to the scene. The
 environment map itself is loaded through the `environmentSrc` property documented under
 [Loading](#loading).

#### Properties

##### environmentRotation (environment-rotation)
Euler angles specifying environment rotation around X, Y, and Z axes.
Rotations are applied in YXZ order, meaning the model is first rotated around Z axis, then X, then Y.
```
Accepted Values: (-Infinity, Infinity) (-Infinity, Infinity) (-Infinity, Infinity)
auto: "0deg 0deg 0deg"
```
##### skybox
Indicates whether the environment map should be used as the scene's background.

##### shadowIntensity (shadow-intensity)
Intensity of the ground shadow cast by the model.
```
Accepted Values: [0, 1]
auto: 0
```
##### shadowRadius (shadow-radius)
Radius of blur kernel used when rendering shadows.
```
Accepted Values: [0, 20]
auto: 2
```
##### shadowSamples (shadow-samples)
Number of samples used when blurring the shadow. Accepted values are integers in the specified range.
```
Accepted Values: [1, Infinity)
auto: 16
```
##### shadowResolution (shadow-resolution)
The resolution of the shadow map. Default 512, accepts [1,Infinity). 
Accepted values are integers in the specified range.
```
Accepted Values: [1, Infinity)
auto: 512
```
##### shadowOffset (shadow-offset)
Vertical offset of the plane onto which the shadow is cast. Zero shadow offset renders the shadow
in the horizontal plane passing through the base of the model's bounding box. 
 
```
Accepted Values: (-Infinity, Infinity)
auto: 0h
```

##### lightRigIntensity (light-rig-intensity)
Number value scaling the intensity of all light rigs.
```
Accepted Values: [0, Infinity)
auto: 1
```
##### lightRigColor (light-rig-color)
Overrides the color of individual lights in the light rig. Setting the value to `null` indicates
colors shouldn't be overridden.
```
auto: null
```

##### lightRig (light-rig)
Specifies additional lights that will be added to the scene alongside the lights present in 
the model. The list of lights is a `;` separated list of individual light configurations in a single string.
Each light configuration starts with the type of the light (`directional`, `point`, `spot`) followed by
different light properties. Directional lights have properties `intensity`, `color`, `position`, and `direction`,
point lights accept `intensity`, `color`, `position`, and `distance`, while spot lights have `intensity`,
`color`, `position`, `direction`, `distance`, `angle`, and `penumbra`. Example:
 `directional intensity 1 color #ffffff position 0m 0m 0m direction 0m 1m 0m`

##### Example
```
const viewer = document.querySelector('vntana-viewer');
 viewer.lightRig = 
 "
  directional intensity 1 color #ffffff position 0m 0m 0m direction -0.024428939559004506m 0.6049951951138368m 0.7958542836482022m;
  directional intensity 1 color #ffffff position 0m 0m 0m direction 0m 1m 0m;
 "
```
##### hideModelLights (hide-model-lights)
Hides all lights from the loaded model.

### Jewelry
Attributes for use when loading jewelry models.

#### Properties

##### enableJewelry (enable-jewelry)
Enables jewelry rendering mode. Models need to be pre-processed in the VNTANA Platform in order
for them to be augmented by jewelry-specific data structures.

##### gemAntiAliasing (gem-anti-aliasing)
Enables anti-aliasing when rendering gems.

##### gemRayTracingDepth (gem-ray-tracing-depth)
The number of ray tracing steps used when rendering gems. Accepted values are integers in the specified range.
```
Accepted Values: [1, 6]
auto: 4
```

### Augmented Reality
Properties, methods, and events for launching Augmented Reality — native AR on iOS and
Android, and WebXR on headsets.

#### Properties

##### usdzSrc (usdz-src)
A URL to a USDZ model to load in AR on iOS devices. HTML attribute is `usdz-src`.

##### Example
```
// Script
 const viewer = document.querySelector('vntana-viewer');
 viewer.usdzSrc = ./DamagedHelmet.usdz;
 
 --- or ---
 
 <!-- HTML -->
 <vntana-viewer src='' usdz-src='./DamagedHelmet.usdz'></vntana-viewer>
```

##### autoAR (auto-ar)
Determines whether AR should launch once the model loads. Only used if AR is available and ARMode is 
 determined to be `native`. HTML attribute form is `auto-ar`.

##### Example
```
// Script
 const viewer = document.querySelector('vntana-viewer');
 viewer.autoAR = true;
 
 --- or ---
 
 <!-- HTML -->
 <vntana-viewer src='' auto-ar></vntana-viewer>
```

#### Methods

##### startAR()
Launches the AR experience if AR is available — WebXR on headsets, or native AR (Scene
Viewer on Android, Quick Look on iOS) on mobile.

##### stopAR()
Ends the active WebXR AR session.

#### Events

##### enter-ar
Triggered when AR is launched. `event.detail` has `source` and `type` (`"native"` or `"webxr"`).

##### exit-ar
Triggered when returned from AR.

### Utility
Attributes related to the appearance of the viewer. Currently just allows the setting of the background
color.

#### Properties

##### background
Sets the CSS style for the viewer's background. Primarily useful when changing between models 
with different backgrounds, since the update will be applied just before the new model is revealed.
```
auto: "transparent"
```

## Hotspots
`<vntana-hotspot>` element attaches HTML content to a point in the scene. The element moves dynamically
with the scene and the camera, and gets automatically dimmed when occluded by geometry.

```
<vntana-viewer>
 <vntana-hotspot position="0m 0m 0m">Sample Hotspot with text.</vntana-hotspot>
 <vntana-hotspot position="0.1m 0m 0m">Second Hotspot</vntana-hotspot>
</vntana-viewer>
```
#### position
The position in 3D space that the hotspot is placed. Default is '0m 0m 0m'.
#### path
Used for animated models, provides necessary info to keep the hotspot aligned to the correct
point on the mesh throughout the animation. Value is a string consisting of node, primitive, and
vertex indices, followed by barycentric coordinates of the point inside the specified triangle,
and an optional instance index in case of instanced meshes.


## UI Elements
This package provides additional UI elements for enhancing the user experience. 

All UI elements require either a reference to the viewer and/or some target element which
they manipulate. The computed viewer which the element uses is either explicitly set through
the `viewer` property, or otherwise the nearest ancestor viewer is used. The computed target
element is either explicitly specified through the `target` property, and the computed viewer is used
otherwise.

If an element cannot compute the target or viewer it requires, or if it cannot properly function
due to hardware limitations or some other reasons, it will become "context disabled". In this
case it will have the `context-disabled` attribute set, which by default hides the element.

For example, the fullscreen button requires a target element it will toggle. If no target is 
explicitly specified, the button will use its nearest ancestor viewer element. If the
ancestor viewer also doesn't exist, the button will be context disabled, and thus won't be
displayed.


**NOTE**: If placed as children of the viewer, all elements require their position be explicitly set
through CSS in order to be visible. For example:
```
<style>
  vntana-center-button {
    position: absolute;
    top: 19px;
    right: 19px;
    z-index: 1;
  }
</style>
```
Basic style can be found [here](styles/viewer.css).

### Fullscreen Button
`<vntana-fs-button>` element toggles the fullscreen mode of its computed target. The element
is context disabled if
- fullscreen API is not available,
- device is a mobile device, or
- there is no computed target.

<div align="center">

| Property      | Type          | Default   | Description                                       |
| ------------- | ------------- | --------- | ------------------------------------------------- |
| `target`      | HTMLElement   | `null`    | Element controlled by the button                  |
| `active`      | boolean       | `false`   | Present when target element is in fullscreen mode |

</div>

**NOTE**: If transparent background is set on the viewer, viewer's background will be black in
fullscreen mode. It is recommended to set viewer's backdrop background color explicitly through CSS in
that case:
```
vntana-viewer::backdrop {
  background-color: white;
}
```

### Center Button
`<vntana-center-button>` resets the viewer's camera to its initial state determined by
`cameraTarget`, `cameraDistance`, `cameraRotation`, `fieldOfView`, and `orthographicSize`.

<div align="center">

| Property      | Type          | Default   | Description                                       |
| ------------- | ------------- | --------- | ------------------------------------------------- |
| `viewer`      | VntanaViewer  | `null`    | Viewer controlled by the button                   |

</div>

The element is context disabled if there is no computed viewer.

### Zoom Buttons
`<vntana-zoom-in-button>` and `<vntana-zoom-out-button>` change the camera zoom of the
computed viewer. Holding the buttons animates the zoom, allowing a more controlled zoom experience.
The zoom factor is influenced by viewer's `zoom-sensitivity` property. 

<div align="center">

| Property      | Type          | Default   | Description                                       |
| ------------- | ------------- | --------- | ------------------------------------------------- |
| `viewer`      | VntanaViewer  | `null`    | Viewer controlled by the button                   |

</div>

The elements are context disabled if there is no computed viewer.


### QR Button
`<vntana-qr-button>` adds the `<vntana-qr-overlay>` element to the specified target element when
clicked. The overlay contains a modal with the QR code of the specified URL.

| Property      | Type          | Default   | Description                                       |
| ------------- | ------------- | --------- | ------------------------------------------------- |
| `target`      | HTMLElement   | `null`    | Element to which the overlay will be appended     |
| `viewer`      | VntanaViewer  | `null`    | Viewer from which the button reads AR-related data|
| `active`      | boolean       | `false`   | Indicates whether the overlay is shown or not     | 
| `url`         | string        | `""`      | URL encoded in the QR code of the overlay         |

The element is context disabled if
- device is a mobile device or supports native AR,
- computed viewer is specified and either jewelry is enabled or AR support is detected,
- `url` property is not set, or
- there is no computed target.


### QR Overlay
`<vntana-qr-overlay>` element shows a modal with the QR code encoding the provided URL.

| Property      | Type          | Default   | Description                                       |
| ------------- | ------------- | --------- | ------------------------------------------------- |
| `url`         | string        | `""`      | URL encoded in the QR code                        |


### AR Button
`<vntana-ar-button>` element launches the viewer's AR experience when clicked. If the
device is a headset, it adds the `<vntana-ar-overlay>` element to the specified target.
On mobile devices it will launch the native AR experience - the model loaded will be the
one specified by either computed viewer's `src` or `usdzSrc` properties. 
If there is no computed viewer, native AR can still be launched if `src` and/or `usdzSrc` 
properties are set.


| Property      | Type          | Default   | Description                                       |
| ------------- | ------------- | --------- | ------------------------------------------------- |
| `target`      | HTMLElement   | `null`    | Element to which the overlay will be appended     |
| `viewer`      | VntanaViewer  | `null`    | Viewer from which the button reads AR-related data|
| `active`      | boolean       | `false`   | Present when AR overlay is opened on headsets, or immediately before the native AR experience gets launched |
| `src`         | string        | `""`      | URL of the GLB file                               |
| `usdzSrc`     | string        | `""`      | URL of the USDZ file                              |

The element is context disabled if
- computed viewer is specified and AR support is not detected, 
- computed viewer is not specified, and required `src` or `usdz-src` attribute is not set.

### AR Overlay
`<vntana-ar-overlay>` displays the controls guide for the headset WebXR session alongside
the button to start the AR session. When session starts, the button changes to a button to 
exit the session.

| Property      | Type          | Default   | Description                                       |
| ------------- | ------------- | --------- | ------------------------------------------------- |
| `viewer`      | VntanaViewer  | `null`    | Viewer whose WebXR session the overlay launches and monitors |


The element is context disabled if 
- there is no computed viewer, or
- device is not a WebXR-compatible headset.

### Scene Graph

`<vntana-scene-graph>` element displays the tree view of viewer's scene.

| Property      | Type          | Default   | Description                                       |
| ------------- | ------------- | --------- | ------------------------------------------------- |
| `viewer`      | VntanaViewer  | `null`    | Viewer whose scene is displayed in the tree view  |

The element is context disabled if there is no computed viewer.


### Scene Graph Button

`<vntana-scene-graph-button>` toggles the `<vntana-scene-graph>` element. 

| Property      | Type          | Default   | Description                                       |
| ------------- | ------------- | --------- | ------------------------------------------------- |
| `target`      | HTMLElement   | `null`    | Element to which the scene graph element will be appended     |
| `viewer`      | VntanaViewer  | `null`    | Viewer whose scene is displayed in the tree view |
| `active`      | boolean       | `false`   | Indicates whether the element is shown or not     | 

The element is context disabled if
- there is no computed viewer, or
- there is no computed target.


### Exploded View

`<vntana-exploded-view>` element controls the separation between model components. The component
is disabled for animated models.

| Property      | Type          | Default   | Description                                       |
| ------------- | ------------- | --------- | ------------------------------------------------- |
| `viewer`      | VntanaViewer  | `null`    | Viewer whose scene will be separated              |

The element is context disabled if there is no computed viewer.

### Measurements
`<vntana-measurements>` element displays a panel for creating and managing point-to-point
distance measurements on the model's surface. Clicking on the model creates measurement points.
The panel provides controls for selecting the measurement unit and decimal precision, as
well as deleting individual or all measurements.

The element can be used standalone or toggled through `<vntana-measurements-button>`.
Unit and precision settings are shared across all measurement-related components
attached to the same viewer.

| Property      | Type          | Default   | Description                                       |
| ------------- | ------------- | --------- | ------------------------------------------------- |
| `viewer`      | VntanaViewer  | `null`    | Viewer on which measurements are performed        |

The element is context disabled if there is no computed viewer.

### Measurements Button
`<vntana-measurements-button>` toggles the `<vntana-measurements>` element.

| Property      | Type          | Default   | Description                                       |
| ------------- | ------------- | --------- | ------------------------------------------------- |
| `target`      | HTMLElement   | `null`    | Element to which the measurements panel will be appended |
| `viewer`      | VntanaViewer  | `null`    | Viewer on which measurements are performed        |
| `active`      | boolean       | `false`   | Indicates whether the element is shown or not     | 

The element is context disabled if
- there is no computed viewer, or
- there is no computed target.

### Dimensions Button

`<vntana-dimensions-button>` toggles the display of the model's bounding box dimensions
in the viewer. Labeled dimension lines are drawn along the width, height, 
and depth of the model's bounding box, and labels update automatically when the model changes.
Dimension labels share the unit and precision settings with `<vntana-measurements>`.

| Property      | Type          | Default   | Description                                       |
| ------------- | ------------- | --------- | ------------------------------------------------- |
| `viewer`      | VntanaViewer  | `null`    | Viewer whose model dimensions are displayed       |
| `active`      | boolean       | `false`   | Indicates whether the dimensions are shown or not | 

The element is context disabled if there is no computed viewer.

### Info Button

`<vntana-info-button>` adds the `<vntana-info-overlay>` element to the specified target element
when clicked. The overlay shows a guide to the viewer's navigation controls.

| Property      | Type          | Default   | Description                                       |
| ------------- | ------------- | --------- | ------------------------------------------------- |
| `target`      | HTMLElement   | `null`    | Element to which the overlay will be appended     |
| `viewer`      | VntanaViewer  | `null`    | Viewer used to resolve the default target         |
| `active`      | boolean       | `false`   | Indicates whether the overlay is shown or not     | 

This element is never context disabled.

### Info Overlay

`<vntana-info-overlay>` displays a modal guide to the viewer's navigation controls, with
separate tabs for mouse, keyboard, and touch input. It can be used standalone or opened
through `<vntana-info-button>`, and is dismissed by clicking outside the modal or its close
button.

This element has no element-specific properties and is never context disabled.

## Accessibility

The viewer and UI components ship with sensible accessibility defaults. Default values are
only applied when the corresponding attribute wasn't explicitly set, so any explicit `role`,
`aria-label`, or `tabindex` provided always takes precedence.

### Viewer element
When connected, `<vntana-viewer>` sets `role="group"` and an `aria-roledescription`
identifying it as a 3D viewer. Its interactive canvas surface is keyboard-focusable.
Because the viewer has no knowledge of its content, the `aria-label` should be set by
the user.

### UI components
The UI custom elements come instrumented with ARIA roles, states, and keyboard support out of
the box:

- **Buttons** (fullscreen, center, zoom, QR, AR, scene-graph, measurements, dimensions, info)
  expose `role="button"`, are focusable, and activate with `Enter` or `Space`. Toggle buttons
  reflect their state through `aria-pressed` / `aria-expanded`.
- **Overlays** (QR, AR, info) are `role="dialog"` with `aria-modal="true"`, a labelled close
  button, and focus trapping while open. Loading and QR-code states use `aria-busy` and
  `aria-live` regions.
- **Scene graph** implements full tree semantics (`role="tree"` / `"treeitem"` with
  `aria-expanded`, `aria-level`, `aria-setsize`, `aria-posinset`) with roving keyboard focus,
  plus a `listbox` search-results region.
- **Exploded view** is a keyboard-adjustable `group` that reports its current separation
  through `aria-valuetext`.
- **Menus and tab panels** used within components (e.g. unit selection in measurements, device
  tabs in the info overlay) use `combobox` / `listbox` and `tablist` / `tab` / `tabpanel`
  semantics with arrow-key navigation.
- Decorative icons are marked `aria-hidden`, and a visually-hidden `aria-live="polite"`
  announcer surfaces status changes to screen readers.

ARIA labels and other UI text ship as built-in English defaults.
