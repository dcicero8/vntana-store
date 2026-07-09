import * as lit_html from 'lit-html';
import { e as Constructor } from '../chunks/LoadingMixin.d-D0oMeIyc.js';
import { A as ActiveMixinInterface, V as ViewerMixinInterface, B as ButtonBase, $ as $onViewerChange, c as $onActiveChange } from '../chunks/element-base.d-_Iw6cs4i.js';
import { V as VntanaViewer } from '../chunks/viewer.d-1j1utJ0k.js';
import 'three';
import 'lit';
import '../chunks/model.d-BSoSL4IS.js';
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
