import { avlToViz, balance, insertPlain, rebalance, type AvlNode } from './avlModel';
import { defaultDoidonaConfig, doidonaScene, type DoidonaConfig, type DoidonaOpId } from './doidona';
import { buildLevelOrderTree, e, layoutTree, n, p, snap, type TreeNode } from './sceneUtils';
import type { VizEdge, VizFrame, VizNode, VizNodeState, VizPointer, VizScene, VizVar } from './vizTypes';

/* =====================================================================
   Operações interativas da aba "Estruturas": o usuário escolhe a
   estrutura, a operação e o valor; a cena é gerada sob medida.
   ===================================================================== */

export type OpInput = { kind: 'number' | 'text'; label: string; sample: string };

export type StructureOp = {
  id: string;
  label: string;
  input?: OpInput;
  run: (value: string, config: DoidonaConfig) => VizScene;
};

export type StructureEntry = {
  id: string;
  name: string;
  blurb: string;
  configurable?: boolean;
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

/* =====================================================================
   PILHA
   ===================================================================== */

const STACK_X = 230;
const stackSlotY = (index: number) => 258 - index * 48;

function stackBase(): { slots: VizNode[]; items: VizNode[] } {
  const slots = [0, 1, 2, 3, 4].map((index) =>
    n(`slot${index}`, STACK_X, stackSlotY(index), '', { shape: 'slot', w: 96, h: 42, sub: `${index}` }),
  );
  const items = [
    n('s5', STACK_X, stackSlotY(0), '5', { shape: 'box', w: 88, h: 36 }),
    n('s8', STACK_X, stackSlotY(1), '8', { shape: 'box', w: 88, h: 36 }),
  ];
  return { slots, items };
}

const stackPtr = (index: number) => [p(`slot${index}`, 'TOPO', 'right', 'primary')];

function stackInsertScene(raw: string): VizScene {
  const value = parseNumber(raw, 7);
  const code = ['push(x):', '  topo = topo + 1', '  dados[topo] = x'];
  const { slots, items } = stackBase();
  const frames: VizFrame[] = [];

  frames.push(snap([...slots, ...items], [], stackPtr(1), 'Pilha LIFO: o último a entrar é o primeiro a sair.', undefined, [{ name: 'topo', value: '1' }]));

  const novo = n('novo', 390, 88, `${value}`, { shape: 'box', w: 88, h: 36, state: 'inserted' });
  frames.push(snap([...slots, ...items, novo], [], stackPtr(1), `push(${value}): o novo elemento chega pelo topo.`, 0, [{ name: 'x', value: `${value}` }]));
  frames.push(snap([...slots, ...items, novo], [], stackPtr(2), 'topo avança para a próxima posição livre.', 1, [{ name: 'topo', value: '2' }]));

  novo.x = STACK_X;
  novo.y = stackSlotY(2);
  frames.push(snap([...slots, ...items, novo], [], stackPtr(2), `${value} desliza para a posição do topo.`, 2, [{ name: 'topo', value: '2' }]));

  novo.state = 'found';
  frames.push(snap([...slots, ...items, novo], [], stackPtr(2), 'push concluído: custo O(1), sem tocar nos demais.', 2, [{ name: 'topo', value: '2' }]));

  return { operation: `push(${value})`, complexity: 'O(1)', code, frames, width: 460, height: 310 };
}

function stackRemoveScene(): VizScene {
  const code = ['pop():', '  x = dados[topo]', '  topo = topo - 1', '  return x'];
  const { slots, items } = stackBase();
  const frames: VizFrame[] = [];
  const topo = items[items.length - 1];

  frames.push(snap([...slots, ...items], [], stackPtr(1), 'pop() sempre atua no elemento apontado por topo.', 0, [{ name: 'topo', value: '1' }]));

  topo.state = 'active';
  frames.push(snap([...slots, ...items], [], stackPtr(1), `Lê o valor do topo: x = ${topo.label}.`, 1, [{ name: 'x', value: topo.label }]));

  topo.state = 'removed';
  topo.x = 390;
  topo.y = 88;
  frames.push(snap([...slots, ...items], [], stackPtr(1), `${topo.label} sai pelo topo da pilha.`, 1, [{ name: 'x', value: topo.label }]));

  items.pop();
  frames.push(snap([...slots, ...items], [], stackPtr(0), 'topo recua uma posição. pop custa O(1).', 2, [{ name: 'topo', value: '0' }]));

  return { operation: 'pop()', complexity: 'O(1)', code, frames, width: 460, height: 310 };
}

function stackPeekScene(): VizScene {
  const code = ['topo():', '  return dados[topo]  // não remove'];
  const { slots, items } = stackBase();
  const frames: VizFrame[] = [];
  const topo = items[items.length - 1];

  frames.push(snap([...slots, ...items], [], stackPtr(1), 'Consultar topo: apenas lê, sem alterar a pilha.', 0, [{ name: 'topo', value: '1' }]));

  topo.state = 'compare';
  frames.push(snap([...slots, ...items], [], stackPtr(1), 'O ponteiro topo já indica onde olhar: nenhuma busca é necessária.', 1, [{ name: 'topo', value: '1' }]));

  topo.state = 'found';
  frames.push(snap([...slots, ...items], [], stackPtr(1), `Resultado: ${topo.label}. A pilha continua exatamente igual.`, 1, [{ name: 'retorno', value: topo.label }]));

  return { operation: 'consultar topo', complexity: 'O(1)', code, frames, width: 460, height: 310 };
}

/* =====================================================================
   FILA
   ===================================================================== */

const QUEUE_Y = 168;
const queueSlotX = (index: number) => 70 + index * 82;

function queueBase(): { slots: VizNode[]; items: VizNode[] } {
  const slots = [0, 1, 2, 3, 4].map((index) =>
    n(`slot${index}`, queueSlotX(index), QUEUE_Y, '', { shape: 'slot', w: 72, h: 46, sub: `${index}` }),
  );
  const items = [
    n('q4', queueSlotX(0), QUEUE_Y, '4', { shape: 'box', w: 64, h: 40 }),
    n('q9', queueSlotX(1), QUEUE_Y, '9', { shape: 'box', w: 64, h: 40 }),
  ];
  return { slots, items };
}

const queuePtrs = (frente: number, tras: number): VizPointer[] => [
  p(`slot${frente}`, 'FRENTE', 'top', 'accent'),
  p(`slot${tras}`, 'TRÁS', 'bottom', 'primary'),
];

function queueInsertScene(raw: string): VizScene {
  const value = parseNumber(raw, 2);
  const code = ['enfileirar(x):', '  dados[tras] = x', '  tras = tras + 1'];
  const { slots, items } = queueBase();
  const frames: VizFrame[] = [];

  frames.push(snap([...slots, ...items], [], queuePtrs(0, 1), 'Fila FIFO: o primeiro a entrar é o primeiro a sair.', undefined, [{ name: 'frente', value: '0' }, { name: 'tras', value: '1' }]));

  const novo = n('novo', 400, 70, `${value}`, { shape: 'box', w: 64, h: 40, state: 'inserted' });
  frames.push(snap([...slots, ...items, novo], [], queuePtrs(0, 1), `enfileirar(${value}): o elemento chega pelo final.`, 0, [{ name: 'x', value: `${value}` }]));

  novo.x = queueSlotX(2);
  novo.y = QUEUE_Y;
  frames.push(snap([...slots, ...items, novo], [], queuePtrs(0, 2), `${value} entra na posição de trás.`, 1, [{ name: 'tras', value: '2' }]));

  novo.state = 'found';
  frames.push(snap([...slots, ...items, novo], [], queuePtrs(0, 2), 'trás avança. Inserção no final: O(1).', 2, [{ name: 'frente', value: '0' }, { name: 'tras', value: '2' }]));

  return { operation: `enfileirar(${value})`, complexity: 'O(1)', code, frames, width: 460, height: 260 };
}

function queueRemoveScene(): VizScene {
  const code = ['desenfileirar():', '  x = dados[frente]', '  frente = frente + 1', '  return x'];
  const { slots, items } = queueBase();
  const frames: VizFrame[] = [];
  const primeiro = items[0];

  frames.push(snap([...slots, ...items], [], queuePtrs(0, 1), 'A remoção acontece sempre pela frente da fila.', 0, [{ name: 'frente', value: '0' }]));

  primeiro.state = 'active';
  frames.push(snap([...slots, ...items], [], queuePtrs(0, 1), `Lê o elemento da frente: x = ${primeiro.label}.`, 1, [{ name: 'x', value: primeiro.label }]));

  primeiro.state = 'removed';
  primeiro.x = 40;
  primeiro.y = 70;
  frames.push(snap([...slots, ...items], [], queuePtrs(0, 1), `${primeiro.label} sai pela frente: a ordem de chegada foi respeitada.`, 1, [{ name: 'x', value: primeiro.label }]));

  items.shift();
  frames.push(snap([...slots, ...items], [], queuePtrs(1, 1), 'frente avança. Nenhum elemento é copiado: O(1).', 2, [{ name: 'frente', value: '1' }]));

  return { operation: 'desenfileirar()', complexity: 'O(1)', code, frames, width: 460, height: 260 };
}

function queuePeekScene(): VizScene {
  const code = ['frente():', '  return dados[frente]  // não remove'];
  const { slots, items } = queueBase();
  const frames: VizFrame[] = [];
  const primeiro = items[0];

  frames.push(snap([...slots, ...items], [], queuePtrs(0, 1), 'Consultar frente: lê o próximo a sair, sem removê-lo.', 0));

  primeiro.state = 'compare';
  frames.push(snap([...slots, ...items], [], queuePtrs(0, 1), 'O ponteiro frente já aponta o elemento: acesso direto.', 1, [{ name: 'frente', value: '0' }]));

  primeiro.state = 'found';
  frames.push(snap([...slots, ...items], [], queuePtrs(0, 1), `Resultado: ${primeiro.label}. A fila continua igual.`, 1, [{ name: 'retorno', value: primeiro.label }]));

  return { operation: 'consultar frente', complexity: 'O(1)', code, frames, width: 460, height: 260 };
}

/* =====================================================================
   FILA CIRCULAR
   ===================================================================== */

const RING_TOTAL = 8;
const RING_CX = 230;
const RING_CY = 172;

function ringPos(index: number): { x: number; y: number } {
  const angle = ((index * 360) / RING_TOTAL - 90) * (Math.PI / 180);
  return { x: RING_CX + 108 * Math.cos(angle), y: RING_CY + 108 * Math.sin(angle) };
}

function ringBase(): { slots: VizNode[]; items: Array<{ node: VizNode; slot: number }> } {
  const slots = Array.from({ length: RING_TOTAL }, (_, index) => {
    const at = ringPos(index);
    return n(`slot${index}`, at.x, at.y, '', { shape: 'slot', w: 52, h: 40, sub: `${index}` });
  });
  const mk = (value: number, slot: number) => {
    const at = ringPos(slot);
    return { node: n(`c${value}`, at.x, at.y, `${value}`, { shape: 'box', w: 46, h: 34 }), slot };
  };
  return { slots, items: [mk(7, 5), mk(1, 6), mk(6, 7)] };
}

const ringPtrs = (frente: number, tras: number): VizPointer[] => [
  p(`slot${frente}`, 'FRENTE', frente >= 2 && frente <= 6 ? 'bottom' : 'top', 'accent'),
  p(`slot${tras}`, 'TRÁS', tras >= 2 && tras <= 6 ? 'bottom' : 'top', 'primary'),
];

function ringInsertScene(raw: string): VizScene {
  const value = parseNumber(raw, 9);
  const code = ['enfileirar(x):', '  dados[tras] = x', '  tras = (tras + 1) % n'];
  const { slots, items } = ringBase();
  const nodes = () => [...slots, ...items.map((item) => item.node)];
  const frames: VizFrame[] = [];

  frames.push(snap(nodes(), [], ringPtrs(5, 0), 'Fila circular: o vetor "dá a volta" com aritmética modular.', undefined, [{ name: 'frente', value: '5' }, { name: 'tras', value: '0' }, { name: 'n', value: '8' }]));

  const novo = n('novo', RING_CX, RING_CY, `${value}`, { shape: 'box', w: 46, h: 34, state: 'inserted' });
  frames.push(snap([...nodes(), novo], [], ringPtrs(5, 0), `enfileirar(${value}): trás está no índice 0 — já deu a volta!`, 0, [{ name: 'x', value: `${value}` }, { name: 'tras', value: '0' }]));

  const alvo = ringPos(0);
  novo.x = alvo.x;
  novo.y = alvo.y;
  frames.push(snap([...nodes(), novo], [], ringPtrs(5, 0), `${value} ocupa o índice 0 sem deslocar ninguém.`, 1, [{ name: 'tras', value: '0' }]));

  novo.state = 'found';
  frames.push(snap([...nodes(), novo], [], ringPtrs(5, 1), 'tras = (0 + 1) % 8 = 1. O módulo evita estourar o vetor.', 2, [{ name: 'tras', value: '1' }]));

  return { operation: `enfileirar(${value}) com volta`, complexity: 'O(1)', code, frames, width: 460, height: 344 };
}

function ringRemoveScene(): VizScene {
  const code = ['desenfileirar():', '  x = dados[frente]', '  frente = (frente + 1) % n', '  return x'];
  const { slots, items } = ringBase();
  const nodes = () => [...slots, ...items.map((item) => item.node)];
  const frames: VizFrame[] = [];
  const primeiro = items[0].node;

  frames.push(snap(nodes(), [], ringPtrs(5, 0), 'Na fila circular a remoção também respeita a frente.', 0, [{ name: 'frente', value: '5' }]));

  primeiro.state = 'active';
  frames.push(snap(nodes(), [], ringPtrs(5, 0), `Lê o elemento da frente: x = ${primeiro.label}.`, 1, [{ name: 'x', value: primeiro.label }]));

  primeiro.state = 'removed';
  primeiro.x = RING_CX;
  primeiro.y = RING_CY;
  frames.push(snap(nodes(), [], ringPtrs(5, 0), `${primeiro.label} sai da fila.`, 1, [{ name: 'x', value: primeiro.label }]));

  items.shift();
  frames.push(snap(nodes(), [], ringPtrs(6, 0), 'frente = (5 + 1) % 8 = 6. Nada foi copiado: O(1).', 2, [{ name: 'frente', value: '6' }]));

  return { operation: 'desenfileirar()', complexity: 'O(1)', code, frames, width: 460, height: 344 };
}

/* =====================================================================
   LISTA ENCADEADA (ordenada)
   ===================================================================== */

const LIST_Y = 150;
const LIST_BASE = [10, 20, 30];

function listNodes(values: number[], marks: Record<number, VizNodeState> = {}): { nodes: VizNode[]; edges: VizEdge[] } {
  const gap = Math.min(100, 340 / Math.max(values.length, 1));
  const nodes: VizNode[] = values.map((value, index) =>
    n(`l${value}`, 66 + index * gap, LIST_Y, `${value}`, { shape: 'box', w: 62, h: 44, state: marks[value] ?? 'default' }),
  );
  nodes.push(n('lnull', 66 + values.length * gap, LIST_Y, '∅', { shape: 'pill', w: 50, h: 36 }));

  const edges: VizEdge[] = values.map((value, index) =>
    e(`l${value}`, index + 1 < values.length ? `l${values[index + 1]}` : 'lnull', { arrow: true }),
  );

  return { nodes, edges };
}

const listPtr = (values: number[]) => (values.length ? [p(`l${values[0]}`, 'INÍCIO', 'top', 'accent')] : []);

function listInsertScene(raw: string): VizScene {
  const value = parseNumber(raw, 25);
  const code = [
    'inserir(x):',
    '  p = inicio',
    '  enquanto p.prox.valor < x:',
    '    p = p.prox',
    '  novo.prox = p.prox',
    '  p.prox = novo',
  ];

  const values = [...LIST_BASE];
  const frames: VizFrame[] = [];
  const marks: Record<number, VizNodeState> = {};

  const push = (caption: string, codeLine?: number, vars?: VizVar[], extra?: VizNode[]) => {
    const { nodes, edges } = listNodes(values, marks);
    frames.push(snap([...nodes, ...(extra ?? [])], edges, listPtr(values), caption, codeLine, vars));
  };

  if (values.includes(value)) {
    push(`inserir(${value}): o valor já está na lista — nada a fazer.`, 0, [{ name: 'x', value: `${value}` }]);
    marks[value] = 'found';
    push('Lista ordenada sem repetidos: inserção ignorada.', 0);
    return { operation: `inserir(${value})`, complexity: 'O(n)', code, frames, width: 460, height: 300 };
  }

  push('Lista encadeada ordenada: cada nó aponta para o próximo.', 0, [{ name: 'x', value: `${value}` }]);

  const novo = n(`l${value}`, 230, 250, `${value}`, { shape: 'box', w: 62, h: 44, state: 'inserted' });
  push(`inserir(${value}): achar o ponto certo sem perder ponteiros.`, 1, [{ name: 'x', value: `${value}` }], [novo]);

  let index = 0;
  while (index < values.length && values[index] < value) {
    marks[values[index]] = 'compare';
    push(`p em ${values[index]}: ${values[index]} < ${value} → avança.`, 2, [{ name: 'p', value: `${values[index]}` }], [novo]);
    marks[values[index]] = 'visited';
    index += 1;
  }

  const before = index > 0 ? values[index - 1] : null;
  const after = index < values.length ? values[index] : null;

  if (after !== null) {
    marks[after] = 'compare';
    push(`${after} ≥ ${value}: o novo nó entra antes de ${after}.`, 3, [{ name: 'p', value: before !== null ? `${before}` : 'início' }], [novo]);
    marks[after] = 'default';
  }

  push(`Primeiro: novo.prox aponta para ${after ?? '∅'}. Ninguém fica órfão.`, 4, [{ name: 'novo.prox', value: after !== null ? `${after}` : '∅' }], [novo]);

  values.splice(index, 0, value);
  marks[value] = 'inserted';
  push(before !== null ? `Depois: ${before}.prox = novo. Corrente religada.` : 'Novo nó vira o início da lista.', 5, [{ name: 'p.prox', value: `${value}` }]);

  marks[value] = 'found';
  push(`${value} está no lugar certo: busca O(n), religação O(1).`, 5);

  return { operation: `inserir(${value})`, complexity: 'O(n)', code, frames, width: 460, height: 300 };
}

function listSearchScene(raw: string): VizScene {
  const value = parseNumber(raw, 20);
  const code = ['buscar(x):', '  p = inicio', '  enquanto p != null e p.valor < x:', '    p = p.prox', '  return p != null e p.valor == x'];

  const values = [...LIST_BASE];
  const frames: VizFrame[] = [];
  const marks: Record<number, VizNodeState> = {};

  const push = (caption: string, codeLine?: number, vars?: VizVar[]) => {
    const { nodes, edges } = listNodes(values, marks);
    frames.push(snap(nodes, edges, listPtr(values), caption, codeLine, vars));
  };

  push(`buscar(${value}): a lista ordenada permite parar cedo.`, 1, [{ name: 'x', value: `${value}` }]);

  for (const current of values) {
    marks[current] = 'compare';

    if (current === value) {
      push(`p em ${current}: é igual a ${value} → encontrado!`, 4, [{ name: 'p', value: `${current}` }, { name: 'resultado', value: 'true' }]);
      marks[current] = 'found';
      push('Busca termina no próprio nó: O(n) no pior caso.', 4);
      return { operation: `buscar(${value})`, complexity: 'O(n)', code, frames, width: 460, height: 300 };
    }

    if (current > value) {
      push(`p em ${current}: ${current} > ${value}. A lista é ordenada → ${value} não está.`, 2, [{ name: 'p', value: `${current}` }, { name: 'resultado', value: 'false' }]);
      marks[current] = 'error';
      push('Parada antecipada: vantagem de manter a lista ordenada.', 4);
      return { operation: `buscar(${value})`, complexity: 'O(n)', code, frames, width: 460, height: 300 };
    }

    push(`p em ${current}: ${current} < ${value} → avança.`, 3, [{ name: 'p', value: `${current}` }]);
    marks[current] = 'visited';
  }

  push(`Chegou em ∅ sem achar ${value}: não está na lista.`, 4, [{ name: 'resultado', value: 'false' }]);
  return { operation: `buscar(${value})`, complexity: 'O(n)', code, frames, width: 460, height: 300 };
}

function listRemoveScene(raw: string): VizScene {
  const value = parseNumber(raw, 20);
  const code = ['remover(x):', '  p = inicio; anterior = null', '  avança até achar x', '  anterior.prox = p.prox', '  libera o nó'];

  const values = [...LIST_BASE];
  const frames: VizFrame[] = [];
  const marks: Record<number, VizNodeState> = {};

  const push = (caption: string, codeLine?: number, vars?: VizVar[]) => {
    const { nodes, edges } = listNodes(values, marks);
    frames.push(snap(nodes, edges, listPtr(values), caption, codeLine, vars));
  };

  push(`remover(${value}): localizar mantendo o anterior por perto.`, 1, [{ name: 'x', value: `${value}` }]);

  if (!values.includes(value)) {
    for (const current of values) {
      if (current > value) break;
      marks[current] = 'visited';
    }
    push(`${value} não está na lista: nada a remover.`, 2, [{ name: 'resultado', value: 'false' }]);
    return { operation: `remover(${value})`, complexity: 'O(n)', code, frames, width: 460, height: 300 };
  }

  for (const current of values) {
    if (current === value) break;
    marks[current] = 'compare';
    push(`p em ${current}: ainda não é ${value} → avança guardando o anterior.`, 2, [{ name: 'anterior', value: `${current}` }]);
    marks[current] = 'visited';
  }

  const index = values.indexOf(value);
  const before = index > 0 ? values[index - 1] : null;
  const after = index + 1 < values.length ? values[index + 1] : null;

  marks[value] = 'removed';
  push(`Achou ${value}. O anterior passa a apontar para ${after ?? '∅'}.`, 3, [{ name: 'anterior.prox', value: after !== null ? `${after}` : '∅' }]);

  values.splice(index, 1);
  if (before !== null) marks[before] = 'visited';
  push(`${value} saiu; a corrente se fecha sem deslocar ninguém.`, 4, [{ name: 'resultado', value: 'true' }]);

  return { operation: `remover(${value})`, complexity: 'O(n)', code, frames, width: 460, height: 300 };
}

/* =====================================================================
   TABELA HASH (encadeamento)
   ===================================================================== */

const HASH_SIZE = 7;
const HASH_Y = 176;
const hashSlotX = (index: number) => 55 + index * 58;

type HashBuckets = number[][];

function hashBase(): HashBuckets {
  const buckets: HashBuckets = Array.from({ length: HASH_SIZE }, () => []);
  buckets[0] = [42];
  buckets[2] = [23, 30];
  return buckets;
}

function hashNodes(buckets: HashBuckets, marks: Record<number, VizNodeState> = {}): { nodes: VizNode[]; edges: VizEdge[] } {
  const nodes: VizNode[] = [];
  const edges: VizEdge[] = [];

  for (let index = 0; index < HASH_SIZE; index += 1) {
    nodes.push(n(`slot${index}`, hashSlotX(index), HASH_Y, '', { shape: 'slot', w: 50, h: 46, sub: `${index}` }));

    buckets[index].forEach((value, depth) => {
      nodes.push(
        n(`hv${value}`, hashSlotX(index), HASH_Y + depth * 62, `${value}`, {
          shape: 'pill',
          w: 52,
          h: 32,
          state: marks[value] ?? 'default',
        }),
      );
      if (depth > 0) {
        edges.push(e(`hv${buckets[index][depth - 1]}`, `hv${value}`, { arrow: true }));
      }
    });
  }

  return { nodes, edges };
}

function hashOpScene(op: 'inserir' | 'buscar' | 'remover', raw: string): VizScene {
  const value = parseNumber(raw, op === 'inserir' ? 16 : 30);
  const pos = value % HASH_SIZE;
  const buckets = hashBase();
  const frames: VizFrame[] = [];
  const marks: Record<number, VizNodeState> = {};

  const code =
    op === 'inserir'
      ? [`inserir(chave):`, `  pos = chave % ${HASH_SIZE}`, '  se tabela[pos] livre: entra direto', '  senão: encadeia na posição  // colisão']
      : op === 'buscar'
        ? [`buscar(chave):`, `  pos = chave % ${HASH_SIZE}`, '  se tabela[pos] vazia: não está', '  percorre a corrente comparando', '  só conclui ausência no fim da corrente']
        : [`remover(chave):`, `  pos = chave % ${HASH_SIZE}`, '  localiza a chave na corrente', '  religa a corrente sem a chave'];

  const push = (caption: string, codeLine?: number, vars?: VizVar[], extra?: VizNode[], pointers?: VizPointer[]) => {
    const { nodes, edges } = hashNodes(buckets, marks);
    frames.push(snap([...nodes, ...(extra ?? [])], edges, pointers ?? [], caption, codeLine, vars));
  };

  const staging = n('chave', 230, 60, `${value}`, { shape: 'pill', w: 56, h: 34, state: 'active' });
  const posPtr = [p(`slot${pos}`, 'pos', 'bottom', 'warning')];

  push('Tabela hash com encadeamento: a chave vira índice por uma conta.', 0, [{ name: 'chave', value: `${value}` }], [staging]);
  push(`pos = ${value} % ${HASH_SIZE} = ${pos}: acesso direto, sem varrer a tabela.`, 1, [{ name: 'pos', value: `${pos}` }], [staging], posPtr);

  const bucket = buckets[pos];

  if (op === 'inserir') {
    if (bucket.includes(value)) {
      marks[value] = 'found';
      push(`${value} já está na posição ${pos}: nada muda.`, 2, [{ name: 'resultado', value: 'já existe' }]);
    } else if (bucket.length === 0) {
      bucket.push(value);
      marks[value] = 'inserted';
      push(`Posição ${pos} livre: ${value} entra sem nenhuma comparação.`, 2, [{ name: 'pos', value: `${pos}` }]);
      marks[value] = 'found';
      push('Inserção direta: o caso médio da hash é O(1).', 2);
    } else {
      marks[bucket[0]] = 'compare';
      push(`Colisão! ${bucket[0]} já ocupa a posição ${pos}.`, 3, [{ name: 'pos', value: `${pos}` }], [{ ...staging, state: 'error' }]);
      marks[bucket[0]] = 'visited';
      bucket.push(value);
      marks[value] = 'inserted';
      push(`${value} entra encadeado na posição ${pos}: colisão não é ausência.`, 3, [{ name: 'corrente', value: `${bucket.length}` }]);
      marks[value] = 'found';
      push('A corrente cresce, mas continua curta se a função espalhar bem.', 3);
    }
  } else {
    if (bucket.length === 0) {
      push(`Posição ${pos} vazia: se ${value} existisse, estaria aqui → não está.`, 2, [{ name: 'resultado', value: 'false' }], [{ ...staging, state: 'error' }], posPtr);
      return { operation: `${op}(${value})`, complexity: 'O(1) médio', code, frames, width: 460, height: 330 };
    }

    let found = false;

    for (const current of bucket) {
      marks[current] = 'compare';

      if (current === value) {
        push(`Compara com ${current}: é a chave procurada!`, 2, [{ name: 'atual', value: `${current}` }, { name: 'resultado', value: 'true' }], [staging]);
        marks[current] = 'found';
        found = true;
        break;
      }

      push(`Compara com ${current}: diferente → segue pela corrente.`, 3, [{ name: 'atual', value: `${current}` }], [staging]);
      marks[current] = 'visited';
    }

    if (!found) {
      push(`Fim da corrente sem achar ${value}: só agora se conclui ausência.`, 4, [{ name: 'resultado', value: 'false' }]);
    } else if (op === 'remover') {
      marks[value] = 'removed';
      push(`${value} sai da corrente.`, 2, [{ name: 'resultado', value: 'true' }]);
      buckets[pos] = bucket.filter((item) => item !== value);
      delete marks[value];
      push('A corrente se religa; quem estava abaixo sobe uma posição.', 3);
    } else {
      push(`Busca resolvida na posição ${pos} com ${bucket.indexOf(value) + 1} comparação(ões).`, 4);
    }
  }

  return { operation: `${op}(${value})`, complexity: 'O(1) médio', code, frames, width: 460, height: 330 };
}

/* =====================================================================
   ABB — árvore binária de pesquisa
   ===================================================================== */

type BstNode = { key: number; left?: BstNode; right?: BstNode };

const BST_BASE = [50, 30, 70, 20, 40, 60, 80];

function bstInsertNode(root: BstNode | undefined, key: number): BstNode {
  if (!root) return { key };
  if (key < root.key) return { ...root, left: bstInsertNode(root.left, key) };
  if (key > root.key) return { ...root, right: bstInsertNode(root.right, key) };
  return root;
}

function bstBuild(values: number[]): BstNode | undefined {
  return values.reduce<BstNode | undefined>((root, value) => bstInsertNode(root, value), undefined);
}

function bstMax(node: BstNode): number {
  return node.right ? bstMax(node.right) : node.key;
}

function bstRemoveNode(root: BstNode | undefined, key: number): BstNode | undefined {
  if (!root) return undefined;
  if (key < root.key) return { ...root, left: bstRemoveNode(root.left, key) };
  if (key > root.key) return { ...root, right: bstRemoveNode(root.right, key) };
  if (!root.left && !root.right) return undefined;
  if (!root.left) return root.right;
  if (!root.right) return root.left;
  const predecessor = bstMax(root.left);
  return { key: predecessor, left: bstRemoveNode(root.left, predecessor), right: root.right };
}

function bstToViz(root: BstNode | undefined, marks: Record<number, VizNodeState> = {}): { nodes: VizNode[]; edges: VizEdge[]; pointers: VizPointer[] } {
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

function bstDescendFrames(
  root: BstNode,
  value: number,
  marks: Record<number, VizNodeState>,
  push: (caption: string, codeLine?: number, vars?: VizVar[]) => void,
  codeLines: { less: number; more: number; equal: number },
): BstNode | undefined {
  let cursor: BstNode | undefined = root;

  while (cursor) {
    marks[cursor.key] = 'compare';

    if (value === cursor.key) {
      push(`${value} == ${cursor.key}: nó localizado.`, codeLines.equal, [{ name: 'no', value: `${cursor.key}` }]);
      return cursor;
    }

    const goLeft: boolean = value < cursor.key;
    push(`${value} ${goLeft ? '<' : '>'} ${cursor.key} → desce para a ${goLeft ? 'esquerda' : 'direita'}.`, goLeft ? codeLines.less : codeLines.more, [
      { name: 'no', value: `${cursor.key}` },
      { name: 'x', value: `${value}` },
    ]);
    marks[cursor.key] = 'visited';
    cursor = goLeft ? cursor.left : cursor.right;
  }

  return undefined;
}

function bstSearchScene(raw: string): VizScene {
  const value = parseNumber(raw, 40);
  const code = ['buscar(no, x):', '  se no == null: não está', '  se x == no.valor: achou!', '  se x < no.valor: buscar(no.esq)', '  senão: buscar(no.dir)'];
  const root = bstBuild(BST_BASE)!;
  const marks: Record<number, VizNodeState> = {};
  const frames: VizFrame[] = [];

  const push = (caption: string, codeLine?: number, vars?: VizVar[]) => {
    const { nodes, edges, pointers } = bstToViz(root, marks);
    frames.push(snap(nodes, edges, pointers, caption, codeLine, vars));
  };

  push(`ABB: menores à esquerda, maiores à direita. Vamos buscar ${value}.`, 0, [{ name: 'x', value: `${value}` }]);

  const found = bstDescendFrames(root, value, marks, push, { less: 3, more: 4, equal: 2 });

  if (found) {
    marks[found.key] = 'found';
    push(`Encontrado! Cada comparação descarta metade da árvore.`, 2, [{ name: 'resultado', value: 'true' }]);
  } else {
    push(`Chegou em um ponteiro nulo: ${value} não está na árvore.`, 1, [{ name: 'resultado', value: 'false' }]);
  }

  return { operation: `buscar(${value})`, complexity: 'O(altura)', code, frames, width: 460, height: 300 };
}

function bstInsertScene(raw: string): VizScene {
  const value = parseNumber(raw, 45);
  const code = ['inserir(no, x):', '  desce comparando, como na busca', '  ao achar ponteiro nulo:', '    cria a folha x'];
  let root = bstBuild(BST_BASE)!;
  const marks: Record<number, VizNodeState> = {};
  const frames: VizFrame[] = [];

  const push = (caption: string, codeLine?: number, vars?: VizVar[]) => {
    const { nodes, edges, pointers } = bstToViz(root, marks);
    frames.push(snap(nodes, edges, pointers, caption, codeLine, vars));
  };

  push(`inserir(${value}): a descida é a mesma da busca.`, 0, [{ name: 'x', value: `${value}` }]);

  const existing = bstDescendFrames(root, value, marks, push, { less: 1, more: 1, equal: 1 });

  if (existing) {
    marks[existing.key] = 'found';
    push('ABB não guarda valores repetidos: inserção ignorada.', 1);
  } else {
    push('Ponteiro nulo encontrado: é aqui que o novo nó nasce.', 2);
    root = bstInsertNode(root, value);
    marks[value] = 'inserted';
    push(`${value} entra como folha, sem mover nenhum outro nó.`, 3, [{ name: 'x', value: `${value}` }]);
    marks[value] = 'found';
    push('Inserção proporcional à altura: O(log n) se balanceada.', 3);
  }

  return { operation: `inserir(${value})`, complexity: 'O(altura)', code, frames, width: 460, height: 300 };
}

function bstRemoveScene(raw: string): VizScene {
  const value = parseNumber(raw, 30);
  const code = [
    'remover(no, x):',
    '  localiza x descendo como na busca',
    '  folha: remove direto',
    '  1 filho: o filho assume o lugar',
    '  2 filhos: substitui pelo MAIOR da esquerda',
  ];
  let root = bstBuild(BST_BASE)!;
  const marks: Record<number, VizNodeState> = {};
  const frames: VizFrame[] = [];

  const push = (caption: string, codeLine?: number, vars?: VizVar[]) => {
    const { nodes, edges, pointers } = bstToViz(root, marks);
    frames.push(snap(nodes, edges, pointers, caption, codeLine, vars));
  };

  push(`remover(${value}): primeiro é preciso localizar o nó.`, 1, [{ name: 'x', value: `${value}` }]);

  const target = bstDescendFrames(root, value, marks, push, { less: 1, more: 1, equal: 1 });

  if (!target) {
    push(`${value} não está na árvore: nada a remover.`, 1, [{ name: 'resultado', value: 'false' }]);
    return { operation: `remover(${value})`, complexity: 'O(altura)', code, frames, width: 460, height: 300 };
  }

  const children = (target.left ? 1 : 0) + (target.right ? 1 : 0);

  if (children === 0) {
    marks[value] = 'removed';
    push(`${value} é folha: pode sair sem afetar ninguém.`, 2);
    root = bstRemoveNode(root, value)!;
    push('Remoção de folha: o pai apenas solta o ponteiro.', 2);
  } else if (children === 1) {
    marks[value] = 'removed';
    const child = (target.left ?? target.right)!;
    marks[child.key] = 'inserted';
    push(`${value} tem um único filho: ${child.key} assume o lugar dele.`, 3, [{ name: 'filho', value: `${child.key}` }]);
    root = bstRemoveNode(root, value)!;
    marks[child.key] = 'found';
    push('O filho sobe com toda a sua subárvore intacta.', 3);
  } else {
    marks[value] = 'removed';
    push(`${value} tem 2 filhos: procurar o MAIOR da subárvore esquerda.`, 4);

    let walker = target.left!;
    marks[walker.key] = 'compare';
    push(`Desce para a esquerda (${walker.key}) e depois sempre à direita.`, 4, [{ name: 'no', value: `${walker.key}` }]);

    while (walker.right) {
      marks[walker.key] = 'visited';
      walker = walker.right;
      marks[walker.key] = 'compare';
      push(`Ainda há filho à direita → segue até ${walker.key}.`, 4, [{ name: 'no', value: `${walker.key}` }]);
    }

    marks[walker.key] = 'found';
    push(`${walker.key} é o antecessor: maior valor menor que ${value}.`, 4, [{ name: 'antecessor', value: `${walker.key}` }]);

    root = bstRemoveNode(root, value)!;
    delete marks[value];
    marks[walker.key] = 'inserted';
    push(`${walker.key} assume a posição de ${value}; a regra da ABB continua válida.`, 4);
    marks[walker.key] = 'found';
    push('Remoção com 2 filhos concluída sem quebrar a ordenação.', 4);
  }

  return { operation: `remover(${value})`, complexity: 'O(altura)', code, frames, width: 460, height: 300 };
}

function bstTraverseScene(): VizScene {
  const code = ['central(no):', '  se no == null: retorna', '  central(no.esq)', '  processa(no.valor)', '  central(no.dir)'];
  const root = bstBuild(BST_BASE)!;
  const marks: Record<number, VizNodeState> = {};
  const frames: VizFrame[] = [];
  const output: number[] = [];

  const push = (caption: string, codeLine?: number, vars?: VizVar[]) => {
    const { nodes, edges, pointers } = bstToViz(root, marks);
    frames.push(snap(nodes, edges, pointers, caption, codeLine, vars));
  };

  push('Caminhamento central (in-ordem): esquerda → nó → direita.', 0);

  const inOrder: number[] = [];
  (function walk(node?: BstNode) {
    if (!node) return;
    walk(node.left);
    inOrder.push(node.key);
    walk(node.right);
  })(root);

  for (const key of inOrder) {
    marks[key] = 'active';
    output.push(key);
    push(`Processa ${key}.`, 3, [{ name: 'saída', value: output.join(' ') }]);
    marks[key] = 'visited';
  }

  push('Na ABB, o caminhamento central visita os valores EM ORDEM crescente.', 4, [{ name: 'saída', value: output.join(' ') }]);

  return { operation: 'caminhamento central', complexity: 'O(n)', code, frames, width: 460, height: 300 };
}

/* =====================================================================
   AVL
   ===================================================================== */

const AVL_BASE = [40, 30, 50, 20];

function avlBuild(values: number[]): AvlNode | undefined {
  let tree: AvlNode | undefined;
  for (const value of values) {
    tree = rebalance(insertPlain(tree, value)).node;
  }
  return tree;
}

function avlInsertScene(raw: string): VizScene {
  const value = parseNumber(raw, 10);
  const code = ['inserir(no, x):', '  desce comparando, como na ABB', '  cria a folha x', '  recalcula fb = h(esq) - h(dir)', '  se fb = +2 ou -2: rotaciona'];
  let tree = avlBuild(AVL_BASE);
  const frames: VizFrame[] = [];

  const push = (caption: string, codeLine: number | undefined, marks: Record<number, VizNodeState>, vars?: VizVar[]) => {
    const { nodes, edges, rootId } = avlToViz(tree, 460);
    for (const node of nodes) {
      const key = Number(node.label);
      if (marks[key]) node.state = marks[key];
    }
    frames.push(snap(nodes, edges, rootId ? [p(rootId, 'RAIZ', 'top', 'accent')] : [], caption, codeLine, vars));
  };

  push(`AVL equilibrada (fatores no intervalo [-1, 1]). Vamos inserir ${value}.`, 0, {}, [{ name: 'x', value: `${value}` }]);

  let cursor: AvlNode | undefined = tree;
  let exists = false;

  while (cursor) {
    if (value === cursor.key) {
      push(`${value} já existe: AVL não guarda repetidos.`, 1, { [cursor.key]: 'found' });
      exists = true;
      break;
    }
    push(`${value} ${value < cursor.key ? '<' : '>'} ${cursor.key} → desce para a ${value < cursor.key ? 'esquerda' : 'direita'}.`, 1, { [cursor.key]: 'compare' }, [
      { name: 'no', value: `${cursor.key}` },
    ]);
    cursor = value < cursor.key ? cursor.left : cursor.right;
  }

  if (!exists) {
    tree = insertPlain(tree, value);
    push(`${value} entra como folha. Agora, conferir os fatores no caminho de volta.`, 2, { [value]: 'inserted' });

    const factorRoot = tree ? balance(tree) : 0;
    const { node: balanced, rotation, pivot } = rebalance(tree);

    if (rotation && pivot !== undefined) {
      push(`fb estourou o intervalo → ${rotation} no nó ${pivot}.`, 4, { [pivot]: 'error', [value]: 'inserted' }, [{ name: 'fb', value: `${factorRoot}` }]);
      tree = balanced;
      push(`Depois da ${rotation}, a altura O(log n) está garantida de novo.`, 4, { [pivot]: 'found' }, [{ name: 'fb', value: '0' }]);
    } else {
      tree = balanced;
      push('Fatores dentro do intervalo: nenhuma rotação necessária.', 3, { [value]: 'found' }, [{ name: 'fb', value: `${factorRoot}` }]);
    }
  }

  return { operation: `inserir(${value})`, complexity: 'O(log n)', code, frames, width: 460, height: 300 };
}

function avlSearchScene(raw: string): VizScene {
  const value = parseNumber(raw, 50);
  const code = ['buscar(no, x):', '  se no == null: não está', '  se x == no.valor: achou!', '  desce pelo lado correto'];
  const tree = avlBuild(AVL_BASE);
  const frames: VizFrame[] = [];
  const marks: Record<number, VizNodeState> = {};

  const push = (caption: string, codeLine?: number, vars?: VizVar[]) => {
    const { nodes, edges, rootId } = avlToViz(tree, 460);
    for (const node of nodes) {
      const key = Number(node.label);
      if (marks[key]) node.state = marks[key];
    }
    frames.push(snap(nodes, edges, rootId ? [p(rootId, 'RAIZ', 'top', 'accent')] : [], caption, codeLine, vars));
  };

  push(`Na AVL a busca é igual à da ABB — mas a altura é sempre O(log n).`, 0, [{ name: 'x', value: `${value}` }]);

  let cursor: AvlNode | undefined = tree;
  let found = false;

  while (cursor) {
    marks[cursor.key] = 'compare';

    if (value === cursor.key) {
      push(`${value} == ${cursor.key}: encontrado!`, 2, [{ name: 'resultado', value: 'true' }]);
      marks[cursor.key] = 'found';
      found = true;
      break;
    }

    push(`${value} ${value < cursor.key ? '<' : '>'} ${cursor.key} → desce para a ${value < cursor.key ? 'esquerda' : 'direita'}.`, 3, [{ name: 'no', value: `${cursor.key}` }]);
    marks[cursor.key] = 'visited';
    cursor = value < cursor.key ? cursor.left : cursor.right;
  }

  if (!found) {
    push(`Ponteiro nulo: ${value} não está. Mesmo assim, poucas comparações.`, 1, [{ name: 'resultado', value: 'false' }]);
  } else {
    push('O balanceamento garante que o pior caso continua logarítmico.', 2);
  }

  return { operation: `buscar(${value})`, complexity: 'O(log n)', code, frames, width: 460, height: 300 };
}

/* =====================================================================
   TRIE (com ramificação)
   ===================================================================== */

type TrieNode = { id: string; char: string; end: boolean; children: Map<string, TrieNode> };

function trieBuild(words: string[]): TrieNode {
  const root: TrieNode = { id: 't', char: '•', end: false, children: new Map() };

  for (const word of words) {
    let cursor = root;
    for (const char of word) {
      if (!cursor.children.has(char)) {
        cursor.children.set(char, { id: `${cursor.id}${char}`, char, end: false, children: new Map() });
      }
      cursor = cursor.children.get(char)!;
    }
    cursor.end = true;
  }

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
    nodes.push(n(node.id, at.x, at.y, node.char, { sub: node.end ? '✓ fim' : undefined, state: marks[node.id] ?? 'default' }));
    for (const child of node.children.values()) {
      edges.push(e(node.id, child.id));
      collect(child);
    }
  })(root);

  return { nodes, edges, height: Math.max(280, 110 + maxDepth * 52) };
}

