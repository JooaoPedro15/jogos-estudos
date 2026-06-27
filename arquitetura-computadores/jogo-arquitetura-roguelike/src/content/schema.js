// schema.js — constantes do schema de conteúdo educacional (puro).
// Define os tipos de desafio e quais campos cada tipo exige.

export const TIPOS = [
  "single-choice", // uma alternativa correta
  "multi-select",  // várias corretas
  "numeric",       // valor numérico (com base e tolerância)
  "order-blocks",  // ordenar blocos (ex.: estágios do pipeline)
  "toggle-signals",// ligar/desligar sinais de controle
  "fix-bug",       // apontar a linha errada de um código
  "predict-output",// prever valor de registrador/memória
];

export const BASES = [2, 8, 10, 16];
export const DIFFICULTY_MIN = 1;
export const DIFFICULTY_MAX = 5;

// Lista de tópicos da ementa (usada para validação e relatório).
export const TOPICOS = [
  "Aritmética Computacional",
  "Somador CLA",
  "Lei de Amdahl",
  "Desempenho",
  "Memória e Cache",
  "ISA / Linguagem de Máquina",
  "Funções MIPS",
  "Datapath e Controle",
  "Tempos",
  "Pipeline",
];

// Campos sempre obrigatórios.
export const REQUIRED_BASE = [
  "id",
  "topico",
  "subtopico",
  "dificuldade",
  "tipo",
  "enunciado",
  "resposta",
  "explicacao",
  "fonte",
  "tempoEstimado",
];

// Campos/condições específicos por tipo (checados em validate.js).
export const REQUIRED_BY_TIPO = {
  "single-choice": ["opcoes"],
  "multi-select": ["opcoes"],
  numeric: [],
  "order-blocks": ["opcoes"],
  "toggle-signals": ["opcoes"],
  "fix-bug": ["opcoes"],
  "predict-output": [],
};
