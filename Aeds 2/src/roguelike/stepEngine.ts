import type { ChallengeStep } from '../types/challenge';
import type { ToolEffect } from '../cards/cardTypes';

/**
 * Estado puro da resolução de um encontro-quiz. Cada `resolveStep`/`applyToolEffect`
 * recebe o progresso atual e devolve um novo objeto, sem mutar a entrada.
 *
 * Observação sobre `complete`/`encounterComplete`: `resolveStep` não conhece o total
 * de etapas do desafio (sua assinatura recebe apenas a etapa atual), portanto não
 * decide o fim do encontro. Quem fecha o encontro é o `runEngine` (`answerStep`),
 * que compara `stepIndex` com `challenge.steps.length` e seta esses campos.
 */
export type EncounterProgress = {
  challengeId: string;
  stepIndex: number;
  resolvedStepIds: string[];
  stepErrors: Record<string, number>;
  revealedHintStepIds: string[];
  eliminatedOptionIds: Record<string, string[]>; // stepId -> optionIds removidos
  scoreThisEncounter: number;
  doubleNextScore: boolean;
  focusShield: boolean;
  complete: boolean;
};

export type StepAnswer =
  | { kind: 'choice'; optionId: string }
  | { kind: 'gap'; text: string }
  | { kind: 'blocks'; order: string[] }
  | { kind: 'review' }; // avança

export type StepResult = {
  correct: boolean;
  feedback: string; // explanation ou descrição do commonMistake
  mistakeId?: string;
  scoreDelta: number;
  focusLost: number; // 0 ou 1 (0 se escudo/pular)
  activePath?: string[];
  activeNodeId?: string;
  encounterComplete: boolean;
};

/** Pontuação base de uma etapa resolvida corretamente. */
export const BASE_STEP_SCORE = 10;

const DEFAULT_CORRECT_FEEDBACK = 'Resposta correta.';
const DEFAULT_WRONG_FEEDBACK = 'Resposta incorreta. Reveja o raciocinio da etapa.';

export function createEncounterProgress(challengeId: string): EncounterProgress {
  return {
    challengeId,
    stepIndex: 0,
    resolvedStepIds: [],
    stepErrors: {},
    revealedHintStepIds: [],
    eliminatedOptionIds: {},
    scoreThisEncounter: 0,
    doubleNextScore: false,
    focusShield: false,
    complete: false,
  };
}

export function resolveStep(
  progress: EncounterProgress,
  step: ChallengeStep,
  answer: StepAnswer,
): { progress: EncounterProgress; result: StepResult } {
  const correct = isAnswerCorrect(step, answer);

  return correct
    ? resolveCorrect(progress, step)
    : resolveWrong(progress, step);
}

function resolveCorrect(
  progress: EncounterProgress,
  step: ChallengeStep,
): { progress: EncounterProgress; result: StepResult } {
  // `revisao` apenas avança: sem score e sem risco de foco.
  const isReview = step.kind === 'revisao';
  const multiplier = !isReview && progress.doubleNextScore ? 2 : 1;
  const scoreDelta = isReview ? 0 : BASE_STEP_SCORE * multiplier;

  const next: EncounterProgress = {
    ...progress,
    stepIndex: progress.stepIndex + 1,
    resolvedStepIds: [...progress.resolvedStepIds, step.id],
    scoreThisEncounter: progress.scoreThisEncounter + scoreDelta,
    // O dobrador é consumido apenas quando de fato multiplicou um acerto pontuável.
    doubleNextScore: isReview ? progress.doubleNextScore : false,
  };

  const result: StepResult = {
    correct: true,
    feedback: step.explanation ?? DEFAULT_CORRECT_FEEDBACK,
    scoreDelta,
    focusLost: 0,
    activePath: step.activePath,
    activeNodeId: step.activeNodeId,
    encounterComplete: false,
  };

  return { progress: next, result };
}

function resolveWrong(
  progress: EncounterProgress,
  step: ChallengeStep,
): { progress: EncounterProgress; result: StepResult } {
  const shielded = progress.focusShield;
  const focusLost = shielded ? 0 : 1;

  const next: EncounterProgress = {
    ...progress,
    stepIndex: progress.stepIndex + 1,
    // Erro também avança a etapa (revela a resposta, não trava o jogador).
    resolvedStepIds: [...progress.resolvedStepIds, step.id],
    stepErrors: {
      ...progress.stepErrors,
      [step.id]: (progress.stepErrors[step.id] ?? 0) + 1,
    },
    // O escudo segura no máximo um erro e é consumido aqui.
    focusShield: false,
  };

  const result: StepResult = {
    correct: false,
    feedback: buildWrongFeedback(step),
    mistakeId: step.mistakeId,
    scoreDelta: 0,
    focusLost,
    activePath: step.activePath,
    activeNodeId: step.activeNodeId,
    encounterComplete: false,
  };

  return { progress: next, result };
}

function buildWrongFeedback(step: ChallengeStep): string {
  if (step.explanation && step.explanation.trim().length > 0) {
    return step.explanation;
  }

  // Sem explanation; o id do erro comum é propagado em `mistakeId` para que a
  // camada superior resolva o texto completo via `challenge.commonMistakes`.
  return DEFAULT_WRONG_FEEDBACK;
}

function isAnswerCorrect(step: ChallengeStep, answer: StepAnswer): boolean {
  switch (step.kind) {
    case 'interpretar':
    case 'simular':
    case 'complexidade':
      return answer.kind === 'choice' && answer.optionId === step.correctOptionId;
    case 'lacuna':
      return answer.kind === 'gap' && isGapCorrect(step, answer.text);
    case 'blocos':
      return answer.kind === 'blocks' && isOrderEqual(answer.order, step.correctOrder);
    case 'revisao':
      return true;
    default: {
      // Exhaustiveness guard: se um novo tipo de etapa surgir, falha na compilação.
      const exhaustiveCheck: never = step;
      void exhaustiveCheck;
      return false;
    }
  }
}

