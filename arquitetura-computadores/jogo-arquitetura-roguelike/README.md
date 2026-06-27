# ARQUITETO: Tape-Out Run

## Nome
ARQUITETO: Tape-Out Run

## Descrição
Roguelite educacional de Arquitetura de Computadores (MIPS). Cada run o jogador atravessa
um mapa procedural, constrói um "build" de CPU (arquétipo + relicários), enfrenta desafios
educacionais de toda a ementa de AC2 e batalha um Boss multi-fase que representa a prova.

## Objetivo educacional
Cobrir **toda a ementa de Arquitetura de Computadores II** de forma integrada, não como quiz
puro, mas como um jogo onde os conhecimentos são o estado do jogo. Acertar/errar tem
consequências concretas (integridade, defeitos, combo). O motor adaptativo ressurge tópicos
em que o jogador tem dificuldade, gerando um relatório de run com o que estudar.

## Conteúdos trabalhados
10 tópicos do syllabus confirmado nos materiais de AC2:

| Tópico | Desafios disponíveis |
| --- | --- |
| Aritmética computacional | `src/content/challenges/aritmetica.js` |
| CLA (Carry-Lookahead Adder) | `src/content/challenges/cla.js` |
| Lei de Amdahl | `src/content/challenges/amdahl.js` |
| Desempenho | `src/content/challenges/desempenho.js` |
| Memória / Cache | `src/content/challenges/memoria.js` |
| ISA (Instruction Set Architecture) | `src/content/challenges/isa.js` |
| Funções MIPS | `src/content/challenges/funcoes.js` |
| Datapath e Controle | `src/content/challenges/datapath.js` |
| Tempos (caminho crítico) | `src/content/challenges/datapath.js` |
| Pipeline | `src/content/challenges/pipeline.js` |

7 tipos de desafio: escolha única, múltipla escolha, numérico, ordenar blocos, alternar
sinais, corrigir bug, prever saída.

## Mecânicas
- **Mapa procedural** em camadas (estilo Slay the Spire): sem becos sem saída, com escolha
  de caminho, nós de desafio, elite, loja, descanso, evento e boss.
- **Recursos de run:** Integridade (HP), Orçamento (moeda), Foco, Calor (overclock),
  Combo.
- **Build system:** arquétipo inicial + 8 relicários com 3 arquétipos. Relicários
  alteram o resolvedor de respostas.
- **Motor adaptativo:** rastreia mastery por subtópico; tópicos fracos voltam mais vezes.
- **Defeitos (cicatrizes):** erros criam defeitos persistentes; salas de descanso/revisão
  podem curá-los.
- **Boss final:** multi-fase, cobrindo múltiplos tópicos (representa a prova).
- **Relatório de run:** pontos fortes, fracos, e referências de material para estudar.
- **Save/load local** versionado com sanitização de dados.

## Tecnologias
- **JavaScript (ES modules)** — zero dependências externas
- **HTML5 + CSS3** — UI renderizada
- **WebAudio** — efeitos sonoros gerados proceduralmente
- **SVG** — datapaths e visuais gerados em código
- **localStorage** — persistência de save
- **Node.js** — testes (sem framework, asserts manuais)

## Requisitos
- Node.js 22+ (para testes)
- Python 3 (para servir arquivos estáticos, via `npm run serve`)
- Navegador moderno (ES modules via `<script type="module">`)

## Instalação
Não há `node_modules` — o projeto não possui dependências. Basta clonar e servir.

```bash
cd arquitetura-computadores/jogo-arquitetura-roguelike
npm run serve          # python -m http.server 8080
```

Ou abra `index.html` com qualquer servidor estático na porta 8080.

## Execução
```bash
npm run serve
```
Acesse `http://localhost:8080` no navegador.

## Testes
```bash
npm test              # node tests/run-all.js
```
Executa testes de: RNG, mapgen, validação de conteúdo, resolvedor de respostas, mastery,
seleção adaptativa, recursos, migração de save, progressão, motor de jogo.

## Estrutura das pastas
```text
jogo-arquitetura-roguelike/
├── src/
│   ├── main.js               Bootstrap (carrega conteúdo + save, monta UI)
│   ├── config.js             Constantes sintonizáveis (run, combate, scoring)
│   ├── core/                 Engine de jogo (state machine, recursos, RNG, answers)
│   ├── mapgen/               Geração procedural de mapa
│   ├── adaptive/             Mastery tracking, seleção adaptativa, relatórios
│   ├── meta/                 Relicários, arquétipos, meta-progressão
│   ├── persistence/          Save/load com migração versionada
│   ├── content/              Schema, validação, registro + 9 módulos de desafios
│   │   └── challenges/       datapath, pipeline, funcoes, memoria, isa, cla,
│   │                          aritmetica, amdahl, desempenho
│   └── effects/              Efeitos sonoros (sfx)
├── tests/                    Testes (Node puro, sem framework)
├── styles/                   CSS principal
├── docs/                     BRAINSTORM.md (decisões de design)
├── index.html                Entry point
└── package.json
```

## Estado atual
**Em desenvolvimento.** O núcleo (engine, mapgen, adaptativo, conteúdo, save) está
implementado e testado. A UI está funcional. É o projeto principal e ativo da matéria.

## Limitações
- Sem simulador visual de datapath com fiação interativa (futuro: conceito A completo).
- Sem pipeline em tempo real com forwarding/stall jogável (futuro: conceito B completo).
- Efeitos sonoros e visuais ainda em evolução.
- Quantidade de desafios por subtópico pode ser expandida.

## Próximos passos
- Simulador visual de datapath com fiação interativa.
- Pipeline em tempo real (forwarding/stall).
- Mais arquétipos, relicários e eventos.
- Desafios diários por seed.
- Editor de conteúdo.
