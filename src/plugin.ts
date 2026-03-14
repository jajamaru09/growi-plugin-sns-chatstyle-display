import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import type { Node } from 'unist';
import { resolveSpeaker, getSpeakerMap } from './speaker-resolver';
import { transformChatStyleBlock, transformSpeakerBubble, transformSpeakerBubbleFallback, transformError } from './node-transformer';

interface DirectiveNode extends Node {
  name: string;
  children: DirectiveNode[];
  data?: Record<string, unknown>;
  value?: string;
}

export const plugin: Plugin = function() {
  return (tree: Node) => {
    visit(tree, 'containerDirective', (node: Node) => {
      const n = node as DirectiveNode;
      if (n.name !== 'chat-style') return;

      const map = getSpeakerMap();

      // ::::chat-style コンテナを変換（SpeakerMap有無に関わらず実行）
      transformChatStyleBlock(n);

      // 子ノードを走査して話者バブルを処理
      for (const child of n.children) {
        if (child.type !== 'containerDirective') continue;

        if (map) {
          const def = resolveSpeaker(child.name);
          if (def) {
            transformSpeakerBubble(child, def);
          }
          else {
            transformError(
              child,
              `話者 "${child.name}" は /chat-style-icons に定義されていません`,
            );
          }
        }
        else {
          // SpeakerMap未取得時はフォールバック表示
          transformSpeakerBubbleFallback(child, child.name);
        }
      }
    });
  };
};
