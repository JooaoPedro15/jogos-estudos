import { rewardableCardIds } from '../cards/cardLibrary';
import type { CardId } from '../cards/cardLibrary';
import { challengeBank } from '../challenges/challengeBank';
import type { Challenge, StructureKind } from '../types/challenge';

export type EncounterKind = 'normal' | 'elite' | 'shop' | 'rest' | 'boss';

export type EncounterSpecialRule = 'requiresComplexity' | 'lowEnergy' | 'noHint';

export type Encounter = {
  id: string;
  act: number;
  kind: EncounterKind;
  challengeId: string;
  /** Cartas-ferramenta oferecidas como recompensa ao vencer o encontro. */
  rewardCardIds: CardId[];
  specialRule?: EncounterSpecialRule;
};

const challengeById = new Map(challengeBank.map((challenge) => [challenge.id, challenge]));

type EncounterBlueprint = Omit<Encounter, 'rewardCardIds'> & {
  rewardCardIds?: CardId[];
};

const encounterBlueprints: EncounterBlueprint[] = [
  { id: 'ato1-abb-pesquisa', act: 1, kind: 'normal', challengeId: 'abb-pesquisar-01' },
  { id: 'ato1-abb-folhas', act: 1, kind: 'normal', challengeId: 'abb-contar-folhas-01' },
  {
    id: 'ato1-avl-fator',
    act: 1,
    kind: 'elite',
    challengeId: 'avl-fator-01',
    specialRule: 'lowEnergy',
  },
  {
    id: 'ato2-avl-balanceamento',
    act: 2,
    kind: 'normal',
    challengeId: 'avl-verificar-balanceamento-01',
  },
  {
    id: 'ato2-alvinegra-brancos',
    act: 2,
    kind: 'normal',
    challengeId: 'alvinegra-contar-brancos-01',
  },
  {
    id: 'ato2-alvinegra-tipo-quatro',
    act: 2,
    kind: 'elite',
    challengeId: 'alvinegra-tipo-quatro-01',
    specialRule: 'noHint',
  },
  {
    id: 'ato3-hash-reserva',
    act: 3,
    kind: 'normal',
    challengeId: 'hash-pesquisar-reserva-01',
  },
  {
    id: 'ato3-hash-rehash',
    act: 3,
    kind: 'elite',
    challengeId: 'hash-rehash-colisao-01',
    specialRule: 'lowEnergy',
  },
  {
    id: 'ato3-trie-palavra',
    act: 3,
    kind: 'normal',
    challengeId: 'trie-pesquisar-palavra-01',
  },
  {
    id: 'ato4-binaria-ismax',
    act: 4,
    kind: 'normal',
    challengeId: 'binaria-ismax-01',
  },
  {
    id: 'ato4-binaria-caminho',
    act: 4,
    kind: 'elite',
    challengeId: 'binaria-maior-caminho-01',
    specialRule: 'lowEnergy',
  },
  {
    id: 'ato5-doidona-pesquisa',
    act: 5,
    kind: 'normal',
    challengeId: 'doidona-pesquisar-palavra-01',
  },
  {
    id: 'ato5-doidona-insercao',
    act: 5,
    kind: 'elite',
    challengeId: 'doidona-inserir-camadas-01',
    specialRule: 'noHint',
  },
  {
    id: 'chefe-guardiao-complexidade',
    act: 5,
    kind: 'boss',
    challengeId: 'trie-verificar-prefixo-01',
    specialRule: 'requiresComplexity',
  },
];

const DEFAULT_REWARD_COUNT = 3;

/**
 * Oferece um pequeno conjunto rotativo de cartas-ferramenta como recompensa.
 * Determinístico (depende apenas do índice do encontro), sem `Math.random`.
 */
function defaultRewardCardIds(encounterIndex: number): CardId[] {
  if (rewardableCardIds.length === 0) {
    return [];
  }

  const rewards: CardId[] = [];
  for (let offset = 0; offset < DEFAULT_REWARD_COUNT; offset += 1) {
    const pick = rewardableCardIds[(encounterIndex + offset) % rewardableCardIds.length];
    rewards.push(pick);
  }

  return rewards;
}

export function createEncounterRun(): Encounter[] {
  return encounterBlueprints.map((blueprint, index) => ({
    ...blueprint,
    rewardCardIds: blueprint.rewardCardIds
      ? [...blueprint.rewardCardIds]
      : defaultRewardCardIds(index),
  }));
}

export const encounterRun: Encounter[] = createEncounterRun();

export function getEncounterChallenge(encounter: Encounter): Challenge | undefined {
  return challengeById.get(encounter.challengeId);
}

export function getEncounterStructure(encounter: Encounter): StructureKind | undefined {
  return getEncounterChallenge(encounter)?.structure;
}
