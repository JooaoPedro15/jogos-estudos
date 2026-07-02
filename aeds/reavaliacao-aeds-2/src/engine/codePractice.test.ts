import {
  answerCurrentPracticeStep,
  createPracticeSession,
  getCurrentPracticeDrill,
  getPracticeProgressLabel,
} from './codePractice';
import { codeDrillCatalog } from '../content/codeDrills';

test('cria uma sessao rapida para fazer uma ou duas questoes', () => {
  const session = createPracticeSession(codeDrillCatalog, { mode: 'quick', targetCount: 2 });

  expect(session.mode).toBe('quick');
  expect(session.targetCount).toBe(2);
  expect(session.completed).toBe(false);
  expect(getPracticeProgressLabel(session)).toBe('0/2');
  expect(getCurrentPracticeDrill(codeDrillCatalog, session)?.id).toBe(codeDrillCatalog[0].id);
});

test('sessao rapida conclui no alvo e maratona continua gerando proxima questao', () => {
  let quick = createPracticeSession(codeDrillCatalog, { mode: 'quick', targetCount: 2 });

  quick = answerCurrentPracticeStep(codeDrillCatalog, quick, { kind: 'choice', optionId: 'base-null' });
  quick = answerCurrentPracticeStep(codeDrillCatalog, quick, { kind: 'text', text: 'return contar(i.esq) + contar(i.dir) + 1' });

  expect(quick.completed).toBe(true);
  expect(quick.completedCount).toBe(2);

  let marathon = createPracticeSession(codeDrillCatalog, { mode: 'marathon' });
  marathon = answerCurrentPracticeStep(codeDrillCatalog, marathon, { kind: 'choice', optionId: 'base-null' });
  marathon = answerCurrentPracticeStep(codeDrillCatalog, marathon, {
    kind: 'text',
    text: 'return contar(i.esq) + contar(i.dir) + 1',
  });

  expect(marathon.completed).toBe(false);
  expect(marathon.completedCount).toBe(2);
  expect(getCurrentPracticeDrill(codeDrillCatalog, marathon)?.id).toBe(codeDrillCatalog[2].id);
});

test('registra tentativas com metadados de dominio e erro para o caderno', () => {
  const session = createPracticeSession(codeDrillCatalog, { mode: 'quick', targetCount: 2 });
  const nextSession = answerCurrentPracticeStep(codeDrillCatalog, session, {
    kind: 'choice',
    optionId: 'retorna-um',
  });

  expect(nextSession.attempts[0]).toMatchObject({
    questionId: 'code-arvore-contar-nos-base',
    domainId: 'arvore',
    skillId: 'program',
    format: 'code-repetition',
    correct: false,
    mistakeTag: 'missing-base-case',
  });
});
