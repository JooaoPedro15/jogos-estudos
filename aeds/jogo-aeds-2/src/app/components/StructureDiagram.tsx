import type { KeyboardEvent } from 'react';

import type {
  HashVisualState,
  HybridVisualState,
  TreeNodeView,
  TreeVisualState,
  TrieNodeView,
  TrieVisualState,
  VisualState,
} from '../../types/structures';
import type { StructureKind } from '../../types/challenge';

export type StructureDiagramProps = {
  structure: StructureKind;
  visualState?: VisualState;
  activePath?: string[];
  activeNodeId?: string;
  /** Ids de nós/slots atualmente selecionados pelo clique do jogador. */
  selectedNodeIds?: string[];
  /** Quando informado, o diagrama fica clicável e dispara este callback. */
  onNodeClick?: (nodeId: string) => void;
};

type HighlightSet = Set<string>;

function getNodeKeyDown(onNodeClick: ((nodeId: string) => void) | undefined, nodeId: string) {
  if (!onNodeClick) {
    return undefined;
  }

  return (event: KeyboardEvent<SVGGElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onNodeClick(nodeId);
  };
}

type PositionedTreeNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: TreeNodeView['color'];
};

type PositionedTrieNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  folha?: boolean;
};

type Edge = {
  from: { x: number; y: number };
  to: { x: number; y: number };
};

export function StructureDiagram({
  structure,
  visualState,
  activePath,
  activeNodeId,
  selectedNodeIds,
  onNodeClick,
}: StructureDiagramProps) {
  const highlighted = new Set<string>(activePath ?? []);
  if (activeNodeId) {
    highlighted.add(activeNodeId);
  }

  const selected = new Set<string>(selectedNodeIds ?? []);

  if (visualState) {
    return renderVisualState(visualState, highlighted, selected, onNodeClick);
  }

  return renderFallbackStructure(structure, highlighted, selected, onNodeClick);
}

function renderVisualState(
  visualState: VisualState,
  highlighted: HighlightSet,
  selected: HighlightSet,
  onNodeClick?: (nodeId: string) => void,
) {
  switch (visualState.kind) {
    case 'tree':
      return <TreeDiagram visualState={visualState} highlighted={highlighted} selected={selected} onNodeClick={onNodeClick} />;
    case 'hash':
      return <HashDiagram visualState={visualState} highlighted={highlighted} selected={selected} onNodeClick={onNodeClick} />;
    case 'trie':
      return <TrieDiagram visualState={visualState} highlighted={highlighted} selected={selected} onNodeClick={onNodeClick} />;
    case 'hybrid':
      return <HybridDiagram visualState={visualState} highlighted={highlighted} selected={selected} onNodeClick={onNodeClick} />;
    default: {
      const exhaustiveCheck: never = visualState;
      void exhaustiveCheck;
      return null;
    }
  }
}

function TreeDiagram({
  visualState,
  highlighted,
  selected,
  onNodeClick,
}: {
  visualState: TreeVisualState;
  highlighted: HighlightSet;
  selected: HighlightSet;
  onNodeClick?: (nodeId: string) => void;
}) {
  const { nodes, edges } = layoutTree(visualState.root);

  return (
    <svg className="structure-sketch" viewBox="0 0 360 180" role="img" aria-label="Diagrama de arvore">
      {edges.map((edge, index) => (
        <path
          key={`${edge.from.x}-${edge.from.y}-${edge.to.x}-${edge.to.y}-${index}`}
          d={`M${edge.from.x} ${edge.from.y} L${edge.to.x} ${edge.to.y}`}
        />
      ))}
      {nodes.map((node) => (
        <DiagramNode
          key={node.id}
          id={node.id}
          highlighted={highlighted}
          selected={selected}
          onNodeClick={onNodeClick}
          cx={node.x}
          cy={node.y}
          r={18}
          label={node.label}
          className={node.color ? `node-${node.color}` : undefined}
        />
      ))}
    </svg>
  );
}