const TRIE_BASE = ['ar', 'arte'];

function trieOpScene(op: 'inserir' | 'buscar', raw: string): VizScene {
  const word = parseWord(raw, op === 'inserir' ? 'asa' : 'art');
  const code =
    op === 'inserir'
      ? ['inserir(palavra):', '  no = raiz', '  para cada letra:', '    se filho não existe: cria o nó', '    no = no.filho[letra]', '  no.fim = true  // marca a palavra']
      : ['buscar(palavra):', '  no = raiz', '  para cada letra:', '    se filho não existe: falso', '    no = no.filho[letra]', '  retorna no.fim  // marcador!'];

  const root = trieBuild(TRIE_BASE);
  const marks: Record<string, VizNodeState> = {};
  const frames: VizFrame[] = [];
  let sceneHeight = 280;

  const push = (caption: string, codeLine?: number, vars?: VizVar[]) => {
    const { nodes, edges, height } = trieToViz(root, marks);
    sceneHeight = Math.max(sceneHeight, height);
    frames.push(snap(nodes, edges, [p('t', 'RAIZ', 'left', 'accent')], caption, codeLine, vars));
  };

  push(`TRIE com "${TRIE_BASE.join('" e "')}". ${op === 'inserir' ? 'Inserir' : 'Buscar'} "${word}".`, 1, [{ name: 'palavra', value: word }]);

  let cursor = root;

  for (let i = 0; i < word.length; i += 1) {
    const char = word[i];
    const child = cursor.children.get(char);

    if (child) {
      marks[child.id] = 'compare';
      push(`Letra '${char}' já existe como filho → desce um nível.`, op === 'inserir' ? 4 : 4, [{ name: 'letra', value: char }, { name: 'nível', value: `${i + 1}` }]);
      marks[child.id] = 'visited';
      cursor = child;
      continue;
    }

    if (op === 'buscar') {
      marks[cursor.id] = 'error';
      push(`Não há filho '${char}' aqui: o caminho acaba → "${word}" não está na TRIE.`, 3, [{ name: 'resultado', value: 'false' }]);
      return { operation: `buscar("${word}")`, complexity: 'O(k)', code, frames, width: 460, height: sceneHeight };
    }

    const novo: TrieNode = { id: `${cursor.id}${char}`, char, end: false, children: new Map() };
    cursor.children.set(char, novo);
    marks[novo.id] = 'inserted';
    push(`Filho '${char}' não existia: um novo nó é criado.`, 3, [{ name: 'letra', value: char }]);
    marks[novo.id] = 'visited';
    cursor = novo;
  }

  if (op === 'inserir') {
    const already = cursor.end;
    cursor.end = true;
    marks[cursor.id] = 'found';
    push(
      already
        ? `O nó final já tinha marcador: "${word}" já era palavra.`
        : `Liga o marcador fim no último nó: agora "${word}" é palavra, não só caminho.`,
      5,
      [{ name: 'no.fim', value: 'true' }],
    );
  } else if (cursor.end) {
    marks[cursor.id] = 'found';
    push(`Letras acabaram e o nó tem marcador ✓ → "${word}" é palavra da TRIE.`, 5, [{ name: 'no.fim', value: 'true' }, { name: 'resultado', value: 'true' }]);
  } else {
    marks[cursor.id] = 'error';
    push(`O caminho existe, mas SEM marcador fim: "${word}" é só prefixo, não palavra.`, 5, [{ name: 'no.fim', value: 'false' }, { name: 'resultado', value: 'false' }]);
  }

  push(`Custo O(k): proporcional ao tamanho da palavra, não à quantidade de palavras.`, 5, [{ name: 'k', value: `${word.length}` }]);

  return { operation: `${op}("${word}")`, complexity: 'O(k)', code, frames, width: 460, height: sceneHeight };
}

