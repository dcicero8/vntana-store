import * as THREE from 'three';
import { M as Model } from '../chunks/model.d-BSoSL4IS.js';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

declare const $updateProgress: unique symbol;
declare const $release: unique symbol;
type ResourceHandleEvents = {
    "progress": {
        value: number;
    };
};
declare class ResourceHandle<T, U = T> extends THREE.EventDispatcher<ResourceHandleEvents> {
    #private;
    [$release]: (() => void) | null;
    constructor(url: string, done: Promise<U>);
    [$updateProgress](value: number): void;
    dispose(): void;
    get url(): string;
    get done(): Promise<U>;
    get data(): U | undefined;
    get progress(): number;
}
declare const enum CacheEntryState {
    LOADING = 0,
    TRANSFORMING = 1,
    READY = 2,
    FAILED = 3
}
declare class CacheEntry<T> {
    url: string;
    state: CacheEntryState;
    xhr?: XMLHttpRequest;
    done: Promise<T>;
    data?: T;
    handles: Set<ResourceHandle<T, any>>;
    progress: number;
}
type ResponseTypeMap = {
    "": string;
    "text": string;
    "arraybuffer": ArrayBuffer;
    "blob": Blob;
    "document": Document;
    "json": any;
};
declare abstract class CachedLoader<T, U = T, R extends XMLHttpRequestResponseType = "arraybuffer"> {
    #private;
    credentials: boolean;
    headers: Record<string, string>;
    abstract get responseType(): R;
    abstract transform(buffer: ResponseTypeMap[R]): Promise<T>;
    abstract dispose(data: T): void;
    abstract supply(data: T): U;
    load(url: string): ResourceHandle<unknown, U>;
    get threshold(): number;
    set threshold(value: number);
    forEach(fn: ((entry: CacheEntry<T>) => void)): void;
}

declare class ModelLoader extends CachedLoader<GLTF, Model> {
    #private;
    constructor();
    get responseType(): "arraybuffer";
    transform(buffer: ArrayBuffer): Promise<GLTF>;
    supply(data: GLTF): Model;
    dispose(gltf: GLTF): void;
    preloadDraco(): void;
    get dracoDecoderPath(): string;
    set dracoDecoderPath(value: string);
    get ktx2DecoderPath(): string;
    set ktx2DecoderPath(value: string);
}
declare const modelLoader: ModelLoader;

export { CachedLoader, modelLoader };
