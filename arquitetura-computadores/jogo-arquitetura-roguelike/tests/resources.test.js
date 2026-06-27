import { describe, it, eq, ok } from "./_assert.js";
import * as R from "../src/core/resources.js";

describe("resources");
const base = { integridade: 3, integridadeMax: 5, orcamento: 2, foco: 1, calor: 0 };

it("dano não fica negativo", () => {
  eq(R.damage(base, 10).integridade, 0);
});
it("cura respeita o máximo", () => {
  eq(R.heal({ ...base, integridade: 4 }, 10).integridade, 5);
});
it("spend falha se insuficiente e não altera", () => {
  const r = R.spend(base, "orcamento", 5);
  ok(!r.ok);
  eq(r.state.orcamento, 2);
});
it("spend desconta quando há saldo", () => {
  const r = R.spend(base, "orcamento", 2);
  ok(r.ok);
  eq(r.state.orcamento, 0);
});
it("é imutável", () => {
  R.damage(base, 2);
  R.heal(base, 2);
  eq(base.integridade, 3);
});
it("calor marca overheated no máximo", () => {
  const r = R.addCalor({ ...base, calor: 5 }, 2, 6);
  ok(r.overheated && r.calor >= 6);
});
