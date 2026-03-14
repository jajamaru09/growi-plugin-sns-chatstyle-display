# 03-tasklist.md（実装タスクリスト）

## タスク一覧

### Phase 1: プロジェクト基盤

- [ ] **T-01**: `package.json` 作成（growiPlugin設定、依存パッケージ定義）
- [ ] **T-02**: `tsconfig.json` 作成
- [ ] **T-03**: `.gitignore` 作成（node_modules, dist 等）
- [ ] **T-04**: `.editorconfig` 作成

### Phase 2: CSS

- [ ] **T-05**: `src/styles/chat-style.css` 作成
  - `sample/chat-style-preview.html` からプラグイン用CSSを抽出
  - Bootstrap CSS変数フォールバック・プレビュー用スタイルを削除
  - `--chat-style-*` CSS変数定義（light/dark）
  - `.chat-style-container`, `.chat-style-bubble`, `.chat-style-left`, `.chat-style-right`
  - `.chat-style-avatar`, `.chat-style-icon`, `.chat-style-speaker-name`, `.chat-style-message`
  - `.chat-style-error`
  - レスポンシブ対応（600px以下）

### Phase 3: コアモジュール

- [ ] **T-06**: `src/speaker-resolver.ts` 作成
  - `SpeakerDefinition` / `SpeakerMap` 型定義
  - `fetchSpeakerMap()`: API取得 → テーブルパース → キャッシュ保存
  - `getSpeakerMap()`: キャッシュ参照（TTL 5分超過時に再取得トリガー）
  - `resolveSpeaker(name)`: 話者名パース（最後の`_`分割 → フォールバック → null）
  - Markdownテーブルパース: 行分割 → セル抽出 → `![](url)` 正規表現
  - バリデーション: 話者名・expression・配置・URL
  - エラーハンドリング: API失敗時、ページ未作成時

- [ ] **T-07**: `src/node-transformer.ts` 作成
  - `escapeHtml()`: XSS対策用エスケープ関数
  - `transformChatStyleBlock(node)`: hName='div', className='chat-style-container'
  - `transformSpeakerBubble(node, def)`: 左右配置分岐、アイコン・話者名ノード挿入
  - `transformError(node, message)`: type='html' でエラーHTML生成

### Phase 4: プラグイン統合

- [ ] **T-08**: `src/plugin.ts` 作成
  - remarkプラグイン定義（`Plugin` 型）
  - `containerDirective` を `visit` で走査
  - `name === 'chat-style'` のノードを検出し子ノード処理
  - `resolveSpeaker` による話者解決 → transform or error
  - SpeakerMap未取得時のフォールバック処理

- [ ] **T-09**: `src/client-entry.tsx` 作成
  - `growiFacade` 存在チェック
  - CSS `<style>` 注入
  - `fetchSpeakerMap()` 非同期呼び出し
  - `customGenerateViewOptions` 登録（既存設定保持）
  - `customGeneratePreviewOptions` 登録（既存設定保持）

### Phase 5: 動作確認

- [ ] **T-10**: ローカルでの静的検証
  - TypeScriptコンパイルエラーがないこと
  - ESLint警告がないこと（ESLint設定がある場合）

## 完了条件

- 全タスク（T-01〜T-10）が完了していること
- TypeScriptコンパイルが通ること
- `01-requirements.md` の受け入れ条件をコードレベルで満たしていること
