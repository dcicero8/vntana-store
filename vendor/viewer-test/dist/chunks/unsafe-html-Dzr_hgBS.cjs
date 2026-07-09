"use strict";var t=require("./translation-B1qcYgrv.cjs");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s={CHILD:2},r=t=>(...s)=>({_$litDirective$:t,values:s});class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,s,r){this._$Ct=t,this._$AM=s,this._$Ci=r}_$AS(t,s){return this.update(t,s)}update(t,s){return this.render(...s)}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class e extends i{constructor(r){if(super(r),this.it=t.E,r.type!==s.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(s){if(s===t.E||null==s)return this._t=void 0,this.it=s;if(s===t.T)return s;if("string"!=typeof s)throw Error(this.constructor.directiveName+"() called with a non-string value");if(s===this.it)return this._t;this.it=s;const r=[s];return r.raw=r,this._t={_$litType$:this.constructor.resultType,strings:r,values:[]}}}e.directiveName="unsafeHTML",e.resultType=1;const n=r(e);exports.e=r,exports.i=i,exports.o=n,exports.t=s;