/* =====================================================================
   HEAP (máximo)
   ===================================================================== */

const HEAP_BASE = [90, 70, 80, 30, 40, 60];

function heapPositions(count: number): Array<{ x: number; y: number }> {
  const labels = Array.from({ length: count }, (_, index) => `${index}`);
  const root = buildLevelOrderTree(labels)!;
  const positions = layoutTree(root, 460, { top: 52, levelGap: 74 });
  return labels.map((_, index) => positions.get(`t${index}`)!);
}

type HeapElement = { id: string; value: number };

function heapToViz(elements: HeapElement[], marks: Record<string, VizNodeState> = {}): { nodes: VizNode[]; edges: VizEdge[]; pointers: VizPointer[] } {
  const positions = heapPositions(elements.length);
  const nodes = elements.map((element, index) =>
    n(element.id, positions[index].x, positions[index].y, `${element.value}`, {
      sub: `i=${index}`,
      state: marks[element.id] ?? 'default',
    }),
  );
  const edges = elements.slice(1).map((element, k) => e(elements[Math.floor(k / 2)].id, element.id));
  const pointers = elements.length ? [p(elements[0].id, 'RAIZ (máximo)', 'top', 'accent')] : [];
  return { nodes, edges, pointers };
}

function heapBase(): HeapElement[] {
  return HEAP_BASE.map((value) => ({ id: `h${value}`, value }));
}

