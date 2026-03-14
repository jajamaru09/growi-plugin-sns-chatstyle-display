---
author: Claude
source: Claude Code
conversation_id: fcc8b66f-900c-416d-b0c0-a0ac9ce78466
shared: false
tags: [Growi, プラグイン設計, CSS, チャットUI, SDD]
note: "設計判断の「なぜそうしたか」を丁寧に残すことを意識しました。アイコン管理方式の検討過程やhName方式の選定理由など、完成したドキュメントだけでは見えない思考プロセスが伝わる記事になっていると思います。"

---

# SNSチャットスタイル表示プラグインの設計記録

## 概要

Growiプラグイン「growi-plugin-ssn-chatstyle-display」の設計フェーズで行われた議論と判断の記録。LINEのようなSNS風チャットスタイル表示をGrowiのMarkdownページ上で実現するプラグインであり、SDD（Steering Driven Development）プロセスに沿って `docs/` 永続ドキュメント6本を作成した。

### 完成したドキュメント構成

| ファイル | 内容 | 状態 |
|---|---|---|
| `docs/01-product-requirements.md` | プロダクト要求定義書 | 承認済 |
| `docs/02-functional-design.md` | 機能設計書 | 承認済 |
| `docs/03-architecture.md` | 技術仕様書 | 承認済 |
| `docs/04-repository-structure.md` | リポジトリ構造定義書 | 承認済 |
| `docs/05-development-guidelines.md` | 開発ガイドライン | 承認済 |
| `docs/06-glossary.md` | ユビキタス言語定義 | 承認待ち |

次のステップはステアリングファイル（`.steering/20260315-01-initial-implementation/`）の作成と実装開始である。

## 記法設計: 会話ブロックの導入

### 当初の案

最初の設計では `:::speaker_expression` 記法だけで吹き出しを記述する想定だった。

```markdown
:::claude-bot_smiling
会話内容
:::

:::me
返答
:::
```

### 課題の発見

ユーザーから「通常の記事を書きながら会話形式を開始して、また元に戻るユースケース」の指摘があった。ページ全体でプラグインが有効だと、他のプラグインが使う `:::` 記法（Growi標準のコールアウト等）と衝突するリスクがある。

### 解決: `::::chat-style` ラッパー

remark-directiveのネスト仕様（コロン数が多い方が外側のコンテナ）を活用し、`::::chat-style` ラッパーを導入した。

```markdown
通常のMarkdown...

::::chat-style
:::claude-bot_smiling
会話内容
:::

:::me
返答
:::
::::

通常のMarkdownに戻る...
```

- `::::chat-style`（コロン4つ）→ 外側の `containerDirective`（name: "chat-style"）
- `:::speaker`（コロン3つ）→ 内側の `containerDirective`（name: "speaker_expression"）
- ブロック外の `:::` はプラグインの処理対象外
- 1ページ内に複数の会話ブロックを配置可能

## アイコン管理方式の選定

3つの方式を検討し、最終的にユーザー提案の「専用ページ管理方式」を採用した。

### 検討した案

| 方式 | メリット | デメリット |
|---|---|---|
| A: Data URI埋め込み | 外部依存ゼロ、確実に表示 | アイコン追加にプラグイン再ビルドが必要 |
| B: Growi添付ファイル参照 | ユーザーが自由に変更可能 | URL管理が煩雑 |
| C: ハイブリッド（A+B） | すぐ使える＋拡張可能 | 初期実装がやや複雑 |

### 採用: 専用ページ `/chat-style-icons` によるテーブル管理

ユーザーから「専用ページで管理し、記事側では `:::speaker_expression` を書くだけ」という方針が提示された。プラグインにアイコンを同梱する必要がなく、ユーザーが自由にキャラクターを追加・変更できる。

```markdown
# チャットスタイル アイコン定義

| 話者 | expression | アイコン | 配置 |
|------|-----------|---------|------|
| claude-bot | default | ![](/attachment/xxx) | left |
| claude-bot | smiling | ![](/attachment/yyy) | left |
| me | default | ![](/attachment/zzz) | right |
```

