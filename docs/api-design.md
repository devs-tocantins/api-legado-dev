# Design de API (legado.dev)

Mapeamento dos endpoints REST da plataforma, organizados por módulo.
*(As rotas autenticadas exigem Bearer JWT nos headers utilizando o fluxo base do NestJS/Passport).*

---

## 1. Autenticação (`/api/v1/auth`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/auth/email/register` | Cadastro com e-mail e senha |
| POST | `/api/v1/auth/email/login` | Login com e-mail e senha |
| POST | `/api/v1/auth/email/confirm` | Confirma e-mail via token |
| POST | `/api/v1/auth/email/confirm/new` | Confirma novo e-mail (troca) |
| POST | `/api/v1/auth/forgot/password` | Solicita reset de senha |
| POST | `/api/v1/auth/reset/password` | Reseta senha com token |
| GET | `/api/v1/auth/me` | Dados do usuário logado [Auth] |
| PATCH | `/api/v1/auth/me` | Atualiza dados do usuário logado [Auth] |
| DELETE | `/api/v1/auth/me` | Exclui conta do usuário logado [Auth] |
| POST | `/api/v1/auth/refresh` | Renova JWT com refresh token |
| POST | `/api/v1/auth/logout` | Encerra sessão [Auth] |
| POST | `/api/v1/auth/google/login` | Login social via Google |
| POST | `/api/v1/auth/github/login` | Login social via GitHub |

---

## 2. Perfil de Gamificação (`/api/v1/gamification-profiles`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/gamification-profiles` | Cria perfil [Admin] |
| GET | `/api/v1/gamification-profiles` | Lista todos os perfis |
| GET | `/api/v1/gamification-profiles/me` | Perfil do usuário logado [Auth] |
| PATCH | `/api/v1/gamification-profiles/me` | Atualiza perfil próprio [Auth] |
| GET | `/api/v1/gamification-profiles/check-username/:username` | Verifica disponibilidade de username |
| GET | `/api/v1/gamification-profiles/by-username/:username` | Busca perfil público por username |
| GET | `/api/v1/gamification-profiles/:id` | Busca perfil por ID |
| PATCH | `/api/v1/gamification-profiles/:id` | Atualiza perfil [Admin] |
| GET | `/api/v1/gamification-profiles/:id/approved-submissions` | Submissões aprovadas do perfil |
| POST | `/api/v1/gamification-profiles/:id/penalty` | Aplica penalidade [Admin] |
| DELETE | `/api/v1/gamification-profiles/:id` | Remove perfil [Admin] |
| POST | `/api/v1/gamification-profiles/transfer` | Transfere tokens de gratidão [Auth] |

---

## 3. Atividades (`/api/v1/activities`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/activities` | Cria atividade [Admin] |
| GET | `/api/v1/activities` | Lista catálogo público de atividades |
| GET | `/api/v1/activities/all` | Lista todas (incluindo ocultas) [Admin/Mod] |
| GET | `/api/v1/activities/:id` | Detalhe de atividade |
| PATCH | `/api/v1/activities/:id` | Atualiza atividade [Admin] |
| DELETE | `/api/v1/activities/:id` | Remove atividade [Admin] |

---

## 4. Submissões (`/api/v1/submissions`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/submissions` | Cria submissão [Auth] |
| POST | `/api/v1/submissions/redeem` | Resgata código secreto [Auth] |
| GET | `/api/v1/submissions/me` | Minhas submissões [Auth] |
| GET | `/api/v1/submissions/pending` | Fila de auditoria [Admin/Mod] |
| GET | `/api/v1/submissions` | Lista todas as submissões [Admin/Mod] |
| GET | `/api/v1/submissions/:id/public` | Detalhe público de submissão |
| GET | `/api/v1/submissions/:id` | Detalhe de submissão [Auth] |
| PATCH | `/api/v1/submissions/:id/review` | Revisa submissão [Admin/Mod] |
| PATCH | `/api/v1/submissions/:id` | Atualiza submissão [Admin] |
| DELETE | `/api/v1/submissions/:id/cancel` | Cancela submissão própria [Auth] |
| DELETE | `/api/v1/submissions/:id` | Remove submissão [Admin] |

---

## 5. Transações (`/api/v1/transactions`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/transactions` | Cria transação manual [Admin] |
| GET | `/api/v1/transactions/me` | Extrato do usuário logado [Auth] |
| GET | `/api/v1/transactions` | Lista todas [Admin] |
| GET | `/api/v1/transactions/:id` | Detalhe de transação [Admin] |
| PATCH | `/api/v1/transactions/:id` | Atualiza transação [Admin] |
| DELETE | `/api/v1/transactions/:id` | Remove transação [Admin] |

---

## 6. Badges (`/api/v1/badges`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/badges` | Cria badge [Admin] |
| GET | `/api/v1/badges` | Lista badges ativos (público) |
| GET | `/api/v1/badges/all` | Lista todos os badges [Admin] |
| GET | `/api/v1/badges/profile/:profileId` | Badges de um perfil (público) |
| PATCH | `/api/v1/badges/:id` | Atualiza badge [Admin] |
| DELETE | `/api/v1/badges/:id` | Remove badge [Admin] |
| POST | `/api/v1/badges/grant` | Concede badge manualmente [Admin] |

