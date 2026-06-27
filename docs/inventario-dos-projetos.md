# Inventário dos Projetos

Inventário técnico detalhado de cada projeto encontrado no repositório, documentando
sua localização, tecnologia, comandos e estado atual. Última atualização: 2026-06-27.

---

## Projeto 1: AEDS II Card Roguelike

| Campo | Valor |
| --- | --- |
| **Nome** | AEDS II Card Roguelike |
| **Pasta** | `aeds/jogo-aeds-2/` |
| **Matéria** | AEDS II — Algoritmos e Estruturas de Dados II |
| **Tecnologia** | React 19, TypeScript, Vite 8, Vitest 4, Testing Library |
| **Versão** | 0.1.0 |
| **Estado** | Em desenvolvimento |
| **Versão legacy?** | Não (versão única e atual) |

### Comandos

| Ação | Comando (dentro de `aeds/jogo-aeds-2/`) |
| --- | --- |
| Instalar dependências | `npm install` |
| Servidor de desenvolvimento | `npm run dev` |
| Testes | `npm test` |
| Testes (watch) | `npm run test:watch` |
| Lint / type-check | `npm run lint` |
| Build de produção | `npm run build` |

### Dependências

**Runtime:** react, react-dom, lucide-react
**Dev:** vite, @vitejs/plugin-react, typescript, vitest, @testing-library/react,
@testing-library/jest-dom, @testing-library/user-event, jsdom, @types/node,
@types/react, @types/react-dom

### Conteúdos trabalhados
ABB (2 desafios), AVL (2), Alvinegra (2), Hash (2), TRIE (2), Binária genérica (2),
Híbrida/Doidona (2). Total: 14 desafios.

### Documentação disponível
- `aeds/jogo-aeds-2/README.md`
- `aeds/jogo-aeds-2/docs/superpowers/specs/` — 3 specs de design
- `aeds/jogo-aeds-2/docs/superpowers/plans/` — 3 planos de implementação
- `aeds/README.md`

### Materiais acadêmicos relacionados
- PDFs de referência em `aeds/jogo-aeds-2/tmp/pdfs/` (unidades 04–08, ignorados do Git).
- Cobrem: pilha, fila, listas, árvores binárias, AVL, 2-3-4, alvinegra, hash, TRIE, PATRICIA.

### Problemas identificados
- `.git/` órfão existia na pasta (vazio) — removido durante reorganização.
- `src/` não estava commitado inicialmente — adicionado em commit posterior.
- Pilhas, filas e listas ainda não estão no banco de desafios (futuro).

---

## Projeto 2: ARQUITETO — Tape-Out Run (Roguelike)

| Campo | Valor |
| --- | --- |
| **Nome** | ARQUITETO: Tape-Out Run |
| **Pasta** | `arquitetura-computadores/jogo-arquitetura-roguelike/` |
| **Matéria** | Arquitetura de Computadores II |
| **Tecnologia** | JavaScript (ES modules), sem dependências externas |
| **Versão** | 0.1.0 |
| **Estado** | Em desenvolvimento (projeto principal) |
| **Versão legacy?** | Não (versão nova, reescrita do zero) |

### Comandos

| Ação | Comando (dentro de `arquitetura-computadores/jogo-arquitetura-roguelike/`) |
| --- | --- |
| Instalar dependências | Não há (zero dependências) |
| Servidor estático | `npm run serve` (python -m http.server 8080) |
| Testes | `npm test` (node tests/run-all.js) |

### Dependências
Nenhuma (zero `dependencies`, zero `devDependencies` no `package.json`).

### Conteúdos trabalhados
10 tópicos: Aritmética, CLA, Amdahl, Desempenho, Memória/Cache, ISA, Funções MIPS,
Datapath/Controle, Tempos, Pipeline. 7 tipos de desafio.

### Documentação disponível
- `arquitetura-computadores/jogo-arquitetura-roguelike/README.md`
- `arquitetura-computadores/jogo-arquitetura-roguelike/docs/BRAINSTORM.md`
- `arquitetura-computadores/README.md`

### Materiais acadêmicos relacionados
- Referenciados via `src/content/fontes.js` — materiais em `D:\CC\AC2` (não incluídos).
- Listas, gabaritos, slides e provas resolvidas.

### Problemas identificados
- Nenhum. Projeto limpo, sem `.git` interno, sem dependências.

---

## Projeto 3: MIPS Datapath Quest (Legacy)

| Campo | Valor |
| --- | --- |
| **Nome** | MIPS Datapath Quest (versão 1) |
| **Pasta** | `arquitetura-computadores/jogo-arquitetura-legacy/` |
| **Matéria** | Arquitetura de Computadores II |
| **Tecnologia** | HTML + CSS + JavaScript inline (vanilla), sem dependências |
| **Versão** | N/A (arquivo único) |
| **Estado** | Versão antiga (preservada) — NÃO modificar |
| **Versão legacy?** | Sim |

### Comandos

| Ação | Comando |
| --- | --- |
| Executar | Duplo-clique em `mips-datapath-quest.html` |

### Dependências
Nenhuma. Funciona offline.

### Conteúdos trabalhados
Datapath MIPS uniciclo, sinais de controle, tempos do caminho crítico, pipeline 5 estágios,
Academia de lições, Modo Aprendiz/Prova, modo Roguelike da Prova.

### Documentação disponível
- `arquitetura-computadores/jogo-arquitetura-legacy/README.md`
- `arquitetura-computadores/docs/superpowers/specs/2026-06-27-mips-roguelike-design.md`
- `arquitetura-computadores/docs/superpowers/plans/2026-06-27-mips-roguelike-implementation.md`

### Problemas identificados
- Arquivo duplicado idêntico em `arquivos-avulsos/mips-datapath-quest.html` (preservado).
- Sem testes automatizados.

---

## Projeto 4: Primeira Versão (Snapshot)

| Campo | Valor |
| --- | --- |
| **Nome** | MIPS Datapath Quest — snapshot pré-roguelike |
| **Pasta** | `arquitetura-computadores/primeira-versao/` |
| **Matéria** | Arquitetura de Computadores II |
| **Tecnologia** | HTML + CSS + JavaScript inline (vanilla) |
| **Versão** | N/A (arquivo único) |
| **Estado** | Preservado (backup) |
| **Versão legacy?** | Sim (snapshot anterior) |

### Comandos
Mesmo do legacy: duplo-clique em `mips-datapath-quest.html`.

### Documentação disponível
- `arquitetura-computadores/primeira-versao/README.md`

---

## Recursos adicionais versionados

| Recurso | Pasta | Descrição |
| --- | --- | --- |
| Checkpoints de desenvolvimento | `arquitetura-computadores/work/checkpoints/` | 12 snapshots HTML do processo de implementação do modo roguelike no legacy |
| HTML avulso duplicado | `arquivos-avulsos/mips-datapath-quest.html` | Cópia idêntica ao legacy (era raiz do Arq2) |
| Specs/plans do AEDS | `aeds/jogo-aeds-2/docs/superpowers/` | 3 specs de design + 3 planos de implementação |
| Spec/plan do Arq legacy | `arquitetura-computadores/docs/superpowers/` | Spec de design + plano de implementação do modo roguelike |
