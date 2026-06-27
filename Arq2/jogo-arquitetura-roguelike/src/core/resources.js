// resources.js — matemática de recursos (puro, imutável).
// Recebe um "holder" com integridade/integridadeMax/orcamento/foco/calor e
// devolve uma cópia atualizada. Nunca muta a entrada.

export function damage(r, n) {
  return { ...r, integridade: Math.max(0, r.integridade - Math.max(0, n)) };
}
export function heal(r, n) {
  return { ...r, integridade: Math.min(r.integridadeMax, r.integridade + Math.max(0, n)) };
}
export function gain(r, kind, n) {
  return { ...r, [kind]: (r[kind] || 0) + Math.max(0, n) };
}
// Tenta gastar; se insuficiente, retorna ok:false sem alterar.
export function spend(r, kind, n) {
  if ((r[kind] || 0) < n) return { ok: false, state: r };
  return { ok: true, state: { ...r, [kind]: r[kind] - n } };
}
export function addCalor(r, n, max) {
  const calor = Math.max(0, (r.calor || 0) + n);
  return { ...r, calor, overheated: calor >= max };
}
