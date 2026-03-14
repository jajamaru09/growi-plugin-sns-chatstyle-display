# ユビキタス言語定義

## 1. ドメイン用語

| 用語（日本語） | 用語（英語） | 定義 | コード上の命名 |
|--------------|-------------|------|--------------|
| 会話ブロック | Chat Style Block | `::::chat-style` で囲まれた会話モードの範囲。この中でのみ話者記法が有効 | `chat-style` (ディレクティブ名) |
| 話者 | Speaker | 会話の発言者。`/chat-style-icons` で定義される | `speaker` |
| 表情 | Expression | 同一話者のアイコンバリエーション（`default`, `smiling` 等） | `expression` |
| 話者記法 | Speaker Notation | `:::speaker_expression` 形式のMarkdown記法 | - |
| 話者定義 | Speaker Definition | 話者名・表情・アイコン・配置の1セット | `SpeakerDefinition` |
| 話者定義マップ | Speaker Map | 全話者定義を `話者_expression` キーで保持するマップ | `SpeakerMap` |
| 話者定義ページ | Speaker Definition Page | `/chat-style-icons` にあるアイコン管理ページ | - |
| 吹き出し | Chat Bubble | 1つの発言を表示するUI要素（アイコン＋話者名＋メッセージ） | `chat-style-bubble` (CSSクラス) |
| 配置 | Position | 吹き出しの左右配置（`left`＝相手側、`right`＝自分側） | `position` |

## 2. 技術用語

| 用語 | 定義 | 関連 |
|------|------|------|
| containerDirective | remark-directiveが `:::` / `::::` 記法から生成するASTノードタイプ | `@growi/remark-growi-directive` |
| hName | remark→rehype変換時にHTML要素名を指定するノードメタデータ | `node.data.hName` |
| hProperties | remark→rehype変換時にHTML属性を指定するノードメタデータ | `node.data.hProperties` |
| growiFacade | Growiがクライアントサイドプラグインに公開するAPI | `growiFacade.markdownRenderer` |
| optionsGenerators | remarkPlugins/rehypePluginsを登録するためのオプション生成関数群 | `customGenerateViewOptions` 等 |
| AST | Abstract Syntax Tree。Markdownをパースした構文木 | unified/remark |
| TTL | Time To Live。キャッシュの有効期限 | `CACHE_TTL_MS` |

## 3. UI/UX用語

| 用語（日本語） | 用語（英語） | 定義 | CSSクラス |
|--------------|-------------|------|----------|
| 会話コンテナ | Chat Style Container | 会話ブロック全体を囲むUI領域（薄い背景色） | `.chat-style-container` |
| 左配置 | Left Position | 相手側の吹き出し表示（アイコンが左） | `.chat-style-left` |
| 右配置 | Right Position | 自分側の吹き出し表示（アイコンが右） | `.chat-style-right` |
| アバター | Avatar | 話者のアイコン画像表示領域 | `.chat-style-avatar` |
| メッセージ | Message | 吹き出し本体（角丸・尻尾付き） | `.chat-style-message` |
| 話者名ラベル | Speaker Name | 吹き出し上部に表示される話者名 | `.chat-style-speaker-name` |
| エラー表示 | Error Display | 未定義話者等のエラーメッセージ | `.chat-style-error` |

## 4. 記法の用語対応

| Markdown上の表現 | 意味 | 例 |
|-----------------|------|-----|
| `::::chat-style` | 会話ブロック開始 | `::::chat-style` |
| `::::` | 会話ブロック終了 | `::::` |
| `:::speaker_expression` | 話者バブル開始 | `:::claude-bot_smiling` |
| `:::speaker` | 話者バブル開始（expression省略→default） | `:::me` |
| `:::` | 話者バブル終了 | `:::` |
