  Legado.dev — Documento de User Stories
  Última atualização: 2026-04-18 (Milestone 6 — sistema completo em dev)

  ─────────────────────────────────────────────────────────────────────────────
  Personas
  ─────────────────────────────────────────────────────────────────────────────

  ┌────────────────┬────────────────────────────────────────────────────────┐
  │    Persona     │                         Quem é                         │
  ├────────────────┼────────────────────────────────────────────────────────┤
  │ Herói          │ Desenvolvedor/membro da comunidade que realiza ações   │
  │ Silencioso     │ voluntárias e acumula XP pela sua contribuição         │
  ├────────────────┼────────────────────────────────────────────────────────┤
  │ Auditor        │ Moderador responsável por validar submissões de        │
  │                │ atividades e escolher vencedores de missões            │
  ├────────────────┼────────────────────────────────────────────────────────┤
  │ Guardião       │ Administrador com acesso total ao sistema              │
  ├────────────────┼────────────────────────────────────────────────────────┤
  │ Visitante      │ Qualquer pessoa que acessa a plataforma sem conta      │
  └────────────────┴────────────────────────────────────────────────────────┘

  ─────────────────────────────────────────────────────────────────────────────
  ÉPICO 1 — Identidade e Acesso
  ─────────────────────────────────────────────────────────────────────────────

  US-01 — Cadastro na Plataforma                                    [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero criar uma conta na plataforma com e-mail e senha,
  Para que eu possa começar a registrar minhas contribuições e construir meu
  legado público na comunidade.

  Critérios de Aceite:
  - O formulário exige nome, sobrenome, e-mail válido e senha com mínimo de
    segurança.
  - Após o cadastro, o sistema envia um e-mail de confirmação.
  - Enquanto o e-mail não for confirmado, o login é bloqueado com aviso claro.
  - Um GamificationProfile é criado automaticamente após a confirmação de
    e-mail, com totalXp = 0 e gratitudeTokens = 5.
  - O usuário escolhe um @username único. Se já existir, sistema rejeita com
    409 Conflict.
  - Usuários banidos (isBanned: true) têm login bloqueado com mensagem "conta
    banida".

  Notas Técnicas:
  - Rotas: POST /api/v1/auth/email/register, POST /api/v1/auth/email/confirm
  - Entidades: User, GamificationProfile
  - GamificationProfile criado no evento pós-confirmação de e-mail.

  ---
  US-02 — Login com E-mail e Senha                                  [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero fazer login com meu e-mail e senha,
  Para que eu possa acessar meu painel, submeter atividades e acompanhar minha
  pontuação.

  Critérios de Aceite:
  - O sistema retorna um accessToken (JWT, 15 min) e um refreshToken.
  - Credenciais inválidas retornam 401 com mensagem genérica.
  - Login com conta banida retorna mensagem explícita de banimento.
  - Login com e-mail não confirmado retorna erro orientando o reenvio.

  Notas Técnicas:
  - Rota: POST /api/v1/auth/email/login
  - JWT stateless; Session armazenada no BD para o refreshToken.

  ---
  US-03 — Login Social (Google)                                     [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero entrar na plataforma usando minha conta Google,
  Para que eu não precise criar e lembrar mais uma senha.

  Critérios de Aceite:
  - O sistema aceita o token Google e retorna um JWT interno.
  - Primeiro acesso cria User e GamificationProfile automaticamente.
  - O usuário é solicitado a escolher um @username no primeiro acesso.
  - Logins sociais do mesmo e-mail são vinculados à mesma conta.

  Notas Técnicas:
  - Rota: POST /api/v1/auth/google/login
  - Requer GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env.

  ---
  US-04 — Renovação de Sessão (Refresh Token)                       [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero que minha sessão seja renovada automaticamente,
  Para que eu não seja deslogado no meio de uma submissão.

  Critérios de Aceite:
  - O cliente chama a rota de refresh com o refreshToken válido.
  - O sistema retorna novo par accessToken + refreshToken.
  - RefreshToken inválido retorna 401 e redireciona ao login.
  - RefreshToken é invalidado após uso (rotação de tokens).

  Notas Técnicas:
  - Rota: POST /api/v1/auth/refresh
  - Session atualizada no BD com o novo hash.

  ---
  US-05 — Logout Seguro                                             [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero fazer logout da minha conta de forma segura.

  Critérios de Aceite:
  - A Session é invalidada no BD imediatamente.
  - O accessToken ainda funciona pelos minutos restantes (limitação JWT
    stateless), mas o refreshToken morre imediatamente.

  Notas Técnicas:
  - Rota: DELETE /api/v1/auth/logout

  ---
  US-06 — Recuperação de Senha                                      [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero recuperar o acesso à minha conta caso esqueça minha senha.

  Critérios de Aceite:
  - O usuário informa o e-mail e recebe um link de redefinição com validade de
    30 minutos.
  - O link é de uso único.
  - E-mail não cadastrado retorna mensagem genérica (sem confirmar existência).

  Notas Técnicas:
  - Rotas: POST /api/v1/auth/forgot/password, POST /api/v1/auth/reset/password

  ---
  US-07 — Edição de Perfil Pessoal                                  [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero editar meus dados de perfil (@username, avatar, GitHub, banner),
  Para que minha vitrine pública reflita quem sou.

  Critérios de Aceite:
  - O usuário pode alterar: nome, sobrenome, foto de avatar, @username, GitHub
    username e banner preset.
  - Se o @username escolhido já existir, o sistema rejeita com 409 Conflict.
  - O upload de avatar gera URL pública via R2 (S3-compatible).
  - Alterações refletem imediatamente no perfil público /u/:username.
  - O banner preset é uma string de identificador (ex: "default", "dark").

  Notas Técnicas:
  - Rota: PATCH /api/v1/auth/me (User) + PATCH /api/v1/gamification-profiles/me
  - Upload: POST /api/v1/files/upload (S3 presigned URL)
  - GET /api/v1/gamification-profiles/check-username/:username para verificar
    disponibilidade em tempo real (retorna { available: boolean }).

  ─────────────────────────────────────────────────────────────────────────────
  ÉPICO 2 — Catálogo de Atividades
  ─────────────────────────────────────────────────────────────────────────────

  US-08 — Visualização do Catálogo Público de Atividades            [✅ FEITO]

  Como um Herói Silencioso ou Visitante,
  Eu quero ver a lista de atividades disponíveis para pontuar,
  Para que eu saiba exatamente quais contribuições são reconhecidas e quanto XP
  cada uma vale.

  Critérios de Aceite:
  - O catálogo é público (sem autenticação).
  - Apenas atividades com isHidden: false aparecem.
  - Cada item exibe: título, descrição (renderizada em markdown), XP
    (fixedReward), se exige comprovante, cooldown e se exige descrição.
  - Busca textual por título/descrição disponível.

  Notas Técnicas:
  - Rota: GET /api/v1/activities
  - Descrições suportam markdown; frontend renderiza com MarkdownContent.
  - Atividades cadastradas por seed inicial:
      · Contribuição de Código — Resolver uma Issue (100 XP, 24h cooldown)
      · Reporte de Bug ou Melhoria — legado.dev (50 XP, sem cooldown)
      · Participação em Evento (75 XP, 168h cooldown)
      · Resposta Técnica no Fórum (30 XP, 12h cooldown)
      · Publicação de Artigo (150 XP, 72h cooldown)
      · Indicação de Membro (50 XP, sem cooldown)

  ---
  US-09 — Acesso a Atividade Oculta (QR Code / Link Secreto)        [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero acessar uma atividade oculta via secretCode distribuído em evento,
  Para que minha presença física no evento seja registrada.

  Critérios de Aceite:
  - O link/QR Code contém o secretCode único da atividade.
  - Ao acessar com secretCode válido, a atividade oculta é retornada.
  - SecretCode inexistente retorna 404.
  - O secretCode não aparece no catálogo público.

  Notas Técnicas:
  - Rota: GET /api/v1/activities/hidden/:secretCode

  ---
  US-10 — Cadastro de Nova Atividade (Admin)                        [✅ FEITO]

  Como um Guardião,
  Eu quero cadastrar novas atividades no catálogo,
  Para que a comunidade tenha sempre contribuições reconhecidas atualizadas.

  Critérios de Aceite:
  - Campos: título, descrição (markdown), XP, exige comprovante, exige
    descrição (requiresDescription), cooldown em horas, oculta e secretCode.
  - Campos obrigatórios validados: título, fixedReward > 0, cooldownHours >= 0.
  - Descrições escritas com suporte a markdown no editor do painel admin.
  - Acesso restrito: apenas admin.

  Notas Técnicas:
  - Rota: POST /api/v1/activities
  - Frontend: editor com toggle Editar/Preview (MarkdownEditor).

  ---
  US-11 — Edição e Exclusão de Atividade (Admin)                    [✅ FEITO]

  Como um Guardião,
  Eu quero editar ou excluir uma atividade do catálogo.

  Critérios de Aceite:
  - Qualquer campo pode ser editado, inclusive a descrição em markdown.
  - Alterar o fixedReward não retroage submissões já aprovadas.
  - Exclusão remove a atividade do catálogo sem apagar o histórico.

  Notas Técnicas:
  - Rotas: PATCH /api/v1/activities/:id, DELETE /api/v1/activities/:id

  ---
  US-12 — Listagem Completa de Atividades (Admin)                   [✅ FEITO]

  Como um Guardião,
  Eu quero ver todas as atividades, incluindo as ocultas,
  Para que eu possa gerenciar o catálogo completo.

  Notas Técnicas:
  - Rota: GET /api/v1/activities/all (inclui isHidden: true)
  - Frontend: painel admin /admin-panel/activities com botão de voltar.

  ─────────────────────────────────────────────────────────────────────────────
  ÉPICO 3 — Submissão de Atividades
  ─────────────────────────────────────────────────────────────────────────────

  US-13 — Submissão de Atividade                                    [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero submeter uma atividade que realizei,
  Para que minha contribuição seja revisada e meus XP sejam creditados.

  Critérios de Aceite:
  - O usuário seleciona a atividade e preenche:
      · Comprovante (arquivo JPG/PNG/GIF até 5MB) se requiresProof: true
      · Descrição em markdown (campo com editor Editar/Preview) se
        requiresDescription: true
      · Ambos os campos são opcionais quando a atividade não exige
  - A descrição é sanitizada (apenas ASCII imprimível + Latin Extended;
    emojis e Unicode especial são removidos). Limite: 2000 caracteres.
  - A submissão é criada com status: PENDING.
  - O sistema verifica cooldown: mesma atividade dentro de cooldownHours
    retorna 429 Too Many Requests.
  - A submissão aparece em "Minhas Submissões" com status PENDENTE.

  Notas Técnicas:
  - Rota: POST /api/v1/submissions
  - Upload: POST /api/v1/files/upload (presigned URL para R2)
  - Descrição renderizada em markdown na fila de moderação.

  ---
  US-14 — Check-in em Evento (Atividade sem Prova)                  [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero fazer check-in em evento via QR Code sem enviar comprovante,
  Para que minha presença seja registrada de forma rápida.

  Critérios de Aceite:
  - Atividades com requiresProof: false aceitam submissão sem comprovante.
  - Cooldown ainda se aplica.
  - A submissão passa por moderação normalmente (status: PENDING).

  Notas Técnicas:
  - Rota: POST /api/v1/submissions (mesmo endpoint)

  ---
  US-15 — Histórico de Submissões Pessoais                          [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero ver todas as minhas submissões com seus status,
  Para que eu acompanhe o que está pendente e o feedback dos Auditores.

  Critérios de Aceite:
  - Exibe: atividade, data, status (PENDING/APPROVED/REJECTED), XP recebido
    e feedback do Auditor quando houver.
  - Apenas as próprias submissões (isolamento por JWT).
  - Paginada, ordenada por data decrescente.

  Notas Técnicas:
  - Rota: GET /api/v1/submissions/me
  - Frontend: página /submissions.

  ─────────────────────────────────────────────────────────────────────────────
  ÉPICO 4 — Moderação e Auditoria
  ─────────────────────────────────────────────────────────────────────────────

  US-16 — Fila de Moderação de Atividades                           [✅ FEITO]

  Como um Auditor,
  Eu quero ver todas as submissões de atividades pendentes de revisão,
  Para que eu processe as solicitações dos membros.

  Critérios de Aceite:
  - Exibe: @username, atividade, comprovante (link), descrição (renderizada em
    markdown), data de submissão.
  - Ordenada por data crescente (FIFO).
  - As próprias submissões do Auditor logado não aparecem na fila.
  - Acesso restrito: admin e moderator.

  Notas Técnicas:
  - Rota: GET /api/v1/submissions/pending
  - Frontend: aba "Atividades" em /moderation.

  ---
  US-17 — Aprovação de Submissão                                    [✅ FEITO]

  Como um Auditor,
  Eu quero aprovar uma submissão,
  Para que o Herói seja recompensado pelo esforço comprovado.

  Critérios de Aceite:
  - Ao aprovar: status → APPROVED; o awardedXp (igual ao fixedReward da
    atividade) é creditado em totalXp, currentMonthlyXp e currentYearlyXp.
  - Uma Transaction com category: XP_REWARD é gerada no extrato do aprovado.
  - O Auditor recebe automaticamente 10 XP como recompensa de auditoria
    (Transaction category: AUDITOR_REWARD no extrato do Auditor).
  - Tudo em uma única transação ACID.
  - O BadgeEvaluatorService é acionado assincronamente após a aprovação para
    verificar se novos badges foram desbloqueados.

  Notas Técnicas:
  - Rota: PATCH /api/v1/submissions/:id/review
  - Body: { status: 'APPROVED' }

  ---
  US-18 — Rejeição de Submissão com Feedback                        [✅ FEITO]

  Como um Auditor,
  Eu quero rejeitar uma submissão e informar o motivo ao membro.

  Critérios de Aceite:
  - Feedback é obrigatório ao rejeitar.
  - Nenhum XP é concedido ao membro rejeitado.
  - O Auditor recebe os 10 XP de recompensa de auditoria mesmo em rejeições.
  - O membro visualiza o feedback na tela de histórico pessoal.

  Notas Técnicas:
  - Rota: PATCH /api/v1/submissions/:id/review
  - Body: { status: 'REJECTED', feedback: '...' }

  ---
  US-19 — Penalidade Administrativa (Débito de XP)                  [✅ FEITO]

  Como um Guardião,
  Eu quero debitar XP de um perfil em casos de abuso comprovado,
  Para que a economia do ranking seja justa e fraudes sejam revertidas com
  rastreabilidade.

  Critérios de Aceite:
  - O Guardião acessa o perfil na listagem admin, clica em "Penalizar" e
    preenche: amount (XP a debitar, mínimo 1) e reason (motivo, obrigatório,
    até 300 caracteres).
  - O painel exibe o XP atual e o XP resultante em tempo real antes de
    confirmar.
  - O XP é subtraído de totalXp, currentMonthlyXp e currentYearlyXp
    (mínimo 0, sem valores negativos).
  - Uma Transaction com category: PENALTY, amount negativo e reason prefixado
    com "[Admin #ID]" é gerada no extrato do penalizado.
  - Apenas admin pode executar esta ação.
  - A tabela de perfis é atualizada automaticamente após a penalidade.

  Notas Técnicas:
  - Rota: POST /api/v1/gamification-profiles/:id/penalty
  - Body: { amount: number, reason: string }
  - Frontend: modal acessível pelo botão "Penalizar" na tabela de perfis.

  ─────────────────────────────────────────────────────────────────────────────
  ÉPICO 5 — Economia P2P (Tokens de Gratidão)
  ─────────────────────────────────────────────────────────────────────────────

  US-20 — Transferência de Token de Gratidão                        [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero enviar Tokens de Gratidão para um colega que me ajudou,
  Para que ele seja reconhecido com XP de forma imediata, sem moderação.

  Critérios de Aceite:
  - O usuário informa: @username do destinatário, amount e mensagem opcional.
  - Saldo insuficiente retorna 400 com mensagem de saldo.
  - Não é possível enviar tokens para si mesmo.
  - Transferência imediata e atômica (ACID):
      · Tokens debitados do remetente (gratitudeTokens decrementa)
      · XP creditado no destinatário em totalXp, currentMonthlyXp e
        currentYearlyXp (1 Token = 1 XP)
  - Duas Transaction geradas: TOKEN_TRANSFER (remetente, negativo) e
    TOKEN_REWARD (destinatário, positivo).
  - O BadgeEvaluatorService avalia badges do remetente após a transferência
    (critério tokens_sent).

  Notas Técnicas:
  - Rota: POST /api/v1/gamification-profiles/transfer
  - GET /api/v1/gamification-profiles?search=<termo> para buscar destinatário.
  - Frontend: página /transactions com combobox de busca por @username.

  ---
  US-21 — Consulta de Saldo e Extrato de Tokens                     [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero ver meu saldo de Tokens de Gratidão e o histórico de movimentações.

  Critérios de Aceite:
  - Exibe saldo atual de gratitudeTokens e data de renovação (dia 1 do mês).
  - Extrato lista todas as Transaction: tipo, valor (+/-), data e descrição.
  - Valores positivos e negativos visualmente diferenciados.
  - Paginado, decrescente por data.

  Notas Técnicas:
  - Rota: GET /api/v1/transactions/me
  - Frontend: página /transactions.

  ---
  US-22 — Renovação Automática Mensal de Tokens e Reset do Ranking  [✅ FEITO]

  Como um sistema,
  No dia 1 de cada mês, eu reseto tokens e ranking mensal automaticamente.

  Critérios de Aceite:
  - Todos os gratitudeTokens são renovados para 5 (não acumulam).
  - O currentMonthlyXp de todos os perfis é zerado.
  - Tokens não usados do mês anterior são perdidos.
  - O currentYearlyXp é zerado apenas no dia 1 de janeiro.

  Notas Técnicas:
  - CronJob via @nestjs/schedule.
  - UPDATE em massa via QueryBuilder (não gera Transaction individual).

  ─────────────────────────────────────────────────────────────────────────────
  ÉPICO 6 — Rankings e Vitrine Pública
  ─────────────────────────────────────────────────────────────────────────────

  US-23 — Ranking Mensal                                            [✅ FEITO]

  Como um Visitante ou Herói Silencioso,
  Eu quero ver o ranking dos membros mais ativos do mês.

  Critérios de Aceite:
  - Top 50 por currentMonthlyXp decrescente.
  - Exibe: posição, @username, nível atual e XP do mês.
  - Público. Reiniciado dia 1 de cada mês.
  - Usuários banidos são filtrados do ranking.

  Notas Técnicas:
  - Rota: GET /api/v1/gamification-profiles?sort=currentMonthlyXp:DESC
  - Frontend: página /leaderboard aba "Mensal".

  ---
  US-24 — Ranking Anual                                             [✅ FEITO]

  Como um Visitante ou Herói Silencioso,
  Eu quero ver o ranking de membros mais comprometidos no ano.

  Critérios de Aceite:
  - Top 50 por currentYearlyXp decrescente.
  - Reiniciado dia 1 de janeiro via CronJob.

  Notas Técnicas:
  - Frontend: aba "Anual" em /leaderboard.

  ---
  US-25 — Hall da Fama (Ranking Global)                             [✅ FEITO]

  Como um Visitante,
  Eu quero ver o ranking de todos os tempos da plataforma.

  Critérios de Aceite:
  - Top 50 por totalXp decrescente. Nunca zerado.
  - Exibe nível atual (calculado pelo frontend com base nos thresholds).

  Notas Técnicas:
  - Frontend: aba "Geral" em /leaderboard.

  ---
  US-26 — Perfil Público do Herói (Vitrine Comunitária)             [✅ FEITO]

  Como um Visitante,
  Eu quero visualizar o perfil público de um membro pelo @username,
  Para que eu conheça seu histórico de contribuições.

  Critérios de Aceite:
  - Exibe: avatar, nome, @username, GitHub, nível (com barra de progresso),
    totalXp, currentMonthlyXp, badges conquistadas agrupadas por categoria
    (MILESTONE → RANKING → PARTICIPATION → SPECIAL), e as 10 últimas
    submissões aprovadas.
  - Badges exibem tooltip com nome e descrição ao passar o mouse.
  - @username inexistente retorna 404.
  - Não exibe: e-mail, tokens, submissões rejeitadas/pendentes.

  Notas Técnicas:
  - Rota: GET /api/v1/gamification-profiles/by-username/:username
  - Rota: GET /api/v1/badges/profile/:profileId (badges do perfil)
  - Rota: GET /api/v1/gamification-profiles/:id/approved-submissions
  - Frontend: /u/[username].

  ---
  US-27 — Painel do Próprio Perfil (Dashboard)                      [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero ver um painel centralizado com minha evolução.

  Critérios de Aceite:
  - Exibe: XP total, XP do mês, XP do ano, saldo de gratitudeTokens, nível
    atual (nome + barra de progresso para o próximo), posição no ranking
    mensal, últimas submissões e badges conquistadas.

  Notas Técnicas:
  - Rota: GET /api/v1/gamification-profiles/me
  - Frontend: /dashboard.

  ─────────────────────────────────────────────────────────────────────────────
  ÉPICO 7 — Conquistas (Badges)
  ─────────────────────────────────────────────────────────────────────────────

  US-28 — Desbloqueio Automático de Badge por Marco Atingido        [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero receber badges automaticamente ao atingir marcos específicos,
  Para que minhas conquistas fiquem visíveis no meu perfil.

  Critérios de Aceite:
  - O sistema avalia critérios após: aprovação de submissão, transferência de
    tokens e resgate de código secreto.
  - Critérios automáticos suportados (criteriaType: AUTOMATIC):
      · total_xp — XP total atingiu o threshold
      · submissions_approved — número de submissões aprovadas
      · tokens_sent — tokens de gratidão enviados acumulados
      · membership_months — meses como membro ativo
      · monthly_ranking — posição no ranking mensal de um mês/ano específico
      · annual_ranking — posição no ranking anual de um ano específico
  - Cada badge pode ser desbloqueada uma única vez por usuário.
  - O badge aparece no perfil público imediatamente após o desbloqueio.

  Notas Técnicas:
  - Serviço: BadgeEvaluatorService (chamado de forma assíncrona).
  - RankingCronService: avalia e concede badges de ranking no dia 1 de cada
    mês/ano. O criteriaConfig inclui {month, year} para monthly e {year} para
    annual, garantindo que apenas o badge do período correto seja concedido.
  - Entidade: GamificationProfileBadge (profileId, badgeId, unlockedAt).

  ---
  US-29 — Concessão Manual de Badge (Admin)                         [✅ FEITO]

  Como um Guardião,
  Eu quero conceder badges manualmente a membros que se destacaram.

  Critérios de Aceite:
  - O Guardião seleciona um badge com criteriaType: MANUAL e o @username.
  - O sistema registra GamificationProfileBadge com unlockedAt atual.
  - Não é possível conceder o mesmo badge duas vezes ao mesmo usuário.
  - Acesso restrito: apenas admin.

  Notas Técnicas:
  - Rota: POST /api/v1/badges/grant
  - Body: { badgeId: string, profileId: string }
  - Frontend: painel admin /admin-panel/badges.

  ---
  US-30 — Catálogo de Badges (Admin)                                [✅ FEITO]

  Como um Guardião,
  Eu quero cadastrar e gerenciar os badges disponíveis na plataforma.

  Critérios de Aceite:
  - Cada badge possui: nome, descrição, imageUrl (PNG 512×512 circular, exibido
    em 48×48 px), categoria, criteriaType e criteriaConfig (JSON).
  - Categorias: MILESTONE, RANKING, PARTICIPATION, SPECIAL.
  - Badges inativos não são concedidos, mas permanecem em perfis existentes.
  - O admin pode criar, editar e excluir badges pelo painel.
  - Categoria exibida com cor distinta na tabela:
      · MILESTONE = primary, RANKING = amber, PARTICIPATION = emerald,
        SPECIAL = violet.

  Notas Técnicas:
  - Rotas: GET/POST/PATCH/DELETE /api/v1/badges
  - Frontend: /admin-panel/badges com botões Editar e Excluir diretos.
  - Seeds: 46 badges pré-definidos (nível, submissões, tokens, participação,
    ranking mensal Abr–Dez 2026 × 3 posições, ranking anual 2026 × 3,
    2 especiais manuais).

  ─────────────────────────────────────────────────────────────────────────────
  ÉPICO 8 — Missões
  ─────────────────────────────────────────────────────────────────────────────

  As Missões são desafios únicos: apenas um vencedor por missão recebe o XP.
  Diferem das Atividades (multi-aprovação) por serem competitivas. A principal
  aplicação atual é a criação de arte para os badges da plataforma.

  ---
  US-34 — Visualização do Catálogo de Missões                       [✅ FEITO]

  Como um Herói Silencioso ou Visitante,
  Eu quero ver as missões abertas da plataforma,
  Para que eu possa participar de desafios e ganhar XP competitivo.

  Critérios de Aceite:
  - Lista missões com status: OPEN.
  - Cada missão exibe: título, descrição (markdown), requisitos (markdown),
    XP do prêmio e status.
  - Missões CLOSED mostram que já foram conquistadas.

  Notas Técnicas:
  - Rota: GET /api/v1/missions (público)
  - Frontend: /missions.

  ---
  US-35 — Detalhe e Submissão de Missão                             [✅ FEITO]

  Como um Herói Silencioso,
  Eu quero ver os detalhes de uma missão e enviar minha participação,
  Para que eu concorra ao prêmio único de XP.

  Critérios de Aceite:
  - A página exibe: título, descrição completa (markdown), requisitos
    (markdown), XP do prêmio e status.
  - O membro pode enviar: comprovante (arquivo até 5MB) e/ou descrição em
    markdown (máx. 2000 caracteres, sanitizada — sem emojis ou Unicode
    especial).
  - Pelo menos um dos dois (comprovante ou descrição) é obrigatório.
  - Não é possível submeter duas vezes na mesma missão.
  - Após envio, o status da submissão é exibido (PENDING/APPROVED/REJECTED).
  - Missões CLOSED exibem aviso de encerramento.

  Notas Técnicas:
  - Rotas: GET /api/v1/missions/:id, POST /api/v1/missions/:id/submit
  - GET /api/v1/missions/:id/my-submission (status da própria submissão)
  - Frontend: /missions/[id].

  ---
  US-36 — Revisão e Escolha de Vencedor de Missão (Admin)           [✅ FEITO]

  Como um Guardião ou Auditor,
  Eu quero revisar todas as submissões de uma missão e escolher o vencedor,
  Para que o melhor trabalho seja reconhecido e a missão seja encerrada.

  Critérios de Aceite:
  - O moderador vê todas as submissões PENDING agrupadas por missão.
  - A descrição de cada submissão é renderizada em markdown.
  - Ao escolher um vencedor, o sistema:
      · Aprova a submissão vencedora (status: APPROVED)
      · Credita o XP (totalXp, currentMonthlyXp, currentYearlyXp)
      · Rejeita todas as outras submissões da mesma missão
      · Fecha a missão (status: CLOSED)
      · Concede o badge vinculado (se mission.badgeId estiver definido)
  - A ação é irreversível. Confirmação obrigatória antes de executar.
  - Acesso restrito: admin e moderator.

  Notas Técnicas:
  - Rota: POST /api/v1/missions/:missionId/submissions/:submissionId/review
  - Body: { status: 'APPROVED' }
  - Frontend: aba "Missões" em /moderation (expansível por missão).

  ---
  US-37 — Gerenciamento de Missões (Admin)                          [✅ FEITO]

  Como um Guardião,
  Eu quero criar, editar e excluir missões,
  Para que a plataforma tenha sempre desafios relevantes para a comunidade.

  Critérios de Aceite:
  - Campos: título, descrição (markdown), requisitos (markdown), XP do prêmio,
    badge vinculado (opcional) e status (OPEN/CLOSED).
  - Descrição e requisitos possuem editor com toggle Editar/Preview.
  - Acesso restrito: apenas admin.

  Notas Técnicas:
  - Rotas: GET/POST/PATCH/DELETE /api/v1/missions (admin)
  - Frontend: /admin-panel/missions com botão de voltar.
  - Seeds: 46 missões para criação de arte dos badges cadastrados, cada uma com
    especificação técnica obrigatória (PNG 512×512 transparente, estilo flat).

  ─────────────────────────────────────────────────────────────────────────────
  ÉPICO 9 — Administração e Saúde da Plataforma
  ─────────────────────────────────────────────────────────────────────────────

  US-31 — Gerenciamento de Roles de Usuários                        [✅ FEITO]

  Como um Guardião,
  Eu quero promover ou rebaixar membros (user / moderator / admin),
  Para que eu possa escalar a equipe de moderação.

  Critérios de Aceite:
  - O Guardião altera a role de qualquer usuário.
  - A mudança tem efeito no próximo request (após expiração do JWT atual).
  - Apenas admin pode promover outros a admin.

  Notas Técnicas:
  - Rota: PATCH /api/v1/users/:id
  - Frontend: /admin-panel/users (edit).

  ---
  US-32 — Painel de Métricas da Plataforma (Admin)                  [✅ FEITO]

  Como um Guardião,
  Eu quero ver métricas gerais da plataforma em tempo real,
  Para que eu entenda o crescimento da comunidade e a saúde da moderação.

  Critérios de Aceite:
  - Exibe 8 métricas em cards:
      · Usuários totais / ativos / banidos
      · Submissões pendentes
      · Submissões aprovadas e rejeitadas no mês corrente
      · XP total distribuído (soma histórica de XP_REWARD)
      · Tokens de Gratidão em circulação (soma de gratitudeTokens de todos
        os perfis)
  - Acesso restrito: admin.

  Notas Técnicas:
  - Rota: GET /api/v1/admin/metrics
  - Frontend: página principal do /admin-panel.

  ---
  US-38 — Monitor de Saúde dos Serviços (Admin)                     [✅ FEITO]

  Como um Guardião,
  Eu quero ver o status dos serviços externos integrados à plataforma,
  Para que eu detecte falhas de infraestrutura antes que afetem os membros.

  Critérios de Aceite:
  - O painel exibe o status de 3 serviços, cada um com indicador verde/vermelho:
      · Banco de Dados (Neon/Postgres): verifica via SELECT 1
      · E-mail (Brevo SMTP): verifica via transporter.verify()
      · Armazenamento (R2): verifica via HeadBucketCommand
  - Status atualizado ao abrir o painel e a cada 5 minutos automaticamente.
  - Botão de atualização manual disponível.
  - Em caso de falha, exibe a mensagem de erro.
  - Acesso restrito: admin.

  Notas Técnicas:
  - Rota: GET /api/v1/admin/health
  - Frontend: seção "Saúde dos Serviços" em /admin-panel.

  ---
  US-33 — E-mails Transacionais                                [⚠️ PARCIAL]

  Como um Guardião,
  Eu quero que os membros recebam e-mails transacionais confiáveis.

  Critérios de Aceite:
  - ✅ Confirmação de cadastro
  - ✅ Redefinição de senha
  - ❌ Notificação de submissão aprovada (template a criar)
  - ❌ Notificação de badge desbloqueado (a implementar)
  - SMTP via Brevo configurado em produção com MAIL_HOST, MAIL_USER,
    MAIL_PASSWORD.

  Notas Técnicas:
  - MailerModule + MailModule já configurados.
  - Templates pendentes: approval-notification, badge-unlocked.

  ─────────────────────────────────────────────────────────────────────────────
  Sistema de Níveis (XP)
  ─────────────────────────────────────────────────────────────────────────────

  Os níveis são calculados no frontend com base no totalXp do perfil.
  Não há coluna de nível no banco — é sempre derivado.

  ┌──────────────────────┬────────────┬────────────┬─────────────────────────┐
  │        Nível         │   XP mín   │   XP máx   │ Tempo estimado*         │
  ├──────────────────────┼────────────┼────────────┼─────────────────────────┤
  │ Novato               │ 0          │ 499        │ < 1 mês                 │
  ├──────────────────────┼────────────┼────────────┼─────────────────────────┤
  │ Contribuidor         │ 500        │ 1.999      │ ~2–3 meses (ocasional)  │
  ├──────────────────────┼────────────┼────────────┼─────────────────────────┤
  │ Colaborador Ativo    │ 2.000      │ 5.999      │ ~4–8 meses (moderado)   │
  ├──────────────────────┼────────────┼────────────┼─────────────────────────┤
  │ Referência           │ 6.000      │ 14.999     │ ~10–18 meses (ativo)    │
  ├──────────────────────┼────────────┼────────────┼─────────────────────────┤
  │ Mentor               │ 15.000     │ 34.999     │ ~2–4 anos (consistente) │
  ├──────────────────────┼────────────┼────────────┼─────────────────────────┤
  │ Lenda                │ 35.000     │ ∞          │ > 4 anos (exemplar)     │
  └──────────────────────┴────────────┴────────────┴─────────────────────────┘

  * Estimativa para membro moderadamente ativo (~600 XP/mês).
    Um membro ocasional (~150 XP/mês) chega a Lenda em ~20 anos.
    Nenhum nível é atingível em 1 mês isolado.

  Fontes de XP:
  - Submissão aprovada: fixedReward da atividade (30–150 XP por atividade)
  - Token de Gratidão recebido: 1 XP por token (renovam mensalmente a 5)
  - Moderação (aprovação ou rejeição): 10 XP por revisão (AUDITOR_REWARD)
  - Missão vencida: xpReward da missão (definido pelo admin)

  ─────────────────────────────────────────────────────────────────────────────
  Sumário de Status por Épico
  ─────────────────────────────────────────────────────────────────────────────

  ┌──────┬──────────────────────────────────────┬─────────────┬─────────────┐
  │  #   │                Épico                 │   Backend   │  Frontend   │
  ├──────┼──────────────────────────────────────┼─────────────┼─────────────┤
  │  1   │ Identidade e Acesso (US-01–07)       │ ✅ Completo │ ✅ Completo │
  ├──────┼──────────────────────────────────────┼─────────────┼─────────────┤
  │  2   │ Catálogo de Atividades (US-08–12)    │ ✅ Completo │ ✅ Completo │
  ├──────┼──────────────────────────────────────┼─────────────┼─────────────┤
  │  3   │ Submissão de Atividades (US-13–15)   │ ✅ Completo │ ✅ Completo │
  ├──────┼──────────────────────────────────────┼─────────────┼─────────────┤
  │  4   │ Moderação e Auditoria (US-16–19)     │ ✅ Completo │ ✅ Completo │
  ├──────┼──────────────────────────────────────┼─────────────┼─────────────┤
  │  5   │ Economia P2P — Tokens (US-20–22)     │ ✅ Completo │ ✅ Completo │
  ├──────┼──────────────────────────────────────┼─────────────┼─────────────┤
  │  6   │ Rankings e Vitrine (US-23–27)        │ ✅ Completo │ ✅ Completo │
  ├──────┼──────────────────────────────────────┼─────────────┼─────────────┤
  │  7   │ Conquistas — Badges (US-28–30)       │ ✅ Completo │ ✅ Completo │
  ├──────┼──────────────────────────────────────┼─────────────┼─────────────┤
  │  8   │ Missões (US-34–37)                   │ ✅ Completo │ ✅ Completo │
  ├──────┼──────────────────────────────────────┼─────────────┼─────────────┤
  │  9   │ Administração e Saúde (US-31–33, 38) │ ✅ Completo │ ✅ Completo │
  │      │                                      │             │ ⚠️ E-mails  │
  └──────┴──────────────────────────────────────┴─────────────┴─────────────┘

  Legenda: ✅ Implementado · ⚠️ Parcial · ❌ Pendente

  ─────────────────────────────────────────────────────────────────────────────
  Pendências Conhecidas
  ─────────────────────────────────────────────────────────────────────────────

  1. E-mails transacionais pendentes (US-33):
     - Notificação de submissão aprovada
     - Notificação de badge desbloqueado

  2. Deploy de produção:
     - Rodar seeds (badges, activities, missions) em prod
     - Configurar SMTP Brevo em produção
     - Abrir missões de criação de arte no painel admin

  3. Documentação a atualizar:
     - api.md (endpoints de missões, health, badges/profile)
     - data-model.md (Badge.category, Mission, MissionSubmission)
     - formularios.md (MarkdownEditor, sanitizeMarkdownInput)
     - Novo: docs/gamificacao.md (regras completas de XP e badges)
     - Novo: docs/seeds.md (como rodar e re-rodar seeds)
