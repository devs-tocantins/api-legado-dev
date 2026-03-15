# Roadmap de Issues (GitHub) - Motor de Engajamento

Este documento lista as *Issues* estruturadas para coordenar o desenvolvimento do projeto através da comunidade Open Source.
As **Labels** utilizadas aqui foram corrigidas para utilizar estritamente o padrão do GitHub. Além disso, cada Issue de código exige cobertura de testes e o uso do gerador CLI da arquitetura.

---

## 👑 Milestone 0: Configurações de Infraestrutura do Líder (Owner)
*Foco: Tarefas que apenas o mantenedor/líder do repositório tem acesso às credenciais para homologar os Pull Requests de forma integral.*

### [ ] Configurar Integração de Qualidade de Código (SonarQube)
**Labels:** `enhancement`
*Garantir que os PRs da comunidade sejam escaneados por falhas de segurança e code smells.*
- [ ] Criar projeto na nuvem do SonarCloud/SonarQube.
- [ ] Configurar o token secreto no GitHub Actions.
- [ ] Adicionar os scripts de sonar scanner no CI workflow.

### [ ] Configurar Variáveis de Autenticação e SMTP (`.env`)
**Labels:** `enhancement`, `database`
*Garantir que o ecossistema de login e recuperação de senhas da nuvem funcionem.*
- [ ] Gerar as strings seguras de hash para: `AUTH_JWT_SECRET`, `AUTH_REFRESH_SECRET`, etc.
- [ ] Configurar credenciais oficiais do disparo de envio de emails (`MAIL_HOST`, `MAIL_USER`, `MAIL_PASSWORD`) abandonando o Maildev local para o ambiente real.
- [ ] Configurar a string de conexão forte do Banco de Dados e Redis da nuvem (`DATABASE_URL`, `WORKER_HOST`).

### [ ] Configurar Integração com Amazon S3 (Uploads)
**Labels:** `enhancement`
*A geração de URL assinadas de comprovantes depende que o seu Bucket da AWS exista.*
- [ ] Mudar `FILE_DRIVER` para `s3-presigned`.
- [ ] Criar o Bucket no S3 e injetar as credenciais (`ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`, `AWS_S3_REGION`, `AWS_DEFAULT_S3_BUCKET`).
- [ ] Configurar as permissões de CORS do IAM na Amazon autorizando a API.

### [ ] Configurar Integração Externa (Login Social)
**Labels:** `enhancement`
*Habilitar aos usuários o login por terceiros OAuth.*
- [ ] Criar e extrair o `FACEBOOK_APP_ID` e `SECRET` no Facebook Developers.
- [ ] Criar e extrair o `GOOGLE_CLIENT_ID` e `SECRET` no Google Cloud Console.
- [ ] Criar e extrair o `APPLE_APP_AUDIENCE` no portal Apple Developer.

---

## 📍 Milestone 1: Fundações e Banco de Dados (v0.1.0)
*Foco: Limpeza atômica, modelagem estrutural (TypeORM) e massa de dados da API.*

### [ ] Limpar Módulos Não Utilizados
**Labels:** `good first issue`, `enhancement`
*Remover do Boilerplate Módulos de Banco de Dados de Documento.*
- [ ] Remover dependências relacionadas ao `"mongoose"` no `package.json`.
- [ ] Excluir pastas de configuração (`document`) em `src/database/`.
- [ ] Atualizar `app.module.ts` removendo imports do Mongoose.
- [ ] Atualizar o `docker-compose.yml` base para remover contêineres do Mongo.

### [ ] Configurar Simulador de AWS S3 (MinIO) no Docker
**Labels:** `enhancement`, `documentation`
*Zerar a dependência de internet da equipe. O desenvolvedor local fará upload de arquivos localmente fingindo ser a Amazon.*
- [ ] Adicionar um `service` de **MinIO** no arquivo `docker-compose.yaml`.
- [ ] Configurar as credenciais padrões e locais do MinIO nas portas estáticas (ex: 9000).
- [ ] Atualizar o `.env-example-relational` com as chaves fictícias do Minio e explicar no `docs/file-uploading.md` como os devs usam a interface gráfica do Minio local.

