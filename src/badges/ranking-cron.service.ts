import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadgeRepository } from './infrastructure/persistence/badge.repository';
import { GamificationProfileBadgeRepository } from './infrastructure/persistence/gamification-profile-badge.repository';
import { BadgeCategoryEnum } from './domain/badge-category.enum';
import { GamificationProfileEntity } from '../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';

type RankingConfig = {
  type: 'monthly_ranking' | 'annual_ranking';
  position: number;
  month?: number;
  year?: number;
};

@Injectable()
export class RankingCronService {
  private readonly logger = new Logger(RankingCronService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly badgeRepository: BadgeRepository,
    private readonly profileBadgeRepository: GamificationProfileBadgeRepository,
  ) {}

  // Roda às 23:55 do último dia de cada mês
  @Cron('55 23 28-31 * *')
  async handleMonthlyRanking() {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    if (now.getDate() !== lastDay.getDate()) return;

    this.logger.log('Iniciando concessão de badges de ranking mensal...');

    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const badges = await this.badgeRepository.findAllActive();
    const rankingBadges = badges.filter((b) => {
      const cfg = b.criteriaConfig as RankingConfig;
      return (
        b.category === BadgeCategoryEnum.RANKING &&
        cfg?.type === 'monthly_ranking' &&
        cfg?.month === currentMonth &&
        cfg?.year === currentYear
      );
    });

    if (!rankingBadges.length) {
      this.logger.warn(
        `Nenhum badge de ranking mensal configurado para ${currentMonth}/${currentYear}.`,
      );
      return;
    }

    // Top perfis por XP mensal
    const topProfiles = await this.dataSource
      .getRepository(GamificationProfileEntity)
      .find({
        order: { currentMonthlyXp: 'DESC' },
        take: 3,
      });

    for (const badge of rankingBadges) {
      const config = badge.criteriaConfig as RankingConfig;
      const profile = topProfiles[config.position - 1];
      if (!profile) continue;

      const already = await this.profileBadgeRepository.findByProfileAndBadge(
        profile.id,
        badge.id,
      );
      if (already) continue;

      await this.profileBadgeRepository.create({
        profileId: profile.id,
        badgeId: badge.id,
        grantedBy: null,
      });

      this.logger.log(
        `Badge "${badge.name}" (posição ${config.position}) concedido ao perfil ${profile.id}`,
      );
    }
  }

  // Roda às 23:55 do dia 31 de dezembro
  @Cron('55 23 31 12 *')
  async handleAnnualRanking() {
    this.logger.log('Iniciando concessão de badges de ranking anual...');

    const currentYear = new Date().getFullYear();

    const badges = await this.badgeRepository.findAllActive();
    const rankingBadges = badges.filter((b) => {
      const cfg = b.criteriaConfig as RankingConfig;
      return (
        b.category === BadgeCategoryEnum.RANKING &&
        cfg?.type === 'annual_ranking' &&
        cfg?.year === currentYear
      );
    });

    if (!rankingBadges.length) {
      this.logger.warn(
        `Nenhum badge de ranking anual configurado para ${currentYear}.`,
      );
      return;
    }

    const topProfiles = await this.dataSource
      .getRepository(GamificationProfileEntity)
      .find({
        order: { currentYearlyXp: 'DESC' },
        take: 3,
      });

    for (const badge of rankingBadges) {
      const config = badge.criteriaConfig as RankingConfig;
      const profile = topProfiles[config.position - 1];
      if (!profile) continue;

      const already = await this.profileBadgeRepository.findByProfileAndBadge(
        profile.id,
        badge.id,
      );
      if (already) continue;

      await this.profileBadgeRepository.create({
        profileId: profile.id,
        badgeId: badge.id,
        grantedBy: null,
      });

      this.logger.log(
        `Badge "${badge.name}" anual (posição ${config.position}) concedido ao perfil ${profile.id}`,
      );
    }
  }
}
