# Banco de Dados

## Tabela de Conteúdos <!-- omit in toc -->

- [Sobre o Banco de Dados](#sobre-o-banco-de-dados)
- [Trabalhando com TypeORM (PostgreSQL)](#trabalhando-com-typeorm-postgresql)
  - [Gerando Migrations (Migrações)](#gerando-migrations)
  - [Rodando Migrations](#rodando-migrations)
  - [Revertendo Migrations](#revertendo-migrations)
  - [Excluir todas as Tabelas](#excluir-todas-as-tabelas)
- [População de Dados Iniciais (Seeding)](#população-de-dados-iniciais-seeding)
  - [Criando Seeds (Sementes)](#criando-seeds)
  - [Rodando Seeds](#rodando-seeds)
- [Performance e Otimização](#performance-e-otimização)

---

## Sobre o Banco de Dados

O legado.dev é voltado a usar um Banco de Dados Relacional sólido, ou seja, estruturamos os dados na API através do **PostgreSQL**. A ferramenta que faz a ponte do código no NodeJS para comandos SQL transparentes e padronizados para o banco é o **TypeORM**.

## Trabalhando com TypeORM (PostgreSQL)

### Gerando Migrations

Se você alterar qualquer coisa numa "Entity" TypeORM realocando ou apagando colunas, você precisará refletir isso na estrutura oficial do banco através das "Migrations" - Elas versionam a evolução do modelo de dados para todos conseguirem rodar a cada Pull Request.

1. Altere a Entidade (exemplo em `.entity.ts`):

   ```ts
   import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
   import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

   @Entity()
   export class Status extends EntityRelationalHelper {
     @PrimaryGeneratedColumn()
     id: number;

     @Column()
     name: string;
   }
   ```

2. Na raiz, gere um arquivo de Migration atrelada a esta mudança:

   ```bash
   npm run migration:generate -- src/database/migrations/NovaMigrationDeExemplo
   ```

3. Por fim, aplique essa "novidade" ao banco atual rodando outro comando.

### Rodando Migrations

Toda vez que fizer o clone ou um `git pull` de atualizações nos modelos, rode suas migrations.

```bash
npm run migration:run
```

### Revertendo Migrations

Se a última versão do DB aplicou algo crítico que quebrou suas dependências locais:

```bash
npm run migration:revert
```

### Excluir todas as Tabelas
*Cuidado: Comandos Destrutivos.*

```bash
npm run schema:drop
```

---

## População de Dados Iniciais (Seeding)

### Criando Seeds

Sementes servem para encher o banco na 1ª vez contendo regras mínimas para sua API não estar vazia — por exemplo já criando as "Tipos de Pontuação" na tabela.

1. Crie o arquivo executando: `npm run seed:create:relational -- --name NOME_DA_ENTIDADE`.
2. O sistema gerará um construtor de classes dentro de `src/database/seeds/relational/NOME_DA_ENTIDADE`.
3. Adicione lógica `.save` do repositório no método principal do arquivo injetado dessa seed.
4. Você pode utilizar a biblioteca Faker local (`@faker-js/faker`) se quiser preencher tabelas com dezenas de e-mails, avatares ou pontuações fake!

### Rodando Seeds

```bash
npm run seed:run:relational
```

---

## Performance e Otimização

### Índices e Chaves Estrangeiras (Foreign Keys)
O TypeORM consegue interligar tabelas nas Entities muito fácil (`@ManyToOne`, `@OneToMany`). Porém, caso seu BD sofra com lentidão devido a relacionamentos pesados de milhares de requisições, não se esqueça de criar _Índices (Indexes)_ manuais de pesquisa nessas chaves. O PostgreSQL por padrão local não indexa essas FK's!

### Conexões Máximas
Se você tiver um gargalo grande na nuvem de vários requests esgotando a CPU/Tráfego de portas da API. Adapte o seu `.env`:
`DATABASE_MAX_CONNECTIONS=100` para ditar quão fundo seu código se "pluga" ao limite do Pool do BD.
