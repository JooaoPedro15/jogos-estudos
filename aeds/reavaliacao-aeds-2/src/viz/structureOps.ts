import { avlToViz, balance, insertPlain, rebalance, type AvlNode } from './avlModel';
import {
  defaultDoidonaConfig,
  doidonaOpScene,
  doidonaPreviewScene,
  emptyDoidonaState,
  initialDoidonaState,
  type DoidonaConfig,
  type DoidonaOpId,
  type DoidonaState,
} from './doidona';
import { buildLevelOrderTree, e, layoutTree, n, p, snap, type TreeNode } from './sceneUtils';
import type { VizEdge, VizFrame, VizNode, VizNodeState, VizPointer, VizScene, VizVar } from './vizTypes';

/* =====================================================================
   Operações interativas com ESTADO PERSISTENTE.
   O código exibido segue os fontes oficiais da matéria (Max do Val):
   pilha/fila/lista sequenciais e flexíveis, hashDiretoReserva,
   ArvoreBinaria, AVL (balancear) e ArvoreTrie.
   ===================================================================== */

export type Cell = { id: string; value: number };

export type OpInput = { kind: 'number' | 'text'; label: string; sample: string };

export type OpResult = { scene: VizScene; next: unknown };

export type StructureOp = {
  id: string;
  label: string;
  input?: OpInput;
  run: (state: unknown, raw: string) => OpResult;
};

export type StructureEntry = {
  id: string;
  name: string;
  blurb: string;
  configurable?: boolean;
  initial: () => unknown;
  empty: () => unknown;
  preview: (state: unknown, opId: string) => VizScene;
  ops: StructureOp[];
};

function parseNumber(raw: string, fallback: number): number {
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? Math.min(999, Math.max(0, value)) : fallback;
}

function parseWord(raw: string, fallback: string): string {
  const word = raw
    .toLowerCase()
    .replace(/[^a-zà-ú]/g, '')
    .slice(0, 7);
  return word || fallback;
}

function previewFrame(
  nodes: VizNode[],
  edges: VizEdge[],
  pointers: VizPointer[],
  caption: string,
): VizFrame {
  return snap(nodes, edges, pointers, caption, undefined);
}

const stateCaption = (empty: boolean, nome: string) =>
  empty
    ? `${nome} vazia. Use as operações para construí-la do zero.`
    : `Estado atual da ${nome}. Escolha uma operação e execute.`;

/* =====================================================================
   PILHA SEQUENCIAL — array + n (unidade02b)
   ===================================================================== */

type StackState = { cells: Cell[]; seq: number };

const STACK_CAP = 5;
const STACK_X = 230;
const stackSlotY = (index: number) => 258 - index * 48;

const stackInsertCode = [
  'public void inserir(int x) {',
  '   if (n >= array.length) {',
  '      // erro: pilha cheia!',
  '   }',
  '   array[n] = x;',
  '   n++;',
  '}',
];

const stackRemoveCode = [
  'public int remover() {',
  '   if (n == 0) {',
  '      // erro: pilha vazia!',
  '   }',
  '   n--;',
  '   return array[n];',
  '}',
];

const stackPeekCode = [
  'public int topo() {',
  '   if (n == 0) {',
  '      // erro: pilha vazia!',
  '   }',
  '   return array[n - 1];   // nao remove',
  '}',
];

function stackCodeFor(opId: string): string[] {
  return opId === 'inserir' ? stackInsertCode : opId === 'remover' ? stackRemoveCode : stackPeekCode;
}

function stackRender(state: StackState, marks: Record<string, VizNodeState> = {}): { nodes: VizNode[]; pointers: VizPointer[] } {
  const nodes: VizNode[] = [];

  for (let index = 0; index < STACK_CAP; index += 1) {
    nodes.push(n(`slot${index}`, STACK_X, stackSlotY(index), '', { shape: 'slot', w: 96, h: 42, sub: `${index}` }));
  }

  state.cells.forEach((cell, index) => {
    nodes.push(n(cell.id, STACK_X, stackSlotY(index), `${cell.value}`, { shape: 'box', w: 88, h: 36, state: marks[cell.id] ?? 'default' }));
  });

  const pointers = state.cells.length
    ? [p(`slot${state.cells.length - 1}`, 'TOPO', 'right', 'primary')]
    : [];

  return { nodes, pointers };
}

function stackScene(frames: VizFrame[], code: string[], operation: string): VizScene {
  return { operation, complexity: 'O(1)', code, frames, width: 460, height: 310 };
}

function stackInsert(previous: StackState, raw: string): OpResult {
  const state: StackState = structuredClone(previous);
  const value = parseNumber(raw, 7);
  const frames: VizFrame[] = [];
  const push = (caption: string, codeLine?: number, vars?: VizVar[], extra: VizNode[] = [], marks: Record<string, VizNodeState> = {}) => {
    const { nodes, pointers } = stackRender(state, marks);
    frames.push(snap([...nodes, ...extra], [], pointers, caption, codeLine, vars));
  };

  const nVar = (): VizVar => ({ name: 'n', value: `${state.cells.length}` });

  if (state.cells.length >= STACK_CAP) {
    push(`inserir(${value}): n = ${state.cells.length} = array.length → pilha cheia.`, 1, [{ name: 'x', value: `${value}` }, nVar()]);
    push('Erro ao inserir! A pilha sequencial não cresce além do array.', 2, [{ name: 'resultado', value: 'erro' }]);
    return { scene: stackScene(frames, stackInsertCode, `inserir(${value})`), next: state };
  }

  const novo = n('staging', 390, 88, `${value}`, { shape: 'box', w: 88, h: 36, state: 'inserted' });
  push(`inserir(${value}): duplicatas são permitidas na pilha.`, 0, [{ name: 'x', value: `${value}` }, nVar()], [novo]);
  push(`n = ${state.cells.length} < array.length: há espaço.`, 1, [nVar()], [novo]);

  const cell: Cell = { id: `s${(state.seq += 1)}`, value };
  state.cells.push(cell);
  push(`array[${state.cells.length - 1}] = ${value}: o elemento ocupa o topo.`, 4, [nVar()], [], { [cell.id]: 'inserted' });
  push(`n++ → TOPO agora é a posição ${state.cells.length - 1}. Custo O(1).`, 5, [nVar()], [], { [cell.id]: 'found' });

  return { scene: stackScene(frames, stackInsertCode, `inserir(${value})`), next: state };
}

function stackRemove(previous: StackState): OpResult {
  const state: StackState = structuredClone(previous);
  const frames: VizFrame[] = [];
  const push = (caption: string, codeLine?: number, vars?: VizVar[], marks: Record<string, VizNodeState> = {}, extra: VizNode[] = []) => {
    const { nodes, pointers } = stackRender(state, marks);
    frames.push(snap([...nodes, ...extra], [], pointers, caption, codeLine, vars));
  };

  if (!state.cells.length) {
    push('remover(): n = 0 → pilha vazia.', 1, [{ name: 'n', value: '0' }]);
    push('Erro ao remover! Não há elemento para retirar.', 2, [{ name: 'resultado', value: 'erro' }]);
    return { scene: stackScene(frames, stackRemoveCode, 'remover()'), next: state };
  }

  const topo = state.cells[state.cells.length - 1];
  push('remover(): o pop atua sempre no elemento do topo.', 1, [{ name: 'n', value: `${state.cells.length}` }]);
  push(`n-- e lê array[${state.cells.length - 1}] = ${topo.value}.`, 4, [{ name: 'resp', value: `${topo.value}` }], { [topo.id]: 'active' });

  state.cells.pop();
  const saindo = n(topo.id, 390, 88, `${topo.value}`, { shape: 'box', w: 88, h: 36, state: 'removed' });
  push(`${topo.value} sai pelo topo. Custo O(1).`, 5, [{ name: 'resp', value: `${topo.value}` }, { name: 'n', value: `${state.cells.length}` }], {}, [saindo]);
  push(state.cells.length ? `TOPO recua para a posição ${state.cells.length - 1}.` : 'A pilha ficou vazia (n = 0).', 5, [{ name: 'n', value: `${state.cells.length}` }]);

  return { scene: stackScene(frames, stackRemoveCode, 'remover()'), next: state };
}

function stackPeek(previous: StackState): OpResult {
  const state: StackState = structuredClone(previous);
  const frames: VizFrame[] = [];
  const push = (caption: string, codeLine?: number, vars?: VizVar[], marks: Record<string, VizNodeState> = {}) => {
    const { nodes, pointers } = stackRender(state, marks);
    frames.push(snap(nodes, [], pointers, caption, codeLine, vars));
  };

  if (!state.cells.length) {
    push('topo(): n = 0 → pilha vazia.', 1, [{ name: 'n', value: '0' }]);
    push('Erro! Não há topo para consultar.', 2, [{ name: 'resultado', value: 'erro' }]);
    return { scene: stackScene(frames, stackPeekCode, 'consultar topo'), next: state };
  }

  const topo = state.cells[state.cells.length - 1];
  push('Consultar topo: apenas lê, sem alterar a pilha.', 1, [{ name: 'n', value: `${state.cells.length}` }]);
  push(`array[n - 1] = ${topo.value}: acesso direto, nenhuma busca.`, 4, [{ name: 'retorno', value: `${topo.value}` }], { [topo.id]: 'compare' });
  push(`Resultado: ${topo.value}. A pilha continua igual.`, 4, [{ name: 'retorno', value: `${topo.value}` }], { [topo.id]: 'found' });

  return { scene: stackScene(frames, stackPeekCode, 'consultar topo'), next: state };
}

/* =====================================================================
   FILA EM FILEIRA — frente/tras sem módulo (unidade02c, antes da circular)
   ===================================================================== */

type QueueState = { cells: Array<Cell & { slot: number }>; primeiro: number; ultimo: number; seq: number };

const QUEUE_CAP = 5;
const QUEUE_Y = 168;
const queueSlotX = (index: number) => 70 + index * 82;

const queueInsertCode = [
  'public void inserir(int x) {',
  '   if (ultimo >= array.length) {',
  '      // erro: fila cheia!',
  '   }',
  '   array[ultimo] = x;',
  '   ultimo++;',
  '}',
];

const queueRemoveCode = [
  'public int remover() {',
  '   if (primeiro == ultimo) {',
  '      // erro: fila vazia!',
  '   }',
  '   int resp = array[primeiro];',
  '   primeiro++;',
  '   return resp;',
  '}',
];

const queuePeekCode = [
  'public int frente() {',
  '   if (primeiro == ultimo) {',
  '      // erro: fila vazia!',
  '   }',
  '   return array[primeiro];   // nao remove',
  '}',
];

function queueCodeFor(opId: string): string[] {
  return opId === 'enfileirar' ? queueInsertCode : opId === 'desenfileirar' ? queueRemoveCode : queuePeekCode;
}

function queueRender(state: QueueState, marks: Record<string, VizNodeState> = {}): { nodes: VizNode[]; pointers: VizPointer[] } {
  const nodes: VizNode[] = [];

  for (let index = 0; index < QUEUE_CAP; index += 1) {
    nodes.push(n(`slot${index}`, queueSlotX(index), QUEUE_Y, '', { shape: 'slot', w: 72, h: 46, sub: `${index}` }));
  }

  for (const cell of state.cells) {
    nodes.push(n(cell.id, queueSlotX(cell.slot), QUEUE_Y, `${cell.value}`, { shape: 'box', w: 64, h: 40, state: marks[cell.id] ?? 'default' }));
  }

  const pointers = [
    p(`slot${Math.min(state.primeiro, QUEUE_CAP - 1)}`, 'FRENTE', 'top', 'accent'),
    p(`slot${Math.min(state.ultimo, QUEUE_CAP - 1)}`, 'TRÁS', 'bottom', 'primary'),
  ];

  return { nodes, pointers };
}

function queueScene(frames: VizFrame[], code: string[], operation: string): VizScene {
  return { operation, complexity: 'O(1)', code, frames, width: 460, height: 260 };
}

