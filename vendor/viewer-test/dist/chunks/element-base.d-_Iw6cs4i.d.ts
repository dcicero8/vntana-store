import { LitElement, CSSResultGroup } from 'lit';
import { V as VntanaViewer } from './viewer.d-1j1utJ0k.js';
import { e as Constructor } from './LoadingMixin.d-D0oMeIyc.js';

declare const DefaultLabels: {
    readonly VIEW_IN_YOUR_SPACE: "View in Your Space";
    readonly EXPLODE: "Explode";
    readonly MEASUREMENTS_HEADER: "Measurements";
    readonly MEASUREMENTS_UNIT: "Unit";
    readonly MEASUREMENTS_PRECISION: "Precision";
    readonly MEASUREMENTS_DELETE: "Delete";
    readonly MEASUREMENTS_CLEAR: "Clear All";
    readonly SCENE_GRAPH_HEADER: "Scene Graph";
    readonly SCENE_GRAPH_SEARCH: "Search";
    readonly SCENE_GRAPH_NO_RESULTS: "No results found";
    readonly QR_MODAL_HEADER: "Scan QR Code";
    readonly QR_MODAL_TEXT: "with your mobile device to view this 3D product in your space.";
    readonly AR_MODAL_HELP_HEADER: "XR Controls";
    readonly AR_MODAL_HELP_RECENTER_TITLE: "A/X Button";
    readonly AR_MODAL_HELP_RECENTER_DESCRIPTION: "Recenter";
    readonly AR_MODAL_HELP_POSITION_TITLE: "B/Y Button";
    readonly AR_MODAL_HELP_POSITION_DESCRIPTION: "Position";
    readonly AR_MODAL_HELP_POSITION_DETAILS: "Point to the floor to position the asset, then hold the trigger button and drag to orient";
    readonly AR_MODAL_HELP_ROTATE_MOVE_TITLE: "Thumbstick";
    readonly AR_MODAL_HELP_ROTATE_DESCRIPTION: "Rotate/zoom";
    readonly AR_MODAL_HELP_TRIGGER_GRIP_TITLE: "Trigger/Grip";
    readonly AR_MODAL_HELP_TRIGGER_GRIP_DESCRIPTION: "Pick Up";
    readonly AR_MODAL_HELP_DOUBLE_TRIGGER_TITLE: "Double Trigger";
    readonly AR_MODAL_HELP_DOUBLE_TRIGGER_DESCRIPTION: "Scale";
    readonly AR_MODAL_HELP_PAUSE_TITLE: "Menu";
    readonly AR_MODAL_HELP_PAUSE_DESCRIPTION: "Pause XR";
    readonly AR_MODAL_ACTIVE_HEADER: "XR Session in Progress";
    readonly AR_MODAL_ACTIVE_TEXT: "Click Resume or Quit within the toolbar to proceed.";
    readonly AR_MODAL_ERROR_TEXT: "We are having trouble loading the experience.";
    readonly AR_MODAL_RETRY_WEBXR: "Try Again";
    readonly AR_MODAL_START_WEBXR: "Start WebXR";
    readonly AR_MODAL_TEST_WEBXR: "Test in WebXR";
    readonly AR_MODAL_EXIT_WEBXR: "Exit XR";
    readonly SIGNED_QR_MODAL_HEADER: "Test in AR";
    readonly SIGNED_QR_MODAL_TEXT: "Scan QR code with your mobile device to view this 3D product in your space.";
    readonly SIGNED_QR_TIME_REMAINING: "Time remaining";
    readonly SIGNED_QR_SESSION_EXPIRED: "Session expired";
    readonly SIGNED_QR_SESSION_UNEXPECTED_ERROR: "An unexpected error occured";
    readonly SIGNED_QR_REFRESH: "Refresh";
    readonly INFO_MODAL_HEADER: "Viewer Navigation";
    readonly INFO_DEVICE_MOUSE: "Mouse";
    readonly INFO_DEVICE_KEYBOARD: "Keyboard";
    readonly INFO_DEVICE_TOUCH: "Touch";
    readonly INFO_ACTION_ROTATE: "Rotate";
    readonly INFO_ACTION_PAN: "Move or Pan";
    readonly INFO_ACTION_ZOOM: "Zoom";
    readonly INFO_ACTION_SELECT: "Select";
    readonly INFO_ACTION_DESC_LEFT_CLICK: "Left click";
    readonly INFO_ACTION_DESC_RIGHT_CLICK: "Right click";
    readonly INFO_ACTION_DESC_DRAG: "Drag";
    readonly INFO_ACTION_DESC_SHIFT: "Shift";
    readonly INFO_ACTION_DESC_SCROLL: "Scroll";
    readonly INFO_ACTION_DESC_ARROW_KEYS: "Arrow keys";
    readonly INFO_ACTION_DESC_PLUSMINUS: "+/-";
    readonly INFO_ACTION_DESC_TAB: "Tab";
    readonly INFO_ACTION_DESC_ENTER: "Enter";
    readonly INFO_ACTION_DESC_TAP: "Tap";
    readonly INFO_ACTION_DESC_TWO_TAP: "Two finger tap";
    readonly INFO_ACTION_DESC_PINCH: "Pinch in/out";
    readonly ARIA_VIEWER_ROLE: "Interactive 3D Viewer";
    readonly ARIA_CLOSE: "Close";
    readonly ARIA_DIMENSIONS: "Dimensions";
    readonly ARIA_MEASUREMENTS: "Open measurements";
    readonly ARIA_SCENE_GRAPH: "Open scene graph";
    readonly ARIA_CENTER_CAMERA: "Center camera";
    readonly ARIA_FULLSCREEN: "Fullscreen";
    readonly ARIA_ZOOM_IN: "Zoom in";
    readonly ARIA_ZOOM_OUT: "Zoom out";
    readonly ARIA_QR_CODE: "Show QR code";
    readonly ARIA_QR_CODE_MODAL: "Scan QR code";
    readonly ARIA_AR_VIEW_IN_YOUR_SPACE: "View in your space";
    readonly ARIA_EXPLODED_VIEW: "Exploded view";
    readonly ARIA_EXPLODE: "Explode";
    readonly ARIA_QR_CODE_IMAGE: "QR code image";
    readonly ARIA_AR_MODAL: "AR modal";
    readonly ARIA_EXPAND: "Expand";
    readonly ARIA_COLLAPSE: "Collapse";
    readonly ARIA_HELP: "Show help";
    readonly ARIA_SHOW: "Show";
    readonly ARIA_HIDE: "Hide";
    readonly ARIA_INFO_DEVICE: "Input method";
    readonly ARIA_SCENE_GRAPH_SEARCH_RESULTS: "Search results";
    readonly ARIA_DECIMAL_PLACES_0: "0 decimal places";
    readonly ARIA_DECIMAL_PLACES_1: "1 decimal place";
    readonly ARIA_DECIMAL_PLACES_2: "2 decimal places";
    readonly ARIA_DECIMAL_PLACES_3: "3 decimal places";
    readonly ARIA_DECIMAL_PLACES_4: "4 decimal places";
    readonly ARIA_DECIMAL_PLACES_5: "5 decimal places";
    readonly ARIA_UNIT_M: "meters";
    readonly ARIA_UNIT_CM: "centimeters";
    readonly ARIA_UNIT_MM: "millimeters";
    readonly ARIA_UNIT_FT: "feet";
    readonly ARIA_UNIT_IN: "inches";
    readonly ARIA_CAMERA_CENTERED: "Camera centered";
    readonly ARIA_ZOOMED_IN: "Zoomed in";
    readonly ARIA_ZOOMED_OUT: "Zoomed out";
    readonly ARIA_MIN_ZOOM: "Minimum zoom reached";
    readonly ARIA_MAX_ZOOM: "Maximum zoom reached";
};
type TranslationKey = keyof typeof DefaultLabels;
type TranslationMap = Record<TranslationKey, string>;
type FormatNumber = (v: number, p?: number) => string;
declare class I18N extends EventTarget {
    set(labels?: TranslationMap | null): void;
    setFormatNumber(f: FormatNumber | null): void;
}
declare const i18n: I18N;

