// selection.js — escolhe o próximo desafio (puro, determinístico dado o rng).
// Ressurge tópicos fracos, evita repetição imediata, escala a dificuldade ao mastery.

import { masteryOf } from "./mastery.js";

// Filtra desafios elegíveis (anti-repetição + gate de pré-requisito).
export function eligible(state, pool, cfg) {
  const recent = new Set(
    state.history.slice(-cfg.cooldownWindow).map((h) => h.id)
  );
  return pool.filter((c) => {
    if (recent.has(c.id)) return false;
    // gate de prereqs: cada prereq (id de challenge) precisa de mastery suficiente
    if (Array.isArray(c.prerequisitos)) {
      for (const pid of c.prerequisitos) {
        const pre = pool.find((x) => x.id === pid);
        if (pre && masteryOf(state, pre.subtopico) < cfg.prereqGate) return false;
      }
    }
    return true;
  });
}

// Pontua um desafio: maior = mais provável de ser escolhido.
export function scoreChallenge(state, c, cfg) {
  const sub = state.subtopics[c.subtopico];
  const mastery = sub ? sub.mastery : state._default ?? 0.2;
  const seen = sub ? sub.seen : 0;
  const lastTurn = sub ? sub.lastSeenTurn : -999;

  const weakness = 1 - mastery; // fraco resurge mais
  const recencyTurns = state.globalTurn - lastTurn;
  const spacingBoost = Math.log2(1 + Math.max(0, recencyTurns));
  const novelty = seen === 0 ? 1 : 0;
  const retentionPull = mastery > cfg.masteredThreshold ? cfg.retentionWeight : 0;

  // ajuste de dificuldade: penaliza desafios longe da dificuldade-alvo
  const targetDiff = clamp(Math.round(1 + mastery * 4), 1, 5);
  const diffPenalty = Math.abs((c.dificuldade || 1) - targetDiff) * 0.25;

  const score =
    cfg.kWeak * weakness +
    cfg.kSpacing * spacingBoost +
    cfg.kNovelty * novelty +
    retentionPull -
    diffPenalty;
  return Math.max(0.05, score); // piso para nunca zerar
}

// Seleciona o próximo desafio. filtroTopico (opcional) restringe a um tópico.
export function selectNext(state, pool, rng, cfg, filtroTopico = null) {
  let candidates = pool;
  if (filtroTopico) {
    const f = candidates.filter((c) => c.topico === filtroTopico);
    if (f.length) candidates = f;
  }

  let elig = eligible(state, candidates, cfg);
  if (elig.length === 0) elig = candidates; // fallback: ignora cooldown
  if (elig.length === 0) elig = pool; // último recurso
  if (elig.length === 0) return null;

  // exploração: às vezes escolhe uniforme para variar
  if (rng.chance(cfg.exploreRate)) return rng.pick(elig);

  return rng.weighted(elig, (c) => scoreChallenge(state, c, cfg));
}

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
