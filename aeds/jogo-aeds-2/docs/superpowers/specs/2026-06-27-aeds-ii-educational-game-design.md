# Guardiao das Estruturas - AEDS II: Design Do MVP

Data: 2026-06-27

## Contexto

O projeto sera um jogo web educativo para preparar o jogador para provas teoricas de AEDS II. O foco nao e decorar respostas, mas desenvolver o raciocinio necessario para interpretar estruturas fornecidas, implementar metodos especificos, simular execucao, modificar funcoes e analisar complexidade.

As referencias obrigatorias analisadas foram:

- `D:/CC/AEDS2/aeds2/aulas/u08 Arvores TRIE.zip`
- `D:/CC/AEDS2/aeds2/aulas/conteudo prova.zip`
- imagens reais de questoes de prova anexadas na conversa
- prompt completo anexado em `pasted-text.txt`

## Padrao Real Da Prova

As questoes reais e o material do professor seguem um formato recorrente:

- o enunciado fornece classes prontas;
- o aluno implementa um metodo especifico;
- os retornos mais comuns sao `boolean`, `int`, `void` ou um no;
- os metodos publicos chamam auxiliares privados;
- a solucao costuma exigir recursao ou navegacao por uma estrutura composta;
- o enunciado pede analise de complexidade;
- as estruturas usam nomes simples como `No`, `NoAN`, `Celula`, `Hash`, `Arvore`, `ArvoreTrie`, `raiz`, `esq`, `dir`, `elemento`, `prox`, `folha`;
- as questoes valorizam contagem, busca, comparacao, verificacao de propriedade, modificacao estrutural e navegacao em estruturas hibridas.

Exemplos confirmados no material:

- ABB/arvore binaria com `No`, `elemento`, `esq`, `dir`, `raiz`;
- pesquisa recursiva com `boolean resp`;
- caminhamentos central, pre e pos;
- remocao com `maiorEsq`;
- rotacoes `rotacionarEsq`, `rotacionarDir`, `rotacionarEsqDir`, `rotacionarDirEsq`;
- AVL com fator `alturaDir(i) - alturaEsq(i)` e custo `Theta(lg(n))`;
- alvinegra com `NoAN`, campo `cor`, `isNoTipoQuatro(NoAN i)` e `fragmentarNoTipoQuatro(NoAN i)`;
- hash com area de reserva, rehash, lista flexivel e estruturas hibridas;
- TRIE com `No[] prox`, `folha`, `hash(char)`, `pesquisar(String s, No no, int i)`;
- PATRICIA como conteudo posterior, fora do primeiro recorte jogavel.

## Direcao Escolhida

A primeira versao sera um MVP menor e bem acabado, em vez de uma cobertura ampla e rasa.

Decisoes aprovadas:

- abordagem: Bancada por padroes com transferencia;
- estruturas iniciais: arvore binaria/ABB, AVL, alvinegra, hash e TRIE;
- layout: Bancada Guiada;
- correcao inicial: blocos, lacunas e escolhas estruturadas;
- progressao: mistura guiada, com padroes de raciocinio transferidos entre estruturas.

## Objetivo Do MVP

O MVP deve entregar uma experiencia realmente jogavel para treinar:

1. interpretar classes fornecidas;
2. reconhecer campos e caminhos;
3. simular execucao;
4. escolher proximo no, linha ou estado;
5. completar lacunas;
6. ordenar blocos;
7. explicar complexidade;
8. aplicar o mesmo padrao em outra estrutura;
9. registrar erros e sugerir revisao.

## Estruturas Do MVP

### Arvore Binaria / ABB

Conteudos:

- busca em um caminho;
- contagem de nos;
- contagem de folhas;
- altura;
- verificacao de propriedade.

Estilo de codigo:

- `class No`
- `int elemento`
- `No esq, dir`
- `class ArvoreBinaria`
- `No raiz`
- metodo publico chamando auxiliar recursivo.

### AVL

Conteudos:

- fator de balanceamento;
- altura;
- verificar balanceamento;
- identificar rotacao;
- interpretar custo `Theta(lg(n))`.

### Alvinegra

Conteudos:

- campo `cor`;
- contar ou comparar nos brancos;
- verificar 4-no equivalente;
- comparar caminhos;
- fragmentar no tipo quatro como conteudo posterior.

### Hash

Conteudos:

- aplicar `hash`;
- tratar colisao;
- pesquisar em area principal e reserva;
- rehash;
- lista flexivel como extensao.

### TRIE

Conteudos:

- pesquisar palavra exata;
- verificar prefixo;
- contar palavras com prefixo;
- prefixo e sufixo;
- lembrar campo `folha`.

## Padroes De Raciocinio

O jogo sera organizado primeiro por padroes, depois por estrutura.

Padroes iniciais:

- percorrer todos os nos;
- seguir apenas um caminho;
- retornar informacao de baixo para cima;
- verificar propriedade global;
- navegar por camadas;
- analisar complexidade.

Exemplo de transferencia:

1. contar folhas em arvore binaria;
2. adaptar para contar brancos em alvinegra;
3. adaptar para contar palavras com prefixo em TRIE;
4. concluir com uma questao inedita estilo prova.

## Bancada Guiada

A tela principal sera a Bancada Guiada. Ela deve abrir direto no estudo, sem landing page.

Zonas da tela:

- topo compacto: padrao, estrutura, dificuldade, etapa, progresso;
- coluna esquerda: enunciado, classes fornecidas e metodo pedido;
- centro: visualizacao da estrutura;
- coluna direita: pilha, comparacoes, retornos e complexidade;
- rodape: interacao da etapa atual.

