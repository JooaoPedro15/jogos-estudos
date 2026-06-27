// validate.js — validação do conteúdo educacional (puro).
// Garante que nenhum desafio incompleto/inconsistente entre no jogo.

import {
  TIPOS,
  BASES,
  DIFFICULTY_MIN,
  DIFFICULTY_MAX,
  REQUIRED_BASE,
  REQUIRED_BY_TIPO,
} from "./schema.js";

export class ContentError extends Error {
  constructor(report) {
    super(`Conteúdo inválido: ${report.errors.length} erro(s).`);
    this.name = "ContentError";
    this.report = report;
  }
}

function issue(id, code, field, severity, message) {
  return { id, code, field, severity, message };
}

const ID_RE = /^[a-z0-9.\-]+$/;
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const nonEmptyStr = (v) => typeof v === "string" && v.trim().length > 0;

// Valida UM desafio. registry = { fontes:Set, ids:Set, topicos:Set }.
export function validateChallenge(c, registry) {
  const errors = [];
  const warnings = [];
  const id = (c && c.id) || "(sem id)";

  if (!c || typeof c !== "object") {
    return { valid: false, errors: [issue(id, "NOT_OBJECT", "", "error", "Desafio não é objeto")], warnings };
  }

  // Campos base
  for (const f of REQUIRED_BASE) {
    const v = c[f];
    const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
    if (empty) errors.push(issue(id, "MISSING_FIELD", f, "error", `Campo obrigatório ausente: ${f}`));
  }

  if (c.id !== undefined && !ID_RE.test(String(c.id)))
    errors.push(issue(id, "BAD_ID", "id", "error", "id deve ser slug [a-z0-9.-]"));
  if (registry && registry.ids && c.id && registry._dupChecked === undefined) {
    // duplicidade é checada no conjunto (validateContentSet); aqui ignoramos.
  }
  if (c.dificuldade !== undefined) {
    if (!Number.isInteger(c.dificuldade) || c.dificuldade < DIFFICULTY_MIN || c.dificuldade > DIFFICULTY_MAX)
      errors.push(issue(id, "BAD_DIFFICULTY", "dificuldade", "error", "dificuldade deve ser inteiro 1..5"));
  }
  if (c.tipo !== undefined && !TIPOS.includes(c.tipo))
    errors.push(issue(id, "UNKNOWN_TIPO", "tipo", "error", `tipo desconhecido: ${c.tipo}`));
  if (c.explicacao !== undefined && (!nonEmptyStr(c.explicacao) || c.explicacao.trim().length < 10))
    errors.push(issue(id, "EMPTY_EXPLANATION", "explicacao", "error", "explicacao deve ter >= 10 caracteres"));
  if (c.fonte) {
    if (!nonEmptyStr(c.fonte.material))
      errors.push(issue(id, "MISSING_FIELD", "fonte.material", "error", "fonte.material ausente"));
    else if (registry && registry.fontes && !registry.fontes.has(c.fonte.material))
      errors.push(issue(id, "UNKNOWN_FONTE", "fonte.material", "error", `fonte desconhecida: ${c.fonte.material}`));
  }
  if (c.tempoEstimado !== undefined && (!isNum(c.tempoEstimado) || c.tempoEstimado <= 0))
    errors.push(issue(id, "BAD_TEMPO", "tempoEstimado", "error", "tempoEstimado deve ser > 0"));

  // Campos exigidos pelo tipo
  if (c.tipo && REQUIRED_BY_TIPO[c.tipo]) {
    for (const f of REQUIRED_BY_TIPO[c.tipo]) {
      if (c[f] === undefined || c[f] === null)
        errors.push(issue(id, "MISSING_FIELD", f, "error", `tipo ${c.tipo} exige campo ${f}`));
    }
  }

  // Consistência opções ↔ resposta por tipo
  if (c.tipo && errors.length === 0) validateByTipo(c, errors, id);

  // Qualidade (warnings)
  const temErradas = Array.isArray(c.opcoes) && c.opcoes.some((o) => !isCorrectOption(c, o));
  if (temErradas && (!c.porqueErros || Object.keys(c.porqueErros).length === 0))
    warnings.push(issue(id, "MISSING_WHY", "porqueErros", "warning", "sem explicação de erros nas opções"));
  if (nonEmptyStr(c.enunciado) && c.enunciado.length > 600)
    warnings.push(issue(id, "LONG_ENUNCIADO", "enunciado", "warning", "enunciado muito longo"));
  if (!Array.isArray(c.tags) || c.tags.length === 0)
    warnings.push(issue(id, "NO_TAGS", "tags", "warning", "sem tags"));

  return { valid: errors.length === 0, errors, warnings };
}

