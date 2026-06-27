# AEDS II Card Roguelike - MVP Design

Data: 2026-06-27

## Mudanca De Direcao

O MVP deixa de ser apenas uma Bancada Guiada e passa a ser um roguelike simples de cartas inspirado em Balatro. A base ja criada continua util: os desafios viram encontros, as estruturas visuais viram alvos/salas, e os tipos de desafio viram dados para validar jogadas.

## Objetivo

Criar um jogo educativo viciante e simples em que o jogador resolve questoes de AEDS II montando sequencias de cartas. As cartas representam conceitos de raciocinio, mas quando jogadas revelam o trecho de codigo ou pseudocodigo correspondente no estilo do professor.

O jogo deve ensinar sem parecer uma lista de exercicios.

## Recorte Do MVP Completinho

Completo aqui significa completo dentro do primeiro jogo jogavel:

- run curta com inicio, encontros, recompensas e chefe;
- sistema de cartas;
- coringas/passivas;
- pontuacao, foco, energia e moedas;
- encontros usando as estruturas ja priorizadas: ABB, AVL, alvinegra, hash e TRIE;
- conteudo inicial com os 10 desafios ja criados;
- tela de loja/recompensa simples;
- tela final de vitoria/derrota;
- caderno de erros e progresso local podem ser simples no MVP.

Ficam fora deste primeiro recorte:

- PATRICIA completa;
- todas as arvores doidonas do prompt original;
- geracao procedural profunda;
- drag-and-drop;
- backend;
- texto livre com correcao automatica profunda.

## Core Loop

Uma run tem cerca de 10 minutos:

1. O jogador entra em um encontro.
2. O encontro mostra uma questao estilo prova: classes fornecidas, metodo pedido e estrutura visual.
3. O jogador recebe uma mao de cartas.
4. O jogador joga cartas em uma sequencia de solucao.
5. O jogo valida se a sequencia cobre a logica necessaria.
6. Acerto gera dano/pontos, codigo parcial e recompensa.
7. Erro reduz foco, registra erro e permite tentar outra sequencia.
8. Entre encontros, o jogador escolhe carta, melhoria, moeda ou coringa.
9. A run termina em chefe.

## Cartas

As cartas sao hibridas:

- face principal: conceito;
- detalhe: explicacao curta;
- ao jogar: trecho de codigo/pseudocodigo.

Tipos:

- **Base**: `Caso Base Nulo`, `Retornar Falso`, `Retornar Zero`.
- **Percurso**: `Visitar Esquerda`, `Visitar Direita`, `Menor Vai Esquerda`, `Maior Vai Direita`, `Avancar Caractere`, `Aplicar Hash`.
- **Condicao**: `Elemento Igual`, `Eh Folha`, `Cor Branca`, `Tem Prefixo`, `Slot Ocupado`, `Fim Da Palavra`.
- **Combinacao**: `Somar Retornos`, `Comparar Retornos`, `E Logico`, `OU Logico`.
- **Complexidade**: `O(n)`, `O(log n)`, `O(tamanho da palavra)`, `O(1) medio`.
- **Modificador**: `Usar Auxiliar`, `Podar Ramo`, `Tratar Colisao`, `Consultar Reserva`.

Exemplo para `contarFolhas`:

```text
Caso Base Nulo
-> Eh Folha
-> Visitar Esquerda
-> Visitar Direita
-> Somar Retornos
-> O(n)
```

Saida de codigo:

```java
if (i == null) return 0;
if (i.esq == null && i.dir == null) return 1;
return contar(i.esq) + contar(i.dir);
```

## Combos

Combos dao pontos extras e reforcam padroes:

- **Travessia Completa**: `Caso Base Nulo` + `Visitar Esquerda` + `Visitar Direita` + `Somar Retornos`.
- **Caminho De ABB**: `Elemento Igual` + `Menor Vai Esquerda` + `Maior Vai Direita`.
- **Busca Em TRIE**: `Avancar Caractere` + `Fim Da Palavra`.
- **Pesquisa Com Overflow**: `Aplicar Hash` + `Slot Ocupado` + `Consultar Reserva`.
- **Contagem Alvinegra**: `Cor Branca` + `Visitar Esquerda` + `Visitar Direita` + `Somar Retornos`.
- **Complexidade Perfeita**: sequencia correta + carta de complexidade correta.

