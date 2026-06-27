// migrate.js — versionamento e sanitização do save (puro). Nunca lança em prod:
// entrada irreconhecível vira um save novo limpo.

export const CURRENT_VERSION = 1;

export function newSave() {
  return {
    version: CURRENT_VERSION,
    meta: { xpTotal: 0, runs: 0, vitorias: 0, melhorCombo: 0, mute: false },
    run: null,
  };
}

function num(v, def) {
  return typeof v === "number" && Number.isFinite(v) ? v : def;
}

export function sanitize(raw) {
  if (!raw || typeof raw !== "object") return newSave();
  const base = newSave();
  const meta = raw.meta && typeof raw.meta === "object" ? raw.meta : {};
  return {
    version: CURRENT_VERSION,
    meta: {
      xpTotal: Math.max(0, num(meta.xpTotal, 0)),
      runs: Math.max(0, num(meta.runs, 0)),
      vitorias: Math.max(0, num(meta.vitorias, 0)),
      melhorCombo: Math.max(0, num(meta.melhorCombo, 0)),
      mute: !!meta.mute,
    },
    // run só é mantida se tiver forma plausível (seed + map); senão descarta
    run: isPlausibleRun(raw.run) ? raw.run : null,
  };
}

function isPlausibleRun(run) {
  return (
    run &&
    typeof run === "object" &&
    typeof run.seed === "string" &&
    run.map &&
    Array.isArray(run.map.nodes) &&
    typeof run.integridade === "number"
  );
}

// Aplica migrações encadeadas v_n -> v_{n+1} e depois sanitiza.
export function migrate(raw) {
  try {
    if (!raw || typeof raw !== "object") return newSave();
    let s = raw;
    // (sem migrações ainda; versão futura adiciona casos aqui)
    if (typeof s.version !== "number" || s.version > CURRENT_VERSION) {
      // versão desconhecida/futura: preserva meta por sanitize, descarta run
      s = { ...s, version: CURRENT_VERSION };
    }
    return sanitize(s);
  } catch {
    return newSave();
  }
}
