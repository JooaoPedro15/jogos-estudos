# Arquitetura Planejada

## Decisao

Criar um app independente em `aeds/jogo-reavaliacao-aeds-2`, sem alterar o
`jogo-aeds-2`. O novo app pode reaproveitar ideias e componentes, mas deve ter
modelo de dominio proprio para a reavaliacao.

## Stack planejada

- React + TypeScript.
- Vite.
- Vitest + Testing Library.
- Lucide React.
- Persistencia local com `localStorage` na primeira versao.

## Estrutura sugerida

```text
src/
  app/
    App.tsx
    App.css
    components/
  content/
    domains.ts
    challenges/
    examBlueprint.ts
  engine/
    evaluator.ts
    adaptiveReview.ts
    progression.ts
  visuals/
    diagrams/
    states/
  persistence/
    save.ts
  types/
    content.ts
    progress.ts
```

## Modulos principais

| Modulo | Responsabilidade |
| --- | --- |
| `content` | Banco de dominios, desafios e blueprint do simulado. |
| `engine/evaluator` | Avaliar respostas de escolha, lacuna, blocos e codigo curto. |
| `engine/adaptiveReview` | Escolher erros prioritarios e variacoes parecidas. |
| `engine/progression` | Calcular dominio, desbloqueios e preparo para prova. |
| `visuals` | Estados visuais de arvores, tries, vetores e Doidona. |
| `persistence` | Salvar progresso e caderno no navegador. |

## Dados centrais

```ts
type DomainId = 'doidona' | 'trie' | 'avl' | 'arvore' | 'somatorio' | 'ordenacao';

type QuestionFormat =
  | 'summation-from-code'
  | 'structure-simulation'
  | 'prove-or-refute'
  | 'algorithm-adaptation'
  | 'case-analysis'
  | 'composite-structure-method';
```

## Principios de implementacao

- Avaliadores devem ser funcoes puras e testaveis.
- Conteudo deve ser declarativo.
- UI deve mostrar sempre: dominio atual, habilidade treinada e por que aquilo
  parece uma questao de reavaliacao.
- Simulado final deve usar blueprint fixo de 6 formatos.
- Caderno de erros deve funcionar mesmo sem backend.