function heapInsertScene(raw: string): VizScene {
  const value = parseNumber(raw, 85);
  const code = ['inserir(x):', '  coloca x na próxima folha livre', '  enquanto x > pai:', '    troca x com o pai', '  // x parou na posição certa'];
  const elements = heapBase();
  const marks: Record<string, VizNodeState> = {};
  const frames: VizFrame[] = [];

  const push = (caption: string, codeLine?: number, vars?: VizVar[], extra?: VizNode[]) => {
    const { nodes, edges, pointers } = heapToViz(elements, marks);
    frames.push(snap([...nodes, ...(extra ?? [])], edges, pointers, caption, codeLine, vars));
  };

  push('Heap máximo: todo pai é maior ou igual aos filhos.', 0, [{ name: 'x', value: `${value}` }]);

  const id = elements.some((element) => element.id === `h${value}`) ? `h${value}x` : `h${value}`;
  const staging = n(id, 402, 56, `${value}`, { state: 'inserted' });
  push(`inserir(${value}): o valor chega para entrar no heap.`, 0, [{ name: 'x', value: `${value}` }], [staging]);

  elements.push({ id, value });
  marks[id] = 'inserted';
  push(`${value} ocupa a próxima folha (índice ${elements.length - 1}): árvore continua completa.`, 1, [{ name: 'i', value: `${elements.length - 1}` }]);

  let index = elements.length - 1;

  while (index > 0) {
    const parentIndex = Math.floor((index - 1) / 2);
    const parent = elements[parentIndex];

    marks[parent.id] = 'compare';

    if (parent.value >= value) {
      push(`${value} ≤ ${parent.value} (pai): a regra do heap vale → a subida para.`, 2, [{ name: 'pai', value: `${parent.value}` }]);
      marks[parent.id] = 'default';
      break;
    }

    push(`${value} > ${parent.value} (pai): viola a regra → troca.`, 2, [{ name: 'pai', value: `${parent.value}` }]);
    [elements[index], elements[parentIndex]] = [elements[parentIndex], elements[index]];
    marks[parent.id] = 'visited';
    push(`${value} sobe; ${parent.value} desce uma posição.`, 3, [{ name: 'i', value: `${parentIndex}` }]);
    index = parentIndex;
  }

  marks[id] = 'found';
  push('Heap restaurado: a subida percorre no máximo a altura, O(log n).', 4);

  return { operation: `inserir(${value})`, complexity: 'O(log n)', code, frames, width: 460, height: 300 };
}