### [ ] Criar Migrations e Módulo: `GamificationProfile`
**Labels:** `enhancement`, `database`
*Relacionamento 1:1 com a entidade `User` já existente, isolando a economia de pontos.*
- [ ] Executar o gerador via CLI: `npm run generate:resource:relational -- --name GamificationProfile`
- [ ] Na Entidade gerada, definir colunas: `userId` (Relacionamento 1:1), `username` (único), `totalXp`, `currentMonthlyXp`, `currentYearlyXp`, `gratitudeTokens`.
- [ ] Gerar a migration oficial executando `npm run migration:generate -- src/database/migrations/CreateGamificationProfile`.
- [ ] Escrever Testes Unitários básicos para o Service do Gerador.

### [ ] Criar Migrations e Módulos do Sistema de Atividades
**Labels:** `enhancement`, `database`
*Estruturar as regras do core de interação (`Activity` e `Submission`).*
- [ ] Executar o gerador CLI: `npm run generate:resource:relational -- --name Activity` e definir suas colunas de regra (`fixedReward`, `cooldownHours`, `isHidden`).
- [ ] Executar o gerador CLI: `npm run generate:resource:relational -- --name Submission` ligando FK com User e Activity.
- [ ] Gerar as respectivas migrations.
- [ ] Escrever Testes Unitários cobrindo as Controllers geradas.

### [ ] Criar Migration e Módulo de Log: `Transaction`
**Labels:** `enhancement`, `database`
*O Extrato/Ledger imutável de XP e Tokens.*
- [ ] Executar o gerador CLI: `npm run generate:resource:relational -- --name Transaction`
- [ ] Configurar relacionamento ManyToOne com `GamificationProfile` e estipular as Enum's de categorias financeiras.
- [ ] Gerar a a respectiva migration.
- [ ] Escrever Testes Unitários de criação de transação simples.

### [ ] Criar Seeders Iniciais da Plataforma
**Labels:** `good first issue`, `enhancement`, `database`
*Massa de dados padrão para as pessoas testarem a API sem estarem vazias.*
- [ ] Criar semente conectada em `src/database/seeds` para criar 1 Admin e 2 Moderadores (usando relacionamentos de Roles).
- [ ] Injetar via seeder 5 Perfils preenchidos aleatoriamente com o módulo FakerJS já integrado no projeto.
- [ ] Injetar 5 Atividades padrão no Catálogo inicial.

---

## 📍 Milestone 2: Catálogo e Core de Submissões (v0.2.0)
*Foco: Acesso de Usuário Comum.*

### [ ] Rota Pública do Catálogo: `GET /activities`
**Labels:** `enhancement`
*Habilitar o retorno de onde dá para ganhar pontos.*
- [ ] Personalizar a rota List-All gerada do `ActivitiesController`.
- [ ] Adicionar filtro nas queries TypeORM escondendo as atividades secretas (`isHidden: true`).
- [ ] Garantir que os casos de Teste Unitários no Controller cubram essa requisição.

### [ ] Endpoint de Submissão C/ URL Assinada de Prova
**Labels:** `enhancement`, `help wanted`
*Conectar as regras S3 Presigned ao envio prático do Front.*
- [ ] Revisorar a rota de `FilesModule` para aceitar/gerar a URL temporária do painel AWS do líder.
- [ ] Criar validadores rígidos (class-validator) na DTO de Submissão (`POST /submissions`).
- [ ] Receber o retorno da provedora no Payload antes da persistência de status `PENDING`.
- [ ] Escrever Testes Unitários mimetizando falhas na ausência do Payload.

### [ ] Regra Abusiva de Cooldown Limit (Anti-Farming)
**Labels:** `enhancement`, `bug`
*Não deixar clicar enviar o form sem parar.*
- [ ] No momento que o SubmissionsService chamar o create, pesquisar no BD se aquela Activity e User tiveram criações recentes limitadas pela propriedade `.cooldownHours`.
- [ ] Rejeitar a Promisse jogando um `BadRequestException` nativo.
- [ ] Adicionar explicitamente Testes Unitários validando as tentativas de spam simulando picos.

### [ ] Endpoint de Histórico Pessoal: `GET /submissions/me`
**Labels:** `good first issue`, `enhancement`
*O dev só pode enxergar os históricos dele mesmo.*
- [ ] Adicionar o `@UseGuards(AuthGuard('jwt'))` e pegar o id dinamicamente do `request.user.id`.
- [ ] Usar repositório pra retornar os status finais de forma paginada.
- [ ] Acoplar os Testes Unitários.

---

## 📍 Milestone 3: Economia, Moderação e Segurança (v0.3.0)
*Foco: Como os administradores aprovam os lucros.*

