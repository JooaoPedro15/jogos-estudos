// answer.js — resolvedor PURO de respostas. Dado um challenge e a resposta do
// jogador, decide outcome ("correct"|"partial"|"wrong") e correctness (0..1).
// Usado tanto pelo combate quanto pela UI.

export function resolveAnswer(challenge, userAnswer) {
  const t = challenge.tipo;
  switch (t) {
    case "single-choice":
      return userAnswer === challenge.resposta ? full() : none();

    case "fix-bug": {
      const got = userAnswer && userAnswer.linha !== undefined ? userAnswer.linha : userAnswer;
      return got === challenge.resposta.linha ? full() : none();
    }

    case "multi-select": {
      const correct = new Set(challenge.resposta);
      const got = new Set(Array.isArray(userAnswer) ? userAnswer : []);
      let inter = 0;
      for (const x of got) if (correct.has(x)) inter++;
      const wrongPicks = got.size - inter;
      if (inter === correct.size && wrongPicks === 0) return full();
      const score = clamp01((inter - wrongPicks) / correct.size);
      return score >= 0.999 ? full() : score > 0 ? partial(score) : none();
    }

    case "numeric":
    case "predict-output": {
      const r = challenge.resposta;
      const base = r.base || 10;
      const tol = r.tolerancia || 0;
      const val = parseNumber(userAnswer, base);
      if (val === null) return none();
      return Math.abs(val - r.valor) <= tol ? full() : none();
    }

    case "order-blocks": {
      const exp = challenge.resposta;
      const got = Array.isArray(userAnswer) ? userAnswer : [];
      if (got.length !== exp.length) return none();
      let right = 0;
      for (let i = 0; i < exp.length; i++) if (got[i] === exp[i]) right++;
      if (right === exp.length) return full();
      const score = clamp01(right / exp.length);
      return score > 0 ? partial(score) : none();
    }

    case "toggle-signals": {
      const exp = challenge.resposta;
      const got = userAnswer || {};
      const keys = Object.keys(exp);
      let right = 0;
      for (const k of keys) if (!!got[k] === !!exp[k]) right++;
      if (right === keys.length) return full();
      const score = clamp01(right / keys.length);
      // exige acerto total para "correct"; parcial conta como erro pedagógico mas com nota
      return score >= 0.999 ? full() : score >= 0.5 ? partial(score) : none();
    }

    default:
      return none();
  }
}

// Lista de quais opções/sinais o jogador errou (para feedback dirigido).
export function wrongDetails(challenge, userAnswer) {
  if (challenge.tipo === "toggle-signals") {
    const exp = challenge.resposta;
    const got = userAnswer || {};
    return Object.keys(exp).filter((k) => !!got[k] !== !!exp[k]);
  }
  if (challenge.tipo === "single-choice" && userAnswer !== challenge.resposta) {
    return [userAnswer];
  }
  if (challenge.tipo === "multi-select") {
    const correct = new Set(challenge.resposta);
    return (Array.isArray(userAnswer) ? userAnswer : []).filter((x) => !correct.has(x));
  }
  return [];
}

function parseNumber(input, base) {
  if (input === null || input === undefined) return null;
  let s = String(input).trim().replace(",", ".");
  if (s === "") return null;
  if (base === 10) {
    const v = Number(s);
    return Number.isFinite(v) ? v : null;
  }
  // bases 2/8/16: aceita inteiros (sem fração) na base dada
  const v = parseInt(s, base);
  return Number.isFinite(v) ? v : null;
}

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const full = () => ({ outcome: "correct", correctness: 1 });
const none = () => ({ outcome: "wrong", correctness: 0 });
const partial = (s) => ({ outcome: "partial", correctness: s });
