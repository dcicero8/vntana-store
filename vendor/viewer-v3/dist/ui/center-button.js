import{t as s,_ as t,x as e,a}from"../chunks/translation-BxjLnezF.js";import{V as r,B as n,a as i,t as o}from"../chunks/element-base-bq1Q0nEF.js";import{o as h}from"../chunks/unsafe-html-DiegWmNE.js";import{c}from"../chunks/center-CcA9iNhI.js";import"../chunks/state-xBouIXHd.js";var m;let l=class extends(r(n)){constructor(){super(),m.set(this,(()=>{this.computedViewer&&(this.computedViewer.centerCamera(),this.computedViewer.setExplodedStrength(this.computedViewer.explodedStrength),i(s("ARIA_CAMERA_CENTERED")))})),this.addEventListener("click",t(this,m,"f")),this.addEventListener("keydown",(s=>{" "!==s.key&&"Enter"!==s.key||(t(this,m,"f").call(this),s.preventDefault())}))}render(){return e`
      <slot>
        ${h(c)}
      </slot>
    `}};m=new WeakMap,l.ariaConfig={...n.ariaConfig,label:"ARIA_CENTER_CAMERA"},l=a([o("vntana-center-button")],l);export{l as VntanaCenterButton};