---

## 7. Missões (`/api/v1/missions`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/missions` | Cria missão [Admin] |
| GET | `/api/v1/missions` | Lista missões abertas (público) |
| GET | `/api/v1/missions/admin/all` | Lista todas as missões [Admin/Mod] |
| GET | `/api/v1/missions/:id` | Detalhe de missão |
| PATCH | `/api/v1/missions/:id` | Atualiza missão [Admin] |
| DELETE | `/api/v1/missions/:id` | Remove missão [Admin] |
| POST | `/api/v1/missions/:id/submit` | Submete para missão [Auth] |
| GET | `/api/v1/missions/:id/my-submission` | Minha submissão na missão [Auth] |
| GET | `/api/v1/missions/:id/submissions` | Lista submissões da missão [Admin/Mod] |
| PATCH | `/api/v1/missions/:id/submissions/:submissionId/review` | Revisa submissão de missão [Admin/Mod] |

---

## 8. Trilhas de Aprendizado (`/api/v1/learning-tracks`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/learning-tracks` | Cria trilha [Admin/Mod] |
| GET | `/api/v1/learning-tracks` | Lista trilhas [Auth] |
| GET | `/api/v1/learning-tracks/:id` | Detalhe de trilha [Auth] |
| GET | `/api/v1/learning-tracks/:id/overview` | Visão geral com seções e marcos [Auth] |
| GET | `/api/v1/learning-tracks/:id/progress` | Progresso do usuário na trilha [Auth] |
| PATCH | `/api/v1/learning-tracks/:id` | Atualiza trilha [Admin/Mod] |
| DELETE | `/api/v1/learning-tracks/:id` | Remove trilha [Admin/Mod] |

---

## 9. Etapas de Trilha (`/api/v1/track-sections`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/track-sections` | Cria etapa [Admin/Mod] |
| GET | `/api/v1/track-sections` | Lista etapas [Auth] |
| GET | `/api/v1/track-sections/:id` | Detalhe de etapa [Auth] |
| PATCH | `/api/v1/track-sections/:id` | Atualiza etapa [Admin/Mod] |
| DELETE | `/api/v1/track-sections/:id` | Remove etapa [Admin/Mod] |

---

## 10. Marcos de Trilha (`/api/v1/track-items`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/track-items` | Cria marco [Admin/Mod] |
| GET | `/api/v1/track-items` | Lista marcos [Auth] |
| GET | `/api/v1/track-items/:id` | Detalhe de marco [Auth] |
| POST | `/api/v1/track-items/:id/complete` | Completa marco automaticamente [Auth] |
| PATCH | `/api/v1/track-items/:id` | Atualiza marco [Admin/Mod] |
| DELETE | `/api/v1/track-items/:id` | Remove marco [Admin/Mod] |

---

## 11. Matrículas em Trilhas (`/api/v1/track-enrollments`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/track-enrollments` | Matricula na trilha [Auth] |
| GET | `/api/v1/track-enrollments` | Lista matrículas do usuário [Auth] |
| GET | `/api/v1/track-enrollments/:id` | Detalhe de matrícula [Auth] |
| DELETE | `/api/v1/track-enrollments/:id` | Remove matrícula [Auth] |

---

## 12. Conclusões de Marco (`/api/v1/track-item-completions`)

| Método | Path | Propósito |
|--------|------|-----------|
| GET | `/api/v1/track-item-completions` | Lista conclusões do usuário [Auth] |
| GET | `/api/v1/track-item-completions/:id` | Detalhe de conclusão [Auth] |

---

## 13. Sugestões de Trilha (`/api/v1/track-suggestions`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/track-suggestions` | Envia sugestão [Auth] |
| GET | `/api/v1/track-suggestions` | Lista sugestões [Admin/Mod] |
| PATCH | `/api/v1/track-suggestions/:id/review` | Marca como revisada [Admin/Mod] |

---

## 14. Eventos (`/api/v1/events`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/events` | Cria evento [Auth] |
| GET | `/api/v1/events` | Lista eventos aprovados e futuros (público) |
| GET | `/api/v1/events/mine` | Meus eventos [Auth] |
| GET | `/api/v1/events/pending` | Eventos pendentes de revisão [Admin/Mod] |
| GET | `/api/v1/events/all` | Lista todos os eventos [Admin/Mod] |
| GET | `/api/v1/events/:id` | Detalhe do evento (público) |
| GET | `/api/v1/events/:id/manage` | Detalhe para gestão [Auth] |
| GET | `/api/v1/events/:id/ics` | Download arquivo ICS (calendário) |
| POST | `/api/v1/events/:id/subscribe` | Inscrição no evento [Auth] |
| DELETE | `/api/v1/events/:id/subscribe` | Cancela inscrição [Auth] |
| GET | `/api/v1/events/:id/subscription` | Verifica inscrição do usuário [Auth] |
| PATCH | `/api/v1/events/:id/cancel` | Cancela evento [Auth] |
| PATCH | `/api/v1/events/:id/review` | Revisa evento [Admin/Mod] |
| PATCH | `/api/v1/events/:id` | Atualiza evento [Auth] |
| DELETE | `/api/v1/events/:id` | Remove evento [Admin] |

