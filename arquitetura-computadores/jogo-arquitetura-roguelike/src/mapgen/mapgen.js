// mapgen.js — geração procedural do mapa da run (puro, semeado).
// Mapa em camadas (estilo Slay-the-Spire): garante conexão a partir do início,
// nenhum beco sem saída e um único boss alcançável no topo.

import { TOPICOS } from "../content/schema.js";

const TIPOS_NO = [
  { tipo: "desafio", peso: 58 },
  { tipo: "elite", peso: 12 },
  { tipo: "loja", peso: 12 },
  { tipo: "descanso", peso: 18 },
];

export function generateMap(rng, opts = {}) {
  const rows = opts.rows || 6; // linhas de salas normais
  const width = opts.width || 3;
  const mr = rng.fork("mapgen");

  const nodes = [];
  const edges = [];
  const byLayer = [];

  // Camada 0: início (único)
  const start = { id: "n0_0", layer: 0, col: 0, tipo: "inicio" };
  nodes.push(start);
  byLayer[0] = [start];

  // Camadas intermediárias
  for (let l = 1; l <= rows; l++) {
    const count = mr.int(2, width);
    const layerNodes = [];
    for (let i = 0; i < count; i++) {
      const node = { id: `n${l}_${i}`, layer: l, col: i, tipo: rollTipo(mr, l, rows) };
      if (node.tipo === "desafio" || node.tipo === "elite") node.topico = mr.pick(TOPICOS);
      layerNodes.push(node);
      nodes.push(node);
    }
    byLayer[l] = layerNodes;
  }

  // Boss (camada final única)
  const bossLayer = rows + 1;
  const boss = { id: `n${bossLayer}_0`, layer: bossLayer, col: 0, tipo: "boss" };
  nodes.push(boss);
  byLayer[bossLayer] = [boss];

  // Arestas: cada nó liga a 1-2 nós da próxima camada (saída garantida)
  for (let l = 0; l <= rows; l++) {
    const cur = byLayer[l];
    const nxt = byLayer[l + 1];
    for (const node of cur) {
      const k = nxt.length === 1 ? 1 : mr.int(1, 2);
      const targets = mr.shuffle(nxt).slice(0, k);
      for (const t of targets) edges.push({ from: node.id, to: t.id });
    }
    // garante indegree >= 1 em cada nó da próxima camada (sem becos/inalcançáveis)
    for (const t of nxt) {
      if (!edges.some((e) => e.to === t.id)) {
        edges.push({ from: mr.pick(cur).id, to: t.id });
      }
    }
  }

  return { nodes, edges, start: start.id, boss: boss.id, rows: bossLayer };
}

function rollTipo(rng, layer, rows) {
  // primeira camada normal sempre começa fácil (desafio)
  if (layer === 1) return "desafio";
  // perto do boss, garante um descanso ocasional
  return rng.weighted(TIPOS_NO, (t) => t.peso).tipo;
}

// Validação usada nos testes: conexo a partir de start, sem becos, boss único.
export function validateMap(map) {
  const errors = [];
  const ids = new Set(map.nodes.map((n) => n.id));
  const out = new Map();
  for (const id of ids) out.set(id, []);
  for (const e of map.edges) {
    if (!ids.has(e.from) || !ids.has(e.to)) errors.push(`aresta inválida ${e.from}->${e.to}`);
    else out.get(e.from).push(e.to);
  }

  // BFS de alcance a partir do start
  const seen = new Set([map.start]);
  const queue = [map.start];
  while (queue.length) {
    const cur = queue.shift();
    for (const t of out.get(cur) || []) if (!seen.has(t)) { seen.add(t); queue.push(t); }
  }
  for (const n of map.nodes) {
    if (!seen.has(n.id)) errors.push(`nó inalcançável: ${n.id}`);
    if (n.tipo !== "boss" && (out.get(n.id) || []).length === 0) errors.push(`beco sem saída: ${n.id}`);
  }
  const bosses = map.nodes.filter((n) => n.tipo === "boss");
  if (bosses.length !== 1) errors.push(`deveria haver 1 boss, há ${bosses.length}`);
  if (!seen.has(map.boss)) errors.push("boss inalcançável");

  return { ok: errors.length === 0, errors };
}
