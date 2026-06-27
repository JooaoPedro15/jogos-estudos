// ui.js — camada de apresentação. Lê o estado (APP) e desenha a tela atual.
// Sem regras de jogo aqui: toda lógica vem de core/* e adaptive/*.

import * as E from "../core/engine.js";
import { wrongDetails } from "../core/answer.js";
import { ARQUETIPOS, RELICS_BY_ID } from "../meta/relics.js";
import { applyRunResult } from "../meta/progression.js";
import { sfx, setMuted, isMuted } from "../effects/sfx.js";
import { save as persistSave, reset as resetSave } from "../persistence/save.js";

let APP = null;
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

export function initUI(app) {
  APP = app;
  setMuted(!!APP.save.meta.mute);
  document.getElementById("app").addEventListener("click", onClick);
  render();
}

function persist() {
  APP.save.run = APP.run && !E.isRunOver(APP.run) ? APP.run : null;
  persistSave(APP.save);
}

// ---------------------------------------------------------------- view router
function currentView() {
  if (APP.menu) return APP.menu;
  if (APP.run) return "run";
  return "home";
}

export function render() {
  const root = document.getElementById("app");
  const view = currentView();
  let html = "";
  if (view === "home") html = viewHome();
  else if (view === "tutorial") html = viewTutorial();
  else if (view === "stats") html = viewStats();
  else if (view === "arquetipo") html = viewArquetipo();
  else if (view === "run") html = viewRun();
  root.innerHTML = `<div class="wrap">${html}</div>`;
  // pós-render: foco em input numérico
  const inp = $("#num-input");
  if (inp) inp.focus();
}

// ---------------------------------------------------------------- HUD
function hud() {
  const r = APP.run;
  if (!r) return "";
  const hearts = "♥".repeat(Math.max(0, r.integridade)) + "♡".repeat(Math.max(0, r.integridadeMax - r.integridade));
  const relics = r.relics
    .map((id) => {
      const rel = RELICS_BY_ID[id];
      return rel ? `<span class="relic" title="${esc(rel.nome)}: ${esc(rel.desc)}">${rel.icon}</span>` : "";
    })
    .join("");
  const calor = r.calor > 0 ? `<span class="stat heat">🔥 ${r.calor}/${APP.cfg.combat.calorMax}</span>` : "";
  return `<div class="hud">
    <span class="stat hp" title="Integridade">${hearts}</span>
    <span class="stat" title="Orçamento">🪙 ${r.orcamento}</span>
    <span class="stat" title="Foco">🎯 ${r.foco}</span>
    <span class="stat" title="Combo">🔗 ${r.combo}</span>
    ${calor}
    <span class="stat" title="XP">✨ ${r.xp}</span>
    <span class="relics">${relics}</span>
    <span class="spacer"></span>
    <button class="ic" data-act="mute" title="Som">${isMuted() ? "🔇" : "🔊"}</button>
    <button class="ic" data-act="home" title="Início (salva)">🏠</button>
  </div>`;
}

// ---------------------------------------------------------------- HOME
function viewHome() {
  const m = APP.save.meta;
  const temRun = !!APP.save.run;
  return `
  <header class="hero">
    <h1>ARQUITETO <span class="sub2">Tape-Out Run</span></h1>
    <p class="tag">Roguelite de Arquitetura de Computadores — monte uma CPU, sobreviva à prova.</p>
  </header>
  <div class="menu">
    ${temRun ? `<button class="btn big" data-act="continuar">▶ Continuar run</button>` : ""}
    <button class="btn ${temRun ? "" : "big"}" data-act="nova">🎲 Nova run</button>
    <button class="btn ghost" data-act="tutorial">📖 Como jogar</button>
    <button class="btn ghost" data-act="stats">📊 Estatísticas</button>
  </div>
  <div class="home-foot">
    Runs: <b>${m.runs}</b> · Vitórias: <b>${m.vitorias}</b> · XP total: <b>${m.xpTotal}</b> · Melhor combo: <b>${m.melhorCombo}</b>
    <br><button class="ic" data-act="mute">${isMuted() ? "🔇 Som" : "🔊 Som"}</button>
    <button class="ic" data-act="reset">🗑 Resetar progresso</button>
  </div>`;
}

