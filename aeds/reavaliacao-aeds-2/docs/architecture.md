# Arquitetura

## Decisao

Criar um app independente em `aeds/reavaliacao-aeds-2`, sem alterar o
`jogo-aeds-2`. O novo app tem modelo de dominio, progresso e revisao proprios,
centrados no formato da reavaliacao.

## Stack atual

- React + TypeScript.
- Vite.
- Vitest + Testing Library.
- Lucide React.
- Persistencia local com `localStorage`.

## Estrutura implementada

```text
src/
  app/
    App.tsx
    App.css
  content/
    domains.ts
    reavaliacaoBlueprint.ts
    reviewVariations.ts
  engine/
    adaptiveReview.ts
    evaluator.ts
    examSession.ts
  persistence/
    save.ts
  types/
    content.ts
    progress.ts
```

## Modulos principais

| Modulo | Responsabilidade |
| --- | --- |
| `content/domains` | Catalogo dos 6 dominios: Doidona, TRIE, AVL, arvore normal, somatorios e ordenacao. |
| `content/reavaliacaoBlueprint` | Simulado fixo com 6 questoes e macroformatos da reavaliacao. |
| `content/reviewVariations` | Variacoes predefinidas para treinar erros parecidos. |
| `engine/evaluator` | Avaliar escolha, rubrica, lacuna, blocos, correcao de linha e codigo curto. |
| `engine/examSession` | Controlar posicao, pontuacao, conclusao e tentativas do simulado. |
| `engine/adaptiveReview` | Agrupar erros por conceito, priorizar revisao e resolver apos acertos seguidos. |
| `persistence/save` | Salvar e carregar sessao/caderno no navegador. |
| `app` | Experiencia principal: dominios, simulado, feedback e caderno de erros. |

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

- Avaliadores e revisao adaptativa ficam em funcoes puras e testaveis.
- Conteudo fica declarativo para facilitar trocar valores e criar novas questoes.
- A interface sempre mostra dominio, habilidade, questao atual, feedback e revisao.
- O simulado final usa blueprint fixo de 6 formatos.
- O caderno de erros funciona sem backend.

## Proximos incrementos arquiteturais

- Separar componentes menores dentro de `src/app/components/` quando a tela crescer.
- Adicionar diagramas visuais em `src/visuals/` para AVL, TRIE, arvore e Doidona.
- Criar um modulo de `progression` quando houver campanha completa por dominio.
