"use strict";var t=require("./translation-B1qcYgrv.cjs");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const e={attribute:!0,type:String,converter:t.u,reflect:!1,hasChanged:t.f},r=(t=e,r,n)=>{const{kind:o,metadata:s}=n;let i=globalThis.litPropertyMetadata.get(s);if(void 0===i&&globalThis.litPropertyMetadata.set(s,i=new Map),"setter"===o&&((t=Object.create(t)).wrapped=!0),i.set(n.name,t),"accessor"===o){const{name:e}=n;return{set(n){const o=r.get.call(this);r.set.call(this,n),this.requestUpdate(e,o,t)},init(r){return void 0!==r&&this.C(e,void 0,t,r),r}}}if("setter"===o){const{name:e}=n;return function(n){const o=this[e];r.call(this,n),this.requestUpdate(e,o,t)}}throw Error("Unsupported decorator location: "+o)};function n(t){return(e,n)=>"object"==typeof n?r(t,e,n):((t,e,r)=>{const n=e.hasOwnProperty(r);return e.constructor.createProperty(r,t),n?Object.getOwnPropertyDescriptor(e,r):void 0})(t,e,n)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}exports.n=n,exports.r=function(t){return n({...t,state:!0,attribute:!1})};
