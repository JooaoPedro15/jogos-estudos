import { describe, expect, it } from 'vitest';

import type {
  BlockStep,
  ChoiceStep,
  ClickStep,
  FixStep,
  GapStep,
  ReviewStep,
  TypeCodeStep,
} from '../types/challenge';
import { createStepProgress, resolveStep } from './stepEvaluator';

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

const gapStep: GapStep = {
  id: 'st-gap',
  kind: 'lacuna',
  prompt: 'Condicao de descida a esquerda: if (x ___ i.elemento)',
  gapId: 'comparacao-esq',
  answers: [{ id: 'lt', answer: '<', aliases: ['menor que'] }],
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

const clickUnordered: ClickStep = {
  id: 'st-click-u',
  kind: 'clique',
  prompt: 'Clique nas folhas da arvore.',
  targetNodeIds: ['n10', 'n30', 'n70'],
  selectionMode: 'unordered',
};

const clickOrdered: ClickStep = {
  id: 'st-click-o',
  kind: 'clique',
  prompt: 'Clique no caminho da busca por 50.',
  targetNodeIds: ['n40', 'n60', 'n50'],
  selectionMode: 'ordered',
};

describe('createStepProgress', () => {
  it('comeca vazio e sem pontuacao', () => {
    const progress = createStepProgress('abb-pesquisar-01');

    expect(progress.challengeId).toBe('abb-pesquisar-01');
    expect(progress.stepIndex).toBe(0);
    expect(progress.resolvedStepIds).toEqual([]);
    expect(progress.stepErrors).toEqual({});
    expect(progress.score).toBe(0);
    expect(progress.complete).toBe(false);
  });
});

describe('resolveStep — escolha (choice)', () => {
  it('marca acerto, pontua e avanca', () => {
    const progress = createStepProgress('c');
    const { progress: next, result } = resolveStep(progress, choiceStep, {
      kind: 'choice',
      optionId: 'a',
    });

    expect(result.correct).toBe(true);
    expect(result.scoreDelta).toBe(10);
    expect(next.stepIndex).toBe(1);
    expect(next.score).toBe(10);
    expect(next.resolvedStepIds).toContain('st-choice');
  });

  it('nao pontua e registra erro ao errar', () => {
    const progress = createStepProgress('c');
    const { progress: next, result } = resolveStep(progress, choiceStep, {
      kind: 'choice',
      optionId: 'b',
    });

    expect(result.correct).toBe(false);
    expect(result.scoreDelta).toBe(0);
    expect(result.feedback).toBe('Menores a esquerda, maiores a direita.');
    expect(next.stepErrors['st-choice']).toBe(1);
    expect(next.stepIndex).toBe(1);
  });
});

describe('resolveStep — lacuna (gap)', () => {
  it('aceita resposta exata e alias ignorando caixa/espacos/acento', () => {
    const progress = createStepProgress('c');

    const exact = resolveStep(progress, gapStep, { kind: 'gap', text: '<' }).result;
    const alias = resolveStep(progress, gapStep, { kind: 'gap', text: ' Menor Que ' }).result;

    expect(exact.correct).toBe(true);
    expect(alias.correct).toBe(true);
  });

  it('rejeita resposta errada e registra erro', () => {
    const progress = createStepProgress('c');
    const { progress: next, result } = resolveStep(progress, gapStep, {
      kind: 'gap',
      text: '>',
    });

    expect(result.correct).toBe(false);
    expect(next.stepErrors['st-gap']).toBe(1);
  });
});

describe('resolveStep — blocos (blocks)', () => {
  it('aceita ordem exata', () => {
    const progress = createStepProgress('c');
    const { result } = resolveStep(progress, blockStep, {
      kind: 'blocks',
      order: ['nulo', 'folha', 'soma'],
    });

    expect(result.correct).toBe(true);
    expect(result.scoreDelta).toBe(10);
  });

  it('rejeita ordem errada', () => {
    const progress = createStepProgress('c');
    const { result } = resolveStep(progress, blockStep, {
      kind: 'blocks',
      order: ['folha', 'nulo', 'soma'],
    });

    expect(result.correct).toBe(false);
  });
});

describe('resolveStep — clique (click)', () => {
  it('aceita o conjunto correto em qualquer ordem (unordered)', () => {
    const progress = createStepProgress('c');
    const { result } = resolveStep(progress, clickUnordered, {
      kind: 'click',
      nodeIds: ['n70', 'n10', 'n30'],
    });

    expect(result.correct).toBe(true);
  });

  it('rejeita conjunto incompleto (unordered)', () => {
    const progress = createStepProgress('c');
    const { result } = resolveStep(progress, clickUnordered, {
      kind: 'click',
      nodeIds: ['n10', 'n30'],
    });

    expect(result.correct).toBe(false);
  });

  it('exige a sequencia exata em modo ordered', () => {
    const progress = createStepProgress('c');

    const certo = resolveStep(progress, clickOrdered, {
      kind: 'click',
      nodeIds: ['n40', 'n60', 'n50'],
    }).result;
    const invertido = resolveStep(progress, clickOrdered, {
      kind: 'click',
      nodeIds: ['n40', 'n50', 'n60'],
    }).result;

    expect(certo.correct).toBe(true);
    expect(invertido.correct).toBe(false);
  });
});

const fixStep: FixStep = {
  id: 'st-fix',
  kind: 'corrigir',
  prompt: 'A funcao contarFolhas tem uma linha errada. Aponte e corrija.',
  lines: [
    'if (i == null) return 0;',
    'if (i.esq == null || i.dir == null) return 1;',
    'return contarFolhas(i.esq) + contarFolhas(i.dir);',
  ],
  wrongLineIndex: 1,
  fixOptions: [
    { id: 'and', label: 'if (i.esq == null && i.dir == null) return 1;' },
    { id: 'nada', label: 'A linha esta correta.' },
    { id: 'base', label: 'if (i == null) return 1;' },
  ],
  correctFixId: 'and',
};

const typeStep: TypeCodeStep = {
  id: 'st-type',
  kind: 'digitar',
  prompt: 'Escreva o retorno que combina as duas subarvores na contagem de nos.',
  expected: 'return contar(i.esq) + contar(i.dir) + 1;',
  aliases: ['return 1 + contar(i.esq) + contar(i.dir);'],
};

describe('resolveStep — corrigir (fix)', () => {
  it('aceita linha certa + conserto certo', () => {
    const progress = createStepProgress('c');
    const { result } = resolveStep(progress, fixStep, {
      kind: 'fix',
      lineIndex: 1,
      fixId: 'and',
    });

    expect(result.correct).toBe(true);
    expect(result.scoreDelta).toBe(10);
  });

  it('rejeita linha errada mesmo com conserto certo', () => {
    const progress = createStepProgress('c');
    const { progress: next, result } = resolveStep(progress, fixStep, {
      kind: 'fix',
      lineIndex: 0,
      fixId: 'and',
    });

    expect(result.correct).toBe(false);
    expect(next.stepErrors['st-fix']).toBe(1);
  });

  it('rejeita conserto errado na linha certa', () => {
    const progress = createStepProgress('c');
    const { result } = resolveStep(progress, fixStep, {
      kind: 'fix',
      lineIndex: 1,
      fixId: 'base',
    });

    expect(result.correct).toBe(false);
  });
});

describe('resolveStep — digitar (code)', () => {
  it('aceita o codigo esperado com espacos e caixa diferentes', () => {
    const progress = createStepProgress('c');
    const { result } = resolveStep(progress, typeStep, {
      kind: 'code',
      text: '  RETURN contar( i.esq )+contar( i.dir )+1  ',
    });

    expect(result.correct).toBe(true);
    expect(result.scoreDelta).toBe(10);
  });

  it('aceita alias equivalente', () => {
    const progress = createStepProgress('c');
    const { result } = resolveStep(progress, typeStep, {
      kind: 'code',
      text: 'return 1 + contar(i.esq) + contar(i.dir)',
    });

    expect(result.correct).toBe(true);
  });

  it('rejeita codigo diferente e registra erro', () => {
    const progress = createStepProgress('c');
    const { progress: next, result } = resolveStep(progress, typeStep, {
      kind: 'code',
      text: 'return contar(i.esq) - contar(i.dir) + 1;',
    });

    expect(result.correct).toBe(false);
    expect(next.stepErrors['st-type']).toBe(1);
  });
});

describe('resolveStep — revisao', () => {
  it('avanca sem pontuar nem penalizar', () => {
    const progress = createStepProgress('c');
    const { progress: next, result } = resolveStep(progress, reviewStep, {
      kind: 'review',
    });

    expect(result.correct).toBe(true);
    expect(result.scoreDelta).toBe(0);
    expect(next.stepIndex).toBe(1);
    expect(next.resolvedStepIds).toContain('st-review');
  });
});

describe('resolveStep — conclusao', () => {
  it('marca progresso e resultado como completos quando a ultima etapa e resolvida', () => {
    const progress = {
      ...createStepProgress('c', 4),
      stepIndex: 3,
      resolvedStepIds: ['s1', 's2', 's3'],
    };

    const { progress: next, result } = resolveStep(progress, reviewStep, {
      kind: 'review',
    });

    expect(next.complete).toBe(true);
    expect(result.complete).toBe(true);
  });
});

describe('resolveStep — pureza', () => {
  it('nao muta o progresso de entrada', () => {
    const progress = createStepProgress('c');
    const snapshot = JSON.stringify(progress);

    resolveStep(progress, choiceStep, { kind: 'choice', optionId: 'a' });

    expect(JSON.stringify(progress)).toBe(snapshot);
  });
});
