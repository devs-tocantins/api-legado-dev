import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadgeRepository } from './infrastructure/persistence/badge.repository';
import { GamificationProfileBadgeRepository } from './infrastructure/persistence/gamification-profile-badge.repository';
import { BadgeCriteriaTypeEnum } from './domain/badge-criteria-type.enum';
import { SubmissionEntity } from '../submissions/infrastructure/persistence/relational/entities/submission.entity';
import { SubmissionStatus } from '../submissions/domain/submission-status.enum';
import { TransactionEntity } from '../transactions/infrastructure/persistence/relational/entities/transaction.entity';
import { TransactionCategoryEnum } from '../transactions/domain/transaction-category.enum';
import { GamificationProfileEntity } from '../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';

type CriteriaConfig = {
  type: string;
  threshold: number;
};

@Injectable()
export class BadgeEvaluatorService {
  private readonly logger = new Logger(BadgeEvaluatorService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly badgeRepository: BadgeRepository,
    private readonly profileBadgeRepository: GamificationProfileBadgeRepository,
  ) {}

  /**
   * Avalia todos os badges automáticos para um perfil e concede
   * os que ainda não foram conquistados e cujo critério foi atingido.
   */
  async evaluate(profileId: string): Promise<void> {
    const badges = await this.badgeRepository.findAllActive();
    const automaticBadges = badges.filter(
      (b) =>
        b.criteriaType === BadgeCriteriaTypeEnum.AUTOMATIC && b.criteriaConfig,
    );

    for (const badge of automaticBadges) {
      try {
        const already = await this.profileBadgeRepository.findByProfileAndBadge(
          profileId,
          badge.id,
        );
        if (already) continue;

        const config = badge.criteriaConfig as CriteriaConfig;
        const achieved = await this.checkCriteria(profileId, config);

        if (achieved) {
          await this.profileBadgeRepository.create({
            profileId,
            badgeId: badge.id,
            grantedBy: null,
          });
          this.logger.log(
            `Badge "${badge.name}" concedido ao perfil ${profileId}`,
          );
        }
      } catch (err) {
        this.logger.error(
          `Erro ao avaliar badge "${badge.name}" para perfil ${profileId}`,
          err,
        );
      }
    }
  }

  private async checkCriteria(
    profileId: string,
    config: CriteriaConfig,
  ): Promise<boolean> {
    switch (config.type) {
      case 'submissions_approved':
        return this.checkSubmissionsApproved(profileId, config.threshold);

      case 'tokens_sent':
        return this.checkTokensSent(profileId, config.threshold);

      case 'total_xp':
        return this.checkTotalXp(profileId, config.threshold);

      case 'membership_months':
        return this.checkMembershipMonths(profileId, config.threshold);

      default:
        this.logger.warn(`Critério desconhecido: ${config.type}`);
        return false;
    }
  }

  private async checkSubmissionsApproved(
    profileId: string,
    threshold: number,
  ): Promise<boolean> {
    const count = await this.dataSource
      .getRepository(SubmissionEntity)
      .count({ where: { profileId, status: SubmissionStatus.APPROVED } });
    return count >= threshold;
  }

  private async checkTokensSent(
    profileId: string,
    threshold: number,
  ): Promise<boolean> {
    const result = await this.dataSource
      .getRepository(TransactionEntity)
      .createQueryBuilder('t')
      .select('COALESCE(SUM(ABS(t.amount)), 0)', 'total')
      .where('t.profileId = :profileId', { profileId })
      .andWhere('t.category = :category', {
        category: TransactionCategoryEnum.TOKEN_TRANSFER,
      })
      .andWhere('t.amount < 0')
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0) >= threshold;
  }

  private async checkTotalXp(
    profileId: string,
    threshold: number,
  ): Promise<boolean> {
    const profile = await this.dataSource
      .getRepository(GamificationProfileEntity)
      .findOne({ where: { id: profileId } });
    return (profile?.totalXp ?? 0) >= threshold;
  }

  private async checkMembershipMonths(
    profileId: string,
    threshold: number,
  ): Promise<boolean> {
    const profile = await this.dataSource
      .getRepository(GamificationProfileEntity)
      .findOne({ where: { id: profileId } });
    if (!profile) return false;
    const createdAt = new Date(profile.createdAt);
    const now = new Date();
    const months =
      (now.getFullYear() - createdAt.getFullYear()) * 12 +
      (now.getMonth() - createdAt.getMonth());
    return months >= threshold;
  }
}
