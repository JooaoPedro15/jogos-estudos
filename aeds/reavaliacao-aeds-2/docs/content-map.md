# Mapa de Conteudo

## Fontes locais

O conteudo deve ser guiado por:

- `aeds/materiais/Provas/REAV1` como referencia principal de formato;
- `aeds/materiais/Provas/REAV2_incompleta` como referencia secundaria;
- `aeds/materiais/Slides AEDS 2` como base de conteudo;
- desafios ja existentes em `aeds/jogo-aeds-2` como referencia de modelagem.

## Dominios

### 1. Doidona

Habilidades:

- entender T1, T2, T3, lista e arvore;
- decidir rota de busca;
- implementar `pesquisar`;
- tratar ponteiros nulos e listas encadeadas;
- explicar custo por camada.

Erros comuns:

- esquecer uma das camadas;
- tratar colisao como fim da busca;
- confundir lista com arvore;
- retornar antes de verificar todas as possibilidades.

### 2. TRIE

Habilidades:

- percorrer caracteres;
- diferenciar prefixo de palavra completa;
- usar marcador de fim;
- inserir e pesquisar palavras;
- explicar custo em funcao do tamanho da palavra.

Erros comuns:

- aceitar prefixo como palavra;
- criar no duplicado;
- nao marcar fim;
- analisar custo em funcao apenas do numero de palavras.

### 3. AVL

Habilidades:

- calcular altura;
- calcular fator de balanceamento;
- identificar LL, RR, LR e RL;
- aplicar rotacao simples ou dupla;
- preservar propriedade de busca.

Erros comuns:

- escolher rotacao errada;
- atualizar altura na ordem errada;
- olhar so a raiz e ignorar subarvore;
- confundir AVL com alvinegra.

### 4. Arvore normal / binaria

Habilidades:

- percorrer pre-ordem, em ordem, pos-ordem e largura;
- implementar altura, contar folhas e pesquisar;
- raciocinar com recursao em subarvores;
- diferenciar arvore binaria comum de ABB.

Erros comuns:

- usar regra de ABB em arvore comum;
- esquecer caso base `null`;
- contar ponteiro nulo como no;
- inverter ordem de visita.

### 5. Somatorios

Habilidades:

- identificar lacos e limites;
- contar repeticoes;
- montar somatorio;
- obter formula fechada;
- justificar por inducao quando necessario.

Erros comuns:

- contar iteracao de `i` e esquecer `j`;
- confundir `i < n` com `i <= n`;
- somar custo constante fora do laco;
- transformar caso dependente de entrada em caso fixo.

### 6. Ordenacao

Habilidades:

- simular selecao, insercao, bubble, merge, quick e radix;
- adaptar algoritmo para nova regra;
- explicar melhor e pior caso;
- contar comparacoes e movimentacoes;
- reconhecer estabilidade quando relevante.

Erros comuns:

- dizer que bubble e sempre `O(n)` por causa de vetor quase ordenado;
- achar que uma particao de quicksort ordena tudo;
- analisar apenas trocas e esquecer comparacoes;
- confundir selecao com insercao.

