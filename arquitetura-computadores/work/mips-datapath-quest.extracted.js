
"use strict";
/* ===========================================================================
   3. JS â€” SEÃ‡ÃƒO A: ESTADO + PERSISTÃŠNCIA
   =========================================================================== */
const SAVE_KEY = 'mdq_save_v1';
const DEFAULT_SAVE = {
  xp:0,
  unlocked:1,          // maior nÃ­vel desbloqueado
  achievements:[],     // ids desbloqueados
  muted:false,
  totalCorrect:0,
  learnMode:true,      // Modo Aprendiz: ensina antes de cobrar (ligado por padrÃ£o)
  lessonsDone:[],      // ids de capÃ­tulos da Academia concluÃ­dos
  // contadores p/ conquistas
  ctlPerfectInstr:[]   // instruÃ§Ãµes com os 7 sinais corretos sem dica
};
let save = loadSave();

function loadSave(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(raw) return Object.assign({}, DEFAULT_SAVE, JSON.parse(raw));
  }catch(e){/* localStorage indisponÃ­vel */}
  return JSON.parse(JSON.stringify(DEFAULT_SAVE));
}
function persist(){
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(save)); }catch(e){}
  refreshHUD();
}
function refreshHUD(){
  document.getElementById('hudLevel').textContent = G.level || save.unlocked;
  document.getElementById('hudXP').textContent = save.xp;
  document.getElementById('homeProg').textContent =
    `XP ${save.xp} Â· NÃ­vel ${save.unlocked}/10 Â· ${save.achievements.length} conquistas Â· ${save.learnMode?'Modo Aprendiz ðŸŽ“':'Modo Prova ðŸ“'}`;
  document.getElementById('muteBtn').textContent = save.muted ? 'ðŸ”‡' : 'ðŸ”Š';
  const lt=document.getElementById('learnToggle');
  if(lt){ lt.textContent = save.learnMode ? 'ðŸŽ“' : 'ðŸ“'; lt.title = save.learnMode ? 'Modo Aprendiz (ensina) â€” clique p/ Modo Prova' : 'Modo Prova (sÃ³ teste) â€” clique p/ Modo Aprendiz'; }
}

/* ===========================================================================
   4. JS â€” SEÃ‡ÃƒO B: SOM (WebAudio, sem arquivos externos)
   =========================================================================== */
let audioCtx = null;
function beep(freq, dur, type='sine', vol=0.15){
  if(save.muted) return;
  try{
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type=type; o.frequency.value=freq;
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime+dur);
  }catch(e){}
}
const sfx = {
  ok(){ beep(660,.08,'triangle'); setTimeout(()=>beep(990,.12,'triangle'),70); },
  err(){ beep(200,.18,'sawtooth',.12); },
  click(){ beep(440,.04,'square',.08); },
  win(){ [523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,.15,'triangle'),i*90)); },
  ach(){ [784,1046,1318].forEach((f,i)=>setTimeout(()=>beep(f,.16,'sine',.18),i*110)); },
  lose(){ [330,260,180].forEach((f,i)=>setTimeout(()=>beep(f,.2,'sawtooth',.12),i*120)); }
};

/* ===========================================================================
   5. JS â€” SEÃ‡ÃƒO C: DADOS DO MIPS (unidades, sinais, tempos)
   =========================================================================== */

// --- Unidades funcionais: nome, tooltip, fase do pipeline ---
const UNITS = {
  pc:        {name:'PC',                     tip:'Program Counter â€” guarda o endereÃ§o da instruÃ§Ã£o atual.', phase:'IF'},
  imem:      {name:'MemÃ³ria de InstruÃ§Ãµes',  tip:'Busca a instruÃ§Ã£o no endereÃ§o apontado pelo PC.',         phase:'IF'},
  add4:      {name:'Somador +4',             tip:'Calcula PC+4 (prÃ³xima instruÃ§Ã£o).',                       phase:'IF'},
  regs:      {name:'Banco de Registradores', tip:'LÃª 2 registradores (rs, rt) e escreve 1 (no WB).',        phase:'ID/WB'},
  control:   {name:'Unidade de Controle',    tip:'Decodifica o opcode e gera todos os sinais de controle.', phase:'ID'},
  signext:   {name:'ExtensÃ£o de Sinal',      tip:'Estende o imediato de 16 â†’ 32 bits preservando o sinal.', phase:'ID'},
  sl2:       {name:'Shift Left 2',           tip:'Desloca 2 bits (Ã—4) o offset do desvio.',                 phase:'EX'},
  alu:       {name:'ULA',                    tip:'Unidade LÃ³gica e AritmÃ©tica â€” soma, subtrai, AND, ORâ€¦',   phase:'EX'},
  addbr:     {name:'Somador de Desvio',      tip:'Soma (PC+4) + (offset<<2) = endereÃ§o alvo do branch.',    phase:'EX'},
  dmem:      {name:'MemÃ³ria de Dados',       tip:'lw lÃª dados; sw escreve dados.',                          phase:'MEM'},
  muxRegDst: {name:'MUX RegDst',             tip:'Escolhe o registrador destino: rt (lw) ou rd (tipo-R).',  phase:'ID'},
  muxAluSrc: {name:'MUX ALUSrc',             tip:'Escolhe o 2Âº operando da ULA: registrador ou imediato.',  phase:'EX'},
  muxMemReg: {name:'MUX MemtoReg',           tip:'Escolhe o que volta ao reg.: saÃ­da da ULA ou da memÃ³ria.',phase:'WB'},
  muxPcSrc:  {name:'MUX PCSrc',              tip:'Escolhe o prÃ³ximo PC: PC+4 ou endereÃ§o de desvio.',       phase:'EX'}
};

// --- InstruÃ§Ãµes e seus dados ---
const INSTR = {
  R:  { key:'R',  label:'add $s1, $s2, $s3',  name:'tipo-R',
        desc:'OperaÃ§Ã£o registrador-registrador (add, sub, and, or, sltâ€¦).' },
  lw: { key:'lw', label:'lw $s1, 8($s2)',      name:'lw (load word)',
        desc:'Carrega da memÃ³ria para um registrador.' },
  sw: { key:'sw', label:'sw $s1, 8($s2)',      name:'sw (store word)',
        desc:'Armazena um registrador na memÃ³ria.' },
  beq:{ key:'beq',label:'beq $s1, $s2, Desvio',name:'beq (branch if equal)',
        desc:'Desvia se dois registradores forem iguais.' },
  j:  { key:'j',  label:'j Destino',           name:'j (jump)',
        desc:'Salto incondicional.' }
};

// --- Sinais de controle (ordem fixa). 'X' = don't care ---
const SIGNAL_NAMES = ['RegDst','ALUSrc','MemtoReg','RegWrite','MemRead','MemWrite','Branch'];
const CONTROL = {                         // valores corretos por instruÃ§Ã£o
  R:   [1,0,0,1,0,0,0],
  lw:  [0,1,1,1,1,0,0],
  sw:  ['X',1,'X',0,0,1,0],
  beq: ['X',0,'X',0,0,0,1]
};
// ExplicaÃ§Ã£o curta por sinal/instruÃ§Ã£o (para feedback do Modo 2)
const SIG_WHY = {
  RegDst:{1:'hÃ¡ registrador destino rd (campo da tipo-R).',0:'o destino Ã© rt (campo do lw).',X:'nÃ£o hÃ¡ escrita em registrador â†’ indiferente.'},
  ALUSrc:{1:'o 2Âº operando da ULA Ã© o imediato (offset/constante).',0:'o 2Âº operando vem de um registrador.'},
  MemtoReg:{1:'o valor escrito vem da MemÃ³ria de Dados (lw).',0:'o valor escrito vem da ULA (tipo-R).',X:'nÃ£o escreve em registrador â†’ indiferente.'},
  RegWrite:{1:'a instruÃ§Ã£o grava resultado em um registrador.',0:'a instruÃ§Ã£o NÃƒO grava em registrador.'},
  MemRead:{1:'precisa LER a MemÃ³ria de Dados (lw).',0:'nÃ£o lÃª a memÃ³ria.'},
  MemWrite:{1:'precisa ESCREVER na MemÃ³ria de Dados (sw).',0:'nÃ£o escreve na memÃ³ria.'},
  Branch:{1:'Ã© um desvio condicional (beq).',0:'nÃ£o Ã© desvio.'}
};
// O QUE CADA SINAL Ã‰ (definiÃ§Ã£o) + o que significa cada valor 0/1.
// Usado para ENSINAR dentro do Modo 2 enquanto o jogador decide.
const SIG_INFO = {
  RegDst:  {what:'Escolhe QUAL registrador serÃ¡ o destino da escrita (qual MUX seleciona o nÂº do registrador).',
            v0:'destino = rt (bits 20-16) â€” usado pela lw', v1:'destino = rd (bits 15-11) â€” usado pela tipo-R'},
  ALUSrc:  {what:'Escolhe o 2Âº operando da ULA: vem de um registrador ou Ã© o imediato?',
            v0:'2Âº operando = registrador lido (rt)', v1:'2Âº operando = imediato estendido (offset/constante)'},
  MemtoReg:{what:'Escolhe O QUE volta para o banco de registradores: o resultado da ULA ou o dado da memÃ³ria.',
            v0:'grava no registrador a saÃ­da da ULA', v1:'grava no registrador o dado lido da MemÃ³ria de Dados'},
  RegWrite:{what:'Habilita (ou nÃ£o) a ESCRITA no banco de registradores.',
            v0:'NÃƒO grava em registrador', v1:'grava o resultado em um registrador'},
  MemRead: {what:'Habilita a LEITURA da MemÃ³ria de Dados.',
            v0:'nÃ£o lÃª a memÃ³ria', v1:'lÃª a MemÃ³ria de Dados (instruÃ§Ã£o lw)'},
  MemWrite:{what:'Habilita a ESCRITA na MemÃ³ria de Dados.',
            v0:'nÃ£o escreve na memÃ³ria', v1:'escreve na MemÃ³ria de Dados (instruÃ§Ã£o sw)'},
  Branch:  {what:'Marca que a instruÃ§Ã£o Ã© um DESVIO condicional (combina com o Zero da ULA no MUX PCSrc).',
            v0:'nÃ£o Ã© desvio â†’ prÃ³ximo PC = PC+4', v1:'Ã© desvio (beq) â†’ se ULA Zero=1, PC = endereÃ§o de desvio'}
};

// --- Modelo de tempos do professor (ns) ---
const DEFAULT_TIMES = { imem:4, regread:1, alu:2, dmem:4, control:1, adder:1, regwrite:1 };
// Caminho crÃ­tico de cada instruÃ§Ã£o em funÃ§Ã£o dos tempos das unidades.
// (regread e regwrite usam o mesmo bloco "Banco de Registradores" = 1 ns)
function instrTime(instr, t){
  const reg = t.regread, wr = t.regwrite!==undefined?t.regwrite:t.regread;
  switch(instr){
    case 'lw':  return t.imem + reg + t.alu + t.dmem + wr; // 4+1+2+4+1 = 12
    case 'sw':  return t.imem + reg + t.alu + t.dmem;      // 4+1+2+4   = 11
    case 'R':   return t.imem + reg + t.alu + wr;          // 4+1+2+1   = 8
    case 'beq': return t.imem + reg + t.alu;               // 4+1+2     = 7
    case 'j':   return t.imem;                             // 4
  }
}
function periodUniciclo(t){
  return Math.max(...['lw','sw','R','beq','j'].map(i=>instrTime(i,t)));
}

// --- SequÃªncia (caminho de dados) percorrida por cada instruÃ§Ã£o (Modo 1) ---
// Lista ordenada de chaves de UNITS. NÂº de cliques = comprimento da lista.
const PATHS = {
  R:   ['pc','imem','regs','alu','muxMemReg','regs'],
  lw:  ['pc','imem','regs','signext','muxAluSrc','alu','dmem','muxMemReg','regs'],
  sw:  ['pc','imem','regs','signext','muxAluSrc','alu','dmem'],
  beq: ['pc','imem','regs','alu','addbr','muxPcSrc'],
  j:   ['pc','imem','muxPcSrc']
};
// rÃ³tulo amigÃ¡vel de cada passo (quando a unidade se repete, distingue leitura/escrita)
function stepLabel(instr, idx){
  const k = PATHS[instr][idx];
  if(k==='regs'){
    const firstRegs = PATHS[instr].indexOf('regs');
    return idx===firstRegs ? 'Banco Reg. (lÃª)' : 'Banco Reg. (escreve)';
  }
  return UNITS[k].name;
}

/* ===========================================================================
   6. JS â€” SEÃ‡ÃƒO D: SVG DO DATAPATH
   Desenho simplificado porÃ©m reconhecÃ­vel. Cada <g class="unit" id="u-CHAVE">.
   =========================================================================== */
