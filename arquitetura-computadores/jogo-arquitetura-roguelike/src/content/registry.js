// registry.js — indexa o conteúdo e orquestra a validação no boot.
import { ALL_CHALLENGES } from "./challenges/index.js";
import { fonteKeys } from "./fontes.js";
import { validateContentSet } from "./validate.js";

// Constrói índices a partir de uma lista de challenges válidos.
export function buildRegistry(challenges) {
  const ids = new Set();
  const topicos = new Set();
  const bySubtopic = {};
  const byTopic = {};
  for (const c of challenges) {
    ids.add(c.id);
    topicos.add(c.topico);
    (bySubtopic[c.subtopico] ||= []).push(c);
    (byTopic[c.topico] ||= []).push(c);
  }
  return { pool: challenges, ids, topicos, fontes: fonteKeys(), bySubtopic, byTopic };
}

// Carrega + valida o conteúdo. Retorna { pool, registry, report }.
// env "dev": lança em erro. env "prod": descarta inválidos e segue.
export function loadContent(env = "prod") {
  const preRegistry = { ids: new Set(ALL_CHALLENGES.map((c) => c.id)), fontes: fonteKeys() };
  const report = validateContentSet(ALL_CHALLENGES, preRegistry, { env });
  const pool = report.validChallenges;
  return { pool, registry: buildRegistry(pool), report };
}
