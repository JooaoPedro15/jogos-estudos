# Arquitetura de Computadores

## 🎯 Objetivo

Reunir jogos educacionais voltados para o estudo de **Arquitetura de Computadores II**.
Os jogos cobrem a arquitetura MIPS, caminho de dados (datapath), pipeline, controle,
linguagem de máquina, funções, memória, aritmética e desempenho.

## 🎮 Jogos disponíveis

### [jogo-arquitetura-roguelike/](jogo-arquitetura-roguelike/) — ARQUITETO: Tape-Out Run
**Estado:** Em desenvolvimento (projeto principal)

Roguelite de construção de CPU, reescrito do zero em ES modules. Cada run o jogador
atravessa um mapa procedural, coleta relicários e arquétipos, e enfrenta desafios
educacionais de toda a ementa de AC2. Inclui motor adaptativo (tópicos fracos
ressurgem), defeitos persistentes, boss multi-fase (a prova) e relatório de run.

**Tópicos cobertos:** Aritmética computacional, CLA, Lei de Amdahl, Desempenho,
Hierarquia de memória/Cache, ISA MIPS, Funções MIPS, Datapath e Controle, Tempos
(caminho crítico), Pipeline.

### [jogo-arquitetura-legacy/](jogo-arquitetura-legacy/) — MIPS Datapath Quest (versão 1)
**Estado:** Versão antiga (preservada) — NÃO modificar

Versão original do jogo em arquivo HTML único. Quiz/simulador do datapath MIPS
uniciclo com 4 modos de jogo, Academia de lições, Modo Aprendiz/Prova e um modo
"Roguelike da Prova" embutido. Funciona offline, sem servidor, sem dependências.

### [primeira-versao/](primeira-versao/) — Snapshot pré-roguelike
**Estado:** Preservado (backup)

Cópia intacta do jogo original **antes** da implementação do modo "Roguelike da Prova".
Serve como referência do estado anterior ao modo roguelike ter sido adicionado ao
arquivo único.

## 📁 Onde encontrar

| Pasta | Conteúdo |
| --- | --- |
| [`jogo-arquitetura-roguelike/`](jogo-arquitetura-roguelike/) | Projeto principal em desenvolvimento |
| [`jogo-arquitetura-legacy/`](jogo-arquitetura-legacy/) | Versão antiga (arquivada, funcional) |
| [`primeira-versao/`](primeira-versao/) | Snapshot anterior ao modo roguelike |
| [`docs/superpowers/`](docs/superpowers/) | Documentação de design e plano de implementação |
| [`work/checkpoints/`](work/checkpoints/) | 12 snapshots de desenvolvimento (checkpoint do legacy) |
| [`materiais/`](materiais/) | Materiais acadêmicos públicos |

> **Materiais privados** (PDFs de slides, listas, gabaritos) ficam em
> `materiais-privados/` (ignorada pelo Git). Veja o README dentro de `materiais/`.
