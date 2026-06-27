// Registro físico do conteúdo: agrega todos os desafios por tópico.
import aritmetica from "./aritmetica.js";
import cla from "./cla.js";
import amdahl from "./amdahl.js";
import desempenho from "./desempenho.js";
import memoria from "./memoria.js";
import isa from "./isa.js";
import funcoes from "./funcoes.js";
import datapath from "./datapath.js";
import pipeline from "./pipeline.js";

export const ALL_CHALLENGES = [
  ...aritmetica,
  ...cla,
  ...amdahl,
  ...desempenho,
  ...memoria,
  ...isa,
  ...funcoes,
  ...datapath,
  ...pipeline,
];
