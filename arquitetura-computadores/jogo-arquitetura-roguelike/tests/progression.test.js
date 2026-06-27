import { describe, it, eq, ok } from "./_assert.js";
import { applyRunResult, xpToLevel, unlocks } from "../src/meta/progression.js";

describe("progression");

it("registra resultado da run", () => {
  const m = applyRunResult({ xpTotal: 0, runs: 0, vitorias: 0, melhorCombo: 0 }, { xp: 120, maxCombo: 5 }, true);
  eq(m.runs, 1);
  eq(m.vitorias, 1);
  eq(m.xpTotal, 120);
  eq(m.melhorCombo, 5);
});

it("derrota não conta vitória mas acumula xp", () => {
  const m = applyRunResult({ xpTotal: 50, runs: 1, vitorias: 0, melhorCombo: 3 }, { xp: 40, maxCombo: 2 }, false);
  eq(m.vitorias, 0);
  eq(m.xpTotal, 90);
  eq(m.melhorCombo, 3);
});

it("xpToLevel sobe a cada 500", () => {
  eq(xpToLevel(0), 1);
  eq(xpToLevel(500), 2);
  eq(xpToLevel(1000), 3);
});

it("desbloqueios por marcos", () => {
  ok(unlocks({ vitorias: 1 }).includes("titulo_arquiteto"));
  ok(unlocks({ runs: 5 }).includes("veterano"));
});
