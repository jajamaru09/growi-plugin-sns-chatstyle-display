import { plugin } from './src/plugin';
import { fetchSpeakerMap } from './src/speaker-resolver';
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
  if (growiFacade == null || growiFacade.markdownRenderer == null) {
    return;
  }

  // CSS注入
  const style = document.createElement('style');
  style.textContent = CSS_CONTENT;
  document.head.appendChild(style);

  // 話者定義の非同期取得（ページ読み込みをブロックしない）
  fetchSpeakerMap();

  // remarkプラグイン登録
  const { optionsGenerators } = growiFacade.markdownRenderer;

  // 閲覧用（既存設定を保持して上書き）
  const originalView = optionsGenerators.customGenerateViewOptions;
  optionsGenerators.customGenerateViewOptions = (...args: unknown[]) => {
    const options = originalView
      ? originalView(...args)
      : optionsGenerators.generateViewOptions(...args);
    options.remarkPlugins.push(plugin as unknown);
    return options;
  };

  // プレビュー用（既存設定を保持して上書き）
  const originalPreview = optionsGenerators.customGeneratePreviewOptions;
  optionsGenerators.customGeneratePreviewOptions = (...args: unknown[]) => {
    const options = originalPreview
      ? originalPreview(...args)
      : optionsGenerators.generatePreviewOptions(...args);
    options.remarkPlugins.push(plugin as unknown);
    return options;
  };
};

activate();
