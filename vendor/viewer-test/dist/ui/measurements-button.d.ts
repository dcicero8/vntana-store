import * as lit_html from 'lit-html';
import { E as ElementButton, a as $createElement, $ as $onViewerChange } from '../chunks/element-base.d-_Iw6cs4i.js';
import '../chunks/LoadingMixin.d-D0oMeIyc.js';
import { V as VntanaViewer } from '../chunks/viewer.d-1j1utJ0k.js';
import { VntanaMeasurements } from './measurements.js';
import 'lit';
import 'three';
import '../chunks/model.d-BSoSL4IS.js';
import 'three/examples/jsm/loaders/GLTFLoader.js';
import 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../chunks/symbols.d-IEgx_IXZ.js';
import '../chunks/window-element.d-Be8OhkGI.js';

type MeasurementsEvents = {
    add: {};
    remove: {};
    select: {};
    deselect: {};
    clear: {};
    edit: {};
};
type MeasurementsEventType = keyof MeasurementsEvents;

type MeasurementsAction = Exclude<MeasurementsEventType, "select" | "deselect">;
declare class VntanaMeasurementsButton extends ElementButton<VntanaMeasurements> {
    #private;
    protected static ariaConfig: {
        readonly label: "ARIA_MEASUREMENTS";
        readonly tabindex?: number;
        readonly role?: string;
        readonly toggle?: "pressed" | "expanded";
        readonly popup?: string;
    };
    protected [$createElement](): VntanaMeasurements;
    protected [$onViewerChange](oldViewer: VntanaViewer | null, newViewer: VntanaViewer | null): void;
    protected isContextDisabled(): boolean;
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vntana-measurements-button': VntanaMeasurementsButton;
    }
}

export { VntanaMeasurementsButton };
export type { MeasurementsAction };
