import { describe, it, ok } from "./_assert.js";
import { loadContent } from "../src/content/registry.js";
import { validateChallenge } from "../src/content/validate.js";
import { fonteKeys } from "../src/content/fontes.js";

describe("validate");

it("TODO o conteúdo do jogo é válido", () => {
  const { report } = loadContent("prod");
  ok(
    report.validCount === report.total,
    `${report.validCount}/${report.total} válidos. erros: ${JSON.stringify(report.errors.slice(0, 4))}`
  );
  ok(report.total >= 30, "esperado >= 30 desafios, há " + report.total);
});

it("rejeita desafio incompleto", () => {
  const reg = { fontes: fonteKeys(), ids: new Set() };
  const r = validateChallenge({ id: "x", tipo: "single-choice" }, reg);
  ok(!r.valid);
  ok(r.errors.some((e) => e.code === "MISSING_FIELD"));
});

it("rejeita resposta fora das opções", () => {
  const reg = { fontes: fonteKeys(), ids: new Set() };
  const bad = {
    id: "y",
    topico: "T",
    subtopico: "S",
    dificuldade: 2,
    tipo: "single-choice",
    enunciado: "?",
    opcoes: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
    resposta: "z",
    explicacao: "explicação suficiente",
    fonte: { material: "lista3" },
    tempoEstimado: 30,
  };
  const r = validateChallenge(bad, reg);
  ok(!r.valid && r.errors.some((e) => e.code === "ANSWER_MISMATCH"));
});

it("rejeita dificuldade fora de 1..5", () => {
  const reg = { fontes: fonteKeys(), ids: new Set() };
  const r = validateChallenge(
    { id: "z", topico: "T", subtopico: "S", dificuldade: 9, tipo: "numeric", enunciado: "?", resposta: { valor: 1, base: 10 }, explicacao: "explicação longa o suficiente", fonte: { material: "lista3" }, tempoEstimado: 30 },
    reg
  );
  ok(r.errors.some((e) => e.code === "BAD_DIFFICULTY"));
});
