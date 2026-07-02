import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';

test('abre na biblioteca de dominio com as 12 estruturas do material', () => {
  render(<App />);

  expect(screen.getByRole('main')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Estruturas' })).toBeInTheDocument();

  const library = screen.getByRole('region', { name: 'Biblioteca de estruturas' });
  expect(within(library).getAllByRole('listitem')).toHaveLength(12);

  expect(screen.getByRole('button', { name: 'Abrir trilha de Lista' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Abrir trilha de Pilha' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Abrir trilha de Ordenacao' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Abrir trilha de ABB' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Abrir trilha de AVL' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Abrir trilha de PATRICIA' })).toBeEnabled();
});

test('entra na trilha de ABB direto nas questoes da lista', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Abrir trilha de ABB' }));

  expect(screen.getByRole('heading', { name: 'Trilha de ABB' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Escolher desenho correto da ABB' })).toBeInTheDocument();
  expect(screen.getAllByText('Lista Prova 3').length).toBeGreaterThan(0);
  expect(screen.getByText('Etapa 1/4')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Desenho A' }));

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

  await user.type(valueInput, '1');
  await user.click(insertButton);

  expect(screen.getByText('Inserir 1')).toBeInTheDocument();
  expect(screen.queryByText('Inserir 42')).not.toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Animacao do laboratorio' })).toBeInTheDocument();
  expect(screen.getByText('Passo 1 de 4')).toBeInTheDocument();
  expect(screen.getByText('Comparar com 40')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Proximo passo' }));

  expect(screen.getByText('Passo 2 de 4')).toBeInTheDocument();
  expect(screen.getByText('Descer para 20')).toBeInTheDocument();
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

test('abre as trilhas de lista, pilha e ordenacao com conteudo dos slides', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Abrir trilha de Lista' }));
  expect(screen.getByRole('heading', { name: 'Trilha de Lista' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Remover por posicao na lista simples' })).toBeInTheDocument();
  expect(screen.getByText('Origem: Semestre AEDS.zip - u04d_tadFlexivel_listasimples.pdf')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Pilha' }));
  expect(screen.getByRole('heading', { name: 'Trilha de Pilha' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Remover do topo da pilha' })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Ordenacao' }));
  expect(screen.getByRole('heading', { name: 'Trilha de Ordenacao' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Completar passo da selecao' })).toBeInTheDocument();
});
