import { e, n, p, snap } from './sceneUtils';
import type { VizEdge, VizFrame, VizNode, VizNodeState, VizScene, VizVar } from './vizTypes';

/**
 * Estrutura Doidona (estruturas híbridas, unidade 05g):
 * tabela hash T1 cuja área de reserva é T2; cada posição de T2
 * desvia para uma subestrutura configurável (lista, pilha, fila,
 * árvore ou tabela T3), como na figura de referência da matéria.
 *
 * Regra didática de roteamento: pos = x % 5; área = pos % 3.
 */

export type DoidonaSubKind = 'lista' | 'pilha' | 'fila' | 'arvore' | 'tabela';
export type DoidonaConfig = [DoidonaSubKind, DoidonaSubKind, DoidonaSubKind];
export type DoidonaOpId = 'inserir' | 'buscar' | 'remover';

export const doidonaSubKinds: Array<{ id: DoidonaSubKind; label: string }> = [
  { id: 'tabela', label: 'Tabela (T3)' },
  { id: 'lista', label: 'Lista' },
  { id: 'pilha', label: 'Pilha' },
  { id: 'fila', label: 'Fila' },
  { id: 'arvore', label: 'Árvore (ABB)' },
];

export const defaultDoidonaConfig: DoidonaConfig = ['tabela', 'lista', 'arvore'];

const T1_SIZE = 5;
const AREAS = 3;
const WIDTH = 560;
const HEIGHT = 430;

const T1_X = 95;
const SLOT_W = 76;
const SLOT_H = 34;
const t1Y = (index: number) => 56 + index * 38;
const t2Y = (index: number) => 272 + index * 38;
const zoneCY = (area: number) => 96 + area * 124;
const ZONE_X = 258;

const subLabel: Record<DoidonaSubKind, string> = {
  lista: 'lista',
  pilha: 'pilha',
  fila: 'fila',
  arvore: 'árvore',
  tabela: 'T3 (tabela)',
};

type DoidonaState = {
  t1: Array<number | null>;
  areas: Array<{ kind: DoidonaSubKind; values: number[] }>;
};

export function buildDoidonaState(config: DoidonaConfig): DoidonaState {
  return {
    t1: [15, null, 7, null, 9],
    areas: [
      { kind: config[0], values: [10, 20] },
      { kind: config[1], values: [14, 24] },
      { kind: config[2], values: [17, 12] },
    ],
  };
}

type Marks = Record<string, VizNodeState>;

type MiniRender = {
  nodes: VizNode[];
  edges: VizEdge[];
  /** Nó estrutural que recebe a seta vinda de T2. */
  anchorId: string;
  /** Ids dos nós de valor, na ordem de percurso da busca. */
  elementIds: string[];
};

function valueId(area: number, value: number): string {
  return `a${area}v${value}`;
}

