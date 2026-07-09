import * as THREE from 'three';
import { ReactiveElement } from 'lit';
import { M as Model } from './model.d-BSoSL4IS.js';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { b as $properties, a as $parsed, $ as $propertyTypes, c as $unitTable } from './symbols.d-IEgx_IXZ.js';

type Replace<T, K extends keyof T, S extends {}> = Omit<T, K> & S;
type Constructor<T = {}> = new (...args: any[]) => T;
type KeysMatching<O, T> = {
    [K in keyof O]: O[K] extends T ? K : never;
}[keyof O & string];
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

type RenderTargetDef = {
    type: THREE.TextureDataType;
    depthBuffer: boolean;
    depthTexture: boolean;
    samples: number;
    format?: THREE.PixelFormat;
};
type RenderTargetView = {
    renderTarget: THREE.WebGLRenderTarget;
    width: number;
    height: number;
};
declare class RenderTargetPool {
    private _renderTargetStates;
    allocate(width: number, height: number, def: RenderTargetDef): RenderTargetView;
    free(rtView: RenderTargetView): void;
    dispose(): void;
}

declare class FullscreenShaderMaterial extends THREE.ShaderMaterial {
    private _texUniformName;
    constructor(params: THREE.ShaderMaterialParameters, texUniformName?: string);
    setRtView(rtView: RenderTargetView): void;
}

declare class Renderer extends THREE.EventDispatcher<{
    "webglcontextlost": {};
    "webglcontextrestored": {};
    "prerender": {};
    "render": {
        frame: XRFrame;
    };
    "postrender": {};
    "tick": {
        time: number;
        delta: number;
    };
}> {
    static readonly instance: Renderer;
    webglRenderer: THREE.WebGLRenderer | null;
    rtPool: RenderTargetPool;
    canvas: HTMLCanvasElement;
    time: number;
    manualSizing: boolean;
    private _fsQuad;
    copyMaterial: FullscreenShaderMaterial;
    private _currentCanvasViewport;
    private constructor();
    private render;
    requestSize(width: number, height: number): void;
    copyPixels(target: HTMLCanvasElement, width: number, height: number, xOffset?: number, yOffset?: number): void;
    fsRender(material: THREE.Material): void;
    setRtView(view: RenderTargetView | null): void;
    copyRt(src: RenderTargetView, dst: RenderTargetView | null, blending?: boolean, alpha?: number): void;
    maxAnisotropy(): number;
    getContext(): WebGLRenderingContext | WebGL2RenderingContext | null;
    dispose(): void;
}

type ShadowEvents = THREE.Object3DEventMap & {
    "visible": {
        value: boolean;
    };
    "bounding-box-update": {};
};
declare class Shadow extends THREE.Object3D<ShadowEvents> {
    light: THREE.DirectionalLight;
    mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShadowMaterial, THREE.Object3DEventMap>;
    private _offset;
    private height;
    private needsUpdate;
    constructor();
    update(): boolean;
    dispose(): void;
    get needsRepaint(): boolean;
    set needsRepaint(value: boolean);
    get intensity(): number;
    set intensity(value: number);
    get radius(): number;
    set radius(value: number);
    get samples(): number;
    set samples(value: number);
    get resolution(): number;
    set resolution(value: number);
    get offset(): number;
    set offset(value: number);
    adjustToBox(box: THREE.Box3): void;
}

