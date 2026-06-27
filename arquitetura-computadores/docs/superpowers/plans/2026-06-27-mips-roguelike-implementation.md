# MIPS Roguelike Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a replayable roguelike study mode to `MIPS Datapath Quest` that covers Lista 3, including a new Assembly Q1 trainer.

**Architecture:** Keep the existing single-file architecture. Add one run-map screen, one new question mode (`mode:5`) for Assembly Q1, and a small roguelike state machine that reuses the existing question renderers, feedback, sound, persistence, and result screen.

**Tech Stack:** Single offline `mips-datapath-quest.html` file, inline CSS, inline vanilla JS, `localStorage`, WebAudio, no external libraries.

---

## File Structure

The project is not a Git repository. Use filesystem checkpoints instead of commits unless Git is initialized later.

- Modify: `D:\Projetos\Arq2\mips-datapath-quest.html`
  - HTML: add Home entry button and `scr-run-map`.
  - CSS: add compact styles for roguelike map, run HUD, rewards, scars, boss panels, and Assembly code blocks.
  - JS Section A: extend saved state only if durable roguelike stats are needed.
  - JS Section E: add `q5(...)`, Assembly question data, roguelike room/reward/boss constants.
  - JS Section F: add run state machine and integrate `renderQuestion`, `questionSolved`, `nextQuestion`, `loseLife`.
  - JS Section F: add `renderMode5`.
  - JS Section G/G2/H: add achievement/polish, Academia row update, boot wiring.
- Create/checkpoint: `D:\Projetos\Arq2\work\checkpoints\mips-datapath-quest.<task>.html`
  - Manual backups after meaningful milestones.
- Existing spec: `D:\Projetos\Arq2\docs\superpowers\specs\2026-06-27-mips-roguelike-design.md`
- This plan: `D:\Projetos\Arq2\docs\superpowers\plans\2026-06-27-mips-roguelike-implementation.md`

## Shared Verification Commands

Use these after each task that changes JS:

```powershell
$html = Get-Content -LiteralPath 'D:\Projetos\Arq2\mips-datapath-quest.html' -Raw
$match = [regex]::Match($html, '<script>([\s\S]*)</script>')
if (-not $match.Success) { throw 'script tag not found' }
Set-Content -LiteralPath 'D:\Projetos\Arq2\work\mips-datapath-quest.extracted.js' -Value $match.Groups[1].Value -Encoding UTF8
node --check 'D:\Projetos\Arq2\work\mips-datapath-quest.extracted.js'
```

Expected: no output and exit code `0`.

Use this before any risky manual edit:

```powershell
New-Item -ItemType Directory -Force -Path 'D:\Projetos\Arq2\work\checkpoints' | Out-Null
Copy-Item -LiteralPath 'D:\Projetos\Arq2\mips-datapath-quest.html' -Destination 'D:\Projetos\Arq2\work\checkpoints\mips-datapath-quest.before-task-N.html'
```

---

### Task 1: Baseline Safety And Smoke Harness

**Files:**
- Modify: none
- Create: `D:\Projetos\Arq2\work\checkpoints\mips-datapath-quest.baseline.html`
- Create: `D:\Projetos\Arq2\work\mips-datapath-quest.extracted.js`

- [ ] **Step 1: Create a baseline checkpoint**

Run:

```powershell
New-Item -ItemType Directory -Force -Path 'D:\Projetos\Arq2\work\checkpoints' | Out-Null
Copy-Item -LiteralPath 'D:\Projetos\Arq2\mips-datapath-quest.html' -Destination 'D:\Projetos\Arq2\work\checkpoints\mips-datapath-quest.baseline.html'
```

Expected: checkpoint file exists.

- [ ] **Step 2: Extract current inline JS**

Run the shared verification command.

Expected: `D:\Projetos\Arq2\work\mips-datapath-quest.extracted.js` exists.

- [ ] **Step 3: Verify current JS parses**

Run:

```powershell
node --check 'D:\Projetos\Arq2\work\mips-datapath-quest.extracted.js'
```

Expected: exit code `0`.

- [ ] **Step 4: Open the current game manually**

Open:

```text
D:\Projetos\Arq2\mips-datapath-quest.html
```

Expected: Home loads, no console errors.

- [ ] **Step 5: Checkpoint**

No Git commit is possible because the folder has no `.git`. Keep the baseline checkpoint.

---

### Task 2: Add Roguelike UI Shell

**Files:**
- Modify: `D:\Projetos\Arq2\mips-datapath-quest.html`

- [ ] **Step 1: Create checkpoint**

Run:

```powershell
Copy-Item -LiteralPath 'D:\Projetos\Arq2\mips-datapath-quest.html' -Destination 'D:\Projetos\Arq2\work\checkpoints\mips-datapath-quest.before-task-2.html'
```

- [ ] **Step 2: Add Home button**

In the Home `.home-actions`, add a primary-looking entry between Academia and Jogar:

```html
<button class="btn" id="btnRogue">🌀 Roguelike da Prova</button>
```

Expected: Home has a clear new call to action.

- [ ] **Step 3: Add run map screen**

After `scr-levels` and before `scr-game`, add:

```html
<section class="screen" id="scr-run-map">
  <div class="panel">
    <div class="run-head">
      <div>
        <h2>🌀 Roguelike da Prova</h2>
        <p class="muted" id="runSubtitle">Escolha a próxima sala e monte sua build.</p>
      </div>
      <div class="run-mini" id="runMiniHUD"></div>
    </div>
    <div class="run-boss" id="runBossHUD"></div>
    <div class="run-path" id="runPath"></div>
    <div class="run-choices" id="runChoices"></div>
    <div class="run-inventory" id="runInventory"></div>
  </div>
</section>
```

