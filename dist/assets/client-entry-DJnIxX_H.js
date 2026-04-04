const T=(function(t){if(t==null)return L;if(typeof t=="function")return k(t);if(typeof t=="object")return Array.isArray(t)?D(t):R(t);if(typeof t=="string")return I(t);throw new Error("Expected function, string, or object as test")});function D(t){const e=[];let n=-1;for(;++n<t.length;)e[n]=T(t[n]);return k(a);function a(...r){let i=-1;for(;++i<e.length;)if(e[i].apply(this,r))return!0;return!1}}function R(t){const e=t;return k(n);function n(a){const r=a;let i;for(i in t)if(r[i]!==e[i])return!1;return!0}}function I(t){return k(e);function e(n){return n&&n.type===t}}function k(t){return e;function e(n,a,r){return!!(M(n)&&t.call(this,n,typeof a=="number"?a:void 0,r||void 0))}}function L(){return!0}function M(t){return t!==null&&typeof t=="object"&&"type"in t}const $=[],F=!0,S=!1,B="skip";function U(t,e,n,a){let r;typeof e=="function"&&typeof n!="function"?(a=n,n=e):r=e;const i=T(r),c=a?-1:1;o(t,void 0,[])();function o(s,g,d){const p=s&&typeof s=="object"?s:{};if(typeof p.type=="string"){const l=typeof p.tagName=="string"?p.tagName:typeof p.name=="string"?p.name:void 0;Object.defineProperty(b,"name",{value:"node ("+(s.type+(l?"<"+l+">":""))+")"})}return b;function b(){let l=$,u,h,m;if((!e||i(s,g,d[d.length-1]||void 0))&&(l=V(n(s,d)),l[0]===S))return l;if("children"in s&&s.children){const y=s;if(y.children&&l[0]!==B)for(h=(a?y.children.length:-1)+c,m=d.concat(y);h>-1&&h<y.children.length;){const f=y.children[h];if(u=o(f,h,m)(),u[0]===S)return u;h=typeof u[1]=="number"?u[1]:h+c}}return l}}}function V(t){return Array.isArray(t)?t:typeof t=="number"?[F,t]:t==null?$:[t]}function G(t,e,n,a){let r,i,c;i=e,c=n,r=a,U(t,i,o,r);function o(s,g){const d=g[g.length-1],p=d?d.children.indexOf(s):void 0;return c(s,p,d)}}const z=300*1e3,_=/^[a-zA-Z0-9_-]+$/,H=/^(\/|https?:\/\/)/,W=/!\[.*?\]\((.*?)\)/;let P=null,O=0,w=!1;function K(t){const e=new Map,n=t.split(`
`);let a=!1,r=!1;for(const i of n){const c=i.trim();if(!c.startsWith("|"))continue;const o=c.split("|").slice(1,-1).map(f=>f.trim());if(o.length<4)continue;if(!a){if(o[0]==="話者"||o[0].toLowerCase()==="speaker"){a=!0;continue}continue}if(!r&&o.every(f=>/^[-:]+$/.test(f))){r=!0;continue}const[s,g,d,p]=o,b=s.trim(),l=g.trim(),u=p.trim().toLowerCase();if(!_.test(b)||!_.test(l)||u!=="left"&&u!=="right")continue;let h="";const m=d.trim();if(m!==""){const f=m.match(W);if(!f||(h=f[1],!H.test(h)))continue}const y=`${b}_${l}`;e.set(y,{speaker:b,expression:l,iconUrl:h,position:u})}return e}async function A(){var t,e;if(!w){w=!0;try{const n=await fetch("/_api/v3/page?path=/chat-style-icons");if(!n.ok)return;const a=await n.json(),r=(e=(t=a==null?void 0:a.page)==null?void 0:t.revision)==null?void 0:e.body;if(!r)return;P=K(r),O=Date.now()}catch{}finally{w=!1}}}function j(){return P&&Date.now()-O>z&&A(),P}function q(t){const e=j();if(!e)return null;const n=t.lastIndexOf("_");if(n>0){const a=t.substring(0,n),r=t.substring(n+1),i=`${a}_${r}`,c=e.get(i);if(c)return c;const o=`${t}_default`,s=e.get(o);if(s)return s}else{const a=`${t}_default`,r=e.get(a);if(r)return r}return null}function v(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function X(t){const e=v(t.iconUrl),n=v(t.speaker);return`<div class="chat-style-avatar"><img src="${e}" alt="${n}" class="chat-style-icon" /></div>`}function Z(t){return`<div class="chat-style-speaker-name">${v(t.speaker)}</div>`}function J(t){t.data={hName:"div",hProperties:{className:["chat-style-container"]}};const e={type:"html",value:'<div class="chat-style-reload-bar"><button class="chat-style-reload-btn" data-chat-style-reload title="話者アイコンを再読み込み">↻</button></div>'};t.children=[e,...t.children]}function Q(t,e){const n=e.position==="right",a=n?"chat-style-right":"chat-style-left";t.data={hName:"div",hProperties:{className:["chat-style-bubble",a]}};const r=[...t.children],i={type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-message"]}},children:r},o=e.iconUrl!==""?{type:"html",value:X(e)}:null,s={type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-content"]}},children:[{type:"html",value:Z(e)},i]};n?t.children=o?[s,o]:[s]:t.children=o?[o,s]:[s]}function Y(t,e){t.data={hName:"div",hProperties:{className:["chat-style-bubble","chat-style-left"]}};const n=[...t.children],a={type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-message"]}},children:n},r=v(e.replace(/_/g," ")),i={type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-content"]}},children:[{type:"html",value:`<div class="chat-style-speaker-name">${r}</div>`},a]};t.children=[i]}function tt(t,e){const n=v(e);t.type="html",t.value=`<div class="chat-style-error">⚠ [chat-style error] ${n}</div>`,t.children=[]}const x=function(){return t=>{G(t,"containerDirective",e=>{const n=e;if(n.name!=="chat-style")return;const a=j();J(n);for(const r of n.children)if(r.type==="containerDirective")if(a){const i=q(r.name);i?Q(r,i):tt(r,`話者 "${r.name}" は /chat-style-icons に定義されていません`)}else Y(r,r.name)})}},et=`/* ==========================================================
   growi-plugin-sns-chatstyle-display
   Bootstrap CSS変数を利用してlight/darkテーマに自動対応
   ========================================================== */

/* ----- プラグイン固有CSS変数 ----- */
:root, [data-bs-theme="light"] {
  --chat-style-container-bg: var(--bs-tertiary-bg);
  --chat-style-left-bg: var(--bs-secondary-bg);
  --chat-style-left-color: var(--bs-body-color);
  --chat-style-right-bg: #8de88b;
  --chat-style-right-color: #1a3a1a;
  --chat-style-speaker-color: var(--bs-secondary-color);
  --chat-style-icon-bg: var(--bs-secondary-bg);
  --chat-style-error-bg: var(--bs-danger-bg-subtle);
  --chat-style-error-border: var(--bs-danger-border-subtle);
  --chat-style-error-color: var(--bs-danger-text-emphasis);
}
[data-bs-theme="dark"] {
  --chat-style-right-bg: #2d6a2e;
  --chat-style-right-color: #d4f5d4;
}

/* ----- chat-style-container ----- */
.chat-style-container {
  background: var(--chat-style-container-bg);
  border-radius: 12px;
  padding: 20px 16px;
  margin: 20px 0;
}

/* ----- chat-style-bubble (共通) ----- */
.chat-style-bubble {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}
.chat-style-bubble:last-child {
  margin-bottom: 0;
}

/* ----- アバター ----- */
.chat-style-avatar {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
}
.chat-style-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--chat-style-icon-bg);
}

/* ----- コンテンツ（話者名＋吹き出し） ----- */
.chat-style-content {
  max-width: 70%;
}
.chat-style-speaker-name {
  font-size: 1em;
  color: var(--chat-style-speaker-color);
  margin-bottom: 4px;
}

/* ----- 吹き出し本体 ----- */
.chat-style-message {
  position: relative;
  padding: 10px 14px;
  border-radius: 12px;
  line-height: 1.6;
  word-break: break-word;
}
.chat-style-message p {
  margin: 0;
}
.chat-style-message p + p {
  margin-top: 8px;
}

/* ----- 左配置（相手側） ----- */
.chat-style-left {
  flex-direction: row;
}
.chat-style-left .chat-style-avatar {
  margin-right: 10px;
}
.chat-style-left .chat-style-speaker-name {
  text-align: left;
}
.chat-style-left .chat-style-message {
  background: var(--chat-style-left-bg);
  color: var(--chat-style-left-color);
}
.chat-style-left .chat-style-message::before {
  content: "";
  position: absolute;
  top: 12px;
  left: -8px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 6px 8px 6px 0;
  border-color: transparent var(--chat-style-left-bg) transparent transparent;
}

/* ----- 右配置（自分側） ----- */
.chat-style-right {
  flex-direction: row-reverse;
}
.chat-style-right .chat-style-avatar {
  margin-left: 10px;
}
.chat-style-right .chat-style-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.chat-style-right .chat-style-speaker-name {
  text-align: right;
}
.chat-style-right .chat-style-message {
  background: var(--chat-style-right-bg);
  color: var(--chat-style-right-color);
}
.chat-style-right .chat-style-message::before {
  content: "";
  position: absolute;
  top: 12px;
  right: -8px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 6px 0 6px 8px;
  border-color: transparent transparent transparent var(--chat-style-right-bg);
}

/* ----- エラー表示 ----- */
.chat-style-error {
  background: var(--chat-style-error-bg);
  border: 1px solid var(--chat-style-error-border);
  border-radius: 8px;
  color: var(--chat-style-error-color);
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 0.9em;
}

/* ----- レスポンシブ ----- */
@media (max-width: 600px) {
  .chat-style-content {
    max-width: 85%;
  }
  .chat-style-avatar {
    width: 72px;
    height: 72px;
  }
  .chat-style-icon {
    width: 72px;
    height: 72px;
  }
}

/* ----- リロードボタン ----- */
.chat-style-reload-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.chat-style-reload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--bs-border-color, #dee2e6);
  border-radius: 6px;
  background: var(--bs-body-bg, #fff);
  color: var(--bs-secondary-color, #6c757d);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: color 0.15s, background 0.15s;
}
.chat-style-reload-btn:hover {
  color: var(--bs-body-color, #212529);
  background: var(--bs-secondary-bg, #e9ecef);
}
`;let C=!1,E=!1;function nt(){if(C)return;const t=document.createElement("style");t.id="chat-style-plugin-css",t.textContent=et,document.head.appendChild(t),C=!0}function rt(){E||(document.addEventListener("click",t=>{t.target.closest("[data-chat-style-reload]")&&A().then(()=>{window.location.reload()})}),E=!0)}function N(t){const e=t.customGenerateViewOptions;t.customGenerateViewOptions=(...a)=>{const r=e?e(...a):t.generateViewOptions(...a);return r.remarkPlugins.includes(x)||r.remarkPlugins.push(x),r};const n=t.customGeneratePreviewOptions;t.customGeneratePreviewOptions=(...a)=>{const r=n?n(...a):t.generatePreviewOptions(...a);return r.remarkPlugins.includes(x)||r.remarkPlugins.push(x),r}}const at=async()=>{if(growiFacade==null)return;nt(),await A(),rt();let t=growiFacade.markdownRenderer;try{Object.defineProperty(growiFacade,"markdownRenderer",{configurable:!0,enumerable:!0,get(){return t},set(e){t=e,e!=null&&e.optionsGenerators&&N(e.optionsGenerators)}})}catch{let e;setInterval(()=>{const n=growiFacade.markdownRenderer;n&&n!==e&&(e=n,N(n.optionsGenerators))},500)}t!=null&&t.optionsGenerators&&N(t.optionsGenerators)},it=()=>{};window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-sns-chatstyle-display"]={activate:at,deactivate:it};
