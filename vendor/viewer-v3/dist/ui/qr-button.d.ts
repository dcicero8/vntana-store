import * as lit_html from 'lit-html';
import { CSSResultGroup } from 'lit';
import { E as ElementButton, b as $onViewerChange, e as $createElement } from '../chunks/element-base.d-CH8H1yn9.js';
import { V as VntanaViewer } from '../chunks/viewer.d-uT1S5Gc4.js';
import { VntanaQROverlay } from './qr-overlay.js';
import 'three';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';
import '../chunks/overlay.d-B8bN035K.js';

declare abstract class VntanaQRButtonBase<T extends HTMLElement> extends ElementButton<T> {
    #private;
    static get styles(): CSSResultGroup;
    protected static ariaConfig: {
        readonly label: "ARIA_QR_CODE";
        readonly popup: "dialog";
        readonly tabindex?: number;
        readonly role?: string;
        readonly toggle?: "pressed" | "expanded";
    };
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected [$onViewerChange](oldViewer: VntanaViewer | null, newViewer: VntanaViewer | null): void;
    render(): lit_html.TemplateResult<1>;
    updated(changes: Map<PropertyKey, any>): void;
}

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
