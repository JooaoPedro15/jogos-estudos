import { describe, expect, it } from 'vitest';
import type { Challenge } from './challenge';

describe('Challenge type', () => {
  it('supports a guided challenge with multiple step kinds', async () => {
    await expect(import('./challenge')).resolves.toBeDefined();

    const challenge = {
      id: 'abb-contar-folhas-01',
      title: 'Contar folhas',
      pattern: 'percorrer-todos-os-nos',
      structure: 'abb',
      difficulty: 'facil',
      statement: 'Implemente o metodo int contarFolhas().',
      providedCode: 'class No { int elemento; No esq, dir; }',
      visualStateId: 'abb-basica-01',
      steps: [
        {
          id: 'interpretar-base',
          kind: 'interpretar',
          prompt: 'Qual caso representa uma folha?',
          options: [
            { id: 'sem-filhos', label: 'No sem filhos' },
            { id: 'um-filho', label: 'No com um filho' },
          ],
          correctOptionId: 'sem-filhos',
          explanation: 'Folhas nao possuem filhos a esquerda ou direita.',
        },
        {
          id: 'simular-chamada',
          kind: 'simular',
          prompt: 'Qual no e visitado depois da raiz?',
          options: [
            { id: 'esq', label: 'Filho esquerdo' },
            { id: 'dir', label: 'Filho direito' },
          ],
          correctOptionId: 'esq',
        },
        {
          id: 'lacuna-retorno',
          kind: 'lacuna',
          prompt: 'Complete a condicao de folha.',
          gapId: 'condicao-folha',
          answers: [
            {
              id: 'sem-filhos',
              answer: 'no.esq == null && no.dir == null',
              aliases: ['no.dir == null && no.esq == null'],
            },
          ],
        },
        {
          id: 'blocos-recursao',
          kind: 'blocos',
          prompt: 'Ordene os blocos da solucao recursiva.',
          blocks: [
            { id: 'base-nulo', label: 'if (no == null) return 0;', order: 1 },
            { id: 'base-folha', label: 'if (ehFolha(no)) return 1;', order: 2 },
            { id: 'recursao', label: 'return contar(no.esq) + contar(no.dir);', order: 3 },
          ],
          correctOrder: ['base-nulo', 'base-folha', 'recursao'],
        },
        {
          id: 'complexidade-visita',
          kind: 'complexidade',
          prompt: 'Qual a complexidade de tempo?',
          options: [
            { id: 'linear', label: 'O(n)' },
            { id: 'log', label: 'O(log n)' },
          ],
          correctOptionId: 'linear',
        },
        {
          id: 'revisao-final',
          kind: 'revisao',
          prompt: 'Revise a ideia central.',
          summary: 'A solucao soma as folhas encontradas nas subarvores.',
          solutionNotes: ['Caso nulo retorna 0.', 'Folha retorna 1.', 'Caso geral soma esquerda e direita.'],
        },
      ],
      complexity: { answer: 'O(n)', explanation: 'Visita todos os nos.' },
      commonMistakes: [],
    } satisfies Challenge;

    expect(challenge.structure).toBe('abb');
    expect(challenge.steps).toHaveLength(6);
  });
});
