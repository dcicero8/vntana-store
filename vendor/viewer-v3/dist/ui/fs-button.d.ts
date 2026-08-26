import * as lit_html from 'lit-html';
import { C as Constructor } from '../chunks/viewer.d-uT1S5Gc4.js';
import { A as ActiveMixinInterface, T as TargetMixinInterface, B as ButtonBase, $ as $onTargetChange, a as $onActiveChange } from '../chunks/element-base.d-CH8H1yn9.js';
import 'three';
import 'lit';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';

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
