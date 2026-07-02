/**
 * Modelo de cena/quadro das visualizações de estruturas de dados.
 * Uma cena é uma sequência de quadros (frames); cada quadro descreve
 * o estado completo da estrutura naquele passo da operação.
 * Nós com o mesmo id entre quadros são animados por interpolação.
 */

export type VizNodeState =
  | 'default'
  | 'active'
  | 'compare'
  | 'found'
  | 'inserted'
  | 'removed'
  | 'visited'
  | 'error'
  | 'muted';

export type VizNodeShape = 'circle' | 'box' | 'slot' | 'pill';

export type VizNode = {
  id: string;
  x: number;
  y: number;
  label: string;
  shape?: VizNodeShape;
  state?: VizNodeState;
  /** Texto pequeno abaixo do nó (índice, fator de balanceamento...). */
  sub?: string;
  /** Largura customizada para box/pill/slot. */
  w?: number;
  h?: number;
};

export type VizEdge = {
  id: string;
  from: string;
  to: string;
  state?: VizNodeState;
  arrow?: boolean;
  dashed?: boolean;
  /** Curvatura opcional (deslocamento perpendicular do ponto médio). */
  bend?: number;
};

export type VizPointer = {
  id: string;
  /** Nó apontado. */
  target: string;
  label: string;
  side: 'top' | 'bottom' | 'left' | 'right';
  tone?: 'primary' | 'accent' | 'warning';
};

export type VizVar = {
  name: string;
  value: string;
};

export type VizFrame = {
  nodes: VizNode[];
  edges: VizEdge[];
  pointers: VizPointer[];
  /** Explicação curta da etapa atual. */
  caption: string;
  /** Índice da linha de código em execução (em VizScene.code). */
  codeLine?: number;
  vars?: VizVar[];
};

export type VizScene = {
  /** Nome da operação demonstrada, ex.: "push / pop". */
  operation: string;
  /** Complexidade da operação, ex.: "O(1)". */
  complexity: string;
  /** Pseudocódigo sincronizado com os quadros. */
  code: string[];
  frames: VizFrame[];
  /** Tamanho lógico do canvas (viewBox). */
  width: number;
  height: number;
};

export const stateLegend: Record<Exclude<VizNodeState, 'default' | 'muted'>, { label: string; badge: string }> = {
  active: { label: 'Atual', badge: '▶' },
  compare: { label: 'Comparando', badge: '?' },
  found: { label: 'Encontrado', badge: '✓' },
  inserted: { label: 'Inserido', badge: '+' },
  removed: { label: 'Removido', badge: '×' },
  visited: { label: 'Visitado', badge: '·' },
  error: { label: 'Inválido', badge: '!' },
};

/** Estados presentes na cena, na ordem da legenda. */
export function collectLegend(scene: VizScene): Array<keyof typeof stateLegend> {
  const seen = new Set<string>();

  for (const frame of scene.frames) {
    for (const node of frame.nodes) {
      if (node.state && node.state !== 'default' && node.state !== 'muted') {
        seen.add(node.state);
      }
    }
  }

  return (Object.keys(stateLegend) as Array<keyof typeof stateLegend>).filter((state) => seen.has(state));
}
