import { describe, it, ok, eq } from "./_assert.js";
import { generateMap, validateMap } from "../src/mapgen/mapgen.js";
import { makeRng } from "../src/core/rng.js";

describe("mapgen");

it("gera mapas válidos (conexos, sem becos, 1 boss) para muitas seeds", () => {
  for (let i = 0; i < 50; i++) {
    const m = generateMap(makeRng(i), { rows: 6 });
    const v = validateMap(m);
    ok(v.ok, `mapa ${i}: ${JSON.stringify(v.errors)}`);
  }
});

it("é determinístico para a mesma seed", () => {
  eq(
    JSON.stringify(generateMap(makeRng(7), { rows: 6 })),
    JSON.stringify(generateMap(makeRng(7), { rows: 6 }))
  );
});

it("o boss é alcançável a partir do início", () => {
  const m = generateMap(makeRng(42), { rows: 6 });
  ok(validateMap(m).ok);
  ok(m.nodes.find((n) => n.id === m.boss).tipo === "boss");
});
