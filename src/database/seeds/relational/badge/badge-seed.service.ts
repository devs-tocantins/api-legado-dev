import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadgeEntity } from '../../../../badges/infrastructure/persistence/relational/entities/badge.entity';
import { BadgeCriteriaTypeEnum } from '../../../../badges/domain/badge-criteria-type.enum';
import { BadgeCategoryEnum } from '../../../../badges/domain/badge-category.enum';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AUTO = BadgeCriteriaTypeEnum.AUTOMATIC;
const MANUAL = BadgeCriteriaTypeEnum.MANUAL;
const MILESTONE = BadgeCategoryEnum.MILESTONE;
const RANKING = BadgeCategoryEnum.RANKING;
const PARTICIPATION = BadgeCategoryEnum.PARTICIPATION;
const SPECIAL = BadgeCategoryEnum.SPECIAL;

const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const POSITION_LABEL = ['🥇 1º Lugar', '🥈 2º Lugar', '🥉 3º Lugar'];

// ─── Badge definitions ────────────────────────────────────────────────────────

const MILESTONE_BADGES = [
  // Nível por XP (espelha os limiares de nível)
  {
    name: 'Contribuidor',
    description:
      'Alcançou 500 XP na plataforma. Primeiro passo de uma longa jornada.',
    criteriaType: AUTO,
    criteriaConfig: { type: 'total_xp', threshold: 500 },
  },
  {
    name: 'Colaborador Ativo',
    description:
      'Alcançou 2.000 XP. Sua contribuição já faz diferença para a comunidade.',
    criteriaType: AUTO,
    criteriaConfig: { type: 'total_xp', threshold: 2000 },
  },
  {
    name: 'Referência',
    description: 'Alcançou 6.000 XP. Já é uma referência entre os membros.',
    criteriaType: AUTO,
    criteriaConfig: { type: 'total_xp', threshold: 6000 },
  },
  {
    name: 'Mentor',
    description: 'Alcançou 15.000 XP. Um mentor reconhecido pela comunidade.',
    criteriaType: AUTO,
    criteriaConfig: { type: 'total_xp', threshold: 15000 },
  },
  {
    name: 'Lenda',
    description:
      'Alcançou 35.000 XP. Um dos maiores contribuidores da história da comunidade.',
    criteriaType: AUTO,
    criteriaConfig: { type: 'total_xp', threshold: 35000 },
  },
  // Por submissões aprovadas
  {
    name: 'Primeira Missão',
    description: 'Teve a primeira submissão aprovada. O começo de tudo.',
    criteriaType: AUTO,
    criteriaConfig: { type: 'submissions_approved', threshold: 1 },
  },
  {
    name: 'Colaborador',
    description:
      'Acumulou 5 submissões aprovadas. Já é um colaborador de verdade.',
    criteriaType: AUTO,
    criteriaConfig: { type: 'submissions_approved', threshold: 5 },
  },
  {
    name: 'Herói da Comunidade',
    description: 'Acumulou 20 submissões aprovadas. Um herói em ação.',
    criteriaType: AUTO,
    criteriaConfig: { type: 'submissions_approved', threshold: 20 },
  },
  // Por tokens enviados
  {
    name: 'Grato',
    description: 'Enviou 5 Pontos de Reconhecimento a outros membros.',
    criteriaType: AUTO,
    criteriaConfig: { type: 'tokens_sent', threshold: 5 },
  },
  {
    name: 'Generoso',
    description:
      'Enviou 20 Pontos de Reconhecimento. A generosidade constrói comunidades.',
    criteriaType: AUTO,
    criteriaConfig: { type: 'tokens_sent', threshold: 20 },
  },
];

const PARTICIPATION_BADGES = [
  {
    name: 'Membro Fundador',
    description:
      'Membro ativo há 1 mês. Obrigado por estar aqui desde o início.',
    criteriaType: AUTO,
    criteriaConfig: { type: 'membership_months', threshold: 1 },
  },
  {
    name: 'Veterano',
    description:
      'Membro ativo há 3 meses. Sua presença constante fortalece a comunidade.',
    criteriaType: AUTO,
    criteriaConfig: { type: 'membership_months', threshold: 3 },
  },
  {
    name: 'Ancião',
    description:
      'Membro ativo há 6 meses. Metade de um ano dedicado à comunidade.',
    criteriaType: AUTO,
    criteriaConfig: { type: 'membership_months', threshold: 6 },
  },
  {
    name: 'Pilar da Comunidade',
    description: 'Membro ativo há 1 ano. Um pilar inestimável do legado.dev.',
    criteriaType: AUTO,
    criteriaConfig: { type: 'membership_months', threshold: 12 },
  },
];

// Monthly ranking 2026 — meses restantes (Abril a Dezembro)
function buildMonthlyRankingBadges() {
  const badges: any[] = [];
  const REMAINING_MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12]; // Abril–Dezembro 2026
  for (const month of REMAINING_MONTHS) {
    for (let pos = 1; pos <= 3; pos++) {
      badges.push({
        name: `${POSITION_LABEL[pos - 1]} — Ranking ${MONTHS_PT[month - 1]} 2026`,
        description: `Conquistou o ${pos}º lugar no ranking de XP mensal de ${MONTHS_PT[month - 1]} de 2026.`,
        criteriaType: AUTO,
        criteriaConfig: {
          type: 'monthly_ranking',
          position: pos,
          month,
          year: 2026,
        },
      });
    }
  }
  return badges;
}

// Annual ranking 2026
function buildAnnualRankingBadges() {
  const badges: any[] = [];
  for (let pos = 1; pos <= 3; pos++) {
    badges.push({
      name: `${POSITION_LABEL[pos - 1]} — Ranking Anual 2026`,
      description: `Conquistou o ${pos}º lugar no ranking geral de XP do ano de 2026.`,
      criteriaType: AUTO,
      criteriaConfig: {
        type: 'annual_ranking',
        position: pos,
        year: 2026,
      },
    });
  }
  return badges;
}

const SPECIAL_BADGES = [
  {
    name: 'Destaque do Mês',
    description:
      'Concedido manualmente ao membro mais destacado do mês pelo admin.',
    criteriaType: MANUAL,
    criteriaConfig: null,
  },
  {
    name: 'Organizador',
    description:
      'Concedido a membros que organizaram eventos ou iniciativas da comunidade.',
    criteriaType: MANUAL,
    criteriaConfig: null,
  },
];

function buildAllBadges() {
  const all: any[] = [];

  for (const b of MILESTONE_BADGES) {
    all.push({ ...b, category: MILESTONE, imageUrl: null, isActive: true });
  }
  for (const b of PARTICIPATION_BADGES) {
    all.push({ ...b, category: PARTICIPATION, imageUrl: null, isActive: true });
  }
  for (const b of buildMonthlyRankingBadges()) {
    all.push({ ...b, category: RANKING, imageUrl: null, isActive: true });
  }
  for (const b of buildAnnualRankingBadges()) {
    all.push({ ...b, category: RANKING, imageUrl: null, isActive: true });
  }
  for (const b of SPECIAL_BADGES) {
    all.push({ ...b, category: SPECIAL, imageUrl: null, isActive: true });
  }

  return all;
}

// ─── Seed service ─────────────────────────────────────────────────────────────

@Injectable()
export class BadgeSeedService {
  constructor(
    @InjectRepository(BadgeEntity)
    private readonly repository: Repository<BadgeEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();
    if (count > 0) return;

    const badges = buildAllBadges();
    for (const b of badges) {
      await this.repository.save(this.repository.create(b as any));
    }
  }
}