function queueInsert(previous: QueueState, raw: string): OpResult {
  const state: QueueState = structuredClone(previous);
  const value = parseNumber(raw, 2);
  const frames: VizFrame[] = [];
  const push = (caption: string, codeLine?: number, vars?: VizVar[], extra: VizNode[] = [], marks: Record<string, VizNodeState> = {}) => {
    const { nodes, pointers } = queueRender(state, marks);
    frames.push(snap([...nodes, ...extra], [], pointers, caption, codeLine, vars));
  };

  const ptrVars = (): VizVar[] => [
    { name: 'primeiro', value: `${state.primeiro}` },
    { name: 'ultimo', value: `${state.ultimo}` },
  ];

  if (state.ultimo >= QUEUE_CAP) {
    push(`inserir(${value}): ultimo = ${state.ultimo} = array.length → fila cheia.`, 1, [{ name: 'x', value: `${value}` }, ...ptrVars()]);
    push(
      state.primeiro > 0
        ? 'Erro ao inserir! Há espaço livre no início, mas a fila em fileira NÃO reaproveita — é isso que a fila circular resolve.'
        : 'Erro ao inserir! O array está completamente ocupado.',
      2,
      [{ name: 'resultado', value: 'erro' }],
    );
    return { scene: queueScene(frames, queueInsertCode, `inserir(${value})`), next: state };
  }

  const novo = n('staging', 400, 70, `${value}`, { shape: 'box', w: 64, h: 40, state: 'inserted' });
  push(`inserir(${value}): duplicatas são permitidas na fila.`, 1, [{ name: 'x', value: `${value}` }, ...ptrVars()], [novo]);

  const cell = { id: `q${(state.seq += 1)}`, value, slot: state.ultimo };
  state.cells.push(cell);
  push(`array[${cell.slot}] = ${value}: o elemento entra por trás.`, 4, ptrVars(), [], { [cell.id]: 'inserted' });

  state.ultimo += 1;
  push(`ultimo++ → ${state.ultimo}. Inserção O(1).`, 5, ptrVars(), [], { [cell.id]: 'found' });

  return { scene: queueScene(frames, queueInsertCode, `inserir(${value})`), next: state };
}

function queueRemove(previous: QueueState): OpResult {
  const state: QueueState = structuredClone(previous);
  const frames: VizFrame[] = [];
  const push = (caption: string, codeLine?: number, vars?: VizVar[], marks: Record<string, VizNodeState> = {}, extra: VizNode[] = []) => {
    const { nodes, pointers } = queueRender(state, marks);
    frames.push(snap([...nodes, ...extra], [], pointers, caption, codeLine, vars));
  };

  if (state.primeiro === state.ultimo) {
    push('remover(): primeiro == ultimo → fila vazia.', 1, [{ name: 'primeiro', value: `${state.primeiro}` }, { name: 'ultimo', value: `${state.ultimo}` }]);
    push('Erro ao remover! Não há elemento na frente.', 2, [{ name: 'resultado', value: 'erro' }]);
    return { scene: queueScene(frames, queueRemoveCode, 'remover()'), next: state };
  }

  const alvo = state.cells.find((cell) => cell.slot === state.primeiro)!;
  push('remover(): a saída é sempre pela FRENTE (FIFO).', 1, [{ name: 'primeiro', value: `${state.primeiro}` }]);
  push(`resp = array[${state.primeiro}] = ${alvo.value}.`, 4, [{ name: 'resp', value: `${alvo.value}` }], { [alvo.id]: 'active' });

  state.cells = state.cells.filter((cell) => cell.id !== alvo.id);
  const saindo = n(alvo.id, 40, 70, `${alvo.value}`, { shape: 'box', w: 64, h: 40, state: 'removed' });
  state.primeiro += 1;
  push(`primeiro++ → ${state.primeiro}. ${alvo.value} saiu; ninguém foi copiado.`, 5, [{ name: 'primeiro', value: `${state.primeiro}` }], {}, [saindo]);
  push('A posição antiga fica inutilizada na fila em fileira.', 6, [{ name: 'resp', value: `${alvo.value}` }]);

  return { scene: queueScene(frames, queueRemoveCode, 'remover()'), next: state };
}

function queuePeek(previous: QueueState): OpResult {
  const state: QueueState = structuredClone(previous);
  const frames: VizFrame[] = [];
  const push = (caption: string, codeLine?: number, vars?: VizVar[], marks: Record<string, VizNodeState> = {}) => {
    const { nodes, pointers } = queueRender(state, marks);
    frames.push(snap(nodes, [], pointers, caption, codeLine, vars));
  };

  if (state.primeiro === state.ultimo) {
    push('frente(): primeiro == ultimo → fila vazia.', 1, []);
    push('Erro! Não há frente para consultar.', 2, [{ name: 'resultado', value: 'erro' }]);
    return { scene: queueScene(frames, queuePeekCode, 'consultar frente'), next: state };
  }

  const alvo = state.cells.find((cell) => cell.slot === state.primeiro)!;
  push('Consultar frente: lê o próximo a sair, sem removê-lo.', 1, [{ name: 'primeiro', value: `${state.primeiro}` }]);
  push(`array[primeiro] = ${alvo.value}: acesso direto.`, 4, [{ name: 'retorno', value: `${alvo.value}` }], { [alvo.id]: 'compare' });
  push(`Resultado: ${alvo.value}. A fila continua igual.`, 4, [{ name: 'retorno', value: `${alvo.value}` }], { [alvo.id]: 'found' });

  return { scene: queueScene(frames, queuePeekCode, 'consultar frente'), next: state };
}

/* =====================================================================
   FILA CIRCULAR — código do Fila.java (Max)
   ===================================================================== */

type RingState = { slots: Array<Cell | null>; primeiro: number; ultimo: number; seq: number };

const RING_TOTAL = 8;
const RING_CX = 230;
const RING_CY = 172;

const ringInsertCode = [
  'public void inserir(int x) {',
  '   if ((ultimo + 1) % array.length == primeiro) {',
  '      // erro: fila cheia!',
  '   }',
  '   array[ultimo] = x;',
  '   ultimo = (ultimo + 1) % array.length;',
  '}',
];

const ringRemoveCode = [
  'public int remover() {',
  '   if (primeiro == ultimo) {',
  '      // erro: fila vazia!',
  '   }',
  '   int resp = array[primeiro];',
  '   primeiro = (primeiro + 1) % array.length;',
  '   return resp;',
  '}',
];

function ringCodeFor(opId: string): string[] {
  return opId === 'enfileirar' ? ringInsertCode : ringRemoveCode;
}

function ringPos(index: number): { x: number; y: number } {
  const angle = ((index * 360) / RING_TOTAL - 90) * (Math.PI / 180);
  return { x: RING_CX + 108 * Math.cos(angle), y: RING_CY + 108 * Math.sin(angle) };
}

function ringRender(state: RingState, marks: Record<string, VizNodeState> = {}): { nodes: VizNode[]; pointers: VizPointer[] } {
  const nodes: VizNode[] = [];

  state.slots.forEach((cell, index) => {
    const at = ringPos(index);
    nodes.push(n(`slot${index}`, at.x, at.y, '', { shape: 'slot', w: 52, h: 40, sub: `${index}` }));
    if (cell) {
      nodes.push(n(cell.id, at.x, at.y, `${cell.value}`, { shape: 'box', w: 46, h: 34, state: marks[cell.id] ?? 'default' }));
    }
  });

  const side = (index: number): 'top' | 'bottom' => (index >= 2 && index <= 6 ? 'bottom' : 'top');
  const pointers = [
    p(`slot${state.primeiro}`, 'FRENTE', side(state.primeiro), 'accent'),
    p(`slot${state.ultimo}`, 'TRÁS', side(state.ultimo), 'primary'),
  ];

  return { nodes, pointers };
}

function ringScene(frames: VizFrame[], code: string[], operation: string): VizScene {
  return { operation, complexity: 'O(1)', code, frames, width: 460, height: 344 };
}

function ringInsert(previous: RingState, raw: string): OpResult {
  const state: RingState = structuredClone(previous);
  const value = parseNumber(raw, 9);
  const frames: VizFrame[] = [];
  const push = (caption: string, codeLine?: number, vars?: VizVar[], extra: VizNode[] = [], marks: Record<string, VizNodeState> = {}) => {
    const { nodes, pointers } = ringRender(state, marks);
    frames.push(snap([...nodes, ...extra], [], pointers, caption, codeLine, vars));
  };

  const ptrVars = (): VizVar[] => [
    { name: 'primeiro', value: `${state.primeiro}` },
    { name: 'ultimo', value: `${state.ultimo}` },
  ];

  if ((state.ultimo + 1) % RING_TOTAL === state.primeiro) {
    push(`inserir(${value}): (ultimo + 1) % ${RING_TOTAL} == primeiro → fila cheia.`, 1, [{ name: 'x', value: `${value}` }, ...ptrVars()]);
    push('Erro ao inserir! A circular sacrifica uma posição para diferenciar cheia de vazia.', 2, [{ name: 'resultado', value: 'erro' }]);
    return { scene: ringScene(frames, ringInsertCode, `inserir(${value})`), next: state };
  }

  const novo = n('staging', RING_CX, RING_CY, `${value}`, { shape: 'box', w: 46, h: 34, state: 'inserted' });
  push(`inserir(${value}): trás está no índice ${state.ultimo}.`, 1, [{ name: 'x', value: `${value}` }, ...ptrVars()], [novo]);

  const cell: Cell = { id: `c${(state.seq += 1)}`, value };
  state.slots[state.ultimo] = cell;
  push(`array[${state.ultimo}] = ${value}.`, 4, ptrVars(), [], { [cell.id]: 'inserted' });

  const anterior = state.ultimo;
  state.ultimo = (state.ultimo + 1) % RING_TOTAL;
  push(
    state.ultimo < anterior
      ? `ultimo = (${anterior} + 1) % ${RING_TOTAL} = ${state.ultimo}: o módulo dá a volta no vetor!`
      : `ultimo = (${anterior} + 1) % ${RING_TOTAL} = ${state.ultimo}.`,
    5,
    ptrVars(),
    [],
    { [cell.id]: 'found' },
  );

  return { scene: ringScene(frames, ringInsertCode, `inserir(${value})`), next: state };
}

function ringRemove(previous: RingState): OpResult {
  const state: RingState = structuredClone(previous);
  const frames: VizFrame[] = [];
  const push = (caption: string, codeLine?: number, vars?: VizVar[], marks: Record<string, VizNodeState> = {}, extra: VizNode[] = []) => {
    const { nodes, pointers } = ringRender(state, marks);
    frames.push(snap([...nodes, ...extra], [], pointers, caption, codeLine, vars));
  };

  if (state.primeiro === state.ultimo) {
    push('remover(): primeiro == ultimo → fila vazia.', 1, [{ name: 'primeiro', value: `${state.primeiro}` }]);
    push('Erro ao remover!', 2, [{ name: 'resultado', value: 'erro' }]);
    return { scene: ringScene(frames, ringRemoveCode, 'remover()'), next: state };
  }

  const alvo = state.slots[state.primeiro]!;
  push('remover(): a frente continua saindo primeiro, mesmo na circular.', 1, [{ name: 'primeiro', value: `${state.primeiro}` }]);
  push(`resp = array[${state.primeiro}] = ${alvo.value}.`, 4, [{ name: 'resp', value: `${alvo.value}` }], { [alvo.id]: 'active' });

  state.slots[state.primeiro] = null;
  const saindo = n(alvo.id, RING_CX, RING_CY, `${alvo.value}`, { shape: 'box', w: 46, h: 34, state: 'removed' });
  const anterior = state.primeiro;
  state.primeiro = (state.primeiro + 1) % RING_TOTAL;
  push(`primeiro = (${anterior} + 1) % ${RING_TOTAL} = ${state.primeiro}. Nada foi copiado: O(1).`, 5, [{ name: 'primeiro', value: `${state.primeiro}` }], {}, [saindo]);

  return { scene: ringScene(frames, ringRemoveCode, 'remover()'), next: state };
}

