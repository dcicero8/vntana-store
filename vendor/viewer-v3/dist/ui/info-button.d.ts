import * as lit_html from 'lit-html';
import { E as ElementButton, e as $createElement } from '../chunks/element-base.d-CH8H1yn9.js';
import { VntanaInfoOverlay } from './info-overlay.js';
import 'lit';
import '../chunks/viewer.d-uT1S5Gc4.js';
import 'three';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';
import '../chunks/overlay.d-B8bN035K.js';

declare class VntanaInfoButton extends ElementButton<VntanaInfoOverlay> {
    protected static ariaConfig: {
        readonly label: "ARIA_HELP";
        readonly popup: "dialog";
        readonly tabindex?: number;
        readonly role?: string;
        readonly toggle?: "pressed" | "expanded";
    };
    protected [$createElement](): VntanaInfoOverlay;
    protected isContextDisabled(): boolean;
    updated(changes: Map<PropertyKey, any>): void;
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-info-button': VntanaInfoButton;
    }
}

export { VntanaInfoButton };
