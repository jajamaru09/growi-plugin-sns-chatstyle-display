# 03-tasklist.md

## タスクリスト

### 1. `client-entry.tsx` のリファクタリング

- [x] **1-1.** `hookRemarkPlugin(optionsGenerators)` 関数を抽出
  - `customGenerateViewOptions` と `customGeneratePreviewOptions` へのフック設定ロジック
  - 重複pushを防ぐため、`remarkPlugins` に既にプラグインが含まれていないかチェック

- [x] **1-2.** CSS注入・イベントリスナーの重複防止ガード追加
  - CSS注入済みフラグ（`style` 要素の `id` 属性で判定）
  - イベントリスナー登録済みフラグ（モジュールスコープ変数）

- [x] **1-3.** `Object.defineProperty` によるセッタートラップ実装
  - `growiFacade.markdownRenderer` の現在値を内部変数に退避
  - setter で値を保存しつつ `hookRemarkPlugin()` を呼び出し
  - getter で内部変数を返す
  - `configurable: false` 等で `defineProperty` が失敗した場合のフォールバック（ポーリング方式）

- [x] **1-4.** 初回フック適用
  - 既に `markdownRenderer` が存在する場合は即座にフックを適用

### 2. 動作確認

- [x] **2-1.** ビルドが通ることを確認（`npm run build`）