function buildDatapathSVG(opts){
  opts = opts || {};
  const stages = opts.stages; // se true, inclui zonas do pipeline
  // helper p/ criar bloco retangular
  function box(key,x,y,w,h,label,sub){
    const lines = label.split('\n');
    let txt = lines.map((l,i)=>`<text x="${x+w/2}" y="${y+h/2 - (lines.length-1)*8 + i*16 + 5}" text-anchor="middle">${l}</text>`).join('');
    if(sub) txt += `<text class="sm" x="${x+w/2}" y="${y+h-7}" text-anchor="middle">${sub}</text>`;
    return `<g class="unit" id="u-${key}" data-key="${key}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"></rect>${txt}</g>`;
  }
  function mux(key,x,y,h){ // MUX vertical fininho
    return `<g class="unit" id="u-${key}" data-key="${key}">
      <rect x="${x}" y="${y}" width="22" height="${h}" rx="11"></rect>
      <text class="sm" x="${x+11}" y="${y+h/2+4}" text-anchor="middle" style="font-size:9px">M</text></g>`;
  }
  function alu(key,x,y){ // ULA em formato de "trapÃ©zio com bico"
    const pts = `${x},${y} ${x+58},${y+20} ${x+58},${y+78} ${x},${y+98} ${x},${y+62} ${x+18},${y+49} ${x},${y+36}`;
    return `<g class="unit" id="u-${key}" data-key="${key}">
      <polygon points="${pts}"></polygon>
      <text x="${x+34}" y="${y+53}" text-anchor="middle">ULA</text></g>`;
  }

  let zones = '';
  if(stages){
    const Z = [
      ['IF', 20, 230], ['ID', 300, 175], ['EX', 560, 170], ['MEM',745,170], ['WB',905,150]
    ];
    const ZW = {IF:255,ID:230,EX:150,MEM:150,WB:90};
    zones = Z.map(([s,x,y])=>`
      <g class="stagezone-g">
        <rect class="stagezone" data-stage="${s}" x="${x}" y="${y}" width="${ZW[s]}" height="${340-(y-150)}"></rect>
        <text class="zone-label" id="zl-${s}" x="${x+ZW[s]/2}" y="${y+ ((340-(y-150))/2)+8}">?</text>
      </g>`).join('');
  }

  return `<div class="svgwrap"><svg class="datapath" viewBox="0 0 1000 540" xmlns="http://www.w3.org/2000/svg">
    <!-- fios representativos -->
    <path class="wire" d="M76 300 H110"/>
    <path class="wire" d="M230 300 H320"/>
    <path class="wire" d="M55 250 V100 H150"/>
    <path class="wire" d="M460 300 H600"/>
    <path class="wire" d="M460 340 H540 V320"/>
    <path class="wire" d="M390 400 H540 V315"/>
    <path class="wire" d="M658 305 H760"/>
    <path class="wire" d="M880 305 H930 V300"/>
    <path class="wire" d="M952 290 V210 H300 V300"/>
    <path class="wire" d="M600 133 H560 V110"/>
    <!-- unidades -->
    ${box('add4',150,78,70,44,'Soma +4')}
    ${box('pc',30,250,46,72,'PC')}
    ${box('imem',110,250,120,100,'Mem.\nInstruÃ§Ãµes')}
    ${box('control',420,30,150,52,'Controle')}
    ${mux('muxRegDst',278,235,90)}
    ${box('regs',320,250,140,120,'Banco de\nRegistradores')}
    ${box('signext',330,388,118,40,'Ext. Sinal')}
    ${box('sl2',470,388,90,40,'Shift\nLeft 2')}
    ${mux('muxAluSrc',538,275,80)}
    ${alu('alu',600,256)}
    ${box('addbr',600,100,86,46,'Somador')}
    ${box('dmem',760,250,120,110,'Mem.\nDados')}
    ${mux('muxMemReg',930,260,80)}
    ${mux('muxPcSrc',278,110,70)}
    ${zones}
  </svg></div>`;
}

// Tooltip nas unidades (mouse + toque)
function wireTooltips(root){
  const tip = document.getElementById('tooltip');
  root.querySelectorAll('.unit').forEach(g=>{
    const k = g.dataset.key;
    const u = UNITS[k]; if(!u) return;
    function show(e){
      const p = e.touches ? e.touches[0] : e;
      tip.innerHTML = `<b>${u.name}</b><br>${u.tip}<br><span style="color:var(--cyan)">Fase: ${u.phase}</span>`;
      tip.style.display='block';
      tip.style.left = Math.min(p.clientX+12, window.innerWidth-250)+'px';
      tip.style.top = (p.clientY+14)+'px';
    }
    function hide(){ tip.style.display='none'; }
    g.addEventListener('mouseenter',show);
    g.addEventListener('mousemove',show);
    g.addEventListener('mouseleave',hide);
    g.addEventListener('touchstart',e=>{show(e);},{passive:true});
    g.addEventListener('touchend',()=>setTimeout(hide,1200));
  });
}

/* ===========================================================================
   7. JS â€” SEÃ‡ÃƒO E: BANCO DE QUESTÃ•ES
   Cada questÃ£o Ã© um objeto {mode, diff, ...params, hint}. Factories abaixo
   geram questÃµes reutilizÃ¡veis; LEVELS monta o jogo por nÃ­vel (>35 instÃ¢ncias).
   =========================================================================== */

// Factory Modo 1 (Roteirista â€” clicar unidades na ordem)
function q1(instr, diff){
  return {mode:1, diff, instr,
    hint:`Pense no fluxo: PC â†’ busca a instruÃ§Ã£o â†’ lÃª registradores â†’ ULA â†’ (memÃ³ria) â†’ escreve. A ${INSTR[instr].name} percorre ${PATHS[instr].length} blocos.`};
}
// Factory Modo 2 (Engenheiro de Controle â€” 7 toggles)
function q2(instr, diff){
  return {mode:2, diff, instr,
    hint:`Regra rÃ¡pida: RegWrite=1 sÃ³ se grava registrador (R, lw). ALUSrc=1 quando usa imediato (lw, sw). MemRead/MemWrite sÃ³ em lw/sw. Branch sÃ³ em beq.`};
}
// Factory Modo 3 (Calculadora de Tempos)
//   t3type: 'single' (1 instr), 'period' (uniciclo), 'benchmark' (mÃ©dia + speedup)
function q3(t3type, params, diff){
  return Object.assign({mode:3, diff, t3type, times:DEFAULT_TIMES}, params || {},
    {hint: t3type==='benchmark'
      ? 'Uniciclo: todas as instruÃ§Ãµes usam o MAIOR tempo (lw=12 ns). Multiciclo ideal: cada instruÃ§Ã£o leva seu prÃ³prio tempo â†’ mÃ©dia = Î£ (fraÃ§Ã£o Ã— tempo). Speedup = uniciclo / multiciclo.'
      : t3type==='period'
      ? 'O perÃ­odo do uniciclo Ã© determinado pela instruÃ§Ã£o mais lenta â€” a lw (4+1+2+4+1).'
      : `Some os blocos do caminho crÃ­tico. ${(params&&params.instr)||''}: Mem.Instr(4)+Reg(1)+ULA(2)${(params&&['lw','sw'].includes(params.instr))?'+Mem.Dados(4)':''}${(params&&['lw','R'].includes(params.instr))?'+EscreveReg(1)':''}.`});
}
// Factory Modo 4 (Pipeline Master)
function q4(diff){
  return {mode:4, diff,
    hint:'IF=busca (PC, Mem.Instr) Â· ID=decodifica (Banco Reg., Controle) Â· EX=executa (ULA) Â· MEM=memÃ³ria de dados Â· WB=escreve no registrador.'};
}
function q5(kind, diff){
  return {mode:5, diff, kind,
    hint:'Q1 pede funcoes MIPS: argumentos em $a0/$a1, retorno em $v0, chamada com jal, retorno com jr $ra, vetor com lw/sw, limite 30 e formula par/impar.'};
}

// --------- Montagem dos 10 nÃ­veis (lista de instÃ¢ncias por nÃ­vel) ----------
const LEVELS = [
  /* 1  */ { tier:'easy', label:'Sinais bÃ¡sicos', qs:[ q2('lw','easy'), q2('R','easy'), q1('R','easy') ] },
  /* 2  */ { tier:'easy', label:'Load & Store',   qs:[ q2('sw','easy'), q3('single',{instr:'lw'},'easy'), q1('lw','easy') ] },
  /* 3  */ { tier:'easy', label:'Desvio & fases', qs:[ q2('beq','easy'), q3('single',{instr:'R'},'easy'), q4('easy') ] },
  /* 4  */ { tier:'med',  label:'Store completo', qs:[ q1('sw','med'), q2('R','med'), q3('period',{},'med') ] },
  /* 5  */ { tier:'med',  label:'Comparando',     qs:[ q3('single',{instr:'beq'},'med'), q1('beq','med'), q2('sw','med') ] },
  /* 6  */ { tier:'med',  label:'Pipeline+tempo', qs:[ q4('med'), q3('single',{instr:'sw'},'med'), q2('beq','med') ] },
  /* 7  */ { tier:'med',  label:'Caminho do lw',  qs:[ q1('lw','med'), q3('period',{times:{imem:5,regread:1,alu:3,dmem:5,control:1,adder:1,regwrite:1}},'med'), q2('lw','med') ] },
  /* 8  */ { tier:'hard', label:'Benchmark GCC',  qs:[ q3('benchmark',{name:'GCC',fromList:true,mix:{lw:22,sw:11,R:49,beq:16,j:2}},'hard'), q2('sw','hard'), q1('beq','hard') ] },
  /* 9  */ { tier:'hard', label:'Benchmark ABC',  qs:[ q3('benchmark',{name:'ABC',fromList:true,mix:{lw:11,sw:49,R:22,beq:2,j:16}},'hard'), q4('hard'), q3('single',{instr:'lw'},'hard') ] },
  /* 10 */ { tier:'hard', label:'Prova final',    qs:[ q3('benchmark',{name:'GCC',fromList:true,mix:{lw:22,sw:11,R:49,beq:16,j:2}},'hard'), q2('beq','hard'), q3('period',{times:{imem:6,regread:2,alu:3,dmem:6,control:1,adder:1,regwrite:2}},'hard') ] }
];
const DIFF_POINTS = {easy:100, med:160, hard:260};
const HINT_COST = 50;
const ROOM_TYPES = {
  datapath:{ic:'ðŸ›£ï¸', nm:'Datapath', ds:'Clique o caminho da instrucao.', risk:'baixo'},
  control:{ic:'ðŸŽ›', nm:'Controle', ds:'Acerte os sinais de controle.', risk:'medio'},
  time:{ic:'â±', nm:'Tempo', ds:'Calcule caminho critico e speedup.', risk:'alto'},
  pipeline:{ic:'ðŸš‰', nm:'Pipeline', ds:'Mapeie IF, ID, EX, MEM, WB.', risk:'medio'},
  assembly:{ic:'ðŸ§¾', nm:'Assembly Q1', ds:'Funcoes, vetor, loop e formula.', risk:'alto'},
  review:{ic:'ðŸ’š', nm:'Revisao', ds:'Cure cicatrizes de erro.', risk:'cura'}
};
const BOSS_PHASES = [
  {id:'q1', nm:'Q1 Assembly', ic:'ðŸ§¾', hp:2},
  {id:'q2', nm:'Q2 Datapath', ic:'ðŸ›£ï¸', hp:2},
  {id:'q3', nm:'Q3 Tempos', ic:'â±', hp:2},
  {id:'q4', nm:'Q4 Pipeline', ic:'ðŸš‰', hp:1}
];
const ROGUE_REWARDS = [
  {id:'pc4', ic:'âž•', nm:'PC+4', rarity:'comum', ds:'O primeiro erro da proxima sala nao quebra combo.'},
  {id:'regwrite', ic:'ðŸŽ›', nm:'RegWrite+', rarity:'comum', ds:'+25 XP ao vencer sala Controle.'},
  {id:'cache', ic:'ðŸ§ ', nm:'Cache Mental', rarity:'rara', ds:'Erro em Tempo reduz dano e mostra formula.'},
  {id:'branch', ic:'ðŸŒ¿', nm:'Branch Sense', rarity:'rara', ds:'beq ou Pipeline sem ajuda da +1 foco.'},
  {id:'ra', ic:'â†©', nm:'$ra Salvo', rarity:'epica', ds:'Uma falha de chamada/retorno vira revisao, nao dano.'},
  {id:'alu', ic:'âš¡', nm:'ALU Overclock', rarity:'epica', ds:'Combo 5+ causa dano dobrado no boss.'},
  {id:'clock', ic:'ðŸ”¥', nm:'Clock Agressivo', rarity:'risco', ds:'+50% XP, mas erro em Tempo custa 2 HP.'},
  {id:'checklist', ic:'âœ…', nm:'Checklist da Lista', rarity:'cura', ds:'Revisao perfeita cura 1 HP extra.'}
];

/* ===========================================================================
   8. JS â€” SEÃ‡ÃƒO F: MOTOR DO JOGO
   =========================================================================== */
const G = {                 // estado da partida em andamento
  level:1, mode:'levels', queue:[], idx:0, lives:3,
  earned:0, usedHint:false, correctInQ:0, errInQ:0,
  timeStreak:0, qStart:0, free:false
};
const RUN = {
  active:false, step:0, maxSteps:6, hp:3, maxHp:3, focus:2, combo:0, bestCombo:0,
  earned:0, roomsWon:0, choices:[], rewards:[], scars:[], assisted:false,
  phase:0, phaseHp:0, boss:false, bossCleared:[], currentRoom:null,
  freeShield:false, stats:{datapath:0,control:0,time:0,pipeline:0,assembly:0,review:0},
  weak:{}
};
const $ = id => document.getElementById(id);
const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];} return a; };
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
function endRunContext(){
  RUN.active=false;
  RUN.boss=false;
  RUN.currentRoom=null;
}
function addScar(id, label, tip){
  const found=RUN.scars.find(s=>s.id===id);
  if(found){ found.count++; return; }
  RUN.scars.push({id,label,tip,count:1});
}
function markWeak(key){ RUN.weak[key]=(RUN.weak[key]||0)+1; }
const MODE_NAMES = {
  1:'ðŸŽ¬ Roteirista da InstruÃ§Ã£o',
  2:'ðŸŽ› Engenheiro de Controle',
  3:'â± Calculadora de Tempos',
  4:'ðŸš‰ Pipeline Master',
  5:'ðŸ§¾ Treinador Assembly'
};

