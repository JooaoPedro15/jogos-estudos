// report.js — relatório de fim de run (puro). Cruza mastery + log da run.
import { aggregateTopic } from "./mastery.js";
import { TOPICOS } from "../content/schema.js";

export function buildRunReport(state, runLog, pool) {
  const topicStats = [];
  for (const topico of TOPICOS) {
    const m = aggregateTopic(state, topico);
    if (m !== null) topicStats.push({ topico, mastery: m });
  }

  const strong = topicStats.filter((t) => t.mastery >= 0.7).sort((a, b) => b.mastery - a.mastery);
  const weak = topicStats.filter((t) => t.mastery < 0.45).sort((a, b) => a.mastery - b.mastery);

  // maiores erros nesta run, agrupados por subtópico
  const errBySub = {};
  let correct = 0;
  let total = 0;
  for (const e of runLog) {
    total++;
    if (e.outcome === "correct") correct++;
    if (e.outcome === "wrong") errBySub[e.subtopico] = (errBySub[e.subtopico] || 0) + 1;
  }
  const biggestErrors = Object.entries(errBySub)
    .map(([subtopico, n]) => ({ subtopico, erros: n }))
    .sort((a, b) => b.erros - a.erros)
    .slice(0, 5);

  // sugestões de estudo: tópicos fracos + uma fonte do material
  const suggestedStudy = weak.slice(0, 3).map((t) => {
    const ex = pool.find((c) => c.topico === t.topico && c.fonte);
    return {
      topico: t.topico,
      mastery: t.mastery,
      fonte: ex ? ex.fonte : null,
      exemploId: ex ? ex.id : null,
    };
  });

  return {
    accuracy: total ? correct / total : 0,
    total,
    correct,
    strong,
    weak,
    biggestErrors,
    suggestedStudy,
  };
}
