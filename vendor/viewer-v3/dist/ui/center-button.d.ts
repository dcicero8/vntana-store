import * as lit_html from 'lit-html';
import { C as Constructor } from '../chunks/viewer.d-uT1S5Gc4.js';
import { V as ViewerMixinInterface, B as ButtonBase } from '../chunks/element-base.d-CH8H1yn9.js';
import 'three';
import 'lit';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';

declare const VntanaCenterButton_base: Constructor<ViewerMixinInterface> & typeof ButtonBase;
declare class VntanaCenterButton extends VntanaCenterButton_base {
    #private;
    protected static ariaConfig: {
        readonly label: "ARIA_CENTER_CAMERA";
        readonly tabindex?: number;
        readonly role?: string;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    constructor();
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-center-button': VntanaCenterButton;
    }
}

export { VntanaCenterButton };
