# AEDS II Card Roguelike Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current AEDS II study app into a playable Balatro-inspired educational card roguelike using the existing challenge bank and structure data.

**Architecture:** Keep the existing React/Vite/TypeScript scaffold, challenge types, challenge bank, and sample structures. Add a card layer, a pure roguelike run engine, and a `RunPage` UI that opens directly into the run with hand, played sequence, encounter, scoring, rewards, and boss state.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, SVG/HTML card UI, local static data.

---

## Existing Baseline

Already implemented:

- `src/app/App.tsx`
- `src/app/App.css`
- `src/types/challenge.ts`
- `src/types/structures.ts`
- `src/structures/sampleStructures.ts`
- `src/challenges/challengeBank.ts`
- Tests for app shell, types, and challenge bank.

Do not throw this away. Build the roguelike layer on top.

The workspace is not a valid Git repository. Skip commit steps unless Git is explicitly initialized later.

## Planned File Structure

Create:

```text
src/cards/cardLibrary.ts
src/cards/cardCombos.ts
src/cards/passiveLibrary.ts
src/cards/cardTypes.ts
src/roguelike/encounterFactory.ts
src/roguelike/runEngine.ts
src/roguelike/runState.ts
src/roguelike/scoring.ts
src/components/CardView.tsx
src/components/EncounterPanel.tsx
src/components/HandPanel.tsx
src/components/PlayedSequence.tsx
src/components/RewardPanel.tsx
src/pages/RunPage.tsx
```

Modify:

```text
src/app/App.tsx
src/app/App.css
src/challenges/challengeBank.ts
```

Add tests beside each feature:

```text
src/cards/cardLibrary.test.ts
src/cards/cardCombos.test.ts
src/roguelike/encounterFactory.test.ts
src/roguelike/runEngine.test.ts
src/roguelike/scoring.test.ts
src/pages/RunPage.test.tsx
src/cards/passiveLibrary.test.ts
```

## Task 1: Card Domain And Library

**Files:**
- Create: `src/cards/cardTypes.ts`
- Create: `src/cards/cardLibrary.ts`
- Test: `src/cards/cardLibrary.test.ts`

- [ ] **Step 1: Write failing card library test**

Test that the library contains at least:

- 18 cards;
- card categories: base, percurso, condicao, combinacao, complexidade, modificador;
- required ids: `caso-base-nulo`, `retornar-zero`, `visitar-esquerda`, `visitar-direita`, `eh-folha`, `somar-retornos`, `complexidade-on`, `aplicar-hash`, `consultar-reserva`, `avancar-caractere`, `fim-da-palavra`.

Run:

```powershell
npm.cmd run test -- src/cards/cardLibrary.test.ts
```

Expected: fail because files do not exist.

- [ ] **Step 2: Implement card types**

Define:

```ts
export type CardCategory =
  | "base"
  | "percurso"
  | "condicao"
  | "combinacao"
  | "complexidade"
  | "modificador";

export type AedsCard = {
  id: string;
  name: string;
  category: CardCategory;
  structureTags: ("abb" | "avl" | "alvinegra" | "hash" | "trie")[];
  concept: string;
  code: string;
  energyCost: number;
  rarity: "comum" | "incomum" | "rara";
};
```

- [ ] **Step 3: Implement card library**

Create `cardLibrary` and `cardById`. Include concept text and Java-like code/pseudocode for every card.

- [ ] **Step 4: Verify**

Run:

```powershell
npm.cmd run test -- src/cards/cardLibrary.test.ts
npm.cmd run build
npm.cmd run lint
```

Expected: pass.

## Task 2: Combos And Scoring

**Files:**
- Create: `src/cards/cardCombos.ts`
- Create: `src/roguelike/scoring.ts`
- Test: `src/cards/cardCombos.test.ts`
- Test: `src/roguelike/scoring.test.ts`

- [ ] **Step 1: Write failing combo/scoring tests**

Tests:

- `Travessia Completa` activates for case base + left + right + sum.
- `Caminho De ABB` activates for equal + smaller-left + greater-right.
- `Busca Em TRIE` activates for advance character + end word.
- correct required sequence scores more than incomplete sequence.
- complexity card doubles or boosts score when required.

- [ ] **Step 2: Implement combos**

Define combo metadata:

```ts
export type CardCombo = {
  id: string;
  name: string;
  requiredCardIds: string[];
  multiplier: number;
  explanation: string;
};
```

- [ ] **Step 3: Implement scoring**

Pure function:

```ts
scorePlayedCards({
  playedCardIds,
  requiredCardIds,
  complexityCardId,
  bossRequiresComplexity
})
```

Return score, missing cards, active combos, correct boolean, and feedback.

- [ ] **Step 4: Verify**

Run:

```powershell
npm.cmd run test -- src/cards src/roguelike/scoring.test.ts
npm.cmd run build
npm.cmd run lint
```

