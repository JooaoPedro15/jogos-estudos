# Reavaliacao AEDS II

Jogo educativo focado em preparar para a reavaliacao de AEDS II. Diferente do
`jogo-aeds-2`, que funciona como biblioteca/trilha geral de estruturas, este
projeto nasce com um objetivo mais fechado: treinar o formato real da prova de
reavaliacao usando campanha, oficina de codigo, caderno adaptativo de erros e
simulado final.

## Estado

Design aprovado e documentado. A implementacao ainda nao foi iniciada.

## Objetivo educacional

Fazer o aluno praticar ate conseguir resolver questoes de reavaliacao que cobram:

- contar execucoes de codigo e montar somatorios;
- simular insercoes e operacoes em arvores;
- provar ou refutar afirmacoes com justificativa;
- adaptar algoritmos de ordenacao;
- analisar melhor e pior caso de trechos de codigo;
- implementar metodos em estruturas compostas, como Doidona.

## Escopo da primeira versao

A campanha inicial tera 6 dominios, alinhados ao que foi observado nas provas
locais em `aeds/materiais/Provas`:

1. Estrutura Doidona.
2. Arvore TRIE.
3. Arvore AVL.
4. Arvore normal / arvore binaria.
5. Somatorios e contagem de custo.
6. Algoritmos de ordenacao.

## Modos planejados

| Modo | Papel no jogo |
| --- | --- |
| Campanha | Trilha guiada pelos 6 dominios da reavaliacao. |
| Oficina de codigo | Etapas de completar, corrigir, escrever e simular codigo. |
| Caderno de erros | Revisao adaptativa dos erros mais repetidos. |
| Simulado final | Prova curta com 6 questoes no formato da reavaliacao. |
| Materiais | Referencias locais usadas para mapear conteudo e questoes. |

## Documentacao

- [Visao de produto](docs/product-spec.md)
- [Formato da reavaliacao](docs/reavaliacao-format.md)
- [Mecanicas de jogo](docs/game-mechanics.md)
- [Mapa de conteudo](docs/content-map.md)
- [Caderno adaptativo de erros](docs/adaptive-error-notebook.md)
- [Arquitetura planejada](docs/architecture.md)
- [Estrategia de testes](docs/testing-strategy.md)
- [Roadmap](docs/implementation-roadmap.md)

## Tecnologia planejada

A implementacao deve seguir o padrao ja usado em AEDS:

- React
- TypeScript
- Vite
- Vitest + Testing Library
- Lucide React para icones
- `localStorage` para progresso local na primeira versao

## Relacao com o jogo existente

O `jogo-aeds-2` continua existindo como experiencia geral de biblioteca/trilha.
Este projeto pode reaproveitar ideias, tipos e componentes, mas deve manter uma
interface e um modelo de progresso proprios, centrados na reavaliacao.

