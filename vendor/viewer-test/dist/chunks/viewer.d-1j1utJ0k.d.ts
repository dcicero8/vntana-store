import { S as ScaleMapper, R as RotationMapper, g as StringMapper, N as NumberMapper, B as BooleanMapper, I as InterfaceProps, h as OffsetMapper, i as LightRigMapper, j as OptionalColorMapper, k as OptionMapper, T as ToneMap, l as AngleMapper, m as PositionMapper, V as VntanaViewerBase, e as Constructor, f as LoadingInterface, n as LoadingStaticInterface } from './LoadingMixin.d-D0oMeIyc.js';

declare const sceneInterfaceProps: readonly ["scale", "rotation", "variant", "explodedStrength", "picking"];
type SceneGraphNodeType = "object" | "mesh" | "primitive" | "light" | "camera";
interface SceneGraphNode {
    readonly name: string;
    readonly uuid: string;
    readonly type: SceneGraphNodeType;
    readonly parent: SceneGraphNode | null;
    readonly children: readonly SceneGraphNode[];
}
interface SceneGraphIntersection {
    readonly uuid: string;
    readonly name: string;
    readonly distance: number;
}
interface ObjectHoverEventDetail {
    readonly originalEvent: PointerEvent;
    readonly intersections: readonly SceneGraphIntersection[];
}
type ObjectSelectEventDetail = ObjectHoverEventDetail;
type SceneGraphEffect = "outline" | "highlight" | "glow" | "dim";
declare interface SceneInterface extends InterfaceProps<typeof sceneInterfaceProps> {
    readonly sceneGraph: SceneGraphNode;
    getVariants(): string[];
    getExplodedStrength(): number;
    setExplodedStrength(value: number | null): void;
    jumpExplodedStrength(): void;
    setEffect(uuid: string, ...effects: SceneGraphEffect[]): boolean;
    removeEffect(uuid: string, ...effects: SceneGraphEffect[]): boolean;
    clearEffect(effect: SceneGraphEffect): void;
}
declare global {
    interface __VntanaViewerMapper {
        scale: ScaleMapper;
        rotation: RotationMapper;
        variant: StringMapper;
        explodedStrength: NumberMapper;
        picking: BooleanMapper;
    }
}

declare const lightingInterfaceProps: readonly ["environmentRotation", "skybox", "shadowIntensity", "shadowRadius", "shadowSamples", "shadowResolution", "shadowOffset", "lightRig", "lightRigIntensity", "lightRigColor", "hideModelLights"];
declare interface LightingInterface extends InterfaceProps<typeof lightingInterfaceProps> {
}
declare global {
    interface __VntanaViewerMapper {
        environmentRotation: RotationMapper;
        skybox: BooleanMapper;
        shadowIntensity: NumberMapper;
        shadowRadius: NumberMapper;
        shadowSamples: NumberMapper;
        shadowResolution: NumberMapper;
        shadowOffset: OffsetMapper;
        lightRig: LightRigMapper;
        lightRigIntensity: NumberMapper;
        lightRigColor: OptionalColorMapper;
        hideModelLights: BooleanMapper;
    }
}

declare const antiAliasing: readonly ["ssaa", "msaa"];
type AntiAliasing = typeof antiAliasing[number];
declare const transparencyMode: readonly ["normal", "depth-write"];
type TransparencyMode = typeof transparencyMode[number];

declare const renderingInterfaceProps: readonly ["exposure", "toneMapping", "antiAliasing", "msaaSamples", "ssaaSamples", "sharpenStrength", "bloomStrength", "bloomRadius", "bloomThreshold", "ssaoStrength", "ssaoRadius", "enableSsr", "hueShift", "saturation", "contrast", "brightness", "transparencyMode"];
declare interface RenderingInterface extends InterfaceProps<typeof renderingInterfaceProps> {
}
declare global {
    interface __VntanaViewerMapper {
        exposure: NumberMapper;
        toneMapping: OptionMapper<ToneMap>;
        antiAliasing: OptionMapper<AntiAliasing>;
        msaaSamples: NumberMapper;
        ssaaSamples: NumberMapper;
        sharpenStrength: NumberMapper;
        bloomStrength: NumberMapper;
        bloomRadius: NumberMapper;
        bloomThreshold: NumberMapper;
        ssaoStrength: NumberMapper;
        ssaoRadius: NumberMapper;
        enableSsr: BooleanMapper;
        hueShift: AngleMapper;
        saturation: NumberMapper;
        contrast: NumberMapper;
        brightness: NumberMapper;
        transparencyMode: OptionMapper<TransparencyMode>;
    }
}

declare const jewelryInterfaceProps: readonly ["enableJewelry", "gemAntiAliasing", "gemRayTracingDepth"];
declare interface JewelryInterface extends InterfaceProps<typeof jewelryInterfaceProps> {
}
declare global {
    interface __VntanaViewerMapper {
        enableJewelry: BooleanMapper;
        gemAntiAliasing: BooleanMapper;
        gemRayTracingDepth: NumberMapper;
    }
}