Expected: pass.

## Task 3: Encounter Factory

**Files:**
- Modify: `src/challenges/challengeBank.ts`
- Create: `src/roguelike/encounterFactory.ts`
- Test: `src/roguelike/encounterFactory.test.ts`

- [ ] **Step 1: Write failing encounter tests**

Tests:

- creates at least 10 encounters from `challengeBank`;
- every encounter has required card ids;
- every encounter references an existing challenge;
- boss encounter has special rule `requiresComplexity`;
- structures include abb, avl, alvinegra, hash, trie.
- every `requiredCardIds` and `rewardCardIds` entry resolves to a real card in `cardById`.

- [ ] **Step 2: Add card requirements to challenges or mapping**

Prefer a separate mapping in `encounterFactory.ts` to avoid overloading educational challenge data.

Example:

```ts
const challengeCardRequirements = {
  "abb-contar-folhas-01": [
    "caso-base-nulo",
    "eh-folha",
    "visitar-esquerda",
    "visitar-direita",
    "somar-retornos",
    "complexidade-on"
  ]
};
```

- [ ] **Step 3: Implement encounter creation**

Define:

```ts
export type Encounter = {
  id: string;
  act: number;
  kind: "normal" | "elite" | "shop" | "rest" | "boss";
  challengeId?: string;
  requiredCardIds: string[];
  rewardCardIds: string[];
  specialRule?: "requiresComplexity" | "lowEnergy" | "noHint";
};
```

- [ ] **Step 4: Verify**

Run:

```powershell
npm.cmd run test -- src/roguelike/encounterFactory.test.ts
npm.cmd run build
npm.cmd run lint
```

Expected: pass.

## Task 4: Passive Library

**Files:**
- Create: `src/cards/passiveLibrary.ts`
- Test: `src/cards/passiveLibrary.test.ts`

- [ ] **Step 1: Write failing passive library tests**

Tests:

- library contains at least 5 passives;
- required ids exist: `mestre-recursao`, `olho-abb`, `domador-trie`, `sem-colisao`, `complexidade-perfeita`;
- passives expose an effect kind that the run/scoring engine can apply.

Run:

```powershell
npm.cmd run test -- src/cards/passiveLibrary.test.ts
```

Expected: fail because passive library does not exist.

- [ ] **Step 2: Implement passive types and library**

Define:

```ts
export type PassiveEffectKind =
  | "scoreBonus"
  | "energyDiscount"
  | "scoreMultiplier"
  | "preventFocusLoss"
  | "extraReward";

export type Passive = {
  id: string;
  name: string;
  description: string;
  effect: PassiveEffectKind;
  structureTag?: "abb" | "avl" | "alvinegra" | "hash" | "trie";
  value: number;
};
```

Implement at least:

- `mestre-recursao`
- `olho-abb`
- `domador-trie`
- `sem-colisao`
- `complexidade-perfeita`
- `professor-inventou`

- [ ] **Step 3: Verify**

Run:

```powershell
npm.cmd run test -- src/cards/passiveLibrary.test.ts
npm.cmd run build
npm.cmd run lint
```

Expected: pass.

## Task 5: Run State And Engine

**Files:**
- Create: `src/roguelike/runState.ts`
- Create: `src/roguelike/runEngine.ts`
- Test: `src/roguelike/runEngine.test.ts`

- [ ] **Step 1: Write failing run engine tests**

Tests:

- creates a new run with focus, energy, coins, deck, hand, encounter index;
- playing a card moves it from hand to played sequence and spends energy;
- resolving a correct encounter advances to reward state;
- resolving wrong sequence reduces focus;
- choosing reward adds card to deck and advances.
- choosing passive reward adds passive to run state;
- `sem-colisao` prevents the first hash focus loss;
- `olho-abb` can discount ABB path-card energy or is represented in scoring/run effect tests.

- [ ] **Step 2: Implement run state types**

Include:

```ts
export type RunPhase = "encounter" | "reward" | "shop" | "rest" | "victory" | "defeat";
```

Run state must include `passiveIds: string[]` and track one-use passive consumption where needed.

- [ ] **Step 3: Implement engine functions**

Pure functions:

- `createNewRun()`
- `playCard(state, cardId)`
- `clearPlayedCards(state)`
- `resolveEncounter(state)`
- `chooseReward(state, cardId)`
- `advanceEncounter(state)`

- [ ] **Step 4: Verify**

Run:

```powershell
npm.cmd run test -- src/roguelike/runEngine.test.ts
npm.cmd run build
npm.cmd run lint
```

Expected: pass.

## Task 6: Card Game UI Components

