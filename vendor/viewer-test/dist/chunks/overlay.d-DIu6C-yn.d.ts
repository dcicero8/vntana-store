import * as lit_html from 'lit-html';
import { U as UIElement, e as TranslationKey } from './element-base.d-_Iw6cs4i.js';
import { CSSResultGroup, LitElement } from 'lit';

declare class Overlay extends UIElement {
    #private;
    static get styles(): CSSResultGroup;
    static shadowRootOptions: ShadowRootInit;
    protected static ariaConfig: {
        role: string;
        tabindex: number;
        label?: TranslationKey;
        toggle?: "pressed" | "expanded";
        popup?: string;
    };
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    remove(): void;
    protected isDismissible(): boolean;
    render(): lit_html.TemplateResult<1>;
    protected renderContent(): ReturnType<LitElement["render"]>;
    protected renderHeader(title?: TranslationKey): lit_html.TemplateResult<1>;
}

export { Overlay as O };
