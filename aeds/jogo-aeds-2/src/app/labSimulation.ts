import type { TreeNodeView, TreeVisualState, VisualState } from '../types/structures';

export type LabAction = 'Inserir' | 'Remover' | 'Pesquisar' | 'Balancear';

export type LabTreeNode = {
  value: number;
  left?: LabTreeNode;
  right?: LabTreeNode;
};

export type LabAnimationStep = {
  title: string;
  description: string;
  visualState: VisualState;
  activePath?: string[];
  activeNodeId?: string;
};

export type LabOperation = {
  id: string;
  label: string;
  steps: LabAnimationStep[];
  nextTree: LabTreeNode | undefined;
};

export function createInitialLabTree(): LabTreeNode {
  return [40, 20, 60, 10, 30, 50, 70].reduce<LabTreeNode | undefined>(
    (tree, value) => insertValue(tree, value),
    undefined,
  ) as LabTreeNode;
}

export function buildLabOperation(
  action: LabAction,
  rawValue: string,
  currentTree: LabTreeNode | undefined,
): LabOperation {
  const value = parseLabValue(rawValue);
  const label = action === 'Balancear' ? 'Balancear arvore' : `${action} ${value}`;
  const nextTree = getNextTree(action, currentTree, value);

  return {
    id: `${action}-${value}-${Date.now()}`,
    label,
    nextTree,
    steps: getOperationSteps(action, value, currentTree, nextTree),
  };
}

export function treeToVisualState(tree: LabTreeNode | undefined, id = 'lab-abb-atual'): TreeVisualState {
  return {
    id,
    kind: 'tree',
    root: tree ? toTreeNodeView(tree) : undefined,
  };
}

function parseLabValue(rawValue: string): number {
  const value = Number.parseInt(rawValue.trim(), 10);
  return Number.isFinite(value) ? value : 0;
}

