# Product Spec: Reavaliacao AEDS II

## Resumo

`Reavaliacao AEDS II` sera um jogo de treino direcionado para uma prova de
reavaliacao com questoes discursivas, codigo Java/C-like e estruturas de dados.
O jogador passa por 6 dominios de conteudo, pratica os formatos de questao mais
provaveis e revisita automaticamente os pontos em que mais errou.

## Problema

O jogo atual de AEDS tem bastante conteudo, mas a experiencia ainda pode parecer
uma biblioteca ampla. Para reavaliacao, o aluno precisa de uma jornada mais
objetiva: saber o que cai, treinar no formato cobrado e repetir variacoes dos
erros ate parar de cometer o mesmo engano.

## Usuario-alvo

Aluno de AEDS II revisando para reavaliacao, com pouco tempo e necessidade de
praticar codigo, raciocinio de complexidade e desenho/simulacao de estruturas.

## Objetivos

- Transformar as provas locais em referencia de formato, sem depender de copiar
  o enunciado oficial dentro do jogo.
- Ensinar o aluno a resolver tipos de questao, nao apenas memorizar respostas.
- Criar uma campanha clara com progresso por dominio.
- Registrar erros por conceito e gerar treinos parecidos.
- Entregar um simulado final com 6 questoes no estilo real da reavaliacao.

## Nao objetivos

- Substituir todos os materiais de estudo.
- Fazer correcao automatica perfeita de respostas longas em linguagem natural.
- Cobrir todo o semestre na primeira versao.
- Recriar exatamente as provas oficiais dentro da interface.

## Escopo inicial

Dominios:

1. Doidona.
2. TRIE.
3. AVL.
4. Arvore normal / binaria.
5. Somatorios.
6. Ordenacao.

Formatos de treino:

- escolha guiada;
- lacunas de codigo;
- ordenar blocos;
- corrigir linha errada;
- digitar trecho de codigo;
- escrever funcao inteira com trechos obrigatorios;
- simular passo a passo;
- justificar verdadeiro/falso com rubrica;
- questao estilo simulado.

## Criterios de sucesso

- O jogador entende qual dominio falta dominar.
- O jogador consegue repetir exercicios parecidos com seus erros.
- O simulado final tem 6 questoes, uma por macroformato da reavaliacao.
- Cada dominio tem pelo menos uma etapa de codigo real.
- O projeto possui testes para avaliadores, selecao adaptativa e progresso.
