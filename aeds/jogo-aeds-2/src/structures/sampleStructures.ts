import type { VisualState } from '../types/structures';

export const sampleVisualStates: Record<string, VisualState> = {
  'abb-basica-01': {
    id: 'abb-basica-01',
    kind: 'tree',
    root: {
      id: 'n40',
      label: '40',
      left: {
        id: 'n20',
        label: '20',
        left: { id: 'n10', label: '10' },
        right: { id: 'n30', label: '30' },
      },
      right: {
        id: 'n60',
        label: '60',
        left: { id: 'n50', label: '50' },
        right: { id: 'n70', label: '70' },
      },
    },
  },
  'abb-invalida-01': {
    id: 'abb-invalida-01',
    kind: 'tree',
    root: {
      id: 'n40',
      label: '40',
      left: {
        id: 'n50',
        label: '50',
        left: { id: 'n10', label: '10' },
        right: { id: 'n30', label: '30' },
      },
      right: {
        id: 'n20',
        label: '20',
        left: { id: 'n60', label: '60' },
        right: { id: 'n70', label: '70' },
      },
    },
  },
  'abb-inserir-42-01': {
    id: 'abb-inserir-42-01',
    kind: 'tree',
    root: {
      id: 'n40',
      label: '40',
      left: {
        id: 'n20',
        label: '20',
        left: { id: 'n10', label: '10' },
        right: { id: 'n30', label: '30' },
      },
      right: {
        id: 'n60',
        label: '60',
        left: {
          id: 'n50',
          label: '50',
          right: { id: 'n42', label: '42' },
        },
        right: { id: 'n70', label: '70' },
      },
    },
  },
  'avl-rotacao-01': {
    id: 'avl-rotacao-01',
    kind: 'tree',
    root: {
      id: 'n30',
      label: '30',
      left: {
        id: 'n20',
        label: '20',
        left: { id: 'n10', label: '10' },
        right: { id: 'n25', label: '25' },
      },
      right: {
        id: 'n40',
        label: '40',
        right: { id: 'n50', label: '50' },
      },
    },
  },
  'alvinegra-brancos-01': {
    id: 'alvinegra-brancos-01',
    kind: 'tree',
    root: {
      id: 'n40',
      label: '40',
      color: 'black',
      left: {
        id: 'n20',
        label: '20',
        color: 'white',
        left: { id: 'n10', label: '10', color: 'black' },
        right: { id: 'n30', label: '30', color: 'black' },
      },
      right: {
        id: 'n60',
        label: '60',
        color: 'black',
        left: { id: 'n50', label: '50', color: 'white' },
        right: { id: 'n70', label: '70', color: 'black' },
      },
    },
  },
  'hash-reserva-01': {
    id: 'hash-reserva-01',
    kind: 'hash',
    slots: [
      { index: 0, status: 'empty' },
      { index: 1, value: '21', status: 'occupied' },
      { index: 2, value: '32', status: 'collision' },
      { index: 3, status: 'empty' },
      { index: 4, value: '14', status: 'occupied' },
      { index: 5, status: 'reserved' },
      { index: 6, value: '76', status: 'reserved' },
      { index: 7, value: '87', status: 'reserved' },
    ],
  },
  'trie-stop-sapo-01': {
    id: 'trie-stop-sapo-01',
    kind: 'trie',
    root: {
      id: 'raiz',
      char: '',
      children: [
        {
          id: 's',
          char: 'S',
          children: [
            {
              id: 'st',
              char: 'T',
              children: [
                {
                  id: 'sto',
                  char: 'O',
                  children: [{ id: 'stop', char: 'P', folha: true }],
                },
              ],
            },
            {
              id: 'sa',
              char: 'A',
              children: [
                {
                  id: 'sap',
                  char: 'P',
                  children: [{ id: 'sapo', char: 'O', folha: true }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  'binaria-ismax-01': {
    id: 'binaria-ismax-01',
    kind: 'tree',
    root: {
      id: 'n8',
      label: '8',
      left: {
        id: 'n3',
        label: '3',
        left: { id: 'n1', label: '1' },
        right: {
          id: 'n6',
          label: '6',
          left: { id: 'n4', label: '4' },
        },
      },
      right: {
        id: 'n10',
        label: '10',
        right: {
          id: 'n14',
          label: '14',
          left: { id: 'n13', label: '13' },
        },
      },
    },
  },
  'binaria-estrita-01': {
    id: 'binaria-estrita-01',
    kind: 'tree',
    root: {
      id: 'n8',
      label: '8',
      left: {
        id: 'n3',
        label: '3',
        left: { id: 'n1', label: '1' },
        right: { id: 'n6', label: '6' },
      },
      right: {
        id: 'n10',
        label: '10',
        left: { id: 'n9', label: '9' },
        right: { id: 'n14', label: '14' },
      },
    },
  },
  'arv234-basica-01': {
    id: 'arv234-basica-01',
    kind: 'tree',
    root: {
      id: 'n20-40',
      label: '20|40',
      left: {
        id: 'n10',
        label: '10',
      },
      right: {
        id: 'n50-60',
        label: '50|60',
        left: { id: 'n30', label: '30' },
        right: { id: 'n70', label: '70' },
      },
    },
  },
  'arv234-folhas-mesmo-nivel-01': {
    id: 'arv234-folhas-mesmo-nivel-01',
    kind: 'tree',
    root: {
      id: 'n20-40',
      label: '20|40',
      left: { id: 'n10', label: '10' },
      right: { id: 'n50-60', label: '50|60' },
    },
  },
  'arv234-folhas-desiguais-01': {
    id: 'arv234-folhas-desiguais-01',
    kind: 'tree',
    root: {
      id: 'n20-40',
      label: '20|40',
      left: { id: 'n10', label: '10' },
      right: {
        id: 'n50-60',
        label: '50|60',
        left: { id: 'n30', label: '30' },
        right: { id: 'n70', label: '70' },
      },
    },
  },
  'patricia-bit-01': {
    id: 'patricia-bit-01',
    kind: 'trie',
    root: {
      id: 'bit2',
      char: 'bit2',
      children: [
        {
          id: 'bit4',
          char: 'bit4',
          children: [
            { id: 'asa', char: 'ASA', folha: true },
            { id: 'ato', char: 'ATO', folha: true },
          ],
        },
        {
          id: 'bar',
          char: 'BAR',
          folha: true,
        },
      ],
    },
  },
  'patricia-invalida-um-filho-01': {
    id: 'patricia-invalida-um-filho-01',
    kind: 'trie',
    root: {
      id: 'bit2',
      char: 'bit2',
      children: [
        {
          id: 'bit4',
          char: 'bit4',
          children: [{ id: 'asa', char: 'ASA', folha: true }],
        },
      ],
    },
  },
  'doidona-camadas-01': {
    id: 'doidona-camadas-01',
    kind: 'hybrid',
    layers: [
      { id: 'arvore', label: 'Arvore por caractere', items: ['H', 'D', 'P'] },
      { id: 't1', label: 'T1', items: ['hash(p)', 'colisao', 'livre'] },
      { id: 't2', label: 'T2', items: ['rehash', 'lista'] },
      { id: 'lista', label: 'Lista', items: ['STOP', 'SAPO', 'SINO'] },
    ],
  },
  'lista-simples-01': {
    id: 'lista-simples-01',
    kind: 'hybrid',
    layers: [
      { id: 'cabeca', label: 'primeiro', items: ['sentinela', 'prox -> c10'] },
      { id: 'c10', label: 'Celula', items: ['10', 'prox -> c20'] },
      { id: 'c20', label: 'Celula', items: ['20', 'prox -> c30'] },
      { id: 'c30', label: 'ultimo', items: ['30', 'prox -> null'] },
    ],
  },
  'lista-inserir-inicio-correto-01': {
    id: 'lista-inserir-inicio-correto-01',
    kind: 'hybrid',
    layers: [
      { id: 'cabeca', label: 'primeiro', items: ['sentinela', 'prox -> c5'] },
      { id: 'c5', label: 'nova', items: ['5', 'prox -> c10'] },
      { id: 'c10', label: 'Celula', items: ['10', 'prox -> c20'] },
      { id: 'c20', label: 'ultimo', items: ['20', 'prox -> null'] },
    ],
  },
  'lista-inserir-inicio-errado-01': {
    id: 'lista-inserir-inicio-errado-01',
    kind: 'hybrid',
    layers: [
      { id: 'cabeca', label: 'primeiro', items: ['sentinela', 'prox -> c10'] },
      { id: 'c10', label: 'Celula', items: ['10', 'prox -> c20'] },
      { id: 'c20', label: 'ultimo', items: ['20', 'prox -> null'] },
      { id: 'c5', label: 'nova', items: ['5', 'solta'] },
    ],
  },
  'pilha-flexivel-01': {
    id: 'pilha-flexivel-01',
    kind: 'hybrid',
    layers: [
      { id: 'topo', label: 'topo', items: ['30', 'prox -> c20'] },
      { id: 'c20', label: 'Celula', items: ['20', 'prox -> c10'] },
      { id: 'c10', label: 'base', items: ['10', 'prox -> null'] },
    ],
  },
  'pilha-push-correto-01': {
    id: 'pilha-push-correto-01',
    kind: 'hybrid',
    layers: [
      { id: 'topo', label: 'topo', items: ['40', 'prox -> c30'] },
      { id: 'c30', label: 'Celula', items: ['30', 'prox -> c20'] },
      { id: 'c20', label: 'Celula', items: ['20', 'prox -> c10'] },
      { id: 'c10', label: 'base', items: ['10', 'prox -> null'] },
    ],
  },
  'pilha-push-errado-01': {
    id: 'pilha-push-errado-01',
    kind: 'hybrid',
    layers: [
      { id: 'topo', label: 'topo', items: ['30', 'prox -> c20'] },
      { id: 'c20', label: 'Celula', items: ['20', 'prox -> c10'] },
      { id: 'c10', label: 'base', items: ['10', 'prox -> c40'] },
      { id: 'c40', label: 'nova', items: ['40', 'prox -> null'] },
    ],
  },
  'ordenacao-selecao-01': {
    id: 'ordenacao-selecao-01',
    kind: 'hybrid',
    layers: [
      { id: 'v0', label: '0', items: ['7', 'i'] },
      { id: 'v1', label: '1', items: ['4', 'menor'] },
      { id: 'v2', label: '2', items: ['9'] },
      { id: 'v3', label: '3', items: ['12'] },
      { id: 'v4', label: '4', items: ['6'] },
    ],
  },
  'ordenacao-insercao-correto-01': {
    id: 'ordenacao-insercao-correto-01',
    kind: 'hybrid',
    layers: [
      { id: 'v0', label: '0', items: ['2', 'ordenado'] },
      { id: 'v1', label: '1', items: ['4', 'ordenado'] },
      { id: 'v2', label: '2', items: ['5', 'pivo'] },
      { id: 'v3', label: '3', items: ['7'] },
      { id: 'v4', label: '4', items: ['9'] },
    ],
  },
  'ordenacao-insercao-errado-01': {
    id: 'ordenacao-insercao-errado-01',
    kind: 'hybrid',
    layers: [
      { id: 'v0', label: '0', items: ['2', 'ordenado'] },
      { id: 'v1', label: '1', items: ['7', 'fora'] },
      { id: 'v2', label: '2', items: ['4', 'pivo'] },
      { id: 'v3', label: '3', items: ['5'] },
      { id: 'v4', label: '4', items: ['9'] },
    ],
  },
  'ordenacao-particao-01': {
    id: 'ordenacao-particao-01',
    kind: 'hybrid',
    layers: [
      { id: 'v0', label: '0', items: ['3', '< pivo'] },
      { id: 'v1', label: '1', items: ['4', '< pivo'] },
      { id: 'v2', label: '2', items: ['5', 'pivo'] },
      { id: 'v3', label: '3', items: ['9', '> pivo'] },
      { id: 'v4', label: '4', items: ['7', '> pivo'] },
    ],
  },
};
