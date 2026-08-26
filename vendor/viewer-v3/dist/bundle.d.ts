import * as THREE from 'three';
import * as lit from 'lit';
import { ReactiveElement, LitElement, CSSResultGroup, nothing } from 'lit';
import * as three_examples_jsm_loaders_GLTFLoader_js from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as lit_html from 'lit-html';

type Replace<T, K extends keyof T, S extends {}> = Omit<T, K> & S;
type Constructor<T = {}> = new (...args: any[]) => T;
type KeysMatching<O, T> = {
    [K in keyof O]: O[K] extends T ? K : never;
}[keyof O & string];

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

declare class Model extends THREE.EventDispatcher<{
    "variant-change": {};
}> {
    #private;
    scene: THREE.Object3D;
    animations: THREE.AnimationClip[];
    cameras: (THREE.PerspectiveCamera | THREE.OrthographicCamera)[];
    lights: THREE.Light[];
    variants: string[];
    associations: Map<THREE.Object3D<THREE.Object3DEventMap> | THREE.Texture<unknown, THREE.TextureEventMap> | THREE.Material<THREE.MaterialEventMap>, three_examples_jsm_loaders_GLTFLoader_js.GLTFReference>;
    constructor(gltf: GLTF);
    setVariant(variant?: string | number | null): Promise<void>;
    getMeshFromIndices(nodeIndex: number, primitiveIndex: number): THREE.Mesh<any, any, any> | null;
    get json(): any;
    get showLights(): boolean;
    set showLights(value: boolean);
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
    transparencyMode: TransparencyMode$1;
};
type TransparencyMode$1 = "normal" | "depthWrite";
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
    set transparencyMode(_v: TransparencyMode$1);
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
    get highlightColor(): string;
    set highlightColor(value: string);
    get glowColor(): string;
    set glowColor(value: string);
    get glowIntensity(): number;
    set glowIntensity(value: number);
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

declare const $propertyTypes: unique symbol;
declare const $properties: unique symbol;
declare const $parsed: unique symbol;
declare const $unitTable: unique symbol;

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
    evaluate<K extends KeysWithUnits>(property: K, source: any, unit: Unit$1<K>): EvaluateValue<K>;
    evaluateProperty<K extends KeysWithoutUnits>(property: K): EvaluateValue<K>;
    evaluateProperty<K extends KeysWithUnits>(property: K, unit: Unit$1<K>): EvaluateValue<K>;
}
type UnitlessMapperType = StringMapper | BooleanMapper | OptionalColorMapper | ColorMapper | OptionMapper<any> | NumberMapper | ScaleMapper;
type KeysWithoutUnits = KeysMatching<__VntanaViewerMapper, UnitlessMapperType>;
type KeysWithUnits = Exclude<keyof __VntanaViewerMapper, KeysWithoutUnits>;
type EvaluateValue<K extends keyof __VntanaViewerMapper> = ReturnType<__VntanaViewerMapper[K]["evaluate"]>;
type Unit$1<K extends keyof __VntanaViewerMapper> = K extends KeysWithoutUnits ? never : K extends KeysMatching<__VntanaViewerMapper, AngleMapper> ? AngleUnit : K extends KeysMatching<__VntanaViewerMapper, OffsetMapper> ? OffsetUnit : K extends KeysMatching<__VntanaViewerMapper, RotationMapper> ? RotationUnit : K extends KeysMatching<__VntanaViewerMapper, PositionMapper<any>> ? PositionUnit : K extends KeysMatching<__VntanaViewerMapper, LightRigMapper> ? LightRigUnits : never;

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