Estados da Bancada:

- `interpretar`: reconhecer campos, tipos e caminho;
- `simular`: escolher proximo no, linha ou estado;
- `lacunas`: completar expressao, linha ou condicao;
- `blocos`: ordenar blocos de codigo;
- `complexidade`: escolher e justificar custo;
- `revisao`: mostrar erro, solucao e proximo treino.

## Modelo De Desafio

Cada desafio sera estruturado, nao apenas texto livre.

```ts
type Challenge = {
  id: string;
  pattern: ReasoningPattern;
  structure: StructureKind;
  type: ChallengeType;
  difficulty: Difficulty;
  title: string;
  statement: string;
  providedCode: string;
  starterCode?: string;
  visualState: VisualState;
  steps: ChallengeStep[];
  solution: ChallengeSolution;
  complexity: ComplexityAnswer;
  commonMistakes: CommonMistake[];
};
```

Exemplo conceitual:

```ts
{
  id: "abb-contar-folhas-01",
  pattern: "percorrer-todos-os-nos",
  structure: "abb",
  type: "lacunas",
  difficulty: "facil",
  title: "Contar folhas",
  statement: "Implemente o metodo int contarFolhas()...",
  providedCode: "class No { int elemento; No esq, dir; } ...",
  steps: [
    { kind: "interpretar", prompt: "Qual campo aponta para a esquerda?" },
    { kind: "simular", prompt: "Qual no sera visitado agora?" },
    { kind: "lacuna", prompt: "Complete o caso base." },
    { kind: "blocos", prompt: "Monte o metodo auxiliar." },
    { kind: "complexidade", prompt: "Qual e o custo?" }
  ]
}
```

## Correcao

No MVP, evitar parser livre de Java.

Tipos de avaliacao:

- opcoes estruturadas;
- lacunas com respostas equivalentes cadastradas;
- blocos ordenaveis;
- escolha de proximo estado;
- complexidade por alternativas;
- revisao por checklist.

Texto livre com correcao profunda fica fora do MVP inicial.

## Progressao

O progresso deve medir dominio, nao apenas acertos.

Status por conteudo:

- nao estudado;
- reconhece;
- simula;
- completa lacunas;
- monta blocos;
- explica complexidade;
- aplica variacao;
- dominado.

O caderno de erros registra:

- desafio;
- estrutura;
- padrao;
- etapa;
- resposta;
- erro identificado;
- data;
- proxima revisao.

## Arquitetura Tecnica

Stack:

- React;
- TypeScript;
- Vite;
- SVG para visualizacoes;
- `localStorage` para progresso;
- sem backend no MVP;
- sem servico pago.

Estrutura:

```text
src/
  app/
  components/
  challenges/
  structures/
  visualizers/
  simulators/
  evaluators/
  progression/
  pages/
  types/
  utils/
```

Responsabilidades:

- `challenges/`: banco de desafios, simulados e variacoes;
- `structures/`: modelos internos de ABB, AVL, alvinegra, hash e TRIE;
- `visualizers/`: componentes SVG;
- `simulators/`: geradores de passos;
- `evaluators/`: avaliadores de lacunas, blocos, proximo estado e complexidade;
- `progression/`: XP, dominio, caderno de erros e revisao;
- `pages/`: Bancada, mapa de padroes, simulado e erros.

## Conteudo Inicial

Recorte minimo:

- 2 desafios ricos por estrutura;
- 1 sequencia completa de transferencia de padrao;
- 1 simulado curto estilo prova;
- caderno de erros local;
- README com instrucoes de execucao e como adicionar questoes.

Desafios iniciais sugeridos:

- ABB: pesquisar elemento;
- ABB: contar folhas;
- AVL: calcular fator e identificar rotacao;
- AVL: verificar se a arvore esta balanceada;
- Alvinegra: contar brancos;
- Alvinegra: identificar no tipo quatro;
- Hash: pesquisar com area de reserva;
- Hash: rehash apos colisao;
- TRIE: pesquisar palavra exata;
- TRIE: verificar prefixo.

## Fora Do MVP

Ficam para fases posteriores:

- texto livre com avaliacao automatica profunda;
- drag-and-drop sofisticado;
- geracao procedural infinita;
- backend;
- PATRICIA completa;
- todas as arvores doidonas;
- modo laboratorio livre completo;
- animacoes avancadas de rotacao e fragmentacao.

## Plano De Implementacao Proposto

1. Criar projeto Vite + React + TypeScript.
2. Montar layout da Bancada Guiada.
3. Definir tipos centrais de desafio, etapa, estrutura e progresso.
4. Criar banco inicial com desafios de ABB.
5. Implementar visualizador de arvore.
6. Implementar motor de etapas.
7. Implementar evaluators de opcoes, lacunas, blocos e complexidade.
8. Adicionar AVL e alvinegra ao visualizador.
9. Adicionar hash visual.
10. Adicionar TRIE visual.
11. Criar caderno de erros com `localStorage`.
12. Criar simulado curto.
13. Escrever README.
14. Rodar build e validacao final.

## Criterios De Aceite

O MVP estara pronto quando:

- `npm install` funcionar;
- `npm run dev` abrir o app;
- `npm run build` compilar;
- a Bancada abrir sem tela vazia;
- houver desafios jogaveis nas cinco estruturas;
- cada desafio tiver enunciado, codigo fornecido, visualizacao e etapa avaliavel;
- erros forem registrados localmente;
- o simulado curto funcionar;
- README explicar como rodar e como adicionar desafios.
