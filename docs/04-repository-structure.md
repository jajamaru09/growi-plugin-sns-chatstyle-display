# リポジトリ構造定義書

## 1. フォルダ・ファイル構成

```
growi-plugin-ssn-chatstyle-display/
├── .gitea/
│   └── workflows/
│       └── claude.yaml           # CI/CD ワークフロー
├── .steering/                    # ステアリングドキュメント（作業単位）
│   └── YYYYMMDD-NN-title/
│       ├── 01-requirements.md
│       ├── 02-design.md
│       └── 03-tasklist.md
├── docs/                         # 永続的ドキュメント
│   ├── 01-product-requirements.md
│   ├── 02-functional-design.md
│   ├── 03-architecture.md
│   ├── 04-repository-structure.md
│   ├── 05-development-guidelines.md
│   └── 06-glossary.md
├── sample/                       # プレビュー用サンプル
│   └── chat-style-preview.html
├── src/                          # ソースコード
│   ├── client-entry.tsx          # プラグインエントリーポイント
│   ├── plugin.ts                 # remarkプラグイン本体
│   ├── speaker-resolver.ts       # 話者定義の取得・パース・キャッシュ
│   ├── node-transformer.ts       # ASTノード変換（hName設定・子ノード挿入）
│   └── styles/
│       └── chat-style.css        # チャットバブルCSS（テーマ対応）
├── .editorconfig                 # エディタ設定
├── .eslintrc.js                  # ESLint設定
├── .gitignore                    # Git除外設定
├── CLAUDE.md                     # プロジェクトメモリ（開発プロセス定義）
├── LICENSE                       # MITライセンス
├── package.json                  # パッケージ定義（growiPlugin設定含む）
├── README.md                     # プロジェクト概要・導入手順
└── tsconfig.json                 # TypeScript設定
```

## 2. ディレクトリの役割

| ディレクトリ | 役割 | 更新頻度 |
|-------------|------|---------|
| `src/` | プラグインのソースコード | 高（実装時） |
| `src/styles/` | CSSファイル | 中（デザイン調整時） |
| `docs/` | 永続的な設計ドキュメント | 低（設計変更時のみ） |
| `.steering/` | 作業単位のステアリングドキュメント | 作業ごとに新規作成 |
| `sample/` | HTMLプレビュー・動作確認用 | 低（デザイン検証時） |
| `.gitea/workflows/` | CI/CDワークフロー定義 | 低 |

## 3. ファイル配置ルール

### ソースコード（`src/`）
- エントリーポイントは `client-entry.tsx`（package.jsonの `main` と一致）
- 機能単位でファイルを分割（plugin, speaker-resolver, node-transformer）
- CSSは `src/styles/` に配置
- テストファイルを追加する場合は `src/__tests__/` に配置

### ドキュメント（`docs/`）
- ファイル名に連番プレフィックス（`01-`, `02-`, ...）を付与し読む順序を明示
- 本文は原則変更せず、乖離は末尾の `## 変更履歴` テーブルで追跡

### ステアリング（`.steering/`）
- 命名規則: `YYYYMMDD-NN-title/`（日付-連番-タイトル）
- 作業完了後も削除せず履歴として保持
- 軽微な修正は `small-modification-memo.md` 1ファイルで対応

### ルートファイル
- `package.json`: Growiプラグインの `growiPlugin` フィールドを含む
- `CLAUDE.md`: 開発プロセスの定義（本リポジトリ固有）
- `README.md`: 利用者向けのインストール手順・使い方

## 変更履歴

| ステアリング | 変更内容 |
|---|---|
| [#01-initial-implementation](.steering/20260315-01-initial-implementation/) | `src/types.d.ts` がファイル構成に含まれていない。`client-entry.tsx` は `src/` ではなくルート直下に配置された。 |
