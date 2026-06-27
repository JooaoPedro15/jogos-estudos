// sfx.js — efeitos sonoros via WebAudio (sem arquivos). Respeita o mute.
let ctx = null;
let muted = false;

export function setMuted(m) {
  muted = !!m;
}
export function isMuted() {
  return muted;
}

function beep(freq, dur, type = "sine", vol = 0.12) {
  if (muted) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch {
    /* sem áudio */
  }
}

export const sfx = {
  click: () => beep(440, 0.04, "square", 0.06),
  acerto: () => {
    beep(660, 0.08, "triangle");
    setTimeout(() => beep(990, 0.12, "triangle"), 70);
  },
  erro: () => beep(180, 0.18, "sawtooth", 0.12),
  recompensa: () => [523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 0.12, "triangle"), i * 80)),
  vitoria: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.16, "triangle"), i * 110)),
  derrota: () => [330, 262, 196].forEach((f, i) => setTimeout(() => beep(f, 0.2, "sawtooth", 0.12), i * 130)),
  dano: () => beep(140, 0.12, "sawtooth", 0.1),
};
