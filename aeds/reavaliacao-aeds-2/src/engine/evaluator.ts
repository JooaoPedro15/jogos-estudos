import type { ChallengeStep, StepAnswer, StepResult } from '../types/content';

export const DEFAULT_STEP_SCORE = 10;

export function getStepMaxScore(step: ChallengeStep): number {
  return step.score ?? DEFAULT_STEP_SCORE;
}

export function evaluateStep(step: ChallengeStep, answer: StepAnswer): StepResult {
  if (step.kind === 'choice' && answer.kind === 'choice') {
    const correct = answer.optionId === step.correctOptionId;
    if (correct) {
      return {
        correct: true,
        scoreDelta: getStepMaxScore(step),
        feedback: step.explanation ?? 'Resposta correta.',
      };
    }

    const selectedOption = step.options.find((option) => option.id === answer.optionId);

    return {
      correct: false,
      scoreDelta: 0,
      feedback: 'Resposta incorreta.',
      mistakeTag: selectedOption?.mistakeTag,
    };
  }

  if (step.kind === 'rubric' && answer.kind === 'choice') {
    const correct = step.acceptableOptionIds.includes(answer.optionId);
    if (correct) {
      return correctResult(step.score, step.explanation);
    }

    const selectedOption = step.options.find((option) => option.id === answer.optionId);
    return incorrectResult(selectedOption?.mistakeTag);
  }

  if (step.kind === 'gap' && answer.kind === 'text') {
    const correct = step.answers.some((acceptedAnswer) =>
      normalizeCodeLikeText(acceptedAnswer) === normalizeCodeLikeText(answer.text),
    );

    return correct ? correctResult(step.score, step.explanation) : incorrectResult(step.mistakeTag);
  }

  if (step.kind === 'code' && answer.kind === 'text') {
    const correct = step.acceptedAnswers.some((acceptedAnswer) =>
      normalizeCodeLikeText(acceptedAnswer) === normalizeCodeLikeText(answer.text),
    );

    return correct ? correctResult(step.score, step.explanation) : incorrectResult(step.mistakeTag);
  }

  if (step.kind === 'function' && answer.kind === 'text') {
    const normalizedAnswer = normalizeCodeLikeText(answer.text);
    const missingRequirements = step.requiredFragments.filter(
      (requirement) => !normalizedAnswer.includes(normalizeCodeLikeText(requirement.code)),
    );

    if (missingRequirements.length === 0) {
      return correctResult(step.score, step.explanation);
    }

    return {
      correct: false,
      scoreDelta: 0,
      feedback: `Faltou: ${missingRequirements.map((requirement) => requirement.label).join(', ')}.`,
      mistakeTag: missingRequirements[0]?.mistakeTag ?? step.mistakeTag,
    };
  }

  if (step.kind === 'blocks' && answer.kind === 'blocks') {
    const correct =
      step.correctOrder.length === answer.order.length &&
      step.correctOrder.every((blockId, index) => blockId === answer.order[index]);

    return correct ? correctResult(step.score, step.explanation) : incorrectResult(step.mistakeTag);
  }

  if (step.kind === 'fix' && answer.kind === 'fix') {
    const correct = step.correctLineIndex === answer.lineIndex && step.correctFixId === answer.fixId;
    if (correct) {
      return correctResult(step.score, step.explanation);
    }

    const selectedFix = step.fixOptions.find((option) => option.id === answer.fixId);
    return incorrectResult(selectedFix?.mistakeTag);
  }

  return {
    correct: false,
    scoreDelta: 0,
    feedback: 'Tipo de resposta incompativel com a etapa.',
  };
}

function correctResult(score: number | undefined, explanation: string | undefined): StepResult {
  return {
    correct: true,
    scoreDelta: score ?? DEFAULT_STEP_SCORE,
    feedback: explanation ?? 'Resposta correta.',
  };
}

function incorrectResult(mistakeTag: StepResult['mistakeTag']): StepResult {
  return {
    correct: false,
    scoreDelta: 0,
    feedback: 'Resposta incorreta.',
    mistakeTag,
  };
}

function normalizeCodeLikeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/;+$/g, '')
    .toLowerCase()
    .replace(/\s+/g, '');
}
