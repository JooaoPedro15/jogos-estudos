import { structureCatalog } from './scenes';

test('expoe catalogo de cenas para a aba Estruturas', () => {
  expect(structureCatalog.length).toBeGreaterThanOrEqual(6);
  expect(structureCatalog.map((entry) => entry.id)).toEqual(
    expect.arrayContaining(['hash', 'arvore-binaria', 'avl', 'trie', 'somatorio', 'ordenacao', 'doidona']),
  );

  const scene = structureCatalog[0].build();
  expect(scene.frames.length).toBeGreaterThan(0);
  expect(scene.operation).not.toBe('');
});