/* =====================================================================
   LISTA ENCADEADA ORDENADA — Celula/primeiro (unidade04d)
   ===================================================================== */

type ListState = { cells: Cell[]; seq: number };

const LIST_CAP = 7;
const LIST_Y = 150;

const listInsertCode = [
  'public void inserir(int x) {',
  '   Celula p = primeiro;',
  '   while (p.prox != null && p.prox.elemento < x) {',
  '      p = p.prox;',
  '   }',
  '   Celula tmp = new Celula(x);',
  '   tmp.prox = p.prox;',
  '   p.prox = tmp;',
  '}',
];

const listSearchCode = [
  'public boolean pesquisar(int x) {',
  '   Celula i = primeiro.prox;',
  '   while (i != null && i.elemento < x) {',
  '      i = i.prox;',
  '   }',
  '   return (i != null && i.elemento == x);',
  '}',
];

const listRemoveCode = [
  'public void remover(int x) {',
  '   Celula p = primeiro;',
  '   while (p.prox != null && p.prox.elemento != x) {',
  '      p = p.prox;',
  '   }',
  '   if (p.prox == null) {',
  '      // erro: nao encontrado!',
  '   }',
  '   p.prox = p.prox.prox;   // religa a corrente',
  '}',
];

function listCodeFor(opId: string): string[] {
  return opId === 'inserir' ? listInsertCode : opId === 'buscar' ? listSearchCode : listRemoveCode;
}

function listRender(state: ListState, marks: Record<string, VizNodeState> = {}, extra: VizNode[] = []): { nodes: VizNode[]; edges: VizEdge[]; pointers: VizPointer[] } {
  const count = state.cells.length;
  const gap = Math.min(100, 356 / Math.max(count + 1, 1));
  const nodes: VizNode[] = state.cells.map((cell, index) =>
    n(cell.id, 60 + index * gap, LIST_Y, `${cell.value}`, { shape: 'box', w: Math.min(62, gap - 8), h: 44, state: marks[cell.id] ?? 'default' }),
  );
  nodes.push(n('lnull', 60 + count * gap, LIST_Y, '∅', { shape: 'pill', w: 48, h: 36 }));
  nodes.push(...extra);

  const edges: VizEdge[] = state.cells.map((cell, index) =>
    e(cell.id, index + 1 < count ? state.cells[index + 1].id : 'lnull', { arrow: true }),
  );

  const pointers = state.cells.length ? [p(state.cells[0].id, 'INÍCIO', 'top', 'accent')] : [p('lnull', 'INÍCIO', 'top', 'accent')];
  return { nodes, edges, pointers };
}

function listScene(frames: VizFrame[], code: string[], operation: string): VizScene {
  return { operation, complexity: 'O(n)', code, frames, width: 460, height: 300 };
}

function listInsert(previous: ListState, raw: string): OpResult {
  const state: ListState = structuredClone(previous);
  const value = parseNumber(raw, 25);
  const frames: VizFrame[] = [];
  const marks: Record<string, VizNodeState> = {};
  const push = (caption: string, codeLine?: number, vars?: VizVar[], extra: VizNode[] = []) => {
    const { nodes, edges, pointers } = listRender(state, marks, extra);
    frames.push(snap(nodes, edges, pointers, caption, codeLine, vars));
  };

  if (state.cells.length >= LIST_CAP) {
    push(`inserir(${value}): limite didático de ${LIST_CAP} células atingido.`, 0, [{ name: 'x', value: `${value}` }]);
    return { scene: listScene(frames, listInsertCode, `inserir(${value})`), next: state };
  }

  const novo = n('staging', 230, 250, `${value}`, { shape: 'box', w: 62, h: 44, state: 'inserted' });
  push(`inserir(${value}): a lista ordenada aceita repetidos; achar o ponto certo.`, 1, [{ name: 'x', value: `${value}` }], [novo]);

  let index = 0;
  while (index < state.cells.length && state.cells[index].value < value) {
    const cell = state.cells[index];
    marks[cell.id] = 'compare';
    push(`p.prox.elemento = ${cell.value} < ${value} → p avança.`, 3, [{ name: 'p', value: `${cell.value}` }], [novo]);
    marks[cell.id] = 'visited';
    index += 1;
  }

  const after = index < state.cells.length ? state.cells[index] : null;
  if (after) {
    marks[after.id] = 'compare';
    push(`${after.value} ≥ ${value}: o laço para; o novo nó entra antes de ${after.value}.`, 2, [], [novo]);
    marks[after.id] = 'default';
  } else {
    push('Chegou ao fim: o novo nó entra antes de ∅.', 2, [], [novo]);
  }

  push(`tmp.prox = p.prox (${after ? after.value : '∅'}): ninguém fica órfão.`, 6, [{ name: 'tmp.prox', value: after ? `${after.value}` : '∅' }], [novo]);

  const cell: Cell = { id: `l${(state.seq += 1)}`, value };
  state.cells.splice(index, 0, cell);
  marks[cell.id] = 'inserted';
  push('p.prox = tmp: a corrente foi religada.', 7, [{ name: 'p.prox', value: `${value}` }]);
  marks[cell.id] = 'found';
  push(`${value} está no lugar: busca O(n), religação O(1).`, 7);

  return { scene: listScene(frames, listInsertCode, `inserir(${value})`), next: state };
}

function listSearch(previous: ListState, raw: string): OpResult {
  const state: ListState = structuredClone(previous);
  const value = parseNumber(raw, 20);
  const frames: VizFrame[] = [];
  const marks: Record<string, VizNodeState> = {};
  const push = (caption: string, codeLine?: number, vars?: VizVar[]) => {
    const { nodes, edges, pointers } = listRender(state, marks);
    frames.push(snap(nodes, edges, pointers, caption, codeLine, vars));
  };

  push(`pesquisar(${value}): i parte do início.`, 1, [{ name: 'x', value: `${value}` }]);

  for (const cell of state.cells) {
    marks[cell.id] = 'compare';

    if (cell.value >= value) {
      if (cell.value === value) {
        push(`i.elemento == ${value} → encontrado!`, 5, [{ name: 'retorno', value: 'true' }]);
        marks[cell.id] = 'found';
        push('A lista ordenada permitiu parar exatamente no ponto certo.', 5);
      } else {
        push(`i.elemento = ${cell.value} > ${value}: como a lista é ordenada, ${value} não está.`, 5, [{ name: 'retorno', value: 'false' }]);
        marks[cell.id] = 'error';
        push('Parada antecipada: vantagem de manter a ordem.', 5);
      }
      return { scene: listScene(frames, listSearchCode, `pesquisar(${value})`), next: state };
    }

    push(`i.elemento = ${cell.value} < ${value} → i = i.prox.`, 3, [{ name: 'i', value: `${cell.value}` }]);
    marks[cell.id] = 'visited';
  }

  push(`i == null: chegou em ∅ sem achar ${value}.`, 5, [{ name: 'retorno', value: 'false' }]);
  return { scene: listScene(frames, listSearchCode, `pesquisar(${value})`), next: state };
}

function listRemove(previous: ListState, raw: string): OpResult {
  const state: ListState = structuredClone(previous);
  const value = parseNumber(raw, 20);
  const frames: VizFrame[] = [];
  const marks: Record<string, VizNodeState> = {};
  const push = (caption: string, codeLine?: number, vars?: VizVar[]) => {
    const { nodes, edges, pointers } = listRender(state, marks);
    frames.push(snap(nodes, edges, pointers, caption, codeLine, vars));
  };

  push(`remover(${value}): p caminha guardando o anterior.`, 1, [{ name: 'x', value: `${value}` }]);

  const index = state.cells.findIndex((cell) => cell.value === value);

  if (index < 0) {
    for (const cell of state.cells) {
      marks[cell.id] = 'visited';
    }
    push(`p.prox == null: ${value} não está na lista.`, 5, [{ name: 'resultado', value: 'erro' }]);
    push('Erro: nao encontrado!', 6);
    return { scene: listScene(frames, listRemoveCode, `remover(${value})`), next: state };
  }

  for (let i = 0; i < index; i += 1) {
    const cell = state.cells[i];
    marks[cell.id] = 'compare';
    push(`p.prox.elemento = ${cell.value} ≠ ${value} → p avança.`, 3, [{ name: 'p', value: `${cell.value}` }]);
    marks[cell.id] = 'visited';
  }

  const alvo = state.cells[index];
  const depois = index + 1 < state.cells.length ? state.cells[index + 1] : null;
  marks[alvo.id] = 'removed';
  push(`Achou ${value}. p.prox = p.prox.prox religa direto em ${depois ? depois.value : '∅'}.`, 8, [{ name: 'p.prox', value: depois ? `${depois.value}` : '∅' }]);

  state.cells.splice(index, 1);
  push(`${value} saiu; a corrente se fechou sem deslocar ninguém.`, 8, [{ name: 'resultado', value: 'ok' }]);

  return { scene: listScene(frames, listRemoveCode, `remover(${value})`), next: state };
}

/* =====================================================================
   TABELA HASH COM ÁREA DE RESERVA — hashDiretoReserva/Hash.java (Max)
   ===================================================================== */

type HashState = { main: Array<Cell | null>; reserva: Array<Cell & { homePos: number }>; seq: number };

const HASH_M1 = 7;
const HASH_M2 = 3;
const HASH_Y = 150;
const RES_Y = 272;
const hashSlotX = (index: number) => 55 + index * 58;
const resSlotX = (index: number) => hashSlotX(2 + index);

const hashInsertCode = [
  'public boolean inserir(int x) {',
  '   int pos = h(x);            // x % 7',
  '   if (tabela[pos] == NULO) {',
  '      tabela[pos] = x;',
  '   } else if (reserva < m2) { // colisão!',
  '      tabela[m1 + reserva] = x;',
  '      reserva++;',
  '   } else {',
  '      // erro: reserva cheia!',
  '   }',
  '}',
];

const hashSearchCode = [
  'public boolean pesquisar(int x) {',
  '   int pos = h(x);            // x % 7',
  '   if (tabela[pos] == x) {',
  '      resp = true;',
  '   } else if (tabela[pos] != NULO) {',
  '      for (int i = 0; i < reserva; i++) {',
  '         if (tabela[m1 + i] == x) {',
  '            resp = true;',
  '         }',
  '      }',
  '   }',
  '   return resp;   // NULO: nem olha a reserva',
  '}',
];

const hashRemoveCode = [
  'public boolean remover(int x) {',
  '   int pos = h(x);            // x % 7',
  '   if (tabela[pos] == x) {',
  '      tabela[pos] = NULO;',
  '   } else if (tabela[pos] != NULO) {',
  '      procura x na área de reserva;',
  '      compacta a reserva;     // reserva--',
  '   }',
  '}',
];

function hashCodeFor(opId: string): string[] {
  return opId === 'inserir' ? hashInsertCode : opId === 'buscar' ? hashSearchCode : hashRemoveCode;
}

function hashRender(state: HashState, marks: Record<string, VizNodeState> = {}, extra: VizNode[] = []): { nodes: VizNode[]; edges: VizEdge[] } {
  const nodes: VizNode[] = [];
  const edges: VizEdge[] = [];

  nodes.push(n('lbl-main', hashSlotX(0) - 8, HASH_Y - 62, 'tabela (m1 = 7)', { shape: 'pill', w: 110, h: 22, state: 'muted' }));

  state.main.forEach((cell, index) => {
    nodes.push(n(`slot${index}`, hashSlotX(index), HASH_Y, '', { shape: 'slot', w: 50, h: 46, sub: `${index}` }));
    if (cell) {
      nodes.push(n(cell.id, hashSlotX(index), HASH_Y, `${cell.value}`, { shape: 'pill', w: 50, h: 32, state: marks[cell.id] ?? 'default' }));
    }
  });

  nodes.push(n('lbl-res', resSlotX(0) - 8, RES_Y - 46, 'área de reserva (m2 = 3)', { shape: 'pill', w: 150, h: 22, state: 'muted' }));

  for (let index = 0; index < HASH_M2; index += 1) {
    nodes.push(n(`res${index}`, resSlotX(index), RES_Y, '', { shape: 'slot', w: 50, h: 46, sub: `${HASH_M1 + index}` }));
  }

  state.reserva.forEach((cell, index) => {
    nodes.push(n(cell.id, resSlotX(index), RES_Y, `${cell.value}`, { shape: 'pill', w: 50, h: 32, state: marks[cell.id] ?? 'default' }));
    edges.push(e(`slot${cell.homePos}`, cell.id, { dashed: true, arrow: true }));
  });

  nodes.push(...extra);

  return { nodes, edges };
}