## Coringas E Passivas

Coringas ficam ativos durante a run:

- **Mestre da Recursao**: combos com caso base dao +2 pontos.
- **Olho da ABB**: cartas de caminho custam 1 energia a menos.
- **Domador de TRIE**: prefixo correto multiplica pontuacao.
- **Sem Colisao**: primeiro erro de hash da run nao tira foco.
- **Complexidade Perfeita**: acertar complexidade dobra recompensa.
- **Professor Inventou Isso Agora**: desafios hibridos dao mais moedas.

## Recursos

- **Foco**: vida da run.
- **Energia**: limite de cartas por turno/encontro.
- **Moedas**: comprar cartas e coringas.
- **Pontuacao**: dano no encontro e ranking da run.
- **Dominio**: progresso persistente por estrutura/padrao.

## Run Do MVP

O MVP usa uma run semi-fixa:

- 3 atos;
- 3 encontros por ato;
- 1 chefe final;
- total de 10 encontros.

Tipos de encontro:

- **Normal**: questao curta.
- **Elite**: menos energia ou mais cartas obrigatorias.
- **Loja**: comprar carta, remover carta, melhorar carta.
- **Descanso**: recuperar foco ou transformar carta.
- **Chefe**: regra especial.

Primeiro chefe:

**Guardiao da Complexidade**

- so recebe dano total se a carta de complexidade estiver correta;
- sem complexidade correta, o jogador ainda aprende, mas causa pouco dano.

## Estruturas E Conteudos Do MVP

Usar todo o conteudo inicial ja criado:

- ABB: pesquisar elemento, contar folhas;
- AVL: calcular fator, verificar balanceamento;
- Alvinegra: contar brancos, identificar no tipo quatro;
- Hash: pesquisar com area de reserva, rehash apos colisao;
- TRIE: pesquisar palavra exata, verificar prefixo.

Cada encontro mapeia um desafio para:

- cartas obrigatorias;
- cartas aceitas como equivalentes;
- combos possiveis;
- complexidade esperada;
- erro comum.

## Interface

A primeira tela deve ser o jogo, nao uma landing page.

Layout:

- topo: ato, encontro, foco, energia, moedas, pontuacao;
- esquerda: enunciado estilo prova e codigo gerado;
- centro: estrutura visual e alvo/encontro;
- direita: coringas, combos ativos e objetivo;
- rodape: mao de cartas e area de sequencia jogada.

O visual deve ser denso, legivel e com cara de jogo de cartas de estudo: cartas, multiplicadores, feedback imediato e recompensas.

## Arquitetura

Novos modulos:

```text
src/cards/
  cardLibrary.ts
  cardCombos.ts

src/roguelike/
  runState.ts
  runEngine.ts
  encounterFactory.ts
  scoring.ts

src/pages/
  RunPage.tsx

src/components/
  CardView.tsx
  HandPanel.tsx
  PlayedSequence.tsx
  EncounterPanel.tsx
  RewardPanel.tsx
```

Reaproveitar:

- `src/challenges/challengeBank.ts`;
- `src/structures/sampleStructures.ts`;
- `src/types/challenge.ts`;
- `src/types/structures.ts`.

## Validacao Das Jogadas

No MVP, cada desafio declara uma ou mais sequencias aceitas de cartas.

Exemplo:

```ts
requiredCardIds: [
  "caso-base-nulo",
  "eh-folha",
  "visitar-esquerda",
  "visitar-direita",
  "somar-retornos",
  "complexidade-on"
]
```

A validacao verifica:

- se as cartas necessarias aparecem;
- se a ordem respeita dependencias principais;
- se a complexidade bate;
- quais combos foram ativados;
- qual erro comum ocorreu quando faltar carta-chave.

## Criterios De Aceite

O MVP roguelike esta pronto quando:

- `npm.cmd run test` passa;
- `npm.cmd run build` passa;
- o app abre direto na run;
- o jogador consegue jogar cartas de uma mao;
- uma sequencia correta vence encontro;
- uma sequencia errada tira foco e mostra feedback;
- ha pelo menos 10 encontros usando ABB, AVL, alvinegra, hash e TRIE;
- ha recompensas entre encontros;
- ha pelo menos 5 coringas/passivas;
- ha chefe final com regra especial;
- ha tela de vitoria/derrota;
- README explica como rodar e como adicionar cartas/encontros.