- expression省略時は `default` を自動適用
- 未定義の話者が使われた場合はエラー表示（赤枠メッセージ）
- `/chat-style-icons` ページが存在しない場合もエラー表示

### 技術的な実現方法

`growiFacade` にはページ取得機能がないため、Growi REST APIを直接 `fetch` して取得する。

```typescript
const res = await fetch('/_api/v3/page?path=/chat-style-icons');
const data = await res.json();
const markdown = data.page.revision.body;
// → Markdownテーブルをパースして SpeakerMap に格納
```

取得結果はモジュール変数にキャッシュし、TTL 5分で再取得する設計。remarkプラグインは同期処理のため、`activate()` 時に非同期で取得しておく必要がある。

## AST変換方式: hName の採用

### 課題

チャットバブルの中にはMarkdownテキスト（太字、リンク、コード等）が含まれる。`node.type = 'html'` 方式では子ノードが消失するため、プラグイン側でMarkdown→HTMLの変換を自前実装する必要が生じる。

### 解決: `node.data.hName` 方式

```typescript
// ::::chat-style → <div class="chat-style-container">
chatStyleNode.data = {
  hName: 'div',
  hProperties: { className: ['chat-style-container'] }
};

// :::speaker → <div class="chat-style-bubble chat-style-left">
speakerNode.data = {
  hName: 'div',
  hProperties: { className: ['chat-style-bubble', 'chat-style-left'] }
};
```

子ノード（会話テキスト）はGrowiの標準パイプラインがレンダリングするため、太字・リンク・コード・さらには他プラグインの記法（数式、コードハイライト等）もすべて自動で処理される。

アイコンや話者名はMarkdown上に存在しない要素のため、子ノード配列に直接HTMLノードを挿入する：

```typescript
// 左配置: 先頭にアイコン、話者名を挿入
speakerNode.children.unshift(
  { type: 'html', value: '<div class="chat-style-avatar"><img src="..." /></div>' },
  { type: 'html', value: '<div class="chat-style-speaker-name">claude-bot</div>' }
);

// 右配置: 末尾にアイコンを追加
speakerNode.children.push(
  { type: 'html', value: '<div class="chat-style-avatar"><img src="..." /></div>' }
);
```

エラー表示（未定義話者）の場合のみ、子ノードの保持が不要なため `node.type = 'html'` で直接置換する。

## テーマ対応: Bootstrap CSS変数の活用

### 課題

Growiにはlight/darkモードがある。ハードコードされた色ではテーマ切り替え時に見づらくなる。

### 解決: 2層CSS変数構造

GrowiはBootstrap 5ベースであり、`[data-bs-theme="light"]` / `[data-bs-theme="dark"]` でCSS変数が切り替わる。この仕組みを利用して、プラグイン固有のCSS変数を定義する。

```
第1層: Bootstrap標準変数（Growiが提供）
  --bs-body-bg, --bs-secondary-bg, --bs-tertiary-bg, ...

第2層: プラグイン固有変数（Bootstrap変数を参照）
  --chat-style-container-bg: var(--bs-tertiary-bg)
  --chat-style-left-bg: var(--bs-secondary-bg)
  --chat-style-right-bg: #8de88b （LINE風緑、独自色）
```

```css
:root, [data-bs-theme="light"] {
  --chat-style-container-bg: var(--bs-tertiary-bg);
  --chat-style-left-bg: var(--bs-secondary-bg);
  --chat-style-left-color: var(--bs-body-color);
  --chat-style-right-bg: #8de88b;
  --chat-style-right-color: #1a3a1a;
}
[data-bs-theme="dark"] {
  --chat-style-right-bg: #2d6a2e;
  --chat-style-right-color: #d4f5d4;
}
```

Bootstrap変数を参照している色（左吹き出し、コンテナ背景等）はテーマ切り替え時に自動で追従する。独自色（右吹き出しのLINE風緑）のみ、darkモード用に別の値を定義する。