// ---------------------------------------------------------------- TUTORIAL
const TUT = [
  { t: "Bem-vindo, Arquiteto", b: "Cada <b>run</b> é uma jornada montando uma CPU por um mapa procedural até a <b>prova</b> (o boss). Você perde se a <b>Integridade</b> (♥) zerar — então decida bem." },
  { t: "Como se joga", b: "Em cada sala você resolve <b>desafios</b> da matéria (controle, tempos, Amdahl, pipeline, funções…). Acertar dá XP, combo e dano no workload. Errar custa integridade e cria uma <b>cicatriz</b>." },
  { t: "Build & relíquias", b: "Salas vencidas dão <b>relíquias</b> que mudam sua estratégia: proteger o combo, dobrar dano, curar em certos tópicos, ganhar foco. Lojas vendem relíquias por <b>orçamento</b> (🪙)." },
  { t: "Risco & recompensa", b: "<b>Overclock</b> aumenta o ganho mas esquenta a CPU (🔥). Cicatrizes podem ser curadas em salas de <b>Revisão</b>, que repõem exatamente o que você errou." },
  { t: "Você aprende jogando", b: "O jogo registra onde você erra e <b>reapresenta seus pontos fracos</b>. Ao fim da run, um relatório diz o que estudar. Errou? A explicação aparece na hora." },
];
function viewTutorial() {
  const i = APP.ui.tutIdx;
  const s = TUT[i];
  return `
  ${barTop("Como jogar")}
  <div class="panel tut">
    <h2>${s.t}</h2><p>${s.b}</p>
    <div class="dots">${TUT.map((_, k) => `<span class="${k === i ? "on" : ""}"></span>`).join("")}</div>
  </div>
  <div class="row between">
    <button class="btn ghost" data-act="tut-prev" ${i === 0 ? "disabled" : ""}>← Voltar</button>
    <button class="btn" data-act="tut-next">${i === TUT.length - 1 ? "Começar ▶" : "Próximo →"}</button>
  </div>`;
}

// ---------------------------------------------------------------- STATS
function viewStats() {
  const m = APP.save.meta;
  return `
  ${barTop("Estatísticas")}
  <div class="panel">
    <div class="stats-grid">
      <div class="sc"><b>${m.runs}</b><span>Runs jogadas</span></div>
      <div class="sc"><b>${m.vitorias}</b><span>Vitórias</span></div>
      <div class="sc"><b>${m.xpTotal}</b><span>XP total</span></div>
      <div class="sc"><b>${m.melhorCombo}</b><span>Melhor combo</span></div>
    </div>
    <p class="muted">O progresso é salvo automaticamente neste navegador.</p>
  </div>
  <button class="btn ghost" data-act="home">← Início</button>`;
}

// ---------------------------------------------------------------- ARQUÉTIPO
function viewArquetipo() {
  return `
  ${barTop("Escolha sua especialização")}
  <div class="cards">
    ${ARQUETIPOS.map(
      (a) => `<button class="card pick" data-act="pick-arq" data-id="${a.id}">
        <div class="card-ic">${a.icon}</div>
        <div class="card-nm">${esc(a.nome)}</div>
        <div class="card-ds">${esc(a.desc)}</div>
      </button>`
    ).join("")}
  </div>
  <button class="btn ghost" data-act="home">← Cancelar</button>`;
}

// ---------------------------------------------------------------- RUN router
function viewRun() {
  const r = APP.run;
  if (r.fase === "fim") return viewResult();
  let body = "";
  if (r.fase === "mapa") body = viewMap();
  else if (r.fase === "desafio" || r.fase === "boss") body = viewChallenge();
  else if (r.fase === "recompensa") body = viewReward();
  else if (r.fase === "loja") body = viewShop();
  else if (r.fase === "descanso") body = viewRest();
  return hud() + body;
}

