import { reavaliacaoBlueprint } from './reavaliacaoBlueprint';

test('todas as questoes do simulado possuem visual de apoio no estilo da prova', () => {
  expect(reavaliacaoBlueprint.questions).toHaveLength(6);
  expect(
    reavaliacaoBlueprint.questions.every((question) => {
      const visual = (question as { visual?: { kind?: string; labels?: string[] } }).visual;

      return Boolean(visual?.kind && visual.labels && visual.labels.length > 0);
    }),
  ).toBe(true);
});