type EventfulScene = Constructor<Replace<THREE.Scene, keyof THREE.Object3D, THREE.Object3D<THREE.Object3DEventMap & {
    "content-change": {};
    "bounding-box-update": {};
    "content-bounds-update": {};
    "exploded-strength-change": {};
    "root-transform": {};
    "animation-frame": {};
}>>>;
interface MaterialLayer {
    readonly enabled: boolean;
    setupMesh(mesh: THREE.Mesh): void;
    resetMesh(mesh: THREE.Mesh): void;
    invalidateMesh(mesh: THREE.Mesh): void;
}
declare enum Update$1 {
    ADDED = 0,
    MODIFIED = 1,
    REMOVED = 2
}
type NodeBounds = {
    root?: THREE.Box3;
    subtree: THREE.Box3;
    exploded?: ExplodedData;
};
type ExplodedData = {
    position: THREE.Vector3;
    root?: THREE.Box3;
    subtree: THREE.Box3;
    offset: THREE.Vector3;
    unitOffset: THREE.Vector3;
};
declare const Scene_base: EventfulScene;
declare class Scene extends Scene_base {
    #private;
    root: THREE.Object3D<THREE.Object3DEventMap>;
    content: THREE.Object3D<THREE.Object3DEventMap>;
    hotspots: THREE.Object3D<THREE.Object3DEventMap>;
    helpers: THREE.Object3D<THREE.Object3DEventMap>;
    lights: THREE.Object3D<THREE.Object3DEventMap>;
    shadow: Shadow;
    model: Model | null;
    materialLayers: MaterialLayer[];
    raycaster: THREE.Raycaster;
    mixer: THREE.AnimationMixer<THREE.AnimationMixerEventMap>;
    constructor();
    beforeRender(): void;
    afterRender(): void;
    get meshUpdates(): Map<THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes, THREE.BufferGeometryEventMap>, THREE.Material<THREE.MaterialEventMap> | THREE.Material<THREE.MaterialEventMap>[], THREE.Object3DEventMap>, Update$1>;
    queueMeshGeometryUpdate(): void;
    queueExplodedOffsetUpdate(): void;
    queueExplodedBoundsUpdate(): void;
    queueContentBoundsUpdate(): void;
    queueBoundingBoxUpdate(): void;
    queueAnimationUpdate(): void;
    queueUpdate(): void;
    update(delta: number): boolean;
    uncacheNode(node: THREE.Object3D): void;
    trackNode(node: THREE.Object3D): void;
    get animated(): boolean;
    addHelper(helper: THREE.Object3D): void;
    removeHelper(helper: THREE.Object3D): void;
    get contentBoundingBox(): THREE.Box3;
    get contentBoundingSphere(): THREE.Sphere;
    get boundingBox(): THREE.Box3;
    get nodeBounds(): Map<THREE.Object3D<THREE.Object3DEventMap>, NodeBounds>;
    get explosionEnabled(): boolean;
    get explodedStrength(): number;
    set explodedStrength(value: number);
    get groupedExplosion(): boolean;
    set groupedExplosion(value: boolean);
    raycast(raycaster: THREE.Raycaster, intersects: THREE.Intersection[]): void;
    raycastAny(raycaster: THREE.Raycaster): boolean;
    closestMeshToPoint(position: THREE.Vector3): THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes, THREE.BufferGeometryEventMap>, THREE.Material<THREE.MaterialEventMap> | THREE.Material<THREE.MaterialEventMap>[], THREE.Object3DEventMap> | undefined;
    getNodeOffset(node: THREE.Object3D, target: THREE.Vector3): THREE.Vector3;
    updateGeometryBounds(): void;
}

type Camera = THREE.PerspectiveCamera | THREE.OrthographicCamera;

type RenderingConfig = {
    exposure: number;
    toneMapping: ToneMap;
    antiAliasing: "msaa" | "ssaa";
    msaaSamples: number;
    ssaaSamples: number;
    sharpenStrength: number;
    bloomStrength: number;
    bloomRadius: number;
    bloomThreshold: number;
    ssaoStrength: number;
    ssaoRadius: number;
    ssrEnabled: boolean;
    halfResFx: boolean;
    hueShift: number;
    saturation: number;
    contrast: number;
    brightness: number;
    transparencyMode: TransparencyMode;
};
type TransparencyMode = "normal" | "depthWrite";
type ColorRepresentation = string | number;
type ToneMap = typeof toneMap[number];
declare const toneMap: readonly ["none", "linear", "reinhard", "cineon", "aces", "agx", "neutral"];
declare const $cfg: unique symbol;
declare class ViewerRendering {
    private _scene;
    private _width;
    private _height;
    [$cfg]: RenderingConfig;
    private _passes;
    private _needsRebuild;
    private _needsRender;
    private _needsMaterialUpdate;
    private _outlineNeedsRender;
    private _normalPass;
    private _tssaaPass;
    private _sharpenPass;
    private _bloomPass;
    private _ssaoPass;
    private _outputPass;
    private _prevFrameBuffer;
    private _prevImageWorldToProj;
    private _wireframeMaterial;
    private _wireframeMatCache;
    private _wireframeOpacity;
    transparentWireframe: boolean;
    private _outlineMeshMaterial;
    private _outlineMaterial;
    backgroundMaterial: THREE.MeshBasicMaterial;
    skipEffects: boolean;
    constructor(scene: Scene);
    set antiAliasing(_aa: string);
    set sharpenStrength(sharpenStrength: number);
    set ssaaSamples(ssaaSamples: number);
    set msaaSamples(_msaaSamples: number);
    set bloomStrength(bloomStrength: number);
    set bloomRadius(bloomRadius: number);
    set bloomThreshold(bloomThreshold: number);
    get ssaoEnabled(): boolean;
    set ssaoRadius(ssaoRadius: number);
    set ssaoStrength(ssaoStrength: number);
    set ssrEnabled(_v: boolean);
    set halfResFx(_v: boolean);
    set hueShift(v: number);
    set saturation(v: number);
    set contrast(v: number);
    set brightness(v: number);
    set transparencyMode(_v: TransparencyMode);
    set exposure(_v: number);
    set toneMapping(_v: ToneMap);
    get outlineColor(): ColorRepresentation;
    set outlineColor(color: ColorRepresentation);
    get outlineWidth(): number;
    set outlineWidth(width: number);
    addOutlineMesh(mesh: THREE.Object3D): void;
    removeOutlineMesh(mesh: THREE.Object3D): void;
    addBackgroundMesh(mesh: THREE.Object3D): void;
    removeBackgroundMesh(mesh: THREE.Object3D): void;
    queueRender(): void;
    rebuild(): void;
    set wireframeColor(color: ColorRepresentation | null);
    set wireframeOpacity(value: number);
    private _build;
    update(renderRequested: boolean): boolean;
    private _renderOutline;
    render(camera: Camera): void;
    private _setupMesh;
    updateMeshes(updates?: Map<THREE.Mesh, Update$1>): void;
    invalidateMesh(mesh: THREE.Mesh): void;
    setSize(width: number, height: number): void;
    dispose(): void;
}