function HashDiagram({
  visualState,
  highlighted,
  selected,
  onNodeClick,
}: {
  visualState: HashVisualState;
  highlighted: HighlightSet;
  selected: HighlightSet;
  onNodeClick?: (nodeId: string) => void;
}) {
  return (
    <svg className="structure-sketch hash-sketch" viewBox="0 0 360 180" role="img" aria-label="Diagrama de hash">
      <text className="diagram-caption" x="24" y="24">
        area principal + reserva
      </text>
      {visualState.slots.map((slot) => {
        const x = 24 + (slot.index % 4) * 78;
        const y = slot.index < 4 ? 44 : 104;
        const id = `slot-${slot.index}`;
        const isSelected = selected.has(id);
        const isHighlighted = highlighted.has(id);

        return (
          <g
            key={id}
            className={[
              'diagram-node',
              `slot-${slot.status ?? 'empty'}`,
              isHighlighted ? 'is-active' : '',
              isSelected ? 'is-selected' : '',
              onNodeClick ? 'is-clickable' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            data-node-id={id}
            onClick={onNodeClick ? () => onNodeClick(id) : undefined}
            onKeyDown={getNodeKeyDown(onNodeClick, id)}
            role={onNodeClick ? 'button' : undefined}
            tabIndex={onNodeClick ? 0 : undefined}
          >
            <rect x={x} y={y} width={54} height={44} rx={6} />
            <text x={x + 8} y={y + 16}>{`h${slot.index}`}</text>
            <text x={x + 27} y={y + 34} textAnchor="middle">
              {slot.value ?? '-'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function TrieDiagram({
  visualState,
  highlighted,
  selected,
  onNodeClick,
}: {
  visualState: TrieVisualState;
  highlighted: HighlightSet;
  selected: HighlightSet;
  onNodeClick?: (nodeId: string) => void;
}) {
  const { nodes, edges } = layoutTrie(visualState.root);

  return (
    <svg className="structure-sketch trie-sketch" viewBox="0 0 360 180" role="img" aria-label="Diagrama de TRIE">
      {edges.map((edge, index) => (
        <path
          key={`${edge.from.x}-${edge.from.y}-${edge.to.x}-${edge.to.y}-${index}`}
          d={`M${edge.from.x} ${edge.from.y} L${edge.to.x} ${edge.to.y}`}
        />
      ))}
      {nodes.map((node) => (
        <DiagramNode
          key={node.id}
          id={node.id}
          highlighted={highlighted}
          selected={selected}
          onNodeClick={onNodeClick}
          cx={node.x}
          cy={node.y}
          r={18}
          label={node.folha ? `${node.label}*` : node.label}
          className={node.folha ? 'node-terminal' : undefined}
        />
      ))}
    </svg>
  );
}

function HybridDiagram({
  visualState,
  highlighted,
  selected,
  onNodeClick,
}: {
  visualState: HybridVisualState;
  highlighted: HighlightSet;
  selected: HighlightSet;
  onNodeClick?: (nodeId: string) => void;
}) {
  const width = 360;
  const gap = 10;
  const layerWidth = (width - 40 - gap * (visualState.layers.length - 1)) / visualState.layers.length;

  return (
    <svg className="structure-sketch hybrid-sketch" viewBox="0 0 360 180" role="img" aria-label="Diagrama hibrido">
      {visualState.layers.map((layer) => {
        const index = visualState.layers.indexOf(layer);
        const x = 20 + index * (layerWidth + gap);
        const isHighlighted = highlighted.has(layer.id);
        const isSelected = selected.has(layer.id);

        return (
          <g
            key={layer.id}
            className={[
              'diagram-node',
              isHighlighted ? 'is-active' : '',
              isSelected ? 'is-selected' : '',
              onNodeClick ? 'is-clickable' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            data-node-id={layer.id}
            onClick={onNodeClick ? () => onNodeClick(layer.id) : undefined}
            onKeyDown={getNodeKeyDown(onNodeClick, layer.id)}
            role={onNodeClick ? 'button' : undefined}
            tabIndex={onNodeClick ? 0 : undefined}
          >
            <rect x={x} y={28} width={layerWidth} height={124} rx={8} />
            <text x={x + 8} y={48}>{layer.label}</text>
            {layer.items.slice(0, 4).map((item, itemIndex) => (
              <text key={`${layer.id}-${item}`} x={x + 8} y={72 + itemIndex * 20}>
                {item}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function layoutTree(root: TreeNodeView | undefined): { nodes: PositionedTreeNode[]; edges: Edge[] } {
  if (!root) {
    return { nodes: [], edges: [] };
  }

  const nodes: PositionedTreeNode[] = [];
  const edges: Edge[] = [];

  const visit = (
    node: TreeNodeView,
    depth: number,
    minX: number,
    maxX: number,
    parent?: { x: number; y: number },
  ) => {
    const x = (minX + maxX) / 2;
    const y = 28 + depth * 48;
    nodes.push({ id: node.id, label: node.label, x, y, color: node.color });

    if (parent) {
      edges.push({ from: parent, to: { x, y } });
    }

    const midpoint = (minX + maxX) / 2;
    if (node.left) {
      visit(node.left, depth + 1, minX, midpoint, { x, y });
    }
    if (node.right) {
      visit(node.right, depth + 1, midpoint, maxX, { x, y });
    }
  };

  visit(root, 0, 24, 336);
  return { nodes, edges };
}

function layoutTrie(root: TrieNodeView): { nodes: PositionedTrieNode[]; edges: Edge[] } {
  const nodes: PositionedTrieNode[] = [];
  const edges: Edge[] = [];

  const visit = (
    node: TrieNodeView,
    depth: number,
    minX: number,
    maxX: number,
    parent?: { x: number; y: number },
  ) => {
    const x = (minX + maxX) / 2;
    const y = 28 + depth * 42;
    const label = node.char.length > 0 ? node.char : 'raiz';
    nodes.push({ id: node.id, label, x, y, folha: node.folha });

    if (parent) {
      edges.push({ from: parent, to: { x, y } });
    }

    const children = node.children ?? [];
    const span = maxX - minX;
    const childWidth = children.length > 0 ? span / children.length : span;
    children.forEach((child, index) => {
      visit(child, depth + 1, minX + index * childWidth, minX + (index + 1) * childWidth, {
        x,
        y,
      });
    });
  };

  visit(root, 0, 18, 342);
  return { nodes, edges };
}

function renderFallbackStructure(
  structure: StructureKind,
  highlighted: HighlightSet,
  selected: HighlightSet,
  onNodeClick?: (nodeId: string) => void,
) {
  const labelByStructure: Record<StructureKind, string[]> = {
    binaria: ['8', '3', '10', '1', '6', '14'],
    abb: ['40', '20', '60', '10', '30', '50', '70'],
    avl: ['30', '20', '40', '10', '25', '50'],
    arv234: ['20|40', '10', '30', '50|60'],
    alvinegra: ['40', '20', '60', '10', '30', '50', '70'],
    hash: ['h0', 'h1', 'h2', 'h3'],
    trie: ['raiz', 'S', 'T', 'O'],
    patricia: ['bit2', '0', '1'],
    doidona: ['T1', 'T2', 'lista'],
  };

  const root: TreeNodeView = {
    id: 'fallback-root',
    label: labelByStructure[structure][0],
    left: { id: 'fallback-left', label: labelByStructure[structure][1] ?? '' },
    right: { id: 'fallback-right', label: labelByStructure[structure][2] ?? '' },
  };

  return (
    <TreeDiagram
      visualState={{ id: `${structure}-fallback`, kind: 'tree', root }}
      highlighted={highlighted}
      selected={selected}
      onNodeClick={onNodeClick}
    />
  );
}

type DiagramNodeProps = {
  id: string;
  highlighted: HighlightSet;
  selected: HighlightSet;
  cx: number;
  cy: number;
  r: number;
  label: string;
  className?: string;
  onNodeClick?: (nodeId: string) => void;
};

function DiagramNode({ id, highlighted, selected, cx, cy, r, label, className, onNodeClick }: DiagramNodeProps) {
  const groupClass = [
    'diagram-node',
    className,
    highlighted.has(id) ? 'is-active' : '',
    selected.has(id) ? 'is-selected' : '',
    onNodeClick ? 'is-clickable' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <g
      className={groupClass}
      data-node-id={id}
      onClick={onNodeClick ? () => onNodeClick(id) : undefined}
      onKeyDown={getNodeKeyDown(onNodeClick, id)}
      role={onNodeClick ? 'button' : undefined}
      tabIndex={onNodeClick ? 0 : undefined}
    >
      <circle cx={cx} cy={cy} r={r} />
      <text x={cx} y={cy + 5} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}