function hashScene(frames: VizFrame[], code: string[], operation: string): VizScene {
  return { operation, complexity: 'O(1) médio', code, frames, width: 460, height: 350 };
}

function hashFindAll(state: HashState, value: number): Cell | null {
  const pos = value % HASH_M1;
  if (state.main[pos]?.value === value) return state.main[pos];
  return state.reserva.find((cell) => cell.value === value) ?? null;
}

function hashInsert(previous: HashState, raw: string): OpResult {
  const state: HashState = structuredClone(previous);
  const value = parseNumber(raw, 16);
  const pos = value % HASH_M1;
  const frames: VizFrame[] = [];
  const push = (caption: string, codeLine?: number, vars?: VizVar[], marks: Record<string, VizNodeState> = {}, extra: VizNode[] = []) => {
    const { nodes, edges } = hashRender(state, marks, extra);
    frames.push(snap(nodes, edges, [], caption, codeLine, vars));
  };

  const staging = n('staging', 230, 56, `${value}`, { shape: 'pill', w: 56, h: 34, state: 'active' });
  push(`inserir(${value}): a chave chega para ser posicionada.`, 0, [{ name: 'x', value: `${value}` }], {}, [staging]);
  push(`pos = h(${value}) = ${value} % 7 = ${pos}.`, 1, [{ name: 'pos', value: `${pos}` }], { [`slot${pos}`]: 'compare' }, [staging]);

  const existente = hashFindAll(state, value);
  if (existente) {
    push(`${value} já está na tabela: chave repetida não é inserida de novo.`, 2, [{ name: 'resultado', value: 'já existe' }], {
      [existente.id]: 'error',
    }, [{ ...staging, state: 'error' }]);
    return { scene: hashScene(frames, hashInsertCode, `inserir(${value})`), next: state };
  }

  const occupant = state.main[pos];

  if (!occupant) {
    const cell: Cell = { id: `h${(state.seq += 1)}`, value };
    state.main[pos] = cell;
    push(`tabela[${pos}] == NULO: ${value} entra direto, sem comparação.`, 3, [{ name: 'pos', value: `${pos}` }], { [cell.id]: 'inserted' });
    push('Inserção direta: caso médio O(1).', 3, [], { [cell.id]: 'found' });
    return { scene: hashScene(frames, hashInsertCode, `inserir(${value})`), next: state };
  }

  push(`Colisão! tabela[${pos}] já guarda ${occupant.value} (posição ocupada por OUTRO valor).`, 4, [{ name: 'pos', value: `${pos}` }], {
    [occupant.id]: 'compare',
  }, [{ ...staging, state: 'error' }]);

  if (state.reserva.length >= HASH_M2) {
    push('reserva == m2: a área de reserva está cheia → Erro ao inserir!', 8, [{ name: 'reserva', value: `${state.reserva.length}` }], {
      [occupant.id]: 'visited',
      'lbl-res': 'error',
    }, [{ ...staging, state: 'error' }]);
    return { scene: hashScene(frames, hashInsertCode, `inserir(${value})`), next: state };
  }

  const cell = { id: `h${(state.seq += 1)}`, value, homePos: pos };
  state.reserva.push(cell);
  push(`tabela[m1 + ${state.reserva.length - 1}] = ${value}: a colisão vai para a PRÓXIMA posição livre da reserva.`, 5, [
    { name: 'reserva', value: `${state.reserva.length - 1}` },
  ], { [occupant.id]: 'visited', [cell.id]: 'inserted' });
  push(`reserva++ → ${state.reserva.length}. A seta tracejada lembra de onde a chave veio.`, 6, [{ name: 'reserva', value: `${state.reserva.length}` }], {
    [cell.id]: 'found',
  });

  return { scene: hashScene(frames, hashInsertCode, `inserir(${value})`), next: state };
}

function hashSearch(previous: HashState, raw: string): OpResult {
  const state: HashState = structuredClone(previous);
  const value = parseNumber(raw, 30);
  const pos = value % HASH_M1;
  const frames: VizFrame[] = [];
  const push = (caption: string, codeLine?: number, vars?: VizVar[], marks: Record<string, VizNodeState> = {}, extra: VizNode[] = []) => {
    const { nodes, edges } = hashRender(state, marks, extra);
    frames.push(snap(nodes, edges, [], caption, codeLine, vars));
  };

  const staging = n('staging', 230, 56, `${value}`, { shape: 'pill', w: 56, h: 34, state: 'active' });
  push(`pesquisar(${value}): pos = ${value} % 7 = ${pos}.`, 1, [{ name: 'pos', value: `${pos}` }], { [`slot${pos}`]: 'compare' }, [staging]);

  const occupant = state.main[pos];

  if (occupant?.value === value) {
    push(`tabela[${pos}] == ${value}: encontrado na primeira comparação.`, 3, [{ name: 'resp', value: 'true' }], { [occupant.id]: 'found' });
    return { scene: hashScene(frames, hashSearchCode, `pesquisar(${value})`), next: state };
  }

  if (!occupant) {
    push(`tabela[${pos}] == NULO: se ${value} existisse, estaria aqui. Nem precisa olhar a reserva.`, 11, [{ name: 'resp', value: 'false' }], {
      [`slot${pos}`]: 'error',
    }, [{ ...staging, state: 'error' }]);
    return { scene: hashScene(frames, hashSearchCode, `pesquisar(${value})`), next: state };
  }

  push(`tabela[${pos}] = ${occupant.value} ≠ ${value}, mas a posição NÃO é NULA → pode estar na reserva.`, 4, [], { [occupant.id]: 'compare' }, [staging]);

  const marks: Record<string, VizNodeState> = { [occupant.id]: 'visited' };

  for (let i = 0; i < state.reserva.length; i += 1) {
    const cell = state.reserva[i];
    marks[cell.id] = 'compare';

    if (cell.value === value) {
      push(`tabela[m1 + ${i}] == ${value}: encontrado na reserva.`, 6, [{ name: 'i', value: `${i}` }, { name: 'resp', value: 'true' }], {
        ...marks,
        [cell.id]: 'found',
      });
      return { scene: hashScene(frames, hashSearchCode, `pesquisar(${value})`), next: state };
    }

    push(`tabela[m1 + ${i}] = ${cell.value} ≠ ${value} → segue a varredura.`, 5, [{ name: 'i', value: `${i}` }], { ...marks });
    marks[cell.id] = 'visited';
  }

  push(`Varredura completa da reserva sem achar ${value} → resp = false.`, 11, [{ name: 'resp', value: 'false' }], { ...marks, 'lbl-res': 'error' });
  return { scene: hashScene(frames, hashSearchCode, `pesquisar(${value})`), next: state };
}

function hashRemove(previous: HashState, raw: string): OpResult {
  const state: HashState = structuredClone(previous);
  const value = parseNumber(raw, 23);
  const pos = value % HASH_M1;
  const frames: VizFrame[] = [];
  const push = (caption: string, codeLine?: number, vars?: VizVar[], marks: Record<string, VizNodeState> = {}, extra: VizNode[] = []) => {
    const { nodes, edges } = hashRender(state, marks, extra);
    frames.push(snap(nodes, edges, [], caption, codeLine, vars));
  };

  push(`remover(${value}): pos = ${value} % 7 = ${pos}.`, 1, [{ name: 'pos', value: `${pos}` }], { [`slot${pos}`]: 'compare' });

  const occupant = state.main[pos];

  if (occupant?.value === value) {
    push(`tabela[${pos}] == ${value}: remove da tabela principal.`, 2, [], { [occupant.id]: 'removed' });
    state.main[pos] = null;
    push(`tabela[${pos}] = NULO. Atenção: colisões antigas desta posição continuam na reserva.`, 3, [{ name: 'resultado', value: 'ok' }], {
      [`slot${pos}`]: 'found',
    });
    return { scene: hashScene(frames, hashRemoveCode, `remover(${value})`), next: state };
  }

  if (!occupant) {
    push(`tabela[${pos}] == NULO: ${value} não está na estrutura.`, 4, [{ name: 'resultado', value: 'erro' }], { [`slot${pos}`]: 'error' });
    return { scene: hashScene(frames, hashRemoveCode, `remover(${value})`), next: state };
  }

  const marks: Record<string, VizNodeState> = { [occupant.id]: 'visited' };
  push(`tabela[${pos}] = ${occupant.value} ≠ ${value} → procurar na reserva.`, 4, [], { [occupant.id]: 'compare' });

  const index = state.reserva.findIndex((cell) => cell.value === value);

  for (let i = 0; i < (index < 0 ? state.reserva.length : index); i += 1) {
    const cell = state.reserva[i];
    marks[cell.id] = 'compare';
    push(`tabela[m1 + ${i}] = ${cell.value} ≠ ${value}.`, 5, [{ name: 'i', value: `${i}` }], { ...marks });
    marks[cell.id] = 'visited';
  }

  if (index < 0) {
    push(`Reserva varrida sem achar ${value}: nada a remover.`, 5, [{ name: 'resultado', value: 'erro' }], { ...marks, 'lbl-res': 'error' });
    return { scene: hashScene(frames, hashRemoveCode, `remover(${value})`), next: state };
  }

  const alvo = state.reserva[index];
  push(`Achou ${value} na reserva: remove e compacta as posições seguintes.`, 5, [], { ...marks, [alvo.id]: 'removed' });
  state.reserva.splice(index, 1);
  push(`reserva-- → ${state.reserva.length}. Quem estava depois andou uma posição.`, 6, [{ name: 'reserva', value: `${state.reserva.length}` }], marks);

  return { scene: hashScene(frames, hashRemoveCode, `remover(${value})`), next: state };
}

/* =====================================================================
   ABB — ArvoreBinaria.java (Max)
   ===================================================================== */

type BstNode = { key: number; left?: BstNode; right?: BstNode };
type BstState = { root: BstNode | null };

const BST_CAP = 15;

const bstInsertCode = [
  'private No inserir(int x, No i) {',
  '   if (i == null) {',
  '      i = new No(x);',
  '   } else if (x < i.elemento) {',
  '      i.esq = inserir(x, i.esq);',
  '   } else if (x > i.elemento) {',
  '      i.dir = inserir(x, i.dir);',
  '   } else {',
  '      throw new Exception("Erro ao inserir!");',
  '   }',
  '   return i;',
  '}',
];

const bstSearchCode = [
  'private boolean pesquisar(int x, No i) {',
  '   if (i == null) {',
  '      resp = false;',
  '   } else if (x == i.elemento) {',
  '      resp = true;',
  '   } else if (x < i.elemento) {',
  '      resp = pesquisar(x, i.esq);',
  '   } else {',
  '      resp = pesquisar(x, i.dir);',
  '   }',
  '   return resp;',
  '}',
];

const bstRemoveCode = [
  'private No remover(int x, No i) {',
  '   if (i == null) {',
  '      throw new Exception("Erro ao remover!");',
  '   } else if (x < i.elemento) {',
  '      i.esq = remover(x, i.esq);',
  '   } else if (x > i.elemento) {',
  '      i.dir = remover(x, i.dir);',
  '   } else if (i.dir == null) {',
  '      i = i.esq;               // sem no a direita',
  '   } else if (i.esq == null) {',
  '      i = i.dir;               // sem no a esquerda',
  '   } else {',
  '      i.esq = maiorEsq(i, i.esq);',
  '   }',
  '   return i;',
  '}',
];