declare class Spring {
    #private;
    constructor(f: number);
    update(current: number, goal: number, delta: number, tolerance: number): number;
    get frequency(): number;
    set frequency(f: number);
    reset(): void;
}

interface CameraController {
    readonly enabled: boolean;
    update(controls: OrbitControls, delta: number): void;
    reset(): void;
}
declare class AutoRotateController implements CameraController {
    enabled: boolean;
    delay: number;
    speed: number;
    elapsed: number;
    update(controls: OrbitControls, delta: number): void;
    reset(): void;
}

type PointerState = {
    id: number;
    offsetX: number;
    offsetY: number;
};
declare const enum UpdateSource {
    INTERACTION = 0,
    MANUAL = 1,
    AUTOMATIC = 2,
    NONE = 3
}
declare const UpdateSourceText: {
    readonly 0: "interaction";
    readonly 1: "manual";
    readonly 2: "auto";
    readonly 3: "none";
};
type UpdateSourceTextType = typeof UpdateSourceText[keyof typeof UpdateSourceText];
declare enum Mode {
    ROTATE = 0,
    PAN = 1,
    ZOOM = 2,
    DOUBLE_TOUCH = 3,
    CONTEXT_MENU = 4,
    NONE = 5
}
declare const $enabled$1: unique symbol;
declare const $trackEvents: unique symbol;
declare const $springFrequency: unique symbol;
declare const $animationFrequency: unique symbol;
declare const $updateConfig: unique symbol;
declare const $setSpringFrequencies: unique symbol;
type ControlEvents = {
    "change": {
        source: UpdateSourceTextType;
    };
};
declare class OrbitControls extends THREE.EventDispatcher<ControlEvents> {
    scene: Scene;
    element: HTMLElement;
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    width: number;
    height: number;
    needsUpdate: boolean;
    updateSource: UpdateSource;
    mode: Mode;
    [$enabled$1]: boolean;
    [$trackEvents]: boolean;
    enablePan: boolean;
    enableZoom: boolean;
    enableRotation: boolean;
    enableKeyboard: boolean;
    pointerState: PointerState[];
    private lastDistance;
    private panFocus;
    recastTarget: boolean;
    target: THREE.Vector3;
    spherical: THREE.Spherical;
    fov: number;
    aspect: number;
    top: number;
    currentTarget: THREE.Vector3;
    currentSpherical: THREE.Spherical;
    currentFov: number;
    currentAspect: number;
    currentTop: number;
    minRadius: number;
    maxRadius: number;
    minTheta: number;
    maxTheta: number;
    minPhi: number;
    maxPhi: number;
    minFov: number;
    maxFov: number;
    minTop: number;
    maxTop: number;
    maxTargetDistance: number | null;
    rotationSensitivity: number;
    panSensitivity: number;
    zoomSensitivity: number;
    private [$springFrequency];
    private [$animationFrequency];
    private animating;
    targetSpringX: Spring;
    targetSpringY: Spring;
    targetSpringZ: Spring;
    radiusSpring: Spring;
    thetaSpring: Spring;
    phiSpring: Spring;
    fovSpring: Spring;
    topSpring: Spring;
    autoRotate: AutoRotateController;
    controllers: CameraController[];
    private [$updateConfig];
    constructor(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera, element: HTMLElement, scene: Scene);
    get sphere(): THREE.Sphere;
    get enabled(): boolean;
    set enabled(value: boolean);
    get trackEvents(): boolean;
    set trackEvents(value: boolean);
    private syncListeners;
    private determineMode;
    private onPointerDown;
    private onPointerUp;
    private onPointerMove;
    private onWheel;
    private onContextMenu;
    private onKeyDown;
    rotate(dx: number, dy: number): void;
    pan: (dx: number, dy: number) => void;
    zoom(delta: number): void;
    setUpdateSource(source: UpdateSource): void;
    setSpherical(radius?: number, phi?: number, theta?: number): void;
    setTarget(x?: number, y?: number, z?: number): void;
    setFov(fov?: number): void;
    setTop(top?: number): void;
    setAspect(aspect: number): void;
    setCamera(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera): void;
    update(delta: number): boolean;
    updateCamera(): void;
    isStationary(): boolean;
    jump(): void;
    setSize(width: number, height: number): void;
    private updateCursor;
    private clampTarget;
    private wrapTheta;
    private [$setSpringFrequencies];
    get springFrequency(): number;
    set springFrequency(value: number);
    get animationFrequency(): number;
    set animationFrequency(value: number);
    setRadiusLimits(min?: number, max?: number): void;
    setThetaLimits(min?: number, max?: number): void;
    setPhiLimits(min?: number, max?: number): void;
    setFovLimits(min?: number, max?: number): void;
    setTopLimits(min?: number, max?: number): void;
}

