export { createHotspotFromClick } from './hotspot.js';
import * as THREE from 'three';
export { Analytics } from './analytics.js';
import { V as VntanaViewer } from '../chunks/viewer.d-1j1utJ0k.js';
import { o as InterfaceType } from '../chunks/LoadingMixin.d-D0oMeIyc.js';
import '../hotspot.js';
import 'lit';
import '../chunks/symbols.d-IEgx_IXZ.js';
import '../ui/fs-button.js';
import 'lit-html';
import '../chunks/element-base.d-_Iw6cs4i.js';
import '../chunks/model.d-BSoSL4IS.js';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../ui/qr-button.js';
import '../chunks/qr-button-base.d-Bk4_ZuHv.js';
import '../ui/qr-overlay.js';
import '../chunks/overlay.d-DIu6C-yn.js';
import '../ui/ar-button.js';
import '../chunks/ar-button-base.d-Bi1ac2dp.js';
import '../ui/ar-overlay.js';
import '../ui/center-button.js';
import '../ui/zoom-buttons.js';
import '../ui/scene-graph-button.js';
import '../ui/scene-graph.js';
import '../chunks/window-element.d-Be8OhkGI.js';
import '../ui/measurements-button.js';
import '../ui/measurements.js';
import '../ui/dimensions-button.js';
import '../chunks/info-button.d-B0hhXGl9.js';

type ModelOpsRotation = [number, number, number];
declare function invertEuler(modelOpsRotation: ModelOpsRotation): number[];
declare function combineRotations(modelOpsRotation: ModelOpsRotation, euler: THREE.Euler, order?: THREE.EulerOrder): number[];

declare const currentCamera: unique symbol;
declare class DebugCameras extends THREE.EventDispatcher<{
    "update": {};
}> {
    private viewer;
    private defaultCamera;
    private [currentCamera];
    private cameras;
    private defaultEnabled;
    private cameraState;
    constructor(viewer: VntanaViewer);
    populate: () => void;
    private get currentCamera();
    private set currentCamera(value);
    set(index: number): void;
    list(): {
        names: string[];
        selected: number;
    };
}

declare function updateCameraTargetCoord(viewer: VntanaViewer, value: number, coord: "x" | "y" | "z"): [number, number, number];
declare function setRotationFromCamera(viewer: VntanaViewer): number[];
declare function changePerspectiveToOrthographic(viewer: VntanaViewer): {
    orthographicSize: string | null;
    minOrthographicSize: string | null;
    maxOrthographicSize: string | null;
};
declare function changeOrthographicToPerspective(viewer: VntanaViewer): {
    fieldOfView: string | null;
    minFieldOfView: string | null;
    maxFieldOfView: string | null;
};
declare function dollyUpdate(viewer: VntanaViewer, maxDistance: number): {
    cameraDistance: string | null;
    minCameraDistance: string | null;
    maxCameraDistance: string | null;
};

declare global {
    interface __VntanaViewerMapper {
    }
}
type ViewerProperty = keyof __VntanaViewerMapper;
type ViewerConfig = {
    [Property in ViewerProperty]?: InterfaceType<Property>;
};
type ExcludeProperties = ReadonlyArray<ViewerProperty> | null | undefined;
interface ExcludeConfig {
    exclude?: ExcludeProperties;
}
declare function loadProps(viewer: VntanaViewer, props: Readonly<ViewerConfig>): void;
declare function resetProps(viewer: VntanaViewer, config?: ExcludeConfig): void;
interface GetConfig extends NormalizeConfig {
    normalize?: boolean;
}
declare function getProps(viewer: VntanaViewer, config?: GetConfig): ViewerConfig;
interface NormalizeConfig extends ExcludeConfig {
    replaceDefaults?: boolean;
    removeNulls?: boolean;
    tolerance?: number;
}
declare function compareProps(initial: Readonly<ViewerConfig>, viewer: VntanaViewer, config?: GetConfig): {
    config: ViewerConfig;
    diff: (keyof __VntanaViewerMapper)[];
} | null;

declare function fovToTop(fov: number, radius: number): number;
declare function topToFov(top: number, radius: number): number;

export { DebugCameras, changeOrthographicToPerspective, changePerspectiveToOrthographic, combineRotations, compareProps, dollyUpdate, fovToTop, getProps, invertEuler, loadProps, resetProps, setRotationFromCamera, topToFov, updateCameraTargetCoord };
export type { ViewerConfig, ViewerProperty };
