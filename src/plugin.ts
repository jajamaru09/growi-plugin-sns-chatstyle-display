import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import type { Node } from 'unist';
import { resolveSpeaker, getSpeakerMap } from './speaker-resolver';
import { transformChatStyleBlock, transformSpeakerBubble, transformError } from './node-transformer';

interface DirectiveNode extends Node {
  name: string;
  children: DirectiveNode[];
  data?: Record<string, unknown>;
  value?: string;
}

export const plugin: Plugin = function() {
  return (tree: Node) => {
    console.log('[chat-style] Plugin running, walking AST...');
    let directiveCount = 0;

    visit(tree, 'containerDirective', (node: Node) => {
      const n = node as DirectiveNode;
      directiveCount++;
      console.log('[chat-style] Found containerDirective:', n.name, 'type:', n.type);
      if (n.name !== 'chat-style') return;

      console.log('[chat-style] Found ::::chat-style block, children:', n.children.length);

      // SpeakerMapが未取得の場合
      const map = getSpeakerMap();
      console.log('[chat-style] SpeakerMap:', map ? `${map.size} entries` : 'null');
      if (!map) {
        transformError(
          n,
          '/chat-style-icons ページが取得できていません。ページが存在するか確認してください',
        );
        return;
      }

      // ::::chat-style コンテナを変換
      transformChatStyleBlock(n);

      // 子ノードを走査して話者バブルを処理
      for (const child of n.children) {
        if (child.type !== 'containerDirective') continue;

        const def = resolveSpeaker(child.name);
        console.log('[chat-style] Resolving speaker:', child.name, '→', def);
        if (def) {
          transformSpeakerBubble(child, def);
          console.log('[chat-style] Transformed bubble:', child.name, 'position:', def.position);
        }
        else {
          transformError(
            child,
            `話者 "${child.name}" は /chat-style-icons に定義されていません`,
          );
        }
      }
    });

    console.log('[chat-style] AST walk complete, found', directiveCount, 'containerDirectives');
  };
};
