import type { CodeDrill } from '../types/content';

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
    goal: 'Automatizar o caso base de recursao em arvore.',
    stem: 'Complete a primeira decisao de uma funcao que conta todos os nos de uma arvore binaria.',
    scaffold: `class No {
  int elemento;
  No esq, dir;
}

class Arvore {
  private No raiz;

  private int contar(No i) {
    // escolha o caso base correto
    return contar(i.esq) + contar(i.dir) + 1;
  }
}`,
    visual: {
      kind: 'binary-tree',
      title: 'Arvore binaria',
      caption: 'O ponteiro nulo encerra cada ramo recursivo.',
      labels: ['8', '3', '10', '1', '6'],
    },
    step: {
      id: 'code-arvore-contar-nos-base-step',
      kind: 'choice',
      skillId: 'program',
      prompt: 'Qual condicao deve aparecer antes da chamada recursiva?',
      correctOptionId: 'base-null',
      options: [
        { id: 'base-null', label: 'if (i == null) return 0;' },
        { id: 'retorna-um', label: 'if (i == null) return 1;', mistakeTag: 'missing-base-case' },
        { id: 'para-folha', label: 'if (i.esq == null) return 0;', mistakeTag: 'missing-base-case' },
      ],
      explanation: 'Subarvore vazia nao tem no, entao contribui com 0.',
    },
  },
  {
    id: 'code-arvore-contar-nos-recursao',
    domainId: 'arvore',
    title: 'Arvore: linha recursiva para contar nos',
    source: 'lista-prova3',
    repetitionGroup: 'arvore-contagem-recursiva',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Repetir a formula recursiva ate ela ficar automatica.',
    stem: 'Escreva a linha que soma esquerda, direita e o proprio no.',
    scaffold: `class Arvore {
  private No raiz;

  private int contar(No i) {
    if (i == null) return 0;
    // escreva o retorno
  }
}`,
    visual: {
      kind: 'binary-tree',
      title: 'Combinar subarvores',
      caption: 'Todo no real conta 1 alem das duas subarvores.',
      labels: ['12', '7', '18', '4', '9'],
    },
    step: {
      id: 'code-arvore-contar-nos-recursao-step',
      kind: 'code',
      skillId: 'program',
      prompt: 'Digite a linha de retorno da funcao contar.',
      acceptedAnswers: [
        'return contar(i.esq) + contar(i.dir) + 1',
        'return 1 + contar(i.esq) + contar(i.dir)',
      ],
      mistakeTag: 'missing-base-case',
      explanation: 'A resposta combina os dois ramos e soma o no atual.',
    },
  },
  {
    id: 'code-arvore-soma-intervalo',
    domainId: 'arvore',
    title: 'Arvore: modificar para soma em intervalo',
    source: 'lista-prova3',
    repetitionGroup: 'arvore-contagem-recursiva',
    phase: 'modify',
    format: 'code-modification',
    skillId: 'program',
    goal: 'Usar a propriedade de ABB para nao visitar ramo desnecessario.',
    stem: 'Agora a funcao deve somar apenas valores entre a e b em uma ABB valida.',
    scaffold: `class Arvore {
  private No raiz;

  private int somaIntervalo(No i, int a, int b) {
    if (i == null) return 0;
    if (i.elemento < a) return somaIntervalo(i.dir, a, b);
    if (i.elemento > b) return somaIntervalo(i.esq, a, b);
    return i.elemento + somaIntervalo(i.esq, a, b) + somaIntervalo(i.dir, a, b);
  }
}`,
    visual: {
      kind: 'binary-tree',
      title: 'ABB com poda',
      caption: 'Valores menores que a cortam a esquerda; maiores que b cortam a direita.',
      labels: ['20', '10', '30', '5', '15', '25', '40'],
    },
    step: {
      id: 'code-arvore-soma-intervalo-step',
      kind: 'fix',
      skillId: 'program',
      prompt: 'Qual linha deve ser corrigida se o codigo visita a esquerda quando i.elemento < a?',
      lines: [
        'if (i == null) return 0;',
        'if (i.elemento < a) return somaIntervalo(i.esq, a, b);',
        'if (i.elemento > b) return somaIntervalo(i.esq, a, b);',
      ],
      correctLineIndex: 1,
      fixOptions: [
        { id: 'ir-direita', label: 'trocar por somaIntervalo(i.dir, a, b)' },
        { id: 'manter-esquerda', label: 'manter chamada para esquerda', mistakeTag: 'wrong-case-analysis' },
      ],
      correctFixId: 'ir-direita',
      explanation: 'Em ABB, se o no atual e menor que a, todo o ramo esquerdo tambem e pequeno demais.',
    },
  },
  {
    id: 'code-avl-recalcular-altura-folha',
    domainId: 'avl',
    title: 'AVL: altura de folha e vazia',
    source: 'lista-prova3',
    repetitionGroup: 'avl-alturas',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Fixar convencao de altura: folha 0 e arvore vazia -1.',
    stem: 'A lista cobra recalcular alturas em AVL. Comece pela convencao correta.',
    scaffold: `class NoAVL {
  int elemento;
  NoAVL esq, dir;
  int altura;
}

class ArvoreAVL {
  private int altura(NoAVL i) {
    // caso base
    return i.altura;
  }
}`,
    visual: {
      kind: 'avl',
      title: 'Alturas em AVL',
      caption: 'A folha fica com altura 0 porque seus filhos nulos valem -1.',
      labels: ['30', '20', '40'],
    },
    step: {
      id: 'code-avl-recalcular-altura-folha-step',
      kind: 'code',
      skillId: 'program',
      prompt: 'Digite o retorno para ponteiro nulo na funcao altura.',
      acceptedAnswers: ['return -1', '-1'],
      mistakeTag: 'wrong-rotation',
      explanation: 'Com folha 0, o ponteiro nulo precisa valer -1.',
    },
  },
  {
    id: 'code-avl-recalcular-altura-rec',
    domainId: 'avl',
    title: 'AVL: recalcular altura de um no',
    source: 'lista-prova3',
    repetitionGroup: 'avl-alturas',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Repetir a atualizacao de altura apos mexer nas subarvores.',
    stem: 'Atualize o campo altura de cada no usando as alturas dos filhos.',
    scaffold: `class ArvoreAVL {
  private int recalcular(NoAVL i) {
    if (i == null) return -1;
    int he = recalcular(i.esq);
    int hd = recalcular(i.dir);
    // atualize i.altura
    return i.altura;
  }
}`,
    visual: {
      kind: 'avl',
      title: 'No depois dos filhos',
      caption: 'Primeiro recalcula esquerda/direita; depois atualiza o no atual.',
      labels: ['50', '35', '70', '60'],
    },
    step: {
      id: 'code-avl-recalcular-altura-rec-step',
      kind: 'code',
      skillId: 'program',
      prompt: 'Digite a linha que atualiza i.altura usando he e hd.',
      acceptedAnswers: ['i.altura = 1 + Math.max(he, hd)', 'i.altura = Math.max(he, hd) + 1'],
      mistakeTag: 'wrong-rotation',
      explanation: 'A altura do no e um a mais que a maior altura entre os filhos.',
    },
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
    NoTrie atual = raiz;
    // percorra os caracteres
  }
}`,
    visual: {
      kind: 'trie',
      title: 'TRIE com marcador fim',
      caption: 'Caminho para cas pode existir sem cas ser palavra.',
      labels: ['c', 'a', 's', 'a', 'fim'],
    },
    step: {
      id: 'code-trie-existe-palavra-base-step',
      kind: 'choice',
      skillId: 'program',
      prompt: 'Depois de percorrer todos os caracteres, o que a busca deve retornar?',
      correctOptionId: 'retorna-fim',
      options: [
        { id: 'retorna-fim', label: 'return atual.fim;' },
        { id: 'retorna-true', label: 'return true;', mistakeTag: 'prefix-vs-word' },
        { id: 'retorna-filhos', label: 'return atual.filho.length > 0;', mistakeTag: 'prefix-vs-word' },
      ],
      explanation: 'Caminho existente so vira palavra quando o ultimo no tem fim=true.',
    },
  },
  {
    id: 'code-trie-inserir-marca-fim',
    domainId: 'trie',
    title: 'TRIE: inserir marcando fim',
    source: 'lista-prova3',
    repetitionGroup: 'trie-palavra-exata',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Repetir criacao de nos e marcacao de palavra completa.',
    stem: 'Complete o final de uma insercao em TRIE.',
    scaffold: `class ArvoreTrie {
  void inserir(String s) {
    NoTrie atual = raiz;
    for (int i = 0; i < s.length(); i++) {
      int pos = s.charAt(i) - 'a';
      if (atual.filho[pos] == null) atual.filho[pos] = new NoTrie();
      atual = atual.filho[pos];
    }
    // marque palavra completa
  }
}`,
    visual: {
      kind: 'trie',
      title: 'Insercao em TRIE',
      caption: 'O marcador fica no ultimo caractere da palavra.',
      labels: ['p', 'a', 'r', 'fim'],
    },
    step: {
      id: 'code-trie-inserir-marca-fim-step',
      kind: 'code',
      skillId: 'program',
      prompt: 'Digite a linha que marca o fim da palavra.',
      acceptedAnswers: ['atual.fim = true'],
      mistakeTag: 'prefix-vs-word',
      explanation: 'Sem essa linha, o caminho existe mas a palavra nao fica cadastrada.',
    },
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
    goal: 'Depois de buscar o prefixo, contar todas as palavras abaixo dele.',
    stem: 'A variacao pede contar quantas palavras comecam com um prefixo.',
    scaffold: `class ArvoreTrie {
  int contarPrefixo(String pref) {
    NoTrie atual = localizarNoDoPrefixo(pref);
    if (atual == null) return 0;
    return contarPalavrasAbaixo(atual);
  }
}`,
    visual: {
      kind: 'trie',
      title: 'Subarvore do prefixo',
      caption: 'Depois do prefixo, a resposta esta nos marcadores fim abaixo dele.',
      labels: ['c', 'a', 'r', 'fim', 't', 'a', 'fim'],
    },
    step: {
      id: 'code-trie-contar-prefixo-step',
      kind: 'choice',
      skillId: 'program',
      prompt: 'Qual parte precisa ser percorrida depois de localizar o no do prefixo?',
      correctOptionId: 'subarvore-prefixo',
      options: [
        { id: 'subarvore-prefixo', label: 'a subarvore a partir do no do prefixo' },
        { id: 'raiz-toda', label: 'a arvore inteira desde a raiz', mistakeTag: 'prefix-vs-word' },
        { id: 'somente-no', label: 'somente o no final do prefixo', mistakeTag: 'prefix-vs-word' },
      ],
      explanation: 'O prefixo reduz o ponto de partida; abaixo dele ficam as palavras candidatas.',
    },
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
    stem: 'Treine a rota de pesquisa em hash com area de reserva.',
    scaffold: `class EstruturaDoidona {
  private T1 t1;
  private T2 t2;

  boolean pesquisar(int x) {
    int pos = hash(x);
    if (t1.tabela[pos] == x) return true;
    // continue na reserva
  }
}`,
    visual: {
      kind: 'doidona',
      title: 'T1 com reserva T2',
      caption: 'Colisao nao e ausencia; e desvio para outra estrutura.',
      labels: ['T1', 'hash(x)', 'T2', 'ABB reserva'],
    },
    step: {
      id: 'code-doidona-pesquisar-camadas-step',
      kind: 'choice',
      skillId: 'program',
      prompt: 'Se x nao esta em T1[pos], qual e o proximo passo correto?',
      correctOptionId: 'buscar-reserva',
      options: [
        { id: 'buscar-reserva', label: 'pesquisar na estrutura de reserva ligada a T2' },
        { id: 'retorna-false', label: 'return false imediatamente', mistakeTag: 'incomplete-layer-search' },
        { id: 'troca-hash', label: 'trocar x por hash(x)', mistakeTag: 'algorithm-confusion' },
      ],
      explanation: 'Uma colisao pode ter enviado o valor para uma estrutura secundaria.',
    },
  },
  {
    id: 'code-doidona-inserir-colisao',
    domainId: 'doidona',
    title: 'Doidona: inserir colisao na ABB da reserva',
    source: 'lista-prova3',
    repetitionGroup: 'doidona-hash-reserva',
    phase: 'modify',
    format: 'code-modification',
    skillId: 'program',
    goal: 'Modificar a insercao para mandar colisao para a estrutura certa.',
    stem: 'A lista usa varias estruturas hibridas: hash principal e reserva em arvore.',
    scaffold: `class Celula {
  int indice;
  NoABB raiz;
  Celula prox;
}

