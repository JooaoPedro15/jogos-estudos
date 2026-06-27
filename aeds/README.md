# AEDS — Algoritmos e Estruturas de Dados

## 🎯 Objetivo

Reunir jogos educacionais voltados para o estudo de **AEDS II** (Algoritmos e Estruturas
de Dados II). Os jogos abordam estruturas de dados, seus algoritmos de manipulação,
complexidade e propriedades — sempre de forma interativa e voltada para a prova.

## 🎮 Jogos disponíveis

### [jogo-aeds-2/](jogo-aeds-2/) — AEDS II Card Roguelike
**Estado:** Em desenvolvimento

Roguelike de cartas inspirado em Balatro. Cada run apresenta 14 encontros (normais,
elites e chefe) onde o jogador resolve desafios de AEDS usando cartas de ferramentas.
Inclui sistema de combos, passivas de run, diagramas SVG das estruturas e pontuação.

**Conteúdos trabalhados no jogo:**
- Árvore Binária de Busca (ABB) — pesquisa, propriedades
- Árvore AVL — fator de balanceamento, rotações
- Árvore Alvinegra (Red-Black) — propriedades, recoloração
- Tabela Hash — pesquisa, área de reserva, rehashing
- Árvore TRIE — busca por palavra, verificação de prefixo
- Estrutura Híbrida ("Doidona") — busca/inserção em camadas (árvore → T1 → T2 → lista)
- Árvore Binária genérica — altura, maior caminho

**Conteúdos presentes nos materiais de referência (não ainda no jogo):**
- Pilhas, filas, listas simples e duplamente encadeadas (unidade 04)
- Ordenação (unidade 03)
- PATRICIA (unidade 08)

## 📁 Onde encontrar

| Pasta | Conteúdo |
| --- | --- |
| [`jogo-aeds-2/`](jogo-aeds-2/) | Jogo principal (React + TypeScript + Vite) |
| [`materiais/`](materiais/) | Materiais acadêmicos públicos |
| [`docs/`](docs/) | Documentação cruzada entre jogos da matéria (vazio por enquanto) |

> **Materiais privados** (PDFs de slides, listas de exercício, provas) ficam em
> `materiais-privados/` (ignorada pelo Git). Veja o README dentro de `materiais/`
> para instruções.
