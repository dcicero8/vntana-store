import{_ as n,a as t,b as i}from"../chunks/tslib.es6-DNLMNbxc.js";import{O as e}from"../chunks/overlay-B317zj9g.js";import{a as s,r as o,E as r,t as a,x as c}from"../chunks/translation-D2YK_YhL.js";import{t as l,g as h}from"../chunks/element-base-DQ7J_mJA.js";import{o as d}from"../chunks/unsafe-html-BZhe6fdQ.js";import{T as p,S as f}from"../chunks/timed-request-ml3y1VQF.js";import{Q as u}from"../chunks/qr-creator.es6.min-ETQvKJVA.js";import{c as m}from"../chunks/inline-button-Bzysqt4o.js";import{c as v}from"../chunks/spinning-wheel-mJMR0Vvs.js";import"../chunks/close-4-BYHv-g67.js";import"../chunks/state-CDMH5DBt.js";var g,x;let w=class extends e{static get styles(){return[...h(super.styles),o(m),o(v),o("[part=modal] {\n  width: 308px;\n}\n\nsection {\n  padding-bottom: 5px;\n}\n\nsection > .description {\n    text-align: center;\n  }\n\nsection > .content {\n    width: 100%;\n    height: 154px;\n    flex: 1 1 auto;\n\n    display: flex;\n    flex-flow: column nowrap;\n    justify-content: center;\n    align-items: center;\n  }\n\nsection > .content > .spinning-wheel {\n      width: 80px;\n      height: 80px;\n    }\n\nsection > .content > canvas {\n      background: white;\n\n      height: 144px;\n      width: 144px;\n      max-width: 100%;\n\n      box-sizing: border-box;\n      padding: 5px;\n      margin: 8px;\n\n      overflow: hidden;\n    }\n\nsection > .content .error {\n      width: 80%;\n      height: 160px;\n\n      display: flex;\n      flex-flow: row nowrap;\n      justify-content: center;\n      align-items: center;\n      gap: 5px;\n    }\n\nsection > .content .error > .icon-container {\n        width: 20px;\n        height: 20px;\n        padding: 0;\n      }\n\nsection > .content .error > span {\n        position: relative;\n\n      }\n")]}constructor(){super(),g.set(this,new p(this,{autoLoad:!0})),x.set(this,""),this.addEventListener("click",(n=>{n.composedPath()[0]===this&&this.remove()}))}shouldUpdate(n){return!0}updated(n){if(super.updated(n),t(this,g,"f").state!==f.PROGRESS)i(this,x,"","f");else{const n=t(this,g,"f").data||"";if(t(this,x,"f")!==n){const t=this.shadowRoot?.querySelector("canvas");if(!t)return void i(this,x,n,"f");if(n)u.render({text:n,radius:0,size:512,ecLevel:"L",fill:"#000000",background:"#ffffff"},t);else{const n=t?.getContext("2d");n?.clearRect(0,0,t.width,t.height)}i(this,x,n,"f")}}const e=this.shadowRoot?.querySelector("[part=modal]");e&&e.setAttribute("aria-busy",String(t(this,g,"f").state===f.LOADING))}isContextDisabled(){return!1}get loader(){return t(this,g,"f").loader}set loader(n){t(this,g,"f").loader=n}get timeout(){return t(this,g,"f").timeout}set timeout(n){t(this,g,"f").timeout=n}renderContent(){const n=t(this,g,"f").state,i=n===f.DONE||n===f.ERROR;return c`
      ${this.renderHeader("SIGNED_QR_MODAL_HEADER")}

      <section>
        <div class="description">
          ${a("SIGNED_QR_MODAL_TEXT")}
        </div>

        <div aria-live="polite" class="content">
          ${n===f.LOADING?c`<div class="spinning-wheel"></div>`:n===f.PROGRESS?c`<canvas role="img" aria-label=${a("ARIA_QR_CODE_IMAGE")}></canvas>`:n===f.DONE?this.renderError(a("SIGNED_QR_SESSION_EXPIRED")):n===f.ERROR?this.renderError(a("SIGNED_QR_SESSION_UNEXPECTED_ERROR")):r}
        </div>

        <div aria-live="polite">${a("SIGNED_QR_TIME_REMAINING")}: ${t(this,g,"f").formatTime()}</div>

        <button
          type="button"
          part="button"
          class="inline"
          ?disabled=${!i||!this.loader}
          @click=${()=>t(this,g,"f").load()}
        >
          ${a("SIGNED_QR_REFRESH")}
        </button>
      </section>
    `}renderError(n){return c`
      <div class="error">
        <div class="icon-container">
          ${d('<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path fill="#e15d35" d="M7.913 3.204a2.24 2.24 0 0 1 3.864.143L17.5 13.652c.855 1.541-.2 3.515-1.974 3.515H4.08c-1.775 0-2.83-1.974-1.974-3.515L7.828 3.347zm2.948.66a1.195 1.195 0 0 0-2.07-.078l-.047.078-5.722 10.305c-.492.884.138 1.94 1.057 1.94h11.447c.918 0 1.548-1.057 1.058-1.94zm-1.053 9.213c.29 0 .525.237.525.53v.006c0 .292-.235.53-.525.53h-.006a.53.53 0 0 1-.525-.53v-.007c0-.292.235-.529.525-.529zm-.531-1.896V8.15c0-.292.235-.53.525-.53s.525.237.526.53v3.031c0 .292-.236.53-.526.53a.527.527 0 0 1-.525-.53"/></svg>')}
        </div>
        <span>
          ${n}
        </span>
      </div>
    `}invalidate(){t(this,g,"f").invalidate()}};g=new WeakMap,x=new WeakMap,w.shadowRootOptions={...s.shadowRootOptions,delegatesFocus:!0},w.ariaConfig={...e.ariaConfig,label:"ARIA_QR_CODE_MODAL"},w=n([l("vntana-signed-qr-overlay")],w);export{w as VntanaSignedQROverlay};
