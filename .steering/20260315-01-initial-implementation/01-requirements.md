# 01-requirements.md（初回実装の要求内容）

## 変更・追加する機能の説明

Growiプラグイン「growi-plugin-sns-chatstyle-display」の初回実装を行う。
`docs/` で定義された設計に基づき、以下の機能を動作可能な状態まで実装する。

### 実装スコープ

| 機能ID | 機能 | 初回スコープ |
|--------|------|------------|
| F-01 | 会話ブロック記法 | `::::chat-style` ラッパーの検出と処理 |
| F-02 | チャットバブル記法 | `:::speaker_expression` のパースとAST変換 |
| F-03 | 左右配置レンダリング | SpeakerMapの `position` に基づく左右配置 |
| F-04 | アイコン表示 | 話者定義テーブルから取得したアイコンURLの表示 |
| F-05 | 話者名表示 | 吹き出し上部に話者名を表示 |
| F-06 | 表情差分対応 | `_expression` によるアイコン切り替え（省略時 `default`） |
| F-07 | Markdown内テキスト | `node.data.hName` 方式によるGrowiパイプライン委譲 |
| F-08 | 話者定義ページ | `/chat-style-icons` テーブルの取得・パース・キャッシュ |

### 初回スコープ外（将来対応）

- テストコードの整備（Vitest導入）
- npm公開用のビルド設定最適化
- README.mdの利用者向けドキュメント

## ユーザーストーリー

> Wiki編集者として、Growiにプラグインをインストールし、`/chat-style-icons` にアイコン定義を作成した後、任意のページで `::::chat-style` ブロックを使ってSNS風チャット表示を行いたい。

## 受け入れ条件

- [ ] `package.json` にGrowiプラグインの必須設定が含まれている
- [ ] `client-entry.tsx` からプラグインが正常に登録される
- [ ] `::::chat-style` ブロック内の `:::speaker_expression` がチャットバブルとして表示される
- [ ] `::::chat-style` ブロック外の `:::` 記法は処理されない
- [ ] expression省略時に `default` が適用される
- [ ] `/chat-style-icons` ページのテーブルからアイコン・配置が正しく読み取られる
- [ ] 未定義の話者使用時にエラーメッセージが表示される
- [ ] `/chat-style-icons` ページ未作成時にエラーメッセージが表示される
- [ ] light/darkテーマの両方で適切に表示される
- [ ] 吹き出し内の太字・リンク・コードがGrowiの標準レンダリングで処理される
- [ ] 既存のMarkdownコンテンツに影響がない

## 制約事項

- Growi v7.x以降を対象とする
- `@growi/remark-growi-directive` がGrowi側で提供されていることが前提
- クライアントサイドのみで動作する（サーバーサイド処理なし）
