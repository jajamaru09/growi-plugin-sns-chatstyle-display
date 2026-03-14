const E=(function(t){if(t==null)return j;if(typeof t=="function")return k(t);if(typeof t=="object")return Array.isArray(t)?O(t):M(t);if(typeof t=="string")return I(t);throw new Error("Expected function, string, or object as test")});function O(t){const e=[];let n=-1;for(;++n<t.length;)e[n]=E(t[n]);return k(a);function a(...o){let r=-1;for(;++r<e.length;)if(e[r].apply(this,o))return!0;return!1}}function M(t){const e=t;return k(n);function n(a){const o=a;let r;for(r in t)if(o[r]!==e[r])return!1;return!0}}function I(t){return k(e);function e(n){return n&&n.type===t}}function k(t){return e;function e(n,a,o){return!!(G(n)&&t.call(this,n,typeof a=="number"?a:void 0,o||void 0))}}function j(){return!0}function G(t){return t!==null&&typeof t=="object"&&"type"in t}const F=[],L=!0,A=!1,V="skip";function U(t,e,n,a){let o;typeof e=="function"&&typeof n!="function"?(a=n,n=e):o=e;const r=E(o),s=a?-1:1;i(t,void 0,[])();function i(c,d,h){const u=c&&typeof c=="object"?c:{};if(typeof u.type=="string"){const l=typeof u.tagName=="string"?u.tagName:typeof u.name=="string"?u.name:void 0;Object.defineProperty(f,"name",{value:"node ("+(c.type+(l?"<"+l+">":""))+")"})}return f;function f(){let l=F,y,p,m;if((!e||r(c,d,h[h.length-1]||void 0))&&(l=z(n(c,h)),l[0]===A))return l;if("children"in c&&c.children){const g=c;if(g.children&&l[0]!==V)for(p=(a?g.children.length:-1)+s,m=h.concat(g);p>-1&&p<g.children.length;){const b=g.children[p];if(y=i(b,p,m)(),y[0]===A)return y;p=typeof y[1]=="number"?y[1]:p+s}}return l}}}function z(t){return Array.isArray(t)?t:typeof t=="number"?[L,t]:t==null?F:[t]}function B(t,e,n,a){let o,r,s;r=e,s=n,o=a,U(t,r,i,o);function i(c,d){const h=d[d.length-1],u=h?h.children.indexOf(c):void 0;return s(c,u,h)}}const H=300*1e3,S=/^[a-zA-Z0-9_-]+$/,W=/^(\/|https?:\/\/)/,K=/!\[.*?\]\((.*?)\)/;let v=null,$=0,x=!1;function q(t){const e=new Map,n=t.split(`
`);let a=!1,o=!1;for(const r of n){const s=r.trim();if(!s.startsWith("|"))continue;const i=s.split("|").slice(1,-1).map(b=>b.trim());if(i.length<4)continue;if(!a){if(i[0]==="話者"||i[0].toLowerCase()==="speaker"){a=!0;continue}continue}if(!o&&i.every(b=>/^[-:]+$/.test(b))){o=!0;continue}const[c,d,h,u]=i,f=c.trim(),l=d.trim(),y=u.trim().toLowerCase();if(!S.test(f)||!S.test(l)||y!=="left"&&y!=="right")continue;const p=h.match(K);if(!p)continue;const m=p[1];if(!W.test(m))continue;const g=`${f}_${l}`;e.set(g,{speaker:f,expression:l,iconUrl:m,position:y})}return e}async function D(){var t,e;if(!x){x=!0;try{console.log("[chat-style] Fetching /_api/v3/page?path=/chat-style-icons ...");const n=await fetch("/_api/v3/page?path=/chat-style-icons");if(!n.ok){console.warn("[chat-style] Failed to fetch /chat-style-icons:",n.status);return}const a=await n.json(),o=(e=(t=a==null?void 0:a.page)==null?void 0:t.revision)==null?void 0:e.body;if(!o){console.warn("[chat-style] /chat-style-icons page has no content");return}v=q(o),$=Date.now(),console.log("[chat-style] Parsed speaker map:",v.size,"entries"),v.forEach((r,s)=>{console.log("[chat-style]   ",s,"→",r.position,r.iconUrl)})}catch(n){console.warn("[chat-style] Error fetching speaker map:",n)}finally{x=!1}}}function P(){return v&&Date.now()-$>H&&D(),v}function X(t){const e=P();if(!e)return null;const n=t.lastIndexOf("_");if(n>0){const a=t.substring(0,n),o=t.substring(n+1),r=`${a}_${o}`,s=e.get(r);if(s)return s;const i=`${t}_default`,c=e.get(i);if(c)return c}else{const a=`${t}_default`,o=e.get(a);if(o)return o}return null}function w(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function N(t){const e=w(t.iconUrl),n=w(t.speaker);return`<div class="chat-style-avatar"><img src="${e}" alt="${n}" class="chat-style-icon" /></div>`}function R(t){return`<div class="chat-style-speaker-name">${w(t.speaker)}</div>`}function Z(t){t.data={hName:"div",hProperties:{className:["chat-style-container"]}}}function J(t,e){const n=e.position==="right",a=n?"chat-style-right":"chat-style-left";t.data={hName:"div",hProperties:{className:["chat-style-bubble",a]}};const o=[...t.children],r={type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-message"]}},children:o};n?t.children=[{type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-content"]}},children:[{type:"html",value:R(e)},r]},{type:"html",value:N(e)}]:t.children=[{type:"html",value:N(e)},{type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-content"]}},children:[{type:"html",value:R(e)},r]}]}function T(t,e){const n=w(e);t.type="html",t.value=`<div class="chat-style-error">⚠ [chat-style error] ${n}</div>`,t.children=[]}const _=function(){return t=>{console.log("[chat-style] Plugin running, walking AST...");let e=0;B(t,"containerDirective",n=>{const a=n;if(e++,console.log("[chat-style] Found containerDirective:",a.name,"type:",a.type),a.name!=="chat-style")return;console.log("[chat-style] Found ::::chat-style block, children:",a.children.length);const o=P();if(console.log("[chat-style] SpeakerMap:",o?`${o.size} entries`:"null"),!o){T(a,"/chat-style-icons ページが取得できていません。ページが存在するか確認してください");return}Z(a);for(const r of a.children){if(r.type!=="containerDirective")continue;const s=X(r.name);console.log("[chat-style] Resolving speaker:",r.name,"→",s),s?(J(r,s),console.log("[chat-style] Transformed bubble:",r.name,"position:",s.position)):T(r,`話者 "${r.name}" は /chat-style-icons に定義されていません`)}}),console.log("[chat-style] AST walk complete, found",e,"containerDirectives")}},C=`/* ==========================================================
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
  width: 40px;
  height: 40px;
}
.chat-style-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--chat-style-icon-bg);
}

