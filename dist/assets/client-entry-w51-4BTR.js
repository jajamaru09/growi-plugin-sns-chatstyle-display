const C=(function(e){if(e==null)return j;if(typeof e=="function")return w(e);if(typeof e=="object")return Array.isArray(e)?O(e):M(e);if(typeof e=="string")return I(e);throw new Error("Expected function, string, or object as test")});function O(e){const t=[];let n=-1;for(;++n<e.length;)t[n]=C(e[n]);return w(a);function a(...o){let r=-1;for(;++r<t.length;)if(t[r].apply(this,o))return!0;return!1}}function M(e){const t=e;return w(n);function n(a){const o=a;let r;for(r in e)if(o[r]!==t[r])return!1;return!0}}function I(e){return w(t);function t(n){return n&&n.type===e}}function w(e){return t;function t(n,a,o){return!!(L(n)&&e.call(this,n,typeof a=="number"?a:void 0,o||void 0))}}function j(){return!0}function L(e){return e!==null&&typeof e=="object"&&"type"in e}const E=[],V=!0,S=!1,G="skip";function U(e,t,n,a){let o;typeof t=="function"&&typeof n!="function"?(a=n,n=t):o=t;const r=C(o),c=a?-1:1;i(e,void 0,[])();function i(s,d,h){const y=s&&typeof s=="object"?s:{};if(typeof y.type=="string"){const l=typeof y.tagName=="string"?y.tagName:typeof y.name=="string"?y.name:void 0;Object.defineProperty(f,"name",{value:"node ("+(s.type+(l?"<"+l+">":""))+")"})}return f;function f(){let l=E,u,p,m;if((!t||r(s,d,h[h.length-1]||void 0))&&(l=z(n(s,h)),l[0]===S))return l;if("children"in s&&s.children){const g=s;if(g.children&&l[0]!==G)for(p=(a?g.children.length:-1)+c,m=h.concat(g);p>-1&&p<g.children.length;){const b=g.children[p];if(u=i(b,p,m)(),u[0]===S)return u;p=typeof u[1]=="number"?u[1]:p+c}}return l}}}function z(e){return Array.isArray(e)?e:typeof e=="number"?[V,e]:e==null?E:[e]}function B(e,t,n,a){let o,r,c;r=t,c=n,o=a,U(e,r,i,o);function i(s,d){const h=d[d.length-1],y=h?h.children.indexOf(s):void 0;return c(s,y,h)}}const H=300*1e3,N=/^[a-zA-Z0-9_-]+$/,K=/^(\/|https?:\/\/)/,W=/!\[.*?\]\((.*?)\)/;let k=null,$=0,x=!1;function q(e){const t=new Map,n=e.split(`
`);let a=!1,o=!1;for(const r of n){const c=r.trim();if(!c.startsWith("|"))continue;const i=c.split("|").slice(1,-1).map(b=>b.trim());if(i.length<4)continue;if(!a){if(i[0]==="話者"||i[0].toLowerCase()==="speaker"){a=!0;continue}continue}if(!o&&i.every(b=>/^[-:]+$/.test(b))){o=!0;continue}const[s,d,h,y]=i,f=s.trim(),l=d.trim(),u=y.trim().toLowerCase();if(!N.test(f)||!N.test(l)||u!=="left"&&u!=="right")continue;const p=h.match(W);if(!p)continue;const m=p[1];if(!K.test(m))continue;const g=`${f}_${l}`;t.set(g,{speaker:f,expression:l,iconUrl:m,position:u})}return t}async function D(){var e,t;if(!x){x=!0;try{console.log("[chat-style] Fetching /_api/v3/page?path=/chat-style-icons ...");const n=await fetch("/_api/v3/page?path=/chat-style-icons");if(!n.ok){console.warn("[chat-style] Failed to fetch /chat-style-icons:",n.status);return}const a=await n.json(),o=(t=(e=a==null?void 0:a.page)==null?void 0:e.revision)==null?void 0:t.body;if(!o){console.warn("[chat-style] /chat-style-icons page has no content");return}k=q(o),$=Date.now(),console.log("[chat-style] Parsed speaker map:",k.size,"entries"),k.forEach((r,c)=>{console.log("[chat-style]   ",c,"→",r.position,r.iconUrl)})}catch(n){console.warn("[chat-style] Error fetching speaker map:",n)}finally{x=!1}}}function P(){return k&&Date.now()-$>H&&D(),k}function X(e){const t=P();if(!t)return null;const n=e.lastIndexOf("_");if(n>0){const a=e.substring(0,n),o=e.substring(n+1),r=`${a}_${o}`,c=t.get(r);if(c)return c;const i=`${e}_default`,s=t.get(i);if(s)return s}else{const a=`${e}_default`,o=t.get(a);if(o)return o}return null}function v(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function A(e){const t=v(e.iconUrl),n=v(e.speaker);return`<div class="chat-style-avatar"><img src="${t}" alt="${n}" class="chat-style-icon" /></div>`}function R(e){return`<div class="chat-style-speaker-name">${v(e.speaker)}</div>`}function Z(e){e.data={hName:"div",hProperties:{className:["chat-style-container"]}}}function J(e,t){const n=t.position==="right",a=n?"chat-style-right":"chat-style-left";e.data={hName:"div",hProperties:{className:["chat-style-bubble",a]}};const o=[...e.children],r={type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-message"]}},children:o};n?e.children=[{type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-content"]}},children:[{type:"html",value:R(t)},r]},{type:"html",value:A(t)}]:e.children=[{type:"html",value:A(t)},{type:"containerDirective",data:{hName:"div",hProperties:{className:["chat-style-content"]}},children:[{type:"html",value:R(t)},r]}]}function F(e,t){const n=v(t);e.type="html",e.value=`<div class="chat-style-error">⚠ [chat-style error] ${n}</div>`,e.children=[]}const T=function(){return e=>{console.log("[chat-style] Plugin running, walking AST...");let t=0;B(e,"containerDirective",n=>{const a=n;if(t++,console.log("[chat-style] Found containerDirective:",a.name,"type:",a.type),a.name!=="chat-style")return;console.log("[chat-style] Found ::::chat-style block, children:",a.children.length);const o=P();if(console.log("[chat-style] SpeakerMap:",o?`${o.size} entries`:"null"),!o){F(a,"/chat-style-icons ページが取得できていません。ページが存在するか確認してください");return}Z(a);for(const r of a.children){if(r.type!=="containerDirective")continue;const c=X(r.name);console.log("[chat-style] Resolving speaker:",r.name,"→",c),c?(J(r,c),console.log("[chat-style] Transformed bubble:",r.name,"position:",c.position)):F(r,`話者 "${r.name}" は /chat-style-icons に定義されていません`)}}),console.log("[chat-style] AST walk complete, found",t,"containerDirectives")}},_=`/* ==========================================================
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
`,Q=()=>{if(console.log("[chat-style] activate() called"),console.log("[chat-style] growiFacade:",growiFacade),console.log("[chat-style] growiFacade?.markdownRenderer:",growiFacade==null?void 0:growiFacade.markdownRenderer),growiFacade==null||growiFacade.markdownRenderer==null){console.warn("[chat-style] growiFacade or markdownRenderer is null, aborting");return}const e=document.createElement("style");e.textContent=_,document.head.appendChild(e),console.log("[chat-style] CSS injected, length:",_.length),console.log("[chat-style] Fetching speaker map..."),D().then(()=>{console.log("[chat-style] Speaker map fetched, map:",P())});const{optionsGenerators:t}=growiFacade.markdownRenderer,n=t.customGenerateViewOptions;t.customGenerateViewOptions=(...o)=>{const r=n?n(...o):t.generateViewOptions(...o);return r.remarkPlugins.push(T),console.log("[chat-style] View plugin registered, remarkPlugins count:",r.remarkPlugins.length),r};const a=t.customGeneratePreviewOptions;t.customGeneratePreviewOptions=(...o)=>{const r=a?a(...o):t.generatePreviewOptions(...o);return r.remarkPlugins.push(T),console.log("[chat-style] Preview plugin registered, remarkPlugins count:",r.remarkPlugins.length),r},console.log("[chat-style] Plugin activation complete")};console.log("[chat-style] Script loaded");Q();
