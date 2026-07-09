import { V as VntanaQRButtonBase } from '../chunks/qr-button-base.d-Bk4_ZuHv.js';
import { a as $createElement } from '../chunks/element-base.d-_Iw6cs4i.js';
import { VntanaQROverlay } from './qr-overlay.js';
import 'lit-html';
import 'lit';
import '../chunks/viewer.d-1j1utJ0k.js';
import '../chunks/LoadingMixin.d-D0oMeIyc.js';
import 'three';
import '../chunks/model.d-BSoSL4IS.js';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';
import '../chunks/overlay.d-DIu6C-yn.js';

declare class VntanaQRButton extends VntanaQRButtonBase<VntanaQROverlay> {
    #private;
    protected [$createElement](): VntanaQROverlay;
    shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    updated(changes: Map<PropertyKey, any>): void;
    protected isContextDisabled(): boolean;
    get url(): string | null;
    set url(value: string | null | undefined);
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-qr-button': VntanaQRButton;
    }
}

export { VntanaQRButton };
