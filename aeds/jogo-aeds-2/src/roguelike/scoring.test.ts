import { describe, expect, it } from 'vitest';

import { comboMultiplierFor, scoreEncounter } from './scoring';
import type { CardId } from '../cards/cardLibrary';

const leituraCombo = ['revelar-dica', 'eliminar-alternativa'] as const satisfies readonly CardId[];

describe('scoreEncounter', () => {
  it('returns the raw step score when no combos are active', () => {
    const result = scoreEncounter({ stepScore: 40, playedCardIds: [] });

    expect(result.score).toBe(40);
    expect(result.comboMultiplier).toBe(1);
    expect(result.activeCombos).toEqual([]);
  });

  it('applies the combo multiplier to the accumulated step score', () => {
    const result = scoreEncounter({ stepScore: 40, playedCardIds: leituraCombo });

    // Leitura Cuidadosa = x1.3 -> round(40 * 1.3) = 52
    expect(result.activeCombos.map((combo) => combo.id)).toContain('leitura-cuidadosa');
    expect(result.comboMultiplier).toBeCloseTo(1.3);
    expect(result.score).toBe(52);
  });

  it('adds the flat bonus after the multiplier', () => {
    const result = scoreEncounter({ stepScore: 40, playedCardIds: leituraCombo, flatBonus: 15 });

    expect(result.score).toBe(52 + 15);
  });

  it('does not let duplicate played cards inflate the combo multiplier', () => {
    const result = scoreEncounter({
      stepScore: 20,
      playedCardIds: ['revelar-dica', 'revelar-dica', 'eliminar-alternativa'],
    });

    expect(result.activeCombos.map((combo) => combo.id)).toEqual(['leitura-cuidadosa']);
    expect(result.score).toBe(26);
  });
});

describe('comboMultiplierFor', () => {
  it('multiplies active combos together', () => {
    const { multiplier, activeCombos } = comboMultiplierFor(leituraCombo);

    expect(activeCombos.map((combo) => combo.id)).toContain('leitura-cuidadosa');
    expect(multiplier).toBeCloseTo(1.3);
  });

  it('returns 1 with no combos', () => {
    expect(comboMultiplierFor([]).multiplier).toBe(1);
  });
});
