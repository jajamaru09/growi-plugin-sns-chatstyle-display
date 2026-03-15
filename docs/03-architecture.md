# 技術仕様書

## 1. テクノロジースタック

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| 言語 | TypeScript | プラグインの実装全体 |
| Markdownパーサー | unified / remark | ASTの走査・変換 |
| AST操作 | unist-util-visit | ノードの検出・変換 |
| ディレクティブ | @growi/remark-growi-directive | `:::` / `::::` 記法のAST変換（Growi側で提供） |
| スタイル | CSS（CSS変数） | チャットバブルのスタイリング |
| ビルド | Growiプラグインビルドシステム | クライアントサイドバンドル |
| パッケージ管理 | npm / yarn | 依存関係管理 |

## 2. 開発ツールと手法

| ツール | 用途 |
|--------|------|
| Git | バージョン管理 |
| GitHub | リポジトリホスティング |
| ESLint | コード品質チェック |
| TypeScript Compiler | 型チェック |
| npm | パッケージ配布 |

## 3. 技術的制約と要件

### 3.1 growiFacade の提供範囲

`growiFacade` はGrowiのクライアントサイドプラグインAPIであり、以下のみを公開する:

```typescript
growiFacade.markdownRenderer.optionsGenerators
  .generateViewOptions(...)          // 閲覧用オプション生成（既定）
  .customGenerateViewOptions(...)    // 閲覧用オプション生成（カスタム上書き）
  .generatePreviewOptions(...)       // プレビュー用オプション生成（既定）
  .customGeneratePreviewOptions(...) // プレビュー用オプション生成（カスタム上書き）
```

**できること:**
- `options.remarkPlugins` へのプラグイン追加
- `options.rehypePlugins` へのプラグイン追加
- `options.components` のカスタムコンポーネント差し替え

**できないこと:**
- ページ内容の取得・レンダリング（REST APIを直接使用する必要がある）
- Growi内部状態へのアクセス

### 3.2 Growiプラグインの制約

- **クライアントサイド実行**: remarkプラグインはブラウザ上で動作する
- **同期的AST変換**: remarkプラグインの `tree` 変換は同期処理（非同期API呼び出しは `activate()` 時に行う）
- **エントリーポイント**: `client-entry.tsx` から `activate()` 関数をエクスポートする必要がある
- **remarkPlugins登録**: `customGenerateViewOptions` と `customGeneratePreviewOptions` の両方に登録が必要
- **ディレクティブ依存**: `@growi/remark-growi-directive` がGrowi側で既に読み込まれていることが前提（`containerDirective` ノードが生成される）

### 3.3 AST変換方式: `node.data.hName` パターン

本プラグインでは `node.type = 'html'`（子ノード消失）ではなく、**`node.data.hName` / `node.data.hProperties` 方式**を採用する。

#### 方式比較

| 方式 | 子ノード | Markdown処理 | 用途 |
|------|---------|-------------|------|
| `node.type = 'html'` | 消失（生HTML文字列で置換） | プラグイン側で自前処理が必要 | YouTube埋め込み等、子コンテンツ不要のケース |
| `node.data.hName` | 保持される | Growiパイプラインが標準レンダリング | **本プラグイン: 子ノードのMarkdownをGrowiに委譲** |

#### 採用理由

- 吹き出し内の `**太字**`、`[リンク](url)`、`` `コード` `` 等をGrowiの標準パイプラインがレンダリングする
- プラグイン側でMarkdown→HTMLの変換を自前実装する必要がない
- Growiの他のプラグイン（数式、コードハイライト等）とも共存可能

#### 実装イメージ

```typescript
// ::::chat-style コンテナ → <div class="chat-style-container">子ノード</div>
chatStyleNode.data = {
  hName: 'div',
  hProperties: { className: ['chat-style-container'] }
};
// → 子ノード（:::speaker バブル群）はそのまま保持・処理される

// :::speaker バブル → <div class="chat-style-bubble chat-style-left">子ノード</div>
speakerNode.data = {
  hName: 'div',
  hProperties: { className: ['chat-style-bubble', 'chat-style-left'] }
};
// → 会話テキスト（太字、リンク等）はGrowiが標準レンダリング
```