- [ ] **Step 4: Add result placeholders**

No new result screen is required. Plan to reuse `scr-result`.

- [ ] **Step 5: Add CSS for run shell**

Near existing card/panel styles, add:

```css
.run-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.run-mini{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;font-size:12px;}
.run-pill{background:var(--bg2);border:1px solid var(--line);border-radius:999px;padding:5px 9px;}
.run-boss{margin:12px 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;}
.boss-phase{background:var(--bg2);border:1px solid var(--line);border-radius:10px;padding:10px;}
.boss-phase.active{border-color:var(--red);box-shadow:0 0 18px rgba(239,68,68,.18);}
.boss-bar{height:7px;border-radius:999px;background:#2a1010;overflow:hidden;margin-top:6px;}
.boss-fill{height:100%;background:linear-gradient(90deg,var(--red),var(--yellow));}
.run-path{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:12px 0;}
.run-node{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--bg2);border:1px solid var(--line);font-size:15px;}
.run-node.done{border-color:var(--green);color:var(--green);}
.run-node.active{border-color:var(--accent2);box-shadow:0 0 16px var(--accent-glow);}
.run-choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:10px;}
.room-card,.reward-card{background:var(--bg2);border:1px solid var(--line);border-radius:12px;padding:12px;text-align:left;transition:.18s transform,.18s border-color;}
.room-card:hover,.reward-card:hover{transform:translateY(-2px);border-color:var(--accent2);}
.room-card .ic,.reward-card .ic{font-size:28px;margin-bottom:6px;}
.room-card .risk,.reward-card .rarity{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;}
.run-inventory{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;}
.scar{border:1px solid var(--yellow);background:rgba(250,204,21,.08);border-radius:999px;padding:4px 8px;font-size:12px;}
.asm-code{font-family:var(--mono);white-space:pre-wrap;background:#0b0b0e;border:1px solid var(--line);border-radius:10px;padding:12px;line-height:1.55;overflow:auto;}
.asm-options{display:grid;gap:8px;margin-top:12px;}
.asm-option{background:var(--bg2);border:1px solid var(--line);border-radius:10px;padding:10px;text-align:left;font-family:var(--mono);}
.asm-option.sel{border-color:var(--accent2);box-shadow:0 0 0 1px var(--accent2);}
```

- [ ] **Step 6: Wire Home button placeholder**

In `boot()`, add a temporary handler:

```js
$('btnRogue').onclick=()=>{ sfx.click(); toast('🌀 Roguelike da Prova','Modo em construção nesta versão.'); };
```

- [ ] **Step 7: Verify**

Run shared JS check.

Open browser and confirm:

- Home shows `Roguelike da Prova`;
- clicking it shows toast;
- no console errors.

- [ ] **Step 8: Checkpoint**

Copy to:

```powershell
Copy-Item -LiteralPath 'D:\Projetos\Arq2\mips-datapath-quest.html' -Destination 'D:\Projetos\Arq2\work\checkpoints\mips-datapath-quest.after-task-2.html'
```

---

### Task 3: Add Roguelike Data And Run State

**Files:**
- Modify: `D:\Projetos\Arq2\mips-datapath-quest.html`

- [ ] **Step 1: Create checkpoint**

Copy current HTML to `mips-datapath-quest.before-task-3.html`.

- [ ] **Step 2: Add mode name**

Update `MODE_NAMES`:

```js
const MODE_NAMES = {
  1:'🎬 Roteirista da Instrução',
  2:'🎛 Engenheiro de Controle',
  3:'⏱ Calculadora de Tempos',
  4:'🚉 Pipeline Master',
  5:'🧾 Treinador Assembly'
};
```

- [ ] **Step 3: Add Assembly factory**

After `q4(diff)`, add:

```js
function q5(kind, diff){
  return {mode:5, diff, kind,
    hint:'Q1 pede funcoes MIPS: argumentos em $a0/$a1, retorno em $v0, chamada com jal, retorno com jr $ra, vetor com lw/sw, limite 30 e formula par/impar.'};
}
```

- [ ] **Step 4: Add room constants**

After `HINT_COST`, add:

```js
const ROOM_TYPES = {
  datapath:{ic:'🛣️', nm:'Datapath', ds:'Clique o caminho da instrução.', risk:'baixo'},
  control:{ic:'🎛', nm:'Controle', ds:'Acerte os sinais de controle.', risk:'medio'},
  time:{ic:'⏱', nm:'Tempo', ds:'Calcule caminho crítico e speedup.', risk:'alto'},
  pipeline:{ic:'🚉', nm:'Pipeline', ds:'Mapeie IF, ID, EX, MEM, WB.', risk:'medio'},
  assembly:{ic:'🧾', nm:'Assembly Q1', ds:'Funções, vetor, loop e fórmula.', risk:'alto'},
  review:{ic:'💚', nm:'Revisão', ds:'Cure cicatrizes de erro.', risk:'cura'}
};
const BOSS_PHASES = [
  {id:'q1', nm:'Q1 Assembly', ic:'🧾', hp:2},
  {id:'q2', nm:'Q2 Datapath', ic:'🛣️', hp:2},
  {id:'q3', nm:'Q3 Tempos', ic:'⏱', hp:2},
  {id:'q4', nm:'Q4 Pipeline', ic:'🚉', hp:1}
];
const ROGUE_REWARDS = [
  {id:'pc4', ic:'➕', nm:'PC+4', rarity:'comum', ds:'O primeiro erro da próxima sala não quebra combo.'},
  {id:'regwrite', ic:'🎛', nm:'RegWrite+', rarity:'comum', ds:'+25 XP ao vencer sala Controle.'},
  {id:'cache', ic:'🧠', nm:'Cache Mental', rarity:'rara', ds:'Erro em Tempo reduz dano e mostra fórmula.'},
  {id:'branch', ic:'🌿', nm:'Branch Sense', rarity:'rara', ds:'beq ou Pipeline sem ajuda dá +1 foco.'},
  {id:'ra', ic:'↩', nm:'$ra Salvo', rarity:'epica', ds:'Uma falha de chamada/retorno vira revisão, não dano.'},
  {id:'alu', ic:'⚡', nm:'ALU Overclock', rarity:'epica', ds:'Combo 5+ causa dano dobrado no boss.'},
  {id:'clock', ic:'🔥', nm:'Clock Agressivo', rarity:'risco', ds:'+50% XP, mas erro em Tempo custa 2 HP.'},
  {id:'checklist', ic:'✅', nm:'Checklist da Lista', rarity:'cura', ds:'Revisão perfeita cura 1 HP extra.'}
];
```

