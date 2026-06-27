# AEDS II Educational Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first playable MVP of the AEDS II educational game: a guided challenge workbench with ABB/AVL/alvinegra/hash/TRIE challenges, structured correction, visualizations, local progress, an error notebook, and a short exam mode.

**Architecture:** Use a Vite + React + TypeScript single-page app with static challenge data and local state. Keep challenge content, evaluators, simulators, visualizers, and progression separate so new question types can be added without rewriting the workbench.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, SVG visualizers, CSS Modules or plain CSS, localStorage.

---

## Current Workspace Notes

- Project root: `D:\Projetos\Aeds 2`
- Current state: no `package.json`, no app scaffold, and not a Git repository.
- Existing design spec: `docs/superpowers/specs/2026-06-27-aeds-ii-educational-game-design.md`
- Temporary extracted PDFs exist under `tmp/pdfs/`; do not import them into the app.
- Browser companion files exist under `.superpowers/`; do not import them into the app.
- If Git is initialized later, add `.superpowers/`, `tmp/`, `node_modules/`, and `dist/` to `.gitignore` before committing.

## Planned File Structure

Create:

```text
package.json
index.html
vite.config.ts
tsconfig.json
tsconfig.node.json
.gitignore
README.md
src/
  main.tsx
  app/App.tsx
  app/App.css
  components/CodePanel.tsx
  components/StepActionPanel.tsx
  components/TopStatusBar.tsx
  challenges/challengeBank.ts
  challenges/examBank.ts
  evaluators/evaluateBlockOrder.ts
  evaluators/evaluateChoice.ts
  evaluators/evaluateComplexity.ts
  evaluators/evaluateGap.ts
  progression/errorNotebook.ts
  progression/progressStore.ts
  simulators/treeSimulation.ts
  structures/sampleStructures.ts
  types/challenge.ts
  types/structures.ts
  utils/storage.ts
  visualizers/HashVisualizer.tsx
  visualizers/TrieVisualizer.tsx
  visualizers/TreeVisualizer.tsx
  pages/WorkbenchPage.tsx
  pages/ExamPage.tsx
  pages/ErrorNotebookPage.tsx
src/**/*.test.ts
src/**/*.test.tsx
```

Responsibilities:

- `types/`: shared domain contracts only.
- `challenges/`: static challenge and exam data.
- `evaluators/`: pure functions for correcting choices, gaps, block order, and complexity.
- `structures/`: reusable sample structure data.
- `simulators/`: pure step generation for tree-style execution traces.
- `visualizers/`: display-only components for tree/hash/TRIE.
- `progression/`: localStorage persistence and mastery/error-notebook logic.
- `pages/`: app screens and screen-level state.
- `components/`: small reusable UI pieces.

## Implementation Tasks

### Task 1: Scaffold Vite React TypeScript App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `.gitignore`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/app/App.css`

- [ ] **Step 1: Create project metadata and scripts**

Create `package.json` with scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "tsc -b --noEmit"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "jsdom": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Configure Vite and TypeScript**

Set `vite.config.ts` to use React and Vitest `jsdom`.

Expected key config:

```ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: []
  }
});
```

- [ ] **Step 3: Create the React entry point**

`src/main.tsx` should render `<App />` into `#root`.

- [ ] **Step 4: Create a non-empty app shell**

`src/app/App.tsx` should render the workbench page placeholder with the product name and one visible "Bancada Guiada" area.

- [ ] **Step 5: Add initial CSS**

`src/app/App.css` should define a dense desktop layout, avoid landing-page styling, and keep cards to functional panels only.

- [ ] **Step 6: Install dependencies**

Run:

```powershell
npm.cmd install
```

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 7: Verify scaffold**

Run:

```powershell
npm.cmd run build
npm.cmd run test
```

Expected: build passes and Vitest reports no tests or passing tests.

- [ ] **Step 8: Commit if Git exists**

Run only if `git status` works:

```powershell
git add package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.node.json .gitignore src
git commit -m "chore: scaffold AEDS II game app"
```

### Task 2: Define Domain Types

**Files:**
- Create: `src/types/challenge.ts`
- Create: `src/types/structures.ts`
- Test: `src/types/challenge.test.ts`

- [ ] **Step 1: Write type shape smoke test**

Create `src/types/challenge.test.ts` with a compile-time style fixture:

```ts
import { describe, expect, it } from "vitest";
import type { Challenge } from "./challenge";

describe("Challenge type", () => {
  it("supports a guided challenge with multiple step kinds", () => {
    const challenge: Challenge = {
      id: "abb-contar-folhas-01",
      title: "Contar folhas",
      pattern: "percorrer-todos-os-nos",
      structure: "abb",
      difficulty: "facil",
      statement: "Implemente o metodo int contarFolhas().",
      providedCode: "class No { int elemento; No esq, dir; }",
      visualStateId: "abb-basica-01",
      steps: [],
      complexity: { answer: "O(n)", explanation: "Visita todos os nos." },
      commonMistakes: []
    };

    expect(challenge.structure).toBe("abb");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm.cmd run test -- src/types/challenge.test.ts
```

Expected: fail because `Challenge` does not exist.

- [ ] **Step 3: Implement `src/types/challenge.ts`**

Define:

```ts
export type StructureKind = "abb" | "avl" | "alvinegra" | "hash" | "trie";
export type ReasoningPattern =
  | "percorrer-todos-os-nos"
  | "seguir-um-caminho"
  | "retornar-de-baixo-para-cima"
  | "verificar-propriedade-global"
  | "navegar-por-camadas"
  | "analisar-complexidade";
export type Difficulty = "facil" | "medio" | "dificil";
export type ChallengeStepKind =
  | "interpretar"
  | "simular"
  | "lacuna"
  | "blocos"
  | "complexidade"
  | "revisao";
```

Add `Challenge`, `ChallengeStep`, `ChoiceOption`, `GapAnswer`, `BlockAnswer`, `ComplexityAnswer`, and `CommonMistake`.

- [ ] **Step 4: Implement `src/types/structures.ts`**

Define tree, hash, and trie visualization data:

```ts
export type TreeNodeView = {
  id: string;
  label: string;
  color?: "black" | "white";
  left?: TreeNodeView;
  right?: TreeNodeView;
};

export type HashSlotView = {
  index: number;
  value?: string;
  status?: "empty" | "occupied" | "collision" | "reserved";
};

export type TrieNodeView = {
  id: string;
  char: string;
  folha?: boolean;
  children?: TrieNodeView[];
};
```

- [ ] **Step 5: Run tests**

Run:

```powershell
npm.cmd run test -- src/types/challenge.test.ts
npm.cmd run build
```

Expected: pass.

- [ ] **Step 6: Commit if Git exists**

```powershell
git add src/types src/types/challenge.test.ts
git commit -m "feat: define challenge domain types"
```

### Task 3: Add Initial Challenge Bank

**Files:**
- Create: `src/structures/sampleStructures.ts`
- Create: `src/challenges/challengeBank.ts`
- Test: `src/challenges/challengeBank.test.ts`

- [ ] **Step 1: Write challenge bank tests**

Test requirements:

```ts
import { describe, expect, it } from "vitest";
import { challengeBank } from "./challengeBank";

describe("challengeBank", () => {
  it("contains two challenges for each MVP structure", () => {
    const structures = ["abb", "avl", "alvinegra", "hash", "trie"];

    for (const structure of structures) {
      const count = challengeBank.filter((challenge) => challenge.structure === structure).length;
      expect(count).toBeGreaterThanOrEqual(2);
    }
  });

  it("contains at least one transfer sequence marker", () => {
    expect(challengeBank.some((challenge) => challenge.transferGroupId === "contagem-transferencia-01")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm.cmd run test -- src/challenges/challengeBank.test.ts
```

Expected: fail because challenge bank does not exist.

- [ ] **Step 3: Add sample structures**

Create sample data for:

- `abb-basica-01`
- `avl-rotacao-01`
- `alvinegra-brancos-01`
- `hash-reserva-01`
- `trie-stop-sapo-01`

Keep samples small enough for desktop display without clutter.

- [ ] **Step 4: Add 10 rich challenges**

Create at least:

- `abb-pesquisar-01`
- `abb-contar-folhas-01`
- `avl-fator-01`
- `avl-verificar-balanceamento-01`
- `alvinegra-contar-brancos-01`
- `alvinegra-tipo-quatro-01`
- `hash-pesquisar-reserva-01`
- `hash-rehash-colisao-01`
- `trie-pesquisar-palavra-01`
- `trie-verificar-prefixo-01`

Each challenge must include:

- statement in professor-style Portuguese;
- provided Java-like classes;
- at least four steps;
- complexity answer;
- common mistakes.

- [ ] **Step 5: Run tests**

Run:

```powershell
npm.cmd run test -- src/challenges/challengeBank.test.ts
npm.cmd run build
```

Expected: pass.

- [ ] **Step 6: Commit if Git exists**

```powershell
git add src/challenges src/structures
git commit -m "feat: add initial AEDS challenge bank"
```

