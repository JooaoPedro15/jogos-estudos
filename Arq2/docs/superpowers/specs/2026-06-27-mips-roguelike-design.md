# MIPS Datapath Quest - Roguelike da Prova

Data: 2026-06-27
Arquivo alvo: `D:\Projetos\Arq2\mips-datapath-quest.html`

## Objetivo

Transformar o prototipo atual em um modo de estudo com cara de roguelike: uma
run curta, rejogavel e recompensadora que treina a Lista 3 inteira. O aluno deve
sentir que esta jogando "so mais uma run", enquanto pratica datapath, controle,
tempos, pipeline e a questao de assembly MIPS.

O jogo continua sendo:

- arquivo unico HTML + CSS + JS inline;
- vanilla JS, sem build e sem internet;
- mobile-friendly, usando toque/click em vez de drag HTML5 pesado;
- em portugues;
- alinhado aos fatos MIPS da Lista 3 e dos slides.

## Problema atual

O prototipo atual ja cobre bem:

- Q2: unidades funcionais e sinais de controle;
- Q3a: tempo de cada instrucao;
- Q3b: benchmark GCC/ABC e speedup;
- Q4: fases do pipeline.

A lacuna principal e a Q1, que pede programacao assembly MIPS: funcoes, vetor,
leitura de memoria, limite maximo 30, funcao quadrado, formula par/impar e soma.

Outra lacuna e de game feel. O jogo atual e util e correto, mas a experiencia
ainda parece uma sequencia de exercicios. O novo modo deve criar decisao,
progresso, risco/recompensa e vontade de repetir.

## Direcao aprovada

Criar um modo novo chamado provisoriamente **Roguelike da Prova**.

Ideia central:

1. O jogador inicia uma run.
2. A run gera um mapa curto com salas.
3. O jogador escolhe a proxima sala.
4. Cada sala dispara uma questao dos modos existentes ou do novo modo Assembly.
5. Acertos dao XP, combo, dano no boss e escolha de poder/reliquia.
6. Erros causam dano e criam "cicatrizes de erro".
7. Salas de revisao puxam cicatrizes reais do jogador e podem curar HP.
8. A run termina em um Boss Final Lista 3, com fases de Q1 a Q4.

## Loop principal

Uma run deve durar aproximadamente 12 a 18 minutos.

Estrutura MVP da run:

- 6 salas normais antes do boss;
- a cada passo, o jogador escolhe 1 entre ate 3 salas;
- depois de uma sala vencida, o jogador escolhe 1 entre ate 3 recompensas;
- apos as 6 salas, o Boss Final Lista 3 abre automaticamente;
- se o HP chegar a 0 antes ou durante o boss, a run termina em derrota.

Estados principais da run:

- `map`: escolha de sala;
- `question`: sala em execucao;
- `reward`: escolha de recompensa;
- `review`: revisao de cicatriz;
- `boss`: boss final;
- `result`: vitoria ou derrota da run.

O jogador tem:

- HP da run, inicialmente 3;
- foco, usado como recurso leve para dicas/mitigacoes;
- combo de acertos;
- XP ganho na run;
- reliquias/poderes ativos;
- cicatrizes de erro.

O Modo Aprendiz/Modo Prova existente continua valendo dentro da run:

- em Modo Aprendiz, "Me ensina" continua gratis e repetivel, mas marca a sala
  como assistida e reduz recompensa/bonus de combo;
- em Modo Prova, dicas consomem XP como hoje e tambem podem consumir 1 foco
  quando a run estiver ativa;
- poderes podem mitigar custo, dano ou quebra de combo, mas nao devem esconder a
  explicacao pedagogica.

## Tipos de sala

### Sala Datapath

Usa o Modo 1 existente.

Treina:

- caminho de `R`, `lw`, `sw`, `beq` e `j`;
- ordem das unidades funcionais.

Efeito de jogo:

- risco baixo;
- boa para manter combo;
- causa dano no chefe Q2/Datapath.