function renderMini(area: number, kind: DoidonaSubKind, values: number[]): MiniRender {
  const cy = zoneCY(area);
  const nodes: VizNode[] = [];
  const edges: VizEdge[] = [];
  const elementIds: string[] = [];

  if (kind === 'lista' || kind === 'fila') {
    const gap = kind === 'lista' ? 62 : 54;
    const anchorId = `a${area}-base`;
    nodes.push(n(anchorId, ZONE_X + 8, cy, '', { shape: 'slot', w: 18, h: 30 }));

    values.forEach((value, index) => {
      const id = valueId(area, value);
      nodes.push(
        n(id, ZONE_X + 52 + index * gap, cy, `${value}`, {
          shape: 'box',
          w: 46,
          h: 32,
          sub: kind === 'fila' ? (index === 0 ? 'frente' : index === values.length - 1 ? 'trás' : undefined) : undefined,
        }),
      );
      elementIds.push(id);
      edges.push(e(index === 0 ? anchorId : elementIds[index - 1], id, { arrow: kind === 'lista' }));
    });

    return { nodes, edges, anchorId, elementIds };
  }

  if (kind === 'pilha') {
    const anchorId = `a${area}-base`;
    nodes.push(n(anchorId, ZONE_X + 34, cy + 36, '', { shape: 'slot', w: 60, h: 12 }));

    values.forEach((value, index) => {
      const id = valueId(area, value);
      nodes.push(
        n(id, ZONE_X + 34, cy + 14 - index * 34, `${value}`, {
          shape: 'box',
          w: 52,
          h: 30,
          sub: index === values.length - 1 ? 'topo' : undefined,
        }),
      );
      elementIds.push(id);
    });

    // Busca na pilha percorre do topo para a base.
    return { nodes, edges, anchorId, elementIds: [...elementIds].reverse() };
  }

  if (kind === 'tabela') {
    const anchorId = `a${area}t0`;

    for (let m = 0; m < 3; m += 1) {
      nodes.push(n(`a${area}t${m}`, ZONE_X + 34, cy - 38 + m * 38, '', { shape: 'slot', w: 62, h: 34, sub: `${m}` }));
    }

    const takenSlots = new Set<number>();
    values.forEach((value) => {
      let slot = value % 3;
      for (let probe = 0; probe < 3 && takenSlots.has(slot); probe += 1) {
        slot = (slot + 1) % 3;
      }
      takenSlots.add(slot);
      const id = valueId(area, value);
      nodes.push(n(id, ZONE_X + 34, cy - 38 + slot * 38, `${value}`, { shape: 'box', w: 52, h: 28 }));
      elementIds.push(id);
    });

    return { nodes, edges, anchorId, elementIds };
  }

  // Árvore (ABB pequena): raiz + filhos por comparação.
  const rootX = ZONE_X + 64;
  const anchorId = values.length ? valueId(area, values[0]) : `a${area}-base`;

  if (!values.length) {
    nodes.push(n(`a${area}-base`, rootX, cy, '∅', { shape: 'pill', w: 44, h: 28 }));
    return { nodes, edges, anchorId: `a${area}-base`, elementIds };
  }

  type Mini = { value: number; left?: Mini; right?: Mini };
  let root: Mini | undefined;

  for (const value of values) {
    if (!root) {
      root = { value };
      continue;
    }
    let cursor = root;
    for (;;) {
      if (value < cursor.value) {
        if (!cursor.left) {
          cursor.left = { value };
          break;
        }
        cursor = cursor.left;
      } else {
        if (!cursor.right) {
          cursor.right = { value };
          break;
        }
        cursor = cursor.right;
      }
    }
  }

  (function place(node: Mini, x: number, y: number, spread: number) {
    const id = valueId(area, node.value);
    nodes.push(n(id, x, y, `${node.value}`, { shape: 'circle' }));
    elementIds.push(id);
    if (node.left) {
      edges.push(e(id, valueId(area, node.left.value)));
      place(node.left, x - spread, y + 42, spread / 2);
    }
    if (node.right) {
      edges.push(e(id, valueId(area, node.right.value)));
      place(node.right, x + spread, y + 42, spread / 2);
    }
  })(root!, rootX, cy - 34, 44);

  return { nodes, edges, anchorId, elementIds };
}

function renderDoidona(state: DoidonaState, marks: Marks, extraNodes: VizNode[] = []): { nodes: VizNode[]; edges: VizEdge[] } {
  const nodes: VizNode[] = [];
  const edges: VizEdge[] = [];

  nodes.push(n('lbl-t1', T1_X, 24, 'T1 · hash', { shape: 'pill', w: 84, h: 24, state: 'muted' }));

  for (let i = 0; i < T1_SIZE; i += 1) {
    nodes.push(n(`t1-${i}`, T1_X, t1Y(i), '', { shape: 'slot', w: SLOT_W, h: SLOT_H, sub: undefined }));
    nodes.push(n(`t1idx-${i}`, T1_X - SLOT_W / 2 - 16, t1Y(i), `${i}`, { shape: 'pill', w: 22, h: 20, state: 'muted' }));
    const value = state.t1[i];
    if (value !== null) {
      nodes.push(n(`t1v-${value}`, T1_X, t1Y(i), `${value}`, { shape: 'box', w: 62, h: 28 }));
    }
  }

  nodes.push(n('lbl-t2', T1_X, 240, 'T2 · reserva', { shape: 'pill', w: 96, h: 24, state: 'muted' }));

  for (let k = 0; k < AREAS; k += 1) {
    nodes.push(n(`t2-${k}`, T1_X, t2Y(k), `R${k}`, { shape: 'slot', w: SLOT_W, h: SLOT_H }));

    const mini = renderMini(k, state.areas[k].kind, state.areas[k].values);
    // Rótulo da área na coluna direita, longe dos nós e das setas.
    nodes.push(
      n(`a${k}-lbl`, 506, zoneCY(k), subLabel[state.areas[k].kind], {
        shape: 'pill',
        w: Math.max(60, subLabel[state.areas[k].kind].length * 8 + 22),
        h: 22,
        state: 'muted',
      }),
    );
    nodes.push(...mini.nodes);
    edges.push(e(`t2-${k}`, mini.anchorId, { arrow: true, dashed: true }));
    edges.push(...mini.edges);
  }

  nodes.push(...extraNodes);

  for (const node of nodes) {
    if (marks[node.id]) {
      node.state = marks[node.id];
    }
  }

  return { nodes, edges };
}