### Task 4: Implement Evaluators

**Files:**
- Create: `src/evaluators/evaluateChoice.ts`
- Create: `src/evaluators/evaluateGap.ts`
- Create: `src/evaluators/evaluateBlockOrder.ts`
- Create: `src/evaluators/evaluateComplexity.ts`
- Test: `src/evaluators/*.test.ts`

- [ ] **Step 1: Write evaluator tests**

Create tests covering:

- correct choice id passes;
- wrong choice returns mistake id;
- gap accepts equivalent strings such as `return 0;` and `resp = false;`;
- block order must match expected order;
- complexity accepts exact configured option only.

Example:

```ts
expect(evaluateGap("return false;", ["return false;", "resp = false;"])).toEqual({
  correct: true
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npm.cmd run test -- src/evaluators
```

Expected: fail because evaluator modules do not exist.

- [ ] **Step 3: Implement shared evaluation result**

Use a result shape:

```ts
export type EvaluationResult = {
  correct: boolean;
  mistakeId?: string;
  message?: string;
};
```

This can live in `src/types/challenge.ts` unless duplication appears.

- [ ] **Step 4: Implement choice and complexity evaluators**

Pure functions only. No React, no localStorage.

- [ ] **Step 5: Implement gap evaluator**

Normalize whitespace and semicolon differences conservatively. Do not parse Java.

- [ ] **Step 6: Implement block order evaluator**

Compare ordered block ids, not block text.

- [ ] **Step 7: Run tests and build**

Run:

```powershell
npm.cmd run test -- src/evaluators
npm.cmd run build
```

Expected: pass.

- [ ] **Step 8: Commit if Git exists**

```powershell
git add src/evaluators src/types
git commit -m "feat: add structured challenge evaluators"
```

### Task 5: Implement Tree Simulator and Tree Visualizer

**Files:**
- Create: `src/simulators/treeSimulation.ts`
- Create: `src/visualizers/TreeVisualizer.tsx`
- Test: `src/simulators/treeSimulation.test.ts`
- Test: `src/visualizers/TreeVisualizer.test.tsx`

- [ ] **Step 1: Write simulator tests**

Test that ABB search over a sample tree yields ordered steps:

```ts
expect(steps.map((step) => step.nodeId)).toEqual(["n8", "n4", "n6"]);
expect(steps.at(-1)?.result).toBe("encontrado");
```

- [ ] **Step 2: Write visualizer render test**

Render a small tree and assert visible labels:

```ts
render(<TreeVisualizer root={tree} activeNodeId="n4" visitedNodeIds={["n8"]} />);
expect(screen.getByText("8")).toBeInTheDocument();
expect(screen.getByText("4")).toBeInTheDocument();
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```powershell
npm.cmd run test -- src/simulators/treeSimulation.test.ts src/visualizers/TreeVisualizer.test.tsx
```

Expected: fail because modules do not exist.

- [ ] **Step 4: Implement tree simulation**

Support:

- search path by comparing numeric labels;
- full traversal step generation for count/height style challenges;
- step labels: comparison, branch, result.

- [ ] **Step 5: Implement SVG tree visualizer**

Render:

- nodes;
- edges;
- active node;
- visited nodes;
- alvinegra white/black coloring.

Use stable `viewBox` and fixed node sizing.

- [ ] **Step 6: Run tests and build**

Run:

```powershell
npm.cmd run test -- src/simulators src/visualizers/TreeVisualizer.test.tsx
npm.cmd run build
```

Expected: pass.

- [ ] **Step 7: Commit if Git exists**

```powershell
git add src/simulators src/visualizers
git commit -m "feat: add tree simulation and visualization"
```

### Task 6: Build the Guided Workbench Page

**Files:**
- Create: `src/pages/WorkbenchPage.tsx`
- Create: `src/components/TopStatusBar.tsx`
- Create: `src/components/CodePanel.tsx`
- Create: `src/components/StepActionPanel.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/app/App.css`
- Test: `src/pages/WorkbenchPage.test.tsx`

- [ ] **Step 1: Write workbench render test**

Assert that the first challenge renders:

```ts
expect(screen.getByText(/Bancada Guiada/i)).toBeInTheDocument();
expect(screen.getByText(/Enunciado/i)).toBeInTheDocument();
expect(screen.getByText(/Complexidade/i)).toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm.cmd run test -- src/pages/WorkbenchPage.test.tsx
```

Expected: fail because the page does not exist.

- [ ] **Step 3: Implement `TopStatusBar`**

Show current pattern, structure, difficulty, step index, and challenge selector.

- [ ] **Step 4: Implement `CodePanel`**

Show:

- statement;
- provided code;
- starter code if present.

Use `<pre><code>` and keep text readable.

- [ ] **Step 5: Implement `StepActionPanel`**

Support step kinds:

- `interpretar`: choice buttons;
- `simular`: choice buttons;
- `lacuna`: input or selectable chips;
- `blocos`: up/down reorder buttons;
- `complexidade`: choice buttons;
- `revisao`: solution summary.

- [ ] **Step 6: Implement page state machine**

State:

- selected challenge id;
- current step index;
- current answer draft;
- feedback;
- visited node ids for visualizer.

- [ ] **Step 7: Wire evaluator calls**

On confirm:

- call the correct evaluator;
- show immediate feedback;
- advance on correct answer;
- record mistake on wrong answer in later task.

- [ ] **Step 8: Run tests and build**

Run:

```powershell
npm.cmd run test -- src/pages/WorkbenchPage.test.tsx
npm.cmd run build
```

Expected: pass.

- [ ] **Step 9: Commit if Git exists**

```powershell
git add src/pages src/components src/app
git commit -m "feat: build guided challenge workbench"
```

### Task 7: Add Hash and TRIE Visualizers

**Files:**
- Create: `src/visualizers/HashVisualizer.tsx`
- Create: `src/visualizers/TrieVisualizer.tsx`
- Modify: `src/pages/WorkbenchPage.tsx`
- Test: `src/visualizers/HashVisualizer.test.tsx`
- Test: `src/visualizers/TrieVisualizer.test.tsx`

- [ ] **Step 1: Write visualizer tests**

Hash test:

```ts
expect(screen.getByText("0")).toBeInTheDocument();
expect(screen.getByText("21")).toBeInTheDocument();
```

TRIE test:

```ts
expect(screen.getByText("S")).toBeInTheDocument();
expect(screen.getByText("fim")).toBeInTheDocument();
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npm.cmd run test -- src/visualizers/HashVisualizer.test.tsx src/visualizers/TrieVisualizer.test.tsx
```

Expected: fail because modules do not exist.

- [ ] **Step 3: Implement `HashVisualizer`**

Render a table-like view:

- index column;
- value column;
- reserve/collision status;
- active slot highlight.

- [ ] **Step 4: Implement `TrieVisualizer`**

Render a compact SVG/tree:

- character nodes;
- edges;
- `folha` marker as `fim`;
- active character/path highlight.

- [ ] **Step 5: Wire structure selection in Workbench**

In `WorkbenchPage`, render:

- `TreeVisualizer` for `abb`, `avl`, `alvinegra`;
- `HashVisualizer` for `hash`;
- `TrieVisualizer` for `trie`.

- [ ] **Step 6: Run tests and build**

Run:

```powershell
npm.cmd run test -- src/visualizers src/pages/WorkbenchPage.test.tsx
npm.cmd run build
```

Expected: pass.

- [ ] **Step 7: Commit if Git exists**

```powershell
git add src/visualizers src/pages
git commit -m "feat: visualize hash and trie challenges"
```

### Task 8: Add Progress and Error Notebook

**Files:**
- Create: `src/utils/storage.ts`
- Create: `src/progression/progressStore.ts`
- Create: `src/progression/errorNotebook.ts`
- Create: `src/pages/ErrorNotebookPage.tsx`
- Modify: `src/pages/WorkbenchPage.tsx`
- Modify: `src/app/App.tsx`
- Test: `src/progression/progressStore.test.ts`
- Test: `src/progression/errorNotebook.test.ts`

- [ ] **Step 1: Write storage tests**

Use localStorage in jsdom. Test:

- a wrong answer creates an error entry;
- a correct step increments challenge progress;
- progress survives reload by reading from storage.

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npm.cmd run test -- src/progression
```

Expected: fail because modules do not exist.

- [ ] **Step 3: Implement safe storage helpers**

`src/utils/storage.ts` should handle missing/corrupt values:

```ts
export function readJson<T>(key: string, fallback: T): T;
export function writeJson<T>(key: string, value: T): void;
```

- [ ] **Step 4: Implement progress store**

Track:

- completed steps by challenge id;
- mastery status by pattern and structure;
- total XP/stars.

- [ ] **Step 5: Implement error notebook**

Track:

- challenge id;
- structure;
- pattern;
- step kind;
- selected answer;
- mistake id;
- timestamp;
- review status.

- [ ] **Step 6: Wire wrong-answer recording**

On wrong answer in `WorkbenchPage`, call error notebook append.

- [ ] **Step 7: Add error notebook page**