// ---- Iniciar um nÃ­vel ----
function startLevel(n){
  endRunContext();
  G.level=n; G.free=false; G.mode='levels';
  G.queue = shuffle(LEVELS[n-1].qs);   // aleatoriza a ordem â†’ rejogÃ¡vel
  G.idx=0; G.lives=3; G.earned=0;
  showScreen('scr-game');
  renderQuestion();
}
// ---- Modo Livre: fila aleatÃ³ria infinita ----
function startFree(){
  endRunContext();
  G.free=true; G.mode='free';
  const all=[]; LEVELS.forEach(l=>l.qs.forEach(q=>all.push(q)));
  G.queue = shuffle(all); G.idx=0; G.lives=99; G.earned=0;
  showScreen('scr-game');
  renderQuestion();
}

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
  if(type==='review') return q2('lw','easy'); // placeholder ate a Task 7
}

function renderRunMap(){
  $('runMiniHUD').innerHTML = `
    <span class="run-pill">HP ${'â¤ï¸'.repeat(RUN.hp)}${'ðŸ–¤'.repeat(Math.max(0,RUN.maxHp-RUN.hp))}</span>
    <span class="run-pill">Foco ${RUN.focus}</span>
    <span class="run-pill">Combo x${RUN.combo}</span>
    <span class="run-pill">XP +${RUN.earned}</span>`;
  $('runBossHUD').innerHTML = BOSS_PHASES.map((p,i)=>{
    const done=RUN.bossCleared.includes(p.id), active=RUN.boss && i===RUN.phase;
    const hp = active ? RUN.phaseHp : done ? 0 : p.hp;
    const pct = Math.max(0, Math.round((hp/p.hp)*100));
    return `<div class="boss-phase ${active?'active':''}"><b>${p.ic} ${p.nm}</b><div class="boss-bar"><div class="boss-fill" style="width:${pct}%"></div></div></div>`;
  }).join('');
  $('runPath').innerHTML = Array.from({length:RUN.maxSteps},(_,i)=>`<div class="run-node ${i<RUN.step?'done':i===RUN.step?'active':''}">${i+1}</div>`).join('') + `<div class="run-node ${RUN.step>=RUN.maxSteps?'active':''}">ðŸ‘‘</div>`;
  $('runInventory').innerHTML = RUN.rewards.map(r=>`<span class="run-pill">${r.ic} ${r.nm}</span>`).join('') +
    RUN.scars.map(s=>`<span class="scar">âš  ${s.label}${s.count>1?' x'+s.count:''}</span>`).join('');
  renderRoomChoices();
}
function renderRoomChoices(){
  const wrap=$('runChoices');
  wrap.innerHTML = RUN.choices.map((c,i)=>{
    if(c.type==='boss') return `<button class="room-card" onclick="startBoss()"><div class="ic">ðŸ‘‘</div><h3>Boss Final</h3><p>Enfrente a Lista 3 inteira.</p><div class="risk">obrigatorio</div></button>`;
    const r=ROOM_TYPES[c.type];
    return `<button class="room-card" onclick="chooseRunRoom(${i})"><div class="ic">${r.ic}</div><h3>${r.nm}</h3><p>${r.ds}</p><div class="risk">risco: ${r.risk}</div></button>`;
  }).join('');
}
function chooseRunRoom(idx){
  const room=RUN.choices[idx]; RUN.currentRoom=room.type; RUN.assisted=false;
  G.free=false; G.mode='rogue'; G.level=RUN.step+1; G.queue=[makeRoomQuestion(room.type)]; G.idx=0; G.lives=RUN.hp; G.earned=0;
  showScreen('scr-game'); renderQuestion();
}
function startBoss(){ toast('ðŸ‘‘ Boss Final','Boss sera implementado na proxima etapa da run.'); }

function updateLivesHUD(){
  $('hudLives').textContent = G.free ? 'âˆž' : 'â¤ï¸'.repeat(Math.max(0,G.lives)) + 'ðŸ–¤'.repeat(Math.max(0,3-G.lives));
}

// ---- Renderiza a questÃ£o atual conforme o modo ----
function renderQuestion(){
  const q = G.queue[G.idx];
  G.usedHint=false; G.assisted=false; G.correctInQ=0; G.errInQ=0; G.qStart=Date.now();
  $('modeChip').textContent = 'Modo '+q.mode;
  $('qTag').textContent = MODE_NAMES[q.mode];
  $('qProgress').textContent = RUN.active
    ? (RUN.boss ? `Boss ${RUN.phase+1}/4` : `Sala ${RUN.step+1}/${RUN.maxSteps}`)
    : G.free ? `Livre Â· ${G.idx+1}` : `${G.idx+1}/${G.queue.length}`;
  $('feedback').className='feedback'; $('feedback').innerHTML='';
  updateLivesHUD(); refreshHUD();
  const body=$('qBody'), act=$('qActions');
  body.innerHTML=''; act.innerHTML='';
  ({1:renderMode1,2:renderMode2,3:renderMode3,4:renderMode4,5:renderMode5})[q.mode](q, body, act);

  if(save.learnMode){
    // MODO APRENDIZ: botÃ£o "Me ensina" gratuito e repetÃ­vel â€” mostra o raciocÃ­nio completo.
    const teachBtn=document.createElement('button');
    teachBtn.className='btn ghost small'; teachBtn.innerHTML='ðŸ“– Me ensina';
    teachBtn.onclick=()=>{ G.assisted=true; if(RUN.active) RUN.assisted=true; teachForQuestion(q); };
    act.appendChild(teachBtn);
  } else {
    // MODO PROVA: dica Ãºnica que custa XP.
    const hintBtn=document.createElement('button');
    hintBtn.className='btn ghost small'; hintBtn.innerHTML=`ðŸ’¡ Dica (âˆ’${HINT_COST})`;
    hintBtn.onclick=()=>{
      if(G.usedHint) return;
      G.usedHint=true; if(RUN.active && RUN.focus>0) RUN.focus--; save.xp=Math.max(0,save.xp-HINT_COST); persist();
      const fb=$('feedback'); fb.className='feedback hint show';
      fb.innerHTML=`ðŸ’¡ <b>Dica:</b> ${q.hint}`;
      hintBtn.disabled=true; sfx.click();
    };
    act.appendChild(hintBtn);
  }
}

