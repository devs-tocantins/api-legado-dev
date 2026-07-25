# Interface de Linha de Comando (CLI)

---

## Tabela de Conteúdos <!-- omit in toc -->

- [Gerar novos recursos (Módulos/Tabelas)](#gerar-novos-recursos)
- [Adicionar uma nova propriedade a um recurso](#adicionar-uma-nova-propriedade-a-um-recurso)

---

## Gerar novos recursos

Gerar um "recurso" via CLI significa criar as camadas `Controller`, `Service`, `Repository`, `DTOs` e `Entities` que gerenciam uma respectiva regra de negócio de uma vez, poupando minutos ou horas fazendo Boilerplate.

No legado.dev, usamos banco de dados Relacional via TypeORM. Para construir o "esqueleto" de coisas novas (Ex: "Projeto", "Badge", "Equipe") utilize o comando a seguir:

```bash
npm run generate:resource:relational -- --name NomeDoRecurso
```

Exemplo prático de criação de um módulo de Projetos:

```bash
npm run generate:resource:relational -- --name Project
```
O próprio código base irá gerar a pasta em `src/projects/` devidamente injetada na aplicação principal, e em formato Plural.

## Adicionar uma nova propriedade a um recurso

Se eu já tenho um recurso existe, ex (`User`), e eu decidi adicionar a coluna `birthDate` (data de nascimento) no meio do projeto. Você pode rodar um CLI para atualizar a DTO e a Entidade simultaneamente!

Execute:

```bash
npm run add:property:to-relational
```
E o sistema fará perguntas simples no Terminal para construir isso da forma esperada pela arquitetura.
