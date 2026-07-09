import * as lit_html from 'lit-html';
import * as lit from 'lit';
import { W as WindowElement } from '../chunks/window-element.d-Be8OhkGI.js';
import { $ as $onViewerChange } from '../chunks/element-base.d-_Iw6cs4i.js';
import { V as VntanaViewer } from '../chunks/viewer.d-1j1utJ0k.js';
import '../chunks/LoadingMixin.d-D0oMeIyc.js';
import 'three';
import '../chunks/model.d-BSoSL4IS.js';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';

declare const units: readonly ["m", "cm", "mm", "ft", "in"];
declare const precisions: readonly [0, 1, 2, 3, 4, 5];
type Unit = typeof units[number];
type Precision = typeof precisions[number];

declare class VntanaMeasurements extends WindowElement {
    #private;
    static get styles(): (lit.CSSResultOrNative | lit.CSSResultArray)[];
    protected static ariaConfig: {
        readonly label: "ARIA_MEASUREMENTS";
        readonly tabindex: number;
        readonly role: string;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    used: boolean;
    selected: boolean;
    unit: Unit;
    precision: Precision;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected [$onViewerChange](oldViewer: VntanaViewer | null, newViewer: VntanaViewer | null): void;
    protected shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-measurements': VntanaMeasurements;
    }
}

export { VntanaMeasurements };