// ---- AvanÃ§a apÃ³s acerto ----
function questionSolved(extraPts){
  const q=G.queue[G.idx];
  let pts = DIFF_POINTS[q.diff] + (extraPts||0);
  if(!G.usedHint && !G.assisted) pts += 20;   // bÃ´nus sem ajuda
  G.earned += pts; save.xp += pts; save.totalCorrect++;
  persist(); sfx.ok();
  const fb=$('feedback');
  fb.className='feedback ok show';
  fb.innerHTML = `âœ… <b>Correto!</b> +${pts} XP. ${q.explainOK||''}`;
  if(RUN.active){
    runQuestionSolved(q, pts);
    return;
  }
  checkAchievements(q);
  // botÃ£o prÃ³ximo
  const act=$('qActions'); act.innerHTML='';
  const nx=document.createElement('button');
  nx.className='btn green'; nx.textContent = (G.idx+1>=G.queue.length && !G.free) ? 'ðŸ Finalizar nÃ­vel' : 'PrÃ³xima â†’';
  nx.onclick=nextQuestion; act.appendChild(nx);
}
function nextQuestion(){
  G.idx++;
  if(!G.free && G.idx>=G.queue.length){ winLevel(); return; }
  if(G.free && G.idx>=G.queue.length){ G.queue=shuffle(G.queue); G.idx=0; }
  renderQuestion();
}
// ---- Erro: perde vida ----
function loseLife(){
  if(RUN.active){ runLoseLife(); return; }
  if(G.free) return;                    // modo livre nÃ£o tem vidas
  G.lives--; updateLivesHUD();
  if(G.lives<=0){ failLevel(); }
}
function runQuestionSolved(q, pts){
  let xpChanged=false;
  if(hasReward('clock')){
    const bonus=Math.round(pts*0.5);
    pts += bonus;
    G.earned += bonus;
    save.xp += bonus;
    xpChanged=true;
  }
  if(RUN.currentRoom==='control' && hasReward('regwrite')){
    const bonus=25;
    pts += bonus;
    G.earned += bonus;
    save.xp += bonus;
    xpChanged=true;
  }
  if((q.instr==='beq' || RUN.currentRoom==='pipeline') && hasReward('branch') && !RUN.assisted && !G.usedHint){
    RUN.focus++;
  }
  if(xpChanged) persist();
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
function advanceBossPhase(){
  toast('Boss Final','Boss sera implementado na proxima etapa da run.');
  RUN.boss=false;
  RUN.choices=[{type:'boss'}];
  renderRunMap();
  showScreen('scr-run-map');
}
function runLoseLife(){
  if(hasReward('ra') && RUN.currentRoom==='assembly'){ addScar('asm_call','Chamada/retorno','Revise jal, jr $ra e retorno em $v0.'); toast('â†© $ra Salvo','A falha virou revisao, sem perder HP.'); return; }
  if(hasReward('pc4') && !RUN.freeShield){ RUN.freeShield=true; RUN.combo=0; toast('âž• PC+4','O erro foi absorvido sem perder HP.'); return; }
  RUN.combo=0;
  let dmg = (RUN.currentRoom==='time' && hasReward('clock')) ? 2 : 1;
  if(RUN.currentRoom==='time' && hasReward('cache')) dmg = 0;
  RUN.hp = Math.max(0, RUN.hp-dmg);
  G.lives=RUN.hp; updateLivesHUD();
  if(RUN.hp<=0) loseRun();
}
function showRewardChoices(){
  const body=$('qBody'), act=$('qActions');
  const pool=ROGUE_REWARDS.filter(r=>!hasReward(r.id));
  const picks=sample(pool.length?pool:ROGUE_REWARDS, Math.min(3, pool.length||ROGUE_REWARDS.length));
  body.innerHTML = `<h3>Escolha uma recompensa</h3><p class="muted">Sua build desta run:</p>
    <div class="run-choices">${picks.map(r=>`
      <button class="reward-card" data-r="${r.id}">
        <div class="ic">${r.ic}</div><h3>${r.nm}</h3><p>${r.ds}</p><div class="rarity">${r.rarity}</div>
      </button>`).join('')}</div>`;
  act.innerHTML='';
  body.querySelectorAll('.reward-card').forEach(btn=>{
    btn.onclick=()=>{ const r=ROGUE_REWARDS.find(x=>x.id===btn.dataset.r); applyReward(r); };
  });
}
function applyReward(r){
  if(r && !hasReward(r.id)) RUN.rewards.push(r);
  if(r && r.id==='checklist' && RUN.hp<RUN.maxHp) RUN.hp++;
  RUN.step++;
  RUN.freeShield=false;
  if(RUN.step>=RUN.maxSteps){ RUN.choices=[{type:'boss'}]; }
  else RUN.choices=nextRoomChoices();
  renderRunMap(); showScreen('scr-run-map');
}
function loseRun(){
  RUN.active=false;
  sfx.lose();
  $('resEmoji').textContent='ðŸ’€';
  $('resTitle').textContent='Run encerrada';
  $('resSub').textContent='A prova venceu desta vez, mas suas cicatrizes mostram exatamente o que revisar.';
  $('resStats').innerHTML = runResultHTML(false);
  const nx=$('resNext'); nx.style.display=''; nx.textContent='ðŸŒ€ Nova run'; nx.onclick=startRoguelikeRun;
  showScreen('scr-result');
}
function runResultHTML(win){
  const scars = RUN.scars.length ? RUN.scars.map(s=>`${s.label}${s.count>1?' x'+s.count:''}`).join(' Â· ') : 'nenhuma';
  return `<div class="rs">Resultado<b>${win?'Vitoria':'Derrota'}</b></div>
    <div class="rs">XP da run<b>+${RUN.earned}</b></div>
    <div class="rs">Combo maximo<b>x${RUN.bestCombo}</b></div>
    <div class="rs">Salas vencidas<b>${RUN.roomsWon}</b></div>
    <div class="rs">Cicatrizes<b>${scars}</b></div>`;
}
function winLevel(){
  sfx.win();
  if(G.level>=save.unlocked && save.unlocked<LEVELS.length){ save.unlocked=G.level+1; }
  persist();
  $('resEmoji').textContent='ðŸŽ‰';
  $('resTitle').textContent=`NÃ­vel ${G.level} completo!`;
  $('resSub').textContent = LEVELS[G.level-1].label;
  $('resStats').innerHTML =
    `<div class="rs">XP ganho<b>+${G.earned}</b></div>
     <div class="rs">XP total<b>${save.xp}</b></div>
     <div class="rs">Vidas<b>${'â¤ï¸'.repeat(Math.max(0,G.lives))||'â€”'}</b></div>`;
  const nx=$('resNext');
  if(G.level<LEVELS.length){ nx.style.display=''; nx.textContent=`NÃ­vel ${G.level+1} â†’`; nx.onclick=()=>startLevel(G.level+1); }
  else { nx.style.display='none'; }
  showScreen('scr-result');
}
function failLevel(){
  sfx.lose();
  $('resEmoji').textContent='ðŸ’€';
  $('resTitle').textContent='Sem vidas!';
  $('resSub').textContent=`VocÃª perdeu as 3 vidas no nÃ­vel ${G.level}. Tente de novo â€” as questÃµes vÃªm embaralhadas.`;
  $('resStats').innerHTML=`<div class="rs">XP ganho<b>+${G.earned}</b></div><div class="rs">XP total<b>${save.xp}</b></div>`;
  const nx=$('resNext'); nx.style.display=''; nx.textContent='â†» Repetir nÃ­vel'; nx.onclick=()=>startLevel(G.level);
  showScreen('scr-result');
}

/* -------------------- MODO 1: Roteirista da InstruÃ§Ã£o -------------------- */
function renderMode1(q, body){
  const seq = PATHS[q.instr];
  body.innerHTML =
    `<div class="instr-box"><span class="lbl">InstruÃ§Ã£o</span>${INSTR[q.instr].label} <span style="color:var(--muted);font-size:12px">â€” ${INSTR[q.instr].name}</span></div>
     <p class="prompt">Clique nas unidades funcionais na <b>ordem correta</b> em que a instruÃ§Ã£o percorre o caminho de dados. (${seq.length} passos)</p>
     <div class="steps" id="m1steps"></div>
     ${buildDatapathSVG()}`;
  const stepsEl = $('m1steps');
  seq.forEach((k,i)=>{
    const s=document.createElement('span'); s.className='slot'; s.id='slot-'+i;
    s.textContent = (i+1)+'. ___'; stepsEl.appendChild(s);
  });
  let cur=0;
  wireTooltips(body);
  body.querySelectorAll('.unit').forEach(g=>{
    g.classList.add('clickable');
    g.addEventListener('click',()=>{
      if(cur>=seq.length) return;
      const k=g.dataset.key;
      if(k===seq[cur]){
        g.classList.remove('hl-red'); g.classList.add('hl-green');
        // badge numÃ©rico no canto da unidade
        const r=g.querySelector('rect')||g.querySelector('polygon');
        const bx = r.getAttribute('x') ? +r.getAttribute('x') : 600;
        const by = r.getAttribute('y') ? +r.getAttribute('y') : 256;
        const t=document.createElementNS('http://www.w3.org/2000/svg','text');
        t.setAttribute('class','step-badge'); t.setAttribute('x',bx+4); t.setAttribute('y',by+15);
        t.textContent='â‘ â‘¡â‘¢â‘£â‘¤â‘¥â‘¦â‘§â‘¨'[cur]||(cur+1); g.appendChild(t);
        const slot=$('slot-'+cur); slot.className='slot filled'; slot.textContent=(cur+1)+'. '+stepLabel(q.instr,cur);
        cur++; sfx.click();
        if(cur>=seq.length){
          q.explainOK=`Caminho da ${INSTR[q.instr].name} completo! ðŸŸ¢`;
          const bonus = Math.max(0, 60 - Math.floor((Date.now()-G.qStart)/1000)*3); // bÃ´nus de tempo
          questionSolved(bonus);
        }
      } else {
        g.classList.add('hl-red'); setTimeout(()=>g.classList.remove('hl-red'),700);
        sfx.err(); G.errInQ++;
        const fb=$('feedback'); fb.className='feedback err show';
        const expected=stepLabel(q.instr,cur);
        fb.innerHTML=`âŒ <b>Agora nÃ£o.</b> O prÃ³ximo passo Ã© <b>${expected}</b>, nÃ£o <b>${UNITS[k].name}</b>. <br><span class="muted">${UNITS[k].name}: ${UNITS[k].tip}</span>`;
        loseLife();
      }
    });
  });
}

/* -------------------- MODO 2: Engenheiro de Controle -------------------- */
function renderMode2(q, body, act){
  const correct = CONTROL[q.instr];
  body.innerHTML =
    `<div class="instr-box"><span class="lbl">InstruÃ§Ã£o</span>${INSTR[q.instr].label} <span style="color:var(--muted);font-size:12px">â€” ${INSTR[q.instr].name}</span></div>
     <p class="prompt">Ligue/desligue os <b>7 sinais de controle</b> corretos. Cada sinal mostra <b>o que faz</b> e <b>o que aquele valor significa</b> â€” leia enquanto decide. <span class="muted">(X = indiferente)</span></p>
     <div class="signals" id="m2sig"></div>`;
  const wrap=$('m2sig');
  const state = SIGNAL_NAMES.map(()=>0);
  const valText=(nm,v)=>`${v} â†’ ${SIG_INFO[nm]['v'+v]}`;   // significado do valor atual
  SIGNAL_NAMES.forEach((nm,i)=>{
    const info=SIG_INFO[nm];
    const sig=document.createElement('div'); sig.className='sig'; sig.id='sig-'+i;
    sig.innerHTML=`<div class="sig-main">
        <div class="nm-row"><span class="nm">${nm}</span><button class="sig-q" type="button" title="ver os dois valores">?</button></div>
        <div class="sig-what">${info.what}</div>
        <div class="sig-val" id="val-${i}">${valText(nm,0)}</div>
        <div class="sig-detail">ðŸ”µ <b>=1:</b> ${info.v1}<br>âšª <b>=0:</b> ${info.v0}</div>
        <div class="sig-explain"></div>
      </div>
      <div class="toggle"><div class="knob">0</div></div>`;
    wrap.appendChild(sig);
    const tog=sig.querySelector('.toggle'), knob=tog.querySelector('.knob'), val=sig.querySelector('#val-'+i);
    tog.onclick=()=>{
      state[i]^=1; tog.classList.toggle('on',state[i]===1); knob.textContent=state[i];
      val.textContent=valText(nm,state[i]);                 // atualiza o significado ao vivo
      sfx.click();
      sig.classList.remove('right','wrong'); sig.querySelector('.sig-explain').textContent='';
    };
    sig.querySelector('.sig-q').onclick=()=>{ sig.classList.toggle('expanded'); sfx.click(); };
  });
  const verify=document.createElement('button');
  verify.className='btn'; verify.textContent='âœ” Verificar';
  verify.onclick=()=>{
    let allOk=true, wrongs=[];
    SIGNAL_NAMES.forEach((nm,i)=>{
      const sig=$('sig-'+i); const want=correct[i];
      const got=state[i];
      const ok = (want==='X') || (want===got);
      sig.className='sig '+(ok?'right':'wrong');
      const exp=sig.querySelector('.sig-explain');
      if(!ok){
        allOk=false; wrongs.push(nm);
        const wantTxt = want==='X' ? 'X' : want;
        exp.textContent=`Deveria ser ${wantTxt} â€” ${SIG_WHY[nm][want]}`;
      } else if(want!=='X' || got===0){
        // mostra reforÃ§o positivo curto opcional (somente quando relevante)
      }
    });
    const fb=$('feedback');
    if(allOk){
      q.explainOK = `Todos os 7 sinais corretos para a ${INSTR[q.instr].name}. ðŸŽ›`;
      q._noHintControl = !G.usedHint && !G.assisted;   // p/ conquista (sem nenhuma ajuda)
      questionSolved();
    } else {
      fb.className='feedback err show';
      fb.innerHTML=`âŒ <b>${wrongs.length} sinal(is) errado(s):</b> ${wrongs.join(', ')}. Veja as explicaÃ§Ãµes em vermelho e ajuste.`;
      sfx.err(); G.errInQ++; loseLife();
    }
  };
  act.appendChild(verify);
}

/* -------------------- MODO 3: Calculadora de Tempos -------------------- */
function renderMode3(q, body, act){
  const t = q.times;
  const timeRows = `
    <div class="timesgrid">
      <div class="timecell">Mem. InstruÃ§Ãµes<b>${t.imem} ns</b></div>
      <div class="timecell">Banco Reg.<b>${t.regread} ns</b></div>
      <div class="timecell">ULA<b>${t.alu} ns</b></div>
      <div class="timecell">Mem. Dados<b>${t.dmem} ns</b></div>
      <div class="timecell">Controle<b>${t.control} ns</b></div>
      <div class="timecell">Somadores<b>${t.adder} ns</b></div>
    </div>`;

  if(q.t3type==='single'){
    const instr=q.instr;
    body.innerHTML=`<p class="prompt">Tempos de cada unidade (uniciclo):</p>${timeRows}
      <div class="instr-box"><span class="lbl">Calcule o tempo total da instruÃ§Ã£o</span>${INSTR[instr].label} â€” ${INSTR[instr].name}</div>
      <div class="numrow" id="r1"><label>Tempo do caminho crÃ­tico:</label>
        <input type="number" id="a1" step="0.1" inputmode="decimal"><span class="unit-suf">ns</span></div>`;
    addCheck(act,()=>{
      const ans=instrTime(instr,t);
      const ok=near($('a1').value, ans);
      mark('r1',ok);
      if(ok){ q.explainOK=`${INSTR[instr].name} = ${critStr(instr,t)} = <b>${ans} ns</b>.`; questionSolved(); }
      else failNum(`O caminho crÃ­tico da ${INSTR[instr].name} Ã© ${critStr(instr,t)} = <b>${ans} ns</b>.`);
    });

  } else if(q.t3type==='period'){
    const per=periodUniciclo(t);
    body.innerHTML=`<p class="prompt">Dados os tempos das unidades, responda:</p>${timeRows}
      <div class="numrow" id="r1"><label>PerÃ­odo de clock do <b>uniciclo</b> (instruÃ§Ã£o mais lenta):</label>
        <input type="number" id="a1" step="0.1" inputmode="decimal"><span class="unit-suf">ns</span></div>`;
    addCheck(act,()=>{
      const ok=near($('a1').value, per); mark('r1',ok);
      if(ok){ q.explainOK=`O perÃ­odo = tempo da lw = ${critStr('lw',t)} = <b>${per} ns</b> (a instruÃ§Ã£o mais lenta).`; questionSolved(); }
      else failNum(`No uniciclo o clock acomoda a instruÃ§Ã£o mais lenta (lw): ${critStr('lw',t)} = <b>${per} ns</b>.`);
    });

  } else { // benchmark + speedup
    const mix=q.mix; const per=periodUniciclo(t);
    let avg=0; const parts=[];
    for(const k in mix){ const f=mix[k]/100; const ti=instrTime(k,t); avg+=f*ti; parts.push(`${mix[k]}%Â·${ti}`); }
    avg=Math.round(avg*100)/100;
    const speed=Math.round((per/avg)*100)/100;
    body.innerHTML=`<p class="prompt">Tempos das unidades:</p>${timeRows}
      <p class="prompt">${q.name?`Benchmark <b>${q.name}</b> `:'Benchmark '}(frequÃªncia das instruÃ§Ãµes)${q.fromList?' <span class="muted" style="font-size:11px">â€” da Lista 3</span>':''}:
        <span class="mono">lw ${mix.lw}% Â· sw ${mix.sw}% Â· R(alu) ${mix.R}% Â· beq ${mix.beq}% Â· j ${mix.j}%</span></p>
      <div class="numrow" id="r1"><label>a) PerÃ­odo do <b>uniciclo</b>:</label>
        <input type="number" id="a1" step="0.1" inputmode="decimal"><span class="unit-suf">ns</span></div>
      <div class="numrow" id="r2"><label>b) Tempo mÃ©dio por instruÃ§Ã£o no <b>multiciclo ideal</b>:</label>
        <input type="number" id="a2" step="0.01" inputmode="decimal"><span class="unit-suf">ns</span></div>
      <div class="numrow" id="r3"><label>c) <b>Speedup</b> do multiciclo sobre o uniciclo:</label>
        <input type="number" id="a3" step="0.01" inputmode="decimal"><span class="unit-suf">Ã—</span></div>`;
    addCheck(act,()=>{
      const o1=near($('a1').value,per), o2=near($('a2').value,avg,0.06), o3=near($('a3').value,speed,0.03);
      mark('r1',o1); mark('r2',o2); mark('r3',o3);
      if(o1&&o2&&o3){
        q.explainOK=`Uniciclo=${per} ns; mÃ©dia multiciclo=Î£(fraÃ§Ã£oÃ—tempo)=${avg} ns; speedup=${per}/${avg}=<b>${speed}Ã—</b>.`;
        questionSolved(40);
      } else {
        failNum(`Uniciclo = ${per} ns (lw). MÃ©dia multiciclo = ${parts.join(' + ')} (Ã·100) = <b>${avg} ns</b>. Speedup = ${per} / ${avg} = <b>${speed}Ã—</b>.`);
      }
    });
  }
}
// helpers Modo 3
function critStr(instr,t){
  const reg=t.regread, wr=(t.regwrite!==undefined?t.regwrite:t.regread);
  if(instr==='lw') return `Mem.Instr(${t.imem})+Reg(${reg})+ULA(${t.alu})+Mem.Dados(${t.dmem})+EscreveReg(${wr})`;
  if(instr==='sw') return `Mem.Instr(${t.imem})+Reg(${reg})+ULA(${t.alu})+Mem.Dados(${t.dmem})`;
  if(instr==='R')  return `Mem.Instr(${t.imem})+Reg(${reg})+ULA(${t.alu})+EscreveReg(${wr})`;
  if(instr==='beq')return `Mem.Instr(${t.imem})+Reg(${reg})+ULA(${t.alu})`;
  if(instr==='j')  return `Mem.Instr(${t.imem})`;
}
function near(v, target, tol=0.05){ const n=parseFloat(String(v).replace(',','.')); return isFinite(n) && Math.abs(n-target)<=tol; }
function mark(rowId, ok){ const r=$(rowId); if(r) r.className='numrow '+(ok?'right':'wrong'); }
function addCheck(act, fn){ const b=document.createElement('button'); b.className='btn'; b.textContent='âœ” Verificar'; b.onclick=fn; act.appendChild(b); }
function failNum(msg){
  const fb=$('feedback'); fb.className='feedback err show';
  fb.innerHTML=`âŒ <b>NÃ£o foi dessa vez.</b> ${msg}`; sfx.err(); G.timeStreak=0; G.errInQ++; loseLife();
}

/* -------------------- MODO 4: Pipeline Master -------------------- */
function renderMode4(q, body, act){
  body.innerHTML=
    `<p class="prompt">Arraste/toque cada etiqueta de fase do pipeline e coloque sobre a <b>regiÃ£o correta</b> do datapath. Ordem: IF â†’ ID â†’ EX â†’ MEM â†’ WB.</p>
     <div class="chips" id="m4chips"></div>
     ${buildDatapathSVG({stages:true})}`;
  const labels=shuffle(['IF','ID','EX','MEM','WB']);
  const chipsEl=$('m4chips');
  let selected=null;        // etiqueta atualmente "pega" (tap-to-pick)
  const placed={};          // zona -> etiqueta
  labels.forEach(L=>{
    const c=document.createElement('div'); c.className='chip-drag'; c.textContent=L; c.dataset.l=L;
    c.onclick=()=>{
      if(c.classList.contains('used')) return;
      chipsEl.querySelectorAll('.chip-drag').forEach(x=>x.classList.remove('sel'));
      if(selected===L){ selected=null; }
      else { selected=L; c.classList.add('sel'); }
      sfx.click();
    };
    chipsEl.appendChild(c);
  });
  wireTooltips(body);
  body.querySelectorAll('.stagezone').forEach(z=>{
    z.addEventListener('click',()=>{
      if(!selected) return;
      const st=z.dataset.stage;
      // se a zona jÃ¡ tinha etiqueta, devolve a antiga
      if(placed[st]){ const old=chipsEl.querySelector(`[data-l="${placed[st]}"]`); if(old) old.classList.remove('used'); }
      // remove a etiqueta selecionada de qualquer outra zona
      for(const k in placed){ if(placed[k]===selected){ delete placed[k]; body.querySelector('#zl-'+k).textContent='?'; } }
      placed[st]=selected;
      body.querySelector('#zl-'+st).textContent=selected;
      const chip=chipsEl.querySelector(`[data-l="${selected}"]`); chip.classList.add('used'); chip.classList.remove('sel');
      selected=null; sfx.click();
    });
  });
  const verify=document.createElement('button');
  verify.className='btn'; verify.textContent='âœ” Verificar';
  verify.onclick=()=>{
    const zones=body.querySelectorAll('.stagezone');
    if(Object.keys(placed).length<5){ const fb=$('feedback'); fb.className='feedback err show'; fb.innerHTML='âŒ Coloque as 5 etiquetas antes de verificar.'; sfx.err(); return; }
    let allOk=true;
    zones.forEach(z=>{ const st=z.dataset.stage; const ok=placed[st]===st; z.classList.add(ok?'ok':'bad'); if(!ok) allOk=false; });
    const fb=$('feedback');
    if(allOk){
      q.explainOK = `Pipeline correto! Mapa das unidades: <span class="mono">PC/Mem.Instrâ†’IF Â· Banco Reg./Controleâ†’ID Â· ULAâ†’EX Â· Mem.Dadosâ†’MEM Â· escrita no reg.â†’WB</span>`;
      questionSolved();
    } else {
      fb.className='feedback err show';
      fb.innerHTML=`âŒ <b>Algumas fases erradas.</b> Lembre: <span class="mono">IF</span>=busca Â· <span class="mono">ID</span>=decodifica/lÃª reg. Â· <span class="mono">EX</span>=ULA Â· <span class="mono">MEM</span>=memÃ³ria de dados Â· <span class="mono">WB</span>=escreve reg. Ajuste e tente de novo.`;
      sfx.err(); G.errInQ++; loseLife();
      // limpa marcaÃ§Ã£o para nova tentativa (mantÃ©m posiÃ§Ãµes)
      setTimeout(()=>zones.forEach(z=>z.classList.remove('ok','bad')),900);
    }
  };
  act.appendChild(verify);
}

const ASM_QUESTIONS = {
  call:{
    type:'call',
    title:'Chamada de funcao',
    prompt:'Qual bloco chama quadrado(i), passando o argumento em $a0 e recebendo o retorno em $v0?',
    code:'// contrato: $a0 = i, retorno em $v0\n// chamador deve voltar para a proxima instrucao depois da funcao',
    points:20,
    answer:'jal',
    explain:'Chamada correta: coloque o argumento em $a0, use jal para salvar $ra e leia o resultado em $v0.',
    options:[
      {id:'jr', text:'move $a0, $t0\njr quadrado\nmove $t1, $v0', scar:'asm_call', label:'Chamada', tip:'Use jal para chamar uma funcao; jr $ra serve para retornar.', msg:'jr $ra retorna de uma funcao. Para chamar, use jal depois de preparar $a0.'},
      {id:'jal', text:'move $a0, $t0\njal quadrado\nmove $t1, $v0', correct:true},
      {id:'ret', text:'move $v0, $t0\njal quadrado\nmove $t1, $a0', scar:'asm_ret', label:'Retorno', tip:'O valor de retorno da funcao vem em $v0.', msg:'O argumento entra em $a0, mas o retorno sai em $v0.'}
    ]
  },
  memory:{
    type:'memory',
    title:'Parametros na memoria',
    prompt:'A base em $s7 aponta para dois parametros consecutivos: base do vetor e quantidade. Quais loads fazem isso?',
    code:'// memoria[$s7 + 0] = base do vetor\n// memoria[$s7 + 4] = quantidade n',
    points:20,
    answer:'loads',
    explain:'Use lw $a0, 0($s7) para ler a base e lw $a1, 4($s7) para ler n.',
    options:[
      {id:'loads', text:'lw $a0, 0($s7)\nlw $a1, 4($s7)', correct:true},
      {id:'sw', text:'sw $a0, 0($s7)\nsw $a1, 4($s7)', scar:'mem_load', label:'Load/store', tip:'lw le da memoria; sw grava na memoria.', msg:'Aqui voce precisa ler parametros da memoria. Use lw, nao sw.'},
      {id:'addr', text:'lw $a0, 0($s7)\nlw $a1, 1($s7)', scar:'mem_addr', label:'Endereco', tip:'Palavras MIPS avancam de 4 em 4 bytes.', msg:'O segundo parametro esta uma palavra depois: deslocamento 4, nao 1.'}
    ]
  },
  limit:{
    type:'limit',
    title:'Limite de 30 elementos',
    prompt:'Antes do loop, como garantir que a quantidade n nunca passe de 30?',
    code:'// entrada: $a1 = n\n// se n > 30, usar 30',
    points:20,
    answer:'cap',
    explain:'Compare n com 30; se n nao for menor que 31, substitua por 30 antes do loop.',
    options:[
      {id:'cap', text:'li $t0, 31\nslt $t1, $a1, $t0\nbne $t1, $zero, ok_n\nli $a1, 30\nok_n:', correct:true},
      {id:'skip', text:'li $t0, 30\nbeq $a1, $t0, ok_n\nok_n:', scar:'limit30', label:'Limite 30', tip:'Tambem precisa tratar valores maiores que 30.', msg:'Testar apenas igualdade com 30 nao limita n quando ele vem maior.'},
      {id:'zero', text:'li $a1, 30', scar:'limit30', label:'Limite 30', tip:'So troque n quando ele passar de 30.', msg:'Isso troca qualquer n por 30. O limite so deve cortar valores maiores que 30.'}
    ]
  },
  loop:{
    type:'loop',
    title:'Ordem do loop',
    prompt:'Ordene os blocos para percorrer i=0 ate n-1.',
    code:'// $a0 = base do vetor\n// $a1 = n\n// $t0 = i',
    points:30,
    answer:['init','test','body','inc','jump','end'],
    explain:'Loop Q1: inicializa i=0, testa i<n, executa o corpo, incrementa, volta ao teste e termina em done.',
    scar:'loop_q1',
    label:'Loop Q1',
    tip:'Um loop contado precisa inicializar, testar, executar, incrementar e voltar ao teste.',
    msg:'A ordem do loop deve ser: init, teste, corpo, incremento, salto para o teste, fim.',
    blocks:[
      {id:'body', text:'loop_body:\n  sll $t2, $t0, 2\n  add $t3, $a0, $t2\n  sw $v0, 0($t3)'},
      {id:'test', text:'loop_test:\n  slt $t1, $t0, $a1\n  beq $t1, $zero, done'},
      {id:'inc', text:'  addi $t0, $t0, 1'},
      {id:'init', text:'  li $t0, 0'},
      {id:'jump', text:'  j loop_test'},
      {id:'end', text:'done:'}
    ]
  },
  formula:{
    type:'formula',
    title:'Formula par/impar',
    prompt:'Qual regra calcula o valor correto para cada i?',
    code:'// se i for par: 2*i^2 + 2*i + 1\n// se i for impar: i^2',
    points:20,
    answer:'par',
    explain:'A questao pede dois caminhos: i par usa 2*i^2 + 2*i + 1; i impar usa i^2.',
    options:[
      {id:'par', text:'if (i % 2 == 0) valor = 2*i*i + 2*i + 1;\nelse valor = i*i;', correct:true},
      {id:'swap', text:'if (i % 2 == 0) valor = i*i;\nelse valor = 2*i*i + 2*i + 1;', scar:'formula_even', label:'Formula par', tip:'A formula maior e para i par.', msg:'As formulas foram invertidas. Para i par, use 2*i^2 + 2*i + 1.'},
      {id:'linear', text:'if (i % 2 == 0) valor = 2*i + 1;\nelse valor = i*i;', scar:'formula_even', label:'Formula par', tip:'Nao esqueca do termo 2*i^2.', msg:'Para i par falta o termo quadratico: 2*i^2 + 2*i + 1.'}
    ]
  },
  trace:{
    type:'trace',
    title:'Trace de formula',
    prompt:'Para i=2, qual valor deve ser gravado no vetor?',
    code:'// i = 2\n// i par -> 2*i^2 + 2*i + 1',
    points:25,
    answer:13,
    explain:'2*2^2 + 2*2 + 1 = 13',
    scar:'trace_formula',
    label:'Trace formula',
    tip:'Substitua i=2 na formula par antes de responder.',
    msg:'Para i=2, use a formula par: 2*2^2 + 2*2 + 1 = 13.'
  }
};

function renderMode5(q, body, act){
  const item=ASM_QUESTIONS[q.kind]||ASM_QUESTIONS.call;
  body.innerHTML =
    `<h3>${item.title}</h3>
     <p class="prompt">${item.prompt}</p>
     <pre class="asm-code" id="asmCode"></pre>
     <div class="asm-options" id="asmOptions"></div>`;
  $('asmCode').textContent=item.code||'';
  const wrap=$('asmOptions');
  if(item.type==='trace') renderAsmTrace(q,item,wrap,act);
  else if(item.type==='loop') renderAsmOrder(q,item,wrap,act);
  else renderAsmChoice(q,item,wrap,act);
}

function renderAsmChoice(q,item,wrap,act){
  let selected=null;
  item.options.forEach(opt=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='asm-option';
    btn.textContent=opt.text;
    btn.onclick=()=>{
      selected=opt;
      wrap.querySelectorAll('.asm-option').forEach(x=>x.classList.remove('sel'));
      btn.classList.add('sel');
      sfx.click();
    };
    wrap.appendChild(btn);
  });
  addCheck(act,()=>{
    if(!selected){
      const fb=$('feedback'); fb.className='feedback err show'; fb.innerHTML='&#10060; Escolha uma alternativa antes de verificar.'; sfx.err(); return;
    }
    if(selected.correct){
      q.explainOK=item.explain;
      questionSolved(item.points);
    } else {
      if(RUN.active && selected.scar) addScar(selected.scar, selected.label, selected.tip);
      failAsm(selected.msg||'Revise o contrato de chamada, memoria e registradores da Q1.');
    }
  });
}