const bstWalkCode = [
  'private void caminharCentral(No i) {',
  '   if (i != null) {',
  '      caminharCentral(i.esq);',
  '      System.out.print(i.elemento + " ");',
  '      caminharCentral(i.dir);',
  '   }',
  '}',
];

function bstCodeFor(opId: string): string[] {
  if (opId === 'inserir') return bstInsertCode;
  if (opId === 'buscar') return bstSearchCode;
  if (opId === 'remover') return bstRemoveCode;
  return bstWalkCode;
}

function bstInsertNode(root: BstNode | undefined, key: number): BstNode {
  if (!root) return { key };
  if (key < root.key) return { ...root, left: bstInsertNode(root.left, key) };
  if (key > root.key) return { ...root, right: bstInsertNode(root.right, key) };
  return root;
}

function bstRemoveNode(root: BstNode | undefined, key: number): BstNode | undefined {
  if (!root) return undefined;
  if (key < root.key) return { ...root, left: bstRemoveNode(root.left, key) };
  if (key > root.key) return { ...root, right: bstRemoveNode(root.right, key) };
  if (!root.right) return root.left;
  if (!root.left) return root.right;
  let pred = root.left;
  while (pred.right) pred = pred.right;
  return { key: pred.key, left: bstRemoveNode(root.left, pred.key), right: root.right };
}

function bstCount(root?: BstNode | null): number {
  return root ? 1 + bstCount(root.left) + bstCount(root.right) : 0;
}

function bstToViz(root: BstNode | null, marks: Record<number, VizNodeState> = {}): { nodes: VizNode[]; edges: VizEdge[]; pointers: VizPointer[] } {
  if (!root) return { nodes: [], edges: [], pointers: [] };

  const toTree = (node: BstNode): TreeNode => ({
    id: `b${node.key}`,
    label: `${node.key}`,
    left: node.left ? toTree(node.left) : undefined,
    right: node.right ? toTree(node.right) : undefined,
  });

  const tree = toTree(root);
  const positions = layoutTree(tree, 460, { top: 52, levelGap: 72 });
  const nodes: VizNode[] = [];
  const edges: VizEdge[] = [];

  (function walk(node: BstNode) {
    const at = positions.get(`b${node.key}`)!;
    nodes.push(n(`b${node.key}`, at.x, at.y, `${node.key}`, { state: marks[node.key] ?? 'default' }));
    if (node.left) {
      edges.push(e(`b${node.key}`, `b${node.left.key}`));
      walk(node.left);
    }
    if (node.right) {
      edges.push(e(`b${node.key}`, `b${node.right.key}`));
      walk(node.right);
    }
  })(root);

  return { nodes, edges, pointers: [p(`b${root.key}`, 'RAIZ', 'top', 'accent')] };
}

function bstScene(frames: VizFrame[], code: string[], operation: string, complexity = 'O(altura)'): VizScene {
  return { operation, complexity, code, frames, width: 460, height: 300 };
}

type BstPush = (caption: string, codeLine?: number, vars?: VizVar[]) => void;

function bstDescendFrames(
  root: BstNode,
  value: number,
  marks: Record<number, VizNodeState>,
  push: BstPush,
  lines: { less: number; more: number; equal: number },
): BstNode | undefined {
  let cursor: BstNode | undefined = root;

  while (cursor) {
    marks[cursor.key] = 'compare';

    if (value === cursor.key) {
      push(`x == i.elemento (${cursor.key}): nó localizado.`, lines.equal, [{ name: 'i', value: `${cursor.key}` }]);
      return cursor;
    }

    const goLeft: boolean = value < cursor.key;
    push(`${value} ${goLeft ? '<' : '>'} ${cursor.key} → ${goLeft ? 'i.esq' : 'i.dir'}.`, goLeft ? lines.less : lines.more, [
      { name: 'i', value: `${cursor.key}` },
      { name: 'x', value: `${value}` },
    ]);
    marks[cursor.key] = 'visited';
    cursor = goLeft ? cursor.left : cursor.right;
  }

  return undefined;
}

function bstInsert(previous: BstState, raw: string): OpResult {
  const state: BstState = structuredClone(previous);
  const value = parseNumber(raw, 45);
  const marks: Record<number, VizNodeState> = {};
  const frames: VizFrame[] = [];
  const push: BstPush = (caption, codeLine, vars) => {
    const { nodes, edges, pointers } = bstToViz(state.root, marks);
    frames.push(snap(nodes, edges, pointers, caption, codeLine, vars));
  };

  if (!state.root) {
    push(`inserir(${value}): i == null logo na raiz.`, 1, [{ name: 'x', value: `${value}` }]);
    state.root = { key: value };
    marks[value] = 'inserted';
    push(`i = new No(${value}): a árvore ganha a primeira raiz.`, 2);
    return { scene: bstScene(frames, bstInsertCode, `inserir(${value})`), next: state };
  }

  if (bstCount(state.root) >= BST_CAP) {
    push(`Limite didático de ${BST_CAP} nós atingido: inserção não realizada.`, 0, [{ name: 'x', value: `${value}` }]);
    return { scene: bstScene(frames, bstInsertCode, `inserir(${value})`), next: state };
  }

  push(`inserir(${value}): a descida é igual à da pesquisa.`, 0, [{ name: 'x', value: `${value}` }]);

  const existing = bstDescendFrames(state.root, value, marks, push, { less: 4, more: 6, equal: 8 });

  if (existing) {
    marks[existing.key] = 'error';
    push(`Elemento repetido → throw new Exception("Erro ao inserir!"). A ABB da matéria NÃO aceita duplicata.`, 8, [{ name: 'resultado', value: 'erro' }]);
  } else {
    push('i == null: achou o ponteiro onde o novo nó nasce.', 1);
    state.root = bstInsertNode(state.root, value);
    marks[value] = 'inserted';
    push(`i = new No(${value}): entra como folha, sem mover ninguém.`, 2, [{ name: 'x', value: `${value}` }]);
    marks[value] = 'found';
    push('Os returns religam o caminho até a raiz.', 10);
  }

  return { scene: bstScene(frames, bstInsertCode, `inserir(${value})`), next: state };
}

function bstSearch(previous: BstState, raw: string): OpResult {
  const state: BstState = structuredClone(previous);
  const value = parseNumber(raw, 40);
  const marks: Record<number, VizNodeState> = {};
  const frames: VizFrame[] = [];
  const push: BstPush = (caption, codeLine, vars) => {
    const { nodes, edges, pointers } = bstToViz(state.root, marks);
    frames.push(snap(nodes, edges, pointers, caption, codeLine, vars));
  };

  if (!state.root) {
    push(`pesquisar(${value}): i == null → resp = false. Árvore vazia.`, 2, [{ name: 'resp', value: 'false' }]);
    return { scene: bstScene(frames, bstSearchCode, `pesquisar(${value})`), next: state };
  }

  push(`pesquisar(${value}): menores à esquerda, maiores à direita.`, 0, [{ name: 'x', value: `${value}` }]);

  const found = bstDescendFrames(state.root, value, marks, push, { less: 6, more: 8, equal: 4 });

  if (found) {
    marks[found.key] = 'found';
    push('resp = true: cada comparação descartou uma subárvore inteira.', 4, [{ name: 'resp', value: 'true' }]);
  } else {
    push(`i == null: ${value} não está na árvore → resp = false.`, 2, [{ name: 'resp', value: 'false' }]);
  }

  return { scene: bstScene(frames, bstSearchCode, `pesquisar(${value})`), next: state };
}

function bstRemove(previous: BstState, raw: string): OpResult {
  const state: BstState = structuredClone(previous);
  const value = parseNumber(raw, 30);
  const marks: Record<number, VizNodeState> = {};
  const frames: VizFrame[] = [];
  const push: BstPush = (caption, codeLine, vars) => {
    const { nodes, edges, pointers } = bstToViz(state.root, marks);
    frames.push(snap(nodes, edges, pointers, caption, codeLine, vars));
  };

  if (!state.root) {
    push(`remover(${value}): i == null → Erro ao remover! Árvore vazia.`, 2, [{ name: 'resultado', value: 'erro' }]);
    return { scene: bstScene(frames, bstRemoveCode, `remover(${value})`), next: state };
  }

  push(`remover(${value}): primeiro, localizar o nó.`, 0, [{ name: 'x', value: `${value}` }]);

  const target = bstDescendFrames(state.root, value, marks, push, { less: 4, more: 6, equal: 7 });

  if (!target) {
    push(`i == null: ${value} não está → throw new Exception("Erro ao remover!").`, 2, [{ name: 'resultado', value: 'erro' }]);
    return { scene: bstScene(frames, bstRemoveCode, `remover(${value})`), next: state };
  }

  const children = (target.left ? 1 : 0) + (target.right ? 1 : 0);

  if (children === 0) {
    marks[value] = 'removed';
    push(`i.dir == null → i = i.esq (também null): a folha simplesmente sai.`, 8);
    state.root = bstRemoveNode(state.root ?? undefined, value) ?? null;
    push('O pai passou a apontar para null.', 8);
  } else if (children === 1) {
    const child = (target.left ?? target.right)!;
    marks[value] = 'removed';
    marks[child.key] = 'inserted';
    push(target.right == null ? `i.dir == null → i = i.esq: ${child.key} sobe com toda a subárvore.` : `i.esq == null → i = i.dir: ${child.key} sobe com toda a subárvore.`, target.right == null ? 8 : 10, [
      { name: 'filho', value: `${child.key}` },
    ]);
    state.root = bstRemoveNode(state.root ?? undefined, value) ?? null;
    marks[child.key] = 'found';
    push('O filho ocupou o lugar sem quebrar a ordenação.', target.right == null ? 8 : 10);
  } else {
    marks[value] = 'removed';
    push('Dois filhos → maiorEsq: substituir pelo MAIOR da subárvore esquerda.', 12);

    let walker = target.left!;
    marks[walker.key] = 'compare';
    push(`maiorEsq desce para ${walker.key} e segue sempre à direita.`, 12, [{ name: 'j', value: `${walker.key}` }]);

    while (walker.right) {
      marks[walker.key] = 'visited';
      walker = walker.right;
      marks[walker.key] = 'compare';
      push(`j.dir existe → caminha até ${walker.key}.`, 12, [{ name: 'j', value: `${walker.key}` }]);
    }

    marks[walker.key] = 'found';
    push(`j.dir == null: ${walker.key} é o antecessor (maior da esquerda).`, 12, [{ name: 'antecessor', value: `${walker.key}` }]);

    state.root = bstRemoveNode(state.root ?? undefined, value) ?? null;
    delete marks[value];
    marks[walker.key] = 'inserted';
    push(`i.elemento = j.elemento: ${walker.key} assume a posição de ${value}.`, 12);
    marks[walker.key] = 'found';
    push('Remoção com dois filhos concluída; a regra da ABB continua válida.', 14);
  }

  return { scene: bstScene(frames, bstRemoveCode, `remover(${value})`), next: state };
}

function bstWalk(previous: BstState): OpResult {
  const state: BstState = structuredClone(previous);
  const marks: Record<number, VizNodeState> = {};
  const frames: VizFrame[] = [];
  const push: BstPush = (caption, codeLine, vars) => {
    const { nodes, edges, pointers } = bstToViz(state.root, marks);
    frames.push(snap(nodes, edges, pointers, caption, codeLine, vars));
  };

  if (!state.root) {
    push('caminharCentral(): i == null logo na raiz. Nada a imprimir.', 1);
    return { scene: bstScene(frames, bstWalkCode, 'caminhamento central', 'O(n)'), next: state };
  }

  push('Caminhamento central: esquerda → nó → direita.', 0);

  const output: number[] = [];
  const inOrder: number[] = [];
  (function walk(node?: BstNode) {
    if (!node) return;
    walk(node.left);
    inOrder.push(node.key);
    walk(node.right);
  })(state.root);

  for (const key of inOrder) {
    marks[key] = 'active';
    output.push(key);
    push(`System.out.print(${key}): imprime o nó entre as duas subárvores.`, 3, [{ name: 'saída', value: output.join(' ') }]);
    marks[key] = 'visited';
  }

  push('Na ABB, o caminhamento central visita os valores EM ORDEM crescente.', 3, [{ name: 'saída', value: output.join(' ') }]);
  return { scene: bstScene(frames, bstWalkCode, 'caminhamento central', 'O(n)'), next: state };
}

