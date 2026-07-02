import { e, n, snap } from './sceneUtils';
import type { VizEdge, VizFrame, VizNode, VizNodeState, VizScene, VizVar } from './vizTypes';

/**
 * Estrutura Doidona — fiel ao DoidonaSemTADsProntas.java da matéria:
 * hash T1; em colisão, hashT2(x) decide a área de reserva, e cada
 * área usa uma subestrutura própria (T3/tabela, lista, pilha, fila
 * ou árvore). Roteamento didático: hashT1(x) = x % 5, hashT2(x) = x % 3.
 */

export type DoidonaSubKind = 'lista' | 'pilha' | 'fila' | 'arvore' | 'tabela';
export type DoidonaConfig = [DoidonaSubKind, DoidonaSubKind, DoidonaSubKind];
export type DoidonaOpId = 'inserir' | 'buscar' | 'remover';

export type DoidonaCell = { id: string; value: number };

export type DoidonaState = {
  t1: Array<DoidonaCell | null>;
  areas: Array<{ kind: DoidonaSubKind; cells: DoidonaCell[] }>;
  seq: number;
};

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

const subCapacity: Record<DoidonaSubKind, number> = {
  lista: 4,
  pilha: 3,
  fila: 4,
  arvore: 7,
  tabela: 3,
};

const methodName: Record<DoidonaSubKind, string> = {
  lista: 'Lista',
  pilha: 'Pilha',
  fila: 'Fila',
  arvore: 'Arvore',
  tabela: 'T3',
};

export function initialDoidonaState(config: DoidonaConfig = defaultDoidonaConfig): DoidonaState {
  let seq = 0;
  const cell = (value: number): DoidonaCell => ({ id: `d${(seq += 1)}`, value });

  return {
    t1: [cell(15), null, cell(7), null, cell(9)],
    areas: [
      { kind: config[0], cells: [cell(12), cell(30)] },
      { kind: config[1], cells: [cell(10), cell(22)] },
      { kind: config[2], cells: [cell(17), cell(14)] },
    ],
    seq,
  };
}

export function emptyDoidonaState(config: DoidonaConfig = defaultDoidonaConfig): DoidonaState {
  return {
    t1: [null, null, null, null, null],
    areas: [
      { kind: config[0], cells: [] },
      { kind: config[1], cells: [] },
      { kind: config[2], cells: [] },
    ],
    seq: 0,
  };
}

export function doidonaKinds(state: DoidonaState): DoidonaConfig {
  return [state.areas[0].kind, state.areas[1].kind, state.areas[2].kind];
}

export function withDoidonaKind(state: DoidonaState, area: number, kind: DoidonaSubKind): DoidonaState {
  const next = cloneState(state);
  next.areas[area].kind = kind;
  return next;
}

function cloneState(state: DoidonaState): DoidonaState {
  return {
    t1: state.t1.map((cell) => (cell ? { ...cell } : null)),
    areas: state.areas.map((area) => ({ kind: area.kind, cells: area.cells.map((cell) => ({ ...cell })) })),
    seq: state.seq,
  };
}

/* =====================================================================
   Renderização (T1 + T2 + subestruturas)
   ===================================================================== */

type Marks = Record<string, VizNodeState>;

type MiniRender = {
  nodes: VizNode[];
  edges: VizEdge[];
  anchorId: string;
  /** Células na ordem de percurso da busca. */
  searchOrder: DoidonaCell[];
};

