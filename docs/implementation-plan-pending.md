Plano de Implementação — Pendências Frontend
Motor de Engajamento · Devs Tocantins
Atualizado em: 2026-04-11 (após Milestone 5 — backend 100% completo)

---

ESTADO ATUAL DO BACKEND

Todas as user stories do backend estão implementadas e commitadas.
O frontend agora precisa consumir as seguintes APIs que ainda não têm UI:

┌──────┬────────────────────────────────────┬────────────────────────────────────────────┐
│  US  │ Feature                            │ Endpoint disponível                        │
├──────┼────────────────────────────────────┼────────────────────────────────────────────┤
│  20B │ Combobox busca por username        │ GET /gamification-profiles?search=<termo>  │
│  19  │ Formulário de penalidade admin     │ POST /gamification-profiles/:id/penalty    │
│ 28-30│ Badges — catálogo, perfil, admin   │ GET/POST/PATCH /badges, POST /badges/grant │
│  32  │ Dashboard de métricas admin        │ GET /admin/metrics                         │
└──────┴────────────────────────────────────┴────────────────────────────────────────────┘

---

PRIORIDADE DE IMPLEMENTAÇÃO

  Sprint 1 (quick wins):
    1. US-20B — Combobox username na transferência de tokens (2-3h)
    2. US-19  — Modal de penalidade admin (1-2h)

  Sprint 2 (feature principal):
    3. US-28/29/30 — Sistema de Badges completo (4-6h)

  Sprint 3:
    4. US-32  — Dashboard de métricas admin (2-3h)

---

ETAPA 1 — Combobox busca por username na transferência de tokens (US-20B)
Prioridade: ALTO · Esforço: 2-3h

CONTEXTO:
  O formulário de transferência de tokens usa um campo de texto livre para o
  recipientProfileId (UUID). A UX ideal é um Combobox com busca por @username.

  O backend já retorna perfis filtrados em:
    GET /api/v1/gamification-profiles?search=<termo>&limit=10
  O campo `search` faz ILike no username. Perfis de banidos já são filtrados.

  Cada resultado tem a forma:
    { id: string, username: string, totalXp: number, ... }

ARQUIVOS A MODIFICAR:
  src/app/[language]/transactions/page-content.tsx (ou equivalente)
    · Substituir o input de recipientProfileId por um Combobox
    · Busca com debounce de 300ms acionada ao digitar
    · Chamar GET /gamification-profiles?search=<termo>&limit=10
    · Resultados mostram "@username" e guardam o UUID internamente
    · Ao selecionar, o profileId (UUID) é submetido no formulário

