import type { SpeakerDefinition } from './speaker-resolver';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createAvatarHtml(def: SpeakerDefinition): string {
  const src = escapeHtml(def.iconUrl);
  const alt = escapeHtml(def.speaker);
  return `<div class="chat-style-avatar"><img src="${src}" alt="${alt}" class="chat-style-icon" /></div>`;
}

function createSpeakerNameHtml(def: SpeakerDefinition): string {
  const name = escapeHtml(def.speaker);
  return `<div class="chat-style-speaker-name">${name}</div>`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformChatStyleBlock(node: any): void {
  node.data = {
    hName: 'div',
    hProperties: { className: ['chat-style-container'] },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformSpeakerBubble(node: any, def: SpeakerDefinition): void {
  const isRight = def.position === 'right';
  const positionClass = isRight ? 'chat-style-right' : 'chat-style-left';

  node.data = {
    hName: 'div',
    hProperties: { className: ['chat-style-bubble', positionClass] },
  };

  // 既存の子ノード（会話テキスト）をメッセージdivで囲む
  const originalChildren = [...node.children];
  const messageWrapper = {
    type: 'containerDirective' as const,
    data: {
      hName: 'div',
      hProperties: { className: ['chat-style-message'] },
    },
    children: originalChildren,
  };

  if (isRight) {
    // 右配置: 話者名 → メッセージ → アバター
    node.children = [
      {
        type: 'containerDirective' as const,
        data: {
          hName: 'div',
          hProperties: { className: ['chat-style-content'] },
        },
        children: [
          { type: 'html', value: createSpeakerNameHtml(def) },
          messageWrapper,
        ],
      },
      { type: 'html', value: createAvatarHtml(def) },
    ];
  }
  else {
    // 左配置: アバター → 話者名 → メッセージ
    node.children = [
      { type: 'html', value: createAvatarHtml(def) },
      {
        type: 'containerDirective' as const,
        data: {
          hName: 'div',
          hProperties: { className: ['chat-style-content'] },
        },
        children: [
          { type: 'html', value: createSpeakerNameHtml(def) },
          messageWrapper,
        ],
      },
    ];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformError(node: any, message: string): void {
  const escaped = escapeHtml(message);
  node.type = 'html';
  node.value = `<div class="chat-style-error">\u26A0 [chat-style error] ${escaped}</div>`;
  node.children = [];
}
