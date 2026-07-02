import {
  createEmptyNotebook,
  getPriorityErrors,
  recordReviewResult,
  recordStepAttempt,
  selectSimilarPractice,
} from './adaptiveReview';
import type { StepAttempt } from '../types/progress';

const baseAttempt: StepAttempt = {
  questionId: 'q1-somatorio',
  stepId: 'simulado-somatorio-identificar',
  domainId: 'somatorio',
  skillId: 'recognize',
  format: 'summation-from-code',
  correct: false,
  scoreDelta: 0,
  feedback: 'Resposta incorreta.',
  mistakeTag: 'wrong-summation-bound',
};

test('registra e agrupa erros pelo conceito que precisa ser revisado', () => {
  let notebook = createEmptyNotebook();
  notebook = recordStepAttempt(notebook, baseAttempt, '2026-07-01T10:00:00.000Z');
  notebook = recordStepAttempt(notebook, baseAttempt, '2026-07-01T10:05:00.000Z');

  expect(notebook.records).toHaveLength(1);
  expect(notebook.records[0]).toMatchObject({
    id: 'somatorio:recognize:summation-from-code:wrong-summation-bound',
    attempts: 2,
    resolvedStreak: 0,
    resolved: false,
    lastSeenAt: '2026-07-01T10:05:00.000Z',
  });
});

test('prioriza erros nao resolvidos por repeticao e depois por recencia', () => {
  let notebook = createEmptyNotebook();
  notebook = recordStepAttempt(notebook, baseAttempt, '2026-07-01T10:00:00.000Z');
  notebook = recordStepAttempt(
    notebook,
    {
      ...baseAttempt,
      stepId: 'simulado-avl-rotacao',
      domainId: 'avl',
      skillId: 'simulate',
      format: 'structure-simulation',
      mistakeTag: 'wrong-rotation',
    },
    '2026-07-01T10:10:00.000Z',
  );
  notebook = recordStepAttempt(notebook, baseAttempt, '2026-07-01T10:20:00.000Z');

  const priorityErrors = getPriorityErrors(notebook);

  expect(priorityErrors.map((record) => record.mistakeTag)).toEqual([
    'wrong-summation-bound',
    'wrong-rotation',
  ]);
});

test('resolve erro depois de dois acertos seguidos em treino parecido', () => {
  let notebook = createEmptyNotebook();
  notebook = recordStepAttempt(notebook, baseAttempt, '2026-07-01T10:00:00.000Z');
  const recordId = notebook.records[0].id;

  notebook = recordReviewResult(notebook, recordId, true, '2026-07-01T10:05:00.000Z');
  notebook = recordReviewResult(notebook, recordId, true, '2026-07-01T10:10:00.000Z');

  expect(notebook.records[0]).toMatchObject({
    resolvedStreak: 2,
    resolved: true,
  });
  expect(getPriorityErrors(notebook)).toHaveLength(0);
});

test('seleciona um treino parecido pelo tipo de erro', () => {
  let notebook = createEmptyNotebook();
  notebook = recordStepAttempt(notebook, baseAttempt, '2026-07-01T10:00:00.000Z');

  const practice = selectSimilarPractice(notebook.records[0]);

  expect(practice).toMatchObject({
    domainId: 'somatorio',
    targetMistakeTag: 'wrong-summation-bound',
  });
});
