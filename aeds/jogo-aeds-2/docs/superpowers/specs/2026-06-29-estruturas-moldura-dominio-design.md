# Estruturas — AEDS II: Moldura por Domínio

Data: 2026-06-29

## Contexto

O jogo educativo de AEDS II existente (`aeds/jogo-aeds-2/`, React 19 + TS + Vite + Vitest)
nasceu como um **roguelike de cartas** chamado "Guardião das Estruturas". Após análise
conjunta, concluiu-se que a moldura roguelike (Foco/vida, Energia, cartas-ferramenta,
encontros aleatórios) **combate** os objetivos pedagógicos do enunciado:

- punir erro (-1 Foco) vai contra o caderno de erros, que quer que o jogador erre para aprender;
- energia limitada restringe a prática livre e repetida;
- encontros aleatórios impedem a seleção livre de estrutura;
- o loop "sobreviver" diverge do loop "dominar".

Decisão: **descartar a moldura roguelike** e adotar uma moldura por **Domínio**. O nome
do jogo passa a ser **"Estruturas"**.

### Decisões tomadas (não reabrir)

1. **Cobertura-alvo**: apenas árvores + hash + trie. 9 estruturas: Árvore Binária, ABB,
   AVL, 2-3-4, Alvinegra, Hash, TRIE, PATRICIA, Híbridas/Doidonas. Listas, pilhas, fila e
   ordenação ficam de fora deste ciclo.
2. **Moldura central**: Domínio (Biblioteca → Trilha → Laboratório → Caderno de erros →
   Simulado). Gamificação = XP + domínio por operação + desbloqueio por competência.
3. **Interatividade (MVP)**: quiz estruturado + clicar no diagrama. Sem drag-and-drop de
   montar árvore. Sem editor de código executável/backend.
4. **Tamanho do MVP**: arquitetura completa (todos os modos + persistência localStorage)
   rodando com conteúdo cheio de **2 estruturas**: Árvore Binária e ABB, cada uma com a
   trilha de 10 fases. As demais 7 ficam "em breve" (lock visual).

## O que é preservado (código testado, reutilizável)

- `src/types/challenge.ts` — modelo `Challenge`/`ChallengeStep`.
- `src/types/structures.ts` — `VisualState` (tree/hash/trie/hybrid) + views de nó.
- `src/roguelike/stepEngine.ts` — **núcleo de avaliação** (`resolveStep`,
  `isAnswerCorrect`, `normalizeText`, lacuna/blocos/escolha/complexidade). Será extraído.
- `src/app/components/StepPanel.tsx` — renderiza os kinds de etapa.
- `src/app/components/StructureDiagram.tsx` — SVG com `activePath`/`activeNodeId`.
- `src/challenges/challengeBank.ts` — referência de formato de desafio.
- `src/structures/sampleStructures.ts` — referência de estados visuais.

## O que é descartado (moldura roguelike)

- `src/roguelike/runEngine.ts`, `runState.ts`, `deck.ts`, `scoring.ts`,
  `encounterFactory.ts`.
- `src/cards/` inteiro (`cardLibrary`, `cardCombos`, `passiveLibrary`, `cardTypes`).
- `src/app/App.tsx` (usa `resolveEncounter` legado que pula etapas).
- Testes de roguelike e cartas. **Mantém-se** `stepEngine.test.ts` (adaptado).

## Arquitetura de pastas (nova)

