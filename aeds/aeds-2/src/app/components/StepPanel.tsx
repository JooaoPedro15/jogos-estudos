import { useId, useState } from 'react';
import type { FormEvent } from 'react';

import { sampleVisualStates } from '../../structures/sampleStructures';
import type { ChallengeStep } from '../../types/challenge';
import type { StepAnswer, StepProgress } from '../../evaluators/stepEvaluator';
import { StructureDiagram } from './StructureDiagram';

export type StepPanelProps = {
  step: ChallengeStep;
  progress: StepProgress;
  /** Numero total de etapas do desafio atual, para exibir "etapa X/N". */
  totalSteps: number;
  onAnswer: (answer: StepAnswer) => void;
  /**
   * Quando informados, a etapa `clique` usa selecao controlada externamente
   * (o diagrama SVG clicavel fica no nivel acima, no TrailView). O ClickStepBody
   * passa a mostrar apenas o resumo da selecao e o botao de confirmar.
   */
  clickSelection?: string[];
  onToggleClickNode?: (nodeId: string) => void;
};

/**
 * Renderiza a etapa atual do desafio de acordo com `step.kind` e dispara
 * `onAnswer` com o `StepAnswer` correspondente. Cada variante é totalmente
 * operável por teclado (botões nativos, input de texto, foco visível via CSS).
 */
export function StepPanel({
  step,
  progress,
  totalSteps,
  onAnswer,
  clickSelection,
  onToggleClickNode,
}: StepPanelProps) {
  const stepNumber = Math.min(progress.stepIndex + 1, totalSteps);

  return (
    <section className="step-panel" aria-label="Etapa do desafio">
      <div className="step-progress" aria-label="Progresso da etapa">
        <span>{`Etapa ${stepNumber}/${totalSteps}`}</span>
        <div className="progress-track">
          <span style={{ width: `${(stepNumber / totalSteps) * 100}%` }} />
        </div>
      </div>

      <p className="step-prompt">{step.prompt}</p>

      <StepBody
        step={step}
        progress={progress}
        onAnswer={onAnswer}
        clickSelection={clickSelection}
        onToggleClickNode={onToggleClickNode}
      />
    </section>
  );
}

type StepBodyProps = {
  step: ChallengeStep;
  progress: StepProgress;
  onAnswer: (answer: StepAnswer) => void;
  clickSelection?: string[];
  onToggleClickNode?: (nodeId: string) => void;
};

function StepBody({
  step,
  progress,
  onAnswer,
  clickSelection,
  onToggleClickNode,
}: StepBodyProps) {
  switch (step.kind) {
    case 'interpretar':
    case 'simular':
    case 'complexidade':
      return <ChoiceStepBody step={step} progress={progress} onAnswer={onAnswer} />;
    case 'lacuna':
      return <GapStepBody step={step} onAnswer={onAnswer} />;
    case 'blocos':
      return <BlockStepBody step={step} onAnswer={onAnswer} />;
    case 'clique':
      return (
        <ClickStepBody
          step={step}
          onAnswer={onAnswer}
          clickSelection={clickSelection}
          onToggleClickNode={onToggleClickNode}
        />
      );
    case 'corrigir':
      return <FixStepBody key={step.id} step={step} onAnswer={onAnswer} />;
    case 'digitar':
      return <TypeCodeStepBody key={step.id} step={step} onAnswer={onAnswer} />;
    case 'revisao':
      return <ReviewStepBody step={step} onAnswer={onAnswer} />;
    default: {
      const exhaustiveCheck: never = step;
      void exhaustiveCheck;
      return null;
    }
  }
}

type ChoiceStepBodyProps = {
  step: Extract<ChallengeStep, { kind: 'interpretar' | 'simular' | 'complexidade' }>;
  progress: StepProgress;
  onAnswer: (answer: StepAnswer) => void;
};

