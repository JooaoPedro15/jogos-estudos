# Roadmap de Implementacao

## Estado atual

Primeira versao jogavel concluida em `aeds/reavaliacao-aeds-2`.

## Fase 0: Fundacao documental

- [x] Criar pasta do novo jogo.
- [x] Registrar spec, formato da reavaliacao, mecanicas, conteudo e arquitetura.
- [x] Validar direcao com o usuario antes de implementar.

## Fase 1: Modelo e engine

- [x] Criar projeto React + TypeScript + Vite.
- [x] Definir tipos de dominio, desafio, etapa, erro e progresso.
- [x] Implementar avaliadores puros com testes.
- [x] Implementar blueprint do simulado de 6 questoes.
- [x] Implementar controle de sessao do simulado.

## Fase 2: Experiencia jogavel inicial

- [x] Criar tela principal com os 6 dominios.
- [x] Mostrar questao atual, habilidade e formato da reavaliacao.
- [x] Mostrar visual da estrutura no estilo de prova.
- [x] Implementar respostas por escolha, lacuna, blocos, correcao e codigo curto.
- [x] Persistir progresso local.

## Fase 2.5: Treino continuo de codigo

- [x] Adicionar banco de treinos inspirado na lista da prova 3.
- [x] Criar sessao rapida para 2 questoes.
- [x] Criar modo maratona para varias questoes.
- [x] Alternar entre repeticao e modificacao logica.
- [x] Adicionar botao `Me ensine` com resposta modelo e explicacao.

## Fase 3: Caderno adaptativo

- [x] Registrar erros com tags.
- [x] Priorizar erros recorrentes.
- [x] Selecionar treinos parecidos por variacoes predefinidas.
- [x] Marcar erro como resolvido apos 2 acertos seguidos.

## Fase 4: Simulado final

- [x] Montar prova curta com 6 questoes.
- [x] Enviar erros do simulado para o caderno.
- [x] Exibir pontuacao e estado de conclusao.

## Proximos passos recomendados

1. Adicionar mais variacoes de codigo da lista da prova 3, principalmente 2-3-4, alvinegra, PATRICIA e estruturas hibridas.
2. Criar diagramas interativos para arvores, TRIE e camadas da Doidona.
3. Separar a UI em componentes menores quando novas telas entrarem.
4. Criar campanha completa por dominio antes do simulado final.
5. Adicionar relatorio final por dominio, habilidade e tag de erro.
