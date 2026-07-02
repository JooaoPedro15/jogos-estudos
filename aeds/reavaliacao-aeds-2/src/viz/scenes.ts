import type { StructureVisual } from '../types/content';
import { buildLevelOrderTree, e, layoutTree, n, p, snap, type TreeNode } from './sceneUtils';
import type { VizEdge, VizFrame, VizNode, VizPointer, VizScene } from './vizTypes';

/* =====================================================================
   PILHA — push e pop pelo topo
   ===================================================================== */

export function stackScene(): VizScene {
  const code = [
    'push(x):',
    '  topo = topo + 1',
    '  dados[topo] = x',
    'pop():',
    '  x = dados[topo]',
    '  topo = topo - 1',
  ];

  const slotX = 160;
  const slotY = (index: number) => 258 - index * 48;
  const slots: VizNode[] = [0, 1, 2, 3, 4].map((index) =>
    n(`slot${index}`, slotX, slotY(index), '', { shape: 'slot', w: 96, h: 42, sub: `${index}` }),
  );

  const items: VizNode[] = [
    n('s0', slotX, slotY(0), '5', { shape: 'box', w: 88, h: 36 }),
    n('s1', slotX, slotY(1), '8', { shape: 'box', w: 88, h: 36 }),
  ];

  const frames: VizFrame[] = [];
  const ptr = (index: number) => [p(`slot${index}`, 'TOPO', 'right', 'primary')];

  frames.push(snap([...slots, ...items], [], ptr(1), 'Pilha LIFO: o último a entrar é o primeiro a sair.', undefined, [{ name: 'topo', value: '1' }]));

  const novo = n('s2', 330, 88, '7', { shape: 'box', w: 88, h: 36, state: 'inserted' });
  frames.push(snap([...slots, ...items, novo], [], ptr(1), 'push(7): o novo elemento chega pelo topo.', 0, [{ name: 'x', value: '7' }, { name: 'topo', value: '1' }]));
  frames.push(snap([...slots, ...items, novo], [], ptr(2), 'topo avança para a próxima posição livre.', 1, [{ name: 'x', value: '7' }, { name: 'topo', value: '2' }]));

  novo.x = slotX;
  novo.y = slotY(2);
  frames.push(snap([...slots, ...items, novo], [], ptr(2), '7 desliza para a posição do topo.', 2, [{ name: 'topo', value: '2' }]));

  novo.state = 'default';
  frames.push(snap([...slots, ...items, novo], [], ptr(2), 'push concluído: custo O(1), sem tocar nos demais.', 2, [{ name: 'topo', value: '2' }]));

  novo.state = 'active';
  frames.push(snap([...slots, ...items, novo], [], ptr(2), 'pop(): lê o elemento apontado por topo.', 4, [{ name: 'x', value: '7' }]));

  novo.state = 'removed';
  novo.x = 330;
  novo.y = 88;
  frames.push(snap([...slots, ...items, novo], [], ptr(2), '7 sai pelo topo da pilha.', 4, [{ name: 'x', value: '7' }]));

  frames.push(snap([...slots, ...items], [], ptr(1), 'topo recua. pop também custa O(1).', 5, [{ name: 'topo', value: '1' }]));

  return { operation: 'push(7) e pop()', complexity: 'O(1)', code, frames, width: 460, height: 310 };
}

/* =====================================================================
   FILA — entra no final, sai pela frente
   ===================================================================== */

export function queueScene(): VizScene {
  const code = [
    'enfileirar(x):',
    '  dados[tras] = x; tras++',
    'desenfileirar():',
    '  x = dados[frente]; frente++',
    '  return x',
  ];

  const slotY = 168;
  const slotX = (index: number) => 70 + index * 82;
  const slots: VizNode[] = [0, 1, 2, 3, 4].map((index) =>
    n(`slot${index}`, slotX(index), slotY, '', { shape: 'slot', w: 72, h: 46, sub: `${index}` }),
  );

  const items: VizNode[] = [
    n('q0', slotX(0), slotY, '4', { shape: 'box', w: 64, h: 40 }),
    n('q1', slotX(1), slotY, '9', { shape: 'box', w: 64, h: 40 }),
  ];

  const ptrs = (frente: number, tras: number): VizPointer[] => [
    p(`slot${frente}`, 'FRENTE', 'top', 'accent'),
    p(`slot${tras}`, 'TRÁS', 'bottom', 'primary'),
  ];

  const frames: VizFrame[] = [];
  frames.push(snap([...slots, ...items], [], ptrs(0, 1), 'Fila FIFO: o primeiro a entrar é o primeiro a sair.', undefined, [{ name: 'frente', value: '0' }, { name: 'tras', value: '1' }]));

  const novo = n('q2', 400, 70, '2', { shape: 'box', w: 64, h: 40, state: 'inserted' });
  frames.push(snap([...slots, ...items, novo], [], ptrs(0, 1), 'enfileirar(2): o elemento chega pelo final.', 0, [{ name: 'x', value: '2' }]));

  novo.x = slotX(2);
  novo.y = slotY;
  frames.push(snap([...slots, ...items, novo], [], ptrs(0, 2), '2 entra na posição de trás e o ponteiro avança.', 1, [{ name: 'tras', value: '2' }]));

  novo.state = 'default';
  items.push(novo);
  frames.push(snap([...slots, ...items], [], ptrs(0, 2), 'Inserção no final: O(1).', 1, [{ name: 'frente', value: '0' }, { name: 'tras', value: '2' }]));

  const primeiro = items[0];
  primeiro.state = 'active';
  frames.push(snap([...slots, ...items], [], ptrs(0, 2), 'desenfileirar(): remove sempre quem está na frente.', 3, [{ name: 'x', value: '4' }]));

  primeiro.state = 'removed';
  primeiro.x = 40;
  primeiro.y = 70;
  frames.push(snap([...slots, ...items], [], ptrs(0, 2), '4 sai pela frente da fila.', 3, [{ name: 'x', value: '4' }]));

  items.shift();
  frames.push(snap([...slots, ...items], [], ptrs(1, 2), 'frente avança. A ordem de chegada foi respeitada.', 4, [{ name: 'frente', value: '1' }, { name: 'tras', value: '2' }]));

  return { operation: 'enfileirar(2) e desenfileirar()', complexity: 'O(1)', code, frames, width: 460, height: 260 };
}

