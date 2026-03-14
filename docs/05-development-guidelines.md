# 開発ガイドライン

## 1. コーディング規約

### 言語
- TypeScript を使用（JavaScript は原則禁止）
- `strict: true` を有効にする

### フォーマット
- インデント: スペース2つ
- セミコロン: あり
- クォート: シングルクォート
- 末尾カンマ: あり（trailing comma）
- 行の最大長: 120文字

### import 順序
1. Node.js 標準モジュール
2. 外部パッケージ（`unified`, `unist-util-visit` 等）
3. プロジェクト内モジュール（相対パス）
4. スタイル・アセット

各グループ間は空行で区切る。

## 2. 命名規則

### ファイル名
- ケバブケース: `speaker-resolver.ts`, `node-transformer.ts`
- エントリーポイント: `client-entry.tsx`（Growiプラグイン規約）
- CSS: `chat-style.css`

### 変数・関数
- キャメルケース: `speakerMap`, `parseSpeakerName()`
- 定数: アッパースネークケース: `CACHE_TTL_MS`, `CSS_CONTENT`
- 型・インターフェース: パスカルケース: `SpeakerDefinition`, `SpeakerMap`

### CSSクラス名
- `chat-style-` プレフィックス付きケバブケース
- 例: `chat-style-container`, `chat-style-bubble`, `chat-style-left`
- プレフィックスにより他のプラグインやGrowiのスタイルとの衝突を防ぐ

### CSS変数名
- プラグイン固有: `--chat-style-` プレフィックス
- 例: `--chat-style-left-bg`, `--chat-style-right-color`

## 3. スタイリング規約

### CSS設計方針
- Bootstrap CSS変数（`--bs-*`）を基盤として参照する
- プラグイン固有の色は `--chat-style-*` CSS変数で定義する
- light/dark テーマは `[data-bs-theme]` セレクタで切り替える
- `!important` の使用は原則禁止（詳細度で対応）

### レスポンシブ対応
- モバイルブレークポイント: `max-width: 600px`
- 吹き出し幅: デスクトップ `max-width: 70%` / モバイル `max-width: 85%`

## 4. テスト規約

### テスト方針
- ユニットテスト対象: `speaker-resolver.ts`（テーブルパース）、`node-transformer.ts`（AST変換）、記法パースロジック
- テストフレームワーク: 導入時に選定（Vitest 推奨）
- テストファイル配置: `src/__tests__/`

### テストケースの重点項目
- 話者名_expression のパース（正常系・省略・アンダースコア含み）
- Markdownテーブルのパース（正常・空行・不正形式）
- 未定義話者のエラーハンドリング
- `::::chat-style` ブロック外のノードがスキップされること

## 5. Git規約

### ブランチ戦略
- `main`: リリース可能な安定版
- `feature/xxx`: 機能開発ブランチ
- `fix/xxx`: バグ修正ブランチ

### コミットメッセージ
- 日本語または英語（統一すること）
- 形式: `type: 概要`
- type: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`

例:
```
feat: ::::chat-style 会話ブロックのAST変換を実装
fix: 話者名にアンダースコアを含む場合のパースを修正
docs: 02-functional-design.md にCSS変数設計を追記
```

### コミット粒度
- 1つの論理的変更につき1コミット
- ドキュメント変更とコード変更は同一コミットにまとめてよい（ステアリング完了時）

## 6. セキュリティ規約

### XSS対策
- 話者名・expression値をHTMLに埋め込む際はエスケープ処理を行う
- `node.type = 'html'` で出力する値には必ずサニタイズを適用
- アイコンURLは `<img src="">` の属性値としてのみ使用し、スクリプト実行を防ぐ

### 入力バリデーション
- `/chat-style-icons` ページから取得したテーブルデータのバリデーション
- 話者名: 英数字、ハイフン、アンダースコアのみ許可（`/^[a-zA-Z0-9_-]+$/`）
- expression: 同上
- 配置: `left` または `right` のみ
- アイコンURL: Markdown画像記法からのURL抽出時にプロトコルを検証（`http:`, `https:`, `/` 始まりのみ）
