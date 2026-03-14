# 02-design.md

## 実装アプローチ

### 1. アイコンサイズ変更（CSS）
- `chat-style.css` のアバター・アイコンサイズを `60px` → `100px` に変更
- レスポンシブ（600px以下）は `48px` → `72px` に変更

### 2. SpeakerMap未取得時の挙動改善（plugin.ts, node-transformer.ts）

**現状の問題：** `plugin.ts` で SpeakerMap が null の場合、`transformError()` でコンテナ全体をエラーHTMLに置換し、チャット内容が一切表示されない。

**改善方針：**
- SpeakerMap未取得時もコンテナ変換 (`transformChatStyleBlock`) は実行する
- 各話者バブルは `resolveSpeaker` が null を返すので、その場合はアイコンなし・話者名を directive 名で代替表示する
- `node-transformer.ts` に `transformSpeakerBubbleFallback()` を追加し、SpeakerDefinition なしでもバブル表示できるようにする

### 3. リロードボタン（node-transformer.ts, client-entry.tsx, CSS）

**方針：** AST変換時にリロードボタンのHTMLをコンテナ上部に挿入する。ボタン押下で `fetchSpeakerMap()` を実行後、ページをリロードして再レンダリングする。

- `node-transformer.ts` の `transformChatStyleBlock()` にリロードボタンHTML挿入を追加
- `client-entry.tsx` にクリックイベントハンドラをグローバル関数として登録
- CSS にリロードボタンのスタイルを追加
- リロードアイコンは SVG（Unicode や外部ライブラリに依存しない）

### 変更するコンポーネント

| ファイル | 変更内容 |
|---|---|
| `src/styles/chat-style.css` | アイコンサイズ100px化、リロードボタンスタイル追加 |
| `src/plugin.ts` | SpeakerMap未取得時のエラーブロックを削除、フォールバック処理追加 |
| `src/node-transformer.ts` | `transformSpeakerBubbleFallback()` 追加、リロードボタンHTML追加 |
| `client-entry.tsx` | リロード用グローバル関数の登録 |

### 影響範囲の分析
- SpeakerMap取得済みの場合の表示には影響なし（アイコンサイズ以外）
- リロードボタンは常に表示されるが、控えめなデザインにする

## 参考 URL
- なし（既存実装の改修のみ）
