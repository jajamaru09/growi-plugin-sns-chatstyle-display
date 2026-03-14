---
author: Claude
source: Claude Code
conversation_id: fcc8b66f-900c-416d-b0c0-a0ac9ce78466
shared: false
tags: [Growi, プラグイン開発, remark, AST, TypeScript]
note: "Growiプラグイン開発の全体像を、公式ドキュメントだけでは見えにくい実装上の判断ポイントまで踏み込んでまとめました。特にhName方式とtype='html'方式の使い分けは、実際に設計を進める中で判明した重要な知見です。"

---

# Growiプラグイン開発の基礎知識

## 概要

Growi（OSSのWikiツール）のクライアントサイドプラグイン開発に必要な基礎知識をまとめる。Growiはmarkdownの処理にunified/remarkパイプラインを採用しており、プラグインはこのパイプラインに介入してカスタム記法の追加やレンダリングの拡張を行う仕組みである。

対象バージョンはGrori v7.x以降、プラグインスキーマバージョン4。

## プラグインの全体構造

### エントリーポイント（client-entry.tsx）

Growiプラグインの起点となるファイル。`activate()` 関数を定義し、`growiFacade` を通じてremarkプラグインを登録する。

```typescript
import { plugin } from './src/plugin';

const activate = (): void => {
  if (growiFacade == null || growiFacade.markdownRenderer == null) {
    return;
  }

  const { optionsGenerators } = growiFacade.markdownRenderer;

  // 閲覧用
  optionsGenerators.customGenerateViewOptions = (...args) => {
    const options = optionsGenerators.generateViewOptions(...args);
    options.remarkPlugins.push(plugin as any);
    return options;
  };

  // プレビュー用
  optionsGenerators.customGeneratePreviewOptions = (...args) => {
    const options = optionsGenerators.generatePreviewOptions(...args);
    options.remarkPlugins.push(plugin as any);
    return options;
  };
};
```

閲覧用（`customGenerateViewOptions`）とプレビュー用（`customGeneratePreviewOptions`）の**両方**に登録が必要である点に注意。片方だけだと、編集中のプレビューまたは閲覧ページのいずれかでプラグインが動作しない。

### package.json の必須設定

```json
{
  "name": "growi-plugin-example",
  "version": "1.0.0",
  "main": "client-entry.tsx",
  "keywords": ["growi", "growi-plugin"],
  "growiPlugin": {
    "schemaVersion": 4,
    "types": ["script"]
  }
}
```

| フィールド | 値 | 説明 |
|---|---|---|
| `growiPlugin.schemaVersion` | `4` | Growi v7.x向け |
| `growiPlugin.types` | `["script"]` | クライアントサイドスクリプトとして登録 |
| `keywords` | `["growi", "growi-plugin"]` | Growiが自動検出するために必要 |
| `main` | `"client-entry.tsx"` | エントリーポイント |

## growiFacade の提供範囲

`growiFacade` はGrowiがクライアントサイドプラグインに公開するAPIだが、提供範囲は限定的である。

### できること

```
growiFacade.markdownRenderer.optionsGenerators
  ├── generateViewOptions(...)           // 閲覧用オプション生成（既定）
  ├── customGenerateViewOptions(...)     // 閲覧用オプション生成（上書き）
  ├── generatePreviewOptions(...)        // プレビュー用オプション生成（既定）
  └── customGeneratePreviewOptions(...)  // プレビュー用オプション生成（上書き）
```

- `options.remarkPlugins` へのremark プラグイン追加
- `options.rehypePlugins` へのrehypeプラグイン追加
- `options.components` のカスタムコンポーネント差し替え

### できないこと

- **ページ内容の取得**: REST APIを直接`fetch`する必要がある
- **Markdownの直接レンダリング**: レンダリングパイプラインへの介入のみ可能
- **Growi内部状態へのアクセス**: ユーザー情報やページメタデータ等は取得不可

ページ内容を取得したい場合は、ブラウザセッションを利用して直接APIを叩く：

```typescript
const res = await fetch('/_api/v3/page?path=/some-page');
const data = await res.json();
const markdown = data.page.revision.body;
```

## ASTノードタイプとディレクティブ記法

Growiは `@growi/remark-growi-directive` を内蔵しており、ディレクティブ記法（`:`, `::`, `:::`）をAST（抽象構文木）ノードに変換する。

| Markdown記法 | ASTノードタイプ | 用途 |
|---|---|---|
| `:name` | `textDirective` | インラインディレクティブ |
| `::name` | `leafDirective` | ブロック単行ディレクティブ |
| `:::name ... :::` | `containerDirective` | ブロック複数行ディレクティブ |
| `::::name ... ::::` | `containerDirective` | ネストされたコンテナ |

`:::` と `::::` はどちらも `containerDirective` タイプを生成する。違いはASTの親子関係で表現される。`::::` の子として `:::` がネストされる構造になる。

### GrowiNode インターフェース

```typescript
interface GrowiNode extends Node {
  name: string;                        // ディレクティブ名
  type: string;                        // ノードタイプ
  attributes: { [key: string]: string }; // {key=value} の属性
  children: GrowiNode[];               // 子ノード
  value: string;                       // テキスト値
}
```

## AST変換の2つの方式

remarkプラグインでASTノードをHTMLに変換する方式は主に2つある。どちらを選ぶかはユースケースによって大きく異なる。

### 方式1: `node.type = 'html'`（直接置換）

ノード全体を生のHTML文字列で置き換える。**子ノードは消失する**。

```typescript
node.type = 'html';
node.value = '<div class="my-plugin"><iframe src="..."></iframe></div>';
node.children = [];
```

