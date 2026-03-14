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

  // リロードボタンをコンテナ上部に挿入（イベント委譲で処理するためdata属性を使用）
  const reloadBar = {
    type: 'html' as const,
    value: '<div class="chat-style-reload-bar"><button class="chat-style-reload-btn" data-chat-style-reload title="話者アイコンを再読み込み">\u21BB</button></div>',
  };
  node.children = [reloadBar, ...node.children];
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

  const hasAvatar = def.iconUrl !== '';
  const avatarNode = hasAvatar
    ? { type: 'html' as const, value: createAvatarHtml(def) }
    : null;

  const contentNode = {
    type: 'containerDirective' as const,
    data: {
      hName: 'div',
      hProperties: { className: ['chat-style-content'] },
    },
    children: [
      { type: 'html', value: createSpeakerNameHtml(def) },
      messageWrapper,
    ],
  };

  if (isRight) {
    node.children = avatarNode
      ? [contentNode, avatarNode]
      : [contentNode];
  }
  else {
    node.children = avatarNode
      ? [avatarNode, contentNode]
      : [contentNode];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformSpeakerBubbleFallback(node: any, directiveName: string): void {
  // SpeakerMap未取得時のフォールバック: アイコンなし、directive名を話者名として表示
  node.data = {
    hName: 'div',
    hProperties: { className: ['chat-style-bubble', 'chat-style-left'] },
  };

  const originalChildren = [...node.children];
  const messageWrapper = {
    type: 'containerDirective' as const,
    data: {
      hName: 'div',
      hProperties: { className: ['chat-style-message'] },
    },
    children: originalChildren,
  };

  const speakerName = escapeHtml(directiveName.replace(/_/g, ' '));
  const contentNode = {
    type: 'containerDirective' as const,
    data: {
      hName: 'div',
      hProperties: { className: ['chat-style-content'] },
    },
    children: [
      { type: 'html', value: `<div class="chat-style-speaker-name">${speakerName}</div>` },
      messageWrapper,
    ],
  };

  node.children = [contentNode];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformError(node: any, message: string): void {
  const escaped = escapeHtml(message);
  node.type = 'html';
  node.value = `<div class="chat-style-error">\u26A0 [chat-style error] ${escaped}</div>`;
  node.children = [];
}
