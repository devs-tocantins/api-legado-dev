import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { GamificationProfileEntity } from '../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { SubmissionEntity } from '../submissions/infrastructure/persistence/relational/entities/submission.entity';
import { TransactionEntity } from '../transactions/infrastructure/persistence/relational/entities/transaction.entity';
import { SubmissionStatus } from '../submissions/domain/submission-status.enum';
import { TransactionCategoryEnum } from '../transactions/domain/transaction-category.enum';
import { AdminMetricsDto } from './admin-metrics.dto';
import { AdminHealthDto } from './admin-health.dto';
import { MailerService } from '../mailer/mailer.service';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class AdminService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

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

  async getHealth(): Promise<AdminHealthDto> {
    const [database, smtp, storage] = await Promise.all([
      this.checkDatabase(),
      this.checkSmtp(),
      this.checkStorage(),
    ]);

    return {
      database,
      smtp,
      storage,
      allOk: database.ok && smtp.ok && storage.ok,
    };
  }

  private async checkDatabase() {
    try {
      await this.dataSource.query('SELECT 1');
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: String(err?.message ?? err) };
    }
  }

  private async checkSmtp() {
    const ok = await this.mailerService.verifyConnection();
    return ok ? { ok: true } : { ok: false, error: 'SMTP connection failed' };
  }

  private async checkStorage() {
    const endpoint = this.configService.get('file.awsS3Endpoint', {
      infer: true,
    });
    const region = this.configService.get('file.awsS3Region', { infer: true });
    const bucket = this.configService.get('file.awsDefaultS3Bucket', {
      infer: true,
    });
    const accessKeyId = this.configService.get('file.accessKeyId', {
      infer: true,
    });
    const secretAccessKey = this.configService.get('file.secretAccessKey', {
      infer: true,
    });

    if (!bucket || !accessKeyId || !secretAccessKey) {
      return { ok: false, error: 'Storage credentials not configured' };
    }

    try {
      const s3 = new S3Client({
        region: region ?? 'auto',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });
      await s3.send(new HeadBucketCommand({ Bucket: bucket }));
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: String(err?.message ?? err) };
    }
  }
}
