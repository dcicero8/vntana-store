import{E as t,T as s}from"./translation-D2YK_YhL.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const r={CHILD:2},i=t=>(...s)=>({_$litDirective$:t,values:s});class n{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,s,r){this._$Ct=t,this._$AM=s,this._$Ci=r}_$AS(t,s){return this.update(t,s)}update(t,s){return this.render(...s)}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class e extends n{constructor(s){if(super(s),this.it=t,s.type!==r.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(r){if(r===t||null==r)return this._t=void 0,this.it=r;if(r===s)return r;if("string"!=typeof r)throw Error(this.constructor.directiveName+"() called with a non-string value");if(r===this.it)return this._t;this.it=r;const i=[r];return i.raw=i,this._t={_$litType$:this.constructor.resultType,strings:i,values:[]}}}e.directiveName="unsafeHTML",e.resultType=1;const h=i(e);export{i as e,n as i,h as o,r as t};
