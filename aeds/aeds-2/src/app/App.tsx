import { Play, Plus, RotateCcw, Search, Sparkles, StepBack, StepForward, Trash2, Trophy } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';

import { challengeBank } from '../challenges/challengeBank';
import {
  structureCatalog,
  unlockedStructureIds,
  type StructureCatalogItem,
} from '../domain/structures/catalog';
import {
  createStepProgress,
  resolveStep,
  type StepAnswer,
  type StepProgress,
  type StepResult,
} from '../evaluators/stepEvaluator';
import { sampleVisualStates } from '../structures/sampleStructures';
import type { Challenge, StructureKind } from '../types/challenge';
import type { VisualState } from '../types/structures';
import { StepPanel } from './components/StepPanel';
import { StructureDiagram } from './components/StructureDiagram';
import {
  buildLabOperation as buildTreeLabOperation,
  createInitialLabTree,
  treeToVisualState,
  type LabAction,
  type LabOperation,
  type LabTreeNode,
} from './labSimulation';
import './App.css';

type Mode = 'library' | 'trail' | 'lab' | 'errors' | 'simulado';

const DEFAULT_STRUCTURE: StructureKind = 'abb';

const modeLabels: Record<Mode, string> = {
  library: 'Biblioteca',
  trail: 'Trilha',
  lab: 'Laboratorio',
  errors: 'Caderno',
  simulado: 'Simulado',
};

export default function App() {
  const [mode, setMode] = useState<Mode>('library');
  const [selectedStructure, setSelectedStructure] = useState<StructureKind>(DEFAULT_STRUCTURE);
  const [activeChallengeId, setActiveChallengeId] = useState(
    () => getFirstChallenge(DEFAULT_STRUCTURE)?.id ?? '',
  );
  const [progressByChallenge, setProgressByChallenge] = useState<Record<string, StepProgress>>({});
  const [lastResult, setLastResult] = useState<StepResult | undefined>();

  const selectedChallenges = useMemo(
    () => getOrderedChallenges(selectedStructure),
    [selectedStructure],
  );
  const activeChallenge =
    selectedChallenges.find((challenge) => challenge.id === activeChallengeId) ??
    selectedChallenges[0];
  const activeProgress = activeChallenge
    ? progressByChallenge[activeChallenge.id] ??
      createStepProgress(activeChallenge.id, activeChallenge.steps.length)
    : undefined;

  const handleOpenTrail = (structureId: StructureKind) => {
    if (!unlockedStructureIds.includes(structureId)) {
      return;
    }

    const firstChallenge = getFirstChallenge(structureId);
    setSelectedStructure(structureId);
    setActiveChallengeId(firstChallenge?.id ?? '');
    setLastResult(undefined);
    setMode('trail');
  };

  const handleSelectChallenge = (challenge: Challenge) => {
    setActiveChallengeId(challenge.id);
    setProgressByChallenge((current) => ({
      ...current,
      [challenge.id]: current[challenge.id] ?? createStepProgress(challenge.id, challenge.steps.length),
    }));
    setLastResult(undefined);
  };

  const handleRestartChallenge = () => {
    if (!activeChallenge) {
      return;
    }

    setProgressByChallenge((current) => ({
      ...current,
      [activeChallenge.id]: createStepProgress(activeChallenge.id, activeChallenge.steps.length),
    }));
    setLastResult(undefined);
  };

  const handleAnswer = (answer: StepAnswer) => {
    if (!activeChallenge || !activeProgress) {
      return;
    }

    const step = activeChallenge.steps[activeProgress.stepIndex];
    if (!step) {
      return;
    }

    const { progress, result } = resolveStep(activeProgress, step, answer);
    setProgressByChallenge((current) => ({ ...current, [activeChallenge.id]: progress }));
    setLastResult(result);
  };

  return (
    <main className="domain-shell">
      <aside className="domain-sidebar" aria-label="Navegacao principal">
        <div>
          <p className="eyebrow">AEDS II</p>
          <h1>Estruturas</h1>
        </div>

        <nav className="mode-tabs" aria-label="Modos">
          {(Object.keys(modeLabels) as Mode[]).map((item) => (
            <button
              key={item}
              type="button"
              className={mode === item ? 'mode-tab is-active' : 'mode-tab'}
              onClick={() => setMode(item)}
            >
              {modeLabels[item]}
            </button>
          ))}
        </nav>

        <div className="mastery-summary" aria-label="Resumo de dominio">
          <strong>{`${getCompletedCount(progressByChallenge)} etapas feitas`}</strong>
          <span>{`${getScoreTotal(progressByChallenge)} XP de pratica`}</span>
        </div>
      </aside>

      <section className="domain-workspace">
        {mode === 'library' ? <LibraryView onOpenTrail={handleOpenTrail} /> : null}

        {mode === 'trail' ? (
          <TrailView
            selectedStructure={selectedStructure}
            selectedChallenges={selectedChallenges}
            activeChallenge={activeChallenge}
            activeProgress={activeProgress}
            lastResult={lastResult}
            onOpenTrail={handleOpenTrail}
            onSelectChallenge={handleSelectChallenge}
            onRestartChallenge={handleRestartChallenge}
            onAnswer={handleAnswer}
          />
        ) : null}

        {mode === 'lab' ? <LabView selectedStructure={selectedStructure} /> : null}
        {mode === 'errors' ? (
          <ErrorBookView progressByChallenge={progressByChallenge} onOpenTrail={() => setMode('trail')} />
        ) : null}
        {mode === 'simulado' ? <SimuladoView onStart={() => setMode('trail')} /> : null}
      </section>
    </main>
  );
}