function isGapCorrect(
  step: Extract<ChallengeStep, { kind: 'lacuna' }>,
  text: string,
): boolean {
  const normalizedInput = normalizeText(text);

  return step.answers.some((gapAnswer) => {
    const accepted = [gapAnswer.answer, ...(gapAnswer.aliases ?? [])];
    return accepted.some((candidate) => normalizeText(candidate) === normalizedInput);
  });
}

function isOrderEqual(submitted: readonly string[], expected: readonly string[]): boolean {
  if (submitted.length !== expected.length) {
    return false;
  }

  return submitted.every((blockId, index) => blockId === expected[index]);
}

/**
 * Normalização fixa da lacuna: trim + lowercase + remoção de acentos.
 * Mantida idêntica ao contrato para a UI poder confiar no comportamento.
 */
export function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export type { ToolEffect };

/** Energia padrão devolvida por `energiaExtra` quando a carta não define `effectValue`. */
const DEFAULT_EXTRA_ENERGY = 2;

/**
 * Aplica o efeito de uma carta-ferramenta ao progresso do encontro. Função pura:
 * devolve um novo `progress`, o `energyDelta` (energia a creditar/debitar no run)
 * e uma `message` curta para a UI. `step` pode ser `undefined` quando não há etapa
 * ativa (ex.: encontro já concluído) — nesse caso efeitos de etapa não fazem nada.
 */
export function applyToolEffect(
  progress: EncounterProgress,
  step: ChallengeStep | undefined,
  effect: ToolEffect,
  effectValue: number | undefined,
): { progress: EncounterProgress; energyDelta: number; message: string } {
  switch (effect) {
    case 'revelarDica':
      return revealHint(progress, step);
    case 'eliminarAlternativa':
      return eliminateOption(progress, step);
    case 'pularEtapa':
      return skipStep(progress, step);
    case 'escudoFoco':
      return {
        progress: { ...progress, focusShield: true },
        energyDelta: 0,
        message: 'Escudo de foco ativado: o proximo erro nao custa foco.',
      };
    case 'dobrarScore':
      return {
        progress: { ...progress, doubleNextScore: true },
        energyDelta: 0,
        message: 'Aposta dobrada: o proximo acerto vale o dobro.',
      };
    case 'energiaExtra': {
      const delta = effectValue ?? DEFAULT_EXTRA_ENERGY;
      return {
        progress,
        energyDelta: delta,
        message: `Energia recuperada: +${delta}.`,
      };
    }
    default: {
      const exhaustiveCheck: never = effect;
      void exhaustiveCheck;
      return { progress, energyDelta: 0, message: '' };
    }
  }
}

function revealHint(
  progress: EncounterProgress,
  step: ChallengeStep | undefined,
): { progress: EncounterProgress; energyDelta: number; message: string } {
  if (!step || progress.revealedHintStepIds.includes(step.id)) {
    return { progress, energyDelta: 0, message: 'Nenhuma dica nova para revelar.' };
  }

  return {
    progress: {
      ...progress,
      revealedHintStepIds: [...progress.revealedHintStepIds, step.id],
    },
    energyDelta: 0,
    message: 'Dica revelada.',
  };
}

function eliminateOption(
  progress: EncounterProgress,
  step: ChallengeStep | undefined,
): { progress: EncounterProgress; energyDelta: number; message: string } {
  if (!step || !stepHasOptions(step)) {
    return { progress, energyDelta: 0, message: 'Esta etapa nao tem alternativas para eliminar.' };
  }

  const alreadyEliminated = progress.eliminatedOptionIds[step.id] ?? [];
  const wrongOptionIds = step.options
    .map((option) => option.id)
    .filter((optionId) => optionId !== step.correctOptionId);
  const remainingWrong = wrongOptionIds.filter((optionId) => !alreadyEliminated.includes(optionId));

  // Mantém pelo menos uma alternativa errada para preservar uma escolha real.
  if (remainingWrong.length <= 1) {
    return { progress, energyDelta: 0, message: 'Nao ha mais alternativas seguras para eliminar.' };
  }

  const removed = remainingWrong[0];

  return {
    progress: {
      ...progress,
      eliminatedOptionIds: {
        ...progress.eliminatedOptionIds,
        [step.id]: [...alreadyEliminated, removed],
      },
    },
    energyDelta: 0,
    message: 'Uma alternativa incorreta foi eliminada.',
  };
}

function skipStep(
  progress: EncounterProgress,
  step: ChallengeStep | undefined,
): { progress: EncounterProgress; energyDelta: number; message: string } {
  if (!step) {
    return { progress, energyDelta: 0, message: 'Nenhuma etapa ativa para pular.' };
  }

  return {
    progress: {
      ...progress,
      stepIndex: progress.stepIndex + 1,
      resolvedStepIds: progress.resolvedStepIds.includes(step.id)
        ? progress.resolvedStepIds
        : [...progress.resolvedStepIds, step.id],
    },
    energyDelta: 0,
    message: 'Etapa pulada sem ganho de pontuacao.',
  };
}

function stepHasOptions(
  step: ChallengeStep,
): step is Extract<ChallengeStep, { kind: 'interpretar' | 'simular' | 'complexidade' }> {
  return step.kind === 'interpretar' || step.kind === 'simular' || step.kind === 'complexidade';
}
