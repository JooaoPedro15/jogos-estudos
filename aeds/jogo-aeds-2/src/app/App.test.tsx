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
  expect(screen.getByRole('button', { name: 'Abrir trilha de AVL' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Abrir trilha de PATRICIA' })).toBeEnabled();
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

test('usa o visualStateId do desafio para trocar o diagrama da estrutura', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Abrir trilha de Arvore Binaria' }));

  const diagram = screen.getByRole('img', { name: 'Diagrama de arvore' });
  expect(within(diagram).getByText('8')).toBeInTheDocument();
  expect(within(diagram).getByText('3')).toBeInTheDocument();
  expect(within(diagram).getByText('10')).toBeInTheDocument();
  expect(within(diagram).queryByText('40')).not.toBeInTheDocument();
});

test('laboratorio executa operacoes sem ficar bloqueado', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Laboratorio' }));

  const valueInput = screen.getByRole('textbox', { name: 'Valor da operacao' });
  const insertButton = screen.getByRole('button', { name: 'Inserir' });
  const removeButton = screen.getByRole('button', { name: 'Remover' });
  const searchButton = screen.getByRole('button', { name: 'Pesquisar' });

  expect(valueInput).toBeEnabled();
  expect(insertButton).toBeEnabled();
  expect(removeButton).toBeEnabled();
  expect(searchButton).toBeEnabled();

  await user.type(valueInput, '42');
  await user.click(insertButton);

  expect(screen.getByText('Inserir 42')).toBeInTheDocument();
});

test('renderiza fase de desenho com alternativas visuais da lista', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Abrir trilha de ABB' }));
  await user.click(screen.getByRole('button', { name: /Escolher desenho correto da ABB/ }));

  expect(screen.getByRole('heading', { name: 'Escolher desenho correto da ABB' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Desenho A' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Desenho B' })).toBeInTheDocument();
});
