import type { VizEdge, VizFrame, VizNode, VizPointer, VizVar } from './vizTypes';

/** Fábrica de nó com defaults. */
export function n(id: string, x: number, y: number, label: string, extra?: Partial<VizNode>): VizNode {
  return { id, x, y, label, shape: 'circle', state: 'default', ...extra };
}

/** Fábrica de aresta com id estável. */
export function e(from: string, to: string, extra?: Partial<VizEdge>): VizEdge {
  return { id: `${from}->${to}`, from, to, ...extra };
}

/** Fábrica de ponteiro (TOPO, FRENTE, RAIZ...). */
export function p(target: string, label: string, side: VizPointer['side'], tone?: VizPointer['tone']): VizPointer {
  return { id: `ptr-${label}`, target, label, side, tone };
}

/** Snapshot profundo: quadros não compartilham objetos mutáveis. */
export function snap(
  nodes: VizNode[],
  edges: VizEdge[],
  pointers: VizPointer[],
  caption: string,
  codeLine?: number,
  vars?: VizVar[],
): VizFrame {
  return {
    nodes: nodes.map((node) => ({ ...node })),
    edges: edges.map((edge) => ({ ...edge })),
    pointers: pointers.map((pointer) => ({ ...pointer })),
    caption,
    codeLine,
    vars: vars?.map((item) => ({ ...item })),
  };
}

export type TreeNode = {
  id: string;
  label: string;
  left?: TreeNode;
  right?: TreeNode;
};

/**
 * Layout clássico de árvore binária: x pela posição in-order,
 * y pela profundidade. Sem cruzamento de arestas por construção.
 */
export function layoutTree(
  root: TreeNode | undefined,
  width: number,
  opts?: { top?: number; levelGap?: number; paddingX?: number },
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  if (!root) {
    return positions;
  }

  const top = opts?.top ?? 46;
  const levelGap = opts?.levelGap ?? 62;
  const paddingX = opts?.paddingX ?? 40;
  const ordered: Array<{ id: string; depth: number }> = [];

  (function walk(node: TreeNode, depth: number) {
    if (node.left) walk(node.left, depth + 1);
    ordered.push({ id: node.id, depth });
    if (node.right) walk(node.right, depth + 1);
  })(root, 0);

  const usable = width - paddingX * 2;
  const step = ordered.length > 1 ? usable / (ordered.length - 1) : 0;

  ordered.forEach((item, index) => {
    positions.set(item.id, {
      x: ordered.length === 1 ? width / 2 : paddingX + index * step,
      y: top + item.depth * levelGap,
    });
  });

  return positions;
}

/** Monta árvore por nível (labels em level-order, vazios pulam o nó). */
export function buildLevelOrderTree(labels: string[]): TreeNode | undefined {
  const cleaned = labels.map((label) => label.trim());

  if (!cleaned.length || !cleaned[0]) {
    return undefined;
  }

  const nodes: Array<TreeNode | undefined> = cleaned.map((label, index) =>
    label ? { id: `t${index}`, label } : undefined,
  );

  nodes.forEach((node, index) => {
    if (!node) return;
    const left = nodes[index * 2 + 1];
    const right = nodes[index * 2 + 2];
    if (left) node.left = left;
    if (right) node.right = right;
  });

  return nodes[0];
}