// ---- MAPA ----
const TIPO_ICON = { inicio: "🏁", desafio: "🧩", elite: "💀", loja: "🛒", descanso: "🛟", boss: "👑" };
const TIPO_NOME = { inicio: "Início", desafio: "Desafio", elite: "Elite", loja: "Loja", descanso: "Descanso", boss: "Boss — A Prova" };
function viewMap() {
  const r = APP.run;
  const next = new Set(E.nextNodes(r));
  const byLayer = {};
  for (const n of r.map.nodes) (byLayer[n.layer] ||= []).push(n);
  const layers = Object.keys(byLayer)
    .map(Number)
    .sort((a, b) => a - b);
  const cols = layers
    .map((l) => {
      const nodes = byLayer[l]
        .map((n) => {
          const isCur = n.id === r.currentNode;
          const canGo = next.has(n.id);
          const cls = ["node", n.tipo, isCur ? "cur" : "", canGo ? "go" : "", r.visited.includes(n.id) && !isCur ? "done" : ""].join(" ");
          const topico = n.topico ? `<span class="ntop">${esc(n.topico)}</span>` : "";
          const act = canGo ? `data-act="enter" data-id="${n.id}"` : "";
          return `<button class="${cls}" ${act} ${canGo ? "" : "disabled"}>
            <span class="nic">${TIPO_ICON[n.tipo]}</span>
            <span class="nnm">${TIPO_NOME[n.tipo]}</span>${topico}</button>`;
        })
        .join("");
      return `<div class="map-col">${nodes}</div>`;
    })
    .join("");
  return `<div class="panel">
    <h2>Mapa da run</h2>
    <p class="muted">Escolha a próxima sala (destacadas). Cada caminho oferece desafios e recompensas diferentes.</p>
    <div class="map">${cols}</div>
  </div>`;
}

// ---- DESAFIO ----
function currentChallenge() {
  const e = APP.run.encounter;
  if (!e || e.idx >= e.fila.length) return null;
  return APP.content.pool.find((c) => c.id === e.fila[e.idx]) || null;
}
function ensureDraft(c) {
  if (APP.ui.challengeId !== c.id) {
    APP.ui.challengeId = c.id;
    APP.ui.draft = defaultDraft(c);
    APP.ui.feedback = null;
    APP.ui.showLong = false;
    APP.ui.overclock = false;
    APP.ui.usedHelp = false;
    APP.ui.tStart = Date.now();
  }
}
function defaultDraft(c) {
  if (c.tipo === "toggle-signals") return Object.fromEntries(c.opcoes.map((o) => [o.id, false]));
  if (c.tipo === "multi-select" || c.tipo === "order-blocks") return [];
  return null;
}
function viewChallenge() {
  const r = APP.run;
  const c = currentChallenge();
  if (!c) {
    // encontro limpo: avança
    return `<div class="panel center"><button class="btn" data-act="finish-enc">Continuar →</button></div>`;
  }
  ensureDraft(c);
  const isBoss = r.encounter.isBoss;
  const prog = `${r.encounter.idx + 1}/${r.encounter.fila.length}`;
  const ctx = c.contexto ? `<pre class="ctx ${c.contextoTipo === "asm" ? "asm" : ""}">${esc(c.contexto)}</pre>` : "";
  const fb = APP.ui.feedback;
  return `<div class="panel challenge ${isBoss ? "boss" : ""}">
    <div class="ch-head">
      <span class="badge">${isBoss ? "👑 BOSS · " : ""}${esc(c.topico)} · ${esc(c.subtopico)}</span>
      <span class="diff">${"◆".repeat(c.dificuldade)}${"◇".repeat(5 - c.dificuldade)}</span>
      <span class="prog">${prog}</span>
    </div>
    <h2 class="enun">${esc(c.enunciado)}</h2>
    ${ctx}
    <div class="answer">${renderAnswer(c)}</div>
    ${fb ? renderFeedback(c, fb) : renderControls(c)}
  </div>`;
}

