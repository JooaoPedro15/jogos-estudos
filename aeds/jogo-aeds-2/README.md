# Estruturas

Jogo educativo de AEDS II para praticar estruturas de dados por dominio:
Biblioteca -> Trilha -> Laboratorio -> Caderno de erros -> Simulado.

O projeto substituiu a moldura antiga de roguelike/cartas por uma experiencia focada em
dominio progressivo. A primeira tela ja abre na Biblioteca, com 9 estruturas do recorte
e trilhas jogaveis para todas elas em um primeiro recorte de conteudo.

## Estado atual

- Biblioteca de 9 estruturas: Arvore Binaria, ABB, AVL, 2-3-4, Alvinegra, Hash, TRIE,
  PATRICIA e Doidona.
- Todas as 9 estruturas estao liberadas com pelo menos 2 desafios estruturados cada.
- Trilha usa o banco de desafios existente e renderiza etapas de quiz por tipo.
- `stepEvaluator` avalia escolha, lacuna, blocos, clique e revisao sem depender da
  antiga camada de cartas.
- `StructureDiagram` renderiza o `visualStateId` do desafio atual, evitando mostrar uma
  arvore generica quando a fase e de Hash, TRIE, PATRICIA, 2-3-4 ou outra estrutura.
- `StructureDiagram` destaca caminho/no ativo quando a etapa informa `activePath` ou
  `activeNodeId`.
- Laboratorio, Caderno e Simulado ja existem como modos de interface, ainda sem o fluxo
  completo de persistencia/localStorage.

## Tecnologias

- React 19
- TypeScript
- Vite
- Vitest + Testing Library
- Lucide React

## Requisitos

- Node.js 22+
- npm 10+

## Instalar

```bash
npm install
```

## Rodar em desenvolvimento

```bash
npm run dev
```

## Testes

```bash
npm test
npm run lint
npm run build
```

## Estrutura principal

```text
src/
  app/                 Interface principal e componentes de quiz/diagrama
  challenges/          Banco de desafios estruturados
  domain/structures/   Catalogo das estruturas do dominio
  evaluators/          Avaliador puro das etapas
  structures/          Estados visuais de exemplo
  types/               Tipos de desafio e estruturas
```

## Proximas etapas

- Persistir progresso, XP e caderno de erros em `localStorage`.
- Transformar o Caderno em revisao real por categoria de erro.
- Implementar o Laboratorio de ABB com inserir, pesquisar, remover e passo a passo.
- Expandir cada estrutura ate a trilha completa de 10 fases.
