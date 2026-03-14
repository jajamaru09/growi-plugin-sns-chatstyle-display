# 02-design.md

## 実装アプローチ

### 1. アイコンサイズ変更（CSS）
- 前回コミットで対応済み（100px / レスポンシブ72px）

### 2. fetchSpeakerMapをawaitしてからプラグイン登録（client-entry.tsx）

**現状の問題：** `fetchSpeakerMap()` を fire-and-forget し、直後にプラグイン登録するため、初回レンダリング時にSpeakerMapが未取得。

**改善方針：**
- `activate()` 内で `await fetchSpeakerMap()` してからremarkプラグインを登録する
- これにより初回レンダリング時にはSpeakerMapが確実に取得済み
- `activate()` を async に変更

### 3. リロードボタンの修正（node-transformer.ts, client-entry.tsx, CSS）

**現状の問題：**
- インライン `onclick` はReactの `dangerouslySetInnerHTML` 経由で描画されるため動作しない
- SVGがReactのサニタイズで正しく描画されない可能性

**改善方針：**
- SVGの代わりにUnicode文字 `↻` を使用（サニタイズに影響されない）
- ボタンに `data-chat-style-reload` 属性を付与
- `client-entry.tsx` で `document.addEventListener('click', ...)` によるイベント委譲でクリックを捕捉
- クリック時は `fetchSpeakerMap()` → `location.reload()` で再レンダリング

### 変更するコンポーネント

| ファイル | 変更内容 |
|---|---|
| `src/node-transformer.ts` | リロードボタンのHTML修正（SVG→Unicode、onclick→data属性） |
| `client-entry.tsx` | activate()をasync化、fetchSpeakerMap()をawait、イベント委譲でリロード処理 |
| `src/styles/chat-style.css` | リロードボタンのフォントサイズ調整 |

### 影響範囲の分析
- SpeakerMap取得済みの場合の表示には影響なし
- activate()がasyncになるが、Growiのプラグインシステムはactivateの戻り値を使わないため問題なし

## 参考 URL
- なし（既存実装の改修のみ）
