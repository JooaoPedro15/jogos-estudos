import { describe, expect, it } from 'vitest';

import type {
  BlockStep,
  ChoiceStep,
  GapStep,
  ReviewStep,
} from '../types/challenge';
import { createEncounterProgress, resolveStep } from './stepEngine';

const choiceStep: ChoiceStep = {
  id: 'st-choice',
  kind: 'interpretar',
  prompt: 'Qual propriedade da ABB?',
  explanation: 'Menores a esquerda, maiores a direita.',
  options: [
    { id: 'a', label: 'esq < raiz < dir' },
    { id: 'b', label: 'tudo no mesmo nivel' },
    { id: 'c', label: 'raiz e o menor' },
  ],
  correctOptionId: 'a',
};

const simulateStep: ChoiceStep = {
  id: 'st-sim',
  kind: 'simular',
  prompt: 'Qual caminho ao buscar 50?',
  options: [
    { id: 'a', label: '40 -> 60 -> 50' },
    { id: 'b', label: '40 -> 20 -> 30' },
  ],
  correctOptionId: 'a',
  activePath: ['n40', 'n60', 'n50'],
  activeNodeId: 'n50',
};

const gapStep: GapStep = {
  id: 'st-gap',
  kind: 'lacuna',
  prompt: 'Condicao de descida a esquerda: if (x ___ i.elemento)',
  gapId: 'comparacao-esq',
  answers: [{ id: 'lt', answer: '<', aliases: ['menor que'] }],
};

const accentGapStep: GapStep = {
  id: 'st-gap-acento',
  kind: 'lacuna',
  prompt: 'Como se chama o no superior?',
  gapId: 'no-superior',
  answers: [{ id: 'raiz', answer: 'raiz', aliases: ['no raiz'] }],
};

const blockStep: BlockStep = {
  id: 'st-blocks',
  kind: 'blocos',
  prompt: 'Ordene a logica recursiva.',
  blocks: [
    { id: 'nulo', label: 'se i == null, retorne 0', order: 1 },
    { id: 'folha', label: 'se folha, retorne 1', order: 2 },
    { id: 'soma', label: 'retorne esq + dir', order: 3 },
  ],
  correctOrder: ['nulo', 'folha', 'soma'],
};

const reviewStep: ReviewStep = {
  id: 'st-review',
  kind: 'revisao',
  prompt: 'Revisao final.',
  summary: 'Resumo da solucao.',
  solutionNotes: ['caso base', 'recursao', 'complexidade'],
};

const mistakeChoiceStep: ChoiceStep = {
  ...choiceStep,
  id: 'st-mistake',
  explanation: undefined,
  mistakeId: 'troca-de-ramos',
};

describe('createEncounterProgress', () => {
  it('starts an empty progress for a challenge', () => {
    const progress = createEncounterProgress('abb-pesquisar-01');

    expect(progress.challengeId).toBe('abb-pesquisar-01');
    expect(progress.stepIndex).toBe(0);
    expect(progress.resolvedStepIds).toEqual([]);
    expect(progress.stepErrors).toEqual({});
    expect(progress.revealedHintStepIds).toEqual([]);
    expect(progress.eliminatedOptionIds).toEqual({});
    expect(progress.scoreThisEncounter).toBe(0);
    expect(progress.doubleNextScore).toBe(false);
    expect(progress.focusShield).toBe(false);
    expect(progress.complete).toBe(false);
  });
});