### Sala Controle

Usa o Modo 2 existente.

Treina:

- RegDst;
- ALUSrc;
- MemtoReg;
- RegWrite;
- MemRead;
- MemWrite;
- Branch.

Efeito de jogo:

- risco medio;
- recompensa boa se acertar sem ajuda;
- erros geram cicatrizes ligadas ao sinal errado.

### Sala Tempo

Usa o Modo 3 existente.

Treina:

- tempo unico por instrucao;
- periodo uniciclo;
- benchmark GCC;
- benchmark ABC;
- speedup uniciclo/multiciclo.

Efeito de jogo:

- risco alto;
- recompensa maior;
- ideal para reliquias raras.

### Sala Pipeline

Usa o Modo 4 existente.

Treina:

- IF;
- ID;
- EX;
- MEM;
- WB.

Efeito de jogo:

- risco medio/baixo;
- pode recuperar foco se acertar bem;
- reforca a Q4 visualmente.

### Sala Assembly Q1

Novo Modo 5.

Treina a Q1 por blocos verificaveis, sem criar um assembler completo.

Subtipos:

- `call`: argumentos em `$a0/$a1`, chamada com `jal`, retorno em `$v0`,
  retorno de funcao com `jr $ra`;
- `memory`: leitura dos dois parametros na memoria e escrita do vetor com
  `lw`/`sw`;
- `limit`: se quantidade for maior que 30, usar 30;
- `loop`: iterar `i` de 0 ate `n-1`;
- `formula`: se `i` par, `y[i] = 2*i^2 + 2*i + 1`; se impar, `y[i] = i^2`;
- `trace`: simular `i` pequeno e conferir `y[i]` e soma acumulada.

Interacao:

- escolha unica;
- ordenar blocos;
- completar lacunas;
- inputs numericos pequenos.

O objetivo e fazer o aluno reconhecer a estrutura correta da solucao antes de
escrever tudo sozinho na prova.

### Sala Revisao

Usa cicatrizes de erro.

Exemplo:

- erro em MemWrite durante `lw` cria cicatriz `Memoria de dados`;
- erro em `$v0` cria cicatriz `Retorno de funcao`;
- erro em IF/ID/EX cria cicatriz de pipeline.

Ao entrar numa sala de revisao:

1. O jogo escolhe uma cicatriz ativa.
2. Mostra uma explicacao curta do erro.
3. Pede uma microquestao focada.
4. Se o jogador acerta, remove a cicatriz e cura 1 HP ou da foco.
5. Se erra, a cicatriz continua, mas o jogo mostra explicacao.

Se ainda nao houver cicatrizes ativas, uma sala de Revisao vira uma sala de
descanso curta: mostra um resumo de um conceito ja vencido e oferece +1 foco.

## Poderes e reliquias

Poderes devem ser simples de entender e baratos de implementar.

Exemplos de recompensas:

- `PC+4`: primeiro erro da sala nao quebra combo.
- `RegWrite+`: +25 XP em sala Controle.
- `Cache Mental`: erro em sala Tempo mostra formula e reduz dano.
- `Branch Sense`: acerto em `beq` ou Pipeline sem ajuda da +1 foco.
- `$ra Salvo`: uma falha em chamada/retorno de funcao vira revisao em vez de dano.
- `ALU Overclock`: combo 5+ causa dano dobrado no boss atual.
- `Clock Agressivo`: +50% XP, mas erro em tempo custa 2 HP.
- `Checklist da Lista`: revisao perfeita cura 1 HP e remove uma cicatriz.

Recompensas aparecem apos salas vencidas. O jogador escolhe 1 entre 3 opcoes.

Para o MVP, se uma recompensa exigir uma condicao que nao se aplica naquela run,
ela pode simplesmente nao aparecer no sorteio.

## Boss Final Lista 3

O boss final representa a prova.

Ele tem quatro fases:

