# Times de Projetos

Módulo `src/project-teams`: membros propõem ideias de projeto, a moderação aprova, outros membros demonstram interesse em vagas e o autor forma o time.

## Fluxo

1. Membro cria uma ideia (`POST /v1/project-ideas`) — status `PENDING`.
2. Moderador/admin revisa (`PATCH /v1/project-ideas/:id/review`) — `APPROVED` ou `REJECTED` (com motivo). O autor é notificado.
3. Membros marcam interesse em um cargo (`PUT /v1/project-ideas/:id/interest`); o autor vê os interessados e as vagas sugeridas (`GET /v1/project-ideas/:id/suggested-vacancies`).
4. O autor cria o time (`POST /v1/project-teams`) e adiciona membros (`POST /v1/project-teams/:id/members`) — a ideia passa para `TEAM_FORMED`.

## Endpoints

- `project-ideas`: criar, listar, `mine`, `pending`, detalhe, `:id/manage`, `:id/review`, editar, excluir, `:id/interest` (PUT/DELETE/GET), `:id/interests`, `:id/suggested-vacancies`.
- `project-teams`: criar, listar, `mine`, detalhe, editar, `:id/members` (POST), `:id/members/:userId` (DELETE).

## Banco

Migration `CreateProjectTeams`: tabelas `project_idea`, `project_idea_interest`, `project_team`, `project_team_member`, `project_team_vacancy`, enums de papel/status e novos tipos de notificação (`PROJECT_IDEA_APPROVED`, `PROJECT_IDEA_REJECTED`, `PROJECT_IDEA_INTEREST`, `PROJECT_TEAM_MEMBER_ADDED`). Roda automaticamente na subida do container (`migration:run:prod`).