declare const sceneInterfaceProps: readonly ["scale", "rotation", "variant", "explodedStrength", "picking", "outlineColor", "outlineWidth", "highlightColor", "glowColor", "glowIntensity", "dimColor", "dimOpacity"];
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
    focusNodes(uuids: Iterable<string>): void;
}
declare global {
    interface __VntanaViewerMapper {
        scale: ScaleMapper;
        rotation: RotationMapper;
        variant: StringMapper;
        explodedStrength: NumberMapper;
        picking: BooleanMapper;
        outlineColor: ColorMapper;
        outlineWidth: NumberMapper;
        highlightColor: ColorMapper;
        glowColor: ColorMapper;
        glowIntensity: NumberMapper;
        dimColor: ColorMapper;
        dimOpacity: NumberMapper;
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

declare const VntanaViewer: Constructor<ARInterface> & Constructor<UtilityInterface> & Constructor<ControlsInterface> & Constructor<JewelryInterface> & Constructor<RenderingInterface> & Constructor<LightingInterface> & Constructor<SceneInterface> & Constructor<LoadingInterface> & typeof VntanaViewerBase & LoadingStaticInterface;
type VntanaViewer = InstanceType<typeof VntanaViewer>;
declare global {
    interface HTMLElementTagNameMap {
        'vntana-viewer': VntanaViewer;
    }
}

declare class VntanaHotspot extends ReactiveElement {
    #private;
    static [$propertyTypes]: Map<string, any>;
    [$parsed]: Map<string, any>;
    [$properties]: Map<string, any>;
    accessor position: string | null;
    accessor path: string | null;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    queueRender(): void;
    shouldUpdate(changed: Map<PropertyKey, any>): boolean;
    get [$unitTable](): {
        m: number;
        cm: number;
        mm: number;
        r: number;
        w: number;
        h: number;
        d: number;
    };
}

declare global {
    interface HTMLElementTagNameMap {
        'vntana-hotspot': VntanaHotspot;
    }
}

declare const DefaultLabels: {
    readonly VIEW_IN_YOUR_SPACE: "View in Your Space";
    readonly EXPLODE: "Explode";
    readonly MEASUREMENTS_HEADER: "Measurements";
    readonly MEASUREMENTS_UNIT: "Unit";
    readonly MEASUREMENTS_PRECISION: "Precision";
    readonly MEASUREMENTS_DELETE: "Delete";
    readonly MEASUREMENTS_CLEAR: "Clear All";
    readonly SCENE_GRAPH_HEADER: "Scene Graph";
    readonly SCENE_GRAPH_SEARCH: "Search";
    readonly SCENE_GRAPH_NO_RESULTS: "No results found";
    readonly QR_MODAL_HEADER: "Scan QR Code";
    readonly QR_MODAL_TEXT: "with your mobile device to view this 3D product in your space.";
    readonly AR_MODAL_HELP_HEADER: "XR Controls";
    readonly AR_MODAL_HELP_RECENTER_TITLE: "A/X Button";
    readonly AR_MODAL_HELP_RECENTER_DESCRIPTION: "Recenter";
    readonly AR_MODAL_HELP_POSITION_TITLE: "B/Y Button";
    readonly AR_MODAL_HELP_POSITION_DESCRIPTION: "Position";
    readonly AR_MODAL_HELP_POSITION_DETAILS: "Point to the floor to position the asset, then hold the trigger button and drag to orient";
    readonly AR_MODAL_HELP_ROTATE_MOVE_TITLE: "Thumbstick";
    readonly AR_MODAL_HELP_ROTATE_DESCRIPTION: "Rotate/zoom";
    readonly AR_MODAL_HELP_TRIGGER_GRIP_TITLE: "Trigger/Grip";
    readonly AR_MODAL_HELP_TRIGGER_GRIP_DESCRIPTION: "Pick Up";
    readonly AR_MODAL_HELP_DOUBLE_TRIGGER_TITLE: "Double Trigger";
    readonly AR_MODAL_HELP_DOUBLE_TRIGGER_DESCRIPTION: "Scale";
    readonly AR_MODAL_HELP_PAUSE_TITLE: "Menu";
    readonly AR_MODAL_HELP_PAUSE_DESCRIPTION: "Pause XR";
    readonly AR_MODAL_ACTIVE_HEADER: "XR Session in Progress";
    readonly AR_MODAL_ACTIVE_TEXT: "Click Resume or Quit within the toolbar to proceed.";
    readonly AR_MODAL_ERROR_TEXT: "We are having trouble loading the experience.";
    readonly AR_MODAL_RETRY_WEBXR: "Try Again";
    readonly AR_MODAL_START_WEBXR: "Start WebXR";
    readonly AR_MODAL_TEST_WEBXR: "Test in WebXR";
    readonly AR_MODAL_EXIT_WEBXR: "Exit XR";
    readonly SIGNED_QR_MODAL_HEADER: "Test in AR";
    readonly SIGNED_QR_MODAL_TEXT: "Scan QR code with your mobile device to view this 3D product in your space.";
    readonly SIGNED_QR_TIME_REMAINING: "Time remaining";
    readonly SIGNED_QR_SESSION_EXPIRED: "Session expired";
    readonly SIGNED_QR_SESSION_UNEXPECTED_ERROR: "An unexpected error occured";
    readonly SIGNED_QR_REFRESH: "Refresh";
    readonly INFO_MODAL_HEADER: "Viewer Navigation";
    readonly INFO_DEVICE_MOUSE: "Mouse";
    readonly INFO_DEVICE_KEYBOARD: "Keyboard";
    readonly INFO_DEVICE_TOUCH: "Touch";
    readonly INFO_ACTION_ROTATE: "Rotate";
    readonly INFO_ACTION_PAN: "Move or Pan";
    readonly INFO_ACTION_ZOOM: "Zoom";
    readonly INFO_ACTION_SELECT: "Select";
    readonly INFO_ACTION_DESC_LEFT_CLICK: "Left click";
    readonly INFO_ACTION_DESC_RIGHT_CLICK: "Right click";
    readonly INFO_ACTION_DESC_DRAG: "Drag";
    readonly INFO_ACTION_DESC_SHIFT: "Shift";
    readonly INFO_ACTION_DESC_SCROLL: "Scroll";
    readonly INFO_ACTION_DESC_ARROW_KEYS: "Arrow keys";
    readonly INFO_ACTION_DESC_PLUSMINUS: "+/-";
    readonly INFO_ACTION_DESC_TAB: "Tab";
    readonly INFO_ACTION_DESC_ENTER: "Enter";
    readonly INFO_ACTION_DESC_TAP: "Tap";
    readonly INFO_ACTION_DESC_TWO_TAP: "Two finger tap";
    readonly INFO_ACTION_DESC_PINCH: "Pinch in/out";
    readonly ARIA_VIEWER_ROLE: "Interactive 3D Viewer";
    readonly ARIA_CLOSE: "Close";
    readonly ARIA_DIMENSIONS: "Dimensions";
    readonly ARIA_MEASUREMENTS: "Open measurements";
    readonly ARIA_SCENE_GRAPH: "Open scene graph";
    readonly ARIA_CENTER_CAMERA: "Center camera";
    readonly ARIA_FULLSCREEN: "Fullscreen";
    readonly ARIA_ZOOM_IN: "Zoom in";
    readonly ARIA_ZOOM_OUT: "Zoom out";
    readonly ARIA_QR_CODE: "Show QR code";
    readonly ARIA_QR_CODE_MODAL: "Scan QR code";
    readonly ARIA_AR_VIEW_IN_YOUR_SPACE: "View in your space";
    readonly ARIA_EXPLODED_VIEW: "Exploded view";
    readonly ARIA_EXPLODE: "Explode";
    readonly ARIA_QR_CODE_IMAGE: "QR code image";
    readonly ARIA_AR_MODAL: "AR modal";
    readonly ARIA_EXPAND: "Expand";
    readonly ARIA_COLLAPSE: "Collapse";
    readonly ARIA_HELP: "Show help";
    readonly ARIA_SHOW: "Show";
    readonly ARIA_HIDE: "Hide";
    readonly ARIA_INFO_DEVICE: "Input method";
    readonly ARIA_SCENE_GRAPH_SEARCH_RESULTS: "Search results";
    readonly ARIA_DECIMAL_PLACES_0: "0 decimal places";
    readonly ARIA_DECIMAL_PLACES_1: "1 decimal place";
    readonly ARIA_DECIMAL_PLACES_2: "2 decimal places";
    readonly ARIA_DECIMAL_PLACES_3: "3 decimal places";
    readonly ARIA_DECIMAL_PLACES_4: "4 decimal places";
    readonly ARIA_DECIMAL_PLACES_5: "5 decimal places";
    readonly ARIA_UNIT_M: "meters";
    readonly ARIA_UNIT_CM: "centimeters";
    readonly ARIA_UNIT_MM: "millimeters";
    readonly ARIA_UNIT_FT: "feet";
    readonly ARIA_UNIT_IN: "inches";
    readonly ARIA_CAMERA_CENTERED: "Camera centered";
    readonly ARIA_ZOOMED_IN: "Zoomed in";
    readonly ARIA_ZOOMED_OUT: "Zoomed out";
    readonly ARIA_MIN_ZOOM: "Minimum zoom reached";
    readonly ARIA_MAX_ZOOM: "Maximum zoom reached";
};
type TranslationKey = keyof typeof DefaultLabels;

declare const $ancestorViewer: unique symbol;
declare const $contextDisabled: unique symbol;
declare const $i18nVersion: unique symbol;
declare const $element: unique symbol;
declare const $createElement: unique symbol;
declare const $destroyElement: unique symbol;
declare const $onViewerChange: unique symbol;
declare const $onTargetChange: unique symbol;
declare const $onActiveChange: unique symbol;
type AriaConfig = {
    "label"?: TranslationKey;
    "tabindex"?: number;
    "role"?: string;
    "toggle"?: "pressed" | "expanded";
    "popup"?: string;
};
declare class UIElement extends LitElement {
    #private;
    static get styles(): CSSResultGroup;
    protected static ariaConfig: AriaConfig;
    protected [$ancestorViewer]: VntanaViewer | null;
    private [$i18nVersion];
    hidden: boolean;
    disabled: boolean;
    private [$contextDisabled];
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    protected updated(changes: Map<PropertyKey, any>): void;
    get contextDisabled(): boolean;
    protected isContextDisabled(): boolean;
    protected queueUpdate: () => void;
}
interface ViewerMixinInterface {
    viewer: VntanaViewer | null;
    readonly computedViewer: VntanaViewer | null;
}
interface TargetMixinInterface {
    target: HTMLElement | null;
    readonly computedTarget: HTMLElement | null;
}
interface ActiveMixinInterface {
    active: boolean;
}
/** BUTTONS **/
declare class ButtonBase extends UIElement {
    static get styles(): CSSResultGroup;
    protected static ariaConfig: AriaConfig;
    updated(changes: Map<PropertyKey, any>): void;
}
declare const ElementButton_base: Constructor<ActiveMixinInterface> & Constructor<TargetMixinInterface> & Constructor<ViewerMixinInterface> & typeof ButtonBase;
declare abstract class ElementButton<T extends HTMLElement> extends ElementButton_base {
    #private;
    protected [$element]: T | null;
    protected abstract [$createElement](): T;
    protected [$destroyElement](): void;
    disconnectedCallback(): void;
    protected [$onActiveChange](): void;
    updated(changes: Map<PropertyKey, any>): void;
}
declare const ViewerButton: Constructor<ViewerMixinInterface> & typeof ButtonBase;
type ViewerButton = InstanceType<typeof ViewerButton>;

declare const VntanaFSButton_base: Constructor<ActiveMixinInterface> & Constructor<TargetMixinInterface> & typeof ButtonBase;
declare class VntanaFSButton extends VntanaFSButton_base {
    #private;
    protected static ariaConfig: {
        readonly label: "ARIA_FULLSCREEN";
        readonly toggle: "pressed";
        readonly tabindex?: number;
        readonly role?: string;
        readonly popup?: string;
    };
    protected [$onTargetChange](oldTarget: Element | null, newTarget: Element | null): void;
    protected [$onActiveChange](): void;
    protected isContextDisabled(): boolean;
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-fs-button': VntanaFSButton;
    }
}

declare abstract class VntanaQRButtonBase<T extends HTMLElement> extends ElementButton<T> {
    #private;
    static get styles(): CSSResultGroup;
    protected static ariaConfig: {
        readonly label: "ARIA_QR_CODE";
        readonly popup: "dialog";
        readonly tabindex?: number;
        readonly role?: string;
        readonly toggle?: "pressed" | "expanded";
    };
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected [$onViewerChange](oldViewer: VntanaViewer | null, newViewer: VntanaViewer | null): void;
    render(): lit_html.TemplateResult<1>;
    updated(changes: Map<PropertyKey, any>): void;
}

declare class Overlay extends UIElement {
    #private;
    static get styles(): CSSResultGroup;
    static shadowRootOptions: ShadowRootInit;
    protected static ariaConfig: {
        role: string;
        tabindex: number;
        label?: TranslationKey;
        toggle?: "pressed" | "expanded";
        popup?: string;
    };
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    remove(): void;
    protected isDismissible(): boolean;
    render(): lit_html.TemplateResult<1>;
    protected renderContent(): ReturnType<LitElement["render"]>;
    protected renderHeader(title?: TranslationKey): lit_html.TemplateResult<1>;
}

declare class VntanaQROverlay extends Overlay {
    static get styles(): CSSResultGroup;
    static shadowRootOptions: ShadowRootInit;
    protected static ariaConfig: {
        readonly label: "ARIA_QR_CODE_MODAL";
        readonly role: string;
        readonly tabindex: number;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    url: string;
    protected shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    updated(changes: Map<PropertyKey, any>): void;
    isContextDisabled(): boolean;
    protected renderContent(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-qr-overlay': VntanaQROverlay;
    }
}

declare class VntanaQRButton extends VntanaQRButtonBase<VntanaQROverlay> {
    #private;
    protected [$createElement](): VntanaQROverlay;
    shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    updated(changes: Map<PropertyKey, any>): void;
    protected isContextDisabled(): boolean;
    get url(): string | null;
    set url(value: string | null | undefined);
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-qr-button': VntanaQRButton;
    }
}

declare abstract class VntanaARButtonBase<T extends HTMLElement & {
    viewer: VntanaViewer | null;
}> extends ElementButton<T> {
    #private;
    protected static ariaConfig: {
        readonly label: "ARIA_AR_VIEW_IN_YOUR_SPACE";
        readonly popup: "dialog";
        readonly tabindex?: number;
        readonly role?: string;
        readonly toggle?: "pressed" | "expanded";
    };
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    static get styles(): CSSResultGroup;
    protected [$onViewerChange](oldViewer: VntanaViewer | null, newViewer: VntanaViewer | null): void;
    render(): lit_html.TemplateResult<1>;
    updated(changes: Map<PropertyKey, any>): void;
}

declare const $state: unique symbol;
declare const VntanaAROverlay_base: Constructor<ViewerMixinInterface> & typeof Overlay;
declare class VntanaAROverlay extends VntanaAROverlay_base {
    #private;
    static get styles(): CSSResultGroup;
    protected static ariaConfig: {
        readonly label: "ARIA_AR_MODAL";
        readonly role: string;
        readonly tabindex: number;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    private [$state];
    protected [$onViewerChange](oldViewer: VntanaViewer | null, newViewer: VntanaViewer | null): void;
    protected shouldUpdate(changes: Map<any, any>): boolean;
    protected isContextDisabled(): boolean;
    protected isDismissible(): boolean;
    protected updated(changes: Map<PropertyKey, any>): void;
    renderContent(): typeof nothing | lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-ar-overlay': VntanaAROverlay;
    }
}

declare class VntanaARButton extends VntanaARButtonBase<VntanaAROverlay> {
    #private;
    constructor();
    protected [$createElement](): VntanaAROverlay;
    shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    protected isContextDisabled(): boolean;
    protected isActivatable(): boolean;
    get src(): string | null;
    set src(value: string | null | undefined);
    get usdzSrc(): string | null;
    set usdzSrc(value: string | null | undefined);
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-ar-button': VntanaARButton;
    }
}

