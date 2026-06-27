import { describe, expect, test } from 'vitest';

import { challengeBank } from './challengeBank';
import { sampleVisualStates } from '../structures/sampleStructures';
import type { StructureKind } from '../types/challenge';

const mvpStructures: StructureKind[] = [
  'binaria',
  'abb',
  'avl',
  'alvinegra',
  'hash',
  'trie',
  'doidona',
];

const requiredChallengeIds = [
  'abb-pesquisar-01',
  'abb-contar-folhas-01',
  'avl-fator-01',
  'avl-verificar-balanceamento-01',
  'alvinegra-contar-brancos-01',
  'alvinegra-tipo-quatro-01',
  'hash-pesquisar-reserva-01',
  'hash-rehash-colisao-01',
  'trie-pesquisar-palavra-01',
  'trie-verificar-prefixo-01',
  'binaria-ismax-01',
  'binaria-maior-caminho-01',
  'doidona-pesquisar-palavra-01',
  'doidona-inserir-camadas-01',
];

describe('challengeBank', () => {
  test('contains at least two challenges for each MVP structure', () => {
    for (const structure of mvpStructures) {
      const count = challengeBank.filter((challenge) => challenge.structure === structure).length;

      expect(count, `expected at least two ${structure} challenges`).toBeGreaterThanOrEqual(2);
    }
  });

  test('contains the required transfer group', () => {
    expect(
      challengeBank.some(
        (challenge) => challenge.transferGroupId === 'contagem-transferencia-01',
      ),
    ).toBe(true);
  });

  test('every challenge has at least four steps', () => {
    for (const challenge of challengeBank) {
      expect(challenge.steps.length, `${challenge.id} should have at least four steps`).toBeGreaterThanOrEqual(4);
    }
  });

  test('every challenge has a complexity answer and at least one common mistake', () => {
    for (const challenge of challengeBank) {
      expect(challenge.complexity.answer, `${challenge.id} should have a complexity answer`).toBeTruthy();
      expect(challenge.complexity.explanation, `${challenge.id} should explain complexity`).toBeTruthy();
      expect(challenge.commonMistakes.length, `${challenge.id} should list common mistakes`).toBeGreaterThanOrEqual(1);
    }
  });

  test('every visual state reference exists', () => {
    for (const challenge of challengeBank) {
      expect(sampleVisualStates[challenge.visualStateId], `${challenge.visualStateId} should exist`).toBeDefined();
    }
  });

  test('contains all required challenge IDs', () => {
    const actualIds = new Set(challengeBank.map((challenge) => challenge.id));

    for (const id of requiredChallengeIds) {
      expect(actualIds.has(id), `missing challenge ${id}`).toBe(true);
    }

    expect(actualIds.size).toBeGreaterThanOrEqual(requiredChallengeIds.length);
  });
});
