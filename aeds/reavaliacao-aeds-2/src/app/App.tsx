import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenCheck,
  Brain,
  CheckCircle2,
  ClipboardList,
  Code2,
  ListChecks,
  RotateCcw,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react';

import { domainCatalog } from '../content/domains';
import { reavaliacaoBlueprint } from '../content/reavaliacaoBlueprint';
import {
  createEmptyNotebook,
  getPriorityErrors,
  recordReviewResult,
  recordStepAttempt,
  selectSimilarPractice,
} from '../engine/adaptiveReview';
import { answerCurrentStep, createExamSession, getCurrentStep } from '../engine/examSession';
import { clearSavedGame, loadSavedGame, saveGame, type SavedGameState } from '../persistence/save';
import type {
  BlocksStep,
  ChallengeStep,
  DomainId,
  FixStep,
  QuestionFormat,
  SkillId,
  StepAnswer,
} from '../types/content';
import type { StepAttempt } from '../types/progress';

const formatLabels: Record<QuestionFormat, string> = {
  'summation-from-code': 'Somatorio por codigo',
  'structure-simulation': 'Simulacao de estrutura',
  'prove-or-refute': 'Provar ou refutar',
  'algorithm-adaptation': 'Adaptar algoritmo',
  'case-analysis': 'Melhor e pior caso',
  'composite-structure-method': 'Metodo em estrutura composta',
};

const skillLabels: Record<SkillId, string> = {
  recognize: 'Reconhecer',
  simulate: 'Simular',
  program: 'Programar',
  justify: 'Justificar',
};

function createInitialGame(): SavedGameState {
  return {
    session: createExamSession(reavaliacaoBlueprint),
    notebook: createEmptyNotebook(),
  };
}