/* ----- コンテンツ（話者名＋吹き出し） ----- */
.chat-style-content {
  max-width: 70%;
}
.chat-style-speaker-name {
  font-size: 0.75em;
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
    width: 32px;
    height: 32px;
  }
  .chat-style-icon {
    width: 32px;
    height: 32px;
  }
}
`,Q=()=>{if(console.log("[chat-style] activate() called by GROWI"),growiFacade==null||growiFacade.markdownRenderer==null){console.warn("[chat-style] growiFacade or markdownRenderer is null, aborting");return}console.log("[chat-style] growiFacade available");const t=document.createElement("style");t.textContent=C,document.head.appendChild(t),console.log("[chat-style] CSS injected, length:",C.length),console.log("[chat-style] Fetching speaker map..."),D().then(()=>{console.log("[chat-style] Speaker map fetched, map:",P())});const{optionsGenerators:e}=growiFacade.markdownRenderer,n=e.customGenerateViewOptions;e.customGenerateViewOptions=(...o)=>{const r=n?n(...o):e.generateViewOptions(...o);return r.remarkPlugins.push(_),console.log("[chat-style] View plugin registered, remarkPlugins count:",r.remarkPlugins.length),r};const a=e.customGeneratePreviewOptions;e.customGeneratePreviewOptions=(...o)=>{const r=a?a(...o):e.generatePreviewOptions(...o);return r.remarkPlugins.push(_),console.log("[chat-style] Preview plugin registered, remarkPlugins count:",r.remarkPlugins.length),r},console.log("[chat-style] Plugin activation complete")},Y=()=>{};window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-ssn-chatstyle-display"]={activate:Q,deactivate:Y};console.log("[chat-style] Plugin registered to window.pluginActivators");
