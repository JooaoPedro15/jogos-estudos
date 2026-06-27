import { cardById, startingDeckCardIds } from '../cards/cardLibrary';
import type { CardId } from '../cards/cardLibrary';
import { passiveById } from '../cards/passiveLibrary';
import type { PassiveId } from '../cards/passiveLibrary';
import {
  createEncounterRun,
  getEncounterChallenge,
  getEncounterStructure,
} from './encounterFactory';
import type { Encounter } from './encounterFactory';
import type { CreateRunOptions, RunResolutionResult, RunState } from './runState';
import { draw } from './deck';
import { scoreEncounter } from './scoring';
import {
  applyToolEffect,
  createEncounterProgress,
  resolveStep,
} from './stepEngine';
import type { EncounterProgress, StepAnswer, StepResult } from './stepEngine';
import type { Challenge, ChallengeStep } from '../types/challenge';

const STARTING_FOCUS = 3;
const DEFAULT_ENERGY = 4;
const LOW_ENERGY = 3;
const HAND_SIZE = 5;
const HASH_SHIELD_PASSIVE_ID: PassiveId = 'sem-colisao';
const ABB_DISCOUNT_PASSIVE_ID: PassiveId = 'olho-abb';
const ELITE_BONUS_PASSIVE_ID: PassiveId = 'professor-inventou';

export function createNewRun(options: CreateRunOptions = {}): RunState {
  const rng = options.rng;
  const encounters = options.encounters ?? createEncounterRun();
  const encounterIndex = options.encounterIndex ?? 0;
  const currentEncounter = encounters[encounterIndex];
  const maxEnergy = options.maxEnergy ?? getMaxEnergyForEncounter(currentEncounter);
  const deckCardIds = options.deckCardIds ?? [...startingDeckCardIds];
  const progress =
    options.progress ?? createEncounterProgress(currentEncounter?.challengeId ?? '');

  const drawn = options.handCardIds
    ? { hand: options.handCardIds, deck: deckCardIds, discard: options.discardCardIds ?? [] }
    : draw(deckCardIds, options.discardCardIds ?? [], HAND_SIZE, rng);

  return {
    phase: options.phase ?? 'encounter',
    focus: options.focus ?? STARTING_FOCUS,
    maxFocus: options.maxFocus ?? STARTING_FOCUS,
    energy: options.energy ?? maxEnergy,
    maxEnergy,
    coins: options.coins ?? 0,
    score: options.score ?? 0,
    deckCardIds: drawn.deck,
    handCardIds: drawn.hand,
    playedCardIds: options.playedCardIds ?? [],
    discardCardIds: drawn.discard,
    passiveIds: options.passiveIds ?? [],
    consumedPassiveIds: options.consumedPassiveIds ?? [],
    usedEncounterPassiveIds: options.usedEncounterPassiveIds ?? [],
    encounterIndex,
    encounters,
    progress,
  };
}

export function getCurrentEncounter(run: RunState): Encounter | undefined {
  return run.encounters[run.encounterIndex];
}

export function getCurrentChallenge(run: RunState): Challenge | undefined {
  const encounter = getCurrentEncounter(run);
  return encounter ? getEncounterChallenge(encounter) : undefined;
}

/** A etapa atual do encontro, ou `undefined` se o quiz já acabou. */
export function getCurrentStep(run: RunState): ChallengeStep | undefined {
  const challenge = getCurrentChallenge(run);
  return challenge?.steps[run.progress.stepIndex];
}

/** A mão de cartas-ferramenta disponível no encontro. */
export function getHand(run: RunState): CardId[] {
  return run.handCardIds;
}

export function getCardEnergyCost(run: RunState, cardId: CardId): number {
  const card = cardById[cardId];
  let cost = card.energyCost;

  if (shouldUseAbbDiscount(run, cardId)) {
    cost = Math.max(0, cost - passiveById[ABB_DISCOUNT_PASSIVE_ID].value);
  }

  return cost;
}

/**
 * Joga uma carta-ferramenta: valida energia, aplica o efeito ao progresso/energia
 * e move a carta da mão para o descarte (registrando em `playedCardIds` para combos).
 */
