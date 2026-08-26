import{_ as n,E as t,t as i,x as s,b as e,a as o,r as h,c as r,d as a}from"../chunks/translation-BxjLnezF.js";import{a as d,b as l,W as c}from"../chunks/window-element-BsjzkS8s.js";import{t as f,g as p,$ as w}from"../chunks/element-base-bq1Q0nEF.js";import{r as u}from"../chunks/state-xBouIXHd.js";import{o as m}from"../chunks/unsafe-html-DiegWmNE.js";import{c as v}from"../chunks/inline-button-Bzysqt4o.js";import{p as b,g,u as x}from"../chunks/context-DqlZDHAk.js";import"../chunks/close-4-BYHv-g67.js";import"../chunks/three.core-BaAcC2lX.js";import"../chunks/CSS2DRenderer-DvLmsaor.js";import"../chunks/three.module-B3nFRnSb.js";var k,$,M,_,E,W,A,y,S,j,C,R,I,U,L,N,T,D,z,P,H,O,B,q;class F{constructor(o,h){var r,a,d;if(k.add(this),W.set(this,void 0),A.set(this,void 0),y.set(this,void 0),S.set(this,null),j.set(this,null),C.set(this,null),R.set(this,!1),I.set(this,void 0),L.set(this,((e,o)=>{const h=["dropdown-item"],r=n(this,S,"f")===e;return n(this,j,"f")===e&&h.push("highlighted"),r&&h.push("selected"),s`
      <div
        class=${h.join(" ")}
        ?disabled=${e.disabled}
        role="option"
        aria-label=${e.ariaLabel?i(e.ariaLabel):t}
        aria-selected=${String(r)}
        aria-disabled=${String(e.disabled||!1)}
        id="dropdown-${n(this,W,"f")}-item-${o}"
        @click=${()=>n(this,z,"f").call(this,e)}
        @mouseover=${()=>n(this,P,"f").call(this,e)}
        @mousemove=${()=>n(this,H,"f").call(this,e)}
        @mouseout=${n(this,O,"f")}
      >
        ${e.label}
        ${n(this,S,"f")===e?s`
          <div class="icon-container" aria-hidden="true">
            ${m('<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width=".5" d="M12.867 2.942a.4.4 0 0 1 .555-.11.395.395 0 0 1 .11.55l-6 8.926a.402.402 0 0 1-.615.06l-4-3.967a.394.394 0 0 1 0-.56.4.4 0 0 1 .566 0l3.654 3.624z"/></svg>')}
          </div>
        `:t}
      </div>
    `})),z.set(this,(t=>{n(this,k,"m",T).call(this,t),e(this,R,!1,"f"),this.close()})),P.set(this,(t=>{n(this,R,"f")||n(this,k,"m",D).call(this,t)})),H.set(this,(t=>{e(this,R,!1,"f"),n(this,k,"m",D).call(this,t)})),O.set(this,(n=>{e(this,j,null,"f")})),B.set(this,(t=>{switch(e(this,R,!0,"f"),t.key){case"ArrowDown":case"ArrowUp":{t.preventDefault();const i="ArrowDown"===t.key?1:-1;n(this,k,"m",q).call(this,i);break}case" ":t.preventDefault(),n(this,j,"f")&&n(this,k,"m",T).call(this,n(this,j,"f")),this.toggle();break;case"Escape":this.close();break;case"Enter":this.isOpen()&&n(this,j,"f")&&(n(this,k,"m",T).call(this,n(this,j,"f")),this.close());break;case"Home":t.preventDefault();const i=n(this,y,"f").find((n=>!n.disabled));i&&n(this,k,"m",D).call(this,i);break;case"End":t.preventDefault();const s=[...n(this,y,"f")].reverse().find((n=>!n.disabled));s&&n(this,k,"m",D).call(this,s)}})),e(this,W,(e(r=$,$,(d=n(r,$,"f",E),a=d++,d),"f",E),a),"f"),e(this,A,o,"f"),o.addController(this),e(this,y,h?.items?h.items:[],"f"),h?.selected){const t=n(this,y,"f").find((n=>n.value===h.selected));n(this,k,"m",T).call(this,t??null)}h?.onChange&&e(this,C,h.onChange,"f"),e(this,I,h?.labelId,"f"),n($,$,"f",M)||(e($,$,(t=>{const i=n($,$,"f",_);if(!i)return;const s=n(i,k,"m",N).call(i),e=t.composedPath();s&&e.includes(s)||i.close()}),"f",M),window.addEventListener("click",n($,$,"f",M)))}hostDisconnected(){this.isOpen()&&this.close()}render(){const i=n(this,j,"f")?n(this,y,"f").indexOf(n(this,j,"f")):null;return s`
      <div 
        class="dropdown ${this.isOpen()?"open":""}" 
        data-id="${n(this,W,"f")}"
        tabindex= "0"
        role="combobox"
        aria-labelledby=${n(this,I,"f")??t}
        aria-haspopup="listbox"
        aria-expanded=${String(this.isOpen())}
        aria-controls=${`dropdown-${n(this,W,"f")}-listbox`}
        aria-activedescendant=${n(this,j,"f")?`dropdown-${n(this,W,"f")}-item-${i}`:t}
        @keydown=${n(this,B,"f")}
        @blur=${()=>this.close()}
      >
        ${n(this,k,"m",U).call(this)}

        <div class="dropdown-content" role="listbox" id="dropdown-${n(this,W,"f")}-listbox" aria-hidden=${!this.isOpen()}>
          ${n(this,y,"f").map(n(this,L,"f"))}
        </div>
      </div>
    `}open(){this.isOpen()||(n($,$,"f",_)?.close(),e($,$,this,"f",_),n(this,k,"m",D).call(this,n(this,S,"f")),n(this,A,"f").requestUpdate())}close(){this.isOpen()&&(e($,$,null,"f",_),n(this,A,"f").requestUpdate())}toggle(){this.isOpen()?this.close():this.open()}isOpen(){return n($,$,"f",_)===this}setItems(t){if(e(this,y,t,"f"),n(this,S,"f")){const i=t.find((t=>t.value===n(this,S,"f").value));e(this,S,i??t[0]??null,"f")}if(n(this,j,"f")){const i=t.find((t=>t.value===n(this,j,"f").value));e(this,j,i??null,"f")}n(this,A,"f").requestUpdate()}}$=F,W=new WeakMap,A=new WeakMap,y=new WeakMap,S=new WeakMap,j=new WeakMap,C=new WeakMap,R=new WeakMap,I=new WeakMap,L=new WeakMap,z=new WeakMap,P=new WeakMap,H=new WeakMap,O=new WeakMap,B=new WeakMap,k=new WeakSet,U=function(){return s`
      <div class="dropdown-header" @click=${()=>this.toggle()}>
        <span class="dropdown-value" aria-label=${n(this,S,"f")?.ariaLabel?i(n(this,S,"f").ariaLabel):t}>${n(this,S,"f")?.label??""}</span>
        <div class="icon-container" aria-hidden="true">
          ${m(this.isOpen()?d:l)}
        </div>
      </div>
    `},N=function(){return n(this,A,"f").renderRoot.querySelector(`.dropdown[data-id="${n(this,W,"f")}"]`)},T=function(t,i=!0){t===n(this,S,"f")||t?.disabled||(e(this,S,t,"f"),n(this,A,"f").requestUpdate(),i&&t&&n(this,C,"f")&&n(this,C,"f").call(this,t.value))},D=function(t){t===n(this,j,"f")||t?.disabled||(e(this,j,t,"f"),n(this,A,"f").requestUpdate())},q=function(t){const i=n(this,y,"f").filter((n=>!n.disabled));if(0===i.length)return;const s=this.isOpen()?n(this,j,"f"):n(this,S,"f"),e=s?i.indexOf(s):-1;let o;o=-1===e?1===t?0:i.length-1:Math.max(0,Math.min(i.length-1,e+t));const h=i[o];this.isOpen()?n(this,k,"m",D).call(this,h):n(this,k,"m",T).call(this,h)},M={value:null},_={value:null},E={value:0};var G,J,K,Q,V,X,Y,Z;let nn=class extends c{static get styles(){return[...p(super.styles),h(":host {\n  width: 250px;\n  height: 155px;\n\n  top: 19px;\n  right: 19px;\n\n  overflow: visible;\n}\n\n  :host section {\n    overflow: visible;\n    flex: 1 1 auto;\n\n    display: flex;\n    flex-flow: column nowrap;\n    justify-content: start;\n    align-items: stretch;\n    gap: 4px;\n\n    padding: 8px;\n  }\n\n  :host section .actions {\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      gap: 20px;\n      height: 40px;\n      padding: 4px 0;\n    }\n\n  :host section .actions button {\n        width: 95px;\n      }\n\n.item {\n  display: flex;\n  flex-flow: row nowrap;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.item .dropdown {\n    width: 130px;\n    height: 32px;\n  }\n"),h(v),h(".dropdown {\n  position: relative;\n\n  height: 20px;\n  width: 80px;\n\n  font-family: var(--_vn-font-family);\n  font-weight: 400;\n  font-size: 14px;\n}\n\n.dropdown:focus-visible {\n  outline: none;\n}\n\n.dropdown:focus-visible > .dropdown-header {\n    box-shadow: 0 0 0 2px var(--_vn-dropdown-border-color);\n  }\n\n.dropdown-header {\n  box-sizing: border-box;\n\n  width: 100%;\n  max-width: 100%;\n  height: 100%;\n  max-height: 100%;\n\n  padding: 8px 12px;\n\n  border-radius: 8px;\n  border: 1px solid var(--_vn-dropdown-border-color);\n\n  display: flex;\n  flex-flow: row nowrap;\n  justify-content: space-between;\n  align-items: center;\n\n  color: var(--_vn-dropdown-fg-color);\n  background-color: var(--_vn-dropdown-bg-color);\n}\n\n.dropdown-header > .icon-container {\n    height: 16px;\n    aspect-ratio: 1;\n  }\n\n.dropdown-header > .icon-container > svg {\n      color: var(--_vn-dropdown-icon-color);\n    }\n\n.dropdown-header {\n\n  margin-bottom: 4px;\n\n  cursor: pointer;\n}\n\n.dropdown-content {\n  position: absolute;\n\n  display: flex;\n  flex-flow: column nowrap;\n  justify-content: flex-start;\n  align-items: stretch;\n\n  box-sizing: border-box;\n\n  width: 100%;\n  height: -moz-max-content;\n  height: max-content;\n  max-height: 350px;\n  overflow-x: hidden;\n  overflow-y: auto;\n  z-index: 1;\n\n  padding: 8px;\n\n  border-radius: 8px;\n  border: 1px solid var(--_vn-dropdown-content-border-color);\n\n  margin: 0;\n\n  box-shadow: var(--_vn-dropdown-content-shadow);\n\n  color: var(--_vn-dropdown-content-fg-color);\n  background-color: var(--_vn-dropdown-content-bg-color);\n}\n\n.dropdown:not(.open) > .dropdown-content {\n  display: none;\n}\n\n.dropdown-item {\n  display: flex;\n  flex-flow: row nowrap;\n  justify-content: space-between;\n  align-items: center;\n\n  box-sizing: border-box;\n\n  height: 30px; \n  width: 100%;\n\n  padding: 8px;\n\n  border-radius: 8px;\n\n  color: var(--_vn-dropdown-item-fg-color);\n  background-color: var(--_vn-dropdown-item-bg-color);\n}\n\n.dropdown-item.highlighted {\n  cursor: pointer;\n}\n\n.dropdown-item.highlighted:not(.selected) {\n  color: var(--_vn-dropdown-item-highlighted-fg-color);\n  background-color: var(--_vn-dropdown-item-highlighted-bg-color);\n}\n\n.dropdown-item.selected:not(.highlighted) {\n  color: var(--_vn-dropdown-item-selected-fg-color);\n  background-color: var(--_vn-dropdown-item-selected-bg-color);\n}\n\n.dropdown-item.selected:not(.highlighted) > .icon-container {\n    color: var(--_vn-dropdown-item-selected-icon-color);\n    height: 16px;\n    width: 16px;\n  }\n\n.dropdown-item.highlighted.selected {\n  color: var(--_vn-dropdown-item-selected-highlighted-fg-color);\n  background-color: var(--_vn-dropdown-item-selected-highlighted-bg-color);\n}\n\n.dropdown-item.highlighted.selected > .icon-container {\n    color: var(--_vn-dropdown-item-selected-highlighted-icon-color);\n  }\n")]}constructor(){super(),G.set(this,null),J.set(this,void 0),K.set(this,void 0),this.used=!1,this.selected=!1,this.unit="m",this.precision=2,Q.set(this,(()=>{n(this,K,"f").setItems(b.map((n=>({value:n,label:r(10**-n,n),ariaLabel:`ARIA_DECIMAL_PLACES_${n}`}))))})),V.set(this,(()=>{n(this,G,"f").removeSelected()})),X.set(this,(()=>{n(this,G,"f").clear(!1)})),Y.set(this,(n=>{var t;this.dispatchEvent((t=n.type,new CustomEvent("measurements",{detail:{action:t},bubbles:!0})))})),Z.set(this,(()=>{this.used=n(this,G,"f").isActive,this.selected=n(this,G,"f").isSelected})),e(this,J,new F(this,{items:x.map((n=>({value:n,label:n,ariaLabel:`ARIA_UNIT_${n.toUpperCase()}`}))),selected:this.unit,labelId:"unit-label",onChange:n=>{this.computedViewer&&(g(this.computedViewer).formatter.unit=n)}}),"f"),e(this,K,new F(this,{items:b.map((n=>({value:n,label:r(10**-n,n),ariaLabel:`ARIA_DECIMAL_PLACES_${n}`}))),selected:this.precision,labelId:"precision-label",onChange:n=>{this.computedViewer&&(g(this.computedViewer).formatter.precision=n)}}),"f")}connectedCallback(){super.connectedCallback(),a.addEventListener("number-format-change",n(this,Q,"f"))}disconnectedCallback(){super.disconnectedCallback(),a.removeEventListener("number-format-change",n(this,Q,"f"))}[(G=new WeakMap,J=new WeakMap,K=new WeakMap,Q=new WeakMap,V=new WeakMap,X=new WeakMap,Y=new WeakMap,Z=new WeakMap,w)](t,i){if(t){n(this,G,"f").removeEventListener("add",n(this,Z,"f")),n(this,G,"f").removeEventListener("remove",n(this,Z,"f")),n(this,G,"f").removeEventListener("clear",n(this,Z,"f")),n(this,G,"f").removeEventListener("select",n(this,Z,"f")),n(this,G,"f").removeEventListener("add",n(this,Y,"f")),n(this,G,"f").removeEventListener("remove",n(this,Y,"f")),n(this,G,"f").removeEventListener("edit",n(this,Y,"f")),n(this,G,"f").removeEventListener("clear",n(this,Y,"f")),e(this,G,null,"f"),this.used=!1,this.selected=!1;const i=g(t);i.measurements.disable(this),i.measurements.unref(this)}if(i){const t=g(i);e(this,G,t.measurements.ref(this),"f"),t.measurements.enable(this),n(this,G,"f").addEventListener("add",n(this,Z,"f")),n(this,G,"f").addEventListener("remove",n(this,Z,"f")),n(this,G,"f").addEventListener("clear",n(this,Z,"f")),n(this,G,"f").addEventListener("select",n(this,Z,"f")),n(this,G,"f").addEventListener("add",n(this,Y,"f")),n(this,G,"f").addEventListener("remove",n(this,Y,"f")),n(this,G,"f").addEventListener("edit",n(this,Y,"f")),n(this,G,"f").addEventListener("clear",n(this,Y,"f")),this.used=n(this,G,"f").isActive,this.selected=n(this,G,"f").isSelected}}shouldUpdate(n){return super.shouldUpdate(n),!0}render(){return s`
      ${this.renderHeader(i("MEASUREMENTS_HEADER"))}

      <section>
        <div class="item">
          <label id="unit-label">${i("MEASUREMENTS_UNIT")}</label>
          ${n(this,J,"f").render()}
        </div>

        <div class="item">
          <label id="precision-label">${i("MEASUREMENTS_PRECISION")}</label>
          ${n(this,K,"f").render()}
        </div>

        <div class="actions">
          <button type="button" class="inline" ?disabled=${!this.selected} @click=${n(this,V,"f")}>
            ${i("MEASUREMENTS_DELETE")}
          </button>

          <button type="button" class="inline danger" ?disabled=${!this.used} @click=${n(this,X,"f")}>
            ${i("MEASUREMENTS_CLEAR")}
          </button>
        </div>
      </section>
    `}};nn.ariaConfig={...c.ariaConfig,label:"ARIA_MEASUREMENTS"},o([u()],nn.prototype,"used",void 0),o([u()],nn.prototype,"selected",void 0),o([u()],nn.prototype,"unit",void 0),o([u()],nn.prototype,"precision",void 0),nn=o([f("vntana-measurements")],nn);export{nn as VntanaMeasurements};
