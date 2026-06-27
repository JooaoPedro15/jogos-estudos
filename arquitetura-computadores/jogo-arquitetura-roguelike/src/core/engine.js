// engine.js — máquina de estados de uma run (puro; rng/nowTs injetados).
// Cobre: criação da run, navegação no mapa, combate (resolver desafio),
// defeitos/cicatrizes, recompensas, loja, descanso/revisão, boss e fim de run.

import { makeRng } from "./rng.js";
import { resolveAnswer } from "./answer.js";
import * as R from "./resources.js";
import { generateMap } from "../mapgen/mapgen.js";
import { createMasteryState, updateMastery, recordSeen, masteryOf } from "../adaptive/mastery.js";
import { selectNext } from "../adaptive/selection.js";
import { buildRunReport } from "../adaptive/report.js";
import { RELICS, RELICS_BY_ID, ARQUETIPOS_BY_ID, applyRelicEffects } from "../meta/relics.js";

const CUSTO_RELIC = { comum: 3, raro: 5 };

// ---- Criação da run ---------------------------------------------------------
export function createRun({ seed, arquetipoId, pool, cfg }) {
  const arq = ARQUETIPOS_BY_ID[arquetipoId] || ARQUETIPOS_BY_ID.otimizador;
  const rng = makeRng(seed);
  const map = generateMap(rng, { rows: cfg.run.salasPorAndar + cfg.run.andares - 1 });

  const run = {
    seed,
    rngCounter: 0,
    arquetipo: arq.id,
    integridade: cfg.run.integridadeInicial + (arq.bonus.integridade || 0),
    integridadeMax: cfg.run.integridadeInicial + (arq.bonus.integridade || 0),
    orcamento: cfg.run.orcamentoInicial + (arq.bonus.orcamento || 0),
    foco: cfg.run.focoInicial + (arq.bonus.foco || 0),
    calor: 0,
    overheated: false,
    combo: 0,
    maxCombo: 0,
    relics: [arq.relicInicial],
    map,
    currentNode: map.start,
    visited: [map.start],
    mastery: createMasteryState(cfg.adaptive.masteryInicial),
    runLog: [],
    defeitos: [],
    fase: "mapa",
    encounter: null, // { nodeId, tipo, fila:[challengeIds], idx, isBoss }
    pendingRewards: null,
    shopOffer: null,
    xp: 0,
    status: "andamento",
    _poolIds: pool.map((c) => c.id),
    _cfg: cfg,
  };
  return { run, pool };
}

// rng determinístico derivado da seed + contador (sobrevive a reload)
function nextRng(run) {
  run.rngCounter += 1;
  return makeRng(`${run.seed}:${run.rngCounter}`);
}

// ---- Navegação no mapa ------------------------------------------------------
export function nextNodes(run) {
  return run.map.edges.filter((e) => e.from === run.currentNode).map((e) => e.to);
}
export function nodeById(run, id) {
  return run.map.nodes.find((n) => n.id === id);
}

// Entra num nó escolhido: monta o encontro conforme o tipo.
export function enterNode(run, nodeId, pool) {
  const r = clone(run);
  const node = nodeById(r, nodeId);
  r.currentNode = nodeId;
  r.visited.push(nodeId);

  if (node.tipo === "descanso") {
    r.fase = "descanso";
    r.encounter = buildReviewEncounter(r, pool, node);
    return r;
  }
  if (node.tipo === "loja") {
    r.fase = "loja";
    r.shopOffer = buildShop(r);
    return r;
  }
  if (node.tipo === "boss") {
    r.fase = "boss";
    r.encounter = buildEncounter(r, pool, node, { isBoss: true, n: 5 });
    return r;
  }
  // desafio / elite
  const n = node.tipo === "elite" ? 2 : 1;
  r.fase = "desafio";
  r.encounter = buildEncounter(r, pool, node, { n, topico: node.topico });
  return r;
}

// Um encontro exige `objetivo` respostas CORRETAS para ser vencido.
// Erros NÃO avançam: custam integridade e geram cicatriz (o conhecimento importa).
function buildEncounter(run, pool, node, { n, topico = null, isBoss = false }) {
  const enc = {
    nodeId: node.id,
    tipo: node.tipo,
    isBoss,
    objetivo: n,
    acertos: 0,
    tentativas: 0,
    current: null,
    topicoFiltro: topico,
    bossTopics: isBoss ? bossTopics(run, pool) : null,
    bossIdx: 0,
    cleared: false,
  };
  enc.current = pickNextChallenge(run, pool, enc);
  return enc;
}

// Sorteia o próximo desafio do encontro (usa o motor adaptativo).
function pickNextChallenge(run, pool, enc) {
  const rng = nextRng(run);
  let filtro = enc.topicoFiltro;
  if (enc.isBoss && enc.bossTopics && enc.bossTopics.length) {
    filtro = enc.bossTopics[enc.bossIdx % enc.bossTopics.length];
    enc.bossIdx += 1;
  }
  const c = selectNext(run.mastery, pool, rng, run._cfg.adaptive, filtro);
  if (!c) return null;
  run.mastery = recordSeen(run.mastery, c.id, c.subtopico, false); // evita repetição imediata
  return c.id;
}

