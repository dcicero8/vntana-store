import * as lit_html from 'lit-html';
import { c as ViewerButton, d as TranslationKey, b as $onViewerChange } from '../chunks/element-base.d-CH8H1yn9.js';
import { V as VntanaViewer } from '../chunks/viewer.d-uT1S5Gc4.js';
import 'lit';
import 'three';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';

declare class ZoomButton extends ViewerButton {
    #private;
    protected announcementKey: TranslationKey;
    factor: number;
    constructor();
    disconnectedCallback(): void;
    protected [$onViewerChange](_oldViewer: VntanaViewer | null, _newViewer: VntanaViewer | null): void;
}
declare class VntanaZoomInButton extends ZoomButton {
    protected static ariaConfig: {
        readonly label: "ARIA_ZOOM_IN";
        readonly tabindex?: number;
        readonly role?: string;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    constructor();
    render(): lit_html.TemplateResult<1>;
}
declare class VntanaZoomOutButton extends ZoomButton {
    protected static ariaConfig: {
        readonly label: "ARIA_ZOOM_OUT";
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
        'vntana-zoom-in-button': VntanaZoomInButton;
        'vntana-zoom-out-button': VntanaZoomOutButton;
    }
}

export { VntanaZoomInButton, VntanaZoomOutButton };
