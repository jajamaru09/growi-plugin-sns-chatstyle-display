---
author: Claude
source: Claude Code
conversation_id: fcc8b66f-900c-416d-b0c0-a0ac9ce78466
shared: false
tags: [Growi, プラグイン実装, Vite, デバッグ, TypeScript]
note: "実装フェーズで踏んだ地雷（pluginActivators問題）が一番の学びでした。公式ドキュメントをもう少し丁寧に読んでいれば防げたかもしれませんが、こうしたハマりポイントこそ記録する価値があると思います。"

---

# SNSチャットスタイル表示プラグイン 実装記録

## 概要

設計フェーズ完了後の実装・ビルド・実機テストで行われた作業と、遭遇した問題の解決記録。設計ドキュメント（`docs/01-06`）とステアリング（`.steering/20260315-01-initial-implementation/`）に基づいて実装を進め、Growi上での動作確認まで到達した。

## 実装の流れ

### ボトムアップの実装順序

依存の少ないモジュールから順に実装した。

```
Phase 1: プロジェクト基盤
  T-01: package.json（growiPlugin設定）
  T-02: tsconfig.json
  T-03: .gitignore
  T-04: .editorconfig

Phase 2: CSS
  T-05: src/styles/chat-style.css（プレビューHTMLから抽出・テーマ対応）

Phase 3: コアモジュール
  T-06: src/speaker-resolver.ts（API取得・テーブルパース・キャッシュ）
  T-07: src/node-transformer.ts（AST変換・XSSエスケープ）

Phase 4: プラグイン統合
  T-08: src/plugin.ts（remarkプラグイン本体）
  T-09: client-entry.tsx（エントリーポイント）

Phase 5: 静的検証
  T-10: TypeScriptコンパイル確認
```

### 設計からの差分

実装時に設計書にないファイルが1つ追加された。

| ファイル | 理由 |
|---------|------|
| `src/types.d.ts` | CSS raw import（`*.css?raw`）とunified `Plugin` 型の宣言が必要だった。Growi側が提供する `unified` を依存に含めないための型定義。 |

また、`client-entry.tsx` は設計書では `src/` 配下だったが、Growiプラグインの慣例に従いルート直下に配置した。

## Viteビルド設定

Growiのスクリプトプラグインは Vite でビルドする。公式ドキュメントに従い以下の設定を行った。

### vite.config.ts

```typescript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    rollupOptions: {
      input: ['/client-entry.tsx'],
    },
  },
});
```

### ビルドコマンド

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview"
}
```

### 必要な devDependencies

```json
"devDependencies": {
  "@vitejs/plugin-react": "^4.3.0",
  "typescript": "^5.0.0",
  "vite": "^6.0.0"
}
```

### ビルド出力

```
dist/
├── .vite/manifest.json              (0.16kB)
└── assets/client-entry-XXXXXXXX.js  (~10kB, gzip: ~3.9kB)
```

`manifest: true` を設定することで、Growiがビルド成果物のファイル名（ハッシュ付き）を特定できる。

### 重要: dist/ をGit管理する

Growiはプラグインのリポジトリから直接 `dist/` を読み込むため、**`dist/` を `.gitignore` に含めてはいけない**。当初 `.gitignore` に `dist/` を入れていたため、プラグインインストール後にビルド成果物が存在せずロードに失敗した。

## プラグイン登録の落とし穴: pluginActivators

実装中に最も時間を費やしたのがこの問題である。

### 症状

```
[chat-style] Script loaded
[chat-style] activate() called
Uncaught ReferenceError: growiFacade is not defined
```

スクリプトは読み込まれるが、`growiFacade` がグローバルに存在しないためクラッシュする。

### 原因

当初の実装では `activate()` をスクリプト末尾で直接呼び出していた。

```typescript
// ❌ 間違い: 直接呼び出し
const activate = (): void => {
  if (growiFacade == null) return; // ← ここでReferenceError
  // ...
};
activate(); // スクリプト読み込み時に即座に実行される
```

この時点ではGrowiがまだ `growiFacade` をグローバルスコープに設定していない。

### 解決

Growiのプラグインシステムでは、`window.pluginActivators` オブジェクトにプラグインを登録する。Growiが適切なタイミング（`growiFacade` 準備後）で `activate()` を呼び出す。

```typescript
// ✅ 正しい: window.pluginActivators に登録
const activate = (): void => {
  if (growiFacade == null || growiFacade.markdownRenderer == null) return;
  // ... プラグイン登録処理
};

const deactivate = (): void => {};

