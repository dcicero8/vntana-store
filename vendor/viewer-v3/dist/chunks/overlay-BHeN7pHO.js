import{i as n,r as t,b as e,_ as i,E as o,t as a,x as s}from"./translation-BxjLnezF.js";import{U as r,g as l}from"./element-base-bq1Q0nEF.js";import{o as d}from"./unsafe-html-DiegWmNE.js";import{c as h,a as c}from"./close-4-BYHv-g67.js";var f,p,u,m,x,b,g,w,v,k;class y extends r{static get styles(){return[...l(super.styles),t(h),t(":host {\n  all: initial;\n\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 10000;\n\n  background-color: var(--_vn-modal-overlay-color);\n\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n[part=modal] {\n  all: initial;\n  max-width: 90%;\n  max-height: 90%;\n\n  position: relative;\n  box-sizing: border-box;\n\n  padding: 20px;\n  margin: 0;\n\n  display: flex;\n  flex-flow: column nowrap;\n  justify-content: flex-start;\n  align-items: center;\n  gap: 16px;\n\n  color: var(--_vn-modal-fg-color);\n  background-color: var(--_vn-modal-bg-color);\n\n  font-family: var(--_vn-font-family);\n  font-size: 14px;\n  font-weight: 400;\n  line-height: 100%;\n  text-align: center;\n}\n\n[part=modal] header {\n  display: flex;\n  flex-flow: column nowrap;\n  justify-content: flex-start;\n  align-items: stretch;\n\n  flex: 0 0 auto;\n  width: 100%;\n  max-width: 100%;\n  overflow: hidden;\n\n  box-sizing: border-box;\n}\n\n[part=modal] header div.close-container {\n    margin-left: auto;\n  }\n\n[part=modal] header div.close-container button.close {\n      width: 16px;\n      height: 16px;\n      z-index: 5;\n    }\n\n[part=modal] header div.close-container button.close > svg {\n        color: var(--_vn-modal-close-icon-color);\n      }\n\n[part=modal] header div.title-container {\n    min-height: 0;\n\n    font-size: 16px;\n    font-weight: 700;\n    line-height: 20px;\n\n    flex-shrink: 0;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n\n    color: var(--_vn-modal-fg-color);\n  }\n\n[part=modal] section {\n  width: 100%;\n  max-width: 100%;\n  min-height: 0;\n  overflow: hidden;\n\n  flex: 1 1 auto;\n\n  display: flex;\n  flex-flow: column nowrap;\n  justify-content: flex-start;\n  align-items: center;\n  gap: 10px;\n}\n")]}constructor(){super(),f.add(this),p.set(this,!1),u.set(this,null),m.set(this,!1),x.set(this,!1),b.set(this,(()=>{e(this,x,!0,"f")})),g.set(this,(()=>{requestAnimationFrame((()=>{e(this,x,!1,"f")}))})),w.set(this,(n=>{if(i(this,x,"f"))return;const t=n.relatedTarget;if(!t||!this.shadowRoot.contains(t)){const n=this.shadowRoot.querySelector('[role="dialog"]');n?.focus()}})),v.set(this,(n=>{if("Escape"===n.key)return void(this.isDismissible()&&this.remove());if("Tab"!==n.key)return;const t=i(this,f,"m",k).call(this);if(!t.length)return;const e=t[0],o=t[t.length-1];n.shiftKey&&this.shadowRoot.activeElement===e?(n.preventDefault(),o.focus()):n.shiftKey||this.shadowRoot.activeElement!==o||(n.preventDefault(),e.focus())})),this.addEventListener("click",(n=>{if(this.isDismissible()){n.composedPath()[0]===this&&this.remove()}}))}connectedCallback(){super.connectedCallback(),e(this,u,this.getRootNode().activeElement,"f"),document.addEventListener("pointerdown",i(this,b,"f")),document.addEventListener("pointerup",i(this,g,"f"))}disconnectedCallback(){super.disconnectedCallback(),i(this,p,"f")&&i(this,u,"f")?.focus({focusVisible:i(this,m,"f")}),e(this,u,null,"f"),e(this,m,!1,"f"),e(this,p,!1,"f"),document.removeEventListener("pointerdown",i(this,b,"f")),document.removeEventListener("pointerup",i(this,g,"f"))}remove(){e(this,p,this.matches(":focus-within")||null!==this.shadowRoot.activeElement,"f"),e(this,m,!i(this,x,"f"),"f"),super.remove()}isDismissible(){return!0}render(){const n=this.constructor.ariaConfig?.label;return s`
      <div 
        part="modal"
        aria-modal="true"
        aria-label=${n?a(n):o}
        role="dialog"
        tabindex="0"
        @keydown=${i(this,v,"f")}
        @focusout=${i(this,w,"f")}
      >
        ${this.renderContent()}
      </div>
    `}renderContent(){return o}renderHeader(n){return s`
      <header>
        <div class="close-container">
          <button 
            type="button"
            class="icon close"
            aria-label=${a("ARIA_CLOSE")}
            @click=${()=>{this.remove()}}
          >
            ${d(c)}
          </button>
        </div>
        ${n?s`<div class="title-container">${a(n)}</div>`:o}
      </header>
    `}}p=new WeakMap,u=new WeakMap,m=new WeakMap,x=new WeakMap,b=new WeakMap,g=new WeakMap,w=new WeakMap,v=new WeakMap,f=new WeakSet,k=function(){return[...this.shadowRoot.querySelector('[role="dialog"]').querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])')]},y.shadowRootOptions={...n.shadowRootOptions,delegatesFocus:!0},y.ariaConfig={...r.ariaConfig,role:"none",tabindex:-1};export{y as O};