function renderAsmOrder(q,item,wrap,act){
  const chosen=[];
  const order=document.createElement('pre');
  order.className='asm-code';
  order.textContent='Ordem escolhida:';
  const pool=document.createElement('div');
  pool.className='asm-options';
  shuffle(item.blocks).forEach(block=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='asm-option';
    btn.textContent=block.text;
    btn.onclick=()=>{
      if(chosen.includes(block.id)) return;
      chosen.push(block.id);
      btn.classList.add('sel');
      order.textContent='Ordem escolhida:\n\n'+chosen.map((id,i)=>{
        const b=item.blocks.find(x=>x.id===id);
        return `${i+1}. ${b.text}`;
      }).join('\n\n');
      sfx.click();
    };
    pool.appendChild(btn);
  });
  wrap.appendChild(pool);
  wrap.appendChild(order);
  const reset=document.createElement('button');
  reset.type='button';
  reset.className='btn ghost small';
  reset.textContent='Limpar ordem';
  reset.onclick=()=>{
    chosen.length=0;
    order.textContent='Ordem escolhida:';
    pool.querySelectorAll('.asm-option').forEach(x=>x.classList.remove('sel'));
    sfx.click();
  };
  act.appendChild(reset);
  addCheck(act,()=>{
    if(chosen.length<item.answer.length){
      const fb=$('feedback'); fb.className='feedback err show'; fb.innerHTML='&#10060; Escolha todos os blocos antes de verificar.'; sfx.err(); return;
    }
    const ok=chosen.join('|')===item.answer.join('|');
    if(ok){
      q.explainOK=item.explain;
      questionSolved(item.points);
    } else {
      if(RUN.active) addScar(item.scar, item.label, item.tip);
      failAsm(item.msg);
    }
  });
}

function renderAsmTrace(q,item,wrap,act){
  wrap.innerHTML =
    `<div class="numrow" id="asmTraceRow">
       <label>Valor para i=2:</label>
       <input type="number" id="asmTraceAns" step="1" inputmode="numeric">
     </div>`;
  addCheck(act,()=>{
    const raw=$('asmTraceAns').value.trim();
    if(!raw){
      const fb=$('feedback'); fb.className='feedback err show'; fb.innerHTML='&#10060; Digite o valor antes de verificar.'; sfx.err(); return;
    }
    const ok=near(raw,item.answer,0);
    mark('asmTraceRow',ok);
    if(ok){
      q.explainOK=item.explain;
      questionSolved(item.points);
    } else {
      if(RUN.active) addScar(item.scar, item.label, item.tip);
      failAsm(item.msg);
    }
  });
}

function failAsm(msg){
  G.errInQ++;
  if(RUN.active) runLoseLife(); else loseLife();
  const fb=$('feedback'); fb.className='feedback err show'; fb.innerHTML='&#10060; '+msg;
  sfx.err();
}

/* ===========================================================================
   9. JS â€” SEÃ‡ÃƒO G: CONQUISTAS
   =========================================================================== */
