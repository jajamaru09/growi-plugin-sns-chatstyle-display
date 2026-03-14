const P=(function(t){if(t==null)return O;if(typeof t=="function")return x(t);if(typeof t=="object")return Array.isArray(t)?$(t):E(t);if(typeof t=="string")return D(t);throw new Error("Expected function, string, or object as test")});function $(t){const e=[];let n=-1;for(;++n<t.length;)e[n]=P(t[n]);return x(a);function a(...r){let o=-1;for(;++o<e.length;)if(e[o].apply(this,r))return!0;return!1}}function E(t){const e=t;return x(n);function n(a){const r=a;let o;for(o in t)if(r[o]!==e[o])return!1;return!0}}function D(t){return x(e);function e(n){return n&&n.type===t}}function x(t){return e;function e(n,a,r){return!!(M(n)&&t.call(this,n,typeof a=="number"?a:void 0,r||void 0))}}function O(){return!0}function M(t){return t!==null&&typeof t=="object"&&"type"in t}const R=[],j=!0,A=!1,I="skip";function L(t,e,n,a){let r;typeof e=="function"&&typeof n!="function"?(a=n,n=e):r=e;const o=P(r),c=a?-1:1;i(t,void 0,[])();function i(s,g,d){const p=s&&typeof s=="object"?s:{};if(typeof p.type=="string"){const l=typeof p.tagName=="string"?p.tagName:typeof p.name=="string"?p.name:void 0;Object.defineProperty(b,"name",{value:"node ("+(s.type+(l?"<"+l+">":""))+")"})}return b;function b(){let l=R,u,h,m;if((!e||o(s,g,d[d.length-1]||void 0))&&(l=F(n(s,d)),l[0]===A))return l;if("children"in s&&s.children){const y=s;if(y.children&&l[0]!==I)for(h=(a?y.children.length:-1)+c,m=d.concat(y);h>-1&&h<y.children.length;){const f=y.children[h];if(u=i(f,h,m)(),u[0]===A)return u;h=typeof u[1]=="number"?u[1]:h+c}}return l}}}function F(t){return Array.isArray(t)?t:typeof t=="number"?[j,t]:t==null?R:[t]}function B(t,e,n,a){let r,o,c;o=e,c=n,r=a,L(t,o,i,r);function i(s,g){const d=g[g.length-1],p=d?d.children.indexOf(s):void 0;return c(s,p,d)}}const G=300*1e3,_=/^[a-zA-Z0-9_-]+$/,V=/^(\/|https?:\/\/)/,U=/!\[.*?\]\((.*?)\)/;let k=null,C=0,w=!1;function H(t){const e=new Map,n=t.split(`
`);let a=!1,r=!1;for(const o of n){const c=o.trim();if(!c.startsWith("|"))continue;const i=c.split("|").slice(1,-1).map(f=>f.trim());if(i.length<4)continue;if(!a){if(i[0]==="話者"||i[0].toLowerCase()==="speaker"){a=!0;continue}continue}if(!r&&i.every(f=>/^[-:]+$/.test(f))){r=!0;continue}const[s,g,d,p]=i,b=s.trim(),l=g.trim(),u=p.trim().toLowerCase();if(!_.test(b)||!_.test(l)||u!=="left"&&u!=="right")continue;let h="";const m=d.trim();if(m!==""){const f=m.match(U);if(!f||(h=f[1],!V.test(h)))continue}const y=`${b}_${l}`;e.set(y,{speaker:b,expression:l,iconUrl:h,position:u})}return e}async function N(){var t,e;if(!w){w=!0;try{const n=await fetch("/_api/v3/page?path=/chat-style-icons");if(!n.ok)return;const a=await n.json(),r=(e=(t=a==null?void 0:a.page)==null?void 0:t.revision)==null?void 0:e.body;if(!r)return;k=H(r),C=Date.now()}catch{}finally{w=!1}}}function T(){return k&&Date.now()-C>G&&N(),k}function W(t){const e=T();if(!e)return null;const n=t.lastIndexOf("_");if(n>0){const a=t.substring(0,n),r=t.substring(n+1),o=`${a}_${r}`,c=e.get(o);if(c)return c;const i=`${t}_default`,s=e.get(i);if(s)return s}else{const a=`${t}_default`,r=e.get(a);if(r)return r}return null}function v(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function z(t){const e=v(t.iconUrl),n=v(t.speaker);return`<div class="chat-style-avatar"><img src="${e}" alt="${n}" class="chat-style-icon" /></div>`}function K(t){return`<div class="chat-style-speaker-name">${v(t.speaker)}</div>`}const q='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>';function X(t){t.data={hName:"div",hProperties:{className:["chat-style-container"]}};const e={type:"html",value:`<div class="chat-style-reload-bar"><button class="chat-style-reload-btn" onclick="window.__chatStyleReload &amp;&amp; window.__chatStyleReload()" title="話者アイコンを再読み込み">${q}</button></div>`};t.children=[e,...t.children]}function Z(t,e){const n=e.position==="right",a=n?"chat-style-right":"chat-style-left";t.data={hName:"div",hProperties:{className:["chat-style-bubble",a]}};const r=[...t.children],o={type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-message"]}},children:r},i=e.iconUrl!==""?{type:"html",value:z(e)}:null,s={type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-content"]}},children:[{type:"html",value:K(e)},o]};n?t.children=i?[s,i]:[s]:t.children=i?[i,s]:[s]}function J(t,e){t.data={hName:"div",hProperties:{className:["chat-style-bubble","chat-style-left"]}};const n=[...t.children],a={type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-message"]}},children:n},r=v(e.replace(/_/g," ")),o={type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-content"]}},children:[{type:"html",value:`<div class="chat-style-speaker-name">${r}</div>`},a]};t.children=[o]}function Q(t,e){const n=v(e);t.type="html",t.value=`<div class="chat-style-error">⚠ [chat-style error] ${n}</div>`,t.children=[]}const S=function(){return t=>{B(t,"containerDirective",e=>{const n=e;if(n.name!=="chat-style")return;const a=T();X(n);for(const r of n.children)if(r.type==="containerDirective")if(a){const o=W(r.name);o?Z(r,o):Q(r,`話者 "${r.name}" は /chat-style-icons に定義されていません`)}else J(r,r.name)})}},Y=`/* ==========================================================
   growi-plugin-ssn-chatstyle-display
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
  transition: color 0.15s, background 0.15s;
}
.chat-style-reload-btn:hover {
  color: var(--bs-body-color, #212529);
  background: var(--bs-secondary-bg, #e9ecef);
}
.chat-style-reload-btn svg {
  width: 16px;
  height: 16px;
}
`,tt=()=>{if(growiFacade==null||growiFacade.markdownRenderer==null)return;const t=document.createElement("style");t.textContent=Y,document.head.appendChild(t),N(),window.__chatStyleReload=()=>{N().then(()=>{window.location.reload()})};const{optionsGenerators:e}=growiFacade.markdownRenderer,n=e.customGenerateViewOptions;e.customGenerateViewOptions=(...r)=>{const o=n?n(...r):e.generateViewOptions(...r);return o.remarkPlugins.push(S),o};const a=e.customGeneratePreviewOptions;e.customGeneratePreviewOptions=(...r)=>{const o=a?a(...r):e.generatePreviewOptions(...r);return o.remarkPlugins.push(S),o}},et=()=>{};window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-ssn-chatstyle-display"]={activate:tt,deactivate:et};
