import * as lit_html from 'lit-html';
import { E as ElementButton, a as $createElement } from './element-base.d-_Iw6cs4i.js';
import { O as Overlay } from './overlay.d-DIu6C-yn.js';
import { CSSResultGroup } from 'lit';

declare class VntanaInfoOverlay extends Overlay {
    #private;
    static get styles(): CSSResultGroup;
    static shadowRootOptions: ShadowRootInit;
    protected static ariaConfig: {
        readonly label: "ARIA_HELP";
        readonly role: string;
        readonly tabindex: number;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    protected shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    isContextDisabled(): boolean;
    renderContent(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-info-overlay': VntanaInfoOverlay;
    }
}

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

export { VntanaInfoButton as V, VntanaInfoOverlay as a };
