import { ReactiveElement } from 'lit';
import { $ as $propertyTypes, a as $parsed, b as $properties, c as $unitTable } from './chunks/symbols.d-IEgx_IXZ.js';

declare class VntanaHotspot extends ReactiveElement {
    #private;
    static [$propertyTypes]: Map<string, any>;
    [$parsed]: Map<string, any>;
    [$properties]: Map<string, any>;
    accessor position: string | null;
    accessor path: string | null;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    queueRender(): void;
    shouldUpdate(changed: Map<PropertyKey, any>): boolean;
    get [$unitTable](): {
        m: number;
        cm: number;
        mm: number;
        r: number;
        w: number;
        h: number;
        d: number;
    };
}

declare global {
    interface HTMLElementTagNameMap {
        'vntana-hotspot': VntanaHotspot;
    }
}

export { VntanaHotspot };