const ACHIEVEMENTS = [
  {id:'lw_signals', ic:'ðŸŽ›', nm:'Mestre do lw', ds:'Acertou todos os 7 sinais do lw sem usar dica.'},
  {id:'time_streak',ic:'â±', nm:'CronÃ´metro humano', ds:'Calculou 5 tempos seguidos sem errar.'},
  {id:'control_master', ic:'ðŸ§ ', nm:'Decorou o controle', ds:'Acertou os 7 sinais de R, lw, sw e beq.'},
  {id:'first_level', ic:'ðŸ¥‡', nm:'Primeiros passos', ds:'Completou o nÃ­vel 1.'},
  {id:'half_way', ic:'ðŸš€', nm:'Na metade', ds:'Desbloqueou o nÃ­vel 6.'},
  {id:'finish', ic:'ðŸ‘‘', nm:'Arquiteto MIPS', ds:'Completou o nÃ­vel 10.'},
  {id:'pipeliner', ic:'ðŸš‰', nm:'Pipeliner', ds:'Montou o pipeline de 5 fases sem erro.'},
  {id:'xp1000', ic:'ðŸ’Ž', nm:'Veterano', ds:'Acumulou 1000 XP.'}
];
function unlock(id){
  if(save.achievements.includes(id)) return;
  save.achievements.push(id); persist();
  const a=ACHIEVEMENTS.find(x=>x.id===id);
  sfx.ach(); toast(`ðŸ† Conquista: ${a.nm}`, a.ds);
}
function checkAchievements(q){
  // streak de tempos (modo 3) â€” incrementa sÃ³ em acerto de tempo
  if(q.mode===3){ G.timeStreak++; if(G.timeStreak>=5) unlock('time_streak'); } else { /* mantÃ©m */ }
  // sinais do lw sem dica
  if(q.mode===2 && q.instr==='lw' && q._noHintControl) unlock('lw_signals');
  // controle de 4 instruÃ§Ãµes
  if(q.mode===2 && G.errInQ===0){
    if(!save.ctlPerfectInstr.includes(q.instr)){ save.ctlPerfectInstr.push(q.instr); persist(); }
    if(['R','lw','sw','beq'].every(k=>save.ctlPerfectInstr.includes(k))) unlock('control_master');
  }
  // pipeline sem erro
  if(q.mode===4 && G.errInQ===0) unlock('pipeliner');
  // marcos
  if(G.level>=1 && G.idx+1>=G.queue.length){ if(G.level===1) unlock('first_level'); }
  if(save.unlocked>=6) unlock('half_way');
  if(save.xp>=1000) unlock('xp1000');
}
function toast(t1,t2){
  const w=$('toast-wrap'); const d=document.createElement('div'); d.className='toast';
  d.innerHTML=`<div class="t1">${t1}</div><div class="t2">${t2}</div>`;
  w.appendChild(d); setTimeout(()=>{d.style.opacity='0';d.style.transition='opacity .4s';setTimeout(()=>d.remove(),400);},3800);
}
function renderAchievements(){
  $('achCount').textContent=`${save.achievements.length}/${ACHIEVEMENTS.length} desbloqueadas Â· XP total ${save.xp}`;
  $('achList').innerHTML = ACHIEVEMENTS.map(a=>{
    const un=save.achievements.includes(a.id);
    return `<div class="ach ${un?'un':'lock'}"><div class="ic">${un?a.ic:'ðŸ”’'}</div>
      <div><div class="nm">${a.nm}</div><div class="ds">${a.ds}</div></div></div>`;
  }).join('');
}

/* ===========================================================================
   9.5. JS â€” SEÃ‡ÃƒO G2: ACADEMIA / LIÃ‡Ã•ES (a parte que ENSINA)
   =========================================================================== */

// --- NarraÃ§Ã£o passo-a-passo de cada instruÃ§Ã£o (alinhada a PATHS) ---
const NARR = {
  R: [
    'O PC guarda o endereÃ§o da instruÃ§Ã£o add na memÃ³ria.',
    'A MemÃ³ria de InstruÃ§Ãµes entrega os 32 bits da instruÃ§Ã£o.',
    'O Banco de Registradores lÃª $s2 e $s3 (os dois operandos).',
    'A ULA soma $s2 + $s3 (ALUSrc=0 â†’ 2Âº operando vem de registrador).',
    'MemtoReg=0: o valor escolhido Ã© a saÃ­da da ULA, nÃ£o da memÃ³ria.',
    'RegWrite=1: o resultado Ã© gravado em $s1 (RegDst=1 escolhe o campo rd).'
  ],
  lw: [
    'O PC aponta para a instruÃ§Ã£o lw.',
    'A MemÃ³ria de InstruÃ§Ãµes busca a lw.',
    'O Banco de Registradores lÃª $s2 â€” o registrador BASE do endereÃ§o.',
    'O imediato 8 (16 bits) passa pela ExtensÃ£o de Sinal â†’ 32 bits.',
    'ALUSrc=1: a ULA usarÃ¡ o imediato como 2Âº operando.',
    'A ULA calcula o ENDEREÃ‡O: $s2 + 8.',
    'MemRead=1: lÃª a palavra nesse endereÃ§o da MemÃ³ria de Dados.',
    'MemtoReg=1: o valor escolhido vem da MEMÃ“RIA.',
    'RegWrite=1: grava o dado lido em $s1 (RegDst=0 escolhe o campo rt).'
  ],
  sw: [
    'O PC aponta para a instruÃ§Ã£o sw.',
    'A MemÃ³ria de InstruÃ§Ãµes busca a sw.',
    'O Banco de Registradores lÃª $s2 (base) e $s1 (o dado a gravar).',
    'O imediato 8 Ã© estendido para 32 bits.',
    'ALUSrc=1: a ULA usa o imediato.',
    'A ULA calcula o endereÃ§o $s2 + 8.',
    'MemWrite=1: grava $s1 na MemÃ³ria de Dados. (sw NÃƒO escreve registrador â†’ RegWrite=0.)'
  ],
  beq: [
    'O PC aponta para a instruÃ§Ã£o beq.',
    'A MemÃ³ria de InstruÃ§Ãµes busca a beq.',
    'O Banco de Registradores lÃª $s1 e $s2 para comparar.',
    'A ULA SUBTRAI $s1 âˆ’ $s2; se der zero, sÃ£o iguais (sinal Zero=1).',
    'Em paralelo, o Somador de Desvio calcula (PC+4)+(offset<<2).',
    'Branch=1 e Zero=1 â†’ o MUX PCSrc escolhe o endereÃ§o de desvio (senÃ£o, PC+4).'
  ],
  j: [
    'O PC aponta para a instruÃ§Ã£o j.',
    'A MemÃ³ria de InstruÃ§Ãµes busca a j.',
    'O PC recebe direto o endereÃ§o de salto â€” sem ULA, sem registradores. Por isso a j leva sÃ³ 4 ns.'
  ]
};

// --- Anima o caminho de uma instruÃ§Ã£o dentro de um SVG (reutilizÃ¡vel) ---
function animatePath(instr, svgRoot, captionEl, done){
  const seq = PATHS[instr];
  svgRoot.querySelectorAll('.unit').forEach(g=>g.classList.remove('hl-green','hl-pulse','hl-red'));
  let i=0;
  (function step(){
    if(i>0){ const prev=svgRoot.querySelector('#u-'+seq[i-1]); if(prev){prev.classList.remove('hl-pulse');prev.classList.add('hl-green');} }
    if(i>=seq.length){
      if(captionEl) captionEl.innerHTML=`âœ… <b>Fim.</b> A ${INSTR[instr].name} percorreu ${seq.length} blocos.`;
      if(done) done(); return;
    }
    const g=svgRoot.querySelector('#u-'+seq[i]); if(g) g.classList.add('hl-pulse');
    if(captionEl) captionEl.innerHTML=`<b>Passo ${i+1}/${seq.length} â€” ${stepLabel(instr,i)}</b><br>${NARR[instr][i]}`;
    beep(420+i*55,.06,'triangle',.08);
    i++; setTimeout(step, 1150);
  })();
}

// --- Termos do caminho crÃ­tico de uma instruÃ§Ã£o (p/ exemplos resolvidos) ---
function termList(instr,t){
  const reg=t.regread, wr=(t.regwrite!==undefined?t.regwrite:t.regread);
  if(instr==='j') return [{l:'Mem.Instr',v:t.imem}];
  const a=[{l:'Mem.Instr',v:t.imem},{l:'Reg',v:reg},{l:'ULA',v:t.alu}];
  if(instr==='lw'||instr==='sw') a.push({l:'Mem.Dados',v:t.dmem});
  if(instr==='lw'||instr==='R')  a.push({l:'Escreve Reg',v:wr});
  return a;
}
function chipsHTML(instr,t){
  const terms=termList(instr,t); const total=terms.reduce((s,x)=>s+x.v,0);
  let h='<div class="tchips">';
  terms.forEach((x,i)=>{ h+=`<div class="tchip">${x.l}<b>${x.v}</b></div>`; if(i<terms.length-1) h+='<span class="tplus">+</span>'; });
  h+=`<span class="tplus">=</span><span class="teq">${total} ns</span></div>`;
  return h;
}

// --- "Me ensina" durante a prÃ¡tica (gratuito, repetÃ­vel) ---
function teachForQuestion(q){
  const fb=$('feedback'); fb.className='feedback hint show'; sfx.click();
  if(q.mode===1){
    const svg=document.querySelector('#qBody svg.datapath');
    fb.innerHTML=`ðŸ“– <b>Veja a ordem certa no diagrama:</b><div class="demo-caption" id="teachCap" style="margin-top:6px">â–¶ rodandoâ€¦</div>`;
    svg.querySelectorAll('.unit').forEach(g=>g.classList.remove('hl-green','hl-pulse','hl-red'));
    animatePath(q.instr, svg, $('teachCap'), ()=>{
      // limpa os destaques para vocÃª refazer sozinho
      setTimeout(()=>svg.querySelectorAll('.unit').forEach(g=>g.classList.remove('hl-green','hl-pulse')),1400);
    });
  } else if(q.mode===2){
    const c=CONTROL[q.instr];
    fb.innerHTML=`ðŸ“– <b>Como deduzir os sinais da ${INSTR[q.instr].name}:</b>
      <div class="sig-teach" style="margin-top:6px">`+
      SIGNAL_NAMES.map((nm,i)=>`<div class="sig-trow"><span class="badge ${c[i]==='X'?'x':c[i]?'on':'off'}">${nm}=${c[i]}</span><span>${SIG_WHY[nm][c[i]]}</span></div>`).join('')
      +`</div>`;
  } else if(q.mode===3){
    fb.innerHTML='ðŸ“– '+teachTime(q);
  } else if(q.mode===5){
    fb.innerHTML=`&#128214; <b>Q1 Assembly em blocos:</b>
      <ul><li><b>$a0/$a1</b>: argumentos da funcao.</li>
      <li><b>jal</b>: chama funcao e salva retorno em $ra.</li>
      <li><b>$v0</b>: registrador de retorno.</li>
      <li><b>jr $ra</b>: volta para quem chamou.</li>
      <li><b>lw/sw</b>: ler parametros e gravar vetor na memoria.</li>
      <li><b>limite 30</b>: se passar, use 30.</li></ul>`;
  } else {
    fb.innerHTML=`ðŸ“– <b>Mapa das fases do pipeline</b> â€” passe sobre cada bloco do diagrama p/ confirmar:
      <ul><li><b>IF</b> (busca): PC, MemÃ³ria de InstruÃ§Ãµes</li>
      <li><b>ID</b> (decodifica): Banco de Registradores (leitura), Unidade de Controle</li>
      <li><b>EX</b> (executa): ULA, Somador de Desvio</li>
      <li><b>MEM</b> (memÃ³ria): MemÃ³ria de Dados</li>
      <li><b>WB</b> (escrita): MUX MemtoReg â†’ grava no registrador</li></ul>`;
  }
}
function teachTime(q){
  const t=q.times;
  if(q.t3type==='single'){
    return `<b>MÃ©todo:</b> some os tempos dos blocos do caminho crÃ­tico da ${INSTR[q.instr].name}:${chipsHTML(q.instr,t)}`;
  }
  if(q.t3type==='period'){
    return `<b>MÃ©todo:</b> no uniciclo o clock precisa caber na instruÃ§Ã£o mais LENTA, a lw:${chipsHTML('lw',t)}<div class="callout">Logo o perÃ­odo = tempo da lw.</div>`;
  }
  // benchmark
  const mix=q.mix; const per=periodUniciclo(t); let avg=0; const rows=[];
  for(const k in mix){ const ti=instrTime(k,t); avg+=(mix[k]/100)*ti; rows.push(`${k} ${mix[k]}% Ã— ${ti} = ${Math.round(mix[k]/100*ti*100)/100}`); }
  avg=Math.round(avg*100)/100; const sp=Math.round((per/avg)*100)/100;
  return `<b>Passo a passo:</b><ul>
    <li><b>Uniciclo</b> = tempo da lw = <span class="mono">${per} ns</span> (todas as instruÃ§Ãµes usam esse clock).</li>
    <li><b>Multiciclo ideal</b> = cada instruÃ§Ã£o leva o prÃ³prio tempo â†’ mÃ©dia = Î£(fraÃ§Ã£oÃ—tempo):<br>
      <span class="mono">${rows.join(' + ')} = ${avg} ns</span></li>
    <li><b>Speedup</b> = uniciclo Ã· multiciclo = <span class="mono">${per} Ã· ${avg} = ${sp}Ã—</span></li></ul>`;
}

