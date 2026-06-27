# Brainstorm e decisão de design — Jogo Arquitetura (roguelite)

Data: 2026-06-27. Processo conduzido com 3 agentes especializados em paralelo
(mineração de material, game design roguelike, arquitetura de software/educacional).

## 1. Conceitos considerados

A premissa compartilhada que emergiu: **não fazer "responder pergunta → causar dano".**
O modelo do MIPS/arquitetura deve SER o estado de jogo. Acertar/errar vira consequência
(hardware que funciona ou quebra), não um checkpoint de quiz.

### Conceito A — "Datapath Forge" (montar e simular)
Você monta uma CPU a partir de componentes saqueados e roda um programa por ela. Os
tempos das unidades (Memória 4ns, Reg 1ns, ULA 2ns…) são os preços/atributos das peças;
os sinais de controle são a fiação; o caminho crítico real (lw=12, sw=11, R=8, beq=7, j=4)
é a condição de vitória. Erro = datapath quebrado visível.
- Força: cobre datapath, controle, tempos, CLA, uni/multiciclo. Muito expansível.
- Risco: simulador de datapath + UI de fiação é o item mais caro de implementar.

### Conceito B — "Pipeline Dispatcher" (puzzle de hazards em tempo real)
Você é a unidade de controle de hazards de um pipeline de 5 estágios. Instruções fluem
IF→ID→EX→MEM→WB; você insere forwarding/stall/flush sob pressão.
- Força: ensina pipeline, hazards, timing, convenção de chamada de forma muito divertida.
- Risco: tópico estreito (não cobre aritmética, cache, Amdahl). Vira "whack-a-mole".

### Conceito C — "Profiler's Gambit" (otimização/economia)
Você é engenheiro de desempenho com orçamento limitado e um prazo. Lei de Amdahl é a
matemática de combate: cada upgrade só acelera a fração que toca. Cache, clock, compilador
são cartas com tradeoff. Otimizar o caso comum (GCC/ABC) é a condição de vitória.
- Força: cobre Amdahl, desempenho (IC×CPI×clock), cache, métrica MIPS, representação numérica.
  É o mais fácil de implementar (resolvedor de fórmulas + cartas).
- Risco: pode parecer "planilha" se a visualização for fraca.

## 2. Comparação (resumo das pontuações dos agentes)

| Critério | A Forge | B Dispatcher | C Profiler |
|---|---|---|---|
| Diversão pura | 4 | 5 | 3 |
| Poder de ensino | 5 | 4 | 4 |
| Variedade entre runs | 4 | 4 | 4 |
| Facilidade de implementação | 2 | 3 | 4 |
| Potencial de expansão | 5 | 3 | 4 |
| Pouca dependência de perguntas (maior=melhor) | 4 | 5 | 4 |
| Cobertura do conteúdo | alta (estrutural) | média | alta (quantitativa) |

Nenhum conceito sozinho cobre toda a ementa. A/forge domina o lado estrutural; C/profiler
o lado quantitativo; B/dispatcher o lado dinâmico.

## 3. Proposta escolhida — "ARQUITETO: Tape-Out Run" (síntese)

**Roguelite de construção de CPU.** Cada run você atravessa um mapa procedural montando
um processador. As decisões de build (componentes/relíquias) mudam QUAIS conhecimentos
são vantajosos. Encontros são desafios educacionais de toda a ementa, mas embrulhados em
economia de run, risco/recompensa e defeitos persistentes — não em quiz puro.

Espinha = economia/estado do conceito A + C (build + resolvedor de desempenho), com
encontros de B (pipeline) como tipo de sala. Boss = a prova (fases multi-tópico).

### Por que esta escolha
1. **Cobre a ementa inteira** confirmada nos materiais (aritmética, CLA, Amdahl, desempenho,
   cache, ISA, funções, datapath, controle, tempos, pipeline) — cada tópico vira conteúdo
   de dado (data-driven), expansível.
2. **Não é quiz**: o que dá profundidade é o build (arquétipos + relíquias), o risco/recompensa
   (overclock, gastar orçamento), os **defeitos** (erros viram cicatrizes que persistem e
   precisam de reparo) e a **seleção adaptativa** (tópicos fracos voltam mais).
3. **Implementável em vanilla JS** sem simulador pesado: o núcleo usa matemática de
   desempenho real (caminho crítico, Amdahl, CPI) + sistema de cartas, que é testável.
4. **Sessão curta com progresso**: run de ~15–30 min, save local, meta-progressão leve.

### Mudanças principais vs. jogo antigo
- Jogo antigo: arquivo único, 4 modos de exercício do datapath + modo roguelike colado.
- Novo: projeto multi-arquivo (ES modules), lógica/conteúdo/UI/dados separados, conteúdo
  validado em dado estruturado, motor adaptativo, testes em Node, cobertura de toda a ementa.

## 4. Sistemas implementados no núcleo (MVP)
- RNG semeado (mulberry32) → mapa/encontros/seleção reprodutíveis.
- Mapa procedural em camadas, sem becos sem saída, com escolha de caminho.
- Recursos de run: Integridade (vida), Orçamento, Combo, Calor (risco de overclock).
- Build: arquétipo inicial + relíquias/componentes que alteram o resolvedor.
- Encontros: Workload (combate), Elite, Loja, Descanso/Revisão, Evento, Boss.
- Conteúdo educacional validado, com explicação de erro por alternativa.
- Motor adaptativo (mastery por subtópico + seleção que ressurge fraquezas).
- Defeitos (cicatrizes) a partir de erros + salas de reparo.
- Boss final multi-fase (a prova).
- Relatório de run (fortes/fracos + o que estudar, com fonte do material).
- Save/load local versionado com sanitização.

## 5. Melhorias futuras recomendadas
- Simulador de datapath com fiação visual (conceito A completo).
- Pipeline em tempo real com forwarding/stall jogável (conceito B completo).
- Mais arquétipos, relíquias e eventos; desafios diários por seed.
- Editor de conteúdo + mais challenges por subtópico.
- Animações e efeitos sonoros mais ricos; acessibilidade.
