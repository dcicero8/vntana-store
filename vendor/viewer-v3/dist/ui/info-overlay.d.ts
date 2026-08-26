import * as lit_html from 'lit-html';
import { O as Overlay } from '../chunks/overlay.d-B8bN035K.js';
import { CSSResultGroup } from 'lit';
import '../chunks/element-base.d-CH8H1yn9.js';
import '../chunks/viewer.d-uT1S5Gc4.js';
import 'three';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';

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

export { VntanaInfoOverlay };