function heapRemoveMaxScene(): VizScene {
  const code = ['removerMax():', '  max = dados[0]  // a raiz', '  última folha vira a raiz', '  enquanto menor que algum filho:', '    troca com o MAIOR filho', '  return max'];
  const elements = heapBase();
  const marks: Record<string, VizNodeState> = {};
  const frames: VizFrame[] = [];

  const push = (caption: string, codeLine?: number, vars?: VizVar[], extra?: VizNode[]) => {
    const { nodes, edges, pointers } = heapToViz(elements, marks);
    frames.push(snap([...nodes, ...(extra ?? [])], edges, pointers, caption, codeLine, vars));
  };

  const raiz = elements[0];
  marks[raiz.id] = 'active';
  push('No heap máximo, o maior valor está SEMPRE na raiz.', 1, [{ name: 'max', value: `${raiz.value}` }]);

  marks[raiz.id] = 'removed';
  push(`${raiz.value} sai do heap.`, 1, [{ name: 'max', value: `${raiz.value}` }]);

  const last = elements.pop()!;
  elements[0] = last;
  delete marks[raiz.id];
  marks[last.id] = 'inserted';
  push(`A última folha (${last.value}) assume a raiz para manter a árvore completa.`, 2, [{ name: 'raiz', value: `${last.value}` }]);

  let index = 0;

  for (;;) {
    const leftIndex = index * 2 + 1;
    const rightIndex = index * 2 + 2;
    if (leftIndex >= elements.length) break;

    let bigger = leftIndex;
    if (rightIndex < elements.length && elements[rightIndex].value > elements[leftIndex].value) {
      bigger = rightIndex;
    }

    marks[elements[leftIndex].id] = 'compare';
    if (rightIndex < elements.length) marks[elements[rightIndex].id] = 'compare';

    if (elements[bigger].value <= last.value) {
      push(`${last.value} já é maior que os filhos: a descida para aqui.`, 3, [{ name: 'atual', value: `${last.value}` }]);
      marks[elements[leftIndex].id] = 'default';
      if (rightIndex < elements.length) marks[elements[rightIndex].id] = 'default';
      break;
    }

    push(`${last.value} < ${elements[bigger].value}: troca com o MAIOR filho.`, 4, [{ name: 'maior filho', value: `${elements[bigger].value}` }]);

    marks[elements[leftIndex].id] = 'default';
    if (rightIndex < elements.length) marks[elements[rightIndex].id] = 'default';
    marks[elements[bigger].id] = 'visited';

    [elements[index], elements[bigger]] = [elements[bigger], elements[index]];
    push(`${elements[index].value} sobe; ${last.value} desce para o índice ${bigger}.`, 4, [{ name: 'i', value: `${bigger}` }]);
    index = bigger;
  }

  marks[last.id] = 'found';
  push(`Heap válido de novo. removerMax devolve ${raiz.value} em O(log n).`, 5, [{ name: 'retorno', value: `${raiz.value}` }]);

  return { operation: 'remover máximo', complexity: 'O(log n)', code, frames, width: 460, height: 300 };
}

