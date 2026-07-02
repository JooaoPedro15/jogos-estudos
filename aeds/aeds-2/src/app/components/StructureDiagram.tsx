import { useId } from 'react';
import type { KeyboardEvent } from 'react';

import type {
  HashVisualState,
  HybridLayerView,
  HybridVisualState,
  TreeNodeView,
  TreeVisualState,
  TrieNodeView,
  TrieVisualState,
  VisualState,
} from '../../types/structures';
import type { StructureKind } from '../../types/challenge';
import { DiagramShell, type DiagramTone } from './canvas/DiagramShell';

export type StructureDiagramProps = {
  structure: StructureKind;
  visualState?: VisualState;
  activePath?: string[];
  activeNodeId?: string;
  /** Ids de nós/slots atualmente selecionados pelo clique do jogador. */
  selectedNodeIds?: string[];
  /** Quando informado, o diagrama fica clicável e dispara este callback. */
  onNodeClick?: (nodeId: string) => void;
  /** Tom semantico do destaque (acerto/erro) vindo do resultado da etapa. */
  tone?: DiagramTone;
  /** Narracao curta do passo atual, sobreposta ao canvas. */
  caption?: string;
};

type HighlightSet = Set<string>;

/**
 * Opcoes compartilhadas pelos renderizadores. `pathOrder` guarda a posicao de
 * cada no dentro de `activePath` para animar a visita em sequencia (um no por
 * vez), como nos visualizadores de referencia.
 */
type RenderOptions = {
  highlighted: HighlightSet;
  selected: HighlightSet;
  pathOrder: Map<string, number>;
  onNodeClick?: (nodeId: string) => void;
  tone?: DiagramTone;
  caption?: string;
};

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
  tone,
  caption,
}: StructureDiagramProps) {
  const highlighted = new Set<string>(activePath ?? []);
  if (activeNodeId) {
    highlighted.add(activeNodeId);
  }

  const pathOrder = new Map<string, number>((activePath ?? []).map((id, index) => [id, index]));
  // O no final (activeNodeId) anima por ultimo, depois do caminho inteiro.
  if (activeNodeId && !pathOrder.has(activeNodeId)) {
    pathOrder.set(activeNodeId, pathOrder.size);
  }

  const options: RenderOptions = {
    highlighted,
    selected: new Set<string>(selectedNodeIds ?? []),
    pathOrder,
    onNodeClick,
    tone,
    caption,
  };

  if (visualState) {
    return renderVisualState(visualState, options);
  }

  return renderFallbackStructure(structure, options);
}

function renderVisualState(visualState: VisualState, options: RenderOptions) {
  switch (visualState.kind) {
    case 'tree':
      return <TreeDiagram visualState={visualState} options={options} />;
    case 'hash':
      return <HashDiagram visualState={visualState} options={options} />;
    case 'trie':
      return <TrieDiagram visualState={visualState} options={options} />;
    case 'hybrid':
      return <HybridDiagram visualState={visualState} options={options} />;
    default: {
      const exhaustiveCheck: never = visualState;
      void exhaustiveCheck;
      return null;
    }
  }
}

function TreeDiagram({
  visualState,
  options,
}: {
  visualState: TreeVisualState;
  options: RenderOptions;
}) {
  const { nodes, edges, width, height } = layoutTree(visualState.root);
  const markerId = useId();
  const radius = 20;

  return (
    <DiagramShell
      width={width}
      height={height}
      ariaLabel="Diagrama de arvore"
      caption={options.caption}
      tone={options.tone}
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5.5"
          markerHeight="5.5"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" className="edge-arrowhead" />
        </marker>
      </defs>
      {edges.map((edge, index) => (
        <path
          key={`${edge.from.x}-${edge.from.y}-${edge.to.x}-${edge.to.y}-${index}`}
          className="tree-edge"
          d={buildShortenedEdge(edge, radius)}
          markerEnd={`url(#${markerId})`}
        />
      ))}
      {nodes.map((node) => (
        <DiagramNode
          key={node.id}
          id={node.id}
          options={options}
          cx={node.x}
          cy={node.y}
          r={radius}
          label={node.label}
          className={node.color ? `node-${node.color}` : undefined}
        />
      ))}
    </DiagramShell>
  );
}