declare enum ViewChannels {
    None = 0,
    VertexNormal = 1,
    VertexTangent = 2,
    VertexBitangent = 3,
    DerivativeTangent = 4,
    DerivativeBitangent = 5,
    WorldSpaceNormal = 6,
    NormalTexture = 7,
    BaseColor = 8,
    Alpha = 9,
    Metallic = 10,
    Roughness = 11,
    Occlusion = 12,
    Emissive = 13,
    FaceOrientation = 14,
    UV0 = 15,
    UV0Wrapped = 16,
    UV1 = 17,
    UV1Wrapped = 18,
    UV0Checker = 19,
    UV1Checker = 20,
    UV0PrimaryStretch = 21,
    UV0SecondaryStretch = 22,
    UV0StretchDirection = 23
}

declare const $viewChannel: unique symbol;
declare const $needsRender$1: unique symbol;
declare const $cache$1: unique symbol;
declare const $uvChecker: unique symbol;
declare class Inspector {
    private [$cache$1];
    private [$needsRender$1];
    private [$viewChannel];
    private [$uvChecker];
    private createMaterial;
    setupMesh(mesh: THREE.Mesh): void;
    resetMesh(mesh: THREE.Mesh): void;
    invalidateMesh(mesh: THREE.Mesh): void;
    get enabled(): boolean;
    get viewChannel(): ViewChannels;
    set viewChannel(viewChannel: ViewChannels);
    get needsRender(): boolean;
    set needsRender(needsRender: boolean);
    update(): boolean;
    dispose(): void;
}

declare const $scene: unique symbol;
declare const $cache: unique symbol;
declare const $enabled: unique symbol;
declare const $gemAntiAliasing: unique symbol;
declare const $rayTraceDepth: unique symbol;
declare const $needsRender: unique symbol;
declare class Jewelry extends THREE.EventDispatcher<{
    "enabled": {
        value: boolean;
    };
}> {
    private [$scene];
    private [$cache];
    private [$enabled];
    private [$gemAntiAliasing];
    private [$rayTraceDepth];
    private [$needsRender];
    constructor(scene: Scene);
    private createMaterial;
    setupMesh(mesh: THREE.Mesh): void;
    resetMesh(mesh: THREE.Mesh): void;
    invalidateMesh(mesh: THREE.Mesh): void;
    get enabled(): boolean;
    set enabled(enabled: boolean);
    get gemAntiAliasing(): boolean;
    set gemAntiAliasing(antiAliasing: boolean);
    get rayTraceDepth(): number;
    set rayTraceDepth(rayTraceDepth: number);
    get needsRender(): boolean;
    set needsRender(needsRender: boolean);
    update(): boolean;
}

declare class HotspotRenderer {
    #private;
    constructor(element: HTMLElement, root: THREE.Object3D);
    queueRender(): void;
    render(camera: THREE.Camera): void;
    setSize(width: number, height: number): void;
    add(object: CSS2DObject): void;
    remove(object: CSS2DObject): void;
}

declare class ProgressTracker extends THREE.EventDispatcher<{
    "progress": {
        value: number;
        source: string;
    };
}> {
    private activities;
    private progress;
    private completed;
    private sum;
    get count(): number;
    addActivity(progress?: number, source?: string): (progress: number) => void;
    private updateProgress;
    reset(): void;
}

declare class HeadsetSession extends THREE.EventDispatcher<{
    "end": {};
}> {
    #private;
    constructor(session: XRSession, scene: Scene);
    get active(): boolean;
    get session(): XRSession | null;
    end(): void;
    update(delta: number): boolean;
    render(frame: XRFrame): void;
}

type Placement = "floor" | "wall" | null;
declare class TouchSession extends THREE.EventDispatcher<{
    "end": {};
}> {
    #private;
    placement: Placement;
    debug: boolean;
    constructor(session: XRSession, scene: Scene, root: HTMLElement);
    get active(): boolean;
    get session(): XRSession | null;
    end(): void;
    update(delta: number): void;
    render(frame: XRFrame): void;
}

type SessionController = HeadsetSession | TouchSession;

