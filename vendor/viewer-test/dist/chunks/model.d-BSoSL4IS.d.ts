import * as three_examples_jsm_loaders_GLTFLoader_js from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

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

export { Model as M };
