import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';

test('abre na biblioteca de dominio com as 9 estruturas do recorte', () => {
  render(<App />);

  expect(screen.getByRole('main')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Estruturas' })).toBeInTheDocument();

  const library = screen.getByRole('region', { name: 'Biblioteca de estruturas' });
  expect(within(library).getAllByRole('listitem')).toHaveLength(9);

  expect(screen.getByRole('button', { name: 'Abrir trilha de ABB' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'AVL em breve' })).toBeDisabled();
});

test('entra na trilha de ABB e responde a primeira etapa do quiz', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Abrir trilha de ABB' }));

  expect(screen.getByRole('heading', { name: 'Trilha de ABB' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Pesquisar elemento em ABB' })).toBeInTheDocument();
  expect(screen.getByText('Etapa 1/4')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Valores menores ficam em esq e maiores em dir.' }));

  expect(screen.getByText('Resposta correta.')).toBeInTheDocument();
  expect(screen.getByText('Etapa 2/4')).toBeInTheDocument();
});
