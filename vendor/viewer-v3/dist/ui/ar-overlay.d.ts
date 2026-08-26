import * as lit_html from 'lit-html';
import { C as Constructor, V as VntanaViewer } from '../chunks/viewer.d-uT1S5Gc4.js';
import { V as ViewerMixinInterface, b as $onViewerChange } from '../chunks/element-base.d-CH8H1yn9.js';
import { O as Overlay } from '../chunks/overlay.d-B8bN035K.js';
import { CSSResultGroup, nothing } from 'lit';
import 'three';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';

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

export { VntanaAROverlay };
