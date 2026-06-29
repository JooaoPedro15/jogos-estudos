# Design — MIPS Datapath Quest: Modo Prova + Conceitos

**Data:** 2026-06-28
**Objetivo:** Tornar o jogador "expert para a prova (Lista 3)" — gabaritar Q2, Q3a, Q3b, Q4.
**Abordagem:** Foco cirúrgico (preservar o núcleo que funciona, adicionar sem reescrever).
**Premissa:** A prova provavelmente será **fechada** (múltipla escolha, V/F, numérica), não aberta.

---

## 1. Contexto e decisão

### Origem
O jogo `primeira-versao/mips-datapath-quest.html` (cópia intacta, preservada) tem:
- 4 modos: 🎬 Roteirista, 🎛 Engenheiro de Controle, ⏱ Calculadora de Tempos, 🚉 Pipeline Master
- Academia com 5 capítulos (lições em slides)
- Modo Aprendiz/Prova (toggle), 10 níveis, Modo Livre, conquistas, som, datapath SVG
- Mapeamento explícito com a Lista 3 (tabela em `scr-learn`)

### Diagnóstico de lacunas (vs. Lista 3)
| Questão | Cobertura atual | Lacuna identificada |
|---|---|---|
| **Q3a** (tempo de cada instrução) | 1 instrução por questão, entrada numérica | Nunca treina "tabela completa"; sem formato fechado |
| **Q3b** (speedup) | Só GCC e ABC fixos (nível 8/9) | Decora números; não domina o método; sem variação |
| **Q2** (ações das unidades + controle) | Toggles por instrução isolada | Falta comparar/justificar; sem formato fechado |
| **Q4** (pipeline) | Só mapeia fases | Falta o *porquê* (hazard, latência, ganho) |
| **Transversal** | Prática fragmentada por nível | Falta revisão espaçada e um simulado completo |

### Decisões do usuário
- **Escopo:** Expert para a prova (Lista 3) — gabaritar Q2, Q3a, Q3b, Q4.
- **Estilo de treino:** Réplica da prova **E** variação infinita (os dois).
- **Abordagem:** A — Foco cirúrgico.
- **Formato da prova:** Fechada (provavelmente). → todos os modos novos usam formato fechado.
- **Requisito transversal:** Toda questão tem botão "📖 Me explica" (gratuito, repetível).
- **Requisito (feedback de uso):** Glossário de conceitos sempre acessível — nenhum termo fica no escuro.

---

## 2. Visão geral do que muda

**Preservado intacto:** os 4 modos, a Academia (5 capítulos), 10 níveis, Modo Aprendiz/Prova, conquistas, som, datapath SVG, toda a base.

**Acrescentado (sem tocar no núcleo):**
1. **Modo Prova (Prova Fechada)** — 5º modo: questões fechadas que replicam Q2/Q3a/Q3b/Q4.
2. **Geração procedural de variações** — benchmarks, tempos, instruções, sinais aleatórios a cada partida.
3. **Simulado cronometrado** — fluxo completo Q2→Q3a→Q3b→Q4, com nota 0–10 e gabarito comentado.
4. **Modos infinitos** — Modo Livre turbinado + Prova Infinita (ambos procedurais).
5. **Glossário de Conceitos** — botão global + termos clicáveis inline.

---

## 3. Modo Prova (Prova Fechada) — detalhe por questão

Mecânica comum: toda questão tem **feedback imediato + explicação** e um **botão "📖 Me ensina"** (gratuito, repetível — mesmo rótulo/behavior do botão existente no Modo Aprendiz) que mostra o raciocínio completo. Gabarito sempre mostra o *porquê*, não só certo/errado.

### Q3a — Tempo de cada instrução
Variantes fechadas:
- **Múltipla escolha:** "Qual é o tempo da `lw`?" → 4 opções numéricas (distratores: 11, 13, 8).
- **Tabela correta:** 4 tabelas de tempos (lw/sw/R/beq/j); escolher a única correta.
- **Comparação:** "Qual instrução é a mais lenta?" → escolha entre lw/sw/R/beq/j.
- **Assertion-reasoning:** "A `beq` é mais rápida que a `R` porque não escreve no registrador" → V/F + justificativa.

### Q3b — Speedup / benchmark (com variação infinita)
Gerador procedural sorteia mistura nova (soma 100%) e opcionalmente tempos de unidades diferentes.
- 3 partes fechadas: (a) período uniciclo [numérico], (b) média multiciclo [numérico/MC], (c) speedup [MC com distratores].
- Distratores de speedup = erros comuns: invertido (1/speedup), média sem ponderar, período errado (sw em vez de lw).
- Sempre mostra gabarito passo a passo (fração×tempo de cada instrução).