- [ ] **Step 5: Add RUN state**

After `G`, add:

```js
const RUN = {
  active:false, step:0, maxSteps:6, hp:3, maxHp:3, focus:2, combo:0, bestCombo:0,
  earned:0, roomsWon:0, choices:[], rewards:[], scars:[], assisted:false,
  phase:0, phaseHp:0, boss:false, bossCleared:[], currentRoom:null,
  freeShield:false, stats:{datapath:0,control:0,time:0,pipeline:0,assembly:0,review:0},
  weak:{}
};
```

- [ ] **Step 6: Add small helpers**

Near `shuffle`, add:

```js
const sample = (arr,n) => shuffle(arr).slice(0,n);
const hasReward = id => RUN.rewards.some(r=>r.id===id);
function resetRun(){
  Object.assign(RUN, {
    active:true, step:0, maxSteps:6, hp:3, maxHp:3, focus:2, combo:0, bestCombo:0,
    earned:0, roomsWon:0, choices:[], rewards:[], scars:[], assisted:false,
    phase:0, phaseHp:0, boss:false, bossCleared:[], currentRoom:null,
    freeShield:false, stats:{datapath:0,control:0,time:0,pipeline:0,assembly:0,review:0},
    weak:{}
  });
}
function addScar(id, label, tip){
  const found=RUN.scars.find(s=>s.id===id);
  if(found){ found.count++; return; }
  RUN.scars.push({id,label,tip,count:1});
}
function markWeak(key){ RUN.weak[key]=(RUN.weak[key]||0)+1; }
```

- [ ] **Step 7: Verify**

Run shared JS check.

Expected: no syntax errors.

- [ ] **Step 8: Checkpoint**

Copy to `mips-datapath-quest.after-task-3.html`.

---

### Task 4: Build Run Map And Room Selection

**Files:**
- Modify: `D:\Projetos\Arq2\mips-datapath-quest.html`

- [ ] **Step 1: Create checkpoint**

Copy current HTML to `mips-datapath-quest.before-task-4.html`.

- [ ] **Step 2: Implement room generation**

After `startFree()`, add:

```js
function startRoguelikeRun(){
  resetRun();
  RUN.choices = nextRoomChoices();
  renderRunMap();
  showScreen('scr-run-map');
}
function nextRoomChoices(){
  if(RUN.step>=RUN.maxSteps) return [{type:'boss'}];
  const base = ['datapath','control','time','pipeline'];
  if(RUN.step>=1) base.push('assembly');
  if(RUN.scars.length || RUN.step>=2) base.push('review');
  return sample(base, Math.min(3, base.length)).map(type=>({type}));
}
function makeRoomQuestion(type){
  if(type==='datapath') return q1(sample(['R','lw','sw','beq','j'],1)[0], RUN.step<2?'easy':RUN.step<5?'med':'hard');
  if(type==='control') return q2(sample(['R','lw','sw','beq'],1)[0], RUN.step<2?'easy':RUN.step<5?'med':'hard');
  if(type==='time'){
    const pool = [
      q3('single',{instr:sample(['R','lw','sw','beq'],1)[0]},'med'),
      q3('period',{},'med'),
      q3('benchmark',{name:'GCC',fromList:true,mix:{lw:22,sw:11,R:49,beq:16,j:2}},'hard'),
      q3('benchmark',{name:'ABC',fromList:true,mix:{lw:11,sw:49,R:22,beq:2,j:16}},'hard')
    ];
    return sample(pool,1)[0];
  }
  if(type==='pipeline') return q4(RUN.step<3?'med':'hard');
  if(type==='assembly') return q5(sample(['call','memory','limit','loop','formula','trace'],1)[0], RUN.step<3?'med':'hard');
  if(type==='review') return makeReviewQuestion();
}
```

- [ ] **Step 3: Implement map renderer**

Add:

