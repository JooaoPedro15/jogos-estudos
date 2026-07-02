import type { Challenge } from '../types/challenge';

const prova3Source = (question: string) => ({
  label: 'lista-aeds2-prova3.pdf',
  question,
});

const courseSource = (question: string) => ({
  label: 'Semestre AEDS.zip',
  question,
});

export const challengeBank = [
  {
    id: 'abb-pesquisar-01',
    title: 'Pesquisar elemento em ABB',
    pattern: 'seguir-um-caminho',
    structure: 'abb',
    phase: 3,
    focus: 'codigo',
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
    phase: 7,
    focus: 'codigo',
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
    id: 'abb-reconhecer-01',
    title: 'Reconhecer a estrutura de uma ABB',
    pattern: 'verificar-propriedade-global',
    structure: 'abb',
    phase: 1,
    focus: 'codigo',
    difficulty: 'facil',
    statement:
      'A classe No guarda um elemento e duas referencias, esq e dir. A classe Arvore guarda apenas a raiz. Antes de codificar qualquer operacao, e preciso reconhecer os campos e a propriedade que define uma ABB.',
    providedCode: `class No {
  int elemento;
  No esq, dir;
}

class Arvore {
  private No raiz;
  // pesquisar, inserir, remover usam sempre esq/dir
}`,
    visualStateId: 'abb-basica-01',
    steps: [
      {
        id: 'abb-reconhecer-01-s1',
        kind: 'interpretar',
        prompt: 'Quais campos um No de ABB precisa ter?',
        options: [
          { id: 'a', label: 'elemento, esq e dir' },
          { id: 'b', label: 'elemento e prox' },
          { id: 'c', label: 'elemento, anterior e proximo' },
        ],
        correctOptionId: 'a',
        explanation: 'A ABB e binaria: cada no aponta para no maximo dois filhos, esq e dir.',
      },
      {
        id: 'abb-reconhecer-01-s2',
        kind: 'interpretar',
        prompt: 'Qual invariante vale para TODO no i de uma ABB?',
        options: [
          { id: 'a', label: 'Toda a subarvore esquerda < i.elemento < toda a subarvore direita' },
          { id: 'b', label: 'Apenas i.esq.elemento < i.elemento < i.dir.elemento (so os filhos diretos)' },
          { id: 'c', label: 'Todas as folhas ficam no mesmo nivel' },
        ],
        correctOptionId: 'a',
        explanation: 'A propriedade e global: vale para a subarvore inteira, nao so para os filhos imediatos.',
      },
      {
        id: 'abb-reconhecer-01-s3',
        kind: 'simular',
        prompt: 'Na arvore exibida, em que posicao o valor 35 deveria entrar?',
        options: [
          { id: 'a', label: 'Filho direito de 30' },
          { id: 'b', label: 'Filho esquerdo de 30' },
          { id: 'c', label: 'Filho direito de 40' },
        ],
        correctOptionId: 'a',
        activePath: ['n40', 'n20', 'n30'],
        explanation: '35 < 40 (vai para esq), 35 > 20 (dir), 35 > 30 (dir): entra como filho direito de 30.',
      },
      {
        id: 'abb-reconhecer-01-s4',
        kind: 'lacuna',
        prompt: 'Complete a condicao de descida para a subarvore direita: if (x ___ i.elemento).',
        gapId: 'comparacao-dir',
        answers: [{ id: 'gt', answer: '>', aliases: ['maior que', 'maior'] }],
        explanation: 'Valores maiores que o no atual ficam sempre na subarvore direita.',
      },
    ],
    complexity: {
      answer: 'O(1) por no para ver os campos; O(n) para validar a arvore toda',
      explanation: 'Olhar um no e constante; garantir a propriedade global exige visitar todos os nos.',
    },
    commonMistakes: [
      {
        id: 'abb-reconhecer-local-vs-global',
        title: 'Confundir propriedade local com global',
        description: 'Checar apenas os filhos diretos aceita arvores invalidas; a regra vale para toda a subarvore.',
      },
    ],
  },
  {
    id: 'abb-construir-01',
    title: 'Construir uma ABB inserindo em sequencia',
    pattern: 'seguir-um-caminho',
    structure: 'abb',
    phase: 2,
    focus: 'codigo',
    difficulty: 'facil',
    statement:
      'Insira a sequencia 40, 20, 60, 10, 30, 50, 70 em uma ABB inicialmente vazia. Acompanhe onde cada valor para e por que.',
    providedCode: `void inserir(int x) {
  raiz = inserir(x, raiz);
}

No inserir(int x, No i) {
  if (i == null) return new No(x);
  if (x < i.elemento) i.esq = inserir(x, i.esq);
  else                i.dir = inserir(x, i.dir);
  return i;
}`,
    visualStateId: 'abb-basica-01',
    steps: [
      {
        id: 'abb-construir-01-s1',
        kind: 'interpretar',
        prompt: 'Inserindo na ordem 40, 20, 60, 10, 30, 50, 70 numa ABB vazia, quem vira raiz?',
        options: [
          { id: 'a', label: '40, o primeiro a ser inserido' },
          { id: 'b', label: '10, o menor valor' },
          { id: 'c', label: '70, o maior valor' },
        ],
        correctOptionId: 'a',
        explanation: 'Em uma ABB sem balanceamento, a raiz e simplesmente o primeiro elemento inserido.',
      },
      {
        id: 'abb-construir-01-s2',
        kind: 'simular',
        prompt: 'Ao inserir 30, qual caminho e percorrido ate a posicao livre?',
        options: [
          { id: 'a', label: '40 -> 20 -> direita (30)' },
          { id: 'b', label: '40 -> 60' },
          { id: 'c', label: '40 -> 20 -> 10' },
        ],
        correctOptionId: 'a',
        activePath: ['n40', 'n20', 'n30'],
        explanation: '30 < 40 desce a esquerda; 30 > 20 desce a direita e ocupa a vaga.',
      },
      {
        id: 'abb-construir-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a logica recursiva de inserir(x, i).',
        blocks: [
          { id: 'base', label: 'se i == null, retorne new No(x)', order: 1 },
          { id: 'esq', label: 'se x < i.elemento, i.esq = inserir(x, i.esq)', order: 2 },
          { id: 'dir', label: 'senao i.dir = inserir(x, i.dir)', order: 3 },
          { id: 'ret', label: 'retorne i', order: 4 },
        ],
        correctOrder: ['base', 'esq', 'dir', 'ret'],
      },
      {
        id: 'abb-construir-01-s4',
        kind: 'complexidade',
        prompt: 'Qual o custo de construir a ABB com n insercoes no caso medio?',
        options: [
          { id: 'a', label: 'O(n log n)' },
          { id: 'b', label: 'O(n)' },
          { id: 'c', label: 'O(n^2) sempre' },
        ],
        correctOptionId: 'a',
        explanation: 'Cada insercao custa O(log n) no caso medio; com n insercoes, O(n log n).',
      },
    ],
    complexity: {
      answer: 'O(n log n) no caso medio; O(n^2) no pior (entrada ja ordenada)',
      explanation: 'Uma sequencia crescente gera uma arvore degenerada (lista), com insercoes O(n).',
    },
    commonMistakes: [
      {
        id: 'abb-construir-degenerada',
        title: 'Ignorar a entrada ordenada',
        description: 'Inserir valores ja ordenados sem balanceamento produz uma arvore-lista de altura n.',
      },
    ],
  },
  {
    id: 'abb-inserir-01',
    title: 'Inserir mantendo a propriedade da ABB',
    pattern: 'seguir-um-caminho',
    structure: 'abb',
    phase: 4,
    focus: 'codigo',
    difficulty: 'medio',
    statement:
      'Implemente inserir(int x) de forma recursiva, religando os ponteiros no retorno. Use a insercao do valor 42 como exemplo guiado.',
    providedCode: `No inserir(int x, No i) {
  if (i == null) return new No(x);
  if (x < i.elemento)      i.esq = inserir(x, i.esq);
  else if (x > i.elemento) i.dir = inserir(x, i.dir);
  return i; // religa o pai ao filho criado
}`,
    visualStateId: 'abb-inserir-42-01',
    steps: [
      {
        id: 'abb-inserir-01-s1',
        kind: 'simular',
        prompt: 'Inserindo 42 na arvore basica (40,20,60,10,30,50,70), em qual no ele para?',
        options: [
          { id: 'a', label: 'Como filho esquerdo de 50' },
          { id: 'b', label: 'Como filho direito de 50' },
          { id: 'c', label: 'Como filho esquerdo de 60' },
        ],
        correctOptionId: 'a',
        activePath: ['n40', 'n60', 'n50', 'n42'],
        activeNodeId: 'n42',
        explanation: '42 > 40 desce a direita (60); 42 < 60 desce a esquerda (50); 42 < 50 desce a esquerda, que esta livre: entra como filho esquerdo de 50.',
      },
      {
        id: 'abb-inserir-01-s2',
        kind: 'lacuna',
        prompt: 'Para descer a esquerda quando x e menor, complete: if (x < i.elemento) i.esq = inserir(x, ___);',
        gapId: 'religa-esq',
        answers: [{ id: 'iesq', answer: 'i.esq', aliases: ['i .esq', 'iesq'] }],
        explanation: 'O retorno da chamada precisa ser reatribuido a i.esq para religar o no criado.',
      },
      {
        id: 'abb-inserir-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a insercao recursiva que evita duplicatas.',
        blocks: [
          { id: 'base', label: 'se i == null, retorne new No(x)', order: 1 },
          { id: 'esq', label: 'se x < i.elemento, i.esq = inserir(x, i.esq)', order: 2 },
          { id: 'dir', label: 'senao se x > i.elemento, i.dir = inserir(x, i.dir)', order: 3 },
          { id: 'ret', label: 'retorne i', order: 4 },
        ],
        correctOrder: ['base', 'esq', 'dir', 'ret'],
      },
      {
        id: 'abb-inserir-01-s4',
        kind: 'complexidade',
        prompt: 'Qual a complexidade de uma insercao isolada?',
        options: [
          { id: 'a', label: 'O(h), que vai de O(log n) a O(n)' },
          { id: 'b', label: 'O(1) sempre' },
          { id: 'c', label: 'O(n log n)' },
        ],
        correctOptionId: 'a',
        explanation: 'A insercao percorre um unico caminho da raiz ate a folha: custo proporcional a altura h.',
      },
    ],
    complexity: {
      answer: 'O(h): O(log n) balanceada, O(n) degenerada',
      explanation: 'Inserir desce um caminho unico ate uma posicao livre; o custo segue a altura da arvore.',
    },
    commonMistakes: [
      {
        id: 'abb-inserir-sem-religar',
        title: 'Nao reatribuir i.esq / i.dir',
        description: 'Chamar inserir(x, i.esq) sem guardar o retorno perde o no recem-criado.',
      },
    ],
  },
  {
    id: 'abb-remover-01',
    title: 'Remover nos tres casos da ABB',
    pattern: 'seguir-um-caminho',
    structure: 'abb',
    phase: 5,
    focus: 'codigo',
    difficulty: 'dificil',
    statement:
      'A remocao em ABB tem tres casos: folha, no com um filho e no com dois filhos. No caso de dois filhos, use o maior elemento da subarvore esquerda (antecessor) para substituir.',
    providedCode: `No remover(int x, No i) {
  if (i == null) return null;
  if (x < i.elemento)      i.esq = remover(x, i.esq);
  else if (x > i.elemento) i.dir = remover(x, i.dir);
  else {
    if (i.dir == null)      return i.esq; // 0 ou 1 filho
    else if (i.esq == null) return i.dir;
    else i = maiorEsquerda(i, i.esq);     // 2 filhos
  }
  return i;
}`,
    visualStateId: 'abb-basica-01',
    steps: [
      {
        id: 'abb-remover-01-s1',
        kind: 'interpretar',
        prompt: 'Remover uma folha (ex.: 10) consiste em:',
        options: [
          { id: 'a', label: 'Fazer o pai apontar para null no lugar dela' },
          { id: 'b', label: 'Copiar a raiz para a folha' },
          { id: 'c', label: 'Rotacionar a subarvore' },
        ],
        correctOptionId: 'a',
        activeNodeId: 'n10',
        explanation: 'Folha sem filhos: a chamada retorna null e o pai religa esse lado para null.',
      },
      {
        id: 'abb-remover-01-s2',
        kind: 'simular',
        prompt: 'Para remover 60 (dois filhos) pela tecnica do maior da subarvore esquerda, qual valor substitui 60?',
        options: [
          { id: 'a', label: '50' },
          { id: 'b', label: '70' },
          { id: 'c', label: '40' },
        ],
        correctOptionId: 'a',
        activePath: ['n60', 'n50'],
        explanation: 'A subarvore esquerda de 60 e {50}; o maior dela e 50, que sobe para o lugar de 60.',
      },
      {
        id: 'abb-remover-01-s3',
        kind: 'blocos',
        prompt: 'Ordene o tratamento do caso com dois filhos.',
        blocks: [
          { id: 'achar', label: 'encontre o maior elemento da subarvore esquerda (maiorEsq)', order: 1 },
          { id: 'copiar', label: 'copie esse valor para o no que esta sendo removido', order: 2 },
          { id: 'remover', label: 'remova recursivamente o maiorEsq da subarvore esquerda', order: 3 },
          { id: 'retornar', label: 'retorne o no ajustado', order: 4 },
        ],
        correctOrder: ['achar', 'copiar', 'remover', 'retornar'],
      },
      {
        id: 'abb-remover-01-s4',
        kind: 'complexidade',
        prompt: 'Qual a complexidade da remocao no pior caso?',
        options: [
          { id: 'a', label: 'O(h), ate O(n) se degenerada' },
          { id: 'b', label: 'O(1)' },
          { id: 'c', label: 'O(n log n)' },
        ],
        correctOptionId: 'a',
        explanation: 'Encontrar o no e o antecessor segue caminhos limitados pela altura h.',
      },
    ],
    complexity: {
      answer: 'O(h), ate O(n) no pior caso',
      explanation: 'Buscar o no a remover e o antecessor percorre caminhos proporcionais a altura.',
    },
    commonMistakes: [
      {
        id: 'abb-remover-dois-filhos',
        title: 'Esquecer o caso de dois filhos',
        description: 'Remover sem substituir pelo antecessor/sucessor quebra a propriedade da ABB.',
      },
    ],
  },
  {
    id: 'abb-percorrer-emordem-01',
    title: 'Percorrer em ordem e variar o caminhamento',
    pattern: 'percorrer-todos-os-nos',
    structure: 'abb',
    phase: 6,
    focus: 'codigo',
    difficulty: 'facil',
    statement:
      'Os caminhamentos central, pre-ordem e pos-ordem so mudam a posicao da visita ao no em relacao as chamadas recursivas. Em uma ABB, o caminhamento central produz a sequencia ordenada.',
    providedCode: `void central(No i) {
  if (i == null) return;
  central(i.esq);
  visitar(i.elemento);
  central(i.dir);
}`,
    visualStateId: 'abb-basica-01',
    steps: [
      {
        id: 'abb-percorrer-emordem-01-s1',
        kind: 'simular',
        prompt: 'O caminhamento central da arvore basica produz qual sequencia?',
        options: [
          { id: 'a', label: '10 20 30 40 50 60 70' },
          { id: 'b', label: '40 20 10 30 60 50 70' },
          { id: 'c', label: '10 30 20 50 70 60 40' },
        ],
        correctOptionId: 'a',
        explanation: 'esq, raiz, dir respeitando a propriedade da ABB sempre devolve os elementos em ordem crescente.',
      },
      {
        id: 'abb-percorrer-emordem-01-s2',
        kind: 'interpretar',
        prompt: 'Por que o central de uma ABB sai ordenado?',
        options: [
          { id: 'a', label: 'Porque visita esq (menores), depois a raiz, depois dir (maiores)' },
          { id: 'b', label: 'Por coincidencia dos valores escolhidos' },
          { id: 'c', label: 'Porque a arvore esta sempre balanceada' },
        ],
        correctOptionId: 'a',
        explanation: 'A propriedade global garante que a subarvore esquerda toda vem antes do no, e este antes da direita.',
      },
      {
        id: 'abb-percorrer-emordem-01-s3',
        kind: 'blocos',
        prompt: 'Ordene o caminhamento central(i).',
        blocks: [
          { id: 'base', label: 'se i == null, retorne', order: 1 },
          { id: 'esq', label: 'central(i.esq)', order: 2 },
          { id: 'visita', label: 'visitar(i.elemento)', order: 3 },
          { id: 'dir', label: 'central(i.dir)', order: 4 },
        ],
        correctOrder: ['base', 'esq', 'visita', 'dir'],
      },
      {
        id: 'abb-percorrer-emordem-01-s4',
        kind: 'simular',
        prompt: 'A pre-ordem (raiz, esq, dir) da arvore basica comeca com:',
        options: [
          { id: 'a', label: '40 20 10 30 60 50 70' },
          { id: 'b', label: '10 20 30 40 50 60 70' },
          { id: 'c', label: '70 60 50 40 30 20 10' },
        ],
        correctOptionId: 'a',
        explanation: 'Pre-ordem visita a raiz antes das subarvores: 40, depois toda a esquerda, depois a direita.',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'Qualquer caminhamento visita cada no exatamente uma vez.',
    },
    commonMistakes: [
      {
        id: 'abb-percorrer-troca-visita',
        title: 'Trocar a posicao da visita',
        description: 'Mover visitar() antes ou depois das recursoes muda central para pre ou pos-ordem.',
      },
    ],
  },
  {
    id: 'abb-alterar-contar-pares-01',
    title: 'Modificar uma contagem para contar pares',
    pattern: 'percorrer-todos-os-nos',
    structure: 'abb',
    phase: 8,
    focus: 'codigo',
    difficulty: 'medio',
    transferGroupId: 'contagem-transferencia-01',
    statement:
      'Voce ja tem uma funcao que percorre todos os nos. Adapte-a para contar apenas os nos cujo elemento e par. A estrutura recursiva permanece; muda so a condicao de contagem.',
    providedCode: `int contarPares(No i) {
  if (i == null) return 0;
  int cont = (i.elemento % 2 == 0) ? 1 : 0;
  cont += contarPares(i.esq) + contarPares(i.dir);
  return cont;
}`,
    visualStateId: 'binaria-ismax-01',
    steps: [
      {
        id: 'abb-alterar-contar-pares-01-s1',
        kind: 'interpretar',
        prompt: 'O que muda em relacao a contar todos os nos?',
        options: [
          { id: 'a', label: 'Somar 1 apenas quando i.elemento % 2 == 0' },
          { id: 'b', label: 'Mudar o caso base para retornar 1' },
          { id: 'c', label: 'Parar na primeira folha encontrada' },
        ],
        correctOptionId: 'a',
        explanation: 'A travessia continua igual; apenas a contribuicao do no atual passa a depender da paridade.',
      },
      {
        id: 'abb-alterar-contar-pares-01-s2',
        kind: 'lacuna',
        prompt: 'Complete a condicao que testa o no atual: if (i.elemento ___ 2 == 0) cont++;',
        gapId: 'operador-mod',
        answers: [{ id: 'mod', answer: '%', aliases: ['mod', 'resto'] }],
        explanation: 'O operador modulo (%) devolve o resto; resto 0 na divisao por 2 indica numero par.',
      },
      {
        id: 'abb-alterar-contar-pares-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a funcao contarPares(i).',
        blocks: [
          { id: 'base', label: 'se i == null, retorne 0', order: 1 },
          { id: 'atual', label: 'int cont = (i.elemento % 2 == 0) ? 1 : 0', order: 2 },
          { id: 'soma', label: 'cont += contarPares(i.esq) + contarPares(i.dir)', order: 3 },
          { id: 'ret', label: 'retorne cont', order: 4 },
        ],
        correctOrder: ['base', 'atual', 'soma', 'ret'],
      },
      {
        id: 'abb-alterar-contar-pares-01-s4',
        kind: 'simular',
        prompt: 'Na ABB exibida (8, 3, 10, 1, 6, 4, 14, 13), quantos elementos sao pares?',
        options: [
          { id: 'a', label: '5 (8, 10, 6, 4, 14)' },
          { id: 'b', label: '3 (3, 1, 13)' },
          { id: 'c', label: '8 (todos)' },
        ],
        correctOptionId: 'a',
        explanation: 'Pares: 8, 10, 6, 4, 14 = 5. Impares: 3, 1, 13 = 3.',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'Contar por propriedade obriga visitar todos os nos; nenhuma subarvore pode ser descartada.',
    },
    commonMistakes: [
      {
        id: 'abb-alterar-mexer-base',
        title: 'Mexer no caso base em vez da condicao',
        description: 'O caso base continua retornando 0; quem muda e a contribuicao do no atual.',
      },
    ],
  },
  {
    id: 'abb-codigo-altura-01',
    title: 'Escrever a funcao altura da ABB',
    pattern: 'retornar-de-baixo-para-cima',
    structure: 'abb',
    phase: 9,
    focus: 'codigo',
    difficulty: 'medio',
    statement:
      'Escreva a funcao altura usando a convencao em arestas: a arvore vazia tem altura -1 e uma folha tem altura 0. A resposta depende de valores que sobem de baixo para cima.',
    providedCode: `int altura(No i) {
  if (i == null) return -1;
  int he = altura(i.esq);
  int hd = altura(i.dir);
  return 1 + Math.max(he, hd);
}`,
    visualStateId: 'abb-basica-01',
    steps: [
      {
        id: 'abb-codigo-altura-01-s1',
        kind: 'interpretar',
        prompt: 'Na convencao em arestas, qual a altura de uma arvore com apenas a raiz?',
        options: [
          { id: 'a', label: '0' },
          { id: 'b', label: '1' },
          { id: 'c', label: '-1' },
        ],
        correctOptionId: 'a',
        explanation: 'Sem arestas no caminho, a folha/raiz unica tem altura 0; a arvore vazia e que vale -1.',
      },
      {
        id: 'abb-codigo-altura-01-s2',
        kind: 'lacuna',
        prompt: 'Complete o caso base da arvore vazia: if (i == null) return ___;',
        gapId: 'altura-base',
        answers: [{ id: 'menos1', answer: '-1', aliases: ['menos um'] }],
        explanation: 'Retornar -1 faz com que uma folha (filhos null) resulte em 1 + max(-1, -1) = 0.',
      },
      {
        id: 'abb-codigo-altura-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a funcao altura(i).',
        blocks: [
          { id: 'base', label: 'se i == null, retorne -1', order: 1 },
          { id: 'he', label: 'int he = altura(i.esq)', order: 2 },
          { id: 'hd', label: 'int hd = altura(i.dir)', order: 3 },
          { id: 'ret', label: 'retorne 1 + max(he, hd)', order: 4 },
        ],
        correctOrder: ['base', 'he', 'hd', 'ret'],
      },
      {
        id: 'abb-codigo-altura-01-s4',
        kind: 'digitar',
        prompt: 'Agora escreva a linha final da funcao: o retorno que combina as duas alturas.',
        expected: 'return 1 + Math.max(he, hd);',
        aliases: ['return Math.max(he, hd) + 1;', 'return 1 + Math.max(hd, he);'],
        explanation: 'O no atual soma 1 aresta ao maior dos dois lados: return 1 + Math.max(he, hd);',
      },
      {
        id: 'abb-codigo-altura-01-s5',
        kind: 'complexidade',
        prompt: 'Qual a complexidade de calcular a altura?',
        options: [
          { id: 'a', label: 'O(n), visita todos os nos' },
          { id: 'b', label: 'O(h), so um caminho' },
          { id: 'c', label: 'O(log n) sempre' },
        ],
        correctOptionId: 'a',
        explanation: 'A altura precisa comparar as duas subarvores de cada no, entao visita todos os nos.',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'Cada no contribui com o max das subarvores; nenhum ramo pode ser descartado.',
    },
    commonMistakes: [
      {
        id: 'abb-altura-soma',
        title: 'Somar alturas em vez de usar max',
        description: 'A altura usa 1 + max(he, hd); somar he + hd mede outra coisa.',
      },
    ],
  },
  {
    id: 'abb-dominio-01',
    title: 'Desafio de dominio: juntar tudo na ABB',
    pattern: 'verificar-propriedade-global',
    structure: 'abb',
    phase: 10,
    focus: 'codigo',
    difficulty: 'dificil',
    statement:
      'Fase final da trilha de ABB: combine pesquisa, remocao com dois filhos, validacao por limites e analise de custo em um unico desafio.',
    providedCode: `boolean ehABB(No i, int min, int max) {
  if (i == null) return true;
  if (i.elemento <= min || i.elemento >= max) return false;
  return ehABB(i.esq, min, i.elemento)
      && ehABB(i.dir, i.elemento, max);
}`,
    visualStateId: 'abb-basica-01',
    steps: [
      {
        id: 'abb-dominio-01-s1',
        kind: 'simular',
        prompt: 'Pesquisar 50: qual caminho a busca visita?',
        options: [
          { id: 'a', label: '40 -> 60 -> 50' },
          { id: 'b', label: '40 -> 20 -> 30' },
          { id: 'c', label: '40 -> 60 -> 70' },
        ],
        correctOptionId: 'a',
        activePath: ['n40', 'n60', 'n50'],
        explanation: '50 > 40 (dir, 60), 50 < 60 (esq, 50): encontrado.',
      },
      {
        id: 'abb-dominio-01-s2',
        kind: 'simular',
        prompt: 'Remover a raiz 40 (dois filhos) pelo maior da subarvore esquerda: quem sobe?',
        options: [
          { id: 'a', label: '30 (maior da subarvore esquerda {20,10,30})' },
          { id: 'b', label: '20' },
          { id: 'c', label: '50' },
        ],
        correctOptionId: 'a',
        activePath: ['n40', 'n20', 'n30'],
        explanation: 'A subarvore esquerda de 40 e {10,20,30}; o maior e 30, que substitui a raiz.',
      },
      {
        id: 'abb-dominio-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a validacao ehABB(i, min, max) por limites.',
        blocks: [
          { id: 'base', label: 'se i == null, retorne true', order: 1 },
          { id: 'limite', label: 'se i.elemento <= min ou i.elemento >= max, retorne false', order: 2 },
          { id: 'rec', label: 'retorne ehABB(i.esq, min, i.elemento) && ehABB(i.dir, i.elemento, max)', order: 3 },
        ],
        correctOrder: ['base', 'limite', 'rec'],
      },
      {
        id: 'abb-dominio-01-s4',
        kind: 'complexidade',
        prompt: 'Qual o custo de validar ehABB por limites?',
        options: [
          { id: 'a', label: 'O(n), visita cada no uma vez' },
          { id: 'b', label: 'O(h)' },
          { id: 'c', label: 'O(n^2)' },
        ],
        correctOptionId: 'a',
        explanation: 'A validacao por limites desce a arvore inteira passando min/max a cada chamada.',
      },
      {
        id: 'abb-dominio-01-s5',
        kind: 'revisao',
        prompt: 'Revise a trilha de dominio da ABB.',
        summary:
          'Pesquisa e remocao seguem caminhos O(h); validacao e percursos sao O(n). A propriedade da ABB e global e a comparacao esq < no < dir guia toda operacao.',
        solutionNotes: [
          'Buscar/inserir/remover: um unico caminho, custo O(h).',
          'Validar por limites (min, max) evita o erro de comparar so filhos diretos.',
          'Remocao com dois filhos usa o antecessor (maior da esquerda) ou o sucessor.',
        ],
      },
    ],
    complexity: {
      answer: 'O(n) para validar/percorrer; O(h) para buscar/inserir/remover',
      explanation: 'Operacoes de caminho seguem a altura; operacoes que olham a arvore inteira sao lineares.',
    },
    commonMistakes: [
      {
        id: 'abb-dominio-validar-local',
        title: 'Validar so comparando filhos diretos',
        description: 'Sem propagar min/max, arvores invalidas passam no teste; a validacao precisa de limites globais.',
      },
    ],
  },
  {
    id: 'avl-fator-01',
    title: 'Calcular fator de balanceamento',
    pattern: 'retornar-de-baixo-para-cima',
    structure: 'avl',
    focus: 'codigo',
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
    focus: 'codigo',
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
    focus: 'codigo',
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
    focus: 'codigo',
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
    focus: 'codigo',
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
    focus: 'codigo',
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
    focus: 'codigo',
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
    focus: 'codigo',
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
    phase: 9,
    focus: 'codigo',
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
    phase: 7,
    focus: 'codigo',
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
    id: 'binaria-reconhecer-01',
    title: 'Reconhecer a arvore binaria comum',
    pattern: 'verificar-propriedade-global',
    structure: 'binaria',
    phase: 1,
    focus: 'codigo',
    difficulty: 'facil',
    statement:
      'A arvore binaria comum usa a mesma classe No da ABB (elemento, esq, dir), mas NAO possui regra de ordem entre os elementos. Reconhecer essa diferenca evita usar descidas por comparacao onde elas nao valem.',
    providedCode: `class No {
  int elemento;
  No esq, dir;
}

class Arvore {
  private No raiz;
  // nenhuma regra de ordem entre esq e dir
}`,
    visualStateId: 'binaria-ismax-01',
    steps: [
      {
        id: 'binaria-reconhecer-01-s1',
        kind: 'interpretar',
        prompt: 'Qual a diferenca essencial entre arvore binaria comum e ABB?',
        options: [
          { id: 'a', label: 'A binaria comum nao tem regra de ordem; a ABB exige esq < no < dir' },
          { id: 'b', label: 'A binaria comum permite tres filhos por no' },
          { id: 'c', label: 'A ABB nao usa ponteiros esq/dir' },
        ],
        correctOptionId: 'a',
        explanation: 'A forma e igual (ate dois filhos); o que muda e a ausencia da propriedade de busca.',
      },
      {
        id: 'binaria-reconhecer-01-s2',
        kind: 'lacuna',
        prompt: 'Complete: em uma arvore binaria, cada no tem no maximo ___ filhos.',
        gapId: 'grau-maximo',
        answers: [{ id: 'dois', answer: '2', aliases: ['dois'] }],
        explanation: 'Grau maximo 2: por isso os campos sao exatamente esq e dir.',
      },
      {
        id: 'binaria-reconhecer-01-s3',
        kind: 'simular',
        prompt: 'Quantos nos tem a arvore exibida?',
        options: [
          { id: 'a', label: '8' },
          { id: 'b', label: '7' },
          { id: 'c', label: '6' },
        ],
        correctOptionId: 'a',
        explanation: 'Nos: 8, 3, 10, 1, 6, 4, 14 e 13 = 8 nos.',
      },
      {
        id: 'binaria-reconhecer-01-s4',
        kind: 'interpretar',
        prompt: 'Na arvore exibida, 13 esta a esquerda de 14 mesmo sendo menor que 8 da raiz. Isso e um erro?',
        options: [
          { id: 'a', label: 'Nao: sem regra de ordem, qualquer valor pode ficar em qualquer posicao' },
          { id: 'b', label: 'Sim: 13 deveria estar na subarvore esquerda da raiz' },
          { id: 'c', label: 'Sim: folhas precisam ser maiores que a raiz' },
        ],
        correctOptionId: 'a',
        activeNodeId: 'n13',
        explanation: 'So a ABB restringe posicoes por valor; a binaria comum aceita qualquer arranjo.',
      },
    ],
    complexity: {
      answer: 'O(1) por no; O(n) para inspecionar a arvore toda',
      explanation: 'Reconhecer os campos e constante; validar qualquer propriedade global exige visitar todos os nos.',
    },
    commonMistakes: [
      {
        id: 'binaria-reconhecer-assumir-ordem',
        title: 'Assumir regra de ABB em arvore comum',
        description: 'Descartar subarvores por comparacao so vale quando existe a propriedade de busca.',
      },
    ],
  },
  {
    id: 'binaria-desenhar-folhas-01',
    title: 'Desenhar e identificar niveis, folhas e caminhos',
    pattern: 'percorrer-todos-os-nos',
    structure: 'binaria',
    phase: 2,
    focus: 'desenho',
    difficulty: 'facil',
    statement:
      'Antes de codificar, e preciso ler o desenho: identificar folhas, niveis e caminhos, e diferenciar arvore estritamente binaria (todo no com 0 ou 2 filhos) de uma arvore qualquer.',
    providedCode: `// folha: no com esq == null && dir == null
// nivel: distancia em arestas ate a raiz
// estritamente binaria: nenhum no com apenas 1 filho`,
    visualStateId: 'binaria-ismax-01',
    steps: [
      {
        id: 'binaria-desenhar-folhas-01-s1',
        kind: 'interpretar',
        prompt: 'Qual desenho mostra uma arvore ESTRITAMENTE binaria (todo no com 0 ou 2 filhos)?',
        options: [
          { id: 'a', label: 'Desenho A', visualStateId: 'binaria-estrita-01' },
          { id: 'b', label: 'Desenho B', visualStateId: 'binaria-ismax-01' },
        ],
        correctOptionId: 'a',
        explanation: 'No desenho B, os nos 6, 10 e 14 tem apenas um filho; no A, todo no tem 0 ou 2.',
      },
      {
        id: 'binaria-desenhar-folhas-01-s2',
        kind: 'clique',
        prompt: 'Clique nas 3 folhas da arvore exibida.',
        targetNodeIds: ['n1', 'n4', 'n13'],
        selectionMode: 'unordered',
        explanation: 'Folhas sao nos reais sem filhos: 1, 4 e 13.',
      },
      {
        id: 'binaria-desenhar-folhas-01-s3',
        kind: 'interpretar',
        prompt: 'Contando a raiz como nivel 0, quantos niveis a arvore exibida ocupa?',
        options: [
          { id: 'a', label: '4 niveis (0 a 3)' },
          { id: 'b', label: '3 niveis (0 a 2)' },
          { id: 'c', label: '8 niveis, um por no' },
        ],
        correctOptionId: 'a',
        explanation: 'O caminho 8 -> 3 -> 6 -> 4 alcanca o nivel 3; logo ha 4 niveis.',
      },
      {
        id: 'binaria-desenhar-folhas-01-s4',
        kind: 'clique',
        prompt: 'Clique, NA ORDEM, no caminho da raiz ate o no 4.',
        targetNodeIds: ['n8', 'n3', 'n6', 'n4'],
        selectionMode: 'ordered',
        explanation: 'O caminho desce 8 -> 3 -> 6 -> 4; cada aresta soma 1 ao nivel.',
      },
    ],
    complexity: {
      answer: 'O(n) para classificar folhas e niveis',
      explanation: 'Identificar folhas e niveis exige olhar cada no do desenho uma vez.',
    },
    commonMistakes: [
      {
        id: 'binaria-desenho-folha-interna',
        title: 'Marcar no interno como folha',
        description: 'No com um unico filho nao e folha; folha exige esq e dir nulos.',
      },
    ],
  },
  {
    id: 'binaria-construir-niveis-01',
    title: 'Construir arvore inserindo por niveis',
    pattern: 'navegar-por-camadas',
    structure: 'binaria',
    phase: 3,
    focus: 'codigo',
    difficulty: 'medio',
    statement:
      'Sem regra de ordem, uma forma canonica de construir arvore binaria e inserir por niveis (largura), preenchendo cada nivel da esquerda para a direita com ajuda de uma fila.',
    providedCode: `void inserir(int x) {
  No novo = new No(x);
  if (raiz == null) { raiz = novo; return; }
  Fila fila = new Fila();
  fila.enfileirar(raiz);
  while (!fila.vazia()) {
    No i = fila.desenfileirar();
    if (i.esq == null) { i.esq = novo; return; }
    if (i.dir == null) { i.dir = novo; return; }
    fila.enfileirar(i.esq);
    fila.enfileirar(i.dir);
  }
}`,
    visualStateId: 'binaria-estrita-01',
    steps: [
      {
        id: 'binaria-construir-niveis-01-s1',
        kind: 'interpretar',
        prompt: 'Qual estrutura auxiliar garante o preenchimento nivel a nivel?',
        options: [
          { id: 'a', label: 'Fila (FIFO): visita os nos na ordem em que aparecem por nivel' },
          { id: 'b', label: 'Pilha (LIFO): aprofunda antes de completar o nivel' },
          { id: 'c', label: 'Vetor ordenado por valor' },
        ],
        correctOptionId: 'a',
        explanation: 'A fila processa os nos na ordem de chegada, exatamente a ordem dos niveis.',
      },
      {
        id: 'binaria-construir-niveis-01-s2',
        kind: 'simular',
        prompt: 'A arvore exibida tem 7 nos completando os niveis 0 a 2. Inserindo 5 por niveis, onde ele entra?',
        options: [
          { id: 'a', label: 'Filho esquerdo de 1 (primeiro no com vaga na largura)' },
          { id: 'b', label: 'Filho direito de 14' },
          { id: 'c', label: 'Nova raiz' },
        ],
        correctOptionId: 'a',
        activePath: ['n8', 'n3', 'n1'],
        explanation: 'A fila visita 8, 3, 10, 1...; o primeiro com vaga e o 1, e a vaga esquerda vem primeiro.',
      },
      {
        id: 'binaria-construir-niveis-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a insercao por niveis.',
        blocks: [
          { id: 'raiz', label: 'se raiz == null, novo vira raiz', order: 1 },
          { id: 'enf', label: 'enfileire a raiz', order: 2 },
          { id: 'des', label: 'desenfileire i e teste vagas esq/dir', order: 3 },
          { id: 'filhos', label: 'sem vaga: enfileire i.esq e i.dir e repita', order: 4 },
        ],
        correctOrder: ['raiz', 'enf', 'des', 'filhos'],
      },
      {
        id: 'binaria-construir-niveis-01-s4',
        kind: 'complexidade',
        prompt: 'Qual o custo de uma insercao por niveis no pior caso?',
        options: [
          { id: 'a', label: 'O(n): pode percorrer todos os nos ate achar vaga' },
          { id: 'b', label: 'O(log n) garantido' },
          { id: 'c', label: 'O(1) sempre' },
        ],
        correctOptionId: 'a',
        explanation: 'A largura visita os nos ja existentes ate encontrar a primeira vaga.',
      },
    ],
    complexity: {
      answer: 'O(n) por insercao no pior caso',
      explanation: 'A busca por vaga percorre a fila de nos existentes; nao ha atalho por comparacao.',
    },
    commonMistakes: [
      {
        id: 'binaria-construir-usar-pilha',
        title: 'Usar pilha no lugar da fila',
        description: 'Com pilha o preenchimento aprofunda um ramo e deixa de completar os niveis.',
      },
    ],
  },
  {
    id: 'binaria-pesquisar-01',
    title: 'Pesquisar sem poder descartar subarvores',
    pattern: 'percorrer-todos-os-nos',
    structure: 'binaria',
    phase: 4,
    focus: 'codigo',
    difficulty: 'medio',
    statement:
      'Sem a propriedade de busca, pesquisar exige olhar os dois lados: o valor pode estar em qualquer subarvore. Combine os retornos com OU logico.',
    providedCode: `boolean pesquisar(int x, No i) {
  if (i == null) return false;
  if (i.elemento == x) return true;
  return pesquisar(x, i.esq) || pesquisar(x, i.dir);
}`,
    visualStateId: 'binaria-ismax-01',
    steps: [
      {
        id: 'binaria-pesquisar-01-s1',
        kind: 'interpretar',
        prompt: 'Por que a pesquisa na binaria comum nao pode descer por comparacao como na ABB?',
        options: [
          { id: 'a', label: 'Sem regra de ordem, o valor pode estar em qualquer lado' },
          { id: 'b', label: 'Porque a recursao nao funciona em arvores comuns' },
          { id: 'c', label: 'Porque a raiz nunca contem o valor procurado' },
        ],
        correctOptionId: 'a',
        explanation: 'Comparar com o no atual nao diz nada sobre onde o valor esta; nada pode ser descartado.',
      },
      {
        id: 'binaria-pesquisar-01-s2',
        kind: 'lacuna',
        prompt: 'Complete a combinacao dos dois lados: return pesquisar(x, i.esq) ___ pesquisar(x, i.dir);',
        gapId: 'combina-ou',
        answers: [{ id: 'ou', answer: '||', aliases: ['ou', 'or'] }],
        explanation: 'Basta um dos lados achar: OU logico combina os retornos.',
      },
      {
        id: 'binaria-pesquisar-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a pesquisa recursiva.',
        blocks: [
          { id: 'nulo', label: 'se i == null, retorne false', order: 1 },
          { id: 'achou', label: 'se i.elemento == x, retorne true', order: 2 },
          { id: 'lados', label: 'retorne pesquisa(esq) || pesquisa(dir)', order: 3 },
        ],
        correctOrder: ['nulo', 'achou', 'lados'],
      },
      {
        id: 'binaria-pesquisar-01-s4',
        kind: 'corrigir',
        prompt: 'Um colega escreveu a pesquisa abaixo, mas ela so acha valores que estao nos DOIS lados. Aponte a linha errada e corrija.',
        lines: [
          'if (i == null) return false;',
          'if (i.elemento == x) return true;',
          'return pesquisar(x, i.esq) && pesquisar(x, i.dir);',
        ],
        wrongLineIndex: 2,
        fixOptions: [
          { id: 'ou', label: 'return pesquisar(x, i.esq) || pesquisar(x, i.dir);' },
          { id: 'so-esq', label: 'return pesquisar(x, i.esq);' },
          { id: 'nada', label: 'A linha esta correta.' },
        ],
        correctFixId: 'ou',
        explanation: 'Com && os dois lados precisariam conter x; o certo e || (basta um lado achar).',
      },
      {
        id: 'binaria-pesquisar-01-s5',
        kind: 'complexidade',
        prompt: 'Compare: pesquisa na binaria comum vs na ABB.',
        options: [
          { id: 'a', label: 'Comum: O(n); ABB: O(h), pois descarta um lado por comparacao' },
          { id: 'b', label: 'As duas sao O(log n) sempre' },
          { id: 'c', label: 'As duas sao O(1)' },
        ],
        correctOptionId: 'a',
        explanation: 'A propriedade de busca e o que permite a ABB ignorar metade local da arvore.',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'No pior caso a pesquisa visita todos os nos, pois nenhuma subarvore pode ser descartada.',
    },
    commonMistakes: [
      {
        id: 'binaria-pesquisar-descartar-lado',
        title: 'Descartar um lado por comparacao',
        description: 'if (x < i.elemento) so vale na ABB; na binaria comum perde valores do outro lado.',
      },
    ],
  },
  {
    id: 'binaria-inserir-largura-01',
    title: 'Implementar a insercao em largura',
    pattern: 'navegar-por-camadas',
    structure: 'binaria',
    phase: 5,
    focus: 'codigo',
    difficulty: 'medio',
    statement:
      'Implemente a insercao que mantem a arvore o mais completa possivel: percorra por niveis com uma fila e ligue o novo no na primeira vaga (esq antes de dir).',
    providedCode: `void inserir(int x) {
  No novo = new No(x);
  if (raiz == null) { raiz = novo; return; }
  Fila fila = new Fila();
  fila.enfileirar(raiz);
  while (!fila.vazia()) {
    No i = fila.desenfileirar();
    if (i.esq == null) { i.esq = novo; return; }
    if (i.dir == null) { i.dir = novo; return; }
    fila.enfileirar(i.esq);
    fila.enfileirar(i.dir);
  }
}`,
    visualStateId: 'binaria-estrita-01',
    steps: [
      {
        id: 'binaria-inserir-largura-01-s1',
        kind: 'interpretar',
        prompt: 'Onde o novo no deve ser ligado?',
        options: [
          { id: 'a', label: 'Na primeira vaga encontrada em percurso por niveis, esq antes de dir' },
          { id: 'b', label: 'Sempre como nova raiz' },
          { id: 'c', label: 'Na posicao definida pela comparacao de valores' },
        ],
        correctOptionId: 'a',
        explanation: 'Sem regra de valor, o criterio e estrutural: primeira vaga na ordem dos niveis.',
      },
      {
        id: 'binaria-inserir-largura-01-s2',
        kind: 'lacuna',
        prompt: 'Complete o teste de vaga: if (i.esq == ___) { i.esq = novo; return; }',
        gapId: 'vaga-null',
        answers: [{ id: 'null', answer: 'null', aliases: ['nulo'] }],
        explanation: 'Vaga e um ponteiro nulo: o primeiro esq/dir nulo recebe o novo no.',
      },
      {
        id: 'binaria-inserir-largura-01-s3',
        kind: 'blocos',
        prompt: 'Ordene o corpo do laco da insercao.',
        blocks: [
          { id: 'des', label: 'No i = fila.desenfileirar()', order: 1 },
          { id: 'esq', label: 'se i.esq == null: liga novo em i.esq e retorna', order: 2 },
          { id: 'dir', label: 'se i.dir == null: liga novo em i.dir e retorna', order: 3 },
          { id: 'enf', label: 'enfileira i.esq e i.dir', order: 4 },
        ],
        correctOrder: ['des', 'esq', 'dir', 'enf'],
      },
      {
        id: 'binaria-inserir-largura-01-s4',
        kind: 'complexidade',
        prompt: 'Por que essa insercao e O(n) no pior caso?',
        options: [
          { id: 'a', label: 'A fila pode visitar todos os nos antes de achar vaga' },
          { id: 'b', label: 'Porque criar o no custa O(n)' },
          { id: 'c', label: 'Nao e: a fila garante O(1)' },
        ],
        correctOptionId: 'a',
        explanation: 'Numa arvore quase completa a vaga aparece so depois de percorrer os niveis cheios.',
      },
    ],
    complexity: {
      answer: 'O(n) no pior caso',
      explanation: 'O percurso em largura pode passar por todos os nos existentes ate achar a primeira vaga.',
    },
    commonMistakes: [
      {
        id: 'binaria-inserir-sem-return',
        title: 'Esquecer o return apos ligar o novo no',
        description: 'Sem retornar, o laco continua e o mesmo no e ligado em outras vagas.',
      },
    ],
  },
  {
    id: 'binaria-remover-01',
    title: 'Remover substituindo pelo ultimo no em largura',
    pattern: 'navegar-por-camadas',
    structure: 'binaria',
    phase: 6,
    focus: 'codigo',
    difficulty: 'dificil',
    statement:
      'Na binaria comum, uma remocao que preserva a forma compacta copia o valor do ULTIMO no em largura para o no removido e entao desliga esse ultimo no do pai.',
    providedCode: `void remover(int x) {
  // 1. ache o no alvo (percurso qualquer)
  // 2. ache o ultimo no em largura e seu pai
  // 3. alvo.elemento = ultimo.elemento
  // 4. desligue o ultimo do pai (esq/dir = null)
}`,
    visualStateId: 'binaria-ismax-01',
    steps: [
      {
        id: 'binaria-remover-01-s1',
        kind: 'interpretar',
        prompt: 'Remover uma folha exige o que?',
        options: [
          { id: 'a', label: 'Fazer o pai apontar null para ela' },
          { id: 'b', label: 'Rotacionar a subarvore do pai' },
          { id: 'c', label: 'Substituir pela raiz' },
        ],
        correctOptionId: 'a',
        activeNodeId: 'n13',
        explanation: 'Folha nao tem filhos: basta o pai soltar a referencia.',
      },
      {
        id: 'binaria-remover-01-s2',
        kind: 'simular',
        prompt: 'Na arvore exibida, o percurso por niveis e 8, 3, 10, 1, 6, 14, 4, 13. Removendo o no 3, qual valor sobe para o lugar dele?',
        options: [
          { id: 'a', label: '13, o ultimo no em largura' },
          { id: 'b', label: '4, o filho mais profundo da esquerda' },
          { id: 'c', label: '10, o irmao' },
        ],
        correctOptionId: 'a',
        activePath: ['n3', 'n13'],
        activeNodeId: 'n3',
        explanation: 'A tecnica copia o valor do ultimo em largura (13) e remove o no 13 original.',
      },
      {
        id: 'binaria-remover-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a remocao pela tecnica do ultimo em largura.',
        blocks: [
          { id: 'alvo', label: 'localize o no alvo', order: 1 },
          { id: 'ultimo', label: 'localize o ultimo no em largura e seu pai', order: 2 },
          { id: 'copia', label: 'copie ultimo.elemento para o alvo', order: 3 },
          { id: 'solta', label: 'faca o pai do ultimo apontar null', order: 4 },
        ],
        correctOrder: ['alvo', 'ultimo', 'copia', 'solta'],
      },
      {
        id: 'binaria-remover-01-s4',
        kind: 'complexidade',
        prompt: 'Qual o custo da remocao com essa tecnica?',
        options: [
          { id: 'a', label: 'O(n): achar o alvo e o ultimo em largura percorre a arvore' },
          { id: 'b', label: 'O(h) como na ABB' },
          { id: 'c', label: 'O(1)' },
        ],
        correctOptionId: 'a',
        explanation: 'Os dois passos de localizacao sao percursos completos no pior caso.',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'Achar o alvo e o ultimo no em largura exige percorrer a arvore sem atalhos.',
    },
    commonMistakes: [
      {
        id: 'binaria-remover-esquecer-pai',
        title: 'Copiar o valor e esquecer de desligar o ultimo',
        description: 'Sem soltar o ultimo no, o valor fica duplicado na arvore.',
      },
    ],
  },
  {
    id: 'binaria-alterar-grau2-01',
    title: 'Modificar contagem para nos de grau 2',
    pattern: 'percorrer-todos-os-nos',
    structure: 'binaria',
    phase: 8,
    focus: 'codigo',
    difficulty: 'medio',
    transferGroupId: 'contagem-transferencia-01',
    statement:
      'Adapte a contagem de nos para contar apenas os de grau 2 (com os dois filhos). A travessia permanece; muda a condicao da contribuicao do no atual.',
    providedCode: `int contarGrau2(No i) {
  if (i == null) return 0;
  int cont = (i.esq != null && i.dir != null) ? 1 : 0;
  cont += contarGrau2(i.esq) + contarGrau2(i.dir);
  return cont;
}`,
    visualStateId: 'binaria-ismax-01',
    steps: [
      {
        id: 'binaria-alterar-grau2-01-s1',
        kind: 'interpretar',
        prompt: 'O que muda em relacao a contar todos os nos?',
        options: [
          { id: 'a', label: 'Somar 1 apenas quando i.esq != null && i.dir != null' },
          { id: 'b', label: 'Trocar o caso base para retornar 1' },
          { id: 'c', label: 'Percorrer somente a subarvore esquerda' },
        ],
        correctOptionId: 'a',
        explanation: 'A estrutura recursiva nao muda; so a condicao da contribuicao local.',
      },
      {
        id: 'binaria-alterar-grau2-01-s2',
        kind: 'lacuna',
        prompt: 'Complete: if (i.esq != null ___ i.dir != null) cont++;',
        gapId: 'operador-e',
        answers: [{ id: 'e', answer: '&&', aliases: ['e', 'and'] }],
        explanation: 'Grau 2 exige os DOIS filhos: E logico.',
      },
      {
        id: 'binaria-alterar-grau2-01-s3',
        kind: 'blocos',
        prompt: 'Ordene contarGrau2(i).',
        blocks: [
          { id: 'base', label: 'se i == null, retorne 0', order: 1 },
          { id: 'atual', label: 'cont = (esq e dir nao nulos) ? 1 : 0', order: 2 },
          { id: 'soma', label: 'cont += recursao esq + recursao dir', order: 3 },
          { id: 'ret', label: 'retorne cont', order: 4 },
        ],
        correctOrder: ['base', 'atual', 'soma', 'ret'],
      },
      {
        id: 'binaria-alterar-grau2-01-s4',
        kind: 'simular',
        prompt: 'Na arvore exibida, quantos nos tem grau 2?',
        options: [
          { id: 'a', label: '2 (o 8 e o 3)' },
          { id: 'b', label: '5 (todos os nos internos)' },
          { id: 'c', label: '3 (8, 3 e 10)' },
        ],
        correctOptionId: 'a',
        explanation: '8 tem filhos 3 e 10; 3 tem filhos 1 e 6. Ja 6, 10 e 14 tem apenas um filho.',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'Contar por propriedade visita cada no uma vez; nada pode ser descartado.',
    },
    commonMistakes: [
      {
        id: 'binaria-grau2-usar-ou',
        title: 'Usar OU no lugar de E',
        description: 'esq != null || dir != null conta nos de grau 1 tambem; grau 2 exige os dois filhos.',
      },
    ],
  },
  {
    id: 'binaria-dominio-01',
    title: 'Desafio de dominio: forma, folhas e altura',
    pattern: 'verificar-propriedade-global',
    structure: 'binaria',
    phase: 10,
    focus: 'codigo',
    difficulty: 'dificil',
    statement:
      'Fase final da trilha de Arvore Binaria: combine leitura do desenho (altura, folhas, forma) com o raciocinio das funcoes ja construidas na trilha.',
    providedCode: `int altura(No i) {
  return (i == null) ? -1
    : 1 + Math.max(altura(i.esq), altura(i.dir));
}

int folhas(No i) {
  if (i == null) return 0;
  if (i.esq == null && i.dir == null) return 1;
  return folhas(i.esq) + folhas(i.dir);
}`,
    visualStateId: 'binaria-ismax-01',
    steps: [
      {
        id: 'binaria-dominio-01-s1',
        kind: 'simular',
        prompt: 'Qual a altura (em arestas) da arvore exibida?',
        options: [
          { id: 'a', label: '3' },
          { id: 'b', label: '4' },
          { id: 'c', label: '2' },
        ],
        correctOptionId: 'a',
        activePath: ['n8', 'n3', 'n6', 'n4'],
        explanation: 'O caminho mais longo (8 -> 3 -> 6 -> 4 ou 8 -> 10 -> 14 -> 13) tem 3 arestas.',
      },
      {
        id: 'binaria-dominio-01-s2',
        kind: 'simular',
        prompt: 'Quantas folhas a arvore exibida possui?',
        options: [
          { id: 'a', label: '3 (1, 4 e 13)' },
          { id: 'b', label: '5' },
          { id: 'c', label: '2' },
        ],
        correctOptionId: 'a',
        explanation: 'Somente 1, 4 e 13 nao tem filhos.',
      },
      {
        id: 'binaria-dominio-01-s3',
        kind: 'interpretar',
        prompt: 'A arvore exibida e estritamente binaria?',
        options: [
          { id: 'a', label: 'Nao: 6, 10 e 14 tem apenas um filho' },
          { id: 'b', label: 'Sim: toda arvore com 8 nos e estrita' },
          { id: 'c', label: 'Sim: basta ter raiz com dois filhos' },
        ],
        correctOptionId: 'a',
        explanation: 'Estritamente binaria proibe grau 1; aqui tres nos violam a regra.',
      },
      {
        id: 'binaria-dominio-01-s4',
        kind: 'complexidade',
        prompt: 'isMax combina altura e contagem de nos. Qual o custo total?',
        options: [
          { id: 'a', label: 'O(n): dois percursos lineares e uma comparacao' },
          { id: 'b', label: 'O(log n) por causa do log2 na formula' },
          { id: 'c', label: 'O(n^2)' },
        ],
        correctOptionId: 'a',
        explanation: 'Percursos separados de altura e contagem continuam lineares; constantes somem.',
      },
      {
        id: 'binaria-dominio-01-s5',
        kind: 'revisao',
        prompt: 'Revise a trilha de dominio da Arvore Binaria.',
        summary:
          'Sem regra de ordem, tudo vira percurso: pesquisar, contar e medir sao O(n). Fila da a ordem por niveis para construir, inserir e remover preservando a forma.',
        solutionNotes: [
          'Pesquisa combina os dois lados com ||; nada pode ser descartado.',
          'Insercao/remocao canonicas usam percurso em largura (fila).',
          'Altura usa 1 + max; folhas exigem esq e dir nulos; grau 2 exige os dois filhos.',
        ],
      },
    ],
    complexity: {
      answer: 'O(n) para pesquisar, medir e contar; O(n) para inserir/remover em largura',
      explanation: 'Sem propriedade de busca nao ha descarte de subarvore; todos os algoritmos sao lineares.',
    },
    commonMistakes: [
      {
        id: 'binaria-dominio-importar-abb',
        title: 'Importar habitos de ABB',
        description: 'Descer por comparacao, custo O(h) e remocao por antecessor valem para ABB, nao aqui.',
      },
    ],
  },
  {
    id: 'doidona-pesquisar-palavra-01',
    title: 'Pesquisar palavra na estrutura doidona',
    pattern: 'navegar-por-camadas',
    structure: 'doidona',
    focus: 'codigo',
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
    focus: 'codigo',
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
  {
    id: 'arv234-divisao-raiz-01',
    title: 'Dividir no cheio em arvore 2-3-4',
    pattern: 'verificar-propriedade-global',
    structure: 'arv234',
    focus: 'codigo',
    difficulty: 'medio',
    statement:
      'Considere uma arvore 2-3-4 em que cada no pode guardar ate tres chaves ordenadas. Explique quando um no cheio deve ser dividido e qual chave sobe para o pai.',
    providedCode: `class No234 {
  int[] chaves;
  No234[] filhos;
  int n;

  boolean cheio() {
    return n == 3;
  }
}`,
    visualStateId: 'arv234-basica-01',
    steps: [
      {
        id: 'arv234-divisao-raiz-01-s1',
        kind: 'interpretar',
        prompt: 'Em uma arvore 2-3-4, quando um no esta cheio?',
        options: [
          { id: 'a', label: 'Quando possui 3 chaves.' },
          { id: 'b', label: 'Quando possui exatamente 2 filhos.' },
          { id: 'c', label: 'Quando a raiz esta vazia.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'arv234-divisao-raiz-01-s2',
        kind: 'simular',
        prompt: 'Ao dividir o no [20|40|60], qual chave mediana sobe?',
        options: [
          { id: 'a', label: '40' },
          { id: 'b', label: '20' },
          { id: 'c', label: '60' },
        ],
        correctOptionId: 'a',
        activeNodeId: 'n20-40',
      },
      {
        id: 'arv234-divisao-raiz-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a divisao conceitual de um no cheio.',
        blocks: [
          { id: 'mediana', label: 'identificar a chave mediana', order: 1 },
          { id: 'subir', label: 'promover a mediana para o pai', order: 2 },
          { id: 'separar', label: 'separar chaves menores e maiores em dois nos', order: 3 },
        ],
        correctOrder: ['mediana', 'subir', 'separar'],
      },
      {
        id: 'arv234-divisao-raiz-01-s4',
        kind: 'complexidade',
        prompt: 'Qual e o custo de uma insercao em arvore 2-3-4 balanceada?',
        options: [
          { id: 'a', label: 'O(log n), pois a altura permanece balanceada.' },
          { id: 'b', label: 'O(n), pois sempre divide todos os nos.' },
          { id: 'c', label: 'O(1), pois cada no tem poucas chaves.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(log n)',
      explanation: 'A arvore 2-3-4 mantem altura logaritmica; cada nivel faz trabalho constante.',
    },
    commonMistakes: [
      {
        id: 'arv234-subir-extremo',
        title: 'Promover uma chave extrema',
        description: 'Na divisao, sobe a chave mediana; promover extremo quebra a ordem dos intervalos.',
      },
    ],
  },
  {
    id: 'arv234-pesquisar-chave-01',
    title: 'Pesquisar chave em no 2-3-4',
    pattern: 'seguir-um-caminho',
    structure: 'arv234',
    focus: 'codigo',
    difficulty: 'facil',
    statement:
      'Dado um no 2-3-4 com chaves ordenadas, escolha o intervalo correto antes de descer para o filho. A pesquisa compara dentro do no e segue apenas um caminho.',
    providedCode: `boolean pesquisar(int x, No234 i) {
  if (i == null) return false;
  // compare x com as chaves do no
  // escolha o filho do intervalo correto
}`,
    visualStateId: 'arv234-basica-01',
    steps: [
      {
        id: 'arv234-pesquisar-chave-01-s1',
        kind: 'interpretar',
        prompt: 'O que as chaves dentro do no 2-3-4 definem?',
        options: [
          { id: 'a', label: 'Intervalos ordenados para decidir o filho.' },
          { id: 'b', label: 'Cores de uma arvore alvinegra.' },
          { id: 'c', label: 'Indices de uma tabela hash.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'arv234-pesquisar-chave-01-s2',
        kind: 'simular',
        prompt: 'Se o no possui [20|40] e buscamos 55, qual lado deve ser seguido?',
        options: [
          { id: 'a', label: 'O intervalo maior que 40.' },
          { id: 'b', label: 'O intervalo menor que 20.' },
          { id: 'c', label: 'Parar com falso imediatamente.' },
        ],
        correctOptionId: 'a',
        activePath: ['n20-40', 'n50-60'],
      },
      {
        id: 'arv234-pesquisar-chave-01-s3',
        kind: 'lacuna',
        prompt: 'Complete a condicao do ultimo intervalo: if (x ___ maiorChave).',
        gapId: 'maior-intervalo',
        answers: [{ id: 'gt', answer: '>', aliases: ['maior que'] }],
      },
      {
        id: 'arv234-pesquisar-chave-01-s4',
        kind: 'complexidade',
        prompt: 'Por que a pesquisa e logaritmica em uma 2-3-4 balanceada?',
        options: [
          { id: 'a', label: 'Porque desce um nivel por comparacao de intervalo.' },
          { id: 'b', label: 'Porque examina todos os filhos de todos os nos.' },
          { id: 'c', label: 'Porque nao usa comparacoes.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(log n)',
      explanation: 'A pesquisa percorre um caminho da raiz ate uma folha em uma arvore balanceada.',
    },
    commonMistakes: [
      {
        id: 'arv234-descer-todos-filhos',
        title: 'Descer por todos os filhos',
        description: 'As chaves do no escolhem um unico intervalo; pesquisar todos os filhos perde a propriedade.',
      },
    ],
  },
  {
    id: 'patricia-decisao-bit-01',
    title: 'Decidir pelo bit em PATRICIA',
    pattern: 'navegar-por-camadas',
    structure: 'patricia',
    focus: 'codigo',
    difficulty: 'medio',
    statement:
      'Em uma arvore PATRICIA, nos internos guardam o indice do bit usado para decidir o proximo ramo. Simule a pesquisa seguindo os bits indicados.',
    providedCode: `class NoPatricia {
  int bit;
  String chave;
  NoPatricia esq, dir;

  boolean externo() {
    return esq == null && dir == null;
  }
}`,
    visualStateId: 'patricia-bit-01',
    steps: [
      {
        id: 'patricia-decisao-bit-01-s1',
        kind: 'interpretar',
        prompt: 'O que um no interno de PATRICIA armazena para guiar a busca?',
        options: [
          { id: 'a', label: 'O indice do bit que sera testado.' },
          { id: 'b', label: 'A altura AVL do no.' },
          { id: 'c', label: 'A quantidade de colisoes hash.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'patricia-decisao-bit-01-s2',
        kind: 'simular',
        prompt: 'No diagrama, qual e o primeiro teste antes de chegar em BAR?',
        options: [
          { id: 'a', label: 'bit2' },
          { id: 'b', label: 'folha ASA' },
          { id: 'c', label: 'bit9' },
        ],
        correctOptionId: 'a',
        activePath: ['bit2', 'bar'],
      },
      {
        id: 'patricia-decisao-bit-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a pesquisa em PATRICIA.',
        blocks: [
          { id: 'testar', label: 'testar o bit indicado pelo no interno', order: 1 },
          { id: 'descer', label: 'descer para esquerda ou direita', order: 2 },
          { id: 'comparar', label: 'ao chegar na folha, comparar a chave inteira', order: 3 },
        ],
        correctOrder: ['testar', 'descer', 'comparar'],
      },
      {
        id: 'patricia-decisao-bit-01-s4',
        kind: 'complexidade',
        prompt: 'A busca depende principalmente de qual medida?',
        options: [
          { id: 'a', label: 'Do numero de bits testados no caminho.' },
          { id: 'b', label: 'Da quantidade de folhas brancas.' },
          { id: 'c', label: 'Do tamanho da area de reserva.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(k), onde k e a quantidade de bits relevantes testados',
      explanation: 'A busca segue os bits indicados pelos nos internos e confirma a chave na folha.',
    },
    commonMistakes: [
      {
        id: 'patricia-nao-comparar-folha',
        title: 'Nao comparar a chave na folha',
        description: 'Chegar a uma folha candidata nao basta; e preciso conferir se a chave inteira e a buscada.',
      },
    ],
  },
  {
    id: 'patricia-prefixo-compressao-01',
    title: 'Entender compressao de caminhos em PATRICIA',
    pattern: 'analisar-complexidade',
    structure: 'patricia',
    focus: 'codigo',
    difficulty: 'medio',
    statement:
      'PATRICIA comprime caminhos de TRIE que nao criam ramificacao. Explique por que os nos internos testam apenas bits discriminantes.',
    providedCode: `// Em vez de guardar cada caractere como um nivel,
// PATRICIA guarda apenas pontos de decisao.
class NoPatricia {
  int bit;
  NoPatricia esq, dir;
}`,
    visualStateId: 'patricia-bit-01',
    steps: [
      {
        id: 'patricia-prefixo-compressao-01-s1',
        kind: 'interpretar',
        prompt: 'Qual caminho a PATRICIA evita guardar explicitamente?',
        options: [
          { id: 'a', label: 'Caminhos sem ramificacao util.' },
          { id: 'b', label: 'Todos os caminhos com folhas.' },
          { id: 'c', label: 'A raiz da arvore.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'patricia-prefixo-compressao-01-s2',
        kind: 'simular',
        prompt: 'No diagrama, por que ASA e ATO ainda precisam de bit4?',
        options: [
          { id: 'a', label: 'Porque compartilham prefixo e divergem em um bit posterior.' },
          { id: 'b', label: 'Porque sao iguais.' },
          { id: 'c', label: 'Porque estao em uma tabela hash.' },
        ],
        correctOptionId: 'a',
        activePath: ['bit2', 'bit4'],
      },
      {
        id: 'patricia-prefixo-compressao-01-s3',
        kind: 'lacuna',
        prompt: 'Complete: PATRICIA guarda apenas bits de ___.',
        gapId: 'bits-decisao',
        answers: [{ id: 'decisao', answer: 'decisao', aliases: ['decisão', 'ramificacao'] }],
      },
      {
        id: 'patricia-prefixo-compressao-01-s4',
        kind: 'complexidade',
        prompt: 'Qual beneficio a compressao busca?',
        options: [
          { id: 'a', label: 'Reduzir nos intermediarios que nao decidem nada.' },
          { id: 'b', label: 'Transformar a busca em O(1) sempre.' },
          { id: 'c', label: 'Remover a comparacao final da chave.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(k), com menos nos intermediarios que uma TRIE comum',
      explanation: 'A compressao elimina niveis sem decisao, mas a busca ainda segue bits discriminantes.',
    },
    commonMistakes: [
      {
        id: 'patricia-confundir-trie-completa',
        title: 'Tratar como TRIE sem compressao',
        description: 'PATRICIA nao precisa materializar todo prefixo; ela guarda pontos de decisao.',
      },
    ],
  },
  {
    id: 'abb-lista3-eh-abb-03',
    title: 'Escolher desenho correto da ABB',
    pattern: 'verificar-propriedade-global',
    structure: 'abb',
    difficulty: 'medio',
    statement:
      'Questao 3 da lista: implemente ehABB() sem copiar elementos para vetor. Antes do codigo, escolha o desenho que realmente respeita a propriedade global de ABB.',
    providedCode: `class No {
  int elemento;
  No esq, dir;
}

class Arvore {
  private No raiz;

  boolean ehABB() {
    return ehABB(raiz, Integer.MIN_VALUE, Integer.MAX_VALUE);
  }

  private boolean ehABB(No i, int min, int max) {
    // complete a verificacao global
  }
}`,
    visualStateId: 'abb-invalida-01',
    focus: 'desenho',
    source: prova3Source('Questao 3'),
    steps: [
      {
        id: 'abb-lista3-eh-abb-03-s1',
        kind: 'interpretar',
        prompt: 'Qual desenho respeita a regra de ABB em todos os nos?',
        options: [
          { id: 'a', label: 'Desenho A', visualStateId: 'abb-basica-01' },
          { id: 'b', label: 'Desenho B', visualStateId: 'abb-invalida-01' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'abb-lista3-eh-abb-03-s2',
        kind: 'clique',
        prompt: 'No desenho principal, clique no no que ja prova a violacao da ABB.',
        targetNodeIds: ['n50'],
        maxClicks: 1,
      },
      {
        id: 'abb-lista3-eh-abb-03-s3',
        kind: 'lacuna',
        prompt: 'Complete a guarda global: se i.elemento <= min || i.elemento >= max, retorne ___.',
        gapId: 'retorno-violacao-abb',
        answers: [{ id: 'false', answer: 'false', aliases: ['falso'] }],
      },
      {
        id: 'abb-lista3-eh-abb-03-s4',
        kind: 'complexidade',
        prompt: 'Por que a verificacao sem vetor continua linear?',
        options: [
          { id: 'a', label: 'Porque cada no e visitado uma vez carregando limites min/max.' },
          { id: 'b', label: 'Porque a ABB sempre tem altura logaritmica.' },
          { id: 'c', label: 'Porque basta olhar a raiz e seus dois filhos.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'A validacao visita todos os nos uma vez e passa limites de faixa por parametro.',
    },
    commonMistakes: [
      {
        id: 'abb-local-sem-limite',
        title: 'Conferir apenas pai e filho',
        description: 'Comparar somente com o pai nao detecta valores fora da faixa herdada pelos ancestrais.',
      },
    ],
  },
  {
    id: 'avl-lista3-recalcular-alturas-10',
    title: 'Recalcular alturas em AVL',
    pattern: 'retornar-de-baixo-para-cima',
    structure: 'avl',
    difficulty: 'medio',
    statement:
      'Questao 10 da lista: percorra uma AVL e atualize o campo altura de cada no. Folha deve ficar com altura 0 e arvore vazia com -1.',
    providedCode: `class NoAVL {
  int elemento;
  NoAVL esq, dir;
  int altura;
}

class ArvoreAVL {
  private NoAVL raiz;

  void recalcularAlturas() {
    recalcularAlturas(raiz);
  }

  private int recalcularAlturas(NoAVL i) {
    // complete retornando a nova altura
  }
}`,
    visualStateId: 'avl-rotacao-01',
    focus: 'codigo',
    source: prova3Source('Questao 10'),
    steps: [
      {
        id: 'avl-lista3-recalcular-alturas-10-s1',
        kind: 'interpretar',
        prompt: 'Qual ordem garante que a altura dos filhos ja foi calculada?',
        options: [
          { id: 'a', label: 'Pos-ordem: esquerda, direita, no atual.' },
          { id: 'b', label: 'Pre-ordem: no atual, esquerda, direita.' },
          { id: 'c', label: 'Apenas percorrer pela direita.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'avl-lista3-recalcular-alturas-10-s2',
        kind: 'lacuna',
        prompt: 'Complete o caso base: if (i == null) return ___.',
        gapId: 'altura-nulo',
        answers: [{ id: 'menos-um', answer: '-1', aliases: ['menos 1'] }],
      },
      {
        id: 'avl-lista3-recalcular-alturas-10-s3',
        kind: 'blocos',
        prompt: 'Ordene o nucleo do metodo privado.',
        blocks: [
          { id: 'esq', label: 'int he = recalcularAlturas(i.esq);', order: 1 },
          { id: 'dir', label: 'int hd = recalcularAlturas(i.dir);', order: 2 },
          { id: 'atribui', label: 'i.altura = 1 + Math.max(he, hd);', order: 3 },
          { id: 'retorna', label: 'return i.altura;', order: 4 },
        ],
        correctOrder: ['esq', 'dir', 'atribui', 'retorna'],
      },
      {
        id: 'avl-lista3-recalcular-alturas-10-s4',
        kind: 'complexidade',
        prompt: 'Qual e o custo para recalcular todas as alturas?',
        options: [
          { id: 'a', label: 'O(n), pois todos os nos precisam ser atualizados.' },
          { id: 'b', label: 'O(log n), pois AVL e balanceada.' },
          { id: 'c', label: 'O(1), pois altura ja esta no no.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'Mesmo balanceada, a rotina recalcula o campo de todos os nos exatamente uma vez.',
    },
    commonMistakes: [
      {
        id: 'avl-altura-antes-dos-filhos',
        title: 'Atualizar antes dos filhos',
        description: 'A altura do no depende das alturas finais das duas subarvores.',
      },
    ],
  },
  {
    id: 'alvinegra-lista3-verifica-cores-13',
    title: 'Implementar verificacao de cores',
    pattern: 'verificar-propriedade-global',
    structure: 'alvinegra',
    difficulty: 'dificil',
    statement:
      'Questao 13 da lista: implemente verificaCores() para garantir que no vermelho nao tem filho vermelho e que todos os caminhos mantem a mesma quantidade de nos pretos.',
    providedCode: `class NoAN {
  boolean cor; // true = preto, false = vermelho
  int elemento;
  NoAN esq, dir;
}

class ArvoreAlvinegra {
  private NoAN raiz;

  boolean verificaCores() {
    return alturaPretaOuErro(raiz) >= 0;
  }

  private int alturaPretaOuErro(NoAN i) {
    // retorne -1 quando encontrar violacao
  }
}`,
    visualStateId: 'alvinegra-brancos-01',
    focus: 'codigo',
    source: prova3Source('Questao 13'),
    steps: [
      {
        id: 'alvinegra-lista3-verifica-cores-13-s1',
        kind: 'interpretar',
        prompt: 'Qual retorno ajuda a propagar erro sem variavel global?',
        options: [
          { id: 'a', label: '-1 para violacao, altura preta para caso valido.' },
          { id: 'b', label: '0 para todo no visitado.' },
          { id: 'c', label: 'O elemento do no atual.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'alvinegra-lista3-verifica-cores-13-s2',
        kind: 'lacuna',
        prompt: 'Complete a checagem local: se i e vermelho e algum filho vermelho, retorne ___.',
        gapId: 'erro-vermelho',
        answers: [{ id: 'erro', answer: '-1' }],
      },
      {
        id: 'alvinegra-lista3-verifica-cores-13-s3',
        kind: 'blocos',
        prompt: 'Ordene a validacao de altura preta.',
        blocks: [
          { id: 'esq', label: 'int e = alturaPretaOuErro(i.esq);', order: 1 },
          { id: 'dir', label: 'int d = alturaPretaOuErro(i.dir);', order: 2 },
          { id: 'compara', label: 'se e < 0 || d < 0 || e != d, retorne -1', order: 3 },
          { id: 'soma', label: 'retorne e + (i.cor ? 1 : 0)', order: 4 },
        ],
        correctOrder: ['esq', 'dir', 'compara', 'soma'],
      },
      {
        id: 'alvinegra-lista3-verifica-cores-13-s4',
        kind: 'complexidade',
        prompt: 'Qual e o custo da verificacao completa?',
        options: [
          { id: 'a', label: 'O(n), visitando cada no uma vez.' },
          { id: 'b', label: 'O(log n), apenas pelo caminho da busca.' },
          { id: 'c', label: 'O(n log n), recalculando altura a cada no.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'A rotina combina validacao local e altura preta em uma unica travessia pos-ordem.',
    },
    commonMistakes: [
      {
        id: 'alvinegra-contar-por-caminho-separado',
        title: 'Recontar caminhos muitas vezes',
        description: 'Recalcular a quantidade de pretos para cada no pode transformar a solucao em custo maior.',
      },
    ],
  },
  {
    id: 'hash-lista3-reserva-27',
    title: 'Codificar hash com reserva AVL',
    pattern: 'navegar-por-camadas',
    structure: 'hash',
    difficulty: 'dificil',
    statement:
      'Questao 27 da lista: implemente inserir, pesquisar, remover e mostrar em uma hash T1 com lista T2, onde cada celula de T2 possui uma AVL para colisoes.',
    providedCode: `class Celula {
  int indice;
  ArvoreAVL reserva;
  Celula prox;
}

class EstruturaAVLHash {
  int[] T1;
  Celula inicioT2;

  void inserir(int x) {
    int pos = hash(x);
    // se T1[pos] estiver livre, insira em T1
    // caso contrario, use rehash(x) para escolher a celula de T2
  }
}`,
    visualStateId: 'hash-reserva-01',
    focus: 'codigo',
    source: prova3Source('Questao 27'),
    steps: [
      {
        id: 'hash-lista3-reserva-27-s1',
        kind: 'interpretar',
        prompt: 'Quando uma chave deve ir para a AVL dentro de T2?',
        options: [
          { id: 'a', label: 'Quando a posicao hash em T1 ja esta ocupada.' },
          { id: 'b', label: 'Quando a chave e menor que a raiz da AVL.' },
          { id: 'c', label: 'Quando T1 esta completamente vazia.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'hash-lista3-reserva-27-s2',
        kind: 'lacuna',
        prompt: 'Complete a primeira linha da insercao: int pos = ___(x);',
        gapId: 'hash-principal',
        answers: [{ id: 'hash', answer: 'hash', aliases: ['hash(int)'] }],
      },
      {
        id: 'hash-lista3-reserva-27-s3',
        kind: 'blocos',
        prompt: 'Ordene a logica de pesquisar(x).',
        blocks: [
          { id: 'pos', label: 'calcular pos = hash(x)', order: 1 },
          { id: 't1', label: 'se T1[pos] == x, retorne true', order: 2 },
          { id: 'reserva', label: 'localizar celula rehash(x) na lista T2', order: 3 },
          { id: 'avl', label: 'pesquisar x na AVL da celula', order: 4 },
        ],
        correctOrder: ['pos', 't1', 'reserva', 'avl'],
      },
      {
        id: 'hash-lista3-reserva-27-s4',
        kind: 'complexidade',
        prompt: 'Com poucas colisoes e AVL balanceada, como fica a busca?',
        options: [
          { id: 'a', label: 'O(1) esperado em T1, mais O(log c) se cair na reserva.' },
          { id: 'b', label: 'O(n) sempre, porque hash nao ajuda.' },
          { id: 'c', label: 'O(log m) sempre, por causa do tamanho da tabela.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(1) esperado em T1; O(log c) na AVL de reserva',
      explanation: 'A tabela tenta acesso direto; colisoes ficam agrupadas em arvores balanceadas por celula.',
    },
    commonMistakes: [
      {
        id: 'hash-reserva-ignorar-rehash',
        title: 'Jogar toda colisao na mesma reserva',
        description: 'Sem rehash ou indice de reserva, a T2 perde distribuicao e concentra colisoes.',
      },
    ],
  },
  {
    id: 'trie-lista3-inserir-palavra-18',
    title: 'Implementar insercao em TRIE',
    pattern: 'seguir-um-caminho',
    structure: 'trie',
    difficulty: 'medio',
    statement:
      'Questao 18 da lista: implemente inserir(String s) criando nos quando necessario e marcando fim no ultimo caractere.',
    providedCode: `class NoTrie {
  NoTrie[] filho = new NoTrie[26];
  boolean fim;
}

class ArvoreTrie {
  private NoTrie raiz = new NoTrie();

  void inserir(String s) {
    NoTrie atual = raiz;
    // percorra os caracteres de s
  }
}`,
    visualStateId: 'trie-stop-sapo-01',
    focus: 'codigo',
    source: prova3Source('Questao 18'),
    steps: [
      {
        id: 'trie-lista3-inserir-palavra-18-s1',
        kind: 'interpretar',
        prompt: 'Como transformar um caractere minusculo em indice 0..25?',
        options: [
          { id: 'a', label: "int idx = s.charAt(i) - 'a';" },
          { id: 'b', label: 'int idx = s.length();' },
          { id: 'c', label: 'int idx = raiz.fim ? 1 : 0;' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'trie-lista3-inserir-palavra-18-s2',
        kind: 'blocos',
        prompt: 'Ordene o corpo do for de insercao.',
        blocks: [
          { id: 'indice', label: "int idx = s.charAt(i) - 'a';", order: 1 },
          { id: 'criar', label: 'se atual.filho[idx] == null, crie novo NoTrie', order: 2 },
          { id: 'descer', label: 'atual = atual.filho[idx];', order: 3 },
        ],
        correctOrder: ['indice', 'criar', 'descer'],
      },
      {
        id: 'trie-lista3-inserir-palavra-18-s3',
        kind: 'lacuna',
        prompt: 'Depois do laco, complete: atual.___ = true;',
        gapId: 'marca-palavra',
        answers: [{ id: 'fim', answer: 'fim' }],
      },
      {
        id: 'trie-lista3-inserir-palavra-18-s4',
        kind: 'complexidade',
        prompt: 'Qual e a complexidade em funcao de |s|?',
        options: [
          { id: 'a', label: 'O(|s|), um passo por caractere.' },
          { id: 'b', label: 'O(26^|s|), pois ha 26 filhos.' },
          { id: 'c', label: 'O(n), onde n e sempre a tabela inteira.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(|s|)',
      explanation: 'A insercao percorre os caracteres da palavra uma unica vez.',
    },
    commonMistakes: [
      {
        id: 'trie-nao-marcar-fim',
        title: 'Criar caminho sem marcar fim',
        description: 'Sem fim = true no ultimo no, pesquisar palavra exata nao reconhece a palavra inserida.',
      },
    ],
  },
  {
    id: 'binaria-lista3-estritamente-binaria-05',
    title: 'Escolher arvore estritamente binaria',
    pattern: 'verificar-propriedade-global',
    structure: 'binaria',
    difficulty: 'facil',
    statement:
      'Questao 5 da lista: uma arvore binaria e estritamente binaria se todo no possui 0 ou 2 filhos. Escolha o desenho correto e complete a verificacao.',
    providedCode: `class No {
  int elemento;
  No esq, dir;
}

class Arvore {
  private No raiz;

  boolean ehEstritamenteBinaria() {
    return ehEstritamenteBinaria(raiz);
  }

  private boolean ehEstritamenteBinaria(No i) {
    // nenhum no pode ter apenas um filho
  }
}`,
    visualStateId: 'binaria-ismax-01',
    focus: 'desenho',
    source: prova3Source('Questao 5'),
    steps: [
      {
        id: 'binaria-lista3-estritamente-binaria-05-s1',
        kind: 'interpretar',
        prompt: 'Qual desenho e estritamente binario?',
        options: [
          { id: 'a', label: 'Desenho A', visualStateId: 'binaria-estrita-01' },
          { id: 'b', label: 'Desenho B', visualStateId: 'binaria-ismax-01' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'binaria-lista3-estritamente-binaria-05-s2',
        kind: 'clique',
        prompt: 'No desenho principal, clique em um no que quebra a regra por ter apenas um filho.',
        targetNodeIds: ['n6'],
        maxClicks: 1,
      },
      {
        id: 'binaria-lista3-estritamente-binaria-05-s3',
        kind: 'lacuna',
        prompt: 'Complete a verificacao de folha: if (i.esq == null && i.dir == null) return ___.',
        gapId: 'folha-estrita',
        answers: [{ id: 'true', answer: 'true', aliases: ['verdadeiro'] }],
      },
      {
        id: 'binaria-lista3-estritamente-binaria-05-s4',
        kind: 'complexidade',
        prompt: 'Por que o metodo percorre toda a arvore no pior caso?',
        options: [
          { id: 'a', label: 'Porque a violacao pode estar em qualquer no.' },
          { id: 'b', label: 'Porque somente a raiz importa.' },
          { id: 'c', label: 'Porque uma arvore binaria sempre e ABB.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'No pior caso, todos os nos precisam ser conferidos ate provar que nenhum tem um unico filho.',
    },
    commonMistakes: [
      {
        id: 'binaria-estrita-confundir-com-cheia',
        title: 'Confundir estrita com completa',
        description: 'Estritamente binaria fala da quantidade de filhos por no, nao de preencher todos os niveis.',
      },
    ],
  },
  {
    id: 'arv234-lista3-folhas-mesma-altura-12',
    title: 'Escolher folhas no mesmo nivel',
    pattern: 'verificar-propriedade-global',
    structure: 'arv234',
    difficulty: 'medio',
    statement:
      'Questao 12 da lista: verifique se todas as folhas de uma 2-3-4 estao na mesma altura, uma propriedade essencial da estrutura.',
    providedCode: `class No234 {
  int qtdChaves;
  int chave1, chave2, chave3;
  No234 f0, f1, f2, f3;
}

class Arvore234 {
  No234 raiz;

  boolean folhasMesmaAltura() {
    // descubra a altura da primeira folha
    // e compare as demais folhas
  }
}`,
    visualStateId: 'arv234-folhas-desiguais-01',
    focus: 'desenho',
    source: prova3Source('Questao 12'),
    steps: [
      {
        id: 'arv234-lista3-folhas-mesma-altura-12-s1',
        kind: 'interpretar',
        prompt: 'Qual desenho representa folhas no mesmo nivel?',
        options: [
          { id: 'a', label: 'Desenho A', visualStateId: 'arv234-folhas-mesmo-nivel-01' },
          { id: 'b', label: 'Desenho B', visualStateId: 'arv234-folhas-desiguais-01' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'arv234-lista3-folhas-mesma-altura-12-s2',
        kind: 'clique',
        prompt: 'No desenho principal, clique em uma folha que esta em profundidade diferente.',
        targetNodeIds: ['n30'],
        maxClicks: 1,
      },
      {
        id: 'arv234-lista3-folhas-mesma-altura-12-s3',
        kind: 'blocos',
        prompt: 'Ordene a estrategia recursiva.',
        blocks: [
          { id: 'folha', label: 'ao achar a primeira folha, guarde a profundidade esperada', order: 1 },
          { id: 'filhos', label: 'percorra somente os filhos validos do no 2-3-4', order: 2 },
          { id: 'compara', label: 'para cada outra folha, compare com a profundidade esperada', order: 3 },
        ],
        correctOrder: ['folha', 'filhos', 'compara'],
      },
      {
        id: 'arv234-lista3-folhas-mesma-altura-12-s4',
        kind: 'complexidade',
        prompt: 'Qual e o custo no pior caso?',
        options: [
          { id: 'a', label: 'O(n), pois todos os nos podem precisar ser visitados.' },
          { id: 'b', label: 'O(1), pois basta a raiz.' },
          { id: 'c', label: 'O(log n) sempre, sem visitar folhas.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'A verificacao precisa encontrar folhas e comparar profundidades ao longo da arvore.',
    },
    commonMistakes: [
      {
        id: 'arv234-comparar-so-dois-lados',
        title: 'Ignorar filhos intermediarios',
        description: 'Em uma 2-3-4, o no pode ter mais de dois filhos validos; todos entram na verificacao.',
      },
    ],
  },
  {
    id: 'doidona-lista3-par-impar-38',
    title: 'Codificar paridade em estrutura hibrida',
    pattern: 'navegar-por-camadas',
    structure: 'doidona',
    difficulty: 'medio',
    statement:
      'Questao 38 da lista: chaves pares vao para uma AVL e chaves impares vao para uma TRIE usando a representacao decimal como string.',
    providedCode: `class EstruturaParImpar {
  private ArvoreAVL arvorePares;
  private ArvoreTrie trieImpares;

  void inserir(int x) {
    if (/* par */) {
      arvorePares.inserir(x);
    } else {
      trieImpares.inserir(String.valueOf(x));
    }
  }

  boolean pesquisar(int x) {
    // escolha a estrutura pela paridade
  }
}`,
    visualStateId: 'doidona-camadas-01',
    focus: 'codigo',
    source: prova3Source('Questao 38'),
    steps: [
      {
        id: 'doidona-lista3-par-impar-38-s1',
        kind: 'interpretar',
        prompt: 'Para onde vai a chave 42?',
        options: [
          { id: 'a', label: 'Para arvorePares, pois 42 e par.' },
          { id: 'b', label: 'Para trieImpares, pois tem dois digitos.' },
          { id: 'c', label: 'Para as duas estruturas.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'doidona-lista3-par-impar-38-s2',
        kind: 'lacuna',
        prompt: 'Complete a condicao de paridade: if (x ___ 2 == 0).',
        gapId: 'mod-par',
        answers: [{ id: 'mod', answer: '%', aliases: ['mod'] }],
      },
      {
        id: 'doidona-lista3-par-impar-38-s3',
        kind: 'blocos',
        prompt: 'Ordene pesquisar(int x).',
        blocks: [
          { id: 'par', label: 'se x % 2 == 0', order: 1 },
          { id: 'avl', label: 'retorne arvorePares.pesquisar(x)', order: 2 },
          { id: 'trie', label: 'caso contrario, pesquise String.valueOf(x) na TRIE', order: 3 },
        ],
        correctOrder: ['par', 'avl', 'trie'],
      },
      {
        id: 'doidona-lista3-par-impar-38-s4',
        kind: 'complexidade',
        prompt: 'Como analisar a busca?',
        options: [
          { id: 'a', label: 'Pares custam O(hAVL); impares custam O(digitos).' },
          { id: 'b', label: 'Tudo custa O(1), pois so testa paridade.' },
          { id: 'c', label: 'Tudo custa O(n), sempre percorre as duas estruturas.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(hAVL) para pares; O(d) para impares',
      explanation: 'A paridade decide a estrutura; d e a quantidade de digitos da chave convertida para string.',
    },
    commonMistakes: [
      {
        id: 'doidona-par-impar-pesquisar-duas',
        title: 'Pesquisar nas duas estruturas',
        description: 'A regra de paridade ja determina onde a chave deve estar.',
      },
    ],
  },
  {
    id: 'doidona-lista3-hash-abb-25',
    title: 'Codificar doidona hash mais ABB',
    pattern: 'navegar-por-camadas',
    structure: 'doidona',
    difficulty: 'dificil',
    statement:
      'Questao 25 da lista: use T1 como area principal e T2 como lista de celulas, cada uma com uma ABB de inteiros para colisoes.',
    providedCode: `class NoABB {
  int elemento;
  NoABB esq, dir;
}

class Celula {
  int indice;
  NoABB raiz;
  Celula prox;
}

class EstruturaDoidona {
  private T1 t1;
  private T2 t2;

  boolean pesquisar(int x) {
    // olhe T1 primeiro; se colidiu, procure na ABB da celula em T2
  }
}`,
    visualStateId: 'doidona-camadas-01',
    focus: 'codigo',
    source: prova3Source('Questao 25'),
    steps: [
      {
        id: 'doidona-lista3-hash-abb-25-s1',
        kind: 'interpretar',
        prompt: 'O que deve acontecer quando T1[hash(x)] ja esta ocupada?',
        options: [
          { id: 'a', label: 'Enviar x para a ABB dentro da celula correta em T2.' },
          { id: 'b', label: 'Descartar x para manter T1 simples.' },
          { id: 'c', label: 'Trocar o valor antigo por x sem guardar colisao.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'doidona-lista3-hash-abb-25-s2',
        kind: 'blocos',
        prompt: 'Ordene a insercao com colisao.',
        blocks: [
          { id: 'hash', label: 'calcular pos = hash(x)', order: 1 },
          { id: 't1-livre', label: 'se T1[pos] livre, inserir em T1', order: 2 },
          { id: 'rehash', label: 'se ocupada, calcular indiceReserva = rehash(x)', order: 3 },
          { id: 'abb', label: 'inserir x na ABB da celula de T2', order: 4 },
        ],
        correctOrder: ['hash', 't1-livre', 'rehash', 'abb'],
      },
      {
        id: 'doidona-lista3-hash-abb-25-s3',
        kind: 'lacuna',
        prompt: 'Complete a busca secundaria: return pesquisarABB(celula.___, x);',
        gapId: 'raiz-abb-reserva',
        answers: [{ id: 'raiz', answer: 'raiz' }],
      },
      {
        id: 'doidona-lista3-hash-abb-25-s4',
        kind: 'complexidade',
        prompt: 'Qual analise descreve melhor o pior caso da reserva?',
        options: [
          { id: 'a', label: 'Pode chegar a O(h) na ABB da celula, e h pode ser linear.' },
          { id: 'b', label: 'Sempre O(1), mesmo com colisao.' },
          { id: 'c', label: 'Sempre O(log n), pois qualquer ABB e balanceada.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(1) esperado em T1; O(h) na ABB de reserva',
      explanation: 'A area principal e direta, mas a ABB de colisao depende da altura h da arvore daquela celula.',
    },
    commonMistakes: [
      {
        id: 'doidona-abb-assumir-balanceada',
        title: 'Assumir ABB balanceada sem garantia',
        description: 'A questao usa ABB simples na reserva; sem AVL, h pode crescer ate a quantidade de colisoes.',
      },
    ],
  },
  {
    id: 'patricia-lista3-eh-patricia-24',
    title: 'Escolher desenho PATRICIA valido',
    pattern: 'verificar-propriedade-global',
    structure: 'patricia',
    difficulty: 'medio',
    statement:
      'Questao 24 da lista: uma TRIE compactada e PATRICIA valida quando nao ha no interno com rotulo vazio nem no interno com apenas um filho.',
    providedCode: `class NoPatricia {
  String rotulo;
  NoPatricia[] filhos;
  boolean fim;
}

class ArvorePatricia {
  private NoPatricia raiz;

  boolean ehPatricia() {
    return ehPatricia(raiz, true);
  }
}`,
    visualStateId: 'patricia-bit-01',
    focus: 'desenho',
    source: prova3Source('Questao 24'),
    steps: [
      {
        id: 'patricia-lista3-eh-patricia-24-s1',
        kind: 'interpretar',
        prompt: 'Qual desenho completa uma PATRICIA valida?',
        options: [
          { id: 'a', label: 'Desenho A', visualStateId: 'patricia-bit-01' },
          { id: 'b', label: 'Desenho B', visualStateId: 'patricia-invalida-um-filho-01' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'patricia-lista3-eh-patricia-24-s2',
        kind: 'simular',
        prompt: 'No desenho, por que bit4 deve continuar existindo?',
        options: [
          { id: 'a', label: 'Porque separa ASA de ATO em um ponto de decisao real.' },
          { id: 'b', label: 'Porque todo caractere precisa de um nivel proprio.' },
          { id: 'c', label: 'Porque PATRICIA nao tem folhas.' },
        ],
        correctOptionId: 'a',
        activePath: ['bit2', 'bit4'],
      },
      {
        id: 'patricia-lista3-eh-patricia-24-s3',
        kind: 'lacuna',
        prompt: 'Complete: um no interno com apenas ___ filho deve invalidar a PATRICIA.',
        gapId: 'filho-unico',
        answers: [{ id: 'um', answer: 'um', aliases: ['1'] }],
      },
      {
        id: 'patricia-lista3-eh-patricia-24-s4',
        kind: 'complexidade',
        prompt: 'Qual e o custo de validar todos os nos da PATRICIA?',
        options: [
          { id: 'a', label: 'O(n), visitando cada no uma vez.' },
          { id: 'b', label: 'O(1), pois so olha a raiz.' },
          { id: 'c', label: 'O(k) apenas no tamanho de uma palavra buscada.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'A validacao precisa percorrer todos os nos para achar rotulos vazios ou internos com um unico filho.',
    },
    commonMistakes: [
      {
        id: 'patricia-conceito-um-filho',
        title: 'Aceitar no interno com um filho',
        description: 'Esse caso mostra que o caminho ainda poderia ser compactado.',
      },
    ],
  },
  {
    id: 'lista-flexivel-remover-posicao-01',
    title: 'Remover por posicao na lista simples',
    pattern: 'seguir-um-caminho',
    structure: 'lista',
    difficulty: 'medio',
    statement:
      'Nos slides de lista flexivel, a classe Lista usa uma celula cabeca chamada primeiro e um ponteiro ultimo. Complete remover(int pos) para retirar a celula da posicao indicada, religando os ponteiros corretamente.',
    providedCode: `class Celula {
  int elemento;
  Celula prox;
}

class Lista {
  private Celula primeiro, ultimo;

  int remover(int pos) throws Exception {
    // considere pos valida e primeira posicao igual a 0
  }
}`,
    visualStateId: 'lista-simples-01',
    focus: 'codigo',
    source: courseSource('u04d_tadFlexivel_listasimples.pdf'),
    steps: [
      {
        id: 'lista-flexivel-remover-posicao-01-s1',
        kind: 'interpretar',
        prompt: 'Para remover a posicao 1, em qual celula o ponteiro auxiliar deve parar antes de religar?',
        options: [
          { id: 'a', label: 'Na celula anterior a removida, com elemento 10.' },
          { id: 'b', label: 'Na propria celula removida, com elemento 20.' },
          { id: 'c', label: 'Sempre na celula cabeca, independente da posicao.' },
        ],
        correctOptionId: 'a',
        activeNodeId: 'c10',
      },
      {
        id: 'lista-flexivel-remover-posicao-01-s2',
        kind: 'simular',
        prompt: 'Depois de remover 20 da lista 10 -> 20 -> 30, qual ligacao deve existir?',
        options: [
          { id: 'a', label: '10.prox aponta para 30.' },
          { id: 'b', label: '30.prox aponta para 10.' },
          { id: 'c', label: 'primeiro.prox aponta para null.' },
        ],
        correctOptionId: 'a',
        activePath: ['c10', 'c20', 'c30'],
      },
      {
        id: 'lista-flexivel-remover-posicao-01-s3',
        kind: 'blocos',
        prompt: 'Ordene o nucleo de remover(pos).',
        blocks: [
          { id: 'andar', label: 'andar com i ate a celula anterior a pos', order: 1 },
          { id: 'guardar', label: 'guardar tmp = i.prox', order: 2 },
          { id: 'religar', label: 'fazer i.prox = tmp.prox', order: 3 },
          { id: 'ultimo', label: 'se tmp == ultimo, atualizar ultimo = i', order: 4 },
          { id: 'retornar', label: 'retornar tmp.elemento', order: 5 },
        ],
        correctOrder: ['andar', 'guardar', 'religar', 'ultimo', 'retornar'],
      },
      {
        id: 'lista-flexivel-remover-posicao-01-s4',
        kind: 'complexidade',
        prompt: 'Qual e o custo de remover em uma posicao arbitraria de lista simples?',
        options: [
          { id: 'a', label: 'O(n), pois pode ser necessario caminhar ate a posicao.' },
          { id: 'b', label: 'O(1), pois toda remocao conhece o anterior.' },
          { id: 'c', label: 'O(log n), pois a lista fica ordenada.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'A remocao em posicao exige percorrer a lista ate a celula anterior, no pior caso proximo ao fim.',
    },
    commonMistakes: [
      {
        id: 'lista-remover-perder-resto',
        title: 'Perder o resto da lista',
        description: 'Se tmp.prox nao for preservado antes da religacao, as celulas seguintes podem ficar inacessiveis.',
      },
    ],
  },
  {
    id: 'lista-desenho-inserir-inicio-01',
    title: 'Escolher desenho do inserirInicio',
    pattern: 'verificar-propriedade-global',
    structure: 'lista',
    difficulty: 'facil',
    statement:
      'A partir de uma lista simples com celula cabeca, escolha o desenho correto depois de executar inserirInicio(5). A nova celula deve entrar logo depois de primeiro.',
    providedCode: `void inserirInicio(int x) {
  Celula tmp = new Celula(x);
  tmp.prox = primeiro.prox;
  primeiro.prox = tmp;
  if (primeiro == ultimo) ultimo = tmp;
}`,
    visualStateId: 'lista-simples-01',
    focus: 'desenho',
    source: courseSource('u04d_tadFlexivel_listasimples.pdf'),
    steps: [
      {
        id: 'lista-desenho-inserir-inicio-01-s1',
        kind: 'interpretar',
        prompt: 'Qual desenho representa a lista apos inserir 5 no inicio?',
        options: [
          { id: 'a', label: 'Desenho A', visualStateId: 'lista-inserir-inicio-correto-01' },
          { id: 'b', label: 'Desenho B', visualStateId: 'lista-inserir-inicio-errado-01' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'lista-desenho-inserir-inicio-01-s2',
        kind: 'simular',
        prompt: 'Qual ponteiro precisa ser ajustado primeiro para nao perder a lista antiga?',
        options: [
          { id: 'a', label: 'tmp.prox = primeiro.prox' },
          { id: 'b', label: 'primeiro.prox = null' },
          { id: 'c', label: 'ultimo.prox = tmp' },
        ],
        correctOptionId: 'a',
        activePath: ['cabeca', 'c5', 'c10'],
      },
      {
        id: 'lista-desenho-inserir-inicio-01-s3',
        kind: 'lacuna',
        prompt: 'Complete a segunda religacao: primeiro.___ = tmp.',
        gapId: 'primeiro-prox',
        answers: [{ id: 'prox', answer: 'prox' }],
      },
      {
        id: 'lista-desenho-inserir-inicio-01-s4',
        kind: 'complexidade',
        prompt: 'Qual e o custo de inserir no inicio com celula cabeca?',
        options: [
          { id: 'a', label: 'O(1), pois nao percorre a lista.' },
          { id: 'b', label: 'O(n), pois precisa achar o ultimo.' },
          { id: 'c', label: 'O(log n), pois divide a lista.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(1)',
      explanation: 'A operacao mexe apenas em primeiro.prox, tmp.prox e possivelmente ultimo.',
    },
    commonMistakes: [
      {
        id: 'lista-inicio-celula-solta',
        title: 'Deixar a nova celula solta',
        description: 'Criar tmp sem apontar primeiro.prox para ela nao insere a celula na lista.',
      },
    ],
  },
  {
    id: 'lista-sequencial-pesquisar-01',
    title: 'Pesquisar em lista sequencial',
    pattern: 'percorrer-todos-os-nos',
    structure: 'lista',
    difficulty: 'facil',
    statement:
      'Nos slides de TAD Lista, a implementacao sequencial guarda os elementos em um array e controla o tamanho com n. Defina pesquisar(int x) retornando verdadeiro quando x estiver na lista.',
    providedCode: `class Lista {
  private int[] array;
  private int n;

  boolean pesquisar(int x) {
    // complete
  }
}`,
    visualStateId: 'lista-simples-01',
    focus: 'codigo',
    source: courseSource('u02a_tadLinear_lista.pdf'),
    steps: [
      {
        id: 'lista-sequencial-pesquisar-01-s1',
        kind: 'interpretar',
        prompt: 'Qual limite do laco evita ler posicoes fora da lista usada?',
        options: [
          { id: 'a', label: 'i < n' },
          { id: 'b', label: 'i <= array.length' },
          { id: 'c', label: 'i < x' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'lista-sequencial-pesquisar-01-s2',
        kind: 'lacuna',
        prompt: 'Complete a comparacao principal: if (array[i] ___ x) return true;',
        gapId: 'igualdade-array',
        answers: [{ id: 'eq', answer: '==', aliases: ['igual'] }],
      },
      {
        id: 'lista-sequencial-pesquisar-01-s3',
        kind: 'blocos',
        prompt: 'Ordene a funcao pesquisar.',
        blocks: [
          { id: 'for', label: 'percorrer i de 0 ate n-1', order: 1 },
          { id: 'if', label: 'se array[i] == x, retornar true', order: 2 },
          { id: 'false', label: 'ao fim do laco, retornar false', order: 3 },
        ],
        correctOrder: ['for', 'if', 'false'],
      },
      {
        id: 'lista-sequencial-pesquisar-01-s4',
        kind: 'complexidade',
        prompt: 'No pior caso, quantos elementos podem ser comparados?',
        options: [
          { id: 'a', label: 'n elementos.' },
          { id: 'b', label: 'Apenas o primeiro.' },
          { id: 'c', label: 'log2(n) elementos.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'Se x nao estiver na lista ou estiver no fim, todos os n elementos usados sao testados.',
    },
    commonMistakes: [
      {
        id: 'lista-sequencial-array-length',
        title: 'Usar array.length como tamanho logico',
        description: 'array.length e a capacidade; n e a quantidade real de elementos inseridos.',
      },
    ],
  },
  {
    id: 'pilha-flexivel-pop-01',
    title: 'Remover do topo da pilha',
    pattern: 'seguir-um-caminho',
    structure: 'pilha',
    difficulty: 'facil',
    statement:
      'Nos slides de Pilha flexivel, a classe guarda apenas o ponteiro topo. Complete remover() para desempilhar o elemento do topo e avancar o ponteiro.',
    providedCode: `class Celula {
  int elemento;
  Celula prox;
}

class Pilha {
  private Celula topo;

  int remover() throws Exception {
    // complete
  }
}`,
    visualStateId: 'pilha-flexivel-01',
    focus: 'codigo',
    source: courseSource('u04b_tadFlexivel_pilha.pdf'),
    steps: [
      {
        id: 'pilha-flexivel-pop-01-s1',
        kind: 'interpretar',
        prompt: 'Qual elemento sai primeiro na pilha exibida?',
        options: [
          { id: 'a', label: '30, pois esta no topo.' },
          { id: 'b', label: '10, pois entrou primeiro.' },
          { id: 'c', label: '20, pois esta no meio.' },
        ],
        correctOptionId: 'a',
        activeNodeId: 'topo',
      },
      {
        id: 'pilha-flexivel-pop-01-s2',
        kind: 'lacuna',
        prompt: 'Complete a atualizacao: topo = topo.___;',
        gapId: 'topo-prox',
        answers: [{ id: 'prox', answer: 'prox' }],
      },
      {
        id: 'pilha-flexivel-pop-01-s3',
        kind: 'blocos',
        prompt: 'Ordene o remover da pilha.',
        blocks: [
          { id: 'vazia', label: 'se topo == null, lancar excecao', order: 1 },
          { id: 'guardar', label: 'guardar resp = topo.elemento', order: 2 },
          { id: 'avancar', label: 'atualizar topo = topo.prox', order: 3 },
          { id: 'return', label: 'retornar resp', order: 4 },
        ],
        correctOrder: ['vazia', 'guardar', 'avancar', 'return'],
      },
      {
        id: 'pilha-flexivel-pop-01-s4',
        kind: 'complexidade',
        prompt: 'Qual e a complexidade de push/pop em pilha flexivel com ponteiro topo?',
        options: [
          { id: 'a', label: 'O(1), pois mexe so no topo.' },
          { id: 'b', label: 'O(n), pois precisa percorrer ate a base.' },
          { id: 'c', label: 'O(log n), pois usa divisao.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(1)',
      explanation: 'A remocao da pilha acessa e altera apenas a primeira celula apontada por topo.',
    },
    commonMistakes: [
      {
        id: 'pilha-pop-remover-base',
        title: 'Remover pela base',
        description: 'Isso transforma a operacao em fila e quebra o comportamento LIFO da pilha.',
      },
    ],
  },
  {
    id: 'pilha-desenho-push-01',
    title: 'Escolher desenho do push',
    pattern: 'verificar-propriedade-global',
    structure: 'pilha',
    difficulty: 'facil',
    statement:
      'Depois de executar inserir(40) em uma pilha flexivel, a nova celula precisa virar topo e apontar para o antigo topo.',
    providedCode: `void inserir(int x) {
  Celula tmp = new Celula(x);
  tmp.prox = topo;
  topo = tmp;
}`,
    visualStateId: 'pilha-flexivel-01',
    focus: 'desenho',
    source: courseSource('u04b_tadFlexivel_pilha.pdf'),
    steps: [
      {
        id: 'pilha-desenho-push-01-s1',
        kind: 'interpretar',
        prompt: 'Qual desenho representa corretamente o push de 40?',
        options: [
          { id: 'a', label: 'Desenho A', visualStateId: 'pilha-push-correto-01' },
          { id: 'b', label: 'Desenho B', visualStateId: 'pilha-push-errado-01' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'pilha-desenho-push-01-s2',
        kind: 'simular',
        prompt: 'Depois do push, qual elemento deve ser removido por pop?',
        options: [
          { id: 'a', label: '40' },
          { id: 'b', label: '30' },
          { id: 'c', label: '10' },
        ],
        correctOptionId: 'a',
        activeNodeId: 'topo',
      },
      {
        id: 'pilha-desenho-push-01-s3',
        kind: 'lacuna',
        prompt: 'Complete a primeira ligacao: tmp.prox = ___;',
        gapId: 'topo-antigo',
        answers: [{ id: 'topo', answer: 'topo' }],
      },
      {
        id: 'pilha-desenho-push-01-s4',
        kind: 'complexidade',
        prompt: 'Por que o push nao depende do tamanho da pilha?',
        options: [
          { id: 'a', label: 'Porque so cria a celula e troca o ponteiro topo.' },
          { id: 'b', label: 'Porque percorre ate achar o ultimo.' },
          { id: 'c', label: 'Porque ordena os elementos antes de inserir.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(1)',
      explanation: 'A pilha flexivel insere sempre no topo, sem caminhar pela cadeia.',
    },
    commonMistakes: [
      {
        id: 'pilha-push-na-base',
        title: 'Inserir na base',
        description: 'Inserir no final da cadeia muda a operacao esperada e exige percurso desnecessario.',
      },
    ],
  },
  {
    id: 'pilha-analisar-soma-01',
    title: 'Analisar funcao que percorre a pilha',
    pattern: 'analisar-complexidade',
    structure: 'pilha',
    difficulty: 'medio',
    statement:
      'Analise a funcao pronta abaixo. Ela nao remove elementos; apenas caminha pelos ponteiros da pilha a partir do topo.',
    providedCode: `int soma() {
  int resp = 0;
  for (Celula i = topo; i != null; i = i.prox) {
    resp += i.elemento;
  }
  return resp;
}`,
    visualStateId: 'pilha-flexivel-01',
    focus: 'codigo',
    source: courseSource('u04b_tadFlexivel_pilha.pdf'),
    steps: [
      {
        id: 'pilha-analisar-soma-01-s1',
        kind: 'interpretar',
        prompt: 'O que a funcao soma() retorna para a pilha exibida?',
        options: [
          { id: 'a', label: '60' },
          { id: 'b', label: '30' },
          { id: 'c', label: '10' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'pilha-analisar-soma-01-s2',
        kind: 'simular',
        prompt: 'Qual e a ordem de visita do laco?',
        options: [
          { id: 'a', label: '30 -> 20 -> 10' },
          { id: 'b', label: '10 -> 20 -> 30' },
          { id: 'c', label: '20 -> 30 -> 10' },
        ],
        correctOptionId: 'a',
        activePath: ['topo', 'c20', 'c10'],
      },
      {
        id: 'pilha-analisar-soma-01-s3',
        kind: 'lacuna',
        prompt: 'Complete a atualizacao do laco: i = i.___;',
        gapId: 'i-prox',
        answers: [{ id: 'prox', answer: 'prox' }],
      },
      {
        id: 'pilha-analisar-soma-01-s4',
        kind: 'complexidade',
        prompt: 'Qual e a complexidade dessa funcao?',
        options: [
          { id: 'a', label: 'O(n), pois visita todas as celulas.' },
          { id: 'b', label: 'O(1), pois a pilha tem topo.' },
          { id: 'c', label: 'O(log n), pois pula metade dos elementos.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n)',
      explanation: 'A funcao percorre uma celula por iteracao ate chegar em null.',
    },
    commonMistakes: [
      {
        id: 'pilha-analisar-achar-que-remove',
        title: 'Confundir percorrer com remover',
        description: 'O ponteiro topo nao e alterado; a funcao apenas usa um auxiliar i.',
      },
    ],
  },
  {
    id: 'ordenacao-selecao-menor-01',
    title: 'Completar passo da selecao',
    pattern: 'percorrer-todos-os-nos',
    structure: 'ordenacao',
    difficulty: 'medio',
    statement:
      'Nos slides de ordenacao por selecao, cada passada escolhe o menor elemento do trecho nao ordenado e troca com a posicao i. Complete o raciocinio do primeiro passo.',
    providedCode: `void selecao(int[] array, int n) {
  for (int i = 0; i < n - 1; i++) {
    int menor = i;
    for (int j = i + 1; j < n; j++) {
      // atualize menor quando necessario
    }
    swap(array, menor, i);
  }
}`,
    visualStateId: 'ordenacao-selecao-01',
    focus: 'codigo',
    source: courseSource('u03_ordenacaoInterna_selecao.pdf'),
    steps: [
      {
        id: 'ordenacao-selecao-menor-01-s1',
        kind: 'interpretar',
        prompt: 'No vetor exibido, qual indice deve ser guardado em menor na primeira passada?',
        options: [
          { id: 'a', label: '1, onde esta o valor 4.' },
          { id: 'b', label: '0, onde esta o valor 7.' },
          { id: 'c', label: '3, onde esta o valor 12.' },
        ],
        correctOptionId: 'a',
        activeNodeId: 'v1',
      },
      {
        id: 'ordenacao-selecao-menor-01-s2',
        kind: 'lacuna',
        prompt: 'Complete a comparacao: if (array[j] ___ array[menor]) menor = j;',
        gapId: 'menor-comparacao',
        answers: [{ id: 'lt', answer: '<', aliases: ['menor que'] }],
      },
      {
        id: 'ordenacao-selecao-menor-01-s3',
        kind: 'blocos',
        prompt: 'Ordene uma passada da selecao.',
        blocks: [
          { id: 'menor-i', label: 'iniciar menor = i', order: 1 },
          { id: 'varrer', label: 'varrer j de i+1 ate n-1', order: 2 },
          { id: 'atualizar', label: 'atualizar menor se achar valor menor', order: 3 },
          { id: 'trocar', label: 'trocar array[i] com array[menor]', order: 4 },
        ],
        correctOrder: ['menor-i', 'varrer', 'atualizar', 'trocar'],
      },
      {
        id: 'ordenacao-selecao-menor-01-s4',
        kind: 'complexidade',
        prompt: 'Qual e a complexidade da selecao no numero de comparacoes?',
        options: [
          { id: 'a', label: 'O(n^2), mesmo se o vetor ja estiver ordenado.' },
          { id: 'b', label: 'O(n), pois cada elemento troca uma vez.' },
          { id: 'c', label: 'O(log n), pois sempre divide o vetor.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n^2)',
      explanation: 'A selecao compara pares em lacos aninhados; a quantidade de comparacoes independe da ordem inicial.',
    },
    commonMistakes: [
      {
        id: 'ordenacao-selecao-contar-so-trocas',
        title: 'Analisar apenas trocas',
        description: 'Mesmo com poucas trocas, as comparacoes continuam quadraticas.',
      },
    ],
  },
  {
    id: 'ordenacao-insercao-desenho-01',
    title: 'Escolher estado da insercao',
    pattern: 'verificar-propriedade-global',
    structure: 'ordenacao',
    difficulty: 'medio',
    statement:
      'No algoritmo de insercao, o prefixo antes de i fica ordenado. Escolha o desenho correto depois de inserir o pivo 5 no prefixo [2, 4, 7, 9].',
    providedCode: `for (int i = 1; i < n; i++) {
  int tmp = array[i];
  int j = i - 1;
  while (j >= 0 && array[j] > tmp) {
    array[j + 1] = array[j];
    j--;
  }
  array[j + 1] = tmp;
}`,
    visualStateId: 'ordenacao-insercao-correto-01',
    focus: 'desenho',
    source: courseSource('u03b_ordenacaoInterna_insercao.pdf'),
    steps: [
      {
        id: 'ordenacao-insercao-desenho-01-s1',
        kind: 'interpretar',
        prompt: 'Qual desenho mostra o prefixo ordenado depois de inserir 5?',
        options: [
          { id: 'a', label: 'Desenho A', visualStateId: 'ordenacao-insercao-correto-01' },
          { id: 'b', label: 'Desenho B', visualStateId: 'ordenacao-insercao-errado-01' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'ordenacao-insercao-desenho-01-s2',
        kind: 'simular',
        prompt: 'Qual valor precisa ser deslocado para a direita antes de colocar 5?',
        options: [
          { id: 'a', label: '7' },
          { id: 'b', label: '2' },
          { id: 'c', label: '4' },
        ],
        correctOptionId: 'a',
        activeNodeId: 'v3',
      },
      {
        id: 'ordenacao-insercao-desenho-01-s3',
        kind: 'lacuna',
        prompt: 'Complete a condicao do while: array[j] ___ tmp.',
        gapId: 'insercao-maior',
        answers: [{ id: 'gt', answer: '>', aliases: ['maior que'] }],
      },
      {
        id: 'ordenacao-insercao-desenho-01-s4',
        kind: 'complexidade',
        prompt: 'Qual e o pior caso da ordenacao por insercao?',
        options: [
          { id: 'a', label: 'O(n^2), quando desloca muitos elementos.' },
          { id: 'b', label: 'O(n log n), sempre.' },
          { id: 'c', label: 'O(1), pois guarda tmp.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n^2) no pior caso',
      explanation: 'Em ordem inversa, cada novo pivo pode deslocar todo o prefixo anterior.',
    },
    commonMistakes: [
      {
        id: 'ordenacao-insercao-trocar-com-selecao',
        title: 'Confundir insercao com selecao',
        description: 'Insercao desloca elementos do prefixo; selecao procura o menor do restante.',
      },
    ],
  },
  {
    id: 'ordenacao-quicksort-particao-01',
    title: 'Analisar particao do quicksort',
    pattern: 'analisar-complexidade',
    structure: 'ordenacao',
    difficulty: 'dificil',
    statement:
      'Nos slides de quicksort, a particao reorganiza o vetor em torno de um pivo. Analise o estado exibido e a complexidade esperada do algoritmo.',
    providedCode: `void quicksort(int[] array, int esq, int dir) {
  int i = esq, j = dir;
  int pivo = array[(esq + dir) / 2];
  while (i <= j) {
    while (array[i] < pivo) i++;
    while (array[j] > pivo) j--;
    if (i <= j) swap(array, i++, j--);
  }
  if (esq < j) quicksort(array, esq, j);
  if (i < dir) quicksort(array, i, dir);
}`,
    visualStateId: 'ordenacao-particao-01',
    focus: 'codigo',
    source: courseSource('u03d_ordenacaoInterna_quicksort.pdf'),
    steps: [
      {
        id: 'ordenacao-quicksort-particao-01-s1',
        kind: 'interpretar',
        prompt: 'No desenho, que propriedade a particao ja garante em relacao ao pivo 5?',
        options: [
          { id: 'a', label: 'Valores menores ficaram a esquerda e maiores a direita.' },
          { id: 'b', label: 'O vetor inteiro ja esta necessariamente ordenado.' },
          { id: 'c', label: 'Todos os valores iguais ao pivo foram removidos.' },
        ],
        correctOptionId: 'a',
        activePath: ['v0', 'v1', 'v2', 'v3', 'v4'],
      },
      {
        id: 'ordenacao-quicksort-particao-01-s2',
        kind: 'lacuna',
        prompt: 'Complete a escolha do pivo central: int pivo = array[(esq + dir) ___ 2];',
        gapId: 'pivo-divisao',
        answers: [{ id: 'div', answer: '/', aliases: ['dividido por'] }],
      },
      {
        id: 'ordenacao-quicksort-particao-01-s3',
        kind: 'blocos',
        prompt: 'Ordene o raciocinio da particao.',
        blocks: [
          { id: 'pivo', label: 'escolher o pivo', order: 1 },
          { id: 'avancar-i', label: 'avancar i enquanto array[i] < pivo', order: 2 },
          { id: 'recuar-j', label: 'recuar j enquanto array[j] > pivo', order: 3 },
          { id: 'trocar', label: 'trocar quando i <= j e continuar', order: 4 },
        ],
        correctOrder: ['pivo', 'avancar-i', 'recuar-j', 'trocar'],
      },
      {
        id: 'ordenacao-quicksort-particao-01-s4',
        kind: 'complexidade',
        prompt: 'Qual analise combina caso medio e pior caso do quicksort?',
        options: [
          { id: 'a', label: 'Medio O(n log n), pior O(n^2).' },
          { id: 'b', label: 'Sempre O(n), pois so faz uma particao.' },
          { id: 'c', label: 'Sempre O(n^2), mesmo com particoes equilibradas.' },
        ],
        correctOptionId: 'a',
      },
    ],
    complexity: {
      answer: 'O(n log n) medio; O(n^2) pior caso',
      explanation: 'Particoes equilibradas geram altura log n; particoes muito ruins podem gerar altura n.',
    },
    commonMistakes: [
      {
        id: 'ordenacao-quicksort-particao-ordenado',
        title: 'Achar que uma particao ordena tudo',
        description: 'A particao separa em torno do pivo; as subpartes ainda precisam de chamadas recursivas.',
      },
    ],
  },
] satisfies Challenge[];
