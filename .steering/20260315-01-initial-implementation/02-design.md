# 02-design.md（初回実装の設計）

## 実装アプローチ

`docs/02-functional-design.md` および `docs/03-architecture.md` の設計に準拠して実装する。
ボトムアップで依存の少ないモジュールから順に実装し、最後にエントリーポイントで統合する。

### 実装順序

```
1. package.json / tsconfig.json（プロジェクト基盤）
2. src/styles/chat-style.css（CSS）
3. src/speaker-resolver.ts（話者定義の取得・パース）
4. src/node-transformer.ts（ASTノード変換）
5. src/plugin.ts（remarkプラグイン本体）
6. src/client-entry.tsx（エントリーポイント・統合）
```

## 変更するコンポーネント

すべて新規作成。既存ファイルへの変更なし。

### 1. package.json

```json
{
  "name": "growi-plugin-sns-chatstyle-display",
  "version": "1.0.0",
  "description": "SNS-style chat display plugin for GROWI",
  "main": "client-entry.tsx",
  "keywords": ["growi", "growi-plugin"],
  "growiPlugin": {
    "schemaVersion": 4,
    "types": ["script"]
  },
  "dependencies": {
    "unist-util-visit": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  },
  "license": "MIT"
}
```

> `unified` と `@growi/remark-growi-directive` はGrowi側が提供するため依存に含めない。

### 2. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "outDir": "./dist",
    "declaration": true
  },
  "include": ["src/**/*", "client-entry.tsx"]
}
```

### 3. src/styles/chat-style.css

`sample/chat-style-preview.html` で検証済みのCSSをベースにする。
変更点：
- Bootstrap CSS変数のフォールバック定義を削除（Growi上では不要）
- プレビュー用の `.theme-toggle` や `body` スタイルを削除
- プラグイン固有の `.chat-style-*` クラスのみ残す

### 4. src/speaker-resolver.ts

**責務**: `/chat-style-icons` ページの取得・パース・キャッシュ

```typescript
// 型定義
interface SpeakerDefinition {
  speaker: string;
  expression: string;
  iconUrl: string;
  position: 'left' | 'right';
}
type SpeakerMap = Map<string, SpeakerDefinition>;

// 公開API
export async function fetchSpeakerMap(): Promise<void>;     // activate()から呼ぶ
export function getSpeakerMap(): SpeakerMap | null;          // plugin.tsから同期参照
export function resolveSpeaker(name: string): SpeakerDefinition | null;
```

**内部処理**:
1. `fetch('/_api/v3/page?path=/chat-style-icons')` でページ取得
2. レスポンスの `page.revision.body` からMarkdownテーブルを抽出
3. テーブル行をパース:
   - 話者名、expression、配置はセル文字列をtrim
   - アイコン列は `![alt](url)` から正規表現 `/!\[.*?\]\((.*?)\)/` でURL抽出
4. `SpeakerMap` に `話者_expression` をキーとして格納
5. モジュール変数にキャッシュ、タイムスタンプ記録
6. `getSpeakerMap()` 呼び出し時にTTL（5分）を超過していたら再取得をトリガー

**`resolveSpeaker(name)` のパースロジック**:
1. `name` に `_` が含まれる場合、最後の `_` で分割 → `speaker_expression` で検索
2. 見つからなければ `name` 全体を話者名、`expression="default"` で検索
3. `_` を含まない場合、`name_default` で検索
4. いずれも見つからなければ `null` を返す

**バリデーション**:
- 話者名: `/^[a-zA-Z0-9_-]+$/`
- expression: 同上
- 配置: `left` または `right` のみ
- アイコンURL: `/` 始まりまたは `http://` / `https://` 始まりのみ

### 5. src/node-transformer.ts

**責務**: ASTノードへの `data.hName` 設定とアイコン・話者名の子ノード挿入

```typescript
// 公開API
export function transformChatStyleBlock(node: any): void;    // ::::chat-style コンテナ
export function transformSpeakerBubble(node: any, def: SpeakerDefinition): void;  // :::speaker バブル
export function transformError(node: any, message: string): void;  // エラー表示
```

**transformChatStyleBlock**:
- `node.data = { hName: 'div', hProperties: { className: ['chat-style-container'] } }`

**transformSpeakerBubble（左配置）**:
- `node.data = { hName: 'div', hProperties: { className: ['chat-style-bubble', 'chat-style-left'] } }`
- 子ノード先頭にアバターHTML挿入
- 子ノード先頭（アバターの次）に話者名HTML挿入
- 話者名・アイコンURLのHTMLエスケープ処理を適用