COMPONENTE SUGERIDO:
  Usar shadcn/ui Command + Popover (padrão combobox no projeto).
  Estrutura:
    <Popover>
      <PopoverTrigger>
        <Input placeholder="Buscar @username..." />
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput onValueChange={setSearch} />
          <CommandList>
            {results.map(p => (
              <CommandItem key={p.id} onSelect={() => setValue('recipientProfileId', p.id)}>
                @{p.username}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

  Hook de busca (debounce):
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const { data } = useQuery(['profiles', debouncedSearch], () =>
      fetchGetGamificationProfiles({ search: debouncedSearch, limit: 10 })
    );

CRITÉRIO DE ACEITE:
  - Usuário digita parte de um username e vê sugestões em tempo real
  - Seleciona um e o UUID é usado no envio
  - Perfis banidos não aparecem (filtro no backend)
  - Campo exibe "@username" após seleção (não o UUID cru)

---

ETAPA 2 — Formulário de penalidade admin (US-19)
Prioridade: ALTO · Esforço: 1-2h

CONTEXTO:
  Rota disponível no backend:
    POST /api/v1/gamification-profiles/:id/penalty
    Authorization: Bearer <token admin>
    Body: { amount: number, reason: string }
    Retorna: GamificationProfile atualizado

  O XP nunca fica negativo (o backend garante). O amount é o valor a debitar.

ONDE COLOCAR A UI:
  Opção recomendada: modal no detalhe do perfil de usuário em:
    /admin-panel/users/edit/[id]  ou  /admin-panel/gamification-profiles

  O modal deve ser visível apenas para admins.

ARQUIVOS A CRIAR/MODIFICAR:
  1. src/services/api/services/gamification-profiles.ts (ou equivalente)
       · Adicionar função: fetchPostPenalty(profileId, body)
         POST /api/v1/gamification-profiles/:id/penalty
         Body: { amount: number, reason: string }

  2. src/app/[language]/admin-panel/users/edit/[id]/page-content.tsx
       · Adicionar botão "Aplicar Penalidade" (visível só para admin)
       · Ao clicar, abre modal com formulário:
           - amount: number (mínimo 1, obrigatório)
           - reason: string (obrigatório, mínimo 10 caracteres)
       · Ao confirmar, chama fetchPostPenalty e exibe toast de sucesso/erro

  3. i18n locales pt-BR e en:
       admin-panel-users-edit.json:
         penalty.title: "Aplicar Penalidade"
         penalty.amount.label: "XP a debitar"
         penalty.reason.label: "Motivo"
         penalty.reason.placeholder: "Descreva o motivo da penalidade..."
         penalty.submit: "Aplicar"
         penalty.success: "Penalidade aplicada com sucesso"

CRITÉRIO DE ACEITE:
  - Admin visualiza o perfil de um usuário e vê o botão "Aplicar Penalidade"
  - Preenche amount e reason, confirma
  - O XP do usuário é debitado (sem ficar negativo)
  - Uma Transaction PENALTY aparece no extrato do usuário

---

ETAPA 3 — Sistema de Badges (US-28/29/30)
Prioridade: MÉDIO · Esforço: 4-6h

CONTEXTO — endpoints disponíveis:
  GET  /api/v1/badges                          → lista badges ativos (público)
  GET  /api/v1/badges/all                      → lista todos os badges (admin)
  POST /api/v1/badges                          → cria badge (admin)
  PATCH /api/v1/badges/:id                     → edita badge (admin)
  DELETE /api/v1/badges/:id                    → remove badge (admin)
  POST /api/v1/badges/grant                    → concede badge manual (admin)
    Body: { profileId: string, badgeId: string, grantedBy: number }
  GET  /api/v1/badges/profile/:profileId       → badges de um perfil (público)

  Estrutura de um Badge:
    {
      id: string,
      name: string,
      description: string,
      imageUrl: string | null,
      criteriaType: 'AUTOMATIC' | 'MANUAL',
      criteriaConfig: { type: string, threshold: number } | null,
      isActive: boolean
    }

  Estrutura de GamificationProfileBadge:
    {
      id: string,
      profileId: string,
      badgeId: string,
      badge: Badge,
      unlockedAt: string,
      grantedBy: number | null
    }

SUB-ETAPA 3.1 — Badges no perfil público /u/:username
  Arquivos:
    src/app/[language]/u/[username]/page-content.tsx (ou equivalente)
      · Chamar GET /badges/profile/:profileId após carregar o perfil
      · Renderizar grid de badges: ícone/emoji, nome, data de conquista
      · Se imageUrl for null, usar um ícone padrão (troféu, medalha)
      · Seção colapsável se > 6 badges: "Ver todos"

  Exemplo de card de badge:
    <div className="flex items-center gap-2 p-2 border rounded">
      <img src={badge.imageUrl ?? '/badge-default.svg'} className="w-8 h-8" />
      <div>
        <p className="font-medium">{badge.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(profileBadge.unlockedAt)}
        </p>
      </div>
    </div>

SUB-ETAPA 3.2 — Badges no dashboard do usuário logado
  Arquivos:
    src/app/[language]/dashboard/page-content.tsx (ou equivalente)
      · Chamar GET /badges/profile/:profileId (profileId vem do GET /me)
      · Mesma UI do perfil público, mas com destaque para badges recentes
      · Mostrar mensagem "Nenhum badge conquistado ainda" se lista vazia

SUB-ETAPA 3.3 — Admin panel de badges (CRUD + concessão manual)
  Página sugerida: /admin-panel/badges

  Listagem (GET /badges/all):
    · Tabela com: nome, tipo (AUTOMATIC/MANUAL), critério, status (ativo/inativo)
    · Botão "Novo Badge" abre modal de criação
    · Cada linha tem botões: editar, desativar/ativar

  Formulário de criação/edição (POST /badges ou PATCH /badges/:id):
    Campos:
      - name: string (obrigatório)
      - description: string (obrigatório)
      - imageUrl: string (opcional)
      - criteriaType: Select → AUTOMATIC | MANUAL
      - Se AUTOMATIC:
          - criteriaConfig.type: Select → submissions_approved | tokens_sent | total_xp
          - criteriaConfig.threshold: number (mínimo 1)
      - isActive: boolean

  Concessão manual (POST /badges/grant):
    · Disponível apenas para badges com criteriaType MANUAL
    · Botão "Conceder" na linha do badge na tabela
    · Modal com:
        - Campo Combobox busca por username (reutilizar o componente da Etapa 1)
        - O profileId é resolvido automaticamente após selecionar username
    · Body enviado: { profileId, badgeId, grantedBy: currentUser.id }

  i18n locales:
    admin-panel-badges.json:
      title: "Badges"
      new: "Novo Badge"
      criteriaType.automatic: "Automático"
      criteriaType.manual: "Manual"
      criteriaConfig.type.submissions_approved: "Submissões aprovadas"
      criteriaConfig.type.tokens_sent: "Tokens enviados"
      criteriaConfig.type.total_xp: "XP total"
      grant.title: "Conceder Badge"
      grant.success: "Badge concedido com sucesso"

CRITÉRIO DE ACEITE:
  - Badges aparecem no perfil público e no dashboard
  - Admin consegue criar badges automáticos e manuais
  - Admin consegue conceder badge manual para um usuário por username
  - Não é possível conceder o mesmo badge duas vezes (o backend bloqueia com 409)
  - Badges desativados não aparecem no catálogo público (GET /badges)

---

ETAPA 4 — Dashboard de métricas admin (US-32)
Prioridade: MÉDIO · Esforço: 2-3h

CONTEXTO — endpoint disponível:
  GET /api/v1/admin/metrics
  Authorization: Bearer <token admin>
  Retorna:
    {
      totalUsers: number,
      activeUsers: number,
      bannedUsers: number,
      submissionsPending: number,
      submissionsApprovedThisMonth: number,
      submissionsRejectedThisMonth: number,
      totalXpDistributed: number,
      tokensInCirculation: number
    }

ONDE COLOCAR:
  Opção A: página /admin-panel/metrics (mais organizado)
  Opção B: expandir a página inicial /admin-panel com uma seção de métricas

ARQUIVOS A CRIAR/MODIFICAR:
  1. src/services/api/services/admin.ts (novo)
       · fetchGetAdminMetrics(): GET /api/v1/admin/metrics

  2. src/app/[language]/admin-panel/metrics/page.tsx (novo) ou na página do admin
       · Usar React Query para buscar e exibir as métricas
       · Grid de cards (8 cards, 4 por linha em desktop):

         USUÁRIOS                        SUBMISSÕES
         ┌───────────────┐  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐
         │  Total        │  │  Ativos        │  │  Banidos       │  │  Pendentes    │
         │  totalUsers   │  │  activeUsers   │  │  bannedUsers   │  │  submissions  │
         └───────────────┘  └────────────────┘  └────────────────┘  └───────────────┘

         APROVAÇÕES MÊS                  REJEIÇÕES MÊS          XP               TOKENS
         ┌───────────────┐  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐
         │  Aprovadas    │  │  Rejeitadas    │  │  XP Total      │  │  Tokens em    │
         │  este mês     │  │  este mês      │  │  Distribuído   │  │  Circulação   │
         └───────────────┘  └────────────────┘  └────────────────┘  └───────────────┘

       · Botão "Atualizar" (refetch manual) ou polling a cada 60s com refetchInterval
       · Skeleton loading enquanto carrega

  3. i18n locales:
       admin-panel-metrics.json:
         title: "Métricas da Plataforma"
         refresh: "Atualizar"
         lastUpdated: "Última atualização: {time}"
         cards.totalUsers: "Total de Usuários"
         cards.activeUsers: "Usuários Ativos"
         cards.bannedUsers: "Usuários Banidos"
         cards.submissionsPending: "Submissões Pendentes"
         cards.submissionsApprovedThisMonth: "Aprovadas no Mês"
         cards.submissionsRejectedThisMonth: "Rejeitadas no Mês"
         cards.totalXpDistributed: "XP Total Distribuído"
         cards.tokensInCirculation: "Tokens em Circulação"

CRITÉRIO DE ACEITE:
  - Admin vê os 8 cards com os números atualizados
  - Não-admins recebem redirecionamento (o middleware de rota já deve proteger)
  - Os números são formatados (ex: 1.250 em vez de 1250)

---

CONVENÇÕES DO PROJETO (lembrete)
  - Componentes UI: shadcn/ui
  - Formulários: react-hook-form + yup
  - Fetch: funções em src/services/api/services/ + React Query
  - i18n: chaves em src/services/i18n/locales/{pt-BR,en}/
  - Feedback ao usuário: useSnackbar para toasts, setError('root') para erros globais
  - Autenticação: token via useAuth() hook, role em user.role.id === RoleEnum.admin

---

NOTAS SOBRE OS ENDPOINTS DE BADGES

  O endpoint GET /badges/profile/:profileId exige o profileId (UUID do perfil de
  gamificação), não o userId. Para obtê-lo:
    1. Se o usuário está logado: GET /gamification-profiles/me retorna o perfil
    2. Se no perfil público: GET /gamification-profiles/by-username/:username
       retorna o perfil com o id

  O endpoint POST /badges/grant espera:
    { profileId: string, badgeId: string, grantedBy: number }
  onde grantedBy é o userId (number) do admin logado, não o profileId.
