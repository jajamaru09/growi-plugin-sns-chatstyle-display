# 02-design.md

## 実装アプローチ

### 問題の根本原因

Growi は Next.js ベースの SPA であり、ページ遷移時に React コンポーネントが再マウントされる。このとき `growiFacade.markdownRenderer` が新しいオブジェクトに差し替えられる可能性が高い。現在の `activate()` は初回のみ `optionsGenerators.customGenerateViewOptions` を設定するため、再マウント後にフックが消失する。

### 修正方針

`growiFacade` オブジェクトの `markdownRenderer` プロパティに `Object.defineProperty` でセッター/ゲッタートラップを設置する。`markdownRenderer` が再設定されるたびに、自動的にremarkプラグインのフックを再適用する。

### 設計詳細

1. **プラグインフック関数の分離**: remarkプラグインを `optionsGenerators` にフックするロジックを独立関数 `hookRemarkPlugin()` として抽出
2. **セッタートラップの設置**: `Object.defineProperty` で `growiFacade.markdownRenderer` のセッターを定義し、値が設定されるたびに `hookRemarkPlugin()` を呼び出す
3. **初回フックの維持**: 既に `markdownRenderer` が存在する場合は即座にフックを適用

### 変更するコンポーネント

- `client-entry.tsx` - activate 関数のリファクタリング

### 影響範囲

- remarkプラグインの登録タイミングが変更される（初回のみ → 毎回 `markdownRenderer` が設定されるたび）
- plugin.ts、node-transformer.ts、speaker-resolver.ts には変更なし
- CSS にも変更なし

### 注意点

- `Object.defineProperty` のセッターは、既にプロパティが `configurable: false` の場合は失敗する。その場合はポーリングなど代替手段にフォールバックする
- CSS注入やイベントリスナーの重複登録を防ぐガード処理を追加する
- `plugin` オブジェクトが `remarkPlugins` に重複pushされないよう、フック時に既存チェックを行う
