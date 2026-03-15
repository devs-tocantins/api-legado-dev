# 📖 Documento de Contexto e Guia de Desenvolvimento: API Devs Tocantins

Olá, dev! Bem-vindo ao motor de gamificação da comunidade Devs Tocantins. Nosso objetivo é rastrear, registrar e recompensar todo o esforço colaborativo da comunidade. O mantra aqui é: "Se gerou valor para a comunidade, vale ponto".

Este documento serve para alinhar a sua mente e a da Inteligência Artificial (ChatGPT, Cursor, Claude, GitHub Copilot) antes de escrever qualquer linha de código.

## 1. Regras do Jogo (Workflow e Boas Práticas)
Não comitamos direto na main. Para cada nova funcionalidade, siga este ciclo inegociável:

*   **Escolha a Issue:** Olhe o nosso board e escolha a Issue que vai atacar (ex: #3 Criar Módulo de Atividades).
*   **Crie a Branch:** Crie uma branch isolada para ela: `git checkout -b feature/issue-3-modulo-atividades`.
*   **Programe com IA usando o CLI:** (Instruções detalhadas abaixo).
*   **Commit Semântico:** Faça commits claros seguindo o padrão (ex: `feat: adiciona modulo de atividades`).
*   **Pull Request (PR):** Abra o PR apontando para a branch principal e referencie a issue (ex: `Closes #3`).

## 2. A Arquitetura e a Documentação Obrigatória
Nós estamos usando um boilerplate de NestJS de nível Enterprise focado em Domain-Driven Design (DDD). Ele separa estritamente o código em: `Controller -> Service -> Domain -> Mapper -> Entity -> Repository`.

⚠️ **REGRA DE OURO PARA VOCÊ E PARA A IA:**
Antes de deduzir como o sistema funciona, LEIA A PASTA `docs/`. O projeto possui manuais detalhados (`docs/architecture.md`, `docs/cli.md`, `docs/api-design.md`).

NÃO crie arquivos ou módulos manualmente! O repositório possui um gerador de código embutido (Hygen). Sempre que for criar um CRUD ou uma nova tabela, use os comandos via terminal descritos na documentação.

A ferramenta vai gerar os 10 arquivos necessários (DTOs, Mappers, Entidades). O seu trabalho e o da IA será apenas entrar nos arquivos gerados e adicionar os campos e as regras de negócio.

## 3. O Mapa do Projeto (Milestones e Issues)
O escopo completo do nosso MVP está mapeado nestas tarefas. Você (e a IA) devem focar em uma de cada vez, mantendo o contexto geral em mente:

**Fase 1: Fundações e Banco de Dados**
*   #1 Limpar Módulos Não Utilizados (Remover Mongo, i18n, etc).
*   #2 Criar Migrations e Módulo: GamificationProfile (Relacionado 1:1 com o User nativo).
*   #3 Criar Migrations e Módulos do Sistema de Atividades.
*   #4 Criar Migration e Módulo de Log: Transaction.
*   #5 Criar Seeders Iniciais da Plataforma.
*   #22 Configurar Simulador de AWS S3 (MinIO) no Docker.

**Fase 2: Infraestrutura e Integrações**
*   #6 a #9: Configurar SonarQube, Variáveis SMTP, Amazon S3 e Login Social.

**Fase 3: Catálogo e Core de Submissões**
*   #10 Rota Pública do Catálogo: GET /activities.
*   #11 Endpoint de Submissão C/ URL Assinada de Prova.
*   #12 Regra Abusiva de Cooldown Limit (Anti-Farming).
*   #13 Endpoint de Histórico Pessoal: GET /submissions/me.

**Fase 4: Economia, Moderação e Segurança**
*   #14 Fila Restrita de Moderação: GET /submissions/pending.
*   #15 Workflow de Auditoria Master: POST /submissions/:id/review.
*   #16 Atribuição de Recompensa Oculta ao Moderador.
*   #17 Economia Peer-to-Peer: Transferência de Tokens.
*   #18 CronJob de Renovações Mensais.

**Fase 5: Rankings e Perfis Públicos**
*   #19 Ranking do Mês e do Ano (Competitivo).
*   #20 Ranking Global.
*   #21 Pagina Dinâmica de Perfil Público: GET /profiles/:username.

## 🤖 Como iniciar uma tarefa com a sua IA (Prompt Mestre)
Dev Júnior: Quando você puxar uma issue (ex: Issue #3), abra um novo chat na sua IA de preferência (ou no Cursor/Copilot) e cole exatamente o texto abaixo, substituindo os colchetes pelos dados da sua tarefa:

```text
Você é meu par de programação Sênior e arquiteto de software. Vou trabalhar na API da comunidade Devs Tocantins (NestJS + PostgreSQL).

⚠️ INSTRUÇÃO OBRIGATÓRIA DE CONTEXTO:
Antes de escrever qualquer linha de código ou sugerir arquiteturas, você deve ler os seguintes arquivos Markdown na pasta docs/ deste repositório para entender o padrão exato que utilizamos:
- docs/architecture.md
- docs/api-design.md
- docs/cli.md (Para entender como gerar módulos usando o Hygen)
- docs/data-model.md e docs/prd-engajamento.md (Se aplicável à regra de negócio).

Nosso Contexto Arquitetural Resumido: Estamos usando um boilerplate altamente opinativo. Todo o código relacional é isolado em Domain, DTOs, Entities, Mappers e Repositories. O banco Mongoose/MongoDB já foi deletado, usamos 100% TypeORM. O módulo de autenticação e a tabela de Users já existem na base. A regra do projeto dita que devemos usar o CLI do Hygen para criar a estrutura base e depois focar apenas em injetar as regras de negócio no Service e propriedades nas classes.

A Tarefa de Hoje: Eu vou atuar na [Nome da Issue] #[Número da Issue]
[Cole aqui a descrição e os critérios de aceite da sua Issue]

Seu Papel Agora:
1. Confirme para mim que você leu os arquivos da pasta docs/ e compreendeu a estrutura de Mappers e o uso do CLI do Hygen.
2. NÃO me dê o código completo ainda.
3. Liste para mim qual comando eu devo rodar no meu terminal para gerar o recurso base para essa Issue.
4. Após eu gerar, me diga exatamente quais arquivos eu precisarei abrir para adicionar os campos do banco de dados e as regras de negócio desta issue específica, passo a passo, respeitando o padrão da documentação.

Entendeu nosso fluxo? Podemos começar?
```
