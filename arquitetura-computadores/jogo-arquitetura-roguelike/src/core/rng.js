// rng.js — gerador de números pseudo-aleatórios SEMEADO e determinístico.
// Algoritmo: mulberry32 + hash FNV-1a para converter string->uint32.
// Idêntico no browser e no Node (sem dependências), permitindo seeds reprodutíveis.

export function hashSeed(str) {
  // FNV-1a 32 bits
  let h = 0x811c9dc5;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function makeRng(seed) {
  let a = (typeof seed === "string" ? hashSeed(seed) : seed >>> 0) || 1;
  function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    seed,
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    float: (min, max) => min + next() * (max - min),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    shuffle: (arr) => {
      const a2 = arr.slice();
      for (let i = a2.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a2[i], a2[j]] = [a2[j], a2[i]];
      }
      return a2;
    },
    weighted: (items, weightFn) => {
      const ws = items.map(weightFn);
      const total = ws.reduce((s, w) => s + Math.max(0, w), 0);
      if (total <= 0) return items[items.length - 1];
      let r = next() * total;
      for (let i = 0; i < items.length; i++) {
        r -= Math.max(0, ws[i]);
        if (r < 0) return items[i];
      }
      return items[items.length - 1];
    },
    // Deriva um sub-stream independente (mapgen/encounters/select não interferem entre si).
    fork: (label) => makeRng((hashSeed(String(label)) ^ (a >>> 0)) >>> 0),
  };
}

// Seed do dia (para desafio diário reprodutível).
export function dailySeed(date) {
  const d = date || new Date();
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
  return iso;
}
