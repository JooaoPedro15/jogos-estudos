// progression.js — metaprogressão leve entre runs (puro).
// Importante: não dá bônus de combate permanente — só registra estatística e
// desbloqueia conteúdo/cosmético, para que o conhecimento siga sendo o que importa.

export function applyRunResult(meta, run, vitoria) {
  const m = { ...meta };
  m.runs = (m.runs || 0) + 1;
  if (vitoria) m.vitorias = (m.vitorias || 0) + 1;
  m.xpTotal = (m.xpTotal || 0) + (run.xp || 0);
  m.melhorCombo = Math.max(m.melhorCombo || 0, run.maxCombo || 0);
  return m;
}

// Nível do jogador (só prestígio/cosmético): a cada 500 XP sobe 1.
export function xpToLevel(xp) {
  return 1 + Math.floor((xp || 0) / 500);
}

// Desbloqueios cosméticos por marcos (sem impacto em balanceamento).
export function unlocks(meta) {
  const u = [];
  if ((meta.vitorias || 0) >= 1) u.push("titulo_arquiteto");
  if ((meta.runs || 0) >= 5) u.push("veterano");
  if ((meta.melhorCombo || 0) >= 8) u.push("combo_mestre");
  if (xpToLevel(meta.xpTotal) >= 5) u.push("nivel_5");
  return u;
}