**Files:**
- Create: `src/components/CardView.tsx`
- Create: `src/components/HandPanel.tsx`
- Create: `src/components/PlayedSequence.tsx`
- Create: `src/components/EncounterPanel.tsx`
- Create: `src/components/RewardPanel.tsx`
- Test: `src/components/CardView.test.tsx`
- Test: `src/components/HandPanel.test.tsx`

- [ ] **Step 1: Write failing component tests**

Tests:

- Card renders name, category, energy, code snippet.
- HandPanel renders cards and calls `onPlayCard`.
- PlayedSequence renders ordered played cards.
- RewardPanel renders reward choices.
- EncounterPanel resolves `challenge.visualStateId` against `sampleVisualStates` and renders a structure-specific summary for tree/hash/trie.

- [ ] **Step 2: Implement `CardView`**

Functional card, not decorative-only. Include button semantics when clickable.

- [ ] **Step 3: Implement panels**

Keep components stateless. Props drive all behavior.

`EncounterPanel` must show:

- challenge title and statement;
- provided code;
- structure kind;
- a non-empty structure summary from `sampleVisualStates`, such as tree root, hash slot count, or trie root/children.

- [ ] **Step 4: Verify**

Run:

```powershell
npm.cmd run test -- src/components
npm.cmd run build
npm.cmd run lint
```

Expected: pass.

## Task 7: Run Page Integration

**Files:**
- Create: `src/pages/RunPage.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/app/App.css`
- Test: `src/pages/RunPage.test.tsx`
- Test: `src/app/App.test.tsx`

- [ ] **Step 1: Write failing RunPage test**

Assert:

- page shows focus, energy, coins, score;
- encounter statement appears;
- hand appears;
- played sequence area appears;
- resolve button changes feedback after playing cards.

- [ ] **Step 2: Implement `RunPage`**

Use `useState` with pure engine functions.

Screen zones:

- top status bar;
- left challenge/code panel;
- center encounter/structure placeholder;
- center encounter structure summary via `EncounterPanel`;
- right combos/rewards/status;
- bottom hand and played sequence.

- [ ] **Step 3: Make App open directly into RunPage**

Replace shell placeholder with the actual run.

- [ ] **Step 4: Verify**

Run:

```powershell
npm.cmd run test -- src/pages/RunPage.test.tsx src/app/App.test.tsx
npm.cmd run build
npm.cmd run lint
```

Expected: pass.

## Task 8: Rewards, Boss, Victory/Defeat Polish

**Files:**
- Modify: `src/roguelike/runEngine.ts`
- Modify: `src/pages/RunPage.tsx`
- Modify: `src/app/App.css`
- Test: `src/roguelike/runEngine.test.ts`
- Test: `src/pages/RunPage.test.tsx`

- [ ] **Step 1: Write failing tests**

Tests:

- boss requires complexity for full score;
- reaching end of final encounter sets victory;
- focus reaching zero sets defeat;
- reward choice adds card to deck.
- passive reward choice adds passive and shows it in UI.

- [ ] **Step 2: Implement boss special rule**

The first MVP boss is `Guardiao da Complexidade`.

- [ ] **Step 3: Implement victory/defeat screens**

Show final score, encounters cleared, and retry button.

- [ ] **Step 4: Verify**

Run:

```powershell
npm.cmd run test
npm.cmd run build
npm.cmd run lint
```

Expected: pass.

## Task 9: README And Final Verification

**Files:**
- Modify: `README.md`
- Modify as needed: `src/app/App.css`

- [ ] **Step 1: Write README**

Include:

- what the game is;
- commands;
- how cards map to code;
- how passives/coringas work;
- how to add a card;
- how to add an encounter;
- current MVP scope.

- [ ] **Step 2: Final verification**

Run:

```powershell
npm.cmd run test
npm.cmd run build
npm.cmd run lint
```

Expected: pass.

- [ ] **Step 3: Start dev server**

Run:

```powershell
npm.cmd run dev
```

Expected: Vite local URL.

- [ ] **Step 4: Browser smoke**

Verify manually:

- app opens directly into run;
- card hand is visible;
- playing cards creates sequence;
- correct sequence can clear an encounter;
- wrong sequence reduces focus;
- reward screen appears;
- final boss exists;
- victory/defeat state exists.

## Final Acceptance Checklist

- [ ] `npm.cmd run test` passes.
- [ ] `npm.cmd run build` passes.
- [ ] App opens directly into card roguelike run.
- [ ] Player can play cards from hand into sequence.
- [ ] Correct sequence clears an encounter.
- [ ] Wrong sequence reduces focus.
- [ ] At least 10 encounters exist.
- [ ] ABB, AVL, alvinegra, hash, and TRIE appear in encounters.
- [ ] At least 18 cards exist.
- [ ] At least 5 combos/passives exist.
- [ ] Boss has special complexity rule.
- [ ] Reward choice changes deck/run.
- [ ] Victory and defeat screens exist.
- [ ] README documents cards and encounters.