function renderAnswer(c) {
  const d = APP.ui.draft;
  const locked = !!APP.ui.feedback;
  switch (c.tipo) {
    case "single-choice":
    case "fix-bug":
      return c.opcoes
        .map(
          (o) =>
            `<button class="opt ${d === o.id ? "sel" : ""} ${optClass(c, o.id)}" data-act="choice" data-id="${o.id}" ${locked ? "disabled" : ""}>${esc(o.label)}</button>`
        )
        .join("");
    case "multi-select":
      return c.opcoes
        .map(
          (o) =>
            `<button class="opt ${d.includes(o.id) ? "sel" : ""} ${optClass(c, o.id)}" data-act="multi" data-id="${o.id}" ${locked ? "disabled" : ""}>${esc(o.label)}</button>`
        )
        .join("");
    case "toggle-signals":
      return `<div class="sigs">${c.opcoes
        .map(
          (o) =>
            `<button class="sig ${d[o.id] ? "on" : ""} ${sigClass(c, o.id)}" data-act="sig" data-id="${o.id}" ${locked ? "disabled" : ""}>
              <span class="sig-nm">${esc(o.label)}</span><span class="sig-v">${d[o.id] ? "1" : "0"}</span></button>`
        )
        .join("")}</div>`;
    case "order-blocks": {
      const chosen = d
        .map((id, i) => {
          const o = c.opcoes.find((x) => x.id === id);
          return `<span class="ord-chip">${i + 1}. ${esc(o.label)}</span>`;
        })
        .join("");
      const rest = c.opcoes
        .filter((o) => !d.includes(o.id))
        .map((o) => `<button class="opt" data-act="order" data-id="${o.id}" ${locked ? "disabled" : ""}>${esc(o.label)}</button>`)
        .join("");
      return `<div class="ord-seq">${chosen || '<span class="muted">clique na ordem…</span>'}</div>
        <div class="ord-pool">${rest}</div>
        ${d.length && !locked ? `<button class="btn ghost small" data-act="order-reset">↺ Limpar ordem</button>` : ""}`;
    }
    case "numeric":
    case "predict-output":
      return `<div class="num-row">
        <input id="num-input" class="num" type="text" inputmode="decimal" placeholder="${baseHint(c)}" ${locked ? "disabled" : ""} value="${APP.ui.numValue || ""}">
        <span class="num-suf">${baseSuf(c)}</span>
      </div>`;
    default:
      return "";
  }
}
function baseHint(c) {
  const b = (c.resposta && c.resposta.base) || 10;
  return b === 10 ? "sua resposta" : "em base " + b;
}
function baseSuf(c) {
  const b = (c.resposta && c.resposta.base) || 10;
  return b === 10 ? "" : `(base ${b})`;
}
function optClass(c, id) {
  if (!APP.ui.feedback) return "";
  if (c.tipo === "single-choice") {
    if (id === c.resposta) return "right";
    if (id === APP.ui.draft) return "wrong";
  }
  if (c.tipo === "fix-bug") {
    if (id === c.resposta.linha) return "right";
    if (id === APP.ui.draft) return "wrong";
  }
  if (c.tipo === "multi-select") {
    const correct = c.resposta.includes(id);
    const picked = APP.ui.draft.includes(id);
    if (correct) return "right";
    if (picked && !correct) return "wrong";
  }
  return "";
}
function sigClass(c, id) {
  if (!APP.ui.feedback) return "";
  return !!APP.ui.draft[id] === !!c.resposta[id] ? "right" : "wrong";
}

function renderControls(c) {
  const oc = APP.ui.overclock ? "on" : "";
  return `<div class="controls">
    <button class="btn" data-act="resolve">⚙ Resolver</button>
    <button class="btn ghost small" data-act="diagnostico" title="Custa 1 foco; reduz bônus">🔎 Diagnóstico (−1🎯)</button>
    <button class="btn ghost small toggle-oc ${oc}" data-act="overclock" title="Mais ganho, mais calor">🔥 Overclock ${APP.ui.overclock ? "ON" : "OFF"}</button>
  </div>
  ${APP.ui.helpText ? `<div class="hint">${APP.ui.helpText}</div>` : ""}`;
}

