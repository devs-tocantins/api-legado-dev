# Antigravity CLI (`agy`) — Playbook de uso

Este documento descreve, de forma genérica (sem detalhes deste projeto ou do GitHub), como usar o Antigravity CLI (`agy`) como um "executor" autônomo de tarefas de código, e as práticas que funcionaram bem ao operá-lo como um agente de codificação de longa duração dentro de um fluxo "arquiteto + executor".

## O que é o `agy`

O `agy` é uma CLI de codificação autônoma (Antigravity CLI) que recebe um prompt em texto e executa, sozinha, um ciclo completo de trabalho: ler o código, planejar, editar arquivos, rodar comandos (lint, build, testes), versionar (git) e, se instruída, interagir com um provedor de repositório remoto (abrir PR, checar CI). Ela roda em modo não interativo quando invocada corretamente, o que a torna adequada para ser disparada em background e monitorada até a conclusão.

## Papéis: arquiteto vs. executor

O padrão que funcionou bem foi dividir claramente as responsabilidades:

- **Arquiteto (o assistente que orquestra)**: investiga o problema real, lê o código relevante, decide a causa raiz e o escopo exato da mudança, escreve um prompt autocontido e completo, dispara o `agy`, e — crucialmente — **revisa o resultado** (diff, testes, CI) antes de aceitar o trabalho como concluído.
- **Executor (`agy`)**: recebe o prompt já com o diagnóstico pronto, implementa, valida localmente (lint/build/test) e sobe o resultado (branch + commit + abertura de PR).

Não delegar o diagnóstico. O prompt deve conter o "o quê" e o "porquê" já resolvidos — arquivo, linha, causa raiz, e o comportamento esperado depois da mudança. Delegar apenas "vá investigar e conserte" tende a produzir resultados genéricos ou com escopo errado.

## Invocação básica

Forma de comando que funcionou de forma confiável, disparada a partir de um shell:

```
agy --dangerously-skip-permissions --print-timeout 20m --add-dir "<caminho absoluto do repositório>" -p "<prompt completo>"
```

Pontos-chave sobre as flags:

- `--dangerously-skip-permissions`: evita que a CLI pare pedindo confirmação interativa a cada ação (edição de arquivo, execução de comando). Necessário para rodar em modo não supervisionado/background. Use com consciência de que a ferramenta pode executar comandos e editar arquivos sem parar para perguntar — só vale a pena habilitar isso quando você (o operador humano) já decidiu confiar no escopo do prompt que está passando.
- `--print-timeout 20m`: aumenta o timeout de espera pela "impressão final" da CLI. O valor padrão (frequentemente ~5 minutos) é curto demais para tarefas que envolvem instalar dependências, rodar suites de teste completas, ou aguardar checks de CI remotos — a CLI pode terminar o trabalho real (commit, push, PR aberto) mas "morrer" antes de imprimir o resumo final se o timeout for baixo, dando a falsa impressão de que falhou.
- `--add-dir "<path>"`: escopo o diretório de trabalho explicitamente. Evita ambiguidade sobre em qual repositório/pasta a CLI deve operar, especialmente quando você tem múltiplos repositórios lado a lado.
- `-p "<prompt>"`: o prompt em si, deve ser autocontido (ver seção seguinte).

### Rodando em background

Como uma tarefa pode levar minutos a dezenas de minutos (dependendo de instalação de deps, build, testes, espera de CI), o padrão é disparar o comando em background e ser notificado quando ele terminar, em vez de bloquear esperando ou fazer polling manual. Isso libera o operador para continuar outras tarefas em paralelo ou simplesmente aguardar.

## Como escrever um bom prompt

O prompt é o artefato mais importante desse fluxo — a qualidade do resultado é quase proporcional à qualidade do prompt. Estrutura que funcionou bem:

1. **Contexto do repositório**: tipo de projeto/stack, e onde estão as regras de trabalho do repositório (ex.: um arquivo de instruções na raiz do repo que documenta convenções de branch, PR, CI). Peça explicitamente para a CLI ler esse arquivo antes de agir.
2. **Diagnóstico já pronto**: explique a causa raiz do problema com referências exatas (arquivo:linha, nome de função/variável), não apenas o sintoma. Se há dois conceitos parecidos que podem ser confundidos (ex.: dois campos com nomes similares mas semânticas diferentes), explicite a diferença.
3. **Escopo exato da mudança**: liste especificamente quais arquivos/pontos devem mudar, e — igualmente importante — quais pontos parecidos **não devem** ser tocados (evita "correções" indevidas em código que já está certo por design).
4. **Ambiguidade → parar, não adivinhar**: inclua uma instrução explícita do tipo "se encontrar uma ambiguidade real, pare e descreva o problema em vez de adivinhar". Isso evita que a CLI tome decisões arquiteturais silenciosas fora do escopo pretendido.
5. **Critérios de validação local**: quais comandos rodar (lint, checagem de tipos, suíte de testes) e a expectativa de que não haja erros novos.
6. **Fluxo de versionamento e entrega**: nome de branch (ou padrão), commit, push, abertura de um pedido de revisão de código no sistema remoto. Ser explícito sobre **não finalizar/mesclar a mudança sozinha** — isso deve ficar sob controle do operador humano, que revisa o diff e o status de validação automatizada antes de aceitar.
7. **Definição de "pronto"**: peça para a CLI confirmar que a validação remota (build/CI) ficou verde antes de considerar a tarefa concluída, e não apenas que o push foi feito.

Um prompt bem escrito é longo (parágrafos, não uma linha) e lê como um brief que um colega sênior daria a outro colega que acabou de entrar na sala — sem contexto prévio, mas com tudo que precisa para agir com julgamento, não só seguir passos mecânicos.

## Disciplina operacional (antes de cada disparo)

- **Sempre sincronizar o branch principal do repositório de trabalho imediatamente antes de cada novo disparo** (atualizar para o estado remoto mais recente). Pular esse passo pode fazer a CLI ramificar a partir de uma base desatualizada, criando conflitos de integração desnecessários mais tarde quando múltiplas tarefas paralelas tentam se juntar de volta ao branch principal.
- **Um disparo, um escopo coeso.** Evite empacotar múltiplas mudanças não relacionadas num único prompt — isso dificulta a revisão do diff resultante e aumenta o raio de dano se algo sair errado.
- **Revisar o diff manualmente antes de aceitar o resultado como concluído**, mesmo quando a CLI reporta sucesso. O relatório final da CLI descreve o que ela *pretendeu* fazer, não necessariamente prova de que fez exatamente e só isso — confira o diff real.

## Padrões de erro observados e como mitigar

- **Timeout de impressão baixo mascarando sucesso real**: a tarefa termina de verdade (commit/push/PR aberto) mas a CLI "morre" antes de reportar, parecendo falha. Mitigação: aumentar o timeout de impressão generosamente para tarefas longas; se um disparo retornar sem um resumo final claro, verificar manualmente o estado remoto (existe branch/commit/PR novo?) antes de assumir falha.
- **Bugs que só aparecem em validação completa/remota, não em lint/test local**: erros de caminho de import relativo incorreto, ou dependências circulares entre módulos, por exemplo, só foram pegos pela pipeline de build completa (rodando em um ambiente limpo), não pelo lint/test local que a própria CLI roda. Mitigação: sempre aguardar o resultado da validação remota completa antes de aceitar a tarefa como pronta, e estar preparado para corrigir manualmente esse tipo de bug de "integração" que ferramentas locais não capturam.
- **Ramificação a partir de base desatualizada**: gera conflitos de integração quando duas tarefas paralelas mexem no mesmo arquivo (por exemplo, ambas criando o mesmo arquivo novo de forma independente). Mitigação: já coberta acima (sincronizar antes de cada disparo); se ocorrer mesmo assim, resolver o conflito manualmente é geralmente mais rápido e seguro do que tentar re-disparar a tarefa do zero.
- **Colisão de numeração/nomenclatura em artefatos gerados por disparos paralelos** (ex.: dois arquivos de migração de banco de dados criados por duas tarefas diferentes recebendo o mesmo número sequencial): tende a acontecer quando múltiplas tarefas paralelas não têm visibilidade uma da outra no momento da geração. Mitigação: ao notar esse padrão, avisar explicitamente o próximo prompt sobre o valor já usado, para que a CLI escolha o próximo disponível.
- **Ruído de diff por diferença de terminador de linha (CRLF/LF)**, comum em ambiente Windows: pode fazer arquivos não tocados aparecerem como modificados. Mitigação: rodar uma ferramenta de formatação automática (linter com `--fix`) antes de cada commit e confirmar com um diff estatístico que não há mudança real de conteúdo antes de prosseguir.

## Quando usar esse fluxo

Funciona bem para tarefas de escopo bem definido e diagnosticável de antemão: correções de bug com causa raiz já identificada, adição de um campo/coluna com uso claro, troca mecânica de uma fonte de dados por outra em pontos específicos, etc. Não é o fluxo certo para explorar um problema ambíguo do zero — nesses casos, vale investigar primeiro (como arquiteto) até ter um diagnóstico e escopo claros, e só então escrever o prompt para o executor.
