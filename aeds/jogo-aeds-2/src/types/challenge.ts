export type StructureKind =
  | 'binaria'
  | 'abb'
  | 'avl'
  | 'arv234'
  | 'alvinegra'
  | 'hash'
  | 'trie'
  | 'patricia'
  | 'doidona';

export type ReasoningPattern =
  | 'percorrer-todos-os-nos'
  | 'seguir-um-caminho'
  | 'retornar-de-baixo-para-cima'
  | 'verificar-propriedade-global'
  | 'navegar-por-camadas'
  | 'analisar-complexidade';

export type Difficulty = 'facil' | 'medio' | 'dificil';

export type ChallengeStepKind =
  | 'interpretar'
  | 'simular'
  | 'lacuna'
  | 'blocos'
  | 'complexidade'
  | 'clique'
  | 'revisao';

export type ChallengeType =
  | 'escolha'
  | 'lacunas'
  | 'blocos'
  | 'simulacao'
  | 'complexidade';

export type ChallengeFocus = 'codigo' | 'desenho' | 'conceito';

export type ChallengeSource = {
  label: string;
  question: string;
};

export type ChoiceOption = {
  id: string;
  label: string;
  visualStateId?: string;
  correct?: boolean;
  feedback?: string;
};

export type GapAnswer = {
  id: string;
  answer: string;
  aliases?: string[];
};

export type BlockAnswer = {
  id: string;
  label: string;
  order: number;
};

export type ComplexityAnswer = {
  answer: string;
  explanation: string;
};

export type CommonMistake = {
  id: string;
  title: string;
  description: string;
  hint?: string;
};

export type EvaluationResult = {
  correct: boolean;
  score?: number;
  feedback?: string;
  mistakeId?: string;
};

export type ChallengeStepBase = {
  id: string;
  kind: ChallengeStepKind;
  prompt: string;
  explanation?: string;
  mistakeId?: string;
  activePath?: string[];
  activeNodeId?: string;
  hint?: string;
};

export type ChoiceStep = ChallengeStepBase & {
  kind: 'interpretar' | 'simular' | 'complexidade';
  options: ChoiceOption[];
  correctOptionId: string;
};

export type GapStep = ChallengeStepBase & {
  kind: 'lacuna';
  gapId: string;
  answers: GapAnswer[];
};

export type BlockStep = ChallengeStepBase & {
  kind: 'blocos';
  blocks: BlockAnswer[];
  correctOrder: string[];
};

export type ReviewStep = ChallengeStepBase & {
  kind: 'revisao';
  summary: string;
  solutionNotes: string[];
};

export type ClickStep = ChallengeStepBase & {
  kind: 'clique';
  targetNodeIds: string[];
  maxClicks?: number;
  selectionMode?: 'ordered' | 'unordered';
};

export type ChallengeStep = ChoiceStep | GapStep | BlockStep | ReviewStep | ClickStep;

export type Challenge = {
  id: string;
  title: string;
  pattern: ReasoningPattern;
  structure: StructureKind;
  difficulty: Difficulty;
  statement: string;
  // Code shown as context in the prompt, usually incomplete or read-only.
  providedCode: string;
  visualStateId: string;
  steps: ChallengeStep[];
  complexity: ComplexityAnswer;
  commonMistakes: CommonMistake[];
  type?: ChallengeType;
  focus?: ChallengeFocus;
  source?: ChallengeSource;
  transferGroupId?: string;
  // Editable starting point for coding interactions in later tasks.
  starterCode?: string;
  solution?: string;
  activePath?: string[];
  activeNodeId?: string;
};
