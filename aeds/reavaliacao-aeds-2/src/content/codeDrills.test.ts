import { codeDrillCatalog, getDrillsByGroup } from './codeDrills';

test('cataloga treinos de codigo inspirados na lista da prova 3', () => {
  expect(codeDrillCatalog.length).toBeGreaterThanOrEqual(24);
  expect(new Set(codeDrillCatalog.map((drill) => drill.domainId))).toEqual(
    new Set(['arvore', 'avl', 'trie', 'doidona', 'somatorio', 'ordenacao']),
  );
  expect(codeDrillCatalog.every((drill) => drill.scaffold.includes('class') || drill.scaffold.includes('void'))).toBe(
    true,
  );
  expect(codeDrillCatalog.every((drill) => drill.visual)).toBe(true);
  expect(codeDrillCatalog.filter((drill) => drill.step.kind === 'function').length).toBeGreaterThanOrEqual(18);
});

test('organiza cada estrutura como repeticao antes de modificacao logica', () => {
  const trieSearch = getDrillsByGroup('trie-palavra-exata');

  expect(trieSearch.map((drill) => drill.phase)).toEqual(['repeat', 'repeat', 'modify']);
  expect(trieSearch[0].title).toContain('TRIE');
  expect(trieSearch[2].title).toContain('prefixo');
});
