import * as lit_html from 'lit-html';
import { CSSResultGroup } from 'lit';
import { E as ElementButton, b as $onViewerChange, e as $createElement } from '../chunks/element-base.d-CH8H1yn9.js';
import { V as VntanaViewer } from '../chunks/viewer.d-uT1S5Gc4.js';
import { VntanaAROverlay } from './ar-overlay.js';
import 'three';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';
import '../chunks/overlay.d-B8bN035K.js';

declare abstract class VntanaARButtonBase<T extends HTMLElement & {
    viewer: VntanaViewer | null;
}> extends ElementButton<T> {
    #private;
    protected static ariaConfig: {
        readonly label: "ARIA_AR_VIEW_IN_YOUR_SPACE";
        readonly popup: "dialog";
        readonly tabindex?: number;
        readonly role?: string;
        readonly toggle?: "pressed" | "expanded";
    };
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    static get styles(): CSSResultGroup;
    protected [$onViewerChange](oldViewer: VntanaViewer | null, newViewer: VntanaViewer | null): void;
    render(): lit_html.TemplateResult<1>;
    updated(changes: Map<PropertyKey, any>): void;
}

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