class EstruturaDoidona {
  void inserir(int x) {
    int pos = hash(x);
    if (t1.tabela[pos] == -1) t1.tabela[pos] = x;
    else inserirNaABBReserva(pos, x);
  }
}`,
    visual: {
      kind: 'hash',
      title: 'Colisao com ABB',
      caption: 'A reserva preserva todos os valores que bateram na mesma posicao.',
      labels: ['T1[2]', '42', '18', '66', 'ABB'],
    },
    step: {
      id: 'code-doidona-inserir-colisao-step',
      kind: 'blocks',
      skillId: 'program',
      prompt: 'Ordene a logica da insercao com colisao.',
      blocks: [
        { id: 'hash', label: 'calcular pos = hash(x)' },
        { id: 'vazio', label: 'se T1[pos] esta vazia, gravar x em T1[pos]' },
        { id: 'colisao', label: 'se ja existe valor em T1[pos], localizar/criar celula de reserva' },
        { id: 'abb', label: 'inserir x na ABB da celula de reserva' },
      ],
      correctOrder: ['hash', 'vazio', 'colisao', 'abb'],
      mistakeTag: 'incomplete-layer-search',
      explanation: 'A insercao precisa preservar o valor antigo e registrar a colisao na reserva.',
    },
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
    goal: 'Modificar algoritmo conhecido mantendo a logica central.',
    stem: 'A reavaliacao pede adaptar insertion sort para impares antes dos pares, todos ordenados.',
    scaffold: `class InsercaoEspecial {
  void sort() {
    for (int i = 1; i < n; i++) {
      int chave = array[i];
      int j = i - 1;
      while (j >= 0 && vemDepois(array[j], chave)) {
        array[j + 1] = array[j];
        j--;
      }
      array[j + 1] = chave;
    }
  }
}`,
    visual: {
      kind: 'array',
      title: 'Insercao adaptada',
      caption: 'A comparacao muda; o esqueleto do insertion sort permanece.',
      labels: ['4', '3', '8', '6', '1', '2', '9'],
    },
    step: {
      id: 'code-ordenacao-insercao-par-impar-step',
      kind: 'choice',
      skillId: 'program',
      prompt: 'Onde deve ficar a regra que decide impar antes de par?',
      correctOptionId: 'comparador',
      options: [
        { id: 'comparador', label: 'na funcao vemDepois usada pelo while' },
        { id: 'swap-final', label: 'somente depois de terminar todo sort', mistakeTag: 'algorithm-confusion' },
        { id: 'ignorar-while', label: 'removendo o while interno', mistakeTag: 'algorithm-confusion' },
      ],
      explanation: 'A adaptacao troca a comparacao, nao a estrutura do insertion sort.',
    },
  },
  {
    id: 'code-ordenacao-insercao-repetir',
    domainId: 'ordenacao',
    title: 'Ordenacao: repetir esqueleto da insercao',
    source: 'lista-prova3',
    repetitionGroup: 'ordenacao-insercao-adaptada',
    phase: 'repeat',
    format: 'code-repetition',
    skillId: 'program',
    goal: 'Memorizar o esqueleto antes de adaptar a comparacao.',
    stem: 'Ordene os passos do insertion sort classico.',
    scaffold: `class Insercao {
  void sort() {
    for (int i = 1; i < n; i++) {
      // chave, deslocamento e insercao final
    }
  }
}`,
    visual: {
      kind: 'array',
      title: 'Prefixo ordenado',
      caption: 'A cada rodada, a chave entra no prefixo ja ordenado.',
      labels: ['2', '5', '9', '3', '8'],
    },
    step: {
      id: 'code-ordenacao-insercao-repetir-step',
      kind: 'blocks',
      skillId: 'program',
      prompt: 'Ordene os blocos do insertion sort.',
      blocks: [
        { id: 'chave', label: 'guardar array[i] em chave' },
        { id: 'j', label: 'iniciar j em i - 1' },
        { id: 'deslocar', label: 'deslocar maiores para a direita' },
        { id: 'inserir', label: 'colocar chave em j + 1' },
      ],
      correctOrder: ['chave', 'j', 'deslocar', 'inserir'],
      mistakeTag: 'algorithm-confusion',
      explanation: 'A adaptacao so faz sentido depois do esqueleto ficar natural.',
    },
  },
];

export function getDrillsByGroup(repetitionGroup: string): CodeDrill[] {
  return codeDrillCatalog.filter((drill) => drill.repetitionGroup === repetitionGroup);
}