### Q2 — Ações das unidades + controle
- **V/F sobre ações:** "Na `sw`, a ULA calcula o endereço de escrita" (V); "O `j` passa pela ULA" (F).
- **Múltipla escolha sobre sinais:** "Qual sinal diferencia `lw` de `sw`?" → MemRead vs MemWrite.
- **Tabela de controle com buracos:** tabela de 7 sinais com células vazias; escolher o valor.
- **"Por que esse sinal = X":** dão a justificativa, escolher qual sinal ela descreve.

### Q4 — Pipeline
- **Ordem das fases:** MC da sequência correta (IF→ID→EX→MEM→WB).
- **Unidade→fase:** MC "Em qual fase está a ULA?" / "O WB faz o quê?".
- **Assertion-reasoning:** "O pipeline é mais rápido porque executa 5 instruções ao mesmo tempo" (F — sobrepõe fases, não executa 5 completas).
- Mantém mapeamento arrastar-e-soltar para fixação.

---

## 4. Geração procedural de variações

Funções puras (recebem RNG opcional, retornam objetos de questão no mesmo formato dos factories existentes `{mode, diff, ...params, hint, explainFn}`).

### `geraBenchmark()`
1. Sorteia 5 frações que somam 100 (lw, sw, R, beq, j); nenhuma = 0; arredonda a múltiplos de 1%.
2. Opcional: sorteia tempos das unidades diferentes do default (ex.: imem=5, dmem=5).
3. Calcula período uniciclo + média multiciclo + speedup.
4. Gera 4 opções de speedup: correta + 3 distratores (invertido, média sem ponderar, período errado).
5. Retorna questão + gabarito comentado completo.

### `geraTempo()`
Sorteia instrução (ou tabela inteira), opcionalmente varia tempos das unidades. Distratores = erros comuns de aluno (esquecer EscreveReg, esquecer Mem.Dados, usar sw em vez de lw).

### `geraControle()`
Sorteia instrução + tipo de pergunta (V/F, qual-sinal-diferencia, tabela-com-buraco). Distratores = confusões reais (trocar MemRead/MemWrite, achar que beq usa ALUSrc=1).

### `geraPipeline()`
Sorteia tipo (ordem, unidade→fase, assertion-reasoning, mapeamento).

### Por quê
Hoje ~30 instâncias fixas (10 níveis × 3 questões em `LEVELS`). Com geradores, cada partida = prova nova. Você não decora "é 12", aprende "*como* achar que é 12".

---

## 5. Simulado Cronometrado

### Estrutura
- Sequência fixa de 8–10 questões cobrindo Q2 + Q3a + Q3b + Q4, na ordem da prova.
- **Cronômetro** no topo (contagem regressiva, ex.: 12 min).
- **Sem vidas, sem dica.** Só "📖 Me ensina" (que zera a questão: vale 0 pontos e conta como errada, mas continua no denominador — assim "usar a ajuda" tem custo na nota).
- **Sem volta:** respondida, avança.

### Nota final (0–10) + gabarito
- Nota por questão (certa/parcial/errada), com peso.
- **Gabarito completo comentado:** resposta correta + explicação + onde errou e por quê.
- **Diagnóstico por tópico:** "Q3a: 4/4 ✓ · Q3b: 1/3 ✗ → revise speedup".
- Histórico no localStorage (melhor nota, últimas 3 tentativas).

### Níveis
- **Simulado Treino** — sem cronômetro, "Me explica" livre.
- **Simulado Real** — cronometrado, sem volta.

### Acesso
Novo botão na Home: **"📝 Simulado da Prova"**. Cartão na Academia.

---

## 6. Modos infinitos

| Botão | O que é | Tempo | Vidas | Questões |
|---|---|---|---|---|
| ▶ Jogar / Praticar | 10 níveis (núcleo) | livre | 3/nível | fixas + Modo Prova |
| 🎲 Modo Livre | infinito, todos os modos | livre | ∞ | **procedurais** |
| 📝 Simulado da Prova | prova inteira | cronometrado | — | procedurais, sequência Q2→Q4 |
| ♾️ Prova Infinita | treino fechado anti-pegadinha | livre | ∞ | procedurais (só formato prova) |
| 📚 Academia | aprende primeiro | — | — | lições |

O **Modo Livre existente** deixa de só embaralhar o fixo e vira infinito real (procedurais). **Prova Infinita** é o primo focado em prova fechada.

---

## 7. Glossário de Conceitos

Nenhum termo técnico fica no escuro.

