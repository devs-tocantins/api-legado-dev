import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadgeEntity } from '../../../../badges/infrastructure/persistence/relational/entities/badge.entity';
import { BadgeCriteriaTypeEnum } from '../../../../badges/domain/badge-criteria-type.enum';

const SEED_BADGES = [
  // Badges automáticos — submissões aprovadas
  {
    name: 'Primeira Missão',
    description: 'Tenha sua primeira submissão aprovada.',
    imageUrl: null,
    criteriaType: BadgeCriteriaTypeEnum.AUTOMATIC,
    criteriaConfig: { type: 'submissions_approved', threshold: 1 },
    isActive: true,
  },
  {
    name: 'Colaborador',
    description: 'Acumule 5 submissões aprovadas.',
    imageUrl: null,
    criteriaType: BadgeCriteriaTypeEnum.AUTOMATIC,
    criteriaConfig: { type: 'submissions_approved', threshold: 5 },
    isActive: true,
  },
  {
    name: 'Herói da Comunidade',
    description: 'Acumule 20 submissões aprovadas.',
    imageUrl: null,
    criteriaType: BadgeCriteriaTypeEnum.AUTOMATIC,
    criteriaConfig: { type: 'submissions_approved', threshold: 20 },
    isActive: true,
  },
  // Badges automáticos — tokens enviados
  {
    name: 'Grato',
    description: 'Envie 5 Tokens de Gratidão para outros membros.',
    imageUrl: null,
    criteriaType: BadgeCriteriaTypeEnum.AUTOMATIC,
    criteriaConfig: { type: 'tokens_sent', threshold: 5 },
    isActive: true,
  },
  {
    name: 'Generoso',
    description: 'Envie 20 Tokens de Gratidão para outros membros.',
    imageUrl: null,
    criteriaType: BadgeCriteriaTypeEnum.AUTOMATIC,
    criteriaConfig: { type: 'tokens_sent', threshold: 20 },
    isActive: true,
  },
  // Badges automáticos — XP total
  {
    name: 'Iniciante',
    description: 'Acumule 100 XP.',
    imageUrl: null,
    criteriaType: BadgeCriteriaTypeEnum.AUTOMATIC,
    criteriaConfig: { type: 'total_xp', threshold: 100 },
    isActive: true,
  },
  {
    name: 'Experiente',
    description: 'Acumule 500 XP.',
    imageUrl: null,
    criteriaType: BadgeCriteriaTypeEnum.AUTOMATIC,
    criteriaConfig: { type: 'total_xp', threshold: 500 },
    isActive: true,
  },
  {
    name: 'Lenda',
    description: 'Acumule 2000 XP.',
    imageUrl: null,
    criteriaType: BadgeCriteriaTypeEnum.AUTOMATIC,
    criteriaConfig: { type: 'total_xp', threshold: 2000 },
    isActive: true,
  },
  // Badges manuais — concedidos pelo admin
  {
    name: 'Destaque do Mês',
    description: 'Concedido manualmente ao membro mais destacado do mês.',
    imageUrl: null,
    criteriaType: BadgeCriteriaTypeEnum.MANUAL,
    criteriaConfig: null,
    isActive: true,
  },
  {
    name: 'Organizador',
    description: 'Concedido a membros que organizaram eventos da comunidade.',
    imageUrl: null,
    criteriaType: BadgeCriteriaTypeEnum.MANUAL,
    criteriaConfig: null,
    isActive: true,
  },
];

@Injectable()
export class BadgeSeedService {
  constructor(
    @InjectRepository(BadgeEntity)
    private readonly repository: Repository<BadgeEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();
    if (count > 0) return;

    await this.repository.save(
      SEED_BADGES.map((badge) => this.repository.create(badge)),
    );
  }
}
