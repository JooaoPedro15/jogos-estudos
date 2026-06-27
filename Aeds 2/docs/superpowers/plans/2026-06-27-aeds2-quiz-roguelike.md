# AEDS II Quiz Roguelike Implementation Plan

> **For agentic workers:** Implementar task-by-task com TDD (vitest já configurado).
> Git não está inicializado neste ambiente (`.git` vazio) — onde o plano diz "commit",
> trate como checkpoint: rode `npm run test` e `npm run lint` e confirme verde antes de
> seguir. Não inicialize git sem o usuário pedir.

**Goal:** Tornar o encontro um quiz real resolvendo as `steps` já existentes no banco,
com cartas viradas ferramentas e deckbuilding com peso.

**Architecture:** Engine puro (`stepEngine`) resolve etapas e aplica efeitos de carta
sobre um `EncounterProgress`; `runEngine` ganha deck draw/discard/reshuffle; a UI
renderiza a etapa atual e anima o diagrama via `activePath`. Contrato de tipos travado
na Fase 1 para UI e conteúdo seguirem em paralelo.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, lucide-react.

---

## Contrato de tipos (TRAVADO — Fase 1 exporta, Fase 2 consome)

`src/roguelike/stepEngine.ts` deve exportar exatamente:

```ts
import type { ChallengeStep } from '../types/challenge';
import type { CardId } from '../cards/cardLibrary';

export type EncounterProgress = {
  challengeId: string;
  stepIndex: number;
  resolvedStepIds: string[];
  stepErrors: Record<string, number>;
  revealedHintStepIds: string[];
  eliminatedOptionIds: Record<string, string[]>; // stepId -> optionIds removidos
  scoreThisEncounter: number;
  doubleNextScore: boolean;
  focusShield: boolean;
  complete: boolean;
};

export type StepAnswer =
  | { kind: 'choice'; optionId: string }
  | { kind: 'gap'; text: string }
  | { kind: 'blocks'; order: string[] }
  | { kind: 'review' }; // avança

export type StepResult = {
  correct: boolean;
  feedback: string;          // explanation ou descrição do commonMistake
  mistakeId?: string;
  scoreDelta: number;
  focusLost: number;         // 0 ou 1 (0 se escudo/pular)
  activePath?: string[];
  activeNodeId?: string;
  encounterComplete: boolean;
};

export function createEncounterProgress(challengeId: string): EncounterProgress;
export function resolveStep(
  progress: EncounterProgress,
  step: ChallengeStep,
  answer: StepAnswer,
): { progress: EncounterProgress; result: StepResult };
```

`src/cards/cardLibrary.ts` — `AedsCard` ganha:

```ts
export type ToolEffect =
  | 'revelarDica'
  | 'eliminarAlternativa'
  | 'pularEtapa'
  | 'escudoFoco'
  | 'dobrarScore'
  | 'energiaExtra';

// AedsCard mantém id/name/structureTags/rarity/energyCost e adiciona:
//   effect: ToolEffect
//   effectValue?: number
```

`src/roguelike/stepEngine.ts` também exporta o aplicador de efeito:

```ts
export function applyToolEffect(
  progress: EncounterProgress,
  step: ChallengeStep | undefined,
  effect: ToolEffect,
  effectValue: number | undefined,
): { progress: EncounterProgress; energyDelta: number; message: string };
```

Normalização de lacuna (helper interno, mas comportamento fixo): `trim` + `toLowerCase`
+ remover acentos (`normalize('NFD').replace(/\p{Diacritic}/gu,'')`); compara com
`answer` e cada `alias` normalizados.

---

## File Structure

- Create `src/roguelike/stepEngine.ts` — resolução de etapa + efeitos de carta (puro).
- Create `src/roguelike/stepEngine.test.ts` — testes do engine.
- Create `src/roguelike/deck.ts` — shuffle/draw/discard/reshuffle com RNG injetável.
- Create `src/roguelike/deck.test.ts`.
- Modify `src/cards/cardLibrary.ts` — redefinir cartas como ferramentas (`effect`).
- Modify `src/cards/cardTypes.ts` — adicionar `effect`/`effectValue`, `ToolEffect`.
- Modify `src/cards/cardCombos.ts` + `passiveLibrary.ts` — reajuste mínimo de gatilhos.
- Modify `src/roguelike/runEngine.ts` — integrar `stepEngine` + deck; encontro avança
  por etapas; remover dependência de `requiredCardIds` como "resposta".
- Modify `src/roguelike/runState.ts` — `RunState` ganha `progress: EncounterProgress`.
- Modify `src/roguelike/scoring.ts` — score acumulado por etapa (ou absorvido no engine).
- Modify `src/app/App.tsx` — render da etapa atual + mão de ferramentas.
- Create `src/app/components/StepPanel.tsx` — render por tipo de etapa.
- Create `src/app/components/StructureDiagram.tsx` — generaliza `StructureSketch`,
  destaca `activePath`/`activeNodeId`.
- Create `src/app/components/FeedbackPanel.tsx`, `HandZone.tsx`, `EndScreen.tsx`.
- Modify `src/app/App.css` — estilos novos.
- Modify `src/challenges/challengeBank.ts` — revisão de estilo + (fase 2) novos desafios.

---

## Fase 1 — Engine (agente: backend-expert)

Define e exporta o contrato acima. TDD em cada task.

### Task 1: Tipos de carta-ferramenta
- Modify `src/cards/cardTypes.ts`: adicionar `ToolEffect`, `effect`, `effectValue?`.
- Redefinir `src/cards/cardLibrary.ts` como ~10–14 cartas-ferramenta temáticas (deck
  inicial 6–8 + recompensáveis), mantendo `structureTags`/`rarity`/`energyCost`.
