import * as lit_html from 'lit-html';
import * as lit from 'lit';
import { W as WindowElement } from '../chunks/window-element.d-KXsLl2hf.js';
import { b as $onViewerChange } from '../chunks/element-base.d-CH8H1yn9.js';
import { V as VntanaViewer } from '../chunks/viewer.d-uT1S5Gc4.js';
import 'three';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';

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

export { VntanaSceneGraph };
