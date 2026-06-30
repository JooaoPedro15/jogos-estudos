# Estruturas

Jogo educativo de AEDS II para praticar estruturas de dados por dominio:
Biblioteca -> Trilha -> Laboratorio -> Caderno de erros -> Simulado.

O projeto substituiu a moldura antiga de roguelike/cartas por uma experiencia focada em
dominio progressivo. A primeira tela ja abre na Biblioteca, com 12 estruturas do material
e trilhas jogaveis para todas elas em um primeiro recorte de conteudo.

## Estado atual

- Biblioteca de 12 estruturas: Lista, Pilha, Ordenacao, Arvore Binaria, ABB, AVL,
  2-3-4, Alvinegra, Hash, TRIE, PATRICIA e Doidona.
- Todas as 12 estruturas estao liberadas com pelo menos 3 desafios estruturados cada.
- A lista `lista-aeds2-prova3.pdf` foi encaixada em 10 fases distribuidas nas
  estruturas, com proporcao rastreada por teste: 60% codigo e 40% desenho.
- O zip `Semestre AEDS.zip` tambem foi usado para criar 9 fases novas de Lista,
  Pilha e Ordenacao, mantendo 2 fases de codigo e 1 de desenho em cada estrutura.
- As fases da lista aparecem primeiro dentro de cada estrutura e recebem badges visiveis
  de origem e foco.
- Trilha usa o banco de desafios existente e renderiza etapas de quiz por tipo.
- Etapas de desenho podem mostrar alternativas visuais e tambem usar clique direto no
  diagrama para selecionar nos/slots.
- Lista, Pilha e Ordenacao usam desenhos proprios: lista encadeada com celula cabeca
  e setas, pilha vertical com topo, e vetor com indices/marcadores.
- `stepEvaluator` avalia escolha, lacuna, blocos, clique e revisao sem depender da
  antiga camada de cartas.
- `StructureDiagram` renderiza o `visualStateId` do desafio atual, evitando mostrar uma
  arvore generica quando a fase e de Hash, TRIE, PATRICIA, 2-3-4 ou outra estrutura.
- `StructureDiagram` destaca caminho/no ativo quando a etapa informa `activePath` ou
  `activeNodeId`.
- Laboratorio aceita inserir, remover, pesquisar e balancear com animacao de passos,
  destaque no diagrama e historico de operacoes. ABB usa simulacao real por valor digitado;
  Lista, Pilha e Ordenacao usam roteiros visuais especificos da estrutura selecionada.
  Caderno e Simulado continuam como modos de interface sem persistencia/localStorage.

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
- Evoluir o Laboratorio para simular mutacoes reais completas em hash, trie e arvores
  balanceadas.
- Revisar a qualidade pedagogica das fases para ensinar implementacao completa:
  inserir, remover, pesquisar, percorrer, modificar regras e analisar complexidade.
- Expandir cada estrutura ate a trilha completa de 10 fases profundas.
