import { Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';

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
import type { Challenge, StructureKind } from '../types/challenge';
import { StepPanel } from './components/StepPanel';
import { StructureDiagram } from './components/StructureDiagram';
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
    () => challengeBank.filter((challenge) => challenge.structure === selectedStructure),
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
  return (
    <section className="library-view" aria-label="Biblioteca de estruturas">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Biblioteca</p>
          <h2>Escolha uma estrutura</h2>
        </div>
        <span className="header-pill">2 liberadas / 7 em breve</span>
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
                  <span>{`Fase ${index + 1}`}</span>
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
                  <p className="eyebrow">{activeChallenge.pattern}</p>
                  <h3>{activeChallenge.title}</h3>
                  <p>{activeChallenge.statement}</p>
                </div>

                <StructureDiagram
                  structure={activeChallenge.structure}
                  activePath={lastResult?.activePath ?? activeChallenge.activePath}
                  activeNodeId={lastResult?.activeNodeId ?? activeChallenge.activeNodeId}
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

  return (
    <section className="utility-view" aria-label="Laboratorio">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Laboratorio</p>
          <h2>{selected?.shortName ?? 'Estrutura'}</h2>
        </div>
      </header>

      <div className="tool-surface">
        <StructureDiagram structure={selectedStructure} />
        <div className="lab-controls" aria-label="Controles do laboratorio">
          {['Inserir', 'Remover', 'Pesquisar', 'Passo anterior', 'Proximo passo'].map((label) => (
            <button key={label} type="button" className="icon-command ghost" disabled>
              {label}
            </button>
          ))}
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
  return challengeBank.find((challenge) => challenge.structure === structureId);
}

function getStructure(structureId: StructureKind): StructureCatalogItem | undefined {
  return structureCatalog.find((structure) => structure.id === structureId);
}

function getChallengeCount(structureId: StructureKind): number {
  return challengeBank.filter((challenge) => challenge.structure === structureId).length;
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
