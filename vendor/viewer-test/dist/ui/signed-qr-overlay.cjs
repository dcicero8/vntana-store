"use strict";var n=require("../chunks/tslib.es6-CYOYv8XF.cjs"),e=require("../chunks/overlay-zTKHLU-i.cjs"),t=require("../chunks/translation-B1qcYgrv.cjs"),i=require("../chunks/element-base-u7ywLdPN.cjs"),s=require("../chunks/unsafe-html-Dzr_hgBS.cjs"),r=require("../chunks/timed-request-BcvlAgQt.cjs"),c=require("../chunks/qr-creator.es6.min-DiKmvdzr.cjs"),o=require("../chunks/inline-button-CYat8ri4.cjs"),a=require("../chunks/spinning-wheel-gbA1054K.cjs");require("../chunks/close-4-5ZJ4pOQX.cjs"),require("../chunks/state-CdzEw7iT.cjs");var h,l;exports.VntanaSignedQROverlay=class extends e.Overlay{static get styles(){return[...i.getStylesArray(super.styles),t.r(o.css_248z),t.r(a.css_248z),t.r("[part=modal] {\n  width: 308px;\n}\n\nsection {\n  padding-bottom: 5px;\n}\n\nsection > .description {\n    text-align: center;\n  }\n\nsection > .content {\n    width: 100%;\n    height: 154px;\n    flex: 1 1 auto;\n\n    display: flex;\n    flex-flow: column nowrap;\n    justify-content: center;\n    align-items: center;\n  }\n\nsection > .content > .spinning-wheel {\n      width: 80px;\n      height: 80px;\n    }\n\nsection > .content > canvas {\n      background: white;\n\n      height: 144px;\n      width: 144px;\n      max-width: 100%;\n\n      box-sizing: border-box;\n      padding: 5px;\n      margin: 8px;\n\n      overflow: hidden;\n    }\n\nsection > .content .error {\n      width: 80%;\n      height: 160px;\n\n      display: flex;\n      flex-flow: row nowrap;\n      justify-content: center;\n      align-items: center;\n      gap: 5px;\n    }\n\nsection > .content .error > .icon-container {\n        width: 20px;\n        height: 20px;\n        padding: 0;\n      }\n\nsection > .content .error > span {\n        position: relative;\n\n      }\n")]}constructor(){super(),h.set(this,new r.TimedRequest(this,{autoLoad:!0})),l.set(this,""),this.addEventListener("click",(n=>{n.composedPath()[0]===this&&this.remove()}))}shouldUpdate(n){return!0}updated(e){if(super.updated(e),n.__classPrivateFieldGet(this,h,"f").state!==r.State.PROGRESS)n.__classPrivateFieldSet(this,l,"","f");else{const e=n.__classPrivateFieldGet(this,h,"f").data||"";if(n.__classPrivateFieldGet(this,l,"f")!==e){const t=this.shadowRoot?.querySelector("canvas");if(!t)return void n.__classPrivateFieldSet(this,l,e,"f");if(e)c.QrCreator.render({text:e,radius:0,size:512,ecLevel:"L",fill:"#000000",background:"#ffffff"},t);else{const n=t?.getContext("2d");n?.clearRect(0,0,t.width,t.height)}n.__classPrivateFieldSet(this,l,e,"f")}}const t=this.shadowRoot?.querySelector("[part=modal]");t&&t.setAttribute("aria-busy",String(n.__classPrivateFieldGet(this,h,"f").state===r.State.LOADING))}isContextDisabled(){return!1}get loader(){return n.__classPrivateFieldGet(this,h,"f").loader}set loader(e){n.__classPrivateFieldGet(this,h,"f").loader=e}get timeout(){return n.__classPrivateFieldGet(this,h,"f").timeout}set timeout(e){n.__classPrivateFieldGet(this,h,"f").timeout=e}renderContent(){const e=n.__classPrivateFieldGet(this,h,"f").state,i=e===r.State.DONE||e===r.State.ERROR;return t.x`
      ${this.renderHeader("SIGNED_QR_MODAL_HEADER")}

      <section>
        <div class="description">
          ${t.t("SIGNED_QR_MODAL_TEXT")}
        </div>

        <div aria-live="polite" class="content">
          ${e===r.State.LOADING?t.x`<div class="spinning-wheel"></div>`:e===r.State.PROGRESS?t.x`<canvas role="img" aria-label=${t.t("ARIA_QR_CODE_IMAGE")}></canvas>`:e===r.State.DONE?this.renderError(t.t("SIGNED_QR_SESSION_EXPIRED")):e===r.State.ERROR?this.renderError(t.t("SIGNED_QR_SESSION_UNEXPECTED_ERROR")):t.E}
        </div>

        <div aria-live="polite">${t.t("SIGNED_QR_TIME_REMAINING")}: ${n.__classPrivateFieldGet(this,h,"f").formatTime()}</div>

        <button
          type="button"
          part="button"
          class="inline"
          ?disabled=${!i||!this.loader}
          @click=${()=>n.__classPrivateFieldGet(this,h,"f").load()}
        >
          ${t.t("SIGNED_QR_REFRESH")}
        </button>
      </section>
    `}renderError(n){return t.x`
      <div class="error">
        <div class="icon-container">
          ${s.o('<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path fill="#e15d35" d="M7.913 3.204a2.24 2.24 0 0 1 3.864.143L17.5 13.652c.855 1.541-.2 3.515-1.974 3.515H4.08c-1.775 0-2.83-1.974-1.974-3.515L7.828 3.347zm2.948.66a1.195 1.195 0 0 0-2.07-.078l-.047.078-5.722 10.305c-.492.884.138 1.94 1.057 1.94h11.447c.918 0 1.548-1.057 1.058-1.94zm-1.053 9.213c.29 0 .525.237.525.53v.006c0 .292-.235.53-.525.53h-.006a.53.53 0 0 1-.525-.53v-.007c0-.292.235-.529.525-.529zm-.531-1.896V8.15c0-.292.235-.53.525-.53s.525.237.526.53v3.031c0 .292-.236.53-.526.53a.527.527 0 0 1-.525-.53"/></svg>')}
        </div>
        <span>
          ${n}
        </span>
      </div>
    `}invalidate(){n.__classPrivateFieldGet(this,h,"f").invalidate()}},h=new WeakMap,l=new WeakMap,exports.VntanaSignedQROverlay.shadowRootOptions={...t.i.shadowRootOptions,delegatesFocus:!0},exports.VntanaSignedQROverlay.ariaConfig={...e.Overlay.ariaConfig,label:"ARIA_QR_CODE_MODAL"},exports.VntanaSignedQROverlay=n.__decorate([i.t("vntana-signed-qr-overlay")],exports.VntanaSignedQROverlay);
