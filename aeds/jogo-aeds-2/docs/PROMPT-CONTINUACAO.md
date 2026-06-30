# Prompt base de continuação (reutilizável)

Cole o texto abaixo sempre que quiser retomar o trabalho em outra IA:

---

```
Continue o desenvolvimento do jogo "Estruturas" (AEDS II) em:
D:\Projetos\Jogos Estudos\aeds\jogo-aeds-2

ANTES DE QUALQUER COISA:
1. Leia TODA a documentação em docs/superpowers/specs/ e docs/superpowers/plans/.
   Lá está o design aprovado, as 4 decisões tomadas, o plano por etapas e o progresso atual.
2. Leia docs/PROMPT-CONTINUACAO.md (este arquivo) e o README.md.
3. Rode: cd aeds/jogo-aeds-2 && npm test   (confirme que está verde antes de mexer)

REGRAS FIXAS:
- Não recomece do zero. Reutilize stepEvaluator (extraído de stepEngine), o modelo Challenge
  e os visualizadores já testados.
- Stack: React 19 + TypeScript + Vite + Vitest (jsdom). Sem backend, sem libs novas sem necessidade.
- TDD: escreva/atualize o teste antes do código que produz.
- Tudo em português (UI, comentários, commits).
- Trabalhe direto na branch main (NÃO crie branch nova).
- Ao terminar cada etapa importante: atualize o plano/progresso nos docs, commit, e me dê
  um resumo curto do que mudou.

CONTEXTO DAS 4 DECISÕES (detalhes nos specs):
1. Cobertura = árvores + hash + trie (9 estruturas). Sem listas/pilha/fila/ordenação.
2. Moldura = Domínio (Biblioteca → Trilha 10 fases → Laboratório → Caderno de erros → Simulado).
   Roguelike foi DESCARTADO.
3. MVP interatividade = quiz estruturado + clicar no diagrama. Sem drag-and-drop, sem executar código.
4. MVP entrega arquitetura COMPLETA + conteúdo cheio de só 2 estruturas: Árvore Binária e ABB.

A próxima tarefa é a próxima etapa não concluída do plano em docs/superpowers/plans/.
```
