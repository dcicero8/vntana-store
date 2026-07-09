import * as lit_html from 'lit-html';
import * as lit from 'lit';
import { W as WindowElement } from '../chunks/window-element.d-Be8OhkGI.js';
import { $ as $onViewerChange } from '../chunks/element-base.d-_Iw6cs4i.js';
import { V as VntanaViewer } from '../chunks/viewer.d-1j1utJ0k.js';
import '../chunks/LoadingMixin.d-D0oMeIyc.js';
import 'three';
import '../chunks/model.d-BSoSL4IS.js';
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