1. Q1 Assembly: chamada, loop, memoria e formula.
2. Q2 Datapath/Controle: caminho e sinais para `lw`, `sw`, `beq`, `add`.
3. Q3 Tempos: tempo por instrucao e benchmark GCC/ABC.
4. Q4 Pipeline: dividir o datapath em IF, ID, EX, MEM, WB.

Cada fase usa questoes ja existentes ou o novo Modo 5. O boss nao precisa de uma
tela totalmente nova no MVP; pode usar a tela de jogo atual com HUD de boss.

No MVP, "dano no boss" e uma representacao visual simples:

- cada fase do boss tem 1 a 2 desafios obrigatorios;
- acertar um desafio reduz o HP visual daquela fase;
- ao limpar os desafios da fase, avanca para a proxima fase;
- vencer as quatro fases vence a run;
- errar causa dano ao jogador e cria cicatriz, mas nao precisa reiniciar a fase
  inteira.

## Resultado da run

Ao vencer ou perder, mostrar:

- XP da run;
- maior combo;
- salas vencidas;
- boss/fase alcancada;
- conceitos fortes;
- conceitos fracos;
- cicatrizes restantes;
- sugestao de proxima run ou capitulo da Academia.

O resultado deve fazer o aluno pensar: "sei exatamente o que revisar agora".

## Integracao com o prototipo atual

Alteracoes esperadas:

### HTML

- Adicionar botao na Home: `Roguelike da Prova`.
- Reusar a tela `scr-game` para questoes.
- Reusar `scr-result` quando possivel.
- Se necessario, adicionar uma tela simples `scr-run-map` para escolha de sala.

### CSS

- Reusar botoes, cards, paineis, feedback e tema escuro.
- Adicionar estilos pequenos para:
  - mapa da run;
  - cartas de recompensa;
  - HUD da run;
  - blocos de codigo Assembly;
  - cicatrizes de erro.

### JS

- Adicionar estado de run, por exemplo `RUN`.
- Adicionar factory `q5(...)` para Assembly.
- Adicionar `startRoguelikeRun()`.
- Adicionar geracao de mapa/salas.
- Adicionar selecao de recompensa.
- Adicionar cicatrizes de erro.
- Adicionar renderizador do Modo 5.
- Ajustar `renderQuestion()` para aceitar modo 5.
- Ajustar `questionSolved()` e `loseLife()` para respeitar run roguelike quando ativa.
- Atualizar Academia para dizer que Q1 agora e coberta pelo Treinador Assembly.

## Escopo MVP

O MVP deve entregar:

- botao de entrada do roguelike;
- mapa simples com escolhas de sala;
- HP, combo, foco e poderes ativos;
- pelo menos 6 tipos de sala;
- novo Modo 5 com 5 a 8 microquestoes de Assembly;
- sistema simples de 8 recompensas;
- cicatrizes de erro basicas;
- boss final com fases Q1-Q4;
- resultado da run com pontos fortes/fracos.

Fora do MVP:

- editor livre de assembly;
- parser/assembler completo;
- ranking online;
- internet ou assets externos;
- reescrita do jogo em framework;
- multiplos personagens/classes;
- animacoes complexas.

## Testes e verificacao

Obrigatorio antes de entregar:

1. Extrair o JS do HTML e rodar `node --check`.
2. Abrir o HTML no navegador.
3. Validar console sem erros.
4. Jogar uma run completa ate vitoria.
5. Jogar uma run com derrota.
6. Testar pelo menos uma sala de cada tipo.
7. Testar Modo Aprendiz e Modo Prova dentro da run.
8. Testar mobile/touch por interacoes de clique simples.

## Criterios de sucesso

- A pessoa entende a Lista 3 como uma campanha, nao como tabela.
- Q1 deixa de ser "nao coberta".
- Cada erro gera aprendizado rastreavel.
- A run tem escolhas reais e vontade de repetir.
- O jogo continua offline, em arquivo unico, sem dependencias.
- A precisao dos fatos MIPS existentes nao e alterada.