// --- ConteÃºdo da Academia: 5 capÃ­tulos de slides ---
const LESSONS = [
  { id:'unidades', ic:'ðŸ§±', title:'1 Â· Unidades funcionais', desc:'O que cada bloco do datapath faz.',
    slides:[
      {t:'text', html:`<h3>O que Ã© o caminho de dados?</h3>
        <p>O <b>datapath</b> (caminho de dados) Ã© o conjunto de blocos por onde os bits da instruÃ§Ã£o passam para serem executados. No MIPS <b>uniciclo</b>, toda instruÃ§Ã£o comeÃ§a e termina em <b>um Ãºnico ciclo de clock</b>.</p>
        <p>Os blocos principais sÃ£o: <span class="mono">PC</span>, <span class="mono">MemÃ³ria de InstruÃ§Ãµes</span>, <span class="mono">Banco de Registradores</span>, <span class="mono">ULA</span>, <span class="mono">MemÃ³ria de Dados</span>, <span class="mono">ExtensÃ£o de Sinal</span>, <span class="mono">Somadores</span>, <span class="mono">MUXes</span> e a <span class="mono">Unidade de Controle</span>.</p>
        <p>Vamos conhecer cada um. Toque para avanÃ§ar. ðŸ‘‰</p>`},
      {t:'explore'},
      {t:'text', html:`<h3>Resumo dos blocos</h3>
        <ul>
        <li><b>PC</b> â€” endereÃ§o da instruÃ§Ã£o atual.</li>
        <li><b>MemÃ³ria de InstruÃ§Ãµes</b> â€” busca a instruÃ§Ã£o.</li>
        <li><b>Banco de Registradores</b> â€” lÃª 2 registradores e escreve 1.</li>
        <li><b>ULA</b> â€” soma, subtrai, AND, OR, sltâ€¦</li>
        <li><b>MemÃ³ria de Dados</b> â€” usada por lw (lÃª) e sw (escreve).</li>
        <li><b>ExtensÃ£o de Sinal</b> â€” transforma o imediato de 16 â†’ 32 bits.</li>
        <li><b>Somadores</b> â€” PC+4 e endereÃ§o de desvio.</li>
        <li><b>MUXes</b> â€” chaves que escolhem o caminho (RegDst, ALUSrc, MemtoReg, PCSrc).</li>
        <li><b>Controle</b> â€” lÃª o opcode e comanda tudo isso.</li>
        </ul>
        <div class="callout">PrÃ³ximo capÃ­tulo: como a <b>Unidade de Controle</b> liga/desliga os sinais. ðŸŽ›</div>`}
    ]},

  { id:'sinais', ic:'ðŸŽ›', title:'2 Â· Sinais de controle', desc:'Os 7 sinais e por que cada um liga.',
    slides:[
      {t:'text', html:`<h3>A Unidade de Controle</h3>
        <p>Ela lÃª o <b>opcode</b> (os 6 primeiros bits da instruÃ§Ã£o) e gera os sinais que comandam os MUXes e as memÃ³rias. SÃ£o <b>7 sinais</b> principais:</p>
        <ul>
        <li><b>RegDst</b> â€” qual campo Ã© o registrador destino (rt ou rd).</li>
        <li><b>ALUSrc</b> â€” 2Âº operando da ULA: registrador (0) ou imediato (1).</li>
        <li><b>MemtoReg</b> â€” o que volta ao registrador: ULA (0) ou memÃ³ria (1).</li>
        <li><b>RegWrite</b> â€” grava em registrador? (1 = sim).</li>
        <li><b>MemRead</b> â€” lÃª a memÃ³ria de dados? (lw).</li>
        <li><b>MemWrite</b> â€” escreve na memÃ³ria de dados? (sw).</li>
        <li><b>Branch</b> â€” Ã© um desvio? (beq).</li>
        </ul>
        <p>Veja agora, sinal por sinal, como cada instruÃ§Ã£o Ã© decodificada. ðŸ‘‰</p>`},
      {t:'signals', instr:'lw'},
      {t:'signals', instr:'R'},
      {t:'signals', instr:'sw'},
      {t:'signals', instr:'beq'},
      {t:'text', html:`<h3>Tabela completa</h3>
        <table class="ctl"><tr><th>Sinal</th><th>R</th><th>lw</th><th>sw</th><th>beq</th></tr>
        <tr><td>RegDst</td><td>1</td><td>0</td><td class="x">X</td><td class="x">X</td></tr>
        <tr><td>ALUSrc</td><td>0</td><td>1</td><td>1</td><td>0</td></tr>
        <tr><td>MemtoReg</td><td>0</td><td>1</td><td class="x">X</td><td class="x">X</td></tr>
        <tr><td>RegWrite</td><td>1</td><td>1</td><td>0</td><td>0</td></tr>
        <tr><td>MemRead</td><td>0</td><td>1</td><td>0</td><td>0</td></tr>
        <tr><td>MemWrite</td><td>0</td><td>0</td><td>1</td><td>0</td></tr>
        <tr><td>Branch</td><td>0</td><td>0</td><td>0</td><td>1</td></tr></table>
        <div class="callout"><b>Regras pra decorar:</b> RegWrite=1 sÃ³ se grava registrador (R, lw) Â· ALUSrc=1 quando hÃ¡ imediato (lw, sw) Â· MemRead/MemWrite sÃ³ em lw/sw Â· Branch sÃ³ em beq Â· <b>X</b> = indiferente (quando nÃ£o escreve registrador, RegDst e MemtoReg nÃ£o importam).</div>`}
    ]},

  { id:'caminho', ic:'ðŸ›£ï¸', title:'3 Â· Caminho de uma instruÃ§Ã£o', desc:'DemonstraÃ§Ã£o animada de cada instruÃ§Ã£o.',
    slides:[
      {t:'text', html:`<h3>Como uma instruÃ§Ã£o "anda" no datapath</h3>
        <p>Cada tipo de instruÃ§Ã£o percorre um conjunto diferente de blocos. Nas prÃ³ximas telas vocÃª verÃ¡ a <b>animaÃ§Ã£o passo a passo</b> de cada uma. Observe a ordem dos blocos que acendem e leia a narraÃ§Ã£o.</p>
        <p>ðŸ‘‰ Comece pela tipo-R.</p>`},
      {t:'demo', instr:'R'},
      {t:'demo', instr:'lw'},
      {t:'demo', instr:'sw'},
      {t:'demo', instr:'beq'},
      {t:'demo', instr:'j'},
      {t:'text', html:`<h3>Resumindo os caminhos</h3>
        <ul>
        <li><b>tipo-R:</b> PC â†’ Instr â†’ Reg â†’ ULA â†’ escreve Reg.</li>
        <li><b>lw:</b> PC â†’ Instr â†’ Reg + ExtSinal â†’ ULA â†’ Mem.Dados â†’ escreve Reg.</li>
        <li><b>sw:</b> PC â†’ Instr â†’ Reg + ExtSinal â†’ ULA â†’ Mem.Dados (nÃ£o escreve Reg).</li>
        <li><b>beq:</b> PC â†’ Instr â†’ Reg â†’ ULA (subtrai) + Somador de Desvio â†’ MUX PCSrc.</li>
        <li><b>j:</b> PC â†’ Instr â†’ PC (salto direto).</li>
        </ul>
        <div class="callout">Quanto mais blocos no caminho, mais lenta a instruÃ§Ã£o. Isso liga direto com o <b>cÃ¡lculo de tempos</b>. â±</div>`}
    ]},

  { id:'tempos', ic:'â±ï¸', title:'4 Â· CÃ¡lculo de tempos', desc:'Caminho crÃ­tico, perÃ­odo e speedup.',
    slides:[
      {t:'text', html:`<h3>Modelo de tempos (do professor)</h3>
        <p>Cada bloco tem um atraso fixo em nanossegundos:</p>
        <table class="ctl"><tr><th>MemÃ³ria</th><th>Registradores</th><th>ULA</th><th>Controle</th><th>Somadores</th><th>Outros</th></tr>
        <tr><td>4 ns</td><td>1 ns</td><td>2 ns</td><td>1 ns</td><td>1 ns</td><td>0 ns</td></tr></table>
        <p>O tempo de uma instruÃ§Ã£o Ã© a <b>soma dos blocos do seu caminho crÃ­tico</b> (o caminho mais longo dos bits).</p>`},
      {t:'worked', kind:'single', instr:'lw'},
      {t:'worked', kind:'single', instr:'R'},
      {t:'worked', kind:'single', instr:'beq'},
      {t:'text', html:`<h3>Tempos de cada instruÃ§Ã£o</h3>
        <table class="ctl"><tr><th>lw</th><th>sw</th><th>tipo-R</th><th>beq</th><th>j</th></tr>
        <tr><td>12</td><td>11</td><td>8</td><td>7</td><td>4</td></tr></table>
        <h3 style="margin-top:12px">PerÃ­odo do uniciclo</h3>
        <p>Como o clock Ã© Ãºnico para TODAS as instruÃ§Ãµes, ele tem que caber na <b>mais lenta</b>:</p>
        <div class="callout"><b>PerÃ­odo uniciclo = 12 ns</b> (a lw). Mesmo a j, que precisa de sÃ³ 4 ns, gasta 12 ns. Esse desperdÃ­cio Ã© o que o <b>multiciclo</b> e o <b>pipeline</b> resolvem.</div>`},
      {t:'worked', kind:'benchmark', name:'GCC', mix:{lw:22,sw:11,R:49,beq:16,j:2}},
    ]},

  { id:'pipeline', ic:'ðŸš‰', title:'5 Â· Pipeline (5 fases)', desc:'IF, ID, EX, MEM, WB.',
    slides:[
      {t:'text', html:`<h3>Por que pipeline?</h3>
        <p>No uniciclo, uma instruÃ§Ã£o sÃ³ comeÃ§a quando a outra termina. O <b>pipeline</b> divide o datapath em <b>5 fases</b> e executa vÃ¡rias instruÃ§Ãµes ao mesmo tempo â€” como uma linha de montagem.</p>
        <ul>
        <li><b>IF</b> â€” <i>Instruction Fetch</i>: busca a instruÃ§Ã£o.</li>
        <li><b>ID</b> â€” <i>Instruction Decode</i>: decodifica e lÃª registradores.</li>
        <li><b>EX</b> â€” <i>Execute</i>: a ULA opera.</li>
        <li><b>MEM</b> â€” acessa a memÃ³ria de dados (lw/sw).</li>
        <li><b>WB</b> â€” <i>Write Back</i>: grava o resultado no registrador.</li>
        </ul>`},
      {t:'pipemap'},
      {t:'text', html:`<h3>Mapa unidade â†’ fase</h3>
        <ul>
        <li><b>IF</b>: PC, MemÃ³ria de InstruÃ§Ãµes</li>
        <li><b>ID</b>: Banco de Registradores (leitura), Unidade de Controle</li>
        <li><b>EX</b>: ULA, Somador de Desvio</li>
        <li><b>MEM</b>: MemÃ³ria de Dados</li>
        <li><b>WB</b>: MUX MemtoReg â†’ escrita no registrador</li>
        </ul>
        <div class="callout">Pronto! Agora pratique no <b>Pipeline Master</b> e nos outros modos. ðŸŽ®</div>`}
    ]}
];