function bossTopics(run, pool) {
  // o boss = a prova: cobre vários blocos da ementa
  const presentes = [...new Set(pool.map((c) => c.topico))];
  const prioridade = ["Datapath e Controle", "Tempos", "Pipeline", "Desempenho", "Lei de Amdahl", "Funções MIPS"];
  const ordered = prioridade.filter((t) => presentes.includes(t));
  return ordered.length ? ordered : presentes;
}

function buildReviewEncounter(run, pool, node) {
  // sala de revisão: usa uma cicatriz real do jogador, se houver
  if (run.defeitos.length > 0) {
    const def = run.defeitos[0];
    const cands = pool.filter((c) => c.subtopico === def.subtopico);
    const rng = nextRng(run);
    const c = cands.length ? rng.pick(cands) : null;
    return { nodeId: node.id, tipo: "revisao", isReview: true, objetivo: 1, acertos: 0, tentativas: 0, current: c ? c.id : null, alvoDefeito: def, cleared: false };
  }
  return { nodeId: node.id, tipo: "descanso", isRest: true, current: null, cleared: false };
}

function buildShop(run) {
  const rng = nextRng(run);
  const owned = new Set(run.relics);
  const disp = RELICS.filter((r) => !owned.has(r.id));
  const offer = rng.shuffle(disp).slice(0, 3).map((r) => ({ id: r.id, custo: CUSTO_RELIC[r.raridade] || 3 }));
  return offer;
}

// ---- Combate: resolver um desafio ------------------------------------------
// opts: { userAnswer, usedHelp, timeMs, overclock, nowTs }. pool é necessário
// para sortear o próximo desafio quando o encontro ainda não foi vencido.
export function resolveChallenge(run, challenge, opts, pool) {
  const r = clone(run);
  const cfg = r._cfg;
  const eff = applyRelicEffects(r.relics);
  const { outcome, correctness } = resolveAnswer(challenge, opts.userAnswer);

  // mastery + histórico + log
  r.mastery = updateMastery(r.mastery, {
    subtopico: challenge.subtopico,
    topico: challenge.topico,
    outcome,
    difficulty: challenge.dificuldade,
    timeMs: opts.timeMs,
    tempoEstimado: challenge.tempoEstimado,
    nowTs: opts.nowTs || 0,
    cfg: cfg.adaptive,
  });
  r.mastery = recordSeen(r.mastery, challenge.id, challenge.subtopico, outcome === "correct");
  r.runLog.push({ id: challenge.id, subtopico: challenge.subtopico, topico: challenge.topico, outcome });

  const result = { outcome, correctness, eventos: [], dano: 0, xp: 0 };

  if (outcome === "correct" || outcome === "partial") {
    r.combo += 1;
    r.maxCombo = Math.max(r.maxCombo, r.combo);
    // XP
    let xp = cfg.pontuacao.xpPorAcerto * (outcome === "partial" ? 0.5 : 1);
    xp *= 1 + cfg.combat.bonusComboPasso * (r.combo - 1);
    if (!opts.usedHelp) xp += cfg.combat.bonusSemAjuda;
    xp = Math.round(xp * eff.xpMult);
    r.xp += xp;
    result.xp = xp;
    // dano no workload (feedback de combate)
    let dano = cfg.combat.danoBase;
    if (r.combo >= eff.comboMin) dano *= eff.comboDanoMult;
    dano = Math.round(dano * eff.danoMult);
    result.dano = dano;

    // perks de relíquia
    if (eff.focoPorAcertoSemAjuda && !opts.usedHelp) r.foco += eff.focoPorAcertoSemAjuda;
    if (eff.focoPorTopico && challenge.topico === eff.focoPorTopico.topico) {
      r.foco += eff.focoPorTopico.foco;
      result.eventos.push("foco+" + eff.focoPorTopico.foco);
    }
    if (eff.curaPorTopico && eff.curaPorTopico.topicos.includes(challenge.topico)) {
      const h = R.heal(r, eff.curaPorTopico.hp);
      r.integridade = h.integridade;
      result.eventos.push("cura+" + eff.curaPorTopico.hp);
    }
    // overclock: bônus se acertou, mas esquenta
    if (opts.overclock) {
      const bonus = Math.round(result.xp * cfg.combat.overclockBonus);
      r.xp += bonus;
      result.xp += bonus;
      const c = R.addCalor(r, cfg.combat.overclockCalor, cfg.combat.calorMax);
      r.calor = c.calor;
      if (c.overheated) {
        const dmg = applyDano(r, eff, 1, false);
        r.integridade = dmg.integridade;
        r.calor = 0;
        result.eventos.push("falha térmica!");
        addDefeito(r, challenge);
      }
    }
    // revisão: acertar remove a cicatriz e cura
    if (r.encounter && r.encounter.isReview) {
      r.defeitos = r.defeitos.filter((d) => d.subtopico !== challenge.subtopico);
      const h = R.heal(r, 1);
      r.integridade = h.integridade;
      result.eventos.push("cicatriz curada");
    }
  } else {
    // erro
    const protege = eff.comboShield > 0 && !r._shieldUsed;
    if (protege) {
      r._shieldUsed = true;
      result.eventos.push("combo protegido (PC+4)");
    } else {
      r.combo = 0;
    }
    const danoErro = baseDanoErro(challenge, cfg) + eff.danoErroExtra - eff.mitigarDanoErro;
    const d = applyDano(r, eff, Math.max(0, danoErro), true);
    r.integridade = d.integridade;
    result.dano = -Math.max(0, danoErro);
    addDefeito(r, challenge);
  }

  // progressão do encontro: só ACERTO avança; erro custa integridade mas não avança.
  if (r.encounter) {
    r.encounter.tentativas = (r.encounter.tentativas || 0) + 1;
    if (r.encounter.isReview) {
      // revisão é uma única microquestão
      r.encounter.cleared = true;
    } else {
      if (outcome === "correct") r.encounter.acertos += 1;
      if (r.encounter.acertos >= r.encounter.objetivo) {
        r.encounter.cleared = true;
      } else if (r.integridade > 0) {
        // ainda não venceu: sorteia o próximo desafio
        r.encounter.current = pickNextChallenge(r, pool || poolFromIds(r), r.encounter);
      }
    }
  }

  // condições de fim
  if (r.integridade <= 0) {
    r.status = "derrota";
    r.fase = "fim";
  }
  return { run: r, result };
}