declare const $changes: unique symbol;
declare const $update: unique symbol;
declare const enum Update {
    ADDED = 0,
    REMOVED = 1
}
type EventedSetEvents<T> = {
    "change": {
        changes: Map<T, Update>;
    };
};
declare class EventedSet<T, U extends EventedSetEvents<T> = EventedSetEvents<T>> extends Set<T> implements THREE.EventDispatcher<U> {
    protected [$changes]: Map<T, Update>;
    protected [$update]: Promise<void> | null;
    addEventListener: <K extends Extract<keyof U, string>>(type: K, listener: THREE.EventListener<U[K], K, this>) => void;
    hasEventListener: <K extends Extract<keyof U, string>>(type: K, listener: THREE.EventListener<U[K], K, this>) => boolean;
    removeEventListener: <K extends Extract<keyof U, string>>(type: K, listener: THREE.EventListener<U[K], K, this>) => void;
    dispatchEvent: <K extends Extract<keyof U, string>>(event: THREE.BaseEvent<K> & U[K]) => void;
    constructor(iterable?: Iterable<T>);
    private queueUpdate;
    add(item: T): this;
    delete(item: T): boolean;
    clear(): void;
}

declare class ObjectSelection {
    #private;
    readonly dim: EventedSet<THREE.Object3D>;
    readonly outline: EventedSet<THREE.Object3D>;
    readonly highlight: EventedSet<THREE.Object3D>;
    readonly glow: EventedSet<THREE.Object3D>;
    constructor(viewer: VntanaViewerBase);
    get enabled(): boolean;
    setupMesh(mesh: THREE.Mesh): void;
    resetMesh(mesh: THREE.Mesh): void;
    invalidateMesh(mesh: THREE.Mesh): void;
    get needsRender(): boolean;
    set needsRender(value: boolean);
    update(delta: number): boolean;
}

type PickerEvents = {
    "hover": {
        event: PointerEvent;
        intersections: THREE.Intersection[];
    };
    "select": {
        event: PointerEvent;
        intersections: THREE.Intersection[];
    };
};
declare class Picker extends THREE.EventDispatcher<PickerEvents> {
    #private;
    constructor(viewer: VntanaViewerBase);
    addEventListener<T extends keyof PickerEvents>(type: T, listener: THREE.EventListener<PickerEvents[T], T, this>): void;
    removeEventListener<T extends keyof PickerEvents>(type: T, listener: THREE.EventListener<PickerEvents[T], T, this>): void;
}

type OffsetUnit = typeof Offset.units[number];
type UnitTable = {
    [Property in OffsetUnit]: number;
};
declare class Offset {
    static readonly units: readonly ["m", "cm", "mm", "r", "w", "h", "d"];
    number: number;
    unit: OffsetUnit;
    constructor(number: number, unit?: OffsetUnit);
    clone(): Offset;
    convertTo(unit: OffsetUnit, unitTable: UnitTable): this;
    toString(): string;
}

type AngleUnit = typeof Angle.units[number];
declare class Angle {
    static readonly units: readonly ["deg", "rad"];
    number: number;
    unit: AngleUnit;
    constructor(number: number, unit?: AngleUnit);
    equals(a: Angle): boolean;
    equivalent(a: Angle): boolean;
    clone(): Angle;
    convertTo(unit: AngleUnit): this;
    toString(): string;
}

type Scale = [number, number, number];
type Rotation = [Angle, Angle, Angle];
type Position = [Offset, Offset, Offset];

interface Domain<T> {
    has: (x: T) => boolean;
    project: (x: T) => T | null;
}

type CustomElement = ReactiveElement & {
    [$properties]: Map<string, any>;
    [$parsed]: Map<string, any>;
};

type RotationUnit = AngleUnit | [AngleUnit, AngleUnit, AngleUnit];
type PositionUnit = OffsetUnit | [OffsetUnit, OffsetUnit, OffsetUnit];