/* =====================================================================
   FILA CIRCULAR — índices com módulo
   ===================================================================== */

export function circularQueueScene(): VizScene {
  const code = [
    'enfileirar(x):',
    '  dados[tras] = x',
    '  tras = (tras + 1) % n',
    'desenfileirar():',
    '  x = dados[frente]',
    '  frente = (frente + 1) % n',
  ];

  const total = 8;
  const cx = 230;
  const cy = 172;
  const radius = 108;
  const pos = (index: number) => {
    const angle = ((index * 360) / total - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  const slots: VizNode[] = Array.from({ length: total }, (_, index) => {
    const { x, y } = pos(index);
    return n(`slot${index}`, x, y, '', { shape: 'slot', w: 52, h: 40, sub: `${index}` });
  });

  const mk = (id: string, index: number, label: string) => {
    const { x, y } = pos(index);
    return n(id, x, y, label, { shape: 'box', w: 46, h: 34 });
  };

  const items: VizNode[] = [mk('c5', 5, '7'), mk('c6', 6, '1'), mk('c7', 7, '6')];

  const ptrs = (frente: number, tras: number): VizPointer[] => [
    p(`slot${frente}`, 'FRENTE', frente >= 2 && frente <= 6 ? 'bottom' : 'top', 'accent'),
    p(`slot${tras}`, 'TRÁS', tras >= 2 && tras <= 6 ? 'bottom' : 'top', 'primary'),
  ];

  const frames: VizFrame[] = [];
  frames.push(snap([...slots, ...items], [], ptrs(5, 0), 'Fila circular: o vetor "dá a volta" com aritmética modular.', undefined, [{ name: 'frente', value: '5' }, { name: 'tras', value: '0' }, { name: 'n', value: '8' }]));

  const novo = n('c0', cx, cy, '9', { shape: 'box', w: 46, h: 34, state: 'inserted' });
  frames.push(snap([...slots, ...items, novo], [], ptrs(5, 0), 'enfileirar(9): trás está no índice 0 — já deu a volta!', 1, [{ name: 'x', value: '9' }, { name: 'tras', value: '0' }]));

  const alvo = pos(0);
  novo.x = alvo.x;
  novo.y = alvo.y;
  frames.push(snap([...slots, ...items, novo], [], ptrs(5, 0), '9 ocupa o índice 0 sem deslocar ninguém.', 1, [{ name: 'tras', value: '0' }]));

  novo.state = 'default';
  items.push(novo);
  frames.push(snap([...slots, ...items], [], ptrs(5, 1), 'tras = (0 + 1) % 8 = 1. O módulo evita estourar o vetor.', 2, [{ name: 'tras', value: '1' }]));

  const primeiro = items[0];
  primeiro.state = 'active';
  frames.push(snap([...slots, ...items], [], ptrs(5, 1), 'desenfileirar(): frente continua saindo primeiro.', 4, [{ name: 'x', value: '7' }]));

  primeiro.state = 'removed';
  primeiro.x = cx;
  primeiro.y = cy;
  frames.push(snap([...slots, ...items], [], ptrs(5, 1), '7 sai da fila.', 4, [{ name: 'x', value: '7' }]));

  items.shift();
  frames.push(snap([...slots, ...items], [], ptrs(6, 1), 'frente = (5 + 1) % 8 = 6. Nada foi copiado: O(1).', 5, [{ name: 'frente', value: '6' }]));

  return { operation: 'enfileirar(9) com volta e desenfileirar()', complexity: 'O(1)', code, frames, width: 460, height: 344 };
}

/* =====================================================================
   LISTA ENCADEADA — inserção ordenada com religação de ponteiros
   ===================================================================== */

export function linkedListScene(): VizScene {
  const code = [
    'inserir(x):',
    '  p = inicio',
    '  enquanto p.prox.valor < x:',
    '    p = p.prox',
    '  novo.prox = p.prox',
    '  p.prox = novo',
  ];

  const y = 150;
  const nodes: VizNode[] = [
    n('l10', 70, y, '10', { shape: 'box', w: 64, h: 44 }),
    n('l20', 180, y, '20', { shape: 'box', w: 64, h: 44 }),
    n('l30', 290, y, '30', { shape: 'box', w: 64, h: 44 }),
    n('lnull', 396, y, '∅', { shape: 'pill', w: 52, h: 36 }),
  ];

  const chain: VizEdge[] = [e('l10', 'l20', { arrow: true }), e('l20', 'l30', { arrow: true }), e('l30', 'lnull', { arrow: true })];
  const inicio = p('l10', 'INÍCIO', 'top', 'accent');

  const frames: VizFrame[] = [];
  frames.push(snap(nodes, chain, [inicio], 'Lista encadeada ordenada: cada nó aponta para o próximo.', undefined));

  const novo = n('l25', 235, 250, '25', { shape: 'box', w: 64, h: 44, state: 'inserted' });
  frames.push(snap([...nodes, novo], chain, [inicio], 'inserir(25): precisamos achar o ponto certo sem perder ponteiros.', 0, [{ name: 'x', value: '25' }]));

  nodes[0].state = 'active';
  frames.push(snap([...nodes, novo], chain, [inicio, p('l10', 'p', 'bottom', 'warning')], 'p começa no início. 20 < 25, então p avança.', 2, [{ name: 'p', value: '10' }]));

  nodes[0].state = 'visited';
  nodes[1].state = 'active';
  frames.push(snap([...nodes, novo], chain, [inicio, p('l20', 'p', 'bottom', 'warning')], '30 ≥ 25: o novo nó entra logo depois de p = 20.', 3, [{ name: 'p', value: '20' }]));

  const comNovo = [...chain.filter((edge) => edge.id !== 'l20->l30'), e('l25', 'l30', { arrow: true, state: 'inserted' }), e('l20', 'l30', { arrow: true, dashed: true, state: 'removed' })];
  frames.push(snap([...nodes, novo], comNovo, [inicio, p('l20', 'p', 'bottom', 'warning')], 'Primeiro: novo.prox = p.prox. O 30 nunca fica órfão.', 4, [{ name: 'novo.prox', value: '30' }]));

  const religada = [e('l10', 'l20', { arrow: true }), e('l20', 'l25', { arrow: true, state: 'inserted' }), e('l25', 'l30', { arrow: true, state: 'inserted' }), e('l30', 'lnull', { arrow: true })];
  frames.push(snap([...nodes, novo], religada, [inicio], 'Depois: p.prox = novo. A corrente foi religada.', 5, [{ name: 'p.prox', value: '25' }]));

  nodes[0].state = 'default';
  nodes[1].state = 'default';
  nodes[0].x = 60;
  nodes[1].x = 155;
  novo.x = 250;
  novo.y = y;
  novo.state = 'default';
  nodes[2].x = 345;
  nodes[3].x = 432;
  frames.push(snap([...nodes, novo], religada, [inicio], '25 assume o lugar. Busca O(n), religação O(1).', 5));

  return { operation: 'inserir(25) mantendo a ordem', complexity: 'O(n)', code, frames, width: 460, height: 300 };
}

/* =====================================================================
   TABELA HASH — cálculo do índice e tratamento de colisão
   ===================================================================== */

export function hashScene(collidingKey = 30): VizScene {
  const code = [
    'inserir(chave):',
    '  pos = chave % 7',
    '  se tabela[pos] está livre:',
    '    tabela[pos] = chave',
    '  senão:  // colisão!',
    '    encadeia na posição pos',
  ];

  const y = 196;
  const slotX = (index: number) => 55 + index * 58;
  const slots: VizNode[] = Array.from({ length: 7 }, (_, index) =>
    n(`slot${index}`, slotX(index), y, '', { shape: 'slot', w: 50, h: 46, sub: `${index}` }),
  );

  const fixos: VizNode[] = [];
  const frames: VizFrame[] = [];
  const chave = collidingKey;
  const posColisao = ((chave % 7) + 7) % 7;
  const ocupante = posColisao === 2 ? 23 : posColisao + 16;

  frames.push(snap([...slots], [], [], 'Tabela hash: a chave vira índice por uma função de espalhamento.', undefined));

  const k42 = n('h42', 230, 66, '42', { shape: 'pill', w: 56, h: 34, state: 'inserted' });
  frames.push(snap([...slots, k42], [], [], 'inserir(42): a chave chega para ser posicionada.', 0, [{ name: 'chave', value: '42' }]));
  frames.push(snap([...slots, k42], [], [p('slot0', 'pos', 'bottom', 'warning')], 'hash: 42 % 7 = 0. O índice sai direto da conta.', 1, [{ name: 'pos', value: '0' }]));

  k42.x = slotX(0);
  k42.y = y;
  frames.push(snap([...slots, k42], [], [], 'Posição 0 livre: 42 entra sem comparação nenhuma.', 3, [{ name: 'pos', value: '0' }]));
  k42.state = 'default';
  fixos.push(k42);

  const kOcupante = n('hocc', slotX(posColisao), y, `${ocupante}`, { shape: 'pill', w: 56, h: 34 });
  fixos.push(kOcupante);
  frames.push(snap([...slots, ...fixos], [], [], `${ocupante} já ocupa a posição ${posColisao} (${ocupante} % 7 = ${posColisao}).`, 3, [{ name: 'pos', value: `${posColisao}` }]));

  const kNova = n('hnew', 230, 66, `${chave}`, { shape: 'pill', w: 56, h: 34, state: 'inserted' });
  frames.push(snap([...slots, ...fixos, kNova], [], [p(`slot${posColisao}`, 'pos', 'bottom', 'warning')], `inserir(${chave}): ${chave} % 7 = ${posColisao} de novo…`, 1, [{ name: 'chave', value: `${chave}` }, { name: 'pos', value: `${posColisao}` }]));

  kOcupante.state = 'compare';
  kNova.state = 'error';
  frames.push(snap([...slots, ...fixos, kNova], [], [p(`slot${posColisao}`, 'pos', 'bottom', 'warning')], 'Colisão! Duas chaves disputam o mesmo índice.', 4, [{ name: 'pos', value: `${posColisao}` }]));

  kNova.state = 'inserted';
  kNova.x = slotX(posColisao);
  kNova.y = y + 72;
  const corrente = [e('hocc', 'hnew', { arrow: true, state: 'inserted' })];
  frames.push(snap([...slots, ...fixos, kNova], corrente, [], 'Colisão não é ausência: a chave desvia para a estrutura reserva.', 5, [{ name: 'pos', value: `${posColisao}` }]));

  kOcupante.state = 'default';
  kNova.state = 'default';
  frames.push(snap([...slots, ...fixos, kNova], corrente, [], 'Busca média O(1); a colisão vira uma lista curta na posição.', 5));

  return { operation: `inserir(42) e inserir(${chave}) com colisão`, complexity: 'O(1) médio', code, frames, width: 460, height: 320 };
}

/* =====================================================================
   ÁRVORE BINÁRIA — percurso recursivo (usada nas questões)
   ===================================================================== */

export function binaryTreeTraversalScene(labels: string[]): VizScene {
  const code = [
    'visitar(no):',
    '  se no == null: retorna',
    '  processa(no.valor)',
    '  visitar(no.esq)',
    '  visitar(no.dir)',
  ];

  const root = buildLevelOrderTree(labels) ?? buildLevelOrderTree(['A', 'B', 'C'])!;
  const positions = layoutTree(root, 460, { top: 52, levelGap: 78 });

  const nodes: VizNode[] = [];
  const edges: VizEdge[] = [];
  const preOrder: string[] = [];

  (function collect(node: TreeNode) {
    const at = positions.get(node.id)!;
    nodes.push(n(node.id, at.x, at.y, node.label));
    preOrder.push(node.id);
    if (node.left) {
      edges.push(e(node.id, node.left.id));
      collect(node.left);
    }
    if (node.right) {
      edges.push(e(node.id, node.right.id));
      collect(node.right);
    }
  })(root);

  const raiz = p(root.id, 'RAIZ', 'top', 'accent');
  const frames: VizFrame[] = [];
  frames.push(snap(nodes, edges, [raiz], 'A recursão parte da raiz e desce até os ponteiros nulos.', 0));

  for (const id of preOrder) {
    const alvo = nodes.find((node) => node.id === id)!;
    alvo.state = 'active';
    frames.push(snap(nodes, edges, [raiz], `Visita o nó ${alvo.label}: processa e desce para os filhos.`, 2, [{ name: 'no', value: alvo.label }]));
    alvo.state = 'visited';
  }

  frames.push(snap(nodes, edges, [raiz], 'Cada nó real é visitado exatamente uma vez → custo O(n).', 4, [{ name: 'visitados', value: `${preOrder.length}` }]));

  return { operation: 'percurso recursivo', complexity: 'O(n)', code, frames, width: 460, height: 300 };
}

/* =====================================================================
   ABP / ABB — busca comparando e descendo
   ===================================================================== */

export function bstScene(): VizScene {
  const code = [
    'buscar(no, x):',
    '  se no == null: não está',
    '  se x == no.valor: achou!',
    '  se x < no.valor: buscar(no.esq)',
    '  senão: buscar(no.dir)',
  ];

  const labels = ['50', '30', '70', '20', '40', '60', '80'];
  const root = buildLevelOrderTree(labels)!;
  const positions = layoutTree(root, 460, { top: 52, levelGap: 72 });

  const nodes: VizNode[] = [];
  const edges: VizEdge[] = [];

  (function collect(node: TreeNode) {
    const at = positions.get(node.id)!;
    nodes.push(n(node.id, at.x, at.y, node.label));
    if (node.left) {
      edges.push(e(node.id, node.left.id));
      collect(node.left);
    }
    if (node.right) {
      edges.push(e(node.id, node.right.id));
      collect(node.right);
    }
  })(root);

  const byLabel = (label: string) => nodes.find((node) => node.label === label)!;
  const raiz = p(root.id, 'RAIZ', 'top', 'accent');
  const frames: VizFrame[] = [];

  frames.push(snap(nodes, edges, [raiz], 'ABB: menores à esquerda, maiores à direita. Vamos buscar 40.', 0, [{ name: 'x', value: '40' }]));

  byLabel('50').state = 'compare';
  frames.push(snap(nodes, edges, [raiz], '40 < 50 → a resposta só pode estar à esquerda.', 3, [{ name: 'no', value: '50' }, { name: 'x', value: '40' }]));

  byLabel('50').state = 'visited';
  byLabel('30').state = 'compare';
  frames.push(snap(nodes, edges, [raiz], '40 > 30 → agora desce para a direita.', 4, [{ name: 'no', value: '30' }, { name: 'x', value: '40' }]));

  byLabel('30').state = 'visited';
  byLabel('40').state = 'found';
  frames.push(snap(nodes, edges, [raiz], 'Achou! Só 3 comparações em 7 nós: a árvore corta metade a cada passo.', 2, [{ name: 'no', value: '40' }, { name: 'comparações', value: '3' }]));

  frames.push(snap(nodes, edges, [raiz], 'Busca proporcional à altura: O(log n) se balanceada, O(n) se degenerar.', 2));

  return { operation: 'buscar(40)', complexity: 'O(altura)', code, frames, width: 460, height: 300 };
}

/* =====================================================================
   AVL — inserções reais com fator de balanceamento e rotações
   ===================================================================== */

type AvlNode = { key: number; left?: AvlNode; right?: AvlNode };

function avlHeight(node?: AvlNode): number {
  return node ? 1 + Math.max(avlHeight(node.left), avlHeight(node.right)) : 0;
}

function balance(node: AvlNode): number {
  return avlHeight(node.left) - avlHeight(node.right);
}

function insertPlain(node: AvlNode | undefined, key: number): AvlNode {
  if (!node) return { key };
  if (key < node.key) return { ...node, left: insertPlain(node.left, key) };
  return { ...node, right: insertPlain(node.right, key) };
}

function rebalance(node: AvlNode | undefined): { node?: AvlNode; rotation?: string; pivot?: number } {
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

function avlToViz(root: AvlNode | undefined, width: number): { nodes: VizNode[]; edges: VizEdge[]; rootId?: string } {
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

export function avlScene(values: number[]): VizScene {
  const code = [
    'inserir(no, x):',
    '  desce comparando, como na ABB',
    '  cria a folha x',
    '  recalcula fb = h(esq) - h(dir)',
    '  se fb = +2 ou -2: rotaciona',
  ];

  const frames: VizFrame[] = [];
  let tree: AvlNode | undefined;

  const pushFrame = (
    caption: string,
    codeLine: number | undefined,
    marks: Record<number, VizNode['state']>,
    vars?: Array<{ name: string; value: string }>,
  ) => {
    const { nodes, edges, rootId } = avlToViz(tree, 460);
    for (const node of nodes) {
      const key = Number(node.label);
      if (marks[key]) node.state = marks[key];
    }
    frames.push(snap(nodes, edges, rootId ? [p(rootId, 'RAIZ', 'top', 'accent')] : [], caption, codeLine, vars));
  };

  for (const value of values) {
    if (!tree) {
      tree = { key: value };
      pushFrame(`inserir(${value}): a árvore estava vazia, ${value} vira a raiz.`, 2, { [value]: 'inserted' }, [{ name: 'x', value: `${value}` }]);
      continue;
    }

    let cursor: AvlNode | undefined = tree;
    while (cursor) {
      pushFrame(
        `inserir(${value}): ${value} ${value < cursor.key ? '<' : '>'} ${cursor.key} → desce para a ${value < cursor.key ? 'esquerda' : 'direita'}.`,
        1,
        { [cursor.key]: 'compare', [value]: 'inserted' },
        [{ name: 'x', value: `${value}` }, { name: 'no', value: `${cursor.key}` }],
      );
      cursor = value < cursor.key ? cursor.left : cursor.right;
    }

    tree = insertPlain(tree, value);
    pushFrame(`${value} entra como folha. Hora de conferir os fatores.`, 2, { [value]: 'inserted' }, [{ name: 'x', value: `${value}` }]);

    const factorRoot = tree ? balance(tree) : 0;
    const { node: balanced, rotation, pivot } = rebalance(tree);

    if (rotation && pivot !== undefined) {
      pushFrame(`fb saiu do intervalo [-1, 1] → ${rotation} no nó ${pivot}.`, 4, { [pivot]: 'error', [value]: 'inserted' }, [{ name: 'fb', value: `${factorRoot}` }]);
      tree = balanced;
      pushFrame(`Depois da ${rotation}, todos os fatores voltam para -1, 0 ou +1.`, 4, { [pivot]: 'found' }, [{ name: 'fb', value: '0' }]);
    } else {
      tree = balanced;
      pushFrame('Fatores dentro do intervalo: nenhuma rotação necessária.', 3, {}, [{ name: 'fb', value: `${factorRoot}` }]);
    }
  }

  pushFrame('AVL final: altura O(log n) garantida para busca, inserção e remoção.', 4, {});

  return { operation: `inserir ${values.join(', ')}`, complexity: 'O(log n)', code, frames, width: 460, height: 300 };
}

/* =====================================================================
   TRIE — caminho letra a letra e marcador de fim
   ===================================================================== */

export function trieScene(labels: string[]): VizScene {
  const code = [
    'buscar(palavra):',
    '  no = raiz',
    '  para cada letra:',
    '    se filho não existe: falso',
    '    no = no.filho[letra]',
    '  retorna no.fim  // marcador!',
  ];

  const chars: string[] = [];
  const ends = new Set<number>();

  for (const raw of labels) {
    const label = raw.trim().toLowerCase();
    if (!label) continue;
    if (label === 'fim') {
      if (chars.length) ends.add(chars.length - 1);
    } else {
      chars.push(raw.trim());
    }
  }

  if (!chars.length) {
    chars.push('a', 'b');
    ends.add(1);
  }

  const stepX = Math.min(64, 340 / Math.max(chars.length, 1));
  const stepY = Math.min(46, 220 / Math.max(chars.length, 1));
  const nodes: VizNode[] = [n('root', 80, 54, '•')];
  const edges: VizEdge[] = [];

  chars.forEach((char, index) => {
    const id = `c${index}`;
    nodes.push(
      n(id, 80 + (index + 1) * stepX, 54 + (index + 1) * stepY, char, {
        sub: ends.has(index) ? '✓ fim' : undefined,
      }),
    );
    edges.push(e(index === 0 ? 'root' : `c${index - 1}`, id));
  });

  const raiz = p('root', 'RAIZ', 'top', 'accent');
  const lastEnd = Math.max(...(ends.size ? [...ends] : [chars.length - 1]));
  const word = chars.slice(0, lastEnd + 1).join('');
  const frames: VizFrame[] = [];

  frames.push(snap(nodes, edges, [raiz], 'TRIE: cada nível guarda uma letra; palavras terminam no marcador fim.', 1));

  for (let i = 0; i <= lastEnd; i += 1) {
    nodes[i + 1].state = 'compare';
    frames.push(snap(nodes, edges, [raiz], `Letra '${chars[i]}' existe como filho → desce um nível.`, 4, [{ name: 'letra', value: chars[i] }, { name: 'nível', value: `${i + 1}` }]));
    nodes[i + 1].state = 'visited';
  }

  nodes[lastEnd + 1].state = 'found';
  frames.push(snap(nodes, edges, [raiz], `Fim das letras e o nó tem marcador ✓ → "${word}" é palavra.`, 5, [{ name: 'no.fim', value: 'true' }]));

  const extraIndex = lastEnd + 1 < chars.length ? lastEnd + 1 : lastEnd > 0 ? lastEnd - 1 : -1;

  if (extraIndex >= 0) {
    const alvoPrefixo = chars.slice(0, extraIndex + 1).join('');
    for (const node of nodes) node.state = 'default';

    for (let i = 0; i <= extraIndex; i += 1) {
      nodes[i + 1].state = 'visited';
    }

    if (!ends.has(extraIndex)) {
      nodes[extraIndex + 1].state = 'error';
      frames.push(snap(nodes, edges, [raiz], `Já buscar "${alvoPrefixo}": o caminho existe, mas SEM marcador fim → é só prefixo, não palavra.`, 5, [{ name: 'no.fim', value: 'false' }]));
    } else {
      nodes[extraIndex + 1].state = 'found';
      frames.push(snap(nodes, edges, [raiz], `"${alvoPrefixo}" também tem marcador fim: duas palavras no mesmo caminho.`, 5, [{ name: 'no.fim', value: 'true' }]));
    }
  }

  frames.push(snap(nodes, edges, [raiz], 'Custo proporcional ao tamanho da palavra: O(k), independe de quantas palavras existem.', 5, [{ name: 'k', value: `${lastEnd + 1}` }]));

  return { operation: `buscar("${word}")`, complexity: 'O(k)', code, frames, width: 460, height: Math.max(280, 120 + (chars.length + 1) * stepY) };
}

/* =====================================================================
   HEAP — inserção com subida (sift-up)
   ===================================================================== */

export function heapScene(): VizScene {
  const code = [
    'inserir(x):',
    '  coloca x na próxima folha livre',
    '  enquanto x > pai:',
    '    troca x com o pai',
    '  // x parou na posição certa',
  ];

  const labels = ['90', '70', '80', '30', '40', '60'];
  const layoutLabels = [...labels, '85'];
  const root = buildLevelOrderTree(layoutLabels)!;
  const positions = layoutTree(root, 460, { top: 52, levelGap: 74 });
  const posAt = (index: number) => positions.get(`t${index}`)!;

  const nodes: VizNode[] = labels.map((label, index) => {
    const at = posAt(index);
    return n(`h${label}`, at.x, at.y, label, { sub: `i=${index}` });
  });

  const edgeFor = (childIndex: number, order: string[]) =>
    e(`h${order[Math.floor((childIndex - 1) / 2)]}`, `h${order[childIndex]}`);

  const buildEdges = (order: string[]) => order.slice(1).map((_, k) => edgeFor(k + 1, order));

  let order = [...labels];
  const raiz = () => [p(`h${order[0]}`, 'RAIZ (máximo)', 'top', 'accent')];
  const frames: VizFrame[] = [];

  frames.push(snap(nodes, buildEdges(order), raiz(), 'Heap máximo: todo pai é maior ou igual aos filhos.', undefined));

  const novo = n('h85', 400, 60, '85', { sub: 'i=6', state: 'inserted' });
  nodes.push(novo);
  frames.push(snap(nodes, buildEdges(order), raiz(), 'inserir(85): o valor chega para entrar no heap.', 0, [{ name: 'x', value: '85' }]));

  order = [...order, '85'];
  const at6 = posAt(6);
  novo.x = at6.x;
  novo.y = at6.y;
  frames.push(snap(nodes, buildEdges(order), raiz(), '85 ocupa a próxima folha livre (índice 6), mantendo a árvore completa.', 1, [{ name: 'i', value: '6' }]));

  const byLabel = (label: string) => nodes.find((node) => node.label === label)!;
  const swap = (childLabel: string, parentLabel: string) => {
    const childIndex = order.indexOf(childLabel);
    const parentIndex = Math.floor((childIndex - 1) / 2);
    [order[childIndex], order[parentIndex]] = [order[parentIndex], order[childIndex]];
    const childNode = byLabel(childLabel);
    const parentNode = byLabel(parentLabel);
    const a = posAt(parentIndex);
    const b = posAt(childIndex);
    childNode.x = a.x;
    childNode.y = a.y;
    childNode.sub = `i=${parentIndex}`;
    parentNode.x = b.x;
    parentNode.y = b.y;
    parentNode.sub = `i=${childIndex}`;
  };

  byLabel('80').state = 'compare';
  frames.push(snap(nodes, buildEdges(order), raiz(), '85 > 80 (pai): viola a regra do heap → troca.', 2, [{ name: 'x', value: '85' }, { name: 'pai', value: '80' }]));

  byLabel('80').state = 'default';
  swap('85', '80');
  frames.push(snap(nodes, buildEdges(order), raiz(), '85 sobe um nível; 80 desce para o lugar dele.', 3, [{ name: 'i', value: '2' }]));

  byLabel('90').state = 'compare';
  frames.push(snap(nodes, buildEdges(order), raiz(), '85 < 90: a regra vale de novo → a subida para aqui.', 2, [{ name: 'x', value: '85' }, { name: 'pai', value: '90' }]));

  byLabel('90').state = 'default';
  novo.state = 'found';
  frames.push(snap(nodes, buildEdges(order), raiz(), 'Heap restaurado. A subida percorre no máximo a altura: O(log n).', 4, [{ name: 'trocas', value: '1' }]));

  return { operation: 'inserir(85) com sift-up', complexity: 'O(log n)', code, frames, width: 460, height: 300 };
}

/* =====================================================================
   GRAFO — BFS destacando fronteira e arestas usadas
   ===================================================================== */

export function graphScene(): VizScene {
  const code = [
    'BFS(origem):',
    '  fila = [origem]',
    '  v = fila.remove()',
    '  para cada vizinho w não visitado:',
    '    marca w e enfileira',
    '  repete até a fila esvaziar',
  ];

  const coords: Record<string, { x: number; y: number }> = {
    A: { x: 90, y: 84 },
    B: { x: 236, y: 54 },
    C: { x: 382, y: 84 },
    D: { x: 128, y: 226 },
    E: { x: 268, y: 244 },
    F: { x: 396, y: 210 },
  };

  const arestas: Array<[string, string]> = [
    ['A', 'B'],
    ['A', 'D'],
    ['B', 'C'],
    ['B', 'E'],
    ['C', 'F'],
    ['D', 'E'],
    ['E', 'F'],
  ];

  const nodes: VizNode[] = Object.entries(coords).map(([id, at]) => n(`g${id}`, at.x, at.y, id));
  const edges: VizEdge[] = arestas.map(([a, b]) => e(`g${a}`, `g${b}`));
  const byId = (id: string) => nodes.find((node) => node.id === `g${id}`)!;
  const markEdge = (a: string, b: string) => {
    const edge = edges.find((item) => item.id === `g${a}->g${b}` || item.id === `g${b}->g${a}`);
    if (edge) edge.state = 'found';
  };

  const frames: VizFrame[] = [];
  const origem = p('gA', 'ORIGEM', 'left', 'accent');

  frames.push(snap(nodes, edges, [origem], 'BFS explora o grafo em camadas, usando uma fila.', 1, [{ name: 'fila', value: '[A]' }]));

  byId('A').state = 'active';
  frames.push(snap(nodes, edges, [origem], 'Remove A da fila e olha os vizinhos dele.', 2, [{ name: 'v', value: 'A' }, { name: 'fila', value: '[]' }]));

  byId('B').state = 'compare';
  byId('D').state = 'compare';
  markEdge('A', 'B');
  markEdge('A', 'D');
  frames.push(snap(nodes, edges, [origem], 'B e D entram na fila: primeira camada descoberta.', 4, [{ name: 'fila', value: '[B, D]' }]));

  byId('A').state = 'visited';
  byId('B').state = 'active';
  frames.push(snap(nodes, edges, [origem], 'Processa B: vizinhos novos são C e E.', 2, [{ name: 'v', value: 'B' }, { name: 'fila', value: '[D]' }]));

  byId('C').state = 'compare';
  byId('E').state = 'compare';
  markEdge('B', 'C');
  markEdge('B', 'E');
  frames.push(snap(nodes, edges, [origem], 'C e E enfileirados. A aresta usada fica marcada.', 4, [{ name: 'fila', value: '[D, C, E]' }]));

  byId('B').state = 'visited';
  byId('D').state = 'active';
  frames.push(snap(nodes, edges, [origem], 'Processa D: E já foi descoberto, nada novo entra.', 3, [{ name: 'v', value: 'D' }, { name: 'fila', value: '[C, E]' }]));

  byId('D').state = 'visited';
  byId('C').state = 'active';
  frames.push(snap(nodes, edges, [origem], 'Processa C: F é o último vértice novo.', 4, [{ name: 'v', value: 'C' }, { name: 'fila', value: '[E, F]' }]));

  byId('C').state = 'visited';
  byId('F').state = 'compare';
  markEdge('C', 'F');
  byId('E').state = 'active';
  frames.push(snap(nodes, edges, [origem], 'Processa E e depois F: fila esvazia.', 5, [{ name: 'fila', value: '[F]' }]));

  byId('E').state = 'visited';
  byId('F').state = 'visited';
  frames.push(snap(nodes, edges, [origem], 'Todos visitados em camadas: custo O(V + A).', 5, [{ name: 'fila', value: '[]' }]));

  return { operation: 'BFS a partir de A', complexity: 'O(V + A)', code, frames, width: 460, height: 300 };
}

/* =====================================================================
   VETOR — varredura de laço (somatórios)
   ===================================================================== */

export function arraySweepScene(labels: string[]): VizScene {
  const code = ['para i = 0 até n-1:', '  processa vetor[i]', '// total = soma das execuções'];

  const itens = labels.filter((label) => label.trim());
  const count = Math.max(itens.length, 1);
  const width = 460;
  const cellW = Math.min(78, (width - 60) / count);
  const startX = width / 2 - (cellW * (count - 1)) / 2;

  const nodes: VizNode[] = itens.map((label, index) =>
    n(`cell${index}`, startX + index * cellW, 150, label, { shape: 'box', w: cellW - 10, h: 46, sub: `${index}` }),
  );

  const frames: VizFrame[] = [];
  frames.push(snap(nodes, [], [], 'Cada célula representa uma rodada do laço.', 0, [{ name: 'i', value: '0' }]));

  itens.forEach((label, index) => {
    nodes[index].state = 'active';
    frames.push(snap(nodes, [], [p(`cell${index}`, 'i', 'top', 'warning')], `i = ${index}: o laço executa "${label}".`, 1, [{ name: 'i', value: `${index}` }]));
    nodes[index].state = 'visited';
  });

  frames.push(snap(nodes, [], [], 'Somando as execuções de cada rodada nasce o somatório da questão.', 2, [{ name: 'rodadas', value: `${itens.length}` }]));

  return { operation: 'contar execuções do laço', complexity: 'soma dos termos', code, frames, width, height: 250 };
}

/* =====================================================================
   VETOR — passo do insertion sort (chave, deslocamentos, inserção)
   ===================================================================== */

export function insertionSortScene(values: number[]): VizScene {
  const code = [
    'para i = 1 até n-1:',
    '  chave = vetor[i]; j = i - 1',
    '  enquanto j >= 0 e vetor[j] > chave:',
    '    vetor[j+1] = vetor[j]; j--',
    '  vetor[j+1] = chave',
  ];

  let keyIndex = values.findIndex((value, index) => index > 0 && value < values[index - 1]);
  if (keyIndex < 0) keyIndex = values.length - 1;

  const width = 460;
  const count = values.length;
  const cellW = Math.min(80, (width - 60) / count);
  const startX = width / 2 - (cellW * (count - 1)) / 2;
  const rowY = 132;
  const cellX = (slot: number) => startX + slot * cellW;

  const nodes: VizNode[] = values.map((value, index) =>
    n(`v${index}`, cellX(index), rowY, `${value}`, { shape: 'box', w: cellW - 10, h: 46, sub: `${index}` }),
  );

  const slotOf = new Map(nodes.map((node, index) => [node.id, index]));
  const setSlot = (id: string, slot: number) => {
    const node = nodes.find((item) => item.id === id)!;
    node.x = cellX(slot);
    node.sub = `${slot}`;
    slotOf.set(id, slot);
  };

  const chave = values[keyIndex];
  const keyId = `v${keyIndex}`;
  const keyNode = nodes.find((node) => node.id === keyId)!;
  const frames: VizFrame[] = [];

  for (let i = 0; i < keyIndex; i += 1) nodes[i].state = 'visited';
  frames.push(snap(nodes, [], [], `Prefixo até a posição ${keyIndex - 1} já está ordenado.`, 0, [{ name: 'i', value: `${keyIndex}` }]));

  keyNode.state = 'active';
  keyNode.y = rowY + 84;
  frames.push(snap(nodes, [], [], `chave = ${chave} sai da posição ${keyIndex} para abrir espaço.`, 1, [{ name: 'chave', value: `${chave}` }, { name: 'j', value: `${keyIndex - 1}` }]));

  let j = keyIndex - 1;
  keyNode.x = cellX(keyIndex);

  while (j >= 0 && values[j] > chave) {
    const shifting = nodes.find((node) => node.id === `v${j}`)!;
    shifting.state = 'compare';
    frames.push(snap(nodes, [], [], `vetor[${j}] = ${values[j]} > ${chave} → desloca para a direita.`, 2, [{ name: 'chave', value: `${chave}` }, { name: 'j', value: `${j}` }]));

    setSlot(shifting.id, (slotOf.get(shifting.id) ?? j) + 1);
    shifting.state = 'visited';
    frames.push(snap(nodes, [], [], `${values[j]} ocupa a posição ${j + 1}; j recua.`, 3, [{ name: 'j', value: `${j - 1}` }]));
    j -= 1;
  }

  if (j >= 0) {
    const menor = nodes.find((node) => node.id === `v${j}`)!;
    menor.state = 'compare';
    frames.push(snap(nodes, [], [], `vetor[${j}] = ${values[j]} ≤ ${chave} → achou a abertura.`, 2, [{ name: 'j', value: `${j}` }]));
    menor.state = 'visited';
  }

  keyNode.y = rowY;
  keyNode.x = cellX(j + 1);
  keyNode.sub = `${j + 1}`;
  keyNode.state = 'inserted';
  frames.push(snap(nodes, [], [], `chave ${chave} entra na posição ${j + 1}: prefixo ordenado cresceu.`, 4, [{ name: 'chave', value: `${chave}` }]));

  for (const node of nodes) {
    if (Number(node.sub) <= keyIndex) node.state = 'visited';
  }
  keyNode.state = 'found';
  frames.push(snap(nodes, [], [], 'Melhor caso (já ordenado): O(n). Pior caso (invertido): O(n²).', 0, [{ name: 'deslocamentos', value: `${keyIndex - 1 - j}` }]));

  return { operation: `inserir chave ${chave} no prefixo ordenado`, complexity: 'O(n²) pior caso', code, frames, width, height: 290 };
}

/* =====================================================================
   ESTRUTURA DOIDONA — busca camada por camada
   ===================================================================== */

export function doidonaScene(labels: string[]): VizScene {
  const camadas = labels.filter((label) => label.trim());
  const code = [
    'buscar(x):',
    ...camadas.map((camada) => `  se está em ${camada}: retorna true`),
    '  retorna falso  // só após TODAS',
  ];

  const width = 460;
  const count = Math.max(camadas.length, 1);
  const gap = Math.min(104, (width - 80) / Math.max(count - 1, 1));
  const startX = width / 2 - (gap * (count - 1)) / 2;

  const nodes: VizNode[] = camadas.map((camada, index) =>
    n(`layer${index}`, startX + index * gap, 150, camada, { shape: 'pill', w: Math.max(64, camada.length * 11 + 26), h: 44, sub: `camada ${index + 1}` }),
  );

  const edges: VizEdge[] = camadas.slice(1).map((_, index) => e(`layer${index}`, `layer${index + 1}`, { arrow: true, dashed: true }));
  const frames: VizFrame[] = [];

  frames.push(snap(nodes, edges, [], 'Estrutura composta: a busca atravessa as camadas em ordem.', 0, [{ name: 'x', value: '42' }]));

  camadas.forEach((camada, index) => {
    nodes[index].state = 'compare';
    frames.push(snap(nodes, edges, [], `Procura x em ${camada}…`, index + 1, [{ name: 'camada', value: camada }]));

    if (index < camadas.length - 1) {
      nodes[index].state = 'visited';
      frames.push(snap(nodes, edges, [], `Não está em ${camada}. NÃO retorne falso ainda: há camadas restantes.`, index + 2, [{ name: 'camada', value: camada }]));
    } else {
      nodes[index].state = 'found';
      frames.push(snap(nodes, edges, [], `Encontrado em ${camada}, a última camada. Retornar falso cedo perderia este item.`, index + 1, [{ name: 'resultado', value: 'true' }]));
    }
  });

  frames.push(snap(nodes, edges, [], 'Regra de ouro: só conclua ausência depois de testar TODAS as camadas.', camadas.length + 1));

  return { operation: 'buscar(x) na estrutura composta', complexity: 'soma das camadas', code, frames, width, height: 270 };
}

/* =====================================================================
   Mapeamento: visual do conteúdo → cena animada
   ===================================================================== */

function isNumeric(label: string): boolean {
  return label.trim() !== '' && !Number.isNaN(Number(label.trim()));
}

export function buildSceneForVisual(visual: StructureVisual): VizScene {
  const cleaned = visual.labels.filter((label) => label.trim() !== '');

  switch (visual.kind) {
    case 'binary-tree':
      return binaryTreeTraversalScene(cleaned);
    case 'avl': {
      const numeric = cleaned.every(isNumeric) && cleaned.length >= 2;
      return numeric ? avlScene(cleaned.map(Number)) : binaryTreeTraversalScene(cleaned);
    }
    case 'trie':
      return trieScene(visual.labels);
    case 'hash': {
      const key = cleaned.map((label) => Number(label)).find((value) => !Number.isNaN(value));
      return hashScene(key ?? 30);
    }
    case 'doidona':
      return doidonaScene(cleaned);
    case 'array': {
      const numeric = cleaned.every(isNumeric) && cleaned.length >= 3;
      const sorted = numeric && cleaned.map(Number).every((value, index, all) => index === 0 || all[index - 1] <= value);
      return numeric && !sorted ? insertionSortScene(cleaned.map(Number)) : arraySweepScene(cleaned);
    }
    default:
      return arraySweepScene(cleaned);
  }
}

/* =====================================================================
   Catálogo da galeria "Estruturas"
   ===================================================================== */

export type StructureCatalogEntry = {
  id: string;
  name: string;
  blurb: string;
  build: () => VizScene;
};

export const structureCatalog: StructureCatalogEntry[] = [
  { id: 'pilha', name: 'Pilha', blurb: 'LIFO: push e pop pelo topo em O(1).', build: stackScene },
  { id: 'fila', name: 'Fila', blurb: 'FIFO: entra no final, sai pela frente.', build: queueScene },
  { id: 'fila-circular', name: 'Fila circular', blurb: 'Índices com módulo: o vetor dá a volta.', build: circularQueueScene },
  { id: 'lista', name: 'Lista encadeada', blurb: 'Nós ligados por ponteiros; religação sem deslocar.', build: linkedListScene },
  { id: 'hash', name: 'Tabela hash', blurb: 'Chave vira índice; colisões vão para a reserva.', build: () => hashScene() },
  { id: 'abb', name: 'Árvore de busca (ABB)', blurb: 'Menores à esquerda, maiores à direita.', build: bstScene },
  { id: 'avl', name: 'Árvore AVL', blurb: 'Fator de balanceamento e rotações automáticas.', build: () => avlScene([30, 20, 10, 40, 50]) },
  { id: 'trie', name: 'Árvore TRIE', blurb: 'Uma letra por nível; palavra exige marcador fim.', build: () => trieScene(['c', 'a', 's', 'a', 'fim']) },
  { id: 'heap', name: 'Heap', blurb: 'Árvore completa: pai sempre maior que os filhos.', build: heapScene },
  { id: 'grafo', name: 'Grafo (BFS)', blurb: 'Vértices e arestas explorados em camadas.', build: graphScene },
  { id: 'doidona', name: 'Estrutura Doidona', blurb: 'Camadas compostas: T1, T2, T3, lista e árvore.', build: () => doidonaScene(['T1', 'T2', 'T3', 'lista', 'árvore']) },
];