export function App() {
  const [game, setGame] = useState<SavedGameState>(() => loadSavedGame() ?? createInitialGame());
  const [selectedDomainId, setSelectedDomainId] = useState<DomainId>('somatorio');
  const [choiceAnswer, setChoiceAnswer] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [blockOrder, setBlockOrder] = useState<string[]>([]);
  const [fixLineIndex, setFixLineIndex] = useState<number | null>(null);
  const [fixId, setFixId] = useState('');
  const [lastAttempt, setLastAttempt] = useState<StepAttempt | null>(null);

  const currentQuestion = reavaliacaoBlueprint.questions[game.session.currentQuestionIndex];
  const currentStep = getCurrentStep(reavaliacaoBlueprint, game.session);
  const selectedDomain = domainCatalog.find((domain) => domain.id === selectedDomainId) ?? domainCatalog[0];
  const currentDomain =
    domainCatalog.find((domain) => domain.id === currentQuestion?.domainId) ?? selectedDomain;
  const priorityErrors = useMemo(() => getPriorityErrors(game.notebook), [game.notebook]);
  const topError = priorityErrors[0];
  const similarPractice = topError ? selectSimilarPractice(topError) : undefined;
  const progressPercent = Math.round((game.session.score / game.session.maxScore) * 100);
  const answer = currentStep ? buildAnswer(currentStep, choiceAnswer, textAnswer, blockOrder, fixLineIndex, fixId) : undefined;

  useEffect(() => {
    saveGame(game);
  }, [game]);

  useEffect(() => {
    resetAnswerDrafts();
  }, [currentStep?.id]);

  function resetAnswerDrafts() {
    setChoiceAnswer('');
    setTextAnswer('');
    setBlockOrder([]);
    setFixLineIndex(null);
    setFixId('');
  }

  function submitAnswer() {
    if (!answer || !currentStep) {
      return;
    }

    const nextSession = answerCurrentStep(reavaliacaoBlueprint, game.session, answer);
    const attempt = nextSession.attempts[nextSession.attempts.length - 1] ?? null;
    const nextNotebook = attempt ? recordStepAttempt(game.notebook, attempt) : game.notebook;

    setLastAttempt(attempt);
    setGame({ session: nextSession, notebook: nextNotebook });
  }

  function resetGame() {
    const nextGame = createInitialGame();
    clearSavedGame();
    setLastAttempt(null);
    setSelectedDomainId('somatorio');
    setGame(nextGame);
  }

  function markPractice(correct: boolean) {
    if (!topError) {
      return;
    }

    setGame((currentGame) => ({
      ...currentGame,
      notebook: recordReviewResult(currentGame.notebook, topError.id, correct),
    }));
  }

  return (
    <main className="app-shell">
      <header className="app-topbar">
        <div>
          <p className="app-kicker">AEDS II</p>
          <h1>Reavaliacao AEDS II</h1>
        </div>
        <div className="score-board" aria-label="Pontuacao do simulado">
          <Trophy aria-hidden="true" size={20} />
          <strong>
            {game.session.score}/{game.session.maxScore}
          </strong>
          <span>{progressPercent}%</span>
        </div>
      </header>

      <div className="app-grid">
        <section className="domain-panel" aria-labelledby="domains-title">
          <div className="panel-title">
            <Target aria-hidden="true" size={18} />
            <h2 id="domains-title">Dominios</h2>
          </div>

          <div className="domain-list">
            {domainCatalog.map((domain) => (
              <button
                className={`domain-button ${domain.id === selectedDomainId ? 'is-active' : ''}`}
                key={domain.id}
                onClick={() => setSelectedDomainId(domain.id)}
                type="button"
              >
                <strong>{domain.title}</strong>
                <span>{domain.examRole}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="exam-panel" aria-labelledby="exam-title">
          <div className="panel-title">
            <ClipboardList aria-hidden="true" size={18} />
            <h2 id="exam-title">Simulado de 6 questoes</h2>
          </div>

          {game.session.completed || !currentQuestion || !currentStep ? (
            <div className="complete-state">
              <CheckCircle2 aria-hidden="true" size={42} />
              <h3>Simulado concluido</h3>
              <p>
                Pontuacao final: {game.session.score} de {game.session.maxScore}.
              </p>
              <button className="primary-button" onClick={resetGame} type="button">
                <RotateCcw aria-hidden="true" size={18} />
                Reiniciar
              </button>
            </div>
          ) : (
            <>
              <div className="question-header">
                <span className="question-badge">Q{currentQuestion.number}</span>
                <div>
                  <h3>{currentQuestion.title}</h3>
                  <p>{formatLabels[currentQuestion.format]}</p>
                </div>
              </div>

              <p className="question-stem">{currentQuestion.stem}</p>

              <div className="step-panel">
                <div className="step-meta">
                  <span>{skillLabels[currentStep.skillId]}</span>
                  <span>{currentDomain.shortTitle}</span>
                </div>
                <h4>{currentStep.prompt}</h4>

                <AnswerControl
                  blockOrder={blockOrder}
                  choiceAnswer={choiceAnswer}
                  fixId={fixId}
                  fixLineIndex={fixLineIndex}
                  onAddBlock={(blockId) => setBlockOrder((order) => [...order, blockId])}
                  onChoice={setChoiceAnswer}
                  onFixId={setFixId}
                  onFixLine={setFixLineIndex}
                  onResetBlocks={() => setBlockOrder([])}
                  onText={setTextAnswer}
                  step={currentStep}
                  textAnswer={textAnswer}
                />
              </div>

              <div className="action-row">
                <button className="primary-button" disabled={!answer} onClick={submitAnswer} type="button">
                  <CheckCircle2 aria-hidden="true" size={18} />
                  Responder
                </button>
                <button className="ghost-button" onClick={resetAnswerDrafts} type="button">
                  <RotateCcw aria-hidden="true" size={18} />
                  Limpar
                </button>
              </div>

              {lastAttempt && (
                <div className={`feedback ${lastAttempt.correct ? 'is-correct' : 'is-wrong'}`} role="status">
                  {lastAttempt.correct ? (
                    <CheckCircle2 aria-hidden="true" size={18} />
                  ) : (
                    <XCircle aria-hidden="true" size={18} />
                  )}
                  <span>{lastAttempt.feedback}</span>
                </div>
              )}
            </>
          )}
        </section>

        <section className="review-panel" aria-labelledby="review-title">
          <div className="panel-title">
            <Brain aria-hidden="true" size={18} />
            <h2 id="review-title">Caderno de erros</h2>
          </div>

          {priorityErrors.length === 0 ? (
            <div className="empty-review">
              <BookOpenCheck aria-hidden="true" size={32} />
              <p>Nenhum erro critico agora.</p>
            </div>
          ) : (
            <>
              <ol className="error-list">
                {priorityErrors.slice(0, 3).map((record) => (
                  <li key={record.id}>
                    <strong>{skillLabels[record.skillId]}</strong>
                    <span>
                      {record.domainId} · {record.mistakeTag} · {record.attempts}x
                    </span>
                  </li>
                ))}
              </ol>

              {similarPractice && (
                <div className="practice-box">
                  <div className="practice-heading">
                    <Code2 aria-hidden="true" size={18} />
                    <h3>{similarPractice.title}</h3>
                  </div>
                  <p>{similarPractice.prompt}</p>
                  <div className="practice-actions">
                    <button className="ghost-button" onClick={() => markPractice(false)} type="button">
                      <XCircle aria-hidden="true" size={18} />
                      Errei
                    </button>
                    <button className="primary-button" onClick={() => markPractice(true)} type="button">
                      <CheckCircle2 aria-hidden="true" size={18} />
                      Acertei
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

type AnswerControlProps = {
  step: ChallengeStep;
  choiceAnswer: string;
  textAnswer: string;
  blockOrder: string[];
  fixLineIndex: number | null;
  fixId: string;
  onChoice: (optionId: string) => void;
  onText: (text: string) => void;
  onAddBlock: (blockId: string) => void;
  onResetBlocks: () => void;
  onFixLine: (lineIndex: number) => void;
  onFixId: (fixId: string) => void;
};

function AnswerControl({
  blockOrder,
  choiceAnswer,
  fixId,
  fixLineIndex,
  onAddBlock,
  onChoice,
  onFixId,
  onFixLine,
  onResetBlocks,
  onText,
  step,
  textAnswer,
}: AnswerControlProps) {
  if (step.kind === 'choice' || step.kind === 'rubric') {
    return (
      <div className="option-grid">
        {step.options.map((option) => (
          <button
            className={`option-button ${choiceAnswer === option.id ? 'is-selected' : ''}`}
            key={option.id}
            onClick={() => onChoice(option.id)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  if (step.kind === 'gap' || step.kind === 'code') {
    return (
      <textarea
        aria-label="Resposta"
        className="text-answer"
        onChange={(event) => onText(event.target.value)}
        placeholder="Digite a resposta"
        rows={4}
        value={textAnswer}
      />
    );
  }

  if (step.kind === 'blocks') {
    return <BlocksAnswer blockOrder={blockOrder} onAddBlock={onAddBlock} onResetBlocks={onResetBlocks} step={step} />;
  }

  return (
    <FixAnswer
      fixId={fixId}
      fixLineIndex={fixLineIndex}
      onFixId={onFixId}
      onFixLine={onFixLine}
      step={step}
    />
  );
}

type BlocksAnswerProps = {
  step: BlocksStep;
  blockOrder: string[];
  onAddBlock: (blockId: string) => void;
  onResetBlocks: () => void;
};

function BlocksAnswer({ blockOrder, onAddBlock, onResetBlocks, step }: BlocksAnswerProps) {
  const selectedIds = new Set(blockOrder);
  const selectedBlocks = blockOrder
    .map((blockId) => step.blocks.find((block) => block.id === blockId))
    .filter((block): block is BlocksStep['blocks'][number] => Boolean(block));

  return (
    <div className="blocks-answer">
      <div className="block-bank">
        {step.blocks.map((block) => (
          <button
            disabled={selectedIds.has(block.id)}
            key={block.id}
            onClick={() => onAddBlock(block.id)}
            title="Adicionar bloco"
            type="button"
          >
            <ListChecks aria-hidden="true" size={16} />
            {block.label}
          </button>
        ))}
      </div>

      <ol className="ordered-blocks">
        {selectedBlocks.map((block) => (
          <li key={block.id}>{block.label}</li>
        ))}
      </ol>

      <button className="ghost-button compact" onClick={onResetBlocks} type="button">
        <RotateCcw aria-hidden="true" size={16} />
        Refazer ordem
      </button>
    </div>
  );
}

type FixAnswerProps = {
  step: FixStep;
  fixLineIndex: number | null;
  fixId: string;
  onFixLine: (lineIndex: number) => void;
  onFixId: (fixId: string) => void;
};

function FixAnswer({ fixId, fixLineIndex, onFixId, onFixLine, step }: FixAnswerProps) {
  return (
    <div className="fix-answer">
      <div className="code-lines">
        {step.lines.map((line, index) => (
          <button
            className={fixLineIndex === index ? 'is-selected' : ''}
            key={`${line}-${index}`}
            onClick={() => onFixLine(index)}
            type="button"
          >
            <span>{index + 1}</span>
            <code>{line}</code>
          </button>
        ))}
      </div>

      <div className="option-grid">
        {step.fixOptions.map((option) => (
          <button
            className={`option-button ${fixId === option.id ? 'is-selected' : ''}`}
            key={option.id}
            onClick={() => onFixId(option.id)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function buildAnswer(
  step: ChallengeStep,
  choiceAnswer: string,
  textAnswer: string,
  blockOrder: string[],
  fixLineIndex: number | null,
  fixId: string,
): StepAnswer | undefined {
  if (step.kind === 'choice' || step.kind === 'rubric') {
    return choiceAnswer ? { kind: 'choice', optionId: choiceAnswer } : undefined;
  }

  if (step.kind === 'gap' || step.kind === 'code') {
    return textAnswer.trim() ? { kind: 'text', text: textAnswer } : undefined;
  }

  if (step.kind === 'blocks') {
    return blockOrder.length === step.correctOrder.length ? { kind: 'blocks', order: blockOrder } : undefined;
  }

  if (fixLineIndex === null || !fixId) {
    return undefined;
  }

  return { kind: 'fix', lineIndex: fixLineIndex, fixId };
}
