export type DomainId = 'doidona' | 'trie' | 'avl' | 'arvore' | 'somatorio' | 'ordenacao';

export type QuestionFormat =
  | 'summation-from-code'
  | 'structure-simulation'
  | 'prove-or-refute'
  | 'algorithm-adaptation'
  | 'case-analysis'
  | 'composite-structure-method'
  | 'code-repetition'
  | 'code-modification';

export type SkillId = 'recognize' | 'simulate' | 'program' | 'justify';

export type MistakeTag =
  | 'wrong-case-analysis'
  | 'missing-base-case'
  | 'wrong-rotation'
  | 'lost-pointer'
  | 'prefix-vs-word'
  | 'incomplete-layer-search'
  | 'wrong-summation-bound'
  | 'algorithm-confusion';

export type Domain = {
  id: DomainId;
  title: string;
  shortTitle: string;
  examRole: string;
  skills: SkillId[];
};

export type StepOption = {
  id: string;
  label: string;
  mistakeTag?: MistakeTag;
};

export type CodeBlock = {
  id: string;
  label: string;
};

export type ChoiceStep = {
  id: string;
  kind: 'choice';
  prompt: string;
  options: StepOption[];
  correctOptionId: string;
  score?: number;
  explanation?: string;
};

export type GapStep = {
  id: string;
  kind: 'gap';
  prompt: string;
  answers: string[];
  score?: number;
  explanation?: string;
  mistakeTag?: MistakeTag;
};

export type BlocksStep = {
  id: string;
  kind: 'blocks';
  prompt: string;
  blocks: CodeBlock[];
  correctOrder: string[];
  score?: number;
  explanation?: string;
  mistakeTag?: MistakeTag;
};

export type FixStep = {
  id: string;
  kind: 'fix';
  prompt: string;
  lines: string[];
  correctLineIndex: number;
  fixOptions: StepOption[];
  correctFixId: string;
  score?: number;
  explanation?: string;
};

export type CodeStep = {
  id: string;
  kind: 'code';
  prompt: string;
  acceptedAnswers: string[];
  score?: number;
  explanation?: string;
  mistakeTag?: MistakeTag;
};

export type RubricStep = {
  id: string;
  kind: 'rubric';
  prompt: string;
  options: StepOption[];
  acceptableOptionIds: string[];
  score?: number;
  explanation?: string;
};

export type ChallengeStep = ChoiceStep | GapStep | BlocksStep | FixStep | CodeStep | RubricStep;

export type ExamStep = ChallengeStep & {
  skillId: SkillId;
};

export type ExamQuestion = {
  id: string;
  number: number;
  domainId: DomainId;
  format: QuestionFormat;
  title: string;
  stem: string;
  visual?: StructureVisual;
  steps: ExamStep[];
};

export type ExamBlueprint = {
  id: string;
  title: string;
  questions: ExamQuestion[];
};

export type PracticeVariation = {
  id: string;
  domainId: DomainId;
  skillId: SkillId;
  questionFormat: QuestionFormat;
  targetMistakeTag: MistakeTag;
  title: string;
  prompt: string;
};

export type ChoiceAnswer = {
  kind: 'choice';
  optionId: string;
};

export type TextAnswer = {
  kind: 'text';
  text: string;
};

export type BlocksAnswer = {
  kind: 'blocks';
  order: string[];
};

export type FixAnswer = {
  kind: 'fix';
  lineIndex: number;
  fixId: string;
};

export type StepAnswer = ChoiceAnswer | TextAnswer | BlocksAnswer | FixAnswer;

export type StepResult = {
  correct: boolean;
  scoreDelta: number;
  feedback: string;
  mistakeTag?: MistakeTag;
};

export type StructureVisualKind = 'binary-tree' | 'avl' | 'trie' | 'doidona' | 'array' | 'hash';

export type StructureVisual = {
  kind: StructureVisualKind;
  title: string;
  caption: string;
  labels: string[];
};

export type CodeDrillPhase = 'repeat' | 'modify';

export type CodeDrill = {
  id: string;
  domainId: DomainId;
  title: string;
  source: 'lista-prova3' | 'reav-style';
  repetitionGroup: string;
  phase: CodeDrillPhase;
  format: Extract<QuestionFormat, 'code-repetition' | 'code-modification'>;
  skillId: SkillId;
  goal: string;
  stem: string;
  scaffold: string;
  visual: StructureVisual;
  step: ExamStep;
};
