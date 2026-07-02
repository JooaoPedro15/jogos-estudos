import type { CodeDrill, FunctionStep } from '../types/content';

type FunctionExamStep = FunctionStep & { skillId: 'program' };

function functionStep(step: Omit<FunctionExamStep, 'kind' | 'skillId'>): FunctionExamStep {
  return {
    kind: 'function',
    skillId: 'program',
    ...step,
  };
}

export const codeDrillCatalog: CodeDrill[] = [
  {
    id: 'code-arvore-contar-nos-base',
    domainId: 'arvore',
    title: 'Arvore: caso base para contar nos',
    source: 'lista-prova3',
    repetitionGroup: 'arvore-contagem-recursiva',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Escrever a funcao completa ate a recursao ficar automatica.',
    stem: 'Reescreva a funcao inteira que conta todos os nos de uma arvore binaria.',
    scaffold: `class No {
  int elemento;
  No esq, dir;
}

class Arvore {
  private No raiz;

  private int contar(No i) {
    // escreva a funcao inteira no campo de resposta
  }
}`,
    visual: {
      kind: 'binary-tree',
      title: 'Arvore binaria',
      caption: 'O ponteiro nulo encerra cada ramo recursivo.',
      labels: ['8', '3', '10', '1', '6'],
    },
    step: functionStep({
      id: 'code-arvore-contar-nos-base-step',
      prompt: 'Escreva a funcao contar completa.',
      signature: 'private int contar(No i)',
      solution: `private int contar(No i) {
  if (i == null) return 0;
  return contar(i.esq) + contar(i.dir) + 1;
}`,
      requiredFragments: [
        { id: 'base', label: 'caso base nulo', code: 'if (i == null) return 0;', mistakeTag: 'missing-base-case' },
        { id: 'left', label: 'chamada esquerda', code: 'contar(i.esq)' },
        { id: 'right', label: 'chamada direita', code: 'contar(i.dir)' },
        { id: 'self', label: 'conta no atual', code: '+ 1', mistakeTag: 'missing-base-case' },
      ],
      lineExplanations: [
        { code: 'No i', note: 'Parametro que representa a raiz da subarvore atual.' },
        { code: 'if (i == null) return 0;', note: 'Subarvore vazia nao possui nos.' },
        { code: 'return contar(i.esq) + contar(i.dir) + 1;', note: 'Soma os dois ramos e conta o no atual.' },
      ],
      mistakeTag: 'missing-base-case',
      explanation: 'O padrao e sempre: parar no nulo, resolver esquerda, resolver direita, combinar com o no atual.',
    }),
  },
  {
    id: 'code-arvore-estritamente-binaria',
    domainId: 'arvore',
    title: 'Arvore: estritamente binaria',
    source: 'lista-prova3',
    repetitionGroup: 'arvore-contagem-recursiva',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Repetir uma verificacao recursiva com tres casos.',
    stem: 'Implemente a funcao que retorna true quando todo no tem 0 ou 2 filhos.',
    scaffold: `class No {
  int elemento;
  No esq, dir;
}

class Arvore {
  private boolean ehEstritamenteBinaria(No i) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'binary-tree',
      title: '0 ou 2 filhos',
      caption: 'Um unico filho quebra a propriedade imediatamente.',
      labels: ['12', '7', '18', '4', '9', '16', '22'],
    },
    step: functionStep({
      id: 'code-arvore-estritamente-binaria-step',
      prompt: 'Escreva a funcao ehEstritamenteBinaria completa.',
      signature: 'private boolean ehEstritamenteBinaria(No i)',
      solution: `private boolean ehEstritamenteBinaria(No i) {
  if (i == null) return true;
  if (i.esq == null && i.dir == null) return true;
  if (i.esq != null && i.dir != null) {
    return ehEstritamenteBinaria(i.esq) && ehEstritamenteBinaria(i.dir);
  }
  return false;
}`,
      requiredFragments: [
        { id: 'null', label: 'nulo valido', code: 'if (i == null) return true;' },
        { id: 'leaf', label: 'folha valida', code: 'if (i.esq == null && i.dir == null) return true;' },
        { id: 'two-children', label: 'dois filhos', code: 'if (i.esq != null && i.dir != null)' },
        { id: 'left-rec', label: 'recursao esquerda', code: 'ehEstritamenteBinaria(i.esq)' },
        { id: 'right-rec', label: 'recursao direita', code: 'ehEstritamenteBinaria(i.dir)' },
        { id: 'false', label: 'um filho invalido', code: 'return false;', mistakeTag: 'wrong-case-analysis' },
      ],
      lineExplanations: [
        { code: 'if (i == null) return true;', note: 'O ramo vazio nao viola a regra.' },
        { code: 'if (i.esq == null && i.dir == null) return true;', note: 'Folha tem zero filhos, entao e valida.' },
        { code: 'if (i.esq != null && i.dir != null)', note: 'So neste caso vale continuar a recursao.' },
        { code: 'return false;', note: 'Se sobrou exatamente um filho, a arvore nao e estritamente binaria.' },
      ],
      mistakeTag: 'wrong-case-analysis',
      explanation: 'Essa funcao treina a habilidade de separar nulo, folha, dois filhos e caso invalido.',
    }),
  },
  {
    id: 'code-arvore-soma-intervalo',
    domainId: 'arvore',
    title: 'Arvore: soma em intervalo de ABB',
    source: 'lista-prova3',
    repetitionGroup: 'arvore-abb-intervalo',
    phase: 'modify',
    format: 'code-modification',
    skillId: 'program',
    goal: 'Reescrever a funcao inteira modificando a poda da ABB.',
    stem: 'Em uma ABB, some apenas os valores no intervalo [a, b] sem visitar ramos impossiveis.',
    scaffold: `class No {
  int elemento;
  No esq, dir;
}

class Arvore {
  private int somaIntervalo(No i, int a, int b) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'binary-tree',
      title: 'ABB com poda',
      caption: 'Menor que a vai para a direita; maior que b vai para a esquerda.',
      labels: ['20', '10', '30', '5', '15', '25', '40'],
    },
    step: functionStep({
      id: 'code-arvore-soma-intervalo-step',
      prompt: 'Escreva a funcao somaIntervalo completa.',
      signature: 'private int somaIntervalo(No i, int a, int b)',
      solution: `private int somaIntervalo(No i, int a, int b) {
  if (i == null) return 0;
  if (i.elemento < a) return somaIntervalo(i.dir, a, b);
  if (i.elemento > b) return somaIntervalo(i.esq, a, b);
  return i.elemento + somaIntervalo(i.esq, a, b) + somaIntervalo(i.dir, a, b);
}`,
      requiredFragments: [
        { id: 'base', label: 'caso base nulo', code: 'if (i == null) return 0;', mistakeTag: 'missing-base-case' },
        { id: 'small', label: 'poda quando menor que a', code: 'if (i.elemento < a) return somaIntervalo(i.dir, a, b);' },
        { id: 'big', label: 'poda quando maior que b', code: 'if (i.elemento > b) return somaIntervalo(i.esq, a, b);' },
        { id: 'sum', label: 'soma no intervalo', code: 'return i.elemento + somaIntervalo(i.esq, a, b) + somaIntervalo(i.dir, a, b);' },
      ],
      lineExplanations: [
        { code: 'if (i == null) return 0;', note: 'Ramo vazio nao soma nada.' },
        { code: 'if (i.elemento < a) return somaIntervalo(i.dir, a, b);', note: 'Tudo a esquerda tambem e menor, entao corta esse ramo.' },
        { code: 'if (i.elemento > b) return somaIntervalo(i.esq, a, b);', note: 'Tudo a direita tambem e maior, entao corta esse ramo.' },
        { code: 'return i.elemento + ...', note: 'Quando o valor esta no intervalo, soma o atual e os dois lados.' },
      ],
      mistakeTag: 'wrong-case-analysis',
      explanation: 'A modificacao importante e preservar a propriedade da ABB dentro da funcao completa.',
    }),
  },
  {
    id: 'code-arvore-eh-abb',
    domainId: 'arvore',
    title: 'Arvore: validar se e ABB',
    source: 'lista-prova3',
    repetitionGroup: 'arvore-abb-intervalo',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Treinar validacao recursiva por limites minimo e maximo.',
    stem: 'Implemente a verificacao que garante se todos os nos respeitam os limites de uma ABB.',
    scaffold: `class No {
  int elemento;
  No esq, dir;
}

class Arvore {
  private boolean ehABB(No i, int min, int max) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'binary-tree',
      title: 'Limites de ABB',
      caption: 'Cada descida estreita a faixa permitida para o no.',
      labels: ['50', '30', '70', '20', '40', '60', '80'],
    },
    step: functionStep({
      id: 'code-arvore-eh-abb-step',
      prompt: 'Escreva a funcao ehABB completa usando min e max.',
      signature: 'private boolean ehABB(No i, int min, int max)',
      solution: `private boolean ehABB(No i, int min, int max) {
  if (i == null) return true;
  if (i.elemento <= min || i.elemento >= max) return false;
  return ehABB(i.esq, min, i.elemento) && ehABB(i.dir, i.elemento, max);
}`,
      requiredFragments: [
        { id: 'base', label: 'nulo valido', code: 'if (i == null) return true;' },
        { id: 'limits', label: 'teste de limites', code: 'i.elemento <= min || i.elemento >= max' },
        { id: 'left', label: 'limite maximo na esquerda', code: 'ehABB(i.esq, min, i.elemento)' },
        { id: 'right', label: 'limite minimo na direita', code: 'ehABB(i.dir, i.elemento, max)' },
      ],
      lineExplanations: [
        { code: 'if (i == null) return true;', note: 'Um ramo vazio nao quebra a ABB.' },
        { code: 'if (i.elemento <= min || i.elemento >= max) return false;', note: 'O no precisa ficar dentro da faixa recebida.' },
        { code: 'ehABB(i.esq, min, i.elemento)', note: 'Na esquerda, o atual vira o novo limite maximo.' },
        { code: 'ehABB(i.dir, i.elemento, max)', note: 'Na direita, o atual vira o novo limite minimo.' },
      ],
      mistakeTag: 'wrong-case-analysis',
      explanation: 'Comparar so pai e filho parece certo, mas falha em violacoes mais profundas.',
    }),
  },
  {
    id: 'code-arvore-espelho',
    domainId: 'arvore',
    title: 'Arvore: testar espelho',
    source: 'lista-prova3',
    repetitionGroup: 'arvore-espelho',
    phase: 'modify',
    format: 'code-modification',
    skillId: 'program',
    goal: 'Modificar a recursao para comparar duas arvores em lados opostos.',
    stem: 'Dadas duas raizes, escreva a funcao que verifica se uma arvore e espelho da outra.',
    scaffold: `class No {
  int elemento;
  No esq, dir;
}

class Arvore {
  private boolean ehEspelho(No a, No b) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'binary-tree',
      title: 'Comparacao cruzada',
      caption: 'Esquerda de uma arvore compara com direita da outra.',
      labels: ['9', '4', '12', '12', '4'],
    },
    step: functionStep({
      id: 'code-arvore-espelho-step',
      prompt: 'Escreva a funcao ehEspelho completa.',
      signature: 'private boolean ehEspelho(No a, No b)',
      solution: `private boolean ehEspelho(No a, No b) {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  if (a.elemento != b.elemento) return false;
  return ehEspelho(a.esq, b.dir) && ehEspelho(a.dir, b.esq);
}`,
      requiredFragments: [
        { id: 'both-null', label: 'dois nulos validos', code: 'if (a == null && b == null) return true;' },
        { id: 'one-null', label: 'apenas um nulo invalido', code: 'if (a == null || b == null) return false;' },
        { id: 'value', label: 'mesmo elemento', code: 'if (a.elemento != b.elemento) return false;' },
        { id: 'cross-left', label: 'comparacao cruzada esquerda', code: 'ehEspelho(a.esq, b.dir)' },
        { id: 'cross-right', label: 'comparacao cruzada direita', code: 'ehEspelho(a.dir, b.esq)' },
      ],
      lineExplanations: [
        { code: 'if (a == null && b == null) return true;', note: 'Dois ramos vazios continuam espelhados.' },
        { code: 'if (a == null || b == null) return false;', note: 'Se apenas um acabou, as formas sao diferentes.' },
        { code: 'ehEspelho(a.esq, b.dir)', note: 'Espelho sempre cruza os lados.' },
      ],
      mistakeTag: 'wrong-case-analysis',
      explanation: 'A diferenca para igualdade comum e a chamada cruzada entre esquerda e direita.',
    }),
  },
  {
    id: 'code-avl-altura',
    domainId: 'avl',
    title: 'AVL: funcao altura',
    source: 'lista-prova3',
    repetitionGroup: 'avl-alturas',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Fixar a convencao usada em quase toda questao de AVL.',
    stem: 'Escreva a funcao altura considerando nulo como -1 e folha como 0.',
    scaffold: `class NoAVL {
  int elemento;
  int altura;
  NoAVL esq, dir;
}

class ArvoreAVL {
  private int altura(NoAVL i) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'avl',
      title: 'Altura em AVL',
      caption: 'Filho nulo vale -1, entao a folha termina com 0.',
      labels: ['30', '20', '40'],
    },
    step: functionStep({
      id: 'code-avl-altura-step',
      prompt: 'Escreva a funcao altura completa.',
      signature: 'private int altura(NoAVL i)',
      solution: `private int altura(NoAVL i) {
  if (i == null) return -1;
  return i.altura;
}`,
      requiredFragments: [
        { id: 'null', label: 'nulo vale -1', code: 'if (i == null) return -1;', mistakeTag: 'wrong-rotation' },
        { id: 'field', label: 'retorna campo altura', code: 'return i.altura;' },
      ],
      lineExplanations: [
        { code: 'if (i == null) return -1;', note: 'Essa convencao deixa a folha com altura 0.' },
        { code: 'return i.altura;', note: 'Em AVL, cada no guarda sua propria altura atualizada.' },
      ],
      mistakeTag: 'wrong-rotation',
      explanation: 'Sem essa convencao, o fator de balanceamento fica deslocado.',
    }),
  },
  {
    id: 'code-avl-recalcular-alturas',
    domainId: 'avl',
    title: 'AVL: recalcular alturas',
    source: 'lista-prova3',
    repetitionGroup: 'avl-alturas',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Repetir a atualizacao pos-ordem de altura.',
    stem: 'Recalcule as alturas de todos os nos e retorne a altura da subarvore.',
    scaffold: `class NoAVL {
  int altura;
  NoAVL esq, dir;
}

class ArvoreAVL {
  private int recalcularAlturas(NoAVL i) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'avl',
      title: 'Pos-ordem',
      caption: 'Primeiro filhos, depois o no atual.',
      labels: ['50', '35', '70', '60'],
    },
    step: functionStep({
      id: 'code-avl-recalcular-alturas-step',
      prompt: 'Escreva a funcao recalcularAlturas completa.',
      signature: 'private int recalcularAlturas(NoAVL i)',
      solution: `private int recalcularAlturas(NoAVL i) {
  if (i == null) return -1;
  int he = recalcularAlturas(i.esq);
  int hd = recalcularAlturas(i.dir);
  i.altura = Math.max(he, hd) + 1;
  return i.altura;
}`,
      requiredFragments: [
        { id: 'base', label: 'nulo vale -1', code: 'if (i == null) return -1;' },
        { id: 'left', label: 'altura esquerda', code: 'int he = recalcularAlturas(i.esq);' },
        { id: 'right', label: 'altura direita', code: 'int hd = recalcularAlturas(i.dir);' },
        { id: 'update', label: 'atualiza altura', code: 'i.altura = Math.max(he, hd) + 1;' },
        { id: 'return', label: 'retorna altura atual', code: 'return i.altura;' },
      ],
      lineExplanations: [
        { code: 'int he = recalcularAlturas(i.esq);', note: 'Calcula a esquerda antes de usar o valor.' },
        { code: 'int hd = recalcularAlturas(i.dir);', note: 'Calcula a direita antes de atualizar o no.' },
        { code: 'i.altura = Math.max(he, hd) + 1;', note: 'Altura e um a mais que o maior filho.' },
      ],
      mistakeTag: 'wrong-rotation',
      explanation: 'Esse padrao aparece antes e depois de insercoes, remocoes e rotacoes.',
    }),
  },
  {
    id: 'code-avl-esta-balanceada',
    domainId: 'avl',
    title: 'AVL: verificar balanceamento',
    source: 'lista-prova3',
    repetitionGroup: 'avl-balanceamento',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Transformar fator de balanceamento em funcao recursiva.',
    stem: 'Escreva a funcao que retorna true se toda subarvore tem fator entre -1 e 1.',
    scaffold: `class NoAVL {
  int altura;
  NoAVL esq, dir;
}

class ArvoreAVL {
  private boolean estaAVL(NoAVL i) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'avl',
      title: 'Fator local e recursivo',
      caption: 'O no atual e os dois ramos precisam estar balanceados.',
      labels: ['40', '20', '60', '10', '30'],
    },
    step: functionStep({
      id: 'code-avl-esta-balanceada-step',
      prompt: 'Escreva a funcao estaAVL completa.',
      signature: 'private boolean estaAVL(NoAVL i)',
      solution: `private boolean estaAVL(NoAVL i) {
  if (i == null) return true;
  int fator = altura(i.dir) - altura(i.esq);
  if (fator < -1 || fator > 1) return false;
  return estaAVL(i.esq) && estaAVL(i.dir);
}`,
      requiredFragments: [
        { id: 'base', label: 'nulo valido', code: 'if (i == null) return true;' },
        { id: 'factor', label: 'calcula fator', code: 'int fator = altura(i.dir) - altura(i.esq);' },
        { id: 'range', label: 'testa faixa AVL', code: 'if (fator < -1 || fator > 1) return false;' },
        { id: 'left', label: 'confere esquerda', code: 'estaAVL(i.esq)' },
        { id: 'right', label: 'confere direita', code: 'estaAVL(i.dir)' },
      ],
      lineExplanations: [
        { code: 'int fator = altura(i.dir) - altura(i.esq);', note: 'O sinal pode variar por professor, mas o modulo precisa ser no maximo 1.' },
        { code: 'if (fator < -1 || fator > 1) return false;', note: 'Qualquer fator fora da faixa invalida a AVL.' },
        { code: 'return estaAVL(i.esq) && estaAVL(i.dir);', note: 'Nao basta o no atual estar ok; os filhos tambem precisam estar.' },
      ],
      mistakeTag: 'wrong-rotation',
      explanation: 'AVL e propriedade global: todos os nos precisam respeitar o fator.',
    }),
  },
  {
    id: 'code-avl-altura-maxima',
    domainId: 'avl',
    title: 'AVL: altura maxima permitida',
    source: 'lista-prova3',
    repetitionGroup: 'avl-balanceamento',
    phase: 'modify',
    format: 'code-modification',
    skillId: 'program',
    goal: 'Modificar a verificacao para incluir um limite de altura.',
    stem: 'A funcao deve verificar se a arvore e AVL e se nenhuma subarvore passa de alturaMax.',
    scaffold: `class NoAVL {
  int altura;
  NoAVL esq, dir;
}

class ArvoreAVL {
  private boolean estaAVLComAlturaMax(NoAVL i, int alturaMax) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'avl',
      title: 'Balanceada com limite',
      caption: 'Alem do fator, o campo altura nao pode passar do maximo.',
      labels: ['25', '12', '37', '6', '18', '31'],
    },
    step: functionStep({
      id: 'code-avl-altura-maxima-step',
      prompt: 'Escreva a funcao estaAVLComAlturaMax completa.',
      signature: 'private boolean estaAVLComAlturaMax(NoAVL i, int alturaMax)',
      solution: `private boolean estaAVLComAlturaMax(NoAVL i, int alturaMax) {
  if (i == null) return true;
  int fator = altura(i.dir) - altura(i.esq);
  if (fator < -1 || fator > 1) return false;
  if (i.altura > alturaMax) return false;
  return estaAVLComAlturaMax(i.esq, alturaMax) && estaAVLComAlturaMax(i.dir, alturaMax);
}`,
      requiredFragments: [
        { id: 'base', label: 'nulo valido', code: 'if (i == null) return true;' },
        { id: 'factor', label: 'fator AVL', code: 'int fator = altura(i.dir) - altura(i.esq);' },
        { id: 'range', label: 'faixa AVL', code: 'if (fator < -1 || fator > 1) return false;' },
        { id: 'max', label: 'limite de altura', code: 'if (i.altura > alturaMax) return false;' },
        { id: 'rec', label: 'recursao com limite', code: 'estaAVLComAlturaMax(i.esq, alturaMax)' },
      ],
      lineExplanations: [
        { code: 'if (i.altura > alturaMax) return false;', note: 'Essa e a modificacao extra alem da AVL comum.' },
        { code: 'estaAVLComAlturaMax(i.esq, alturaMax)', note: 'O limite precisa seguir para todas as subarvores.' },
      ],
      mistakeTag: 'wrong-case-analysis',
      explanation: 'Questoes de modificacao pedem manter o esqueleto e inserir uma regra nova sem quebrar o resto.',
    }),
  },
  {
    id: 'code-avl-rotacao-direita',
    domainId: 'avl',
    title: 'AVL: rotacao direita',
    source: 'reav-style',
    repetitionGroup: 'avl-rotacoes',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Memorizar ponteiros e alturas da rotacao simples direita.',
    stem: 'Implemente a rotacao direita usada no caso esquerda-esquerda.',
    scaffold: `class NoAVL {
  int altura;
  NoAVL esq, dir;
}

class ArvoreAVL {
  private NoAVL rotacaoDireita(NoAVL y) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'avl',
      title: 'Caso esquerda-esquerda',
      caption: 'O filho esquerdo sobe e y desce para a direita dele.',
      labels: ['30', '20', '', '10'],
    },
    step: functionStep({
      id: 'code-avl-rotacao-direita-step',
      prompt: 'Escreva a funcao rotacaoDireita completa.',
      signature: 'private NoAVL rotacaoDireita(NoAVL y)',
      solution: `private NoAVL rotacaoDireita(NoAVL y) {
  NoAVL x = y.esq;
  NoAVL t2 = x.dir;
  x.dir = y;
  y.esq = t2;
  y.altura = Math.max(altura(y.esq), altura(y.dir)) + 1;
  x.altura = Math.max(altura(x.esq), altura(x.dir)) + 1;
  return x;
}`,
      requiredFragments: [
        { id: 'x', label: 'filho esquerdo sobe', code: 'NoAVL x = y.esq;' },
        { id: 't2', label: 'guarda subarvore deslocada', code: 'NoAVL t2 = x.dir;' },
        { id: 'link1', label: 'x aponta para y', code: 'x.dir = y;' },
        { id: 'link2', label: 'y recebe t2', code: 'y.esq = t2;' },
        { id: 'update-y', label: 'atualiza y', code: 'y.altura = Math.max(altura(y.esq), altura(y.dir)) + 1;' },
        { id: 'return', label: 'retorna nova raiz', code: 'return x;' },
      ],
      lineExplanations: [
        { code: 'NoAVL t2 = x.dir;', note: 'T2 nao pode ser perdido quando os ponteiros giram.' },
        { code: 'x.dir = y; y.esq = t2;', note: 'Essas duas atribuicoes fazem a rotacao.' },
        { code: 'return x;', note: 'Depois da rotacao, x vira raiz da subarvore.' },
      ],
      mistakeTag: 'lost-pointer',
      explanation: 'O treino e reescrever a rotacao inteira, porque decorar so o nome da rotacao nao basta na prova.',
    }),
  },
  {
    id: 'code-trie-existe-palavra-base',
    domainId: 'trie',
    title: 'TRIE: pesquisar palavra exata',
    source: 'lista-prova3',
    repetitionGroup: 'trie-palavra-exata',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Separar caminho existente de palavra completa.',
    stem: 'Implemente a busca exata em uma TRIE de letras a..z.',
    scaffold: `class NoTrie {
  NoTrie[] filho = new NoTrie[26];
  boolean fim;
}

class ArvoreTrie {
  private NoTrie raiz;

  boolean existePalavra(String s) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'trie',
      title: 'TRIE com marcador fim',
      caption: 'Caminho para cas pode existir sem cas ser palavra.',
      labels: ['c', 'a', 's', 'a', 'fim'],
    },
    step: functionStep({
      id: 'code-trie-existe-palavra-base-step',
      prompt: 'Escreva a funcao existePalavra completa.',
      signature: 'boolean existePalavra(String s)',
      solution: `boolean existePalavra(String s) {
  NoTrie atual = raiz;
  for (int i = 0; i < s.length(); i++) {
    int pos = s.charAt(i) - 'a';
    if (atual.filho[pos] == null) return false;
    atual = atual.filho[pos];
  }
  return atual.fim;
}`,
      requiredFragments: [
        { id: 'start', label: 'comeca na raiz', code: 'NoTrie atual = raiz;' },
        { id: 'loop', label: 'percorre caracteres', code: 'for (int i = 0; i < s.length(); i++)' },
        { id: 'pos', label: 'calcula indice', code: "int pos = s.charAt(i) - 'a';" },
        { id: 'missing', label: 'falha em caminho ausente', code: 'if (atual.filho[pos] == null) return false;' },
        { id: 'advance', label: 'avanca ponteiro', code: 'atual = atual.filho[pos];' },
        { id: 'fim', label: 'retorna fim da palavra', code: 'return atual.fim;', mistakeTag: 'prefix-vs-word' },
      ],
      lineExplanations: [
        { code: 'NoTrie atual = raiz;', note: 'Toda busca comeca na raiz da TRIE.' },
        { code: "int pos = s.charAt(i) - 'a';", note: 'Converte a letra para uma posicao de 0 a 25.' },
        { code: 'if (atual.filho[pos] == null) return false;', note: 'Se faltou uma aresta, a palavra nao existe.' },
        { code: 'return atual.fim;', note: 'O caminho sozinho e prefixo; palavra completa exige marcador fim.' },
      ],
      mistakeTag: 'prefix-vs-word',
      explanation: 'Esse e o erro classico: retornar true ao terminar o caminho, mesmo sem marcador de palavra.',
    }),
  },
  {
    id: 'code-trie-inserir-palavra',
    domainId: 'trie',
    title: 'TRIE: inserir palavra completa',
    source: 'lista-prova3',
    repetitionGroup: 'trie-palavra-exata',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Repetir criacao de nos e marcacao de fim.',
    stem: 'Escreva a insercao completa de uma palavra em TRIE.',
    scaffold: `class NoTrie {
  NoTrie[] filho = new NoTrie[26];
  boolean fim;
}

class ArvoreTrie {
  private NoTrie raiz = new NoTrie();

  void inserir(String s) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'trie',
      title: 'Insercao em TRIE',
      caption: 'Cria arestas ausentes e marca o ultimo no.',
      labels: ['p', 'a', 'r', 'fim'],
    },
    step: functionStep({
      id: 'code-trie-inserir-palavra-step',
      prompt: 'Escreva a funcao inserir completa.',
      signature: 'void inserir(String s)',
      solution: `void inserir(String s) {
  NoTrie atual = raiz;
  for (int i = 0; i < s.length(); i++) {
    int pos = s.charAt(i) - 'a';
    if (atual.filho[pos] == null) atual.filho[pos] = new NoTrie();
    atual = atual.filho[pos];
  }
  atual.fim = true;
}`,
      requiredFragments: [
        { id: 'start', label: 'comeca na raiz', code: 'NoTrie atual = raiz;' },
        { id: 'loop', label: 'percorre palavra', code: 'for (int i = 0; i < s.length(); i++)' },
        { id: 'create', label: 'cria filho ausente', code: 'if (atual.filho[pos] == null) atual.filho[pos] = new NoTrie();' },
        { id: 'advance', label: 'avanca para filho', code: 'atual = atual.filho[pos];' },
        { id: 'fim', label: 'marca fim', code: 'atual.fim = true;', mistakeTag: 'prefix-vs-word' },
      ],
      lineExplanations: [
        { code: 'if (atual.filho[pos] == null) atual.filho[pos] = new NoTrie();', note: 'Insercao cria somente o caminho que ainda nao existe.' },
        { code: 'atual = atual.filho[pos];', note: 'Depois de garantir o no, avanca para ele.' },
        { code: 'atual.fim = true;', note: 'Sem esse marcador, a TRIE guarda apenas um prefixo.' },
      ],
      mistakeTag: 'prefix-vs-word',
      explanation: 'Repetir essa funcao ajuda a nao esquecer o marcador fim.',
    }),
  },
  {
    id: 'code-trie-contar-prefixo',
    domainId: 'trie',
    title: 'TRIE: modificar para contar prefixo',
    source: 'lista-prova3',
    repetitionGroup: 'trie-palavra-exata',
    phase: 'modify',
    format: 'code-modification',
    skillId: 'program',
    goal: 'Reescrever a busca e trocar o retorno por contagem de subarvore.',
    stem: 'Conte quantas palavras cadastradas comecam com um prefixo.',
    scaffold: `class NoTrie {
  NoTrie[] filho = new NoTrie[26];
  boolean fim;
}

class ArvoreTrie {
  private NoTrie raiz;

  int contarPrefixo(String pref) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'trie',
      title: 'Subarvore do prefixo',
      caption: 'Depois de localizar o prefixo, conte todos os fins abaixo dele.',
      labels: ['c', 'a', 'r', 'fim', 't', 'a', 'fim'],
    },
    step: functionStep({
      id: 'code-trie-contar-prefixo-step',
      prompt: 'Escreva a funcao contarPrefixo completa.',
      signature: 'int contarPrefixo(String pref)',
      solution: `int contarPrefixo(String pref) {
  NoTrie atual = raiz;
  for (int i = 0; i < pref.length(); i++) {
    int pos = pref.charAt(i) - 'a';
    if (atual.filho[pos] == null) return 0;
    atual = atual.filho[pos];
  }
  return contarPalavras(atual);
}`,
      requiredFragments: [
        { id: 'start', label: 'busca comeca na raiz', code: 'NoTrie atual = raiz;' },
        { id: 'loop', label: 'percorre prefixo', code: 'for (int i = 0; i < pref.length(); i++)' },
        { id: 'missing', label: 'prefixo ausente retorna zero', code: 'if (atual.filho[pos] == null) return 0;' },
        { id: 'advance', label: 'avanca no prefixo', code: 'atual = atual.filho[pos];' },
        { id: 'count', label: 'conta subarvore do prefixo', code: 'return contarPalavras(atual);', mistakeTag: 'prefix-vs-word' },
      ],
      lineExplanations: [
        { code: 'for (int i = 0; i < pref.length(); i++)', note: 'Primeiro localiza exatamente o no do prefixo.' },
        { code: 'if (atual.filho[pos] == null) return 0;', note: 'Se o prefixo nao existe, nao ha palavras com ele.' },
        { code: 'return contarPalavras(atual);', note: 'A resposta fica na subarvore que nasce no ultimo caractere do prefixo.' },
      ],
      mistakeTag: 'prefix-vs-word',
      explanation: 'Essa e a modificacao: busca prefixo primeiro, depois faz outra recursao abaixo.',
    }),
  },
  {
    id: 'code-trie-contar-palavras',
    domainId: 'trie',
    title: 'TRIE: contar palavras abaixo',
    source: 'lista-prova3',
    repetitionGroup: 'trie-contagem',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Treinar a DFS que soma marcadores fim na TRIE.',
    stem: 'Implemente o auxiliar que conta quantas palavras existem abaixo de um no.',
    scaffold: `class NoTrie {
  NoTrie[] filho = new NoTrie[26];
  boolean fim;
}

class ArvoreTrie {
  private int contarPalavras(NoTrie no) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'trie',
      title: 'Marcadores fim',
      caption: 'Cada marcador fim soma uma palavra.',
      labels: ['a', 'r', 'fim', 'e', 'fim'],
    },
    step: functionStep({
      id: 'code-trie-contar-palavras-step',
      prompt: 'Escreva a funcao contarPalavras completa.',
      signature: 'private int contarPalavras(NoTrie no)',
      solution: `private int contarPalavras(NoTrie no) {
  if (no == null) return 0;
  int total = no.fim ? 1 : 0;
  for (int i = 0; i < 26; i++) {
    total += contarPalavras(no.filho[i]);
  }
  return total;
}`,
      requiredFragments: [
        { id: 'base', label: 'nulo soma zero', code: 'if (no == null) return 0;' },
        { id: 'fim', label: 'conta marcador fim', code: 'int total = no.fim ? 1 : 0;' },
        { id: 'loop', label: 'varre 26 filhos', code: 'for (int i = 0; i < 26; i++)' },
        { id: 'rec', label: 'soma filho recursivo', code: 'total += contarPalavras(no.filho[i]);' },
        { id: 'return', label: 'retorna total', code: 'return total;' },
      ],
      lineExplanations: [
        { code: 'int total = no.fim ? 1 : 0;', note: 'O proprio no pode representar uma palavra.' },
        { code: 'for (int i = 0; i < 26; i++)', note: 'Depois, todos os filhos precisam ser visitados.' },
      ],
      mistakeTag: 'prefix-vs-word',
      explanation: 'Essa funcao e o motor de varias questoes de prefixo.',
    }),
  },
  {
    id: 'code-trie-prefixo-e-palavra',
    domainId: 'trie',
    title: 'TRIE: prefixo tambem e palavra',
    source: 'reav-style',
    repetitionGroup: 'trie-contagem',
    phase: 'modify',
    format: 'code-modification',
    skillId: 'program',
    goal: 'Modificar a busca para exigir prefixo e palavra ao mesmo tempo.',
    stem: 'Retorne true se pref e prefixo de alguma palavra maior e tambem palavra cadastrada.',
    scaffold: `class NoTrie {
  NoTrie[] filho = new NoTrie[26];
  boolean fim;
}

class ArvoreTrie {
  boolean prefixoTambemPalavra(String pref) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'trie',
      title: 'Fim com filhos',
      caption: 'O ultimo no precisa ter fim=true e ao menos um filho.',
      labels: ['m', 'a', 'r', 'fim', 'e'],
    },
    step: functionStep({
      id: 'code-trie-prefixo-e-palavra-step',
      prompt: 'Escreva a funcao prefixoTambemPalavra completa.',
      signature: 'boolean prefixoTambemPalavra(String pref)',
      solution: `boolean prefixoTambemPalavra(String pref) {
  NoTrie atual = raiz;
  for (int i = 0; i < pref.length(); i++) {
    int pos = pref.charAt(i) - 'a';
    if (atual.filho[pos] == null) return false;
    atual = atual.filho[pos];
  }
  if (!atual.fim) return false;
  for (int i = 0; i < 26; i++) {
    if (atual.filho[i] != null) return true;
  }
  return false;
}`,
      requiredFragments: [
        { id: 'search', label: 'busca prefixo', code: 'for (int i = 0; i < pref.length(); i++)' },
        { id: 'fim', label: 'exige palavra', code: 'if (!atual.fim) return false;' },
        { id: 'children', label: 'procura filho', code: 'if (atual.filho[i] != null) return true;' },
        { id: 'false', label: 'sem filho nao e prefixo maior', code: 'return false;' },
      ],
      lineExplanations: [
        { code: 'if (!atual.fim) return false;', note: 'O prefixo precisa ser palavra cadastrada.' },
        { code: 'if (atual.filho[i] != null) return true;', note: 'Algum filho prova que existe uma palavra maior com esse prefixo.' },
      ],
      mistakeTag: 'prefix-vs-word',
      explanation: 'Essa variacao treina a diferenca entre palavra exata, prefixo e prefixo com continuacao.',
    }),
  },
  {
    id: 'code-doidona-pesquisar-camadas',
    domainId: 'doidona',
    title: 'Doidona: pesquisar em todas as camadas',
    source: 'lista-prova3',
    repetitionGroup: 'doidona-hash-reserva',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Nao parar a busca antes de testar a reserva.',
    stem: 'Treine a rota de pesquisa em uma estrutura com T1, T2, lista e arvore.',
    scaffold: `class EstruturaDoidona {
  int[] t1;
  Lista lista;
  ArvoreABB arvore;

  boolean pesquisar(int x) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'doidona',
      title: 'T1 com reservas',
      caption: 'Colisao nao e ausencia; e desvio para outra estrutura.',
      labels: ['T1', 'hash', 'lista', 'ABB'],
    },
    step: functionStep({
      id: 'code-doidona-pesquisar-camadas-step',
      prompt: 'Escreva a funcao pesquisar completa.',
      signature: 'boolean pesquisar(int x)',
      solution: `boolean pesquisar(int x) {
  int pos = hash(x);
  if (t1[pos] == x) return true;
  if (lista.pesquisar(x)) return true;
  if (arvore.pesquisar(x)) return true;
  return false;
}`,
      requiredFragments: [
        { id: 'hash', label: 'calcula hash', code: 'int pos = hash(x);' },
        { id: 't1', label: 'confere T1', code: 'if (t1[pos] == x) return true;' },
        { id: 'lista', label: 'confere lista', code: 'if (lista.pesquisar(x)) return true;', mistakeTag: 'incomplete-layer-search' },
        { id: 'arvore', label: 'confere arvore', code: 'if (arvore.pesquisar(x)) return true;', mistakeTag: 'incomplete-layer-search' },
        { id: 'false', label: 'so entao retorna falso', code: 'return false;' },
      ],
      lineExplanations: [
        { code: 'int pos = hash(x);', note: 'A primeira tentativa sempre usa a tabela principal.' },
        { code: 'if (lista.pesquisar(x)) return true;', note: 'Se nao achou em T1, ainda pode estar em uma reserva.' },
        { code: 'return false;', note: 'Falso so depois de esgotar todas as camadas.' },
      ],
      mistakeTag: 'incomplete-layer-search',
      explanation: 'A estrutura doidona cobra disciplina: nunca parar no primeiro lugar possivel.',
    }),
  },
  {
    id: 'code-doidona-inserir-lista-abb',
    domainId: 'doidona',
    title: 'Doidona: inserir com lista e ABB',
    source: 'lista-prova3',
    repetitionGroup: 'doidona-hash-reserva',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Repetir a rota de colisao por regras de reserva.',
    stem: 'Insira em T1 quando houver vaga; em colisao, envie par para lista e impar para ABB.',
    scaffold: `class EstruturaDoidona {
  int[] t1;
  Lista lista;
  ArvoreABB arvore;

  void inserir(int x) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'hash',
      title: 'Hash e reserva',
      caption: 'A regra da colisao escolhe a estrutura secundaria.',
      labels: ['T1[2]', '42', 'lista', 'ABB'],
    },
    step: functionStep({
      id: 'code-doidona-inserir-lista-abb-step',
      prompt: 'Escreva a funcao inserir completa.',
      signature: 'void inserir(int x)',
      solution: `void inserir(int x) {
  int pos = hash(x);
  if (t1[pos] == -1) {
    t1[pos] = x;
  } else if (x % 2 == 0) {
    lista.inserir(x);
  } else {
    arvore.inserir(x);
  }
}`,
      requiredFragments: [
        { id: 'hash', label: 'calcula posicao', code: 'int pos = hash(x);' },
        { id: 'empty', label: 'insere em vaga', code: 'if (t1[pos] == -1)' },
        { id: 'write', label: 'grava em T1', code: 't1[pos] = x;' },
        { id: 'even', label: 'par vai para lista', code: 'else if (x % 2 == 0)' },
        { id: 'list', label: 'insere na lista', code: 'lista.inserir(x);' },
        { id: 'tree', label: 'impar vai para arvore', code: 'arvore.inserir(x);' },
      ],
      lineExplanations: [
        { code: 'if (t1[pos] == -1)', note: 'A tabela principal recebe o valor quando a posicao esta livre.' },
        { code: 'else if (x % 2 == 0)', note: 'A regra de colisao separa os destinos.' },
        { code: 'arvore.inserir(x);', note: 'O ultimo caso cobre os impares que colidiram.' },
      ],
      mistakeTag: 'incomplete-layer-search',
      explanation: 'Essa questao treina insercao em estrutura composta, que e muito comum na lista.',
    }),
  },
  {
    id: 'code-doidona-pesquisar-trie-reserva',
    domainId: 'doidona',
    title: 'Doidona: pesquisar com TRIE reserva',
    source: 'lista-prova3',
    repetitionGroup: 'doidona-reservas-variadas',
    phase: 'modify',
    format: 'code-modification',
    skillId: 'program',
    goal: 'Trocar a estrutura de reserva sem esquecer a busca completa.',
    stem: 'Agora as colisoes da tabela principal foram enviadas para uma TRIE de strings.',
    scaffold: `class EstruturaDoidona {
  String[] t1;
  ArvoreTrie trie;

  boolean pesquisar(String s) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'doidona',
      title: 'Hash + TRIE',
      caption: 'T1 guarda alguns itens; a TRIE guarda as colisoes.',
      labels: ['T1', 'hash(s)', 'TRIE', 'fim'],
    },
    step: functionStep({
      id: 'code-doidona-pesquisar-trie-reserva-step',
      prompt: 'Escreva a funcao pesquisar completa para String.',
      signature: 'boolean pesquisar(String s)',
      solution: `boolean pesquisar(String s) {
  int pos = hash(s);
  if (t1[pos] != null && t1[pos].equals(s)) return true;
  return trie.existePalavra(s);
}`,
      requiredFragments: [
        { id: 'hash', label: 'hash da string', code: 'int pos = hash(s);' },
        { id: 'null-safe', label: 'compara T1 com equals', code: 't1[pos] != null && t1[pos].equals(s)' },
        { id: 'trie', label: 'continua na TRIE', code: 'return trie.existePalavra(s);', mistakeTag: 'incomplete-layer-search' },
      ],
      lineExplanations: [
        { code: 't1[pos] != null && t1[pos].equals(s)', note: 'String precisa de equals e ainda exige teste de nulo.' },
        { code: 'return trie.existePalavra(s);', note: 'Se nao estava na tabela, a reserva ainda precisa ser consultada.' },
      ],
      mistakeTag: 'incomplete-layer-search',
      explanation: 'A modificacao muda o tipo e a reserva, mas mantem a ideia de buscar em todas as camadas.',
    }),
  },
  {
    id: 'code-doidona-inserir-avl-reserva',
    domainId: 'doidona',
    title: 'Doidona: inserir com AVL reserva',
    source: 'lista-prova3',
    repetitionGroup: 'doidona-reservas-variadas',
    phase: 'modify',
    format: 'code-modification',
    skillId: 'program',
    goal: 'Reescrever a funcao para usar AVL como area secundaria.',
    stem: 'Ao colidir na tabela, envie o valor para uma AVL de reserva.',
    scaffold: `class EstruturaDoidona {
  int[] t1;
  ArvoreAVL reserva;

  void inserir(int x) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'avl',
      title: 'Reserva balanceada',
      caption: 'A colisao vai para uma arvore que precisa manter balanceamento.',
      labels: ['T1', 'AVL', '30', '20', '40'],
    },
    step: functionStep({
      id: 'code-doidona-inserir-avl-reserva-step',
      prompt: 'Escreva a funcao inserir completa com AVL reserva.',
      signature: 'void inserir(int x)',
      solution: `void inserir(int x) {
  int pos = hash(x);
  if (t1[pos] == -1) {
    t1[pos] = x;
  } else {
    reserva.inserir(x);
  }
}`,
      requiredFragments: [
        { id: 'hash', label: 'calcula hash', code: 'int pos = hash(x);' },
        { id: 'empty', label: 'usa T1 quando livre', code: 'if (t1[pos] == -1)' },
        { id: 'write', label: 'grava valor principal', code: 't1[pos] = x;' },
        { id: 'reserve', label: 'colisao vai para AVL', code: 'reserva.inserir(x);', mistakeTag: 'incomplete-layer-search' },
      ],
      lineExplanations: [
        { code: 'if (t1[pos] == -1)', note: 'Nao manda para a reserva quando a tabela ainda tem vaga.' },
        { code: 'reserva.inserir(x);', note: 'A AVL recebe so as colisoes e se balanceia internamente.' },
      ],
      mistakeTag: 'incomplete-layer-search',
      explanation: 'O treino e reconhecer que trocar a reserva nao muda a regra de colisao.',
    }),
  },
  {
    id: 'code-doidona-rota-por-caractere',
    domainId: 'doidona',
    title: 'Doidona: rota por primeiro caractere',
    source: 'lista-prova3',
    repetitionGroup: 'doidona-reservas-variadas',
    phase: 'modify',
    format: 'code-modification',
    skillId: 'program',
    goal: 'Adaptar a rota de insercao para uma regra de strings.',
    stem: 'Envie palavras iniciadas por vogal para TRIE e as demais para ABB.',
    scaffold: `class EstruturaDoidona {
  ArvoreTrie trie;
  ArvoreABBPalavra abb;

  void inserirPalavra(String s) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'doidona',
      title: 'Roteamento por chave',
      caption: 'A regra decide qual estrutura recebe cada palavra.',
      labels: ['String', 'vogal?', 'TRIE', 'ABB'],
    },
    step: functionStep({
      id: 'code-doidona-rota-por-caractere-step',
      prompt: 'Escreva a funcao inserirPalavra completa.',
      signature: 'void inserirPalavra(String s)',
      solution: `void inserirPalavra(String s) {
  char c = Character.toLowerCase(s.charAt(0));
  if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
    trie.inserir(s);
  } else {
    abb.inserir(s);
  }
}`,
      requiredFragments: [
        { id: 'char', label: 'pega primeiro caractere', code: 'char c = Character.toLowerCase(s.charAt(0));' },
        { id: 'vowels', label: 'testa vogais', code: "c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u'" },
        { id: 'trie', label: 'vogal vai para TRIE', code: 'trie.inserir(s);' },
        { id: 'abb', label: 'demais vao para ABB', code: 'abb.inserir(s);' },
      ],
      lineExplanations: [
        { code: 'Character.toLowerCase(s.charAt(0))', note: 'Normaliza para a regra funcionar com maiusculas.' },
        { code: 'trie.inserir(s);', note: 'A TRIE recebe o grupo definido pela condicao.' },
        { code: 'abb.inserir(s);', note: 'O else precisa preservar todas as outras palavras.' },
      ],
      mistakeTag: 'wrong-case-analysis',
      explanation: 'Estruturas doidonas misturam tipos de estrutura com regras de destino.',
    }),
  },
  {
    id: 'code-somatorio-soma-linear',
    domainId: 'somatorio',
    title: 'Somatorio: soma de 1 ate n',
    source: 'reav-style',
    repetitionGroup: 'somatorio-formulas',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Transformar um laco simples na formula fechada.',
    stem: 'Escreva a funcao que retorna 1 + 2 + ... + n usando formula.',
    scaffold: `class Somatorios {
  int somaLinear(int n) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'array',
      title: 'Soma linear',
      caption: 'A quantidade de termos cresce de 1 ate n.',
      labels: ['1', '2', '3', '...', 'n'],
    },
    step: functionStep({
      id: 'code-somatorio-soma-linear-step',
      prompt: 'Escreva a funcao somaLinear completa.',
      signature: 'int somaLinear(int n)',
      solution: `int somaLinear(int n) {
  return n * (n + 1) / 2;
}`,
      requiredFragments: [
        { id: 'formula', label: 'formula de Gauss', code: 'return n * (n + 1) / 2;', mistakeTag: 'wrong-summation-bound' },
      ],
      lineExplanations: [
        { code: 'n * (n + 1) / 2', note: 'Essa e a soma fechada dos inteiros de 1 ate n.' },
      ],
      mistakeTag: 'wrong-summation-bound',
      explanation: 'Esse treino faz a ponte entre codigo com for e somatorio fechado.',
    }),
  },
  {
    id: 'code-somatorio-contar-triangular',
    domainId: 'somatorio',
    title: 'Somatorio: contar laco triangular',
    source: 'lista-prova3',
    repetitionGroup: 'somatorio-formulas',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Reconhecer a contagem 1 + 2 + ... + n em dois lacos.',
    stem: 'O laco interno roda de 1 ate i. Retorne a quantidade total de execucoes.',
    scaffold: `class Somatorios {
  int contarTriangular(int n) {
    // corresponde a:
    // for (int i = 1; i <= n; i++)
    //   for (int j = 1; j <= i; j++)
    //     op();
  }
}`,
    visual: {
      kind: 'array',
      title: 'Triangulo de execucoes',
      caption: 'As linhas tem 1, 2, 3, ..., n operacoes.',
      labels: ['1', '2', '3', '4', 'n'],
    },
    step: functionStep({
      id: 'code-somatorio-contar-triangular-step',
      prompt: 'Escreva a funcao contarTriangular completa.',
      signature: 'int contarTriangular(int n)',
      solution: `int contarTriangular(int n) {
  return n * (n + 1) / 2;
}`,
      requiredFragments: [
        { id: 'formula', label: 'soma triangular', code: 'return n * (n + 1) / 2;', mistakeTag: 'wrong-summation-bound' },
      ],
      lineExplanations: [
        { code: 'return n * (n + 1) / 2;', note: 'O total e o somatorio de i para i de 1 ate n.' },
      ],
      mistakeTag: 'wrong-summation-bound',
      explanation: 'Mesmo com dois lacos, o limite interno muda com i, entao nao e n ao quadrado completo.',
    }),
  },
  {
    id: 'code-somatorio-contar-retangular',
    domainId: 'somatorio',
    title: 'Somatorio: contar laco retangular',
    source: 'reav-style',
    repetitionGroup: 'somatorio-formulas',
    phase: 'modify',
    format: 'code-modification',
    skillId: 'program',
    goal: 'Diferenciar laco triangular de laco n por m.',
    stem: 'O laco externo roda n vezes e o interno roda m vezes para cada i.',
    scaffold: `class Somatorios {
  int contarRetangular(int n, int m) {
    // corresponde a:
    // for (int i = 0; i < n; i++)
    //   for (int j = 0; j < m; j++)
    //     op();
  }
}`,
    visual: {
      kind: 'array',
      title: 'Retangulo de execucoes',
      caption: 'Todas as linhas possuem m operacoes.',
      labels: ['m', 'm', 'm', '...', 'n linhas'],
    },
    step: functionStep({
      id: 'code-somatorio-contar-retangular-step',
      prompt: 'Escreva a funcao contarRetangular completa.',
      signature: 'int contarRetangular(int n, int m)',
      solution: `int contarRetangular(int n, int m) {
  return n * m;
}`,
      requiredFragments: [
        { id: 'formula', label: 'produto dos limites', code: 'return n * m;', mistakeTag: 'wrong-summation-bound' },
      ],
      lineExplanations: [
        { code: 'return n * m;', note: 'Quando todo i executa m operacoes, o total e produto.' },
      ],
      mistakeTag: 'wrong-summation-bound',
      explanation: 'Essa modificacao evita aplicar Gauss em qualquer laco aninhado sem olhar os limites.',
    }),
  },
  {
    id: 'code-somatorio-pares',
    domainId: 'somatorio',
    title: 'Somatorio: soma dos pares',
    source: 'reav-style',
    repetitionGroup: 'somatorio-transformacao',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Reescrever uma soma aritmetica com passo 2.',
    stem: 'Retorne 2 + 4 + 6 + ... + 2n usando formula.',
    scaffold: `class Somatorios {
  int somaPares(int n) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'array',
      title: 'Pares ate 2n',
      caption: 'Fatorar 2 deixa a soma 1 + 2 + ... + n.',
      labels: ['2', '4', '6', '...', '2n'],
    },
    step: functionStep({
      id: 'code-somatorio-pares-step',
      prompt: 'Escreva a funcao somaPares completa.',
      signature: 'int somaPares(int n)',
      solution: `int somaPares(int n) {
  return n * (n + 1);
}`,
      requiredFragments: [
        { id: 'formula', label: 'formula dos pares', code: 'return n * (n + 1);', mistakeTag: 'wrong-summation-bound' },
      ],
      lineExplanations: [
        { code: 'n * (n + 1)', note: 'Como 2 * (n(n+1)/2), o 2 cancela a divisao.' },
      ],
      mistakeTag: 'wrong-summation-bound',
      explanation: 'Esse exercicio treina enxergar fator comum dentro do somatorio.',
    }),
  },
  {
    id: 'code-somatorio-custo-misto',
    domainId: 'somatorio',
    title: 'Somatorio: custo misto',
    source: 'lista-prova3',
    repetitionGroup: 'somatorio-transformacao',
    phase: 'modify',
    format: 'code-modification',
    skillId: 'program',
    goal: 'Combinar parte linear com parte triangular.',
    stem: 'O algoritmo faz uma operacao fora do laco interno e depois j de 1 ate i.',
    scaffold: `class Somatorios {
  int custoMisto(int n) {
    // for (int i = 1; i <= n; i++) {
    //   a();
    //   for (int j = 1; j <= i; j++) b();
    // }
  }
}`,
    visual: {
      kind: 'array',
      title: 'Linear + triangular',
      caption: 'Cada linha tem uma operacao fixa mais i operacoes internas.',
      labels: ['1+1', '1+2', '1+3', '...', '1+n'],
    },
    step: functionStep({
      id: 'code-somatorio-custo-misto-step',
      prompt: 'Escreva a funcao custoMisto completa.',
      signature: 'int custoMisto(int n)',
      solution: `int custoMisto(int n) {
  return n + n * (n + 1) / 2;
}`,
      requiredFragments: [
        { id: 'linear', label: 'parte linear', code: 'n +' },
        { id: 'triangular', label: 'parte triangular', code: 'n * (n + 1) / 2', mistakeTag: 'wrong-summation-bound' },
      ],
      lineExplanations: [
        { code: 'n', note: 'A operacao a() executa uma vez para cada i.' },
        { code: 'n * (n + 1) / 2', note: 'O laco interno soma 1 + 2 + ... + n.' },
      ],
      mistakeTag: 'wrong-summation-bound',
      explanation: 'A prova costuma misturar custos; a resposta precisa somar todas as partes.',
    }),
  },
  {
    id: 'code-ordenacao-insertion-sort',
    domainId: 'ordenacao',
    title: 'Ordenacao: insertion sort completo',
    source: 'lista-prova3',
    repetitionGroup: 'ordenacao-insercao-adaptada',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Repetir o esqueleto inteiro antes de adaptar comparadores.',
    stem: 'Escreva a funcao de insertion sort classico sobre um vetor de inteiros.',
    scaffold: `class Insercao {
  void insertionSort(int[] array) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'array',
      title: 'Prefixo ordenado',
      caption: 'A cada rodada, a chave entra no prefixo ja ordenado.',
      labels: ['2', '5', '9', '3', '8'],
    },
    step: functionStep({
      id: 'code-ordenacao-insertion-sort-step',
      prompt: 'Escreva a funcao insertionSort completa.',
      signature: 'void insertionSort(int[] array)',
      solution: `void insertionSort(int[] array) {
  for (int i = 1; i < array.length; i++) {
    int chave = array[i];
    int j = i - 1;
    while (j >= 0 && array[j] > chave) {
      array[j + 1] = array[j];
      j--;
    }
    array[j + 1] = chave;
  }
}`,
      requiredFragments: [
        { id: 'for', label: 'for inicia em 1', code: 'for (int i = 1; i < array.length; i++)' },
        { id: 'key', label: 'guarda chave', code: 'int chave = array[i];' },
        { id: 'j', label: 'j comeca antes da chave', code: 'int j = i - 1;' },
        { id: 'while', label: 'desloca maiores', code: 'while (j >= 0 && array[j] > chave)' },
        { id: 'shift', label: 'deslocamento para direita', code: 'array[j + 1] = array[j];' },
        { id: 'insert', label: 'insere chave', code: 'array[j + 1] = chave;' },
      ],
      lineExplanations: [
        { code: 'int chave = array[i];', note: 'A chave e o valor que sera encaixado no prefixo ordenado.' },
        { code: 'while (j >= 0 && array[j] > chave)', note: 'Enquanto houver valor maior, desloca para abrir espaco.' },
        { code: 'array[j + 1] = chave;', note: 'Quando para, j+1 e a posicao correta.' },
      ],
      mistakeTag: 'algorithm-confusion',
      explanation: 'A repeticao aqui e proposital: escrever o algoritmo inteiro varias vezes cria memoria muscular.',
    }),
  },
  {
    id: 'code-ordenacao-insercao-par-impar',
    domainId: 'ordenacao',
    title: 'Ordenacao: adaptar insercao para pares e impares',
    source: 'reav-style',
    repetitionGroup: 'ordenacao-insercao-adaptada',
    phase: 'modify',
    format: 'code-modification',
    skillId: 'program',
    goal: 'Modificar o insertion sort trocando apenas a regra de comparacao.',
    stem: 'Ordene impares antes dos pares; dentro de cada grupo, deixe crescente.',
    scaffold: `class InsercaoEspecial {
  void sort(int[] array) {
    // escreva a funcao inteira usando vemDepois
  }
}`,
    visual: {
      kind: 'array',
      title: 'Insercao adaptada',
      caption: 'A comparacao muda; o esqueleto do insertion sort permanece.',
      labels: ['4', '3', '8', '6', '1', '2', '9'],
    },
    step: functionStep({
      id: 'code-ordenacao-insercao-par-impar-step',
      prompt: 'Escreva a funcao sort completa usando vemDepois.',
      signature: 'void sort(int[] array)',
      solution: `void sort(int[] array) {
  for (int i = 1; i < array.length; i++) {
    int chave = array[i];
    int j = i - 1;
    while (j >= 0 && vemDepois(array[j], chave)) {
      array[j + 1] = array[j];
      j--;
    }
    array[j + 1] = chave;
  }
}`,
      requiredFragments: [
        { id: 'for', label: 'for do insertion', code: 'for (int i = 1; i < array.length; i++)' },
        { id: 'key', label: 'guarda chave', code: 'int chave = array[i];' },
        { id: 'compare', label: 'usa comparador adaptado', code: 'while (j >= 0 && vemDepois(array[j], chave))', mistakeTag: 'algorithm-confusion' },
        { id: 'shift', label: 'desloca elementos', code: 'array[j + 1] = array[j];' },
        { id: 'insert', label: 'reinsere chave', code: 'array[j + 1] = chave;' },
      ],
      lineExplanations: [
        { code: 'vemDepois(array[j], chave)', note: 'A adaptacao mora no comparador, nao no esqueleto inteiro.' },
        { code: 'array[j + 1] = array[j];', note: 'O deslocamento e igual ao insertion sort classico.' },
      ],
      mistakeTag: 'algorithm-confusion',
      explanation: 'A prova costuma pedir modificacoes assim: manter o algoritmo e trocar a regra.',
    }),
  },
  {
    id: 'code-ordenacao-comparador-par-impar',
    domainId: 'ordenacao',
    title: 'Ordenacao: comparador par e impar',
    source: 'reav-style',
    repetitionGroup: 'ordenacao-comparadores',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Escrever o comparador que sustenta a ordenacao adaptada.',
    stem: 'Retorne true quando a deve ficar depois de b na regra: impares primeiro, depois pares, ambos crescentes.',
    scaffold: `class InsercaoEspecial {
  private boolean vemDepois(int a, int b) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'array',
      title: 'Regra de prioridade',
      caption: 'Impar tem prioridade; empate de paridade usa valor crescente.',
      labels: ['3', '9', '1', '2', '4', '8'],
    },
    step: functionStep({
      id: 'code-ordenacao-comparador-par-impar-step',
      prompt: 'Escreva a funcao vemDepois completa.',
      signature: 'private boolean vemDepois(int a, int b)',
      solution: `private boolean vemDepois(int a, int b) {
  boolean aPar = a % 2 == 0;
  boolean bPar = b % 2 == 0;
  if (aPar != bPar) return aPar;
  return a > b;
}`,
      requiredFragments: [
        { id: 'a', label: 'paridade de a', code: 'boolean aPar = a % 2 == 0;' },
        { id: 'b', label: 'paridade de b', code: 'boolean bPar = b % 2 == 0;' },
        { id: 'diff', label: 'paridade diferente', code: 'if (aPar != bPar) return aPar;' },
        { id: 'value', label: 'empate por valor', code: 'return a > b;' },
      ],
      lineExplanations: [
        { code: 'if (aPar != bPar) return aPar;', note: 'Se a e par e b e impar, a deve vir depois.' },
        { code: 'return a > b;', note: 'Mesma paridade volta para ordem crescente comum.' },
      ],
      mistakeTag: 'algorithm-confusion',
      explanation: 'Separar o comparador deixa qualquer algoritmo de ordenacao mais facil de adaptar.',
    }),
  },
  {
    id: 'code-ordenacao-selection-sort',
    domainId: 'ordenacao',
    title: 'Ordenacao: selection sort completo',
    source: 'lista-prova3',
    repetitionGroup: 'ordenacao-selection',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Memorizar outro algoritmo classico inteiro.',
    stem: 'Escreva o selection sort classico em ordem crescente.',
    scaffold: `class Selecao {
  void selectionSort(int[] array) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'array',
      title: 'Minimo da cauda',
      caption: 'A cada i, encontra o menor elemento do restante.',
      labels: ['7', '2', '5', '1', '9'],
    },
    step: functionStep({
      id: 'code-ordenacao-selection-sort-step',
      prompt: 'Escreva a funcao selectionSort completa.',
      signature: 'void selectionSort(int[] array)',
      solution: `void selectionSort(int[] array) {
  for (int i = 0; i < array.length - 1; i++) {
    int menor = i;
    for (int j = i + 1; j < array.length; j++) {
      if (array[j] < array[menor]) menor = j;
    }
    int tmp = array[i];
    array[i] = array[menor];
    array[menor] = tmp;
  }
}`,
      requiredFragments: [
        { id: 'outer', label: 'laco externo', code: 'for (int i = 0; i < array.length - 1; i++)' },
        { id: 'min', label: 'menor inicia em i', code: 'int menor = i;' },
        { id: 'inner', label: 'busca na cauda', code: 'for (int j = i + 1; j < array.length; j++)' },
        { id: 'compare', label: 'atualiza menor', code: 'if (array[j] < array[menor]) menor = j;' },
        { id: 'swap1', label: 'troca com tmp', code: 'int tmp = array[i];' },
        { id: 'swap2', label: 'coloca menor em i', code: 'array[i] = array[menor];' },
      ],
      lineExplanations: [
        { code: 'int menor = i;', note: 'Assume que a posicao atual guarda o menor da cauda.' },
        { code: 'for (int j = i + 1; j < array.length; j++)', note: 'Procura um menor apenas nas posicoes ainda nao fixadas.' },
        { code: 'array[i] = array[menor];', note: 'A troca fixa o menor na proxima posicao ordenada.' },
      ],
      mistakeTag: 'algorithm-confusion',
      explanation: 'Selection sort e simples, mas a prova pode pedir analise de comparacoes e movimentacoes.',
    }),
  },
  {
    id: 'code-ordenacao-bubble-otimizado',
    domainId: 'ordenacao',
    title: 'Ordenacao: bubble sort otimizado',
    source: 'reav-style',
    repetitionGroup: 'ordenacao-selection',
    phase: 'modify',
    format: 'code-modification',
    skillId: 'program',
    goal: 'Modificar bubble sort para parar quando nao houver troca.',
    stem: 'Escreva o bubble sort com flag de troca para melhor caso linear.',
    scaffold: `class Bolha {
  void bubbleSortOtimizado(int[] array) {
    // escreva a funcao inteira
  }
}`,
    visual: {
      kind: 'array',
      title: 'Passada sem troca',
      caption: 'Se uma passada nao troca nada, o vetor ja esta ordenado.',
      labels: ['1', '2', '3', '4', '5'],
    },
    step: functionStep({
      id: 'code-ordenacao-bubble-otimizado-step',
      prompt: 'Escreva a funcao bubbleSortOtimizado completa.',
      signature: 'void bubbleSortOtimizado(int[] array)',
      solution: `void bubbleSortOtimizado(int[] array) {
  boolean trocou = true;
  for (int fim = array.length - 1; fim > 0 && trocou; fim--) {
    trocou = false;
    for (int i = 0; i < fim; i++) {
      if (array[i] > array[i + 1]) {
        int tmp = array[i];
        array[i] = array[i + 1];
        array[i + 1] = tmp;
        trocou = true;
      }
    }
  }
}`,
      requiredFragments: [
        { id: 'flag-start', label: 'flag inicial', code: 'boolean trocou = true;' },
        { id: 'outer', label: 'laco depende da flag', code: 'fim > 0 && trocou' },
        { id: 'reset', label: 'reseta flag por passada', code: 'trocou = false;' },
        { id: 'compare', label: 'compara vizinhos', code: 'if (array[i] > array[i + 1])' },
        { id: 'swap', label: 'troca vizinhos', code: 'array[i + 1] = tmp;' },
        { id: 'flag-set', label: 'marca troca', code: 'trocou = true;' },
      ],
      lineExplanations: [
        { code: 'fim > 0 && trocou', note: 'A otimizacao para quando a passada anterior nao trocou nada.' },
        { code: 'trocou = false;', note: 'Cada passada precisa comecar assumindo que nao havera troca.' },
        { code: 'trocou = true;', note: 'Uma troca prova que talvez ainda existam inversoes.' },
      ],
      mistakeTag: 'algorithm-confusion',
      explanation: 'Essa modificacao tambem muda a analise de melhor caso.',
    }),
  },
];

export function getDrillsByGroup(repetitionGroup: string): CodeDrill[] {
  return codeDrillCatalog.filter((drill) => drill.repetitionGroup === repetitionGroup);
}
