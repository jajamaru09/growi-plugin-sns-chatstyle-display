// CSS raw import（Vite）
declare module '*.css?raw' {
  const content: string;
  export default content;
}

// unified の Plugin 型（Growi側が提供するため依存に含めない）
declare module 'unified' {
  import type { Node } from 'unist';
  export type Plugin = () => (tree: Node) => void;
}
