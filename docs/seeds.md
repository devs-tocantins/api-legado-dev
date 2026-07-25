# Seeds

Seeds são scripts que populam o banco de dados com dados iniciais necessários para a plataforma funcionar. Eles são idempotentes: podem ser executados várias vezes sem criar duplicatas.

---

## Como executar

```bash
# No diretório do backend:
npm run seed:run:relational

# Ou em um ambiente específico:
NODE_ENV=production npm run seed:run:relational
```

Os seeds usam `upsert` ou verificam a existência antes de inserir, então é seguro reexecutar.

---

## Ordem de execução

Os seeds devem ser executados na seguinte ordem (dependências entre entidades):

1. **Roles** — papéis de usuário (`user`, `admin`, `moderator`)
2. **Statuses** — status de usuário (`active`, `banned`)
3. **Users** — usuário admin padrão
4. **Activities** — catálogo inicial de atividades
5. **Badges** — catálogo inicial de badges
6. **Events** — eventos iniciais da comunidade
7. **Gamification Profiles** — perfis de gamificação dos usuários inicializados
8. **Learning Tracks** — trilhas de aprendizado iniciais com seções e marcos
9. **Missions** — missões iniciais

---

## Seeds disponíveis

### `role/role-seed.service.ts`
Cria os papéis padrão:
- `1 — user` (membro comum)
- `2 — admin` (administrador)
- `3 — moderator` (moderador)

### `status/status-seed.service.ts`
Cria os status padrão:
- `1 — active`
- `2 — inactive`
- `3 — banned`

### `user/user-seed.service.ts`
Cria o usuário admin padrão. Credenciais definidas via variáveis de ambiente:
```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=senha-forte
```

### `activity/activity-seed.service.ts`
Popula o catálogo com as atividades iniciais da plataforma. Atividades são identificadas pelo `title` para idempotência — mudar o título cria uma nova atividade em vez de atualizar a existente.

Exemplos de atividades seeded:
- Artigo Publicado
- Palestra em Evento
- Contribuição Open Source (PR Merged)
- Ajuda no Discord/Grupo
- Participação em Meetup
- Post Técnico nas Redes

### `badge/badge-seed.service.ts`
Popula o catálogo com os badges iniciais. Badges são identificados pelo `name` para idempotência.

Exemplos de badges seeded:
- **Primeira Missão** (MILESTONE, AUTOMATIC) — primeira submissão aprovada
- **Contribuidor** (MILESTONE, AUTOMATIC) — 500 XP atingidos
- **Colaborador Ativo** (MILESTONE, AUTOMATIC) — 2.000 XP atingidos
- **Referência** (MILESTONE, AUTOMATIC) — 6.000 XP atingidos
- **Mentor** (MILESTONE, AUTOMATIC) — 15.000 XP atingidos
- **Lenda** (MILESTONE, AUTOMATIC) — 35.000 XP atingidos
- **Destaque do Mês** (RANKING, AUTOMATIC) — top 3 mensal
- **Missão Cumprida** (PARTICIPATION, AUTOMATIC) — primeira missão vencida
- **Badge de Arte** (SPECIAL, MANUAL) — concedido manualmente pelo admin

### `event/event-seed.service.ts`
Popula o catálogo com eventos iniciais da comunidade.

### `gamification-profile/gamification-profile-seed.service.ts`
Cria perfis de gamificação vinculados aos usuários seedados, garantindo que cada user tenha seu perfil com username e carteira inicializados.

### `learning-track/learning-track-seed.service.ts`
Cria trilhas de aprendizado iniciais com suas etapas e marcos, fornecendo conteúdo de exemplo para desenvolvimento.

### `mission/mission-seed.service.ts`
Popula missões iniciais para teste e desenvolvimento.

---

## Em produção

Na primeira execução em produção, execute os seeds logo após as migrations:

```bash
# 1. Rodar migrations
npm run migration:run

# 2. Rodar seeds
npm run seed:run:relational
```

Após o seed inicial, crie as missões "de arte" manualmente pelo painel admin (elas exigem imagens e textos personalizados que não devem estar hardcoded nos seeds).

---

## Adicionando um novo seed

1. Crie o arquivo em `src/database/seeds/<entidade>/<entidade>-seed.service.ts`
2. Implemente o método `run()` com lógica de upsert
3. Registre no módulo `src/database/seeds/seed.module.ts`
4. Adicione à ordem de execução no `run-seed.ts`
5. Documente aqui

---

## Variáveis de ambiente necessárias para seeds em produção

```env
DATABASE_URL=postgresql://...
ADMIN_EMAIL=seu-email-de-admin@dominio.com
ADMIN_PASSWORD=senha-forte-gerada-aleatoriamente
```
