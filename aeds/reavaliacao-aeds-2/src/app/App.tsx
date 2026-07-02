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

import { codeDrillCatalog } from '../content/codeDrills';
import { domainCatalog } from '../content/domains';
import { reavaliacaoBlueprint } from '../content/reavaliacaoBlueprint';
import {
  createEmptyNotebook,
  getPriorityErrors,
  recordReviewResult,
  recordStepAttempt,
  selectSimilarPractice,
} from '../engine/adaptiveReview';
import {
  answerCurrentPracticeStep,
  createPracticeSession,
  getCurrentPracticeDrill,
  getPracticeProgressLabel,
} from '../engine/codePractice';
import { answerCurrentStep, createExamSession, getCurrentStep } from '../engine/examSession';
import { clearSavedGame, loadSavedGame, saveGame, type SavedGameState } from '../persistence/save';
import type {
  BlocksStep,
  ChallengeStep,
  CodeDrill,
  DomainId,
  FixStep,
  QuestionFormat,
  SkillId,
  StepAnswer,
  StructureVisual,
} from '../types/content';
import type { StepAttempt } from '../types/progress';

const formatLabels: Record<QuestionFormat, string> = {
  'summation-from-code': 'Somatorio por codigo',
  'structure-simulation': 'Simulacao de estrutura',
  'prove-or-refute': 'Provar ou refutar',
  'algorithm-adaptation': 'Adaptar algoritmo',
  'case-analysis': 'Melhor e pior caso',
  'composite-structure-method': 'Metodo em estrutura composta',
  'code-repetition': 'Repeticao de codigo',
  'code-modification': 'Modificacao de estrutura',
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
    practiceSession: createPracticeSession(codeDrillCatalog, { mode: 'quick', targetCount: 2 }),
  };
}

function loadInitialGame(): SavedGameState {
  const initialGame = createInitialGame();
  const savedGame = loadSavedGame();

  if (!savedGame) {
    return initialGame;
  }

  return {
    ...initialGame,
    ...savedGame,
    practiceSession: savedGame.practiceSession ?? initialGame.practiceSession,
  };
}

