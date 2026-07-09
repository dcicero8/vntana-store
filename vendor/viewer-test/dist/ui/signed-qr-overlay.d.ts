import * as lit_html from 'lit-html';
import { O as Overlay } from '../chunks/overlay.d-DIu6C-yn.js';
import { CSSResultGroup } from 'lit';
import { L as LoaderType } from '../chunks/timed-request.d-Cf6EVhqX.js';
import '../chunks/element-base.d-_Iw6cs4i.js';
import '../chunks/viewer.d-1j1utJ0k.js';
import '../chunks/LoadingMixin.d-D0oMeIyc.js';
import 'three';
import '../chunks/model.d-BSoSL4IS.js';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';

declare class VntanaSignedQROverlay extends Overlay {
    #private;
    static get styles(): CSSResultGroup;
    static shadowRootOptions: ShadowRootInit;
    protected static ariaConfig: {
        readonly label: "ARIA_QR_CODE_MODAL";
        readonly role: string;
        readonly tabindex: number;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    constructor();
    protected shouldUpdate(_changes: Map<PropertyKey, any>): boolean;
    updated(changes: Map<PropertyKey, any>): void;
    isContextDisabled(): boolean;
    get loader(): LoaderType<string> | null;
    set loader(loader: LoaderType<string> | null);
    get timeout(): number | null;
    set timeout(timeout: number | null);
    renderContent(): lit_html.TemplateResult<1>;
    renderError(text: string): lit_html.TemplateResult<1>;
    invalidate(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-signed-qr-overlay': VntanaSignedQROverlay;
    }
}

export { VntanaSignedQROverlay };