type OpContext = {
  state: DoidonaState;
  frames: VizFrame[];
  code: string[];
};

function pushFrame(
  ctx: OpContext,
  caption: string,
  codeLine: number | undefined,
  marks: Marks,
  vars?: VizVar[],
  extraNodes: VizNode[] = [],
) {
  const { nodes, edges } = renderDoidona(ctx.state, marks, extraNodes);
  ctx.frames.push(snap(nodes, edges, [], caption, codeLine, vars));
}

/** Marca o desvio T2 → subestrutura (aresta destacada via nós). */
function areaMarks(area: number, state: VizNodeState): Marks {
  return { [`t2-${area}`]: state, [`a${area}-lbl`]: state === 'compare' ? 'compare' : state };
}

function searchElementFrames(
  ctx: OpContext,
  area: number,
  value: number,
  codeLine: number,
  baseMarks: Marks,
): { found: boolean; visited: Marks } {
  const { kind, values } = ctx.state.areas[area];
  const mini = renderMini(area, kind, values);
  const visited: Marks = {};

  for (const id of mini.elementIds) {
    const elementValue = Number(id.split('v')[1]);
    const marks = { ...baseMarks, ...visited, [id]: 'compare' as VizNodeState };

    if (elementValue === value) {
      pushFrame(ctx, `Compara com ${elementValue}: é igual → encontrado na ${subLabel[kind]}!`, codeLine, {
        ...marks,
        [id]: 'found',
      }, [{ name: 'atual', value: `${elementValue}` }, { name: 'resultado', value: 'true' }]);
      visited[id] = 'found';
      return { found: true, visited };
    }

    pushFrame(ctx, `Compara com ${elementValue}: diferente de ${value} → segue o percurso.`, codeLine, marks, [
      { name: 'atual', value: `${elementValue}` },
    ]);
    visited[id] = 'visited';
  }

  pushFrame(
    ctx,
    `Percorreu toda a ${subLabel[kind]} sem achar ${value}. Só agora pode concluir ausência.`,
    codeLine,
    { ...baseMarks, ...visited, [`a${area}-lbl`]: 'error' },
    [{ name: 'resultado', value: 'false' }],
  );
  return { found: false, visited };
}