**適したユースケース**: YouTube埋め込み、外部コンテンツのiframe表示など、子ノードのMarkdown処理が不要なケース。

### 方式2: `node.data.hName`（メタデータ付与）

ノードにHTML変換用のメタデータを設定する。**子ノードは保持され**、Growiの標準パイプライン（rehype）がレンダリングする。

```typescript
node.data = {
  hName: 'div',                                    // HTML要素名
  hProperties: { className: ['my-container'] }      // HTML属性
};
// → <div class="my-container">子ノードのレンダリング結果</div>
```

**適したユースケース**: カスタムコンテナ内にMarkdownテキストを含むケース。吹き出し、カスタムアラート、タブ表示など。

### 比較表

| 観点 | `node.type = 'html'` | `node.data.hName` |
|---|---|---|
| 子ノード | 消失（HTML文字列で置換） | 保持（Growiが標準レンダリング） |
| 内部のMarkdown | プラグイン側で自前処理が必要 | Growiに委譲（太字・リンク等が自動処理） |
| 他プラグインとの共存 | 不可（HTML化後は他プラグインが介入不可） | 可能（AST段階で処理） |
| 実装の簡易さ | HTML文字列を組み立てるだけ | AST操作の理解が必要 |
| 代表的な用途 | iframe埋め込み、エラー表示 | コンテナ系UI（吹き出し、カード等） |

この使い分けは公式ドキュメントには明記されておらず、実際にプラグインを設計する中で判明する知見である。

### hName方式での子ノード挿入

`node.data.hName` は既存の子ノードを保持するが、アイコン画像や装飾的なHTMLなど、Markdown上に存在しない要素を追加したい場合は、子ノード配列に直接挿入する：

```typescript
// 先頭に挿入
node.children.unshift({
  type: 'html',
  value: '<div class="icon"><img src="..." /></div>'
});

// 末尾に追加
node.children.push({
  type: 'html',
  value: '<div class="footer">追加要素</div>'
});
```

## CSS注入方式

Growiプラグインにはスタイルシートの自動読み込み機構がないため、JavaScriptから動的に `<style>` タグを注入する。

```typescript
// activate() 内で実行
const style = document.createElement('style');
style.textContent = CSS_CONTENT; // ビルド時にCSSファイルの内容を文字列として取り込む
document.head.appendChild(style);
```

FOUC（Flash of Unstyled Content: スタイル適用前のちらつき）を防ぐため、`activate()` 内で即座にCSSを注入するのが望ましい。

## 注意点・落とし穴

### remarkプラグインは同期処理

remarkプラグインの `tree` 変換関数は同期的に実行される。`async/await` や `Promise` は使用できない。外部APIからのデータ取得が必要な場合は、`activate()` 時に非同期で取得しモジュール変数にキャッシュしておき、remarkプラグイン内ではキャッシュを参照する設計にする必要がある。

### ディレクティブのネストにおけるコロン数

`::::` と `:::` のネストは、remark-directiveの仕様でコロンの数が多い方が外側のコンテナになる。しかし、どちらも `containerDirective` 型として生成されるため、プラグイン側でノード名やASTの深さで判別する必要がある。

### customGenerateViewOptions の上書き注意

`customGenerateViewOptions` を上書きする際、他のプラグインが先に設定した上書きを消してしまう可能性がある。既存の `customGenerateViewOptions` が存在する場合はそれを呼び出したうえで拡張するのが安全：

```typescript
const original = optionsGenerators.customGenerateViewOptions;
optionsGenerators.customGenerateViewOptions = (...args) => {
  const options = original
    ? original(...args)
    : optionsGenerators.generateViewOptions(...args);
  options.remarkPlugins.push(plugin as any);
  return options;
};
```

## 補足知識

### unified/remarkのパイプライン構造

Growiのmarkdownレンダリングは `remark（Markdown→AST）` → `rehype（AST→HTML）` → `ブラウザ表示` の3段階パイプラインで処理される。remarkプラグインはAST段階で介入し、rehypeプラグインはHTML変換段階で介入する。`node.data.hName` はこの remark→rehype の橋渡しを制御するメタデータであり、remarkの段階でrehypeの出力を指示できる仕組みになっている。

### visit関数の使い方

`unist-util-visit` の `visit` 関数はASTを深さ優先で走査する。第2引数にノードタイプを指定すると、そのタイプのノードだけにコールバックが実行される。全ノードを走査する場合は第2引数を省略する。

```typescript
// 特定タイプのみ
visit(tree, 'containerDirective', (node) => { /* ... */ });

// 全ノード
visit(tree, (node) => { /* ... */ });
```

### Growiプラグインのデバッグ

クライアントサイドで動作するため、ブラウザのDevTools（Console, Elements, Network）でデバッグする。AST変換の結果を確認するには、`console.log(JSON.stringify(node, null, 2))` でノード構造を出力するのが手軽である。

## 参考URL

- [Developing GROWI Plug-ins (Remark Plug-ins) - DEV Community](https://dev.to/goofmint/developing-growi-plug-ins-remark-plug-ins-1g7g) — Growi remarkプラグインの開発チュートリアル（YouTube埋め込みプラグインの実装例）
- [GROWIプラグインを作るのにremark-directiveが便利だという話 - Qiita](https://qiita.com/goofmint/items/125e01e7978187c33a3c) — remark-directiveを活用したGrowiプラグイン開発の解説
- [Developing script plugins | GROWI Docs](https://docs.growi.org/en/dev/plugin/script.html) — 公式のスクリプトプラグイン開発ドキュメント
- [remark-directive - GitHub](https://github.com/remarkjs/remark-directive) — ディレクティブ記法のremark公式プラグイン
