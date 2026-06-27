import type { CardId } from '../cards/cardLibrary';
import type { PassiveId } from '../cards/passiveLibrary';
import type { Encounter } from './encounterFactory';
import type { CardCombo } from '../cards/cardCombos';
import type { EncounterProgress, StepResult } from './stepEngine';

export type RunPhase = 'encounter' | 'reward' | 'victory' | 'defeat';

/**
 * Resultado da última ação de resolução do encontro. Mantém os campos que a UI
 * legada lê (`feedback`, `scoreAwarded`, `activeCombos`) e adiciona o
 * `stepResult` puro vindo do `stepEngine` para a UI nova consumir.
 */
export type RunResolutionResult = {
  correct: boolean;
  feedback: string;
  scoreAwarded: number;
  coinsAwarded: number;
  focusLost: number;
  activeCombos: CardCombo[];
  preventedFocusLossBy?: PassiveId;
  stepResult?: StepResult;
};

export type RunState = {
  phase: RunPhase;
  focus: number;
  maxFocus: number;
  energy: number;
  maxEnergy: number;
  coins: number;
  score: number;
  deckCardIds: CardId[];
  handCardIds: CardId[];
  playedCardIds: CardId[];
  discardCardIds: CardId[];
  passiveIds: PassiveId[];
  consumedPassiveIds: PassiveId[];
  usedEncounterPassiveIds: PassiveId[];
  encounterIndex: number;
  encounters: Encounter[];
  /** Estado de resolução (quiz) do encontro atual. */
  progress: EncounterProgress;
  lastResult?: RunResolutionResult;
  lastMessage?: string;
};

export type CreateRunOptions = Partial<
  Pick<
    RunState,
    | 'phase'
    | 'focus'
    | 'maxFocus'
    | 'energy'
    | 'maxEnergy'
    | 'coins'
    | 'score'
    | 'deckCardIds'
    | 'handCardIds'
    | 'playedCardIds'
    | 'discardCardIds'
    | 'passiveIds'
    | 'consumedPassiveIds'
    | 'usedEncounterPassiveIds'
    | 'encounterIndex'
    | 'encounters'
    | 'progress'
  >
> & {
  /** RNG injetável para a compra de mão (testes determinísticos). */
  rng?: () => number;
};
