import { describe, expect, it } from 'vitest';
import { cardById } from '../cards/cardLibrary';
import { challengeBank } from '../challenges/challengeBank';
import { createEncounterRun } from './encounterFactory';

const challengeById = new Map(challengeBank.map((challenge) => [challenge.id, challenge]));

describe('encounterFactory', () => {
  it('creates a fourteen-encounter run from the challenge bank', () => {
    const encounters = createEncounterRun();

    expect(encounters).toHaveLength(14);
    expect(encounters.every((encounter) => encounter.rewardCardIds.length > 0)).toBe(true);
  });

  it('references existing challenges and covers every required structure', () => {
    const encounters = createEncounterRun();
    const structures = new Set<string>();

    for (const encounter of encounters) {
      expect(encounter.challengeId).toBeDefined();
      const challenge = challengeById.get(encounter.challengeId ?? '');
      expect(challenge).toBeDefined();
      if (challenge) {
        structures.add(challenge.structure);
      }
    }

    expect(structures).toEqual(
      new Set(['binaria', 'abb', 'avl', 'alvinegra', 'hash', 'trie', 'doidona']),
    );
  });

  it('only uses real cards in rewards', () => {
    const encounters = createEncounterRun();

    for (const encounter of encounters) {
      for (const cardId of encounter.rewardCardIds) {
        expect(cardById[cardId]).toBeDefined();
      }
    }
  });

  it('contains normal, elite, and boss encounters with a complexity boss', () => {
    const encounters = createEncounterRun();
    const kinds = new Set(encounters.map((encounter) => encounter.kind));
    const boss = encounters.find((encounter) => encounter.kind === 'boss');

    expect(kinds.has('normal')).toBe(true);
    expect(kinds.has('elite')).toBe(true);
    expect(boss).toBeDefined();
    expect(boss?.specialRule).toBe('requiresComplexity');
  });
});