```js
function renderRunMap(){
  $('runMiniHUD').innerHTML = `
    <span class="run-pill">HP ${'❤️'.repeat(RUN.hp)}${'🖤'.repeat(Math.max(0,RUN.maxHp-RUN.hp))}</span>
    <span class="run-pill">Foco ${RUN.focus}</span>
    <span class="run-pill">Combo x${RUN.combo}</span>
    <span class="run-pill">XP +${RUN.earned}</span>`;
  $('runBossHUD').innerHTML = BOSS_PHASES.map((p,i)=>{
    const done=RUN.bossCleared.includes(p.id), active=RUN.boss && i===RUN.phase;
    const hp = active ? RUN.phaseHp : done ? 0 : p.hp;
    const pct = Math.max(0, Math.round((hp/p.hp)*100));
    return `<div class="boss-phase ${active?'active':''}"><b>${p.ic} ${p.nm}</b><div class="boss-bar"><div class="boss-fill" style="width:${pct}%"></div></div></div>`;
  }).join('');
  $('runPath').innerHTML = Array.from({length:RUN.maxSteps},(_,i)=>`<div class="run-node ${i<RUN.step?'done':i===RUN.step?'active':''}">${i+1}</div>`).join('') + `<div class="run-node ${RUN.step>=RUN.maxSteps?'active':''}">👑</div>`;
  $('runInventory').innerHTML = RUN.rewards.map(r=>`<span class="run-pill">${r.ic} ${r.nm}</span>`).join('') +
    RUN.scars.map(s=>`<span class="scar">⚠ ${s.label}${s.count>1?' x'+s.count:''}</span>`).join('');
  renderRoomChoices();
}
function renderRoomChoices(){
  const wrap=$('runChoices');
  wrap.innerHTML = RUN.choices.map((c,i)=>{
    if(c.type==='boss') return `<button class="room-card" onclick="startBoss()"><div class="ic">👑</div><h3>Boss Final</h3><p>Enfrente a Lista 3 inteira.</p><div class="risk">obrigatorio</div></button>`;
    const r=ROOM_TYPES[c.type];
    return `<button class="room-card" onclick="chooseRunRoom(${i})"><div class="ic">${r.ic}</div><h3>${r.nm}</h3><p>${r.ds}</p><div class="risk">risco: ${r.risk}</div></button>`;
  }).join('');
}
function chooseRunRoom(idx){
  const room=RUN.choices[idx]; RUN.currentRoom=room.type; RUN.assisted=false;
  G.free=false; G.mode='rogue'; G.level=RUN.step+1; G.queue=[makeRoomQuestion(room.type)]; G.idx=0; G.lives=RUN.hp; G.earned=0;
  showScreen('scr-game'); renderQuestion();
}
```

- [ ] **Step 4: Wire Home button**

Change `btnRogue` handler:

```js
$('btnRogue').onclick=()=>{ sfx.click(); startRoguelikeRun(); };
```

- [ ] **Step 5: Verify**

Run shared JS check.

Manual:

- click Roguelike;
- see run map;
- choose Datapath/Control/Time/Pipeline if shown;
- existing question renders.

- [ ] **Step 6: Checkpoint**

Copy to `mips-datapath-quest.after-task-4.html`.

---

### Task 5: Integrate Roguelike Progress With Existing Question Engine

**Files:**
- Modify: `D:\Projetos\Arq2\mips-datapath-quest.html`

- [ ] **Step 1: Create checkpoint**

Copy current HTML to `mips-datapath-quest.before-task-5.html`.

- [ ] **Step 2: Update progress display in `renderQuestion()`**

Replace the `qProgress` line with:

```js
$('qProgress').textContent = RUN.active
  ? (RUN.boss ? `Boss ${RUN.phase+1}/4` : `Sala ${RUN.step+1}/${RUN.maxSteps}`)
  : G.free ? `Livre · ${G.idx+1}` : `${G.idx+1}/${G.queue.length}`;
```

- [ ] **Step 3: Add mode 5 dispatch placeholder**

Change dispatch:

```js
({1:renderMode1,2:renderMode2,3:renderMode3,4:renderMode4,5:renderMode5})[q.mode](q, body, act);
```

Add temporary stub before Task 6:

```js
function renderMode5(q, body, act){
  body.innerHTML = `<p class="prompt">Treinador Assembly em construção: ${q.kind}</p>`;
  addCheck(act, ()=>questionSolved(0));
}
```

- [ ] **Step 4: Track assisted run**

In the `teachBtn.onclick`, after `G.assisted=true`, add:

```js
if(RUN.active) RUN.assisted=true;
```

In the hint handler, after `G.usedHint=true`, add:

```js
if(RUN.active && RUN.focus>0) RUN.focus--;
```

- [ ] **Step 5: Route solved questions into run flow**

At the top of `questionSolved(extraPts)`, keep current scoring but after `checkAchievements(q);` and before creating the normal next button, branch:

```js
if(RUN.active){
  runQuestionSolved(q, pts);
  return;
}
```

Add:

```js
function runQuestionSolved(q, pts){
  RUN.combo++;
  RUN.bestCombo=Math.max(RUN.bestCombo,RUN.combo);
  RUN.earned += pts;
  if(RUN.currentRoom && RUN.stats[RUN.currentRoom]!==undefined) RUN.stats[RUN.currentRoom]++;
  if(RUN.boss){
    const dmg = hasReward('alu') && RUN.combo>=5 ? 2 : 1;
    RUN.phaseHp = Math.max(0, RUN.phaseHp-dmg);
    if(RUN.phaseHp<=0) advanceBossPhase();
    else showRunContinue('Continuar boss', ()=>renderQuestion());
    return;
  }
  RUN.roomsWon++;
  showRewardChoices();
}
function showRunContinue(label, fn){
  const act=$('qActions'); act.innerHTML='';
  const nx=document.createElement('button'); nx.className='btn green'; nx.textContent=label; nx.onclick=fn; act.appendChild(nx);
}
```

- [ ] **Step 6: Route failures into run flow**

At the start of `loseLife()`, before `if(G.free) return`, add:

```js
if(RUN.active){ runLoseLife(); return; }
```

Add:

```js
function runLoseLife(){
  if(hasReward('pc4') && !RUN.freeShield){ RUN.freeShield=true; RUN.combo=0; toast('➕ PC+4','O erro foi absorvido sem perder HP.'); return; }
  RUN.combo=0;
  let dmg = (RUN.currentRoom==='time' && hasReward('clock')) ? 2 : 1;
  if(RUN.currentRoom==='time' && hasReward('cache')) dmg = 0;
  RUN.hp = Math.max(0, RUN.hp-dmg);
  G.lives=RUN.hp; updateLivesHUD();
  if(RUN.hp<=0) loseRun();
}
```

