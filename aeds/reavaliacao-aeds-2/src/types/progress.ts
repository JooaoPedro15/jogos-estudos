import type { DomainId, MistakeTag, QuestionFormat, SkillId } from './content';

export type SkillProgress = Partial<Record<SkillId, boolean>>;

export type DomainProgress = Partial<Record<DomainId, SkillProgress>>;

export type GameProgress = {
  domains: DomainProgress;
};

export type StepAttempt = {
  questionId: string;
  stepId: string;
  domainId: DomainId;
  skillId: SkillId;
  format: QuestionFormat;
  correct: boolean;
  scoreDelta: number;
  feedback: string;
  mistakeTag?: MistakeTag;
};

export type ExamSession = {
  blueprintId: string;
  currentQuestionIndex: number;
  currentStepIndex: number;
  score: number;
  maxScore: number;
  attempts: StepAttempt[];
  completed: boolean;
};

export type ErrorRecord = {
  id: string;
  challengeId: string;
  domainId: DomainId;
  skillId: SkillId;
  questionFormat: QuestionFormat;
  mistakeTag: MistakeTag;
  attempts: number;
  lastSeenAt: string;
  resolvedStreak: number;
  resolved: boolean;
};

export type ErrorNotebook = {
  records: ErrorRecord[];
};