---

## 15. Cursos (`/api/v1/courses`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/courses` | Submete novo curso [Auth] |
| GET | `/api/v1/courses` | Lista cursos verificados [Auth] |
| GET | `/api/v1/courses/pending` | Cursos pendentes de verificação [Admin/Mod] |
| GET | `/api/v1/courses/:id` | Detalhe do curso [Auth] |
| PATCH | `/api/v1/courses/:id/review` | Revisa curso [Admin/Mod] |
| PATCH | `/api/v1/courses/:id` | Atualiza curso [Auth] |
| DELETE | `/api/v1/courses/:id` | Remove curso [Auth] |

---

## 16. Avaliações de Cursos (`/api/v1/course-reviews`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/course-reviews` | Cria avaliação [Auth] |
| GET | `/api/v1/course-reviews` | Lista avaliações [Auth] |
| GET | `/api/v1/course-reviews/by-course/:courseId` | Avaliações de um curso [Auth] |
| GET | `/api/v1/course-reviews/my-review/:courseId` | Minha avaliação de um curso [Auth] |
| GET | `/api/v1/course-reviews/:id` | Detalhe de avaliação [Auth] |
| PATCH | `/api/v1/course-reviews/:id` | Atualiza avaliação [Auth] |
| DELETE | `/api/v1/course-reviews/:id` | Remove avaliação [Auth] |

---

## 17. Ranking Snapshots (`/api/v1/ranking-snapshots`)

| Método | Path | Propósito |
|--------|------|-----------|
| GET | `/api/v1/ranking-snapshots/champion` | Campeão de um período (query: `type=monthly`) |
| GET | `/api/v1/ranking-snapshots/profile/:profileId` | Histórico de posições de um perfil |

---

## 18. Notificações (`/api/v1/notifications`)

| Método | Path | Propósito |
|--------|------|-----------|
| GET | `/api/v1/notifications` | Lista notificações do usuário [Auth] |
| GET | `/api/v1/notifications/unread-count` | Contagem de não-lidas [Auth] |
| PATCH | `/api/v1/notifications/read-all` | Marca todas como lidas [Auth] |
| PATCH | `/api/v1/notifications/:id/read` | Marca uma como lida [Auth] |
| GET | `/api/v1/notifications/preferences` | Preferências de notificação [Auth] |
| PATCH | `/api/v1/notifications/preferences` | Atualiza preferências [Auth] |

---

## 19. Denúncias de Contribuição (`/api/v1/contribution-reports`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/contribution-reports` | Denuncia submissão [Auth] |
| GET | `/api/v1/contribution-reports/admin/pending` | Denúncias pendentes [Admin/Mod] |
| GET | `/api/v1/contribution-reports/admin/all` | Todas as denúncias [Admin/Mod] |
| PATCH | `/api/v1/contribution-reports/admin/:id/review` | Revisa denúncia [Admin/Mod] |

---

## 20. WhatsApp Admin (`/api/v1/whatsapp/admin`)

| Método | Path | Propósito |
|--------|------|-----------|
| GET | `/api/v1/whatsapp/admin/status` | Status da conexão WhatsApp [Admin] |
| GET | `/api/v1/whatsapp/admin/qrcode` | QR Code para vincular dispositivo [Admin] |
| POST | `/api/v1/whatsapp/admin/logout` | Desconecta sessão WhatsApp [Admin] |
| POST | `/api/v1/whatsapp/admin/send-test` | Envia mensagem de teste [Admin] |

---

## 21. Portfólio de Provas (`/api/v1/profile-portfolio`)

| Método | Path | Propósito |
|--------|------|-----------|
| GET | `/api/v1/profile-portfolio/:profileId` | Portfólio público de provas do perfil |

---

## 22. Upload de Arquivos (`/api/v1/files`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/files/upload` | Upload de arquivo [Auth] |

---

## 23. Usuários Admin (`/api/v1/users`)

| Método | Path | Propósito |
|--------|------|-----------|
| POST | `/api/v1/users` | Cria usuário [Admin] |
| GET | `/api/v1/users` | Lista usuários [Admin] |
| GET | `/api/v1/users/:id` | Detalhe de usuário [Admin] |
| PATCH | `/api/v1/users/:id` | Atualiza usuário [Admin] |
| DELETE | `/api/v1/users/:id` | Remove usuário [Admin] |

---

## 24. Admin Métricas (`/api/v1/admin`)

| Método | Path | Propósito |
|--------|------|-----------|
| GET | `/api/v1/admin/metrics` | Métricas gerais da plataforma [Admin] |
| GET | `/api/v1/admin/health` | Health check administrativo [Admin] |

---

## 25. Health Check (raiz)

| Método | Path | Propósito |
|--------|------|-----------|
| GET | `/` | Info geral da aplicação |
| GET | `/healthz` | Health check (deploy/monitoramento) |