function applyDano(r, eff, n, isErro) {
  return R.damage(r, Math.max(0, n));
}
function baseDanoErro(challenge, cfg) {
  return cfg.run.danoBasePorErro + (challenge.dificuldade >= 4 ? 1 : 0);
}
function addDefeito(run, challenge) {
  if (!run.defeitos.some((d) => d.subtopico === challenge.subtopico)) {
    run.defeitos.push({ subtopico: challenge.subtopico, topico: challenge.topico });
  }
}

// ---- Encerrar encontro / recompensa / boss ---------------------------------
// Chamado quando o encontro foi limpo (encounter.cleared).
export function finishEncounter(run, pool) {
  const r = clone(run);
  const node = nodeById(r, r.encounter.nodeId);

  if (r.encounter.isBoss) {
    r.status = "vitoria";
    r.fase = "fim";
    return r;
  }
  // desafio/elite: oferece recompensa (escolha de relíquia)
  if (node.tipo === "desafio" || node.tipo === "elite") {
    r.xp += r._cfg.pontuacao.xpPorAndar / 2;
    const rng = nextRng(r);
    const owned = new Set(r.relics);
    const disp = RELICS.filter((x) => !owned.has(x.id));
    if (disp.length > 0) {
      r.pendingRewards = rng.shuffle(disp).slice(0, 3).map((x) => x.id);
      r.fase = "recompensa";
      return r;
    }
  }
  // descanso já tratado; volta ao mapa
  r.fase = "mapa";
  return r;
}

export function chooseReward(run, relicId) {
  const r = clone(run);
  if (relicId && !r.relics.includes(relicId)) r.relics.push(relicId);
  r.pendingRewards = null;
  r._shieldUsed = false; // reseta escudo de combo para o próximo encontro
  r.fase = "mapa";
  return r;
}

export function restHeal(run) {
  const r = clone(run);
  const h = R.heal(r, r._cfg.run.curaDescanso);
  r.integridade = h.integridade;
  r.fase = "mapa";
  r._shieldUsed = false;
  return r;
}

export function buyRelic(run, relicId) {
  const r = clone(run);
  const offer = (r.shopOffer || []).find((o) => o.id === relicId);
  if (!offer) return { run: r, ok: false, motivo: "indisponível" };
  if (r.relics.includes(relicId)) return { run: r, ok: false, motivo: "já possui" };
  const s = R.spend(r, "orcamento", offer.custo);
  if (!s.ok) return { run: r, ok: false, motivo: "orçamento insuficiente" };
  r.orcamento = s.state.orcamento;
  r.relics.push(relicId);
  r.shopOffer = r.shopOffer.filter((o) => o.id !== relicId);
  return { run: r, ok: true };
}

export function leaveShop(run) {
  const r = clone(run);
  r.shopOffer = null;
  r.fase = "mapa";
  r._shieldUsed = false;
  return r;
}

export function backToMapAfterEncounter(run) {
  const r = clone(run);
  r.fase = "mapa";
  r._shieldUsed = false;
  return r;
}

// ---- Win/Lose ---------------------------------------------------------------
export function checkLose(run) {
  return run.integridade <= 0;
}
export function checkWin(run) {
  return run.status === "vitoria";
}
export function isRunOver(run) {
  return run.status === "vitoria" || run.status === "derrota";
}

export function runReport(run, pool) {
  return buildRunReport(run.mastery, run.runLog, pool);
}

function clone(run) {
  return JSON.parse(JSON.stringify(run));
}
