# Estrategia de Testes

## Objetivo

Garantir que o jogo ensine e acompanhe progresso sem quebrar avaliacao, simulado
ou revisao adaptativa.

## Prioridades

1. Avaliadores de resposta.
2. Selecao adaptativa de erros.
3. Calculo de dominio/progresso.
4. Blueprint do simulado final.
5. Componentes essenciais de UI.

## Testes unitarios

| Area | Exemplos |
| --- | --- |
| `evaluator` | escolha correta, lacuna normalizada, ordem de blocos, codigo curto. |
| `adaptiveReview` | priorizar erro recorrente, remover erro apos acertos seguidos. |
| `progression` | calcular marcos de dominio e liberar simulado. |
| `examBlueprint` | garantir exatamente 6 questoes e formatos esperados. |

## Testes de componente

- campanha renderiza os 6 dominios;
- caderno mostra erros prioritarios;
- simulado mostra questoes no formato correto;
- feedback explica erro comum;
- botoes e formularios sao acessiveis por teclado.

## Regra de implementacao

Ao implementar comportamento, escrever teste primeiro. O primeiro alvo deve ser
o modelo de dados e avaliadores, porque eles sustentam o resto do jogo.

## Comandos esperados

Quando o app existir:

```bash
npm test
npm run lint
npm run build
```