function renderFeedback(c, fb) {
  const cls = fb.outcome === "correct" ? "ok" : fb.outcome === "partial" ? "partial" : "err";
  const head = fb.outcome === "correct" ? "✅ Correto!" : fb.outcome === "partial" ? "◐ Parcial" : "❌ Errado";
  let whys = "";
  if (fb.outcome !== "correct") {
    const wrong = wrongDetails(c, APP.ui.draft);
    const items = wrong
      .map((k) => (c.porqueErros && c.porqueErros[k] ? `<li><b>${esc(labelOf(c, k))}:</b> ${esc(c.porqueErros[k])}</li>` : ""))
      .filter(Boolean)
      .join("");
    if (items) whys = `<ul class="whys">${items}</ul>`;
  }
  const dmg = fb.dano > 0 ? `<span class="dmg good">+${fb.dano} dano no workload</span>` : fb.dano < 0 ? `<span class="dmg bad">${fb.dano} ♥</span>` : "";
  const xp = fb.xp ? `<span class="xpgain">+${fb.xp} XP</span>` : "";
  const ev = (fb.eventos || []).map((e) => `<span class="ev">${esc(e)}</span>`).join(" ");
  const long = c.explicacaoLonga
    ? APP.ui.showLong
      ? `<div class="long">${esc(c.explicacaoLonga)}</div>`
      : `<button class="link" data-act="show-long">ver explicação completa ▾</button>`
    : "";
  return `<div class="feedback ${cls}">
    <div class="fb-head">${head} ${dmg} ${xp} ${ev}</div>
    <p class="expl">${esc(c.explicacao)}</p>
    ${whys}${long}
    <button class="btn" data-act="next-q">Continuar →</button>
  </div>`;
}
function labelOf(c, id) {
  const o = (c.opcoes || []).find((x) => x.id === id);
  return o ? o.label : id;
}

// ---- RECOMPENSA ----
function viewReward() {
  const ids = APP.run.pendingRewards || [];
  return `<div class="panel center">
    <h2>🎁 Escolha uma relíquia</h2>
    <p class="muted">Componentes mudam sua estratégia para o resto da run.</p>
    <div class="cards">
      ${ids
        .map((id) => {
          const r = RELICS_BY_ID[id];
          return `<button class="card pick rar-${r.raridade}" data-act="reward" data-id="${id}">
            <div class="card-ic">${r.icon}</div><div class="card-nm">${esc(r.nome)}</div>
            <div class="card-ds">${esc(r.desc)}</div><div class="rar">${r.raridade}</div></button>`;
        })
        .join("")}
    </div>
    <button class="btn ghost small" data-act="reward" data-id="">Pular (sem relíquia)</button>
  </div>`;
}

// ---- LOJA ----
function viewShop() {
  const offer = APP.run.shopOffer || [];
  return `<div class="panel center">
    <h2>🛒 Loja</h2>
    <p class="muted">Orçamento: 🪙 ${APP.run.orcamento}</p>
    <div class="cards">
      ${offer
        .map((o) => {
          const r = RELICS_BY_ID[o.id];
          const afford = APP.run.orcamento >= o.custo;
          return `<button class="card pick rar-${r.raridade} ${afford ? "" : "off"}" data-act="buy" data-id="${o.id}" ${afford ? "" : "disabled"}>
            <div class="card-ic">${r.icon}</div><div class="card-nm">${esc(r.nome)}</div>
            <div class="card-ds">${esc(r.desc)}</div><div class="rar">🪙 ${o.custo}</div></button>`;
        })
        .join("")}
    </div>
    <button class="btn" data-act="leave-shop">Sair da loja →</button>
  </div>`;
}

// ---- DESCANSO / REVISÃO ----
function viewRest() {
  const r = APP.run;
  if (r.encounter && r.encounter.isReview && r.encounter.fila.length) {
    // revisão usa o renderizador de desafio
    return viewChallenge();
  }
  return `<div class="panel center">
    <h2>🛟 Descanso</h2>
    <p class="muted">Sem cicatrizes para revisar. Recupere integridade.</p>
    <button class="btn" data-act="rest">Curar +${APP.cfg.run.curaDescanso} ♥ →</button>
  </div>`;
}

