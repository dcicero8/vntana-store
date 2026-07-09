import * as lit_html from 'lit-html';
import { CSSResultGroup } from 'lit';
import { E as ElementButton, $ as $onViewerChange } from './element-base.d-_Iw6cs4i.js';
import { V as VntanaViewer } from './viewer.d-1j1utJ0k.js';

declare abstract class VntanaARButtonBase<T extends HTMLElement & {
    viewer: VntanaViewer | null;
}> extends ElementButton<T> {
    #private;
    protected static ariaConfig: {
        readonly label: "ARIA_AR_VIEW_IN_YOUR_SPACE";
        readonly popup: "dialog";
        readonly tabindex?: number;
        readonly role?: string;
        readonly toggle?: "pressed" | "expanded";
    };
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    static get styles(): CSSResultGroup;
    protected [$onViewerChange](oldViewer: VntanaViewer | null, newViewer: VntanaViewer | null): void;
    render(): lit_html.TemplateResult<1>;
    updated(changes: Map<PropertyKey, any>): void;
}

export { VntanaARButtonBase as V };
