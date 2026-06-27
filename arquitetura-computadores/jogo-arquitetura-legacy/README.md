# MIPS Datapath Quest — Versão 1 (Legacy)

## Nome
MIPS Datapath Quest (versão 1 — arquivada)

## Descrição
Jogo educativo de estudo do caminho de dados do MIPS uniciclo, contendo 4 modos de jogo,
uma Academia de lições, Modo Aprendiz/Prova e um modo "Roguelike da Prova" embutido
em um único arquivo HTML. Tudo é inline (HTML + CSS + JavaScript vanilla) — sem
bibliotecas, sem build, funciona offline.

## Objetivo educacional
Treinar os conteúdos de datapath MIPS, controle, tempos do caminho crítico e pipeline
de forma interativa, simulando o caminho das instruções pelas unidades funcionais e
exigindo que o jogador defina sinais de controle e calcule tempos.

## Conteúdos trabalhados
- Caminho de dados MIPS uniciclo (datapath)
- Sinais de controle (RegDst, ALUSrc, MemtoReg, RegWrite, MemRead, MemWrite, Branch, Jump)
- Tempos do caminho crítico (Memory 4ns, Register 1ns, ALU 2ns, Mux 0.5ns, etc.)
- Pipeline de 5 estágios (IF → ID → EX → MEM → WB)
- Modo Roguelike da Prova (versão simplificada, embutida no arquivo)

## Mecânicas
- **Roteirista:** trace o caminho de uma instrução pelo datapath SVG.
- **Engenheiro de Controle:** ative/destive sinais de controle para uma instrução.
- **Calculadora de Tempos:** calcule o tempo total (caminho crítico) de cada tipo.
- **Pipeline Master:** mapeie instruções nos estágios do pipeline.
- **Academia:** lições sobre cada tópico.
- **Modo Aprendiz/Prova:** modo estudo vs. modo prova (sem dicas).
- **Roguelike da Prova:** 6 salas + boss (4 fases) com recompensas e poderes.

## Tecnologias
- HTML5 + CSS3 + JavaScript (tudo inline em um único arquivo)
- SVG para diagramas do datapath
- WebAudio para efeitos sonoros
- `localStorage` para persistência (progresso, conquistas)
- **Zero dependências externas**

## Requisitos
- Navegador moderno com suporte a ES2020+
- Nenhum servidor necessário

## Instalação
Não há instalação. O arquivo é auto-contido.

## Execução
Duplo-clique em `mips-datapath-quest.html` para abrir no navegador.
Funciona offline — não precisa de servidor nem internet.

## Testes
Não há testes automatizados neste projeto.

## Estrutura das pastas
```text
jogo-arquitetura-legacy/
├── mips-datapath-quest.html    Jogo completo (arquivo único ~117 KB)
├── launch.json                 Config de VS Code (python http.server 8765)
└── README.md                   Este arquivo
```

## Estado atual
**Versão antiga (preservada).** NÃO modificar. Este snapshot inclui a versão com o modo
"Roguelike da Prova" já embutido. Serve como referência funcional do jogo original.

Uma cópia anterior (antes do modo roguelike) existe em `../primeira-versao/`.

## Limitações
- Arquivo único: difícil de manter e evoluir.
- Modo roguelike embutido é simplificado comparado ao projeto reescrito.
- Sem sistema de testes automatizados.
- Sem separação de responsabilidades (todo o código está em um `<script>`).

## Observações
- A nova versão reescrita do zero fica em `../jogo-arquitetura-roguelike/`.
- Um snapshot anterior (sem o modo roguelike) existe em `../primeira-versao/`.