// ---- RESULTADO ----
function viewResult() {
  const r = APP.run;
  const rep = APP.ui.report || (APP.ui.report = E.runReport(r, APP.content.pool));
  const win = r.status === "vitoria";
  const strong = rep.strong.slice(0, 4).map((t) => `<li>${esc(t.topico)} <span class="m">${pct(t.mastery)}</span></li>`).join("") || "<li class='muted'>—</li>";
  const weak = rep.weak.slice(0, 4).map((t) => `<li>${esc(t.topico)} <span class="m bad">${pct(t.mastery)}</span></li>`).join("") || "<li class='muted'>nenhum ponto fraco crítico 🎉</li>";
  const study = rep.suggestedStudy
    .map((s) => `<li>${esc(s.topico)}${s.fonte ? ` — <span class="muted">${esc(fonteLabel(s.fonte))}</span>` : ""}</li>`)
    .join("") || "<li class='muted'>siga revisando o que aparecer</li>";
  const relics = r.relics.map((id) => RELICS_BY_ID[id]?.icon || "").join(" ");
  return `<div class="panel center result">
    <div class="big">${win ? "🏆" : "💀"}</div>
    <h2>${win ? "Tape-out aprovado!" : "Run encerrada"}</h2>
    <p class="muted">${win ? "Sua CPU passou na prova." : "A integridade chegou a zero — mas o aprendizado fica."}</p>
    <div class="res-stats">
      <div class="sc"><b>${r.xp}</b><span>XP da run</span></div>
      <div class="sc"><b>${r.maxCombo}</b><span>Maior combo</span></div>
      <div class="sc"><b>${pct(rep.accuracy)}</b><span>Acerto</span></div>
      <div class="sc"><b>${esc(relics) || "—"}</b><span>Build</span></div>
    </div>
    <div class="res-cols">
      <div><h3>💪 Fortes</h3><ul>${strong}</ul></div>
      <div><h3>📉 Revisar</h3><ul>${weak}</ul></div>
      <div><h3>📚 Estude antes da próxima</h3><ul>${study}</ul></div>
    </div>
    <div class="row center">
      <button class="btn big" data-act="nova">🔁 Nova run</button>
      <button class="btn ghost" data-act="home">🏠 Início</button>
    </div>
  </div>`;
}
function pct(x) {
  return Math.round((x || 0) * 100) + "%";
}
function fonteLabel(f) {
  return f.material + (f.capitulo ? " · " + f.capitulo : "");
}

// helpers de layout
function barTop(title) {
  return `<div class="bar"><button class="ic" data-act="home">←</button><b>${esc(title)}</b><span class="spacer"></span></div>`;
}

// ---------------------------------------------------------------- AÇÕES
function onClick(ev) {
  const btn = ev.target.closest("[data-act]");
  if (!btn) return;
  const act = btn.dataset.act;
  const id = btn.dataset.id;
  handle(act, id, btn);
}

function handle(act, id) {
  const A = {
    mute: () => {
      setMuted(!isMuted());
      APP.save.meta.mute = isMuted();
      persist();
      render();
    },
    home: () => {
      APP.menu = "home";
      persist();
      render();
    },
    tutorial: () => {
      APP.menu = "tutorial";
      APP.ui.tutIdx = 0;
      render();
    },
    "tut-prev": () => {
      if (APP.ui.tutIdx > 0) APP.ui.tutIdx--;
      sfx.click();
      render();
    },
    "tut-next": () => {
      if (APP.ui.tutIdx < TUT.length - 1) {
        APP.ui.tutIdx++;
        render();
      } else {
        APP.menu = "arquetipo";
        render();
      }
    },
    stats: () => {
      APP.menu = "stats";
      render();
    },
    nova: () => {
      APP.menu = "arquetipo";
      APP.run = null;
      render();
    },
    "pick-arq": () => {
      startRun(id);
    },
    continuar: () => {
      APP.run = APP.save.run;
      APP.menu = null;
      APP.ui.report = null;
      render();
    },
    reset: () => {
      if (confirm("Apagar TODO o progresso (estatísticas e run salva)?")) {
        APP.save = resetSave();
        APP.run = null;
        APP.menu = "home";
        render();
      }
    },
    enter: () => {
      APP.run = E.enterNode(APP.run, id, APP.content.pool);
      APP.menu = null;
      APP.ui.report = null;
      sfx.click();
      persist();
      render();
    },
    // respostas
    choice: () => {
      APP.ui.draft = id;
      sfx.click();
      render();
    },
    multi: () => {
      const d = APP.ui.draft;
      APP.ui.draft = d.includes(id) ? d.filter((x) => x !== id) : [...d, id];
      sfx.click();
      render();
    },
    sig: () => {
      APP.ui.draft = { ...APP.ui.draft, [id]: !APP.ui.draft[id] };
      sfx.click();
      render();
    },
    order: () => {
      APP.ui.draft = [...APP.ui.draft, id];
      sfx.click();
      render();
    },
    "order-reset": () => {
      APP.ui.draft = [];
      render();
    },
    overclock: () => {
      APP.ui.overclock = !APP.ui.overclock;
      render();
    },
    diagnostico: () => doDiagnostico(),
    resolve: () => doResolve(),
    "show-long": () => {
      APP.ui.showLong = true;
      render();
    },
    "next-q": () => nextQuestion(),
    "finish-enc": () => finishEncounter(),
    reward: () => {
      APP.run = E.chooseReward(APP.run, id || null);
      sfx.recompensa();
      persist();
      render();
    },
    buy: () => {
      const res = E.buyRelic(APP.run, id);
      APP.run = res.run;
      if (res.ok) sfx.recompensa();
      render();
    },
    "leave-shop": () => {
      APP.run = E.leaveShop(APP.run);
      persist();
      render();
    },
    rest: () => {
      APP.run = E.restHeal(APP.run);
      sfx.acerto();
      persist();
      render();
    },
  };
  if (A[act]) A[act]();
}

