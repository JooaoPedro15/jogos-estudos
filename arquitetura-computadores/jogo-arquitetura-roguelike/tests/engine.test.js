import { describe, it, ok, eq } from "./_assert.js";
import { loadContent } from "../src/content/registry.js";
import { CONFIG } from "../src/config.js";
import * as E from "../src/core/engine.js";

describe("engine");
const { pool } = loadContent("prod");

// Constrói a resposta correta para qualquer tipo de desafio.
function correctAnswer(c) {
  switch (c.tipo) {
    case "single-choice":
      return c.resposta;
    case "fix-bug":
      return c.resposta.linha;
    case "multi-select":
    case "order-blocks":
      return c.resposta;
    case "toggle-signals":
      return c.resposta;
    case "numeric":
    case "predict-output": {
      const base = c.resposta.base || 10;
      return base === 10 ? String(c.resposta.valor) : c.resposta.valor.toString(base);
    }
    default:
      return null;
  }
}
const byId = (id) => pool.find((c) => c.id === id);

it("inicia uma run com recursos e mapa válidos", () => {
  const { run } = E.createRun({ seed: "t1", arquetipoId: "otimizador", pool, cfg: CONFIG });
  ok(run.integridade > 0);
  ok(run.map.nodes.length > 3);
  ok(run.relics.length >= 1);
  eq(run.status, "andamento");
});

it("acerto aumenta xp e combo", () => {
  let { run } = E.createRun({ seed: "t2", arquetipoId: "otimizador", pool, cfg: CONFIG });
  const c = byId("isa.zero.001");
  const out = E.resolveChallenge(run, c, { userAnswer: correctAnswer(c), usedHelp: false, timeMs: 20000 });
  ok(out.result.outcome === "correct");
  ok(out.run.xp > 0);
  eq(out.run.combo, 1);
});

it("erros seguidos levam à derrota", () => {
  let { run } = E.createRun({ seed: "t3", arquetipoId: "overclocker", pool, cfg: CONFIG });
  const c = byId("isa.zero.001"); // single-choice, resposta 'a'
  let r = run;
  for (let i = 0; i < 12 && r.status === "andamento"; i++) {
    const out = E.resolveChallenge(r, c, { userAnswer: "d", usedHelp: false, timeMs: 5000 });
    r = out.run;
  }
  ok(r.integridade <= 0, "integridade deveria zerar");
  eq(r.status, "derrota");
});

it("limpar o boss vence a run", () => {
  let { run } = E.createRun({ seed: "t4", arquetipoId: "pipeliner", pool, cfg: CONFIG });
  run = E.enterNode(run, run.map.boss, pool);
  ok(run.encounter && run.encounter.isBoss);
  let r = run;
  const fila = r.encounter.fila.slice();
  for (const cid of fila) {
    const c = byId(cid);
    const out = E.resolveChallenge(r, c, { userAnswer: correctAnswer(c), usedHelp: false, timeMs: 20000 });
    r = out.run;
  }
  ok(r.encounter.cleared, "boss deveria estar limpo");
  r = E.finishEncounter(r, pool);
  eq(r.status, "vitoria");
});

it("gera relatório de run com precisão", () => {
  let { run } = E.createRun({ seed: "t5", arquetipoId: "otimizador", pool, cfg: CONFIG });
  const c = byId("isa.zero.001");
  const out = E.resolveChallenge(run, c, { userAnswer: correctAnswer(c), usedHelp: false, timeMs: 20000 });
  const rep = E.runReport(out.run, pool);
  ok(rep.total === 1 && rep.correct === 1);
  ok(rep.accuracy === 1);
});