export function doidonaScene(op: DoidonaOpId, rawValue: number, config: DoidonaConfig): VizScene {
  const state = buildDoidonaState(config);
  const value = Number.isFinite(rawValue) ? Math.abs(Math.trunc(rawValue)) : 22;
  const pos = value % T1_SIZE;
  const area = pos % AREAS;
  const kind = config[area];

  const verb = op === 'inserir' ? 'insere' : op === 'buscar' ? 'procura' : 'remove';
  const code = [
    `${op}(x):`,
    `  pos = x % ${T1_SIZE}`,
    op === 'inserir' ? '  se T1[pos] livre: T1[pos] = x' : '  se T1[pos] == x: resolve em T1',
    op === 'inserir' ? '  senão:  // colisão!' : '  senão:  // pode estar na reserva',
    `    área = pos % ${AREAS}  // desvio via T2`,
    `    ${verb} na estrutura da área`,
  ];

  const ctx: OpContext = { state, frames: [], code };
  const vars: VizVar[] = [{ name: 'x', value: `${value}` }];

  pushFrame(ctx, 'Doidona: T1 é hash; cada posição de T2 desvia para uma subestrutura.', 0, {}, vars);

  const staging = n('incoming', 330, 24, `${value}`, { shape: 'pill', w: 52, h: 30, state: 'active' });
  pushFrame(ctx, `${op}(${value}): a chave chega para ser roteada.`, 0, {}, vars, [staging]);

  pushFrame(ctx, `pos = ${value} % ${T1_SIZE} = ${pos}. A conta aponta direto a posição de T1.`, 1, { [`t1-${pos}`]: 'compare', [`t1idx-${pos}`]: 'compare' }, [
    ...vars,
    { name: 'pos', value: `${pos}` },
  ], [staging]);

  const occupant = state.t1[pos];

  if (op === 'inserir') {
    if (occupant === null) {
      state.t1[pos] = value;
      pushFrame(ctx, `T1[${pos}] estava livre: ${value} entra direto, sem tocar na reserva.`, 2, { [`t1v-${value}`]: 'inserted' }, [
        ...vars,
        { name: 'pos', value: `${pos}` },
      ]);
      pushFrame(ctx, 'Inserção direta em T1: custo O(1).', 2, { [`t1v-${value}`]: 'found' });
    } else {
      pushFrame(ctx, `Colisão! T1[${pos}] já guarda ${occupant}. Colisão não é erro: é desvio.`, 3, {
        [`t1v-${occupant}`]: 'compare',
        [`t1-${pos}`]: 'compare',
      }, [...vars, { name: 'pos', value: `${pos}` }], [{ ...staging, state: 'error' }]);

      pushFrame(ctx, `área = ${pos} % ${AREAS} = ${area}: T2[R${area}] desvia para a ${subLabel[kind]}.`, 4, {
        [`t1v-${occupant}`]: 'visited',
        ...areaMarks(area, 'compare'),
      }, [...vars, { name: 'área', value: `${area}` }], [staging]);

      if (!state.areas[area].values.includes(value)) {
        state.areas[area].values.push(value);
      }
      pushFrame(ctx, `${value} entra na ${subLabel[kind]} da área R${area}, seguindo a regra dela.`, 5, {
        ...areaMarks(area, 'found'),
        [valueId(area, value)]: 'inserted',
      }, [...vars, { name: 'área', value: `${area}` }]);

      pushFrame(ctx, 'Inserção concluída: T1 continua O(1) e a colisão vive na subestrutura.', 5, {
        [valueId(area, value)]: 'found',
      });
    }
  } else {
    // buscar / remover compartilham a fase de localização.
    if (occupant === value) {
      pushFrame(ctx, `T1[${pos}] == ${value}: resolvido direto na tabela principal.`, 2, { [`t1v-${value}`]: 'found' }, [
        ...vars,
        { name: 'resultado', value: 'true' },
      ]);

      if (op === 'remover') {
        pushFrame(ctx, `${value} é removido de T1[${pos}]. A posição volta a ficar livre.`, 2, { [`t1v-${value}`]: 'removed' });
        state.t1[pos] = null;
        pushFrame(ctx, 'Remoção concluída sem tocar na reserva.', 2, { [`t1-${pos}`]: 'found' });
      }
    } else if (occupant === null) {
      pushFrame(ctx, `T1[${pos}] está vazio: se ${value} existisse, estaria aqui → não está na estrutura.`, 2, {
        [`t1-${pos}`]: 'error',
        [`t1idx-${pos}`]: 'error',
      }, [...vars, { name: 'resultado', value: 'false' }], [{ ...staging, state: 'error' }]);
    } else {
      pushFrame(ctx, `T1[${pos}] guarda ${occupant} ≠ ${value}: pode estar na reserva. NÃO conclua ausência ainda.`, 3, {
        [`t1v-${occupant}`]: 'compare',
      }, [...vars, { name: 'pos', value: `${pos}` }], [staging]);

      pushFrame(ctx, `área = ${pos} % ${AREAS} = ${area}: segue o desvio de T2[R${area}] até a ${subLabel[kind]}.`, 4, {
        [`t1v-${occupant}`]: 'visited',
        ...areaMarks(area, 'compare'),
      }, [...vars, { name: 'área', value: `${area}` }], [staging]);

      const baseMarks: Marks = { [`t1v-${occupant}`]: 'visited', ...areaMarks(area, 'visited') };
      const { found, visited } = searchElementFrames(ctx, area, value, 5, baseMarks);

      if (found && op === 'remover') {
        const removedId = valueId(area, value);
        pushFrame(ctx, `${value} sai da ${subLabel[kind]}.`, 5, { ...baseMarks, ...visited, [removedId]: 'removed' });
        state.areas[area].values = state.areas[area].values.filter((item) => item !== value);
        pushFrame(ctx, 'A subestrutura se reorganiza sozinha; T1 e T2 não mudam.', 5, { ...baseMarks, [`a${area}-lbl`]: 'found' });
      } else if (found) {
        pushFrame(ctx, `Busca concluída: caminho T1[${pos}] → T2[R${area}] → ${subLabel[kind]}.`, 5, {
          ...baseMarks,
          ...visited,
        }, [{ name: 'resultado', value: 'true' }]);
      }
    }
  }

  return { operation: `${op}(${value})`, complexity: 'O(1) + custo da área', code, frames: ctx.frames, width: WIDTH, height: HEIGHT };
}
