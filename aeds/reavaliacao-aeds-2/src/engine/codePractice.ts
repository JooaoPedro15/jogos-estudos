import { evaluateStep } from './evaluator';
import type { CodeDrill, StepAnswer } from '../types/content';
import type { PracticeMode, PracticeSession, StepAttempt } from '../types/progress';

type PracticeSessionOptions = {
  mode: PracticeMode;
  targetCount?: number;
};

export function createPracticeSession(drills: CodeDrill[], options: PracticeSessionOptions): PracticeSession {
  return {
    mode: options.mode,
    targetCount: options.mode === 'quick' ? (options.targetCount ?? 2) : undefined,
    currentDrillIndex: 0,
    completedCount: 0,
    score: 0,
    attempts: [],
    completed: drills.length === 0,
  };
}

export function getCurrentPracticeDrill(
  drills: CodeDrill[],
  session: PracticeSession,
): CodeDrill | undefined {
  if (session.completed || drills.length === 0) {
    return undefined;
  }

  return drills[session.currentDrillIndex % drills.length];
}

export function answerCurrentPracticeStep(
  drills: CodeDrill[],
  session: PracticeSession,
  answer: StepAnswer,
): PracticeSession {
  const drill = getCurrentPracticeDrill(drills, session);

  if (!drill) {
    return session;
  }

  const result = evaluateStep(drill.step, answer);
  const completedCount = session.completedCount + 1;
  const completed = session.mode === 'quick' && completedCount >= (session.targetCount ?? 2);
  const attempt: StepAttempt = {
    questionId: drill.id,
    stepId: drill.step.id,
    domainId: drill.domainId,
    skillId: drill.step.skillId,
    format: drill.format,
    correct: result.correct,
    scoreDelta: result.scoreDelta,
    feedback: result.feedback,
    mistakeTag: result.mistakeTag,
  };

  return {
    ...session,
    currentDrillIndex: completed ? session.currentDrillIndex : session.currentDrillIndex + 1,
    completedCount,
    score: session.score + result.scoreDelta,
    attempts: [...session.attempts, attempt],
    completed,
  };
}

export function getPracticeProgressLabel(session: PracticeSession): string {
  if (session.mode === 'marathon') {
    return `${session.completedCount}`;
  }

  return `${session.completedCount}/${session.targetCount ?? 2}`;
}