function isCorrectOption(c, o) {
  if (c.tipo === "single-choice") return o.id === c.resposta;
  if (c.tipo === "multi-select") return Array.isArray(c.resposta) && c.resposta.includes(o.id);
  if (c.tipo === "fix-bug") return false; // tratado à parte
  return true;
}

function validateByTipo(c, errors, id) {
  const t = c.tipo;
  if (t === "single-choice") {
    const ids = (c.opcoes || []).map((o) => o.id);
    if (ids.length < 2) errors.push(issue(id, "BAD_OPTIONS", "opcoes", "error", "single-choice precisa >= 2 opções"));
    if (new Set(ids).size !== ids.length) errors.push(issue(id, "DUP_OPTION", "opcoes", "error", "opções com id duplicado"));
    if (!ids.includes(c.resposta)) errors.push(issue(id, "ANSWER_MISMATCH", "resposta", "error", "resposta não está nas opções"));
  } else if (t === "multi-select") {
    const ids = (c.opcoes || []).map((o) => o.id);
    if (!Array.isArray(c.resposta) || c.resposta.length < 1)
      errors.push(issue(id, "ANSWER_MISMATCH", "resposta", "error", "multi-select exige resposta array >= 1"));
    else {
      if (c.resposta.some((r) => !ids.includes(r)))
        errors.push(issue(id, "ANSWER_MISMATCH", "resposta", "error", "resposta fora das opções"));
      if (c.resposta.length >= ids.length)
        errors.push(issue(id, "ANSWER_MISMATCH", "resposta", "error", "multi-select não pode ser 'todas'"));
    }
  } else if (t === "numeric" || t === "predict-output") {
    const r = c.resposta || {};
    if (!isNum(r.valor)) errors.push(issue(id, "ANSWER_MISMATCH", "resposta.valor", "error", "valor numérico ausente"));
    if (r.base !== undefined && !BASES.includes(r.base))
      errors.push(issue(id, "BAD_BASE", "resposta.base", "error", "base inválida (use 2/8/10/16)"));
    if (r.tolerancia !== undefined && (!isNum(r.tolerancia) || r.tolerancia < 0))
      errors.push(issue(id, "BAD_TOLERANCE", "resposta.tolerancia", "error", "tolerancia >= 0"));
  } else if (t === "order-blocks") {
    const ids = (c.opcoes || []).map((o) => o.id).sort();
    const resp = Array.isArray(c.resposta) ? c.resposta.slice().sort() : null;
    if (!resp || JSON.stringify(ids) !== JSON.stringify(resp))
      errors.push(issue(id, "ANSWER_MISMATCH", "resposta", "error", "resposta deve ser permutação dos blocos"));
  } else if (t === "toggle-signals") {
    const ids = (c.opcoes || []).map((o) => o.id);
    const resp = c.resposta || {};
    for (const sid of ids)
      if (typeof resp[sid] !== "boolean")
        errors.push(issue(id, "ANSWER_MISMATCH", "resposta", "error", `sinal ${sid} sem booleano na resposta`));
    for (const k of Object.keys(resp))
      if (!ids.includes(k)) errors.push(issue(id, "ANSWER_MISMATCH", "resposta", "error", `resposta tem sinal extra ${k}`));
  } else if (t === "fix-bug") {
    const linhas = (c.opcoes || []).map((o) => o.id);
    const r = c.resposta || {};
    if (!linhas.includes(r.linha)) errors.push(issue(id, "ANSWER_MISMATCH", "resposta.linha", "error", "linha do bug fora das opções"));
  }
}

// Valida o CONJUNTO. options.env: "dev" lança em erro; "prod" filtra.
export function validateContentSet(challenges, registry, options = {}) {
  const env = options.env || "prod";
  const errors = [];
  const warnings = [];
  const valid = [];
  const seen = new Set();

  for (const c of challenges) {
    const id = (c && c.id) || "(sem id)";
    if (c && c.id && seen.has(c.id))
      errors.push(issue(id, "DUP_ID", "id", "error", `id duplicado: ${c.id}`));
    if (c && c.id) seen.add(c.id);

    const r = validateChallenge(c, registry);
    warnings.push(...r.warnings);
    if (r.valid && !(c.id && countOf(challenges, c.id) > 1)) valid.push(c);
    else errors.push(...r.errors);
  }

  const report = {
    ok: errors.length === 0,
    total: challenges.length,
    validCount: valid.length,
    skipped: challenges.length - valid.length,
    errors,
    warnings,
    validChallenges: valid,
  };

  if (env === "dev" && errors.length > 0) throw new ContentError(report);
  return report;
}

function countOf(arr, id) {
  let n = 0;
  for (const c of arr) if (c && c.id === id) n++;
  return n;
}
