import { V as VntanaViewerBase, a as $configuratorMode } from '../chunks/LoadingMixin.d-D0oMeIyc.js';
import 'three';
import 'lit';
import '../chunks/model.d-BSoSL4IS.js';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';

declare const deviceInfo: Readonly<{
    device: Readonly<{
        android: boolean;
        iOS: boolean;
        chromeOS: boolean;
        oculus: boolean;
        mobile: boolean;
        touch: boolean;
    }>;
    browser: Readonly<{
        chrome: boolean;
        safari: boolean;
        firefox: boolean;
    }>;
    pointer: Readonly<{
        touchSupport: boolean;
        coarsePointer: boolean;
    }>;
    ar: Readonly<{
        sceneviewer: boolean;
        quicklook: boolean;
    }>;
    xr: Readonly<{
        deviceAPI: boolean;
        hitTestAPI: boolean;
    }>;
}>;
declare function setupXRInfo(): Promise<Readonly<{
    deviceAPI: boolean;
    hitTestAPI: boolean;
    immersiveAR: boolean;
    immersiveVR: boolean;
    isHeadsetXR: boolean;
    isMobileXR: boolean;
}>>;
type XRInfo = Awaited<ReturnType<typeof setupXRInfo>>;
declare function getXRInfo(): Promise<XRInfo>;

type ARViewer = VntanaViewerBase & {
    src: string | null;
    usdzSrc: string | null;
    startAR(source: "button"): Promise<void>;
    [$configuratorMode]: boolean | null;
};
declare function detectQR(viewer: VntanaViewerBase | null, target: HTMLElement | null, src: boolean): boolean;
declare function detectAR(viewer: ARViewer | null, src: boolean, usdzSrc: boolean): {
    headset: boolean;
    mobileXR: boolean;
    sceneviewer: boolean;
    quicklook: boolean;
    usdzBlob: boolean;
    xr: boolean;
    native: boolean;
};
declare function launchAR(viewer: ARViewer | null, src: string, usdzSrc: string): void;
declare function openQuickLook(path: string): void;
declare function openSceneViewer(path: string, fallbackPath?: string): void;

export { detectAR, detectQR, deviceInfo, getXRInfo, launchAR, openQuickLook, openSceneViewer };
