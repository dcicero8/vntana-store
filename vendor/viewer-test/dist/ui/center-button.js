import{a as s,_ as t}from"../chunks/tslib.es6-DNLMNbxc.js";import{V as e,B as r,b as n,t as a}from"../chunks/element-base-DQ7J_mJA.js";import{t as i,x as o}from"../chunks/translation-D2YK_YhL.js";import{o as h}from"../chunks/unsafe-html-BZhe6fdQ.js";import{c}from"../chunks/center-CcA9iNhI.js";import"../chunks/state-CDMH5DBt.js";var m;let l=class extends(e(r)){constructor(){super(),m.set(this,(()=>{this.computedViewer&&(this.computedViewer.centerCamera(),this.computedViewer.setExplodedStrength(this.computedViewer.explodedStrength),n(i("ARIA_CAMERA_CENTERED")))})),this.addEventListener("click",s(this,m,"f")),this.addEventListener("keydown",(t=>{" "!==t.key&&"Enter"!==t.key||(s(this,m,"f").call(this),t.preventDefault())}))}render(){return o`
      <slot>
        ${h(c)}
      </slot>
    `}};m=new WeakMap,l.ariaConfig={...r.ariaConfig,label:"ARIA_CENTER_CAMERA"},l=t([a("vntana-center-button")],l);export{l as VntanaCenterButton};