- [ ] **Step 7: Add reward screen**

Add:

```js
function showRewardChoices(){
  const body=$('qBody'), act=$('qActions');
  body.innerHTML = `<h3>Escolha uma recompensa</h3><p class="muted">Sua build desta run:</p>
    <div class="run-choices">${sample(ROGUE_REWARDS.filter(r=>!hasReward(r.id)),3).map(r=>`
      <button class="reward-card" data-r="${r.id}">
        <div class="ic">${r.ic}</div><h3>${r.nm}</h3><p>${r.ds}</p><div class="rarity">${r.rarity}</div>
      </button>`).join('')}</div>`;
  act.innerHTML='';
  body.querySelectorAll('.reward-card').forEach(btn=>{
    btn.onclick=()=>{ const r=ROGUE_REWARDS.find(x=>x.id===btn.dataset.r); applyReward(r); };
  });
}
function applyReward(r){
  if(r) RUN.rewards.push(r);
  if(r && r.id==='checklist' && RUN.hp<RUN.maxHp) RUN.hp++;
  RUN.step++;
  RUN.freeShield=false;
  if(RUN.step>=RUN.maxSteps){ RUN.choices=[{type:'boss'}]; }
  else RUN.choices=nextRoomChoices();
  renderRunMap(); showScreen('scr-run-map');
}
```

- [ ] **Step 8: Add run loss**

Add:

```js
function loseRun(){
  RUN.active=false;
  sfx.lose();
  $('resEmoji').textContent='💀';
  $('resTitle').textContent='Run encerrada';
  $('resSub').textContent='A prova venceu desta vez, mas suas cicatrizes mostram exatamente o que revisar.';
  $('resStats').innerHTML = runResultHTML(false);
  const nx=$('resNext'); nx.style.display=''; nx.textContent='🌀 Nova run'; nx.onclick=startRoguelikeRun;
  showScreen('scr-result');
}
function runResultHTML(win){
  const scars = RUN.scars.length ? RUN.scars.map(s=>`${s.label}${s.count>1?' x'+s.count:''}`).join(' · ') : 'nenhuma';
  return `<div class="rs">Resultado<b>${win?'Vitória':'Derrota'}</b></div>
    <div class="rs">XP da run<b>+${RUN.earned}</b></div>
    <div class="rs">Combo máximo<b>x${RUN.bestCombo}</b></div>
    <div class="rs">Salas vencidas<b>${RUN.roomsWon}</b></div>
    <div class="rs">Cicatrizes<b>${scars}</b></div>`;
}
```

- [ ] **Step 9: Verify**

Run shared JS check.

Manual:

- start run;
- clear one non-Assembly room;
- choose reward;
- return to map;
- intentionally fail until HP reaches 0;
- result shows run ended.

- [ ] **Step 10: Checkpoint**

Copy to `mips-datapath-quest.after-task-5.html`.

---

### Task 6: Implement Assembly Q1 Mode

**Files:**
- Modify: `D:\Projetos\Arq2\mips-datapath-quest.html`

- [ ] **Step 1: Create checkpoint**

Copy current HTML to `mips-datapath-quest.before-task-6.html`.

- [ ] **Step 2: Add Assembly question data**

Before `renderMode5`, add:

```js
const ASM_QUESTIONS = {
  call:{
    title:'Chamada de função',
    prompt:'Qual sequência chama quadrado(i) e guarda o retorno?',
    code:'add $a0, $zero, $s0\\njal quadrado\\nadd $s4, $zero, $v0',
    options:[
      {t:'Usa $a0 para argumento, jal para chamar e $v0 como retorno.', ok:true},
      {t:'Usa $v0 para argumento antes do jal.', ok:false, scar:['asm_ret','Retorno de função','O retorno vem em $v0 depois da função.']},
      {t:'Usa jr $ra para chamar a função.', ok:false, scar:['asm_call','Chamada de função','jr $ra retorna; jal chama e salva retorno.']}
    ]
  },
  memory:{
    title:'Memória e parâmetros',
    prompt:'A Lista 3 diz que base e quantidade estão nas duas primeiras posições livres da memória. Como ler?',
    code:'lw $a0, 0($s7)\\nlw $a1, 4($s7)',
    options:[
      {t:'lw $a0, 0($s7) e lw $a1, 4($s7)', ok:true},
      {t:'sw $a0, 0($s7) e sw $a1, 4($s7)', ok:false, scar:['mem_load','Leitura de memória','Para ler parametros da memória use lw, nao sw.']},
      {t:'add $a0, $s7, $zero e add $a1, $s7, $zero', ok:false, scar:['mem_addr','Endereço vs conteúdo','O endereço base nao e o conteúdo guardado na memória.']}
    ]
  },
  limit:{
    title:'Limite máximo 30',
    prompt:'Se n > 30, a função deve usar 30. Qual ideia está correta?',
    code:'addi $t0, $zero, 30\\n# se n > 30, n = 30',
    options:[
      {t:'Comparar n com 30 e sobrescrever n com 30 quando passar.', ok:true},
      {t:'Encerrar o programa se n for maior que 30.', ok:false, scar:['limit30','Limite 30','A lista manda usar 30, nao abortar.']},
      {t:'Ignorar o limite porque a memória é grande.', ok:false, scar:['limit30','Limite 30','A quantidade maxima da lista e 30.']}
    ]
  },
  loop:{
    title:'Loop do vetor',
    prompt:'Qual ordem de blocos monta o loop de i=0 até n-1?',
    order:['inicializa i=0 e soma=0','testa se i == n','calcula y[i]','grava y[i] na memória','soma y[i] no acumulador','incrementa i e volta ao teste'],
    options:null
  },
  formula:{
    title:'Fórmula par/impar',
    prompt:'Para i par, qual fórmula a Q1 pede?',
    code:'se i par: y[i] = ?\\nse i impar: y[i] = i^2',
    options:[
      {t:'2*i^2 + 2*i + 1', ok:true},
      {t:'i^2', ok:false, scar:['formula_even','Formula par','i^2 e o caso impar. O par usa 2*i^2+2*i+1.']},
      {t:'2*i + 1', ok:false, scar:['formula_even','Formula par','Faltou o termo 2*i^2.']}
    ]
  },
  trace:{
    title:'Trace pequeno',
    prompt:'Para i=2, quanto vale y[i] no caso par?',
    answer:13,
    explain:'2*2^2 + 2*2 + 1 = 8 + 4 + 1 = 13',
    scar:['trace_formula','Trace da fórmula','Treine substituir i na fórmula antes de codar.']
  }
};
```