```
src/
  app/
    App.tsx              ← roteador de modo (Biblioteca/Trilha/Lab/Caderno/Simulado)
    App.css              ← refatorado
    components/
      StepPanel.tsx           ← reutilizado (quiz)
      StructureDiagram.tsx    ← reutilizado + novos kinds (binaria/abb/avl/234/...)
      ClickTarget.tsx         ← camada de clique no diagrama
      LibraryView.tsx         ← grade de estruturas
      TrailView.tsx           ← 10 fases da estrutura selecionada
      LabView.tsx             ← laboratório livre
      ErrorBookView.tsx       ← caderno de erros + revisão
      SimuladoView.tsx        ← simulado configurável
      ProgressPill.tsx        ← badge de domínio por operação
  domain/
    structures/          ← catálogo das 9 estruturas (id, nome, ícone, fases, regras)
      catalog.ts
      binaria.ts  abb.ts  avl.ts  alvinegra.ts  arv234.ts  hash.ts  trie.ts  patricia.ts  doidona.ts
    trail/
      phases.ts          ← definição das 10 fases por estrutura
    progress/
      mastery.ts         ← estados de domínio por (estrutura, operação)
      progression.ts     ← XP e desbloqueio de fase por competência
    errorBook/
      errorBook.ts       ← registro + categorias de erro
      review.ts          ← revisão espaçada
    persistence/
      store.ts           ← localStorage load/save/migrate
  content/
    challenges/          ← desafios das trilhas (formato Challenge)
      binaria/ abb/ ...  ← arquivos por estrutura
  evaluators/
    stepEvaluator.ts     ← extraído do stepEngine (avaliação pura)
  simulators/            ← geradores de passos e estado de laboratório
    binariaSim.ts  abbSim.ts  ...
  types/
    challenge.ts         ← reutilizado + novo kind 'clique'
    structures.ts        ← reutilizado + novos kinds visuais
    mastery.ts           ← domínio/progresso/caderno
```

## Modelo de domínio (progresso por operação)

Estados de domínio (`MasteryState`):

```
nao-estudado → conhecendo → praticando → consegue-com-ajuda
→ consegue-sem-ajuda → consegue-modificar → aplica-em-outro-contexto → dominado
```

Operações rastreadas por estrutura (`Operation`):

- `reconhecer`, `desenhar`, `construir`, `pesquisar`, `inserir`, `remover`,
  `percorrer`, `alterar`, `codigo`, `dominio`.

`OperationMastery = { structure, operation, state, attempts, lastReviewed, nextReview }`.

## Desbloqueio de fases (competência, não aleatório)

- A Fase N exige que a fase anterior esteja ≥ `praticando`.
- A F3 (construir) exige F1 (reconhecer) e F2 (desenhar) ≥ `praticando`.
- A F5 (inserir) exige F4 (pesquisar) ≥ `praticando`.
- A F6 (remover) exige F5 ≥ `consegue-com-ajuda`.
- A F10 (domínio) exige F4–F9 ≥ `consegue-sem-ajuda`.

## A Trilha de 10 fases (por estrutura)

- **F1 Reconhecer** — componentes, campos, ponteiros, regras, identificar em código.
- **F2 Desenhar** — posicionar raiz, filhos, ligar nós, escolher cores, slots hash,
  caminhos trie. Via etapas `clique`.
- **F3 Construção passo a passo** — sequência de valores → onde entra, comparações,
  correção.
- **F4 Pesquisar** — caminhos, descarte de ramos, sucesso/falha, complexidade.
- **F5 Inserção** — caso base, posição, ponteiros, balanceamento/colisão/divisão/recoloração.
- **F6 Remoção** — todos os casos (folha, 1 filho, 2 filhos, maiorEsq/sucessor,
  rebalanceamento).
- **F7 Percursos e operações auxiliares** — central/pré/pós/níveis, altura, tamanho,
  folhas, min/max.
- **F8 Alterações lógicas** — modificar função pronta (contar → contar folhas → contar
  pares → ...).
- **F9 Código completo** — reconhecer → completar expressão → completar linha → blocos →
  corrigir → modificar → escrever.
- **F10 Desafio de domínio** — desenhar + construir + pesquisar + inserir + remover +
  explicar + interpretar código + corrigir + modificar + escrever + complexidade +
  questão inédita.

## Novo tipo de etapa: `clique`

Para "desenhar/construir" sem drag-and-drop. Permite "clique no nó que a busca visita",
"clique na posição hash correta", "clique nos nós do caminho".