Simple page/list with filters by structure and pattern.

- [ ] **Step 8: Add simple navigation**

In `App.tsx`, add tabs/buttons:

- Bancada;
- Simulado;
- Caderno de erros.

- [ ] **Step 9: Run tests and build**

Run:

```powershell
npm.cmd run test -- src/progression src/pages
npm.cmd run build
```

Expected: pass.

- [ ] **Step 10: Commit if Git exists**

```powershell
git add src/utils src/progression src/pages src/app
git commit -m "feat: add progress and error notebook"
```

### Task 9: Add Short Exam Mode

**Files:**
- Create: `src/challenges/examBank.ts`
- Create: `src/pages/ExamPage.tsx`
- Modify: `src/app/App.tsx`
- Test: `src/challenges/examBank.test.ts`
- Test: `src/pages/ExamPage.test.tsx`

- [ ] **Step 1: Write exam bank test**

Assert:

- exam has at least 5 questions;
- every question references an existing challenge or has standalone prompt data;
- every question has a complexity prompt.

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm.cmd run test -- src/challenges/examBank.test.ts
```

Expected: fail because exam bank does not exist.

- [ ] **Step 3: Implement exam bank**

Create one short exam with:

- ABB count/search;
- AVL factor;
- alvinegra color/count;
- hash reserve search;
- TRIE prefix.

- [ ] **Step 4: Write exam page render test**

Assert exam page shows:

- "Simulado";
- question count;
- finish button;
- result summary after finishing.

- [ ] **Step 5: Implement `ExamPage`**

Keep MVP simple:

- no timer required;
- one question at a time;
- structured answer options;
- final score by structure and pattern.

- [ ] **Step 6: Wire navigation**

`App.tsx` should make Exam page reachable.

- [ ] **Step 7: Run tests and build**

Run:

```powershell
npm.cmd run test -- src/challenges/examBank.test.ts src/pages/ExamPage.test.tsx
npm.cmd run build
```

Expected: pass.

- [ ] **Step 8: Commit if Git exists**

```powershell
git add src/challenges src/pages src/app
git commit -m "feat: add short exam mode"
```

### Task 10: Polish UI, README, and Final Verification

**Files:**
- Modify: `README.md`
- Modify: `src/app/App.css`
- Modify as needed: `src/pages/*.tsx`
- Modify as needed: `src/components/*.tsx`

- [ ] **Step 1: Add README**

README must include:

- project purpose;
- commands:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run test
npm.cmd run build
```

- how to add a challenge;
- how the evaluator system works;
- what is inside and outside the MVP.

- [ ] **Step 2: Polish dense desktop layout**

Check:

- no landing page;
- no empty screen;
- no text overlap;
- code blocks readable;
- buttons do not resize layout;
- visualizers have stable dimensions.

- [ ] **Step 3: Add missing accessible labels**

Buttons need clear text or `aria-label`. Tabs need selected state.

- [ ] **Step 4: Run full verification**

Run:

```powershell
npm.cmd run test
npm.cmd run build
```

Expected: all tests pass and production build succeeds.

- [ ] **Step 5: Start dev server for manual review**

Run:

```powershell
npm.cmd run dev
```

Expected: Vite prints a local URL, usually `http://localhost:5173/`.

- [ ] **Step 6: Browser smoke test**

Open the local URL and verify:

- Bancada loads first;
- can answer at least one step correctly;
- wrong answer appears in caderno de erros;
- hash challenge renders;
- TRIE challenge renders;
- simulado finishes with score.

- [ ] **Step 7: Commit if Git exists**

```powershell
git add README.md src
git commit -m "docs: document AEDS II game MVP"
```

## Final Acceptance Checklist

- [ ] `npm.cmd install` succeeds.
- [ ] `npm.cmd run test` succeeds.
- [ ] `npm.cmd run build` succeeds.
- [ ] App opens directly into Bancada Guiada.
- [ ] ABB, AVL, alvinegra, hash, and TRIE each have at least two playable challenges.
- [ ] Lacuna, block order, choice, and complexity evaluators are covered by tests.
- [ ] Tree, hash, and TRIE visualizers render non-empty content.
- [ ] Wrong answers are saved to local error notebook.
- [ ] Short exam mode runs to a result screen.
- [ ] README explains how to run and how to add new challenges.

## Known Follow-Ups After MVP

- Add free-text solution writing with checklist-based review.
- Add PATRICIA challenges.
- Add richer "professor inventou isso agora" hybrid generators.
- Add drag-and-drop structure completion.
- Add animation for AVL rotations and alvinegra fragmentation.
