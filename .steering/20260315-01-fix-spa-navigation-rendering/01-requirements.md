# 01-requirements.md

## 概要

Growi のページ間をSPA遷移（クライアントサイドナビゲーション）した際に、`::::chat-style` ブロックがレンダリングされず、プレーンなmarkdownとして表示される不具合を修正する。

## 現象

1. ブラウザで直接URL指定やリロードでページを開く → chat-style が正しくレンダリングされる
2. 別のページからリンクをクリックしてページ遷移する → chat-style がレンダリングされない

## 原因（推定）

- Growi は Next.js ベースのSPAであり、ページ遷移時に React コンポーネントが再マウントされる
- `growiFacade.markdownRenderer` がページ遷移時に再作成される可能性が高い
- プラグインの `activate()` は初回ロード時に1回だけ呼ばれ、`optionsGenerators.customGenerateViewOptions` にフックを設定する
- SPA遷移で `markdownRenderer` や `optionsGenerators` が再作成されると、設定したフックが失われる

## 受け入れ条件

- [ ] 直接URLアクセスでchat-styleが正しくレンダリングされる（既存動作の維持）
- [ ] 別のページからSPA遷移してきた場合もchat-styleが正しくレンダリングされる
- [ ] プレビューモードでも同様に動作する
- [ ] 既存の機能（リロードボタン、SpeakerMap キャッシュ等）に影響がない

## 制約事項

- Growi のプラグインAPI（`growiFacade`、`pluginActivators`）の範囲内で対応する
- Growi 本体のソースコード変更は不可