```ts
type ClickStep = ChallengeStepBase & {
  kind: 'clique';
  targetNodeIds: string[];   // ids de nós aceitos (ex.: caminho da busca)
  maxClicks?: number;        // ex.: "clique nos 3 nós do caminho"
  selectionMode?: 'ordered' | 'unordered';
};
type ClickAnswer = { kind: 'click'; nodeIds: string[] };
```

`StructureDiagram` ganha um modo `interactive` que dispara `onNodeClick(nodeId)`.

## Fluxo de telas (roteador em App.tsx)

```
App (useState<Mode>)
 ├─ mode='library' → LibraryView (grade das 9 estruturas com % de domínio)
 │     └─ seleciona estrutura → mode='trail'
 ├─ mode='trail' → TrailView (10 fases, desbloqueio por domínio)
 │     └─ fase com quiz → reutiliza StepPanel + ClickTarget
 ├─ mode='lab' → LabView (insere/remove/pesquisa no simulador)
 ├─ mode='errors' → ErrorBookView (lista + revisão espaçada)
 └─ mode='simulado' → SimuladoView (configura e roda)
```

## Laboratório (modo livre)

Cada estrutura tem um **simulador** (`simulators/abbSim.ts`) com operações puras que
devolvem `{ state, steps }`. `LabView` chama:

- `insert(state, x)` → novo estado + passos animados.
- `remove`, `search`, `traverse` idem.
- **desfazer/refazer** via pilha de estados; **próximo passo/anterior** via índice em `steps`.

Botões (§12 do enunciado): inserir, remover, pesquisar, próximo passo, passo anterior,
executar, pausar, reiniciar, explicar, visualizar código, escolher caso especial (rotação
simples, remover 2 filhos, colisão intencional...).

## Caderno de erros (categorias, §15)

- `nao-entendeu-estrutura`, `desenhou-errado`, `caminho-errado`, `caso-base-incorreto`,
  `esqueceu-no-atual`, `combinou-retornos-incorretamente`, `ponteiro-errado`,
  `quebrou-balanceamento`, `rotacao-errada`, `recoloracao-errada`, `divisao-errada`,
  `ignorou-colisao`, `esqueceu-marcador-fim`, `ignorou-camada`, `complexidade-errada`.

Registro: `{ structure, operation, challengeId, stepId, answer, correctAnswer,
mistakeCategory, attempts, date, nextReview }`. Gera exercício específico para corrigir
cada falha (revê a fase correspondente).

## Persistência

`localStorage` com chave `estruturas:v1`. Migração por versão (semelhante ao projeto
`arquitetura-computadores`). Armazena: domínio por operação, XP, caderno de erros,
preferências.

## Simulado (configurável, §16)

Jogador escolhe: estrutura(s), operações, dificuldade, quantidade de questões, tempo,
incluir desenho/código/remoção/híbridas/complexidade. Mistura tipos de etapa. Correção só
aparece no final.

## Conteúdo do MVP

Apenas **Árvore Binária** e **ABB**, cada uma com a **trilha completa de 10 fases**. As
demais 7 estruturas aparecem na Biblioteca como "em breve" (lock visual). Ciclos seguintes
apenas preenchem conteúdo.

## Fora do MVP

- Texto livre com avaliação automática profunda.
- Drag-and-drop de montar estrutura.
- Geração procedural infinita de questões.
- Backend.
- PATRICIA completa, todas as doidonas.
- Animações avançadas de rotação/fragmentação.

## Critérios de aceite

- `npm install`, `npm run dev`, `npm run build`, `npm test` funcionam.
- A Biblioteca abre mostrando as 9 estruturas (7 bloqueadas).
- Árvore Binária e ABB têm trilha jogável de 10 fases cada.
- Cada fase tem enunciado, código fornecido, visualização e etapa avaliável.
- Etapas `clique` funcionam (clicar no nó/slot correto).
- Laboratório de ABB funcional (inserir/pesquisar/remover/desfazer/passo a passo).
- Caderno de erros registra e oferece revisão.
- Persistência em `localStorage` sobrevive a reload.
- `stepEvaluator` (extraído do `stepEngine`) mantém testes passando.
- README atualizado para o nome "Estruturas".