export function playCard(run: RunState, cardId: CardId): RunState {
  if (run.phase !== 'encounter') {
    return { ...run, lastMessage: 'Cartas so podem ser jogadas durante um encontro.' };
  }

  if (!run.handCardIds.includes(cardId)) {
    return { ...run, lastMessage: 'Essa carta nao esta na mao.' };
  }

  const energyCost = getCardEnergyCost(run, cardId);

  if (energyCost > run.energy) {
    return { ...run, lastMessage: 'Energia insuficiente para jogar essa carta.' };
  }

  const card = cardById[cardId];
  const step = getCurrentStep(run);
  const { progress, energyDelta, message } = applyToolEffect(
    run.progress,
    step,
    card.effect,
    card.effectValue,
  );

  const nextEnergy = Math.min(run.maxEnergy, run.energy - energyCost + energyDelta);

  return {
    ...run,
    energy: nextEnergy,
    progress,
    handCardIds: removeFirst(run.handCardIds, cardId),
    playedCardIds: [...run.playedCardIds, cardId],
    discardCardIds: [...run.discardCardIds, cardId],
    usedEncounterPassiveIds: shouldUseAbbDiscount(run, cardId)
      ? [...run.usedEncounterPassiveIds, ABB_DISCOUNT_PASSIVE_ID]
      : run.usedEncounterPassiveIds,
    lastMessage: message,
  };
}

/**
 * Responde a etapa atual do encontro. Resolve a etapa, ajusta foco/score e move
 * o run de fase quando o foco zera (derrota) ou o quiz termina (recompensa/vitória).
 */
export function answerStep(run: RunState, answer: StepAnswer): RunState {
  if (run.phase !== 'encounter') {
    return { ...run, lastMessage: 'So e possivel responder durante um encontro.' };
  }

  const challenge = getCurrentChallenge(run);
  const step = getCurrentStep(run);

  if (!challenge || !step) {
    return { ...run, lastMessage: 'Nao ha etapa para responder.' };
  }

  const { progress: resolvedProgress, result } = resolveStep(run.progress, step, answer);

  // Passiva: previne a primeira perda de foco em desafios de hash.
  const preventedFocusLossBy = getPreventedFocusLossPassive(run, result);
  const focusLost = preventedFocusLossBy ? 0 : result.focusLost;
  const nextFocus = Math.max(0, run.focus - focusLost);

  const encounterComplete = resolvedProgress.stepIndex >= challenge.steps.length;
  const stepResult: StepResult = { ...result, focusLost, encounterComplete };

  const consumedPassiveIds = preventedFocusLossBy
    ? [...run.consumedPassiveIds, preventedFocusLossBy]
    : run.consumedPassiveIds;

  // Derrota: foco zerado encerra a run imediatamente.
  if (nextFocus === 0) {
    return {
      ...run,
      phase: 'defeat',
      focus: 0,
      progress: { ...resolvedProgress, complete: false },
      consumedPassiveIds,
      lastResult: buildFailureResult(stepResult, preventedFocusLossBy),
      lastMessage: 'Foco zerado. A run acabou.',
    };
  }

  // Encontro ainda em andamento: avança para a próxima etapa.
  if (!encounterComplete) {
    return {
      ...run,
      focus: nextFocus,
      progress: resolvedProgress,
      consumedPassiveIds,
      lastResult: buildProgressResult(stepResult, preventedFocusLossBy),
      lastMessage: result.feedback,
    };
  }

  // Encontro concluído: pontua e vai para recompensa/vitória.
  return completeEncounter(run, {
    progress: { ...resolvedProgress, complete: true },
    focus: nextFocus,
    consumedPassiveIds,
    stepResult,
    preventedFocusLossBy,
  });
}

/**
 * Compatibilidade com a UI legada: resolve as etapas restantes como "pular"
 * (sem risco e sem score) e finaliza o encontro. A UI nova usa `answerStep`.
 */
