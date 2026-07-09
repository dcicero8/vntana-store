import{f as t,u as e}from"./translation-D2YK_YhL.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const r={attribute:!0,type:String,converter:e,reflect:!1,hasChanged:t},n=(t=r,e,n)=>{const{kind:o,metadata:i}=n;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===o&&((t=Object.create(t)).wrapped=!0),s.set(n.name,t),"accessor"===o){const{name:r}=n;return{set(n){const o=e.get.call(this);e.set.call(this,n),this.requestUpdate(r,o,t)},init(e){return void 0!==e&&this.C(r,void 0,t,e),e}}}if("setter"===o){const{name:r}=n;return function(n){const o=this[r];e.call(this,n),this.requestUpdate(r,o,t)}}throw Error("Unsupported decorator location: "+o)};function o(t){return(e,r)=>"object"==typeof r?n(t,e,r):((t,e,r)=>{const n=e.hasOwnProperty(r);return e.constructor.createProperty(r,t),n?Object.getOwnPropertyDescriptor(e,r):void 0})(t,e,r)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}function i(t){return o({...t,state:!0,attribute:!1})}export{o as n,i as r};
