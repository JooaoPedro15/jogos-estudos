import { evaluateStep } from './evaluator';
import type { ChallengeStep } from '../types/content';

test('avalia uma alternativa correta', () => {
  const step: ChallengeStep = {
    id: 'somatorio-recognize-1',
    kind: 'choice',
    prompt: 'Qual laco controla o numero de repeticoes externas?',
    correctOptionId: 'for-i',
    score: 10,
    options: [
      { id: 'for-i', label: 'for (int i = 1; i <= n; i++)' },
      { id: 'if-a', label: 'if (a > 2)' },
    ],
  };

  expect(evaluateStep(step, { kind: 'choice', optionId: 'for-i' })).toEqual({
    correct: true,
    scoreDelta: 10,
    feedback: 'Resposta correta.',
  });
});

test('avalia alternativa incorreta com tag de erro', () => {
  const step: ChallengeStep = {
    id: 'avl-rotation-1',
    kind: 'choice',
    prompt: 'Qual rotacao corrige o caso LR?',
    correctOptionId: 'dupla-dir-esq',
    options: [
      { id: 'dupla-dir-esq', label: 'Rotacao dupla esquerda-direita' },
      { id: 'simples-dir', label: 'Rotacao simples direita', mistakeTag: 'wrong-rotation' },
    ],
  };

  expect(evaluateStep(step, { kind: 'choice', optionId: 'simples-dir' })).toEqual({
    correct: false,
    scoreDelta: 0,
    feedback: 'Resposta incorreta.',
    mistakeTag: 'wrong-rotation',
  });
});

test('normaliza lacunas de codigo com acento, caixa, espacos e ponto e virgula', () => {
  const step: ChallengeStep = {
    id: 'trie-prefix-1',
    kind: 'gap',
    prompt: 'Complete o marcador de palavra.',
    answers: ['fimDaPalavra', 'fim da palavra'],
  };

  expect(evaluateStep(step, { kind: 'text', text: '  FIM da palavra; ' }).correct).toBe(true);
});

test('avalia ordem exata de blocos', () => {
  const step: ChallengeStep = {
    id: 'arvore-altura-1',
    kind: 'blocks',
    prompt: 'Ordene a funcao altura.',
    blocks: [
      { id: 'base', label: 'se i == null, retorne 0' },
      { id: 'rec', label: 'calcule alturas das subarvores' },
      { id: 'ret', label: 'retorne maior + 1' },
    ],
    correctOrder: ['base', 'rec', 'ret'],
  };

  expect(evaluateStep(step, { kind: 'blocks', order: ['base', 'rec', 'ret'] }).correct).toBe(true);
  expect(evaluateStep(step, { kind: 'blocks', order: ['rec', 'base', 'ret'] }).correct).toBe(false);
});

test('avalia linha errada e conserto escolhido', () => {
  const step: ChallengeStep = {
    id: 'doidona-pesquisar-1',
    kind: 'fix',
    prompt: 'Corrija a busca que para cedo demais.',
    lines: ['if (x == t1[pos]) return true;', 'return false;', 'pesquisarT2(x);'],
    correctLineIndex: 1,
    fixOptions: [
      { id: 'continue', label: 'continue buscando nas outras camadas' },
      { id: 'stop', label: 'mantenha retorno falso', mistakeTag: 'incomplete-layer-search' },
    ],
    correctFixId: 'continue',
  };

  expect(evaluateStep(step, { kind: 'fix', lineIndex: 1, fixId: 'continue' }).correct).toBe(true);
});

test('avalia codigo digitado com normalizacao', () => {
  const step: ChallengeStep = {
    id: 'somatorio-code-1',
    kind: 'code',
    prompt: 'Digite a formula fechada.',
    acceptedAnswers: ['n * (n + 1) / 2'],
  };

  expect(evaluateStep(step, { kind: 'text', text: 'N*(N + 1)/2;' }).correct).toBe(true);
});

test('avalia rubrica de provar ou refutar', () => {
  const step: ChallengeStep = {
    id: 'ordenacao-rubrica-1',
    kind: 'rubric',
    prompt: 'Refute a afirmacao sobre bubble sort.',
    acceptableOptionIds: ['depends-on-optimization', 'worst-case-quadratic'],
    options: [
      { id: 'depends-on-optimization', label: 'Depende da otimizacao e do caso analisado.' },
      { id: 'always-linear', label: 'Bubble sort e sempre linear.', mistakeTag: 'wrong-case-analysis' },
    ],
  };

  expect(evaluateStep(step, { kind: 'choice', optionId: 'depends-on-optimization' }).correct).toBe(true);
});