export function resolveEncounter(run: RunState): RunState {
  if (run.phase !== 'encounter') {
    return run;
  }

  const challenge = getCurrentChallenge(run);

  if (!challenge) {
    return advanceEncounter(run);
  }

  let progress = run.progress;
  while (progress.stepIndex < challenge.steps.length) {
    const step = challenge.steps[progress.stepIndex];
    progress = applyToolEffect(progress, step, 'pularEtapa', undefined).progress;
  }

  return completeEncounter(run, {
    progress: { ...progress, complete: true },
    focus: run.focus,
    consumedPassiveIds: run.consumedPassiveIds,
    stepResult: undefined,
    preventedFocusLossBy: undefined,
  });
}

type CompleteEncounterContext = {
  progress: EncounterProgress;
  focus: number;
  consumedPassiveIds: PassiveId[];
  stepResult?: StepResult;
  preventedFocusLossBy?: PassiveId;
};

function completeEncounter(run: RunState, ctx: CompleteEncounterContext): RunState {
  const encounter = getCurrentEncounter(run);
  const flatBonus = getFlatScoreBonus(run, encounter);
  const scoreResult = scoreEncounter({
    stepScore: ctx.progress.scoreThisEncounter,
    playedCardIds: run.playedCardIds,
    flatBonus,
  });
  const coinsAwarded = getCoinReward(encounter);
  const finalEncounter = isFinalEncounter(run);
  const phase = finalEncounter ? 'victory' : 'reward';

  const lastResult: RunResolutionResult = {
    correct: true,
    feedback:
      phase === 'victory'
        ? 'Chefe derrotado. Run vencida.'
        : 'Encontro resolvido. Escolha uma recompensa.',
    scoreAwarded: scoreResult.score,
    coinsAwarded,
    focusLost: ctx.stepResult?.focusLost ?? 0,
    activeCombos: scoreResult.activeCombos,
    stepResult: ctx.stepResult,
  };

  return {
    ...run,
    phase,
    focus: ctx.focus,
    coins: run.coins + coinsAwarded,
    score: run.score + scoreResult.score,
    progress: ctx.progress,
    consumedPassiveIds: ctx.consumedPassiveIds,
    lastResult,
    lastMessage: lastResult.feedback,
  };
}

export function chooseCardReward(run: RunState, cardId: CardId): RunState {
  if (run.phase !== 'reward') {
    return { ...run, lastMessage: 'Recompensas so podem ser escolhidas apos vencer um encontro.' };
  }

  const encounter = getCurrentEncounter(run);

  if (encounter && !encounter.rewardCardIds.includes(cardId)) {
    return { ...run, lastMessage: 'Essa carta nao esta entre as recompensas deste encontro.' };
  }

  return advanceEncounter({
    ...run,
    deckCardIds: [...run.deckCardIds, cardId],
    lastMessage: `${cardById[cardId].name} entrou no deck.`,
  });
}

export function choosePassiveReward(run: RunState, passiveId: PassiveId): RunState {
  if (run.phase !== 'reward') {
    return { ...run, lastMessage: 'Passivas so podem ser escolhidas apos vencer um encontro.' };
  }

  const passiveIds = run.passiveIds.includes(passiveId)
    ? run.passiveIds
    : [...run.passiveIds, passiveId];

  return advanceEncounter({ ...run, passiveIds, lastMessage: `${passiveById[passiveId].name} ativado.` });
}

/**
 * Avança para o próximo encontro: novo `progress`, energia recarregada e mão
 * comprada via `deck.ts` (deck + descarte reembaralham conforme necessário).
 */
