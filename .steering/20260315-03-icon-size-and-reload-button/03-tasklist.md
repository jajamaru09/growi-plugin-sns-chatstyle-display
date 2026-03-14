# 03-tasklist.md

## タスクリスト

| # | タスク | ファイル | 状態 |
|---|---|---|---|
| 1 | アイコンサイズを60px→100pxに変更（レスポンシブは48px→72px） | `src/styles/chat-style.css` | [x] |
| 2 | リロードボタンのCSSスタイル追加 | `src/styles/chat-style.css` | [x] |
| 3 | `transformSpeakerBubbleFallback()` を追加（SpeakerMap未取得時のフォールバック表示） | `src/node-transformer.ts` | [x] |
| 4 | `transformChatStyleBlock()` にリロードボタンHTML挿入を追加 | `src/node-transformer.ts` | [x] |
| 5 | SpeakerMap未取得時のエラーブロックを削除し、フォールバック処理に変更 | `src/plugin.ts` | [x] |
| 6 | リロード用グローバル関数 `window.__chatStyleReload()` を登録 | `client-entry.tsx` | [x] |
| 7 | ビルド確認 | - | [x] |
