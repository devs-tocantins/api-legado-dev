import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { GamificationProfileEntity } from '../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { SubmissionEntity } from '../submissions/infrastructure/persistence/relational/entities/submission.entity';
import { TransactionEntity } from '../transactions/infrastructure/persistence/relational/entities/transaction.entity';
import { SubmissionStatus } from '../submissions/domain/submission-status.enum';
import { TransactionCategoryEnum } from '../transactions/domain/transaction-category.enum';
import { AdminMetricsDto } from './admin-metrics.dto';

@Injectable()
export class AdminService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getMetrics(): Promise<AdminMetricsDto> {
    const userRepo = this.dataSource.getRepository(UserEntity);
    const profileRepo = this.dataSource.getRepository(
      GamificationProfileEntity,
    );
    const submissionRepo = this.dataSource.getRepository(SubmissionEntity);
    const transactionRepo = this.dataSource.getRepository(TransactionEntity);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      bannedUsers,
      submissionsPending,
      submissionsApprovedThisMonth,
      submissionsRejectedThisMonth,
      xpResult,
      tokensResult,
    ] = await Promise.all([
      userRepo.count(),
      userRepo.count({ where: { isBanned: true } }),
      submissionRepo.count({ where: { status: SubmissionStatus.PENDING } }),
      submissionRepo
        .createQueryBuilder('s')
        .where('s.status = :status', { status: SubmissionStatus.APPROVED })
        .andWhere('s.reviewedAt >= :start', { start: startOfMonth })
        .getCount(),
      submissionRepo
        .createQueryBuilder('s')
        .where('s.status = :status', { status: SubmissionStatus.REJECTED })
        .andWhere('s.reviewedAt >= :start', { start: startOfMonth })
        .getCount(),
      transactionRepo
        .createQueryBuilder('t')
        .select('COALESCE(SUM(t.amount), 0)', 'total')
        .where('t.category = :category', {
          category: TransactionCategoryEnum.XP_REWARD,
        })
        .getRawOne<{ total: string }>(),
      profileRepo
        .createQueryBuilder('gp')
        .select('COALESCE(SUM(gp.gratitudeTokens), 0)', 'total')
        .getRawOne<{ total: string }>(),
    ]);

    return {
      totalUsers,
      activeUsers: totalUsers - bannedUsers,
      bannedUsers,
      submissionsPending,
      submissionsApprovedThisMonth,
      submissionsRejectedThisMonth,
      totalXpDistributed: Number(xpResult?.total ?? 0),
      tokensInCirculation: Number(tokensResult?.total ?? 0),
    };
  }
}