/* =====================================================================
   AVL — AVL.java (Max): inserir devolve balancear(i)
   ===================================================================== */

type AvlState = { root: AvlNode | null };

const avlInsertCode = [
  'private No inserir(int x, No i) {',
  '   if (i == null) {',
  '      i = new No(x);',
  '   } else if (x < i.elemento) {',
  '      i.esq = inserir(x, i.esq);',
  '   } else if (x > i.elemento) {',
  '      i.dir = inserir(x, i.dir);',
  '   } else {',
  '      throw new Exception("Erro ao inserir!");',
  '   }',
  '   return balancear(i);   // rotaciona se |fator| = 2',
  '}',
];

const avlSearchCode = bstSearchCode;

function avlCodeFor(opId: string): string[] {
  return opId === 'inserir' ? avlInsertCode : avlSearchCode;
}

function avlSceneOf(frames: VizFrame[], code: string[], operation: string): VizScene {
  return { operation, complexity: 'O(log n)', code, frames, width: 460, height: 300 };
}

function avlRenderPush(state: AvlState, frames: VizFrame[]) {
  return (caption: string, codeLine: number | undefined, marks: Record<number, VizNodeState>, vars?: VizVar[]) => {
    const { nodes, edges, rootId } = avlToViz(state.root ?? undefined, 460);
    for (const node of nodes) {
      const key = Number(node.label);
      if (marks[key]) node.state = marks[key];
    }
    frames.push(snap(nodes, edges, rootId ? [p(rootId, 'RAIZ', 'top', 'accent')] : [], caption, codeLine, vars));
  };
}

function avlCount(root?: AvlNode | null): number {
  return root ? 1 + avlCount(root.left) + avlCount(root.right) : 0;
}

function avlInsert(previous: AvlState, raw: string): OpResult {
  const state: AvlState = structuredClone(previous);
  const value = parseNumber(raw, 10);
  const frames: VizFrame[] = [];
  const push = avlRenderPush(state, frames);

  if (!state.root) {
    push(`inserir(${value}): i == null → a árvore ganha a raiz.`, 1, {}, [{ name: 'x', value: `${value}` }]);
    state.root = { key: value };
    push(`i = new No(${value}).`, 2, { [value]: 'inserted' });
    return { scene: avlSceneOf(frames, avlInsertCode, `inserir(${value})`), next: state };
  }

  if (avlCount(state.root) >= BST_CAP) {
    push(`Limite didático de ${BST_CAP} nós: inserção não realizada.`, 0, {}, [{ name: 'x', value: `${value}` }]);
    return { scene: avlSceneOf(frames, avlInsertCode, `inserir(${value})`), next: state };
  }

  push(`inserir(${value}): desce como na ABB; fatores conferidos na volta.`, 0, {}, [{ name: 'x', value: `${value}` }]);

  let cursor: AvlNode | undefined = state.root;

  while (cursor) {
    if (value === cursor.key) {
      push(`Elemento repetido → throw new Exception("Erro ao inserir!").`, 8, { [cursor.key]: 'error' }, [{ name: 'resultado', value: 'erro' }]);
      return { scene: avlSceneOf(frames, avlInsertCode, `inserir(${value})`), next: state };
    }

    const goLeft: boolean = value < cursor.key;
    push(`${value} ${goLeft ? '<' : '>'} ${cursor.key} → ${goLeft ? 'i.esq' : 'i.dir'}.`, goLeft ? 4 : 6, { [cursor.key]: 'compare' }, [
      { name: 'i', value: `${cursor.key}` },
    ]);
    cursor = goLeft ? cursor.left : cursor.right;
  }

  state.root = insertPlain(state.root, value);
  push(`i = new No(${value}): folha criada. Agora, balancear(i) na volta da recursão.`, 2, { [value]: 'inserted' });

  const factorRoot = state.root ? balance(state.root) : 0;
  const { node: balanced, rotation, pivot } = rebalance(state.root ?? undefined);

  if (rotation && pivot !== undefined) {
    push(`balancear: fator = 2 no nó ${pivot} → ${rotation}.`, 10, { [pivot]: 'error', [value]: 'inserted' }, [{ name: 'fator', value: `${factorRoot}` }]);
    state.root = balanced ?? null;
    push(`Depois da ${rotation}, todos os fatores voltam para -1, 0 ou +1.`, 10, { [pivot]: 'found' }, [{ name: 'fator', value: '0' }]);
  } else {
    state.root = balanced ?? null;
    push('balancear: fatores dentro do intervalo, nenhuma rotação.', 10, { [value]: 'found' }, [{ name: 'fator', value: `${factorRoot}` }]);
  }

  return { scene: avlSceneOf(frames, avlInsertCode, `inserir(${value})`), next: state };
}

function avlSearch(previous: AvlState, raw: string): OpResult {
  const state: AvlState = structuredClone(previous);
  const value = parseNumber(raw, 50);
  const frames: VizFrame[] = [];
  const push = avlRenderPush(state, frames);
  const marks: Record<number, VizNodeState> = {};

  if (!state.root) {
    push(`pesquisar(${value}): i == null → resp = false. Árvore vazia.`, 2, {}, [{ name: 'resp', value: 'false' }]);
    return { scene: avlSceneOf(frames, avlSearchCode, `pesquisar(${value})`), next: state };
  }

  push(`pesquisar(${value}): igual à ABB, mas com altura garantida O(log n).`, 0, {}, [{ name: 'x', value: `${value}` }]);

  let cursor: AvlNode | undefined = state.root;

  while (cursor) {
    marks[cursor.key] = 'compare';

    if (value === cursor.key) {
      push(`x == i.elemento → resp = true.`, 4, { ...marks, [cursor.key]: 'found' }, [{ name: 'resp', value: 'true' }]);
      return { scene: avlSceneOf(frames, avlSearchCode, `pesquisar(${value})`), next: state };
    }

    const goLeft: boolean = value < cursor.key;
    push(`${value} ${goLeft ? '<' : '>'} ${cursor.key} → ${goLeft ? 'i.esq' : 'i.dir'}.`, goLeft ? 6 : 8, { ...marks }, [{ name: 'i', value: `${cursor.key}` }]);
    marks[cursor.key] = 'visited';
    cursor = goLeft ? cursor.left : cursor.right;
  }

  push(`i == null → resp = false. Mesmo assim foram poucas comparações.`, 2, marks, [{ name: 'resp', value: 'false' }]);
  return { scene: avlSceneOf(frames, avlSearchCode, `pesquisar(${value})`), next: state };
}

/* =====================================================================
   TRIE — ArvoreTrie.java (Max): folha marca fim; prefixo conflita
   ===================================================================== */

type TrieState = { words: string[] };

const TRIE_WORD_CAP = 5;

const trieInsertCode = [
  'private void inserir(String s, No no, int i) {',
  '   if (no.prox[s.charAt(i)] == null) {',
  '      no.prox[s.charAt(i)] = new No(s.charAt(i));',
  '      if (i == s.length() - 1) {',
  '         no.prox[s.charAt(i)].folha = true;',
  '      } else {',
  '         inserir(s, no.prox[s.charAt(i)], i + 1);',
  '      }',
  '   } else if (!no.prox[s.charAt(i)].folha && i < s.length() - 1) {',
  '      inserir(s, no.prox[s.charAt(i)], i + 1);',
  '   } else {',
  '      throw new Exception("Erro ao inserir!");',
  '   }',
  '}',
];

const trieSearchCode = [
  'private boolean pesquisar(String s, No no, int i) {',
  '   if (no.prox[s.charAt(i)] == null) {',
  '      resp = false;',
  '   } else if (i == s.length() - 1) {',
  '      resp = no.prox[s.charAt(i)].folha;',
  '   } else {',
  '      resp = pesquisar(s, no.prox[s.charAt(i)], i + 1);',
  '   }',
  '   return resp;',
  '}',
];

function trieCodeFor(opId: string): string[] {
  return opId === 'inserir' ? trieInsertCode : trieSearchCode;
}

type TrieNode = { id: string; char: string; folha: boolean; children: Map<string, TrieNode> };

/** Monta a TRIE das palavras; `paths` desenham nós em criação, sem folha. */
function trieBuild(words: string[], paths: string[] = []): TrieNode {
  const root: TrieNode = { id: 't', char: '•', folha: false, children: new Map() };

  const walk = (word: string, markFolha: boolean) => {
    let cursor = root;
    for (const char of word) {
      if (!cursor.children.has(char)) {
        cursor.children.set(char, { id: `${cursor.id}${char}`, char, folha: false, children: new Map() });
      }
      cursor = cursor.children.get(char)!;
    }
    if (markFolha) cursor.folha = true;
  };

  for (const word of words) walk(word, true);
  for (const path of paths) walk(path, false);

  return root;
}

function trieToViz(root: TrieNode, marks: Record<string, VizNodeState> = {}): { nodes: VizNode[]; edges: VizEdge[]; height: number } {
  const leaves: string[] = [];
  let maxDepth = 0;

  (function count(node: TrieNode, depth: number) {
    maxDepth = Math.max(maxDepth, depth);
    if (!node.children.size) {
      leaves.push(node.id);
      return;
    }
    for (const child of node.children.values()) count(child, depth + 1);
  })(root, 0);

  const gap = Math.min(84, 372 / Math.max(leaves.length, 1));
  const startX = 230 - (gap * (leaves.length - 1)) / 2;
  let leafIndex = 0;
  const positions = new Map<string, { x: number; y: number }>();

  (function place(node: TrieNode, depth: number): number {
    let x: number;
    if (!node.children.size) {
      x = startX + leafIndex * gap;
      leafIndex += 1;
    } else {
      const xs = [...node.children.values()].map((child) => place(child, depth + 1));
      x = xs.reduce((sum, item) => sum + item, 0) / xs.length;
    }
    positions.set(node.id, { x, y: 46 + depth * 52 });
    return x;
  })(root, 0);

  const nodes: VizNode[] = [];
  const edges: VizEdge[] = [];

  (function collect(node: TrieNode) {
    const at = positions.get(node.id)!;
    nodes.push(n(node.id, at.x, at.y, node.char, { sub: node.folha ? '✓ folha' : undefined, state: marks[node.id] ?? 'default' }));
    for (const child of node.children.values()) {
      edges.push(e(node.id, child.id));
      collect(child);
    }
  })(root);

  return { nodes, edges, height: Math.max(280, 110 + maxDepth * 52) };
}

