import { e, layoutTree, n, type TreeNode } from './sceneUtils';
import type { VizEdge, VizNode } from './vizTypes';

/** Modelo de AVL compartilhado entre cenas de questão e operações da galeria. */

export type AvlNode = { key: number; left?: AvlNode; right?: AvlNode };

export function avlHeight(node?: AvlNode): number {
  return node ? 1 + Math.max(avlHeight(node.left), avlHeight(node.right)) : 0;
}

export function balance(node: AvlNode): number {
  return avlHeight(node.left) - avlHeight(node.right);
}

export function insertPlain(node: AvlNode | undefined, key: number): AvlNode {
  if (!node) return { key };
  if (key < node.key) return { ...node, left: insertPlain(node.left, key) };
  if (key > node.key) return { ...node, right: insertPlain(node.right, key) };
  return node;
}

export function rebalance(node: AvlNode | undefined): { node?: AvlNode; rotation?: string; pivot?: number } {
  if (!node) return { node };

  const left = rebalance(node.left);
  const right = rebalance(node.right);
  let current: AvlNode = { ...node, left: left.node, right: right.node };
  let rotation = left.rotation ?? right.rotation;
  let pivot = left.pivot ?? right.pivot;

  const factor = balance(current);

  if (factor > 1 && current.left) {
    if (balance(current.left) < 0) {
      const filho = current.left;
      const neto = filho.right!;
      current = { ...current, left: { ...neto, left: { ...filho, right: neto.left }, right: neto.right } };
      rotation = 'rotação dupla esquerda-direita';
    } else {
      rotation = 'rotação simples para a direita';
    }
    pivot = current.key;
    const raiz = current.left!;
    current = { ...raiz, right: { ...current, left: raiz.right } };
  } else if (factor < -1 && current.right) {
    if (balance(current.right) > 0) {
      const filho = current.right;
      const neto = filho.left!;
      current = { ...current, right: { ...neto, right: { ...filho, left: neto.right }, left: neto.left } };
      rotation = 'rotação dupla direita-esquerda';
    } else {
      rotation = 'rotação simples para a esquerda';
    }
    pivot = current.key;
    const raiz = current.right!;
    current = { ...raiz, left: { ...current, right: raiz.left } };
  }

  return { node: current, rotation, pivot };
}

export function avlToViz(root: AvlNode | undefined, width: number): { nodes: VizNode[]; edges: VizEdge[]; rootId?: string } {
  if (!root) return { nodes: [], edges: [] };

  const toTree = (node: AvlNode): TreeNode => ({
    id: `a${node.key}`,
    label: `${node.key}`,
    left: node.left ? toTree(node.left) : undefined,
    right: node.right ? toTree(node.right) : undefined,
  });

  const tree = toTree(root);
  const positions = layoutTree(tree, width, { top: 56, levelGap: 68 });
  const nodes: VizNode[] = [];
  const edges: VizEdge[] = [];

  (function walk(avl: AvlNode) {
    const at = positions.get(`a${avl.key}`)!;
    nodes.push(n(`a${avl.key}`, at.x, at.y, `${avl.key}`, { sub: `fb ${balance(avl)}` }));
    if (avl.left) {
      edges.push(e(`a${avl.key}`, `a${avl.left.key}`));
      walk(avl.left);
    }
    if (avl.right) {
      edges.push(e(`a${avl.key}`, `a${avl.right.key}`));
      walk(avl.right);
    }
  })(root);

  return { nodes, edges, rootId: tree.id };
}
