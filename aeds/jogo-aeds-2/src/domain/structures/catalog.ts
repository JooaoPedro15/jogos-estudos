import type { StructureKind } from '../../types/challenge';

export type StructureStatus = 'liberada' | 'em-breve';

export type StructureCatalogItem = {
  id: StructureKind;
  name: string;
  shortName: string;
  family: 'arvore' | 'hash' | 'trie' | 'hibrida';
  description: string;
  phaseCount: number;
  status: StructureStatus;
};

export const structureCatalog = [
  {
    id: 'binaria',
    name: 'Arvore Binaria',
    shortName: 'Arvore Binaria',
    family: 'arvore',
    description: 'Altura, folhas, percursos e propriedades sem regra de busca.',
    phaseCount: 10,
    status: 'liberada',
  },
  {
    id: 'abb',
    name: 'Arvore Binaria de Busca',
    shortName: 'ABB',
    family: 'arvore',
    description: 'Pesquisa, insercao, remocao e contagens usando esq/dir.',
    phaseCount: 10,
    status: 'liberada',
  },
  {
    id: 'avl',
    name: 'AVL',
    shortName: 'AVL',
    family: 'arvore',
    description: 'Fator de balanceamento, alturas e rotacoes.',
    phaseCount: 10,
    status: 'em-breve',
  },
  {
    id: 'arv234',
    name: 'Arvore 2-3-4',
    shortName: '2-3-4',
    family: 'arvore',
    description: 'Nos multiplo-caminho, divisao e promocao.',
    phaseCount: 10,
    status: 'em-breve',
  },
  {
    id: 'alvinegra',
    name: 'Alvinegra',
    shortName: 'Alvinegra',
    family: 'arvore',
    description: 'Cores, tipo quatro, recoloracao e rotacoes.',
    phaseCount: 10,
    status: 'em-breve',
  },
  {
    id: 'hash',
    name: 'Hash',
    shortName: 'Hash',
    family: 'hash',
    description: 'Area principal, reserva, rehash e colisao.',
    phaseCount: 10,
    status: 'em-breve',
  },
  {
    id: 'trie',
    name: 'TRIE',
    shortName: 'TRIE',
    family: 'trie',
    description: 'Palavras, prefixos, folha e caminhos por caractere.',
    phaseCount: 10,
    status: 'em-breve',
  },
  {
    id: 'patricia',
    name: 'PATRICIA',
    shortName: 'PATRICIA',
    family: 'trie',
    description: 'Bits, compressao de caminhos e decisao por indice.',
    phaseCount: 10,
    status: 'em-breve',
  },
  {
    id: 'doidona',
    name: 'Hibridas / Doidonas',
    shortName: 'Doidona',
    family: 'hibrida',
    description: 'Camadas com arvore, tabelas e listas encadeadas.',
    phaseCount: 10,
    status: 'em-breve',
  },
] as const satisfies readonly StructureCatalogItem[];

export const unlockedStructureIds: readonly StructureKind[] = structureCatalog
  .filter((structure) => structure.status === 'liberada')
  .map((structure) => structure.id);
