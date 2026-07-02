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
- A ABB e a trilha-modelo de dominio: 11 fases ordenadas por um campo `phase` (1..10) cobrindo
  reconhecer, construir, pesquisar, inserir, remover (tres casos), percorrer/percursos, contar,
  alterar funcao pronta, escrever altura e um desafio final de dominio. A fase da lista de prova
  continua aparecendo primeiro; as demais seguem a ordem da trilha.
- Arvore Binaria tambem tem trilha completa 1..10 no mesmo molde, adaptada a ausencia da regra
  de busca: fila para construir/inserir/remover em largura, pesquisa O(n) combinando os lados,
  fase de desenho com cliques em folhas/caminhos e desafio final de dominio.
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
- `stepEvaluator` avalia escolha, lacuna, blocos, clique, corrigir, digitar e revisao sem
  depender da antiga camada de cartas.
- Duas etapas de producao de codigo: `corrigir` (apontar a linha errada e escolher o conserto)
  e `digitar` (escrever a linha/expressao; a validacao normaliza caixa, acentos, espacos e
  ponto-e-virgula final via `normalizeCode`).
- O banco inteiro respeita a proporcao 85/15 do spec (85% codigo / 15% desenho), travada por
  teste automatizado: `codigo >= 80%`, `desenho` entre 10% e 20%, `conceito <= 5%`, e todo
  desafio precisa declarar `focus`.
- `StructureDiagram` renderiza o `visualStateId` do desafio atual, evitando mostrar uma
  arvore generica quando a fase e de Hash, TRIE, PATRICIA, 2-3-4 ou outra estrutura.
- `StructureDiagram` destaca caminho/no ativo quando a etapa informa `activePath` ou
  `activeNodeId`.
- Laboratorio aceita inserir, remover, pesquisar e balancear com animacao de passos,
  destaque no diagrama e historico de operacoes. ABB usa simulacao real por valor digitado;
  Lista, Pilha e Ordenacao usam roteiros visuais especificos da estrutura selecionada.
  Caderno e Simulado continuam como modos de interface sem persistencia/localStorage.
- O visual foi reformulado para um sistema de design baseado em tokens CSS (`:root`):
  paleta teal/ambar coesa, sidebar com gradiente e marca, cards com acento por familia
  e elevacao em hover, badges arredondados, foco acessivel (`:focus-visible`),
  diagramas com moldura suave e `prefers-reduced-motion` respeitado.
- Os diagramas de arvore e de TRIE usam layout proprio: arvore por caminhamento central
  (in-order) e TRIE por slots de folha, ambos com `viewBox` dinamico calculado a partir do
  numero de nos e da profundidade. Isso evita sobreposicao e centraliza cada pai entre suas
  subarvores, deixando ABB/AVL/2-3-4/alvinegra muito mais legiveis. O diagrama de hash separa
  visualmente area principal e reserva.
- Todos os diagramas agora vivem dentro do `DiagramShell` (canvas compartilhado): zoom +/-,
  pan por arrasto, "ajustar a tela" e narracao do passo sobreposta ao desenho. Inspirado nos
  visualizadores de Galles (USFCA), mantendo a identidade visual do jogo.
- As trilhas sao animadas: quando uma etapa devolve `activePath`, os nos acendem em sequencia
  (um por vez, 450ms de intervalo), as arestas tem setas e os nos deslizam com transicao
  quando o layout muda. O resultado da resposta aplica tom semantico (verde/vermelho) ao
  destaque. O Laboratorio mostra a narracao "Passo X/N: titulo" dentro do proprio canvas.

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