function trieOp(previous: TrieState, opId: 'inserir' | 'buscar', raw: string): OpResult {
  const state: TrieState = structuredClone(previous);
  const word = parseWord(raw, opId === 'inserir' ? 'ave' : 'art');
  const code = opId === 'inserir' ? trieInsertCode : trieSearchCode;
  const frames: VizFrame[] = [];
  const marks: Record<string, VizNodeState> = {};
  let sceneHeight = 280;
  let growth = '';

  const push = (caption: string, codeLine?: number, vars?: VizVar[]) => {
    const { nodes, edges, height } = trieToViz(trieBuild(state.words, growth ? [growth] : []), marks);
    sceneHeight = Math.max(sceneHeight, height);
    frames.push(snap(nodes, edges, [p('t', 'RAIZ', 'left', 'accent')], caption, codeLine, vars));
  };

  const done = (operation: string): OpResult => ({
    scene: { operation, complexity: 'O(k)', code, frames, width: 460, height: sceneHeight },
    next: state,
  });

  if (opId === 'inserir' && state.words.length >= TRIE_WORD_CAP) {
    push(`Limite didático de ${TRIE_WORD_CAP} palavras: inserção não realizada.`, 0, [{ name: 's', value: `"${word}"` }]);
    return done(`inserir("${word}")`);
  }

  push(
    state.words.length
      ? `${opId === 'inserir' ? 'inserir' : 'pesquisar'}("${word}") na TRIE atual.`
      : `TRIE vazia. ${opId === 'inserir' ? `inserir("${word}") cria o primeiro caminho.` : `pesquisar("${word}") em árvore vazia.`}`,
    0,
    [{ name: 's', value: `"${word}"` }],
  );

  // Simula fielmente as regras do ArvoreTrie.java.
  const root = trieBuild(state.words);
  let cursor = root;
  let creating = false;

  for (let i = 0; i < word.length; i += 1) {
    const char = word[i];
    const child = creating ? undefined : cursor.children.get(char);
    const last = i === word.length - 1;

    if (!child) {
      if (opId === 'buscar') {
        marks[cursor.id] = 'error';
        push(`no.prox['${char}'] == null → resp = false: o caminho não existe.`, 2, [{ name: 'resp', value: 'false' }]);
        return done(`pesquisar("${word}")`);
      }

      creating = true;
      growth = word.slice(0, i + 1);
      const id = `t${growth}`;
      marks[id] = 'inserted';
      push(`no.prox['${char}'] == null → new No('${char}').${last ? ' É a última letra: folha = true.' : ''}`, last ? 4 : 2, [
        { name: 'i', value: `${i}` },
        { name: 'letra', value: char },
      ]);
      marks[id] = 'visited';
      continue;
    }

    if (opId === 'buscar') {
      marks[child.id] = 'compare';
      if (last) {
        if (child.folha) {
          marks[child.id] = 'found';
          push(`Última letra e o nó é folha → resp = true: "${word}" é palavra.`, 4, [{ name: 'resp', value: 'true' }]);
        } else {
          marks[child.id] = 'error';
          push(`Última letra, mas folha == false → resp = false: "${word}" é só PREFIXO de outra palavra.`, 4, [{ name: 'resp', value: 'false' }]);
        }
        return done(`pesquisar("${word}")`);
      }
      push(`no.prox['${char}'] existe → desce um nível.`, 6, [{ name: 'i', value: `${i}` }]);
      marks[child.id] = 'visited';
      cursor = child;
      continue;
    }

    // inserir com filho existente: regras do Max.
    if (!child.folha && !last) {
      marks[child.id] = 'compare';
      push(`'${char}' já existe e não é folha → continua descendo.`, 9, [{ name: 'i', value: `${i}` }]);
      marks[child.id] = 'visited';
      cursor = child;
      continue;
    }

    marks[child.id] = 'error';
    push(
      child.folha && last
        ? `"${word}" já existe na TRIE → Erro ao inserir!`
        : child.folha
          ? `'${char}' é folha de outra palavra: a TRIE básica NÃO deixa estender palavra existente → Erro ao inserir!`
          : `"${word}" terminaria num nó interno: palavra que é PREFIXO de outra não entra na TRIE básica → Erro ao inserir!`,
      11,
      [{ name: 'resultado', value: 'erro' }],
    );
    return done(`inserir("${word}")`);
  }

  if (opId === 'inserir') {
    state.words = [...state.words, word];
    growth = '';
    marks[`t${word}`] = 'found';
    push(`"${word}" registrada: o nó final é folha (✓).`, 4, [{ name: 'folha', value: 'true' }]);
  }

  return done(`${opId === 'inserir' ? 'inserir' : 'pesquisar'}("${word}")`);
}

/* =====================================================================
   HEAP MÁXIMO — construção do Heapsort (unidade03f)
   ===================================================================== */

type HeapState = { cells: Cell[]; seq: number };

const HEAP_CAP = 15;

const heapInsertCode = [
  '// construção do heap (heapsort)',
  'array[n] = x; n++;',
  'int i = n - 1;',
  'while (i > 0 && array[i] > array[(i-1)/2]) {',
  '   troca(i, (i-1)/2);        // sobe',
  '   i = (i-1)/2;',
  '}',
];

const heapRemoveCode = [
  'int max = array[0];          // a raiz é o maior',
  'n--;',
  'array[0] = array[n];         // última folha sobe',
  'int i = 0;',
  'while (algum filho > array[i]) {',
  '   troca com o MAIOR filho;  // desce',
  '   i = filho;',
  '}',
  'return max;',
];

function heapCodeFor(opId: string): string[] {
  return opId === 'inserir' ? heapInsertCode : heapRemoveCode;
}

function heapPositions(count: number): Array<{ x: number; y: number }> {
  const labels = Array.from({ length: Math.max(count, 1) }, (_, index) => `${index}`);
  const root = buildLevelOrderTree(labels)!;
  const positions = layoutTree(root, 460, { top: 52, levelGap: 74 });
  return labels.map((_, index) => positions.get(`t${index}`)!);
}

function heapRender(state: HeapState, marks: Record<string, VizNodeState> = {}, extra: VizNode[] = []): { nodes: VizNode[]; edges: VizEdge[]; pointers: VizPointer[] } {
  if (!state.cells.length) {
    return { nodes: [...extra], edges: [], pointers: [] };
  }

  const positions = heapPositions(state.cells.length);
  const nodes = state.cells.map((cell, index) =>
    n(cell.id, positions[index].x, positions[index].y, `${cell.value}`, { sub: `i=${index}`, state: marks[cell.id] ?? 'default' }),
  );
  nodes.push(...extra);
  const edges = state.cells.slice(1).map((cell, k) => e(state.cells[Math.floor(k / 2)].id, cell.id));
  const pointers = [p(state.cells[0].id, 'RAIZ (máximo)', 'top', 'accent')];
  return { nodes, edges, pointers };
}

function heapSceneOf(frames: VizFrame[], code: string[], operation: string): VizScene {
  return { operation, complexity: 'O(log n)', code, frames, width: 460, height: 300 };
}

function heapInsert(previous: HeapState, raw: string): OpResult {
  const state: HeapState = structuredClone(previous);
  const value = parseNumber(raw, 85);
  const frames: VizFrame[] = [];
  const push = (caption: string, codeLine?: number, vars?: VizVar[], marks: Record<string, VizNodeState> = {}, extra: VizNode[] = []) => {
    const { nodes, edges, pointers } = heapRender(state, marks, extra);
    frames.push(snap(nodes, edges, pointers, caption, codeLine, vars));
  };

  if (state.cells.length >= HEAP_CAP) {
    push(`Limite didático de ${HEAP_CAP} nós: inserção não realizada.`, 1, [{ name: 'x', value: `${value}` }]);
    return { scene: heapSceneOf(frames, heapInsertCode, `inserir(${value})`), next: state };
  }

  const cell: Cell = { id: `p${(state.seq += 1)}`, value };

  if (!state.cells.length) {
    state.cells.push(cell);
    push(`array[0] = ${value}: o heap ganha a raiz. Duplicatas são permitidas.`, 1, [{ name: 'n', value: '1' }], { [cell.id]: 'found' });
    return { scene: heapSceneOf(frames, heapInsertCode, `inserir(${value})`), next: state };
  }

  const staging = n(cell.id, 402, 56, `${value}`, { state: 'inserted' });
  push(`inserir(${value}): entra na próxima folha para manter a árvore completa.`, 1, [{ name: 'x', value: `${value}` }], {}, [staging]);

  state.cells.push(cell);
  push(`array[${state.cells.length - 1}] = ${value}; n++ → ${state.cells.length}.`, 1, [{ name: 'n', value: `${state.cells.length}` }], { [cell.id]: 'inserted' });

  let index = state.cells.length - 1;

  while (index > 0) {
    const parentIndex = Math.floor((index - 1) / 2);
    const parent = state.cells[parentIndex];

    if (parent.value >= value) {
      push(`array[${index}] = ${value} ≤ pai ${parent.value}: a regra do heap vale → laço para.`, 3, [{ name: 'i', value: `${index}` }], {
        [cell.id]: 'inserted',
        [parent.id]: 'compare',
      });
      break;
    }

    push(`array[${index}] = ${value} > pai ${parent.value}: viola a regra → troca.`, 4, [{ name: 'i', value: `${index}` }], {
      [cell.id]: 'inserted',
      [parent.id]: 'compare',
    });
    [state.cells[index], state.cells[parentIndex]] = [state.cells[parentIndex], state.cells[index]];
    push(`i = (i-1)/2 = ${parentIndex}: ${value} subiu; ${parent.value} desceu.`, 5, [{ name: 'i', value: `${parentIndex}` }], {
      [cell.id]: 'inserted',
      [parent.id]: 'visited',
    });
    index = parentIndex;
  }

  push('Heap restaurado: a subida custa no máximo a altura, O(log n).', 6, [], { [cell.id]: 'found' });
  return { scene: heapSceneOf(frames, heapInsertCode, `inserir(${value})`), next: state };
}

function heapRemoveMax(previous: HeapState): OpResult {
  const state: HeapState = structuredClone(previous);
  const frames: VizFrame[] = [];
  const push = (caption: string, codeLine?: number, vars?: VizVar[], marks: Record<string, VizNodeState> = {}, extra: VizNode[] = []) => {
    const { nodes, edges, pointers } = heapRender(state, marks, extra);
    frames.push(snap(nodes, edges, pointers, caption, codeLine, vars));
  };

  if (!state.cells.length) {
    push('removerMax(): n = 0 → heap vazio, nada a remover.', 0, [{ name: 'n', value: '0' }]);
    return { scene: heapSceneOf(frames, heapRemoveCode, 'remover máximo'), next: state };
  }

  const raiz = state.cells[0];
  push(`max = array[0] = ${raiz.value}: no heap máximo o maior está SEMPRE na raiz.`, 0, [{ name: 'max', value: `${raiz.value}` }], { [raiz.id]: 'active' });

  if (state.cells.length === 1) {
    push(`${raiz.value} sai e o heap fica vazio.`, 1, [{ name: 'n', value: '0' }], { [raiz.id]: 'removed' });
    state.cells = [];
    push('Heap vazio (n = 0).', 8);
    return { scene: heapSceneOf(frames, heapRemoveCode, 'remover máximo'), next: state };
  }

  push(`${raiz.value} sai do heap.`, 1, [{ name: 'max', value: `${raiz.value}` }], { [raiz.id]: 'removed' });

  const last = state.cells.pop()!;
  state.cells[0] = last;
  push(`array[0] = array[n] = ${last.value}: a última folha assume a raiz.`, 2, [{ name: 'n', value: `${state.cells.length}` }], { [last.id]: 'inserted' });

  let index = 0;

  for (;;) {
    const leftIndex = index * 2 + 1;
    const rightIndex = index * 2 + 2;
    if (leftIndex >= state.cells.length) break;

    let bigger = leftIndex;
    if (rightIndex < state.cells.length && state.cells[rightIndex].value > state.cells[leftIndex].value) {
      bigger = rightIndex;
    }

    const marks: Record<string, VizNodeState> = { [last.id]: 'inserted', [state.cells[leftIndex].id]: 'compare' };
    if (rightIndex < state.cells.length) marks[state.cells[rightIndex].id] = 'compare';

    if (state.cells[bigger].value <= last.value) {
      push(`${last.value} ≥ filhos: a regra vale → a descida para.`, 4, [{ name: 'i', value: `${index}` }], marks);
      break;
    }

    push(`${last.value} < ${state.cells[bigger].value} (MAIOR filho) → troca.`, 5, [{ name: 'i', value: `${index}` }], marks);
    [state.cells[index], state.cells[bigger]] = [state.cells[bigger], state.cells[index]];
    push(`i = ${bigger}: ${state.cells[index].value} subiu; ${last.value} desceu.`, 6, [{ name: 'i', value: `${bigger}` }], {
      [last.id]: 'inserted',
      [state.cells[index].id]: 'visited',
    });
    index = bigger;
  }

  push(`Heap válido: removerMax devolve ${raiz.value} em O(log n).`, 8, [{ name: 'return', value: `${raiz.value}` }], { [last.id]: 'found' });
  return { scene: heapSceneOf(frames, heapRemoveCode, 'remover máximo'), next: state };
}

/* =====================================================================
   Catálogo — estados iniciais, vazios, previews e operações
   ===================================================================== */

