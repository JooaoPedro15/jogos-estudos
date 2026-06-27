# AEDS II Quiz Roguelike — Reforma do Loop (Abordagem A)

Data: 2026-06-27
Status: aprovado para implementação

## Problema

O jogo se vende como "educativo para treinar questões da prova de AEDS II", mas o
loop jogável não testa nem ensina nada: o jogador apenas casa um conjunto de cartas
contra `encounter.requiredCardIds`. Além disso o deckbuilding é falso — `drawHand`
devolve o deck inteiro todo turno, então recompensas de carta não têm efeito.

O achado decisivo: **o banco de desafios (`src/challenges/challengeBank.ts`) já contém
todo o conteúdo educativo** — 14 desafios (7 estruturas × 2), ~56 `steps` dos tipos
`interpretar`, `simular`, `lacuna`, `blocos`, `complexidade`, com `options`,
`correctOptionId`, `answers`+`aliases`, `correctOrder`, `activePath`/`activeNodeId`,
`complexity.explanation` e `commonMistakes`. **A UI não renderiza nada disso.**

## Objetivo

Transformar o encontro no próprio quiz: o jogador resolve as `steps` do desafio. As
cartas deixam de ser "a resposta" e viram ferramentas gastas com energia. O
deckbuilding passa a ter peso. Cobre os 4 eixos pedidos (valor educativo, profundidade
de jogo, polimento visual/UX, mais conteúdo) com uma reforma central.

## Arquitetura

### Loop central (novo) — `src/roguelike/stepEngine.ts`

Estado de resolução de um encontro:

```
EncounterProgress = {
  challengeId: string
  stepIndex: number            // etapa atual
  resolvedStepIds: string[]    // etapas concluídas
  stepErrors: Record<stepId, number>  // tentativas erradas por etapa
  revealedHints: string[]      // etapas com dica revelada
  eliminatedOptionIds: Record<stepId, string[]>  // alternativas removidas por carta
  scoreThisEncounter: number
}
```

Resolução por tipo de etapa (função pura, testável):

- `interpretar` / `simular` / `complexidade`: compara `optionId` escolhido com
  `step.correctOptionId`.
- `lacuna`: normaliza input (trim, lowercase, remove acento) e compara com
  `answer` + `aliases` normalizados.
- `blocos`: compara ordem submetida com `correctOrder`.
- `revisao`: informativa, sem cobrança — só avança.

Regras:

- Acertou a etapa → marca resolvida, soma score base (ex: 10) × multiplicadores
  ativos, avança `stepIndex`.
- Errou → incrementa `stepErrors[stepId]`, **perde 1 foco**, revela o feedback
  (`step.explanation`, ou o `commonMistake` referenciado por `step.mistakeId`), e
  avança revelando a resposta correta (não trava o jogador). Foco 0 = derrota.
- Concluídas todas as etapas → encontro vencido → fase `reward`.
- Etapa de `simular` expõe `activePath`/`activeNodeId` para a UI animar o diagrama.

A função de resolução não muta estado: recebe `(progress, run, input)` e devolve novo
`progress`/`run` + um `StepResult` (correct, feedback, mistakeId?, scoreDelta,
focusLost, activePath?).

### Cartas como ferramentas — `src/cards/cardLibrary.ts` (redefinição)

Redefinir as cartas como ferramentas, **mantendo o shape `AedsCard`**
(`structureTags`, `rarity`, `energyCost`) para combos e passivas continuarem válidos.
Adicionar um campo de efeito:

```
ToolEffect =
  | 'revelarDica'        // mostra step.hint da etapa atual
  | 'eliminarAlternativa'// remove 1 option errada de etapa de escolha
  | 'pularEtapa'         // resolve a etapa sem foco em risco, sem score
  | 'escudoFoco'         // protege o próximo erro (não perde foco)
  | 'dobrarScore'        // x2 no score da próxima etapa correta
  | 'energiaExtra'       // +N energia neste encontro
  | <temáticas por estrutura, opcional>
```

`AedsCard` ganha `effect: ToolEffect` e `effectValue?: number`. Categorias antigas
(`base`/`percurso`/...) podem ser mantidas como sabor/tag ou simplificadas; o que
importa para o engine é `effect`. Manter `structureTags` para passivas/combos que
dão bônus por estrutura.

Jogar carta durante um encontro: valida energia, aplica o efeito ao `EncounterProgress`
ou `run`, move a carta para o descarte.

