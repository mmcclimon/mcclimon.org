/*
Copyright (c) 2016 Chris Sauvé and Luís Rodrigues.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

(Available at https://github.com/goblindegook/littlefoot.)
*/
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).littlefoot={})}(this,(function(e){"use strict";var t=function(){return t=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},t.apply(this,arguments)},n=("undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self,{__esModule:!0}),r=n.getStyle=void 0;r=n.getStyle=function(e,t){var n,r=((null===(n=e.ownerDocument)||void 0===n?void 0:n.defaultView)||window).getComputedStyle(e);return r.getPropertyValue(t)||r[t]};var o=void 0,i=n,a=96,c=25.4;function u(e){return e?i.getStyle(e,"fontSize")||u(e.parentElement):i.getStyle(window.document.documentElement,"fontSize")}function s(e,t){e.classList.add(t)}function l(e,t){e.classList.remove(t)}function f(e){var t;null===(t=e.parentNode)||void 0===t||t.removeChild(e)}o=function e(t,n){var r,o,i=null!==(o=null===(r=null==n?void 0:n.ownerDocument)||void 0===r?void 0:r.defaultView)&&void 0!==o?o:window,s=i.document.documentElement||i.document.body,l=function(e){var t,n=e||"0",r=parseFloat(n),o=n.match(/[\d-.]+(\w+)$/);return[r,(null!==(t=null==o?void 0:o[1])&&void 0!==t?t:"").toLowerCase()]}(t),f=l[0];switch(l[1]){case"rem":return f*e(u(window.document.documentElement));case"em":return f*e(u(n),null==n?void 0:n.parentElement);case"in":return f*a;case"q":return f*a/c/4;case"mm":return f*a/c;case"cm":return f*a*10/c;case"pt":return f*a/72;case"pc":return f*a/6;case"vh":return(f*i.innerHeight||s.clientWidth)/100;case"vw":return(f*i.innerWidth||s.clientHeight)/100;case"vmin":return f*Math.min(i.innerWidth||s.clientWidth,i.innerHeight||s.clientHeight)/100;case"vmax":return f*Math.max(i.innerWidth||s.clientWidth,i.innerHeight||s.clientHeight)/100;default:return f}};var d="littlefoot__tooltip";function p(e){var t=e.offsetHeight,n=e.getBoundingClientRect().top+t/2;return{above:n,below:window.innerHeight-n}}function v(e){var t=parseFloat(r(e,"marginLeft")),n=e.offsetWidth-t;return(e.getBoundingClientRect().left+n/2)/window.innerWidth}function h(e,t){var n=2*parseInt(r(e,"marginTop"),10)+e.offsetHeight;return t.below<n&&t.below<t.above?"above":"below"}var m="is-active",g="is-changing",y="is-scrollable",b=function(e){return!!e.parentElement};function w(e){var t=e.id,n=e.button,i=e.content,a=e.host,c=e.popover,u=e.wrapper,w=!1,x=0,E="above";return{id:t,activate:function(e){var t;n.setAttribute("aria-expanded","true"),s(n,g),s(n,m),n.insertAdjacentElement("afterend",c),c.style.maxWidth=document.body.clientWidth+"px",t=i,x=Math.round(o(r(t,"maxHeight"),t)),null==e||e(c,n)},dismiss:function(e){n.setAttribute("aria-expanded","false"),s(n,g),l(n,m),l(c,m),null==e||e(c,n)},isActive:function(){return n.classList.contains(m)},isReady:function(){return!n.classList.contains(g)},isHovered:function(){return w},ready:function(){s(c,m),l(n,g)},remove:function(){f(c),l(n,g)},reposition:function(){b(c)&&(i.style.maxHeight=function(e,t,n){var o=p(t),i=h(e,o),a=parseInt(r(e,"marginTop"),10);return Math.min(n,o[i]-a-15)}(c,n,x)+"px",E=function(e,t,n){var r=h(e,p(t));if(n!==r){l(e,"is-"+n),s(e,"is-"+r);var o=100*v(t)+"%",i="above"===r?"100%":"0";e.style.transformOrigin=o+" "+i}return r}(c,n,E),c.offsetHeight<i.scrollHeight?(s(c,y),i.setAttribute("tabindex","0")):(l(c,y),i.removeAttribute("tabindex")))},resize:function(){b(c)&&(c.style.left=function(e,t){var n=e.offsetWidth;return-v(t)*n+parseInt(r(t,"marginLeft"),10)+t.offsetWidth/2}(i,n)+"px",u.style.maxWidth=i.offsetWidth+"px",function(e,t){var n=e.querySelector("."+d);n&&(n.style.left=100*v(t)+"%")}(c,n))},startHovering:function(){w=!0},stopHovering:function(){w=!1},destroy:function(){return f(a)}}}var x=void 0;x=function(e,t){void 0===t&&(t=0);var n,r=0;return Object.assign((function(){for(var o=[],i=0;i<arguments.length;i++)o[i]=arguments[i];var a=Math.max(0,r+t-Date.now());a?(clearTimeout(n),n=setTimeout((function(){r=Date.now(),e.apply(void 0,o)}),a)):(r=Date.now(),e.apply(void 0,o))}),{cancel:function(){r=0,clearTimeout(n)}})};var E="is-fully-scrolled";function S(e,t){e.addEventListener("wheel",x(function(e){return function(t){var n=t.currentTarget,r=-t.deltaY;r>0&&l(e,E),n&&r<=0&&r<n.clientHeight+n.scrollTop-n.scrollHeight&&s(e,E)}}(t),16))}var A="littlefoot__content",H="littlefoot__wrapper",T="littlefoot--print",M=function(e){return s(e,T)};function D(e,t){return Array.from(e.querySelectorAll(t))}function O(e,t){return e.querySelector("."+t)||e.firstElementChild||e}function k(e){var t=document.createElement("div");return t.innerHTML=e,t.firstElementChild}function P(e){return void 0!==e}function j(e){var t=e.parentElement,n=function(e,t){return Array.from(e.children).filter((function(e){return 8!==e.nodeType&&e.matches(t)}))}(t,":not(.littlefoot--print)"),r=n.filter((function(e){return"HR"===e.tagName}));n.length===r.length&&(r.concat(t).forEach(M),j(t))}function I(e){var t=e.parentElement;f(e),t.innerHTML.replace("[]","").replace("&nbsp;"," ").trim()||I(t)}function L(e,t){var n=k(e.body.outerHTML);D(n,'[href$="#'+e.referenceId+'"]').forEach(I);var r=n.innerHTML.trim();return{original:e,data:{id:String(t+1),number:t+1,reference:"lf-"+e.referenceId,content:r.startsWith("<")?r:"<p>"+r+"</p>"}}}function W(e){var t=/<%=?\s*(\w+?)\s*%>/g;return function(n){return e.replace(t,(function(e,t){var r;return String(null!==(r=n[t])&&void 0!==r?r:"")}))}}function C(e){var n,r,o,i=e.allowDuplicates,a=e.anchorParentSelector,c=e.anchorPattern,u=e.buttonTemplate,s=e.contentTemplate,f=e.footnoteSelector,d=e.numberResetSelector,p=e.scope,v=function(e,t,n){return D(e,n+' a[href*="#"]').filter((function(e){return(e.href+e.rel).match(t)}))}(document,c,p).map(function(e,t,n,r){var o=[];return function(i){var a=i.href.split("#")[1],c=D(e,"#"+window.CSS.escape(a)).find((function(e){return t||!o.includes(e)})),u=null==c?void 0:c.closest(r);if(u){o.push(u);var s=i.closest(n)||i;return{reference:s,referenceId:s.id||i.id,body:u}}}}(document,i,a,f)).filter(P).map(L).map(d?(n=d,r=0,o=null,function(e){var i=e.original,a=e.data,c=i.reference.closest(n);return r=o===c?r+1:1,o=c,{original:i,data:t(t({},a),{number:r})}}):function(e){return e}).map(function(e,t){var n=W(e),r=W(t);return function(e){var t=e.original,o=e.data,i=o.id,a=k('<span class="'.concat("littlefoot",'">').concat(n(o),"</span>")),c=a.firstElementChild;c.setAttribute("aria-expanded","false"),c.dataset.footnoteButton="",c.dataset.footnoteId=i;var u=k(r(o));u.dataset.footnotePopover="",u.dataset.footnoteId=i;var s=O(u,H),l=O(u,A);return S(l,u),{original:t,data:o,id:i,button:c,host:a,popover:u,content:l,wrapper:s}}}(u,s)).map((function(e){return M(e.original.reference),M(e.original.body),j(e.original.body),e.original.reference.insertAdjacentElement("beforebegin",e.host),e})).map(w);return{footnotes:v,unmount:function(){v.forEach((function(e){return e.destroy()})),D(document,".littlefoot--print").forEach((function(e){return l(e,T)}))}}}var _={activateDelay:100,activateOnHover:!1,allowDuplicates:!0,allowMultiple:!1,anchorParentSelector:"sup",anchorPattern:/(fn|footnote|note)[:\-_\d]/gi,dismissDelay:100,dismissOnUnhover:!1,footnoteSelector:"li",hoverDelay:250,numberResetSelector:"",scope:"",contentTemplate:'<aside class="littlefoot__popover" id="fncontent:<% id %>"><div class="'.concat(H,'"><div class="').concat(A,'"><% content %></div></div><div class="').concat(d,'"></div></aside>'),buttonTemplate:'<button class="littlefoot__button" id="<% reference %>" title="See Footnote <% number %>"><svg role="img" aria-labelledby="title-<% reference %>" viewbox="0 0 31 6" preserveAspectRatio="xMidYMid"><title id="title-<% reference %>">Footnote <% number %></title><circle r="3" cx="3" cy="3" fill="white"></circle><circle r="3" cx="15" cy="3" fill="white"></circle><circle r="3" cx="27" cy="3" fill="white"></circle></svg></button>'};var F,z={},R={},q={get exports(){return R},set exports(e){R=e}};function U(){return F||(F=1,function(e,t){e.exports=function(){function e(){if(!(this instanceof e))return new e;this.size=0,this.uid=0,this.selectors=[],this.selectorObjects={},this.indexes=Object.create(this.indexes),this.activeIndexes=[]}var t=window.document.documentElement,n=t.matches||t.webkitMatchesSelector||t.mozMatchesSelector||t.oMatchesSelector||t.msMatchesSelector;e.prototype.matchesSelector=function(e,t){return n.call(e,t)},e.prototype.querySelectorAll=function(e,t){return t.querySelectorAll(e)},e.prototype.indexes=[];var r=/^#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;e.prototype.indexes.push({name:"ID",selector:function(e){var t;if(t=e.match(r))return t[0].slice(1)},element:function(e){if(e.id)return[e.id]}});var o=/^\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;e.prototype.indexes.push({name:"CLASS",selector:function(e){var t;if(t=e.match(o))return t[0].slice(1)},element:function(e){var t=e.className;if(t){if("string"==typeof t)return t.split(/\s/);if("object"==typeof t&&"baseVal"in t)return t.baseVal.split(/\s/)}}});var i,a=/^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;e.prototype.indexes.push({name:"TAG",selector:function(e){var t;if(t=e.match(a))return t[0].toUpperCase()},element:function(e){return[e.nodeName.toUpperCase()]}}),e.prototype.indexes.default={name:"UNIVERSAL",selector:function(){return!0},element:function(){return[!0]}},i="function"==typeof window.Map?window.Map:function(){function e(){this.map={}}return e.prototype.get=function(e){return this.map[e+" "]},e.prototype.set=function(e,t){this.map[e+" "]=t},e}();var c=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;function u(e,t){var n,r,o,i,a,u,s=(e=e.slice(0).concat(e.default)).length,l=t,f=[];do{if(c.exec(""),(o=c.exec(l))&&(l=o[3],o[2]||!l))for(n=0;n<s;n++)if(a=(u=e[n]).selector(o[1])){for(r=f.length,i=!1;r--;)if(f[r].index===u&&f[r].key===a){i=!0;break}i||f.push({index:u,key:a});break}}while(o);return f}function s(e,t){var n,r,o;for(n=0,r=e.length;n<r;n++)if(o=e[n],t.isPrototypeOf(o))return o}function l(e,t){return e.id-t.id}return e.prototype.logDefaultIndexUsed=function(){},e.prototype.add=function(e,t){var n,r,o,a,c,l,f,d,p=this.activeIndexes,v=this.selectors,h=this.selectorObjects;if("string"==typeof e){for(h[(n={id:this.uid++,selector:e,data:t}).id]=n,f=u(this.indexes,e),r=0;r<f.length;r++)a=(d=f[r]).key,(c=s(p,o=d.index))||((c=Object.create(o)).map=new i,p.push(c)),o===this.indexes.default&&this.logDefaultIndexUsed(n),(l=c.map.get(a))||(l=[],c.map.set(a,l)),l.push(n);this.size++,v.push(e)}},e.prototype.remove=function(e,t){if("string"==typeof e){var n,r,o,i,a,c,s,l,f=this.activeIndexes,d=this.selectors=[],p=this.selectorObjects,v={},h=1===arguments.length;for(n=u(this.indexes,e),o=0;o<n.length;o++)for(r=n[o],i=f.length;i--;)if(c=f[i],r.index.isPrototypeOf(c)){if(s=c.map.get(r.key))for(a=s.length;a--;)(l=s[a]).selector!==e||!h&&l.data!==t||(s.splice(a,1),v[l.id]=!0);break}for(o in v)delete p[o],this.size--;for(o in p)d.push(p[o].selector)}},e.prototype.queryAll=function(e){if(!this.selectors.length)return[];var t,n,r,o,i,a,c,u,s={},f=[],d=this.querySelectorAll(this.selectors.join(", "),e);for(t=0,r=d.length;t<r;t++)for(i=d[t],n=0,o=(a=this.matches(i)).length;n<o;n++)s[(u=a[n]).id]?c=s[u.id]:(c={id:u.id,selector:u.selector,data:u.data,elements:[]},s[u.id]=c,f.push(c)),c.elements.push(i);return f.sort(l)},e.prototype.matches=function(e){if(!e)return[];var t,n,r,o,i,a,c,u,s,f,d,p=this.activeIndexes,v={},h=[];for(t=0,o=p.length;t<o;t++)if(u=(c=p[t]).element(e))for(n=0,i=u.length;n<i;n++)if(s=c.map.get(u[n]))for(r=0,a=s.length;r<a;r++)!v[d=(f=s[r]).id]&&this.matchesSelector(e,f.selector)&&(v[d]=!0,h.push(f));return h.sort(l)},e}()}(q)),R}!function(e,t){!function(e,t){t=t&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t;var n={},r={},o=new WeakMap,i=new WeakMap,a=new WeakMap,c=Object.getOwnPropertyDescriptor(Event.prototype,"currentTarget");function u(e,t,n){var r=e[t];return e[t]=function(){return n.apply(e,arguments),r.apply(e,arguments)},e}function s(e,t,n){var r=[],o=t;do{if(1!==o.nodeType)break;var i=e.matches(o);if(i.length){var a={node:o,observers:i};n?r.unshift(a):r.push(a)}}while(o=o.parentElement);return r}function l(){o.set(this,!0)}function f(){o.set(this,!0),i.set(this,!0)}function d(){return a.get(this)||null}function p(e,t){c&&Object.defineProperty(e,"currentTarget",{configurable:!0,enumerable:!0,get:t||c.get})}function v(e){try{return e.eventPhase,!0}catch(e){return!1}}function h(e){if(v(e)){var t=(1===e.eventPhase?r:n)[e.type];if(t){var c=s(t,e.target,1===e.eventPhase);if(c.length){u(e,"stopPropagation",l),u(e,"stopImmediatePropagation",f),p(e,d);for(var h=0,m=c.length;h<m&&!o.get(e);h++){var g=c[h];a.set(e,g.node);for(var y=0,b=g.observers.length;y<b&&!i.get(e);y++)g.observers[y].data.call(g.node,e)}a.delete(e),p(e)}}}}function m(e,o,i){var a=!!(arguments.length>3&&void 0!==arguments[3]?arguments[3]:{}).capture,c=a?r:n,u=c[e];u||(u=new t,c[e]=u,document.addEventListener(e,h,a)),u.add(o,i)}function g(e,t,o){var i=!!(arguments.length>3&&void 0!==arguments[3]?arguments[3]:{}).capture,a=i?r:n,c=a[e];c&&(c.remove(t,o),c.size||(delete a[e],document.removeEventListener(e,h,i)))}function y(e,t,n){return e.dispatchEvent(new CustomEvent(t,{bubbles:!0,cancelable:!0,detail:n}))}e.fire=y,e.off=g,e.on=m,Object.defineProperty(e,"__esModule",{value:!0})}(t,U())}(0,z);var V="[data-footnote-id]",N=function(e,t){return e.target.closest(t)},B=function(e){return null==e?void 0:e.dataset.footnoteId},Y=function(e){return function(t){t.preventDefault();var n=N(t,V),r=B(n);r&&e(r)}},$=document.addEventListener,G=window.addEventListener;function J(e){var t,n,r,o=new AbortController,i=o.signal,a=(t=e.toggle,n=e.dismissAll,function(e){var r=N(e,"[data-footnote-button]"),o=B(r);o?t(o):N(e,"[data-footnote-popover]")||n()}),c=(r=e.dismissAll,function(e){27!==e.keyCode&&"Escape"!==e.key&&"Esc"!==e.key||r()}),u=x(e.repositionAll,16),s=x(e.resizeAll,16),l=Y(e.hover),f=Y(e.unhover);return $("touchend",a,{signal:i}),$("click",a,{signal:i}),$("keyup",c,{signal:i}),$("gestureend",u,{signal:i}),G("scroll",u,{signal:i}),G("resize",s,{signal:i}),z.on("mouseover",V,l),z.on("mouseout",V,f),function(){o.abort(),z.off("mouseover",V,l),z.off("mouseout",V,f)}}function K(e){void 0===e&&(e={});var n=t(t({},_),e),r=function(e,t){var n=e.footnotes,r=e.unmount,o=function(e){return function(n){n.isReady()&&(n.dismiss(t.dismissCallback),setTimeout(n.remove,e))}},i=function(e){return function(r){t.allowMultiple||n.filter((function(e){return e.id!==r.id})).forEach(o(t.dismissDelay)),r.isReady()&&(r.activate(t.activateCallback),r.reposition(),r.resize(),setTimeout(r.ready,e))}},a=function(e){return function(t){var r=n.find((function(e){return e.id===t}));r&&e(r)}};return{activate:function(e,t){return a(i(t))(e)},dismiss:function(e,t){return a(o(t))(e)},dismissAll:function(){return n.forEach(o(t.dismissDelay))},repositionAll:function(){return n.forEach((function(e){return e.reposition()}))},resizeAll:function(){return n.forEach((function(e){return e.resize()}))},toggle:a((function(e){return e.isActive()?o(t.dismissDelay)(e):i(t.activateDelay)(e)})),hover:a((function(e){e.startHovering(),t.activateOnHover&&!e.isActive()&&i(t.hoverDelay)(e)})),unhover:a((function(e){e.stopHovering(),t.dismissOnUnhover&&setTimeout((function(){return n.filter((function(e){return!e.isHovered()})).forEach(o(t.dismissDelay))}),t.hoverDelay)})),unmount:r}}(C(n),n),o=J(r);return{activate:function(e,t){void 0===t&&(t=n.activateDelay),r.activate(e,t)},dismiss:function(e,t){void 0===t&&(t=n.dismissDelay),void 0===e?r.dismissAll():r.dismiss(e,t)},unmount:function(){o(),r.unmount()},getSetting:function(e){return n[e]},updateSetting:function(e,t){n[e]=t}}}e.default=K,e.littlefoot=K,Object.defineProperty(e,"__esModule",{value:!0})}));
