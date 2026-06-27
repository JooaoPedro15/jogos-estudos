import { describe, it, eq, ok } from "./_assert.js";
import { resolveAnswer } from "../src/core/answer.js";

describe("answer");

it("single-choice", () => {
  eq(resolveAnswer({ tipo: "single-choice", resposta: "b" }, "b").outcome, "correct");
  eq(resolveAnswer({ tipo: "single-choice", resposta: "b" }, "a").outcome, "wrong");
});

it("numeric base 10 com tolerância", () => {
  eq(resolveAnswer({ tipo: "numeric", resposta: { valor: 3.57, base: 10, tolerancia: 0.06 } }, "3.6").outcome, "correct");
  eq(resolveAnswer({ tipo: "numeric", resposta: { valor: 12, base: 10, tolerancia: 0 } }, "11").outcome, "wrong");
});

it("numeric em base 2", () => {
  eq(resolveAnswer({ tipo: "numeric", resposta: { valor: 1984, base: 2, tolerancia: 0 } }, "11111000000").outcome, "correct");
});

it("toggle-signals exige acerto total", () => {
  eq(resolveAnswer({ tipo: "toggle-signals", resposta: { A: true, B: false } }, { A: true, B: false }).outcome, "correct");
  ok(resolveAnswer({ tipo: "toggle-signals", resposta: { A: true, B: false } }, { A: false, B: false }).outcome !== "correct");
});

it("order-blocks", () => {
  eq(resolveAnswer({ tipo: "order-blocks", resposta: ["x", "y", "z"] }, ["x", "y", "z"]).outcome, "correct");
  eq(resolveAnswer({ tipo: "order-blocks", resposta: ["x", "y", "z"] }, ["y", "x", "z"]).outcome, "partial");
});

it("multi-select parcial", () => {
  eq(resolveAnswer({ tipo: "multi-select", resposta: ["a", "b"] }, ["a", "b"]).outcome, "correct");
  eq(resolveAnswer({ tipo: "multi-select", resposta: ["a", "b"] }, ["a"]).outcome, "partial");
});
