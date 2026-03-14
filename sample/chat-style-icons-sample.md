# チャットスタイル アイコン定義

このページはチャットスタイル表示プラグインの話者定義ページです。
以下のテーブルに話者・表情・アイコン・配置を定義してください。

## アイコン定義テーブル

| 話者 | expression | アイコン | 配置 |
|------|-----------|---------|------|
| claude-bot | default | ![claude-bot](/attachment/674f5b8d5e7f1a001248c9e0) | left |
| claude-bot | smiling | ![claude-bot-smiling](/attachment/674f5b8d5e7f1a001248c9e1) | left |
| claude-bot | thinking | ![claude-bot-thinking](/attachment/674f5b8d5e7f1a001248c9e2) | left |
| me | default | ![me](/attachment/674f5b8d5e7f1a001248c9e3) | right |
| admin | default | ![admin](/attachment/674f5b8d5e7f1a001248c9e4) | left |

## 使い方

### 1. アイコン画像の準備

このページに話者ごとのアイコン画像をアップロードし、上のテーブルの「アイコン」列に `![alt](画像URL)` 形式で記入してください。

Growiの添付ファイル機能でアップロードすると `/attachment/xxxxx` 形式のURLが得られます。外部URLも使用可能です。

### 2. 記事での使い方

```markdown
::::chat-style
:::claude-bot_smiling
こんにちは！何かお手伝いできることはありますか？
:::

:::me
プラグインの使い方を教えてください。
:::

:::claude-bot_thinking
少し考えさせてください...
:::

:::claude-bot
これが回答です。expression を省略すると default が使われます。
:::
::::
```

### 3. テーブルの各列の説明

| 列 | 説明 | 例 |
|----|------|-----|
| 話者 | 記法で使う話者名（英数字・ハイフン・アンダースコア） | `claude-bot`, `me`, `admin` |
| expression | 表情の識別子。各話者に `default` は必須 | `default`, `smiling`, `thinking` |
| アイコン | Markdown画像記法 `![alt](url)` | `![claude-bot](/attachment/xxx)` |
| 配置 | `left`（相手側）または `right`（自分側） | `left`, `right` |