function renderMini(area: number, kind: DoidonaSubKind, cells: DoidonaCell[]): MiniRender {
  const cy = zoneCY(area);
  const nodes: VizNode[] = [];
  const edges: VizEdge[] = [];

  if (kind === 'lista' || kind === 'fila') {
    const gap = kind === 'lista' ? 62 : 54;
    const anchorId = `a${area}-base`;
    nodes.push(n(anchorId, ZONE_X + 8, cy, '', { shape: 'slot', w: 18, h: 30 }));

    cells.forEach((cell, index) => {
      nodes.push(
        n(cell.id, ZONE_X + 52 + index * gap, cy, `${cell.value}`, {
          shape: 'box',
          w: 46,
          h: 32,
          sub: kind === 'fila' ? (index === 0 ? 'frente' : index === cells.length - 1 ? 'trás' : undefined) : undefined,
        }),
      );
      edges.push(e(index === 0 ? anchorId : cells[index - 1].id, cell.id, { arrow: kind === 'lista' }));
    });

    return { nodes, edges, anchorId, searchOrder: [...cells] };
  }

  if (kind === 'pilha') {
    const anchorId = `a${area}-base`;
    nodes.push(n(anchorId, ZONE_X + 34, cy + 36, '', { shape: 'slot', w: 60, h: 12 }));

    cells.forEach((cell, index) => {
      nodes.push(
        n(cell.id, ZONE_X + 34, cy + 14 - index * 34, `${cell.value}`, {
          shape: 'box',
          w: 52,
          h: 30,
          sub: index === cells.length - 1 ? 'topo' : undefined,
        }),
      );
    });

    return { nodes, edges, anchorId, searchOrder: [...cells].reverse() };
  }

  if (kind === 'tabela') {
    const anchorId = `a${area}t0`;

    for (let m = 0; m < 3; m += 1) {
      nodes.push(n(`a${area}t${m}`, ZONE_X + 34, cy - 38 + m * 38, '', { shape: 'slot', w: 62, h: 34, sub: `${m}` }));
    }

    const searchOrder: DoidonaCell[] = [];
    const bySlot = tabelaSlots(cells);
    bySlot.forEach((cell, slot) => {
      if (!cell) return;
      nodes.push(n(cell.id, ZONE_X + 34, cy - 38 + slot * 38, `${cell.value}`, { shape: 'box', w: 52, h: 28 }));
      searchOrder.push(cell);
    });

    return { nodes, edges, anchorId, searchOrder };
  }

  // Árvore (ABB pequena) montada pela ordem de inserção das células.
  const rootX = ZONE_X + 64;

  if (!cells.length) {
    nodes.push(n(`a${area}-base`, rootX, cy, '∅', { shape: 'pill', w: 44, h: 28 }));
    return { nodes, edges, anchorId: `a${area}-base`, searchOrder: [] };
  }

  type Mini = { cell: DoidonaCell; left?: Mini; right?: Mini };
  let root: Mini | undefined;

  for (const cell of cells) {
    if (!root) {
      root = { cell };
      continue;
    }
    let cursor = root;
    for (;;) {
      if (cell.value < cursor.cell.value) {
        if (!cursor.left) {
          cursor.left = { cell };
          break;
        }
        cursor = cursor.left;
      } else {
        if (!cursor.right) {
          cursor.right = { cell };
          break;
        }
        cursor = cursor.right;
      }
    }
  }

  const searchOrder: DoidonaCell[] = [];

  (function place(node: Mini, x: number, y: number, spread: number) {
    nodes.push(n(node.cell.id, x, y, `${node.cell.value}`, { shape: 'circle' }));
    if (node.left) {
      edges.push(e(node.cell.id, node.left.cell.id));
      place(node.left, x - spread, y + 42, spread / 2);
    }
    if (node.right) {
      edges.push(e(node.cell.id, node.right.cell.id));
      place(node.right, x + spread, y + 42, spread / 2);
    }
  })(root!, rootX, cy - 34, 44);

  return { nodes, edges, anchorId: cells[0].id, searchOrder };
}

/** Distribui células da T3 nos 3 slots por hashT3 + um rehash linear. */
function tabelaSlots(cells: DoidonaCell[]): Array<DoidonaCell | null> {
  const slots: Array<DoidonaCell | null> = [null, null, null];

  for (const cell of cells) {
    let slot = cell.value % 3;
    if (slots[slot]) slot = (cell.value + 1) % 3;
    if (slots[slot]) continue;
    slots[slot] = cell;
  }

  return slots;
}

