import * as lit_html from 'lit-html';
import { e as Constructor } from '../chunks/LoadingMixin.d-D0oMeIyc.js';
import { V as ViewerMixinInterface, B as ButtonBase } from '../chunks/element-base.d-_Iw6cs4i.js';
import 'three';
import 'lit';
import '../chunks/model.d-BSoSL4IS.js';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';
import '../chunks/viewer.d-1j1utJ0k.js';

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
