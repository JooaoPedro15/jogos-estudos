# Jogo de Arquitetura — versão 1 (arquivada)

**Esta é a versão original/legada. NÃO modificar durante o desenvolvimento da nova versão.**

## O que é
`MIPS Datapath Quest` — jogo de estudo do caminho de dados do MIPS uniciclo, com 4 modos
(Roteirista, Engenheiro de Controle, Calculadora de Tempos, Pipeline Master), Academia de
lições, Modo Aprendiz/Prova e, na última iteração, um modo "Roguelike da Prova" embutido no
próprio arquivo.

## Tecnologias
- Arquivo único `mips-datapath-quest.html`.
- HTML + CSS + JavaScript **inline**, vanilla (sem libs, sem build).
- Persistência em `localStorage`. Som via WebAudio. SVG do datapath.
- Funciona offline.

## Como executar
Duplo-clique em `mips-datapath-quest.html` (abre no navegador). Não precisa de servidor
nem internet.

## Datas
- Jogo original (datapath): criado em 2026-06-27.
- Snapshot arquivado aqui (já com o modo Roguelike-no-arquivo): **2026-06-27**.

## Observações
- Uma cópia anterior (antes do modo roguelike) também existe em `primeira-versao/` na raiz.
- A **nova versão**, reescrita do zero com arquitetura separada, fica em
  `jogo-arquitetura-roguelike/` na raiz do projeto. Esta pasta `legacy/` é só backup.
