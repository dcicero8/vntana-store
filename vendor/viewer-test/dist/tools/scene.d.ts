import * as three_examples_jsm_loaders_GLTFLoader_js from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFParser, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

interface RemoveSceneConfig {
    geometry?: boolean;
    textures?: boolean;
    skeletons?: boolean;
    bitmaps?: boolean;
}
declare function removeScene(scene: THREE.Object3D, config?: RemoveSceneConfig): void;
declare function instantiateGLTF(gltf: GLTF): {
    scene: THREE.Group<THREE.Object3DEventMap>;
    lights: THREE.Light[];
    cameras: THREE.Camera[];
    animations: THREE.AnimationClip[];
    variants: string[];
    associations: Map<THREE.Object3D<THREE.Object3DEventMap> | THREE.Texture<unknown, THREE.TextureEventMap> | THREE.Material<THREE.MaterialEventMap>, three_examples_jsm_loaders_GLTFLoader_js.GLTFReference>;
};
type BufferAttribute = THREE.BufferAttribute | THREE.InterleavedBufferAttribute;
type VertexCallback = (vertex: THREE.Vector3) => void;
type TriangleCallback = (triangle: THREE.Triangle) => void;
declare function getPositionAttribute(object: THREE.Object3D): BufferAttribute | undefined;
declare function traverseObjectVertices(object: THREE.Object3D, func: VertexCallback): void;
declare function traverseObjectTriangles(object: THREE.Object3D, func: TriangleCallback): void;
declare function traverseVertices(object: THREE.Object3D, func: VertexCallback): void;
declare function traverseTriangles(object: THREE.Object3D, func: TriangleCallback): void;
type VertexReducer<T> = (value: T, vertex: THREE.Vector3) => T;
type TriangleReducer<T> = (value: T, triangle: THREE.Triangle) => T;
declare function reduceObjectVertices<T>(object: THREE.Object3D, func: VertexReducer<T>, initialValue: T): T;
declare function reduceObjectTriangles<T>(object: THREE.Object3D, func: TriangleReducer<T>, initialValue: T): T;
declare function reduceVertices<T>(object: THREE.Object3D, func: (value: T, vertex: THREE.Vector3) => T, initialValue: T): T;
type MeshAssociation = {
    nodes: number;
    primitives: number;
};
declare function getMeshAssociation(mesh: THREE.Mesh, associations: GLTFParser["associations"]): {
    nodes: number;
    primitives: number;
} | undefined;
declare function getAssociatedMesh(association: MeshAssociation, associations: GLTFParser["associations"]): THREE.Mesh<any, any, any> | undefined;
declare function closestTrianglePointToPoint(triangle: THREE.Triangle, point: THREE.Vector3, target: THREE.Vector3): number;
declare function maxSquaredDistanceToBox(point: THREE.Vector3, { min, max }: THREE.Box3): number;

export { closestTrianglePointToPoint, getAssociatedMesh, getMeshAssociation, getPositionAttribute, instantiateGLTF, maxSquaredDistanceToBox, reduceObjectTriangles, reduceObjectVertices, reduceVertices, removeScene, traverseObjectTriangles, traverseObjectVertices, traverseTriangles, traverseVertices };
export type { BufferAttribute, TriangleCallback, VertexCallback };
