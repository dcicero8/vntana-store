import * as lit_html from 'lit-html';
import { E as ElementButton, a as $createElement } from '../chunks/element-base.d-_Iw6cs4i.js';
import { VntanaSceneGraph } from './scene-graph.js';
import 'lit';
import '../chunks/viewer.d-1j1utJ0k.js';
import '../chunks/LoadingMixin.d-D0oMeIyc.js';
import 'three';
import '../chunks/model.d-BSoSL4IS.js';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';
import '../chunks/window-element.d-Be8OhkGI.js';

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
