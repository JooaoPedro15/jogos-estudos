# Organizacao do Repositorio

Este documento explica a estrutura do repositorio "jogos-estudos" e como novos
jogos devem ser adicionados.

## Principios

1. Repositorio unico, projetos independentes.
2. Uma pasta raiz por materia.
3. Um jogo por subpasta.
4. Documentacao junto do projeto.
5. Materiais ficam em `materiais/` quando podem ser versionados e em
   `materiais-privados/` quando devem ficar apenas localmente.

## Estrutura

```text
jogos-estudos/
  README.md
  docs/
    README.md
    organizacao-do-repositorio.md
    inventario-dos-projetos.md
    superpowers/
      specs/
  aeds/
    README.md
    jogo-aeds-2/
    reavaliacao-aeds-2/
    materiais/
    docs/
  arquitetura-computadores/
    README.md
    jogo-arquitetura-roguelike/
    jogo-arquitetura-legacy/
    primeira-versao/
  arquivos-avulsos/
```

## Padrao de nomes

| Item | Regra | Exemplo |
| --- | --- | --- |
| Materia | minusculo, sem acento, hifenizado quando necessario | `arquitetura-computadores` |
| Jogo | nome hifenizado e descritivo | `reavaliacao-aeds-2` |
| Docs do projeto | dentro do proprio jogo | `aeds/reavaliacao-aeds-2/docs/` |
| Materiais versionados | dentro da materia | `aeds/materiais/` |
| Materiais privados | pasta ignorada localmente | `aeds/materiais-privados/` |

## Como adicionar um jogo

1. Criar a pasta dentro da materia.
2. Criar `README.md` do jogo.
3. Criar `docs/` do jogo com spec, mecanicas, arquitetura e roadmap.
4. Se houver codigo, manter dependencias e comandos dentro da propria pasta.
5. Atualizar `aeds/README.md` ou o README da materia correspondente.
6. Atualizar `docs/inventario-dos-projetos.md`.
7. Atualizar o README raiz quando o projeto ja tiver estado tecnico claro.

## Onde colocar documentacao

| Tipo | Onde |
| --- | --- |
| Documentacao geral do repo | `docs/` |
| Spec formal do fluxo de design | `docs/superpowers/specs/` |
| Documentacao de um jogo | `<materia>/<jogo>/docs/` |
| README por materia | `<materia>/README.md` |
| README por jogo | `<materia>/<jogo>/README.md` |

## Materiais

Por padrao, materiais sensiveis ou privados ficam fora do Git. Ainda assim, um
projeto pode versionar materiais de referencia em `<materia>/materiais/` quando
o dono do repositorio decidir que eles podem subir.

No caso atual de AEDS II, `aeds/materiais/Provas/` e
`aeds/materiais/Slides AEDS 2/` podem ser versionados e sao usados como base do
jogo `aeds/reavaliacao-aeds-2`.

## Independencia dos projetos

- Cada jogo deve ter seus proprios comandos.
- Nao ha workspace, Turborepo ou Nx.
- Dependencias nao devem ser compartilhadas implicitamente entre jogos.
- O `.gitignore` raiz cobre dependencias, builds, temporarios e pastas privadas.
- Caminhos internos de um projeto devem funcionar a partir da propria pasta.