declare const cameraType: readonly ["perspective", "orthographic"];
type CameraType = typeof cameraType[number];
declare const controlsInterfaceProps: readonly ["disableControls", "disableZoom", "disablePan", "disableRotation", "rotationSensitivity", "panSensitivity", "zoomSensitivity", "enableAutoRotate", "autoRotateSpeed", "autoRotateDelay", "fieldOfView", "minFieldOfView", "maxFieldOfView", "orthographicSize", "minOrthographicSize", "maxOrthographicSize", "cameraType", "cameraTarget", "cameraDistance", "minCameraDistance", "maxCameraDistance", "cameraRotation", "minCameraRotation", "maxCameraRotation", "cameraAspect"];
declare interface ControlsInterface extends InterfaceProps<typeof controlsInterfaceProps> {
    getFieldOfView(): string;
    setFieldOfView(value: string | null): void;
    getOrthographicSize(): string;
    setOrthographicSize(value: string | null): void;
    getCameraDistance(): string;
    setCameraDistance(value: string | null): void;
    getCameraRotation(): string;
    setCameraRotation(value: string | null): void;
    getCameraTarget(): string;
    setCameraTarget(value: string | null): void;
    centerCamera(): void;
    jumpCamera(): void;
    getSceneRadius(): number;
}
declare global {
    interface __VntanaViewerMapper {
        disableZoom: BooleanMapper;
        disablePan: BooleanMapper;
        disableRotation: BooleanMapper;
        disableControls: BooleanMapper;
        rotationSensitivity: NumberMapper;
        panSensitivity: NumberMapper;
        zoomSensitivity: NumberMapper;
        enableAutoRotate: BooleanMapper;
        autoRotateSpeed: AngleMapper;
        autoRotateDelay: NumberMapper;
        fieldOfView: AngleMapper;
        minFieldOfView: AngleMapper;
        maxFieldOfView: AngleMapper;
        orthographicSize: OffsetMapper;
        minOrthographicSize: OffsetMapper;
        maxOrthographicSize: OffsetMapper;
        cameraDistance: OffsetMapper;
        minCameraDistance: OffsetMapper;
        maxCameraDistance: OffsetMapper;
        cameraRotation: RotationMapper;
        minCameraRotation: RotationMapper;
        maxCameraRotation: RotationMapper;
        cameraTarget: PositionMapper<VntanaViewerBase>;
        cameraType: OptionMapper<CameraType>;
        cameraAspect: NumberMapper;
    }
}

interface ScreenshotConfig {
    mimeType?: string;
    quality?: number;
    background?: string;
    width?: number;
    height?: number;
    poster?: boolean;
    cameraView?: {
        cameraType?: "perspective" | "orthographic" | null;
        cameraTarget?: string | null;
        cameraDistance?: string | null;
        cameraRotation?: string | null;
        cameraAspect?: string | null;
        fieldOfView?: string | null;
        orthographicSize?: string | null;
    };
}
declare const utilityInterfaceProps: readonly ["background"];
declare interface UtilityInterface extends InterfaceProps<typeof utilityInterfaceProps> {
    toDataURL(config: ScreenshotConfig): Promise<string>;
    getDimensions(): [number, number, number];
}
declare global {
    interface __VntanaViewerMapper {
        background: StringMapper;
    }
}

declare const arInterfaceProps: readonly ["autoAR", "usdzSrc"];
declare interface ARInterface extends InterfaceProps<typeof arInterfaceProps> {
    startAR(): Promise<void>;
    stopAR(): Promise<void>;
    generateUSDZ(): Promise<Blob>;
}
declare global {
    interface __VntanaViewerMapper {
        usdzSrc: StringMapper;
        autoAR: BooleanMapper;
    }
}

declare const VntanaViewer: Constructor<ARInterface> & Constructor<UtilityInterface> & Constructor<ControlsInterface> & Constructor<JewelryInterface> & Constructor<RenderingInterface> & Constructor<LightingInterface> & Constructor<SceneInterface> & Constructor<LoadingInterface> & typeof VntanaViewerBase & LoadingStaticInterface;
type VntanaViewer = InstanceType<typeof VntanaViewer>;
declare global {
    interface HTMLElementTagNameMap {
        'vntana-viewer': VntanaViewer;
    }
}

export { VntanaViewer as V };
export type { ARInterface as A, ControlsInterface as C, JewelryInterface as J, LightingInterface as L, ObjectHoverEventDetail as O, RenderingInterface as R, SceneGraphEffect as S, UtilityInterface as U, ObjectSelectEventDetail as a, SceneGraphIntersection as b, SceneGraphNode as c, SceneGraphNodeType as d, SceneInterface as e };
