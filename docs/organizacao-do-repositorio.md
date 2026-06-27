# Organização do Repositório

## 🎯 Objetivo

Este documento explica como o repositório "jogos-estudos" está organizado, para que
qualquer pessoa (incluindo você no futuro) entenda a estrutura, saiba onde encontrar
cada coisa e consiga adicionar novos projetos sem quebrar o padrão.

## 📐 Princípios

1. **Repositório único, projetos independentes.** Cada jogo tem seu próprio código,
   dependências, testes e forma de rodar. Não há workspace/monorepo complexo.
2. **Agrupamento por matéria.** Cada disciplina da faculdade tem uma pasta raiz.
3. **Preservação.** Versões antigas e snapshots são mantidos, nunca sobrescritos.
4. **Documentação honesta.** Conteúdos são documentados apenas se realmente existem
   no código ou nos materiais.
5. **Privacidade.** Materiais de terceiros, credenciais e rascunhos de IA ficam fora
   do Git.

## 🗂️ Estrutura

```text
jogos-estudos/
├── README.md                       README principal do repositório
├── .gitignore                      Cobertura única (Node, Python, IA, OS, IDEs)
├── docs/                           Documentação geral
│   ├── README.md
│   ├── organizacao-do-repositorio.md  (este arquivo)
│   └── inventario-dos-projetos.md
├── <materia>/                      Uma pasta por disciplina
│   ├── README.md                   Apresenta a matéria e seus jogos
│   ├── <jogo-xyz>/                 Um jogo por subpasta
│   │   ├── README.md
│   │   ├── src/ (ou equivalente)
│   │   └── ...
│   ├── materiais/                  Materiais acadêmicos públicos (versionados)
│   └── materiais-privados/         Materiais que NÃO vão para o Git (ignorado)
└── arquivos-avulsos/               Arquivos isolados sem projeto definido
```

## 📝 Padrão de nomes

Todas as pastas seguem estes padrões:

| Elemento | Regra | Exemplo |
| --- | --- | --- |
| Matéria | minúsculo, sem acento, sem espaço | `aeds`, `arquitetura-computadores` |
| Jogo | `jogo-<nome>` minúsculo, hifenizado | `jogo-aeds-2`, `jogo-arquitetura-roguelike` |
| Docs | `docs/` ou `materiais/` | `docs/`, `materiais/` |
| Arquivos privados | `*-privados/` (no `.gitignore`) | `materiais-privados/` |
| Documentação de projeto | Dentro do próprio projeto `docs/` | `jogo-aeds-2/docs/` |

## 🔧 Como adicionar uma nova matéria

1. Crie uma pasta raiz com o nome da matéria (minúsculo, hifenizado, sem acento):
   ```bash
   mkdir calculo-numerico
   ```
2. Crie o `README.md` da matéria (veja `aeds/README.md` como exemplo).
3. Crie `materiais/README.md` (explica o que pode ser compartilhado).
4. Crie `docs/` se houver documentação cruzada.
5. Adicione jogos dentro da pasta da matéria.

## 🔧 Como adicionar um novo jogo

1. Crie uma pasta dentro da matéria:
   ```bash
   mkdir calculo-numerico/jogo-interpolacao
   ```
2. Coloque o código-fonte, dependências e configuração.
3. Crie `README.md` no jogo com: nome, descrição, objetivo educacional, conteúdos,
   tecnologias, requisitos, instalação, execução, testes, estrutura, estado atual.
4. Verifique que `.gitignore` raiz cobre as tecnologias usadas.
5. Teste: instale, rode, rode testes. Confirme que tudo funciona.
6. Adicione o jogo na tabela do `README.md` principal.
7. Atualize `docs/inventario-dos-projetos.md`.

## 📖 Onde colocar documentação

| Tipo | Onde |
| --- | --- |
| Documentação geral do repo | `docs/` (raiz) |
| Specs/plans de um jogo | `<jogo>/docs/` (dentro do projeto) |
| Materiais acadêmicos públicos | `<materia>/materiais/` |
| Materiais acadêmicos privados | `<materia>/materiais-privados/` (ignorado) |
| README por matéria | `<materia>/README.md` |
| README por jogo | `<jogo>/README.md` |

## 🔒 O que permanece privado (fora do Git)

O `.gitignore` raiz cuida de ignorar:

| Pasta/arquivo | Motivo |
| --- | --- |
| `materiais-privados/` | Slides, PDFs e provas de terceiros |
| `prompts-privados/` | Prompts e conversas com IA |
| `ai-scratch/`, `session-notes/` | Rascunhos de sessão |
| `.claude/`, `.cursor/`, `.codex/` | Configs de assistentes/IDE |
| `.superpowers/` | Scratch de brainstorm |
| `.env`, `*.pem`, `*.key` | Credenciais e segredos |
| `node_modules/`, `dist/`, `tmp/` | Dependências, build e temporários |

## 🔄 Como atualizar a tabela do README principal

Sempre que adicionar, remover ou mudar o estado de um projeto:

1. Abra `README.md` na raiz.
2. Atualize a tabela de projetos (nome, matéria, descrição, tecnologias, estado, pasta).
3. Estados válidos: `Em desenvolvimento`, `Protótipo`, `Funcional`, `Pausado`,
   `Versão antiga (preservada)`, `Concluído`.
4. Não marque como "Concluído" sem confirmar testes e execução.
5. Atualize `docs/inventario-dos-projetos.md` também.

## 🏗️ Como manter cada projeto independente

- Cada jogo tem seu próprio `package.json` (se necessário).
- Não há workspaces, Turborepo ou Nx.
- Dependências não são compartilhadas entre projetos.
- O `.gitignore` raiz é a primeira camada; projetos podem ter `.gitignore`
  adicionais se necessário.
- Caminhos relativos dentro de cada projeto não dependem da posição no repo.
