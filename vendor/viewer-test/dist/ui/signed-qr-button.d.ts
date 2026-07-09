import { V as VntanaQRButtonBase } from '../chunks/qr-button-base.d-Bk4_ZuHv.js';
import { a as $createElement } from '../chunks/element-base.d-_Iw6cs4i.js';
import { L as LoaderType } from '../chunks/timed-request.d-Cf6EVhqX.js';
import { VntanaSignedQROverlay } from './signed-qr-overlay.js';
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

declare const $loader: unique symbol;
declare const $timeout: unique symbol;
declare class VntanaSignedQRButton extends VntanaQRButtonBase<VntanaSignedQROverlay> {
    private [$loader];
    private [$timeout];
    protected [$createElement](): VntanaSignedQROverlay;
    shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    updated(changes: Map<PropertyKey, any>): void;
    protected isContextDisabled(): boolean;
    get loader(): LoaderType<string> | null;
    set loader(loader: LoaderType<string> | null);
    get timeout(): number | null;
    set timeout(timeout: number | null);
    invalidate(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-signed-qr-button': VntanaSignedQRButton;
    }
}

export { VntanaSignedQRButton };