**transformSpeakerBubble（右配置）**:
- `node.data = { hName: 'div', hProperties: { className: ['chat-style-bubble', 'chat-style-right'] } }`
- 子ノード先頭に話者名HTML挿入
- 子ノード末尾にアバターHTML追加

**transformError**:
- `node.type = 'html'`、`node.children = []`
- エラーメッセージをHTMLエスケープしてから埋め込み

**HTMLエスケープ関数**:
- `&` → `&amp;`、`<` → `&lt;`、`>` → `&gt;`、`"` → `&quot;` の最低限の変換

### 6. src/plugin.ts

**責務**: remarkプラグインとしてAST走査・振り分け

```typescript
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

export const plugin: Plugin = function() {
  return (tree) => {
    visit(tree, 'containerDirective', (node) => {
      if (node.name !== 'chat-style') return;
      // ::::chat-style を検出
      transformChatStyleBlock(node);
      // 子ノードを走査
      for (const child of node.children) {
        if (child.type !== 'containerDirective') continue;
        const def = resolveSpeaker(child.name);
        if (def) {
          transformSpeakerBubble(child, def);
        } else {
          transformError(child, `話者 "${child.name}" は /chat-style-icons に定義されていません`);
        }
      }
    });
  };
};
```

**ポイント**:
- `visit` で `containerDirective` を走査するが、`name === 'chat-style'` のノードのみ処理
- 子ノードのうち `containerDirective` タイプのものだけを話者バブルとして処理
- `::::chat-style` 外の `containerDirective` はスキップされる（visit が `chat-style` 名のみにマッチするため）

### 7. src/client-entry.tsx

**責務**: プラグイン登録、CSS注入、話者定義の初期取得

```typescript
import { plugin } from './src/plugin';
import { fetchSpeakerMap } from './src/speaker-resolver';
import CSS_CONTENT from './src/styles/chat-style.css?raw';

const activate = (): void => {
  if (growiFacade == null || growiFacade.markdownRenderer == null) return;

  // CSS注入
  const style = document.createElement('style');
  style.textContent = CSS_CONTENT;
  document.head.appendChild(style);

  // 話者定義の非同期取得
  fetchSpeakerMap();

  // remarkプラグイン登録
  const { optionsGenerators } = growiFacade.markdownRenderer;

  const originalView = optionsGenerators.customGenerateViewOptions;
  optionsGenerators.customGenerateViewOptions = (...args) => {
    const options = originalView
      ? originalView(...args)
      : optionsGenerators.generateViewOptions(...args);
    options.remarkPlugins.push(plugin as any);
    return options;
  };

  const originalPreview = optionsGenerators.customGeneratePreviewOptions;
  optionsGenerators.customGeneratePreviewOptions = (...args) => {
    const options = originalPreview
      ? originalPreview(...args)
      : optionsGenerators.generatePreviewOptions(...args);
    options.remarkPlugins.push(plugin as any);
    return options;
  };
};
```

**ポイント**:
- 既存の `customGenerateViewOptions` を保持してから上書き（他プラグインとの共存）
- CSS注入は `activate()` 内で即座に実行（FOUC防止）
- `fetchSpeakerMap()` は非同期だが `await` しない（ページ読み込みをブロックしない）
- CSS読み込みは `?raw` サフィックスでViteの文字列インポートを利用

## データ構造の変更

なし（新規プラグインのため既存データ構造への変更は発生しない）。

## 影響範囲の分析

- **既存Markdown**: `::::chat-style` ブロック外には一切影響しない
- **他プラグイン**: `customGenerateViewOptions` の既存設定を保持して上書きするため共存可能
- **パフォーマンス**: CSS注入（1回）+ API取得（初回のみ、5分キャッシュ）+ AST走査（各ページ表示時）

## 参考URL

- [Developing GROWI Plug-ins (Remark Plug-ins) - DEV Community](https://dev.to/goofmint/developing-growi-plug-ins-remark-plug-ins-1g7g)
  - `activate()` のパターン、`optionsGenerators` の使い方、`leafGrowiPluginDirective` のAST構造を参考にした
- [GROWIプラグインを作るのにremark-directiveが便利だという話 - Qiita](https://qiita.com/goofmint/items/125e01e7978187c33a3c)
  - `containerDirective` / `textDirective` / `leafDirective` の3種類のノードタイプとその使い分けを参考にした
- [LINE風の吹き出しの会話をCSSで作ってみる - 125naroom](https://125naroom.com/web/3034)
  - CSS疑似要素での吹き出し尻尾の描画パターンを参考にした
- [Color modes - Bootstrap v5.3](https://getbootstrap.com/docs/5.3/customize/color-modes/)
  - `[data-bs-theme]` によるlight/dark切り替えとCSS変数の設計を参考にした
