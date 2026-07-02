# Caderno Adaptativo de Erros

## Objetivo

O caderno existe para transformar erro repetido em treino direcionado. Ele nao
deve ser apenas uma lista de respostas erradas; deve dizer qual habilidade esta
fraca e oferecer variacoes parecidas ate o erro parar de aparecer.

## Modelo de erro

Cada erro deve ser registrado com estes campos:

```ts
type ErrorRecord = {
  id: string;
  challengeId: string;
  domain: DomainId;
  skill: SkillId;
  questionFormat: QuestionFormat;
  mistakeTag: MistakeTag;
  attempts: number;
  lastSeenAt: string;
  resolvedStreak: number;
};
```

## Taxonomia inicial

| Tag | Exemplo |
| --- | --- |
| `wrong-case-analysis` | Confundiu melhor e pior caso. |
| `missing-base-case` | Esqueceu caso base de recursao. |
| `wrong-rotation` | Escolheu rotacao AVL errada. |
| `lost-pointer` | Nao religou ponteiro/lista/arvore. |
| `prefix-vs-word` | Aceitou prefixo como palavra em TRIE. |
| `incomplete-layer-search` | Parou busca da Doidona cedo demais. |
| `wrong-summation-bound` | Errou limite do somatorio. |
| `algorithm-confusion` | Misturou regras de dois algoritmos. |

## Priorizacao

O caderno deve ordenar por:

1. maior numero de tentativas erradas;
2. erro mais recente;
3. erro em dominio importante para simulado;
4. erro que bloqueia outro conceito.

## Geracao de treino parecido

Cada desafio deve declarar um `variationSeed` ou uma familia de variacoes. O
gerador nao precisa ser aleatorio perfeito; na primeira versao, pode escolher
entre variacoes predefinidas.

Exemplos:

- AVL: mesma rotacao, valores diferentes.
- Somatorio: mesma estrutura de laco, limites alterados.
- Ordenacao: mesmo algoritmo, vetor diferente.
- TRIE: mesma palavra-prefixo, outro conjunto de palavras.
- Doidona: mesma regra de hash, elemento em outra camada.

## Criterio de resolucao

Um erro sai da lista critica quando o jogador acerta pelo menos 2 variacoes
seguidas da mesma habilidade. Ele continua no historico, mas deixa de ser
prioridade.

