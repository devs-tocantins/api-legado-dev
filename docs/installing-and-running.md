# Instalação

O projeto da API - Motor de Engajamento é alimentada pelo NestJS e utiliza ferramentas pesadas já pré-configuradas para entregar a maior qualidade possível no menor tempo de escrita de roteadores e regras de negócio de base.

---

## Tabela de Conteúdos <!-- omit in toc -->

- [Desenvolvimento Confiável e Rápido](#desenvolvimento-confiável-e-rápido)
- [Ferramentas Extra Fornecidas](#ferramentas-extra-fornecidas)
- [Links e Portas](#links-e-portas)

---

## Desenvolvimento Confiável e Rápido

1. Tendo feito o checkout/clone local (você já fez isso abrindo esse repositório). Vá ao terminal e copie as variáveis padrão do modo relacional.

   ```bash
   cp env-example-relational .env
   ```

2. Certifique-se que o Docker-Desktop está operacional e execute o comando mágico para provisionar todo os sub-sistemas de retaguarda em modo invisível (Database, Adminer UI, e Simulador de eMails).

   ```bash
   docker compose up -d postgres adminer maildev
   ```

3. Instale as dependências através do comando que também acoplará scripts customizados de checagens na sua CLI nativa e o Prettier/EsLint na sua Workspace (`app:config` só precisa rodar a 1ª Vez):

   ```bash
   npm run app:config
   npm install
   ```
4. Verifique as Tabelas Oficiais do banco de dados (o Boilerplate TypeORM lerá suas `entities` e processará todos campos nas tabelas sem precisar de DBAs interativos):

   ```bash
   npm run migration:run
   ```

5. Aplique informações de mock (sementes randômicas do FakerJS, Ex: Roles, Avatares, Status, Usuários Falsos para dev).

   ```bash
   npm run seed:run:relational
   ```

6. O motor será atrelado na porta localhost:3000 em modo _Watch_ com SWC:

   ```bash
   npm run start:dev
   ```

Aproveite seu projeto! Todas as edições e gravações reiniciam graciosamente e com grande rapidez de build.

## Links e Portas

Você conta com ferramentas administrativas fora da caixa se ligar os outros contêineres:

- Swagger (A documentação interativa das requisições REST): <http://localhost:3000/swagger> — disponível apenas em desenvolvimento (`NODE_ENV !== production`)
- Adminer (Cliente Visual para interagir com o PostgreSQL e ver as tabelas e dados crus por fora da sua aplicação): <http://localhost:8080>
- Maildev (Caixa de Entrada unificada, simulará todos os envios de Email na plataforma. Você vai abrir ele para confirmar contas registradas ou verificar ressetes de senha): <http://localhost:1080>

O ecossistema inteiro te permite debugar sem esbarrar nem depender de credenciais hospedadas externamente.
