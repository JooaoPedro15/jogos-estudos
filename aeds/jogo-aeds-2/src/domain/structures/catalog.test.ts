import { describe, expect, it } from 'vitest';

import { challengeBank } from '../../challenges/challengeBank';
import type { StructureKind } from '../../types/challenge';
import { structureCatalog, unlockedStructureIds } from './catalog';

const allStructures: StructureKind[] = [
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

describe('structureCatalog', () => {
  it('lista exatamente as 12 estruturas do material atual', () => {
    expect(structureCatalog.map((structure) => structure.id)).toEqual(allStructures);
  });

  it('libera toda estrutura que possui desafios jogaveis', () => {
    const structuresWithContent = new Set(challengeBank.map((challenge) => challenge.structure));

    for (const structureId of structuresWithContent) {
      expect(unlockedStructureIds, `${structureId} deveria abrir trilha`).toContain(structureId);
    }
  });

  it('mantem contagem de desafios positiva para estruturas liberadas', () => {
    for (const structureId of unlockedStructureIds) {
      expect(
        challengeBank.filter((challenge) => challenge.structure === structureId).length,
        `${structureId} precisa ter conteudo antes de liberar`,
      ).toBeGreaterThan(0);
    }
  });
});
