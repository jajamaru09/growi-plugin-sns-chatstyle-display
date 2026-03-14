import { plugin } from './src/plugin';
import { fetchSpeakerMap, getSpeakerMap } from './src/speaker-resolver';
import CSS_CONTENT from './src/styles/chat-style.css?raw';

declare const growiFacade: {
  markdownRenderer?: {
    optionsGenerators: {
      generateViewOptions: (...args: unknown[]) => { remarkPlugins: unknown[] };
      customGenerateViewOptions?: (...args: unknown[]) => { remarkPlugins: unknown[] };
      generatePreviewOptions: (...args: unknown[]) => { remarkPlugins: unknown[] };
      customGeneratePreviewOptions?: (...args: unknown[]) => { remarkPlugins: unknown[] };
    };
  };
} | null;

const activate = (): void => {
  console.log('[chat-style] activate() called by GROWI');

  if (growiFacade == null || growiFacade.markdownRenderer == null) {
    console.warn('[chat-style] growiFacade or markdownRenderer is null, aborting');
    return;
  }

  console.log('[chat-style] growiFacade available');

  // CSS注入
  const style = document.createElement('style');
  style.textContent = CSS_CONTENT;
  document.head.appendChild(style);
  console.log('[chat-style] CSS injected, length:', CSS_CONTENT.length);

  // 話者定義の非同期取得（ページ読み込みをブロックしない）
  console.log('[chat-style] Fetching speaker map...');
  fetchSpeakerMap().then(() => {
    console.log('[chat-style] Speaker map fetched, map:', getSpeakerMap());
  });

  // remarkプラグイン登録
  const { optionsGenerators } = growiFacade.markdownRenderer;

  // 閲覧用（既存設定を保持して上書き）
  const originalView = optionsGenerators.customGenerateViewOptions;
  optionsGenerators.customGenerateViewOptions = (...args: unknown[]) => {
    const options = originalView
      ? originalView(...args)
      : optionsGenerators.generateViewOptions(...args);
    options.remarkPlugins.push(plugin as unknown);
    console.log('[chat-style] View plugin registered, remarkPlugins count:', options.remarkPlugins.length);
    return options;
  };

  // プレビュー用（既存設定を保持して上書き）
  const originalPreview = optionsGenerators.customGeneratePreviewOptions;
  optionsGenerators.customGeneratePreviewOptions = (...args: unknown[]) => {
    const options = originalPreview
      ? originalPreview(...args)
      : optionsGenerators.generatePreviewOptions(...args);
    options.remarkPlugins.push(plugin as unknown);
    console.log('[chat-style] Preview plugin registered, remarkPlugins count:', options.remarkPlugins.length);
    return options;
  };

  console.log('[chat-style] Plugin activation complete');
};

const deactivate = (): void => {
  // クリーンアップ処理（必要に応じて実装）
};

// Growiのプラグインシステムに登録（Growiが適切なタイミングでactivateを呼び出す）
if ((window as any).pluginActivators == null) {
  (window as any).pluginActivators = {};
}
(window as any).pluginActivators['growi-plugin-ssn-chatstyle-display'] = {
  activate,
  deactivate,
};

console.log('[chat-style] Plugin registered to window.pluginActivators');
