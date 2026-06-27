import { describe, expect, it } from 'vitest';

import type { ChoiceStep } from '../types/challenge';
import {
  applyToolEffect,
  BASE_STEP_SCORE,
  createEncounterProgress,
  resolveStep,
} from './stepEngine';

const choiceStep: ChoiceStep = {
  id: 'st-choice',
  kind: 'interpretar',
  prompt: 'Qual propriedade da ABB?',
  explanation: 'Menores a esquerda, maiores a direita.',
  hint: 'Pense na regra esq < raiz < dir.',
  options: [
    { id: 'a', label: 'esq < raiz < dir' },
    { id: 'b', label: 'tudo no mesmo nivel' },
    { id: 'c', label: 'raiz e o menor' },
  ],
  correctOptionId: 'a',
};

describe('applyToolEffect — revelarDica', () => {
  it('marks the current step hint as revealed', () => {
    const progress = createEncounterProgress('c');
    const { progress: next, energyDelta, message } = applyToolEffect(
      progress,
      choiceStep,
      'revelarDica',
      undefined,
    );

    expect(next.revealedHintStepIds).toContain('st-choice');
    expect(energyDelta).toBe(0);
    expect(message.length).toBeGreaterThan(0);
  });

  it('does nothing without a current step', () => {
    const progress = createEncounterProgress('c');
    const { progress: next } = applyToolEffect(progress, undefined, 'revelarDica', undefined);

    expect(next.revealedHintStepIds).toEqual([]);
  });
});

describe('applyToolEffect — eliminarAlternativa', () => {
  it('removes one wrong option from the current choice step', () => {
    const progress = createEncounterProgress('c');
    const { progress: next } = applyToolEffect(
      progress,
      choiceStep,
      'eliminarAlternativa',
      undefined,
    );

    const eliminated = next.eliminatedOptionIds['st-choice'] ?? [];
    expect(eliminated).toHaveLength(1);
    expect(eliminated[0]).not.toBe('a'); // nunca remove a alternativa correta
  });

  it('removes a second wrong option without duplicating when enough wrong options remain', () => {
    const fourOptionStep: ChoiceStep = {
      ...choiceStep,
      id: 'st-four',
      options: [
        { id: 'a', label: 'correta' },
        { id: 'b', label: 'errada 1' },
        { id: 'c', label: 'errada 2' },
        { id: 'd', label: 'errada 3' },
      ],
      correctOptionId: 'a',
    };

    const progress = createEncounterProgress('c');
    const once = applyToolEffect(progress, fourOptionStep, 'eliminarAlternativa', undefined).progress;
    const twice = applyToolEffect(once, fourOptionStep, 'eliminarAlternativa', undefined).progress;

    const eliminated = twice.eliminatedOptionIds['st-four'] ?? [];
    expect(eliminated).toHaveLength(2);
    expect(new Set(eliminated).size).toBe(2);
    expect(eliminated).not.toContain('a');
  });

  it('never removes the last remaining wrong option', () => {
    const progress = createEncounterProgress('c');
    let current = progress;
    for (let i = 0; i < 5; i += 1) {
      current = applyToolEffect(current, choiceStep, 'eliminarAlternativa', undefined).progress;
    }

    // 3 opções, 1 correta, 2 erradas: no máximo 1 erro é eliminado para manter escolha real.
    const eliminated = current.eliminatedOptionIds['st-choice'] ?? [];
    expect(eliminated.length).toBeLessThanOrEqual(1);
  });
});

describe('applyToolEffect — pularEtapa', () => {
  it('resolves the current step with no score and no focus risk', () => {
    const progress = createEncounterProgress('c');
    const { progress: next } = applyToolEffect(progress, choiceStep, 'pularEtapa', undefined);

    expect(next.resolvedStepIds).toContain('st-choice');
    expect(next.stepIndex).toBe(1);
    expect(next.scoreThisEncounter).toBe(0);
  });
});

describe('applyToolEffect — escudoFoco', () => {
  it('arms the focus shield', () => {
    const progress = createEncounterProgress('c');
    const { progress: next } = applyToolEffect(progress, choiceStep, 'escudoFoco', undefined);

    expect(next.focusShield).toBe(true);
  });

  it('protects the next wrong answer from losing focus', () => {
    const shielded = applyToolEffect(
      createEncounterProgress('c'),
      choiceStep,
      'escudoFoco',
      undefined,
    ).progress;

    const { progress: after, result } = resolveStep(shielded, choiceStep, {
      kind: 'choice',
      optionId: 'b',
    });

    expect(result.focusLost).toBe(0);
    expect(after.focusShield).toBe(false); // consumido
  });
});

describe('applyToolEffect — dobrarScore', () => {
  it('arms the double-score flag', () => {
    const progress = createEncounterProgress('c');
    const { progress: next } = applyToolEffect(progress, choiceStep, 'dobrarScore', undefined);

    expect(next.doubleNextScore).toBe(true);
  });

  it('doubles the score of the next correct answer and then clears', () => {
    const armed = applyToolEffect(
      createEncounterProgress('c'),
      choiceStep,
      'dobrarScore',
      undefined,
    ).progress;

    const { progress: after, result } = resolveStep(armed, choiceStep, {
      kind: 'choice',
      optionId: 'a',
    });

    expect(result.scoreDelta).toBe(BASE_STEP_SCORE * 2);
    expect(after.scoreThisEncounter).toBe(BASE_STEP_SCORE * 2);
    expect(after.doubleNextScore).toBe(false);
  });
});

describe('applyToolEffect — energiaExtra', () => {
  it('reports the configured energy delta', () => {
    const progress = createEncounterProgress('c');
    const { energyDelta, progress: next } = applyToolEffect(
      progress,
      choiceStep,
      'energiaExtra',
      3,
    );

    expect(energyDelta).toBe(3);
    // Não altera o progresso da resolução, apenas a economia de energia.
    expect(next.stepIndex).toBe(0);
  });

  it('falls back to a default delta when no value is provided', () => {
    const progress = createEncounterProgress('c');
    const { energyDelta } = applyToolEffect(progress, choiceStep, 'energiaExtra', undefined);

    expect(energyDelta).toBeGreaterThan(0);
  });
});

describe('applyToolEffect — purity', () => {
  it('does not mutate the input progress', () => {
    const progress = createEncounterProgress('c');
    const snapshot = JSON.stringify(progress);

    applyToolEffect(progress, choiceStep, 'escudoFoco', undefined);

    expect(JSON.stringify(progress)).toBe(snapshot);
  });
});
