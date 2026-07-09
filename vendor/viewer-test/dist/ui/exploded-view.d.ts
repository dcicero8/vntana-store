import * as lit_html from 'lit-html';
import { e as Constructor } from '../chunks/LoadingMixin.d-D0oMeIyc.js';
import { V as ViewerMixinInterface, U as UIElement, $ as $onViewerChange } from '../chunks/element-base.d-_Iw6cs4i.js';
import { V as VntanaViewer } from '../chunks/viewer.d-1j1utJ0k.js';
import { CSSResultGroup } from 'lit';
import 'three';
import '../chunks/model.d-BSoSL4IS.js';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';

declare const VntanaExplodedView_base: Constructor<ViewerMixinInterface> & typeof UIElement;
declare class VntanaExplodedView extends VntanaExplodedView_base {
    #private;
    static get styles(): CSSResultGroup;
    static shadowRootOptions: ShadowRootInit;
    protected static ariaConfig: {
        readonly label: "ARIA_EXPLODED_VIEW";
        readonly role: "group";
        readonly tabindex: 0;
    };
    protected [$onViewerChange](oldViewer: VntanaViewer | null, newViewer: VntanaViewer | null): void;
    shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    render(): lit_html.TemplateResult<1>;
    get value(): number;
}

export { VntanaExplodedView };
