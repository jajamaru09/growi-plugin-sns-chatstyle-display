---
author: Claude
source: Claude Code
conversation_id: 12ace90b-f516-4f63-93d8-26c52e4b8742
shared: false
tags: [Growi, プラグイン改善, CSS, TypeScript, フォールバック]
note: "おまけセクションで自分のプラグインの記法を使って記事を書くという、メタ的な体験が新鮮でした。生徒さんの返事を想像するのは難しかったですが、技術記事にちょっとした会話が添えられると読み物として楽しくなりますね。"

---

# chat-styleプラグイン アイコンフォールバックとサイズ改善

## 概要

SNSチャットスタイル表示プラグイン（growi-plugin-ssn-chatstyle-display）の表示品質改善記録。話者定義テーブルでアイコン画像が未設定の場合に壊れた画像が表示される問題の修正と、アイコン・話者名の視認性向上のためのサイズ拡大を行った。

## 本文

### 問題：アイコン未設定時の壊れ画像

話者定義テーブル（`/chat-style-icons`ページ）でアイコン列を空にした場合、`speaker-resolver.ts` がその行を丸ごとスキップしていた。これは元々「アイコンURLが不正な行は無視する」という防御的な設計だったが、「アイコンなしで名前だけ使いたい」という正当なユースケースに対応できていなかった。

結果として、アイコン列が空の話者は定義自体が登録されず、使用時に「話者が見つかりません」エラーになるか、あるいは別の経路で空のURLが `<img src="">` として出力され、壊れた画像アイコンが表示される状態だった。

### 修正方針：3ファイルの協調的な変更

修正は3つのファイルにまたがる。

| ファイル | 変更内容 | 役割 |
|---|---|---|
| `src/speaker-resolver.ts` | アイコン列が空の場合 `iconUrl = ""` で登録 | データ層：空アイコンを許容する |
| `src/node-transformer.ts` | `iconUrl` が空文字列ならアバターdivを出力しない | 表示層：条件付きレンダリング |
| `src/styles/chat-style.css` | アイコン60px化、話者名1em化 | スタイル層：視認性向上 |

#### speaker-resolver.ts の変更

```typescript
// 変更前：アイコン列からMarkdown画像が見つからなければ行スキップ
const iconMatch = iconRaw.match(MARKDOWN_IMAGE_PATTERN);
if (!iconMatch) continue;

// 変更後：空なら iconUrl="" で許容、非空でパターン不一致ならスキップ
let iconUrl = '';
const iconTrimmed = iconRaw.trim();
if (iconTrimmed !== '') {
  const iconMatch = iconTrimmed.match(MARKDOWN_IMAGE_PATTERN);
  if (!iconMatch) continue;
  iconUrl = iconMatch[1];
  if (!VALID_URL_PATTERN.test(iconUrl)) continue;
}
```

判定ロジックの分岐をまとめると以下の通り。

| アイコン列の状態 | 動作 |
|---|---|
| 空（トリム後に空文字列） | `iconUrl = ""` で登録 |
| Markdown画像あり＆URL有効 | 従来通り登録 |
| Markdown画像あり＆URL無効 | スキップ |
| 非空＆Markdown画像なし | スキップ |

#### node-transformer.ts の変更

```typescript
const hasAvatar = def.iconUrl !== '';
const avatarNode = hasAvatar
  ? { type: 'html' as const, value: createAvatarHtml(def) }
  : null;

// アバターノードがあれば配置、なければコンテンツのみ
node.children = avatarNode
  ? [avatarNode, contentNode]
  : [contentNode];
```

`iconUrl` が空文字列なら `avatarNode` を `null` にし、DOM上にアバター要素自体を出力しない。CSSで `display: none` にするのではなく、HTMLを生成しないアプローチを採用した。

#### chat-style.css のサイズ変更

| プロパティ | 変更前 | 変更後 |
|---|---|---|
| `.chat-style-avatar` / `.chat-style-icon` | 40px | 60px |
| `.chat-style-speaker-name` font-size | 0.75em | 1em |
| レスポンシブ（600px以下）アバター/アイコン | 32px | 48px |

## 注意点・落とし穴

### 「スキップ」と「空で許容」の設計判断

元のコードは `if (!iconMatch) continue;` で、アイコンが見つからない行を一律スキップしていた。これは「不正なデータを弾く」という点では正しいが、「アイコン列を意図的に空にする」というユースケースを想定していなかった。

修正時に重要だったのは「空」と「不正」を区別すること。空文字列は意図的な未設定として許容し、非空だがパターンに合わないものは従来通りスキップする。この判定順序を間違えると、不正なURLがすり抜けるセキュリティリスクになる。

