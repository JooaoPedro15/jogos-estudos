import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { App } from './App';

beforeEach(() => {
  window.localStorage.clear();
});

test('renderiza a experiencia principal da Reavaliacao AEDS II', () => {
  render(<App />);

  expect(screen.getByRole('main')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Reavaliacao AEDS II' })).toBeInTheDocument();
  expect(screen.getByText('Lacos aninhados')).toBeInTheDocument();
  expect(screen.getByText('Estrutura Doidona')).toBeInTheDocument();
  expect(screen.getByText('Arvore TRIE')).toBeInTheDocument();
  expect(screen.getByText('Arvore AVL')).toBeInTheDocument();
  expect(screen.getByText('Somatorios')).toBeInTheDocument();
});

test('envia erro do simulado para o caderno adaptativo', async () => {
  const user = userEvent.setup();

  render(<App />);

  await user.click(screen.getByRole('button', { name: 'O(n)' }));
  await user.click(screen.getByRole('button', { name: /responder/i }));

  expect(await screen.findByText('Resposta incorreta.')).toBeInTheDocument();
  expect(screen.getByText('Limites de somatorio')).toBeInTheDocument();
});

test('oferece treino de codigo para uso rapido ou maratona', async () => {
  const user = userEvent.setup();

  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Treino de Codigo' }));

  expect(screen.getByText('Arvore: caso base para contar nos')).toBeInTheDocument();
  expect(screen.getByText('Pegar 2 questoes')).toBeInTheDocument();
  expect(screen.getByText('Maratona')).toBeInTheDocument();
  expect(screen.getByText(/class No/)).toBeInTheDocument();
  expect(screen.getByText('Arvore binaria')).toBeInTheDocument();
});

test('mostra explicacao linha a linha quando a pessoa pede ensino', async () => {
  const user = userEvent.setup();

  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Treino de Codigo' }));
  await user.click(screen.getByRole('button', { name: 'Me ensine' }));

  const teaching = screen.getByLabelText('Explicacao guiada');

  expect(within(teaching).getByText('if (i == null) return 0;')).toBeInTheDocument();
  expect(within(teaching).getByText(/Subarvore vazia/)).toBeInTheDocument();
});