function ChoiceStepBody({ step, onAnswer }: ChoiceStepBodyProps) {
  const visibleOptions = step.options;

  return (
    <div className="choice-grid" role="group" aria-label="Alternativas">
      {visibleOptions.map((option) => {
        const visualState = option.visualStateId ? sampleVisualStates[option.visualStateId] : undefined;

        return (
          <button
            key={option.id}
            type="button"
            className={`choice-option${visualState ? ' has-diagram' : ''}`}
            aria-label={option.label}
            onClick={() => onAnswer({ kind: 'choice', optionId: option.id })}
          >
            <span>{option.label}</span>
            {visualState ? (
              <span className="choice-diagram" aria-hidden="true">
                <StructureDiagram structure="abb" visualState={visualState} />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

type ClickStepBodyProps = {
  step: Extract<ChallengeStep, { kind: 'clique' }>;
  onAnswer: (answer: StepAnswer) => void;
  clickSelection?: string[];
  onToggleClickNode?: (nodeId: string) => void;
};

function ClickStepBody({ step, onAnswer, clickSelection, onToggleClickNode }: ClickStepBodyProps) {
  // Selecao controlada externamente: o diagrama SVG clicavel esta no TrailView.
  // Aqui mostramos apenas o resumo da selecao e o botao de confirmar.
  if (clickSelection !== undefined) {
    return (
      <div className="click-step is-controlled">
        <p className="click-selection-summary">
          {clickSelection.length === 0
            ? 'Clique nos elementos do desenho acima.'
            : `${clickSelection.length} selecionado(s): ${clickSelection.join(', ')}`}
        </p>
        <button
          type="button"
          className="icon-command primary"
          onClick={() => onAnswer({ kind: 'click', nodeIds: clickSelection })}
          disabled={clickSelection.length === 0}
        >
          Confirmar selecao
        </button>
      </div>
    );
  }

  // Fallback: sem diagrama interativo, mostra botoes de texto.
  const [nodeIds, setNodeIds] = useState<string[]>([]);
  const maxClicks = step.maxClicks ?? step.targetNodeIds.length;

  const handlePick = (nodeId: string) => {
    setNodeIds((current) => {
      if (step.selectionMode !== 'ordered' && current.includes(nodeId)) {
        return current.filter((candidate) => candidate !== nodeId);
      }

      if (current.length >= maxClicks) {
        return current;
      }

      return [...current, nodeId];
    });
  };

  return (
    <div className="click-step">
      <div className="click-targets" role="group" aria-label="Nos selecionaveis">
        {step.targetNodeIds.map((nodeId) => {
          const selected = nodeIds.includes(nodeId);

          return (
            <button
              key={nodeId}
              type="button"
              className={`node-choice${selected ? ' is-selected' : ''}`}
              aria-pressed={selected}
              onClick={() => handlePick(nodeId)}
            >
              {nodeId}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="icon-command primary"
        onClick={() => onAnswer({ kind: 'click', nodeIds })}
        disabled={nodeIds.length === 0}
      >
        Confirmar selecao
      </button>
    </div>
  );
}

type GapStepBodyProps = {
  step: Extract<ChallengeStep, { kind: 'lacuna' }>;
  onAnswer: (answer: StepAnswer) => void;
};

function GapStepBody({ step, onAnswer }: GapStepBodyProps) {
  const [text, setText] = useState('');
  const inputId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (text.trim().length === 0) {
      return;
    }
    onAnswer({ kind: 'gap', text });
  };

  return (
    <form className="gap-form" onSubmit={handleSubmit}>
      <label htmlFor={inputId}>Complete a lacuna</label>
      <div className="gap-input-row">
        <input
          id={inputId}
          type="text"
          name="gap-answer"
          autoComplete="off"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit" className="icon-command primary" disabled={text.trim().length === 0}>
          Responder
        </button>
      </div>
    </form>
  );
}

type BlockStepBodyProps = {
  step: Extract<ChallengeStep, { kind: 'blocos' }>;
  onAnswer: (answer: StepAnswer) => void;
};

function BlockStepBody({ step, onAnswer }: BlockStepBodyProps) {
  const [order, setOrder] = useState<string[]>([]);
  const remaining = step.blocks.filter((block) => !order.includes(block.id));

  const handlePick = (blockId: string) => {
    setOrder((current) => [...current, blockId]);
  };

  const handleRemoveLast = () => {
    setOrder((current) => current.slice(0, -1));
  };

  const handleReset = () => {
    setOrder([]);
  };

  const handleSubmit = () => {
    if (order.length !== step.blocks.length) {
      return;
    }
    onAnswer({ kind: 'blocks', order });
  };

  return (
    <div className="block-step">
      <div className="block-ordered" aria-label="Ordem escolhida">
        {order.length === 0 ? (
          <p className="empty-state">Clique nos blocos abaixo na ordem correta.</p>
        ) : (
          <ol>
            {order.map((blockId, index) => {
              const block = step.blocks.find((candidate) => candidate.id === blockId);
              return <li key={`${blockId}-${index}`}>{block?.label ?? blockId}</li>;
            })}
          </ol>
        )}
      </div>

      <div className="block-pool" role="group" aria-label="Blocos disponiveis">
        {remaining.map((block) => (
          <button
            key={block.id}
            type="button"
            className="block-option"
            onClick={() => handlePick(block.id)}
          >
            {block.label}
          </button>
        ))}
      </div>

      <div className="block-actions">
        <button
          type="button"
          className="icon-command ghost"
          onClick={handleRemoveLast}
          disabled={order.length === 0}
        >
          Desfazer ultimo
        </button>
        <button
          type="button"
          className="icon-command ghost"
          onClick={handleReset}
          disabled={order.length === 0}
        >
          Recomecar ordem
        </button>
        <button
          type="button"
          className="icon-command primary"
          onClick={handleSubmit}
          disabled={order.length !== step.blocks.length}
        >
          Confirmar ordem
        </button>
      </div>
    </div>
  );
}

type FixStepBodyProps = {
  step: Extract<ChallengeStep, { kind: 'corrigir' }>;
  onAnswer: (answer: StepAnswer) => void;
};

/**
 * Etapa "corrigir": primeiro o jogador clica na linha que considera errada,
 * depois escolhe o conserto. So confirma quando os dois estao selecionados.
 */
function FixStepBody({ step, onAnswer }: FixStepBodyProps) {
  const [lineIndex, setLineIndex] = useState<number | undefined>(undefined);
  const [fixId, setFixId] = useState<string | undefined>(undefined);

  const handleSubmit = () => {
    if (lineIndex === undefined || fixId === undefined) {
      return;
    }
    onAnswer({ kind: 'fix', lineIndex, fixId });
  };

  return (
    <div className="fix-step">
      <div className="fix-lines" role="group" aria-label="Linhas do codigo">
        <p className="fix-instruction">1. Clique na linha errada:</p>
        {step.lines.map((line, index) => (
          <button
            key={`${index}-${line.slice(0, 16)}`}
            type="button"
            className={`fix-line${lineIndex === index ? ' is-selected' : ''}`}
            aria-pressed={lineIndex === index}
            onClick={() => setLineIndex(index)}
          >
            <span className="fix-line-number">{index + 1}</span>
            <code>{line}</code>
          </button>
        ))}
      </div>

      <div className="fix-options" role="group" aria-label="Opcoes de conserto">
        <p className="fix-instruction">2. Escolha o conserto:</p>
        {step.fixOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`choice-option${fixId === option.id ? ' is-selected' : ''}`}
            aria-pressed={fixId === option.id}
            onClick={() => setFixId(option.id)}
          >
            <code>{option.label}</code>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="icon-command primary"
        onClick={handleSubmit}
        disabled={lineIndex === undefined || fixId === undefined}
      >
        Confirmar correcao
      </button>
    </div>
  );
}

type TypeCodeStepBodyProps = {
  step: Extract<ChallengeStep, { kind: 'digitar' }>;
  onAnswer: (answer: StepAnswer) => void;
};

/** Etapa "digitar": o jogador escreve a linha/expressao pedida. */
function TypeCodeStepBody({ step, onAnswer }: TypeCodeStepBodyProps) {
  const [text, setText] = useState('');
  const textareaId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (text.trim().length === 0) {
      return;
    }
    onAnswer({ kind: 'code', text });
  };

  return (
    <form className="type-code-form" onSubmit={handleSubmit}>
      <label htmlFor={textareaId}>Digite o codigo</label>
      <textarea
        id={textareaId}
        className="type-code-input"
        rows={3}
        spellCheck={false}
        autoComplete="off"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="ex.: return contar(i.esq) + contar(i.dir) + 1;"
      />
      <button type="submit" className="icon-command primary" disabled={text.trim().length === 0}>
        Responder
      </button>
    </form>
  );
}

type ReviewStepBodyProps = {
  step: Extract<ChallengeStep, { kind: 'revisao' }>;
  onAnswer: (answer: StepAnswer) => void;
};

function ReviewStepBody({ step, onAnswer }: ReviewStepBodyProps) {
  return (
    <div className="review-step">
      <p className="review-summary">{step.summary}</p>
      <ul className="review-notes">
        {step.solutionNotes.map((note, index) => (
          <li key={`${index}-${note.slice(0, 12)}`}>{note}</li>
        ))}
      </ul>
      <button
        type="button"
        className="icon-command primary"
        onClick={() => onAnswer({ kind: 'review' })}
      >
        Avancar
      </button>
    </div>
  );
}