### HTMLプレビューでの検証

`sample/chat-style-preview.html` にBootstrap CSS変数のフォールバック定義を含むスタンドアロンHTMLを作成し、light/darkの切り替えボタンで視覚的に確認できるようにした。Growi上ではBootstrapが変数を提供するため、フォールバック定義は不要になる。

## 話者名パースのルール

話者名にアンダースコアを含むケース（`my_bot_smiling`）に対応するため、**最後の `_` で分割**するルールを採用した。

```
パース優先順位（例: "a_b_c"）:
  1. speaker="a_b", expression="c" で SpeakerMap を検索
  2. 見つからなければ speaker="a_b_c", expression="default" で検索
  3. いずれも未定義 → エラー表示
```

expression を省略した場合（`:::me`）は自動的に `default` が適用される。

## 注意点・落とし穴

### growiFacade の限界

growiFacade は remarkPlugins の登録のみを提供する。ページ取得、ユーザー情報取得、Markdown直接レンダリングといった機能は一切提供されない。公式ドキュメントにもこの制限は明記されていないため、開発中に気づいて設計を修正することになりやすい。

### remarkプラグインの同期制約

remarkプラグインの `tree` 変換は同期処理であり、`async/await` は使用できない。`/chat-style-icons` のようにAPIからデータを取得する場合は、`activate()` 時に非同期で取得してキャッシュに保存し、remarkプラグイン内ではキャッシュを同期的に参照する設計にする必要がある。

### hName方式の制約

`node.data.hName` で指定できるのはHTML要素名と属性のみ。複雑なDOM構造（ネストしたdiv等）を生成するには、子ノードにHTMLノードを挿入するか、rehypeプラグインと組み合わせる必要がある。

## 補足知識

### SDDプロセスとの親和性

今回の設計フェーズではSDD（Steering Driven Development）プロセスを採用し、`docs/` に永続的ドキュメント6本を作成した。SDDでは「1ファイルごとに承認を得てから次に進む」ルールがあり、アイコン管理方式の議論や会話ブロックの導入といった設計変更が、承認済みドキュメントへのフィードバックとして自然に反映された。設計の「なぜ」が失われにくいプロセスと言える。

### CSSプレフィックスの重要性

Growiには多数のプラグインが共存する可能性があるため、CSSクラス名には必ずプラグイン固有のプレフィックス（`chat-style-`）を付ける。CSS変数も同様に `--chat-style-*` とすることで、他プラグインやGroi本体のスタイルとの衝突を防ぐ。これはGrowiプラグイン開発の暗黙のベストプラクティスである。

### Growi REST API の認証

クライアントサイドプラグインからGrowiのREST APIを呼び出す場合、ブラウザのセッションクッキーが自動的に送信されるため、ログイン済みユーザーのコンテキストでAPIアクセスが行われる。別途API トークンを設定する必要はない。ただし、未ログイン状態や公開ページからのアクセス時にはAPIが失敗する可能性があるため、エラーハンドリングが必要。

## 参考URL

- [LINE風の吹き出しの会話をCSSで作ってみる - 125naroom](https://125naroom.com/web/3034) — CSS疑似要素で吹き出しを作る基本パターン
- [CSSで作る！吹き出しデザインのサンプル19選 - サルワカ](https://saruwakakun.com/html-css/reference/speech-bubble) — 吹き出しデザインのバリエーション集
- [HTMLとCSSで画像付きのチャット風吹き出しを作ってみよう！ - Frankul](https://blog.frankul.net/2022/03/30/html-css-chat/) — アバター付きチャットUIの実装例
- [Color modes - Bootstrap v5.3](https://getbootstrap.com/docs/5.3/customize/color-modes/) — Bootstrap 5のlight/darkモード切り替え仕様
- [CSS variables - Bootstrap v5.3](https://getbootstrap.com/docs/5.3/customize/css-variables/) — Bootstrap CSS変数の一覧と使い方
