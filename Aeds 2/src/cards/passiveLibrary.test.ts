import { describe, expect, it } from 'vitest';
import { getPassiveById, passiveLibrary } from './passiveLibrary';

const requiredPassiveIds = [
  'mestre-recursao',
  'olho-abb',
  'domador-trie',
  'sem-colisao',
  'complexidade-perfeita',
];

describe('passiveLibrary', () => {
  it('contains the required MVP passives', () => {
    expect(passiveLibrary.length).toBeGreaterThanOrEqual(5);

    for (const passiveId of requiredPassiveIds) {
      expect(getPassiveById(passiveId)).toBeDefined();
    }
  });

  it('defines complete passive metadata and actionable effects', () => {
    const effects = new Set(passiveLibrary.map((passive) => passive.effect));

    expect(effects.has('scoreBonus')).toBe(true);
    expect(effects.has('energyDiscount')).toBe(true);
    expect(effects.has('scoreMultiplier')).toBe(true);
    expect(effects.has('preventFocusLoss')).toBe(true);

    for (const passive of passiveLibrary) {
      expect(passive.name.trim().length).toBeGreaterThan(0);
      expect(passive.description.trim().length).toBeGreaterThan(0);
      expect(passive.value).toBeGreaterThan(0);
    }
  });
});