### [ ] Fila Restrita de Moderação: `GET /submissions/pending`
**Labels:** `good first issue`, `enhancement`
*Listagem de pendências apenas para o "staff".*
- [ ] Restringir usando `@Roles(RoleEnum.admin, RoleEnum.moderator)`.
- [ ] Retornar o relacionamento do `GamificationProfile` (Pra sabermos o nome de quem pediu XP juntamente do link da foto de prova).
- [ ] Escrever casos de Teste de E2E batendo sem Token/Role proibindo acesso de invasores 403.

### [ ] Workflow de Auditoria Master: `POST /submissions/:id/review`
**Labels:** `enhancement`, `help wanted`
*A API onde todas as operações atômicas da economia acontecem numa chamada só.*
- [ ] Validar DTO mudando o PENDING para `APPROVED` | `REJECTED`.
- [ ] Fazer query de `UPDATE` somando o `awardedXp` na carteira do Perfil.
- [ ] No mesmo contexto de execução TypeORM (se possível em ACID Database Transaction), inserir a linha extra de log contábil em `Transaction`.
- [ ] Adicionar vasta gama de Testes Unitários de falhas entre entidades e de Sucesso Completo.

### [ ] Atribuição de Recompensa Oculta ao Moderador
**Labels:** `enhancement`, `good first issue`
*Injetar um bônus pro auditor logo após a auditoria do passo anterior.*
- [ ] Adicionar um acréscimo de pontuação estática no Wallet de onde partiu o Token de autorização (`request.user.id`).
- [ ] Mapear isto no Transaction typeEnum via `AUDITOR_REWARD`.
- [ ] Validar via Teste Unitário.

### [ ] Economia Peer-to-Peer: Transferência de Tokens
**Labels:** `enhancement`
*Permitir aos usuários se agradarem sem moderação.*
- [ ] Rota `POST /tokens/transfer` validando que a carteira do remente possui fundos > DTO.amount.
- [ ] Subtrair da cota de envio do remente `GamificationProfile`.
- [ ] Somar como Experiência Total (`totalXp`) em quem recebeu as gorjetas virtuais.
- [ ] Gerar os 2 registros imutáveis em `Transaction`.
- [ ] Escrever Testes Unitários tentando fraudar sem fundos negativos.

### [ ] CronJob de Renovações Mensais
**Labels:** `enhancement`, `help wanted`
*Refil automático na virada do mês.*
- [ ] Importar e utilizar plugin `@nestjs/schedule`.
- [ ] Rodar uma rotina (CronJob) a cada dia 1º do mês realizando duas ações: (1) Resetar a coluna `currentMonthlyXp` de todos os usuários para ZERO, reiniciando o Ranking Mensal. (2) Resetar a cota de "Tokens de Gratidão" pendentes de todos os usuários para o valor padrão (ex: 5 Tokens), sem acumular o saldo do mês anterior.

---

## 📍 Milestone 4: Rankings e Perfis Públicos (v1.0.0)
*Foco: Dados vitrines limpos, formatados para Front e App.*

### [ ] Ranking do Mês e do Ano (Competitivo)
**Labels:** `good first issue`, `enhancement`
*Quem mais atuou.*
- [ ] Refinar as chamadas SQL subjacentes das routes GET `/api/v1/rankings/monthly` usando os cache limits.
- [ ] Retornar limit 50 orderBy DESC a coluna respectiva `currentMonthlyXp` ou `currentYearlyXp`.
- [ ] Testes End 2 End validando a ordenação da maior para a menor XP.

### [ ] Ranking Global (Hall da Fama)
**Labels:** `enhancement`
*O panteão vitalício histórico.*
- [ ] Query paralela do GET de `totalXp` e `rankLevel`.
- [ ] Acionar o class-transformer DTO para proteger campos vitais e só mostrar Nickname e Pontos Globais pro frontend.

### [ ] Pagina Dinâmica de Perfil Público: `GET /profiles/:username`
**Labels:** `enhancement`
*Permitir o compartilhamento do "Currículo Comunitário" do Dev.*
- [ ] Criar a rota permitindo a busca pelo `@username` (ex: `/profiles/leonardo-santos`).
- [ ] O banco de dados (TypeORM) deve fazer um *Join* (trazer dados combinados) do `GamificationProfile` completo + a lista das 10 últimas `Submissions` aprovadas desse usuário.
- [ ] Retornar tudo em um único JSON para o Front-end montar a vitrine (Nível, Total XP e Histórico Recente de boas ações).
- [ ] Escrever Testes Unitários validando retornos com e sem atividades no histórico.