function startRun(arqId) {
  const seed = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const { run } = E.createRun({ seed, arquetipoId: arqId, pool: APP.content.pool, cfg: APP.cfg });
  APP.run = run;
  APP.menu = null;
  APP.ui = { ...APP.ui, report: null, challengeId: null };
  sfx.click();
  persist();
  render();
}

function readNumeric() {
  const inp = $("#num-input");
  return inp ? inp.value : "";
}

function doDiagnostico() {
  if (APP.ui.helpText) return;
  if (APP.run.foco <= 0) {
    APP.ui.helpText = "Sem foco suficiente para diagnóstico.";
    render();
    return;
  }
  APP.run.foco -= 1;
  APP.ui.usedHelp = true;
  const c = currentChallenge();
  APP.ui.helpText = c.explicacaoLonga
    ? "💡 " + c.explicacaoLonga
    : `💡 Revise: ${c.topico} → ${c.subtopico}. Pense nos conceitos da fonte ${fonteLabel(c.fonte)}.`;
  sfx.click();
  persist();
  render();
}

function doResolve() {
  const c = currentChallenge();
  let answer = APP.ui.draft;
  if (c.tipo === "numeric" || c.tipo === "predict-output") {
    answer = readNumeric();
    APP.ui.numValue = answer;
    APP.ui.draft = answer;
  }
  if (answer === null || answer === undefined || (Array.isArray(answer) && answer.length === 0) || answer === "") {
    APP.ui.helpText = "Escolha/insira uma resposta primeiro.";
    render();
    return;
  }
  const timeMs = Date.now() - (APP.ui.tStart || Date.now());
  const out = E.resolveChallenge(APP.run, c, {
    userAnswer: answer,
    usedHelp: APP.ui.usedHelp,
    timeMs,
    overclock: APP.ui.overclock,
    nowTs: Date.now(),
  });
  APP.run = out.run;
  APP.ui.feedback = out.result;
  APP.ui.helpText = null;
  if (out.result.outcome === "correct") sfx.acerto();
  else if (out.result.outcome === "partial") sfx.click();
  else {
    sfx.erro();
    sfx.dano();
  }
  if (E.checkLose(APP.run)) {
    finalizeRun(false);
  }
  persist();
  render();
}

function nextQuestion() {
  // limpa estado de feedback; avança para o próximo desafio do encontro
  APP.ui.feedback = null;
  APP.ui.challengeId = null;
  APP.ui.numValue = "";
  const e = APP.run.encounter;
  if (e && e.cleared) {
    finishEncounter();
    return;
  }
  render();
}

function finishEncounter() {
  const r = E.finishEncounter(APP.run, APP.content.pool);
  APP.run = r;
  APP.ui.challengeId = null;
  APP.ui.feedback = null;
  if (r.status === "vitoria") {
    finalizeRun(true);
  }
  persist();
  render();
}

function finalizeRun(win) {
  if (APP.ui._finalized === APP.run.seed) return;
  APP.ui._finalized = APP.run.seed;
  APP.save.meta = applyRunResult(APP.save.meta, APP.run, win);
  APP.run.fase = "fim";
  if (win) sfx.vitoria();
  else sfx.derrota();
  persist();
}
