import { createExamSession } from '../engine/examSession';
import { createEmptyNotebook } from '../engine/adaptiveReview';
import { clearSavedGame, loadSavedGame, saveGame } from './save';
import { reavaliacaoBlueprint } from '../content/reavaliacaoBlueprint';

test('salva, carrega e limpa o estado local do jogo', () => {
  const state = {
    session: createExamSession(reavaliacaoBlueprint),
    notebook: createEmptyNotebook(),
  };

  saveGame(state);

  expect(loadSavedGame()).toEqual(state);

  clearSavedGame();

  expect(loadSavedGame()).toBeUndefined();
});

test('ignora dados invalidos no armazenamento local', () => {
  window.localStorage.setItem('reavaliacao-aeds-2:save', '{nao-json');

  expect(loadSavedGame()).toBeUndefined();
});
