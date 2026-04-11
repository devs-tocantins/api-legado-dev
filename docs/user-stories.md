  Legado Tech — Documento de User Stories

  Personas

  ┌────────────────┬────────────────────────────────────────────────────────┐
  │    Persona     │                         Quem é                         │
  ├────────────────┼────────────────────────────────────────────────────────┤
  │ Herói          │ Desenvolvedor/membro da comunidade que realiza ações   │
  │ Silencioso     │ voluntárias                                            │
  ├────────────────┼────────────────────────────────────────────────────────┤
  │ Auditor        │ Moderador responsável por validar as submissões        │
  ├────────────────┼────────────────────────────────────────────────────────┤
  │ Guardião       │ Administrador com acesso total ao sistema              │
  ├────────────────┼────────────────────────────────────────────────────────┤
  │ Visitante      │ Qualquer pessoa que acessa a plataforma sem conta      │
  └────────────────┴────────────────────────────────────────────────────────┘

  ---
  ÉPICO 1 — Identidade e Acesso

  ---
  US-01 — Cadastro na Plataforma

  Como um Herói Silencioso,
  Eu quero criar uma conta na plataforma com e-mail e senha,
  Para que eu possa começar a registrar minhas contribuições e construir meu
  legado público na comunidade.

  Critérios de Aceite:
  - O formulário exige nome, sobrenome, e-mail válido e senha com mínimo de
  segurança.
  - Após o cadastro, o sistema envia um e-mail de confirmação para o endereço
  informado.
  - Enquanto o e-mail não for confirmado, o login é bloqueado ou limitado com
  aviso claro.
  - Um GamificationProfile é criado automaticamente e vinculado ao novo User
  após a confirmação.
  - O usuário deve escolher um @username único (seu handle público). Se já
  existir, o sistema sugere alternativas.
  - Caso o e-mail já esteja cadastrado, o sistema retorna erro 409 Conflict sem
  revelar dados sensíveis.
  - O banco de dados registra o novo User e o GamificationProfile com XP zerado
  e 5 gratitudeTokens iniciais.

  Notas Técnicas:
  - Rotas: POST /api/v1/auth/email/register, POST /api/v1/auth/email/confirm
  - Entidades: User, GamificationProfile
  - O perfil de gamificação deve ser criado em uma @BeforeInsert ou em um evento
   de domínio após confirmação do e-mail.
  - A ser criado: lógica de validação do username único no
  GamificationProfileService.

  ---
  US-02 — Login com E-mail e Senha

  Como um Herói Silencioso,
  Eu quero fazer login com meu e-mail e senha,
  Para que eu possa acessar meu painel, submeter atividades e acompanhar minha
  pontuação.

  Critérios de Aceite:
  - O sistema retorna um accessToken (JWT, expira em 15 min) e um refreshToken.
  - O accessToken deve conter id, role e dados mínimos no payload (sem consulta
  extra ao BD por requisição).
  - Credenciais inválidas retornam 401 Unauthorized com mensagem genérica (sem
  especificar se foi o e-mail ou a senha que errou).
  - Após 5 tentativas consecutivas com falha, o sistema aplica rate limiting
  temporário.
  - Login com e-mail não confirmado retorna erro com orientação para reenviar o
  e-mail de confirmação.

  Notas Técnicas:
  - Rotas: POST /api/v1/auth/email/login
  - Strategy JWT em src/auth/strategies/jwt.strategy.ts — stateless, não
  consulta BD por requisição.
  - O refreshToken é armazenado em Session no BD.

  ---
  US-03 — Login Social (Google / Apple / Facebook)

  Como um Herói Silencioso,
  Eu quero entrar na plataforma usando minha conta Google ou Apple,
  Para que eu não precise criar e lembrar mais uma senha, reduzindo a fricção
  para começar.

  Critérios de Aceite:
  - O sistema aceita o accessToken do provedor (Google/Apple/Facebook) e retorna
   um JWT interno.
  - Se for o primeiro acesso via social login, um User e GamificationProfile são
   criados automaticamente.
  - O usuário é solicitado a escolher um @username na primeira entrada via login
   social.
  - Logins sociais do mesmo e-mail são vinculados à mesma conta.

  Notas Técnicas:
  - Rotas: POST /api/v1/auth/google/login, POST /api/v1/auth/apple/login, POST
  /api/v1/auth/facebook/login
  - Requer configuração de GOOGLE_CLIENT_ID, APPLE_APP_AUDIENCE, FACEBOOK_APP_ID
   no .env.
  - Estrutura já presente no boilerplate; requer ativação das credenciais
  (Milestone 0).

  ---
  US-04 — Renovação de Sessão (Refresh Token)

  Como um Herói Silencioso,
  Eu quero que minha sessão seja renovada automaticamente enquanto estou usando
  a plataforma,
  Para que eu não seja deslogado no meio de uma submissão por expiração de
  token.

  Critérios de Aceite:
  - Quando o accessToken expira, o cliente pode chamar a rota de refresh com o
  refreshToken válido.
  - O sistema retorna um novo par accessToken + refreshToken.
  - Se o refreshToken for inválido ou expirado, retorna 401 e o usuário é
  redirecionado ao login.
  - O refreshToken é invalidado após uso (rotação de tokens).

  Notas Técnicas:
  - Rota: POST /api/v1/auth/refresh
  - A Session no BD é atualizada com o novo hash do refreshToken.

  ---
  US-05 — Logout Seguro

  Como um Herói Silencioso,
  Eu quero fazer logout da minha conta,
  Para que minha sessão seja encerrada de forma segura, especialmente em
  dispositivos compartilhados.

  Critérios de Aceite:
  - O sistema invalida a Session do BD (o refreshToken para de funcionar).
  - O cliente deve limpar o JWT do armazenamento local (cookie/localStorage).
  - O accessToken ainda será válido pelos minutos restantes do seu ciclo
  (limitação do JWT stateless), mas o refreshToken morre imediatamente.
  - Após logout, chamadas com o refreshToken antigo retornam 401.

  Notas Técnicas:
  - Rota: DELETE /api/v1/auth/logout
  - Entidade: Session

  ---
  US-06 — Recuperação de Senha

  Como um Herói Silencioso,
  Eu quero recuperar o acesso à minha conta caso esqueça minha senha,
  Para que eu não perca meu histórico de contribuições por conta de um
  esquecimento.

  Critérios de Aceite:
  - O usuário informa o e-mail e recebe um link de redefinição com validade de
  30 minutos.
  - O link é de uso único; após usá-lo, o token é invalidado.
  - A senha é redefinida com sucesso mediante confirmação da nova senha.
  - E-mail não cadastrado retorna mensagem genérica (sem confirmar se existe ou
  não).

  Notas Técnicas:
  - Rotas: POST /api/v1/auth/forgot/password, POST /api/v1/auth/reset/password
  - Variável de ambiente: AUTH_FORGOT_SECRET
  - Módulo de e-mail: MailModule (Maildev local → SMTP real em produção).

  ---
  US-07 — Edição de Perfil Pessoal

  Como um Herói Silencioso,
  Eu quero editar meus dados de perfil (nome, avatar, bio),
  Para que minha vitrine pública reflita quem sou e mostre uma apresentação
  profissional para recrutadores.

  Critérios de Aceite:
  - O usuário pode alterar nome, sobrenome, foto de avatar e bio curta.
  - O @username pode ser alterado uma vez (ou nunca, dependendo da regra de
  negócio a definir).
  - O upload de avatar gera uma URL pública via S3 (ou MinIO local).
  - Alterações são refletidas imediatamente no perfil público /u/:username.
  - A foto anterior no S3 é excluída ao substituir por uma nova.

  Notas Técnicas:
  - Rota: PATCH /api/v1/auth/me
  - Upload: POST /api/v1/files/upload (S3 presigned URL via FilesModule)
  - Entidade: User (nome, avatar) + GamificationProfile (username, bio)

  ---
  ÉPICO 2 — Catálogo de Atividades

  ---
  US-08 — Visualização do Catálogo Público de Atividades

  Como um Herói Silencioso,
  Eu quero ver a lista de atividades disponíveis para pontuar,
  Para que eu saiba exatamente quais contribuições são reconhecidas e quantos XP
   cada uma vale.

  Critérios de Aceite:
  - O catálogo é público e não requer autenticação.
  - Apenas atividades com isHidden: false aparecem na listagem.
  - Cada item exibe: título, descrição, XP (fixedReward), se exige comprovante
  (requiresProof) e cooldown entre submissões (cooldownHours).
  - A lista é paginada (padrão: 10 itens por página).
  - O resultado é ordenado por categoria ou XP.

  Notas Técnicas:
  - Rota: GET /api/v1/activities — já implementada (Milestone 2).
  - Entidade: Activity
  - Frontend: página /activities já implementada.

  ---
  US-09 — Acesso a Atividade de Evento (QR Code / Link Secreto)

  Como um Herói Silencioso,
  Eu quero acessar uma atividade oculta através de um QR Code ou link secreto em
   um evento presencial,
  Para que minha presença física no evento seja registrada e recompensada com
  XP.

  Critérios de Aceite:
  - O link/QR Code contém um secretCode único da atividade.
  - Ao acessar com o secretCode válido, a atividade oculta é retornada com seus
  detalhes.
  - Se o secretCode não existir ou a atividade não for oculta com aquele código,
   retorna 404.
  - Após localizar a atividade, o usuário pode diretamente submetê-la (com ou
  sem prova, conforme a regra da atividade).
  - O secretCode não aparece na rota pública do catálogo.

  Notas Técnicas:
  - Rota: GET /api/v1/activities/hidden/:secretCode
  - Entidade: Activity (campo secretCode, isHidden: true)
  - Frontend: rota dinâmica /activities/secret/[code]

  ---
  US-10 — Cadastro de Nova Atividade (Admin)

  Como um Guardião,
  Eu quero cadastrar novas atividades no catálogo da plataforma,
  Para que a comunidade tenha sempre missões atualizadas que reflitam as
  contribuições mais valorizadas no momento.

  Critérios de Aceite:
  - O Guardião preenche: título, descrição, XP, se exige comprovante, cooldown
  em horas, se é oculta e um código secreto (opcional para ocultas).
  - Campos obrigatórios validados: título (não vazio), fixedReward > 0,
  cooldownHours >= 0.
  - Atividades ocultas com secretCode permitem check-in em eventos físicos.
  - A atividade criada aparece imediatamente no catálogo (ou na fila oculta,
  conforme isHidden).
  - Acesso restrito: apenas usuários com role: admin.

  Notas Técnicas:
  - Rota: POST /api/v1/activities — protegida por @Roles(RoleEnum.admin).
  - Entidade: Activity
  - Frontend: painel admin /activities com formulário de criação.

  ---
  US-11 — Edição e Desativação de Atividade (Admin)

  Como um Guardião,
  Eu quero editar ou desativar uma atividade do catálogo,
  Para que eu possa corrigir erros de pontuação ou remover atividades que não
  fazem mais sentido para a comunidade.

  Critérios de Aceite:
  - O Guardião pode editar qualquer campo da atividade.
  - Alterar o fixedReward não retroage submissões já aprovadas (o awardedXp da
  Submission é o valor histórico).
  - A desativação (soft delete ou isHidden: true) remove a atividade do catálogo
   público sem apagar histórico.
  - Acesso restrito: apenas admin.

  Notas Técnicas:
  - Rotas: PATCH /api/v1/activities/:id, DELETE /api/v1/activities/:id
  - Entidade: Activity

  ---
  US-12 — Listagem Completa de Atividades (Admin/Moderador)

  Como um Guardião ou Auditor,
  Eu quero ver todas as atividades, incluindo as ocultas,
  Para que eu possa gerenciar o catálogo completo e entender quais eventos estão
   ativos.

  Critérios de Aceite:
  - A rota retorna todas as atividades, incluindo isHidden: true.
  - Exibe o secretCode das atividades ocultas para facilitar a distribuição nos
  eventos.
  - Acesso restrito: admin e moderator.

  Notas Técnicas:
  - Rota: GET /api/v1/activities/all — já implementada (Milestone 4).
  - Frontend: seção admin do painel de atividades.

  ---
  ÉPICO 3 — Submissão de Atividades

  ---
  US-13 — Submissão de Atividade com Comprovante

  Como um Herói Silencioso,
  Eu quero submeter uma atividade que realizei, anexando um comprovante (print,
  link, certificado),
  Para que minha contribuição seja revisada por um Auditor e, após aprovação,
  meus pontos sejam creditados.

  Critérios de Aceite:
  - O usuário seleciona a atividade do catálogo e preenche a URL do comprovante
  (obrigatório quando requiresProof: true).
  - Se requiresProof: true e nenhuma URL for enviada, o sistema retorna 400 Bad
  Request com mensagem clara.
  - A submissão é criada com status: PENDING.
  - O profileId é extraído automaticamente do JWT (o usuário não pode submeter
  em nome de outro).
  - O sistema verifica o cooldown: se o usuário submeteu a mesma atividade
  dentro do período de cooldownHours, retorna 429 Too Many Requests.
  - A submissão aparece imediatamente na aba "Minhas Solicitações" com status
  PENDENTE.
  - O banco de dados registra a Submission com status: PENDING, awardedXp: 0
  provisório e reviewerId: null.

  Notas Técnicas:
  - Rota: POST /api/v1/submissions — já implementada (Milestone 2).
  - Entidade: Submission
  - Upload do comprovante: POST /api/v1/files/upload gera URL S3 presigned.
  - Cooldown verificado via query TypeORM com createdAt > now() - cooldownHours.

  ---
  US-14 — Submissão de Check-in em Evento (Atividade sem Prova)

  Como um Herói Silencioso,
  Eu quero fazer check-in em um evento presencial via QR Code, sem precisar
  enviar comprovante,
  Para que minha presença seja registrada de forma rápida e sem burocracia.

  Critérios de Aceite:
  - Atividades com requiresProof: false aceitam submissão sem URL de
  comprovante.
  - Dependendo da regra da atividade (a definir pelo produto), o check-in pode
  ser aprovado automaticamente (status: APPROVED) sem passar por moderação.
  - Se aprovação automática: o XP é creditado imediatamente e uma Transaction é
  gerada com type: SUBMISSION_APPROVED.
  - Se exigir moderação: status: PENDING normal.
  - O cooldown ainda se aplica (um usuário não pode fazer check-in duas vezes no
   mesmo evento).

  Notas Técnicas:
  - Rota: POST /api/v1/submissions
  - Lógica de auto-aprovação: adicionar flag autoApprove na Activity (a
  implementar).
  - Entidade: Activity (campo autoApprove), Submission, Transaction.

  ---
  US-15 — Histórico de Submissões Pessoais

  Como um Herói Silencioso,
  Eu quero ver todas as minhas submissões com seus respectivos status,
  Para que eu possa acompanhar o que está pendente, o que foi aprovado e o
  feedback dos Auditores.

  Critérios de Aceite:
  - A lista exibe: nome da atividade, data de submissão, status
  (PENDING/APPROVED/REJECTED), XP recebido e feedback do Auditor (quando
  houver).
  - O usuário vê apenas suas próprias submissões (isolamento por JWT).
  - A lista é paginada e ordenada por data decrescente.
  - Submissões REJECTED exibem o feedback do Auditor em destaque para que o
  usuário entenda o motivo.

  Notas Técnicas:
  - Rota: GET /api/v1/submissions/me — já implementada (Milestone 2).
  - Entidade: Submission com join em Activity.
  - Frontend: página /submissions já implementada.

  ---
  ÉPICO 4 — Moderação e Auditoria

  ---
  US-16 — Visualização da Fila de Moderação

  Como um Auditor,
  Eu quero ver todas as submissões pendentes de revisão,
  Para que eu possa processar as solicitações dos membros e manter o ranking
  limpo e confiável.

  Critérios de Aceite:
  - A lista exibe: nome do membro, @username, atividade submetida, link do
  comprovante (se houver), data de submissão.
  - As próprias submissões do Auditor logado não aparecem na fila (ele não pode
  se auto-aprovar).
  - A lista é paginada e ordenada por data crescente (FIFO — mais antigas
  primeiro).
  - Acesso restrito: admin e moderator.
  - Acessar sem token ou com role insuficiente retorna 403 Forbidden.

  Notas Técnicas:
  - Rota: GET /api/v1/submissions/pending — já implementada (Milestone 3).
  - Entidade: Submission com join em GamificationProfile e Activity.
  - Frontend: página /moderation já implementada.

  ---
  US-17 — Aprovação de Submissão

  Como um Auditor,
  Eu quero aprovar uma submissão e definir os XP a serem concedidos,
  Para que o Herói Silencioso seja recompensado pelo esforço real que comprovou
  ter feito.

  Critérios de Aceite:
  - O Auditor pode ajustar o awardedXp (diferente do fixedReward da atividade,
  para missões curingas ou atividades de valor variável).
  - Ao aprovar: status muda para APPROVED, awardedXp é creditado ao perfil do
  membro em totalXp, currentMonthlyXp e currentYearlyXp.
  - Uma Transaction com type: SUBMISSION_APPROVED é gerada no extrato do membro
  aprovado.
  - O Auditor recebe automaticamente 10 XP como recompensa de auditoria —
  registrado como Transaction com type: AUDITOR_REWARD no extrato do Auditor.
  - Tudo ocorre em uma única transação ACID (nenhuma operação parcial é aceita).
  - A submissão some da fila de moderação após a revisão.
  - O reviewerId e reviewedAt são preenchidos na Submission.

  Notas Técnicas:
  - Rota: PATCH /api/v1/submissions/:id/review — já implementada (Milestone 3).
  - Entidade: Submission, GamificationProfile, Transaction.
  - Transação ACID via EntityManager.transaction() do TypeORM.

  ---
  US-18 — Rejeição de Submissão com Feedback

  Como um Auditor,
  Eu quero rejeitar uma submissão e informar o motivo ao membro,
  Para que a plataforma mantenha a integridade do ranking e o membro entenda
  como melhorar suas próximas submissões.

  Critérios de Aceite:
  - O Auditor preenche obrigatoriamente o campo feedback ao rejeitar (status:
  REJECTED).
  - Nenhum XP é concedido ao membro rejeitado.
  - O Auditor recebe os 10 XP de recompensa de auditoria mesmo em rejeições (o
  trabalho de revisar tem valor independente do resultado).
  - O membro visualiza o feedback na tela de histórico pessoal.
  - Nenhuma Transaction de SUBMISSION_APPROVED é gerada — apenas a
  AUDITOR_REWARD para o Auditor.

  Notas Técnicas:
  - Rota: PATCH /api/v1/submissions/:id/review (mesmo endpoint, body { status:
  'REJECTED', feedback: '...' }).
  - Validação DTO: feedback obrigatório quando status: 'REJECTED'.

  ---
  US-19 — Penalidade Administrativa (Débito de XP)

  Como um Guardião,
  Eu quero debitar XP de um perfil em casos de abuso comprovado,
  Para que a economia do ranking seja justa e fraudes P2P sejam revertidas com
  rastreabilidade.

  Critérios de Aceite:
  - O Guardião informa: targetUsername, amount (XP a debitar) e reason (motivo
  obrigatório).
  - O XP é subtraído de totalXp, currentMonthlyXp e currentYearlyXp (sem deixar
  valores negativos — mínimo: 0).
  - Uma Transaction com type: PENALTY, amount negativo e reason é gerada no
  extrato do penalizado.
  - Apenas admin pode executar esta ação.
  - A ação é logada com o ID do Guardião que a executou.

  Notas Técnicas:
  - Rota: POST /api/v1/gamification-profiles/:id/penalty — a criar.
  - Entidade: Transaction (enum PENALTY já mapeado).
  - Entidade: GamificationProfile (atualizar XPs).

  ---
  ÉPICO 5 — Economia P2P (Tokens de Gratidão)

  ---
  US-20 — Transferência de Token de Gratidão

  Como um Herói Silencioso,
  Eu quero enviar Tokens de Gratidão para um colega que me ajudou,
  Para que ele seja reconhecido e recompensado com XP real de forma imediata,
  sem precisar de moderação.

  Critérios de Aceite:
  - O usuário informa: @username do destinatário, amount e uma mensagem opcional
   (feedbackMessage).
  - Se o remetente não tiver saldo suficiente de gratitudeTokens, retorna 400
  Bad Request com mensagem de saldo insuficiente.
  - O remetente não pode enviar tokens para si mesmo.
  - A transferência é imediata: tokens debitados do remetente, XP creditado no
  totalXp do destinatário (sem afetar currentMonthlyXp/currentYearlyXp).
  - Duas Transaction são geradas: uma GRATITUDE_SENT (para o remetente, valor
  negativo) e uma GRATITUDE_RECEIVED (para o destinatário, valor positivo).
  - A operação é atômica (ACID).

  Notas Técnicas:
  - Rota: POST /api/v1/gamification-profiles/transfer — já implementada
  (Milestone 3).
  - Entidade: GamificationProfile, Transaction.
  - Frontend: página /transactions já implementada.

  Melhoria US-20-B — Busca de Perfil para Envio de Token (UX):
  - O frontend deve substituir o campo de "ID do destinatário" por um Combobox
  com busca por username (digitação com debounce de 300ms).
  - Backend: a rota GET /api/v1/gamification-profiles já aceita ?search=<termo>
  para filtrar por username (ILike). Implementado em 2026-04-10.
  - O Combobox exibe @username nos resultados e guarda o profileId internamente.
  - Será implementado no frontend junto com a Etapa 7 (reutilizando o padrão
  de Combobox de atividades). Ver implementation-plan.md seção 2.6.

  ---
  US-21 — Consulta de Saldo e Extrato de Tokens

  Como um Herói Silencioso,
  Eu quero ver meu saldo atual de Tokens de Gratidão e o histórico de todas as
  movimentações,
  Para que eu saiba quanto ainda tenho para distribuir e acompanhe cada XP ganho
   ou doado.

  Critérios de Aceite:
  - O painel exibe o saldo atual de gratitudeTokens com data de expiração (dia 1
   do próximo mês).
  - O extrato lista todas as Transaction do usuário: tipo, valor, data e
  referência (nome de quem enviou/recebeu, qual submissão gerou o XP).
  - O extrato é paginado e ordenado por createdAt decrescente.
  - amount positivos e negativos são visualmente diferenciados (verde/vermelho).

  Notas Técnicas:
  - Rota: GET /api/v1/transactions/me
  - Entidade: Transaction com join em GamificationProfile para exibir nomes.
  - Rota: GET /api/v1/gamification-profiles/me para o saldo.

  ---
  US-22 — Renovação Automática Mensal de Tokens

  Como um Herói Silencioso,
  Eu quero receber automaticamente minha cota de 5 Tokens de Gratidão no início
  de cada mês,
  Para que eu sempre tenha recursos para reconhecer colegas, sem que tokens não
  utilizados acumulem indefinidamente.

  Critérios de Aceite:
  - No dia 1 de cada mês, às 00h00 (UTC), todos os gratitudeTokens são resetados
   para 5 (não acumulam).
  - O currentMonthlyXp de todos os perfis é zerado, reiniciando o ranking
  mensal.
  - Tokens não usados do mês anterior são perdidos (sem acúmulo).
  - A operação é um CronJob e não gera Transaction individual por usuário (é uma
   operação em massa).

  Notas Técnicas:
  - CronJob @nestjs/schedule — já implementado (Milestone 3).
  - Entidade: GamificationProfile (colunas gratitudeTokens e currentMonthlyXp).
  - Operação via UPDATE em massa com QueryBuilder.

  ---
  ÉPICO 6 — Rankings e Vitrine Pública

  ---
  US-23 — Visualização do Ranking Mensal

  Como um Visitante ou Herói Silencioso,
  Eu quero ver o ranking dos membros mais ativos do mês corrente,
  Para que eu me inspire nos líderes da comunidade e entenda onde estou
  posicionado em relação aos demais.

  Critérios de Aceite:
  - O ranking exibe os Top 50 perfis ordenados por currentMonthlyXp decrescente.
  - Cada entrada exibe: posição, @username, avatar, nível atual e XP do mês.
  - O ranking é público (sem autenticação).
  - O ranking se reinicia automaticamente todo dia 1 do mês (via CronJob).
  - A posição do usuário logado é destacada, mesmo que esteja fora do Top 50.

  Notas Técnicas:
  - Rota: GET
  /api/v1/gamification-profiles?sortBy=currentMonthlyXp&order=DESC&limit=50 (ou
  rota dedicada /rankings/monthly).
  - Rota base GET /api/v1/gamification-profiles já implementada (Milestone 4).
  - Frontend: página /leaderboard já implementada.

  ---
  US-24 — Visualização do Ranking Anual

  Como um Visitante ou Herói Silencioso,
  Eu quero ver o ranking dos membros mais comprometidos no ano atual,
  Para que eu tenha uma visão de consistência de longo prazo das contribuições
  da comunidade.

  Critérios de Aceite:
  - Idem ao ranking mensal, porém ordenado por currentYearlyXp.
  - O ranking anual se reinicia automaticamente todo dia 1 de janeiro.
  - Exibe os Top 50 perfis.

  Notas Técnicas:
  - Rota: GET
  /api/v1/gamification-profiles?sortBy=currentYearlyXp&order=DESC&limit=50
  - CronJob adicional para reset anual em 1 de janeiro — a criar.

  ---
  US-25 — Visualização do Hall da Fama (Ranking Global)

  Como um Visitante ou Herói Silencioso,
  Eu quero ver o ranking global de todos os tempos da plataforma,
  Para que eu veja quem são as lendas da comunidade que acumularam o maior
  legado histórico.

  Critérios de Aceite:
  - Ordenado por totalXp decrescente. Nunca é zerado.
  - Exibe o currentLevel do perfil (ex: Newbie, Junior, Pleno, Sênior, Lenda).
  - Sem limite de tempo — representa o impacto vitalício de cada membro.
  - Público, sem autenticação.

  Notas Técnicas:
  - Rota: GET /api/v1/gamification-profiles?sortBy=totalXp&order=DESC&limit=50
  - Entidade: GamificationProfile (campo currentLevel calculado com base em
  totalXp).

  ---
  US-26 — Perfil Público do Herói (Currículo Comunitário)

  Como um Visitante (recrutador, colega de comunidade),
  Eu quero visualizar o perfil público de um membro pelo seu @username,
  Para que eu conheça o histórico de contribuições dele como uma vitrine de alta
   performance para além do currículo tradicional.

  Critérios de Aceite:
  - A URL /u/:username retorna o perfil público do membro.
  - Exibe: avatar, nome, @username, nível atual, totalXp, currentMonthlyXp,
  posição no ranking mensal, badges desbloqueadas e as 10 últimas submissões
  aprovadas.
  - Cada submissão aprovada exibe: atividade, data de aprovação e XP recebido.
  - Se o @username não existir, retorna página 404.
  - Não exibe dados sensíveis: e-mail, tokens disponíveis, submissões rejeitadas
   ou pendentes.

  Notas Técnicas:
  - Rota API: GET /api/v1/gamification-profiles/by-username/:username — já
  implementada (Milestone 4).
  - Rota API: GET /api/v1/gamification-profiles/:id/approved-submissions — já
  implementada (Milestone 4).
  - Frontend: rota /u/[username] já implementada.

  ---
  US-27 — Painel do Próprio Perfil (Dashboard)

  Como um Herói Silencioso,
  Eu quero ver um painel centralizado com minha evolução,
  Para que eu acompanhe meu progresso de XP, meu nível atual, meu saldo de
  tokens e minhas últimas submissões em um único lugar.

  Critérios de Aceite:
  - Exibe: XP total, XP do mês, XP do ano, saldo de gratitudeTokens, nível atual
   e posição no ranking mensal.
  - Inclui barra de progresso visual até o próximo nível.
  - Exibe as 5 últimas submissões com status.
  - Exibe badges conquistadas.
  - Acesso restrito: usuário autenticado (seus próprios dados).

  Notas Técnicas:
  - Rota: GET /api/v1/gamification-profiles/me — já implementada.
  - Frontend: página /dashboard já implementada.

  ---
  ÉPICO 7 — Conquistas (Badges)

  ---
  US-28 — Desbloqueio Automático de Badge por Meta Atingida

  Como um Herói Silencioso,
  Eu quero receber badges automaticamente quando atingir marcos específicos,
  Para que minhas conquistas fiquem eternizadas no meu perfil como provas
  visuais da minha jornada.

  Critérios de Aceite:
  - O sistema avalia critérios automaticamente após cada aprovação de submissão
  ou transferência de token.
  - Exemplos de critérios: "Primeira Submissão Aprovada", "10 Tokens de Gratidão
   Enviados", "Top 3 do Ranking Mensal".
  - Quando o critério é atingido, uma GamificationProfileBadge é criada com o
  unlockedAt da conquista.
  - O usuário é notificado (banner ou e-mail) sobre o novo badge.
  - O badge aparece no perfil público imediatamente após o desbloqueio.
  - Cada badge pode ser desbloqueada apenas uma vez por usuário.

  Notas Técnicas:
  - Entidades: Badge, GamificationProfileBadge — modeladas no data-model, a
  implementar.
  - Serviço de avaliação: BadgesEvaluatorService — a criar.
  - Campo criteriaType: AUTOMATIC na entidade Badge.

  ---
  US-29 — Concessão Manual de Badge (Admin)

  Como um Guardião,
  Eu quero conceder badges manualmente a membros que se destacaram de forma
  especial,
  Para que contribuições únicas que não se encaixam em critérios automáticos
  também sejam reconhecidas.

  Critérios de Aceite:
  - O Guardião seleciona um badge com criteriaType: MANUAL e um @username de
  destino.
  - O sistema registra a GamificationProfileBadge com o unlockedAt atual.
  - Acesso restrito: apenas admin.
  - Não é possível conceder o mesmo badge duas vezes ao mesmo usuário.

  Notas Técnicas:
  - Rota: POST /api/v1/badges/grant — a criar.
  - Entidade: Badge, GamificationProfileBadge.

  ---
  US-30 — Catálogo de Badges da Plataforma

  Como um Guardião,
  Eu quero cadastrar e gerenciar os badges disponíveis na plataforma,
  Para que a equipe de moderação possa criar conquistas significativas que
  motivem a comunidade.

  Critérios de Aceite:
  - Cada badge possui: nome, descrição, imagem (imageUrl), tipo de critério
  (MANUAL ou AUTOMATIC) e, para automáticos, a definição do critério (ex: {
  type: 'submissions_approved', threshold: 10 }).
  - O Guardião pode criar, editar e desativar badges.
  - Badges desativados não são concedidos novamente, mas permanecem visíveis em
  perfis que já os conquistaram.

  Notas Técnicas:
  - Rotas: POST /api/v1/badges, PATCH /api/v1/badges/:id — a criar.
  - Entidade: Badge.

  ---
  ÉPICO 8 — Administração e Gestão da Plataforma

  ---
  US-31 — Gerenciamento de Funções (Roles) de Usuários

  Como um Guardião,
  Eu quero promover um membro para Auditor ou rebaixar um Auditor de volta a
  membro comum,
  Para que eu possa escalar a equipe de moderação conforme a comunidade cresce.

  Critérios de Aceite:
  - O Guardião seleciona um usuário e altera sua role para user, moderator ou
  admin.
  - A mudança tem efeito imediato (no próximo request após expiração do JWT
  atual).
  - Apenas admin pode promover outros a admin.
  - Não é possível rebaixar o próprio usuário (para evitar ficar sem admin).
  - A ação é registrada em log de auditoria.

  Notas Técnicas:
  - Rota: PATCH /api/v1/users/:id (já existente no boilerplate, verificar
  proteções).
  - Entidade: User, Role.

  ---
  US-32 — Visão Geral de Métricas da Plataforma (Admin)

  Como um Guardião,
  Eu quero ter acesso a métricas gerais da plataforma,
  Para que eu possa entender o crescimento da comunidade, a saúde da moderação e
   o engajamento dos membros.

  Critérios de Aceite:
  - O painel exibe: total de membros cadastrados, total de submissões pendentes,
   total de submissões aprovadas e rejeitadas no mês, XP total distribuído e
  tokens circulando no mês.
  - Métricas atualizadas em tempo quasi-real (ou com cache de até 5 minutos).
  - Acesso restrito: admin.

  Notas Técnicas:
  - Rota: GET /api/v1/admin/metrics — a criar.
  - Consultas agregadas no BD via TypeORM QueryBuilder (COUNT, SUM).

  ---
  US-33 — Configuração do Sistema de E-mails Transacionais

  Como um Guardião,
  Eu quero configurar o serviço de envio de e-mails da plataforma,
  Para que os membros recebam confirmações de cadastro, recuperações de senha e
  notificações de aprovação de forma confiável.

  Critérios de Aceite:
  - As variáveis MAIL_HOST, MAIL_USER e MAIL_PASSWORD são configuradas no
  ambiente de produção.
  - Se MAIL_USER estiver vazio, o sistema não tenta autenticação no SMTP
  (suporta relay sem auth).
  - E-mails enviados em ambiente local são capturados pelo Maildev (sem sair da
  máquina).
  - Templates de e-mail incluem: confirmação de cadastro, redefinição de senha e
   notificação de submissão aprovada.

  Notas Técnicas:
  - MailModule + MailerModule já configurados.
  - Template de notificação de aprovação — a criar em src/mail/templates/.

  ---
  Sumário dos Épicos e Status de Implementação

  ┌─────┬──────────────────┬──────────┬───────────────────┬─────────────────┐
  │  #  │      Épico       │  User    │  Status Backend   │ Status Frontend │
  │     │                  │ Stories  │                   │                 │
  ├─────┼──────────────────┼──────────┼───────────────────┼─────────────────┤
  │ 1   │ Identidade e     │ US-01 a  │ Implementado      │ Implementado    │
  │     │ Acesso           │ US-07    │ (base)            │ (base)          │
  ├─────┼──────────────────┼──────────┼───────────────────┼─────────────────┤
  │ 2   │ Catálogo de      │ US-08 a  │ Implementado      │ Implementado    │
  │     │ Atividades       │ US-12    │                   │                 │
  ├─────┼──────────────────┼──────────┼───────────────────┼─────────────────┤
  │ 3   │ Submissão de     │ US-13 a  │ Implementado      │ Implementado    │
  │     │ Atividades       │ US-15    │                   │                 │
  ├─────┼──────────────────┼──────────┼───────────────────┼─────────────────┤
  │ 4   │ Moderação e      │ US-16 a  │ US-16/17/18 ✅ ·  │ Implementado    │
  │     │ Auditoria        │ US-19    │ US-19 ❌          │ (parcial)       │
  ├─────┼──────────────────┼──────────┼───────────────────┼─────────────────┤
  │ 5   │ Economia P2P     │ US-20 a  │ Implementado      │ Implementado    │
  │     │                  │ US-22    │                   │                 │
  ├─────┼──────────────────┼──────────┼───────────────────┼─────────────────┤
  │ 6   │ Rankings e       │ US-23 a  │ Implementado      │ Implementado    │
  │     │ Vitrine          │ US-27    │                   │                 │
  ├─────┼──────────────────┼──────────┼───────────────────┼─────────────────┤
  │ 7   │ Conquistas       │ US-28 a  │ Entidade modelada │ ❌              │
  │     │ (Badges)         │ US-30    │  · Lógica ❌      │                 │
  ├─────┼──────────────────┼──────────┼───────────────────┼─────────────────┤
  │ 8   │ Administração    │ US-31 a  │ Parcial           │ Parcial         │
  │     │                  │ US-33    │                   │                 │
  └─────┴──────────────────┴──────────┴───────────────────┴─────────────────┘

  Legenda: ✅ Implementado · ❌ A implementar                                   
   
  ---                                                                           
  As histórias estão organizadas do ciclo mais básico (o usuário existe e acessa
   a plataforma) até o ciclo completo de valor (contribuição → comprovação →    
  moderação → reputação pública). As próximas histórias a atacar, considerando o
   que já foi entregue nos Milestones 1-4, seriam:                              
                                                                  
  - US-19 (Penalidade Admin) — segurança anti-fraude crítica
  - US-28/29/30 (Badges) — o diferencial de vitrine do produto                  
  - US-32 (Métricas Admin) — necessário para decisões de produto                
  - US-24 (Reset Anual) — CronJob faltante para o ranking anual   