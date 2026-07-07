# Engajamento e Gamificação - Devs Tocantins

Atualizado em: 2026-04-18

---

## 1. O Mantra do Sistema

Nossa filosofia é clara e inegociável: tudo que for feito em prol da comunidade e que gere um impacto real — por menor ou mais simples que seja — vale pontos e será reconhecido. Desde palestrar em um evento estadual até ajudar a corrigir um erro de digitação no código de um júnior no grupo do WhatsApp, toda contribuição importa. O objetivo deste sistema é capturar, registrar e eternizar esse esforço.

---

## 2. O Contexto e o Problema

A comunidade Devs Tocantins gera um volume de valor diário: membros tiram dúvidas técnicas complexas, compartilham vagas de emprego, organizam eventos e desenvolvem projetos open-source.

O problema é a invisibilidade dessas contribuições. Como a maior parte das interações ocorre em grupos de mensagens efêmeros, o histórico de quem faz a comunidade acontecer se perde com o tempo. Não há uma forma centralizada de medir, reconhecer ou valorizar os membros mais ativos.

---

## 3. A Solução

A proposta é a construção de um **Motor de Gamificação e Reconhecimento**. O objetivo é a criação de um ecossistema que gere prova social, histórico público e senso de pertencimento através de rankings, histórico de contribuições e badges (medalhas).

---

## 4. Visão Arquitetural e Estratégia

- **API-First:** O desenvolvimento é focado no Backend NestJS com TypeORM. O frontend Next.js consome a API via React Query.
- **Autenticação Própria:** E-mail/Senha com JWT + OAuth Google. Sem Identity Provider externo no MVP.
- **Desacoplamento de Dados:** A tabela `User` contém apenas autenticação. Todos os dados de pontuação ficam em `GamificationProfile`. Isso pavimenta o caminho para outros serviços da comunidade usarem a mesma conta base.

---

## 5. Stack Tecnológica

- **Backend:** Node.js com NestJS (modular, DI, TypeScript), TypeORM, PostgreSQL (Neon em produção)
- **Frontend:** Next.js 15 (App Router), TailwindCSS v4 (config CSS), shadcn/ui, TanStack Query v5
- **Storage:** AWS S3 / Cloudflare R2 (compatível com S3) para uploads de comprovantes
- **E-mail:** Brevo SMTP (transacional)
- **Deploy:** Backend na Oracle VM (VPS gratuita), Frontend na Vercel

---

## 6. Core Features e Regras de Negócio

### Catálogo de Atividades
Atividades pré-mapeadas com pontuações fixas. O usuário seleciona a atividade realizada e submete. As descrições são em markdown e podem conter templates de preenchimento.

### Atividades Ocultas (Eventos e Check-ins)
Atividades não visíveis no catálogo público. O usuário pontua apenas via link direto ou QR Code com o `secretCode`. Ideal para registrar presença em meetups e eventos fechados.

### Workflow de Moderação e Recompensa do Auditor
Nada entra no ranking sem validação humana. O usuário submete prova, o moderador aprova/rejeita. O moderador ganha +10 XP por revisão, independente do resultado.

### Economia Peer-to-Peer (Tokens de Gratidão)
Mensalmente cada membro recebe uma cota de tokens. Esses tokens devem ser transferidos para outros membros como agradecimento por ajudas no dia a dia. Receber tokens concede +1 XP por token. Tokens não transferidos expiram no dia 1 do mês seguinte.

### Rankings Estratégicos
- **Mensal** (`currentMonthlyXp`) — ranking competitivo; reseta todo mês
- **Anual** (`currentYearlyXp`) — visão de médio prazo; reseta anualmente
- **Global** (`totalXp`) — Hall da Fama permanente, sem decaimento

### Missões
Desafios únicos criados pelo admin com recompensa de alto valor. Membros participam submetendo evidências. O moderador/admin escolhe o melhor e define o vencedor único. As demais submissões são rejeitadas automaticamente ao fechar a missão.

---

## 7. Mecânica de Níveis

Os níveis são calculados a partir do `totalXp` histórico, nunca decrecem (exceto por penalidade do admin) e servem como "medidor de confiança" da comunidade.

| Nível | XP mínimo | Estimativa de tempo |
|-------|-----------|---------------------|
| Novato | 0 | Imediato |
| Contribuidor | 500 | ~1–2 semanas ativas |
| Colaborador Ativo | 2.000 | ~1–3 meses |
| Referência | 6.000 | ~6–12 meses |
| Mentor | 15.000 | ~1–2 anos |
| Lenda | 35.000 | ~3+ anos |

---

## 8. Sistema de Badges / Medalhas

Badges são artes estáticas que enfeitam o perfil público do usuário ao atingir metas específicas.

### Categorias
- `MILESTONE` — marcos de XP ou contribuições acumuladas
- `RANKING` — posições de destaque em rankings mensais/anuais
- `PARTICIPATION` — participação em eventos ou missões específicas
- `SPECIAL` — badges manuais para reconhecimentos únicos

### Critérios automáticos (`criteriaConfig`)
```json
{ "type": "submissions_approved", "threshold": 10 }
{ "type": "total_xp", "threshold": 500 }
{ "type": "monthly_ranking_top", "threshold": 3 }
```

Badges automáticos são verificados ao aprovar submissões e por cron periódico. Se o critério for atendido e ainda não concedido, o sistema atribui automaticamente sem intervenção humana.

---

## 9. Segurança e Anti-Fraude

- **Cooldowns:** Campo `cooldownHours` na Activity impede farming da mesma atividade
- **Moderação obrigatória:** Toda submissão de atividade passa por revisão humana antes de gerar XP
- **Logs imutáveis (Transaction):** Toda mutação de XP gera um registro imutável com motivo, tipo e referência
- **Penalidades:** Admins podem deduzir XP diretamente via modal de penalidade, registrado como `Transaction(PENALTY)`
- **Sanitização de entrada:** Campos markdown aceitam apenas ASCII imprimível + Latin Extended (sem emojis/Unicode especial); limite de 2000 caracteres por campo de texto do usuário
- **Monitor de saúde:** Endpoint `GET /admin/health` verifica em tempo real o status do banco de dados, SMTP e storage

---

## 10. Fontes de XP (Resumo)

| Fonte | XP | Afeta rankingmensal? |
|-------|----|---------------------|
| Atividade aprovada | `fixedReward` da atividade | Sim |
| Token de gratidão recebido | +1 XP por token | Sim |
| Revisão de submissão (moderador) | +10 XP | Sim |
| Missão vencida | `xpReward` da missão | Sim |
| Penalidade (admin) | Negativo configurável | Sim (reduz) |