#### アイコン・話者名の注入

`node.data.hName` は既存の子ノードを保持するが、アイコンや話者名はAST上に存在しない要素のため、**子ノードの先頭にHTMLノードを挿入**して対応する:

```typescript
// 話者バブルの子ノード先頭にアイコン＋話者名を挿入
speakerNode.children.unshift(
  {
    type: 'html',
    value: `
      <div class="chat-style-avatar">
        <img src="${iconUrl}" alt="${speaker}" class="chat-style-icon" />
      </div>
      <div class="chat-style-speaker-name">${speaker}</div>
    `
  }
);

// 既存の子ノード（会話テキスト）をメッセージdivで囲む
// → rehypeプラグインまたはAST操作で対応
```

> 詳細な子ノード構造の設計は機能設計書（02-functional-design.md）の「生成HTML構造」セクションを参照。

### 3.4 package.json の必須設定

```json
{
  "name": "growi-plugin-sns-chatstyle-display",
  "version": "1.0.0",
  "description": "SNS-style chat display plugin for GROWI",
  "main": "client-entry.tsx",
  "keywords": [
    "growi",
    "growi-plugin"
  ],
  "growiPlugin": {
    "schemaVersion": 4,
    "types": [
      "script"
    ]
  },
  "license": "MIT"
}
```

- `growiPlugin.types`: `"script"` でクライアントサイドスクリプトとして登録
- `growiPlugin.schemaVersion`: Growi v7.x 向けは `4`
- `keywords` に `"growi-plugin"` を含めることでGrowiが自動検出

### 3.5 API呼び出し（話者定義ページの取得）

`growiFacade` はページ取得機能を提供しないため、Growi REST APIを直接 `fetch` する。

```typescript
// activate() 内で非同期実行
const res = await fetch('/_api/v3/page?path=/chat-style-icons');
const data = await res.json();
const markdown = data.page.revision.body;
// → markdownテーブルをパースしてSpeakerMapに格納
```

- API エンドポイント: `/_api/v3/page`（パスベースで取得）
- 認証: ブラウザセッションを利用（プラグインはログイン済みユーザーのコンテキストで動作）
- キャッシュ: モジュール変数に保持、TTL 5分で再取得

### 3.6 AST ノードタイプ

Growiのremark-directiveが生成するノードタイプ:

| Markdown記法 | ASTノードタイプ | 用途 |
|-------------|---------------|------|
| `:name` | `textDirective` | インライン（本プラグインでは不使用） |
| `::name` | `leafDirective` | ブロック単行（本プラグインでは不使用） |
| `:::name ... :::` | `containerDirective` | ブロック複数行（話者バブル） |
| `::::name ... ::::` | `containerDirective` | ネストされたコンテナ（会話ブロック） |

> `:::` と `::::` はどちらも `containerDirective` タイプ。ネストの深さはASTの親子関係で表現される。

### 3.7 CSS注入方式

プラグインのCSSはJavaScriptから動的に `<style>` タグとして注入する。

```typescript
// activate() 内で実行
const style = document.createElement('style');
style.textContent = CSS_CONTENT; // ビルド時にCSSファイルの内容を文字列化
document.head.appendChild(style);
```

## 4. パフォーマンス要件

| 項目 | 要件 | 対策 |
|------|------|------|
| 話者定義の取得 | ページ読み込みをブロックしない | `activate()` 時に非同期で取得・キャッシュ |
| キャッシュTTL | 5分 | 過度なAPI呼び出しを防止 |
| AST変換速度 | 1ページあたり100ms以内 | `node.data.hName` によるメタデータ付与のみ、DOMは触らない |
| CSS読み込み | FOUC（スタイル未適用の一瞬表示）を防ぐ | `activate()` で即座にCSS注入 |
| 大量バブル | 1ページに50個以上のバブルがあっても描画に支障がない | 軽量なAST操作、CSS変数による効率的なスタイリング |

## 変更履歴

| ステアリング | 変更内容 |
|---|---|
| [#01-initial-implementation](.steering/20260315-01-initial-implementation/) | 実装時に `src/types.d.ts` を追加（CSS raw import型宣言、unified Plugin型宣言）。設計書にないファイルが追加された。 |
