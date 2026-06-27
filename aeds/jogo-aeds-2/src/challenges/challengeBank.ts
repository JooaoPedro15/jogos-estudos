import type { Challenge } from '../types/challenge';

export const challengeBank = [
  {
    id: 'abb-pesquisar-01',
    title: 'Pesquisar elemento em ABB',
    pattern: 'seguir-um-caminho',
    structure: 'abb',
    difficulty: 'facil',
    statement:
      'Considere a classe No com os campos elemento, esq e dir, e a classe Arvore com o atributo raiz. Implemente o metodo pesquisar(int x) para decidir se x pertence a ABB. Justifique a complexidade no pior caso.',
    providedCode: `class No {
  int elemento;
  No esq, dir;
}

class Arvore {
  private No raiz;

  boolean pesquisar(int x) {
    return pesquisar(x, raiz);
  }

  private boolean pesquisar(int x, No i) {
    // complete o metodo
  }
}`,
    visualStateId: 'abb-basica-01',
    steps: [
      {
        id: 'abb-pesquisar-01-s1',
        kind: 'interpretar',
        prompt: 'Qual propriedade permite descartar metade local da arvore a cada comparacao?',
        options: [
          { id: 'a', label: 'Valores menores ficam em esq e maiores em dir.' },
          { id: 'b', label: 'Todos os nos folha ficam no mesmo nivel.' },
          { id: 'c', label: 'A raiz sempre e o menor elemento.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'abb-pesquisar-01-s2',
        kind: 'simular',
        prompt: 'Ao pesquisar 50 na arvore exibida, qual caminho e visitado?',
        options: [
          { id: 'a', label: '40 -> 60 -> 50' },
          { id: 'b', label: '40 -> 20 -> 30' },
          { id: 'c', label: '40 -> 60 -> 70' },
        ],
        correctOptionId: 'a',
        activePath: ['n40', 'n60', 'n50'],
      },
      {
        id: 'abb-pesquisar-01-s3',
        kind: 'lacuna',
        prompt: 'Complete a condicao de descida para a subarvore esquerda: if (x ___ i.elemento).',
        gapId: 'comparacao-esq',
        answers: [{ id: 'lt', answer: '<', aliases: ['menor que'] }],
      },
      {
        id: 'abb-pesquisar-01-s4',
        kind: 'complexidade',
        prompt: 'Qual e a complexidade no pior caso, sem assumir balanceamento?',
        options: [
          { id: 'a', label: 'O(h), que pode chegar a O(n)' },
          { id: 'b', label: 'O(log n) sempre' },
          { id: 'c', label: 'O(1), pois compara apenas a raiz' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(h), no pior caso O(n)',
      explanation:
        'A pesquisa visita um unico caminho da raiz ate uma folha; se a ABB estiver degenerada, a altura h pode ser n.',
    },
    commonMistakes: [
      {
        id: 'abb-pesquisar-troca-ramos',
        title: 'Trocar esquerda e direita',
        description: 'Descer para dir quando x e menor que o elemento atual inverte a propriedade da ABB.',
      },
    ],
  },
  {
    id: 'abb-contar-folhas-01',
    title: 'Contar folhas em ABB',
    pattern: 'percorrer-todos-os-nos',
    structure: 'abb',
    difficulty: 'facil',
    statement:
      'Dada uma ABB implementada com No, escreva um metodo que retorne a quantidade de folhas. O professor espera uma solucao recursiva, cobrindo caso base, soma das subarvores e complexidade.',
    providedCode: `class No {
  int elemento;
  No esq, dir;
}

class Arvore {
  private No raiz;

  int contarFolhas() {
    return contarFolhas(raiz);
  }

  private int contarFolhas(No i) {
    // complete o metodo
  }
}`,
    visualStateId: 'abb-basica-01',
    transferGroupId: 'contagem-transferencia-01',
    steps: [
      {
        id: 'abb-contar-folhas-01-s1',
        kind: 'interpretar',
        prompt: 'Qual no deve contribuir com 1 para a resposta?',
        options: [
          { id: 'a', label: 'No com esq == null e dir == null' },
          { id: 'b', label: 'No com pelo menos um filho' },
          { id: 'c', label: 'Somente a raiz' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'abb-contar-folhas-01-s2',
        kind: 'simular',
        prompt: 'Na arvore exibida, quantas folhas existem?',
        options: [
          { id: 'a', label: '4' },
          { id: 'b', label: '3' },
          { id: 'c', label: '7' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'abb-contar-folhas-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a logica recursiva para contar folhas.',
        blocks: [
          { id: 'nulo', label: 'se i == null, retorne 0', order: 1 },
          { id: 'folha', label: 'se i.esq == null && i.dir == null, retorne 1', order: 2 },
          { id: 'soma', label: 'retorne contarFolhas(i.esq) + contarFolhas(i.dir)', order: 3 },
        ],
        correctOrder: ['nulo', 'folha', 'soma'],
      },
      {
        id: 'abb-contar-folhas-01-s4',
        kind: 'complexidade',
        prompt: 'Por que a complexidade e linear?',
        options: [
          { id: 'a', label: 'Porque todos os nos precisam ser examinados uma vez.' },
          { id: 'b', label: 'Porque apenas um caminho e visitado.' },
          { id: 'c', label: 'Porque a arvore sempre esta balanceada.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'A contagem de folhas nao pode descartar subarvores; cada no e visitado uma vez.',
    },
    commonMistakes: [
      {
        id: 'abb-folhas-contar-nulos',
        title: 'Contar ponteiros nulos como folhas',
        description: 'Folha e um no real sem filhos, nao uma referencia null.',
      },
    ],
  },
  {
    id: 'avl-fator-01',
    title: 'Calcular fator de balanceamento',
    pattern: 'retornar-de-baixo-para-cima',
    structure: 'avl',
    difficulty: 'medio',
    statement:
      'Em uma AVL, implemente o calculo do fator de balanceamento de um No usando a altura das subarvores. Explique por que a resposta depende de valores retornados de baixo para cima.',
    providedCode: `class No {
  int elemento, nivel;
  No esq, dir;
}

class Arvore {
  int getNivel(No i) {
    return (i == null) ? 0 : i.nivel;
  }

  int fator(No i) {
    // complete o metodo
  }
}`,
    visualStateId: 'avl-rotacao-01',
    steps: [
      {
        id: 'avl-fator-01-s1',
        kind: 'interpretar',
        prompt: 'O fator mais comum nas implementacoes da disciplina e calculado como:',
        options: [
          { id: 'a', label: 'nivel(dir) - nivel(esq)' },
          { id: 'b', label: 'elemento(dir) - elemento(esq)' },
          { id: 'c', label: 'quantidade total de nos' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'avl-fator-01-s2',
        kind: 'simular',
        prompt: 'No no 40, considerando filho direito 50 e ausencia de filho esquerdo, o fator tende a indicar:',
        options: [
          { id: 'a', label: 'Subarvore direita mais alta' },
          { id: 'b', label: 'Subarvore esquerda mais alta' },
          { id: 'c', label: 'No folha obrigatorio' },
        ],
        correctOptionId: 'a',
        activeNodeId: 'n40',
      },
      {
        id: 'avl-fator-01-s3',
        kind: 'lacuna',
        prompt: 'Complete: return getNivel(i.___) - getNivel(i.___);',
        gapId: 'ramos-fator',
        answers: [{ id: 'dir-esq', answer: 'dir, esq', aliases: ['dir esq', 'i.dir - i.esq'] }],
      },
      {
        id: 'avl-fator-01-s4',
        kind: 'complexidade',
        prompt: 'Se os niveis ja estao armazenados no no, qual o custo de fator(i)?',
        options: [
          { id: 'a', label: 'O(1)' },
          { id: 'b', label: 'O(n)' },
          { id: 'c', label: 'O(log n)' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(1)',
      explanation: 'Com a altura armazenada em cada no, o metodo apenas le dois filhos e faz uma subtracao.',
    },
    commonMistakes: [
      {
        id: 'avl-fator-recalcular-altura',
        title: 'Recalcular toda a altura',
        description: 'Percorrer a subarvore inteira para cada fator torna operacoes AVL desnecessariamente caras.',
      },
    ],
  },
  {
    id: 'avl-verificar-balanceamento-01',
    title: 'Verificar balanceamento AVL',
    pattern: 'verificar-propriedade-global',
    structure: 'avl',
    difficulty: 'medio',
    statement:
      'Dada uma arvore binaria com campos esq e dir, escreva um metodo que diga se ela respeita a regra AVL em todos os nos. A resposta deve verificar o no atual e suas subarvores.',
    providedCode: `class No {
  int elemento;
  No esq, dir;
}

class Arvore {
  boolean isAVL() {
    return isAVL(raiz);
  }

  private boolean isAVL(No i) {
    // complete o metodo
  }
}`,
    visualStateId: 'avl-rotacao-01',
    steps: [
      {
        id: 'avl-verificar-balanceamento-01-s1',
        kind: 'interpretar',
        prompt: 'Qual condicao local precisa valer em cada no?',
        options: [
          { id: 'a', label: '|altura(esq) - altura(dir)| <= 1' },
          { id: 'b', label: 'esq e dir nunca podem ser null' },
          { id: 'c', label: 'todo no deve ter fator zero' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'avl-verificar-balanceamento-01-s2',
        kind: 'blocos',
        prompt: 'Ordene a verificacao global.',
        blocks: [
          { id: 'base', label: 'arvore vazia e AVL', order: 1 },
          { id: 'local', label: 'verifique o fator do no atual', order: 2 },
          { id: 'rec', label: 'verifique recursivamente esq e dir', order: 3 },
        ],
        correctOrder: ['base', 'local', 'rec'],
      },
      {
        id: 'avl-verificar-balanceamento-01-s3',
        kind: 'simular',
        prompt: 'Se um no tem altura esquerda 3 e direita 1, ele passa na regra AVL?',
        options: [
          { id: 'a', label: 'Nao, diferenca 2 viola a regra.' },
          { id: 'b', label: 'Sim, pois ambas existem.' },
          { id: 'c', label: 'Sim, se o elemento da raiz for maior.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'avl-verificar-balanceamento-01-s4',
        kind: 'complexidade',
        prompt: 'Com altura calculada uma vez por subarvore, qual custo esperado da verificacao?',
        options: [
          { id: 'a', label: 'O(n)' },
          { id: 'b', label: 'O(1)' },
          { id: 'c', label: 'O(n log n) obrigatoriamente' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'Uma implementacao cuidadosa calcula informacao de altura e validade visitando cada no uma vez.',
    },
    commonMistakes: [
      {
        id: 'avl-verificar-so-raiz',
        title: 'Verificar apenas a raiz',
        description: 'A propriedade AVL precisa valer em todos os nos, nao somente no primeiro.',
      },
    ],
  },
  {
    id: 'alvinegra-contar-brancos-01',
    title: 'Contar nos brancos',
    pattern: 'percorrer-todos-os-nos',
    structure: 'alvinegra',
    difficulty: 'facil',
    statement:
      'Considere uma arvore alvinegra em que NoAN possui cor true para branco e false para preto. Implemente um metodo que conte quantos nos brancos existem e informe a complexidade.',
    providedCode: `class NoAN {
  int elemento;
  boolean cor;
  NoAN esq, dir;
}

class Arvore {
  private NoAN raiz;

  int contarBrancos() {
    return contarBrancos(raiz);
  }

  private int contarBrancos(NoAN i) {
    // complete o metodo
  }
}`,
    visualStateId: 'alvinegra-brancos-01',
    transferGroupId: 'contagem-transferencia-01',
    steps: [
      {
        id: 'alvinegra-contar-brancos-01-s1',
        kind: 'interpretar',
        prompt: 'O que deve ser somado quando o no atual e branco?',
        options: [
          { id: 'a', label: '1 mais as contagens das subarvores' },
          { id: 'b', label: 'Somente a altura do no' },
          { id: 'c', label: 'Zero, pois branco e sentinela' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'alvinegra-contar-brancos-01-s2',
        kind: 'simular',
        prompt: 'Na arvore exibida, quantos nos brancos aparecem?',
        options: [
          { id: 'a', label: '2' },
          { id: 'b', label: '5' },
          { id: 'c', label: '0' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'alvinegra-contar-brancos-01-s3',
        kind: 'lacuna',
        prompt: 'Complete a parcela local: int atual = (i.cor == true) ? ___ : ___;',
        gapId: 'branco-ou-preto',
        answers: [{ id: 'um-zero', answer: '1, 0', aliases: ['1 0'] }],
      },
      {
        id: 'alvinegra-contar-brancos-01-s4',
        kind: 'complexidade',
        prompt: 'Qual e a complexidade para contar todos os brancos?',
        options: [
          { id: 'a', label: 'O(n)' },
          { id: 'b', label: 'O(log n), pois a arvore e balanceada' },
          { id: 'c', label: 'O(1)' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'Mesmo balanceada, a contagem precisa examinar todos os nos para saber suas cores.',
    },
    commonMistakes: [
      {
        id: 'alvinegra-contar-so-um-lado',
        title: 'Percorrer apenas um caminho',
        description: 'Contagem global exige visitar esquerda e direita; regra de busca nao ajuda a descartar ramos.',
      },
    ],
  },
  {
    id: 'alvinegra-tipo-quatro-01',
    title: 'Reconhecer tipo quatro',
    pattern: 'verificar-propriedade-global',
    structure: 'alvinegra',
    difficulty: 'medio',
    statement:
      'Durante a insercao em arvore alvinegra, identifique quando ocorre o caso de tio branco com pai e tio brancos. Explique a correcao esperada e seu impacto assintotico.',
    providedCode: `class NoAN {
  int elemento;
  boolean cor;
  NoAN esq, dir;
}

class Arvore {
  private NoAN raiz;

  private void balancear(NoAN bisavo, NoAN avo, NoAN pai, NoAN i) {
    // analise o tipo quatro
  }
}`,
    visualStateId: 'alvinegra-brancos-01',
    steps: [
      {
        id: 'alvinegra-tipo-quatro-01-s1',
        kind: 'interpretar',
        prompt: 'Quando o caso de recoloracao simples aparece?',
        options: [
          { id: 'a', label: 'Pai e tio sao brancos.' },
          { id: 'b', label: 'Pai e tio sao pretos.' },
          { id: 'c', label: 'A raiz e null.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'alvinegra-tipo-quatro-01-s2',
        kind: 'simular',
        prompt: 'Na visualizacao, o no 20 branco tem irmao 60 preto. Isso e caso tipo quatro completo?',
        options: [
          { id: 'a', label: 'Nao, pois o tio precisaria ser branco.' },
          { id: 'b', label: 'Sim, qualquer pai branco basta.' },
          { id: 'c', label: 'Sim, porque 40 e raiz.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'alvinegra-tipo-quatro-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a resposta conceitual para o tipo quatro.',
        blocks: [
          { id: 'detectar', label: 'detectar pai e tio brancos', order: 1 },
          { id: 'recolorir', label: 'recolorir pai e tio para preto e avo para branco', order: 2 },
          { id: 'subir', label: 'continuar verificacao a partir do avo', order: 3 },
        ],
        correctOrder: ['detectar', 'recolorir', 'subir'],
      },
      {
        id: 'alvinegra-tipo-quatro-01-s4',
        kind: 'complexidade',
        prompt: 'Qual e o limite assintotico de uma insercao com correcoes alvinegras?',
        options: [
          { id: 'a', label: 'O(log n)' },
          { id: 'b', label: 'O(n), pois sempre visita todos os nos' },
          { id: 'c', label: 'O(1), pois so muda cores' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(log n)',
      explanation: 'As correcoes sobem por um caminho de altura logaritmica em uma arvore alvinegra.',
    },
    commonMistakes: [
      {
        id: 'alvinegra-recolorir-sem-subir',
        title: 'Parar apos recolorir',
        description: 'Recolorir pode criar conflito no avo; a verificacao precisa continuar subindo.',
      },
    ],
  },
  {
    id: 'hash-pesquisar-reserva-01',
    title: 'Pesquisar em hash com reserva',
    pattern: 'navegar-por-camadas',
    structure: 'hash',
    difficulty: 'facil',
    statement:
      'Considere uma tabela hash com area principal e area de reserva para colisoes. Implemente pesquisar(int x), verificando primeiro a posicao hash e depois a reserva ocupada.',
    providedCode: `class Hash {
  int[] tabela;
  int m1, m2, reserva;

  int h(int elemento) {
    return elemento % m1;
  }

  boolean pesquisar(int elemento) {
    // complete o metodo
  }
}`,
    visualStateId: 'hash-reserva-01',
    steps: [
      {
        id: 'hash-pesquisar-reserva-01-s1',
        kind: 'interpretar',
        prompt: 'Onde a pesquisa deve olhar primeiro?',
        options: [
          { id: 'a', label: 'Na posicao h(elemento) da area principal.' },
          { id: 'b', label: 'Sempre no ultimo espaco da reserva.' },
          { id: 'c', label: 'Em todas as posicoes antes de calcular h.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'hash-pesquisar-reserva-01-s2',
        kind: 'simular',
        prompt: 'Se 76 esta na reserva, a pesquisa deve:',
        options: [
          { id: 'a', label: 'Comparar a area principal e depois percorrer a reserva usada.' },
          { id: 'b', label: 'Retornar falso ao ver colisao na principal.' },
          { id: 'c', label: 'Recalcular outra funcao hash obrigatoriamente.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'hash-pesquisar-reserva-01-s3',
        kind: 'lacuna',
        prompt: 'Complete o limite do for na reserva: for (int i = 0; i < ___; i++).',
        gapId: 'limite-reserva',
        answers: [{ id: 'reserva', answer: 'reserva', aliases: ['quantidadeReserva'] }],
      },
      {
        id: 'hash-pesquisar-reserva-01-s4',
        kind: 'complexidade',
        prompt: 'Qual e o pior caso da pesquisa se a reserva tiver r elementos ocupados?',
        options: [
          { id: 'a', label: 'O(r), alem da consulta direta inicial' },
          { id: 'b', label: 'O(log n)' },
          { id: 'c', label: 'O(n^2)' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(r), ou O(n) no pior caso geral',
      explanation: 'A posicao principal e constante, mas a reserva ocupada pode precisar ser percorrida linearmente.',
    },
    commonMistakes: [
      {
        id: 'hash-ignorar-reserva',
        title: 'Ignorar a area de reserva',
        description: 'Elementos que colidiram podem estar fora da posicao principal.',
      },
    ],
  },
  {
    id: 'hash-rehash-colisao-01',
    title: 'Tratar colisao com rehash',
    pattern: 'seguir-um-caminho',
    structure: 'hash',
    difficulty: 'medio',
    statement:
      'Em uma hash aberta com uma funcao de rehash simples, implemente a insercao de elemento quando a primeira posicao esta ocupada. Informe quando a insercao falha.',
    providedCode: `class Hash {
  int[] tabela;
  int m;
  final int NULO = -1;

  int h(int elemento) {
    return elemento % m;
  }

  int reh(int elemento) {
    return ++elemento % m;
  }
}`,
    visualStateId: 'hash-reserva-01',
    steps: [
      {
        id: 'hash-rehash-colisao-01-s1',
        kind: 'interpretar',
        prompt: 'Quando a funcao reh deve ser usada?',
        options: [
          { id: 'a', label: 'Quando h(elemento) aponta para uma posicao ocupada.' },
          { id: 'b', label: 'Antes de toda insercao, mesmo sem colisao.' },
          { id: 'c', label: 'Somente depois de remover um elemento.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'hash-rehash-colisao-01-s2',
        kind: 'simular',
        prompt: 'Se h(32) cai em uma posicao ocupada, qual e a proxima tentativa nesse modelo?',
        options: [
          { id: 'a', label: 'reh(32)' },
          { id: 'b', label: 'raiz.esq' },
          { id: 'c', label: 'folha mais proxima' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'hash-rehash-colisao-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a insercao com uma tentativa de rehash.',
        blocks: [
          { id: 'h', label: 'calcular pos = h(elemento)', order: 1 },
          { id: 'direto', label: 'se tabela[pos] == NULO, inserir', order: 2 },
          { id: 'reh', label: 'senao calcular pos = reh(elemento) e testar', order: 3 },
          { id: 'falha', label: 'se tambem estiver ocupada, retornar false', order: 4 },
        ],
        correctOrder: ['h', 'direto', 'reh', 'falha'],
      },
      {
        id: 'hash-rehash-colisao-01-s4',
        kind: 'complexidade',
        prompt: 'Com apenas uma tentativa de rehash, qual e o custo da insercao?',
        options: [
          { id: 'a', label: 'O(1)' },
          { id: 'b', label: 'O(n)' },
          { id: 'c', label: 'O(log n)' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(1)',
      explanation: 'Esse modelo testa um numero constante de posicoes: hash original e um rehash.',
    },
    commonMistakes: [
      {
        id: 'hash-rehash-loop-infinito',
        title: 'Tentar rehash indefinidamente sem regra',
        description: 'A versao pedida possui quantidade fixa de tentativas; mudar isso altera o algoritmo.',
      },
    ],
  },
  {
    id: 'trie-pesquisar-palavra-01',
    title: 'Pesquisar palavra na trie',
    pattern: 'navegar-por-camadas',
    structure: 'trie',
    difficulty: 'medio',
    statement:
      'Dada uma ArvoreTrie em que cada Celula possui caractere, prox e indicador folha, implemente pesquisar(String s). O metodo deve diferenciar prefixo existente de palavra cadastrada.',
    providedCode: `class Celula {
  char elemento;
  boolean folha;
  Celula[] prox;
}

class ArvoreTrie {
  private Celula raiz;

  boolean pesquisar(String s) {
    // complete o metodo
  }
}`,
    visualStateId: 'trie-stop-sapo-01',
    steps: [
      {
        id: 'trie-pesquisar-palavra-01-s1',
        kind: 'interpretar',
        prompt: 'Depois de consumir todos os caracteres, o que confirma a palavra?',
        options: [
          { id: 'a', label: 'O ultimo no deve estar marcado como folha.' },
          { id: 'b', label: 'A raiz deve estar marcada como folha.' },
          { id: 'c', label: 'Basta o prefixo existir.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'trie-pesquisar-palavra-01-s2',
        kind: 'simular',
        prompt: 'A palavra STOP percorre quais nos principais?',
        options: [
          { id: 'a', label: 'S -> T -> O -> P' },
          { id: 'b', label: 'S -> A -> P -> O' },
          { id: 'c', label: 'T -> O -> P' },
        ],
        correctOptionId: 'a',
        activePath: ['s', 'st', 'sto', 'stop'],
      },
      {
        id: 'trie-pesquisar-palavra-01-s3',
        kind: 'lacuna',
        prompt: 'Complete a condicao final: return atual.___;',
        gapId: 'marcador-folha',
        answers: [{ id: 'folha', answer: 'folha', aliases: ['isFolha'] }],
      },
      {
        id: 'trie-pesquisar-palavra-01-s4',
        kind: 'complexidade',
        prompt: 'Qual e a complexidade em funcao do tamanho p da palavra?',
        options: [
          { id: 'a', label: 'O(p)' },
          { id: 'b', label: 'O(n), sempre todos os nos da trie' },
          { id: 'c', label: 'O(log p)' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(p)',
      explanation: 'A busca consome no maximo um caractere por nivel da palavra pesquisada.',
    },
    commonMistakes: [
      {
        id: 'trie-prefixo-como-palavra',
        title: 'Aceitar prefixo como palavra',
        description: 'Encontrar o caminho nao basta; o ultimo no precisa ter folha marcada.',
      },
    ],
  },
  {
    id: 'trie-verificar-prefixo-01',
    title: 'Verificar prefixo na trie',
    pattern: 'navegar-por-camadas',
    structure: 'trie',
    difficulty: 'facil',
    statement:
      'Na mesma ArvoreTrie, escreva um metodo que informe se uma string e prefixo de alguma palavra armazenada. Diferencie essa tarefa da pesquisa de palavra completa e apresente a complexidade.',
    providedCode: `class Celula {
  char elemento;
  boolean folha;
  Celula[] prox;
}

class ArvoreTrie {
  private Celula raiz;

  boolean isPrefixo(String s) {
    // complete o metodo
  }
}`,
    visualStateId: 'trie-stop-sapo-01',
    transferGroupId: 'contagem-transferencia-01',
    steps: [
      {
        id: 'trie-verificar-prefixo-01-s1',
        kind: 'interpretar',
        prompt: 'Para prefixo, o que deve acontecer ao terminar os caracteres de s?',
        options: [
          { id: 'a', label: 'Retornar verdadeiro se o caminho existe, mesmo sem folha.' },
          { id: 'b', label: 'Exigir que folha seja true.' },
          { id: 'c', label: 'Contar todos os filhos da raiz.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'trie-verificar-prefixo-01-s2',
        kind: 'simular',
        prompt: 'SA e prefixo de SAPO na visualizacao?',
        options: [
          { id: 'a', label: 'Sim, o caminho S -> A existe.' },
          { id: 'b', label: 'Nao, porque A nao e folha.' },
          { id: 'c', label: 'Nao, porque SAPO termina com O.' },
        ],
        correctOptionId: 'a',
        activePath: ['s', 'sa'],
      },
      {
        id: 'trie-verificar-prefixo-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a verificacao de prefixo.',
        blocks: [
          { id: 'raiz', label: 'comece em raiz', order: 1 },
          { id: 'andar', label: 'para cada caractere, avance para o filho correspondente', order: 2 },
          { id: 'falha', label: 'se um filho nao existe, retorne false', order: 3 },
          { id: 'sucesso', label: 'ao consumir o prefixo, retorne true', order: 4 },
        ],
        correctOrder: ['raiz', 'andar', 'falha', 'sucesso'],
      },
      {
        id: 'trie-verificar-prefixo-01-s4',
        kind: 'complexidade',
        prompt: 'Qual custo depende apenas do tamanho p do prefixo?',
        options: [
          { id: 'a', label: 'O(p)' },
          { id: 'b', label: 'O(n^2)' },
          { id: 'c', label: 'O(1), para qualquer prefixo' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(p)',
      explanation: 'O metodo percorre no maximo os p caracteres do prefixo informado.',
    },
    commonMistakes: [
      {
        id: 'trie-prefixo-exigir-folha',
        title: 'Exigir marcador folha',
        description: 'Prefixo nao precisa ser palavra completa; exigir folha transforma a questao em pesquisa.',
      },
    ],
  },
  {
    id: 'binaria-ismax-01',
    title: 'Verificar limite entre altura e nos',
    pattern: 'verificar-propriedade-global',
    structure: 'binaria',
    difficulty: 'medio',
    statement:
      'Considere uma Arvore Binaria com classe No contendo elemento, esq e dir. Implemente o metodo boolean isMax(double valor), que retorna verdadeiro quando a altura da arvore e no maximo valor vezes Log2(quantidadeNo). A solucao deve calcular altura, quantidade de nos e explicar a complexidade.',
    providedCode: `class No {
  int elemento;
  No esq, dir;
}

class Arvore {
  private No raiz;

  boolean isMax(double valor) {
    // complete o metodo
  }
}`,
    visualStateId: 'binaria-ismax-01',
    steps: [
      {
        id: 'binaria-ismax-01-s1',
        kind: 'interpretar',
        prompt: 'Quais duas informacoes precisam ser calculadas antes da comparacao final?',
        options: [
          { id: 'a', label: 'Altura da arvore e quantidade de nos.' },
          { id: 'b', label: 'Menor e maior elemento da ABB.' },
          { id: 'c', label: 'Quantidade de folhas brancas e pretas.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'binaria-ismax-01-s2',
        kind: 'simular',
        prompt: 'Se a arvore tem altura 3 e 7 nos, a comparacao deve usar qual forma?',
        options: [
          { id: 'a', label: '3 <= valor * log2(7)' },
          { id: 'b', label: '7 <= valor * log2(3)' },
          { id: 'c', label: '3 == 7' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'binaria-ismax-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a solucao esperada.',
        blocks: [
          { id: 'altura', label: 'calcular altura a partir da raiz', order: 1 },
          { id: 'nos', label: 'calcular quantidade de nos', order: 2 },
          { id: 'comparar', label: 'comparar altura com valor * log2(qtdNos)', order: 3 },
        ],
        correctOrder: ['altura', 'nos', 'comparar'],
      },
      {
        id: 'binaria-ismax-01-s4',
        kind: 'complexidade',
        prompt: 'Qual e o custo assintotico se altura e quantidade sao calculadas por percursos separados?',
        options: [
          { id: 'a', label: 'O(n), pois cada percurso visita os nos uma vez.' },
          { id: 'b', label: 'O(log n), pois aparece log na formula.' },
          { id: 'c', label: 'O(1), pois so faz uma comparacao.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation:
        'Mesmo com dois percursos, altura e quantidade visitam cada no no maximo uma vez; constantes sao ignoradas.',
    },
    commonMistakes: [
      {
        id: 'binaria-ismax-confundir-log-com-custo',
        title: 'Confundir formula com complexidade',
        description: 'Usar log2(qtdNos) na comparacao nao torna o algoritmo O(log n).',
      },
    ],
  },
  {
    id: 'binaria-maior-caminho-01',
    title: 'Comparar caminhos em arvore binaria',
    pattern: 'retornar-de-baixo-para-cima',
    structure: 'binaria',
    difficulty: 'facil',
    statement:
      'Dada uma arvore binaria comum, implemente um metodo que retorne a maior quantidade de nos em um caminho da raiz ate uma folha. A arvore nao e necessariamente ABB, entao os dois lados precisam ser analisados.',
    providedCode: `class No {
  int elemento;
  No esq, dir;
}

class Arvore {
  private No raiz;

  int maiorCaminho() {
    return maiorCaminho(raiz);
  }

  private int maiorCaminho(No i) {
    // complete o metodo
  }
}`,
    visualStateId: 'binaria-ismax-01',
    steps: [
      {
        id: 'binaria-maior-caminho-01-s1',
        kind: 'interpretar',
        prompt: 'Por que nao basta seguir apenas um lado da arvore?',
        options: [
          { id: 'a', label: 'Porque a arvore binaria comum nao permite descartar subarvores.' },
          { id: 'b', label: 'Porque todo no possui exatamente dois filhos.' },
          { id: 'c', label: 'Porque a raiz sempre e folha.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'binaria-maior-caminho-01-s2',
        kind: 'lacuna',
        prompt: 'Complete a combinacao: return 1 + Math.___(maiorCaminho(i.esq), maiorCaminho(i.dir));',
        gapId: 'maximo-caminho',
        answers: [{ id: 'max', answer: 'max', aliases: ['Math.max'] }],
      },
      {
        id: 'binaria-maior-caminho-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a recursao.',
        blocks: [
          { id: 'base', label: 'se i == null, retorne 0', order: 1 },
          { id: 'esqdir', label: 'calcule os caminhos esquerdo e direito', order: 2 },
          { id: 'max', label: 'retorne 1 + maior dos dois caminhos', order: 3 },
        ],
        correctOrder: ['base', 'esqdir', 'max'],
      },
      {
        id: 'binaria-maior-caminho-01-s4',
        kind: 'complexidade',
        prompt: 'Qual e a complexidade no pior caso?',
        options: [
          { id: 'a', label: 'O(n), pois todos os nos podem ser visitados.' },
          { id: 'b', label: 'O(1), pois retorna um inteiro.' },
          { id: 'c', label: 'O(log n) sempre.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'A maior altura de uma arvore binaria comum exige comparar os retornos das duas subarvores.',
    },
    commonMistakes: [
      {
        id: 'binaria-maior-caminho-somar-ramos',
        title: 'Somar os dois ramos',
        description: 'O maior caminho escolhe o maior dos lados; somar os dois calcula outra grandeza.',
      },
    ],
  },
  {
    id: 'doidona-pesquisar-palavra-01',
    title: 'Pesquisar palavra na estrutura doidona',
    pattern: 'navegar-por-camadas',
    structure: 'doidona',
    difficulty: 'dificil',
    statement:
      'Considere uma estrutura doidona que armazena palavras em camadas T1, T2 e listas encadeadas. Implemente pesquisar(String palavra) verificando a primeira tabela, a segunda camada de colisao e a lista ligada quando necessario.',
    providedCode: `class T1 {
  String palavras[];
  CelulaMat inicio;
  T2 t2;
}

class T2 {
  String palavras[];
  Celula2 celulas[];
}

class Celula {
  String palavra;
  Celula prox;
}

class Doidona {
  private T1[] t1;

  boolean pesquisar(String palavra) {
    // complete o metodo
  }
}`,
    visualStateId: 'doidona-camadas-01',
    steps: [
      {
        id: 'doidona-pesquisar-palavra-01-s1',
        kind: 'interpretar',
        prompt: 'Qual e a ideia central da pesquisa nessa estrutura?',
        options: [
          { id: 'a', label: 'Navegar pelas camadas na ordem definida pela insercao.' },
          { id: 'b', label: 'Percorrer somente a lista final para qualquer palavra.' },
          { id: 'c', label: 'Ordenar todas as palavras antes de pesquisar.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'doidona-pesquisar-palavra-01-s2',
        kind: 'simular',
        prompt: 'Se a palavra colide em T1 e foi enviada para T2, qual camada deve ser consultada depois?',
        options: [
          { id: 'a', label: 'T2, usando a funcao de hash correspondente.' },
          { id: 'b', label: 'A subarvore esquerda da ABB.' },
          { id: 'c', label: 'Nenhuma; a pesquisa retorna false na primeira colisao.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'doidona-pesquisar-palavra-01-s3',
        kind: 'blocos',
        prompt: 'Ordene uma pesquisa em camadas.',
        blocks: [
          { id: 't1', label: 'calcular e consultar a posicao em T1', order: 1 },
          { id: 't2', label: 'se necessario, consultar T2', order: 2 },
          { id: 'lista', label: 'se necessario, percorrer a lista encadeada', order: 3 },
          { id: 'fim', label: 'retornar true se encontrar; senao false', order: 4 },
        ],
        correctOrder: ['t1', 't2', 'lista', 'fim'],
      },
      {
        id: 'doidona-pesquisar-palavra-01-s4',
        kind: 'complexidade',
        prompt: 'Qual limite descreve melhor o pior caso com lista encadeada grande?',
        options: [
          { id: 'a', label: 'O(l), onde l e o tamanho da lista percorrida, alem dos hashes constantes.' },
          { id: 'b', label: 'O(1) sempre, pois existe hash.' },
          { id: 'c', label: 'O(log n), pois toda estrutura doidona e balanceada.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(l), ou O(n) no pior caso geral',
      explanation:
        'As consultas nas tabelas sao constantes, mas a lista encadeada pode crescer e exigir varredura linear.',
    },
    commonMistakes: [
      {
        id: 'doidona-pesquisa-parar-na-colisao',
        title: 'Parar na primeira colisao',
        description: 'A colisao indica que a palavra pode estar em outra camada, nao que ela esta ausente.',
      },
    ],
  },
  {
    id: 'doidona-inserir-camadas-01',
    title: 'Inserir navegando por arvore e tabelas',
    pattern: 'navegar-por-camadas',
    structure: 'doidona',
    difficulty: 'dificil',
    statement:
      'Considere a estrutura doidona em que o primeiro nivel pode escolher uma arvore por caractere, depois T1, T2 e lista encadeada. Implemente a insercao respeitando a ordem das camadas e tratando colisoes.',
    providedCode: `class No {
  char caracter;
  No esq, dir;
  T1 tabela;
}

class T1 {
  String palavras[];
  T2 t2;
}

class T2 {
  Celula2 celulas[];
}

class Celula2 {
  String palavra;
  Celula2 prox;
}

class Doidona {
  private No raiz;

  void inserir(String palavra) {
    // complete o metodo
  }
}`,
    visualStateId: 'doidona-camadas-01',
    steps: [
      {
        id: 'doidona-inserir-camadas-01-s1',
        kind: 'interpretar',
        prompt: 'O que a primeira arvore da estrutura ajuda a escolher?',
        options: [
          { id: 'a', label: 'A regiao associada ao caractere ou assinatura da palavra.' },
          { id: 'b', label: 'A complexidade exata da JVM.' },
          { id: 'c', label: 'A cor do no alvinegro.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'doidona-inserir-camadas-01-s2',
        kind: 'simular',
        prompt: 'Se T1 esta ocupada e a regra manda usar T2, qual acao vem antes da lista?',
        options: [
          { id: 'a', label: 'Calcular a posicao em T2 e testar a celula.' },
          { id: 'b', label: 'Retornar sem inserir.' },
          { id: 'c', label: 'Contar todos os nos da arvore binaria.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'doidona-inserir-camadas-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a insercao hibrida.',
        blocks: [
          { id: 'arvore', label: 'descer na arvore pelo caractere', order: 1 },
          { id: 't1', label: 'testar a posicao de T1', order: 2 },
          { id: 't2', label: 'em colisao, testar T2', order: 3 },
          { id: 'lista', label: 'se ainda houver colisao, encadear na lista', order: 4 },
        ],
        correctOrder: ['arvore', 't1', 't2', 'lista'],
      },
      {
        id: 'doidona-inserir-camadas-01-s4',
        kind: 'complexidade',
        prompt: 'Qual custo aparece se a descida na arvore tem altura h e a lista final tem l itens?',
        options: [
          { id: 'a', label: 'O(h + l), com consultas hash constantes entre as camadas.' },
          { id: 'b', label: 'O(1) obrigatorio para qualquer entrada.' },
          { id: 'c', label: 'O(n^2) sempre.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(h + l)',
      explanation:
        'A insercao pode descer por uma arvore de altura h e, em colisao extrema, percorrer ou encadear em uma lista de tamanho l.',
    },
    commonMistakes: [
      {
        id: 'doidona-inserir-pular-camada',
        title: 'Pular uma camada da regra',
        description: 'Mudar a ordem arvore, T1, T2 e lista altera a estrutura pedida no enunciado.',
      },
    ],
  },
] satisfies Challenge[];
