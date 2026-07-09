import * as lit_html from 'lit-html';
import { e as Constructor } from '../chunks/LoadingMixin.d-D0oMeIyc.js';
import { A as ActiveMixinInterface, T as TargetMixinInterface, B as ButtonBase, b as $onTargetChange, c as $onActiveChange } from '../chunks/element-base.d-_Iw6cs4i.js';
import 'three';
import 'lit';
import '../chunks/model.d-BSoSL4IS.js';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';
import '../chunks/viewer.d-1j1utJ0k.js';

declare const VntanaFSButton_base: Constructor<ActiveMixinInterface> & Constructor<TargetMixinInterface> & typeof ButtonBase;
declare class VntanaFSButton extends VntanaFSButton_base {
    #private;
    protected static ariaConfig: {
        readonly label: "ARIA_FULLSCREEN";
        readonly toggle: "pressed";
        readonly tabindex?: number;
        readonly role?: string;
        readonly popup?: string;
    };
    protected [$onTargetChange](oldTarget: Element | null, newTarget: Element | null): void;
    protected [$onActiveChange](): void;
    protected isContextDisabled(): boolean;
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-fs-button': VntanaFSButton;
    }
}

export { VntanaFSButton };