declare const VntanaCenterButton_base: Constructor<ViewerMixinInterface> & typeof ButtonBase;
declare class VntanaCenterButton extends VntanaCenterButton_base {
    #private;
    protected static ariaConfig: {
        readonly label: "ARIA_CENTER_CAMERA";
        readonly tabindex?: number;
        readonly role?: string;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    constructor();
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-center-button': VntanaCenterButton;
    }
}

declare class ZoomButton extends ViewerButton {
    #private;
    protected announcementKey: TranslationKey;
    factor: number;
    constructor();
    disconnectedCallback(): void;
    protected [$onViewerChange](_oldViewer: VntanaViewer | null, _newViewer: VntanaViewer | null): void;
}
declare class VntanaZoomInButton extends ZoomButton {
    protected static ariaConfig: {
        readonly label: "ARIA_ZOOM_IN";
        readonly tabindex?: number;
        readonly role?: string;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    constructor();
    render(): lit_html.TemplateResult<1>;
}
declare class VntanaZoomOutButton extends ZoomButton {
    protected static ariaConfig: {
        readonly label: "ARIA_ZOOM_OUT";
        readonly tabindex?: number;
        readonly role?: string;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    constructor();
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-zoom-in-button': VntanaZoomInButton;
        'vntana-zoom-out-button': VntanaZoomOutButton;
    }
}

declare class PointerDragController {
    protected host: HTMLElement;
    protected target: HTMLElement | null;
    protected prevX: number;
    protected prevY: number;
    protected minWidth: number;
    protected maxWidth: number;
    protected minHeight: number;
    protected maxHeight: number;
    protected rect: DOMRect | null;
    protected parentRect: DOMRect | null;
    constructor(host: HTMLElement);
    start: (event: PointerEvent) => void;
    protected onEnd: () => void;
    protected onMove: (_event: PointerEvent) => void;
}
declare class PanController extends PointerDragController {
    protected onMove: (event: PointerEvent) => void;
}
declare class ResizeController extends PointerDragController {
    protected onMove: (event: PointerEvent) => void;
}

declare const $pan: unique symbol;
declare const $resize: unique symbol;
declare const WindowElement_base: Constructor<ViewerMixinInterface> & typeof UIElement;
declare class WindowElement extends WindowElement_base {
    #private;
    static get styles(): (lit.CSSResultOrNative | lit.CSSResultArray)[];
    protected static ariaConfig: {
        tabindex: number;
        role: string;
        label?: TranslationKey;
        toggle?: "pressed" | "expanded";
        popup?: string;
    };
    collapsed: boolean;
    protected [$pan]?: PanController;
    protected [$resize]?: ResizeController;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    renderHeader(title: string): lit_html.TemplateResult<1>;
    renderFooter(): lit_html.TemplateResult<1>;
    protected shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    protected updated(changes: Map<PropertyKey, any>): void;
}

declare const $searchQuery: unique symbol;
declare class VntanaSceneGraph extends WindowElement {
    #private;
    static get styles(): (lit.CSSResultOrNative | lit.CSSResultArray)[];
    protected static ariaConfig: {
        readonly label: "ARIA_SCENE_GRAPH";
        readonly tabindex: number;
        readonly role: string;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    private [$searchQuery];
    constructor();
    protected [$onViewerChange](oldViewer: VntanaViewer | null, newViewer: VntanaViewer | null): void;
    protected shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    shouldRender(): boolean;
    render(): lit_html.TemplateResult<1>;
    private renderItems;
    private renderSearchResults;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-scene-graph': VntanaSceneGraph;
    }
}

declare class VntanaSceneGraphButton extends ElementButton<VntanaSceneGraph> {
    protected static ariaConfig: {
        readonly label: "ARIA_SCENE_GRAPH";
        readonly tabindex?: number;
        readonly role?: string;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    protected [$createElement](): VntanaSceneGraph;
    protected isContextDisabled(): boolean;
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-scene-graph-button': VntanaSceneGraphButton;
    }
}

declare const VntanaExplodedView_base: Constructor<ViewerMixinInterface> & typeof UIElement;
declare class VntanaExplodedView extends VntanaExplodedView_base {
    #private;
    static get styles(): CSSResultGroup;
    static shadowRootOptions: ShadowRootInit;
    protected static ariaConfig: {
        readonly label: "ARIA_EXPLODED_VIEW";
        readonly role: "group";
        readonly tabindex: 0;
    };
    protected [$onViewerChange](oldViewer: VntanaViewer | null, newViewer: VntanaViewer | null): void;
    shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    render(): lit_html.TemplateResult<1>;
    get value(): number;
}

declare const units: readonly ["m", "cm", "mm", "ft", "in"];
declare const precisions: readonly [0, 1, 2, 3, 4, 5];
type Unit = typeof units[number];
type Precision = typeof precisions[number];

type MeasurementsEvents = {
    add: {};
    remove: {};
    select: {};
    deselect: {};
    clear: {};
    edit: {};
};
type MeasurementsEventType = keyof MeasurementsEvents;

type MeasurementsAction = Exclude<MeasurementsEventType, "select" | "deselect">;
declare class VntanaMeasurements extends WindowElement {
    #private;
    static get styles(): (lit.CSSResultOrNative | lit.CSSResultArray)[];
    protected static ariaConfig: {
        readonly label: "ARIA_MEASUREMENTS";
        readonly tabindex: number;
        readonly role: string;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    used: boolean;
    selected: boolean;
    unit: Unit;
    precision: Precision;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected [$onViewerChange](oldViewer: VntanaViewer | null, newViewer: VntanaViewer | null): void;
    protected shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-measurements': VntanaMeasurements;
    }
}

declare class VntanaMeasurementsButton extends ElementButton<VntanaMeasurements> {
    protected static ariaConfig: {
        readonly label: "ARIA_MEASUREMENTS";
        readonly tabindex?: number;
        readonly role?: string;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    protected [$createElement](): VntanaMeasurements;
    protected isContextDisabled(): boolean;
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-measurements-button': VntanaMeasurementsButton;
    }
}

declare const VntanaDimensionsButton_base: Constructor<ActiveMixinInterface> & Constructor<ViewerMixinInterface> & typeof ButtonBase;
declare class VntanaDimensionsButton extends VntanaDimensionsButton_base {
    protected static ariaConfig: {
        readonly label: "ARIA_DIMENSIONS";
        readonly toggle: "pressed";
        readonly tabindex?: number;
        readonly role?: string;
        readonly popup?: string;
    };
    protected [$onViewerChange](oldViewer: VntanaViewer | null, newViewer: VntanaViewer | null): void;
    protected [$onActiveChange](): void;
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-dimensions-button': VntanaDimensionsButton;
    }
}