// --- Renderiza o menu de capÃ­tulos da Academia ---
function renderAcademy(){
  const grid=$('chapterGrid'); grid.innerHTML='';
  LESSONS.forEach((ch,i)=>{
    const done=save.lessonsDone.includes(ch.id);
    const c=document.createElement('div'); c.className='chapter-card';
    c.innerHTML=`${done?'<span class="cdone">âœ”</span>':''}<div class="cic">${ch.ic}</div>
      <div class="ct">${ch.title}</div><div class="cd">${ch.desc}</div>`;
    c.onclick=()=>{ sfx.click(); openChapter(i); };
    grid.appendChild(c);
  });
}
// --- Player de liÃ§Ã£o ---
const LS = {ch:0, i:0};
function openChapter(idx){ LS.ch=idx; LS.i=0; showScreen('scr-lesson'); renderLessonSlide(); }
function renderLessonSlide(){
  const ch=LESSONS[LS.ch], s=ch.slides[LS.i], body=$('lessonBody');
  $('lessonTitle').textContent=ch.ic+' '+ch.title;
  $('lessonProg').textContent=`${LS.i+1}/${ch.slides.length}`;
  $('lessonDots').innerHTML=ch.slides.map((_,k)=>`<span class="${k===LS.i?'on':''}"></span>`).join('');
  $('lessonPrev').style.visibility = LS.i===0 ? 'hidden':'visible';
  $('lessonNext').textContent = LS.i===ch.slides.length-1 ? 'âœ“ Concluir' : 'PrÃ³ximo â†’';
  body.innerHTML='';
  if(s.t==='text'){ body.innerHTML=s.html; }
  else if(s.t==='explore'){ renderExplore(body); }
  else if(s.t==='demo'){ renderDemo(body, s.instr); }
  else if(s.t==='signals'){ renderSignalsLesson(body, s.instr); }
  else if(s.t==='worked'){ renderWorked(body, s); }
  else if(s.t==='pipemap'){ renderPipemap(body); }
  window.scrollTo(0,0);
}
function renderExplore(body){
  const keys=Object.keys(UNITS);
  body.innerHTML=`<p class="prompt">Toque em cada bloco do datapath para aprender o que ele faz. <span class="muted" id="expCount">(0/${keys.length})</span></p>
    ${buildDatapathSVG()}
    <div class="lesson-caption" id="expCap">ðŸ‘† Toque numa unidade para ver a explicaÃ§Ã£oâ€¦</div>`;
  wireTooltips(body);
  const visited=new Set();
  body.querySelectorAll('.unit').forEach(g=>{
    g.classList.add('clickable');
    g.onclick=()=>{
      const k=g.dataset.key, u=UNITS[k];
      g.classList.add('hl-green'); visited.add(k);
      $('expCap').innerHTML=`<b>${u.name}</b> â€” ${u.tip} <span style="color:var(--cyan)">[fase ${u.phase}]</span>`;
      $('expCount').textContent=`(${visited.size}/${keys.length})`;
      beep(500,.05,'triangle',.08);
    };
  });
}
function renderDemo(body, instr){
  body.innerHTML=`<div class="instr-box"><span class="lbl">DemonstraÃ§Ã£o â€” ${INSTR[instr].name}</span>${INSTR[instr].label}</div>
    <div class="demo-caption" id="demoCap">â–¶ iniciandoâ€¦</div>
    ${buildDatapathSVG()}
    <div style="margin-top:8px"><button class="btn ghost small" id="replayBtn">â†» Repetir demonstraÃ§Ã£o</button></div>`;
  const svg=body.querySelector('svg.datapath');
  const play=()=>animatePath(instr, svg, $('demoCap'));
  $('replayBtn').onclick=()=>{ sfx.click(); play(); };
  setTimeout(play, 350);
}
function renderSignalsLesson(body, instr){
  const c=CONTROL[instr];
  body.innerHTML=`<div class="instr-box"><span class="lbl">Decodificando os sinais</span>${INSTR[instr].label} <span class="muted" style="font-size:12px">â€” ${INSTR[instr].name}</span></div>
    <p class="prompt">A Unidade de Controle define cada sinal assim:</p>
    <div class="sig-teach">`+
    SIGNAL_NAMES.map((nm,i)=>`<div class="sig-trow"><span class="badge ${c[i]==='X'?'x':c[i]?'on':'off'}">${nm} = ${c[i]}</span><span>${SIG_WHY[nm][c[i]]}</span></div>`).join('')
    +`</div>`;
}
function renderWorked(body, s){
  const t=DEFAULT_TIMES;
  if(s.kind==='single'){
    body.innerHTML=`<div class="instr-box"><span class="lbl">Exemplo resolvido</span>Tempo da ${INSTR[s.instr].name}</div>
      <p class="prompt">Soma dos blocos do caminho crÃ­tico:</p>${chipsHTML(s.instr,t)}
      <div class="callout">A ${INSTR[s.instr].name} leva <b>${instrTime(s.instr,t)} ns</b>.</div>`;
  } else { // benchmark
    const mix=s.mix, per=periodUniciclo(t); let avg=0; const rows=[];
    for(const k in mix){ const ti=instrTime(k,t); const c=Math.round(mix[k]/100*ti*100)/100; avg+=mix[k]/100*ti;
      rows.push(`<tr><td>${k}</td><td>${mix[k]}%</td><td>${ti} ns</td><td>${c}</td></tr>`); }
    avg=Math.round(avg*100)/100; const sp=Math.round((per/avg)*100)/100;
    body.innerHTML=`<h3>Exemplo de prova: benchmark${s.name?' '+s.name:''} + speedup</h3>
      <p class="muted" style="font-size:12px">${s.name==='GCC'?'Este Ã© o benchmark GCC da Lista 3.':'Estilo da questÃ£o 3 da Lista 3.'}</p>
      <p>FrequÃªncia das instruÃ§Ãµes: <span class="mono">lw ${mix.lw}% Â· sw ${mix.sw}% Â· R(alu) ${mix.R}% Â· beq ${mix.beq}% Â· j ${mix.j}%</span></p>
      <table class="bench-table"><tr><th>Instr</th><th>Freq</th><th>Tempo</th><th>FreqÃ—Tempo</th></tr>${rows.join('')}
      <tr><td colspan="3"><b>MÃ©dia multiciclo</b></td><td><b>${avg} ns</b></td></tr></table>
      <div class="callout">
        <b>Uniciclo</b> = ${per} ns (a lw, para todas).<br>
        <b>Multiciclo ideal</b> = ${avg} ns (mÃ©dia ponderada).<br>
        <b>Speedup</b> = ${per} Ã· ${avg} = <b>${sp}Ã—</b>.
      </div>`;
  }
}
function renderPipemap(body){
  body.innerHTML=`<p class="prompt">O datapath dividido nas 5 fases do pipeline:</p>${buildDatapathSVG({stages:true})}
    <div class="pipe-legend">
      <div class="pl"><b>IF</b> â€” PC Â· Mem. InstruÃ§Ãµes</div>
      <div class="pl"><b>ID</b> â€” Banco de Reg. (lÃª) Â· Controle</div>
      <div class="pl"><b>EX</b> â€” ULA Â· Somador de Desvio</div>
      <div class="pl"><b>MEM</b> â€” MemÃ³ria de Dados</div>
      <div class="pl"><b>WB</b> â€” escrita no registrador</div>
    </div>`;
  ['IF','ID','EX','MEM','WB'].forEach(st=>{
    const z=body.querySelector(`.stagezone[data-stage="${st}"]`); if(z){ z.classList.add('ok'); z.style.cursor='default'; }
    const t=body.querySelector('#zl-'+st); if(t) t.textContent=st;
  });
}
function finishChapter(){
  const ch=LESSONS[LS.ch];
  if(!save.lessonsDone.includes(ch.id)){ save.lessonsDone.push(ch.id); persist(); }
  sfx.win(); toast('âœ… CapÃ­tulo concluÃ­do', ch.title);
  renderAcademy(); showScreen('scr-learn');
}

/* ===========================================================================
   10. JS â€” SEÃ‡ÃƒO H: NAVEGAÃ‡ÃƒO + TUTORIAL + BOOT
   =========================================================================== */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $(id).classList.add('active');
  $('topbar').style.display = (id==='scr-home') ? 'none' : 'flex';
  window.scrollTo(0,0);
}

// ---- Mapa de nÃ­veis ----
function renderLevels(){
  const grid=$('levelGrid'); grid.innerHTML='';
  LEVELS.forEach((lv,i)=>{
    const n=i+1; const unlocked = n<=save.unlocked;
    const c=document.createElement('div');
    c.className='levelcard '+(unlocked?'unlocked':'locked');
    const done = n<save.unlocked;
    c.innerHTML=`${done?'<span class="done">âœ”</span>':''}${!unlocked?'<span class="lock">ðŸ”’</span>':''}
      <div class="num">${n}</div><div class="lab">${lv.label}</div>
      <div class="tier ${lv.tier}">${lv.tier==='easy'?'FÃ¡cil':lv.tier==='med'?'MÃ©dio':'DifÃ­cil'}</div>`;
    if(unlocked) c.onclick=()=>{ sfx.click(); startLevel(n); };
    grid.appendChild(c);
  });
}

// ---- Tutorial (5 telas) ----
const TUTORIAL = [
  {e:'ðŸ§©', h:'Bem-vindo ao MIPS Datapath Quest', b:`
    <p>VocÃª vai dominar o <b>caminho de dados do MIPS uniciclo</b> jogando. SÃ£o <b>4 modos</b> distribuÃ­dos em <b>10 nÃ­veis</b> de dificuldade crescente.</p>
    <p class="muted">A cada acerto vocÃª ganha XP. Cada nÃ­vel dÃ¡ <b>3 vidas</b> â€” 3 erros e o nÃ­vel reinicia (com questÃµes embaralhadas).</p>`},
  {e:'ðŸŽ¬', h:'Modo 1 â€” Roteirista & Modo 4 â€” Pipeline', b:`
    <p><b>Roteirista:</b> clique nas unidades funcionais na <b>ordem</b> que a instruÃ§Ã£o percorre o datapath (PC â†’ Mem. InstruÃ§Ãµes â†’ Registradores â†’ ULA â†’ â€¦).</p>
    <p><b>Pipeline Master:</b> arraste as etiquetas <span class="mono">IF Â· ID Â· EX Â· MEM Â· WB</span> sobre as regiÃµes certas do diagrama.</p>
    <p class="muted">Passe o mouse/toque numa unidade para ver o que ela faz.</p>`},
  {e:'ðŸŽ›', h:'Modo 2 â€” Engenheiro de Controle', b:`
    <p>Para cada instruÃ§Ã£o, ligue os <b>7 sinais de controle</b> corretos. Tabela-base:</p>
    <table class="ctl"><tr><th>Sinal</th><th>R</th><th>lw</th><th>sw</th><th>beq</th></tr>
    <tr><td>RegDst</td><td>1</td><td>0</td><td class="x">X</td><td class="x">X</td></tr>
    <tr><td>ALUSrc</td><td>0</td><td>1</td><td>1</td><td>0</td></tr>
    <tr><td>MemtoReg</td><td>0</td><td>1</td><td class="x">X</td><td class="x">X</td></tr>
    <tr><td>RegWrite</td><td>1</td><td>1</td><td>0</td><td>0</td></tr>
    <tr><td>MemRead</td><td>0</td><td>1</td><td>0</td><td>0</td></tr>
    <tr><td>MemWrite</td><td>0</td><td>0</td><td>1</td><td>0</td></tr>
    <tr><td>Branch</td><td>0</td><td>0</td><td>0</td><td>1</td></tr></table>
    <p class="muted" style="margin-top:6px">X = indiferente (nÃ£o importa o valor).</p>`},
  {e:'â±', h:'Modo 3 â€” Calculadora de Tempos', b:`
    <p>Modelo de tempos: <span class="mono">MemÃ³ria 4 ns Â· Registradores 1 ns Â· ULA 2 ns Â· Controle 1 ns Â· Somadores 1 ns</span>.</p>
    <p>Tempos por instruÃ§Ã£o (caminho crÃ­tico):</p>
    <table class="ctl"><tr><th>lw</th><th>sw</th><th>tipo-R</th><th>beq</th><th>j</th></tr>
    <tr><td>12</td><td>11</td><td>8</td><td>7</td><td>4</td></tr></table>
    <p class="muted" style="margin-top:6px">O <b>perÃ­odo do uniciclo</b> = maior tempo = 12 ns (lw). No multiciclo ideal, cada instruÃ§Ã£o leva o seu prÃ³prio tempo.</p>`},
  {e:'ðŸ†', h:'Pronto para comeÃ§ar!', b:`
    <p>PeÃ§a <b>dicas</b> a qualquer momento (custam ${HINT_COST} XP). Desbloqueie <b>conquistas</b> e suba os 10 nÃ­veis.</p>
    <p>Seu progresso Ã© salvo automaticamente neste navegador. Bons estudos! ðŸš€</p>`}
];
let tutIdx=0;
function renderTutorial(){
  const t=TUTORIAL[tutIdx];
  $('tutBody').innerHTML=`<div class="tut-emoji">${t.e}</div><h2 class="center">${t.h}</h2>${t.b}`;
  $('tutDots').innerHTML=TUTORIAL.map((_,i)=>`<span class="${i===tutIdx?'on':''}"></span>`).join('');
  $('tutPrev').style.visibility = tutIdx===0?'hidden':'visible';
  $('tutNext').textContent = tutIdx===TUTORIAL.length-1 ? 'ComeÃ§ar â–¶' : 'PrÃ³ximo â†’';
}

// ---- LigaÃ§Ãµes de botÃµes / boot ----
function boot(){
  refreshHUD();
  // Home
  $('btnStart').onclick=()=>{ sfx.click(); renderLevels(); showScreen('scr-levels'); };
  $('btnRogue').onclick=()=>{ sfx.click(); startRoguelikeRun(); };
  $('btnFree').onclick=()=>{ sfx.click(); startFree(); };
  $('btnLoad').onclick=()=>{ sfx.click(); renderLevels(); showScreen('scr-levels'); toast('ðŸ’¾ Progresso carregado', `NÃ­vel ${save.unlocked}, ${save.xp} XP.`); };
  $('btnTutorial').onclick=()=>{ sfx.click(); tutIdx=0; renderTutorial(); showScreen('scr-tutorial'); };
  $('btnLearn').onclick=()=>{ sfx.click(); renderAcademy(); showScreen('scr-learn'); };
  $('btnAch2').onclick=()=>{ sfx.click(); renderAchievements(); showScreen('scr-ach'); };
  $('btnReset').onclick=()=>{
    if(confirm('Apagar todo o progresso (XP, nÃ­veis, conquistas)?')){
      save=JSON.parse(JSON.stringify(DEFAULT_SAVE)); persist(); toast('ðŸ—‘ Progresso apagado','RecomeÃ§ando do zero.');
    }
  };
  // Tutorial
  $('tutPrev').onclick=()=>{ if(tutIdx>0){tutIdx--; renderTutorial(); sfx.click();} };
  $('tutNext').onclick=()=>{ if(tutIdx<TUTORIAL.length-1){tutIdx++; renderTutorial(); sfx.click();} else { sfx.click(); renderLevels(); showScreen('scr-levels'); } };
  // Academia / LiÃ§Ãµes
  $('learnBack').onclick=()=>{ sfx.click(); showScreen('scr-home'); };
  $('learnToPractice').onclick=()=>{ sfx.click(); renderLevels(); showScreen('scr-levels'); };
  $('lessonPrev').onclick=()=>{ if(LS.i>0){ LS.i--; renderLessonSlide(); sfx.click(); } };
  $('lessonNext').onclick=()=>{
    const ch=LESSONS[LS.ch];
    if(LS.i<ch.slides.length-1){ LS.i++; renderLessonSlide(); sfx.click(); }
    else { finishChapter(); }
  };
  $('lessonExit').onclick=()=>{ sfx.click(); renderAcademy(); showScreen('scr-learn'); };
  // HUD / topo
  $('learnToggle').onclick=()=>{
    save.learnMode=!save.learnMode; persist(); sfx.click();
    toast(save.learnMode?'ðŸŽ“ Modo Aprendiz':'ðŸ“ Modo Prova',
      save.learnMode?'O jogo te ensina: botÃ£o "Me ensina" grÃ¡tis.':'Sem ajuda grÃ¡tis; dicas custam XP.');
    if(document.getElementById('scr-game').classList.contains('active')) renderQuestion();
  };
  $('muteBtn').onclick=()=>{ save.muted=!save.muted; persist(); if(!save.muted) sfx.click(); };
  $('homeBtn').onclick=()=>{ sfx.click(); endRunContext(); refreshHUD(); showScreen('scr-home'); };
  // Resultado
  $('resMap').onclick=()=>{ sfx.click(); renderLevels(); showScreen('scr-levels'); };
  // Conquistas
  $('achBack').onclick=()=>{ sfx.click(); showScreen('scr-home'); };
}
boot();

