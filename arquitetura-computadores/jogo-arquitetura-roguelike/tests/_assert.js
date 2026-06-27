// Micro-harness de testes (zero dependências).
let passed = 0;
let failed = 0;
const fails = [];
let suite = "";

export function describe(name) {
  suite = name;
}
export function it(name, fn) {
  try {
    fn();
    passed++;
  } catch (e) {
    failed++;
    fails.push({ name: `${suite} › ${name}`, msg: e.message });
  }
}
export function eq(a, b, msg) {
  if (JSON.stringify(a) !== JSON.stringify(b))
    throw new Error(`${msg || ""} esperado ${JSON.stringify(b)}, obtido ${JSON.stringify(a)}`);
}
export function ok(c, msg) {
  if (!c) throw new Error(msg || "esperado verdadeiro");
}
export function close(a, b, tol, msg) {
  if (Math.abs(a - b) > tol) throw new Error(`${msg || ""} ${a} não está perto de ${b} (tol ${tol})`);
}
export function throws(fn, msg) {
  let t = false;
  try {
    fn();
  } catch {
    t = true;
  }
  if (!t) throw new Error(msg || "esperava exceção");
}
export function summary() {
  for (const f of fails) console.error("  ✗", f.name, "—", f.msg);
  console.log(`\n${passed} passou, ${failed} falhou`);
  if (failed) process.exit(1);
}
