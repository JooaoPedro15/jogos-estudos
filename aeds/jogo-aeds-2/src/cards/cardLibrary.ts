import type { AedsCard } from './cardTypes';

/**
 * Cartas-ferramenta de AEDS II. Diferente da versão anterior (cartas-conceito que
 * "eram a resposta"), cada carta agora aplica um `effect` durante a resolução de
 * uma etapa do desafio. Os campos `category`/`concept`/`code` permanecem como sabor
 * (e mantêm a UI antiga compilando) enquanto `structureTags`/`rarity`/`energyCost`
 * continuam alimentando combos e passivas.
 */
export const cardLibrary = [
  {
    id: 'revelar-dica',
    name: 'Consultar Anotacoes',
    category: 'modificador',
    structureTags: ['binaria', 'abb', 'avl', 'alvinegra', 'hash', 'trie', 'doidona'],
    concept: 'Revela a dica da etapa atual para orientar o raciocinio antes de responder.',
    code: '// dica: revisar a propriedade da estrutura',
    energyCost: 1,
    rarity: 'comum',
    effect: 'revelarDica',
  },
  {
    id: 'eliminar-alternativa',
    name: 'Eliminar Hipotese',
    category: 'condicao',
    structureTags: ['binaria', 'abb', 'avl', 'alvinegra', 'hash', 'trie', 'doidona'],
    concept: 'Descarta uma alternativa errada de uma etapa de escolha, estreitando as opcoes.',
    code: '// remove 1 opcao incorreta da etapa atual',
    energyCost: 1,
    rarity: 'comum',
    effect: 'eliminarAlternativa',
  },
  {
    id: 'pular-etapa',
    name: 'Pular Subproblema',
    category: 'modificador',
    structureTags: ['binaria', 'abb', 'avl', 'alvinegra', 'hash', 'trie', 'doidona'],
    concept: 'Resolve a etapa atual sem arriscar foco, mas tambem sem somar pontuacao.',
    code: '// avanca a etapa sem ganho de score',
    energyCost: 2,
    rarity: 'incomum',
    effect: 'pularEtapa',
  },
  {
    id: 'escudo-foco',
    name: 'Escudo de Foco',
    category: 'condicao',
    structureTags: ['binaria', 'abb', 'avl', 'alvinegra', 'hash', 'trie', 'doidona'],
    concept: 'Protege o proximo erro: a perda de foco daquela etapa nao acontece.',
    code: '// proximo erro nao custa foco',
    energyCost: 2,
    rarity: 'incomum',
    effect: 'escudoFoco',
  },
  {
    id: 'aposta-dobrada',
    name: 'Aposta Dobrada',
    category: 'combinacao',
    structureTags: ['binaria', 'abb', 'avl', 'alvinegra', 'hash', 'trie', 'doidona'],
    concept: 'Dobra a pontuacao do proximo acerto, recompensando confianca na resposta.',
    code: '// proximo acerto vale x2 de score',
    energyCost: 2,
    rarity: 'rara',
    effect: 'dobrarScore',
  },
  {
    id: 'cafe-forte',
    name: 'Cafe Forte',
    category: 'base',
    structureTags: ['binaria', 'abb', 'avl', 'alvinegra', 'hash', 'trie', 'doidona'],
    concept: 'Recupera folego no meio do encontro, devolvendo energia para jogar mais ferramentas.',
    code: '// +energia neste encontro',
    energyCost: 0,
    rarity: 'comum',
    effect: 'energiaExtra',
    effectValue: 3,
  },
  {
    id: 'dica-mestra',
    name: 'Dica Mestra',
    category: 'percurso',
    structureTags: ['binaria', 'abb', 'avl', 'alvinegra'],
    concept: 'Revela a dica em desafios de arvore, lembrando a regra de descida correta.',
    code: '// dica de travessia: esq < raiz < dir',
    energyCost: 1,
    rarity: 'incomum',
    effect: 'revelarDica',
  },
  {
    id: 'poda-de-ramo',
    name: 'Poda de Ramo',
    category: 'percurso',
    structureTags: ['abb', 'avl', 'alvinegra'],
    concept: 'Elimina uma alternativa improvavel usando a propriedade de ordenacao da ABB.',
    code: '// descarta opcao que viola esq < raiz < dir',
    energyCost: 1,
    rarity: 'incomum',
    effect: 'eliminarAlternativa',
  },
  {
    id: 'salto-recursivo',
    name: 'Salto Recursivo',
    category: 'combinacao',
    structureTags: ['binaria', 'abb', 'avl', 'alvinegra', 'trie'],
    concept: 'Pula um subproblema recursivo dificil sem perder foco, ideal em etapas de simulacao.',
    code: '// resolve a recursao parcial sem risco',
    energyCost: 2,
    rarity: 'rara',
    effect: 'pularEtapa',
  },
  {
    id: 'memoizar',
    name: 'Memoizar',
    category: 'modificador',
    structureTags: ['hash', 'doidona'],
    concept: 'Guarda um resultado parcial em hash e protege o proximo erro de calculo.',
    code: '// cache protege contra a proxima colisao de raciocinio',
    energyCost: 1,
    rarity: 'incomum',
    effect: 'escudoFoco',
  },
  {
    id: 'insight-complexidade',
    name: 'Insight de Complexidade',
    category: 'complexidade',
    structureTags: ['abb', 'avl', 'alvinegra', 'hash', 'trie'],
    concept: 'Aposta na analise de complexidade dobrando o score do proximo acerto.',
    code: '// proximo acerto de complexidade vale x2',
    energyCost: 2,
    rarity: 'incomum',
    effect: 'dobrarScore',
  },
  {
    id: 'segundo-folego',
    name: 'Segundo Folego',
    category: 'base',
    structureTags: ['trie', 'doidona'],
    concept: 'Devolve um pouco de energia para sustentar travessias longas em TRIE e doidona.',
    code: '// +energia para encarar camadas extras',
    energyCost: 1,
    rarity: 'comum',
    effect: 'energiaExtra',
    effectValue: 2,
  },
] as const satisfies readonly AedsCard[];

export type CardId = (typeof cardLibrary)[number]['id'];

/** Deck inicial pequeno e fixo (kit básico de ferramentas). */
export const startingDeckCardIds: readonly CardId[] = [
  'revelar-dica',
  'revelar-dica',
  'eliminar-alternativa',
  'eliminar-alternativa',
  'cafe-forte',
  'escudo-foco',
  'pular-etapa',
  'aposta-dobrada',
];

/** Cartas que podem aparecer como recompensa de encontro. */
export const rewardableCardIds: readonly CardId[] = cardLibrary
  .map((card) => card.id)
  .filter((cardId): cardId is CardId => !isCoreStarterOnly(cardId));

function isCoreStarterOnly(_cardId: CardId): boolean {
  // Atualmente toda carta da biblioteca é recompensável; o ponto de extensão fica
  // explícito para quando houver cartas exclusivas do deck inicial.
  return false;
}

export const cardById = cardLibrary.reduce(
  (lookup, card) => {
    lookup[card.id] = card;
    return lookup;
  },
  {} as Record<CardId, AedsCard>,
);

const cardLookup: Readonly<Partial<Record<string, AedsCard>>> = cardById;

export function getCardById(id: string): AedsCard | undefined {
  return cardLookup[id];
}
