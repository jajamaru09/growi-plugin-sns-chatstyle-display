# growi-plugin-sns-chatstyle-display

SNS風チャット表示プラグイン for GROWI

## 概要

このプラグインは、GROWI（オープンソースのWikiツール）上で、LINEやSlackのようなSNS風チャットスタイルの会話表現を簡単に記述・表示できるようにするプラグインです。

### 特徴

- 📱 SNS風の会話表示（左右の吹き出し形式）
- 👤 話者ごとのアイコンと名前表示
- 😊 表情差分対応（同一話者で複数のアイコン）
- 📝 Markdown記法での簡単記述
- ⚡ リアルタイムプレビュー対応
- 🔧 話者定義の一元管理

## インストール

### 前提条件

- GROWI v7.x 以降

### インストール手順

1. プラグインファイルをGROWIサーバーにアップロード
2. GROWIの管理画面でプラグインを有効化
3. サーバーを再起動

## 使い方

### 1. 話者定義ページの作成

まず、`/chat-style-icons` ページを作成して話者の定義を行います：

```markdown
# チャットスタイル アイコン定義

| 話者 | expression | アイコン | 配置 |
|------|-----------|---------|------|
| claude-bot | default | ![claude-bot](/attachment/xxx) | left |
| claude-bot | smiling | ![claude-bot-smiling](/attachment/yyy) | left |
| me | default | ![me](/attachment/zzz) | right |
| admin | default | ![admin](/attachment/aaa) | left |
```

### 2. 記事での記法

記事内で以下の記法を使用してチャット形式を表示します：

```markdown
# 通常のドキュメント

ここは普通のMarkdownです。以下から会話形式になります。

::::chat-style
:::claude-bot_smiling
こんにちは！何かお手伝いできることはありますか？
**太字**や`コード`も使えます。
:::

:::me
プラグインの使い方を教えてください。
:::

:::claude-bot
expression を省略すると default が使われます。
:::
::::

ここからまた通常のMarkdownに戻ります。
```

### 記法の詳細

#### 会話ブロック

- `::::chat-style` - 会話モードの開始（コロン4つ）
- `::::` - 会話モードの終了（コロン4つ）
- 1ページ内に複数の会話ブロックを配置可能

#### 話者記法

- `:::話者名_表情` - 話者名と表情をアンダースコアで区切る
- `:::話者名` - 表情を省略した場合は `default` を使用

### 話者定義テーブルの項目

| 列 | 説明 | 例 |
|----|------|-----|
| 話者 | 記法で使う話者名（英数字・ハイフン・アンダースコア） | `claude-bot`, `me`, `admin` |
| expression | 表情の識別子。各話者に `default` は必須 | `default`, `smiling`, `thinking` |
| アイコン | Markdown画像記法 `![alt](url)` | `![claude-bot](/attachment/xxx)` |
| 配置 | `left`（相手側）または `right`（自分側） | `left`, `right` |

## 表示例

プラグインを使用すると以下のように表示されます：

```
[アイコン] claude-bot                   
┌─────────────────────────────┐        
│ こんにちは！                 │        
│ 何かお手伝いできることは     │        
│ ありますか？                 │        
└─────────────────────────────┘        

                            me [アイコン]
                    ┌─────────────────────┐
                    │ プラグインの使い方を │
                    │ 教えてください。     │
                    └─────────────────────┘
```

## 開発

### 開発環境のセットアップ

```bash
npm install
npm run dev
```

### ビルド

```bash
npm run build
```

### プロジェクト構造

```
├── src/
│   ├── plugin.ts              # メインプラグインファイル
│   ├── speaker-resolver.ts    # 話者定義の解決
│   ├── node-transformer.ts    # ASTノード変換
│   ├── types.d.ts            # 型定義
│   └── styles/
│       └── chat-style.css    # チャット表示用CSS
├── sample/                   # サンプルファイル
├── docs/                    # 詳細ドキュメント
└── client-entry.tsx        # クライアントエントリポイント
```

## カスタマイズ

### CSSのカスタマイズ

`src/styles/chat-style.css` を編集することで、チャットバブルのデザインをカスタマイズできます。

### 新しい話者の追加

1. `/chat-style-icons` ページのテーブルに新しい行を追加
2. アイコン画像をGROWIにアップロード
3. 記事で新しい話者名を使用

## トラブルシューティング

### よくある問題

**Q: 話者が表示されません**
A: `/chat-style-icons` ページが存在し、正しいテーブル形式になっているか確認してください。

**Q: アイコンが表示されません**
A: アイコンのURL（`/attachment/xxx` または外部URL）が正しいか確認してください。

**Q: プラグインが動作しません**
A: GROWIのバージョンがv7.x以降であることを確認し、サーバーを再起動してください。

## ライセンス

MIT License

## 貢献

プルリクエストや Issue の報告を歓迎します。

## 関連リンク

- [GROWI](https://growi.org/)
- [GROWI プラグイン開発ガイド](https://docs.growi.org/)