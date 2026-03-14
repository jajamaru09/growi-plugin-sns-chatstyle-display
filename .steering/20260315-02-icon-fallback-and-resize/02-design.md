# 02-design.md

## 実装アプローチ

### 1. speaker-resolver.ts — アイコン列が空の場合の許容

現在はアイコン列からMarkdown画像パターンが見つからない行を `continue` でスキップしている（L65-68）。

**変更:** アイコン列が空（トリム後に空文字列）の場合、iconUrlを空文字列として話者定義を登録する。画像パターンが存在するがURLが無効な場合は従来通りスキップ。

```
Before: iconMatch なし → continue（行スキップ）
After:  iconRaw が空 → iconUrl = "" で登録
        iconMatch あり＆URL有効 → 従来通り
        iconMatch あり＆URL無効 → continue
        iconRaw 非空＆iconMatch なし → continue
```

### 2. node-transformer.ts — アバターの条件付き出力

`createAvatarHtml` の呼び出し箇所で `def.iconUrl` が空文字列かどうかを判定。

- 空でない → 従来通りアバターdivを出力
- 空 → アバターdivを出力しない

### 3. chat-style.css — サイズ変更

| プロパティ | 変更前 | 変更後 |
|---|---|---|
| `.chat-style-avatar` width/height | 40px | 60px |
| `.chat-style-icon` width/height | 40px | 60px |
| `.chat-style-speaker-name` font-size | 0.75em | 1em |
| レスポンシブ `.chat-style-avatar` | 32px | 48px |
| レスポンシブ `.chat-style-icon` | 32px | 48px |

## 変更するコンポーネント

| ファイル | 変更内容 |
|---|---|
| `src/speaker-resolver.ts` | アイコン列空の場合にiconUrl=""で登録 |
| `src/node-transformer.ts` | iconUrl空時にアバターdivを出力しない |
| `src/styles/chat-style.css` | アイコン・話者名サイズ変更 |

## 影響範囲の分析

- 既存の話者定義（アイコンあり）は影響なし。iconUrlが空でないため従来通りの動作。
- アイコン列が空の新規定義のみ新しい動作が適用される。
- CSSサイズ変更は全バブルに影響するが、単純な拡大のためレイアウト崩れリスクは低い。
