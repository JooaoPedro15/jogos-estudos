import { describe, it, eq, ok } from "./_assert.js";
import { makeRng, hashSeed } from "../src/core/rng.js";

describe("rng");

it("é determinístico para a mesma seed", () => {
  ok(makeRng(123).next() === makeRng(123).next());
  eq(makeRng("s").shuffle([1, 2, 3, 4, 5]), makeRng("s").shuffle([1, 2, 3, 4, 5]));
});

it("seeds diferentes divergem", () => {
  ok(makeRng(1).next() !== makeRng(2).next());
});

it("int respeita a faixa", () => {
  const r = makeRng(5);
  for (let i = 0; i < 2000; i++) {
    const v = r.int(1, 6);
    ok(v >= 1 && v <= 6, "fora da faixa: " + v);
  }
});

it("hashSeed é estável", () => {
  ok(hashSeed("2026-06-27") === hashSeed("2026-06-27"));
});

it("fork é reprodutível", () => {
  ok(makeRng(9).fork("x").next() === makeRng(9).fork("x").next());
});
