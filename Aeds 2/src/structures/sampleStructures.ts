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
};