- [ ] **Step 3: Replace `renderMode5` stub**

Implement:

```js
function renderMode5(q, body, act){
  const item = ASM_QUESTIONS[q.kind] || ASM_QUESTIONS.call;
  q.asmItem=item;
  body.innerHTML = `<div class="instr-box"><span class="lbl">Q1 Assembly</span>${item.title}</div>
    <p class="prompt">${item.prompt}</p>
    ${item.code?`<pre class="asm-code">${item.code}</pre>`:''}
    <div class="asm-options" id="asmOptions"></div>`;
  const wrap=$('asmOptions');
  if(q.kind==='trace') renderAsmTrace(q,item,wrap,act);
  else if(q.kind==='loop') renderAsmOrder(q,item,wrap,act);
  else renderAsmChoice(q,item,wrap,act);
}
function renderAsmChoice(q,item,wrap,act){
  let picked=-1;
  item.options.forEach((opt,i)=>{
    const b=document.createElement('button'); b.className='asm-option'; b.textContent=opt.t;
    b.onclick=()=>{ picked=i; wrap.querySelectorAll('.asm-option').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); };
    wrap.appendChild(b);
  });
  addCheck(act,()=>{
    if(picked<0){ failNum('Escolha uma alternativa.'); return; }
    const opt=item.options[picked];
    if(opt.ok){ q.explainOK='Assembly Q1: '+item.title+' dominado.'; questionSolved(20); }
    else { if(opt.scar && RUN.active) addScar(opt.scar[0],opt.scar[1],opt.scar[2]); failAsm(opt.scar?opt.scar[2]:'Revise este bloco.'); }
  });
}
function renderAsmOrder(q,item,wrap,act){
  const shuffled=shuffle(item.order); const picked=[];
  shuffled.forEach(txt=>{
    const b=document.createElement('button'); b.className='asm-option'; b.textContent=txt;
    b.onclick=()=>{ if(b.classList.contains('sel')) return; b.classList.add('sel'); picked.push(txt); b.textContent=picked.length+'. '+txt; };
    wrap.appendChild(b);
  });
  addCheck(act,()=>{
    const ok = picked.length===item.order.length && item.order.every((x,i)=>picked[i]===x);
    if(ok){ q.explainOK='Loop da Q1 em ordem correta.'; questionSolved(30); }
    else { if(RUN.active) addScar('loop_q1','Loop do vetor','O loop precisa testar limite, calcular, gravar, acumular e incrementar.'); failAsm('A ordem do loop ainda nao fecha. Pense: testa limite antes de gravar y[i], incrementa no fim.'); }
  });
}
function renderAsmTrace(q,item,wrap,act){
  wrap.innerHTML=`<div class="numrow" id="asmTrace"><label>y[2] =</label><input id="asmAns" inputmode="decimal" placeholder="ex: 13"></div>`;
  addCheck(act,()=>{
    const ok=near($('asmAns').value,item.answer,0.001); mark('asmTrace',ok);
    if(ok){ q.explainOK=item.explain; questionSolved(25); }
    else { if(RUN.active) addScar(item.scar[0],item.scar[1],item.scar[2]); failAsm(item.explain); }
  });
}
function failAsm(msg){
  G.errInQ++; runLoseLife();
  const fb=$('feedback'); fb.className='feedback err show'; fb.innerHTML='❌ '+msg;
  sfx.err();
}
```

- [ ] **Step 4: Update `teachForQuestion` for mode 5**

Before the pipeline `else`, add:

```js
  } else if(q.mode===5){
    fb.innerHTML=`📖 <b>Q1 Assembly em blocos:</b>
      <ul><li><b>$a0/$a1</b>: argumentos da função.</li>
      <li><b>jal</b>: chama função e salva retorno em $ra.</li>
      <li><b>$v0</b>: registrador de retorno.</li>
      <li><b>jr $ra</b>: volta para quem chamou.</li>
      <li><b>lw/sw</b>: ler parametros e gravar vetor na memória.</li>
      <li><b>limite 30</b>: se passar, use 30.</li></ul>`;
```

- [ ] **Step 5: Verify**

Run shared JS check.

Manual:

- start run until Assembly appears, or temporarily force `RUN.choices=[{type:'assembly'}]` in console;
- test `call`, `memory`, `limit`, `loop`, `formula`, `trace`;
- ensure wrong answers create scars and reduce HP.

- [ ] **Step 6: Checkpoint**

Copy to `mips-datapath-quest.after-task-6.html`.

---

### Task 7: Implement Review Rooms And Scars

**Files:**
- Modify: `D:\Projetos\Arq2\mips-datapath-quest.html`

- [ ] **Step 1: Create checkpoint**

Copy current HTML to `mips-datapath-quest.before-task-7.html`.

- [ ] **Step 2: Add review question factory**