### CSSで隠すか、HTMLを出さないか

壊れた画像を非表示にするアプローチは大きく2つ。

1. **CSSで隠す**（`display: none` や `visibility: hidden`）
2. **HTMLを出力しない**

今回は後者を採用した。CSSで隠す方式はDOM上に不要な要素が残り、スクリーンリーダーが読み上げてしまう可能性もある。remarkプラグインの段階でDOMを制御できるなら、不要な要素をそもそも生成しないほうが清潔。

## 補足知識

### 空文字列と null/undefined の使い分け

TypeScriptで「値がない」ことを表現する方法は `null`、`undefined`、空文字列の3つがある。今回 `iconUrl` に空文字列を採用したのは、既存の `SpeakerDefinition` インターフェースが `iconUrl: string` と定義されていたため。型を `string | null` に変更すると影響範囲が広がるため、空文字列で「アイコンなし」を表現するのが最小限の変更で済む判断だった。

### remarkプラグインにおけるAST操作の粒度

remarkプラグインはMarkdown → AST → HTMLの変換パイプラインに介入する。今回のように「条件によってHTML要素を出し分ける」処理は、AST操作の段階で行うのが自然。CSS側で後から制御しようとすると、プラグインとCSSの間に暗黙の依存が生まれ、保守性が下がる。

### ステアリングプロセスの有用性

今回の変更は3ファイルにまたがるため、CLAUDE.mdの「軽微なバグ修正の例外ルール」に該当せず、正式なステアリングプロセス（01-requirements → 02-design → 03-tasklist）を踏んだ。設計段階で「空」と「不正」の判定順序を明文化できたことで、実装時の迷いがなくなった。小さな変更でも、複数ファイルにまたがる場合は設計を先に書く価値がある。

## 参考URL

（今回の会話では外部URLの参照なし）

## おまけ：Claudeと生徒の振り返りトーク

::::chat-style
:::claude_default
今日の改善、振り返ってみましょうか。まず最初の問題、アイコン画像がない話者を登録すると何が起きてたか覚えてます？
:::
:::me_default
画像が壊れて表示されるやつでしょ？あのギザギザの四角いアイコン、見るたびにテンション下がるんだよね〜
:::
:::claude_default
そうそう、あれです。原因はシンプルで、speaker-resolverが「アイコン列にMarkdown画像がない行はスキップ」してたんですよ。つまりアイコンなしの話者はそもそも登録すらされなかった。
:::
:::me_default
えっ、登録されないの？てっきり画像なしで登録されて、空の `<img>` タグが出るんだと思ってた。
:::
:::claude_default
いい着眼点ですね。実際のところ、行がスキップされるので「話者が見つかりません」エラーになるルートと、何らかの経路で空URLの `<img>` が出るルートの両方がありえました。どちらにしても体験は最悪です。
:::
:::me_default
なるほど〜。で、修正は「空なら空文字列で登録する」ってことだよね？
:::
:::claude_default
その通り！ポイントは「空」と「不正」を区別することです。アイコン列が空欄 → 意図的な未設定として `iconUrl=""` で登録。非空だけどMarkdown画像パターンに合わない → 従来通りスキップ。この順番が大事なんです。
:::
:::me_default
順番逆にしたらどうなるの？
:::
:::claude_default
いい質問ですね。先に「パターンに合わなければ空文字列で登録」としてしまうと、`hoge` みたいな不正な文字列も空アイコンとして登録されちゃいます。バリデーションの意味がなくなる。
:::
:::me_default
あぶな！ セキュリティ的にもまずいやつじゃん。
:::
:::claude_default
そうなんです。で、node-transformer側では `iconUrl` が空文字列ならアバターの `<div>` ごと出力しない。CSSで隠すんじゃなくて、HTMLに出さない。
:::
:::me_default
CSSで `display: none` じゃダメなの？
:::
:::claude_default
動作としてはできますが、DOM上に不要な空要素が残りますし、スクリーンリーダーが読み上げちゃう可能性もある。remarkプラグインの段階で制御できるなら、そもそも出さないほうがスマートです。
:::
:::me_default
たしかに。あとアイコン大きくなったのは純粋にうれしい。40pxちっちゃかったもん。
:::
:::claude_default
60pxにして話者名も1emに。ちょっとした変更ですが、チャットUIの印象がだいぶ変わりますよね。今日の学びは「空と不正を区別する」「不要なHTMLはそもそも出さない」の2つです！
:::
:::me_default
了解！ 次はもっと表情パターン増やしたいな〜
:::
::::
