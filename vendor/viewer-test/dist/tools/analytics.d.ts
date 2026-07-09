import * as THREE from 'three';
import { V as VntanaViewer } from '../chunks/viewer.d-1j1utJ0k.js';
import { P as Prettify } from '../chunks/LoadingMixin.d-D0oMeIyc.js';
import 'lit';
import '../chunks/model.d-BSoSL4IS.js';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';

interface AnalyticsConfig {
    domain?: string;
    events?: Granularity;
    post?: Granularity;
    attributes?: Record<string, string>;
}
type Granularity = "coarse" | "granular" | "none";
interface __EventDataMap {
    "user-interaction": {};
    "load": {
        time: number;
        attributes: Record<string, string>;
    };
    "error": {
        msg: string;
        attributes: Record<string, string>;
    };
    "enter-fullscreen": {};
    "exit-fullscreen": {};
    "enter-qr-modal": {};
    "exit-qr-modal": {};
    "enter-ar": {
        action: "scan" | "click";
    };
    "exit-ar": {};
    "recenter": {};
    "rotate": {};
    "pan": {};
    "zoom": {
        action: "in" | "out";
        source: "button" | "interaction";
    };
    "hotspot": {
        uuid: string;
    };
    "enter-measurements": {};
    "exit-measurements": {};
    "collapse-measurements": {};
    "expand-measurements": {};
    "measurements": {
        action: "add" | "remove" | "edit" | "clear" | "select";
    };
    "enter-dimensions": {};
    "exit-dimensions": {};
    "exploded-strength": {
        value: number;
    };
    "enter-scene-graph": {};
    "exit-scene-graph": {};
    "collapse-scene-graph": {};
    "expand-scene-graph": {};
    "scene-graph": {
        action: "collapse" | "expand" | "highlight" | "show" | "hide";
        name: string;
    };
    "scene-graph-search": {
        query: string;
    };
}
type DefaultHeaders = {
    sessionUUID: string;
    domain: string;
};
type CustomHeaders = {
    "error": Omit<DefaultHeaders, "sessionUUID">;
};
type HeaderEnvelope<T extends {
    [K in keyof T]: object;
}> = {
    [K in keyof T]: Prettify<(K extends keyof CustomHeaders ? CustomHeaders[K] : DefaultHeaders) & T[K]>;
};
type AnalyticsEventInterface = HeaderEnvelope<__EventDataMap>;
declare class Analytics extends THREE.EventDispatcher<AnalyticsEventInterface> {
    private viewer;
    private sessionUUID;
    private domain;
    private attributes;
    private alreadyLoaded;
    private zoomButton;
    private cameraState;
    private events;
    private post;
    private hotspot;
    private eventDebouncers;
    private postDebouncers;
    constructor(viewer: VntanaViewer, config?: AnalyticsConfig);
    dispose(): void;
    private onSceneLoad;
    private onLoad;
    private onError;
    private onChange;
    private onEnterAR;
    private onExitAR;
    private onClick;
    private onPointerDown;
    private onPointerUp;
    private createEvent;
    private handleEvent;
    private onCameraChange;
    private onCollapse;
    private onExpand;
    private onMeasurements;
    private onItemCollapse;
    private onItemExpand;
    private onItemShow;
    private onItemHide;
    private onItemHighlight;
    private onSceneGraphSearch;
}

export { Analytics };
