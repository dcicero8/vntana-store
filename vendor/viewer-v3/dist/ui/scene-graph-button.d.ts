import * as lit_html from 'lit-html';
import { E as ElementButton, e as $createElement } from '../chunks/element-base.d-CH8H1yn9.js';
import { VntanaSceneGraph } from './scene-graph.js';
import 'lit';
import '../chunks/viewer.d-uT1S5Gc4.js';
import 'three';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';
import '../chunks/window-element.d-KXsLl2hf.js';

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

export { VntanaSceneGraphButton };
