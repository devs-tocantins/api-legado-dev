# Engajamento e Gamificação - Devs Tocantins 🚀

**Tudo o que for feito em prol da comunidade e que gere um impacto real vale pontos e será reconhecido. O objetivo deste sistema é capturar, registrar e eternizar esse esforço.**

[![github action status](https://github.com/brocoders/nestjs-boilerplate/actions/workflows/docker-e2e.yml/badge.svg)](https://github.com/brocoders/nestjs-boilerplate)

<br />

Este é o repositório da API (Backend) responsável pelo gerenciamento de toda a economia pontual e rankings mensais do portal Devs Tocantins. A estrutura provê validações criptográficas, integrações com nuvem, bancos relacionais robustos, histórico de transações e roteamentos autênticos baseada numa moderna Arquitetura API-First sobre `NestJS` e `TypeORM`.

---

## Sumário

- [Mapeamento da Documentação](#mapeamento-da-documentação)
- [Funcionalidades Suportadas](#funcionalidades-suportadas)
- [Inicialização Rápida](#inicialização-rápida)
- [Como Contribuir](#como-contribuir)

---

## Mapeamento da Documentação

Familiarize-se com a estrutura do sistema visitando a nossa **Pasta Oficial de Documentações `docs/`** na raiz. 

* [Instalação e Ambiente Local](docs/installing-and-running.md)
* [Regras do Produto (PRD - Engajamento)](docs/prd-engajamento.md)
* [Design da API Base](docs/api-design.md)
* [Modelagem de Dados (Banco Relacional)](docs/data-model.md)
* [Autenticação e Sessões JWT](docs/auth.md)
* [Upload de Comprovantes (AWS S3 / Storage)](docs/file-uploading.md)
* [Arquitetura Hexagonal](docs/architecture.md)
* [Geradores de Componentes por CLI](docs/cli.md)
* [Internacionalização / Traduções](docs/translations.md)
* [Filosofia E2E e Testes Unitários](docs/tests.md) 

---

## Funcionalidades Suportadas

- [x] **Relacional Profundo:** Funciona através do PostgreSQL integrado ao TypeORM. Desacoplamento entre Dados de Login e Dados do Perfil de Gamificação (carteira XP).
- [x] **CI e Segurança Intensa:** Configurações de Linting nativas via Github Actions, padronização de commits (Husky), ESLint, Prettier e Restrições de serializações (ocultamento de senhas automático com class-transformer).
- [x] **Ecossistema Completo de Autenticação:** Login por Email integrado com Handlebars (Envio transacional com Nodemailer e teste offline com Maildev). Preparado pro futuro com Apple, Facebook e Google Login.
- [x] **Permissões (Roles e Submissões):** Camada de aprovação unificada contendo papéis isolados (Usuário Submete Atividades / Moderador aprova, ganha XP automático).
- [x] **Arquitetura Imparcial:** Separação entre Serviços Core, Infraestrutura Persistência e Entidades base do Domínio.

---

## Inicialização Rápida

Começar no nosso ecossistema exige pouquíssimos comandos devido à automação Docker e Seeds de semente do próprio sistema.

1. Configure as chaves base copiando `.env-example-relational`
```bash
cp env-example-relational .env
```
2. Inicialize as bases em Background:
```bash
docker compose up -d postgres adminer maildev
```
3. Instale módulos node e rode o script configurador inicial (apenas 1x).
```bash
npm run app:config
```
4. Gere o BD a partir dos schemas de entidades locais (`migration`) e gere também dados falsos e regras iniciais de catálogo para facilitar seus testes no Swagger (`seed`).
```bash
npm run migration:run
npm run seed:run:relational
```
5. Assista a Mágica rodando localmente! Acesse o portal `http://localhost:3000/docs`.
```bash
npm run start:dev
```

*(Para explicações detalhadas ou dúvidas nos comandos de Setup, visite: `docs/installing-and-running.md`)*

---

## Como Contribuir

Mergulhe na arquitetura colaborando para tornar os Devs Tocantins o polo de maior reconhecimento de devs voluntários.

Antes de baixar o repô e subir código de qualquer maneira, exigimos fortemente a leitura do nosso **[Guia de Contribuição (CONTRIBUTING.md)](CONTRIBUTING.md)** para não quebrar a CI principal do pipeline (por não utilizar Conventional Commits) ou não desrespeitar a padronização NestJS imposta nas Models.