function renderDoidona(state: DoidonaState, marks: Marks, extraNodes: VizNode[] = []): { nodes: VizNode[]; edges: VizEdge[] } {
  const nodes: VizNode[] = [];
  const edges: VizEdge[] = [];

  nodes.push(n('lbl-t1', T1_X, 24, 'T1 · hash', { shape: 'pill', w: 84, h: 24, state: 'muted' }));

  state.t1.forEach((cell, i) => {
    nodes.push(n(`t1-${i}`, T1_X, t1Y(i), '', { shape: 'slot', w: SLOT_W, h: SLOT_H }));
    nodes.push(n(`t1idx-${i}`, T1_X - SLOT_W / 2 - 16, t1Y(i), `${i}`, { shape: 'pill', w: 22, h: 20, state: 'muted' }));
    if (cell) {
      nodes.push(n(cell.id, T1_X, t1Y(i), `${cell.value}`, { shape: 'box', w: 62, h: 28 }));
    }
  });

  nodes.push(n('lbl-t2', T1_X, 240, 'T2 · reserva', { shape: 'pill', w: 96, h: 24, state: 'muted' }));

  state.areas.forEach((area, k) => {
    nodes.push(n(`t2-${k}`, T1_X, t2Y(k), `R${k}`, { shape: 'slot', w: SLOT_W, h: SLOT_H }));

    const mini = renderMini(k, area.kind, area.cells);
    nodes.push(
      n(`a${k}-lbl`, 506, zoneCY(k), subLabel[area.kind], {
        shape: 'pill',
        w: Math.max(60, subLabel[area.kind].length * 8 + 22),
        h: 22,
        state: 'muted',
      }),
    );
    nodes.push(...mini.nodes);
    edges.push(e(`t2-${k}`, mini.anchorId, { arrow: true, dashed: true }));
    edges.push(...mini.edges);
  });

  nodes.push(...extraNodes);

  for (const node of nodes) {
    if (marks[node.id]) {
      node.state = marks[node.id];
    }
  }

  return { nodes, edges };
}

/* =====================================================================
   Código no estilo da matéria (DoidonaSemTADsProntas.java)
   ===================================================================== */

export function doidonaCode(op: DoidonaOpId, kinds: DoidonaConfig): string[] {
  const call = (verb: 'inserir' | 'pesquisar' | 'remover', kind: DoidonaSubKind, area: number) =>
    kind === 'arvore'
      ? `      raizR${area} = ${verb}Arvore(raizR${area}, x);`
      : `      ${verb}${methodName[kind]}R${area}(x);`;

  if (op === 'inserir') {
    return [
      'public void inserir(int x) {',
      '   int i = hashT1(x);            // x % 5',
      '   if (t1[i] == NULO) {',
      '      t1[i] = x;',
      '   } else if (hashT2(x) == 0) {  // x % 3',
      call('inserir', kinds[0], 0),
      '   } else if (hashT2(x) == 1) {',
      call('inserir', kinds[1], 1),
      '   } else {',
      call('inserir', kinds[2], 2),
      '   }',
      '}',
    ];
  }

  const verb = op === 'buscar' ? 'pesquisar' : 'remover';
  return [
    `public boolean ${verb}(int x) {`,
    '   int i = hashT1(x);            // x % 5',
    '   if (t1[i] == NULO) {',
    '      resp = false;              // nao esta',
    '   } else if (t1[i] == x) {',
    op === 'buscar' ? '      resp = true;' : '      t1[i] = NULO;              // remove de T1',
    '   } else if (hashT2(x) == 0) {  // x % 3',
    call(verb, kinds[0], 0),
    '   } else if (hashT2(x) == 1) {',
    call(verb, kinds[1], 1),
    '   } else {',
    call(verb, kinds[2], 2),
    '   }',
    '}',
  ];
}

/* =====================================================================
   Operações com estado persistente
   ===================================================================== */