function getNextTree(action: LabAction, tree: LabTreeNode | undefined, value: number) {
  switch (action) {
    case 'Inserir':
      return insertValue(tree, value);
    case 'Remover':
      return removeValue(tree, value);
    case 'Balancear':
      return buildBalancedTree(inOrderValues(tree));
    case 'Pesquisar':
      return tree;
    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}

function getOperationSteps(
  action: LabAction,
  value: number,
  currentTree: LabTreeNode | undefined,
  nextTree: LabTreeNode | undefined,
): LabAnimationStep[] {
  if (action === 'Balancear') {
    return getBalanceSteps(currentTree, nextTree);
  }

  const path = getSearchPath(currentTree, value);
  const visualBefore = treeToVisualState(currentTree, `lab-${action}-antes`);
  const activePath = path.map((node) => nodeId(node.value));
  const compareSteps = path.slice(0, 3).map<LabAnimationStep>((node, index) => {
    const title = index === 0 ? `Comparar com ${node.value}` : `Descer para ${node.value}`;
    const direction = value < node.value ? 'esquerda' : value > node.value ? 'direita' : 'parar';

    return {
      title,
      description:
        direction === 'parar'
          ? `${value} foi encontrado neste no.`
          : `${value} e comparado com ${node.value}; a regra da ABB manda seguir para a ${direction}.`,
      visualState: visualBefore,
      activePath: activePath.slice(0, index + 1),
      activeNodeId: nodeId(node.value),
    };
  });

  while (compareSteps.length < 3) {
    compareSteps.push({
      title: 'Encontrar ponteiro livre',
      description: `${value} alcanca um ponteiro nulo, que e o ponto onde a operacao precisa agir.`,
      visualState: visualBefore,
      activePath,
      activeNodeId: activePath[activePath.length - 1],
    });
  }

  return [
    ...compareSteps,
    {
      title: getFinalStepTitle(action, value),
      description: getFinalStepDescription(action, value),
      visualState: treeToVisualState(nextTree, `lab-${action}-depois`),
      activePath: getSearchPath(nextTree, value).map((node) => nodeId(node.value)),
      activeNodeId: nodeId(value),
    },
  ];
}

function getBalanceSteps(
  currentTree: LabTreeNode | undefined,
  nextTree: LabTreeNode | undefined,
): LabAnimationStep[] {
  const before = treeToVisualState(currentTree, 'lab-balancear-antes');
  const after = treeToVisualState(nextTree, 'lab-balancear-depois');

  return [
    {
      title: 'Ler percurso em ordem',
      description: 'A animacao coleta as chaves em ordem crescente para preservar a regra de ABB.',
      visualState: before,
      activePath: getSearchPath(currentTree, currentTree?.value ?? 0).map((node) => nodeId(node.value)),
      activeNodeId: currentTree ? nodeId(currentTree.value) : undefined,
    },
    {
      title: 'Escolher nova raiz',
      description: 'O valor central vira raiz para reduzir a altura da arvore.',
      visualState: after,
      activeNodeId: nextTree ? nodeId(nextTree.value) : undefined,
    },
    {
      title: 'Redistribuir subarvores',
      description: 'Valores menores ficam a esquerda e maiores ficam a direita da nova raiz.',
      visualState: after,
      activePath: nextTree ? getSearchPath(nextTree, nextTree.value).map((node) => nodeId(node.value)) : [],
      activeNodeId: nextTree ? nodeId(nextTree.value) : undefined,
    },
    {
      title: 'Balanceamento concluido',
      description: 'A estrutura final continua sendo ABB, mas com altura menor para as proximas buscas.',
      visualState: after,
      activeNodeId: nextTree ? nodeId(nextTree.value) : undefined,
    },
  ];
}

function getFinalStepTitle(action: LabAction, value: number) {
  const titleByAction: Record<Exclude<LabAction, 'Balancear'>, string> = {
    Inserir: `Inserir ${value}`,
    Remover: `Remover ${value}`,
    Pesquisar: `Resultado para ${value}`,
  };

  return action === 'Balancear' ? 'Balancear arvore' : titleByAction[action];
}

function getFinalStepDescription(action: LabAction, value: number) {
  const descriptionByAction: Record<Exclude<LabAction, 'Balancear'>, string> = {
    Inserir: `${value} aparece no desenho final da ABB.`,
    Remover: `${value} deixa de aparecer no desenho final quando existia na arvore.`,
    Pesquisar: `O caminho destacado mostra onde ${value} foi encontrado ou onde a busca parou.`,
  };

  return action === 'Balancear' ? 'A arvore foi reorganizada.' : descriptionByAction[action];
}

function insertValue(tree: LabTreeNode | undefined, value: number): LabTreeNode {
  if (!tree) {
    return { value };
  }

  if (value === tree.value) {
    return tree;
  }

  if (value < tree.value) {
    return { ...tree, left: insertValue(tree.left, value) };
  }

  return { ...tree, right: insertValue(tree.right, value) };
}

function removeValue(tree: LabTreeNode | undefined, value: number): LabTreeNode | undefined {
  if (!tree) {
    return undefined;
  }

  if (value < tree.value) {
    return { ...tree, left: removeValue(tree.left, value) };
  }

  if (value > tree.value) {
    return { ...tree, right: removeValue(tree.right, value) };
  }

  if (!tree.left) {
    return cloneTree(tree.right);
  }

  if (!tree.right) {
    return cloneTree(tree.left);
  }

  const successor = minValue(tree.right);
  return {
    value: successor,
    left: cloneTree(tree.left),
    right: removeValue(tree.right, successor),
  };
}

function getSearchPath(tree: LabTreeNode | undefined, value: number): LabTreeNode[] {
  const path: LabTreeNode[] = [];
  let current = tree;

  while (current) {
    path.push(current);
    if (value === current.value) {
      break;
    }
    current = value < current.value ? current.left : current.right;
  }

  return path;
}

function inOrderValues(tree: LabTreeNode | undefined): number[] {
  if (!tree) {
    return [];
  }

  return [...inOrderValues(tree.left), tree.value, ...inOrderValues(tree.right)];
}

function buildBalancedTree(values: number[]): LabTreeNode | undefined {
  if (values.length === 0) {
    return undefined;
  }

  const middle = Math.floor(values.length / 2);
  return {
    value: values[middle],
    left: buildBalancedTree(values.slice(0, middle)),
    right: buildBalancedTree(values.slice(middle + 1)),
  };
}

function minValue(tree: LabTreeNode): number {
  let current = tree;
  while (current.left) {
    current = current.left;
  }
  return current.value;
}

function cloneTree(tree: LabTreeNode | undefined): LabTreeNode | undefined {
  if (!tree) {
    return undefined;
  }

  return {
    value: tree.value,
    left: cloneTree(tree.left),
    right: cloneTree(tree.right),
  };
}

function toTreeNodeView(tree: LabTreeNode): TreeNodeView {
  return {
    id: nodeId(tree.value),
    label: String(tree.value),
    left: tree.left ? toTreeNodeView(tree.left) : undefined,
    right: tree.right ? toTreeNodeView(tree.right) : undefined,
  };
}

function nodeId(value: number) {
  return `n${value}`;
}
