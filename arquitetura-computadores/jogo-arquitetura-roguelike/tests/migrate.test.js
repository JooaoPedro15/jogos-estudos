import { describe, it, eq, ok } from "./_assert.js";
import { migrate, sanitize, newSave, CURRENT_VERSION } from "../src/persistence/migrate.js";

describe("migrate");

it("entrada inválida vira save novo (não lança)", () => {
  eq(migrate(null).version, CURRENT_VERSION);
  eq(migrate("lixo").meta.xpTotal, 0);
  eq(migrate(42).meta.runs, 0);
});

it("preserva meta válida", () => {
  const s = newSave();
  s.meta.xpTotal = 100;
  s.meta.vitorias = 2;
  const out = sanitize(s);
  eq(out.meta.xpTotal, 100);
  eq(out.meta.vitorias, 2);
});

it("descarta run implausível", () => {
  eq(sanitize({ meta: {}, run: { seed: "x" } }).run, null);
});

it("mantém run plausível", () => {
  const run = { seed: "abc", map: { nodes: [] }, integridade: 3 };
  ok(sanitize({ meta: {}, run }).run !== null);
});

it("versão futura é normalizada sem corromper meta", () => {
  const fut = { version: 99, meta: { xpTotal: 7 }, run: null };
  const out = migrate(fut);
  eq(out.version, CURRENT_VERSION);
  eq(out.meta.xpTotal, 7);
});

it("clampa números negativos", () => {
  eq(sanitize({ meta: { xpTotal: -50 } }).meta.xpTotal, 0);
});
