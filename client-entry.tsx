import { plugin } from './src/plugin';
import { fetchSpeakerMap } from './src/speaker-resolver';
import CSS_CONTENT from './src/styles/chat-style.css?raw';

interface OptionsGenerators {
  generateViewOptions: (...args: unknown[]) => { remarkPlugins: unknown[] };
  customGenerateViewOptions?: (...args: unknown[]) => { remarkPlugins: unknown[] };
  generatePreviewOptions: (...args: unknown[]) => { remarkPlugins: unknown[] };
  customGeneratePreviewOptions?: (...args: unknown[]) => { remarkPlugins: unknown[] };
}

interface MarkdownRenderer {
  optionsGenerators: OptionsGenerators;
}

declare const growiFacade: {
  markdownRenderer?: MarkdownRenderer;
} | null;

let cssInjected = false;
let eventListenerRegistered = false;

function injectCss(): void {
  if (cssInjected) return;
  const style = document.createElement('style');
  style.id = 'chat-style-plugin-css';
  style.textContent = CSS_CONTENT;
  document.head.appendChild(style);
  cssInjected = true;
}

function registerEventListener(): void {
  if (eventListenerRegistered) return;
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-chat-style-reload]')) {
      fetchSpeakerMap().then(() => {
        window.location.reload();
      });
    }
  });
  eventListenerRegistered = true;
}

function hookRemarkPlugin(optionsGenerators: OptionsGenerators): void {
  // 閲覧用（既存設定を保持して上書き）
  const originalView = optionsGenerators.customGenerateViewOptions;
  optionsGenerators.customGenerateViewOptions = (...args: unknown[]) => {
    const options = originalView
      ? originalView(...args)
      : optionsGenerators.generateViewOptions(...args);
    if (!options.remarkPlugins.includes(plugin as unknown)) {
      options.remarkPlugins.push(plugin as unknown);
    }
    return options;
  };

  // プレビュー用（既存設定を保持して上書き）
  const originalPreview = optionsGenerators.customGeneratePreviewOptions;
  optionsGenerators.customGeneratePreviewOptions = (...args: unknown[]) => {
    const options = originalPreview
      ? originalPreview(...args)
      : optionsGenerators.generatePreviewOptions(...args);
    if (!options.remarkPlugins.includes(plugin as unknown)) {
      options.remarkPlugins.push(plugin as unknown);
    }
    return options;
  };
}

const activate = async (): Promise<void> => {
  if (growiFacade == null) return;

  injectCss();
  await fetchSpeakerMap();
  registerEventListener();

  // markdownRenderer が再設定されるたびにプラグインをフックするセッタートラップ
  let currentRenderer = growiFacade.markdownRenderer;

  try {
    Object.defineProperty(growiFacade, 'markdownRenderer', {
      configurable: true,
      enumerable: true,
      get() {
        return currentRenderer;
      },
      set(newRenderer: MarkdownRenderer | undefined) {
        currentRenderer = newRenderer;
        if (newRenderer?.optionsGenerators) {
          hookRemarkPlugin(newRenderer.optionsGenerators);
        }
      },
    });
  }
  catch {
    // defineProperty が失敗した場合（configurable: false 等）はポーリングでフォールバック
    let lastRenderer: MarkdownRenderer | undefined;
    setInterval(() => {
      const renderer = growiFacade!.markdownRenderer;
      if (renderer && renderer !== lastRenderer) {
        lastRenderer = renderer;
        hookRemarkPlugin(renderer.optionsGenerators);
      }
    }, 500);
  }

  // 初回: 既に markdownRenderer が存在する場合は即座にフック
  if (currentRenderer?.optionsGenerators) {
    hookRemarkPlugin(currentRenderer.optionsGenerators);
  }
};

const deactivate = (): void => {
  // クリーンアップ処理（必要に応じて実装）
};

// Growiのプラグインシステムに登録（Growiが適切なタイミングでactivateを呼び出す）
if ((window as any).pluginActivators == null) {
  (window as any).pluginActivators = {};
}
(window as any).pluginActivators['growi-plugin-sns-chatstyle-display'] = {
  activate,
  deactivate,
};
