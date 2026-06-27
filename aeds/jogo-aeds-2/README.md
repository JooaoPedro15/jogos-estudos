# AEDS II Card Roguelike

## Nome
AEDS II Card Roguelike (nome interno do projeto: "Guardião das Estruturas")

## Descrição
Jogo educativo em formato de roguelike de cartas, onde cada run apresenta 14 encontros
baseados em estruturas de dados de AEDS II. O jogador resolve desafios (questões de prova)
usando cartas de ferramentas, tentando maximizar o score e chegar ao chefe final.

## Objetivo educacional
Fixar conteúdos de AEDS II praticando questões no estilo da prova universitária, de forma
ativa e gamificada. O jogo aborda propriedades, operações e complexidade de estruturas
de dados, exigindo que o jogador interprete diagramas, simule operações e complete código.

## Conteúdos trabalhados
Baseado no banco de desafios (`src/challenges/challengeBank.ts`), o jogo inclui:

| Estrutura | Desafios | Conteúdos |
| --- | --- | --- |
| ABB | 2 | Pesquisa de elemento, contagem de folhas |
| AVL | 2 | Fator de balanceamento, verificação de propriedades AVL |
| Alvinegra (Red-Black) | 2 | Contagem de nós brancos, caso de recoloração "tipo quatro" |
| Hash | 2 | Pesquisa com área de reserva, tratamento de colisão por rehash |
| TRIE | 2 | Busca exata de palavra, verificação de prefixo |
| Binária genérica | 2 | Relação altura × nós, maior caminho |
| Híbrida ("Doidona") | 2 | Busca e inserção em camadas (árvore → T1 → T2 → lista) |

**Total: 14 desafios** (normais, elites e chefe).

> **Nota:** Pilhas, filas, listas e ordenação existem apenas nos materiais de referência
> (PDFs em `tmp/pdfs/`, ignorados do Git). Adicioná-los ao jogo é um objetivo futuro.

## Mecânicas
- **Runs de 14 encontros** organizados em 5 atos (normais → elites → chefe).
- **Cartas de ferramentas:** caso base, percurso, condição, combinação, modificador,
  complexidade — cada uma com efeito aplicável ao desafio atual.
- **Combos:** recompensam padrões de solução (ex.: busca ABB, travessia completa, busca
  em TRIE, navegação híbrida).
- **Passivas de run:** bônus de score, desconto de energia, multiplicador, proteção
  contra perda de foco.
- **Foco + energia:** recursos limitados por encontro.
- **Diagramas SVG:** representações visuais das estruturas integradas à interface.

## Tecnologias
- **React 19** — UI e renderização
- **TypeScript** — tipagem estática (strict mode)
- **Vite 8** — bundler e dev server
- **Vitest 4** — framework de testes (jsdom)
- **Testing Library** — testes de componentes
- **Lucide React** — ícones

## Requisitos
- Node.js 22+ e npm 10+

## Instalação
```bash
cd aeds/jogo-aeds-2
npm install
```

## Execução
```bash
npm run dev
```
Abre o servidor de desenvolvimento no navegador (geralmente `http://localhost:5173/`).

## Testes
```bash
npm test              # executa todos os testes (Vitest, pool vmThreads)
npm run test:watch    # modo observador (re-executa a cada mudança)
```

## Lint / type-check
```bash
npm run lint          # verifica tipos TypeScript (tsc --noEmit)
```

## Build
```bash
npm run build        # type-check + bundle de produção (vai para dist/)
```

## Estrutura das pastas
```text
jogo-aeds-2/
├── src/
│   ├── app/              UI principal (App.tsx, StepPanel, StructureDiagram)
│   ├── cards/            Biblioteca de cartas, combos, passivas
│   ├── challenges/       Banco de 14 desafios educacionais
│   ├── roguelike/        Motor do jogo (run, deck, scoring, step engine, encounters)
│   ├── structures/       Estados visuais das estruturas (diagramas)
│   ├── types/            Tipos TypeScript (Challenge, Structure views)
│   └── test/             Setup do Vitest
├── docs/
│   └── superpowers/      Documentação de design e planos de implementação
├── dist/                 Build de produção (gerado, ignorado pelo Git)
├── node_modules/          Dependências (ignorado pelo Git)
├── tmp/                  PDFs acadêmicos de referência (ignorado pelo Git)
├── index.html            Entry point HTML
├── package.json
├── package-lock.json
├── tsconfig*.json        Configurações TypeScript
└── vite.config.ts        Configuração Vite + Vitest
```

## Estado atual
**Em desenvolvimento.** O MVP está jogável com 14 encontros, cartas, combos e passivas.
Testes passam para o motor puro (step engine, deck, scoring, combos, challenge bank).
A interface está funcional mas ainda em evolução.

## Limitações
- Apenas 14 desafios fixos (sem aleatorização de conteúdo).
- UI em desenvolvimento (diagramas SVG embutidos no App.tsx, não em componentes visuais
  complexos).
- Sem persistência de progresso entre runs (reinicia a cada reload).
- Pilhas, filas, listas e ordenação ainda não estão no banco de desafios.

## Próximos passos
- Expandir o banco de desafios para cobrir mais estruturas (pilhas, filas, listas).
- Adicionar persistência de progresso.
- Evoluir a interface com mais interatividade nos diagramas.
