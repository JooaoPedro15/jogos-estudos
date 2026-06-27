// relics.js — componentes/relíquias que o jogador coleta e montam a "build".
// Cada relíquia altera o resolvedor de combate por flags lidas em core/combat.js.
// (Puro: applyRelicEffects deriva efeitos agregados a partir da lista ativa.)

export const RELICS = [
  {
    id: "pc4",
    nome: "PC+4",
    icon: "➕",
    raridade: "comum",
    desc: "O primeiro erro de cada sala não quebra o combo.",
    efeitos: { comboShield: 1 },
  },
  {
    id: "alu_overclock",
    nome: "ULA Overclock",
    icon: "⚡",
    raridade: "raro",
    desc: "Com combo 3+, o dano no workload é dobrado.",
    efeitos: { comboDanoMult: 2, comboMin: 3 },
  },
  {
    id: "cache_mental",
    nome: "Cache Mental",
    icon: "🧠",
    raridade: "comum",
    desc: "Reduz em 1 o dano sofrido a cada erro.",
    efeitos: { mitigarDanoErro: 1 },
  },
  {
    id: "clock_agressivo",
    nome: "Clock Agressivo",
    icon: "🔥",
    raridade: "raro",
    desc: "+30% de dano no workload, mas cada erro custa +1 de integridade.",
    efeitos: { danoMult: 1.3, danoErroExtra: 1 },
  },
  {
    id: "forwarding",
    nome: "Unidade de Forwarding",
    icon: "↪️",
    raridade: "comum",
    desc: "Acertar um desafio de Pipeline recupera 1 de foco.",
    efeitos: { focoPorTopico: { topico: "Pipeline", foco: 1 } },
  },
  {
    id: "cla_unit",
    nome: "Somador CLA",
    icon: "➗",
    raridade: "comum",
    desc: "Acertar Aritmética ou CLA cura 1 de integridade.",
    efeitos: { curaPorTopico: { topicos: ["Aritmética Computacional", "Somador CLA"], hp: 1 } },
  },
  {
    id: "branch_sense",
    nome: "Branch Sense",
    icon: "🎯",
    raridade: "comum",
    desc: "Cada acerto SEM diagnóstico dá +1 de foco.",
    efeitos: { focoPorAcertoSemAjuda: 1 },
  },
  {
    id: "pipeline_unit",
    nome: "Pipeline de 5 estágios",
    icon: "🚉",
    raridade: "raro",
    desc: "+25% de XP em toda a run.",
    efeitos: { xpMult: 1.25 },
  },
];

export const RELICS_BY_ID = Object.fromEntries(RELICS.map((r) => [r.id, r]));

// Arquétipos iniciais: definem a "build" de partida (relíquia + ajuste de recurso).
export const ARQUETIPOS = [
  {
    id: "otimizador",
    nome: "Otimizador",
    icon: "📉",
    desc: "Foca em desempenho. Começa com Cache Mental e +1 orçamento.",
    relicInicial: "cache_mental",
    bonus: { orcamento: 1 },
  },
  {
    id: "overclocker",
    nome: "Overclocker",
    icon: "🔥",
    desc: "Alto risco/recompensa. Começa com ULA Overclock e +1 integridade.",
    relicInicial: "alu_overclock",
    bonus: { integridade: 1 },
  },
  {
    id: "pipeliner",
    nome: "Pipeliner",
    icon: "🚉",
    desc: "Ganha recursos jogando bem. Começa com Forwarding e +1 foco.",
    relicInicial: "forwarding",
    bonus: { foco: 1 },
  },
];

export const ARQUETIPOS_BY_ID = Object.fromEntries(ARQUETIPOS.map((a) => [a.id, a]));

// Agrega os efeitos de uma lista de relíquias ativas em um único objeto.
export function applyRelicEffects(relicIds) {
  const eff = {
    danoMult: 1,
    xpMult: 1,
    mitigarDanoErro: 0,
    danoErroExtra: 0,
    comboShield: 0,
    comboDanoMult: 1,
    comboMin: 99,
    focoPorAcertoSemAjuda: 0,
    focoPorTopico: null,
    curaPorTopico: null,
  };
  for (const id of relicIds || []) {
    const r = RELICS_BY_ID[id];
    if (!r) continue; // relíquia desconhecida é ignorada (não lança)
    const e = r.efeitos;
    if (e.danoMult) eff.danoMult *= e.danoMult;
    if (e.xpMult) eff.xpMult *= e.xpMult;
    if (e.mitigarDanoErro) eff.mitigarDanoErro += e.mitigarDanoErro;
    if (e.danoErroExtra) eff.danoErroExtra += e.danoErroExtra;
    if (e.comboShield) eff.comboShield += e.comboShield;
    if (e.comboDanoMult) {
      eff.comboDanoMult = Math.max(eff.comboDanoMult, e.comboDanoMult);
      eff.comboMin = Math.min(eff.comboMin, e.comboMin || 3);
    }
    if (e.focoPorAcertoSemAjuda) eff.focoPorAcertoSemAjuda += e.focoPorAcertoSemAjuda;
    if (e.focoPorTopico) eff.focoPorTopico = e.focoPorTopico;
    if (e.curaPorTopico) eff.curaPorTopico = e.curaPorTopico;
  }
  return eff;
}