Near `makeRoomQuestion`, add:

```js
function makeReviewQuestion(){
  const scar = RUN.scars[0];
  if(!scar) return {mode:5,diff:'easy',kind:'review-rest', hint:'Sem cicatrizes: use esta sala para respirar e recuperar foco.'};
  return {mode:5,diff:'easy',kind:'review', scar,
    hint:'Revisao pega um erro real da sua run e transforma em microquestao.'};
}
```

- [ ] **Step 3: Extend `renderMode5` for review**

At the top of `renderMode5`, handle review:

```js
if(q.kind==='review-rest'){
  body.innerHTML=`<h3>💚 Descanso tático</h3><p class="prompt">Sem cicatrizes ativas. Revise: argumentos entram em $a0/$a1 e retornos saem em $v0.</p>`;
  addCheck(act,()=>{ RUN.focus++; q.explainOK='+1 foco recuperado.'; questionSolved(0); });
  return;
}
if(q.kind==='review'){
  body.innerHTML=`<h3>💚 Revisão: ${q.scar.label}</h3><p class="prompt">${q.scar.tip}</p><p>Qual é a atitude correta?</p><div class="asm-options" id="asmOptions"></div>`;
  const wrap=$('asmOptions'); let picked=false;
  ['Aplicar esta regra na próxima tentativa','Ignorar porque foi só azar'].forEach((txt,i)=>{
    const b=document.createElement('button'); b.className='asm-option'; b.textContent=txt;
    b.onclick=()=>{ picked=i===0; wrap.querySelectorAll('.asm-option').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); };
    wrap.appendChild(b);
  });
  addCheck(act,()=>{
    if(picked){ RUN.scars.shift(); RUN.hp=Math.min(RUN.maxHp,RUN.hp+1+(hasReward('checklist')?1:0)); q.explainOK='Cicatriz removida e HP recuperado.'; questionSolved(10); }
    else failAsm('Revisao serve para corrigir padrao de erro, nao para ignorar.');
  });
  return;
}
```

- [ ] **Step 4: Add scars for existing modes**

In wrong paths:

- Mode 1 wrong click: call `addScar('datapath_order','Ordem do datapath','Revise a ordem das unidades funcionais da instrucao.')`.
- Mode 2 wrong signal: call `addScar('sig_'+nm,nm,SIG_INFO[nm].what)`.
- Mode 3 wrong numeric: call `addScar('tempo_'+q.t3type,'Calculo de tempos','Monte a formula antes de responder.')`.
- Mode 4 wrong zone: call `addScar('pipeline','Pipeline','Mapeie unidade para IF, ID, EX, MEM ou WB.')`.

Guard each with concrete calls. Examples:

```js
if(RUN.active) addScar('datapath_order','Ordem do datapath','Revise a ordem das unidades funcionais da instrucao.');
if(RUN.active) addScar('sig_'+nm,nm,SIG_INFO[nm].what);
if(RUN.active) addScar('tempo_'+q.t3type,'Calculo de tempos','Monte a formula antes de responder.');
if(RUN.active) addScar('pipeline','Pipeline','Mapeie unidade para IF, ID, EX, MEM ou WB.');
```

- [ ] **Step 5: Verify**

Run shared JS check.

Manual:

- intentionally miss a control signal;
- return to map after reward/loss path if alive;
- choose Review;
- confirm scar appears and can be removed.

- [ ] **Step 6: Checkpoint**

Copy to `mips-datapath-quest.after-task-7.html`.

---

### Task 8: Implement Boss Final And Run Results

**Files:**
- Modify: `D:\Projetos\Arq2\mips-datapath-quest.html`

- [ ] **Step 1: Create checkpoint**

Copy current HTML to `mips-datapath-quest.before-task-8.html`.

- [ ] **Step 2: Add boss question generator**

Add:

```js
function startBoss(){
  RUN.boss=true; RUN.phase=0; RUN.bossCleared=[]; startBossPhase();
}
function startBossPhase(){
  const phase=BOSS_PHASES[RUN.phase];
  RUN.phaseHp=phase.hp; RUN.currentRoom=phase.id==='q1'?'assembly':phase.id==='q2'?'control':phase.id==='q3'?'time':'pipeline';
  G.mode='rogue'; G.level=RUN.maxSteps+RUN.phase+1; G.queue=[makeBossQuestion(phase.id)]; G.idx=0; G.lives=RUN.hp;
  showScreen('scr-game'); renderQuestion();
}
function makeBossQuestion(id){
  if(id==='q1') return q5(sample(['call','memory','limit','loop','formula','trace'],1)[0],'hard');
  if(id==='q2') return sample([q1('lw','hard'),q1('sw','hard'),q2('lw','hard'),q2('beq','hard'),q2('R','hard')],1)[0];
  if(id==='q3') return sample([
    q3('single',{instr:'lw'},'hard'),
    q3('benchmark',{name:'GCC',fromList:true,mix:{lw:22,sw:11,R:49,beq:16,j:2}},'hard'),
    q3('benchmark',{name:'ABC',fromList:true,mix:{lw:11,sw:49,R:22,beq:2,j:16}},'hard')
  ],1)[0];
  return q4('hard');
}
function advanceBossPhase(){
  const phase=BOSS_PHASES[RUN.phase];
  RUN.bossCleared.push(phase.id);
  RUN.phase++;
  if(RUN.phase>=BOSS_PHASES.length){ winRun(); return; }
  showRunContinue('Próxima fase do boss →', startBossPhase);
}
function winRun(){
  RUN.active=false; sfx.win(); save.xp+=RUN.earned; persist();
  $('resEmoji').textContent='👑';
  $('resTitle').textContent='Lista 3 derrotada!';
  $('resSub').textContent='Voce fechou a run roguelike da prova.';
  $('resStats').innerHTML=runResultHTML(true);
  const nx=$('resNext'); nx.style.display=''; nx.textContent='🌀 Jogar outra run'; nx.onclick=startRoguelikeRun;
  showScreen('scr-result');
}
```

