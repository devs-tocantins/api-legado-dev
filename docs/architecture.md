# Arquitetura

---

## Tabela de Conteúdos <!-- omit in toc -->

- [Arquitetura Hexagonal](#arquitetura-hexagonal)
- [Motivação](#motivação)
- [Descrição da Estrutura de Módulos](#descrição-da-estrutura-de-módulos)
- [Recomendações](#recomendações)
  - [Repositórios](#repositórios)
- [FAQ](#faq)
  - [Como gerar um novo recurso (Controller, Service, DTOs, etc)?](#como-gerar-um-novo-recurso)

---

## Arquitetura Hexagonal

O legado.dev utiliza uma arquitetura baseada na **Arquitetura Hexagonal** (também conhecida como Ports and Adapters). 

## Motivação

O principal motivo para a utilização da Arquitetura Hexagonal é separar a lógica de negócio (domínio) da infraestrutura (banco de dados, frameworks, envio de emails). Isso nos permite evoluir regras de gamificação sem ficarmos fortemente acoplados a detalhes do banco de dados (que no nosso caso é o PostgreSQL via TypeORM).

## Descrição da Estrutura de Módulos

```txt
.
├── domain
│   └── [ENTIDADE_DE_DOMINIO].ts
├── dto
│   ├── create.dto.ts
│   ├── find-all.dto.ts
│   └── update.dto.ts
├── infrastructure
│   └── persistence
│       └── relational
│           ├── entities
│           │   └── [ENTIDADE_TYPEORM].ts
│           ├── mappers
│           │   └── [MAPPER].ts
│           ├── relational-persistence.module.ts
│           └── repositories
│               └── [ADAPTER].repository.ts
├── controller.ts
├── module.ts
└── service.ts
```

- `[ENTIDADE_DE_DOMINIO].ts` representa uma entidade na camada de negócio. A entidade de domínio não tem dependências com o banco de dados.
- `[ENTIDADE_TYPEORM].ts` representa a **estrutura no banco de dados**, utilizada no banco de dados relacional (PostgreSQL via TypeORM).
- `[MAPPER].ts` é um mapeador responsável por converter a entidade do banco de dados em entidade de domínio e vice-versa.
- `[PORT].repository.ts` é a interface (Port) do repositório, que dita **o que** deve ser feito no banco.
- `[ADAPTER].repository.ts` implementa a interface, definindo **como** interagir com o PostgreSQL no nosso caso.

A pasta `infrastructure` contém tudo que é externo à aplicação (persistência, uploaders, provedores de email, etc).

## Recomendações

### Repositórios

Evite criar métodos genéricos nos repositórios, pois isso dificulta a rastreabilidade e extensão durante a vida do projeto. Crie métodos com responsabilidade única.

```typescript
// ❌ Evite isso
export class UsersRelationalRepository implements UserRepository {
  async find(condition: UniversalConditionInterface): Promise<User> {
    // ...
  }
}

// ✅ Prefira isso
export class UsersRelationalRepository implements UserRepository {
  async findByEmail(email: string): Promise<User> {
    // ...
  }
  
  async findByRoles(roles: string[]): Promise<User> {
    // ...
  }
}
```

---

## FAQ

### Como gerar um novo recurso?

Você pode usar as ferramentas de [CLI](cli.md) para gerar recursos automaticamente, sem precisar construir manualmente as pastas e camadas.