/* =====================================================================
   Catálogo (fonte: pasta materiais — sem grafos)
   ===================================================================== */

const numberInput = (label: string, sample: string): OpInput => ({ kind: 'number', label, sample });
const textInput = (label: string, sample: string): OpInput => ({ kind: 'text', label, sample });

function doidonaOp(op: DoidonaOpId, sample: string): StructureOp {
  return {
    id: op,
    label: op === 'inserir' ? 'Inserir' : op === 'buscar' ? 'Buscar' : 'Remover',
    input: numberInput('Valor', sample),
    run: (value, config) => doidonaScene(op, parseNumber(value, Number(sample)), config),
  };
}

export const structureCatalog: StructureEntry[] = [
  {
    id: 'pilha',
    name: 'Pilha',
    blurb: 'LIFO: insere e remove pelo topo em O(1).',
    ops: [
      { id: 'inserir', label: 'Inserir (push)', input: numberInput('Valor', '7'), run: (value) => stackInsertScene(value) },
      { id: 'remover', label: 'Remover (pop)', run: () => stackRemoveScene() },
      { id: 'topo', label: 'Consultar topo', run: () => stackPeekScene() },
    ],
  },
  {
    id: 'fila',
    name: 'Fila',
    blurb: 'FIFO: entra no final, sai pela frente.',
    ops: [
      { id: 'enfileirar', label: 'Enfileirar', input: numberInput('Valor', '2'), run: (value) => queueInsertScene(value) },
      { id: 'desenfileirar', label: 'Desenfileirar', run: () => queueRemoveScene() },
      { id: 'frente', label: 'Consultar frente', run: () => queuePeekScene() },
    ],
  },
  {
    id: 'fila-circular',
    name: 'Fila circular',
    blurb: 'Índices com módulo: o vetor dá a volta.',
    ops: [
      { id: 'enfileirar', label: 'Enfileirar', input: numberInput('Valor', '9'), run: (value) => ringInsertScene(value) },
      { id: 'desenfileirar', label: 'Desenfileirar', run: () => ringRemoveScene() },
    ],
  },
  {
    id: 'lista',
    name: 'Lista encadeada',
    blurb: 'Nós ligados por ponteiros; religação sem deslocar.',
    ops: [
      { id: 'inserir', label: 'Inserir', input: numberInput('Valor', '25'), run: (value) => listInsertScene(value) },
      { id: 'buscar', label: 'Buscar', input: numberInput('Valor', '20'), run: (value) => listSearchScene(value) },
      { id: 'remover', label: 'Remover', input: numberInput('Valor', '20'), run: (value) => listRemoveScene(value) },
    ],
  },
  {
    id: 'hash',
    name: 'Tabela hash',
    blurb: 'Chave vira índice; colisões viram corrente.',
    ops: [
      { id: 'inserir', label: 'Inserir', input: numberInput('Chave', '16'), run: (value) => hashOpScene('inserir', value) },
      { id: 'buscar', label: 'Buscar', input: numberInput('Chave', '30'), run: (value) => hashOpScene('buscar', value) },
      { id: 'remover', label: 'Remover', input: numberInput('Chave', '23'), run: (value) => hashOpScene('remover', value) },
    ],
  },
  {
    id: 'abb',
    name: 'Árvore de busca (ABB)',
    blurb: 'Menores à esquerda, maiores à direita.',
    ops: [
      { id: 'inserir', label: 'Inserir', input: numberInput('Valor', '45'), run: (value) => bstInsertScene(value) },
      { id: 'buscar', label: 'Buscar', input: numberInput('Valor', '40'), run: (value) => bstSearchScene(value) },
      { id: 'remover', label: 'Remover', input: numberInput('Valor', '30'), run: (value) => bstRemoveScene(value) },
      { id: 'caminhar', label: 'Caminhamento central', run: () => bstTraverseScene() },
    ],
  },
  {
    id: 'avl',
    name: 'Árvore AVL',
    blurb: 'Fator de balanceamento e rotações automáticas.',
    ops: [
      { id: 'inserir', label: 'Inserir', input: numberInput('Valor', '10'), run: (value) => avlInsertScene(value) },
      { id: 'buscar', label: 'Buscar', input: numberInput('Valor', '50'), run: (value) => avlSearchScene(value) },
    ],
  },
  {
    id: 'trie',
    name: 'Árvore TRIE',
    blurb: 'Uma letra por nível; palavra exige marcador fim.',
    ops: [
      { id: 'inserir', label: 'Inserir palavra', input: textInput('Palavra', 'asa'), run: (value) => trieOpScene('inserir', value) },
      { id: 'buscar', label: 'Buscar palavra', input: textInput('Palavra', 'art'), run: (value) => trieOpScene('buscar', value) },
    ],
  },
  {
    id: 'heap',
    name: 'Heap',
    blurb: 'Árvore completa: pai sempre maior que os filhos.',
    ops: [
      { id: 'inserir', label: 'Inserir', input: numberInput('Valor', '85'), run: (value) => heapInsertScene(value) },
      { id: 'remover-max', label: 'Remover máximo', run: () => heapRemoveMaxScene() },
    ],
  },
  {
    id: 'doidona',
    name: 'Estrutura Doidona',
    blurb: 'Hash T1 + reserva T2 desviando para subestruturas.',
    configurable: true,
    ops: [doidonaOp('inserir', '22'), doidonaOp('buscar', '17'), doidonaOp('remover', '24')],
  },
];

export { defaultDoidonaConfig };
export type { DoidonaConfig };