describe('resolveStep — choice', () => {
  it('marks a correct choice as resolved and awards base score', () => {
    const progress = createEncounterProgress('c');
    const { progress: next, result } = resolveStep(progress, choiceStep, {
      kind: 'choice',
      optionId: 'a',
    });

    expect(result.correct).toBe(true);
    expect(result.scoreDelta).toBe(10);
    expect(result.focusLost).toBe(0);
    expect(next.resolvedStepIds).toContain('st-choice');
    expect(next.stepIndex).toBe(1);
    expect(next.scoreThisEncounter).toBe(10);
  });

  it('penalizes a wrong choice with one focus and reveals the explanation feedback', () => {
    const progress = createEncounterProgress('c');
    const { progress: next, result } = resolveStep(progress, choiceStep, {
      kind: 'choice',
      optionId: 'b',
    });

    expect(result.correct).toBe(false);
    expect(result.scoreDelta).toBe(0);
    expect(result.focusLost).toBe(1);
    expect(result.feedback).toBe('Menores a esquerda, maiores a direita.');
    expect(next.stepErrors['st-choice']).toBe(1);
    // Avanca mesmo errando, revelando a resposta correta.
    expect(next.resolvedStepIds).toContain('st-choice');
    expect(next.stepIndex).toBe(1);
  });

  it('surfaces the mistakeId as feedback source when no explanation exists', () => {
    const progress = createEncounterProgress('c');
    const { result } = resolveStep(progress, mistakeChoiceStep, {
      kind: 'choice',
      optionId: 'b',
    });

    expect(result.correct).toBe(false);
    expect(result.mistakeId).toBe('troca-de-ramos');
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it('propagates activePath and activeNodeId for simulation steps', () => {
    const progress = createEncounterProgress('c');
    const { result } = resolveStep(progress, simulateStep, {
      kind: 'choice',
      optionId: 'a',
    });

    expect(result.activePath).toEqual(['n40', 'n60', 'n50']);
    expect(result.activeNodeId).toBe('n50');
  });
});

describe('resolveStep — gap', () => {
  it('accepts the exact answer', () => {
    const progress = createEncounterProgress('c');
    const { result } = resolveStep(progress, gapStep, { kind: 'gap', text: '<' });

    expect(result.correct).toBe(true);
  });

  it('accepts an alias ignoring case and surrounding spaces', () => {
    const progress = createEncounterProgress('c');
    const { result } = resolveStep(progress, gapStep, {
      kind: 'gap',
      text: '  Menor Que  ',
    });

    expect(result.correct).toBe(true);
  });

  it('accepts accented input against an unaccented answer', () => {
    const progress = createEncounterProgress('c');
    const { result } = resolveStep(progress, accentGapStep, {
      kind: 'gap',
      text: 'RAÍZ',
    });

    expect(result.correct).toBe(true);
  });

  it('rejects a wrong gap answer with one focus lost', () => {
    const progress = createEncounterProgress('c');
    const { progress: next, result } = resolveStep(progress, gapStep, {
      kind: 'gap',
      text: '>',
    });

    expect(result.correct).toBe(false);
    expect(result.focusLost).toBe(1);
    expect(next.stepErrors['st-gap']).toBe(1);
  });
});

describe('resolveStep — blocks', () => {
  it('accepts the exact correct order', () => {
    const progress = createEncounterProgress('c');
    const { result } = resolveStep(progress, blockStep, {
      kind: 'blocks',
      order: ['nulo', 'folha', 'soma'],
    });

    expect(result.correct).toBe(true);
    expect(result.scoreDelta).toBe(10);
  });

  it('rejects a wrong block order', () => {
    const progress = createEncounterProgress('c');
    const { result } = resolveStep(progress, blockStep, {
      kind: 'blocks',
      order: ['folha', 'nulo', 'soma'],
    });

    expect(result.correct).toBe(false);
    expect(result.focusLost).toBe(1);
  });
});

describe('resolveStep — review', () => {
  it('advances without scoring and without focus risk', () => {
    const progress = createEncounterProgress('c');
    const { progress: next, result } = resolveStep(progress, reviewStep, {
      kind: 'review',
    });

    expect(result.correct).toBe(true);
    expect(result.scoreDelta).toBe(0);
    expect(result.focusLost).toBe(0);
    expect(next.resolvedStepIds).toContain('st-review');
    expect(next.stepIndex).toBe(1);
  });
});

describe('resolveStep — purity and completion', () => {
  it('does not mutate the input progress', () => {
    const progress = createEncounterProgress('c');
    const snapshot = JSON.stringify(progress);

    resolveStep(progress, choiceStep, { kind: 'choice', optionId: 'a' });

    expect(JSON.stringify(progress)).toBe(snapshot);
  });
});
