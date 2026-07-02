import { evaluateStep, getStepMaxScore } from './evaluator';
import type { ExamBlueprint, ExamStep, StepAnswer } from '../types/content';
import type { ExamSession, StepAttempt } from '../types/progress';

export function createExamSession(blueprint: ExamBlueprint): ExamSession {
  return {
    blueprintId: blueprint.id,
    currentQuestionIndex: 0,
    currentStepIndex: 0,
    score: 0,
    maxScore: blueprint.questions.reduce(
      (total, question) => total + question.steps.reduce((sum, step) => sum + getStepMaxScore(step), 0),
      0,
    ),
    attempts: [],
    completed: blueprint.questions.length === 0,
  };
}

export function getCurrentStep(blueprint: ExamBlueprint, session: ExamSession): ExamStep | undefined {
  return blueprint.questions[session.currentQuestionIndex]?.steps[session.currentStepIndex];
}

export function answerCurrentStep(
  blueprint: ExamBlueprint,
  session: ExamSession,
  answer: StepAnswer,
): ExamSession {
  if (session.completed) {
    return session;
  }

  const question = blueprint.questions[session.currentQuestionIndex];
  const step = question?.steps[session.currentStepIndex];

  if (!question || !step) {
    return { ...session, completed: true };
  }

  const result = evaluateStep(step, answer);
  const attempt: StepAttempt = {
    questionId: question.id,
    stepId: step.id,
    domainId: question.domainId,
    skillId: step.skillId,
    format: question.format,
    correct: result.correct,
    scoreDelta: result.scoreDelta,
    feedback: result.feedback,
    mistakeTag: result.mistakeTag,
  };
  const nextPosition = getNextPosition(blueprint, session.currentQuestionIndex, session.currentStepIndex);

  return {
    ...session,
    currentQuestionIndex: nextPosition.questionIndex,
    currentStepIndex: nextPosition.stepIndex,
    score: session.score + result.scoreDelta,
    attempts: [...session.attempts, attempt],
    completed: nextPosition.completed,
  };
}

function getNextPosition(
  blueprint: ExamBlueprint,
  questionIndex: number,
  stepIndex: number,
): { questionIndex: number; stepIndex: number; completed: boolean } {
  const question = blueprint.questions[questionIndex];
  const nextStepIndex = stepIndex + 1;

  if (question && nextStepIndex < question.steps.length) {
    return { questionIndex, stepIndex: nextStepIndex, completed: false };
  }

  const nextQuestionIndex = questionIndex + 1;

  if (nextQuestionIndex < blueprint.questions.length) {
    return { questionIndex: nextQuestionIndex, stepIndex: 0, completed: false };
  }

  return {
    questionIndex: Math.max(0, blueprint.questions.length - 1),
    stepIndex,
    completed: true,
  };
}
