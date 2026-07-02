import { answerCurrentStep, createExamSession, getCurrentStep } from './examSession';
import { reavaliacaoBlueprint } from '../content/reavaliacaoBlueprint';
import type { StepAnswer } from '../types/content';

test('monta uma sessao com 6 questoes no formato da reavaliacao', () => {
  const session = createExamSession(reavaliacaoBlueprint);

  expect(reavaliacaoBlueprint.questions).toHaveLength(6);
  expect(reavaliacaoBlueprint.questions.map((question) => question.domainId).sort()).toEqual([
    'arvore',
    'avl',
    'doidona',
    'ordenacao',
    'somatorio',
    'trie',
  ]);
  expect(reavaliacaoBlueprint.questions.map((question) => question.format)).toEqual([
    'summation-from-code',
    'structure-simulation',
    'prove-or-refute',
    'algorithm-adaptation',
    'case-analysis',
    'composite-structure-method',
  ]);
  expect(session.completed).toBe(false);
  expect(session.currentQuestionIndex).toBe(0);
  expect(session.currentStepIndex).toBe(0);
  expect(session.maxScore).toBeGreaterThan(0);
});

test('avanca etapa, soma pontuacao e registra metadados do erro', () => {
  const session = createExamSession(reavaliacaoBlueprint);
  const firstStep = getCurrentStep(reavaliacaoBlueprint, session);

  const nextSession = answerCurrentStep(reavaliacaoBlueprint, session, {
    kind: 'choice',
    optionId: 'linear',
  });

  expect(firstStep?.id).toBe('simulado-somatorio-identificar');
  expect(nextSession.currentStepIndex).toBe(1);
  expect(nextSession.score).toBe(0);
  expect(nextSession.attempts).toHaveLength(1);
  expect(nextSession.attempts[0]).toMatchObject({
    domainId: 'somatorio',
    skillId: 'recognize',
    format: 'summation-from-code',
    mistakeTag: 'wrong-summation-bound',
  });
});

test('marca a sessao como concluida depois da ultima etapa', () => {
  let session = createExamSession(reavaliacaoBlueprint);

  for (const question of reavaliacaoBlueprint.questions) {
    for (const step of question.steps) {
      const answer = defaultCorrectAnswerFor(step.id);
      session = answerCurrentStep(reavaliacaoBlueprint, session, answer);
    }
  }

  expect(session.completed).toBe(true);
  expect(session.currentQuestionIndex).toBe(reavaliacaoBlueprint.questions.length - 1);
  expect(session.score).toBe(session.maxScore);
});

function defaultCorrectAnswerFor(stepId: string): StepAnswer {
  const answers: Record<string, StepAnswer> = {
    'simulado-somatorio-identificar': { kind: 'choice', optionId: 'quadratico' },
    'simulado-somatorio-formula': { kind: 'text', text: 'n * (n - 1) / 2' },
    'simulado-avl-rotacao': { kind: 'choice', optionId: 'rotacao-simples-esquerda' },
    'simulado-avl-fator': { kind: 'text', text: '-2' },
    'simulado-trie-prefixo': { kind: 'choice', optionId: 'falso-marca-fim' },
    'simulado-trie-custo': { kind: 'text', text: 'O(k)' },
    'simulado-ordenacao-blocos': { kind: 'blocks', order: ['scan', 'compare', 'shift', 'insert'] },
    'simulado-ordenacao-caso': { kind: 'choice', optionId: 'pior-quadratico' },
    'simulado-arvore-caso-base': { kind: 'text', text: 'return 0' },
    'simulado-arvore-rubrica': { kind: 'choice', optionId: 'visita-todos' },
    'simulado-doidona-camada': { kind: 'fix', lineIndex: 1, fixId: 'buscar-restante' },
    'simulado-doidona-ordem': { kind: 'blocks', order: ['t1', 't2', 't3', 'lista', 'arvore'] },
  };

  return answers[stepId];
}
