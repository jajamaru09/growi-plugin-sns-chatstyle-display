const _=(function(t){if(t==null)return M;if(typeof t=="function")return k(t);if(typeof t=="object")return Array.isArray(t)?$(t):O(t);if(typeof t=="string")return D(t);throw new Error("Expected function, string, or object as test")});function $(t){const e=[];let n=-1;for(;++n<t.length;)e[n]=_(t[n]);return k(r);function r(...a){let o=-1;for(;++o<e.length;)if(e[o].apply(this,a))return!0;return!1}}function O(t){const e=t;return k(n);function n(r){const a=r;let o;for(o in t)if(a[o]!==e[o])return!1;return!0}}function D(t){return k(e);function e(n){return n&&n.type===t}}function k(t){return e;function e(n,r,a){return!!(I(n)&&t.call(this,n,typeof r=="number"?r:void 0,a||void 0))}}function M(){return!0}function I(t){return t!==null&&typeof t=="object"&&"type"in t}const C=[],j=!0,P=!1,G="skip";function L(t,e,n,r){let a;typeof e=="function"&&typeof n!="function"?(r=n,n=e):a=e;const o=_(a),c=r?-1:1;i(t,void 0,[])();function i(s,f,p){const u=s&&typeof s=="object"?s:{};if(typeof u.type=="string"){const l=typeof u.tagName=="string"?u.tagName:typeof u.name=="string"?u.name:void 0;Object.defineProperty(m,"name",{value:"node ("+(s.type+(l?"<"+l+">":""))+")"})}return m;function m(){let l=C,g,h,b;if((!e||o(s,f,p[p.length-1]||void 0))&&(l=U(n(s,p)),l[0]===P))return l;if("children"in s&&s.children){const d=s;if(d.children&&l[0]!==G)for(h=(r?d.children.length:-1)+c,b=p.concat(d);h>-1&&h<d.children.length;){const y=d.children[h];if(g=i(y,h,b)(),g[0]===P)return g;h=typeof g[1]=="number"?g[1]:h+c}}return l}}}function U(t){return Array.isArray(t)?t:typeof t=="number"?[j,t]:t==null?C:[t]}function V(t,e,n,r){let a,o,c;o=e,c=n,a=r,L(t,o,i,a);function i(s,f){const p=f[f.length-1],u=p?p.children.indexOf(s):void 0;return c(s,u,p)}}const z=300*1e3,S=/^[a-zA-Z0-9_-]+$/,B=/^(\/|https?:\/\/)/,H=/!\[.*?\]\((.*?)\)/;let v=null,E=0,x=!1;function W(t){const e=new Map,n=t.split(`
`);let r=!1,a=!1;for(const o of n){const c=o.trim();if(!c.startsWith("|"))continue;const i=c.split("|").slice(1,-1).map(y=>y.trim());if(i.length<4)continue;if(!r){if(i[0]==="話者"||i[0].toLowerCase()==="speaker"){r=!0;continue}continue}if(!a&&i.every(y=>/^[-:]+$/.test(y))){a=!0;continue}const[s,f,p,u]=i,m=s.trim(),l=f.trim(),g=u.trim().toLowerCase();if(!S.test(m)||!S.test(l)||g!=="left"&&g!=="right")continue;let h="";const b=p.trim();if(b!==""){const y=b.match(H);if(!y||(h=y[1],!B.test(h)))continue}const d=`${m}_${l}`;e.set(d,{speaker:m,expression:l,iconUrl:h,position:g})}return e}async function F(){var t,e;if(!x){x=!0;try{console.log("[chat-style] Fetching /_api/v3/page?path=/chat-style-icons ...");const n=await fetch("/_api/v3/page?path=/chat-style-icons");if(!n.ok){console.warn("[chat-style] Failed to fetch /chat-style-icons:",n.status);return}const r=await n.json(),a=(e=(t=r==null?void 0:r.page)==null?void 0:t.revision)==null?void 0:e.body;if(!a){console.warn("[chat-style] /chat-style-icons page has no content");return}v=W(a),E=Date.now(),console.log("[chat-style] Parsed speaker map:",v.size,"entries"),v.forEach((o,c)=>{console.log("[chat-style]   ",c,"→",o.position,o.iconUrl)})}catch(n){console.warn("[chat-style] Error fetching speaker map:",n)}finally{x=!1}}}function A(){return v&&Date.now()-E>z&&F(),v}function K(t){const e=A();if(!e)return null;const n=t.lastIndexOf("_");if(n>0){const r=t.substring(0,n),a=t.substring(n+1),o=`${r}_${a}`,c=e.get(o);if(c)return c;const i=`${t}_default`,s=e.get(i);if(s)return s}else{const r=`${t}_default`,a=e.get(r);if(a)return a}return null}function w(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function q(t){const e=w(t.iconUrl),n=w(t.speaker);return`<div class="chat-style-avatar"><img src="${e}" alt="${n}" class="chat-style-icon" /></div>`}function X(t){return`<div class="chat-style-speaker-name">${w(t.speaker)}</div>`}function Z(t){t.data={hName:"div",hProperties:{className:["chat-style-container"]}}}function J(t,e){const n=e.position==="right",r=n?"chat-style-right":"chat-style-left";t.data={hName:"div",hProperties:{className:["chat-style-bubble",r]}};const a=[...t.children],o={type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-message"]}},children:a},i=e.iconUrl!==""?{type:"html",value:q(e)}:null,s={type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-content"]}},children:[{type:"html",value:X(e)},o]};n?t.children=i?[s,i]:[s]:t.children=i?[i,s]:[s]}function N(t,e){const n=w(e);t.type="html",t.value=`<div class="chat-style-error">⚠ [chat-style error] ${n}</div>`,t.children=[]}const R=function(){return t=>{console.log("[chat-style] Plugin running, walking AST...");let e=0;V(t,"containerDirective",n=>{const r=n;if(e++,console.log("[chat-style] Found containerDirective:",r.name,"type:",r.type),r.name!=="chat-style")return;console.log("[chat-style] Found ::::chat-style block, children:",r.children.length);const a=A();if(console.log("[chat-style] SpeakerMap:",a?`${a.size} entries`:"null"),!a){N(r,"/chat-style-icons ページが取得できていません。ページが存在するか確認してください");return}Z(r);for(const o of r.children){if(o.type!=="containerDirective")continue;const c=K(o.name);console.log("[chat-style] Resolving speaker:",o.name,"→",c),c?(J(o,c),console.log("[chat-style] Transformed bubble:",o.name,"position:",c.position)):N(o,`話者 "${o.name}" は /chat-style-icons に定義されていません`)}}),console.log("[chat-style] AST walk complete, found",e,"containerDirectives")}},T=`/* ==========================================================
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
  width: 60px;
  height: 60px;
}
.chat-style-icon {
  width: 60px;
  height: 60px;
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
    width: 48px;
    height: 48px;
  }
  .chat-style-icon {
    width: 48px;
    height: 48px;
  }
}
`,Q=()=>{if(console.log("[chat-style] activate() called by GROWI"),growiFacade==null||growiFacade.markdownRenderer==null){console.warn("[chat-style] growiFacade or markdownRenderer is null, aborting");return}console.log("[chat-style] growiFacade available");const t=document.createElement("style");t.textContent=T,document.head.appendChild(t),console.log("[chat-style] CSS injected, length:",T.length),console.log("[chat-style] Fetching speaker map..."),F().then(()=>{console.log("[chat-style] Speaker map fetched, map:",A())});const{optionsGenerators:e}=growiFacade.markdownRenderer,n=e.customGenerateViewOptions;e.customGenerateViewOptions=(...a)=>{const o=n?n(...a):e.generateViewOptions(...a);return o.remarkPlugins.push(R),console.log("[chat-style] View plugin registered, remarkPlugins count:",o.remarkPlugins.length),o};const r=e.customGeneratePreviewOptions;e.customGeneratePreviewOptions=(...a)=>{const o=r?r(...a):e.generatePreviewOptions(...a);return o.remarkPlugins.push(R),console.log("[chat-style] Preview plugin registered, remarkPlugins count:",o.remarkPlugins.length),o},console.log("[chat-style] Plugin activation complete")},Y=()=>{};window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-ssn-chatstyle-display"]={activate:Q,deactivate:Y};console.log("[chat-style] Plugin registered to window.pluginActivators");