- [ ] **Step 3: Ensure `save.xp` is not double-added**

Review `questionSolved`: it currently adds XP immediately to `save.xp`. For run mode, decide one of:

- keep immediate XP and remove `save.xp+=RUN.earned` from `winRun`; or
- branch scoring so run XP is only paid at end.

Recommended MVP: keep current immediate XP behavior for simplicity, and in `winRun()` remove `save.xp+=RUN.earned`.

Expected final `winRun()`:

```js
function winRun(){
  RUN.active=false; sfx.win(); persist();
  $('resEmoji').textContent='👑';
  $('resTitle').textContent='Lista 3 derrotada!';
  $('resSub').textContent='Voce fechou a run roguelike da prova.';
  $('resStats').innerHTML=runResultHTML(true);
  const nx=$('resNext');
  nx.style.display='';
  nx.textContent='🌀 Jogar outra run';
  nx.onclick=startRoguelikeRun;
  showScreen('scr-result');
}
```

- [ ] **Step 4: Update result navigation**

In `resMap.onclick`, if a run just ended no special case is needed. `resNext` starts a new run.

- [ ] **Step 5: Verify**

Run shared JS check.

Manual:

- force `RUN.step=RUN.maxSteps; RUN.choices=[{type:'boss'}]; renderRunMap(); showScreen('scr-run-map');`
- enter boss;
- clear Q1-Q4;
- result shows victory.

- [ ] **Step 6: Checkpoint**

Copy to `mips-datapath-quest.after-task-8.html`.

---

### Task 9: Polish Academia, Achievements, And Copy

**Files:**
- Modify: `D:\Projetos\Arq2\mips-datapath-quest.html`

- [ ] **Step 1: Create checkpoint**

Copy current HTML to `mips-datapath-quest.before-task-9.html`.

- [ ] **Step 2: Update Academia table Q1 row**

Replace the Q1 row:

```html
<tr><td>Q1 — programar 2 funções em assembly MIPS (vetor + quadrado)</td><td>Roguelike da Prova + Modo 5 (Treinador Assembly): chamada, memória, loop, limite 30 e fórmula par/impar</td></tr>
```

- [ ] **Step 3: Add one roguelike achievement**

Add to `ACHIEVEMENTS`:

```js
{id:'rogue_clear', ic:'👑', nm:'Derrotou a Lista 3', ds:'Venceu uma run do Roguelike da Prova.'}
```

In `winRun()`, call:

```js
unlock('rogue_clear');
```

- [ ] **Step 4: Update tutorial final slide**

Mention the roguelike briefly in the final tutorial slide:

```html
<p>Quando quiser simular a prova inteira, jogue o <b>Roguelike da Prova</b>: cada erro vira revisão e cada run monta uma build diferente.</p>
```

- [ ] **Step 5: Improve run copy**

Make sure visible text uses consistent terms:

- `HP`
- `Foco`
- `Combo`
- `Cicatriz`
- `Relíquia`
- `Boss Final Lista 3`

- [ ] **Step 6: Verify**

Run shared JS check.

Manual:

- Academia shows Q1 as covered;
- achievements screen still renders;
- tutorial still advances.

- [ ] **Step 7: Checkpoint**

Copy to `mips-datapath-quest.after-task-9.html`.

---

### Task 10: Full Verification Pass

**Files:**
- Modify: none unless bugs are found.

- [ ] **Step 1: Run JS syntax check**

Run shared verification command.

Expected: exit code `0`.

- [ ] **Step 2: Open game in browser**

Open:

```text
D:\Projetos\Arq2\mips-datapath-quest.html
```

Expected: Home loads without console errors.

- [ ] **Step 3: Smoke original modes**

Run one question from:

- Modo 1;
- Modo 2;
- Modo 3;
- Modo 4;
- Academia lesson.

Expected: original game still works.

- [ ] **Step 4: Smoke roguelike victory**

Start `Roguelike da Prova`, play until boss, clear all boss phases.

Expected:

- run map works;
- rewards apply;
- boss progresses Q1-Q4;
- victory result appears.

- [ ] **Step 5: Smoke roguelike defeat**

Start another run and intentionally answer wrong until HP 0.

Expected:

- HP drops;
- scars appear;
- defeat result appears;
- new run button works.

- [ ] **Step 6: Smoke review room**

Create at least one scar, enter a Review room, answer correctly.

Expected:

- scar removed;
- HP/focus reward is applied.

- [ ] **Step 7: Smoke Modo Aprendiz and Modo Prova in run**

Toggle topbar mode.

Expected:

- Aprendiz shows `Me ensina`;
- Prova shows paid hint;
- no duplicate buttons after re-render.

- [ ] **Step 8: Mobile/touch sanity**

Use a narrow viewport or browser devtools mobile emulation.

Expected:

- room cards fit;
- reward cards fit;
- Assembly options are tappable;
- existing Pipeline tap-to-pick still works.

- [ ] **Step 9: Final checkpoint**

Copy final file:

```powershell
Copy-Item -LiteralPath 'D:\Projetos\Arq2\mips-datapath-quest.html' -Destination 'D:\Projetos\Arq2\work\checkpoints\mips-datapath-quest.final-roguelike.html'
```

- [ ] **Step 10: Final note**

Report:

- changed file;
- verification commands run;
- browser result;
- any remaining limitations.

Suggested commit message if the folder later becomes a Git repo:

```text
feat: add Lista 3 roguelike study mode
```
