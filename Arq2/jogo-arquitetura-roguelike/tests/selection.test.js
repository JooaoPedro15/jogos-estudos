import { describe, it, ok } from "./_assert.js";
import { createMasteryState } from "../src/adaptive/mastery.js";
import { selectNext } from "../src/adaptive/selection.js";
import { makeRng } from "../src/core/rng.js";
import { CONFIG } from "../src/config.js";

describe("selection");
const cfg = CONFIG.adaptive;

function stateForte() {
  const st = createMasteryState(0.2);
  st.subtopics.SA = { topico: "T", seen: 5, correct: 5, wrong: 0, partial: 0, avgTimeMs: 1000, lastSeenTurn: 0, lastSeenTs: 0, mastery: 0.95, streak: 5, difficultyCeiling: 5 };
  st.subtopics.SB = { topico: "T", seen: 1, correct: 0, wrong: 1, partial: 0, avgTimeMs: 1000, lastSeenTurn: 0, lastSeenTs: 0, mastery: 0.1, streak: 0, difficultyCeiling: 1 };
  st.globalTurn = 10;
  return st;
}
const pool = [
  { id: "a1", subtopico: "SA", topico: "T", dificuldade: 3 },
  { id: "b1", subtopico: "SB", topico: "T", dificuldade: 3 },
];

it("ressurge mais o tópico fraco", () => {
  const st = stateForte();
  let weak = 0;
  for (let i = 0; i < 600; i++) {
    const c = selectNext(st, pool, makeRng(i + 1), cfg);
    if (c.id === "b1") weak++;
  }
  ok(weak > 300, `fraco escolhido ${weak}/600 (esperado > 50%)`);
});

it("não repete o item recém-visto (cooldown)", () => {
  const st = createMasteryState(0.2);
  st.history = [{ id: "a1", subtopico: "SA", turn: 0, correct: true }];
  st.globalTurn = 1;
  const c = selectNext(st, pool, makeRng(3), cfg);
  ok(c.id === "b1", "deveria evitar o recém-visto a1");
});

it("nunca retorna null com pool não-vazio", () => {
  const st = createMasteryState(0.2);
  ok(selectNext(st, pool, makeRng(1), cfg) !== null);
});

it("respeita filtro de tópico", () => {
  const st = createMasteryState(0.2);
  const p2 = [...pool, { id: "c1", subtopico: "SC", topico: "Outro", dificuldade: 2 }];
  const c = selectNext(st, p2, makeRng(2), cfg, "Outro");
  ok(c.topico === "Outro");
});
