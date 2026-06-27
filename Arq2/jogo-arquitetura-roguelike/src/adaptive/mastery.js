// mastery.js — modelo de domínio por subtópico (puro, testável em Node).
// mastery ∈ [0,1] sobe ao acertar e cai ao errar, ponderado por dificuldade e tempo.

export function createMasteryState(masteryInicial = 0.2) {
  return { version: 1, _default: masteryInicial, subtopics: {}, history: [], globalTurn: 0 };
}

export function initSubtopic(topico, masteryInicial = 0.2) {
  return {
    topico,
    seen: 0,
    correct: 0,
    wrong: 0,
    partial: 0,
    avgTimeMs: 0,
    lastSeenTurn: -999,
    lastSeenTs: 0,
    mastery: masteryInicial,
    streak: 0,
    difficultyCeiling: 1,
  };
}

export function masteryOf(state, subtopico) {
  const s = state.subtopics[subtopico];
  return s ? s.mastery : state._default ?? 0.2;
}

// Atualiza o estado após uma resposta. Retorna NOVO estado (sem mutar o original).
export function updateMastery(state, params) {
  const { subtopico, topico, outcome, difficulty, timeMs, tempoEstimado, nowTs, cfg } = params;
  const d = clamp(difficulty || 1, 1, 5);
  const next = cloneState(state);
  const sub = next.subtopics[subtopico] || initSubtopic(topico, next._default ?? 0.2);

  const wUp = 0.15 + 0.05 * (d - 1); // acertar difícil sobe mais
  const wDown = 0.2 + 0.05 * (5 - d); // errar fácil dói mais
  const estMs = (tempoEstimado || 60) * 1000;
  const speed = clamp(1.15 - 0.3 * ((timeMs || estMs) / estMs), 0.85, 1.15);

  let target, w;
  if (outcome === "correct") {
    target = 1;
    w = wUp * speed;
  } else if (outcome === "partial") {
    target = clamp(sub.mastery + 0.1, 0, 1);
    w = wUp * speed * 0.6;
  } else {
    target = 0;
    w = wDown;
  }
  sub.mastery = clamp(sub.mastery + w * (target - sub.mastery), 0, 1);

  sub.seen += 1;
  if (outcome === "correct") {
    sub.correct += 1;
    sub.streak += 1;
    if (d > sub.difficultyCeiling) sub.difficultyCeiling = d;
  } else if (outcome === "partial") {
    sub.partial += 1;
    sub.streak = 0;
  } else {
    sub.wrong += 1;
    sub.streak = 0;
  }
  const tm = timeMs || estMs;
  sub.avgTimeMs = sub.avgTimeMs === 0 ? tm : 0.7 * sub.avgTimeMs + 0.3 * tm;
  sub.lastSeenTurn = next.globalTurn;
  sub.lastSeenTs = nowTs || 0;

  next.subtopics[subtopico] = sub;
  return next;
}

// Agrega o mastery de um tópico (média ponderada por 'seen').
export function aggregateTopic(state, topico) {
  let num = 0;
  let den = 0;
  for (const key of Object.keys(state.subtopics)) {
    const s = state.subtopics[key];
    if (s.topico === topico) {
      const w = Math.max(1, s.seen);
      num += s.mastery * w;
      den += w;
    }
  }
  return den === 0 ? null : num / den;
}

// Registra a seleção no histórico (ring buffer) e avança o turno global.
export function recordSeen(state, challengeId, subtopico, correct) {
  const next = cloneState(state);
  next.history.push({ id: challengeId, subtopico, turn: next.globalTurn, correct: !!correct });
  if (next.history.length > 40) next.history.shift();
  next.globalTurn += 1;
  return next;
}

function cloneState(state) {
  return {
    version: state.version,
    _default: state._default,
    globalTurn: state.globalTurn,
    history: state.history.slice(),
    subtopics: Object.fromEntries(Object.entries(state.subtopics).map(([k, v]) => [k, { ...v }])),
  };
}
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