const numberInput = (label: string, sample: string): OpInput => ({ kind: 'number', label, sample });
const textInput = (label: string, sample: string): OpInput => ({ kind: 'text', label, sample });

function makePreview(
  scene: { nodes: VizNode[]; edges?: VizEdge[]; pointers?: VizPointer[] },
  caption: string,
  code: string[],
  width: number,
  height: number,
  operation = 'estado atual',
): VizScene {
  return {
    operation,
    complexity: '—',
    code,
    frames: [previewFrame(scene.nodes, scene.edges ?? [], scene.pointers ?? [], caption)],
    width,
    height,
  };
}

function initialStack(): StackState {
  return { cells: [{ id: 's1', value: 5 }, { id: 's2', value: 8 }], seq: 2 };
}

function initialQueue(): QueueState {
  return { cells: [{ id: 'q1', value: 4, slot: 0 }, { id: 'q2', value: 9, slot: 1 }], primeiro: 0, ultimo: 2, seq: 2 };
}

function initialRing(): RingState {
  const slots: Array<Cell | null> = Array.from({ length: RING_TOTAL }, () => null);
  slots[5] = { id: 'c1', value: 7 };
  slots[6] = { id: 'c2', value: 1 };
  slots[7] = { id: 'c3', value: 6 };
  return { slots, primeiro: 5, ultimo: 0, seq: 3 };
}

function initialList(): ListState {
  return { cells: [{ id: 'l1', value: 10 }, { id: 'l2', value: 20 }, { id: 'l3', value: 30 }], seq: 3 };
}

function initialHash(): HashState {
  return {
    main: [{ id: 'h1', value: 42 }, null, { id: 'h2', value: 23 }, null, null, null, null],
    reserva: [{ id: 'h3', value: 30, homePos: 2 }],
    seq: 3,
  };
}

function initialBst(): BstState {
  let root: BstNode | undefined;
  for (const value of [50, 30, 70, 20, 40, 60, 80]) root = bstInsertNode(root, value);
  return { root: root ?? null };
}

function initialAvl(): AvlState {
  let root: AvlNode | undefined;
  for (const value of [40, 30, 50, 20]) root = rebalance(insertPlain(root, value)).node;
  return { root: root ?? null };
}

function initialTrie(): TrieState {
  return { words: ['asa', 'arte'] };
}

function initialHeap(): HeapState {
  return {
    cells: [90, 70, 80, 30, 40, 60].map((value, index) => ({ id: `p${index + 1}`, value })),
    seq: 6,
  };
}

export const structureCatalog: StructureEntry[] = [
  {
    id: 'pilha',
    name: 'Pilha',
    blurb: 'Sequencial: array + n. LIFO em O(1).',
    initial: initialStack,
    empty: () => ({ cells: [], seq: 0 }) satisfies StackState,
    preview: (state, opId) => {
      const s = state as StackState;
      const { nodes, pointers } = stackRender(s);
      return makePreview({ nodes, pointers }, stateCaption(!s.cells.length, 'pilha'), stackCodeFor(opId), 460, 310);
    },
    ops: [
      { id: 'inserir', label: 'Inserir (push)', input: numberInput('Valor', '7'), run: (state, raw) => stackInsert(state as StackState, raw) },
      { id: 'remover', label: 'Remover (pop)', run: (state) => stackRemove(state as StackState) },
      { id: 'topo', label: 'Consultar topo', run: (state) => stackPeek(state as StackState) },
    ],
  },
  {
    id: 'fila',
    name: 'Fila',
    blurb: 'Em fileira: frente e trás só avançam.',
    initial: initialQueue,
    empty: () => ({ cells: [], primeiro: 0, ultimo: 0, seq: 0 }) satisfies QueueState,
    preview: (state, opId) => {
      const s = state as QueueState;
      const { nodes, pointers } = queueRender(s);
      return makePreview({ nodes, pointers }, stateCaption(s.primeiro === s.ultimo, 'fila'), queueCodeFor(opId), 460, 260);
    },
    ops: [
      { id: 'enfileirar', label: 'Enfileirar', input: numberInput('Valor', '2'), run: (state, raw) => queueInsert(state as QueueState, raw) },
      { id: 'desenfileirar', label: 'Desenfileirar', run: (state) => queueRemove(state as QueueState) },
      { id: 'frente', label: 'Consultar frente', run: (state) => queuePeek(state as QueueState) },
    ],
  },
  {
    id: 'fila-circular',
    name: 'Fila circular',
    blurb: 'Fila.java do Max: índices com módulo.',
    initial: initialRing,
    empty: () => ({ slots: Array.from({ length: RING_TOTAL }, () => null), primeiro: 0, ultimo: 0, seq: 0 }) satisfies RingState,
    preview: (state, opId) => {
      const s = state as RingState;
      const { nodes, pointers } = ringRender(s);
      return makePreview({ nodes, pointers }, stateCaption(s.primeiro === s.ultimo, 'fila circular'), ringCodeFor(opId), 460, 344);
    },
    ops: [
      { id: 'enfileirar', label: 'Enfileirar', input: numberInput('Valor', '9'), run: (state, raw) => ringInsert(state as RingState, raw) },
      { id: 'desenfileirar', label: 'Desenfileirar', run: (state) => ringRemove(state as RingState) },
    ],
  },
  {
    id: 'lista',
    name: 'Lista encadeada',
    blurb: 'Células ordenadas; religação de ponteiros.',
    initial: initialList,
    empty: () => ({ cells: [], seq: 0 }) satisfies ListState,
    preview: (state, opId) => {
      const s = state as ListState;
      const { nodes, edges, pointers } = listRender(s);
      return makePreview({ nodes, edges, pointers }, stateCaption(!s.cells.length, 'lista'), listCodeFor(opId), 460, 300);
    },
    ops: [
      { id: 'inserir', label: 'Inserir', input: numberInput('Valor', '25'), run: (state, raw) => listInsert(state as ListState, raw) },
      { id: 'buscar', label: 'Buscar', input: numberInput('Valor', '20'), run: (state, raw) => listSearch(state as ListState, raw) },
      { id: 'remover', label: 'Remover', input: numberInput('Valor', '20'), run: (state, raw) => listRemove(state as ListState, raw) },
    ],
  },
  {
    id: 'hash',
    name: 'Tabela hash',
    blurb: 'hashDiretoReserva: colisão vai para a reserva.',
    initial: initialHash,
    empty: () => ({ main: [null, null, null, null, null, null, null], reserva: [], seq: 0 }) satisfies HashState,
    preview: (state, opId) => {
      const s = state as HashState;
      const { nodes, edges } = hashRender(s);
      const empty = s.main.every((cell) => !cell) && !s.reserva.length;
      return makePreview({ nodes, edges }, stateCaption(empty, 'tabela hash'), hashCodeFor(opId), 460, 350);
    },
    ops: [
      { id: 'inserir', label: 'Inserir', input: numberInput('Chave', '16'), run: (state, raw) => hashInsert(state as HashState, raw) },
      { id: 'buscar', label: 'Buscar', input: numberInput('Chave', '30'), run: (state, raw) => hashSearch(state as HashState, raw) },
      { id: 'remover', label: 'Remover', input: numberInput('Chave', '23'), run: (state, raw) => hashRemove(state as HashState, raw) },
    ],
  },
  {
    id: 'abb',
    name: 'Árvore de busca (ABB)',
    blurb: 'ArvoreBinaria.java: sem duplicatas.',
    initial: initialBst,
    empty: () => ({ root: null }) satisfies BstState,
    preview: (state, opId) => {
      const s = state as BstState;
      const { nodes, edges, pointers } = bstToViz(s.root);
      return makePreview({ nodes, edges, pointers }, stateCaption(!s.root, 'ABB'), bstCodeFor(opId), 460, 300);
    },
    ops: [
      { id: 'inserir', label: 'Inserir', input: numberInput('Valor', '45'), run: (state, raw) => bstInsert(state as BstState, raw) },
      { id: 'buscar', label: 'Buscar', input: numberInput('Valor', '40'), run: (state, raw) => bstSearch(state as BstState, raw) },
      { id: 'remover', label: 'Remover', input: numberInput('Valor', '30'), run: (state, raw) => bstRemove(state as BstState, raw) },
      { id: 'caminhar', label: 'Caminhamento central', run: (state) => bstWalk(state as BstState) },
    ],
  },
  {
    id: 'avl',
    name: 'Árvore AVL',
    blurb: 'AVL.java: inserir devolve balancear(i).',
    initial: initialAvl,
    empty: () => ({ root: null }) satisfies AvlState,
    preview: (state, opId) => {
      const s = state as AvlState;
      const { nodes, edges, rootId } = avlToViz(s.root ?? undefined, 460);
      return makePreview(
        { nodes, edges, pointers: rootId ? [p(rootId, 'RAIZ', 'top', 'accent')] : [] },
        stateCaption(!s.root, 'AVL'),
        avlCodeFor(opId),
        460,
        300,
      );
    },
    ops: [
      { id: 'inserir', label: 'Inserir', input: numberInput('Valor', '10'), run: (state, raw) => avlInsert(state as AvlState, raw) },
      { id: 'buscar', label: 'Buscar', input: numberInput('Valor', '50'), run: (state, raw) => avlSearch(state as AvlState, raw) },
    ],
  },
  {
    id: 'trie',
    name: 'Árvore TRIE',
    blurb: 'ArvoreTrie.java: folha marca a palavra.',
    initial: initialTrie,
    empty: () => ({ words: [] }) satisfies TrieState,
    preview: (state, opId) => {
      const s = state as TrieState;
      const { nodes, edges, height } = trieToViz(trieBuild(s.words));
      return makePreview(
        { nodes, edges, pointers: [p('t', 'RAIZ', 'left', 'accent')] },
        stateCaption(!s.words.length, 'TRIE'),
        trieCodeFor(opId),
        460,
        height,
      );
    },
    ops: [
      { id: 'inserir', label: 'Inserir palavra', input: textInput('Palavra', 'ave'), run: (state, raw) => trieOp(state as TrieState, 'inserir', raw) },
      { id: 'buscar', label: 'Buscar palavra', input: textInput('Palavra', 'art'), run: (state, raw) => trieOp(state as TrieState, 'buscar', raw) },
    ],
  },
  {
    id: 'heap',
    name: 'Heap',
    blurb: 'Construção do heapsort: pai ≥ filhos.',
    initial: initialHeap,
    empty: () => ({ cells: [], seq: 0 }) satisfies HeapState,
    preview: (state, opId) => {
      const s = state as HeapState;
      const { nodes, edges, pointers } = heapRender(s);
      return makePreview({ nodes, edges, pointers }, stateCaption(!s.cells.length, 'heap'), heapCodeFor(opId), 460, 300);
    },
    ops: [
      { id: 'inserir', label: 'Inserir', input: numberInput('Valor', '85'), run: (state, raw) => heapInsert(state as HeapState, raw) },
      { id: 'remover-max', label: 'Remover máximo', run: (state) => heapRemoveMax(state as HeapState) },
    ],
  },
  {
    id: 'doidona',
    name: 'Estrutura Doidona',
    blurb: 'DoidonaSemTADsProntas: T1 + hashT2 roteando a reserva.',
    configurable: true,
    initial: () => initialDoidonaState(),
    empty: () => emptyDoidonaState(),
    preview: (state, opId) => doidonaPreviewScene(state as DoidonaState, opId as DoidonaOpId),
    ops: (['inserir', 'buscar', 'remover'] as DoidonaOpId[]).map((op) => ({
      id: op,
      label: op === 'inserir' ? 'Inserir' : op === 'buscar' ? 'Buscar' : 'Remover',
      input: numberInput('Valor', op === 'inserir' ? '20' : op === 'buscar' ? '17' : '22'),
      run: (state, raw) => {
        const result = doidonaOpScene(state as DoidonaState, op, parseNumber(raw, op === 'inserir' ? 20 : op === 'buscar' ? 17 : 22));
        return { scene: result.scene, next: result.next };
      },
    })),
  },
];

export { defaultDoidonaConfig };
export type { DoidonaConfig };
