import * as lit_html from 'lit-html';
import { C as Constructor, V as VntanaViewer } from '../chunks/viewer.d-uT1S5Gc4.js';
import { A as ActiveMixinInterface, V as ViewerMixinInterface, B as ButtonBase, b as $onViewerChange, a as $onActiveChange } from '../chunks/element-base.d-CH8H1yn9.js';
import 'three';
import 'lit';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';

declare const VntanaDimensionsButton_base: Constructor<ActiveMixinInterface> & Constructor<ViewerMixinInterface> & typeof ButtonBase;
declare class VntanaDimensionsButton extends VntanaDimensionsButton_base {
    protected static ariaConfig: {
        readonly label: "ARIA_DIMENSIONS";
        readonly toggle: "pressed";
        readonly tabindex?: number;
        readonly role?: string;
        readonly popup?: string;
    };
    protected [$onViewerChange](oldViewer: VntanaViewer | null, newViewer: VntanaViewer | null): void;
    protected [$onActiveChange](): void;
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-dimensions-button': VntanaDimensionsButton;
    }
}

export { VntanaDimensionsButton };
