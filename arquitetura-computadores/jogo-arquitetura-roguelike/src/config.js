// config.js — constantes de ajuste (puro, sem efeitos colaterais).
// Tudo que controla balanceamento e o motor adaptativo mora aqui.

export const CONFIG = {
  // "dev" = falha rápido se houver conteúdo inválido; "prod" = descarta e segue.
  env: "prod",

  run: {
    integridadeInicial: 5,   // vida da run
    orcamentoInicial: 6,     // recurso para comprar/melhorar componentes
    focoInicial: 2,          // recurso leve para dicas/mitigação
    andares: 3,              // atos antes do boss
    salasPorAndar: 4,        // nós por andar (aprox.)
    danoBasePorErro: 1,      // vida perdida por erro (modulado por dificuldade)
    curaDescanso: 2,
  },

  combat: {
    danoBase: 10,            // dano no workload por acerto
    bonusSemAjuda: 4,        // bônus de dano se acertou sem "Diagnóstico"
    bonusComboPasso: 0.15,   // +15% de dano por nível de combo
    overclockBonus: 0.6,     // +60% dano ao arriscar overclock
    overclockCalor: 2,       // calor ganho por overclock
    calorMax: 6,             // calor >= max => falha térmica (dano + defeito)
  },

  // Motor adaptativo (ver adaptive/*).
  adaptive: {
    masteryInicial: 0.2,
    cooldownWindow: 4,       // não repetir os últimos N challenges
    struggleGapTurns: 2,     // item errado volta após N turnos
    masteredThreshold: 0.75, // acima disso = dominado
    retentionWeight: 0.15,   // chance de reamostrar dominados
    prereqGate: 0.35,        // mastery mínima dos prereqs p/ liberar
    kWeak: 1.0,
    kSpacing: 0.6,
    kNovelty: 0.5,
    exploreRate: 0.1,
  },

  pontuacao: {
    xpPorAndar: 50,
    xpPorBoss: 200,
    xpPorAcerto: 12,
  },
};
