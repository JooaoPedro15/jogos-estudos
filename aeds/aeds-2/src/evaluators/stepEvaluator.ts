import type { ChallengeStep, ClickStep, TypeCodeStep } from '../types/challenge';

/**
 * Estado puro da resolução de uma sequência de etapas (quiz). Cada `resolveStep`
 * recebe o progresso atual e devolve um novo objeto, sem mutar a entrada.
 *
 * Extraído do antigo `stepEngine.ts`, SEM a lógica de efeitos de carta (escudo,
 * dobrar, eliminar alternativa, energia) — isso pertencia à moldura roguelike,
 * descartada. Aqui ficam apenas avaliação de resposta e avanço de etapa.
 */
export type StepProgress = {
  challengeId: string;
  totalSteps?: number;
  stepIndex: number;
  resolvedStepIds: string[];
  stepErrors: Record<string, number>;
  score: number;
  complete: boolean;
};

export type StepAnswer =
  | { kind: 'choice'; optionId: string }
  | { kind: 'gap'; text: string }
  | { kind: 'blocks'; order: string[] }
  | { kind: 'click'; nodeIds: string[] }
  | { kind: 'fix'; lineIndex: number; fixId: string }
  | { kind: 'code'; text: string }
  | { kind: 'review' };

export type StepResult = {
  correct: boolean;
  feedback: string;
  mistakeId?: string;
  scoreDelta: number;
  activePath?: string[];
  activeNodeId?: string;
  complete: boolean;
};

/** Pontuação base de uma etapa resolvida corretamente. */
export const BASE_STEP_SCORE = 10;

const DEFAULT_CORRECT_FEEDBACK = 'Resposta correta.';
const DEFAULT_WRONG_FEEDBACK = 'Resposta incorreta. Reveja o raciocinio da etapa.';

export function createStepProgress(challengeId: string, totalSteps?: number): StepProgress {
  return {
    challengeId,
    ...(totalSteps === undefined ? {} : { totalSteps }),
    stepIndex: 0,
    resolvedStepIds: [],
    stepErrors: {},
    score: 0,
    complete: false,
  };
}

export function resolveStep(
  progress: StepProgress,
  step: ChallengeStep,
  answer: StepAnswer,
): { progress: StepProgress; result: StepResult } {
  const correct = isAnswerCorrect(step, answer);

  return correct ? resolveCorrect(progress, step) : resolveWrong(progress, step);
}

function resolveCorrect(
  progress: StepProgress,
  step: ChallengeStep,
): { progress: StepProgress; result: StepResult } {
  const isReview = step.kind === 'revisao';
  const scoreDelta = isReview ? 0 : BASE_STEP_SCORE;
  const nextStepIndex = progress.stepIndex + 1;
  const complete = isProgressComplete(progress, nextStepIndex);

  const next: StepProgress = {
    ...progress,
    stepIndex: nextStepIndex,
    resolvedStepIds: [...progress.resolvedStepIds, step.id],
    score: progress.score + scoreDelta,
    complete,
  };

  const result: StepResult = {
    correct: true,
    feedback: step.explanation ?? DEFAULT_CORRECT_FEEDBACK,
    scoreDelta,
    activePath: step.activePath,
    activeNodeId: step.activeNodeId,
    complete,
  };

  return { progress: next, result };
}

function resolveWrong(
  progress: StepProgress,
  step: ChallengeStep,
): { progress: StepProgress; result: StepResult } {
  const nextStepIndex = progress.stepIndex + 1;
  const complete = isProgressComplete(progress, nextStepIndex);

  const next: StepProgress = {
    ...progress,
    stepIndex: nextStepIndex,
    resolvedStepIds: [...progress.resolvedStepIds, step.id],
    stepErrors: {
      ...progress.stepErrors,
      [step.id]: (progress.stepErrors[step.id] ?? 0) + 1,
    },
    complete,
  };

  const result: StepResult = {
    correct: false,
    feedback: buildWrongFeedback(step),
    mistakeId: step.mistakeId,
    scoreDelta: 0,
    activePath: step.activePath,
    activeNodeId: step.activeNodeId,
    complete,
  };

  return { progress: next, result };
}

function isProgressComplete(progress: StepProgress, nextStepIndex: number): boolean {
  return progress.totalSteps !== undefined && nextStepIndex >= progress.totalSteps;
}

function buildWrongFeedback(step: ChallengeStep): string {
  if (step.explanation && step.explanation.trim().length > 0) {
    return step.explanation;
  }

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
    case 'clique':
      return answer.kind === 'click' && isClickCorrect(step, answer.nodeIds);
    case 'corrigir':
      return (
        answer.kind === 'fix' &&
        answer.lineIndex === step.wrongLineIndex &&
        answer.fixId === step.correctFixId
      );
    case 'digitar':
      return answer.kind === 'code' && isCodeCorrect(step, answer.text);
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

function isGapCorrect(step: Extract<ChallengeStep, { kind: 'lacuna' }>, text: string): boolean {
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
 * Valida um conjunto de cliques em nós do diagrama.
 * - `selectionMode === 'ordered'`: a sequência deve ser exatamente `targetNodeIds`.
 * - padrão (`'unordered'`): o conjunto de cliques deve ser igual ao conjunto de
 *   alvos, em qualquer ordem.
 */
function isClickCorrect(step: ClickStep, nodeIds: string[]): boolean {
  if (step.selectionMode === 'ordered') {
    return isOrderEqual(nodeIds, step.targetNodeIds);
  }

  const submitted = new Set(nodeIds);
  const target = new Set(step.targetNodeIds);

  if (submitted.size !== target.size) {
    return false;
  }

  return [...target].every((id) => submitted.has(id));
}

function isCodeCorrect(step: TypeCodeStep, text: string): boolean {
  const normalizedInput = normalizeCode(text);
  const accepted = [step.expected, ...(step.aliases ?? [])];

  return accepted.some((candidate) => normalizeCode(candidate) === normalizedInput);
}

/**
 * Normalização fixa da lacuna: trim + lowercase + remoção de acentos.
 */
export function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/**
 * Normalização de código digitado: além da normalização de texto, remove
 * todos os espaços em branco e ponto-e-vírgula finais. Compara apenas os
 * tokens — indentação e estilo não reprovam a resposta.
 */
export function normalizeCode(value: string): string {
  return normalizeText(value).replace(/\s+/g, '').replace(/;+$/, '');
}
