import { describe, it, ok } from "./_assert.js";
import { createMasteryState, updateMastery } from "../src/adaptive/mastery.js";
import { CONFIG } from "../src/config.js";

describe("mastery");
const cfg = CONFIG.adaptive;
const upd = (st, outcome, difficulty = 3, timeMs = 30000) =>
  updateMastery(st, { subtopico: "S", topico: "T", outcome, difficulty, timeMs, tempoEstimado: 60, nowTs: 0, cfg });

it("acerto sobe o mastery", () => {
  let st = createMasteryState(0.2);
  st = upd(st, "correct");
  ok(st.subtopics.S.mastery > 0.2);
});

it("erro derruba o mastery", () => {
  let st = createMasteryState(0.2);
  st.subtopics.S = { topico: "T", seen: 1, correct: 1, wrong: 0, partial: 0, avgTimeMs: 1000, lastSeenTurn: 0, lastSeenTs: 0, mastery: 0.8, streak: 1, difficultyCeiling: 3 };
  st = upd(st, "wrong");
  ok(st.subtopics.S.mastery < 0.8);
});

it("mastery fica sempre em [0,1]", () => {
  let st = createMasteryState(0.2);
  for (let i = 0; i < 30; i++) st = upd(st, "correct", 5);
  ok(st.subtopics.S.mastery <= 1 && st.subtopics.S.mastery > 0.9);
  for (let i = 0; i < 30; i++) st = upd(st, "wrong", 1);
  ok(st.subtopics.S.mastery >= 0 && st.subtopics.S.mastery < 0.2);
});

it("acertar difícil sobe mais que acertar fácil", () => {
  let a = upd(createMasteryState(0.2), "correct", 5);
  let b = upd(createMasteryState(0.2), "correct", 1);
  ok(a.subtopics.S.mastery > b.subtopics.S.mastery);
});

it("não muta o estado de entrada", () => {
  const st = createMasteryState(0.2);
  upd(st, "correct");
  ok(st.subtopics.S === undefined);
});