/**
 * Recua a aresta para comecar/terminar na borda dos circulos (nunca sobre o
 * texto do no), deixando espaco para a ponta da seta — padrao da referencia.
 */
function buildShortenedEdge(edge: Edge, radius: number): string {
  const dx = edge.to.x - edge.from.x;
  const dy = edge.to.y - edge.from.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) {
    return `M${edge.from.x} ${edge.from.y} L${edge.to.x} ${edge.to.y}`;
  }

  const ux = dx / length;
  const uy = dy / length;
  const startX = edge.from.x + ux * radius;
  const startY = edge.from.y + uy * radius;
  const endX = edge.to.x - ux * (radius + 3);
  const endY = edge.to.y - uy * (radius + 3);
  return `M${startX} ${startY} L${endX} ${endY}`;
}

function HashDiagram({
  visualState,
  options,
}: {
  visualState: HashVisualState;
  options: RenderOptions;
}) {
  const { highlighted, selected, pathOrder, onNodeClick } = options;

  return (
    <DiagramShell
      width={360}
      height={180}
      ariaLabel="Diagrama de hash"
      className="structure-sketch hash-sketch"
      caption={options.caption}
      tone={options.tone}
    >
      <text className="diagram-caption" x="24" y="22">
        tabela hash
      </text>
      <text className="diagram-caption" x="24" y="40">
        area principal
      </text>
      <path className="list-link list-null-link" d="M24 96 L336 96" />
      <text className="diagram-caption" x="24" y="100">
        reserva
      </text>
      {visualState.slots.map((slot) => {
        const x = 24 + (slot.index % 4) * 78;
        const y = slot.index < 4 ? 44 : 104;
        const id = `slot-${slot.index}`;
        const isSelected = selected.has(id);
        const isHighlighted = highlighted.has(id);
        const pathIndex = pathOrder.get(id);

        return (
          <g
            key={id}
            className={[
              'diagram-node',
              `slot-${slot.status ?? 'empty'}`,
              isHighlighted ? 'is-active' : '',
              pathIndex !== undefined ? 'on-path' : '',
              isSelected ? 'is-selected' : '',
              onNodeClick ? 'is-clickable' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            data-node-id={id}
            style={pathIndex !== undefined ? { ['--path-i' as string]: pathIndex } : undefined}
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
    </DiagramShell>
  );
}

function TrieDiagram({
  visualState,
  options,
}: {
  visualState: TrieVisualState;
  options: RenderOptions;
}) {
  const { nodes, edges, width, height } = layoutTrie(visualState.root);
  const markerId = useId();
  const radius = 18;

  return (
    <DiagramShell
      width={width}
      height={height}
      ariaLabel="Diagrama de TRIE"
      className="structure-sketch trie-sketch"
      caption={options.caption}
      tone={options.tone}
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" className="edge-arrowhead" />
        </marker>
      </defs>
      {edges.map((edge, index) => (
        <path
          key={`${edge.from.x}-${edge.from.y}-${edge.to.x}-${edge.to.y}-${index}`}
          className="tree-edge"
          d={buildShortenedEdge(edge, radius)}
          markerEnd={`url(#${markerId})`}
        />
      ))}
      {nodes.map((node) => (
        <DiagramNode
          key={node.id}
          id={node.id}
          options={options}
          cx={node.x}
          cy={node.y}
          r={radius}
          label={node.folha ? `${node.label}*` : node.label}
          className={node.folha ? 'node-terminal' : undefined}
        />
      ))}
    </DiagramShell>
  );
}

function HybridDiagram({
  visualState,
  options,
}: {
  visualState: HybridVisualState;
  options: RenderOptions;
}) {
  if (visualState.id.startsWith('lista-')) {
    return <LinkedListDiagram visualState={visualState} options={options} />;
  }

  if (visualState.id.startsWith('pilha-')) {
    return <StackDiagram visualState={visualState} options={options} />;
  }

  if (visualState.id.startsWith('ordenacao-')) {
    return <ArrayDiagram visualState={visualState} options={options} />;
  }

  const { highlighted, selected, pathOrder, onNodeClick } = options;
  const width = 360;
  const gap = 10;
  const layerWidth = (width - 40 - gap * (visualState.layers.length - 1)) / visualState.layers.length;

  return (
    <DiagramShell
      width={360}
      height={180}
      ariaLabel="Diagrama hibrido"
      className="structure-sketch hybrid-sketch"
      caption={options.caption}
      tone={options.tone}
    >
      {visualState.layers.map((layer) => {
        const index = visualState.layers.indexOf(layer);
        const x = 20 + index * (layerWidth + gap);
        const isHighlighted = highlighted.has(layer.id);
        const isSelected = selected.has(layer.id);
        const pathIndex = pathOrder.get(layer.id);

        return (
          <g
            key={layer.id}
            className={[
              'diagram-node',
              isHighlighted ? 'is-active' : '',
              pathIndex !== undefined ? 'on-path' : '',
              isSelected ? 'is-selected' : '',
              onNodeClick ? 'is-clickable' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            data-node-id={layer.id}
            style={pathIndex !== undefined ? { ['--path-i' as string]: pathIndex } : undefined}
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
    </DiagramShell>
  );
}

function LinkedListDiagram({
  visualState,
  options,
}: {
  visualState: HybridVisualState;
  options: RenderOptions;
}) {
  const { highlighted, selected, onNodeClick } = options;
  const connected = visualState.layers.filter((layer) => !layer.items.some((item) => item.includes('solta')));
  const loose = visualState.layers.filter((layer) => layer.items.some((item) => item.includes('solta')));
  const spacing = connected.length > 4 ? 82 : 94;
  const startX = connected.length > 4 ? 38 : 44;
  const y = 88;

  return (
    <DiagramShell
      width={420}
      height={190}
      ariaLabel="Diagrama de lista"
      className="structure-sketch list-sketch"
      caption={options.caption}
      tone={options.tone}
    >
      <defs>
        <marker id="arrow-list" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" />
        </marker>
      </defs>
      <text className="diagram-caption" x="22" y="24">
        lista encadeada com celula cabeca
      </text>

      {connected.map((layer, index) => {
        const x = startX + index * spacing;
        const nextX = startX + (index + 1) * spacing;

        return index < connected.length - 1 ? (
          <path
            key={`${layer.id}-arrow`}
            className="list-link"
            d={`M${x + 34} ${y} C${x + 48} ${y - 10}, ${nextX - 48} ${y - 10}, ${nextX - 34} ${y}`}
            markerEnd="url(#arrow-list)"
          />
        ) : null;
      })}

      {connected.length > 0 ? (
        <>
          <path
            className="list-link list-null-link"
            d={`M${startX + (connected.length - 1) * spacing + 34} ${y} L${startX + (connected.length - 1) * spacing + 58} ${y}`}
            markerEnd="url(#arrow-list)"
          />
          <text className="list-null-label" x={startX + (connected.length - 1) * spacing + 66} y={y + 5}>
            null
          </text>
        </>
      ) : null}

      {connected.map((layer, index) => (
        <PointerCell
          key={layer.id}
          id={layer.id}
          x={startX + index * spacing}
          y={y}
          label={getListCellLabel(layer)}
          caption={getListCellCaption(layer, index)}
          highlighted={highlighted}
          selected={selected}
          onNodeClick={onNodeClick}
          tone={layer.id === 'cabeca' ? 'head' : layer.id === 'c5' ? 'new' : 'normal'}
        />
      ))}

      {loose.map((layer, index) => (
        <PointerCell
          key={layer.id}
          id={layer.id}
          x={320 + index * 58}
          y={148}
          label={getListCellLabel(layer)}
          caption="solta"
          highlighted={highlighted}
          selected={selected}
          onNodeClick={onNodeClick}
          tone="loose"
        />
      ))}
    </DiagramShell>
  );
}

function StackDiagram({
  visualState,
  options,
}: {
  visualState: HybridVisualState;
  options: RenderOptions;
}) {
  const { highlighted, selected, onNodeClick } = options;
  const startY = 48;
  const gap = 38;
  const x = 194;

  return (
    <DiagramShell
      width={360}
      height={190}
      ariaLabel="Diagrama de pilha"
      className="structure-sketch stack-sketch"
      caption={options.caption}
      tone={options.tone}
    >
      <defs>
        <marker id="arrow-stack" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" />
        </marker>
      </defs>
      <text className="diagram-caption" x="24" y="24">
        pilha flexivel
      </text>
      <text className="stack-top-label" x="72" y={startY + 6}>
        topo
      </text>
      <path className="stack-top-arrow" d={`M108 ${startY + 2} L${x - 36} ${startY + 2}`} markerEnd="url(#arrow-stack)" />

      {visualState.layers.map((layer, index) => {
        const y = startY + index * gap;
        const nextY = startY + (index + 1) * gap;

        return index < visualState.layers.length - 1 ? (
          <path
            key={`${layer.id}-arrow`}
            className="stack-link"
            d={`M${x} ${y + 18} L${x} ${nextY - 18}`}
            markerEnd="url(#arrow-stack)"
          />
        ) : null;
      })}

      {visualState.layers.map((layer, index) => {
        const y = startY + index * gap;

        return (
          <PointerCell
            key={layer.id}
            id={layer.id}
            x={x}
            y={y}
            label={getStackCellLabel(layer)}
            caption={index === 0 ? 'topo' : index === visualState.layers.length - 1 ? 'base' : ''}
            highlighted={highlighted}
            selected={selected}
            onNodeClick={onNodeClick}
            tone={index === 0 ? 'new' : 'normal'}
          />
        );
      })}
    </DiagramShell>
  );
}

function ArrayDiagram({
  visualState,
  options,
}: {
  visualState: HybridVisualState;
  options: RenderOptions;
}) {
  const { highlighted, selected, pathOrder, onNodeClick } = options;
  const cellWidth = 64;
  const startX = 22;
  const y = 72;

  return (
    <DiagramShell
      width={360}
      height={190}
      ariaLabel="Diagrama de vetor"
      className="structure-sketch array-sketch"
      caption={options.caption}
      tone={options.tone}
    >
      <text className="diagram-caption" x="22" y="24">
        vetor em memoria principal
      </text>
      {visualState.layers.map((layer, index) => {
        const x = startX + index * cellWidth;
        const value = layer.items[0] ?? '';
        const tags = layer.items.slice(1);
        const isHighlighted = highlighted.has(layer.id);
        const isSelected = selected.has(layer.id);
        const pathIndex = pathOrder.get(layer.id);

        return (
          <g
            key={layer.id}
            className={[
              'array-cell',
              isHighlighted ? 'is-active' : '',
              pathIndex !== undefined ? 'on-path' : '',
              isSelected ? 'is-selected' : '',
              onNodeClick ? 'is-clickable' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            data-node-id={layer.id}
            style={pathIndex !== undefined ? { ['--path-i' as string]: pathIndex } : undefined}
            onClick={onNodeClick ? () => onNodeClick(layer.id) : undefined}
            onKeyDown={getNodeKeyDown(onNodeClick, layer.id)}
            role={onNodeClick ? 'button' : undefined}
            tabIndex={onNodeClick ? 0 : undefined}
          >
            <text className="array-index" x={x + 26} y={y - 16} textAnchor="middle">
              {layer.label}
            </text>
            <rect x={x} y={y} width={52} height={48} rx={8} />
            <text className="array-value" x={x + 26} y={y + 31} textAnchor="middle">
              {value}
            </text>
            {tags.map((tag, tagIndex) => (
              <text key={`${layer.id}-${tag}`} className="array-tag" x={x + 26} y={y + 66 + tagIndex * 14} textAnchor="middle">
                {tag}
              </text>
            ))}
          </g>
        );
      })}
    </DiagramShell>
  );
}

function PointerCell({
  id,
  x,
  y,
  label,
  caption,
  highlighted,
  selected,
  onNodeClick,
  tone,
}: {
  id: string;
  x: number;
  y: number;
  label: string;
  caption: string;
  highlighted: HighlightSet;
  selected: HighlightSet;
  onNodeClick?: (nodeId: string) => void;
  tone: 'normal' | 'head' | 'new' | 'loose';
}) {
  const isHighlighted = highlighted.has(id);
  const isSelected = selected.has(id);
  const radius = tone === 'head' ? 24 : 28;

  return (
    <g
      className={[
        'pointer-cell',
        `cell-${tone}`,
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
      <circle cx={x} cy={y} r={radius} />
      <text className="cell-label" x={x} y={y + 5} textAnchor="middle">
        {label}
      </text>
      {caption ? (
        <text className="cell-caption" x={x} y={y + radius + 17} textAnchor="middle">
          {caption}
        </text>
      ) : null}
    </g>
  );
}

function getListCellLabel(layer: HybridLayerView): string {
  if (layer.id === 'cabeca') {
    return 'cabeca';
  }

  return layer.items[0] ?? layer.label;
}

function getListCellCaption(layer: HybridLayerView, index: number): string {
  if (layer.id === 'cabeca') {
    return 'celula cabeca';
  }

  if (layer.label === 'ultimo') {
    return 'ultimo';
  }

  if (layer.id === 'c5') {
    return 'nova';
  }

  return index === 1 ? 'primeira' : '';
}

function getStackCellLabel(layer: HybridLayerView): string {
  return layer.items[0] ?? layer.label;
}

function layoutTree(root: TreeNodeView | undefined): {
  nodes: PositionedTreeNode[];
  edges: Edge[];
  width: number;
  height: number;
} {
  if (!root) {
    return { nodes: [], edges: [], width: 360, height: 180 };
  }

  const sideMargin = 34;
  const slotWidth = 60;
  const levelGap = 58;
  const top = 36;

  // Posicao x por caminhamento central (in-order): cada no ocupa um "slot"
  // sequencial, garantindo que ninguem se sobreponha e que o pai fique
  // centralizado entre suas subarvores. Funciona bem para ABB e arvores comuns.
  const positions = new Map<string, PositionedTreeNode>();
  let order = 0;
  let maxDepth = 0;

  const assign = (node: TreeNodeView, depth: number) => {
    if (node.left) {
      assign(node.left, depth + 1);
    }

    maxDepth = Math.max(maxDepth, depth);
    positions.set(node.id, {
      id: node.id,
      label: node.label,
      x: sideMargin + order * slotWidth,
      y: top + depth * levelGap,
      color: node.color,
    });
    order += 1;

    if (node.right) {
      assign(node.right, depth + 1);
    }
  };

  assign(root, 0);

  const nodes: PositionedTreeNode[] = [];
  const edges: Edge[] = [];

  const walk = (node: TreeNodeView) => {
    const parent = positions.get(node.id);
    if (!parent) {
      return;
    }

    nodes.push(parent);

    for (const child of [node.left, node.right]) {
      if (!child) {
        continue;
      }

      const childPos = positions.get(child.id);
      if (childPos) {
        edges.push({
          from: { x: parent.x, y: parent.y },
          to: { x: childPos.x, y: childPos.y },
        });
      }
      walk(child);
    }
  };

  walk(root);

  const width = Math.max(360, sideMargin * 2 + Math.max(0, order - 1) * slotWidth);
  const height = top + maxDepth * levelGap + 46;
  return { nodes, edges, width, height };
}

function layoutTrie(root: TrieNodeView): {
  nodes: PositionedTrieNode[];
  edges: Edge[];
  width: number;
  height: number;
} {
  const sideMargin = 30;
  const slotWidth = 54;
  const levelGap = 48;
  const top = 34;

  // Folhas recebem slots sequenciais; cada no interno fica centralizado entre
  // a primeira e a ultima folha de sua subarvore, evitando sobreposicao.
  const positions = new Map<string, PositionedTrieNode>();
  let leafOrder = 0;
  let maxDepth = 0;

  const assign = (node: TrieNodeView, depth: number): number => {
    maxDepth = Math.max(maxDepth, depth);
    const children = node.children ?? [];

    let x: number;
    if (children.length === 0) {
      x = sideMargin + leafOrder * slotWidth;
      leafOrder += 1;
    } else {
      const childXs = children.map((child) => assign(child, depth + 1));
      x = (childXs[0] + childXs[childXs.length - 1]) / 2;
    }

    positions.set(node.id, {
      id: node.id,
      label: node.char.length > 0 ? node.char : 'raiz',
      x,
      y: top + depth * levelGap,
      folha: node.folha,
    });
    return x;
  };

  assign(root, 0);

  const nodes: PositionedTrieNode[] = [];
  const edges: Edge[] = [];

  const walk = (node: TrieNodeView) => {
    const parent = positions.get(node.id);
    if (!parent) {
      return;
    }

    nodes.push(parent);
    for (const child of node.children ?? []) {
      const childPos = positions.get(child.id);
      if (childPos) {
        edges.push({
          from: { x: parent.x, y: parent.y },
          to: { x: childPos.x, y: childPos.y },
        });
      }
      walk(child);
    }
  };

  walk(root);

  const width = Math.max(360, sideMargin * 2 + Math.max(0, leafOrder - 1) * slotWidth);
  const height = top + maxDepth * levelGap + 44;
  return { nodes, edges, width, height };
}

function renderFallbackStructure(structure: StructureKind, options: RenderOptions) {
  const labelByStructure: Record<StructureKind, string[]> = {
    lista: ['primeiro', '10', '20', '30'],
    pilha: ['topo', '30', '20', '10'],
    ordenacao: ['i', '7', '3', '9'],
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
    <TreeDiagram visualState={{ id: `${structure}-fallback`, kind: 'tree', root }} options={options} />
  );
}

type DiagramNodeProps = {
  id: string;
  options: RenderOptions;
  cx: number;
  cy: number;
  r: number;
  label: string;
  className?: string;
};

/**
 * No circular posicionado via transform (nao cx/cy) para que mudancas de
 * layout deslizem com transicao CSS. Quando o no participa de `activePath`,
 * recebe a classe `on-path` e a variavel `--path-i`, que escalona a animacao
 * de visita em sequencia (um no por vez).
 */
function DiagramNode({ id, options, cx, cy, r, label, className }: DiagramNodeProps) {
  const { highlighted, selected, pathOrder, onNodeClick } = options;
  const pathIndex = pathOrder.get(id);
  const groupClass = [
    'diagram-node',
    className,
    highlighted.has(id) ? 'is-active' : '',
    pathIndex !== undefined ? 'on-path' : '',
    selected.has(id) ? 'is-selected' : '',
    onNodeClick ? 'is-clickable' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <g
      className={groupClass}
      data-node-id={id}
      style={pathIndex !== undefined ? { ['--path-i' as string]: pathIndex } : undefined}
      transform={`translate(${cx} ${cy})`}
      onClick={onNodeClick ? () => onNodeClick(id) : undefined}
      onKeyDown={getNodeKeyDown(onNodeClick, id)}
      role={onNodeClick ? 'button' : undefined}
      tabIndex={onNodeClick ? 0 : undefined}
    >
      <circle cx={0} cy={0} r={r} />
      <text x={0} y={5} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}
