# Estrategia de Testes

## Objetivo

Garantir que o jogo ensine e acompanhe progresso sem quebrar avaliacao, simulado
ou revisao adaptativa.

## Prioridades

1. Avaliadores de resposta.
2. Selecao adaptativa de erros.
3. Calculo de dominio/progresso.
4. Blueprint do simulado final.
5. Treino continuo de codigo.
6. Componentes essenciais de UI.

## Testes unitarios

| Area | Exemplos |
| --- | --- |
| `evaluator` | escolha correta, lacuna normalizada, ordem de blocos, codigo curto, funcao inteira por trechos obrigatorios. |
| `adaptiveReview` | priorizar erro recorrente, remover erro apos acertos seguidos. |
| `examSession` | garantir exatamente 6 questoes, formatos esperados, avanco e conclusao. |
| `codePractice` | sessao rapida, maratona, tentativas e metadados para caderno. |
| `codeDrills` | catalogo com repeticao antes de modificacao logica. |
| `persistence` | salvar, carregar e ignorar dados invalidos. |

## Testes de componente

- campanha renderiza os 6 dominios;
- caderno mostra erros prioritarios;
- simulado mostra questoes no formato correto;
- treino de codigo mostra codigo, visual, sessoes rapidas e maratona;
- `Me ensine` mostra funcao modelo e explicacao linha a linha;
- feedback explica erro comum;
- botoes e formularios sao acessiveis por teclado.

## Regra de implementacao

Ao implementar comportamento, escrever teste primeiro. O primeiro alvo deve ser
o modelo de dados e avaliadores, porque eles sustentam o resto do jogo.

## Comandos esperados

Dentro de `aeds/reavaliacao-aeds-2`:

```bash
npm test
npm run lint
npm run build
```
