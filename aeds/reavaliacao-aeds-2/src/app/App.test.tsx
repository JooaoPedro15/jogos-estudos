import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { App } from './App';

beforeEach(() => {
  window.localStorage.clear();
});

test('renderiza a experiencia principal da Reavaliacao AEDS II', () => {
  render(<App />);

  expect(screen.getByRole('main')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Reavaliacao AEDS II' })).toBeInTheDocument();
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