declare class VntanaInfoOverlay extends Overlay {
    #private;
    static get styles(): CSSResultGroup;
    static shadowRootOptions: ShadowRootInit;
    protected static ariaConfig: {
        readonly label: "ARIA_HELP";
        readonly role: string;
        readonly tabindex: number;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    protected shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    isContextDisabled(): boolean;
    renderContent(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-info-overlay': VntanaInfoOverlay;
    }
}

declare class VntanaInfoButton extends ElementButton<VntanaInfoOverlay> {
    protected static ariaConfig: {
        readonly label: "ARIA_HELP";
        readonly popup: "dialog";
        readonly tabindex?: number;
        readonly role?: string;
        readonly toggle?: "pressed" | "expanded";
    };
    protected [$createElement](): VntanaInfoOverlay;
    protected isContextDisabled(): boolean;
    updated(changes: Map<PropertyKey, any>): void;
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-info-button': VntanaInfoButton;
    }
}

export { $cancelLoad, $configuratorMode, $loadScene, $preload, VntanaARButton, VntanaAROverlay, VntanaCenterButton, VntanaDimensionsButton, VntanaExplodedView, VntanaFSButton, VntanaHotspot, VntanaInfoButton, VntanaInfoOverlay, VntanaMeasurements, VntanaMeasurementsButton, VntanaQRButton, VntanaQROverlay, VntanaSceneGraph, VntanaSceneGraphButton, VntanaViewer, VntanaZoomInButton, VntanaZoomOutButton, deviceInfo, getXRInfo };
export type { Assemble, LoadSceneConfig, MeasurementsAction, ObjectHoverEventDetail, ObjectSelectEventDetail, SceneGraphEffect, SceneGraphIntersection, SceneGraphNode, SceneGraphNodeType };
