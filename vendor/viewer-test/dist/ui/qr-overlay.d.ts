import * as lit_html from 'lit-html';
import { O as Overlay } from '../chunks/overlay.d-DIu6C-yn.js';
import { CSSResultGroup } from 'lit';
import '../chunks/element-base.d-_Iw6cs4i.js';
import '../chunks/viewer.d-1j1utJ0k.js';
import '../chunks/LoadingMixin.d-D0oMeIyc.js';
import 'three';
import '../chunks/model.d-BSoSL4IS.js';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';

declare class VntanaQROverlay extends Overlay {
    static get styles(): CSSResultGroup;
    static shadowRootOptions: ShadowRootInit;
    protected static ariaConfig: {
        readonly label: "ARIA_QR_CODE_MODAL";
        readonly role: string;
        readonly tabindex: number;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    url: string;
    protected shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    updated(changes: Map<PropertyKey, any>): void;
    isContextDisabled(): boolean;
    protected renderContent(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-qr-overlay': VntanaQROverlay;
    }
}

export { VntanaQROverlay };