### Deckbuilding real — `src/roguelike/runEngine.ts`

- `createStartingDeck`: deck inicial pequeno e fixo (ex: 6–8 cartas-ferramenta).
- `drawHand(deck, discard, n)`: embaralha e compra `n` (ex: 5); ao esvaziar o deck,
  reembaralha o descarte. Determinístico em teste via seed/injeção de RNG.
- Recompensa de carta adiciona ao deck (já existe `chooseCardReward`), agora com efeito
  real porque a mão é um subconjunto.

### Passivas e combos

Mantidos. Reajustar gatilhos que liam `playedCardIds` de cartas-conceito para o novo
modelo (bônus de score por estrutura, desconto de energia, proteção de foco já
existem em `passiveLibrary`/`runEngine`). Combos passam a reconhecer padrões de uso de
ferramentas ou permanecem como bônus de estrutura. Não inflar: ajustar o mínimo para
não quebrar, evoluir depois.

### Scoring — `src/roguelike/scoring.ts`

Reorientar de "casou cartas obrigatórias" para "score acumulado nas etapas":
score do encontro = soma das etapas corretas × multiplicadores (combo/passiva/
dobrarScore) × bônus de complexidade quando a etapa de complexidade é acertada de
primeira. Manter tipos de resultado compatíveis com a HUD.

## Visual / UX (frontend-expert)

- **Painel de etapa**: enunciado, render por tipo (botões de escolha / input de lacuna /
  blocos arrastáveis ou ordenáveis por clique), progresso `etapa X/N`.
- **Diagrama animado**: generalizar `StructureSketch` para destacar nós/arestas por id
  (`activePath`, `activeNodeId`) com transição suave durante `simular`.
- **Feedback**: estados claros de acerto/erro, explicação e `commonMistake`.
- **Telas vitória/derrota**: score final + nº de etapas acertadas + estruturas dominadas.
- **Acessibilidade**: navegação por teclado, `aria-live` no feedback, foco gerenciado,
  contraste. **Responsivo** (mobile→desktop).

## Conteúdo (domínio aeds2)

- Banco já cobre 7 estruturas (binária, abb, avl, alvinegra, hash, trie, doidona).
- Revisar `prompt`/`explanation`/`commonMistakes` das etapas para o estilo do professor
  Max (português, nomes `elemento/esq/dir/raiz`, single return, sem libs prontas).
- **Stretch (fase 2)**: +2–3 desafios das unidades u02–u04 (pilha, fila, lista
  encadeada, ordenação) no mesmo schema, com `steps` completas.

## Testes (vitest, já configurado)

- Resolução de etapa por tipo (escolha, lacuna c/ aliases e acento, blocos, revisão).
- Efeitos de carta-ferramenta (dica, eliminar, pular, escudo, dobrar, energia).
- Economia: gasto de energia, perda/proteção de foco, derrota em foco 0.
- Deck: draw/discard/reshuffle determinístico (RNG injetável).
- Progressão de encontro: etapa→etapa→vitória→recompensa→próximo encontro.
- Scoring acumulado com multiplicadores.

## Workstreams (agentes)

Contrato primeiro, depois paralelo:

1. **backend-expert** — `stepEngine`, redefinição de `cardLibrary` (tool effects),
   deckbuilding em `runEngine`, ajuste de `scoring`/passivas/combos, testes. Define e
   exporta os tipos que a UI consome (`EncounterProgress`, `StepResult`, `ToolEffect`).
2. **frontend-expert** — `App.tsx` + componentes de etapa, diagrama animado, feedback,
   telas, responsividade/acessibilidade, contra o contrato do engine.
3. **domínio aeds2** — revisão de estilo das etapas + desafios novos (fase 2).

Sequência: (1) engine fecha o contrato de tipos → (2) e (3) em paralelo.

## Fora de escopo (YAGNI)

- Persistência/save de run, contas, leaderboard.
- Editor de código com execução real (`starterCode`/`solution` ficam dormentes).
- Multiplayer, som, animações pesadas além do diagrama.
- Reescrever combos/passivas do zero — só ajuste mínimo.

## Critérios de sucesso

- Encontro é resolvido respondendo as etapas do banco; nenhuma etapa fica dormente.
- Errar etapa ensina (mostra explicação/erro comum) e custa foco.
- Cartas-ferramenta têm efeito real e a mão é subconjunto aleatório do deck.
- Diagrama anima o caminho nas etapas de simulação.
- `npm run test` e `npm run lint` (tsc) passam.