- Ajustar `cardLibrary.test.ts` para o novo conteúdo.
- Acceptance: `npm run lint` verde; testes de biblioteca passam; nenhum import quebrado.

### Task 2: stepEngine — resolução por tipo (TDD)
- Create `stepEngine.ts` + `stepEngine.test.ts`.
- Testes primeiro, cobrindo: choice certo/errado; gap com alias e com acento
  (`"é"`↔`"e"`); blocks ordem certa/errada; review avança; erro → `focusLost:1` +
  feedback do `commonMistake` quando `mistakeId` presente, senão `explanation`;
  `encounterComplete` quando última etapa resolvida; `simular` propaga `activePath`.
- Implementar `createEncounterProgress` e `resolveStep`.
- Acceptance: testes verdes; função pura (sem efeitos colaterais).

### Task 3: stepEngine — efeitos de carta (TDD)
- `applyToolEffect`: `revelarDica` (marca hint), `eliminarAlternativa` (remove 1 option
  errada da etapa de escolha atual), `pularEtapa` (resolve sem score, `focusLost:0`),
  `escudoFoco` (set `focusShield`, consumido no próximo erro), `dobrarScore` (set
  `doubleNextScore`, aplicado e limpo no próximo acerto), `energiaExtra` (`energyDelta`).
- Testes para cada efeito + interação com `resolveStep` (escudo zera foco; dobrar
  multiplica o `scoreDelta` do próximo acerto).
- Acceptance: testes verdes.

### Task 4: deck.ts (TDD)
- `shuffle(cards, rng)`, `draw(deck, discard, n, rng)` → `{ hand, deck, discard }` com
  reshuffle do descarte quando o deck esvazia. RNG injetável (default `Math.random`).
- Testes determinísticos com RNG fake.
- Acceptance: testes verdes; reshuffle coberto.

### Task 5: integrar no runEngine + runState (TDD)
- `RunState.progress: EncounterProgress`. `createNewRun` inicia progress do 1º encontro.
- Substituir `playCard` (matching) por: jogar carta = `applyToolEffect` + gasto de
  energia + descarte. Nova ação `answerStep(run, answer)` = `resolveStep` + atualizar
  foco/score/phase; foco 0 → `defeat`; `encounterComplete` → `reward`.
- `advanceEncounter` cria novo progress e compra mão via `deck.ts`.
- Reajustar `scoring.ts`, `passives`, `combos` ao novo fluxo (mínimo p/ não quebrar).
- Atualizar `runEngine.test.ts`, `scoring.test.ts`, `encounterFactory` (pode dispensar
  `requiredCardIds` ou mantê-lo ignorado).
- Acceptance: `npm run test` e `npm run lint` verdes. Exportar o contrato de tipos final.

**Handoff Fase 1 → 2:** publicar a assinatura final de `EncounterProgress`,
`StepAnswer`, `StepResult`, ações de `runEngine` e o shape da mão para o frontend.

---

## Fase 2A — UI (agente: frontend-expert, após Fase 1)

### Task 6: StructureDiagram
- `StructureDiagram.tsx` generaliza `StructureSketch`: aceita `structure`,
  `activePath?`, `activeNodeId?`; destaca nós/arestas por id com transição CSS.
- Acceptance: render por estrutura; destaque visível; sem warnings.

### Task 7: StepPanel + ações
- `StepPanel.tsx` renderiza a etapa atual por `kind`: escolha (botões, respeitando
  `eliminatedOptionIds`), lacuna (input + submit), blocos (ordenação por clique/teclado),
  revisão (resumo). Chama `answerStep`. Mostra progresso `X/N` e dica revelada.
- Acceptance: cada tipo jogável por teclado; `aria-live` no feedback.

### Task 8: HandZone (ferramentas) + FeedbackPanel + EndScreen
- Mão mostra cartas-ferramenta com custo de energia; desabilita sem energia; aplica
  efeito. Feedback de acerto/erro com explicação/erro comum. Telas vitória/derrota com
  score + etapas acertadas.
- Acceptance: fluxo completo de um encontro ponta a ponta no browser.

### Task 9: App.tsx + CSS + responsividade/acessibilidade
- Recompor `App.tsx` com os componentes; HUD (foco/energia/moedas/score) mantida.
- `App.css`: layout responsivo (mobile→desktop), contraste, foco visível.
- Acceptance: `npm run dev` jogável; lint verde; `App.test.tsx` atualizado passa.

---

## Fase 2B — Conteúdo (agente: domínio aeds2, paralelo à 2A)

### Task 10: revisão de estilo das etapas
- Revisar `prompt`/`explanation`/`commonMistakes` de cada desafio para o estilo Max
  (português, `elemento/esq/dir/raiz`, sem libs prontas, single return). Não mudar o
  schema — só texto/correção.
- Acceptance: lint verde; testes do banco passam.

### Task 11 (stretch): novos desafios u02–u04
- +2–3 desafios (pilha, fila, lista encadeada, ordenação) no mesmo schema, `steps`
  completas, e encontros correspondentes em `encounterFactory`.
- Acceptance: aparecem na run; jogáveis; testes passam.

---

## Self-Review (coberto)

- Valor educativo → Tasks 2,7,10 (etapas viram o jogo). 
- Profundidade → Tasks 1,3,4,5 (ferramentas + deck).
- Visual/UX → Tasks 6,7,8,9 (diagrama animado, etapas, telas, acessibilidade).
- Conteúdo → Tasks 10,11.
- Contrato de tipos consistente entre Fase 1 (define) e Fase 2 (consome) — travado acima.
