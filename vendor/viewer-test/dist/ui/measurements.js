import{a as n,b as t,_ as i}from"../chunks/tslib.es6-DNLMNbxc.js";import{a as e,b as s,W as o}from"../chunks/window-element-ozrX5u71.js";import{t as h,g as r,c as a}from"../chunks/element-base-DQ7J_mJA.js";import{E as d,t as l,x as c,r as f,b as p,i as w}from"../chunks/translation-D2YK_YhL.js";import{r as u}from"../chunks/state-CDMH5DBt.js";import{o as m}from"../chunks/unsafe-html-BZhe6fdQ.js";import{c as v}from"../chunks/inline-button-Bzysqt4o.js";import{p as b,g,u as x}from"../chunks/context-DiF8MYW2.js";import"../chunks/close-4-BYHv-g67.js";import"../chunks/three.core-CzhMGHQv.js";import"../chunks/CSS2DRenderer-x02-UP-2.js";import"../chunks/three.module-DukJOcj8.js";var k,$,M,_,E,A,W,y,S,j,R,C,I,U,L,N,T,D,z,P,H,O,q,B;class F{constructor(i,e){var s,o,h;if(k.add(this),A.set(this,void 0),W.set(this,void 0),y.set(this,void 0),S.set(this,null),j.set(this,null),R.set(this,null),C.set(this,!1),I.set(this,void 0),L.set(this,((t,i)=>{const e=["dropdown-item"],s=n(this,S,"f")===t;return n(this,j,"f")===t&&e.push("highlighted"),s&&e.push("selected"),c`
      <div
        class=${e.join(" ")}
        ?disabled=${t.disabled}
        role="option"
        aria-label=${t.ariaLabel?l(t.ariaLabel):d}
        aria-selected=${String(s)}
        aria-disabled=${String(t.disabled||!1)}
        id="dropdown-${n(this,A,"f")}-item-${i}"
        @click=${()=>n(this,z,"f").call(this,t)}
        @mouseover=${()=>n(this,P,"f").call(this,t)}
        @mousemove=${()=>n(this,H,"f").call(this,t)}
        @mouseout=${n(this,O,"f")}
      >
        ${t.label}
        ${n(this,S,"f")===t?c`
          <div class="icon-container" aria-hidden="true">
            ${m('<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width=".5" d="M12.867 2.942a.4.4 0 0 1 .555-.11.395.395 0 0 1 .11.55l-6 8.926a.402.402 0 0 1-.615.06l-4-3.967a.394.394 0 0 1 0-.56.4.4 0 0 1 .566 0l3.654 3.624z"/></svg>')}
          </div>
        `:d}
      </div>
    `})),z.set(this,(i=>{n(this,k,"m",T).call(this,i),t(this,C,!1,"f"),this.close()})),P.set(this,(t=>{n(this,C,"f")||n(this,k,"m",D).call(this,t)})),H.set(this,(i=>{t(this,C,!1,"f"),n(this,k,"m",D).call(this,i)})),O.set(this,(n=>{t(this,j,null,"f")})),q.set(this,(i=>{switch(t(this,C,!0,"f"),i.key){case"ArrowDown":case"ArrowUp":{i.preventDefault();const t="ArrowDown"===i.key?1:-1;n(this,k,"m",B).call(this,t);break}case" ":i.preventDefault(),n(this,j,"f")&&n(this,k,"m",T).call(this,n(this,j,"f")),this.toggle();break;case"Escape":this.close();break;case"Enter":this.isOpen()&&n(this,j,"f")&&(n(this,k,"m",T).call(this,n(this,j,"f")),this.close());break;case"Home":i.preventDefault();const t=n(this,y,"f").find((n=>!n.disabled));t&&n(this,k,"m",D).call(this,t);break;case"End":i.preventDefault();const e=[...n(this,y,"f")].reverse().find((n=>!n.disabled));e&&n(this,k,"m",D).call(this,e)}})),t(this,A,(t(s=$,$,(h=n(s,$,"f",E),o=h++,h),"f",E),o),"f"),t(this,W,i,"f"),i.addController(this),t(this,y,e?.items?e.items:[],"f"),e?.selected){const t=n(this,y,"f").find((n=>n.value===e.selected));n(this,k,"m",T).call(this,t??null)}e?.onChange&&t(this,R,e.onChange,"f"),t(this,I,e?.labelId,"f"),n($,$,"f",M)||(t($,$,(t=>{const i=n($,$,"f",_);if(!i)return;const e=n(i,k,"m",N).call(i),s=t.composedPath();e&&s.includes(e)||i.close()}),"f",M),window.addEventListener("click",n($,$,"f",M)))}hostDisconnected(){this.isOpen()&&this.close()}render(){const t=n(this,j,"f")?n(this,y,"f").indexOf(n(this,j,"f")):null;return c`
      <div 
        class="dropdown ${this.isOpen()?"open":""}" 
        data-id="${n(this,A,"f")}"
        tabindex= "0"
        role="combobox"
        aria-labelledby=${n(this,I,"f")??d}
        aria-haspopup="listbox"
        aria-expanded=${String(this.isOpen())}
        aria-controls=${`dropdown-${n(this,A,"f")}-listbox`}
        aria-activedescendant=${n(this,j,"f")?`dropdown-${n(this,A,"f")}-item-${t}`:d}
        @keydown=${n(this,q,"f")}
        @blur=${()=>this.close()}
      >
        ${n(this,k,"m",U).call(this)}

        <div class="dropdown-content" role="listbox" id="dropdown-${n(this,A,"f")}-listbox" aria-hidden=${!this.isOpen()}>
          ${n(this,y,"f").map(n(this,L,"f"))}
        </div>
      </div>
    `}open(){this.isOpen()||(n($,$,"f",_)?.close(),t($,$,this,"f",_),n(this,k,"m",D).call(this,n(this,S,"f")),n(this,W,"f").requestUpdate())}close(){this.isOpen()&&(t($,$,null,"f",_),n(this,W,"f").requestUpdate())}toggle(){this.isOpen()?this.close():this.open()}isOpen(){return n($,$,"f",_)===this}setItems(i){if(t(this,y,i,"f"),n(this,S,"f")){const e=i.find((t=>t.value===n(this,S,"f").value));t(this,S,e??i[0]??null,"f")}if(n(this,j,"f")){const e=i.find((t=>t.value===n(this,j,"f").value));t(this,j,e??null,"f")}n(this,W,"f").requestUpdate()}}$=F,A=new WeakMap,W=new WeakMap,y=new WeakMap,S=new WeakMap,j=new WeakMap,R=new WeakMap,C=new WeakMap,I=new WeakMap,L=new WeakMap,z=new WeakMap,P=new WeakMap,H=new WeakMap,O=new WeakMap,q=new WeakMap,k=new WeakSet,U=function(){return c`
      <div class="dropdown-header" @click=${()=>this.toggle()}>
        <span class="dropdown-value" aria-label=${n(this,S,"f")?.ariaLabel?l(n(this,S,"f").ariaLabel):d}>${n(this,S,"f")?.label??""}</span>
        <div class="icon-container" aria-hidden="true">
          ${m(this.isOpen()?e:s)}
        </div>
      </div>
    `},N=function(){return n(this,W,"f").renderRoot.querySelector(`.dropdown[data-id="${n(this,A,"f")}"]`)},T=function(i,e=!0){i===n(this,S,"f")||i?.disabled||(t(this,S,i,"f"),n(this,W,"f").requestUpdate(),e&&i&&n(this,R,"f")&&n(this,R,"f").call(this,i.value))},D=function(i){i===n(this,j,"f")||i?.disabled||(t(this,j,i,"f"),n(this,W,"f").requestUpdate())},B=function(t){const i=n(this,y,"f").filter((n=>!n.disabled));if(0===i.length)return;const e=this.isOpen()?n(this,j,"f"):n(this,S,"f"),s=e?i.indexOf(e):-1;let o;o=-1===s?1===t?0:i.length-1:Math.max(0,Math.min(i.length-1,s+t));const h=i[o];this.isOpen()?n(this,k,"m",D).call(this,h):n(this,k,"m",T).call(this,h)},M={value:null},_={value:null},E={value:0};var G,J,K,Q,V,X,Y;let Z=class extends o{static get styles(){return[...r(super.styles),f(":host {\n  width: 250px;\n  height: 155px;\n\n  top: 19px;\n  right: 19px;\n\n  overflow: visible;\n}\n\n  :host section {\n    overflow: visible;\n    flex: 1 1 auto;\n\n    display: flex;\n    flex-flow: column nowrap;\n    justify-content: start;\n    align-items: stretch;\n    gap: 4px;\n\n    padding: 8px;\n  }\n\n  :host section .actions {\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      gap: 20px;\n      height: 40px;\n      padding: 4px 0;\n    }\n\n  :host section .actions button {\n        width: 95px;\n      }\n\n.item {\n  display: flex;\n  flex-flow: row nowrap;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.item .dropdown {\n    width: 130px;\n    height: 32px;\n  }\n"),f(v),f(".dropdown {\n  position: relative;\n\n  height: 20px;\n  width: 80px;\n\n  font-family: var(--_vn-font-family);\n  font-weight: 400;\n  font-size: 14px;\n}\n\n.dropdown:focus-visible {\n  outline: none;\n}\n\n.dropdown:focus-visible > .dropdown-header {\n    box-shadow: 0 0 0 2px var(--_vn-dropdown-border-color);\n  }\n\n.dropdown-header {\n  box-sizing: border-box;\n\n  width: 100%;\n  max-width: 100%;\n  height: 100%;\n  max-height: 100%;\n\n  padding: 8px 12px;\n\n  border-radius: 8px;\n  border: 1px solid var(--_vn-dropdown-border-color);\n\n  display: flex;\n  flex-flow: row nowrap;\n  justify-content: space-between;\n  align-items: center;\n\n  color: var(--_vn-dropdown-fg-color);\n  background-color: var(--_vn-dropdown-bg-color);\n}\n\n.dropdown-header > .icon-container {\n    height: 16px;\n    aspect-ratio: 1;\n  }\n\n.dropdown-header > .icon-container > svg {\n      color: var(--_vn-dropdown-icon-color);\n    }\n\n.dropdown-header {\n\n  margin-bottom: 4px;\n\n  cursor: pointer;\n}\n\n.dropdown-content {\n  position: absolute;\n\n  display: flex;\n  flex-flow: column nowrap;\n  justify-content: flex-start;\n  align-items: stretch;\n\n  box-sizing: border-box;\n\n  width: 100%;\n  height: -moz-max-content;\n  height: max-content;\n  max-height: 350px;\n  overflow-x: hidden;\n  overflow-y: auto;\n  z-index: 1;\n\n  padding: 8px;\n\n  border-radius: 8px;\n  border: 1px solid var(--_vn-dropdown-content-border-color);\n\n  margin: 0;\n\n  box-shadow: var(--_vn-dropdown-content-shadow);\n\n  color: var(--_vn-dropdown-content-fg-color);\n  background-color: var(--_vn-dropdown-content-bg-color);\n}\n\n.dropdown:not(.open) > .dropdown-content {\n  display: none;\n}\n\n.dropdown-item {\n  display: flex;\n  flex-flow: row nowrap;\n  justify-content: space-between;\n  align-items: center;\n\n  box-sizing: border-box;\n\n  height: 30px; \n  width: 100%;\n\n  padding: 8px;\n\n  border-radius: 8px;\n\n  color: var(--_vn-dropdown-item-fg-color);\n  background-color: var(--_vn-dropdown-item-bg-color);\n}\n\n.dropdown-item.highlighted {\n  cursor: pointer;\n}\n\n.dropdown-item.highlighted:not(.selected) {\n  color: var(--_vn-dropdown-item-highlighted-fg-color);\n  background-color: var(--_vn-dropdown-item-highlighted-bg-color);\n}\n\n.dropdown-item.selected:not(.highlighted) {\n  color: var(--_vn-dropdown-item-selected-fg-color);\n  background-color: var(--_vn-dropdown-item-selected-bg-color);\n}\n\n.dropdown-item.selected:not(.highlighted) > .icon-container {\n    color: var(--_vn-dropdown-item-selected-icon-color);\n    height: 16px;\n    width: 16px;\n  }\n\n.dropdown-item.highlighted.selected {\n  color: var(--_vn-dropdown-item-selected-highlighted-fg-color);\n  background-color: var(--_vn-dropdown-item-selected-highlighted-bg-color);\n}\n\n.dropdown-item.highlighted.selected > .icon-container {\n    color: var(--_vn-dropdown-item-selected-highlighted-icon-color);\n  }\n")]}constructor(){super(),G.set(this,null),J.set(this,void 0),K.set(this,void 0),this.used=!1,this.selected=!1,this.unit="m",this.precision=2,Q.set(this,(()=>{n(this,K,"f").setItems(b.map((n=>({value:n,label:p(10**-n,n),ariaLabel:`ARIA_DECIMAL_PLACES_${n}`}))))})),V.set(this,(()=>{n(this,G,"f").removeSelected()})),X.set(this,(()=>{n(this,G,"f").clear()})),Y.set(this,(()=>{this.used=n(this,G,"f").isActive,this.selected=n(this,G,"f").isSelected})),t(this,J,new F(this,{items:x.map((n=>({value:n,label:n,ariaLabel:`ARIA_UNIT_${n.toUpperCase()}`}))),selected:this.unit,labelId:"unit-label",onChange:n=>{this.computedViewer&&(g(this.computedViewer).formatter.unit=n)}}),"f"),t(this,K,new F(this,{items:b.map((n=>({value:n,label:p(10**-n,n),ariaLabel:`ARIA_DECIMAL_PLACES_${n}`}))),selected:this.precision,labelId:"precision-label",onChange:n=>{this.computedViewer&&(g(this.computedViewer).formatter.precision=n)}}),"f")}connectedCallback(){super.connectedCallback(),w.addEventListener("number-format-change",n(this,Q,"f"))}disconnectedCallback(){super.disconnectedCallback(),w.removeEventListener("number-format-change",n(this,Q,"f"))}[(G=new WeakMap,J=new WeakMap,K=new WeakMap,Q=new WeakMap,V=new WeakMap,X=new WeakMap,Y=new WeakMap,a)](i,e){if(i){n(this,G,"f").removeEventListener("add",n(this,Y,"f")),n(this,G,"f").removeEventListener("remove",n(this,Y,"f")),n(this,G,"f").removeEventListener("clear",n(this,Y,"f")),n(this,G,"f").removeEventListener("select",n(this,Y,"f")),t(this,G,null,"f"),this.used=!1,this.selected=!1;const e=g(i);e.measurements.disable(this),e.measurements.unref(this)}if(e){const i=g(e);t(this,G,i.measurements.ref(this),"f"),i.measurements.enable(this),n(this,G,"f").addEventListener("add",n(this,Y,"f")),n(this,G,"f").addEventListener("remove",n(this,Y,"f")),n(this,G,"f").addEventListener("clear",n(this,Y,"f")),n(this,G,"f").addEventListener("select",n(this,Y,"f")),this.used=n(this,G,"f").isActive,this.selected=n(this,G,"f").isSelected}}shouldUpdate(n){return super.shouldUpdate(n),!0}render(){return c`
      ${this.renderHeader(l("MEASUREMENTS_HEADER"))}

      <section>
        <div class="item">
          <label id="unit-label">${l("MEASUREMENTS_UNIT")}</label>
          ${n(this,J,"f").render()}
        </div>

        <div class="item">
          <label id="precision-label">${l("MEASUREMENTS_PRECISION")}</label>
          ${n(this,K,"f").render()}
        </div>

        <div class="actions">
          <button type="button" class="inline" ?disabled=${!this.selected} @click=${n(this,V,"f")}>
            ${l("MEASUREMENTS_DELETE")}
          </button>

          <button type="button" class="inline danger" ?disabled=${!this.used} @click=${n(this,X,"f")}>
            ${l("MEASUREMENTS_CLEAR")}
          </button>
        </div>
      </section>
    `}};Z.ariaConfig={...o.ariaConfig,label:"ARIA_MEASUREMENTS"},i([u()],Z.prototype,"used",void 0),i([u()],Z.prototype,"selected",void 0),i([u()],Z.prototype,"unit",void 0),i([u()],Z.prototype,"precision",void 0),Z=i([h("vntana-measurements")],Z);export{Z as VntanaMeasurements};