export function advanceEncounter(run: RunState, rng?: () => number): RunState {
  const nextEncounterIndex = run.encounterIndex + 1;

  if (nextEncounterIndex >= run.encounters.length) {
    return { ...run, phase: 'victory', lastMessage: 'Run concluida.' };
  }

  const nextEncounter = run.encounters[nextEncounterIndex];
  const maxEnergy = getMaxEnergyForEncounter(nextEncounter);
  // Cartas jogadas e mão antiga voltam para o descarte antes de comprar a nova mão.
  const recycledDiscard = [...run.discardCardIds, ...run.handCardIds];
  const drawn = draw(run.deckCardIds, recycledDiscard, HAND_SIZE, rng);

  return {
    ...run,
    phase: 'encounter',
    encounterIndex: nextEncounterIndex,
    maxEnergy,
    energy: maxEnergy,
    deckCardIds: drawn.deck,
    handCardIds: drawn.hand,
    discardCardIds: drawn.discard,
    playedCardIds: [],
    usedEncounterPassiveIds: [],
    progress: createEncounterProgress(nextEncounter.challengeId),
    lastResult: undefined,
  };
}

function buildProgressResult(
  stepResult: StepResult,
  preventedFocusLossBy: PassiveId | undefined,
): RunResolutionResult {
  return {
    correct: stepResult.correct,
    feedback: stepResult.feedback,
    scoreAwarded: stepResult.scoreDelta,
    coinsAwarded: 0,
    focusLost: stepResult.focusLost,
    activeCombos: [],
    preventedFocusLossBy,
    stepResult,
  };
}

function buildFailureResult(
  stepResult: StepResult,
  preventedFocusLossBy: PassiveId | undefined,
): RunResolutionResult {
  return {
    correct: false,
    feedback: 'Foco zerado. A run acabou.',
    scoreAwarded: 0,
    coinsAwarded: 0,
    focusLost: stepResult.focusLost,
    activeCombos: [],
    preventedFocusLossBy,
    stepResult,
  };
}

function getMaxEnergyForEncounter(encounter: Encounter | undefined): number {
  return encounter?.specialRule === 'lowEnergy' ? LOW_ENERGY : DEFAULT_ENERGY;
}

function removeFirst(cardIds: readonly CardId[], cardId: CardId): CardId[] {
  const index = cardIds.indexOf(cardId);

  if (index === -1) {
    return [...cardIds];
  }

  return [...cardIds.slice(0, index), ...cardIds.slice(index + 1)];
}

function shouldUseAbbDiscount(run: RunState, cardId: CardId): boolean {
  const encounter = getCurrentEncounter(run);
  const structure = encounter ? getEncounterStructure(encounter) : undefined;
  const card = cardById[cardId];

  return (
    run.passiveIds.includes(ABB_DISCOUNT_PASSIVE_ID) &&
    !run.usedEncounterPassiveIds.includes(ABB_DISCOUNT_PASSIVE_ID) &&
    structure === passiveById[ABB_DISCOUNT_PASSIVE_ID].structureTag &&
    card.structureTags.includes('abb')
  );
}

function getFlatScoreBonus(run: RunState, encounter: Encounter | undefined): number {
  if (!encounter) {
    return 0;
  }

  let bonus = 0;

  if (
    run.passiveIds.includes(ELITE_BONUS_PASSIVE_ID) &&
    (encounter.kind === 'elite' || encounter.kind === 'boss')
  ) {
    bonus += passiveById[ELITE_BONUS_PASSIVE_ID].value;
  }

  return bonus;
}

function getCoinReward(encounter: Encounter | undefined): number {
  if (!encounter) {
    return 0;
  }

  return encounter.kind === 'boss' ? 5 : encounter.kind === 'elite' ? 3 : 2;
}

function getPreventedFocusLossPassive(
  run: RunState,
  result: StepResult,
): PassiveId | undefined {
  if (result.correct || result.focusLost === 0) {
    return undefined;
  }

  const encounter = getCurrentEncounter(run);
  const structure = encounter ? getEncounterStructure(encounter) : undefined;

  if (
    run.passiveIds.includes(HASH_SHIELD_PASSIVE_ID) &&
    !run.consumedPassiveIds.includes(HASH_SHIELD_PASSIVE_ID) &&
    structure === passiveById[HASH_SHIELD_PASSIVE_ID].structureTag
  ) {
    return HASH_SHIELD_PASSIVE_ID;
  }

  return undefined;
}

function isFinalEncounter(run: RunState): boolean {
  return run.encounterIndex >= run.encounters.length - 1;
}