declare const $ancestorViewer: unique symbol;
declare const $contextDisabled: unique symbol;
declare const $i18nVersion: unique symbol;
declare const $element: unique symbol;
declare const $createElement: unique symbol;
declare const $destroyElement: unique symbol;
declare const $onViewerChange: unique symbol;
declare const $onTargetChange: unique symbol;
declare const $onActiveChange: unique symbol;
type AriaConfig = {
    "label"?: TranslationKey;
    "tabindex"?: number;
    "role"?: string;
    "toggle"?: "pressed" | "expanded";
    "popup"?: string;
};
declare class UIElement extends LitElement {
    #private;
    static get styles(): CSSResultGroup;
    protected static ariaConfig: AriaConfig;
    protected [$ancestorViewer]: VntanaViewer | null;
    private [$i18nVersion];
    hidden: boolean;
    disabled: boolean;
    private [$contextDisabled];
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected shouldUpdate(changes: Map<PropertyKey, any>): boolean;
    protected updated(changes: Map<PropertyKey, any>): void;
    get contextDisabled(): boolean;
    protected isContextDisabled(): boolean;
    protected queueUpdate: () => void;
}
interface ViewerMixinInterface {
    viewer: VntanaViewer | null;
    readonly computedViewer: VntanaViewer | null;
}
interface TargetMixinInterface {
    target: HTMLElement | null;
    readonly computedTarget: HTMLElement | null;
}
interface ActiveMixinInterface {
    active: boolean;
}
/** BUTTONS **/
declare class ButtonBase extends UIElement {
    static get styles(): CSSResultGroup;
    protected static ariaConfig: AriaConfig;
    updated(changes: Map<PropertyKey, any>): void;
}
declare const ElementButton_base: Constructor<ActiveMixinInterface> & Constructor<TargetMixinInterface> & Constructor<ViewerMixinInterface> & typeof ButtonBase;
declare abstract class ElementButton<T extends HTMLElement> extends ElementButton_base {
    #private;
    protected [$element]: T | null;
    protected abstract [$createElement](): T;
    protected [$destroyElement](): void;
    disconnectedCallback(): void;
    protected [$onActiveChange](): void;
    updated(changes: Map<PropertyKey, any>): void;
}
declare const ViewerButton: Constructor<ViewerMixinInterface> & typeof ButtonBase;
type ViewerButton = InstanceType<typeof ViewerButton>;

export { $onViewerChange as $, ButtonBase as B, ElementButton as E, UIElement as U, $createElement as a, $onTargetChange as b, $onActiveChange as c, ViewerButton as d, i18n as i };
export type { ActiveMixinInterface as A, TargetMixinInterface as T, ViewerMixinInterface as V, TranslationKey as e };
