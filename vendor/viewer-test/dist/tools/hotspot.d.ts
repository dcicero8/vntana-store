import { V as VntanaViewer, A as ARInterface, U as UtilityInterface, C as ControlsInterface, J as JewelryInterface, R as RenderingInterface, L as LightingInterface, e as SceneInterface } from '../chunks/viewer.d-1j1utJ0k.js';
import { VntanaHotspot } from '../hotspot.js';
import '../ui/fs-button.js';
import '../ui/qr-button.js';
import '../ui/qr-overlay.js';
import '../ui/ar-button.js';
import '../ui/ar-overlay.js';
import '../ui/center-button.js';
import '../ui/zoom-buttons.js';
import '../ui/scene-graph-button.js';
import '../ui/scene-graph.js';
import '../ui/measurements-button.js';
import '../ui/measurements.js';
import '../ui/dimensions-button.js';
import '../chunks/info-button.d-B0hhXGl9.js';
import { f as LoadingInterface, V as VntanaViewerBase } from '../chunks/LoadingMixin.d-D0oMeIyc.js';
import 'lit';
import '../chunks/symbols.d-IEgx_IXZ.js';
import 'lit-html';
import '../chunks/element-base.d-_Iw6cs4i.js';
import 'three';
import '../chunks/model.d-BSoSL4IS.js';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/qr-button-base.d-Bk4_ZuHv.js';
import '../chunks/overlay.d-DIu6C-yn.js';
import '../chunks/ar-button-base.d-Bi1ac2dp.js';
import '../chunks/window-element.d-Be8OhkGI.js';

type CameraView = {
    cameraTarget: string;
    cameraRotation: string;
    cameraDistance: string;
    fieldOfView: string;
    orthographicSize: string;
};
declare class HotspotTransition {
    #private;
    constructor(viewer: VntanaViewer);
    get viewer(): ARInterface & UtilityInterface & ControlsInterface & JewelryInterface & RenderingInterface & LightingInterface & SceneInterface & LoadingInterface & VntanaViewerBase;
    start(cameraView?: CameraView, explodedStrength?: number): void;
    stop(): void;
    dispose(): void;
}

type HotspotAttributes = {
    "position": string;
    "normal": string;
    "path"?: string;
};
declare function interactiveClick(container?: HTMLElement): Promise<MouseEvent>;
declare function getHotspotAttributesFromClick(viewer: VntanaViewer): Promise<HotspotAttributes | undefined>;
declare function createHotspotFromClick(viewer: VntanaViewer): Promise<{
    hotspot: VntanaHotspot;
    attributes: HotspotAttributes;
} | undefined>;

export { HotspotTransition, createHotspotFromClick, getHotspotAttributesFromClick, interactiveClick };
export type { HotspotAttributes };