### Acesso 1 — Botão global "📖 Conceitos"
Na topbar (ao lado de 🎓/🔊/🏠), **visível em todas as telas**. Abre modal-glossário com todos os termos, organizados por categoria e com busca:
- **Unidades funcionais:** PC, Memória de Instruções, Banco de Registradores, ULA, Memória de Dados, Extensão de Sinal, Shift Left 2, Somadores, MUX, Unidade de Controle
- **Sinais de controle:** opcode, RegDst, ALUSrc, MemtoReg, RegWrite, MemRead, MemWrite, Branch, "don't care" (X)
- **Instruções:** tipo-R, lw, sw, beq, j, rs/rt/rd, imediato/offset
- **Tempos:** caminho crítico, período de clock, uniciclo, multiciclo, speedup, benchmark
- **Pipeline:** IF/ID/EX/MEM/WB, hazard, stall/bolha

Cada termo: **definição curta + o porquê importa + exemplo**.

### Acesso 2 — Termos clicáveis inline
No texto das questões e explicações, termos técnicos ficam **sublinhados e clicáveis** (ex.: <u>MUX PCSrc</u>, <u>caminho crítico</u>, <u>speedup</u>). Clica → popup com a definição na hora, sem sair da questão.

### Por que os dois
Botão global resolve "quero revisar". Clique inline resolve "vi uma palavra agora e não sei" — aprende no momento exato em que o termo aparece.

---

## 8. Arquitetura técnica

Arquivo único; **adicionar** seções, não reescrever o núcleo.

### Novas seções de JS (índice estendido)
- **Seção I — Geradores procedurais:** `geraBenchmark()`, `geraTempo()`, `geraControle()`, `geraPipeline()`. Funções puras, formato compatível com os factories existentes.
- **Seção J — Motor do Modo Prova:** `renderMode5()` para formatos fechados (MC, V/F, assertion-reasoning, tabela correta). Reaproveita `buildDatapathSVG`, `wireTooltips`, `critStr`, `chipsHTML`.
- **Seção K — Simulado:** estado `SIM`, cronômetro, montagem da sequência, correção + nota + gabarito.
- **Seção L — Glossário:** dados `GLOSSARY` + `renderGlossary()` + `wireConceptTerms()` (cliques inline).

### Compatibilidade com o motor
Questões do Modo Prova = objetos `{mode:5}`. Dispatcher novo `renderMode5` no mesmo padrão do `({1:..,2:..,3:..,4:..})[q.mode]` existente. Nível/simulado podem misturar modos antigos e novos na mesma fila.

### Persistência (novo `SAVE_KEY`, não corrompe saves antigos)
```js
simBest: 0,              // melhor nota no simulado (0–10)
simHistory: [],          // últimas 3 tentativas: {date, score, perTopic}
provaMastery: {}         // {Q2, Q3a, Q3b, Q4} taxa de acerto por tópico
```
`Object.assign({}, DEFAULT_SAVE, JSON.parse(raw))` já existe — saves antigos ganham defaults sem perder dados.

### Interface
- Home: novos botões **"📝 Simulado da Prova"** e **♾️ Prova Infinita"**.
- Topbar: botão **"📖 Conceitos"**.
- Academia: novo cartão **"Prova Fechada — Lista 3"**.
- Modo Prova (mode 5) entra na rotação dos níveis 6–10 e do Modo Livre.

### Layout de arquivos
- **Original intacta:** `arquitetura-computadores/primeira-versao/mips-datapath-quest.html` (não tocada — verificação de byte-identical obrigatória).
- **Cópia de trabalho:** `datapath-quest/mips-datapath-quest.html` (raiz do repo — **criar** este diretório e copiar o original para ele).

---

## 9. Fora de escopo (YAGNI)
- Q1 da Lista 3 (programação em assembly MIPS) — é programação, não datapath. Não coberta.
- Revisão espaçada SRS completa e mapeamento de maestria visual (abordagem B) — `provaMastery` dá um mínimo de diagnóstico por tópico sem o custo de um SRS completo.
- Refatoração dos modos existentes — não.

---

## 10. Verificação de sucesso
- [ ] Console do navegador sem erros ao carregar e jogar todos os modos.
- [ ] Modo Prova: todas as variantes fechadas (MC, V/F, assertion, tabela) funcionam com "Me explica".
- [ ] Geração procedural: 10 partidas seguidas produzem questões/variações diferentes.
- [ ] Simulado: cronômetro corre, nota 0–10 sai, gabarito comentado aparece, histórico persiste.
- [ ] Glossário: botão global abre em toda tela; cliques inline funcionam nas explicações.
- [ ] Modos infinitos: Modo Livre e Prova Infinita geram questões procedurais sem fim.
- [ ] Save antigo (do jogo original) carrega sem erro e ganha os novos campos.
- [ ] Original `primeira-versao/` permanece **byte-identical** ao original.
