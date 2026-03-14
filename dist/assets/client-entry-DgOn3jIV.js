const E=(function(t){if(t==null)return j;if(typeof t=="function")return w(t);if(typeof t=="object")return Array.isArray(t)?O(t):M(t);if(typeof t=="string")return I(t);throw new Error("Expected function, string, or object as test")});function O(t){const e=[];let n=-1;for(;++n<t.length;)e[n]=E(t[n]);return w(r);function r(...a){let o=-1;for(;++o<e.length;)if(e[o].apply(this,a))return!0;return!1}}function M(t){const e=t;return w(n);function n(r){const a=r;let o;for(o in t)if(a[o]!==e[o])return!1;return!0}}function I(t){return w(e);function e(n){return n&&n.type===t}}function w(t){return e;function e(n,r,a){return!!(L(n)&&t.call(this,n,typeof r=="number"?r:void 0,a||void 0))}}function j(){return!0}function L(t){return t!==null&&typeof t=="object"&&"type"in t}const $=[],V=!0,S=!1,G="skip";function U(t,e,n,r){let a;typeof e=="function"&&typeof n!="function"?(r=n,n=e):a=e;const o=E(a),c=r?-1:1;s(t,void 0,[])();function s(i,d,h){const y=i&&typeof i=="object"?i:{};if(typeof y.type=="string"){const l=typeof y.tagName=="string"?y.tagName:typeof y.name=="string"?y.name:void 0;Object.defineProperty(f,"name",{value:"node ("+(i.type+(l?"<"+l+">":""))+")"})}return f;function f(){let l=$,u,p,m;if((!e||o(i,d,h[h.length-1]||void 0))&&(l=z(n(i,h)),l[0]===S))return l;if("children"in i&&i.children){const g=i;if(g.children&&l[0]!==G)for(p=(r?g.children.length:-1)+c,m=h.concat(g);p>-1&&p<g.children.length;){const b=g.children[p];if(u=s(b,p,m)(),u[0]===S)return u;p=typeof u[1]=="number"?u[1]:p+c}}return l}}}function z(t){return Array.isArray(t)?t:typeof t=="number"?[V,t]:t==null?$:[t]}function B(t,e,n,r){let a,o,c;o=e,c=n,a=r,U(t,o,s,a);function s(i,d){const h=d[d.length-1],y=h?h.children.indexOf(i):void 0;return c(i,y,h)}}const H=300*1e3,N=/^[a-zA-Z0-9_-]+$/,K=/^(\/|https?:\/\/)/,W=/!\[.*?\]\((.*?)\)/;let k=null,D=0,x=!1;function q(t){const e=new Map,n=t.split(`
`);let r=!1,a=!1;for(const o of n){const c=o.trim();if(!c.startsWith("|"))continue;const s=c.split("|").slice(1,-1).map(b=>b.trim());if(s.length<4)continue;if(!r){if(s[0]==="話者"||s[0].toLowerCase()==="speaker"){r=!0;continue}continue}if(!a&&s.every(b=>/^[-:]+$/.test(b))){a=!0;continue}const[i,d,h,y]=s,f=i.trim(),l=d.trim(),u=y.trim().toLowerCase();if(!N.test(f)||!N.test(l)||u!=="left"&&u!=="right")continue;const p=h.match(W);if(!p)continue;const m=p[1];if(!K.test(m))continue;const g=`${f}_${l}`;e.set(g,{speaker:f,expression:l,iconUrl:m,position:u})}return e}async function F(){var t,e;if(!x){x=!0;try{console.log("[chat-style] Fetching /_api/v3/page?path=/chat-style-icons ...");const n=await fetch("/_api/v3/page?path=/chat-style-icons");if(!n.ok){console.warn("[chat-style] Failed to fetch /chat-style-icons:",n.status);return}const r=await n.json(),a=(e=(t=r==null?void 0:r.page)==null?void 0:t.revision)==null?void 0:e.body;if(!a){console.warn("[chat-style] /chat-style-icons page has no content");return}k=q(a),D=Date.now(),console.log("[chat-style] Parsed speaker map:",k.size,"entries"),k.forEach((o,c)=>{console.log("[chat-style]   ",c,"→",o.position,o.iconUrl)})}catch(n){console.warn("[chat-style] Error fetching speaker map:",n)}finally{x=!1}}}function P(){return k&&Date.now()-D>H&&F(),k}function X(t){const e=P();if(!e)return null;const n=t.lastIndexOf("_");if(n>0){const r=t.substring(0,n),a=t.substring(n+1),o=`${r}_${a}`,c=e.get(o);if(c)return c;const s=`${t}_default`,i=e.get(s);if(i)return i}else{const r=`${t}_default`,a=e.get(r);if(a)return a}return null}function v(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function A(t){const e=v(t.iconUrl),n=v(t.speaker);return`<div class="chat-style-avatar"><img src="${e}" alt="${n}" class="chat-style-icon" /></div>`}function R(t){return`<div class="chat-style-speaker-name">${v(t.speaker)}</div>`}function Z(t){t.data={hName:"div",hProperties:{className:["chat-style-container"]}}}function J(t,e){const n=e.position==="right",r=n?"chat-style-right":"chat-style-left";t.data={hName:"div",hProperties:{className:["chat-style-bubble",r]}};const a=[...t.children],o={type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-message"]}},children:a};n?t.children=[{type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-content"]}},children:[{type:"html",value:R(e)},o]},{type:"html",value:A(e)}]:t.children=[{type:"html",value:A(e)},{type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-content"]}},children:[{type:"html",value:R(e)},o]}]}function T(t,e){const n=v(e);t.type="html",t.value=`<div class="chat-style-error">⚠ [chat-style error] ${n}</div>`,t.children=[]}const _=function(){return t=>{console.log("[chat-style] Plugin running, walking AST...");let e=0;B(t,"containerDirective",n=>{const r=n;if(e++,console.log("[chat-style] Found containerDirective:",r.name,"type:",r.type),r.name!=="chat-style")return;console.log("[chat-style] Found ::::chat-style block, children:",r.children.length);const a=P();if(console.log("[chat-style] SpeakerMap:",a?`${a.size} entries`:"null"),!a){T(r,"/chat-style-icons ページが取得できていません。ページが存在するか確認してください");return}Z(r);for(const o of r.children){if(o.type!=="containerDirective")continue;const c=X(o.name);console.log("[chat-style] Resolving speaker:",o.name,"→",c),c?(J(o,c),console.log("[chat-style] Transformed bubble:",o.name,"position:",c.position)):T(o,`話者 "${o.name}" は /chat-style-icons に定義されていません`)}}),console.log("[chat-style] AST walk complete, found",e,"containerDirectives")}},C=`/* ==========================================================
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
`,Q=()=>{console.log("[chat-style] activate() called");const e=window.growiFacade;if(console.log("[chat-style] growiFacade:",e),console.log("[chat-style] growiFacade?.markdownRenderer:",e==null?void 0:e.markdownRenderer),e==null||e.markdownRenderer==null){console.warn("[chat-style] growiFacade or markdownRenderer is null, aborting");return}const n=document.createElement("style");n.textContent=C,document.head.appendChild(n),console.log("[chat-style] CSS injected, length:",C.length),console.log("[chat-style] Fetching speaker map..."),F().then(()=>{console.log("[chat-style] Speaker map fetched, map:",P())});const{optionsGenerators:r}=e.markdownRenderer,a=r.customGenerateViewOptions;r.customGenerateViewOptions=(...c)=>{const s=a?a(...c):r.generateViewOptions(...c);return s.remarkPlugins.push(_),console.log("[chat-style] View plugin registered, remarkPlugins count:",s.remarkPlugins.length),s};const o=r.customGeneratePreviewOptions;r.customGeneratePreviewOptions=(...c)=>{const s=o?o(...c):r.generatePreviewOptions(...c);return s.remarkPlugins.push(_),console.log("[chat-style] Preview plugin registered, remarkPlugins count:",s.remarkPlugins.length),s},console.log("[chat-style] Plugin activation complete")};console.log("[chat-style] Script loaded");Q();
