# Materiais Acadêmicos — Arquitetura de Computadores II

## 🎯 Objetivo

Centralizar materiais acadêmicos relacionados a Arquitetura de Computadores II que podem
ser **compartilhados publicamente** (resumos, anotações próprias, guias criados por você).

## 📁 O que colocar aqui

- Resumos e anotações próprias (texto, Markdown).
- Diagramas criados por você (PNG, SVG).
- Qualquer material que você **tenha permissão para redistribuir**.

## 🚫 O que NÃO colocar aqui

- **Slides de aula** (direitos autorais do professor/universidade).
- **Listas de exercício e gabaritos** oficiais.
- **Provas e resoluções** oficiais.
- **Qualquer material que não seja seu ou que não tenha permissão para publicar.**

Esses materiais ficam em `materiais-privados/` (ignorada pelo Git).

## 📂 Como organizar materiais privados localmente

```text
arquitetura-computadores/
├── materiais/              ← versionado (apenas conteúdo próprio)
└── materiais-privados/      ← ignorado pelo Git (slides, PDFs, listas, provas)
    ├── slides/
    ├── listas/
    └── provas/
```

Para criar a estrutura local:
```bash
mkdir -p arquitetura-computadores/materiais-privados/slides
mkdir -p arquitetura-computadores/materiais-privados/listas
mkdir -p arquitetura-computadores/materiais-privados/provas
```

> **Nota:** O jogo faz referência a materiais externos (via `src/content/fontes.js`)
> que ficam no caminho local `D:\CC\AC2`. Esses materiais não são incluídos neste
> repositório.
