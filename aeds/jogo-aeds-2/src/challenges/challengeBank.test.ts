import { describe, expect, test } from 'vitest';

import { challengeBank } from './challengeBank';
import { sampleVisualStates } from '../structures/sampleStructures';
import type { ChallengeStep, StructureKind } from '../types/challenge';

const mvpStructures: StructureKind[] = [
  'lista',
  'pilha',
  'ordenacao',
  'binaria',
  'abb',
  'avl',
  'arv234',
  'alvinegra',
  'hash',
  'trie',
  'patricia',
  'doidona',
];

const requiredChallengeIds = [
  'lista-flexivel-remover-posicao-01',
  'lista-desenho-inserir-inicio-01',
  'lista-sequencial-pesquisar-01',
  'pilha-flexivel-pop-01',
  'pilha-desenho-push-01',
  'pilha-analisar-soma-01',
  'ordenacao-selecao-menor-01',
  'ordenacao-insercao-desenho-01',
  'ordenacao-quicksort-particao-01',
  'abb-pesquisar-01',
  'abb-contar-folhas-01',
  'abb-lista3-eh-abb-03',
  'avl-fator-01',
  'avl-verificar-balanceamento-01',
  'avl-lista3-recalcular-alturas-10',
  'alvinegra-contar-brancos-01',
  'alvinegra-tipo-quatro-01',
  'alvinegra-lista3-verifica-cores-13',
  'hash-pesquisar-reserva-01',
  'hash-rehash-colisao-01',
  'hash-lista3-reserva-27',
  'trie-pesquisar-palavra-01',
  'trie-verificar-prefixo-01',
  'trie-lista3-inserir-palavra-18',
  'arv234-divisao-raiz-01',
  'arv234-pesquisar-chave-01',
  'arv234-lista3-folhas-mesma-altura-12',
  'patricia-decisao-bit-01',
  'patricia-prefixo-compressao-01',
  'patricia-lista3-eh-patricia-24',
  'binaria-ismax-01',
  'binaria-maior-caminho-01',
  'binaria-lista3-estritamente-binaria-05',
  'doidona-pesquisar-palavra-01',
  'doidona-inserir-camadas-01',
  'doidona-lista3-par-impar-38',
  'doidona-lista3-hash-abb-25',
];

function hasDiagramChoice(steps: ChallengeStep[]) {
  return steps.some((step) => {
    if (step.kind !== 'interpretar' && step.kind !== 'simular' && step.kind !== 'complexidade') {
      return false;
    }

    return step.options.some((option) => option.visualStateId && sampleVisualStates[option.visualStateId]);
  });
}

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

  test('fits the prova 3 list into phases with the requested 60/40 focus split', () => {
    const listChallenges = challengeBank.filter(
      (challenge) => challenge.source?.label === 'lista-aeds2-prova3.pdf',
    );
    const countsByFocus = listChallenges.reduce<Record<string, number>>((counts, challenge) => {
      const focus = challenge.focus ?? 'sem-foco';
      counts[focus] = (counts[focus] ?? 0) + 1;
      return counts;
    }, {});
    const structures = new Set(listChallenges.map((challenge) => challenge.structure));

    expect(listChallenges).toHaveLength(10);
    expect(countsByFocus).toMatchObject({ codigo: 6, desenho: 4 });
    expect(countsByFocus.conceito ?? 0).toBe(0);
    expect(structures.size).toBeGreaterThanOrEqual(8);
  });

  test('includes lista, pilha and ordenacao from the course slides', () => {
    const slideChallenges = challengeBank.filter(
      (challenge) => challenge.source?.label === 'Semestre AEDS.zip',
    );
    const requiredStructures: StructureKind[] = ['lista', 'pilha', 'ordenacao'];

    for (const structure of requiredStructures) {
      const challenges = slideChallenges.filter((challenge) => challenge.structure === structure);
      const countsByFocus = challenges.reduce<Record<string, number>>((counts, challenge) => {
        const focus = challenge.focus ?? 'sem-foco';
        counts[focus] = (counts[focus] ?? 0) + 1;
        return counts;
      }, {});

      expect(challenges, `${structure} should have three slide-based phases`).toHaveLength(3);
      expect(countsByFocus).toMatchObject({ codigo: 2, desenho: 1 });
    }
  });

  test('ABB e uma trilha-modelo completa com as fases 1..10 numeradas', () => {
    const abb = challengeBank.filter((challenge) => challenge.structure === 'abb');
    const numbered = abb.filter((challenge) => typeof challenge.phase === 'number');
    const phases = numbered.map((challenge) => challenge.phase).sort((a, b) => (a ?? 0) - (b ?? 0));

    // As fases numeradas de ABB devem cobrir exatamente 1..10, sem buracos nem repeticao.
    expect(phases).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  test('a trilha de ABB cobre as operacoes essenciais de dominio', () => {
    const abbIds = new Set(
      challengeBank.filter((challenge) => challenge.structure === 'abb').map((challenge) => challenge.id),
    );

    const requiredOperationPhases = [
      'abb-reconhecer-01',
      'abb-construir-01',
      'abb-pesquisar-01',
      'abb-inserir-01',
      'abb-remover-01',
      'abb-percorrer-emordem-01',
      'abb-contar-folhas-01',
      'abb-alterar-contar-pares-01',
      'abb-codigo-altura-01',
      'abb-dominio-01',
    ];

    for (const id of requiredOperationPhases) {
      expect(abbIds.has(id), `ABB deveria ter a fase ${id}`).toBe(true);
    }
  });

  test('contains drawing-selection phases backed by real visual states', () => {
    const drawingChallenges = challengeBank.filter((challenge) => challenge.focus === 'desenho');

    expect(drawingChallenges.length).toBeGreaterThanOrEqual(3);

    for (const challenge of drawingChallenges) {
      expect(
        hasDiagramChoice(challenge.steps as ChallengeStep[]),
        `${challenge.id} should ask the student to choose a diagram`,
      ).toBe(true);
    }
  });
});
