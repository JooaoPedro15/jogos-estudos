import type { StructureKind } from '../types/challenge';

export type PassiveEffectKind =
  | 'scoreBonus'
  | 'energyDiscount'
  | 'scoreMultiplier'
  | 'preventFocusLoss'
  | 'extraReward';

export type Passive = {
  id: string;
  name: string;
  description: string;
  effect: PassiveEffectKind;
  structureTag?: StructureKind;
  value: number;
};

export const passiveLibrary = [
  {
    id: 'mestre-recursao',
    name: 'Mestre da Recursao',
    description: 'Combos que usam caso base recebem bonus fixo de pontuacao.',
    effect: 'scoreBonus',
    value: 20,
  },
  {
    id: 'olho-abb',
    name: 'Olho da ABB',
    description: 'A primeira carta de percurso em ABB custa menos energia por encontro.',
    effect: 'energyDiscount',
    structureTag: 'abb',
    value: 1,
  },
  {
    id: 'domador-trie',
    name: 'Domador de TRIE',
    description: 'Sequencias corretas em TRIE recebem multiplicador de pontuacao.',
    effect: 'scoreMultiplier',
    structureTag: 'trie',
    value: 2,
  },
  {
    id: 'sem-colisao',
    name: 'Sem Colisao',
    description: 'Previne a primeira perda de foco causada por erro em desafio de hash.',
    effect: 'preventFocusLoss',
    structureTag: 'hash',
    value: 1,
  },
  {
    id: 'complexidade-perfeita',
    name: 'Complexidade Perfeita',
    description: 'Acertar a carta de complexidade gera recompensa extra.',
    effect: 'extraReward',
    value: 1,
  },
  {
    id: 'professor-inventou',
    name: 'Professor Inventou Isso Agora',
    description: 'Encontros elite e chefe rendem bonus de pontuacao.',
    effect: 'scoreBonus',
    value: 15,
  },
] as const satisfies readonly Passive[];

export type PassiveId = (typeof passiveLibrary)[number]['id'];

export const passiveById = passiveLibrary.reduce(
  (lookup, passive) => {
    lookup[passive.id] = passive;
    return lookup;
  },
  {} as Record<PassiveId, Passive>,
);

const passiveLookup: Readonly<Partial<Record<string, Passive>>> = passiveById;

export function getPassiveById(id: string): Passive | undefined {
  return passiveLookup[id];
}
