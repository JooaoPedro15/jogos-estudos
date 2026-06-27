import type { StructureKind } from '../../types/challenge';

/**
 * Diagrama esquemático de uma estrutura de dados. Generaliza o antigo
 * `StructureSketch` (embutido em `App.tsx`) para aceitar `activePath`/`activeNodeId`
 * vindos de `StepResult` e destacar os nós/arestas correspondentes durante etapas
 * de `simular`. O destaque é puramente visual (cor/escala via CSS transition) e não
 * afeta a interatividade do componente.
 */
export type StructureDiagramProps = {
  structure: StructureKind;
  /** Sequência de ids de nó visitados (ex.: `['n40', 'n60', 'n50']`). */
  activePath?: string[];
  /** Nó de destaque único (ex.: resultado final de uma busca). */
  activeNodeId?: string;
};

export function StructureDiagram({ structure, activePath, activeNodeId }: StructureDiagramProps) {
  const highlighted = new Set<string>(activePath ?? []);
  if (activeNodeId) {
    highlighted.add(activeNodeId);
  }

  if (structure === 'doidona') {
    return (
      <svg
        className="structure-sketch"
        viewBox="0 0 360 160"
        role="img"
        aria-label="Diagrama de doidona"
      >
        <Node id="no" highlighted={highlighted} cx={44} cy={78} r={18} label="No" labelDx={-30} labelDy={6} />
        <Node id="t1-topo" highlighted={highlighted} cx={100} cy={46} r={18} />
        <Node id="t2-topo" highlighted={highlighted} cx={100} cy={110} r={18} />
        <path d="M60 70 L84 54 M61 86 L84 102 M118 46 H150 M118 110 H150" />
        <Node id="t1" highlighted={highlighted} shape="rect" x={150} y={28} width={40} height={30} label="T1" labelDx={4} labelDy={20} />
        <Node id="t2" highlighted={highlighted} shape="rect" x={150} y={92} width={40} height={30} label="T2" labelDx={4} labelDy={20} />
        <path d="M190 43 H226 M190 107 H226" />
        <Node id="t1-fim" highlighted={highlighted} shape="rect" x={226} y={28} width={40} height={30} />
        <Node id="t2-fim" highlighted={highlighted} shape="rect" x={226} y={92} width={40} height={30} />
        <path d="M266 43 C288 43, 286 76, 306 76 H332 M266 107 C288 107, 286 76, 306 76" />
        <Node id="lista" highlighted={highlighted} shape="rect" x={306} y={62} width={30} height={28} label="lista" labelDx={-4} labelDy={50} />
      </svg>
    );
  }

  if (structure === 'hash') {
    return (
      <svg className="structure-sketch" viewBox="0 0 360 160" role="img" aria-label="Diagrama de hash">
        {[0, 1, 2, 3, 4].map((index) => (
          <Node
            key={index}
            id={`slot-${index}`}
            highlighted={highlighted}
            shape="rect"
            x={26 + index * 42}
            y={36}
            width={34}
            height={34}
          />
        ))}
        <path d="M152 70 C190 110, 230 112, 266 96" />
        <Node id="reserva-1" highlighted={highlighted} shape="rect" x={260} y={80} width={34} height={28} />
        <Node id="reserva-2" highlighted={highlighted} shape="rect" x={300} y={80} width={34} height={28} />
        <text x="28" y="118">area principal + reserva</text>
      </svg>
    );
  }

  if (structure === 'trie') {
    const nodes = [
      { id: 's', cx: 54, cy: 76, label: 'S', dx: -6, dy: 6 },
      { id: 'st', cx: 130, cy: 46, label: 'T', dx: -6, dy: 6 },
      { id: 'sto', cx: 206, cy: 46, label: 'O', dx: -6, dy: 6 },
      { id: 'stop', cx: 282, cy: 46, label: 'P', dx: -6, dy: 6 },
      { id: 'sa', cx: 130, cy: 106, label: 'A', dx: -6, dy: 6 },
      { id: 'sap', cx: 206, cy: 106, label: 'P', dx: -6, dy: 6 },
    ];

    return (
      <svg className="structure-sketch" viewBox="0 0 360 160" role="img" aria-label="Diagrama de TRIE">
        <path d="M71 69 L113 52 M147 46 H189 M223 46 H265 M71 84 L113 100 M147 106 H189" />
        {nodes.map((node) => (
          <Node
            key={node.id}
            id={node.id}
            highlighted={highlighted}
            cx={node.cx}
            cy={node.cy}
            r={18}
            label={node.label}
            labelDx={node.dx}
            labelDy={node.dy}
          />
        ))}
      </svg>
    );
  }

  const nodeClass = structure === 'alvinegra' ? ' rb' : '';
  const treeNodes = [
    { id: 'n40', x: 180, y: 38, label: '40' },
    { id: 'n20', x: 98, y: 90, label: '20' },
    { id: 'n60', x: 262, y: 90, label: '60' },
    { id: 'n10', x: 58, y: 132, label: '10' },
    { id: 'n30', x: 138, y: 132, label: '30' },
    { id: 'n50', x: 222, y: 132, label: '50' },
    { id: 'n70', x: 302, y: 132, label: '70' },
  ];

  return (
    <svg
      className={`structure-sketch${nodeClass}`}
      viewBox="0 0 360 160"
      role="img"
      aria-label="Diagrama de arvore"
    >
      <path d="M180 38 L98 90 M180 38 L262 90 M98 90 L58 132 M98 90 L138 132 M262 90 L222 132 M262 90 L302 132" />
      {treeNodes.map((node, index) => (
        <Node
          key={node.id}
          id={node.id}
          highlighted={highlighted}
          cx={node.x}
          cy={node.y}
          r={18}
          label={node.label}
          labelDx={-8}
          labelDy={5}
          className={index % 2 === 0 ? 'node-dark' : 'node-light'}
        />
      ))}
    </svg>
  );
}

type NodeProps = {
  id: string;
  highlighted: Set<string>;
  shape?: 'circle' | 'rect';
  cx?: number;
  cy?: number;
  r?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  label?: string;
  labelDx?: number;
  labelDy?: number;
  className?: string;
};

/** Nó (círculo ou retângulo) com rótulo opcional, destacável via classe `is-active`. */
function Node({
  id,
  highlighted,
  shape = 'circle',
  cx = 0,
  cy = 0,
  r = 18,
  x = 0,
  y = 0,
  width = 30,
  height = 30,
  label,
  labelDx = 0,
  labelDy = 0,
  className,
}: NodeProps) {
  const isActive = highlighted.has(id);
  const groupClass = ['diagram-node', className, isActive ? 'is-active' : '']
    .filter(Boolean)
    .join(' ');

  const labelX = shape === 'circle' ? cx + labelDx : x + labelDx;
  const labelY = shape === 'circle' ? cy + labelDy : y + labelDy;

  return (
    <g className={groupClass} data-node-id={id}>
      {shape === 'circle' ? (
        <circle cx={cx} cy={cy} r={r} />
      ) : (
        <rect x={x} y={y} width={width} height={height} rx={4} />
      )}
      {label ? <text x={labelX} y={labelY}>{label}</text> : null}
    </g>
  );
}
