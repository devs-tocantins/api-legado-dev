# Design de API (MVP)

A modelagem RESTful dos endpoints principais que a aplicação do frontend vai consumir.
*(As rotas autênticas exigirão o Bearer JWT nos headers utilizando o fluxo base do NestJS/Passport).*

## 1. Perfil e Painel
Focado nas estatísticas de níveis, conquistas e dashboard do membro.

- `GET /api/v1/gamification-profiles/me` - Retorna os dados do próprio usuário logado (saldo de tokens de gratidão, XP mensal/anual/histórico e Level).
- `GET /api/v1/gamification-profiles/:username` - Retorna o perfil público formatado (Status do rank, badges desbloqueados).

## 2. Atividades (Catálogo Core)
Rotas listando onde o Dev pode engajar para ganhar XP.

- `GET /api/v1/activities` - Retorna o catálogo paginado de atividades não-ocultas (`isHidden: false`).
  - **Query Params:**
    - `page` (number): Página atual (default: 1).
    - `limit` (number): Itens por página (default: 10, max: 50).
    - `search` (string): Busca por texto no título ou descrição.
    - `view` ('card' | 'list'): Define se retorna o objeto completo (`list`) ou resumido para cards (`card`).
- `GET /api/v1/activities/hidden/:secretCode` - Rota usada por QR Codes para desbloquear/iniciar atividades ocultas de eventos no app.
- `POST /api/v1/activities` **[ROLES: ADMIN]** - Cadastro de nova regra/missão fixa.

## 3. Missões (Missions)
Eventos especiais e desafios com tempo limitado.

- `GET /api/v1/missions` - Retorna missões abertas. Suporta os mesmos query params de paginação e busca (`page`, `limit`, `search`, `view`).
- `GET /api/v1/missions/admin/all` **[ROLES: ADMIN]** - Listagem completa de missões para gestão. Suporta paginação e busca.

## 4. Submissão (Ação do Usuário)
O ciclo do usuário solicitando a validação de uma tarefa ou check-in.

- `POST /api/v1/submissions` - Body: `{ activityId, proofUrl? }`. Cria status `PENDING`. Se a atividade de check-in for imediata (sem prova), pode ser aprovada de forma síncrona/imediata.
- `GET /api/v1/submissions/me` - Listagem e histórico de submissões do usuário atual (aba "Minhas Solicitações").

## 4. Auditoria (Painel da Moderação)
Fluxo administrativo onde moderadores garantem a qualidade e ganham XP automático por auditar.

- `GET /api/v1/submissions/pending` **[ROLES: MODERATOR]** - Fila de auditoria global com paginação, omitindo requisições do próprio moderador logado.
- `POST /api/v1/submissions/:id/review` **[ROLES: MODERATOR]** - Body: `{ status: 'APPROVED'|'REJECTED', awardedXp: number, feedback?: string }`. Muda o status, credita os pontos ao dev, e credita pontos automáticos ao moderador.

## 5. Economia P2P e Extrato
Gestão dos "Tokens de Gratidão" e histórico de pontos (prova real de tudo o que aconteceu).

- `GET /api/v1/transactions/me` - Retorna o log de movimentações (Extrato do que ganhou e do que doou no mês).
- `POST /api/v1/gamification-profiles/transfer` - Body: `{ toUsername, amount, feedbackMessage }`. Envia "Tokens de Gratidão" transferindo parte da cota mensal do usuário A para virar XP real no usuário B.

## 6. Rankings Competitivos
Consultas rápidas e cacheáveis para a Gamificação pública.

- `GET /api/v1/rankings/monthly` (Filtra ordenando por `currentMonthlyXp`)
- `GET /api/v1/rankings/yearly` (Filtra ordenando por `currentYearlyXp`)
- `GET /api/v1/rankings/global` (Top Histórico usando `totalXp` e o `Level` correspondente)