declare class StringMapper {
    readonly auto: string;
    constructor(auto?: string);
    parse(source: any): {
        value: string | null;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    finalize(value: string | null): {
        value: string;
        errors: undefined;
        reset: undefined;
    };
    process(value: string | null): {
        value: string;
        errors: undefined;
        reset: undefined;
    };
    evaluate(source: any): string;
    get type(): "string";
}
declare class BooleanMapper {
    parse(source: any): {
        value: boolean | null;
        errors: string[] | undefined;
        reset: boolean | null | undefined;
    };
    finalize(value: boolean | null): {
        value: boolean;
        errors: undefined;
        reset: undefined;
    };
    process(value: boolean | null): {
        value: boolean;
        errors: undefined;
        reset: undefined;
    };
    evaluate(source: any): boolean;
    get type(): "boolean";
}
declare class OptionMapper<T extends string> {
    readonly domain: readonly T[];
    readonly auto: T;
    constructor(domain: readonly T[], auto: T);
    parse(source: any): {
        value: T | null;
        errors: string[] | undefined;
        reset: T | null | undefined;
    };
    finalize(value: T | null): {
        value: T;
        errors: undefined;
        reset: undefined;
    };
    process(value: T | null): {
        value: T;
        errors: undefined;
        reset: undefined;
    };
    evaluate(source: any): T;
    get type(): "option";
}
declare abstract class ColorMapperBase<T extends string | null> {
    abstract auto: T;
    parse(source: any): {
        value: string | null;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    finalize(value: string | null): {
        value: string | null;
        errors: undefined;
        reset: undefined;
    };
    process(value: string | null): {
        value: string | null;
        errors: undefined;
        reset: undefined;
    };
    evaluate(source: any): string | null;
}
declare class OptionalColorMapper extends ColorMapperBase<null> {
    get auto(): null;
    parse(source: any): {
        value: string | null;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    finalize(value: string | null): {
        value: string | null;
        errors: undefined;
        reset: undefined;
    };
    process(value: string | null): {
        value: string | null;
        errors: undefined;
        reset: undefined;
    };
    evaluate(source: any): string | null;
    get type(): "optional-color";
}
declare class ColorMapper extends ColorMapperBase<string> {
    readonly auto: string;
    constructor(auto: string);
    parse(source: any): {
        value: string | null;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    finalize(value: string | null): {
        value: string;
        errors: undefined;
        reset: undefined;
    };
    process(value: string | null): {
        value: string;
        errors: undefined;
        reset: undefined;
    };
    evaluate(source: any): string;
    get type(): "color";
}
declare class NumberMapper<T extends CustomElement = any> {
    readonly domain: Domain<number>;
    auto: number | ((this: T) => number);
    constructor(domain: Domain<number>, auto: number);
    parse(source: any): {
        value: number | null;
        errors: string[] | undefined;
        reset: number | null | undefined;
    };
    finalize(value: number | null, instance?: T): {
        value: number;
        errors: string[] | undefined;
        reset: number | null | undefined;
    };
    process(value: number | null, instance?: T): {
        value: number;
        errors: string[] | undefined;
        reset: number | null | undefined;
    };
    evaluate(source: any, instance?: T): number;
    get type(): "number";
}
declare class AngleMapper {
    readonly domain: Domain<Angle>;
    readonly auto: string;
    constructor(domain: Domain<Angle>, auto: string);
    parse(source: any): {
        value: Angle | null;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    finalize(value: Angle | null): {
        value: Angle;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    convert(value: Angle, unit: AngleUnit): number;
    process(value: Angle | null, unit: AngleUnit): {
        value: number;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    evaluate(source: any, unit: AngleUnit): number;
    get type(): "angle";
}
declare class OffsetMapper<T extends CustomElement = any> {
    readonly domain: any;
    readonly auto: string | ((this: T) => string);
    constructor(domain: any, auto: string);
    parse(source: any): {
        value: Offset | null;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    finalize(value: Offset | null, instance?: T): {
        value: Offset;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    convert(value: Offset, unit: OffsetUnit, unitTable: UnitTable): number;
    process(value: Offset | null, unit: OffsetUnit, unitTable: UnitTable, instance?: T): {
        value: number;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    evaluate(source: any, unit: OffsetUnit, unitTable: UnitTable, instance?: T): number;
    get type(): "offset";
}
declare class ScaleMapper {
    readonly auto: string;
    constructor(auto: string);
    parse(source: any): {
        value: Scale | null;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    finalize(value: Scale | null): {
        value: Scale;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    process(value: Scale | null): {
        value: Scale;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    evaluate(source: any): Scale;
    get type(): "scale";
}
declare class RotationMapper {
    readonly domain: any;
    readonly auto: string;
    constructor(domain: any, auto: string);
    parse(source: any): {
        value: Rotation | null;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    finalize(value: Rotation | null): {
        value: Rotation;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    convert(value: Rotation, units: RotationUnit): Rotation;
    process(value: Rotation | null, units: RotationUnit): {
        value: [number, number, number];
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    evaluate(source: any, unit: RotationUnit): [number, number, number];
    validUnit(unit: RotationUnit): unit is RotationUnit;
    get type(): "rotation";
}
declare class PositionMapper<T extends CustomElement> {
    readonly auto: string;
    constructor(auto: string);
    parse(source: any): {
        value: Position | null;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    finalize(value: Position | null, _unitTable: UnitTable, _instance: T): {
        value: Position;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    convert(value: Position, units: PositionUnit, unitTable: UnitTable, _instance: T): Position;
    process(value: Position | null, units: PositionUnit, unitTable: UnitTable, instance: T): {
        value: [number, number, number];
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    evaluate(source: any, unit: PositionUnit, unitTable: UnitTable, instance: T): [number, number, number];
    validUnit(unit: PositionUnit): unit is PositionUnit;
    get type(): "position";
}

declare const lightProperties: {
    readonly directional: readonly ["intensity", "color", "position", "direction"];
    readonly point: readonly ["intensity", "color", "position", "distance"];
    readonly spot: readonly ["intensity", "color", "position", "direction", "distance", "angle", "penumbra"];
};
declare const lightPropertyMappers: {
    readonly intensity: NumberMapper<any>;
    readonly color: ColorMapper;
    readonly position: PositionMapper<CustomElement>;
    readonly direction: PositionMapper<CustomElement>;
    readonly distance: OffsetMapper<any>;
    readonly angle: AngleMapper;
    readonly penumbra: NumberMapper<any>;
};
type LightType = keyof typeof lightProperties;
type LightProperty = typeof lightProperties[LightType][number];
type LightProperties<T extends LightType> = typeof lightProperties[T][number];
type Mapper<K extends LightProperty> = typeof lightPropertyMappers[K];
type ParsedLightProperties = {
    [Property in LightProperty]: ReturnType<Mapper<Property>["parse"]>["value"];
};
type GenericParsedLight<type extends LightType> = {
    type: type;
    config: {
        [Property in LightProperties<type>]?: ParsedLightProperties[Property];
    };
};
type ParsedLight = GenericParsedLight<"directional"> | GenericParsedLight<"point"> | GenericParsedLight<"spot">;
type FinalizedLightProperties = {
    [Property in LightProperty]: ReturnType<Mapper<Property>["finalize"]>["value"];
};
type GenericFinalizedLight<type extends LightType> = {
    type: type;
    config: {
        [Property in LightProperties<type>]: FinalizedLightProperties[Property];
    };
};
type FinalizedLight = GenericFinalizedLight<"directional"> | GenericFinalizedLight<"point"> | GenericFinalizedLight<"spot">;
type MappedLightProperties = {
    [Property in LightProperty]: ReturnType<Mapper<Property>["process"]>["value"];
};
type GenericMappedLight<type extends LightType> = {
    type: type;
    config: {
        [Property in LightProperties<type>]: MappedLightProperties[Property];
    };
};
type MappedLight = GenericMappedLight<"directional"> | GenericMappedLight<"point"> | GenericMappedLight<"spot">;
type LightRigUnits = {
    "position": PositionUnit;
    "direction": PositionUnit;
    "distance": OffsetUnit;
    "angle": AngleUnit;
};
declare class LightRigMapper {
    parse(source: any): {
        value: ParsedLight[] | null;
        errors: string[] | undefined;
        reset: string | null | undefined;
    };
    finalize(value: ParsedLight[] | null, unitTable: UnitTable, instance: VntanaViewerBase): {
        value: FinalizedLight[];
        errors: string[] | undefined;
        reset: undefined;
    };
    convert(value: FinalizedLight[], units: LightRigUnits, unitTable: UnitTable, instance: VntanaViewerBase): FinalizedLight[];
    process(value: ParsedLight[] | null, units: LightRigUnits, unitTable: UnitTable, instance: VntanaViewerBase): MappedLight[];
    evaluate(source: any, units: LightRigUnits, unitTable: UnitTable, instance: VntanaViewerBase): MappedLight[];
    get type(): "light-rig";
}

declare global {
    interface __VntanaViewerMapper {
    }
}
declare class LoadState {
    loaded: boolean;
    loading: boolean;
    initialized: boolean;
    get shouldUpdateProps(): boolean;
    get shouldUpdateImmediateProps(): boolean;
}
declare const $timeSinceLastUpdate: unique symbol;
declare const $loadState: unique symbol;
declare const $triggerUpdates: unique symbol;
declare class VntanaViewerBase extends ReactiveElement {
    #private;
    static readonly renderer: Renderer;
    static [$propertyTypes]: Map<keyof __VntanaViewerMapper, any>;
    [$parsed]: Map<keyof __VntanaViewerMapper, any>;
    [$properties]: Map<keyof __VntanaViewerMapper, any>;
    [$unitTable]: {
        [Property in OffsetUnit]: number;
    };
    [$loadState]: LoadState;
    private intersectionObserver;
    container: HTMLElement;
    canvas: HTMLCanvasElement;
    canvasContainer: HTMLElement;
    input: HTMLElement;
    hotspots: HTMLElement;
    scene: Scene;
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    controls: OrbitControls;
    rendering: ViewerRendering;
    inspector: Inspector;
    jewelry: Jewelry;
    hotspotRenderer: HotspotRenderer;
    progressTracker: ProgressTracker;
    arSession: SessionController | null;
    selection: ObjectSelection;
    picker: Picker;
    protected [$timeSinceLastUpdate]: number;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected onTick: ({ delta }: {
        delta: number;
    }) => void;
    protected tick(delta: number): void;
    protected updateSize: () => void;
    protected updateComponents: () => void;
    protected render: (event: {
        frame: XRFrame;
    }) => void;
    protected renderScene(canvas: HTMLCanvasElement, camera: THREE.PerspectiveCamera | THREE.OrthographicCamera): void;
    private onContextLost;
    get visible(): boolean;
    get needsRender(): boolean;
    set needsRender(value: boolean);
    get width(): number;
    get height(): number;
    get sceneVisible(): boolean;
    protected [$triggerUpdates](): void;
    getNDC(clientX: number, clientY: number): {
        x: number;
        y: number;
    };
    evaluate<K extends KeysWithoutUnits>(property: K, source: any): EvaluateValue<K>;
    evaluate<K extends KeysWithUnits>(property: K, source: any, unit: Unit<K>): EvaluateValue<K>;
    evaluateProperty<K extends KeysWithoutUnits>(property: K): EvaluateValue<K>;
    evaluateProperty<K extends KeysWithUnits>(property: K, unit: Unit<K>): EvaluateValue<K>;
}
type UnitlessMapperType = StringMapper | BooleanMapper | OptionalColorMapper | ColorMapper | OptionMapper<any> | NumberMapper | ScaleMapper;
type KeysWithoutUnits = KeysMatching<__VntanaViewerMapper, UnitlessMapperType>;
type KeysWithUnits = Exclude<keyof __VntanaViewerMapper, KeysWithoutUnits>;
type EvaluateValue<K extends keyof __VntanaViewerMapper> = ReturnType<__VntanaViewerMapper[K]["evaluate"]>;
type Unit<K extends keyof __VntanaViewerMapper> = K extends KeysWithoutUnits ? never : K extends KeysMatching<__VntanaViewerMapper, AngleMapper> ? AngleUnit : K extends KeysMatching<__VntanaViewerMapper, OffsetMapper> ? OffsetUnit : K extends KeysMatching<__VntanaViewerMapper, RotationMapper> ? RotationUnit : K extends KeysMatching<__VntanaViewerMapper, PositionMapper<any>> ? PositionUnit : K extends KeysMatching<__VntanaViewerMapper, LightRigMapper> ? LightRigUnits : never;

declare global {
    interface __VntanaViewerMapper {
    }
}
type InterfaceType<K extends keyof __VntanaViewerMapper> = __VntanaViewerMapper[K] extends StringMapper ? string | null : __VntanaViewerMapper[K] extends BooleanMapper ? boolean | null : __VntanaViewerMapper[K] extends OptionMapper<infer T> ? T | null : __VntanaViewerMapper[K] extends OptionalColorMapper | ColorMapper ? string | null : __VntanaViewerMapper[K] extends NumberMapper ? number | null : __VntanaViewerMapper[K] extends AngleMapper ? string | null : __VntanaViewerMapper[K] extends OffsetMapper ? string | null : __VntanaViewerMapper[K] extends ScaleMapper ? string | null : __VntanaViewerMapper[K] extends RotationMapper ? string | null : __VntanaViewerMapper[K] extends PositionMapper<any> ? string | null : __VntanaViewerMapper[K] extends LightRigMapper ? string | null : never;
type InterfaceProps<T extends ReadonlyArray<keyof __VntanaViewerMapper>> = {
    [Property in T[number]]: InterfaceType<Property>;
};

declare const $configuratorMode: unique symbol;
declare const $loadScene: unique symbol;
declare const $preload: unique symbol;
declare const $cancelLoad: unique symbol;
type Assemble = (model: Record<string, Model>, texture: Record<string, THREE.Texture>) => boolean;
type LoadSceneConfig = {
    model?: Record<string, string>;
    texture?: Record<string, string>;
};
type PreloadConfig = {
    model?: Record<string, string>;
    texture?: Record<string, string>;
    environment?: string;
};
declare const loadingType: readonly ["lazy", "eager", "click", "hover"];
type LoadingType = typeof loadingType[number];
declare const loadingInterfaceProps: readonly ["src", "environmentSrc", "loading", "poster"];
declare interface LoadingInterface extends InterfaceProps<typeof loadingInterfaceProps> {
    showPoster(): void;
    hidePoster(): void;
    [$configuratorMode]: boolean | null;
    [$loadScene](): Promise<boolean>;
    [$loadScene](config: LoadSceneConfig, assemble: Assemble): Promise<boolean>;
    [$preload](config: PreloadConfig): Promise<void>;
}
declare global {
    interface __VntanaViewerMapper {
        src: StringMapper;
        environmentSrc: StringMapper;
        loading: OptionMapper<LoadingType>;
        poster: StringMapper;
    }
}
declare interface LoadingStaticInterface {
    setModelRequestHeaders(headers: {
        [index: string]: string;
    }): void;
    setModelRequestCredentials(value: boolean): void;
    setEnvironmentRequestHeaders(headers: {
        [index: string]: string;
    }): void;
    setEnvironmentRequestCredentials(value: boolean): void;
    setDracoDecoderPath(value: string): void;
    setKTX2DecoderPath(value: string): void;
}

export { $cancelLoad as $, BooleanMapper as B, NumberMapper as N, OrbitControls as O, RotationMapper as R, ScaleMapper as S, UpdateSource as U, VntanaViewerBase as V, $configuratorMode as a, $loadScene as b, $preload as c, AutoRotateController as d, StringMapper as g, OffsetMapper as h, LightRigMapper as i, OptionalColorMapper as j, OptionMapper as k, AngleMapper as l, PositionMapper as m };
export type { Assemble as A, CameraController as C, InterfaceProps as I, LoadSceneConfig as L, Prettify as P, ToneMap as T, Constructor as e, LoadingInterface as f, LoadingStaticInterface as n, InterfaceType as o };
