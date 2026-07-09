import { V as VntanaARButtonBase } from '../chunks/ar-button-base.d-Bi1ac2dp.js';
import { a as $createElement } from '../chunks/element-base.d-_Iw6cs4i.js';
import { VntanaAROverlay } from './ar-overlay.js';
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

declare class VntanaARButton extends VntanaARButtonBase<VntanaAROverlay> {
    #private;
    constructor();
    protected [$createElement](): VntanaAROverlay;
    shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    protected isContextDisabled(): boolean;
    protected isActivatable(): boolean;
    get src(): string | null;
    set src(value: string | null | undefined);
    get usdzSrc(): string | null;
    set usdzSrc(value: string | null | undefined);
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-ar-button': VntanaARButton;
    }
}

export { VntanaARButton };
