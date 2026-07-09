import * as lit_html from 'lit-html';
import { V as ViewerMixinInterface, U as UIElement, e as TranslationKey } from './element-base.d-_Iw6cs4i.js';
import * as lit from 'lit';
import { e as Constructor } from './LoadingMixin.d-D0oMeIyc.js';

declare class PointerDragController {
    protected host: HTMLElement;
    protected target: HTMLElement | null;
    protected prevX: number;
    protected prevY: number;
    protected minWidth: number;
    protected maxWidth: number;
    protected minHeight: number;
    protected maxHeight: number;
    protected rect: DOMRect | null;
    protected parentRect: DOMRect | null;
    constructor(host: HTMLElement);
    start: (event: PointerEvent) => void;
    protected onEnd: () => void;
    protected onMove: (_event: PointerEvent) => void;
}
declare class PanController extends PointerDragController {
    protected onMove: (event: PointerEvent) => void;
}
declare class ResizeController extends PointerDragController {
    protected onMove: (event: PointerEvent) => void;
}

declare const $pan: unique symbol;
declare const $resize: unique symbol;
declare const WindowElement_base: Constructor<ViewerMixinInterface> & typeof UIElement;
declare class WindowElement extends WindowElement_base {
    #private;
    static get styles(): (lit.CSSResultOrNative | lit.CSSResultArray)[];
    protected static ariaConfig: {
        tabindex: number;
        role: string;
        label?: TranslationKey;
        toggle?: "pressed" | "expanded";
        popup?: string;
    };
    collapsed: boolean;
    protected [$pan]?: PanController;
    protected [$resize]?: ResizeController;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    renderHeader(title: string): lit_html.TemplateResult<1>;
    renderFooter(): lit_html.TemplateResult<1>;
    protected shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    protected updated(changes: Map<PropertyKey, any>): void;
}

export { WindowElement as W };
