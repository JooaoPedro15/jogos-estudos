import { useId, useState } from 'react';
import type { FormEvent } from 'react';

import type { ChallengeStep } from '../../types/challenge';
import type { StepAnswer, StepProgress } from '../../evaluators/stepEvaluator';

export type StepPanelProps = {
  step: ChallengeStep;
  progress: StepProgress;
  /** Numero total de etapas do desafio atual, para exibir "etapa X/N". */
  totalSteps: number;
  onAnswer: (answer: StepAnswer) => void;
};

/**
 * Renderiza a etapa atual do encontro de acordo com `step.kind` e dispara
 * `onAnswer` com o `StepAnswer` correspondente. Cada variante é totalmente
 * operável por teclado (botões nativos, input de texto, foco visível via CSS).
 */
export function StepPanel({ step, progress, totalSteps, onAnswer }: StepPanelProps) {
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

      <StepBody step={step} progress={progress} onAnswer={onAnswer} />
    </section>
  );
}

type StepBodyProps = {
  step: ChallengeStep;
  progress: StepProgress;
  onAnswer: (answer: StepAnswer) => void;
};

function StepBody({ step, progress, onAnswer }: StepBodyProps) {
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
      return <ClickStepBody step={step} onAnswer={onAnswer} />;
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
      {visibleOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          className="choice-option"
          onClick={() => onAnswer({ kind: 'choice', optionId: option.id })}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

type ClickStepBodyProps = {
  step: Extract<ChallengeStep, { kind: 'clique' }>;
  onAnswer: (answer: StepAnswer) => void;
};

function ClickStepBody({ step, onAnswer }: ClickStepBodyProps) {
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

  const handleSubmit = () => {
    if (nodeIds.length === 0) {
      return;
    }

    onAnswer({ kind: 'click', nodeIds });
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
        onClick={handleSubmit}
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