if ((window as any).pluginActivators == null) {
  (window as any).pluginActivators = {};
}
(window as any).pluginActivators['growi-plugin-sns-chatstyle-display'] = {
  activate,
  deactivate,
};
```

### なぜ気づきにくいか

多くの既存プラグインの解説記事では `activate()` の中身だけが紹介され、**登録方法の部分が省略されている**。公式ドキュメント（[Developing script plugins](https://docs.growi.org/en/dev/plugin/script.html)）には記載があるが、記事だけを参考にすると見落としやすい。

### growiFacade の参照方法

`window.pluginActivators` に登録する方式では、Growiが `activate()` を呼び出す時点で `growiFacade` がグローバルスコープに存在する。そのため `declare const growiFacade` での宣言で問題ない。

直接呼び出し方式で `window.growiFacade` として参照する方法も試したが、そもそもタイミングの問題なので解決にならなかった。

## デバッグ手法

### console.log の配置戦略

プラグインの動作確認では、処理の各段階にログを配置して「どこまで到達しているか」を特定するのが効果的だった。

```
1. スクリプト読み込み     → [chat-style] Script loaded
2. activate呼び出し      → [chat-style] activate() called
3. growiFacade確認       → [chat-style] growiFacade available
4. CSS注入              → [chat-style] CSS injected, length: XXXX
5. API取得開始           → [chat-style] Fetching speaker map...
6. テーブルパース結果     → [chat-style] Parsed speaker map: N entries
7. プラグイン登録         → [chat-style] View plugin registered
8. AST走査              → [chat-style] Plugin running, walking AST...
9. ディレクティブ検出     → [chat-style] Found containerDirective: chat-style
10. 話者解決             → [chat-style] Resolving speaker: me → {position: "right", ...}
```

各段階のログが出るかどうかで、問題の箇所を特定できる。

| ログが出ない箇所 | 推測される原因 |
|---|---|
| 1が出ない | プラグイン自体がGrowiに読み込まれていない（dist/不在、manifest不正） |
| 2が出ない | `pluginActivators` への登録に失敗している |
| 3が出ない | `growiFacade` が未定義（タイミング問題） |
| 6で0 entries | テーブルパースに失敗（ヘッダー名不一致、画像記法不正） |
| 8が出ない | remarkプラグインが `remarkPlugins` に登録されていない |
| 9で0 directives | `::::chat-style` 記法がASTに変換されていない（remark-directive未読み込み） |

## TypeScript型定義の工夫

### unified / unist の型

`unified` と `unist` はGrowi側が提供するため、プラグインの `dependencies` には含めない。しかしTypeScriptのコンパイルには型定義が必要なので、`src/types.d.ts` で最低限の型を宣言した。

```typescript
// unified の Plugin 型
declare module 'unified' {
  import type { Node } from 'unist';
  export type Plugin = () => (tree: Node) => void;
}
```

当初 `Plugin` の引数を `(tree: unknown) => void` と定義したが、`visit(tree, ...)` に渡す際に `Node` 型が必要になり修正した。型定義の整合は段階的に合わせていく必要がある。

### CSS raw import

Viteの `?raw` サフィックスでCSSファイルを文字列としてインポートする。TypeScriptはこの記法を知らないため、型宣言が必要。

```typescript
declare module '*.css?raw' {
  const content: string;
  export default content;
}
```

## 注意点・落とし穴

### ビルドハッシュとキャッシュ

Viteはビルドごとにファイル名にハッシュを付与する（例: `client-entry-CIb3td5l.js`）。Growiはmanifest.jsonでファイル名を解決するため問題ないが、ブラウザキャッシュが残る場合がある。プラグイン更新後に動作が変わらない場合は、ハードリフレッシュ（Ctrl+Shift+R）を試すこと。

### tsc と vite build の二段階

`npm run build` は `tsc && vite build` で、TypeScriptの型チェックとViteのバンドルを別々に実行する。`tsc` はトランスパイルではなく型チェックのみ（`noEmit`）で、実際のトランスパイルはViteが行う。そのため `tsc` で通ったコードがViteで失敗することは稀だが、逆（Viteでは通るが型エラーがある）はあり得る。

### `any` の使用箇所

`window.pluginActivators` や `growiFacade` のような外部定義のグローバルオブジェクトには `any` が避けられない箇所がある。プラグイン内部のコードでは `any` を使わず、境界部分にのみ限定すること。

## 補足知識

### Growiプラグインのインストールと反映

Growiの管理画面からGitHubリポジトリURLを指定してプラグインをインストールする。インストール後はGrowiの再起動が必要。プラグインのコードを更新した場合も、再インストールまたは再起動が必要になる場合がある。開発中は頻繁に再起動することになるため、Growiをローカルで動かすのが効率的。

### deactivate関数の用途

現時点では空実装だが、将来的にプラグインのアンインストールやホットリロードに対応する場合、注入したCSS `<style>` タグの削除やイベントリスナーの解除などのクリーンアップ処理を実装する。

### manifest.json の構造

```json
{
  "client-entry.tsx": {
    "file": "assets/client-entry-XXXXXXXX.js",
    "src": "client-entry.tsx",
    "isEntry": true
  }
}
```

Growiはこのmanifestを読んで、実際のビルド済みJSファイルのパスを解決する。`isEntry: true` のエントリーが読み込まれる。

## 参考URL

- [Developing script plugins | GROWI Docs](https://docs.growi.org/en/dev/plugin/script.html) — 公式のスクリプトプラグイン開発ドキュメント。`window.pluginActivators` への登録パターンが記載されている
- [スクリプトプラグインを開発する | GROWI Docs](https://docs.growi.org/ja/dev/plugin/script.html) — 同上の日本語版
- [Plugin development basics | GROWI Docs](https://docs.growi.org/en/dev/plugin/development.html) — プラグイン開発の基礎（ディレクトリ構成、package.json設定）
