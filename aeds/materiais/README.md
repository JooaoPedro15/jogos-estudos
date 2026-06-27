# Materiais Acadêmicos — AEDS II

## 🎯 Objetivo

Centralizar materiais acadêmicos relacionados a AEDS II que podem ser
**compartilhados publicamente** (resumos, anotações próprias, guias criados por você).

## 📁 O que colocar aqui

- Resumos e anotações próprias (texto, Markdown).
- Diagramas criados por você (PNG, SVG).
- Listas de exercícios com soluções próprias.
- Qualquer material que você **tenha permissão para redistribuir**.

## 🚫 O que NÃO colocar aqui

- **Slides de aula** (direitos autorais do professor/universidade).
- **Provas e gabaritos** oficiais.
- **Livros ou capítulos** escaneados.
- **Qualquer material que não seja seu ou que não tenha permissão para publicar.**

Esses materiais ficam em `materiais-privados/` (ignorada pelo Git). Veja as instruções
abaixo.

## 📂 Como organizar materiais privados localmente

O repositório possui uma pasta `materiais-privados/` (ignorada pelo `.gitignore`) que
deve existir **apenas localmente**, sem ser commitada.

```text
aeds/
├── materiais/              ← versionado (apenas conteúdo próprio)
└── materiais-privados/      ← ignorado pelo Git (slides, PDFs, provas)
    ├── slides/
    ├── listas/
    └── provas/
```

Para criar a estrutura local:
```bash
mkdir -p aeds/materiais-privados/slides
mkdir -p aeds/materiais-privados/listas
mkdir -p aeds/materiais-privados/provas
```

> **Nota:** No momento, os PDFs de referência da disciplina estão em
> `aeds/jogo-aeds-2/tmp/pdfs/` (ignorado pelo Git).