type OpContext = {
  state: DoidonaState;
  frames: VizFrame[];
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

function areaMarks(area: number, state: VizNodeState): Marks {
  return { [`t2-${area}`]: state, [`a${area}-lbl`]: state };
}

const areaCodeLine = { route: [4, 6, 8], call: [5, 7, 9] };
const searchAreaCodeLine = { route: [6, 8, 10], call: [7, 9, 11] };

export function doidonaPreviewScene(state: DoidonaState, op: DoidonaOpId): VizScene {
  const ctx: OpContext = { state, frames: [] };
  const isEmpty = state.t1.every((cell) => !cell) && state.areas.every((area) => !area.cells.length);

  pushFrame(
    ctx,
    isEmpty
      ? 'Doidona vazia: T1 sem elementos e áreas de reserva limpas. Use as operações para construí-la.'
      : 'Estado atual da Doidona. Escolha uma operação e execute.',
    undefined,
    {},
  );

  return {
    operation: 'estado atual',
    complexity: 'O(1) + custo da área',
    code: doidonaCode(op, doidonaKinds(state)),
    frames: ctx.frames,
    width: WIDTH,
    height: HEIGHT,
  };
}

export function doidonaOpScene(
  previous: DoidonaState,
  op: DoidonaOpId,
  rawValue: number,
): { scene: VizScene; next: DoidonaState } {
  const state = cloneState(previous);
  const value = Number.isFinite(rawValue) ? Math.abs(Math.trunc(rawValue)) : 20;
  const pos = value % T1_SIZE;
  const area = value % AREAS;
  const kinds = doidonaKinds(state);
  const kind = kinds[area];
  const code = doidonaCode(op, kinds);
  const lines = op === 'inserir' ? areaCodeLine : searchAreaCodeLine;

  const ctx: OpContext = { state, frames: [] };
  const vars: VizVar[] = [{ name: 'x', value: `${value}` }];
  const finish = (): { scene: VizScene; next: DoidonaState } => ({
    scene: {
      operation: `${op}(${value})`,
      complexity: 'O(1) + custo da área',
      code,
      frames: ctx.frames,
      width: WIDTH,
      height: HEIGHT,
    },
    next: state,
  });

  const staging = n('incoming', 330, 24, `${value}`, { shape: 'pill', w: 52, h: 30, state: 'active' });
  pushFrame(ctx, `${op}(${value}): a chave chega para ser roteada.`, 0, {}, vars, [staging]);
  pushFrame(ctx, `i = hashT1(${value}) = ${value} % 5 = ${pos}.`, 1, { [`t1-${pos}`]: 'compare', [`t1idx-${pos}`]: 'compare' }, [
    ...vars,
    { name: 'i', value: `${pos}` },
  ], [staging]);

  const occupant = state.t1[pos];

  if (op === 'inserir') {
    if (occupant && occupant.value === value) {
      pushFrame(ctx, `t1[${pos}] já guarda ${value}: elemento repetido → Erro de Insercao (regra da matéria).`, 2, {
        [occupant.id]: 'error',
      }, [...vars, { name: 'resultado', value: 'erro' }], [{ ...staging, state: 'error' }]);
      return finish();
    }

    if (!occupant) {
      const cell: DoidonaCell = { id: `d${(state.seq += 1)}`, value };
      state.t1[pos] = cell;
      pushFrame(ctx, `t1[${pos}] == NULO: ${value} entra direto na tabela principal.`, 3, { [cell.id]: 'inserted' }, [
        ...vars,
        { name: 'i', value: `${pos}` },
      ]);
      pushFrame(ctx, 'Inserção direta em T1: custo O(1).', 3, { [cell.id]: 'found' });
      return finish();
    }

    pushFrame(ctx, `Colisão! t1[${pos}] guarda ${occupant.value}. hashT2(${value}) = ${value} % 3 = ${area}.`, lines.route[area], {
      [occupant.id]: 'compare',
      ...areaMarks(area, 'compare'),
    }, [...vars, { name: 'hashT2(x)', value: `${area}` }], [staging]);

    const result = subInsert(ctx, state, area, kind, value, lines.call[area], vars, staging, occupant.id);
    if (!result) return finish();

    pushFrame(ctx, `Inserção concluída: T1 continua O(1) e a colisão vive na ${subLabel[kind]} de R${area}.`, lines.call[area], {
      [occupant.id]: 'visited',
      ...areaMarks(area, 'found'),
      [result.id]: 'found',
    });
    return finish();
  }

  // buscar / remover
  if (!occupant) {
    pushFrame(ctx, `t1[${pos}] == NULO: se ${value} existisse, estaria aqui → não está na estrutura.`, 3, {
      [`t1-${pos}`]: 'error',
      [`t1idx-${pos}`]: 'error',
    }, [...vars, { name: 'resp', value: 'false' }], [{ ...staging, state: 'error' }]);
    return finish();
  }

  if (occupant.value === value) {
    pushFrame(ctx, `t1[${pos}] == ${value}: resolvido direto na tabela principal.`, op === 'buscar' ? 5 : 5, {
      [occupant.id]: 'found',
    }, [...vars, { name: 'resp', value: 'true' }]);

    if (op === 'remover') {
      pushFrame(ctx, `${value} sai de T1[${pos}]; a posição volta a ser NULO.`, 5, { [occupant.id]: 'removed' });
      state.t1[pos] = null;
      pushFrame(ctx, 'Remoção concluída sem tocar na reserva.', 5, { [`t1-${pos}`]: 'found' });
    }
    return finish();
  }

  pushFrame(ctx, `t1[${pos}] = ${occupant.value} ≠ ${value}: pode estar na reserva. hashT2(${value}) = ${area}.`, lines.route[area], {
    [occupant.id]: 'compare',
    ...areaMarks(area, 'compare'),
  }, [...vars, { name: 'hashT2(x)', value: `${area}` }], [staging]);

  const baseMarks: Marks = { [occupant.id]: 'visited', ...areaMarks(area, 'visited') };
  const found = subSearch(ctx, state, area, kind, value, lines.call[area], baseMarks);

  if (!found) return finish();

  if (op === 'buscar') {
    pushFrame(ctx, `Busca concluída: caminho T1[${pos}] → T2[R${area}] → ${subLabel[kind]}.`, lines.call[area], {
      ...baseMarks,
      [found.id]: 'found',
    }, [{ name: 'resp', value: 'true' }]);
    return finish();
  }

  subRemove(ctx, state, area, kind, found, lines.call[area], baseMarks);
  return finish();
}

/* ---------- inserção nas subestruturas (regras próprias) ---------- */

function subInsert(
  ctx: OpContext,
  state: DoidonaState,
  area: number,
  kind: DoidonaSubKind,
  value: number,
  codeLine: number,
  vars: VizVar[],
  staging: VizNode,
  occupantId: string,
): DoidonaCell | null {
  const cells = state.areas[area].cells;
  const base: Marks = { [occupantId]: 'visited', ...areaMarks(area, 'compare') };

  if (kind === 'arvore' || kind === 'tabela') {
    if (cells.some((cell) => cell.value === value)) {
      const dup = cells.find((cell) => cell.value === value)!;
      pushFrame(ctx, `${value} já existe na ${subLabel[kind]}: Erro de Insercao (${kind === 'arvore' ? 'ABB não repete' : 'tabela não repete'}).`, codeLine, {
        ...base,
        [dup.id]: 'error',
      }, [...vars, { name: 'resultado', value: 'erro' }], [{ ...staging, state: 'error' }]);
      return null;
    }
  }

  if (kind === 'tabela') {
    const slots = tabelaSlots(cells);
    const h3 = value % 3;
    const re = (value + 1) % 3;

    pushFrame(ctx, `hashT3(${value}) = ${value} % 3 = ${h3}.`, codeLine, {
      ...base,
      [`a${area}t${h3}`]: 'compare',
    }, [...vars, { name: 'hashT3', value: `${h3}` }], [staging]);

    let slot = h3;
    if (slots[h3]) {
      pushFrame(ctx, `T3[${h3}] ocupada por ${slots[h3]!.value} → rehashT3: (${value} + 1) % 3 = ${re}.`, codeLine, {
        ...base,
        [slots[h3]!.id]: 'compare',
        [`a${area}t${re}`]: 'compare',
      }, [...vars, { name: 'rehashT3', value: `${re}` }], [staging]);
      slot = re;
    }

    if (slots[slot]) {
      pushFrame(ctx, `T3[${slot}] também ocupada: na matéria o excedente iria para a árvore de T3. Aqui a inserção para.`, codeLine, {
        ...base,
        [slots[slot]!.id]: 'error',
      }, [...vars, { name: 'resultado', value: 'erro' }], [{ ...staging, state: 'error' }]);
      return null;
    }

    const cell: DoidonaCell = { id: `d${(state.seq += 1)}`, value };
    cells.push(cell);
    pushFrame(ctx, `${value} entra em T3[${slot}].`, codeLine, { ...base, [cell.id]: 'inserted' }, vars);
    return cell;
  }

  if (cells.length >= subCapacity[kind]) {
    pushFrame(ctx, `A ${subLabel[kind]} de R${area} está cheia (limite didático): inserção não realizada.`, codeLine, {
      ...base,
      ...areaMarks(area, 'error'),
    }, [...vars, { name: 'resultado', value: 'erro' }], [{ ...staging, state: 'error' }]);
    return null;
  }

  const cell: DoidonaCell = { id: `d${(state.seq += 1)}`, value };
  cells.push(cell);

  const captions: Record<DoidonaSubKind, string> = {
    lista: `${value} entra no FIM da lista (ultimo.prox = new Celula(${value})). Repetidos são permitidos aqui.`,
    pilha: `${value} entra pelo TOPO da pilha (LIFO).`,
    fila: `${value} entra por TRÁS da fila (FIFO).`,
    arvore: `${value} desce comparando e vira folha da ABB.`,
    tabela: '',
  };

  pushFrame(ctx, captions[kind], codeLine, { ...base, [cell.id]: 'inserted' }, vars);
  return cell;
}

/* ---------- busca nas subestruturas ---------- */

function subSearch(
  ctx: OpContext,
  state: DoidonaState,
  area: number,
  kind: DoidonaSubKind,
  value: number,
  codeLine: number,
  baseMarks: Marks,
): DoidonaCell | null {
  const cells = state.areas[area].cells;
  const mini = renderMini(area, kind, cells);
  const visited: Marks = {};

  if (kind === 'arvore') {
    // Descida real de ABB.
    type Mini = { cell: DoidonaCell; left?: Mini; right?: Mini };
    let root: Mini | undefined;
    for (const cell of cells) {
      if (!root) {
        root = { cell };
        continue;
      }
      let cursor = root;
      for (;;) {
        if (cell.value < cursor.cell.value) {
          if (!cursor.left) {
            cursor.left = { cell };
            break;
          }
          cursor = cursor.left;
        } else {
          if (!cursor.right) {
            cursor.right = { cell };
            break;
          }
          cursor = cursor.right;
        }
      }
    }

    let cursor = root;
    while (cursor) {
      const marks = { ...baseMarks, ...visited, [cursor.cell.id]: 'compare' as VizNodeState };
      if (cursor.cell.value === value) {
        pushFrame(ctx, `${value} == ${cursor.cell.value}: encontrado na árvore de R${area}.`, codeLine, { ...marks, [cursor.cell.id]: 'found' }, [
          { name: 'resp', value: 'true' },
        ]);
        return cursor.cell;
      }
      pushFrame(ctx, `${value} ${value < cursor.cell.value ? '<' : '>'} ${cursor.cell.value} → desce para a ${value < cursor.cell.value ? 'esquerda' : 'direita'}.`, codeLine, marks);
      visited[cursor.cell.id] = 'visited';
      cursor = value < cursor.cell.value ? cursor.left : cursor.right;
    }

    pushFrame(ctx, `Ponteiro nulo na árvore: ${value} não está. Só agora se conclui ausência.`, codeLine, { ...baseMarks, ...visited, [`a${area}-lbl`]: 'error' }, [
      { name: 'resp', value: 'false' },
    ]);
    return null;
  }

  if (kind === 'tabela') {
    const slots = tabelaSlots(cells);
    const h3 = value % 3;
    const re = (value + 1) % 3;

    for (const slot of h3 === re ? [h3] : [h3, re]) {
      const cell = slots[slot];
      const marks = { ...baseMarks, ...visited, [`a${area}t${slot}`]: 'compare' as VizNodeState };

      if (!cell) {
        pushFrame(ctx, `T3[${slot}] == NULO: ${value} não está na T3.`, codeLine, { ...marks, [`a${area}t${slot}`]: 'error' }, [{ name: 'resp', value: 'false' }]);
        return null;
      }

      if (cell.value === value) {
        pushFrame(ctx, `T3[${slot}] == ${value}: encontrado.`, codeLine, { ...marks, [cell.id]: 'found' }, [{ name: 'resp', value: 'true' }]);
        return cell;
      }

      pushFrame(ctx, slot === h3 ? `T3[${slot}] = ${cell.value} ≠ ${value} → tenta o rehash.` : `T3[${slot}] = ${cell.value} ≠ ${value}.`, codeLine, marks);
      visited[cell.id] = 'visited';
    }

    pushFrame(ctx, `hash e rehash falharam: ${value} não está na T3.`, codeLine, { ...baseMarks, ...visited, [`a${area}-lbl`]: 'error' }, [
      { name: 'resp', value: 'false' },
    ]);
    return null;
  }

  // lista, pilha e fila: percurso sequencial.
  for (const cell of mini.searchOrder) {
    const marks = { ...baseMarks, ...visited, [cell.id]: 'compare' as VizNodeState };

    if (cell.value === value) {
      pushFrame(ctx, `Compara com ${cell.value}: encontrado na ${subLabel[kind]}.`, codeLine, { ...marks, [cell.id]: 'found' }, [
        { name: 'resp', value: 'true' },
      ]);
      return cell;
    }

    pushFrame(ctx, `Compara com ${cell.value}: diferente → segue o percurso.`, codeLine, marks);
    visited[cell.id] = 'visited';
  }

  pushFrame(ctx, `Percorreu toda a ${subLabel[kind]} sem achar ${value}. Só agora pode concluir ausência.`, codeLine, {
    ...baseMarks,
    ...visited,
    [`a${area}-lbl`]: 'error',
  }, [{ name: 'resp', value: 'false' }]);
  return null;
}

/* ---------- remoção nas subestruturas (regras próprias) ---------- */

function subRemove(
  ctx: OpContext,
  state: DoidonaState,
  area: number,
  kind: DoidonaSubKind,
  target: DoidonaCell,
  codeLine: number,
  baseMarks: Marks,
) {
  const cells = state.areas[area].cells;

  if (kind === 'pilha' && cells[cells.length - 1]?.id !== target.id) {
    pushFrame(ctx, `${target.value} não está no TOPO: pilha só remove pelo topo → operação inválida.`, codeLine, {
      ...baseMarks,
      [target.id]: 'error',
    }, [{ name: 'resultado', value: 'erro' }]);
    return;
  }

  if (kind === 'fila' && cells[0]?.id !== target.id) {
    pushFrame(ctx, `${target.value} não está na FRENTE: fila só remove pela frente → operação inválida.`, codeLine, {
      ...baseMarks,
      [target.id]: 'error',
    }, [{ name: 'resultado', value: 'erro' }]);
    return;
  }

  pushFrame(ctx, `${target.value} sai da ${subLabel[kind]} de R${area}.`, codeLine, { ...baseMarks, [target.id]: 'removed' });

  if (kind === 'arvore') {
    // Remove e reordena as células em pré-ordem da árvore resultante,
    // para que a reconstrução reproduza a remoção real da ABB.
    state.areas[area].cells = removeFromMiniBst(cells, target.value);
  } else {
    state.areas[area].cells = cells.filter((cell) => cell.id !== target.id);
  }

  pushFrame(ctx, 'A subestrutura se reorganiza; T1 e T2 não mudam.', codeLine, { ...baseMarks, [`a${area}-lbl`]: 'found' }, [
    { name: 'resp', value: 'true' },
  ]);
}

function removeFromMiniBst(cells: DoidonaCell[], value: number): DoidonaCell[] {
  type Mini = { cell: DoidonaCell; left?: Mini; right?: Mini };
  let root: Mini | undefined;

  const insert = (node: Mini | undefined, cell: DoidonaCell): Mini => {
    if (!node) return { cell };
    if (cell.value < node.cell.value) node.left = insert(node.left, cell);
    else node.right = insert(node.right, cell);
    return node;
  };

  for (const cell of cells) root = insert(root, cell);

  const remove = (node: Mini | undefined, key: number): Mini | undefined => {
    if (!node) return undefined;
    if (key < node.cell.value) {
      node.left = remove(node.left, key);
    } else if (key > node.cell.value) {
      node.right = remove(node.right, key);
    } else if (!node.right) {
      return node.left;
    } else if (!node.left) {
      return node.right;
    } else {
      let pred = node.left;
      while (pred.right) pred = pred.right;
      node.cell = pred.cell;
      node.left = remove(node.left, pred.cell.value);
    }
    return node;
  };

  root = remove(root, value);

  const out: DoidonaCell[] = [];
  (function pre(node?: Mini) {
    if (!node) return;
    out.push(node.cell);
    pre(node.left);
    pre(node.right);
  })(root);

  return out;
}

/* =====================================================================
   Compatibilidade com as cenas das questões (scenes.ts)
   ===================================================================== */

export function doidonaScene(op: DoidonaOpId, value: number, config: DoidonaConfig): VizScene {
  return doidonaOpScene(initialDoidonaState(config), op, value).scene;
}
