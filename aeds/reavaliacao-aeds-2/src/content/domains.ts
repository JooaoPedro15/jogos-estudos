import type { Domain, SkillId } from '../types/content';

const reavaliacaoSkills: SkillId[] = ['recognize', 'simulate', 'program', 'justify'];

export const domainCatalog: Domain[] = [
  {
    id: 'doidona',
    title: 'Estrutura Doidona',
    shortTitle: 'Doidona',
    examRole: 'Implementar metodos em estruturas compostas com T1, T2, T3, lista e arvore.',
    skills: reavaliacaoSkills,
  },
  {
    id: 'trie',
    title: 'Arvore TRIE',
    shortTitle: 'TRIE',
    examRole: 'Pesquisar e inserir palavras diferenciando prefixo de palavra completa.',
    skills: reavaliacaoSkills,
  },
  {
    id: 'avl',
    title: 'Arvore AVL',
    shortTitle: 'AVL',
    examRole: 'Simular insercoes, calcular balanceamento e escolher rotacoes.',
    skills: reavaliacaoSkills,
  },
  {
    id: 'arvore',
    title: 'Arvore normal',
    shortTitle: 'Arvore',
    examRole: 'Resolver recursao, percursos e propriedades de arvores binarias.',
    skills: reavaliacaoSkills,
  },
  {
    id: 'somatorio',
    title: 'Somatorios',
    shortTitle: 'Somatorio',
    examRole: 'Contar execucoes de codigo e transformar lacos em somatorios.',
    skills: reavaliacaoSkills,
  },
  {
    id: 'ordenacao',
    title: 'Algoritmos de ordenacao',
    shortTitle: 'Ordenacao',
    examRole: 'Adaptar algoritmos e analisar comparacoes, movimentacoes e casos.',
    skills: reavaliacaoSkills,
  },
];