export function App() {
  const [game, setGame] = useState<SavedGameState>(() => loadInitialGame());
  const [activeMode, setActiveMode] = useState<'exam' | 'practice'>('exam');
  const [selectedDomainId, setSelectedDomainId] = useState<DomainId>('somatorio');
  const [choiceAnswer, setChoiceAnswer] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [blockOrder, setBlockOrder] = useState<string[]>([]);
  const [fixLineIndex, setFixLineIndex] = useState<number | null>(null);
  const [fixId, setFixId] = useState('');
  const [lastAttempt, setLastAttempt] = useState<StepAttempt | null>(null);
  const [showTeaching, setShowTeaching] = useState(false);

  const currentQuestion = reavaliacaoBlueprint.questions[game.session.currentQuestionIndex];
  const currentStep = getCurrentStep(reavaliacaoBlueprint, game.session);
  const practiceSession =
    game.practiceSession ?? createPracticeSession(codeDrillCatalog, { mode: 'quick', targetCount: 2 });
  const currentPracticeDrill = getCurrentPracticeDrill(codeDrillCatalog, practiceSession);
  const activeStep = activeMode === 'exam' ? currentStep : currentPracticeDrill?.step;
  const selectedDomain = domainCatalog.find((domain) => domain.id === selectedDomainId) ?? domainCatalog[0];
  const currentDomain =
    domainCatalog.find((domain) => domain.id === currentQuestion?.domainId) ?? selectedDomain;
  const priorityErrors = useMemo(() => getPriorityErrors(game.notebook), [game.notebook]);
  const topError = priorityErrors[0];
  const similarPractice = topError ? selectSimilarPractice(topError) : undefined;
  const progressPercent = Math.round((game.session.score / game.session.maxScore) * 100);
  const answer = activeStep ? buildAnswer(activeStep, choiceAnswer, textAnswer, blockOrder, fixLineIndex, fixId) : undefined;

  useEffect(() => {
    saveGame(game);
  }, [game]);

  useEffect(() => {
    resetAnswerDrafts();
    setShowTeaching(false);
  }, [activeMode, currentStep?.id, currentPracticeDrill?.step.id]);

  function resetAnswerDrafts() {
    setChoiceAnswer('');
    setTextAnswer('');
    setBlockOrder([]);
    setFixLineIndex(null);
    setFixId('');
  }

  function submitAnswer() {
    if (activeMode === 'practice') {
      submitPracticeAnswer();
      return;
    }

    if (!answer || !currentStep) {
      return;
    }

    const nextSession = answerCurrentStep(reavaliacaoBlueprint, game.session, answer);
    const attempt = nextSession.attempts[nextSession.attempts.length - 1] ?? null;
    const nextNotebook = attempt ? recordStepAttempt(game.notebook, attempt) : game.notebook;

    setLastAttempt(attempt);
    setGame((currentGame) => ({ ...currentGame, session: nextSession, notebook: nextNotebook }));
  }

  function submitPracticeAnswer() {
    if (!answer || !currentPracticeDrill) {
      return;
    }

    const nextPracticeSession = answerCurrentPracticeStep(codeDrillCatalog, practiceSession, answer);
    const attempt = nextPracticeSession.attempts[nextPracticeSession.attempts.length - 1] ?? null;
    const nextNotebook = attempt ? recordStepAttempt(game.notebook, attempt) : game.notebook;

    setLastAttempt(attempt);
    setGame((currentGame) => ({
      ...currentGame,
      notebook: nextNotebook,
      practiceSession: nextPracticeSession,
    }));
  }

  function resetGame() {
    const nextGame = createInitialGame();
    clearSavedGame();
    setLastAttempt(null);
    setSelectedDomainId('somatorio');
    setGame(nextGame);
  }

  function startQuickPractice() {
    setLastAttempt(null);
    setActiveMode('practice');
    setGame((currentGame) => ({
      ...currentGame,
      practiceSession: createPracticeSession(codeDrillCatalog, { mode: 'quick', targetCount: 2 }),
    }));
  }

  function startMarathonPractice() {
    setLastAttempt(null);
    setActiveMode('practice');
    setGame((currentGame) => ({
      ...currentGame,
      practiceSession: createPracticeSession(codeDrillCatalog, { mode: 'marathon' }),
    }));
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

      <nav className="mode-tabs" aria-label="Modos de treino">
        <button
          className={activeMode === 'exam' ? 'is-active' : ''}
          onClick={() => setActiveMode('exam')}
          type="button"
        >
          Simulado
        </button>
        <button
          className={activeMode === 'practice' ? 'is-active' : ''}
          onClick={() => setActiveMode('practice')}
          type="button"
        >
          Treino de Codigo
        </button>
      </nav>

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
            {activeMode === 'exam' ? (
              <ClipboardList aria-hidden="true" size={18} />
            ) : (
              <Code2 aria-hidden="true" size={18} />
            )}
            <h2 id="exam-title">{activeMode === 'exam' ? 'Simulado de 6 questoes' : 'Treino de Codigo'}</h2>
          </div>

          {activeMode === 'practice' ? (
            <PracticeExperience
              answer={answer}
              blockOrder={blockOrder}
              choiceAnswer={choiceAnswer}
              currentPracticeDrill={currentPracticeDrill}
              fixId={fixId}
              fixLineIndex={fixLineIndex}
              lastAttempt={lastAttempt}
              onAddBlock={(blockId) => setBlockOrder((order) => [...order, blockId])}
              onChoice={setChoiceAnswer}
              onFixId={setFixId}
              onFixLine={setFixLineIndex}
              onResetBlocks={() => setBlockOrder([])}
              onResetDrafts={resetAnswerDrafts}
              onStartMarathon={startMarathonPractice}
              onStartQuick={startQuickPractice}
              onSubmit={submitAnswer}
              onText={setTextAnswer}
              onToggleTeaching={() => setShowTeaching((value) => !value)}
              practiceSession={practiceSession}
              showTeaching={showTeaching}
              textAnswer={textAnswer}
            />
          ) : game.session.completed || !currentQuestion || !currentStep ? (
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
              {currentQuestion.visual && <StructureVisualCard visual={currentQuestion.visual} />}

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
                <button className="ghost-button" onClick={() => setShowTeaching((value) => !value)} type="button">
                  <BookOpenCheck aria-hidden="true" size={18} />
                  Me ensine
                </button>
              </div>

              {showTeaching && <TeachingBox step={currentStep} />}

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

type PracticeExperienceProps = {
  currentPracticeDrill: CodeDrill | undefined;
  practiceSession: NonNullable<SavedGameState['practiceSession']>;
  answer: StepAnswer | undefined;
  choiceAnswer: string;
  textAnswer: string;
  blockOrder: string[];
  fixLineIndex: number | null;
  fixId: string;
  lastAttempt: StepAttempt | null;
  onChoice: (optionId: string) => void;
  onText: (text: string) => void;
  onAddBlock: (blockId: string) => void;
  onResetBlocks: () => void;
  onFixLine: (lineIndex: number) => void;
  onFixId: (fixId: string) => void;
  onResetDrafts: () => void;
  onSubmit: () => void;
  onStartQuick: () => void;
  onStartMarathon: () => void;
  onToggleTeaching: () => void;
  showTeaching: boolean;
};

function PracticeExperience({
  answer,
  blockOrder,
  choiceAnswer,
  currentPracticeDrill,
  fixId,
  fixLineIndex,
  lastAttempt,
  onAddBlock,
  onChoice,
  onFixId,
  onFixLine,
  onResetBlocks,
  onResetDrafts,
  onStartMarathon,
  onStartQuick,
  onSubmit,
  onText,
  onToggleTeaching,
  practiceSession,
  showTeaching,
  textAnswer,
}: PracticeExperienceProps) {
  if (practiceSession.completed || !currentPracticeDrill) {
    return (
      <div className="complete-state">
        <CheckCircle2 aria-hidden="true" size={42} />
        <h3>Sessao rapida concluida</h3>
        <p>{practiceSession.completedCount} questoes feitas neste ciclo.</p>
        <div className="practice-actions">
          <button className="primary-button" onClick={onStartQuick} type="button">
            <Code2 aria-hidden="true" size={18} />
            Pegar 2 questoes
          </button>
          <button className="ghost-button" onClick={onStartMarathon} type="button">
            <RotateCcw aria-hidden="true" size={18} />
            Maratona
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="practice-toolbar">
        <div>
          <strong>{practiceSession.mode === 'quick' ? 'Sessao rapida' : 'Maratona'}</strong>
          <span>{getPracticeProgressLabel(practiceSession)} questoes</span>
        </div>
        <div className="practice-actions">
          <button className="ghost-button compact" onClick={onStartQuick} type="button">
            Pegar 2 questoes
          </button>
          <button className="ghost-button compact" onClick={onStartMarathon} type="button">
            Maratona
          </button>
        </div>
      </div>

      <div className="question-header">
        <span className="question-badge">C</span>
        <div>
          <h3>{currentPracticeDrill.title}</h3>
          <p>{formatLabels[currentPracticeDrill.format]}</p>
        </div>
      </div>

      <p className="question-stem">{currentPracticeDrill.stem}</p>

      <div className="paper-layout">
        <pre className="code-scaffold">
          <code>{currentPracticeDrill.scaffold}</code>
        </pre>
        <StructureVisualCard visual={currentPracticeDrill.visual} />
      </div>

      <div className="step-panel">
        <div className="step-meta">
          <span>{skillLabels[currentPracticeDrill.step.skillId]}</span>
          <span>{currentPracticeDrill.phase === 'repeat' ? 'Repeticao' : 'Modificacao'}</span>
        </div>
        <h4>{currentPracticeDrill.step.prompt}</h4>

        <AnswerControl
          blockOrder={blockOrder}
          choiceAnswer={choiceAnswer}
          fixId={fixId}
          fixLineIndex={fixLineIndex}
          onAddBlock={onAddBlock}
          onChoice={onChoice}
          onFixId={onFixId}
          onFixLine={onFixLine}
          onResetBlocks={onResetBlocks}
          onText={onText}
          step={currentPracticeDrill.step}
          textAnswer={textAnswer}
        />
      </div>

      <div className="action-row">
        <button className="primary-button" disabled={!answer} onClick={onSubmit} type="button">
          <CheckCircle2 aria-hidden="true" size={18} />
          Responder
        </button>
        <button className="ghost-button" onClick={onResetDrafts} type="button">
          <RotateCcw aria-hidden="true" size={18} />
          Limpar
        </button>
        <button className="ghost-button" onClick={onToggleTeaching} type="button">
          <BookOpenCheck aria-hidden="true" size={18} />
          Me ensine
        </button>
      </div>

      {showTeaching && <TeachingBox step={currentPracticeDrill.step} />}

      {lastAttempt && (
        <div className={`feedback ${lastAttempt.correct ? 'is-correct' : 'is-wrong'}`} role="status">
          {lastAttempt.correct ? <CheckCircle2 aria-hidden="true" size={18} /> : <XCircle aria-hidden="true" size={18} />}
          <span>{lastAttempt.feedback}</span>
        </div>
      )}
    </>
  );
}

function StructureVisualCard({ visual }: { visual: StructureVisual }) {
  return (
    <figure className={`structure-visual is-${visual.kind}`}>
      <figcaption>
        <strong>{visual.title}</strong>
        <span>{visual.caption}</span>
      </figcaption>
      <svg aria-hidden="true" viewBox="0 0 320 180" role="img">
        <VisualDrawing visual={visual} />
      </svg>
    </figure>
  );
}

function VisualDrawing({ visual }: { visual: StructureVisual }) {
  if (visual.kind === 'binary-tree' || visual.kind === 'avl') {
    const labels = visual.labels;
    const nodes = [
      { x: 160, y: 32, label: labels[0] ?? 'r' },
      { x: 95, y: 88, label: labels[1] ?? 'e' },
      { x: 225, y: 88, label: labels[2] ?? 'd' },
      { x: 65, y: 145, label: labels[3] ?? '' },
      { x: 125, y: 145, label: labels[4] ?? '' },
      { x: 200, y: 145, label: labels[5] ?? '' },
      { x: 260, y: 145, label: labels[6] ?? '' },
    ].filter((node) => node.label);

    return (
      <>
        <line x1="160" x2="95" y1="52" y2="72" />
        <line x1="160" x2="225" y1="52" y2="72" />
        <line x1="95" x2="65" y1="108" y2="128" />
        <line x1="95" x2="125" y1="108" y2="128" />
        <line x1="225" x2="200" y1="108" y2="128" />
        <line x1="225" x2="260" y1="108" y2="128" />
        {nodes.map((node) => (
          <g key={`${node.x}-${node.y}-${node.label}`}>
            <circle cx={node.x} cy={node.y} r="21" />
            <text x={node.x} y={node.y + 5}>
              {node.label}
            </text>
          </g>
        ))}
      </>
    );
  }

  if (visual.kind === 'trie') {
    return (
      <>
        {visual.labels.map((label, index) => {
          const x = 35 + index * 48;
          return (
            <g key={`${label}-${index}`}>
              {index > 0 && <line x1={x - 26} x2={x - 8} y1="88" y2="88" />}
              <circle cx={x} cy="88" r="20" />
              <text x={x} y="93">
                {label}
              </text>
            </g>
          );
        })}
      </>
    );
  }

  if (visual.kind === 'array') {
    return (
      <>
        {visual.labels.map((label, index) => {
          const x = 22 + index * 46;
          return (
            <g key={`${label}-${index}`}>
              <rect height="42" rx="6" width="42" x={x} y="72" />
              <text x={x + 21} y="98">
                {label}
              </text>
            </g>
          );
        })}
      </>
    );
  }

  return (
    <>
      {visual.labels.map((label, index) => {
        const x = 24 + index * 58;
        const y = index % 2 === 0 ? 54 : 104;
        return (
          <g key={`${label}-${index}`}>
            {index > 0 && <line x1={x - 26} x2={x - 6} y1={index % 2 === 0 ? 104 : 54} y2={y} />}
            <rect height="42" rx="6" width="52" x={x} y={y} />
            <text x={x + 26} y={y + 26}>
              {label}
            </text>
          </g>
        );
      })}
    </>
  );
}

function TeachingBox({ step }: { step: ChallengeStep }) {
  const teachingItems = getTeachingItems(step);

  return (
    <aside className="teaching-box" aria-label="Explicacao guiada">
      <div className="practice-heading">
        <BookOpenCheck aria-hidden="true" size={18} />
        <h3>Me ensine</h3>
      </div>
      <ol>
        {teachingItems.map((item) => (
          <li key={item.code}>
            <code>{item.code}</code>
            <span>{item.note}</span>
          </li>
        ))}
      </ol>
      {step.kind === 'function' && (
        <pre className="code-scaffold">
          <code>{step.solution}</code>
        </pre>
      )}
      {step.explanation && <p>{step.explanation}</p>}
    </aside>
  );
}

function getTeachingItems(step: ChallengeStep): Array<{ code: string; note: string }> {
  if (step.kind === 'choice') {
    const option = step.options.find((item) => item.id === step.correctOptionId);

    return [
      {
        code: option?.label ?? step.correctOptionId,
        note: 'Esta e a escolha correta para manter a logica da estrutura.',
      },
    ];
  }

  if (step.kind === 'rubric') {
    return step.acceptableOptionIds.map((optionId) => {
      const option = step.options.find((item) => item.id === optionId);

      return {
        code: option?.label ?? optionId,
        note: 'Esta justificativa cobre a propriedade essencial da questao.',
      };
    });
  }

  if (step.kind === 'gap') {
    return [
      {
        code: step.answers[0] ?? '',
        note: 'Essa lacuna completa a condicao ou expressao central do metodo.',
      },
    ];
  }

  if (step.kind === 'code') {
    return [
      {
        code: step.acceptedAnswers[0] ?? '',
        note: 'Essa linha e a resposta modelo; repare nos ponteiros, indices e chamadas usadas.',
      },
    ];
  }

  if (step.kind === 'function') {
    return step.lineExplanations;
  }

  if (step.kind === 'blocks') {
    return step.correctOrder.map((blockId, index) => {
      const block = step.blocks.find((item) => item.id === blockId);

      return {
        code: block?.label ?? blockId,
        note: `Passo ${index + 1} da logica correta.`,
      };
    });
  }

  const line = step.lines[step.correctLineIndex] ?? '';
  const fix = step.fixOptions.find((option) => option.id === step.correctFixId);

  return [
    {
      code: line,
      note: 'Esta e a linha que quebra a logica atual.',
    },
    {
      code: fix?.label ?? step.correctFixId,
      note: 'Esse conserto preserva a regra esperada pela estrutura.',
    },
  ];
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

  if (step.kind === 'gap' || step.kind === 'code' || step.kind === 'function') {
    return (
      <textarea
        aria-label="Resposta"
        className="text-answer"
        onChange={(event) => onText(event.target.value)}
        placeholder={step.kind === 'function' ? 'Escreva a funcao completa' : 'Digite a resposta'}
        rows={step.kind === 'function' ? 8 : 4}
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

  if (step.kind === 'gap' || step.kind === 'code' || step.kind === 'function') {
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