type LibraryViewProps = {
  onOpenTrail: (structureId: StructureKind) => void;
};

function LibraryView({ onOpenTrail }: LibraryViewProps) {
  const releasedCount = structureCatalog.filter((structure) => structure.status === 'liberada').length;
  const pendingCount = structureCatalog.length - releasedCount;

  return (
    <section className="library-view" aria-label="Biblioteca de estruturas">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Biblioteca</p>
          <h2>Escolha uma estrutura</h2>
        </div>
        <span className="header-pill">{`${releasedCount} liberadas / ${pendingCount} em breve`}</span>
      </header>

      <ul className="structure-grid">
        {structureCatalog.map((structure) => {
          const unlocked = structure.status === 'liberada';
          const challengeCount = getChallengeCount(structure.id);

          return (
            <li key={structure.id} className="structure-item">
              <button
                type="button"
                className={`structure-card family-${structure.family}`}
                aria-label={
                  unlocked
                    ? `Abrir trilha de ${structure.shortName}`
                    : `${structure.shortName} em breve`
                }
                onClick={() => onOpenTrail(structure.id)}
                disabled={!unlocked}
              >
                <span className="structure-topline">
                  <span>{structure.family}</span>
                  <StatusPill structure={structure} />
                </span>
                <strong>{structure.name}</strong>
                <span className="structure-description">{structure.description}</span>
                <span className="structure-metrics">
                  <span>{`${challengeCount} desafios`}</span>
                  <span>{`${structure.phaseCount} fases`}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

type TrailViewProps = {
  selectedStructure: StructureKind;
  selectedChallenges: Challenge[];
  activeChallenge: Challenge | undefined;
  activeProgress: StepProgress | undefined;
  lastResult: StepResult | undefined;
  onOpenTrail: (structureId: StructureKind) => void;
  onSelectChallenge: (challenge: Challenge) => void;
  onRestartChallenge: () => void;
  onAnswer: (answer: StepAnswer) => void;
};

function TrailView({
  selectedStructure,
  selectedChallenges,
  activeChallenge,
  activeProgress,
  lastResult,
  onOpenTrail,
  onSelectChallenge,
  onRestartChallenge,
  onAnswer,
}: TrailViewProps) {
  const selected = getStructure(selectedStructure);
  const currentStep = activeChallenge?.steps[activeProgress?.stepIndex ?? 0];
  const isClickStep = currentStep?.kind === 'clique';
  const clickMax =
    currentStep?.kind === 'clique' ? currentStep.maxClicks ?? currentStep.targetNodeIds.length : 0;
  const [clickSelection, setClickSelection] = useState<string[]>([]);

  // Reseta a selecao sempre que muda de etapa ou de desafio.
  const stepKey = activeChallenge?.id && activeProgress ? `${activeChallenge.id}-${activeProgress.stepIndex}` : '';
  useEffect(() => {
    setClickSelection([]);
  }, [stepKey]);

  const handleToggleClickNode = (nodeId: string) => {
    setClickSelection((current) => {
      if (current.includes(nodeId)) {
        return current.filter((candidate) => candidate !== nodeId);
      }
      if (clickMax > 0 && current.length >= clickMax) {
        return current;
      }
      return [...current, nodeId];
    });
  };

  return (
    <section className="trail-view" aria-label="Trilha selecionada">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Trilha</p>
          <h2>{`Trilha de ${selected?.shortName ?? 'estrutura'}`}</h2>
        </div>

        <div className="structure-switcher" aria-label="Estruturas liberadas">
          {structureCatalog
            .filter((structure) => structure.status === 'liberada')
            .map((structure) => (
              <button
                key={structure.id}
                type="button"
                className={structure.id === selectedStructure ? 'switch-chip is-active' : 'switch-chip'}
                onClick={() => onOpenTrail(structure.id)}
              >
                {structure.shortName}
              </button>
            ))}
        </div>
      </header>

      <div className="trail-layout">
        <aside className="phase-list" aria-label="Fases com conteudo">
          <h3>Fases disponiveis</h3>
          <ol>
            {selectedChallenges.map((challenge, index) => (
              <li key={challenge.id}>
                <button
                  type="button"
                  className={challenge.id === activeChallenge?.id ? 'phase-button is-active' : 'phase-button'}
                  onClick={() => onSelectChallenge(challenge)}
                >
                  <span className="phase-meta">
                    <span>{`Fase ${index + 1}`}</span>
                    {challenge.source ? <span className="phase-source-badge">Lista Prova 3</span> : null}
                    {challenge.focus ? <span className={`phase-focus-badge focus-${challenge.focus}`}>{getFocusLabel(challenge.focus)}</span> : null}
                  </span>
                  <strong>{challenge.title}</strong>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <section className="challenge-workbench" aria-label="Fase atual">
          {activeChallenge && activeProgress ? (
            <>
              <div className="challenge-context">
                <div className="challenge-copy">
                  <div className="challenge-kicker">
                    <span className="eyebrow">{activeChallenge.pattern}</span>
                    {activeChallenge.source ? <span className="phase-source-badge">Lista Prova 3</span> : null}
                    {activeChallenge.focus ? (
                      <span className={`phase-focus-badge focus-${activeChallenge.focus}`}>
                        {getFocusLabel(activeChallenge.focus)}
                      </span>
                    ) : null}
                  </div>
                  <h3>{activeChallenge.title}</h3>
                  <p>{activeChallenge.statement}</p>
                  {activeChallenge.source ? (
                    <p className="challenge-source">
                      {`Origem: ${activeChallenge.source.label} - ${activeChallenge.source.question}`}
                    </p>
                  ) : null}
                </div>

                <StructureDiagram
                  structure={activeChallenge.structure}
                  visualState={sampleVisualStates[activeChallenge.visualStateId]}
                  activePath={lastResult?.activePath ?? activeChallenge.activePath}
                  activeNodeId={lastResult?.activeNodeId ?? activeChallenge.activeNodeId}
                  selectedNodeIds={isClickStep ? clickSelection : undefined}
                  onNodeClick={isClickStep ? handleToggleClickNode : undefined}
                  tone={lastResult ? (lastResult.correct ? 'success' : 'error') : undefined}
                  caption={
                    lastResult?.activePath ? 'Acompanhe o caminho visitado no diagrama.' : undefined
                  }
                />
              </div>

              <details className="code-panel">
                <summary>Codigo fornecido</summary>
                <pre>{activeChallenge.providedCode}</pre>
              </details>

              {currentStep && !activeProgress.complete ? (
                <StepPanel
                  step={currentStep}
                  progress={activeProgress}
                  totalSteps={activeChallenge.steps.length}
                  onAnswer={onAnswer}
                  clickSelection={isClickStep ? clickSelection : undefined}
                  onToggleClickNode={isClickStep ? handleToggleClickNode : undefined}
                />
              ) : (
                <CompletionPanel progress={activeProgress} onRestart={onRestartChallenge} />
              )}

              {lastResult ? <FeedbackPanel result={lastResult} /> : null}
            </>
          ) : (
            <EmptyTrail />
          )}
        </section>
      </div>
    </section>
  );
}

function CompletionPanel({
  progress,
  onRestart,
}: {
  progress: StepProgress;
  onRestart: () => void;
}) {
  return (
    <section className="completion-panel" aria-label="Fase concluida">
      <Trophy size={30} aria-hidden="true" />
      <div>
        <p className="eyebrow">Fase concluida</p>
        <h3>{`${progress.score} XP nesta fase`}</h3>
      </div>
      <button type="button" className="icon-command ghost" onClick={onRestart}>
        <RotateCcw size={18} aria-hidden="true" />
        Refazer fase
      </button>
    </section>
  );
}

function FeedbackPanel({ result }: { result: StepResult }) {
  const title = result.correct ? 'Resposta correta.' : 'Resposta incorreta.';
  const shouldShowFeedback = result.feedback !== title;

  return (
    <aside
      className={result.correct ? 'feedback-panel is-correct' : 'feedback-panel is-wrong'}
      aria-live="polite"
      aria-label="Feedback da etapa"
    >
      <strong>{title}</strong>
      {shouldShowFeedback ? <span>{result.feedback}</span> : null}
      {result.scoreDelta > 0 ? <span>{`+${result.scoreDelta} XP`}</span> : null}
    </aside>
  );
}

function LabView({ selectedStructure }: { selectedStructure: StructureKind }) {
  const selected = getStructure(selectedStructure);
  const inputId = useId();
  const [value, setValue] = useState('');
  const [labTree, setLabTree] = useState<LabTreeNode | undefined>(() => createInitialLabTree());
  const [operations, setOperations] = useState<LabOperation[]>([]);
  const [activeOperationIndex, setActiveOperationIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeOperation = operations[activeOperationIndex];
  const activeStep = activeOperation?.steps[activeStepIndex];

  useEffect(() => {
    setValue('');
    setLabTree(createInitialLabTree());
    setOperations([]);
    setActiveOperationIndex(0);
    setActiveStepIndex(0);
  }, [selectedStructure]);

  const registerOperation = (action: LabAction) => {
    const rawValue = value.trim();
    const operation =
      buildCourseLabOperation(action, rawValue, selectedStructure, labTree) ??
      buildTreeLabOperation(action, rawValue, labTree);

    setOperations((current) => {
      const next = [...current, operation];
      setActiveOperationIndex(next.length - 1);
      setActiveStepIndex(0);
      return next;
    });
    setLabTree(operation.nextTree);
  };

  const handlePrevious = () => {
    setActiveStepIndex((current) => Math.max(0, current - 1));
  };

  const handleNext = () => {
    if (!activeOperation) {
      return;
    }

    setActiveStepIndex((current) => Math.min(activeOperation.steps.length - 1, current + 1));
  };

  return (
    <section className="utility-view" aria-label="Laboratorio">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Laboratorio</p>
          <h2>{selected?.shortName ?? 'Estrutura'}</h2>
        </div>
      </header>

      <div className="tool-surface">
        <StructureDiagram
          structure={selectedStructure}
          visualState={activeStep?.visualState ?? getLabInitialVisualState(selectedStructure, labTree)}
          activePath={activeStep?.activePath}
          activeNodeId={activeStep?.activeNodeId}
          caption={
            activeOperation && activeStep
              ? `Passo ${activeStepIndex + 1}/${activeOperation.steps.length}: ${activeStep.title}`
              : undefined
          }
        />
        <div className="lab-workspace">
          <label className="lab-input" htmlFor={inputId}>
            <span>Valor da operacao</span>
            <input
              id={inputId}
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="ex.: 42"
            />
          </label>

          <div className="lab-controls" aria-label="Controles do laboratorio">
            <button type="button" className="icon-command ghost" onClick={() => registerOperation('Inserir')}>
              <Plus size={18} aria-hidden="true" />
              Inserir
            </button>
            <button type="button" className="icon-command ghost" onClick={() => registerOperation('Remover')}>
              <Trash2 size={18} aria-hidden="true" />
              Remover
            </button>
            <button type="button" className="icon-command ghost" onClick={() => registerOperation('Pesquisar')}>
              <Search size={18} aria-hidden="true" />
              Pesquisar
            </button>
            <button type="button" className="icon-command ghost" onClick={() => registerOperation('Balancear')}>
              <RotateCcw size={18} aria-hidden="true" />
              Balancear
            </button>
            <button
              type="button"
              className="icon-command ghost"
              onClick={handlePrevious}
              disabled={!activeOperation || activeStepIndex === 0}
            >
              <StepBack size={18} aria-hidden="true" />
              Passo anterior
            </button>
            <button
              type="button"
              className="icon-command ghost"
              onClick={handleNext}
              disabled={!activeOperation || activeStepIndex >= activeOperation.steps.length - 1}
            >
              <StepForward size={18} aria-hidden="true" />
              Proximo passo
            </button>
          </div>

          <section className="lab-animation" aria-label="Animacao do laboratorio">
            {activeOperation && activeStep ? (
              <>
                <span className="lab-step-counter">{`Passo ${activeStepIndex + 1} de ${activeOperation.steps.length}`}</span>
                <h3>{activeStep.title}</h3>
                <p>{activeStep.description}</p>
                <div className="lab-step-track" aria-hidden="true">
                  <span style={{ width: `${((activeStepIndex + 1) / activeOperation.steps.length) * 100}%` }} />
                </div>
              </>
            ) : (
              <>
                <span className="lab-step-counter">Pronto para animar</span>
                <h3>Escolha uma operacao</h3>
                <p>Use inserir, remover, pesquisar ou balancear para ver a arvore mudar passo a passo.</p>
              </>
            )}
          </section>

          <ol className="lab-history" aria-label="Historico do laboratorio">
            {operations.length === 0 ? (
              <li className="empty-state">Nenhuma operacao executada.</li>
            ) : (
              operations.map((operation, index) => (
                <li key={operation.id} className={index === activeOperationIndex ? 'is-active' : ''}>
                  <span>{`Passo ${index + 1}`}</span>
                  <strong>{operation.label}</strong>
                </li>
              ))
            )}
          </ol>
        </div>
      </div>
    </section>
  );
}

function ErrorBookView({
  progressByChallenge,
  onOpenTrail,
}: {
  progressByChallenge: Record<string, StepProgress>;
  onOpenTrail: () => void;
}) {
  const errors = Object.values(progressByChallenge).flatMap((progress) =>
    Object.entries(progress.stepErrors).map(([stepId, count]) => ({
      challengeId: progress.challengeId,
      stepId,
      count,
    })),
  );

  return (
    <section className="utility-view" aria-label="Caderno de erros">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Caderno</p>
          <h2>Erros registrados</h2>
        </div>
        <button type="button" className="icon-command primary" onClick={onOpenTrail}>
          <Play size={18} aria-hidden="true" />
          Revisar na trilha
        </button>
      </header>

      {errors.length === 0 ? (
        <p className="empty-state">Nenhum erro registrado nesta sessao.</p>
      ) : (
        <ul className="error-list">
          {errors.map((error) => (
            <li key={`${error.challengeId}-${error.stepId}`}>
              <strong>{error.stepId}</strong>
              <span>{`${error.count} tentativa(s)`}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SimuladoView({ onStart }: { onStart: () => void }) {
  return (
    <section className="utility-view" aria-label="Simulado">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Simulado</p>
          <h2>Treino curto</h2>
        </div>
        <button type="button" className="icon-command primary" onClick={onStart}>
          <Sparkles size={18} aria-hidden="true" />
          Comecar
        </button>
      </header>

      <ol className="simulado-list">
        {challengeBank.slice(0, 4).map((challenge) => (
          <li key={challenge.id}>
            <strong>{challenge.title}</strong>
            <span>{challenge.structure}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EmptyTrail() {
  return (
    <section className="empty-trail" aria-label="Sem fase">
      <p className="empty-state">Nenhuma fase disponivel para esta estrutura.</p>
    </section>
  );
}

function StatusPill({ structure }: { structure: StructureCatalogItem }) {
  return (
    <span className={structure.status === 'liberada' ? 'status-pill is-open' : 'status-pill'}>
      {structure.status === 'liberada' ? 'liberada' : 'em breve'}
    </span>
  );
}

function getFirstChallenge(structureId: StructureKind): Challenge | undefined {
  return getOrderedChallenges(structureId)[0];
}

function getStructure(structureId: StructureKind): StructureCatalogItem | undefined {
  return structureCatalog.find((structure) => structure.id === structureId);
}

function getChallengeCount(structureId: StructureKind): number {
  return challengeBank.filter((challenge) => challenge.structure === structureId).length;
}

function getOrderedChallenges(structureId: StructureKind): Challenge[] {
  return challengeBank
    .filter((challenge) => challenge.structure === structureId)
    .sort(
      (first, second) =>
        getChallengePriority(first) - getChallengePriority(second) ||
        getPhaseOrder(first) - getPhaseOrder(second),
    );
}

function getChallengePriority(challenge: Challenge): number {
  if (challenge.source?.label === 'lista-aeds2-prova3.pdf') {
    return 0;
  }

  return 1;
}

// Fases numeradas (trilha de dominio) aparecem em ordem; as sem numero vao para o fim.
function getPhaseOrder(challenge: Challenge): number {
  return challenge.phase ?? Number.MAX_SAFE_INTEGER;
}

function getFocusLabel(focus: NonNullable<Challenge['focus']>): string {
  const labels: Record<NonNullable<Challenge['focus']>, string> = {
    codigo: 'Codigo',
    desenho: 'Desenho',
    conceito: 'Conceito',
  };

  return labels[focus];
}

function getLabInitialVisualState(
  selectedStructure: StructureKind,
  labTree: LabTreeNode | undefined,
): VisualState {
  const visualStateByStructure: Partial<Record<StructureKind, string>> = {
    lista: 'lista-simples-01',
    pilha: 'pilha-flexivel-01',
    ordenacao: 'ordenacao-selecao-01',
  };
  const visualStateId = visualStateByStructure[selectedStructure];

  return visualStateId ? sampleVisualStates[visualStateId] : treeToVisualState(labTree);
}

function buildCourseLabOperation(
  action: LabAction,
  rawValue: string,
  selectedStructure: StructureKind,
  labTree: LabTreeNode | undefined,
): LabOperation | undefined {
  const value = rawValue.trim() || getDefaultLabValue(selectedStructure);

  if (selectedStructure === 'lista') {
    return {
      id: `lista-${action}-${value}-${Date.now()}`,
      label: `${action} ${value}`,
      nextTree: labTree,
      steps: getListaLabSteps(action, value),
    };
  }

  if (selectedStructure === 'pilha') {
    return {
      id: `pilha-${action}-${value}-${Date.now()}`,
      label: `${action} ${value}`,
      nextTree: labTree,
      steps: getPilhaLabSteps(action, value),
    };
  }

  if (selectedStructure === 'ordenacao') {
    return {
      id: `ordenacao-${action}-${value}-${Date.now()}`,
      label: action === 'Balancear' ? 'Reorganizar vetor' : `${action} ${value}`,
      nextTree: labTree,
      steps: getOrdenacaoLabSteps(action, value),
    };
  }

  return undefined;
}

function getDefaultLabValue(selectedStructure: StructureKind): string {
  const values: Partial<Record<StructureKind, string>> = {
    lista: '5',
    pilha: '40',
    ordenacao: '5',
  };

  return values[selectedStructure] ?? '0';
}

function getListaLabSteps(action: LabAction, value: string): LabOperation['steps'] {
  if (action === 'Inserir') {
    return [
      {
        title: `Criar celula ${value}`,
        description: 'A lista simples cria uma nova celula antes de mexer nos ponteiros existentes.',
        visualState: sampleVisualStates['lista-simples-01'],
        activeNodeId: 'cabeca',
      },
      {
        title: 'Apontar para o antigo inicio',
        description: 'tmp.prox recebe primeiro.prox para preservar o restante da lista.',
        visualState: sampleVisualStates['lista-simples-01'],
        activePath: ['cabeca', 'c10'],
      },
      {
        title: 'Religar primeiro.prox',
        description: 'A celula cabeca passa a apontar para a nova celula.',
        visualState: sampleVisualStates['lista-inserir-inicio-correto-01'],
        activePath: ['cabeca', 'c5'],
        activeNodeId: 'c5',
      },
      {
        title: 'Lista atualizada',
        description: `${value} aparece no inicio logico sem perder as celulas antigas.`,
        visualState: sampleVisualStates['lista-inserir-inicio-correto-01'],
        activePath: ['cabeca', 'c5', 'c10'],
        activeNodeId: 'c5',
      },
    ];
  }

  if (action === 'Remover') {
    return [
      {
        title: 'Localizar anterior',
        description: 'Para remover uma posicao interna, a lista precisa parar na celula anterior.',
        visualState: sampleVisualStates['lista-simples-01'],
        activeNodeId: 'c10',
      },
      {
        title: 'Guardar removida',
        description: 'tmp recebe i.prox, que e a celula que vai sair.',
        visualState: sampleVisualStates['lista-simples-01'],
        activePath: ['c10', 'c20'],
        activeNodeId: 'c20',
      },
      {
        title: 'Religar ponteiros',
        description: 'i.prox passa a apontar para tmp.prox, pulando a celula removida.',
        visualState: sampleVisualStates['lista-simples-01'],
        activePath: ['c10', 'c30'],
      },
      {
        title: 'Retornar elemento',
        description: 'A funcao devolve o elemento guardado antes de descartar a celula.',
        visualState: sampleVisualStates['lista-simples-01'],
        activeNodeId: 'c20',
      },
    ];
  }

  if (action === 'Pesquisar') {
    return [
      {
        title: 'Comecar apos a cabeca',
        description: 'A celula cabeca nao armazena dado util, entao a busca parte de primeiro.prox.',
        visualState: sampleVisualStates['lista-simples-01'],
        activeNodeId: 'cabeca',
      },
      {
        title: 'Comparar com 10',
        description: `${value} e comparado com o primeiro elemento real da lista.`,
        visualState: sampleVisualStates['lista-simples-01'],
        activePath: ['cabeca', 'c10'],
        activeNodeId: 'c10',
      },
      {
        title: 'Avancar pelo prox',
        description: 'Enquanto nao encontrar o valor, a busca segue pelo campo prox.',
        visualState: sampleVisualStates['lista-simples-01'],
        activePath: ['cabeca', 'c10', 'c20'],
        activeNodeId: 'c20',
      },
      {
        title: 'Parar no fim ou no valor',
        description: 'A busca termina ao encontrar o elemento ou ao chegar em null.',
        visualState: sampleVisualStates['lista-simples-01'],
        activePath: ['cabeca', 'c10', 'c20', 'c30'],
        activeNodeId: 'c30',
      },
    ];
  }

  return [
    {
      title: 'Revisar encadeamento',
      description: 'Listas simples nao balanceiam; aqui o foco e conferir se os ponteiros continuam alcancaveis.',
      visualState: sampleVisualStates['lista-simples-01'],
      activePath: ['cabeca', 'c10', 'c20', 'c30'],
    },
    {
      title: 'Checar primeiro',
      description: 'primeiro deve continuar apontando para a celula cabeca.',
      visualState: sampleVisualStates['lista-simples-01'],
      activeNodeId: 'cabeca',
    },
    {
      title: 'Checar ultimo',
      description: 'ultimo deve apontar para a ultima celula real.',
      visualState: sampleVisualStates['lista-simples-01'],
      activeNodeId: 'c30',
    },
    {
      title: 'Estrutura consistente',
      description: 'Todos os nos reais continuam acessiveis seguindo prox.',
      visualState: sampleVisualStates['lista-simples-01'],
      activePath: ['cabeca', 'c10', 'c20', 'c30'],
    },
  ];
}

function getPilhaLabSteps(action: LabAction, value: string): LabOperation['steps'] {
  if (action === 'Inserir') {
    return [
      {
        title: `Criar celula ${value}`,
        description: 'O push cria uma celula que vai virar o novo topo.',
        visualState: sampleVisualStates['pilha-flexivel-01'],
        activeNodeId: 'topo',
      },
      {
        title: 'Apontar para o topo antigo',
        description: 'tmp.prox recebe topo para preservar a pilha existente.',
        visualState: sampleVisualStates['pilha-flexivel-01'],
        activePath: ['topo', 'c20', 'c10'],
      },
      {
        title: 'Atualizar topo',
        description: 'topo passa a apontar para tmp.',
        visualState: sampleVisualStates['pilha-push-correto-01'],
        activeNodeId: 'topo',
      },
      {
        title: 'Push concluido',
        description: `${value} sera o proximo valor removido por pop.`,
        visualState: sampleVisualStates['pilha-push-correto-01'],
        activePath: ['topo', 'c30'],
      },
    ];
  }

  if (action === 'Remover') {
    return [
      {
        title: 'Ler o topo',
        description: 'A pilha remove sempre o elemento mais recente.',
        visualState: sampleVisualStates['pilha-flexivel-01'],
        activeNodeId: 'topo',
      },
      {
        title: 'Guardar resposta',
        description: 'resp recebe topo.elemento antes do ponteiro topo mudar.',
        visualState: sampleVisualStates['pilha-flexivel-01'],
        activeNodeId: 'topo',
      },
      {
        title: 'Avancar topo',
        description: 'topo = topo.prox faz a segunda celula virar o novo topo.',
        visualState: sampleVisualStates['pilha-flexivel-01'],
        activePath: ['topo', 'c20'],
        activeNodeId: 'c20',
      },
      {
        title: 'Pop concluido',
        description: 'A funcao retorna o valor removido sem caminhar ate a base.',
        visualState: sampleVisualStates['pilha-flexivel-01'],
        activeNodeId: 'c20',
      },
    ];
  }

  if (action === 'Pesquisar') {
    return [
      {
        title: 'Comecar no topo',
        description: 'Uma busca auxiliar pode percorrer a pilha sem alterar topo.',
        visualState: sampleVisualStates['pilha-flexivel-01'],
        activeNodeId: 'topo',
      },
      {
        title: 'Comparar celula atual',
        description: `${value} e comparado com topo.elemento.`,
        visualState: sampleVisualStates['pilha-flexivel-01'],
        activeNodeId: 'topo',
      },
      {
        title: 'Seguir prox',
        description: 'A busca usa um ponteiro auxiliar para nao destruir a pilha.',
        visualState: sampleVisualStates['pilha-flexivel-01'],
        activePath: ['topo', 'c20'],
        activeNodeId: 'c20',
      },
      {
        title: 'Terminar em null',
        description: 'Se o valor nao aparecer, o auxiliar chega ao fim da cadeia.',
        visualState: sampleVisualStates['pilha-flexivel-01'],
        activePath: ['topo', 'c20', 'c10'],
        activeNodeId: 'c10',
      },
    ];
  }

  return [
    {
      title: 'Conferir topo',
      description: 'Pilhas nao balanceiam; a propriedade importante e LIFO.',
      visualState: sampleVisualStates['pilha-flexivel-01'],
      activeNodeId: 'topo',
    },
    {
      title: 'Conferir ordem',
      description: 'O caminho topo -> base mostra a ordem de remocao.',
      visualState: sampleVisualStates['pilha-flexivel-01'],
      activePath: ['topo', 'c20', 'c10'],
    },
    {
      title: 'Evitar remover pela base',
      description: 'Mexer na base transformaria o comportamento em outro TAD.',
      visualState: sampleVisualStates['pilha-flexivel-01'],
      activeNodeId: 'c10',
    },
    {
      title: 'Estrutura consistente',
      description: 'Toda operacao principal continua O(1) quando trabalha no topo.',
      visualState: sampleVisualStates['pilha-flexivel-01'],
      activeNodeId: 'topo',
    },
  ];
}

function getOrdenacaoLabSteps(action: LabAction, value: string): LabOperation['steps'] {
  if (action === 'Inserir') {
    return [
      {
        title: `Guardar pivo ${value}`,
        description: 'Na insercao, o valor temporario e guardado antes dos deslocamentos.',
        visualState: sampleVisualStates['ordenacao-insercao-errado-01'],
        activeNodeId: 'v2',
      },
      {
        title: 'Comparar com o prefixo',
        description: 'Enquanto o elemento anterior for maior que o pivo, ele anda para a direita.',
        visualState: sampleVisualStates['ordenacao-insercao-errado-01'],
        activePath: ['v1', 'v2'],
      },
      {
        title: 'Abrir espaco',
        description: 'Os valores maiores sao deslocados sem perder o pivo.',
        visualState: sampleVisualStates['ordenacao-insercao-correto-01'],
        activePath: ['v2', 'v3'],
      },
      {
        title: 'Prefixo ordenado',
        description: 'O pivo entra na posicao correta do trecho ja ordenado.',
        visualState: sampleVisualStates['ordenacao-insercao-correto-01'],
        activePath: ['v0', 'v1', 'v2'],
        activeNodeId: 'v2',
      },
    ];
  }

  if (action === 'Pesquisar') {
    return [
      {
        title: 'Ler indice inicial',
        description: 'A simulacao compara posicoes do vetor uma a uma.',
        visualState: sampleVisualStates['ordenacao-selecao-01'],
        activeNodeId: 'v0',
      },
      {
        title: 'Comparar candidato',
        description: `${value} e comparado com os elementos do vetor.`,
        visualState: sampleVisualStates['ordenacao-selecao-01'],
        activePath: ['v0', 'v1'],
        activeNodeId: 'v1',
      },
      {
        title: 'Avancar indice',
        description: 'Sem tabela auxiliar, a busca sequencial segue ate achar ou acabar.',
        visualState: sampleVisualStates['ordenacao-selecao-01'],
        activePath: ['v0', 'v1', 'v2'],
        activeNodeId: 'v2',
      },
      {
        title: 'Resultado',
        description: 'O custo da busca sequencial em vetor e O(n).',
        visualState: sampleVisualStates['ordenacao-selecao-01'],
        activePath: ['v0', 'v1', 'v2', 'v3', 'v4'],
      },
    ];
  }

  if (action === 'Remover') {
    return [
      {
        title: 'Localizar posicao',
        description: 'Em vetor, remover exige achar o indice do elemento.',
        visualState: sampleVisualStates['ordenacao-selecao-01'],
        activeNodeId: 'v1',
      },
      {
        title: 'Deslocar esquerda',
        description: 'Os elementos posteriores andam uma casa para fechar o buraco.',
        visualState: sampleVisualStates['ordenacao-selecao-01'],
        activePath: ['v1', 'v2', 'v3', 'v4'],
      },
      {
        title: 'Reduzir tamanho logico',
        description: 'A variavel n diminui; a capacidade do array nao precisa mudar.',
        visualState: sampleVisualStates['ordenacao-selecao-01'],
        activeNodeId: 'v4',
      },
      {
        title: 'Remocao analisada',
        description: 'A operacao custa O(n) pelo deslocamento.',
        visualState: sampleVisualStates['ordenacao-selecao-01'],
        activePath: ['v1', 'v2', 'v3', 'v4'],
      },
    ];
  }

  return [
    {
      title: 'Escolher pivo',
      description: 'No quicksort, o pivo separa valores menores e maiores.',
      visualState: sampleVisualStates['ordenacao-particao-01'],
      activeNodeId: 'v2',
    },
    {
      title: 'Avancar ponteiros',
      description: 'i avanca da esquerda e j recua da direita procurando inversoes.',
      visualState: sampleVisualStates['ordenacao-particao-01'],
      activePath: ['v0', 'v1', 'v3', 'v4'],
    },
    {
      title: 'Trocar quando necessario',
      description: 'Elementos do lado errado sao trocados antes das chamadas recursivas.',
      visualState: sampleVisualStates['ordenacao-particao-01'],
      activePath: ['v1', 'v3'],
    },
    {
      title: 'Particao concluida',
      description: 'A particao nao ordena tudo sozinha; ela prepara as duas chamadas recursivas.',
      visualState: sampleVisualStates['ordenacao-particao-01'],
      activePath: ['v0', 'v1', 'v2', 'v3', 'v4'],
    },
  ];
}

function getCompletedCount(progressByChallenge: Record<string, StepProgress>): number {
  return Object.values(progressByChallenge).reduce(
    (total, progress) => total + progress.resolvedStepIds.length,
    0,
  );
}

function getScoreTotal(progressByChallenge: Record<string, StepProgress>): number {
  return Object.values(progressByChallenge).reduce((total, progress) => total + progress.score, 0);
}
