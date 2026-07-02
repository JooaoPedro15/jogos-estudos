import { codeDrillCatalog, getDrillsByGroup } from './codeDrills';

test('cataloga treinos de codigo inspirados na lista da prova 3', () => {
  expect(codeDrillCatalog.length).toBeGreaterThanOrEqual(10);
  expect(codeDrillCatalog.map((drill) => drill.domainId)).toEqual(
    expect.arrayContaining(['arvore', 'avl', 'trie', 'doidona', 'ordenacao']),
  );
  expect(codeDrillCatalog.every((drill) => drill.scaffold.includes('class') || drill.scaffold.includes('void'))).toBe(
    true,
  );
  expect(codeDrillCatalog.every((drill) => drill.visual)).toBe(true);
});

test('organiza cada estrutura como repeticao antes de modificacao logica', () => {
  const trieSearch = getDrillsByGroup('trie-palavra-exata');

  expect(trieSearch.map((drill) => drill.phase)).toEqual(['repeat', 'repeat', 'modify']);
  expect(trieSearch[0].title).toContain('TRIE');
  expect(trieSearch[2].title).toContain('prefixo');
});
