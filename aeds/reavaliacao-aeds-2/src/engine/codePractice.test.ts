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
  expect(getCurrentPracticeDrill(codeDrillCatalog, session)?.step.kind).toBe('function');
});

test('sessao rapida conclui no alvo e maratona continua gerando proxima questao', () => {
  let quick = createPracticeSession(codeDrillCatalog, { mode: 'quick', targetCount: 2 });

  quick = answerCurrentPracticeStep(codeDrillCatalog, quick, {
    kind: 'text',
    text: `private int contar(No i) {
      if (i == null) return 0;
      return contar(i.esq) + contar(i.dir) + 1;
    }`,
  });
  quick = answerCurrentPracticeStep(codeDrillCatalog, quick, {
    kind: 'text',
    text: `private boolean ehEstritamenteBinaria(No i) {
      if (i == null) return true;
      if (i.esq == null && i.dir == null) return true;
      if (i.esq != null && i.dir != null) return ehEstritamenteBinaria(i.esq) && ehEstritamenteBinaria(i.dir);
      return false;
    }`,
  });

  expect(quick.completed).toBe(true);
  expect(quick.completedCount).toBe(2);

  let marathon = createPracticeSession(codeDrillCatalog, { mode: 'marathon' });
  marathon = answerCurrentPracticeStep(codeDrillCatalog, marathon, {
    kind: 'text',
    text: `private int contar(No i) {
      if (i == null) return 0;
      return contar(i.esq) + contar(i.dir) + 1;
    }`,
  });
  marathon = answerCurrentPracticeStep(codeDrillCatalog, marathon, {
    kind: 'text',
    text: `private boolean ehEstritamenteBinaria(No i) {
      if (i == null) return true;
      if (i.esq == null && i.dir == null) return true;
      if (i.esq != null && i.dir != null) return ehEstritamenteBinaria(i.esq) && ehEstritamenteBinaria(i.dir);
      return false;
    }`,
  });

  expect(marathon.completed).toBe(false);
  expect(marathon.completedCount).toBe(2);
  expect(getCurrentPracticeDrill(codeDrillCatalog, marathon)?.id).toBe(codeDrillCatalog[2].id);
});

test('registra tentativas com metadados de dominio e erro para o caderno', () => {
  const session = createPracticeSession(codeDrillCatalog, { mode: 'quick', targetCount: 2 });
  const nextSession = answerCurrentPracticeStep(codeDrillCatalog, session, {
    kind: 'text',
    text: `private int contar(No i) {
      return contar(i.esq) + contar(i.dir);
    }`,
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
